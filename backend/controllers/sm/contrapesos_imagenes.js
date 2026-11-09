'use strict'

const sql = require('mssql');

/*
 * Imágenes de los contrapesos del enrollable, tabla SOL_ARTICULOS_CONTRAPESO_IMAGENES.
 * Configurador: manza/contrapeso-imagen, debajo del desplegable de contrapeso (solo Leroy Merlín).
 * Scripts: sqlContrapesos/01 (tabla) y 02 (carga inicial). No hay pantalla de mantenimiento.
 *
 * Una imagen por modelo (SOL_ARTICULOS_CONTRAPESO.descripcion: IO, LUNA OCULTO...): el id que
 * llega es el del desplegable (SOL_ARTICULOS_CONTRAPESO.idrow) y se busca la imagen de su modelo.
 */

/* La imagen del modelo del contrapeso @id, con los campos pedidos */
const consulta = campos => `
  select ${campos}
  from dbo.SOL_ARTICULOS_CONTRAPESO c
  inner join dbo.SOL_ARTICULOS_CONTRAPESO_IMAGENES i on i.modelo = ltrim(rtrim(c.descripcion)) collate database_default
  where c.idrow = @id`;

function id(params) {
  const n = Number(params.id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/* GET /contrapesos_imagenes/version/:id — { version } (null si el contrapeso no tiene imagen).
   La versión (fecha de modificación) va en la URL de la imagen para que la caché no sirva una vieja. */
async function version(req, res) {
  const k = id(req.params);
  if (!k) return res.status(400).send({ message: 'Parámetros no válidos' });
  try {
    const pool = await sql.connect();
    const result = await pool.request().input('id', sql.Int, k)
      .query(consulta('i.modified'));
    const fila = result.recordset[0];
    res.status(200).send({ version: fila ? new Date(fila.modified).getTime() : null });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* GET /contrapesos_imagenes/imagen/:id — la imagen (sin sesión: se usa en <img>) */
async function imagen(req, res) {
  const k = id(req.params);
  if (!k) return res.status(400).send({ message: 'Parámetros no válidos' });
  try {
    const pool = await sql.connect();
    const result = await pool.request().input('id', sql.Int, k).query(consulta('i.imagen, i.content_type'));
    if (!result.recordset.length) return res.status(404).send({ message: 'la imagen no existe' });
    const fila = result.recordset[0];
    res.set('Content-Type', fila.content_type);
    // La URL lleva la versión (?v=): si cambia la imagen, cambia la URL
    res.set('Cache-Control', req.query.v ? 'public, max-age=31536000, immutable' : 'no-cache');
    res.status(200).send(fila.imagen);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

module.exports = { version, imagen };
