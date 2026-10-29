'use strict'

/* Impresión en PDF (Puppeteer) de pedidos y presupuestos: todos los productos en un único documento.
   - Los bloques de cada producto, en el orden de PRODUCTOS (hoy enrollable y HoneyComb).
   - Al final, el resumen de precios: cada producto y su suma.
   El visor lo muestra en la pestaña "Nuevo"; en "Antiguo" sale el informe de Crystal de siempre (haru_server/preview.aspx).
   Sustituye a ../impresion_honeycomb.js cuando el visor tiene activada la impresión del enrollable (IMPRESION_ENROLLABLE).

   GET /api/sm/impresion/info/:doc/:id  -> { productos: ['enrollable', ...], enrollable: true, honeycomb: false }
       (productos: las claves de los que se imprimen aquí; los campos sueltos se mantienen para el visor actual)
   GET /api/sm/impresion/pdf/:doc/:id   -> application/pdf
   GET /api/sm/impresion/pdf/:doc/:id?modo=produccion -> el mismo PDF para producción (pestaña "Producción"):
       sin las columnas 48, Código, C1 y PVP, sin filas de total y sin resumen
   doc ='pedido' | 'presupuesto', id = IDROW del pedido o presupuesto. */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const pdf = require('../../../services/pdf');
const c = require('./comun');

/* Productos que se imprimen en este documento, en el orden en que salen. Cada módulo exporta:
     clave       nombre en la respuesta de info ('enrollable')
     nombre      en el resumen y en el nombre del fichero ('Enrollable')
     tipo        TIPO de sus líneas en el pedido o presupuesto (1)
     aplica(cliente)                  si el cliente lo imprime aquí (si no, sale con Crystal en "Antiguo")
     leer(pool, doc, id, cliente)     { secciones, precio, c1 } (totales en céntimos, c1 null si falta), o null
   Para añadir un producto: crear su módulo con ese contrato y añadirlo aquí. */
const PRODUCTOS = [
  require('./enrollable'),
  require('./honeycomb')
];

const PLANTILLA = path.join(__dirname, '../../../templates/impresion/documento.hbs');

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

/* null si no existe el documento; si existe, { productos: [claves], clave: true/false }: los productos que tienen
   líneas suyas que se imprimen aquí */
async function leerResumen(pool, doc, id) {
  const cab = await pool.request()
    .input('id', sql.Int, id)
    .query('select CLIENTE from ' + doc.cabecera + ' where IDROW = @id');
  if (!cab.recordset.length) return null;
  const cliente = cab.recordset[0].CLIENTE;

  const r = await pool.request()
    .input('id', sql.Int, id)
    .query('select distinct TIPO from ' + doc.lineas + ' where IDROW = @id');
  const tipos = r.recordset.map(function (f) { return f.TIPO; });

  const resumen = { productos: [] };
  PRODUCTOS.forEach(function (producto) {
    resumen[producto.clave] = producto.aplica(cliente) && tipos.indexOf(producto.tipo) >= 0;
    if (resumen[producto.clave]) resumen.productos.push(producto.clave);
  });
  return resumen;
}

async function impresion_documento_info(req, res) {
  const p = c.validarParametros(req, res);
  if (!p) return;
  try {
    const pool = await sql.connect();
    const resumen = await leerResumen(pool, p.doc, p.id);
    if (!resumen) {
      return res.status(404).json({ error: 'No existe el ' + req.params.doc + ' ' + p.id });
    }
    res.json(resumen);
  } catch (err) {
    console.error('impresion_documento_info:', err);
    res.status(500).json({ error: 'Error consultando el ' + req.params.doc });
  }
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

// partes: [{ nombre, precio, c1 }] de los productos que tiene el documento
function montarResumen(partes) {
  // Con un solo producto basta la fila del total
  const filas = [];
  if (partes.length > 1) {
    partes.forEach(function (parte) { filas.push(filaResumen(parte.nombre, parte)); });
  }
  const suma = { precio: sumar(partes, 'precio'), c1: sumar(partes, 'c1') };
  const nombres = partes.map(function (parte) { return parte.nombre; });
  filas.push(filaResumen('Total ' + nombres.join(' + '), suma, 'total'));
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

    // Los productos del documento, cada uno con sus bloques y totales
    const partes = [];
    for (const producto of PRODUCTOS) {
      if (!producto.aplica(cabecera.CLIENTE)) continue;
      const parte = await producto.leer(pool, p.doc, p.id, cabecera.CLIENTE);
      if (parte) partes.push(Object.assign({ nombre: producto.nombre }, parte));
    }
    if (!partes.length) {
      return res.status(404).json({ error: 'El ' + req.params.doc + ' ' + p.id + ' no tiene productos que se impriman aquí' });
    }
    // ?modo=produccion: el mismo documento sin códigos de tejido, precios, totales ni resumen
    const produccion = req.query && req.query.modo === 'produccion';
    const secciones = [].concat.apply([], partes.map(function (parte) { return parte.secciones; }));

    // El título del documento es el nombre con el que el visor del navegador propone guardarlo
    const nombreFichero = (produccion ? 'Produccion' : partes.map(function (parte) { return parte.nombre; }).join('_')) +
      '_' + req.params.doc + '_' + p.id;
    const hoy = new Date();
    // Los presupuestos no llevan C1: solo el PVP en las tablas, los totales y el resumen
    const conC1 = req.params.doc !== 'presupuesto';
    const modelo = {
      nombreFichero: nombreFichero,
      secciones: produccion ? quitarColumnas(secciones, COLUMNAS_SIN_PRODUCCION, false)
        : conC1 ? secciones : quitarColumnas(secciones, ['C1'], true),
      resumen: produccion ? null : montarResumen(partes),
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
