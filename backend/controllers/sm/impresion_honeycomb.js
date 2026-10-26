'use strict'

/* Impresión de pedidos y presupuestos HoneyComb (tipo 7) en PDF con Puppeteer.
   Solo las líneas HoneyComb: el resto de productos se sigue imprimiendo con Crystal
   (haru_server/preview.aspx). Si un documento tiene las dos cosas, el frontend pide los dos.

   GET /api/sm/honeycomb/impresion/info/:doc/:id  -> { tieneHoneycomb, tieneOtros }
   GET /api/sm/honeycomb/impresion/pdf/:doc/:id   -> application/pdf
   doc = 'pedido' | 'presupuesto', id = IDROW del pedido o presupuesto. */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const pdf = require('../../services/pdf');

const PLANTILLA = path.join(__dirname, '../../templates/honeycomb/documento.hbs');

// Líneas por hoja: cada hoja lleva exactamente estas filas, la última se rellena con filas vacías
const FILAS_POR_HOJA = 10;

const DOCUMENTOS = {
  pedido: {
    cabecera: 'dbo.SOL_PEDIDOS_COLA',
    lineas: 'dbo.SOL_PEDIDOS_COLA_LINEAS',
    lineasHoneycomb: 'dbo.vw_report_bestellung_lines_7',
    ordenLineas: 'linea, id',
    textoFecha: 'Fecha pedido',
    conPrecios: false
  },
  presupuesto: {
    cabecera: 'dbo.SOL_PRESUPUESTOS_COLA',
    lineas: 'dbo.SOL_PRESUPUESTOS_COLA_LINEAS',
    lineasHoneycomb: 'dbo.vw_reports_budget_lines_7',
    ordenLineas: 'id',
    textoFecha: 'Fecha presupuesto',
    conPrecios: true
  }
};

const fmtImporte = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function dosDigitos(n) {
  return String(n).padStart(2, '0');
}

// Las fechas datetime llegan de mssql como UTC: se leen en UTC para que no cambie el día
function formatFecha(fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha)) return '';
  return dosDigitos(fecha.getUTCDate()) + '-' + dosDigitos(fecha.getUTCMonth() + 1) + '-' + fecha.getUTCFullYear();
}

// T7_Fecha_Entrega es varchar: se aceptan dd-mm-aaaa, dd/mm/aaaa y aaaa-mm-dd
function leerFechaTexto(texto) {
  const t = String(texto || '').trim();
  let m = t.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return null;
}

// Fecha prevista: la entrega más tardía de las líneas; en blanco si ninguna tiene fecha
function fechaPrevista(lineas) {
  let maxima = null;
  lineas.forEach(function (l) {
    const f = leerFechaTexto(l.T7_Fecha_Entrega);
    if (f && (!maxima || f > maxima)) maxima = f;
  });
  return maxima ? formatFecha(maxima) : '';
}

// Medidas sin ceros de sobra: 264.50 -> 264.5, 100.00 -> 100
function formatMedida(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  return String(Number(valor));
}

function texto(valor) {
  return valor === null || valor === undefined ? '' : String(valor).trim();
}

function validarParametros(req, res) {
  const doc = DOCUMENTOS[req.params.doc];
  const id = parseInt(req.params.id, 10);
  if (!doc || isNaN(id) || String(id) !== String(req.params.id)) {
    res.status(400).json({ error: 'Parámetros: doc = pedido | presupuesto, id = número' });
    return null;
  }
  return { doc: doc, id: id };
}

async function leerResumenLineas(pool, doc, id) {
  const r = await pool.request()
    .input('id', sql.Int, id)
    .query(
      'select (select count(*) from ' + doc.cabecera + ' where IDROW = @id) as existe, ' +
      '  sum(case when TIPO = 7 then 1 else 0 end) as honeycomb, ' +
      '  sum(case when TIPO <> 7 then 1 else 0 end) as otros ' +
      'from ' + doc.lineas + ' where IDROW = @id'
    );
  const fila = r.recordset[0];
  return {
    existe: fila.existe > 0,
    honeycomb: fila.honeycomb || 0,
    otros: fila.otros || 0
  };
}

async function impresion_honeycomb_info(req, res) {
  const p = validarParametros(req, res);
  if (!p) return;
  try {
    const pool = await sql.connect();
    const resumen = await leerResumenLineas(pool, p.doc, p.id);
    if (!resumen.existe) {
      return res.status(404).json({ error: 'No existe el ' + req.params.doc + ' ' + p.id });
    }
    res.json({
      tieneHoneycomb: resumen.honeycomb > 0,
      tieneOtros: resumen.otros > 0
    });
  } catch (err) {
    console.error('impresion_honeycomb_info:', err);
    res.status(500).json({ error: 'Error consultando el ' + req.params.doc });
  }
}

async function leerDatos(pool, doc, id) {
  const cab = await pool.request()
    .input('id', sql.Int, id)
    .query('select IDROW, FECHA, REFCLIENTE from ' + doc.cabecera + ' where IDROW = @id');
  if (!cab.recordset.length) return null;

  const lin = await pool.request()
    .input('id', sql.Int, id)
    .query(
      'select ancho, alto, cantidad, tej_tipo_text, tej_color_text, color_perfil_text, ' +
      '  hc_accionamiento_text, T7_PVP, T7_Fecha_Entrega ' +
      'from ' + doc.lineasHoneycomb + ' where IDROW = @id order by ' + doc.ordenLineas
    );

  return { cabecera: cab.recordset[0], lineas: lin.recordset };
}

function montarModelo(doc, datos, nombreFichero) {
  const c = datos.cabecera;
  let total = 0;

  const filas = datos.lineas.map(function (l) {
    const importe = Number(l.T7_PVP) || 0;
    total += importe;
    return {
      producto: 'HoneyComb' + (texto(l.tej_tipo_text) ? ' - ' + texto(l.tej_tipo_text) : ''),
      colorTejido: texto(l.tej_color_text),
      colorMecanismo: texto(l.color_perfil_text),
      accionamiento: texto(l.hc_accionamiento_text),
      ancho: formatMedida(l.ancho),
      alto: formatMedida(l.alto),
      cantidad: l.cantidad,
      precio: fmtImporte.format(importe) + ' €'
    };
  });

  const hojas = [];
  for (let i = 0; i < Math.max(filas.length, 1); i += FILAS_POR_HOJA) {
    const hoja = filas.slice(i, i + FILAS_POR_HOJA);
    const vacias = [];
    for (let j = hoja.length; j < FILAS_POR_HOJA; j++) vacias.push({});
    hojas.push({ filas: hoja, vacias: vacias, ultima: i + FILAS_POR_HOJA >= filas.length });
  }

  const hoy = new Date();
  return {
    nombreFichero: nombreFichero,
    fechaImpresion: dosDigitos(hoy.getDate()) + '/' + dosDigitos(hoy.getMonth() + 1) + '/' + String(hoy.getFullYear()).slice(-2),
    referencia: texto(c.REFCLIENTE) || String(c.IDROW),
    textoFecha: doc.textoFecha,
    fecha: formatFecha(c.FECHA),
    fechaPrevista: fechaPrevista(datos.lineas),
    conPrecios: doc.conPrecios,
    hojas: hojas,
    total: fmtImporte.format(total) + ' €'
  };
}

// La plantilla se lee en cada impresión: es pequeña y así un cambio no obliga a reiniciar
function generarHtml(modelo) {
  const plantilla = Handlebars.compile(fs.readFileSync(PLANTILLA, 'utf8'));
  return plantilla(modelo);
}

async function impresion_honeycomb_pdf(req, res) {
  const p = validarParametros(req, res);
  if (!p) return;
  try {
    const pool = await sql.connect();
    const datos = await leerDatos(pool, p.doc, p.id);
    if (!datos) {
      return res.status(404).json({ error: 'No existe el ' + req.params.doc + ' ' + p.id });
    }
    if (!datos.lineas.length) {
      return res.status(404).json({ error: 'El ' + req.params.doc + ' ' + p.id + ' no tiene líneas HoneyComb' });
    }

    // El título del documento es el nombre con el que el visor del navegador propone guardarlo
    const nombreFichero = 'HoneyComb_' + req.params.doc + '_' + p.id;
    const buffer = await pdf.generarPdf(generarHtml(montarModelo(p.doc, datos, nombreFichero)), { landscape: true, titulo: nombreFichero });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'inline; filename="' + nombreFichero + '.pdf"',
      'Cache-Control': 'no-store'
    });
    res.end(buffer);
  } catch (err) {
    console.error('impresion_honeycomb_pdf:', err);
    res.status(500).json({ error: 'Error generando el PDF del ' + req.params.doc });
  }
}

module.exports = {
  impresion_honeycomb_info,
  impresion_honeycomb_pdf
};
