'use strict'

// Banco de pruebas de las medidas de fabricación (rama cambios_configurador).
//
//   node test/medidas/banco.js                    todas las suites
//   node test/medidas/banco.js --solo=funcion,http
//   node test/medidas/banco.js --detalle          lista también cada caso OK
//   node test/medidas/banco.js --informe=x.md     guarda el informe en Markdown
//
// Solo se ejecuta contra una BD cuyo nombre contenga TEST (usa backend/.env). Lo que escribe:
//   - suite "esquema": llamadas a los SP de alta dentro de transacciones que se deshacen (rollback);
//   - suite "funcion": filas temporales dentro de una transacción que se deshace;
//   - suite "http": las valoraciones que pasan crean líneas temporales (temp_sol_pedidos_cola_*,
//     referencia BANCO_MEDIDAS), igual que una valoración desde la pantalla.
//
// Estados: OK, FALLO (algo roto: sale con código 1), AVISO (hueco de datos o decisión pendiente), INFO.

var path = require('path');
var fs = require('fs');
var https = require('https');
var childProcess = require('child_process');

var BACKEND = path.join(__dirname, '..', '..');
var RAIZ = path.join(BACKEND, '..');
var EXCEL = path.join(RAIZ, 'MEDIDAS LEROY MANZA.xlsx');

// ── Configuración (igual que server.js: backend/.env sin pisar variables ya definidas) ─────────────
var envFile = path.join(BACKEND, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(function (line) {
    var m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  });
}
var ARGS = {};
process.argv.slice(2).forEach(function (a) { var m = /^--([^=]+)(?:=(.*))?$/.exec(a); if (m) ARGS[m[1]] = m[2] === undefined ? true : m[2]; });

var sql = require('mssql');
var Medidas = require('../../controllers/sm/lm/medidas');
var Oraculo = require('./lib/oraculo');

var CONFIG = {
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, database: process.env.DB_NAME,
  options: { encrypt: false, enableArithAbort: true, trustServerCertificate: true },
  requestTimeout: 120000
};

// ── Resultados ──────────────────────────────────────────────────────────────────────────────────────
var RES = [];
var suite = '';
function reg(estado, nombre, detalle) { RES.push({ suite: suite, estado: estado, nombre: nombre, detalle: detalle || '' }); }
function ok(n, d) { reg('OK', n, d); }
function fallo(n, d) { reg('FALLO', n, d); }
function aviso(n, d) { reg('AVISO', n, d); }
function info(n, d) { reg('INFO', n, d); }
function check(cond, n, d) { cond ? ok(n) : fallo(n, d); return cond; }

async function q(texto, inputs, req) {
  var r = req || new sql.Request();
  Object.keys(inputs || {}).forEach(function (k) { r.input(k, inputs[k]); });
  return (await r.query(texto)).recordset;
}

// Lee una columna sin depender de mayúsculas (las tablas mezclan DESCRIPCION, ancho, PV_Ancho_1...)
function campo(fila, nombre) {
  if (!fila) return undefined;
  var k = Object.keys(fila).filter(function (x) { return x.toLowerCase() === nombre.toLowerCase(); })[0];
  return k === undefined ? undefined : fila[k];
}
function txt(n) { return String(n).replace('.', ','); }
function igual(a, b) { return (a === null || a === undefined) ? (b === null || b === undefined) : (b !== null && b !== undefined && Math.abs(Number(a) - Number(b)) < 1e-9); }
function limTxt(l) { return '[' + [l.min_ancho, l.max_ancho, l.min_alto, l.max_alto].map(function (v) { return v === null || v === undefined ? '-' : v; }).join(', ') + ']'; }
function medio(v) { return Math.round(v * 2) / 2; }
function mitad(min, max, def) {
  if (min !== null && max !== null) return medio((min + max) / 2);
  if (min !== null) return min + 10;
  if (max !== null) return Math.max(max - 10, 1);
  return def;
}

// ── Catálogo del cliente 1 (lo que de verdad ve Leroy en el configurador) ───────────────────────────
var CAT = {};
async function cargarCatalogo() {
  var filas = await q("select producto, tejido, max(Ntejido) Ntejido from dbo.SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS where cliente = 1 group by producto, tejido");
  CAT.tejidos = {};
  filas.forEach(function (f) { (CAT.tejidos[f.producto] = CAT.tejidos[f.producto] || []).push({ id: f.tejido, nombre: f.Ntejido }); });
  CAT.colores = await q("select distinct tejido, color, ancmax from dbo.vw_tejidos_colores where cliente = 1 and ancmax > 0");
  CAT.motores = await q("select distinct idrow, descripcion from dbo.vw_accionamientos_colores where cliente = 1 and producto = 1 and Tipo = 'MOTOR'");
  CAT.tiposAcc = await q("select distinct tipoidrow, Tipo from dbo.vw_accionamientos_colores where cliente = 1 and producto = 1");
}
function coloresDe(tejido) { return CAT.colores.filter(function (c) { return c.tejido === tejido; }); }

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite excel: coherencia de la fuente de verdad
// ═════════════════════════════════════════════════════════════════════════════════════════════════
async function suiteExcel(O) {
  var t = O.excel.tejidos;
  Object.keys(t).forEach(function (nombre) {
    var l = t[nombre];
    check((l.min_ancho === null || l.max_ancho === null || l.min_ancho <= l.max_ancho) && (l.min_alto === null || l.max_alto === null || l.min_alto <= l.max_alto),
      'Mín ≤ máx en "' + nombre + '"', limTxt(l));
    if (/ ID$/.test(nombre)) {
      var base = t[nombre.replace(/ ID$/, '')];
      check(!!base && limTxt(base) === limTxt(l), 'La fila "' + nombre + '" (impresión digital) coincide con su tejido',
        base ? limTxt(l) + ' frente a ' + limTxt(base) : 'no existe la fila sin ID');
    } else {
      var mapeado = Object.keys(Oraculo.TEJIDOS_EXCEL).some(function (k) { return O.normalizar(k) === nombre; });
      check(mapeado, 'El tejido "' + nombre + '" del Excel tiene ids asignados', 'Añadirlo a TEJIDOS_EXCEL (oraculo.js) y a 002');
    }
  });
  Object.keys(O.excel.bloques).forEach(function (b) {
    var l = O.excel.bloques[b];
    check((l.min_ancho === null || l.max_ancho === null || l.min_ancho <= l.max_ancho) && (l.min_alto === null || l.max_alto === null || l.min_alto <= l.max_alto),
      'Mín ≤ máx en el bloque "' + b + '"', limTxt(l));
  });
  check(Object.keys(O.excel.motores).length === Object.keys(Oraculo.MOTORES_EXCEL).length,
    'Todos los motores del Excel tienen modelo asignado', JSON.stringify(O.excel.motores));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite datos: tabla sol_medidas_fabricacion frente al Excel y al catálogo
// ═════════════════════════════════════════════════════════════════════════════════════════════════
async function suiteDatos(O) {
  var filas = await q('select * from dbo.sol_medidas_fabricacion');
  check(filas.length > 0, 'La tabla tiene filas', '');
  var clientes = {};
  filas.forEach(function (f) { var k = f.cliente === null ? 'general' : f.cliente; clientes[k] = (clientes[k] || 0) + 1; });
  info('Filas por cliente', JSON.stringify(clientes));
  var ajenas = filas.filter(function (f) { return f.cliente !== null && O.CLIENTES_CON_LIMITES.indexOf(f.cliente) < 0; });
  check(ajenas.length === 0, 'Solo los clientes previstos tienen filas propias', ajenas.length + ' filas de otros clientes');
  var generales = filas.filter(function (f) { return f.cliente === null; });
  check(generales.length === 0, 'No hay límites generales (cliente vacío): solo Leroy tiene límites', generales.length + ' filas generales; valdrían para todos los clientes sin filas propias');
  check(filas.every(function (f) { return f.activo === true || f.activo === 1; }), 'Todas las filas están activas', '');
  var claves = {};
  filas.forEach(function (f) {
    var k = [f.cliente, f.tipo_cortina, f.subtipo, f.accionamiento, f.modelo_acc, f.tejido].join('|');
    claves[k] = (claves[k] || 0) + 1;
  });
  var dup = Object.keys(claves).filter(function (k) { return claves[k] > 1; });
  check(dup.length === 0, 'Sin filas duplicadas para la misma combinación', dup.join(' ; '));
  filas.forEach(function (f) {
    if (!((f.min_ancho === null || f.max_ancho === null || +f.min_ancho <= +f.max_ancho) && (f.min_alto === null || f.max_alto === null || +f.min_alto <= +f.max_alto)))
      fallo('Mín ≤ máx en la fila ' + f.id, f.descripcion + ' ' + limTxt(f));
  });
  ok('Mín ≤ máx revisado en ' + filas.length + ' filas');

  var tejidosBD = await q('select idrow, descripcion from dbo.sol_articulos_tejidos');
  var existe = {}; tejidosBD.forEach(function (t) { existe[t.idrow] = t.descripcion; });
  filas.filter(function (f) { return f.tejido !== null; }).forEach(function (f) {
    check(!!existe[f.tejido], 'El tejido ' + f.tejido + ' (' + f.descripcion + ') existe en sol_articulos_tejidos', 'no existe');
  });
  var modelos = await q("select distinct idrow from dbo.vw_accionamientos_colores where Tipo = 'MOTOR'");
  var esMotor = {}; modelos.forEach(function (m) { esMotor[m.idrow] = true; });
  filas.filter(function (f) { return f.modelo_acc !== null; }).forEach(function (f) {
    check(!!esMotor[f.modelo_acc], 'El modelo ' + f.modelo_acc + ' (' + f.descripcion + ') es un motor', 'no aparece como MOTOR en vw_accionamientos_colores');
  });

  // Cada fila de tejido de la BD coincide con el Excel, y cada id del Excel tiene su fila
  filas.filter(function (f) { return f.tipo_cortina === 1 && f.tejido !== null && f.cliente === 1; }).forEach(function (f) {
    var o = O.porId[f.tejido];
    if (!o) { fallo('La fila del tejido ' + f.tejido + ' (' + f.descripcion + ') sale del Excel', 'su id no está en la relación del Excel'); return; }
    check(limTxt(f) === limTxt(o.lim), 'Tejido ' + f.tejido + ' (' + f.descripcion + ') = Excel "' + o.nombre + '"', 'BD ' + limTxt(f) + ' / Excel ' + limTxt(o.lim));
  });
  O.idsExcel.forEach(function (id) {
    check(filas.some(function (f) { return f.cliente === 1 && f.tipo_cortina === 1 && f.tejido === id; }),
      'El tejido ' + id + ' (Excel "' + O.porId[id].nombre + '") tiene fila para el cliente 1', 'falta la fila');
  });

  // Catálogo de Leroy: tejidos sin fila propia (usan el límite por defecto)
  (CAT.tejidos[1] || []).forEach(function (t) {
    if (!O.porId[t.id]) aviso('El tejido de Leroy ' + t.id + ' "' + t.nombre + '" no está en el Excel: usa el límite por defecto del enrollable (60–280 × 60–300)',
      'Si en el Excel es otro nombre (p. ej. "ECO 3" se cargó con el id 106 del cliente 5), añadir su id a la relación');
  });
  O.idsExcel.forEach(function (id) {
    if (!(CAT.tejidos[1] || []).some(function (t) { return t.id === id; }))
      info('El tejido ' + id + ' (Excel "' + O.porId[id].nombre + '") no está en el catálogo de enrollable de Leroy', 'Su fila no afecta al configurador');
  });
  // Productos del catálogo de Leroy sin límites
  var conLimites = {}; filas.forEach(function (f) { conLimites[f.tipo_cortina] = true; });
  var cfgHtml = fs.readFileSync(path.join(RAIZ, 'frontend', 'src', 'app', 'manza', 'config', 'config.component.html'), 'utf8');
  Object.keys(CAT.tejidos).forEach(function (p) {
    if (conLimites[p] || +p <= 4) return;
    var ofrecido = new RegExp('TipoCortina\\s*==\\s*' + p + '\\b').test(cfgHtml);
    (ofrecido ? aviso : info)('Leroy tiene tejidos del producto ' + p + ' (' + CAT.tejidos[p].length + ') y ese producto no tiene límites',
      ofrecido ? 'El configurador lo ofrece: faltan sus límites' : 'El configurador no lo ofrece (6 = Panel ZIP), así que no afecta');
  });
  // Motores de Leroy que no están en el Excel: sin restricción propia (decisión del usuario)
  CAT.motores.forEach(function (m) {
    if (O.motorPorModelo[m.idrow] === undefined) info('Motor de Leroy sin fila propia: ' + m.idrow + ' ' + m.descripcion, 'Solo le aplican los límites del tejido');
  });
  info('Tipos de accionamiento de Leroy en enrollable', CAT.tiposAcc.map(function (a) { return a.tipoidrow + '=' + a.Tipo; }).join(', '));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite funcion: fn_limites_fabricacion frente al oráculo, combinación a combinación
// ═════════════════════════════════════════════════════════════════════════════════════════════════
async function fn(p, req) {
  var r = await q('select * from dbo.fn_limites_fabricacion(@cliente, @tipo, @subtipo, @acc, @modelo, @tejido, @color)', {
    cliente: p.cliente === undefined ? null : p.cliente, tipo: p.tipo, subtipo: p.subtipo === undefined ? null : p.subtipo,
    acc: p.acc === undefined ? null : p.acc, modelo: p.modelo === undefined ? null : p.modelo,
    tejido: p.tejido === undefined ? null : p.tejido, color: p.color === undefined ? null : p.color
  }, req);
  return r[0];
}

function combinacionesEnrollable(O) {
  var tejidos = {};
  (CAT.tejidos[1] || []).forEach(function (t) { tejidos[t.id] = true; });
  O.idsExcel.forEach(function (id) { tejidos[id] = true; });
  tejidos[999999] = true; // tejido inexistente: debe usar el defecto
  var accs = [{ acc: 1, modelo: null, n: 'cadena' }, { acc: 16, modelo: null, n: 'Magic' }];
  var motores = {};
  CAT.motores.forEach(function (m) { motores[m.idrow] = m.descripcion; });
  Object.keys(O.motorPorModelo).forEach(function (m) { motores[m] = motores[m] || 'motor del Excel'; });
  Object.keys(motores).forEach(function (m) { accs.push({ acc: 3, modelo: +m, n: 'motor ' + m }); });
  var r = [];
  Object.keys(tejidos).forEach(function (t) {
    accs.forEach(function (a) { r.push({ tipo: 1, subtipo: 1, acc: a.acc, modelo: a.modelo, tejido: +t, n: 'enrollable ' + a.n + ' tejido ' + t }); });
    r.push({ tipo: 1, subtipo: 2, acc: 1, tejido: +t, n: 'cajón ZIP tejido ' + t });
  });
  return r;
}

async function suiteFuncion(O) {
  var combos = combinacionesEnrollable(O);
  [1, 2, 3].forEach(function (s) { combos.push({ tipo: 2, subtipo: s, n: 'panel composición ' + s }); });
  [1, 2, 3, 4].forEach(function (s) { combos.push({ tipo: 3, subtipo: s, n: 'vertical subtipo ' + s }); });
  (CAT.tejidos[4] || [{ id: null }]).forEach(function (t) { combos.push({ tipo: 4, tejido: t.id, n: 'compac tejido ' + t.id }); });
  combos.push({ tipo: 4, n: 'compac sin tejido' });
  combos.push({ tipo: 7, n: 'honeycomb' });
  combos.push({ tipo: 6, n: 'panel ZIP' });

  var clientes = [1, 5, 999999];
  var nOk = 0;
  for (var i = 0; i < combos.length; i++) {
    for (var j = 0; j < clientes.length; j++) {
      var p = Object.assign({ cliente: clientes[j] }, combos[i]);
      var r = await fn(p);
      var e = O.esperado(p);
      var bien = igual(r.min_ancho, e.min_ancho) && igual(r.max_ancho, e.max_ancho) && igual(r.min_alto, e.min_alto) && igual(r.max_alto, e.max_alto);
      if (!bien) fallo('Cliente ' + p.cliente + ', ' + p.n, 'BD ' + limTxt(r) + ' / esperado ' + limTxt(e));
      else nOk++;
      var conLim = e.min_ancho !== null || e.max_ancho !== null || e.min_alto !== null || e.max_alto !== null;
      if (bien && conLim && !(r.n_filas > 0)) fallo('Cliente ' + p.cliente + ', ' + p.n + ': n_filas', 'n_filas = ' + r.n_filas);
      if (bien && !conLim && r.n_filas !== 0) fallo('Cliente ' + p.cliente + ', ' + p.n + ': sin filas', 'n_filas = ' + r.n_filas);
    }
  }
  ok('Límites sin color iguales al Excel en ' + nOk + ' de ' + combos.length * clientes.length + ' combinaciones (clientes 1, 5 y uno inexistente)');

  // Ancho del rollo del color: límite físico para todos los clientes; para Leroy, el menor de los dos
  var dup = await q('select count(*) n from (select tejido, color from dbo.vw_tejidos_colores where ancmax > 0 group by tejido, color having count(distinct ancmax) > 1) d');
  check(dup[0].n === 0, 'El ancho del rollo de un color es el mismo para todos los clientes', dup[0].n + ' combinaciones con valores distintos: la función usa el menor de todos');
  var nCol = 0, malCol = 0;
  var porProducto = [{ prod: 1, p: { tipo: 1, subtipo: 1, acc: 1 } }, { prod: 2, p: { tipo: 2, subtipo: 2 } }, { prod: 4, p: { tipo: 4 } }];
  for (var k = 0; k < porProducto.length; k++) {
    var tej = CAT.tejidos[porProducto[k].prod] || [];
    for (var t = 0; t < tej.length; t++) {
      var cols = coloresDe(tej[t].id);
      for (var c = 0; c < cols.length; c++) {
        for (var cl = 0; cl < 2; cl++) {
          var pc = Object.assign({ cliente: [1, 5][cl], tejido: tej[t].id, color: cols[c].color }, porProducto[k].p);
          var rc = await fn(pc);
          var ec = O.esperado(pc);
          var maxEsp = ec.max_ancho === null ? +cols[c].ancmax : Math.min(ec.max_ancho, +cols[c].ancmax);
          var origenEsp = ec.max_ancho === null || +cols[c].ancmax <= ec.max_ancho;
          nCol++;
          if (!igual(rc.max_ancho, maxEsp) || (rc.origen_max_ancho === 'COLOR') !== origenEsp) {
            malCol++;
            fallo('Rollo: cliente ' + pc.cliente + ', producto ' + porProducto[k].prod + ', tejido ' + pc.tejido + ', color ' + pc.color,
              'máx ancho ' + rc.max_ancho + ' (' + rc.origen_max_ancho + ') / esperado ' + maxEsp + (origenEsp ? ' (COLOR)' : ''));
          }
        }
      }
    }
  }
  check(malCol === 0, 'Ancho del rollo aplicado bien en ' + (nCol - malCol) + ' de ' + nCol + ' combinaciones tejido-color (Leroy y cliente 5)', '');
  var sinColor = await fn({ cliente: 1, tipo: 1, subtipo: 1, acc: 1, tejido: 59, color: 999999 });
  check(igual(sinColor.max_ancho, 200), 'Un color inexistente no limita', 'máx ancho ' + sinColor.max_ancho);

  // Límites generales (cliente vacío) y sustitución por cliente, con filas temporales y rollback
  var tx = new sql.Transaction();
  await tx.begin();
  try {
    var R = function () { return new sql.Request(tx); };
    await q("insert into dbo.sol_medidas_fabricacion (cliente, tipo_cortina, min_ancho, max_ancho, descripcion, origen) values (null, 4, 50, 100, 'BANCO general', 'BANCO')", {}, R());
    var g5 = await fn({ cliente: 5, tipo: 4 }, R());
    check(igual(g5.min_ancho, 50) && igual(g5.max_ancho, 100), 'Un cliente sin filas propias usa los límites generales', limTxt(g5));
    var g1 = await fn({ cliente: 1, tipo: 4 }, R());
    check(igual(g1.min_ancho, 40) && igual(g1.max_ancho, 120), 'Un cliente con filas propias no usa las generales', limTxt(g1));
    var gOtro = await fn({ cliente: 5, tipo: 1, subtipo: 1, acc: 1, tejido: 59 }, R());
    check(gOtro.n_filas === 0, 'Los límites generales de un producto no afectan a otro', limTxt(gOtro));
    await q("insert into dbo.sol_medidas_fabricacion (cliente, tipo_cortina, min_ancho, max_ancho, descripcion, origen) values (5, 4, 70, 90, 'BANCO cliente 5', 'BANCO')", {}, R());
    var p5 = await fn({ cliente: 5, tipo: 4 }, R());
    check(igual(p5.min_ancho, 70) && igual(p5.max_ancho, 90), 'Las filas propias de un cliente sustituyen a las generales de ese producto', limTxt(p5));
    await q("update dbo.sol_medidas_fabricacion set activo = 0 where origen = 'BANCO' and cliente = 5", {}, R());
    var p5b = await fn({ cliente: 5, tipo: 4 }, R());
    check(igual(p5b.min_ancho, 50), 'Una fila inactiva no cuenta', limTxt(p5b));
  } finally {
    await tx.rollback();
  }
  var restos = await q("select count(*) n from dbo.sol_medidas_fabricacion where origen = 'BANCO'");
  check(restos[0].n === 0, 'La transacción de prueba no deja filas', restos[0].n + ' filas');
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite validacion: Medidas.validarLineas (lo que usa calculate_prices) en los bordes de cada límite
// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Devuelve null si debe pasar, o el fragmento que debe contener el mensaje.
function veredicto(v, min, max, etiqueta, rollo) {
  if (v === null || v === undefined || v === '' || !(Number(v) > 0)) return null;
  v = Number(v);
  if (Math.abs(v * 2 - Math.round(v * 2)) > 1e-9) return etiqueta + ' (' + txt(v) + ' cm) debe ir de 0,5 en 0,5 cm';
  if (min !== null && v < min) return etiqueta + ' (' + txt(v) + ' cm) es inferior al mínimo de fabricación (' + min + ' cm)';
  if (max !== null && v > max) return etiqueta + ' (' + txt(v) + ' cm) supera el máximo de fabricación (' + max + ' cm' + (rollo ? ', limitado por el ancho del rollo' : '');
  return null;
}

function valores(min, max) {
  var r = [];
  var m = mitad(min, max, 150);
  r.push(m); r.push(m + 0.5); r.push(m + 0.3); r.push(m + 0.25);
  if (min !== null) { r.push(min - 0.5); r.push(min); r.push(min + 0.5); }
  else r.push(1);
  if (max !== null) { r.push(max - 0.5); r.push(max); r.push(max + 0.5); r.push(max + 100); }
  else r.push(999);
  return r;
}

var nVal = { ok: 0, mal: 0 };
async function probarLinea(nombre, cliente, linea, esperadoMsg) {
  var r = await Medidas.validarLineas([linea], cliente);
  var bien = esperadoMsg === null ? r === null : (typeof r === 'string' && r.indexOf(esperadoMsg) === 0);
  if (bien) { nVal.ok++; if (ARGS.detalle) ok(nombre, r || 'fabricable'); }
  else { nVal.mal++; fallo(nombre, 'resultado: ' + (r || 'fabricable') + ' / esperado: ' + (esperadoMsg || 'fabricable')); }
}

// Recorre los bordes del ancho (con alto válido) y del alto (con ancho válido).
async function bordes(nombre, cliente, lim, construir, opc) {
  opc = opc || {};
  var etA = opc.etiquetaAncho || 'El ancho', etH = opc.etiquetaAlto || 'El alto';
  var anchoOk = mitad(lim.min_ancho, lim.max_ancho, 150), altoOk = mitad(lim.min_alto, lim.max_alto, 150);
  if (!opc.sinAncho) {
    var va = valores(lim.min_ancho, lim.max_ancho);
    for (var i = 0; i < va.length; i++)
      await probarLinea(nombre + ' · ancho ' + va[i], cliente, construir(va[i], altoOk), veredicto(va[i], lim.min_ancho, lim.max_ancho, etA, opc.rollo));
  }
  if (!opc.sinAlto) {
    var vh = valores(lim.min_alto, lim.max_alto);
    for (var j = 0; j < vh.length; j++)
      await probarLinea(nombre + ' · alto ' + vh[j], cliente, construir(anchoOk, vh[j]), veredicto(vh[j], lim.min_alto, lim.max_alto, etH));
  }
}

var L = {
  enr: function (sub, acc, modelo, tejido, color) { return function (a, h) { return { TipoCortina: 1, SubTipoCortina: sub, acc_tipo_id: acc, acc_modelo_id: modelo, tej_tipo_id: tejido, tej_color_id: color === undefined ? -1 : color, ancho: a, alto: h }; }; },
  panel: function (comp, tejido, color) {
    return function (a, h) {
      var l = { TipoCortina: 2, PJ_TipoJapones: comp, PJ_tejidos_id: tejido === undefined ? -1 : tejido, PJ_tejidosC_id: color === undefined ? -1 : color };
      if (comp === 2) { l.PJ_AnchoLama = a; l.PJ_AltoLamaTerminada = h; } else { l.PJ_Ancho_2 = a; l.PJ_Alto_1 = h; }
      return l;
    };
  },
  vert: function (comp) { return function (a, h) { return { TipoCortina: 3, PV_SEL_1: true, TipoVertical: comp, PV_Ancho_1: a, PV_Alto_1: h }; }; },
  compac: function (tejido, color, junq, ancho2) { return function (a, h) { return { TipoCortina: 4, com_tej_tipo_id: tejido, com_tej_color_id: color === undefined ? -1 : color, junquillo: junq || 'JC', ancho: a, ancho2: ancho2 === undefined ? -1 : ancho2, alto: h }; }; },
  hc: function () { return function (a, h) { return { TipoCortina: 7, ancho: a, alto: h }; }; }
};

async function suiteValidacion(O) {
  var E = function (p) { return O.esperado(Object.assign({ cliente: 1 }, p)); };

  // Enrollable: cada tejido de Leroy y del Excel con cadena, Magic, cada motor y cajón ZIP
  var combos = combinacionesEnrollable(O);
  for (var i = 0; i < combos.length; i++) {
    var c = combos[i];
    await bordes(c.n, 1, E(c), L.enr(c.subtipo, c.acc, c.modelo === null ? -1 : c.modelo, c.tejido));
  }
  // Enrollable con cada color de Leroy: el máximo de ancho baja al ancho del rollo
  var tej1 = CAT.tejidos[1] || [];
  for (var t = 0; t < tej1.length; t++) {
    var cols = coloresDe(tej1[t].id);
    for (var k = 0; k < cols.length; k++) {
      var e = E({ tipo: 1, subtipo: 1, acc: 1, tejido: tej1[t].id });
      var maxR = Math.min(e.max_ancho, +cols[k].ancmax), rollo = +cols[k].ancmax <= e.max_ancho;
      var f = L.enr(1, 1, -1, tej1[t].id, cols[k].color), n = 'enrollable tejido ' + tej1[t].id + ' color ' + cols[k].color + ' (rollo ' + cols[k].ancmax + ')';
      await probarLinea(n + ' · ancho ' + maxR, 1, f(maxR, 150), veredicto(maxR, e.min_ancho, maxR, 'El ancho', rollo));
      await probarLinea(n + ' · ancho ' + (maxR + 0.5), 1, f(maxR + 0.5, 150), veredicto(maxR + 0.5, e.min_ancho, maxR, 'El ancho', rollo));
    }
  }

  // Panel japonés
  await bordes('panel mecanismo + tejido', 1, E({ tipo: 2, subtipo: 1 }), L.panel(1));
  await bordes('panel solo mecanismo', 1, E({ tipo: 2, subtipo: 3 }), L.panel(3));
  var tej2 = CAT.tejidos[2] || [];
  for (var t2 = 0; t2 < tej2.length; t2++) {
    await bordes('panel solo tejido, tejido ' + tej2[t2].id, 1, E({ tipo: 2, subtipo: 2 }), L.panel(2, tej2[t2].id));
    var cols2 = coloresDe(tej2[t2].id);
    for (var k2 = 0; k2 < cols2.length; k2++) {
      var e2 = E({ tipo: 2, subtipo: 2 }), max2 = Math.min(e2.max_ancho, +cols2[k2].ancmax), r2 = +cols2[k2].ancmax <= e2.max_ancho;
      var f2 = L.panel(2, tej2[t2].id, cols2[k2].color), n2 = 'panel solo tejido ' + tej2[t2].id + ' color ' + cols2[k2].color + ' (rollo ' + cols2[k2].ancmax + ')';
      await probarLinea(n2 + ' · ancho ' + max2, 1, f2(max2, 200), null);
      await probarLinea(n2 + ' · ancho ' + (max2 + 0.5), 1, f2(max2 + 0.5, 200), veredicto(max2 + 0.5, e2.min_ancho, max2, 'El ancho', r2));
    }
  }
  // El rollo NO limita el ancho del mecanismo (composición 1)
  var colEstrecho = CAT.colores.filter(function (x) { return +x.ancmax < 280 && (CAT.tejidos[2] || []).some(function (tt) { return tt.id === x.tejido; }); })[0];
  if (colEstrecho)
    await probarLinea('panel mecanismo + tejido 279,5 con color de rollo ' + colEstrecho.ancmax + ' (el rollo no limita el mecanismo)', 1,
      L.panel(1, colEstrecho.tejido, colEstrecho.color)(279.5, 200), null);

  // Vertical normal e inclinada
  await bordes('vertical mecanismo + tejido', 1, E({ tipo: 3, subtipo: 1 }), L.vert(1));
  await bordes('vertical solo tejido', 1, E({ tipo: 3, subtipo: 2 }), L.vert(2));
  await bordes('vertical solo riel', 1, E({ tipo: 3, subtipo: 3 }), L.vert(3));
  var ei = E({ tipo: 3, subtipo: 4 });
  var inc = function (a, amin, amax) { return { TipoCortina: 3, PV_SEL_2: true, PV_Ancho_2: a, PV_AlturaMin_2: amin, PV_AlturaMax_2: amax }; };
  var vi = valores(ei.min_ancho, ei.max_ancho);
  for (var ia = 0; ia < vi.length; ia++)
    await probarLinea('inclinada · ancho ' + vi[ia], 1, inc(vi[ia], 150, 200), veredicto(vi[ia], ei.min_ancho, ei.max_ancho, 'El ancho'));
  var vh = valores(ei.min_alto, ei.max_alto);
  for (var ih = 0; ih < vh.length; ih++) {
    // altura mínima: la máxima se pone igual o mayor para que no salte la regla mínima ≤ máxima
    await probarLinea('inclinada · altura mínima ' + vh[ih], 1, inc(150, vh[ih], Math.max(vh[ih], ei.max_alto)),
      veredicto(vh[ih], ei.min_alto, ei.max_alto, 'La altura mínima'));
    // altura máxima con mínima 100: por debajo de 100 manda la regla mínima ≤ máxima
    var espMax = vh[ih] < 100 ? 'La altura mínima (100 cm) no puede ser mayor que la máxima (' + txt(vh[ih]) + ' cm)' : veredicto(vh[ih], ei.min_alto, ei.max_alto, 'La altura máxima');
    await probarLinea('inclinada · altura máxima ' + vh[ih], 1, inc(150, 100, vh[ih]), espMax);
  }
  await probarLinea('inclinada · mínima 250 > máxima 200', 1, inc(150, 250, 200), 'La altura mínima (250 cm) no puede ser mayor que la máxima (200 cm)');
  await probarLinea('inclinada · mínima = máxima', 1, inc(150, 200, 200), null);
  await probarLinea('inclinada · mínima > máxima también para el cliente 5', 5, inc(150, 250, 200), 'La altura mínima (250 cm) no puede ser mayor');
  await probarLinea('vertical normal + inclinada en la misma línea: valida las dos', 1,
    Object.assign(L.vert(1)(150, 200), { PV_SEL_2: true, PV_Ancho_2: 290, PV_AlturaMin_2: 100, PV_AlturaMax_2: 200 }), 'El ancho (290 cm) supera el máximo');

  // Compac: cada tejido de Leroy, sus colores, junquillo redondeado (ancho exterior)
  var tej4 = CAT.tejidos[4] || [];
  var ec = E({ tipo: 4 });
  for (var t4 = 0; t4 < tej4.length; t4++) {
    await bordes('compac tejido ' + tej4[t4].id, 1, ec, L.compac(tej4[t4].id));
    var cols4 = coloresDe(tej4[t4].id);
    for (var k4 = 0; k4 < cols4.length; k4++) {
      var max4 = Math.min(ec.max_ancho, +cols4[k4].ancmax);
      await probarLinea('compac tejido ' + tej4[t4].id + ' color ' + cols4[k4].color + ' (rollo ' + cols4[k4].ancmax + ') · ancho ' + max4, 1,
        L.compac(tej4[t4].id, cols4[k4].color)(max4, 150), null);
    }
  }
  var tc = tej4.length ? tej4[0].id : -1;
  var anchosB = valores(ec.min_ancho, ec.max_ancho);
  for (var b = 0; b < anchosB.length; b++)
    await probarLinea('compac junquillo redondeado · ancho exterior ' + anchosB[b], 1, L.compac(tc, -1, 'JR', anchosB[b])(80, 150),
      veredicto(anchosB[b], ec.min_ancho, ec.max_ancho, 'El ancho'));
  await probarLinea('compac junquillo cuadrado · ancho exterior antiguo 130 se ignora', 1, L.compac(tc, -1, 'JC', 130)(80, 150), null);

  // Honeycomb
  await bordes('honeycomb', 1, E({ tipo: 7 }), L.hc());

  // Otros clientes: sin límites de fabricación, pero sí el paso de 0,5 y el rollo
  var extremos = [[1, 1], [999, 999], [5000, 5000]];
  var porTipo = [['enrollable', L.enr(1, 1, -1, 59)], ['Magic', L.enr(1, 16, -1, 59)], ['cajón ZIP', L.enr(2, 1, -1, 59)], ['panel', L.panel(1)],
    ['panel solo tejido', L.panel(2, (tej2[0] || {}).id)], ['vertical', L.vert(1)], ['compac', L.compac(tc)], ['honeycomb', L.hc()]];
  for (var x = 0; x < porTipo.length; x++)
    for (var y = 0; y < extremos.length; y++)
      await probarLinea('cliente 5, ' + porTipo[x][0] + ' ' + extremos[y].join('×') + ' (sin límites)', 5, porTipo[x][1](extremos[y][0], extremos[y][1]), null);
  await probarLinea('cliente 5, inclinada 5000 / 1 / 5000 (sin límites)', 5, inc(5000, 1, 5000), null);
  await probarLinea('cliente 5, paso de 0,5 también se exige', 5, L.enr(1, 1, -1, 59)(150.3, 200), 'El ancho (150,3 cm) debe ir de 0,5 en 0,5 cm');
  var colAny = CAT.colores.filter(function (z) { return (CAT.tejidos[1] || []).some(function (tt) { return tt.id === z.tejido; }); })[0];
  if (colAny)
    await probarLinea('cliente 5, el rollo del color sí limita (' + colAny.ancmax + ')', 5, L.enr(1, 1, -1, colAny.tejido, colAny.color)(+colAny.ancmax + 0.5, 150),
      'El ancho (' + txt(+colAny.ancmax + 0.5) + ' cm) supera el máximo de fabricación (' + colAny.ancmax + ' cm, limitado por el ancho del rollo');

  check(nVal.mal === 0, 'Validación en los bordes: ' + nVal.ok + ' casos correctos de ' + (nVal.ok + nVal.mal), nVal.mal + ' casos mal (ver FALLOS)');

  // Entradas raras
  var casos = [
    ['sin cliente', [L.hc()(80, 100)], undefined, 'No se ha indicado el cliente.'],
    ['cliente -1', [L.hc()(80, 100)], -1, 'No se ha indicado el cliente.'],
    ['cliente texto', [L.hc()(80, 100)], 'abc', 'No se ha indicado el cliente.'],
    ['lineas no es una lista', 'x', 1, 'No se han recibido líneas.'],
    ['lineas null', null, 1, 'No se han recibido líneas.'],
    ['línea null', [null], 1, 'Línea 1 sin datos.'],
    ['segunda línea null', [L.hc()(80, 100), null], 1, 'Línea 2 sin datos.'],
    ['lista vacía', [], 1, null],
    ['tipo de cortina desconocido', [{ TipoCortina: 99, ancho: 9999 }], 1, null],
    ['medidas vacías / 0 / -1 no se validan', [L.enr(1, 1, -1, 59)('', 0), L.enr(1, 1, -1, 59)(-1, null)], 1, null],
    ['medidas como texto "150.5"', [L.enr(1, 1, -1, 59)('150.5', '200')], 1, null],
    ['primera línea bien, segunda mal: devuelve el error de la segunda', [L.enr(1, 1, -1, 59)(150, 200), L.enr(1, 1, -1, 59)(210, 200)], 1, 'El ancho (210 cm) supera el máximo de fabricación (200 cm)'],
    ['dos errores: devuelve el primero', [L.enr(1, 1, -1, 59)(50, 200), L.enr(1, 1, -1, 59)(210, 200)], 1, 'El ancho (50 cm) es inferior']
  ];
  for (var z = 0; z < casos.length; z++) {
    var res = await Medidas.validarLineas(casos[z][1], casos[z][2]);
    var esp = casos[z][3];
    check(esp === null ? res === null : (typeof res === 'string' && res.indexOf(esp) === 0), 'Entrada rara: ' + casos[z][0], 'resultado: ' + res + ' / esperado: ' + esp);
  }
  // getLimites rechaza parámetros inválidos
  var rechazos = [[{ tipo: 1 }, 'Cliente no válido'], [{ cliente: 1 }, 'Tipo de cortina no válido'], [{ cliente: 1, tipo: 'x' }, 'Tipo de cortina no válido']];
  for (var w = 0; w < rechazos.length; w++) {
    var msg = null;
    try { await Medidas.getLimites(rechazos[w][0]); } catch (er) { msg = er.message; }
    check(msg === rechazos[w][1], 'getLimites rechaza ' + JSON.stringify(rechazos[w][0]), 'mensaje: ' + msg);
  }
  var neg = await Medidas.getLimites({ cliente: 1, tipo: 1, subtipo: 1, acc: -1, modelo: -1, tejido: 59, color: -1 });
  var sinNeg = await Medidas.getLimites({ cliente: 1, tipo: 1, subtipo: 1, tejido: 59 });
  check(JSON.stringify(neg) === JSON.stringify(sinNeg), 'Los -1 se tratan como "no aplica"', JSON.stringify(neg) + ' / ' + JSON.stringify(sinNeg));
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite esquema: decimales (script 004) en tablas, SP y guardado real dentro de transacciones
// ═════════════════════════════════════════════════════════════════════════════════════════════════
var MEDIDAS_COL = ['ancho', 'alto', 'ancho2', 'PV_Ancho_1', 'PV_Alto_1', 'PV_Ancho_2', 'PV_AlturaMin_2', 'PV_AlturaMax_2',
  'PJ_Ancho_1', 'PJ_Ancho_2', 'PJ_Alto_1', 'PJ_AnchoLama', 'PJ_AltoLamaTerminada'];

async function suiteEsquema() {
  // Tablas de este trabajo: valoración (temp), pedidos y presupuestos de los tipos 1-4, 6 y 7, y sus líneas comunes
  var cols = await q("select t.name tabla, c.name col, ty.name tipo, c.precision, c.scale from sys.columns c join sys.tables t on t.object_id = c.object_id " +
    "join sys.types ty on ty.user_type_id = c.user_type_id where (t.name like 'sol[_]pedidos[_]cola[_]tipo[_][1-467]' or t.name like 'sol[_]presupuestos[_]cola[_]tipo[_][1-467]' " +
    "or t.name like 'temp[_]sol[_]pedidos[_]cola[_]tipo[_][1-467]' or t.name in ('SOL_PEDIDOS_COLA_LINEAS','SOL_PRESUPUESTOS_COLA_LINEAS','TEMP_SOL_PEDIDOS_COLA_LINEAS')) " +
    "and c.name in ('" + MEDIDAS_COL.join("','") + "')");
  check(cols.length >= 30, 'Se han encontrado las columnas de medida (' + cols.length + ')', '');
  cols.forEach(function (c) {
    check(c.tipo === 'decimal' && c.scale >= 2, 'Columna ' + c.tabla + '.' + c.col + ' admite decimales', c.tipo + '(' + c.precision + ',' + c.scale + ')');
  });
  var params = await q("select o.name sp, p.name param, ty.name tipo from sys.parameters p join sys.objects o on o.object_id = p.object_id " +
    "join sys.types ty on ty.user_type_id = p.user_type_id where o.type = 'P' and o.name like '%cola_tipo_[1-7]_add' and o.name not like 'dev[_]%' " +
    "and p.name in ('@" + MEDIDAS_COL.join("','@") + "','@PJ_AnchoLamaTerminada')");
  params = params.filter(function (p) { return /^(sp_)?sol_(temp_)?(pedidos|presupuestos)_cola_tipo_[1-467]_add$/i.test(p.sp); });
  var malos = params.filter(function (p) { return p.tipo !== 'decimal'; });
  check(malos.length === 0, 'Ningún SP de alta recibe medidas como entero (' + params.length + ' parámetros revisados)', malos.map(function (p) { return p.sp + ' ' + p.param + ' ' + p.tipo; }).join('; '));
  var at = await q("select ty.name tipo from sys.parameters p join sys.types ty on ty.user_type_id = p.user_type_id where p.object_id = object_id('dbo.sp_tarifas_calculate_prices3_AT') and p.name = '@ancholama'");
  check(at[0] && at[0].tipo === 'decimal', 'sp_tarifas_calculate_prices3_AT recibe el ancho de lama del panel con decimales', at[0] && at[0].tipo);
  var t2 = await q("select definition d from sys.sql_modules where object_id = object_id('dbo.temp_sp_fabricacion_tipo_2_tarifa')");
  check(/declare @ancholama decimal/i.test(t2[0].d), 'temp_sp_fabricacion_tipo_2_tarifa guarda el ancho de lama con decimales', '');

  // sqlcmd trae QUOTED_IDENTIFIER desactivado: un script lanzado sin activarlo deja los SP distintos del resto
  var opciones = await q("select o.name from sys.sql_modules m join sys.objects o on o.object_id = m.object_id where m.uses_ansi_nulls = 0 or m.uses_quoted_identifier = 0");
  check(opciones.length === 0, 'Todos los SP y funciones tienen ANSI_NULLS y QUOTED_IDENTIFIER activados', opciones.map(function (o) { return o.name; }).join(', '));

  var txts = await q("select dbo.fn_medida_txt(150) a, dbo.fn_medida_txt(150.5) b, dbo.fn_medida_txt(45.25) c, dbo.fn_medida_txt(0) d, dbo.fn_medida_txt(null) e, dbo.fn_medida_txt(280.50) f, dbo.fn_medida_txt(1000) g");
  var tx0 = txts[0];
  check(tx0.a === '150' && tx0.b === '150,5' && tx0.c === '45,25' && tx0.d === '0' && tx0.e === null && tx0.f === '280,5' && tx0.g === '1000',
    'fn_medida_txt escribe 150 / 150,5 / 45,25 / 0 / NULL / 280,5 / 1000', JSON.stringify(tx0));

  var vistas = await q("select distinct quotename(schema_name(o.schema_id)) + '.' + quotename(o.name) v from sys.sql_expression_dependencies d join sys.objects o on o.object_id = d.referencing_id " +
    "where o.type = 'V' and (d.referenced_entity_name like '%cola_tipo_[1-7]' or d.referenced_entity_name like '%cola_lineas')");
  var rotas = [];
  for (var i = 0; i < vistas.length; i++) {
    try { await q('select top 0 * from ' + vistas[i].v); } catch (e) { rotas.push(vistas[i].v + ': ' + e.message); }
  }
  check(rotas.length === 0, 'Las ' + vistas.length + ' vistas que leen las líneas siguen funcionando', rotas.join(' | '));

  // Guardado real con decimales: cada SP de alta dentro de una transacción que se deshace
  var V = { ancho: 150.5, alto: 200.5, ancho2: 130.5, pv_ancho_1: 150.5, pv_alto_1: 200.5, pv_ancho_2: 120.5, pv_alturamin_2: 100.5, pv_alturamax_2: 200.5,
    pj_ancho_1: 150.5, pj_ancho_2: 150.5, pj_alto_1: 200.5, pj_ancholama: 50.5, pj_altolamaterminada: 200.5, pj_ancholamaterminada: 200.5 };
  var ALTAS = [
    ['presupuesto', 1, 'sp_sol_presupuestos_cola_tipo_1_add', 'SOL_PRESUPUESTOS_COLA', 'SOL_PRESUPUESTOS_COLA_TIPO_1', 'Enrollable 1x150,5x200,5'],
    ['presupuesto', 2, 'sol_presupuestos_cola_tipo_2_add', 'SOL_PRESUPUESTOS_COLA', 'SOL_PRESUPUESTOS_COLA_TIPO_2', 'P.Japones 1x150,5x200,5'],
    ['presupuesto', 3, 'sol_presupuestos_cola_tipo_3_add', 'SOL_PRESUPUESTOS_COLA', 'SOL_PRESUPUESTOS_COLA_TIPO_3', 'P.Vertical 1x150,5x200,5'],
    ['presupuesto', 4, 'sol_presupuestos_cola_tipo_4_add', 'SOL_PRESUPUESTOS_COLA', 'SOL_PRESUPUESTOS_COLA_TIPO_4', 'Compac 1x150,5x200,5'],
    ['presupuesto', 6, 'sol_presupuestos_cola_tipo_6_add', 'SOL_PRESUPUESTOS_COLA', 'SOL_PRESUPUESTOS_COLA_TIPO_6', null],
    ['pedido', 1, 'sp_sol_pedidos_cola_tipo_1_add', 'SOL_PEDIDOS_COLA', 'SOL_PEDIDOS_COLA_TIPO_1', null],
    ['pedido', 2, 'sol_pedidos_cola_tipo_2_add', 'SOL_PEDIDOS_COLA', 'SOL_PEDIDOS_COLA_TIPO_2', null],
    ['pedido', 3, 'sol_pedidos_cola_tipo_3_add', 'SOL_PEDIDOS_COLA', 'SOL_PEDIDOS_COLA_TIPO_3', null],
    ['pedido', 4, 'sol_pedidos_cola_tipo_4_add', 'SOL_PEDIDOS_COLA', 'SOL_PEDIDOS_COLA_TIPO_4', null],
    ['pedido', 6, 'sol_pedidos_cola_tipo_6_add', 'SOL_PEDIDOS_COLA', 'SOL_PEDIDOS_COLA_TIPO_6', null],
    ['pedido', 7, 'sol_pedidos_cola_tipo_7_add', 'SOL_PEDIDOS_COLA', 'SOL_PEDIDOS_COLA_TIPO_7', null],
    ['valoración', 1, 'sol_temp_pedidos_cola_tipo_1_add', 'temp_sol_pedidos_cola', 'temp_sol_pedidos_cola_tipo_1', null],
    ['valoración', 2, 'sol_temp_pedidos_cola_tipo_2_add', 'temp_sol_pedidos_cola', 'temp_sol_pedidos_cola_tipo_2', null],
    ['valoración', 3, 'sol_temp_pedidos_cola_tipo_3_add', 'temp_sol_pedidos_cola', 'temp_sol_pedidos_cola_tipo_3', null],
    ['valoración', 4, 'sol_temp_pedidos_cola_tipo_4_add', 'temp_sol_pedidos_cola', 'temp_sol_pedidos_cola_tipo_4', null]
  ];
  for (var a = 0; a < ALTAS.length; a++) await probarAlta(ALTAS[a], V);
}

function tipoSql(p) {
  switch (p.tipo) {
    case 'int': return sql.Int;
    case 'bigint': return sql.BigInt;
    case 'smallint': return sql.SmallInt;
    case 'bit': return sql.Bit;
    case 'decimal': case 'numeric': return sql.Decimal(p.precision, p.scale);
    case 'float': return sql.Float;
    case 'money': return sql.Money;
    case 'datetime': case 'smalldatetime': case 'date': return sql.DateTime;
    case 'nvarchar': return sql.NVarChar(p.max_length < 0 ? sql.MAX : p.max_length / 2);
    default: return sql.VarChar(p.max_length < 0 ? sql.MAX : p.max_length);
  }
}

async function probarAlta(alta, V) {
  var tipoDoc = alta[0], tipo = alta[1], sp = alta[2], cabecera = alta[3], tabla = alta[4], desc = alta[5];
  var nombre = 'Guardar ' + tipoDoc + ' tipo ' + tipo + ' con decimales (' + sp + ')';
  var params = await q("select p.name, ty.name tipo, p.max_length, p.precision, p.scale from sys.parameters p join sys.types ty on ty.user_type_id = p.user_type_id where p.object_id = object_id(@sp) order by p.parameter_id", { sp: 'dbo.' + sp });
  if (!params.length) { fallo(nombre, 'El SP no existe'); return; }
  var lineasTabla = cabecera.replace(/COLA$/i, 'COLA_LINEAS').replace(/cola$/, 'cola_lineas');
  var tx = new sql.Transaction();
  await tx.begin();
  try {
    var cab = await q('select max(idrow) id from dbo.' + cabecera, {}, new sql.Request(tx));
    var idrow = cab[0].id;
    var antes = await q('select isnull(max(id), 0) id from dbo.' + tabla, {}, new sql.Request(tx));
    var antesLin = await q('select isnull(max(id), 0) id from dbo.' + lineasTabla, {}, new sql.Request(tx));
    var r = new sql.Request(tx);
    var medidasEnviadas = {};
    params.forEach(function (p) {
      var n = p.name.substring(1), nl = n.toLowerCase(), v;
      if (nl === 'id') v = 0;
      else if (nl === 'idrow') v = idrow;
      else if (/cantidad/.test(nl)) v = 1;
      else if (nl === 'centro') v = null; // cliente_entrega tiene clave ajena y admite nulos
      else if (V[nl] !== undefined || V[n] !== undefined) { v = V[nl] !== undefined ? V[nl] : V[n]; medidasEnviadas[nl] = v; }
      else if (/^(int|bigint|smallint)$/.test(p.tipo)) v = -1;
      else if (/^(decimal|numeric|float|money)$/.test(p.tipo)) v = 0;
      else if (p.tipo === 'bit') v = 0;
      else if (/date/.test(p.tipo)) v = null;
      else v = '';
      r.input(n, tipoSql(p), v);
    });
    await r.execute(sp);
    var fila = (await q('select top 1 * from dbo.' + tabla + ' where id > @antes order by id desc', { antes: antes[0].id }, new sql.Request(tx)))[0];
    if (!fila) { fallo(nombre, 'no se ha creado ninguna fila en ' + tabla); return; }
    var malos = [];
    Object.keys(fila).forEach(function (col) {
      var cl = col.toLowerCase();
      if (medidasEnviadas[cl] !== undefined && fila[col] !== null && !igual(fila[col], medidasEnviadas[cl])) malos.push(col + '=' + fila[col] + ' (enviado ' + medidasEnviadas[cl] + ')');
    });
    var revisadas = Object.keys(fila).filter(function (col) { return medidasEnviadas[col.toLowerCase()] !== undefined; });
    check(revisadas.length > 0 && malos.length === 0, nombre + ': ' + revisadas.join(', '), revisadas.length ? malos.join('; ') : 'la tabla no tiene columnas de medida reconocibles');
    // Solo la línea común creada por esta llamada (el SP de Honeycomb de TEST no crea ninguna)
    var lin = (await q('select top 1 * from dbo.' + lineasTabla + ' where idrow = @idrow and id > @antes order by id desc', { idrow: idrow, antes: antesLin[0].id }, new sql.Request(tx)))[0];
    if (!lin) info(nombre + ': no crea línea en ' + lineasTabla, '');
    if (lin && campo(lin, 'ancho') !== undefined) {
      var la = campo(lin, 'ancho');
      check(la !== null && String(la).indexOf('.') >= 0, nombre + ': la línea común guarda el ancho con decimales', 'ancho ' + la + ', alto ' + campo(lin, 'alto'));
    }
    if (desc) {
      var d = campo(lin, 'descripcion');
      // Defecto anterior al 004 (igual en DEV): el SP calcula @descripcion pero el INSERT no la incluye.
      if (d === null && sp === 'sol_presupuestos_cola_tipo_4_add')
        aviso(nombre + ': la línea se guarda sin descripción (defecto conocido, anterior a estos cambios)',
          'El SP calcula @descripcion pero el INSERT en SOL_PRESUPUESTOS_COLA_LINEAS no incluye esa columna');
      else check(d === desc, nombre + ': descripción "' + desc + '"', 'descripción: ' + d);
    }
  } catch (e) {
    fallo(nombre, 'error al ejecutar: ' + e.message);
  } finally {
    try { await tx.rollback(); } catch (e2) { /* ya deshecha por el error */ }
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite http: el backend arrancado de verdad (puerto libre propio, no el 3001)
// ═════════════════════════════════════════════════════════════════════════════════════════════════
function peticion(port, metodo, ruta, cuerpo, crudo) {
  return new Promise(function (resolve) {
    var datos = cuerpo === undefined ? null : (crudo ? cuerpo : JSON.stringify(cuerpo));
    var req = https.request({ host: 'localhost', port: port, path: ruta, method: metodo, rejectUnauthorized: false, timeout: 60000,
      headers: datos ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(datos) } : {} }, function (res) {
      var trozos = [];
      res.on('data', function (d) { trozos.push(d); });
      res.on('end', function () {
        var texto = Buffer.concat(trozos).toString('utf8'), json = null;
        try { json = JSON.parse(texto); } catch (e) { /* no es JSON */ }
        resolve({ status: res.statusCode, texto: texto, json: json, tipo: res.headers['content-type'] || '' });
      });
    });
    req.on('error', function (e) { resolve({ status: 0, texto: e.message, json: null, tipo: '' }); });
    req.on('timeout', function () { req.destroy(new Error('timeout')); });
    if (datos) req.write(datos);
    req.end();
  });
}

function puertoLibre(p) {
  return new Promise(function (resolve) {
    var s = require('net').createServer();
    s.once('error', function () { resolve(false); });
    s.once('listening', function () { s.close(function () { resolve(true); }); });
    s.listen(p);
  });
}

async function suiteHttp() {
  var port = 3002;
  while (!(await puertoLibre(port)) && port < 3020) port++;
  var log = [];
  var srv = childProcess.spawn(process.execPath, ['server.js'], { cwd: BACKEND, env: Object.assign({}, process.env, { PORT: String(port) }) });
  srv.stdout.on('data', function (d) { log.push(d.toString()); });
  srv.stderr.on('data', function (d) { log.push(d.toString()); });
  var vivo = false;
  for (var i = 0; i < 40 && !vivo; i++) {
    await new Promise(function (r) { setTimeout(r, 500); });
    var rr = await peticion(port, 'GET', '/api');
    vivo = rr.status === 200;
  }
  if (!check(vivo, 'El backend arranca en el puerto ' + port, log.join('').slice(-500))) { srv.kill(); return; }
  // Espera a que el pool de BD esté listo
  for (var w = 0; w < 20; w++) {
    var wr = await peticion(port, 'GET', '/api/lm/limites_fabricacion?cliente=1&tipo=7');
    if (wr.status === 200) break;
    await new Promise(function (r) { setTimeout(r, 500); });
  }
  try {
    var G = function (qs) { return peticion(port, 'GET', '/api/lm/limites_fabricacion?' + qs); };
    var g = await G('cliente=1&tipo=1&subtipo=1&acc=1&tejido=59');
    check(g.status === 200 && g.json && g.json.max_ancho === 200, 'GET límites Leroy Serge Out: máx 200', g.status + ' ' + g.texto);
    g = await G('cliente=5&tipo=1&subtipo=1&acc=1&tejido=59');
    check(g.status === 200 && g.json && g.json.max_ancho === null && g.json.n_filas === 0, 'GET límites cliente 5: sin límites', g.texto);
    g = await G('tipo=1&tejido=59');
    check(g.status === 400 && g.json && g.json.message === 'Cliente no válido', 'GET sin cliente: 400', g.status + ' ' + g.texto);
    g = await G('cliente=1');
    check(g.status === 400 && g.json && g.json.message === 'Tipo de cortina no válido', 'GET sin tipo: 400', g.status + ' ' + g.texto);
    g = await G('cliente=1&tipo=1%3B%20drop%20table%20x');
    check(g.status === 400 || (g.status === 200 && g.json), 'GET con inyección en tipo: no rompe nada', g.status + ' ' + g.texto);
    g = await G('cliente=1&tipo=1&subtipo=1&acc=1&tejido=59&color=-1&modelo=-1');
    check(g.status === 200 && g.json.max_ancho === 200, 'GET con -1: se ignoran', g.texto);

    var P = function (cuerpo, crudo) { return peticion(port, 'POST', '/api/lm/calculate_prices', cuerpo, crudo); };
    var enr = function (a, h, tej) { return { TipoCortina: 1, SubTipoCortina: 1, acc_tipo_id: 1, acc_modelo_id: -1, tej_tipo_id: tej || 59, tej_color_id: -1, ancho: a, alto: h, cantidad: 1, precios: {} }; };
    var p = await P({ cliente: 1, referencia: 'BANCO_MEDIDAS', lineas: [enr(210, 150)] });
    check(p.json && p.json.message === 'KO_MEDIDAS' && /210 cm\) supera el máximo de fabricación \(200 cm\)/.test(p.json.error), 'Valorar Leroy Serge 210: KO_MEDIDAS', p.texto);
    p = await P({ cliente: 1, referencia: 'BANCO_MEDIDAS', lineas: [enr(150.3, 150)] });
    check(p.json && p.json.message === 'KO_MEDIDAS' && /0,5 en 0,5/.test(p.json.error), 'Valorar 150,3: KO_MEDIDAS por el paso', p.texto);
    p = await P({ referencia: 'BANCO_MEDIDAS', lineas: [enr(150, 150)] });
    check(p.json && p.json.message === 'KO_MEDIDAS' && /cliente/.test(p.json.error), 'Valorar sin cliente: KO_MEDIDAS', p.texto);
    p = await P({ cliente: 1, lineas: [null] });
    check(p.json && p.json.message === 'KO_MEDIDAS', 'Valorar con línea null: respuesta controlada', p.texto);
    p = await P({ cliente: 1 });
    check(p.json && p.json.message === 'KO_MEDIDAS', 'Valorar sin líneas: respuesta controlada', p.texto);
    p = await P('{"cliente":1,', true);
    check(p.status === 400 && p.json && p.json.error === 'Petición no válida' && !/<html/i.test(p.texto), 'JSON mal formado: 400 en JSON, sin traza', p.status + ' ' + p.texto.slice(0, 120));
    p = await P({ cliente: 1, referencia: 'BANCO_MEDIDAS', lineas: [enr(150, 150), enr(290, 150)] });
    check(p.json && p.json.message === 'KO_MEDIDAS' && /290/.test(p.json.error), 'Valorar 2 líneas con la segunda mal: KO_MEDIDAS', p.texto);

    // Valoraciones que pasan: se guardan con decimales en las tablas temporales
    var buenos = [
      ['enrollable Leroy 150,5 × 200,5', enr(150.5, 200.5, 48), 'temp_sol_pedidos_cola_tipo_1', { ancho: 150.5, alto: 200.5 }],
      ['enrollable sin precios (antes tumbaba el servidor)', (function () { var l = enr(150.5, 200.5, 48); delete l.precios; return l; })(), 'temp_sol_pedidos_cola_tipo_1', { ancho: 150.5 }],
      ['panel mecanismo + tejido 150,5 × 200,5', { TipoCortina: 2, PJ_TipoJapones: 1, PJ_tejidos_id: -1, PJ_Ancho_1: 150.5, PJ_Ancho_2: 150.5, PJ_Alto_1: 200.5, PJ_Cantidad_1: 1, precios: {} }, 'temp_sol_pedidos_cola_tipo_2', { PJ_Ancho_2: 150.5, PJ_Alto_1: 200.5 }],
      ['panel solo tejido lama 60,5', { TipoCortina: 2, PJ_TipoJapones: 2, PJ_tejidos_id: -1, PJ_AnchoLama: 60.5, PJ_AltoLamaTerminada: 200.5, PJ_NumeroLamas: 2, precios: {} }, 'temp_sol_pedidos_cola_tipo_2', { PJ_AnchoLama: 60.5, PJ_AltoLamaTerminada: 200.5 }],
      ['vertical 150,5 × 200,5', { TipoCortina: 3, PV_SEL_1: true, TipoVertical: 1, PV_Ancho_1: 150.5, PV_Alto_1: 200.5, PV_Cantidad_1: 1, precios: {} }, 'temp_sol_pedidos_cola_tipo_3', { PV_Ancho_1: 150.5, PV_Alto_1: 200.5 }],
      ['vertical inclinada 150,5 / 100,5 / 200,5', { TipoCortina: 3, PV_SEL_2: true, PV_Ancho_2: 150.5, PV_AlturaMin_2: 100.5, PV_AlturaMax_2: 200.5, PV_Cantidad_2: 1, precios: {} }, 'temp_sol_pedidos_cola_tipo_3', { PV_Ancho_2: 150.5, PV_AlturaMin_2: 100.5, PV_AlturaMax_2: 200.5 }],
      ['compac 100,5 × 150,5', { TipoCortina: 4, junquillo: 'JC', com_tej_tipo_id: -1, ancho: 100.5, ancho2: -1, alto: 150.5, cantidad: 1, precios: {} }, 'temp_sol_pedidos_cola_tipo_4', { ancho: 100.5, alto: 150.5 }],
      ['compac junquillo redondeado 100,5 / 110,5', { TipoCortina: 4, junquillo: 'JR', com_tej_tipo_id: -1, ancho: 100.5, ancho2: 110.5, alto: 150.5, cantidad: 1, precios: {} }, 'temp_sol_pedidos_cola_tipo_4', { ancho: 100.5, ancho2: 110.5 }]
    ];
    for (var b = 0; b < buenos.length; b++) {
      var rb = await P({ cliente: 1, referencia: 'BANCO_MEDIDAS', lineas: [buenos[b][1]] });
      if (!check(rb.json && rb.json.message === 'OK' && rb.json.idLinea > 0, 'Valorar ' + buenos[b][0] + ': OK', rb.status + ' ' + rb.texto.slice(0, 200))) continue;
      var fila = (await q('select * from dbo.' + buenos[b][2] + ' where id = @id', { id: rb.json.idLinea }))[0];
      var esp = buenos[b][3], mal = [];
      Object.keys(esp).forEach(function (k) { if (!fila || !igual(fila[k], esp[k])) mal.push(k + '=' + (fila ? fila[k] : '?') + ' (esperado ' + esp[k] + ')'); });
      check(mal.length === 0, 'Valorar ' + buenos[b][0] + ': guardado con decimales', mal.join('; '));
    }
    // Guardar pedido/presupuesto vuelve a validar y no crea nada si una medida no es fabricable
    var cuenta = async function () {
      var r = await q('select (select max(idrow) from dbo.SOL_PEDIDOS_COLA) ped, (select max(idrow) from dbo.SOL_PRESUPUESTOS_COLA) pre');
      return r[0];
    };
    var guardados = [
      ['pedido', '/api/lm/bestellungen_hinzu2/1/BANCO_MEDIDAS'], ['pedido (v1)', '/api/lm/bestellungen_hinzu/1'],
      ['presupuesto', '/api/lm/budget_hinzu2/1/BANCO_MEDIDAS'], ['presupuesto (v1)', '/api/lm/budget_hinzu/1']
    ];
    var malas = [
      ['enrollable Serge 210', [enr(210, 150)], 'supera el máximo de fabricación (200 cm)'],
      ['Honeycomb 135', [{ TipoCortina: 7, ancho: 135, alto: 100, cantidad: 1, precios: {} }], 'supera el máximo de fabricación (130 cm)'],
      ['buena + mala', [enr(150, 150), enr(150.3, 150)], '0,5 en 0,5']
    ];
    var antesG = await cuenta();
    for (var gi = 0; gi < guardados.length; gi++) {
      for (var mi = 0; mi < malas.length; mi++) {
        var rg = await peticion(port, 'POST', guardados[gi][1], malas[mi][1]);
        check(rg.json && rg.json.message === 'KO_MEDIDAS' && rg.json.error.indexOf(malas[mi][2]) >= 0,
          'Guardar ' + guardados[gi][0] + ' con ' + malas[mi][0] + ': KO_MEDIDAS', rg.status + ' ' + rg.texto.slice(0, 200));
      }
    }
    var despuesG = await cuenta();
    check(despuesG.ped === antesG.ped && despuesG.pre === antesG.pre, 'Un guardado rechazado no crea cabecera de pedido ni de presupuesto',
      'pedidos ' + antesG.ped + '→' + despuesG.ped + ', presupuestos ' + antesG.pre + '→' + despuesG.pre);

    var vivoFin = await peticion(port, 'GET', '/api');
    check(vivoFin.status === 200, 'El backend sigue vivo después de todas las peticiones', vivoFin.status + ' ' + vivoFin.texto);
    var caidas = log.join('').match(/uncaughtException[^\n]*/g) || [];
    if (caidas.length) aviso('Errores no capturados registrados durante la suite (el servidor siguió vivo)', caidas.join(' | ').slice(0, 500));
    else ok('Sin errores no capturados durante la suite');
  } finally {
    srv.kill();
  }
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite frontend: el helper de la pantalla da exactamente lo mismo que el servidor
// ═════════════════════════════════════════════════════════════════════════════════════════════════
function cargarHelperFrontend() {
  var ts = require(path.join(RAIZ, 'frontend', 'node_modules', 'typescript'));
  var fuente = fs.readFileSync(path.join(RAIZ, 'frontend', 'src', 'app', 'manza', 'config', 'MedidasFabricacion.ts'), 'utf8');
  var js = ts.transpileModule(fuente, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
  var mod = { exports: {} };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, function (m) { if (m === './smapi.service') return {}; return require(m); });
  return mod.exports.MedidasFabricacion;
}

async function suiteFrontend() {
  var MF = cargarHelperFrontend();
  var limites = [
    { min_ancho: 60, max_ancho: 280, min_alto: 60, max_alto: 300, origen_max_ancho: 'X' },
    { min_ancho: 60, max_ancho: 183, min_alto: 60, max_alto: 300, origen_max_ancho: 'COLOR' },
    { min_ancho: null, max_ancho: null, min_alto: 100, max_alto: 300, origen_max_ancho: null },
    { min_ancho: 100, max_ancho: 280, min_alto: null, max_alto: null, origen_max_ancho: 'X' },
    { min_ancho: null, max_ancho: null, min_alto: null, max_alto: null, origen_max_ancho: null }
  ];
  var vals = ['', null, 0, -1, 1, '150,5', 59.5, 60, 60.5, 100, 150.3, 150.25, 150.5, 183, 183.5, 200, 279.5, 280, 280.5, 300, 300.5, 400, '150.5', 'abc'];
  var m = new MF({}, function () { return 1; });
  var n = 0, malos = [];
  limites.forEach(function (l) {
    m.lim = Object.assign({ origen_min_ancho: null, n_filas: 1 }, l);
    vals.forEach(function (a) {
      vals.forEach(function (h) {
        ['El alto', 'La altura mínima'].forEach(function (et) {
          var back = Medidas.validarMedidas(l, a, h, et === 'El alto' ? undefined : et);
          var front = m.comprobar(a, h, et);
          n++;
          if ((back || '') !== front.mensaje || front.ok !== (back === null)) malos.push(JSON.stringify([limTxt(l), a, h, et]) + ' → servidor: ' + back + ' | pantalla: ' + front.mensaje);
        });
      });
    });
  });
  check(malos.length === 0, 'Pantalla y servidor dan el mismo veredicto y el mismo mensaje en ' + (n - malos.length) + ' de ' + n + ' casos', malos.slice(0, 15).join('\n'));

  // validar() deja el estado coherente con comprobar()
  m.lim = Object.assign({ origen_min_ancho: null, n_filas: 1 }, limites[0]);
  var okv = m.validar(290, 50);
  check(!okv && m.anchoInvalido && m.altoInvalido && /290 cm\) supera/.test(m.mensaje), 'validar() marca ancho y alto y muestra el primer mensaje', JSON.stringify(m));
  m.validar(150, 150);
  check(!m.anchoInvalido && !m.altoInvalido && m.mensaje === '', 'validar() limpia el estado con medidas buenas', JSON.stringify(m));

  // cargar(): envía el cliente, ignora respuestas que llegan tarde y revalida al recibir los límites
  var pendientes = [], pedidos = [];
  var servicio = { getLimitesFabricacion: function (p) { pedidos.push(p); return { subscribe: function (fnOk) { pendientes.push(fnOk); } }; } };
  var cliente = '1';
  var h = new MF(servicio, function () { return cliente; });
  h.cargar({ tipo: 1, tejido: 59 }, function () { return { ancho: 210, alto: 150 }; });
  check(pedidos[0] && pedidos[0].cliente === '1' && pedidos[0].tipo === 1, 'cargar() pide los límites con el cliente del componente', JSON.stringify(pedidos[0]));
  cliente = '5';
  h.cargar({ tipo: 1, tejido: 59 }, function () { return { ancho: 210, alto: 150 }; });
  check(pedidos[1] && pedidos[1].cliente === '5', 'cargar() lee el cliente en cada petición', JSON.stringify(pedidos[1]));
  pendientes[1]({ min_ancho: null, max_ancho: null, min_alto: null, max_alto: null, n_filas: 0 });
  pendientes[0]({ min_ancho: 60, max_ancho: 200, min_alto: 60, max_alto: 300, n_filas: 2 });
  check(h.lim.max_ancho === null && !h.anchoInvalido, 'cargar() ignora una respuesta antigua que llega tarde', JSON.stringify(h.lim));
  var h2 = new MF(servicio, function () { return 1; });
  h2.cargar({ tipo: 1 }, function () { return { ancho: 210, alto: 150 }; });
  pendientes[pendientes.length - 1]({ min_ancho: 60, max_ancho: 200, min_alto: 60, max_alto: 300, n_filas: 2 });
  check(h2.anchoInvalido && /210/.test(h2.mensaje), 'cargar() revalida lo ya escrito al llegar los límites', JSON.stringify(h2));
  h2.reset();
  check(h2.lim.max_ancho === null && !h2.anchoInvalido && h2.mensaje === '', 'reset() deja el helper sin límites ni avisos', JSON.stringify(h2));
  check(h2.rangoAncho === '' && (function () { h2.lim.min_ancho = 60; h2.lim.max_ancho = 280; return h2.rangoAncho === '60-280 cm'; })() &&
    (function () { h2.lim.min_ancho = null; return h2.rangoAncho === 'hasta 280 cm'; })() && (function () { h2.lim.min_ancho = 60; h2.lim.max_ancho = null; return h2.rangoAncho === 'desde 60 cm'; })(),
    'Textos de rango: "", "60-280 cm", "hasta 280 cm", "desde 60 cm"', '');
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite estatico: revisión del código (lo que no se ve ejecutando)
// ═════════════════════════════════════════════════════════════════════════════════════════════════
function leer(rel) { return fs.readFileSync(path.join(RAIZ, rel), 'utf8'); }
function recorrer(dir, ext, acc) {
  acc = acc || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    if (d.name === 'node_modules' || d.name.startsWith('.')) return;
    var p = path.join(dir, d.name);
    if (d.isDirectory()) recorrer(p, ext, acc);
    else if (ext.test(d.name)) acc.push(p);
  });
  return acc;
}

async function suiteEstatico() {
  var medidasNombres = "(ancho2?|alto|PJ_Ancho_[12]|PJ_Alto_1|PJ_AnchoLama|PJ_AltoLamaTerminada|PJ_AnchoLamaTerminada|PV_Ancho_[12]|PV_Alto_1|PV_AlturaM(?:in|ax)_2)";
  ['backend/controllers/sm/lm/bestellungen_tarifas.js', 'backend/controllers/sm/lm/bestellungen.js', 'backend/controllers/sm/lm/budget.js'].forEach(function (f) {
    var s = leer(f);
    var malos = s.split('\n').filter(function (l) { return new RegExp("request\\.input\\('" + medidasNombres + "',\\s*sql\\.Int").test(l); });
    check(malos.length === 0, f + ': ninguna medida se envía como entero', malos.map(function (l) { return l.trim(); }).join(' | '));
    var bucles = (s.match(/for \(var i=0, len = jsonIN\.length/g) || []).length;
    var protegidos = (s.match(/jsonIN\[i\]\.precios = jsonIN\[i\]\.precios \|\| \{\}/g) || []).length;
    check(bucles === protegidos && bucles > 0, f + ': los ' + bucles + ' bucles de alta están protegidos', protegidos + ' protegidos de ' + bucles);
    var recs = (s.match(/if \(recordsets\.returnValue\)/g) || []).length;
    var guardas = (s.match(/if \(!recordsets\) \{/g) || []).length;
    check(recs === guardas, f + ': las ' + recs + ' respuestas de cabecera comprueban que haya resultado', guardas + ' de ' + recs);
  });
  var bt = leer('backend/controllers/sm/lm/bestellungen_tarifas.js');
  check(/Medidas\.validarLineas\(data\.lineas, data\.cliente\)/.test(bt), 'calculate_prices valida las medidas con el cliente antes de valorar', '');

  var srv = leer('backend/server.js');
  check(/process\.on\('uncaughtException'/.test(srv) && /process\.on\('unhandledRejection'/.test(srv), 'server.js registra los errores no capturados', '');
  check(/httpsServer\.on\('error'[\s\S]{0,200}process\.exit\(1\)/.test(srv), 'server.js sale si no puede escuchar', '');
  check(/app\.use\(function\(err, req, res, next\)/.test(srv), 'server.js responde los errores de ruta en JSON', '');
  check(/process\.env\.DB_NAME/.test(srv), 'server.js toma la BD de la configuración', '');

  var rutas = leer('backend/routes/link_routes.js');
  check(/limites_fabricacion/.test(rutas), 'La ruta /api/lm/limites_fabricacion está registrada', '');

  var restos = [];
  recorrer(path.join(RAIZ, 'backend', 'controllers'), /\.js$/).concat(recorrer(path.join(RAIZ, 'backend', 'routes'), /\.js$/)).forEach(function (f) {
    var s = fs.readFileSync(f, 'utf8');
    if (/\[solarmanes_dev\]\./i.test(s)) restos.push(path.relative(RAIZ, f) + ' (prefijo SOLARMANES_DEV)');
    if (/tarifa_limites/.test(s)) restos.push(path.relative(RAIZ, f) + ' (tarifa_limites)');
  });
  recorrer(path.join(RAIZ, 'frontend', 'src', 'app', 'manza'), /\.ts$/).forEach(function (f) {
    var s = fs.readFileSync(f, 'utf8');
    if (/getTarifaLimites|tarifaMax|tarifaMin/.test(s)) restos.push(path.relative(RAIZ, f) + ' (límites sacados de la tarifa)');
  });
  check(restos.length === 0, 'No quedan prefijos SOLARMANES_DEV ni límites sacados de la tarifa', restos.join('; '));

  var componentes = ['enrollable', 'compac', 'japones', 'vertical', 'honeycomb'];
  componentes.forEach(function (c) {
    var ts = leer('frontend/src/app/manza/' + c + '/' + c + '.component.ts');
    var instancias = (ts.match(/new MedidasFabricacion\(this\.\w+/g) || []).length;
    var conCliente = (ts.match(/new MedidasFabricacion\(this\.\w+, \(\) => this\.Cliente\)/g) || []).length;
    check(instancias > 0 && instancias === conCliente, c + ': el helper de límites recibe el cliente', conCliente + ' de ' + instancias);
    check(/@Input\(\) *Cliente/.test(ts), c + ': recibe el cliente del configurador', '');
    // Tras "Agregar" se llama a reset(): si no recarga los límites, la siguiente cortina se valida con los de la anterior
    var mr = /\n\s*reset\(\): void \{([\s\S]*?)\n   \}/.exec(ts);
    if (mr && c !== 'honeycomb')
      check(/load_LimitesFabricacion\(\)/.test(mr[1]), c + ': reset() vuelve a pedir los límites', 'reset() deja los límites de la cortina anterior');
    var html = leer('frontend/src/app/manza/' + c + '/' + c + '.component.html');
    var inputs = html.match(/<input\b[^>]*>/g) || [];
    var deMedida = inputs.filter(function (i) { return /\[\(ngModel\)\]="(Ancho|Alto|compac\.PC_AnchoB|PJ_Ancho_[12]|PJ_Alto_1|PJ_AnchoLama|PJ_AltoLamaTerminada|PV_Ancho_[12]|PV_Alto_1|PV_AlturaMin_2|PV_AlturaMax_2|model\.Ancho|model\.Alto)"/.test(i); });
    var malos = deMedida.filter(function (i) {
      var md = /\[appMaxdigits\]="(\d+)"/.exec(i);
      return !/step="0?\.5"/.test(i) || (md && +md[1] < 5);
    });
    check(deMedida.length > 0 && malos.length === 0, c + ': los ' + deMedida.length + ' campos de medida admiten medios centímetros', malos.map(function (i) { return (/ngModel\)\]="([^"]+)"/.exec(i) || [])[1]; }).join(', '));
    // PJ_Ancho_1 (ancho portatelas) no lo escribe el usuario: se calcula a partir del ancho del mecanismo y las vías
    var sinLimites = deMedida.filter(function (i) { return !/\[attr\.max\]="[^"]*medidas\w*\.lim\.max/.test(i) && !/ngModel\)\]="PJ_Ancho_1"/.test(i); });
    if (sinLimites.length) info(c + ': campos de medida sin máximo dinámico en el HTML', sinLimites.map(function (i) { return (/ngModel\)\]="([^"]+)"/.exec(i) || [])[1]; }).join(', '));
  });
  var cfg = leer('frontend/src/app/manza/config/config.component.html');
  check(!/TipoCortina\s*==\s*6/.test(cfg), 'El configurador no ofrece Panel ZIP (tipo 6), que no tiene límites', 'aparece TipoCortina == 6');

  var gi = leer('.gitignore');
  check(/^\.env\s*$/m.test(gi) || /^backend\/\.env\s*$/m.test(gi), '.env está en .gitignore', '');
  var tracked = '';
  try { tracked = childProcess.execSync('git ls-files backend/.env', { cwd: RAIZ }).toString().trim(); } catch (e) { /* sin git */ }
  check(tracked === '', 'backend/.env no está en git', tracked);
  var conClave = /DB_PASSWORD\s*\|\|\s*'[^']+'/.test(srv);
  if (conClave) aviso('server.js lleva la contraseña de la BD escrita como valor por defecto', 'Está también en el historial de git: quitarla y cambiar la contraseña');
  else ok('server.js no lleva la contraseña de la BD escrita');
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
// Suite tarifas: lo que Leroy puede fabricar, ¿tiene precio?
// ═════════════════════════════════════════════════════════════════════════════════════════════════
async function suiteTarifas(O) {
  var texto = fs.readFileSync(path.join(RAIZ, 'sqlMedidas', '003_auditoria_tarifas_vs_fabricacion.sql'), 'utf8').replace(/^SET NOCOUNT ON;\s*$/m, '');
  var filas = await q(texto);
  var leroy = filas.filter(function (f) { return f.cliente === 1; });
  info('Tarifas de enrollable de Leroy revisadas', String(leroy.length));
  var huecos = leroy.filter(function (f) { return f.sin_precio_ancho || f.sin_precio_alto; });
  check(huecos.length === 0, 'Toda medida fabricable de Leroy cae dentro de su tarifa (ancho y alto)',
    huecos.map(function (f) { return f.tarifa + ' ' + f.tejido_base + ' ' + f.sin_precio_ancho + ' ' + f.sin_precio_alto; }).join('; '));
  // Duplicadas con la misma clave con la que sp_tarifas_calculate_prices3_AT elige la tarifa de enrollable
  // (cliente, tejido, marca 55 o 1, impresión): el SP hace "select @idrow = idrow" y se queda con la última que lee.
  var dups = await q("with t as (select a.idrow, a.tejidos, a.marcas, a.impresion, " +
    "(select count(*) from dbo.sol_articulos_tarifas_lineas l where l.idrow = a.idrow and l.x > 0 and l.y > 0 and isnull(l.v1, '') <> '') con_precio " +
    "from dbo.sol_articulos_tarifas a where a.clientes = 1 and a.producto = 1 and a.marcas in (1, 55)) " +
    "select tejidos, marcas, impresion, string_agg(cast(idrow as varchar), ',') idrows, string_agg(cast(con_precio as varchar), ',') con_precio " +
    "from t group by tejidos, marcas, impresion having count(*) > 1");
  if (dups.length) aviso(dups.length + ' combinaciones de enrollable de Leroy tienen más de una tarifa: el precio depende del orden en que SQL lea las filas',
    dups.map(function (d) { return 'tejido ' + d.tejidos + ' marca ' + d.marcas + ' impresión ' + d.impresion + ': tarifas ' + d.idrows + ' (celdas con precio ' + d.con_precio + ')'; }).join('; '));
  else ok('Cada combinación de enrollable de Leroy tiene una sola tarifa');
  var vacia = await q("select t.idrow, t.codigo from dbo.sol_articulos_tarifas t where t.clientes = 1 and t.producto = 1 " +
    "and not exists (select 1 from dbo.sol_articulos_tarifas_lineas l where l.idrow = t.idrow and l.x > 0 and l.y > 0 and isnull(l.v1, '') <> '')");
  if (vacia.length) aviso(vacia.length + ' tarifas de enrollable de Leroy no tienen ningún precio', vacia.map(function (v) { return v.idrow + ' (Número ' + v.codigo + ')'; }).join(', '));
  else ok('Ninguna tarifa de enrollable de Leroy está vacía');
  // Precio real en las cuatro esquinas de lo fabricable, con el mismo SP que usa la valoración.
  // El SP escribe un log en "messages" y desactiva promociones caducadas: todo va en una transacción que se deshace.
  var txp = new sql.Transaction();
  await txp.begin();
  try {
  var catImp = await q("select tejido, max(impresion) impresion from dbo.SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS where cliente = 1 and producto = 1 group by tejido", {}, new sql.Request(txp));
  var nPrecio = 0, sinPrecio = [];
  for (var i = 0; i < catImp.length; i++) {
    var sistemas = [{ marca: 1, acc: 1, n: 'cadena' }, { marca: 55, acc: 16, n: 'Magic' }];
    for (var s = 0; s < sistemas.length; s++) {
      var lim = O.esperado({ cliente: 1, tipo: 1, subtipo: 1, acc: sistemas[s].acc, tejido: catImp[i].tejido });
      var esquinas = [[lim.min_ancho, lim.min_alto], [lim.max_ancho, lim.max_alto], [lim.min_ancho, lim.max_alto], [lim.max_ancho, lim.min_alto], [mitad(lim.min_ancho, lim.max_ancho), mitad(lim.min_alto, lim.max_alto)]];
      var imps = catImp[i].impresion ? [0, 1] : [0];
      for (var m = 0; m < imps.length; m++) {
        for (var e = 0; e < esquinas.length; e++) {
          var r = new sql.Request(txp);
          r.input('clientes', sql.Int, 1); r.input('tubos', sql.Int, -1); r.input('tejidos', sql.Int, catImp[i].tejido);
          r.input('marcas', sql.Int, sistemas[s].marca); r.input('Ancho', sql.Decimal(12, 2), esquinas[e][0] / 100);
          r.input('Alto', sql.Decimal(12, 2), esquinas[e][1] / 100); r.input('impresion', sql.Int, imps[m]);
          r.input('ancholama', sql.Decimal(12, 2), -1); r.input('producto', sql.Int, 1); r.input('centro', sql.Int, -1);
          r.input('cantidad', sql.Int, 1); r.input('subproducto', sql.Int, 1);
          r.output('v1', sql.Decimal(12, 2)); r.output('v2', sql.VarChar(255)); r.output('v3', sql.Decimal(12, 2));
          var out = (await r.execute('sp_tarifas_calculate_prices3_AT')).output;
          nPrecio++;
          if (!(Number(out.v1) > 0)) sinPrecio.push(sistemas[s].n + ' tejido ' + catImp[i].tejido + (imps[m] ? ' ID' : '') + ' ' + esquinas[e].join('×') + ' → ' + out.v1 + ' ' + (out.v2 || ''));
        }
      }
    }
  }
  } finally {
    await txp.rollback();
  }
  check(sinPrecio.length === 0, 'Leroy enrollable: hay precio en las esquinas de lo fabricable (' + (nPrecio - sinPrecio.length) + ' de ' + nPrecio + ')',
    sinPrecio.slice(0, 25).join('; ') + (sinPrecio.length > 25 ? ' … (' + sinPrecio.length + ' en total)' : ''));

  var vacias = leroy.filter(function (f) { return f.celdas_vacias > 0; });
  if (vacias.length) aviso(vacias.length + ' tarifas de Leroy tienen celdas vacías en medidas fabricables (aproximado)',
    vacias.slice(0, 12).map(function (f) { return f.tarifa + ' ' + f.tejido_base + ' (' + f.celdas_vacias + ')'; }).join('; ') + (vacias.length > 12 ? '…' : ''));
  else ok('Sin celdas vacías en medidas fabricables de Leroy');
}

// ═════════════════════════════════════════════════════════════════════════════════════════════════
var SUITES = [
  ['excel', 'Excel de fabricación (fuente de verdad)', suiteExcel],
  ['datos', 'Tabla de límites frente al Excel y al catálogo de Leroy', suiteDatos],
  ['funcion', 'fn_limites_fabricacion: cada combinación y cada color', suiteFuncion],
  ['validacion', 'Validación del servidor en los bordes de cada límite', suiteValidacion],
  ['esquema', 'Decimales: tablas, SP y guardado real (con rollback)', suiteEsquema],
  ['http', 'Backend arrancado: endpoints, valoración y robustez', suiteHttp],
  ['frontend', 'Helper de pantalla frente al servidor', suiteFrontend],
  ['estatico', 'Revisión del código', suiteEstatico],
  ['tarifas', 'Tarifas de Leroy frente a lo fabricable', suiteTarifas]
];

async function main() {
  var t0 = Date.now();
  if (!/TEST/i.test(CONFIG.database || '') && !ARGS.forzar) {
    console.error('El banco solo se ejecuta contra una BD de TEST (DB_NAME=' + CONFIG.database + '). Usa --forzar si sabes lo que haces.');
    process.exit(2);
  }
  console.log('Banco de pruebas de medidas · BD ' + CONFIG.database + ' en ' + CONFIG.server);
  await sql.connect(CONFIG);
  var O = Oraculo.crear(EXCEL);
  await cargarCatalogo();
  var solo = ARGS.solo ? String(ARGS.solo).split(',') : null;
  for (var i = 0; i < SUITES.length; i++) {
    if (solo && solo.indexOf(SUITES[i][0]) < 0) continue;
    suite = SUITES[i][1];
    var ts = Date.now();
    process.stdout.write('· ' + suite + ' … ');
    try { await SUITES[i][2](O); } catch (e) { fallo('La suite terminó con un error', e.stack); }
    var mias = RES.filter(function (r) { return r.suite === suite; });
    console.log(mias.filter(function (r) { return r.estado === 'FALLO'; }).length ? 'con fallos' : 'bien', '(' + ((Date.now() - ts) / 1000).toFixed(1) + ' s)');
  }
  await sql.close();
  informe((Date.now() - t0) / 1000);
}

function informe(seg) {
  var cuenta = function (s, e) { return RES.filter(function (r) { return (!s || r.suite === s) && r.estado === e; }).length; };
  var lineas = [];
  lineas.push('# Banco de pruebas de medidas de fabricación');
  lineas.push('');
  lineas.push('BD `' + CONFIG.database + '` · ' + new Date().toISOString().replace('T', ' ').slice(0, 19) + ' · ' + seg.toFixed(0) + ' s · casos de validación en bordes: ' + (nVal.ok + nVal.mal));
  lineas.push('');
  lineas.push('| Suite | OK | FALLO | AVISO | INFO |');
  lineas.push('|---|---|---|---|---|');
  SUITES.forEach(function (s) {
    if (!RES.some(function (r) { return r.suite === s[1]; })) return;
    lineas.push('| ' + s[1] + ' | ' + cuenta(s[1], 'OK') + ' | ' + cuenta(s[1], 'FALLO') + ' | ' + cuenta(s[1], 'AVISO') + ' | ' + cuenta(s[1], 'INFO') + ' |');
  });
  lineas.push('| **Total** | ' + cuenta(null, 'OK') + ' | ' + cuenta(null, 'FALLO') + ' | ' + cuenta(null, 'AVISO') + ' | ' + cuenta(null, 'INFO') + ' |');
  ['FALLO', 'AVISO', 'INFO'].concat(ARGS.detalle ? ['OK'] : []).forEach(function (e) {
    var rs = RES.filter(function (r) { return r.estado === e; });
    if (!rs.length) return;
    lineas.push('');
    lineas.push('## ' + { FALLO: 'Fallos', AVISO: 'Avisos', INFO: 'Información', OK: 'Correctos' }[e] + ' (' + rs.length + ')');
    var porSuite = {};
    rs.forEach(function (r) { (porSuite[r.suite] = porSuite[r.suite] || []).push(r); });
    Object.keys(porSuite).forEach(function (s) {
      lineas.push('');
      lineas.push('**' + s + '**');
      porSuite[s].forEach(function (r) { lineas.push('- ' + r.nombre + (r.detalle ? ' — ' + String(r.detalle).replace(/\n/g, ' / ') : '')); });
    });
  });
  var md = lineas.join('\n') + '\n';
  if (ARGS.informe) fs.writeFileSync(ARGS.informe, md, 'utf8');
  console.log('\n' + md);
  process.exitCode = cuenta(null, 'FALLO') ? 1 : 0;
}

main().catch(function (e) { console.error(e); process.exit(3); });
