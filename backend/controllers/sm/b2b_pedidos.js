'use strict'

/*
 * Pedidos B2B recibidos por API (VENETIANS y los que vengan con el contrato v3). Los recibe el
 * servidor B2B (proyecto CD, POST /cd/api/b2b_link/:cliente) y los guarda tal como llegan en
 * SOL_B2B_PEDIDO / SOL_B2B_LINEA (sql/sqlB2B 01-03). Aquí solo se consultan y se gestionan:
 * todavía no se fabrican (las líneas se mecanizan a mano).
 *
 *   GET  /api/sm/b2b/pedidos?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&prueba=0|1   lista
 *   GET  /api/sm/b2b/pedido/:id                                            cabecera + líneas
 *   POST /api/sm/b2b/pedido/:id/estado   { estado: 0 | 1 | -1 }             recibido / revisado / cancelado
 *   POST /api/sm/b2b/linea/:id/estado    { estado: 0 | 1 }                  pendiente / mecanizada
 *   POST /api/sm/b2b/borrar_pruebas      { id? }                            borra un pedido de prueba, o todos
 *   GET  /api/sm/b2b/recepciones?desde&hasta&fallidas=1                    todo lo que ha llegado (sqlB2B/04),
 *                                                                           también lo que no dio pedido
 *
 * sqlB2B/04: todo lo que envía el cliente llega, aunque venga mal. Los pedidos con errores de formato tienen
 * estado 2 ("Con errores") y la lista de errores en "errores".
 */

const sql = require('mssql');
const HechoPor = require('../../services/hecho_por');

function entero(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function fecha(v) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : null;
}

/* mssql entrega los datetime (guardados en hora local con getdate()) como si fueran UTC: se mandan
   como texto sin zona ("2026-11-19T14:02") para que el navegador no les sume la diferencia horaria */
function horaLocal(d) {
  return d instanceof Date ? d.toISOString().slice(0, 16) : d;
}
function soloFecha(d) {
  return d instanceof Date ? d.toISOString().slice(0, 10) : d;
}
function fechas(fila) {
  if (!fila) return fila;
  ['recibido', 'estado_fecha'].forEach(c => { if (c in fila) fila[c] = horaLocal(fila[c]); });
  if ('fecha' in fila) fila.fecha = soloFecha(fila.fecha);
  return fila;
}

function json(texto, porDefecto) {
  if (texto === null || texto === undefined || texto === '') return porDefecto;
  try { return JSON.parse(texto); } catch (e) { return porDefecto; }
}

async function pedidos(req, res) {
  const hoy = new Date();
  const desde = fecha(req.query.desde) || new Date(hoy.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const hasta = fecha(req.query.hasta) || hoy.toISOString().slice(0, 10);
  const prueba = req.query.prueba === '0' || req.query.prueba === '1' ? Number(req.query.prueba) : null;
  try {
    const pool = await sql.connect();
    const r = await pool.request()
      .input('desde', sql.Date, desde)
      .input('hasta', sql.Date, hasta)
      .input('cliente', sql.Int, entero(req.query.cliente))
      .input('prueba', sql.Int, prueba)
      .execute('sp_b2b_pedidos_lista');
    res.status(200).send({ Table: r.recordset.map(f => Object.assign(fechas(f), { errores: json(f.errores, []) })) });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function recepciones(req, res) {
  const hoy = new Date();
  const desde = fecha(req.query.desde) || new Date(hoy.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const hasta = fecha(req.query.hasta) || hoy.toISOString().slice(0, 10);
  try {
    const pool = await sql.connect();
    const r = await pool.request()
      .input('desde', sql.Date, desde)
      .input('hasta', sql.Date, hasta)
      .input('fallidas', sql.Bit, req.query.fallidas === '1' ? 1 : 0)
      .execute('sp_b2b_recepciones_lista');
    res.status(200).send({ Table: r.recordset.map(f => Object.assign(fechas(f), { detalle: json(f.detalle, f.detalle) })) });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function pedido(req, res) {
  const id = entero(req.params.id);
  if (id === null) return res.status(400).send({ message: 'Pedido no válido' });
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('id', sql.Int, id).execute('sp_b2b_pedido_detalle');
    const cabecera = r.recordsets[0][0];
    if (!cabecera) return res.status(404).send({ message: 'El pedido no existe' });
    const original = json(cabecera.json, null);
    delete cabecera.json;
    fechas(cabecera);
    cabecera.errores = json(cabecera.errores, []);
    const historial = (r.recordsets[2] || []).map(f => Object.assign(fechas(f), { detalle: json(f.detalle, f.detalle) }));
    const lineas = r.recordsets[1].map(l => {
      const out = Object.assign(fechas(l), {
        parametros: json(l.parametros, {}),
        resolucion: json(l.resolucion, []),
        avisos: json(l.avisos, [])
      });
      return out;
    });
    res.status(200).send({ cabecera, lineas, original, recepciones: historial });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function cambiarEstado(sp, req, res) {
  const id = entero(req.params.id);
  const estado = entero(req.body && req.body.estado);
  if (id === null || estado === null) return res.status(400).send({ message: 'Datos no válidos' });
  try {
    const pool = await sql.connect();
    const r = await pool.request()
      .input('id', sql.Int, id)
      .input('estado', sql.Int, estado)
      .input('usuario', sql.VarChar(255), (HechoPor.usuarioTexto(req) || '').substring(0, 255) || null)
      .execute(sp);
    if (r.returnValue === 1) return res.status(200).send({ message: 'OK' });
    res.status(400).send({ message: r.returnValue === -2 ? 'Estado no válido' : 'No existe' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

function pedido_estado(req, res) { return cambiarEstado('sp_b2b_pedido_estado', req, res); }
function linea_estado(req, res) { return cambiarEstado('sp_b2b_linea_estado', req, res); }

async function borrar_pruebas(req, res) {
  const id = entero(req.body && req.body.id);
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('id', sql.Int, id).input('cliente', sql.Int, null).execute('sp_b2b_borrar_pruebas');
    res.status(200).send({ message: 'OK', borrados: r.returnValue });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

module.exports = { pedidos, pedido, pedido_estado, linea_estado, borrar_pruebas, recepciones };
