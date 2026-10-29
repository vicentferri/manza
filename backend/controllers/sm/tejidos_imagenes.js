'use strict'

const sql = require('mssql');
const sharp = require('sharp');

/*
 * Imágenes de los colores de tejido de Leroy Merlín (clientes 1 y 5), tabla SOL_TEJIDOS_COLORES_IMAGENES.
 * Pantalla: routes/setup/tejidos-imagenes ("Imágenes de Tejidos", Nuevo sistema).
 * Configurador: manza/tejido-imagen, junto al color de cada producto.
 * Scripts: sqlTejidos/05 (tabla) y 06 (carga inicial, generado por herramientas/generar_06_carga_imagenes.js).
 *
 * Una imagen por tejido + color + cara: 'A' por delante, 'B' por detrás. Los clientes 1 y 5
 * comparten imagen (tejido y color son los de SOL_ARTICULOS_TEJIDOS_ATRIBUTOS).
 * Al subirla se reduce a JPG de 800 px como máximo.
 */

const CLIENTES = '1, 5';
const LADO_MAX = 800;
const CARAS = ['A', 'B'];

function entero(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

/* tejido, color y cara de la URL; null si no son válidos */
function clave(params) {
  const tejido = entero(params.tejido);
  const color = entero(params.color);
  const cara = String(params.cara || 'A').toUpperCase();
  if (tejido === null || color === null || CARAS.indexOf(cara) === -1) return null;
  return { tejido, color, cara };
}

/* GET /tejidos_imagenes — los colores de los clientes 1 y 5 con sus imágenes (sin el binario) */
async function lista(req, res) {
  try {
    const pool = await sql.connect();
    // Un color por tejido + color; el nombre del tejido, el del cliente 1 si lo tiene
    const result = await pool.request().query(`
      with colores as (
        select tejido, color,
               isnull(min(case when cliente = 1 then descTejido end), min(descTejido)) as desc_tejido,
               min(descripcion) as desc_color,
               max(case when cliente = 1 then 1 else 0 end) as cliente_1,
               max(case when cliente = 5 then 1 else 0 end) as cliente_5
        from dbo.vw_tejidos_colores
        where cliente in (${CLIENTES})
        group by tejido, color
      )
      select c.*,
             a.nombre_original as a_nombre, a.bytes as a_bytes, a.usuario as a_usuario, a.modified as a_modified,
             b.nombre_original as b_nombre, b.bytes as b_bytes, b.usuario as b_usuario, b.modified as b_modified
      from colores c
      left join dbo.SOL_TEJIDOS_COLORES_IMAGENES a on a.tejido = c.tejido and a.color = c.color and a.cara = 'A'
      left join dbo.SOL_TEJIDOS_COLORES_IMAGENES b on b.tejido = c.tejido and b.color = c.color and b.cara = 'B'
      order by c.desc_tejido, c.desc_color`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* GET /tejidos_imagenes/caras/:tejido/:color — { A: versión, B: versión } (null si no hay imagen).
   La versión (fecha de modificación) va en la URL de la imagen para que la caché no sirva una vieja. */
async function caras(req, res) {
  const k = clave(req.params);
  if (!k) return res.status(400).send({ message: 'Parámetros no válidos' });
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('tejido', sql.Int, k.tejido)
      .input('color', sql.Int, k.color)
      .query(`select cara, modified from dbo.SOL_TEJIDOS_COLORES_IMAGENES where tejido = @tejido and color = @color`);
    const respuesta = { A: null, B: null };
    result.recordset.forEach(r => { respuesta[r.cara] = new Date(r.modified).getTime(); });
    res.status(200).send(respuesta);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* GET /tejidos_imagenes/imagen/:tejido/:color/:cara — la imagen (sin sesión: se usa en <img>) */
async function imagen(req, res) {
  const k = clave(req.params);
  if (!k) return res.status(400).send({ message: 'Parámetros no válidos' });
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('tejido', sql.Int, k.tejido)
      .input('color', sql.Int, k.color)
      .input('cara', sql.Char(1), k.cara)
      .query(`select imagen, content_type from dbo.SOL_TEJIDOS_COLORES_IMAGENES
              where tejido = @tejido and color = @color and cara = @cara`);
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

/* POST /tejidos_imagenes/imagen/:tejido/:color/:cara — { base64, filename }: crea o cambia la imagen */
async function subir(req, res) {
  const k = clave(req.params);
  if (!k) return res.status(400).send({ message: 'Parámetros no válidos' });
  const base64 = String((req.body && req.body.base64) || '').replace(/^data:[^;]+;base64,/, '');
  if (!base64) return res.status(400).send({ message: 'No se recibió la imagen' });

  let reducida;
  try {
    reducida = await sharp(Buffer.from(base64, 'base64'))
      .rotate()
      .resize(LADO_MAX, LADO_MAX, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
  } catch (err) {
    return res.status(400).send({ message: 'El fichero no es una imagen válida (JPG, PNG, TIF, WEBP...)' });
  }

  try {
    const pool = await sql.connect();
    const existe = await pool.request()
      .input('tejido', sql.Int, k.tejido)
      .input('color', sql.Int, k.color)
      .query(`select 1 as ok from dbo.SOL_ARTICULOS_TEJIDOS_ATRIBUTOS
              where tejido = @tejido and color = @color and cliente in (${CLIENTES})`);
    if (!existe.recordset.length) return res.status(400).send({ message: 'El color no es de un tejido de Leroy Merlín' });

    await pool.request()
      .input('tejido', sql.Int, k.tejido)
      .input('color', sql.Int, k.color)
      .input('cara', sql.Char(1), k.cara)
      .input('imagen', sql.VarBinary(sql.MAX), reducida.data)
      .input('nombre', sql.NVarChar(255), String((req.body && req.body.filename) || '').substring(0, 255) || null)
      .input('ancho', sql.Int, reducida.info.width)
      .input('alto', sql.Int, reducida.info.height)
      .input('bytes', sql.Int, reducida.data.length)
      .input('usuario', sql.VarChar(100), String((req.user && req.user.email) || '').substring(0, 100) || null)
      .query(`
        update dbo.SOL_TEJIDOS_COLORES_IMAGENES
        set imagen = @imagen, content_type = 'image/jpeg', nombre_original = @nombre, ancho = @ancho, alto = @alto,
            bytes = @bytes, usuario = @usuario, modified = getdate()
        where tejido = @tejido and color = @color and cara = @cara;
        if @@rowcount = 0
          insert into dbo.SOL_TEJIDOS_COLORES_IMAGENES (tejido, color, cara, imagen, content_type, nombre_original, ancho, alto, bytes, usuario)
          values (@tejido, @color, @cara, @imagen, 'image/jpeg', @nombre, @ancho, @alto, @bytes, @usuario);`);
    res.status(200).send({ message: 'OK', ancho: reducida.info.width, alto: reducida.info.height, bytes: reducida.data.length });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* DELETE /tejidos_imagenes/imagen/:tejido/:color/:cara */
async function borrar(req, res) {
  const k = clave(req.params);
  if (!k) return res.status(400).send({ message: 'Parámetros no válidos' });
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('tejido', sql.Int, k.tejido)
      .input('color', sql.Int, k.color)
      .input('cara', sql.Char(1), k.cara)
      .query(`delete from dbo.SOL_TEJIDOS_COLORES_IMAGENES where tejido = @tejido and color = @color and cara = @cara`);
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

module.exports = { lista, caras, imagen, subir, borrar };
