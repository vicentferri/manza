'use strict'

/* Bloque de la HoneyComb (tipo 7) para la impresión en PDF del pedido o presupuesto (documento.js).
   Una sola tabla con una fila por línea del documento y la fila de total. */

const sql = require('mssql');
const c = require('./comun');

// Código del tejido HoneyComb: el mismo para todas las líneas
const CODIGO_TEJIDO = '48007280';

// Vista con las líneas HoneyComb ya resueltas (textos de tejido, color y accionamiento) y su orden
const LINEAS = {
  pedido: { vista: 'dbo.vw_report_bestellung_lines_7', orden: 'linea, id' },
  presupuesto: { vista: 'dbo.vw_reports_budget_lines_7', orden: 'id' }
};

const COLUMNAS = ['Producto', 'Color tejido', 'Código', 'Color mecanismo', 'Accionamiento', 'Ancho cm', 'Alto cm',
  'Cantidad', 'C1', 'PVP'];

async function leerLineas(pool, doc, id) {
  const lineas = LINEAS[doc.nombre];
  const r = await pool.request()
    .input('id', sql.Int, id)
    .query(
      'select ancho, alto, cantidad, tej_tipo_text, tej_color_text, color_perfil_text, ' +
      '  hc_accionamiento_text, T7_PVP, T7_PVP_C1 ' +
      'from ' + lineas.vista + ' where IDROW = @id order by ' + lineas.orden
    );
  return r.recordset;
}

/* Bloque de la HoneyComb del documento, o null si no tiene HoneyComb.
   Devuelve { secciones, precio, c1 } con los totales en céntimos (c1 = null si alguna línea no lo tiene). */
async function leer(pool, doc, id) {
  const lineas = await leerLineas(pool, doc, id);
  if (!lineas.length) return null;

  let precio = 0;
  let c1 = 0;
  const filas = lineas.map(function (l) {
    const precioLinea = c.centimos(l.T7_PVP);
    const c1Linea = c.centimosC1(l.T7_PVP_C1);
    precio += precioLinea;
    c1 = c1 === null || c1Linea === null ? null : c1 + c1Linea;
    return [
      { valor: 'HoneyComb' + (c.texto(l.tej_tipo_text) ? ' - ' + c.texto(l.tej_tipo_text) : ''), clase: 'producto' },
      { valor: c.texto(l.tej_color_text) },
      { valor: CODIGO_TEJIDO },
      { valor: c.texto(l.color_perfil_text) },
      { valor: c.texto(l.hc_accionamiento_text) },
      { valor: c.formatMedida(l.ancho) },
      { valor: c.formatMedida(l.alto) },
      { valor: l.cantidad },
      // Si el C1 no tiene el formato esperado sale tal cual
      { valor: c1Linea !== null ? c.formatC1(c1Linea) : c.texto(l.T7_PVP_C1), clase: 'c1' },
      { valor: c.formatImporte(precioLinea), clase: 'importe' }
    ];
  });

  return {
    secciones: [c.seccion('HoneyComb', COLUMNAS.map(function (titulo) { return { titulo: titulo }; }), filas, {
      etiqueta: 'Total HoneyComb',
      c1: c1 === null ? '' : c.formatC1(c1),
      precio: c.formatImporte(precio)
    })],
    precio: precio,
    c1: c1
  };
}

// Todos los clientes la imprimen aquí
function aplica() {
  return true;
}

module.exports = {
  clave: 'honeycomb',
  nombre: 'HoneyComb',
  tipo: 7,
  aplica,
  leer
};
