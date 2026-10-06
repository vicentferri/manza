'use strict'

// Oráculo: límites ESPERADOS calculados desde el Excel de fabricación y las decisiones confirmadas por el
// usuario, sin leer sol_medidas_fabricacion. Si la BD y el oráculo discrepan, uno de los dos está mal.

var xlsx = require('./xlsx');

// Relación nombre del Excel -> ids de sol_articulos_tejidos (confirmada por el usuario el 2026-10-05).
// Las filas "<nombre> ID" (impresión digital) usan los mismos ids que su tejido.
var TEJIDOS_EXCEL = {
  'ARCE OPACO': [13, 47, 48],
  'SERGE OUT': [59],
  'LIDO RD': [198],
  'ARCO': [16, 204],
  'BERGEN': [169],
  'IMPRESSIONS': [203],
  'LIDO': [197],
  'SOHO': [199],
  'SOLAR 1 - 5 - 10': [52, 53, 54, 225, 71, 70],
  'SARGA 5': [18],
  'SARGA 1': [42],
  'JARA 1': [17],
  'BREZO 5': [6],
  'OLMO 10': [9],
  'BARI 5': [100],
  'ECO 3': [106],
  'SEA TEX NXT': [201],
  'SEA TEX NXT RD': [200],
  'METAL 3': [32],
  'SILKMOON': [202]
};

// Modelos de motor (vw_accionamientos_colores.idrow) de la tabla "ENROLLABLES MOTOR".
var MOTORES_EXCEL = {
  'AM25 PLUS L': 676,
  'AM35 PLUS L': 1141,
  'TTGO MEC': 1153,
  'AM35 PLUS S WIFI': 679,
  'TTGO VIA RADIO': 975
};

var CLIENTES_CON_LIMITES = [1]; // Leroy Merlin

// Decisiones del usuario que no están en el Excel
var DEFECTO_ENROLLABLE = { min_ancho: 60, max_ancho: 280, min_alto: 60, max_alto: 300 }; // 2026-10-05
var HONEYCOMB = { min_ancho: 30, max_ancho: 130, min_alto: 30, max_alto: 280 };          // límites que ya tenía
var ACC_MAGIC = 16, ACC_MOTOR = 3;

var SIN = { min_ancho: null, max_ancho: null, min_alto: null, max_alto: null };

function normalizar(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function num(v) { return (v === undefined || v === null || v === '') ? null : Number(v); }

function cargarExcel(ruta) {
  var c = xlsx.leerHoja(ruta);
  var filas = {};
  Object.keys(c).forEach(function (ref) {
    var m = /^([A-Z]+)(\d+)$/.exec(ref);
    (filas[+m[2]] = filas[+m[2]] || {})[m[1]] = c[ref];
  });
  var nums = Object.keys(filas).map(Number).sort(function (a, b) { return a - b; });

  var tejidos = {}, motores = {}, bloques = {}, bloque = null, enCadena = false;
  nums.forEach(function (r) {
    var f = filas[r], a = normalizar(f.A);
    if (a === 'ENROLLABLES CADENA') { enCadena = true; return; }
    if (f.G !== undefined && typeof f.H === 'number') motores[normalizar(f.G)] = f.H;
    if (enCadena && a && typeof f.B === 'number') {
      tejidos[a] = { min_ancho: num(f.B), max_ancho: num(f.C), min_alto: num(f.D), max_alto: num(f.E) };
      return;
    }
    if (a && a !== 'TODOS' && typeof f.B !== 'number' && typeof f.D !== 'number') {
      if (enCadena && Object.keys(tejidos).length) enCadena = false;
      if (!enCadena) bloque = a;
      return;
    }
    if (a === 'TODOS' && bloque)
      bloques[bloque] = { min_ancho: num(f.B), max_ancho: num(f.C), min_alto: num(f.D), max_alto: num(f.E) };
  });
  return { tejidos: tejidos, motores: motores, bloques: bloques };
}

// Combina límites: gana el más restrictivo.
function combinar(a, b) {
  function mx(x, y) { return x === null ? y : (y === null ? x : Math.max(x, y)); }
  function mn(x, y) { return x === null ? y : (y === null ? x : Math.min(x, y)); }
  return {
    min_ancho: mx(a.min_ancho, b.min_ancho), max_ancho: mn(a.max_ancho, b.max_ancho),
    min_alto: mx(a.min_alto, b.min_alto), max_alto: mn(a.max_alto, b.max_alto)
  };
}

function crear(rutaExcel) {
  var x = cargarExcel(rutaExcel);
  var porId = {};
  Object.keys(TEJIDOS_EXCEL).forEach(function (nombre) {
    var lim = x.tejidos[normalizar(nombre)];
    if (!lim) throw new Error('El Excel ya no tiene el tejido "' + nombre + '"');
    TEJIDOS_EXCEL[nombre].forEach(function (id) { porId[id] = { nombre: nombre, lim: lim }; });
  });
  var motorPorModelo = {};
  Object.keys(MOTORES_EXCEL).forEach(function (nombre) {
    var v = x.motores[normalizar(nombre)];
    if (v === undefined) throw new Error('El Excel ya no tiene el motor "' + nombre + '"');
    motorPorModelo[MOTORES_EXCEL[nombre]] = v;
  });
  function bloque(nombre) {
    var b = x.bloques[normalizar(nombre)];
    if (!b) throw new Error('El Excel ya no tiene el bloque "' + nombre + '"');
    return b;
  }

  // Límites esperados SIN el ancho del rollo del color (eso se añade aparte, vale para cualquier cliente).
  function esperado(p) {
    if (CLIENTES_CON_LIMITES.indexOf(Number(p.cliente)) < 0) return Object.assign({}, SIN);
    var tipo = Number(p.tipo), sub = p.subtipo == null ? null : Number(p.subtipo);
    if (tipo === 1) {
      if (sub === 2) return bloque('CAJON ZIP');
      var base = porId[p.tejido] ? porId[p.tejido].lim : DEFECTO_ENROLLABLE;
      if (Number(p.acc) === ACC_MAGIC) return combinar(base, bloque('MAGIC'));
      if (Number(p.acc) === ACC_MOTOR && motorPorModelo[p.modelo] !== undefined)
        return combinar(base, { min_ancho: motorPorModelo[p.modelo], max_ancho: null, min_alto: null, max_alto: null });
      return Object.assign({}, base);
    }
    if (tipo === 2) return bloque({ 1: 'PANEL MECANISMO + TEJIDO', 2: 'PANEL TEJIDO', 3: 'PANEL MECANISMO' }[sub]);
    if (tipo === 3) {
      if (sub === 4) return bloque('VERTICAL MECANISMO + TEJIDO'); // inclinada: confirmado 2026-10-06
      return bloque({ 1: 'VERTICAL MECANISMO + TEJIDO', 2: 'VERTICAL TEJIDO', 3: 'VERTICAL MECANISMO' }[sub]);
    }
    if (tipo === 4) return bloque('COMPAC');
    if (tipo === 7) return Object.assign({}, HONEYCOMB);
    return Object.assign({}, SIN);
  }

  return {
    excel: x, porId: porId, motorPorModelo: motorPorModelo, esperado: esperado, combinar: combinar,
    normalizar: normalizar, idsExcel: Object.keys(porId).map(Number), CLIENTES_CON_LIMITES: CLIENTES_CON_LIMITES
  };
}

module.exports = { crear, TEJIDOS_EXCEL, MOTORES_EXCEL, SIN };
