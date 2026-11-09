'use strict'

const sql = require('mssql');

/*
 * Reglas de la fabricación de CortinaDecor (motor v2, sp_fabricacion_mrp_cd).
 * Pantalla: routes/herstellen/artikeln_fab_cd_v2
 * Tabla:    SOL_ARTICULOS_CD_FABRICACION_RELACION_V2
 *
 * Sustituyen, para esta pantalla, a /update_table (que monta el UPDATE con el texto que llega del
 * navegador) y al alta de sp_solarmanes_configuracion_fabricacion (que recorta las condiciones a 25
 * caracteres y no guarda el consumo). Todo va con parámetros y con la sesión iniciada.
 */

/* Campos que se pueden editar desde la tabla, con su longitud en la BD */
const CAMPOS = {
  orden: { tipo: 'entero' },
  sistema: { max: 50 },
  atributo: { max: 50 },
  valor: { max: 50 },
  nombre_parametro1: { max: 255 },
  nombre_parametro2: { max: 255 },
  operacion: { tipo: 'operacion' },
  consumo: { max: 255 },
  articulos: { max: 4000 }
};

/* La fila tal como la pinta la rejilla (igual que artikel_fabric_setup) */
const SELECT_REGLA = `
  select idrow, orden, sistema, atributo, valor, articulos, dbo.fn_get_articles(articulos, ',') as detalle,
         nombre_parametro1, nombre_parametro2, operacion, consumo
  from SOL_ARTICULOS_CD_FABRICACION_RELACION_V2
  where idrow = @idrow`;

function texto(valor, max) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim().substring(0, max);
}

/* Como hacía la pantalla: Y, O o '-' (cualquier otra cosa es '-') */
function operacion(valor) {
  const op = texto(valor, 1).toUpperCase();
  return (op === 'Y' || op === 'O') ? op : '-';
}

/* Artículos: ids separados por comas (o ';', como admite el motor), sin espacios sobrantes */
function articulos(valor) {
  return texto(valor, 4000).split(/[,;]/).map(a => a.trim()).filter(a => a !== '').join(',');
}

function articulosValidos(lista) {
  return lista === '' || lista.split(',').every(a => /^\d+$/.test(a));
}

async function leerRegla(pool, idrow) {
  const result = await pool.request().input('idrow', sql.Int, idrow).query(SELECT_REGLA);
  return result.recordset[0] || null;
}

/* POST /artikel_fabric_cd_celda { idrow, campo, valor } — guarda una casilla y devuelve la regla */
async function celda(req, res) {
  const body = req.body || {};
  const idrow = parseInt(body.idrow, 10);
  const def = CAMPOS[body.campo];
  if (isNaN(idrow) || !def) {
    return res.status(400).send({ message: 'Campo no editable' });
  }

  let valor;
  let tipo;
  if (def.tipo === 'entero') {
    valor = parseInt(body.valor, 10);
    if (isNaN(valor)) {
      return res.status(400).send({ message: 'El orden tiene que ser un número' });
    }
    tipo = sql.Int;
  }
  else if (def.tipo === 'operacion') {
    valor = operacion(body.valor);
    tipo = sql.Char(1);
  }
  else if (body.campo === 'articulos') {
    valor = articulos(body.valor);
    if (!articulosValidos(valor)) {
      return res.status(400).send({ message: 'Los artículos son ids separados por comas' });
    }
    tipo = sql.VarChar(def.max);
  }
  else {
    valor = texto(body.valor, def.max);
    tipo = sql.VarChar(def.max);
  }

  try {
    const pool = await sql.connect();
    /* El nombre del campo sale de la lista CAMPOS, nunca del navegador tal cual */
    const result = await pool.request()
      .input('idrow', sql.Int, idrow)
      .input('valor', tipo, valor)
      .query(`update SOL_ARTICULOS_CD_FABRICACION_RELACION_V2 set [${body.campo}] = @valor where idrow = @idrow`);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ message: 'La regla ya no existe' });
    }
    res.status(200).send({ message: 'OK', regla: await leerRegla(pool, idrow) });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* POST /artikel_fabric_cd_regla { orden, sistema, atributo, valor, articulos, nombre_parametro1, operacion,
   nombre_parametro2, consumo } — da de alta una regla y la devuelve */
async function alta(req, res) {
  const body = req.body || {};
  const sistema = texto(body.sistema, 50);
  const lista = articulos(body.articulos);
  if (sistema === '') {
    return res.status(400).send({ message: 'Indique el sistema' });
  }
  if (!articulosValidos(lista)) {
    return res.status(400).send({ message: 'Los artículos son ids separados por comas' });
  }

  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('orden', sql.Int, parseInt(body.orden, 10) || 0)
      .input('sistema', sql.VarChar(50), sistema)
      .input('atributo', sql.VarChar(50), texto(body.atributo, 50))
      .input('valor', sql.VarChar(50), texto(body.valor, 50))
      .input('articulos', sql.VarChar(4000), lista)
      .input('p1', sql.VarChar(255), texto(body.nombre_parametro1, 255))
      .input('operacion', sql.Char(1), operacion(body.operacion))
      .input('p2', sql.VarChar(255), texto(body.nombre_parametro2, 255))
      .input('consumo', sql.VarChar(255), texto(body.consumo, 255))
      .query(`
        insert into SOL_ARTICULOS_CD_FABRICACION_RELACION_V2
          (orden, sistema, atributo, valor, articulos, nombre_parametro1, operacion, nombre_parametro2, consumo)
        values (@orden, @sistema, @atributo, @valor, @articulos, @p1, @operacion, @p2, @consumo);
        select cast(scope_identity() as int) as idrow`);
    const idrow = result.recordset[0].idrow;
    res.status(200).send({ message: 'OK', regla: await leerRegla(pool, idrow) });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

module.exports = {
  celda,
  alta
}
