'use strict'

/*
 * Entorno de los tests: conexión a la BD del backend, transacciones y llamadas
 * a los controladores reales.
 *
 * - La configuración de BD sale de backend/server.js (var config = {...}); si
 *   existe backend/.env se carga antes, igual que hace el servidor. No se muestra.
 * - Solo se ejecuta contra bases *_DEV o *_TEST (salvo --bd=NOMBRE).
 * - enTransaccion(fn): todo lo que se ejecuta dentro (SQL de los tests y los
 *   controladores del backend, que usan sql.connect() / new sql.Request()) va a
 *   una transacción que se deshace al terminar: la BD queda como estaba, incluidos
 *   los efectos de sp_pedidos_cola_add (sp_refabrica_top_20, presupuestos...).
 *   Las peticiones se encolan: una transacción no admite dos a la vez y algunos
 *   controladores lanzan varias sin esperar (bestellungen: una por línea).
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

const BACKEND = path.resolve(__dirname, '..', '..', '..');
const RAIZ = path.resolve(BACKEND, '..');
const FRONTEND = path.join(RAIZ, 'frontend');
const sql = require(path.join(BACKEND, 'node_modules', 'mssql'));

let poolLibre = null;
let txActual = null;
let cola = Promise.resolve();
let pendientes = 0;
let carpetaTemporal = null;

function cargarEnv() {
  const fichero = path.join(BACKEND, '.env');
  if (!fs.existsSync(fichero)) return;
  fs.readFileSync(fichero, 'utf8').split(/\r?\n/).forEach(linea => {
    const m = linea.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && m[2] !== '' && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  });
}

function configBD() {
  cargarEnv();
  const fuente = fs.readFileSync(path.join(BACKEND, 'server.js'), 'utf8');
  const m = fuente.match(/var config = (\{[\s\S]*?\n\};?)/);
  if (!m) {
    throw new Error('No se encuentra "var config = {...}" en backend/server.js');
  }
  const config = (new Function('process', 'return (' + m[1].replace(/;\s*$/, '') + ')'))(process);
  /* sp_pedidos_cola_add regenera los 20 últimos pedidos: más de los 15 s por defecto */
  config.requestTimeout = 600000;
  return config;
}

/* Request que, si no se le da otra, usa la transacción en curso (o el pool) y se encola */
class RequestTest extends sql.Request {
  constructor(padre) {
    super(padre || txActual || poolLibre);
  }

  enCola(fn, callback) {
    pendientes++;
    const promesa = cola.then(fn);
    cola = promesa.then(() => { pendientes--; }, () => { pendientes--; });
    if (typeof callback === 'function') {
      promesa.then(r => callback(null, r), e => callback(e));
      return this;
    }
    return promesa;
  }

  execute(procedimiento, callback) { return this.enCola(() => super.execute(procedimiento), callback); }
  query(comando, callback) { return this.enCola(() => super.query(comando), callback); }
  batch(comando, callback) { return this.enCola(() => super.batch(comando), callback); }
}

async function conectar(opciones) {
  const config = configBD();
  const bd = String(config.database || '');
  if (!/_(DEV|TEST)$/i.test(bd) && bd !== opciones.bd) {
    throw new Error('La BD configurada es "' + bd + '". Los tests solo se ejecutan contra bases *_DEV o *_TEST '
      + '(o con --bd=' + bd + ' si de verdad se quiere).');
  }
  poolLibre = await new sql.ConnectionPool(config).connect();

  /* Los controladores del backend usan el mssql global: se redirige a la transacción en curso */
  sql.Request = RequestTest;
  sql.connect = async () => ({ request: () => new RequestTest() });

  /* bestellungen guarda el JSON del pedido en uploads/bestellungen (ruta relativa): a una carpeta temporal */
  carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'tests_fabricacion_'));
  fs.mkdirSync(path.join(carpetaTemporal, 'uploads', 'bestellungen'), { recursive: true });
  process.chdir(carpetaTemporal);

  return bd;
}

async function cerrar() {
  process.chdir(RAIZ);
  if (carpetaTemporal) {
    fs.rmSync ? fs.rmSync(carpetaTemporal, { recursive: true, force: true }) : fs.rmdirSync(carpetaTemporal, { recursive: true });
  }
  if (poolLibre) await poolLibre.close();
}

/* Espera a que terminen las peticiones encoladas, también las que se lanzan desde callbacks */
async function esperar() {
  do {
    await cola;
    await new Promise(r => setImmediate(r));
  } while (pendientes > 0);
}

async function enTransaccion(fn) {
  const tx = new sql.Transaction(poolLibre);
  await tx.begin();
  txActual = tx;
  try {
    return await fn();
  } finally {
    await esperar();
    txActual = null;
    try {
      await tx.rollback();
    } catch (e) {
      console.log('  (rollback: ' + e.message + ')');
    }
  }
}

/* SQL con parámetros: q('select ... where id = @id', { id: 5 }) -> recordsets */
async function q(texto, entradas) {
  const request = new RequestTest();
  Object.keys(entradas || {}).forEach(k => {
    const v = entradas[k];
    if (v && v.tipo) request.input(k, v.tipo, v.valor);
    else request.input(k, v);
  });
  const r = await request.query(texto);
  return r.recordsets;
}

/* Primera tabla del resultado */
async function filas(texto, entradas) {
  const r = await q(texto, entradas);
  return r.length ? r[r.length - 1] : [];
}

async function valor(texto, entradas) {
  const r = await filas(texto, entradas);
  if (!r.length) return undefined;
  return r[0][Object.keys(r[0])[0]];
}

/* Llama a un controlador del backend como lo haría express y devuelve { status, data, headers } */
function llamar(controlador, req, maxSegundos) {
  return new Promise((resolver, rechazar) => {
    const reloj = setTimeout(() => rechazar(new Error('el controlador no ha respondido')), (maxSegundos || 300) * 1000);
    const res = {
      _status: 200,
      _headers: {},
      status(c) { this._status = c; return this; },
      setHeader(k, v) { this._headers[String(k).toLowerCase()] = v; },
      send(d) { clearTimeout(reloj); resolver({ status: this._status, data: d, headers: this._headers }); return this; },
      json(d) { return this.send(d); }
    };
    const peticion = Object.assign({ params: {}, query: {}, body: {}, headers: {} }, req);
    Promise.resolve()
      .then(() => controlador(peticion, res))
      .catch(e => { clearTimeout(reloj); rechazar(e); });
  });
}

function controlador(relativo) {
  return require(path.join(BACKEND, 'controllers', relativo));
}

module.exports = {
  sql, BACKEND, RAIZ, FRONTEND,
  conectar, cerrar, enTransaccion, esperar, q, filas, valor, llamar, controlador
};
