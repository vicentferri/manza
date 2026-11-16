'use strict'

/*
 * Quién da de alta un pedido o un presupuesto (sqlPerfiles/15, PLAN_PEDIR_COMO_CLIENTE.md): se guarda en la columna
 * hecho_por de la cabecera justo después de crearla, con el usuario del login. Así, si un compañero pide "como" una
 * tienda, el documento es de la tienda pero se sabe quién lo hizo. No bloquea nunca el alta: si falla, se registra.
 */
const sql = require('mssql');
const Auth = require('../middlewares/authenticated');

const TABLAS = { pedido: 'SOL_PEDIDOS_COLA', presupuesto: 'SOL_PRESUPUESTOS_COLA' };

/* Texto que se guarda: el email del login o, si no lo hay, su nombre */
function usuarioTexto(req) {
  const u = Auth.usuarioOpcional(req);
  if (!u) return null;
  const nombre = [u.name, u.surname].filter(Boolean).join(' ').trim();
  return (u.email || nombre || null);
}

/* doc: 'pedido' o 'presupuesto'. conexion: pool o transacción (si no, la conexión global) */
async function guardar(doc, id, req, conexion) {
  const tabla = TABLAS[doc];
  const usuario = usuarioTexto(req);
  if (!tabla || !(id > 0) || !usuario) return;
  try {
    const request = conexion ? new sql.Request(conexion) : new sql.Request();
    await request.input('id', sql.Int, id).input('usuario', sql.VarChar(255), usuario.substring(0, 255))
      .query(`update dbo.${tabla} set hecho_por = @usuario where IDROW = @id`);
  } catch (err) {
    console.error('hecho_por', doc, id, err && err.message);
  }
}

/* Al convertir un presupuesto en pedido: el pedido lleva el hecho_por del presupuesto */
async function copiarDePresupuesto(idPresupuesto, idPedido, conexion) {
  try {
    const request = conexion ? new sql.Request(conexion) : new sql.Request();
    await request.input('pre', sql.Int, idPresupuesto).input('ped', sql.Int, idPedido).query(`
      update dbo.SOL_PEDIDOS_COLA set hecho_por = (select hecho_por from dbo.SOL_PRESUPUESTOS_COLA where IDROW = @pre)
      where IDROW = @ped`);
  } catch (err) {
    console.error('hecho_por copia', idPresupuesto, idPedido, err && err.message);
  }
}

module.exports = { guardar, copiarDePresupuesto, usuarioTexto };
