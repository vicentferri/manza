'use strict'

const sql = require('mssql');

/*
 * Maestro de tejidos (tablas SOL_TEJIDOS_MAESTRO y SOL_TEJIDOS_TIPOS).
 * Pantalla: routes/setup/tejidos-maestro ("Maestro de tejidos")
 * Scripts:  sqlTejidos/ (01 tablas, 02 carga desde TEJIDOS.xlsx, 03 grupo, 04 coste ml).
 * Documentación: tejidos.md
 *
 * Grupo y coste ml son calculados: esta API nunca los escribe. Los calcula
 * sp_tejidos_maestro_calcular al guardar, al cambiar las lamas o el precio minuto y con
 * /tejidos_maestro/calcular. El coste ml solo se calcula en las lamas marcadas de cada tejido
 * (SOL_TEJIDOS_MAESTRO_COSTE_ML).
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

/* Anchos de lama válidos que llegan del cliente (los que existen en SOL_TEJIDOS_LAMAS) */
async function lamasValidas(pool, valores) {
  const pedidas = (valores || []).map(entero).filter(n => n !== null);
  const result = await pool.request().query('select ancho_mm from dbo.SOL_TEJIDOS_LAMAS');
  const existentes = result.recordset.map(r => r.ancho_mm);
  return { lamas: pedidas.filter(a => existentes.includes(a)), invalidas: pedidas.filter(a => !existentes.includes(a)) };
}

/* Deja marcadas en el tejido exactamente las lamas indicadas (ya validadas: solo enteros) */
async function sincronizarLamas(request, idrow, lamas) {
  const lista = lamas.length ? lamas.join(', ') : 'null';
  await request.input('tejido', sql.Int, idrow).query(`
    delete from dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML where tejido = @tejido and (ancho_mm not in (${lista}) or ${lamas.length} = 0);
    insert into dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML (tejido, ancho_mm)
    select @tejido, l.ancho_mm from dbo.SOL_TEJIDOS_LAMAS l
    where l.ancho_mm in (${lista})
      and not exists (select 1 from dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML c where c.tejido = @tejido and c.ancho_mm = l.ancho_mm)`);
}

/* GET /tejidos_maestro — todos los tejidos, con la descripción del tipo y, en ml, el coste ml
   de cada lama marcada ({ 89: 0.6770, 127: 0.9660 }) */
async function lista(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      select m.idrow, m.cod_solupyme, m.tipo_tejido, t.descripcion as desc_tipo, m.nombre, m.color,
             m.criterio, m.impresion_digital, m.coste_m2, m.grupo, m.calculado,
             m.activo, m.created, m.modified
      from dbo.SOL_TEJIDOS_MAESTRO m
      left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
      order by m.nombre, m.criterio, m.color`);
    const ml = await pool.request().query('select tejido, ancho_mm, coste_ml from dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML');
    const porTejido = {};
    ml.recordset.forEach(r => { (porTejido[r.tejido] = porTejido[r.tejido] || {})[r.ancho_mm] = r.coste_ml; });
    res.status(200).send({ Table: result.recordset.map(r => Object.assign(r, { ml: porTejido[r.idrow] || {} })) });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /tejidos_maestro — idrow > 0 modifica, si no da de alta.
   El código Solupyme se guarda con 5 cifras ('3258' → '03258'). Tipo y criterio pueden ir vacíos.
   lamas (opcional): anchos de lama a los que calcular el coste ml ([89], [127], [89, 127] o []) */
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

  let transaction;
  try {
    const pool = await sql.connect();
    const marcar = Array.isArray(body.lamas) ? await lamasValidas(pool, body.lamas) : null;
    if (marcar && marcar.invalidas.length) return res.status(400).send({ message: 'Ancho de lama no válido: ' + marcar.invalidas.join(', ') });

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction)
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
      if (result.recordset[0].idrow === null) {
        await transaction.rollback();
        return res.status(404).send({ message: 'El tejido no existe' });
      }
    } else {
      result = await request.query(`
        insert into dbo.SOL_TEJIDOS_MAESTRO (cod_solupyme, tipo_tejido, nombre, color, criterio, impresion_digital, coste_m2, usuario)
        values (@cod_solupyme, @tipo_tejido, @nombre, @color, @criterio, @impresion_digital, @coste_m2, @usuario);
        select cast(scope_identity() as int) as idrow`);
    }
    const id = result.recordset[0].idrow;
    if (marcar) await sincronizarLamas(new sql.Request(transaction), id, marcar.lamas);
    await new sql.Request(transaction).input('idrow', sql.Int, id).execute('sp_tejidos_maestro_calcular');
    await transaction.commit();
    res.status(200).send({ message: 'OK', idrow: id });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* POST /tejidos_maestro/calcular — recalcula grupo y coste ml de todos los tejidos */
async function calcular(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().input('idrow', sql.Int, null).execute('sp_tejidos_maestro_calcular');
    const r = result.recordset[0];
    res.status(200).send({ message: 'OK', calculados: r.calculados, sin_grupo: r.sin_grupo, costes_ml: r.costes_ml });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /tejidos_maestro/ml { ids: [...], lamas: [89, 127], marcar } — marca (o quita) las lamas
   indicadas en varios tejidos a la vez, sin tocar las demás lamas, y recalcula */
async function ml(req, res) {
  const body = req.body || {};
  const ids = (body.ids || []).map(entero).filter(n => n !== null);
  if (ids.length === 0) return res.status(400).send({ message: 'Faltan los tejidos' });

  let transaction;
  try {
    const pool = await sql.connect();
    const { lamas, invalidas } = await lamasValidas(pool, body.lamas);
    if (invalidas.length) return res.status(400).send({ message: 'Ancho de lama no válido: ' + invalidas.join(', ') });
    if (lamas.length === 0) return res.status(400).send({ message: 'Elija al menos una lama' });

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);
    ids.forEach((id, i) => request.input('id' + i, sql.Int, id));
    const enIds = ids.map((id, i) => '@id' + i).join(', ');
    const enLamas = lamas.join(', ');
    if (body.marcar === false) {
      await request.query(`delete from dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML where tejido in (${enIds}) and ancho_mm in (${enLamas})`);
    } else {
      await request.query(`
        insert into dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML (tejido, ancho_mm)
        select m.idrow, l.ancho_mm
        from dbo.SOL_TEJIDOS_MAESTRO m cross join dbo.SOL_TEJIDOS_LAMAS l
        where m.idrow in (${enIds}) and l.ancho_mm in (${enLamas})
          and not exists (select 1 from dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML c where c.tejido = m.idrow and c.ancho_mm = l.ancho_mm)`);
      for (const id of ids) {
        await new sql.Request(transaction).input('idrow', sql.Int, id).execute('sp_tejidos_maestro_calcular');
      }
    }
    await transaction.commit();
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* GET /tejidos_maestro/ml_config — precio minuto de mano de obra y lamas con sus parámetros */
async function ml_config(req, res) {
  try {
    const pool = await sql.connect();
    const p = await pool.request().query(`
      select valor, modified from dbo.SOL_TEJIDOS_PARAMETROS where clave = 'PRECIO_MINUTO_MO'`);
    const l = await pool.request().query(`
      select l.ancho_mm, l.tiempo_corte_min, l.ancho_bobina_m, l.alto_bobina_m,
             (select count(*) from dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML c where c.ancho_mm = l.ancho_mm) as tejidos
      from dbo.SOL_TEJIDOS_LAMAS l order by l.ancho_mm`);
    const precio = p.recordset[0] || {};
    res.status(200).send({ precio_minuto: precio.valor, modificado: precio.modified, lamas: l.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /tejidos_maestro/precio_minuto { valor } — cambia el precio minuto de mano de obra
   y recalcula el coste ml de todos los tejidos */
async function precio_minuto(req, res) {
  const valor = decimal((req.body || {}).valor);
  if (valor === null || valor < 0) return res.status(400).send({ message: 'El precio minuto tiene que ser un número mayor o igual que 0' });
  let transaction;
  try {
    const pool = await sql.connect();
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    await new sql.Request(transaction)
      .input('valor', sql.Decimal(10, 4), valor)
      .input('usuario', sql.Int, entero(req.user && req.user.sub))
      .query(`update dbo.SOL_TEJIDOS_PARAMETROS set valor = @valor, modified = getdate(), usuario = @usuario
              where clave = 'PRECIO_MINUTO_MO'`);
    const result = await new sql.Request(transaction).input('idrow', sql.Int, null).execute('sp_tejidos_maestro_calcular');
    await transaction.commit();
    res.status(200).send({ message: 'OK', costes_ml: result.recordset[0].costes_ml });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
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
  calcular,
  ml,
  ml_config,
  precio_minuto,
  activo,
  tipos,
  tipo_guardar
};
