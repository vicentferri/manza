'use strict'

/* Impresión en PDF (Puppeteer) de pedidos y presupuestos: enrollable y HoneyComb en un único documento.
   - Hojas del enrollable (cadena y después motor; solo clientes de impresion_enrollable.js) y después las de la HoneyComb.
   - Al final, el resumen de precios: enrollable, HoneyComb y su suma.
   El visor lo muestra en la pestaña "Nuevo"; en "Antiguo" sale el informe de Crystal de siempre (haru_server/preview.aspx).
   Sustituye a impresion_honeycomb.js cuando el visor tiene activada la impresión del enrollable (IMPRESION_ENROLLABLE).

   GET /api/sm/impresion/info/:doc/:id  -> { enrollable, honeycomb }
   GET /api/sm/impresion/pdf/:doc/:id   -> application/pdf
   GET /api/sm/impresion/pdf/:doc/:id?modo=produccion -> el mismo PDF para producción (pestaña "Producción"):
       sin las columnas 48, Código, C1 y PVP, sin filas de total y sin resumen
   doc ='pedido' | 'presupuesto', id = IDROW del pedido o presupuesto. */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const pdf = require('../../services/pdf');
const c = require('./impresion_comun');
const enrollable = require('./impresion_enrollable');
const honeycomb = require('./impresion_honeycomb');

const PLANTILLA = path.join(__dirname, '../../templates/documento/documento.hbs');

/* Cabecera y pie de cada hoja. La cabecera lleva además la referencia del documento (GUID), el cliente y el centro.
   Chrome los pinta fuera del documento: no heredan sus estilos (todo en línea, con el tamaño de letra explícito)
   y solo rellenan las clases pageNumber y totalPages. */
const CABECERA = Handlebars.compile(
  '<div style="width:calc(100% - 20mm); margin:0 10mm; font-family:Arial, Helvetica, sans-serif; color:#000;">' +
  '<div style="font-size:8pt; margin-bottom:3mm;">Fecha: {{fechaImpresion}}</div>' +
  // El título va en una sola línea: si la referencia del cliente es muy larga se corta, para no pisar la tabla
  '<div style="font-size:10.5pt; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{textoDocumento}}: {{referencia}} - {{textoFecha}}: {{fecha}}' +
  ' - Fecha prevista: {{fechaPrevista}}</div>' +
  '{{#if guid}}<div style="font-size:9pt; margin-top:1mm;">Referencia: {{guid}}</div>{{/if}}' +
  '{{#if clienteCentro}}<div style="font-size:9pt; margin-top:1mm;">{{clienteCentro}}</div>{{/if}}</div>'
);
const PIE = '<div style="width:100%; margin:0 10mm; font-family:Arial, Helvetica, sans-serif; font-size:8pt; text-align:right;">' +
  'Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>';

async function leerResumen(pool, doc, id) {
  const r = await pool.request()
    .input('id', sql.Int, id)
    .query(
      'select (select max(CLIENTE) from ' + doc.cabecera + ' where IDROW = @id) as cliente, ' +
      '  (select count(*) from ' + doc.cabecera + ' where IDROW = @id) as existe, ' +
      '  sum(case when TIPO = 1 then 1 else 0 end) as enrollable, ' +
      '  sum(case when TIPO = 7 then 1 else 0 end) as honeycomb ' +
      'from ' + doc.lineas + ' where IDROW = @id'
    );
  const f = r.recordset[0];
  return {
    existe: f.existe > 0,
    enrollable: enrollable.aplica(f.cliente) && f.enrollable > 0,
    honeycomb: f.honeycomb > 0
  };
}

async function impresion_documento_info(req, res) {
  const p = c.validarParametros(req, res);
  if (!p) return;
  try {
    const pool = await sql.connect();
    const resumen = await leerResumen(pool, p.doc, p.id);
    if (!resumen.existe) {
      return res.status(404).json({ error: 'No existe el ' + req.params.doc + ' ' + p.id });
    }
    res.json({ enrollable: resumen.enrollable, honeycomb: resumen.honeycomb });
  } catch (err) {
    console.error('impresion_documento_info:', err);
    res.status(500).json({ error: 'Error consultando el ' + req.params.doc });
  }
}

/* Bloque de la HoneyComb con las filas y el total que monta impresion_honeycomb.js */
async function leerHoneycomb(pool, nombreDoc, id) {
  const datos = await honeycomb.leerDatos(pool, honeycomb.DOCUMENTOS[nombreDoc], id);
  if (!datos || !datos.lineas.length) return null;

  const modelo = honeycomb.montarModelo(honeycomb.DOCUMENTOS[nombreDoc], datos, '');
  const columnas = ['Producto', 'Color tejido', 'Código', 'Color mecanismo', 'Accionamiento', 'Ancho cm', 'Alto cm',
    'Cantidad', 'C1', 'PVP'].map(function (titulo) { return { titulo: titulo }; });
  // montarModelo reparte las filas en hojas de 10 (las de su PDF propio); aquí van todas seguidas
  const filas = [];
  modelo.hojas.forEach(function (hoja) {
    hoja.filas.forEach(function (f) {
      filas.push([
        { valor: f.producto, clase: 'producto' },
        { valor: f.colorTejido },
        { valor: honeycomb.CODIGO_TEJIDO },
        { valor: f.colorMecanismo },
        { valor: f.accionamiento },
        { valor: f.ancho },
        { valor: f.alto },
        { valor: f.cantidad },
        { valor: f.c1, clase: 'c1' },
        { valor: f.precio, clase: 'importe' }
      ]);
    });
  });

  let precio = 0;
  let c1 = 0;
  datos.lineas.forEach(function (l) {
    precio += c.centimos(l.T7_PVP);
    const c1Linea = c.centimosC1(l.T7_PVP_C1);
    c1 = c1 === null || c1Linea === null ? null : c1 + c1Linea;
  });

  return {
    secciones: [c.seccion('HoneyComb', columnas, filas, {
      etiqueta: 'Total HoneyComb',
      c1: c1 === null ? '' : c.formatC1(c1),
      precio: c.formatImporte(precio)
    })],
    precio: precio,
    c1: c1
  };
}

function sumar(partes, campo) {
  let total = 0;
  for (let i = 0; i < partes.length; i++) {
    if (partes[i][campo] === null) return null;
    total += partes[i][campo];
  }
  return total;
}

function filaResumen(etiqueta, parte, clase) {
  return {
    etiqueta: etiqueta,
    c1: parte.c1 === null ? '' : c.formatC1(parte.c1),
    precio: c.formatImporte(parte.precio),
    clase: clase || ''
  };
}

function montarResumen(enr, hc) {
  // Con un solo producto basta la fila del total
  const filas = [];
  if (enr && hc) {
    filas.push(filaResumen('Enrollable', enr));
    filas.push(filaResumen('HoneyComb', hc));
  }
  const partes = [enr, hc].filter(Boolean);
  const suma = { precio: sumar(partes, 'precio'), c1: sumar(partes, 'c1') };
  filas.push(filaResumen('Total ' + [enr ? 'Enrollable' : '', hc ? 'HoneyComb' : ''].filter(Boolean).join(' + '), suma, 'total'));
  return filas;
}

// Columnas que no salen en el PDF de producción (pestaña "Producción"): códigos de tejido y precios
const COLUMNAS_SIN_PRODUCCION = ['48', 'Código', 'C1', 'PVP'];

/* Las mismas secciones sin las columnas de esos títulos.
   Producción: sin fila de total. Presupuesto (solo quita C1): el total se queda con el PVP. */
function quitarColumnas(secciones, titulos, conTotal) {
  return secciones.map(function (s) {
    const quedan = [];
    s.columnas.forEach(function (col, i) {
      if (titulos.indexOf(col.titulo) < 0) quedan.push(i);
    });
    return {
      titulo: s.titulo,
      columnas: quedan.map(function (i) { return s.columnas[i]; }),
      filas: s.filas.map(function (fila) { return quedan.map(function (i) { return fila[i]; }); }),
      total: conTotal && s.total ? Object.assign({}, s.total, { colspan: quedan.length - 1, sinC1: true }) : null
    };
  });
}

// La plantilla se lee en cada impresión: es pequeña y así un cambio no obliga a reiniciar
function generarHtml(modelo) {
  const plantilla = Handlebars.compile(fs.readFileSync(PLANTILLA, 'utf8'));
  return plantilla(modelo);
}

async function impresion_documento_pdf(req, res) {
  const p = c.validarParametros(req, res);
  if (!p) return;
  try {
    const pool = await sql.connect();
    const cab = await pool.request()
      .input('id', sql.Int, p.id)
      .query(
        'select d.IDROW, d.FECHA, d.REFCLIENTE, d.REFERENCIA, d.CLIENTE, c.NomCliente as nombreCliente, ' +
        '  e.nombre as nombreCentro ' +
        'from ' + p.doc.cabecera + ' d ' +
        'left join dbo.NH_CLIENTES c on c.IdCliente = d.CLIENTE ' +
        // El centro (tienda) es el domicilio de entrega del cliente
        'left join dbo.NH_CLIENTES_DOMICILIOS e on e.idrow = d.CLIENTE_ENTREGA ' +
        'where d.IDROW = @id'
      );
    if (!cab.recordset.length) {
      return res.status(404).json({ error: 'No existe el ' + req.params.doc + ' ' + p.id });
    }
    const cabecera = cab.recordset[0];

    const enr = await enrollable.leer(pool, p.doc, p.id, cabecera.CLIENTE);
    const hc = await leerHoneycomb(pool, req.params.doc, p.id);
    if (!enr && !hc) {
      return res.status(404).json({ error: 'El ' + req.params.doc + ' ' + p.id + ' no tiene enrollable ni HoneyComb para imprimir aquí' });
    }
    // ?modo=produccion: el mismo documento sin códigos de tejido, precios, totales ni resumen
    const produccion = req.query && req.query.modo === 'produccion';
    const secciones = (enr ? enr.secciones : []).concat(hc ? hc.secciones : []);

    // El título del documento es el nombre con el que el visor del navegador propone guardarlo
    const nombreFichero = (produccion ? 'Produccion' : [enr ? 'Enrollable' : '', hc ? 'HoneyComb' : ''].filter(Boolean).join('_')) +
      '_' + req.params.doc + '_' + p.id;
    const hoy = new Date();
    // Los presupuestos no llevan C1: solo el PVP en las tablas, los totales y el resumen
    const conC1 = req.params.doc !== 'presupuesto';
    const modelo = {
      nombreFichero: nombreFichero,
      secciones: produccion ? quitarColumnas(secciones, COLUMNAS_SIN_PRODUCCION, false)
        : conC1 ? secciones : quitarColumnas(secciones, ['C1'], true),
      resumen: produccion ? null : montarResumen(enr, hc),
      conC1: conC1
    };
    const datosCabecera = {
      fechaImpresion: c.dosDigitos(hoy.getDate()) + '/' + c.dosDigitos(hoy.getMonth() + 1) + '/' + hoy.getFullYear(),
      textoDocumento: p.doc.textoDocumento,
      referencia: c.texto(cabecera.REFCLIENTE) || String(cabecera.IDROW),
      textoFecha: p.doc.textoFecha,
      fecha: c.formatFecha(cabecera.FECHA),
      fechaPrevista: c.fechaPrevista(cabecera.FECHA),
      // REFERENCIA es el identificador único del pedido o presupuesto; REFCLIENTE, el texto que escribe el cliente
      guid: c.texto(cabecera.REFERENCIA),
      clienteCentro: [
        c.texto(cabecera.nombreCliente) ? 'Cliente: ' + c.texto(cabecera.nombreCliente) : '',
        c.texto(cabecera.nombreCentro) ? 'Centro: ' + c.texto(cabecera.nombreCentro) : ''
      ].filter(Boolean).join(' - ')
    };
    // La cabecera del pedido y el número de página se repiten en cada hoja (cabecera y pie de Chrome)
    const buffer = await pdf.generarPdf(generarHtml(modelo), {
      landscape: true,
      titulo: nombreFichero,
      displayHeaderFooter: true,
      headerTemplate: CABECERA(datosCabecera),
      footerTemplate: PIE,
      margin: { top: '38mm', bottom: '12mm', left: '10mm', right: '10mm' }
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'inline; filename="' + nombreFichero + '.pdf"',
      'Cache-Control': 'no-store'
    });
    res.end(buffer);
  } catch (err) {
    console.error('impresion_documento_pdf:', err);
    res.status(500).json({ error: 'Error generando el PDF del ' + req.params.doc });
  }
}

module.exports = {
  impresion_documento_info,
  impresion_documento_pdf
};
