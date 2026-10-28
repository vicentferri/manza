'use strict'

/* Utilidades de la impresión en PDF (Puppeteer) compartidas por el enrollable y el documento conjunto. */

const DOCUMENTOS = {
  pedido: {
    cabecera: 'dbo.SOL_PEDIDOS_COLA',
    lineas: 'dbo.SOL_PEDIDOS_COLA_LINEAS',
    // Tabla de cada tipo de producto: prefijo + número de tipo
    tablaTipo: 'dbo.SOL_PEDIDOS_COLA_TIPO_',
    lineasHoneycomb: 'dbo.vw_report_bestellung_lines_7',
    textoDocumento: 'Pedido',
    textoFecha: 'Fecha pedido'
  },
  presupuesto: {
    cabecera: 'dbo.SOL_PRESUPUESTOS_COLA',
    lineas: 'dbo.SOL_PRESUPUESTOS_COLA_LINEAS',
    tablaTipo: 'dbo.SOL_PRESUPUESTOS_COLA_TIPO_',
    lineasHoneycomb: 'dbo.vw_reports_budget_lines_7',
    textoDocumento: 'Presupuesto',
    textoFecha: 'Fecha presupuesto'
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

// Fecha prevista: un día más que la fecha del pedido o presupuesto
function fechaPrevista(fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha)) return '';
  return formatFecha(new Date(fecha.getTime() + 24 * 60 * 60 * 1000));
}

// Medidas sin ceros de sobra: 264.50 -> 264.5, 100.00 -> 100
function formatMedida(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  return String(Number(valor));
}

// Los textos sin elegir se guardan vacíos, como NULL o como -1
function texto(valor) {
  const t = valor === null || valor === undefined ? '' : String(valor).trim();
  return t === '-1' || t.toUpperCase() === 'NULL' ? '' : t;
}

// Importe en céntimos (los PVP vienen como float: 1541.8799999999999)
function centimos(valor) {
  return Math.round((Number(valor) || 0) * 100);
}

// C1 de una línea en céntimos. Formato habitual "C1 0018167"; algunas líneas lo guardan como importe (181.67)
function centimosC1(valor) {
  const t = String(valor === null || valor === undefined ? '' : valor).trim();
  let m = t.match(/^C1\s*(\d+)$/i);
  if (m) return parseInt(m[1], 10);
  m = t.match(/^\d+(?:[.,]\d+)?$/);
  if (m) return Math.round(parseFloat(t.replace(',', '.')) * 100);
  return null;
}

function formatC1(cent) {
  return 'C1 ' + String(cent).padStart(7, '0');
}

function formatImporte(cent) {
  return fmtImporte.format(cent / 100) + ' €';
}

/* Reparte un importe en céntimos entre n unidades sin perder céntimos: 1000 entre 3 -> 334, 333, 333 */
function repartir(cent, n) {
  const base = Math.floor(cent / n);
  const resto = cent - base * n;
  const partes = [];
  for (let i = 0; i < n; i++) partes.push(base + (i < resto ? 1 : 0));
  return partes;
}

/* Bloque del documento: un título y su tabla. Los bloques van seguidos en la misma hoja y solo se pasa
   a otra cuando se llena; la tabla repite allí sus títulos de columna.
   columnas: [{ titulo }], filas: [[{ valor, clase }]].
   total (opcional): fila de total al final, { etiqueta, c1, precio }; C1 y PVP son siempre las dos
   últimas columnas. */
function seccion(titulo, columnas, filas, total) {
  return {
    titulo: titulo,
    columnas: columnas,
    filas: filas,
    total: total ? Object.assign({ colspan: columnas.length - 2 }, total) : null
  };
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

module.exports = {
  DOCUMENTOS,
  dosDigitos,
  formatFecha,
  fechaPrevista,
  formatMedida,
  texto,
  centimos,
  centimosC1,
  formatC1,
  formatImporte,
  repartir,
  seccion,
  validarParametros
};
