'use strict'

const sql = require('mssql');

/*
 * Maestro de tejidos (tablas SOL_TEJIDOS_MAESTRO y SOL_TEJIDOS_TIPOS).
 * Pantalla: routes/setup/tejidos-maestro ("Maestro de tejidos")
 * Scripts:  sqlTejidos/ (01 tablas, 02 carga desde TEJIDOS.xlsx). Documentación: tejidos.md
 *
 * coste_ml y grupo son calculados: esta API nunca los escribe.
 * No se borra nada: los tejidos y los tipos se dan de baja con activo = 0.
 */

function texto(value, max) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim().substring(0, max);
}

function entero(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

function decimal(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return isNaN(n) ? null : n;
}

function errorSql(err, res) {
  const numero = err && (err.number || (err.originalError && err.originalError.info && err.originalError.info.number));
  if (numero === 2627 || numero === 2601) {
    const msg = String(err.message || '');
    if (msg.includes('COD_SOLUPYME')) return res.status(400).send({ message: 'Ya existe un tejido con ese código Solupyme' });
    if (msg.includes('NOMBRE_COLOR_CRITERIO')) return res.status(400).send({ message: 'Ya existe un tejido con ese nombre, color y criterio' });
    return res.status(400).send({ message: 'Ya existe un registro con ese nombre' });
  }
  if (numero === 547) return res.status(400).send({ message: 'El tipo de tejido no existe' });
  console.error(err);
  return res.status(500).send({ message: 'KO' });
}

/* GET /tejidos_maestro — todos los tejidos, con la descripción del tipo */
async function lista(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      select m.idrow, m.cod_solupyme, m.tipo_tejido, t.descripcion as desc_tipo, m.nombre, m.color,
             m.criterio, m.impresion_digital, m.coste_m2, m.coste_ml, m.grupo, m.calculado,
             m.activo, m.created, m.modified
      from dbo.SOL_TEJIDOS_MAESTRO m
      left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
      order by m.nombre, m.criterio, m.color`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /tejidos_maestro — idrow > 0 modifica, si no da de alta.
   El código Solupyme se guarda con 5 cifras ('3258' → '03258'). Tipo y criterio pueden ir vacíos */
async function guardar(req, res) {
  const body = req.body || {};
  const idrow = entero(body.idrow) || 0;
  const codigo = texto(body.cod_solupyme, 20);
  const nombre = texto(body.nombre, 100);
  const color = texto(body.color, 100);
  const tipo = entero(body.tipo_tejido);
  const criterio = entero(body.criterio);
  const coste = decimal(body.coste_m2);

  if (!/^\d{1,5}$/.test(codigo)) return res.status(400).send({ message: 'El código Solupyme tiene que ser un número de hasta 5 cifras' });
  if (!nombre) return res.status(400).send({ message: 'El nombre no puede estar vacío' });
  if (!color) return res.status(400).send({ message: 'El color no puede estar vacío' });
  if (texto(body.criterio, 20) && !(criterio > 0)) return res.status(400).send({ message: 'El criterio tiene que ser un número entero de cm' });
  if (coste === null || coste < 0) return res.status(400).send({ message: 'El coste m² tiene que ser un número mayor o igual que 0' });

  try {
    const pool = await sql.connect();
    const request = pool.request()
      .input('idrow', sql.Int, idrow)
      .input('cod_solupyme', sql.VarChar(20), codigo.padStart(5, '0'))
      .input('tipo_tejido', sql.Int, tipo)
      .input('nombre', sql.VarChar(100), nombre)
      .input('color', sql.VarChar(100), color)
      .input('criterio', sql.Int, criterio)
      .input('impresion_digital', sql.Bit, body.impresion_digital ? 1 : 0)
      .input('coste_m2', sql.Decimal(10, 4), coste)
      .input('usuario', sql.Int, entero(req.user && req.user.sub));

    let result;
    if (idrow > 0) {
      result = await request.query(`
        update dbo.SOL_TEJIDOS_MAESTRO
        set cod_solupyme = @cod_solupyme, tipo_tejido = @tipo_tejido, nombre = @nombre, color = @color,
            criterio = @criterio, impresion_digital = @impresion_digital, coste_m2 = @coste_m2,
            modified = getdate(), usuario = @usuario
        where idrow = @idrow;
        select case when @@rowcount = 0 then null else @idrow end as idrow`);
      if (result.recordset[0].idrow === null) return res.status(404).send({ message: 'El tejido no existe' });
    } else {
      result = await request.query(`
        insert into dbo.SOL_TEJIDOS_MAESTRO (cod_solupyme, tipo_tejido, nombre, color, criterio, impresion_digital, coste_m2, usuario)
        values (@cod_solupyme, @tipo_tejido, @nombre, @color, @criterio, @impresion_digital, @coste_m2, @usuario);
        select cast(scope_identity() as int) as idrow`);
    }
    res.status(200).send({ message: 'OK', idrow: result.recordset[0].idrow });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /tejidos_maestro/activo { ids: [...], activo } — dar de baja o reactivar */
async function activo(req, res) {
  const body = req.body || {};
  const ids = (body.ids || []).map(entero).filter(n => n !== null);
  if (ids.length === 0) return res.status(400).send({ message: 'Faltan los tejidos' });
  try {
    const pool = await sql.connect();
    const request = pool.request()
      .input('activo', sql.Bit, body.activo ? 1 : 0)
      .input('usuario', sql.Int, entero(req.user && req.user.sub));
    ids.forEach((id, i) => request.input('id' + i, sql.Int, id));
    const result = await request.query(`
      update dbo.SOL_TEJIDOS_MAESTRO set activo = @activo, modified = getdate(), usuario = @usuario
      where idrow in (${ids.map((id, i) => '@id' + i).join(', ')});
      select @@rowcount as filas`);
    res.status(200).send({ message: 'OK', filas: result.recordset[0].filas });
  } catch (err) {
    errorSql(err, res);
  }
}

/* GET /tejidos_maestro/tipos — catálogo de tipos, con cuántos tejidos usan cada uno */
async function tipos(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      select t.idrow, t.descripcion, t.activo,
             (select count(*) from dbo.SOL_TEJIDOS_MAESTRO m where m.tipo_tejido = t.idrow) as tejidos
      from dbo.SOL_TEJIDOS_TIPOS t
      order by t.descripcion`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /tejidos_maestro/tipos { idrow, descripcion, activo } — alta (idrow vacío) o modificación */
async function tipo_guardar(req, res) {
  const body = req.body || {};
  const idrow = entero(body.idrow) || 0;
  const descripcion = texto(body.descripcion, 50).toUpperCase();
  if (!descripcion) return res.status(400).send({ message: 'La descripción no puede estar vacía' });
  try {
    const pool = await sql.connect();
    const request = pool.request()
      .input('idrow', sql.Int, idrow)
      .input('descripcion', sql.VarChar(50), descripcion)
      .input('activo', sql.Bit, body.activo === false || body.activo === 0 ? 0 : 1)
      .input('usuario', sql.Int, entero(req.user && req.user.sub));
    let result;
    if (idrow > 0) {
      result = await request.query(`
        update dbo.SOL_TEJIDOS_TIPOS set descripcion = @descripcion, activo = @activo, modified = getdate(), usuario = @usuario
        where idrow = @idrow;
        select case when @@rowcount = 0 then null else @idrow end as idrow`);
      if (result.recordset[0].idrow === null) return res.status(404).send({ message: 'El tipo no existe' });
    } else {
      result = await request.query(`
        insert into dbo.SOL_TEJIDOS_TIPOS (descripcion, usuario) values (@descripcion, @usuario);
        select cast(scope_identity() as int) as idrow`);
    }
    res.status(200).send({ message: 'OK', idrow: result.recordset[0].idrow });
  } catch (err) {
    errorSql(err, res);
  }
}

module.exports = {
  lista,
  guardar,
  activo,
  tipos,
  tipo_guardar
};
