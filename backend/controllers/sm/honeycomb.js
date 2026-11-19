'use strict'

const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Formato C1 del resto de productos: "C1 " + importe en céntimos a 7 dígitos
function formatC1(importe) {
  const centimos = Math.round(Number(importe) * 100).toString();
  return 'C1 ' + centimos.padStart(7, '0');
}

/*
 * Incrementos de la HoneyComb (Productos → HoneyComb): tipo de tejido, color de tejido, color de perfil y accionamiento.
 * Coste por cortina que se suma a la casilla de la tarifa antes del margen. Hasta 2026-11-18 solo se cobraba el del
 * accionamiento; desde entonces se cobran todos (decisión del usuario, sql/sqlHoney/19 los dejó a 0).
 * Un id que falte o no exista suma 0.
 */
async function incrementosHoneycomb(pool, ids) {
  const id = (v) => { const n = parseInt(v, 10); return isNaN(n) ? null : n; };
  const r = await pool.request()
    .input('tipoTejido', sql.Int, id(ids.tipoTejido))
    .input('colorTejido', sql.Int, id(ids.colorTejido))
    .input('colorPerfil', sql.Int, id(ids.colorPerfil))
    .input('accionamiento', sql.Int, id(ids.accionamiento))
    .query(`select
        isnull((select Incremento from SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO where idTipoTejido = @tipoTejido), 0) as tipo_tejido,
        isnull((select Incremento from SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO where idColorTejido = @colorTejido), 0) as color_tejido,
        isnull((select Incremento from SOL_ARTICULOS_HONEYCOMB_COLORESPERFIL where idColorPerfil = @colorPerfil), 0) as color_perfil,
        isnull((select Incremento from SOL_ARTICULOS_HONEYCOMB_TIPOSACCIONAMIENTO where idTipoAccionamiento = @accionamiento), 0) as accionamiento`);
  const f = r.recordset[0] || {};
  const inc = {
    tipo_tejido: Number(f.tipo_tejido) || 0,
    color_tejido: Number(f.color_tejido) || 0,
    color_perfil: Number(f.color_perfil) || 0,
    accionamiento: Number(f.accionamiento) || 0
  };
  inc.total = inc.tipo_tejido + inc.color_tejido + inc.color_perfil + inc.accionamiento;
  return inc;
}

/*
 * Precio de una HoneyComb, el mismo para el configurador de siempre (honeycomb_obtener_tarifa) y el nuevo
 * (acc_configurador, /acc_cfg/hc/precio y alta): casilla de SOL_ARTICULOS_TARIFA_HONEYCOMB + incrementos.
 *   C1 (coste) = cantidad × (casilla + incrementos); PVP = C1 × 1,9. Sin promoción de tienda (no la ha tenido nunca).
 * Medidas en cm de 0,1 en 0,1: se sube al cm entero antes de pasar a metros (120,3 -> 1,21), para que no se redondee a
 * 1,20 m (Decimal(10,2)) y caiga en el tramo inferior de la tarifa.
 * Devuelve { codigo: 0, casilla, fila, columna, incrementos, coste, pvp, c1, alto_m, ancho_m } o { codigo: 404, ... }
 */
async function precioHoneycomb(pool, d) {
  const alto_m = Math.ceil(parseFloat(d.alto)) / 100;
  const ancho_m = Math.ceil(parseFloat(d.ancho)) / 100;
  const result = await pool.request()
    .input('alto', sql.Decimal(10, 2), alto_m)
    .input('ancho', sql.Decimal(10, 2), ancho_m)
    .input('tipoTejido', sql.Int, parseInt(d.tipoTejido, 10))
    .output('precio', sql.Decimal(10, 2))
    .output('filaEncontrada', sql.Decimal(10, 2))
    .output('columnaEncontrada', sql.Decimal(10, 2))
    .execute('sp_ObtenerPrecioHoneycomb');
  const casilla = result.output.precio;
  const base = { alto_m, ancho_m, fila: result.output.filaEncontrada, columna: result.output.columnaEncontrada };
  if (casilla === 0) return Object.assign({ codigo: 404, mensaje: 'No hay tarifa de la HoneyComb para esas medidas' }, base);
  const incrementos = await incrementosHoneycomb(pool, {
    tipoTejido: d.tipoTejido, colorTejido: d.colorTejido, colorPerfil: d.colorPerfil, accionamiento: d.accionamiento
  });
  const coste = d.cantidad * (Number(casilla) + incrementos.total);
  const pvp = coste * 1.9;
  return Object.assign({ codigo: 0, casilla: Number(casilla), incrementos, coste, pvp, c1: formatC1(coste) }, base);
}

/**
 * GET /api/honeycomb/precio
 * Consulta el precio de una tarifa según alto, ancho y tipo de tejido
 */
async function honeycomb_obtener_tarifa(req, res) {
  try {
    const { alto, ancho, tipoTejido, cantidad, tipoAccionamiento } = req.query;

    // Validación de parámetros
    if (!alto || !ancho || !tipoTejido) {
      return res.status(400).json({
        error: 'Parámetros requeridos: alto, ancho, tipoTejido'
      });
    }

    // Medidas en cm de 0,1 en 0,1: se sube al cm entero antes de pasar a metros (120,3 -> 1,21),
    // para que no se redondee a 1,20 m (Decimal(10,2)) y caiga en el tramo inferior de la tarifa
    const altoNum = Math.ceil(parseFloat(alto)) / 100;
    const anchoNum = Math.ceil(parseFloat(ancho)) / 100;
    const tipoTejidoNum = parseInt(tipoTejido);

    if (isNaN(altoNum) || isNaN(anchoNum) || isNaN(tipoTejidoNum)) {
      return res.status(400).json({
        error: 'Valores numéricos inválidos'
      });
    }

    if (tipoTejidoNum !== 1 && tipoTejidoNum !== 2) {
      return res.status(400).json({
        error: 'TipoTejido debe ser 1 o 2'
      });
    }

    const pool = await sql.connect();
    const p = await precioHoneycomb(pool, {
      ancho, alto, cantidad, tipoTejido: tipoTejidoNum, colorTejido: req.query.colorTejido,
      colorPerfil: req.query.colorPerfil, accionamiento: tipoAccionamiento
    });

    if (p.codigo !== 0) {
      return res.status(404).json({
        error: 'No se encontró tarifa para los valores especificados',
        alto: p.alto_m,
        ancho: p.ancho_m,
        tipoTejido: tipoTejidoNum
      });
    }

    res.json({
      PVP: p.pvp.toFixed(2),
      PVP_C1: p.c1,
      Incremento_Accionamiento: p.incrementos.accionamiento,
      Incrementos: p.incrementos,
      Fecha_Entrega: '',
      Transporte: 0,
      filaEncontrada: p.fila,
      columnaEncontrada: p.columna,
      alto: p.alto_m,
      ancho: p.ancho_m,
      tipoTejido: tipoTejidoNum
    });

  } catch (err) {
    console.error('Error al obtener precio:', err);
    res.status(500).json({
      error: 'Error al obtener precio',
      detalle: err.message
    });
  }
}

/**
 * POST /api/honeycomb/precio/lote
 * Consulta múltiples precios en una sola petición
 */
async function honeycomb_obtener_precio_lote(req, res) {
  try {
    const { consultas } = req.body;

    if (!Array.isArray(consultas) || consultas.length === 0) {
      return res.status(400).json({
        error: 'Se requiere un array de consultas'
      });
    }

    if (consultas.length > 100) {
      return res.status(400).json({
        error: 'Máximo 100 consultas por petición'
      });
    }

    const pool = await sql.connect();
    const resultados = [];

    for (const consulta of consultas) {
      const { alto, ancho, tipoTejido } = consulta;

      if (!alto || !ancho || !tipoTejido) {
        resultados.push({
          error: 'Parámetros incompletos',
          consulta
        });
        continue;
      }

      try {
        const result = await pool.request()
          .input('alto', sql.Decimal(10, 2), parseFloat(alto))
          .input('ancho', sql.Decimal(10, 2), parseFloat(ancho))
          .input('tipoTejido', sql.Int, parseInt(tipoTejido))
          .output('precio', sql.Decimal(10, 2))
          .output('filaEncontrada', sql.Decimal(10, 2))
          .output('columnaEncontrada', sql.Decimal(10, 2))
          .execute('sp_ObtenerPrecioHoneycomb');

        resultados.push({
          precio: result.output.precio,
          filaEncontrada: result.output.filaEncontrada,
          columnaEncontrada: result.output.columnaEncontrada,
          alto: parseFloat(alto),
          ancho: parseFloat(ancho),
          tipoTejido: parseInt(tipoTejido)
        });
      } catch (err) {
        resultados.push({
          error: err.message,
          consulta
        });
      }
    }

    res.json({ resultados });

  } catch (err) {
    console.error('Error al obtener precios en lote:', err);
    res.status(500).json({
      error: 'Error al obtener precios',
      detalle: err.message
    });
  }
}

/**
 * GET - Obtener todas las tarifas de un tipo de tejido
 */
async function honeycomb_obtener_tarifa_tipotejido(req, res) {
  try {
    const { tipoTejido } = req.query;
    const pool = await sql.connect();

    const result = await pool.request()
      .input('tipoTejido', sql.Int, tipoTejido)
      .query(`
        SELECT * FROM SOL_ARTICULOS_TARIFA_HONEYCOMB
        WHERE TipoTejido = @tipoTejido
        ORDER BY Fila
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tarifas' });
  }
}

/**
 * POST - Actualizar tarifas de un tipo de tejido
 */
async function honeycomb_actualizar_tarifa_tipotejido(req, res) {
  try {
    const tarifas = req.body;
    const pool = await sql.connect();

    for (const tarifa of tarifas) {
      await pool.request()
        .input('TipoTejido', sql.Int, tarifa.TipoTejido)
        .input('Fila', sql.Decimal(10, 2), tarifa.Fila)
        .input('Col_0_20', sql.Decimal(10, 2), tarifa.Col_0_20)
        .input('Col_0_40', sql.Decimal(10, 2), tarifa.Col_0_40)
        .input('Col_0_60', sql.Decimal(10, 2), tarifa.Col_0_60)
        .input('Col_0_80', sql.Decimal(10, 2), tarifa.Col_0_80)
        .input('Col_1_00', sql.Decimal(10, 2), tarifa.Col_1_00)
        .input('Col_1_20', sql.Decimal(10, 2), tarifa.Col_1_20)
        .input('Col_1_40', sql.Decimal(10, 2), tarifa.Col_1_40)
        .input('Col_1_60', sql.Decimal(10, 2), tarifa.Col_1_60)
        .input('Col_1_80', sql.Decimal(10, 2), tarifa.Col_1_80)
        .input('Col_2_00', sql.Decimal(10, 2), tarifa.Col_2_00)
        .input('Col_2_20', sql.Decimal(10, 2), tarifa.Col_2_20)
        .input('Col_2_40', sql.Decimal(10, 2), tarifa.Col_2_40)
        .input('Col_2_60', sql.Decimal(10, 2), tarifa.Col_2_60)
        .input('Col_2_80', sql.Decimal(10, 2), tarifa.Col_2_80)
        .input('Col_3_00', sql.Decimal(10, 2), tarifa.Col_3_00)
        .query(`
          UPDATE SOL_ARTICULOS_TARIFA_HONEYCOMB
          SET Col_0_20 = @Col_0_20, Col_0_40 = @Col_0_40, Col_0_60 = @Col_0_60,
              Col_0_80 = @Col_0_80, Col_1_00 = @Col_1_00, Col_1_20 = @Col_1_20,
              Col_1_40 = @Col_1_40, Col_1_60 = @Col_1_60, Col_1_80 = @Col_1_80,
              Col_2_00 = @Col_2_00, Col_2_20 = @Col_2_20, Col_2_40 = @Col_2_40,
              Col_2_60 = @Col_2_60, Col_2_80 = @Col_2_80, Col_3_00 = @Col_3_00
          WHERE TipoTejido = @TipoTejido AND Fila = @Fila
        `);
    }

    res.json({ success: true, message: 'Tarifas actualizadas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tarifas' });
  }
}

/**
 * POST - Guardar snapshot
 */
async function honeycomb_snapshot(req, res) {
  try {
    const { tipoTejido, usuario, accion } = req.body;
    const pool = await sql.connect();

    await pool.request()
      .input('tipoTejido', sql.Int, tipoTejido)
      .input('usuario', sql.NVarChar(100), usuario)
      .input('accion', sql.NVarChar(50), accion)
      .execute('sp_GuardarSnapshotTarifas');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar snapshot' });
  }
}

/**
 * GET - Obtener historial
 */
async function honeycomb_historial(req, res) {
  try {
    const { tipoTejido } = req.query;
    const pool = await sql.connect();

    const result = await pool.request()
      .input('tipoTejido', sql.Int, tipoTejido)
      .query(`
        SELECT DISTINCT 
          MIN(Id) as id,
          FechaModificacion as fecha, 
          Usuario as usuario, 
          Accion as accion
        FROM SOL_ARTICULOS_TARIFA_HONEYCOMB_HISTORIAL
        WHERE TipoTejido = @tipoTejido
        GROUP BY FechaModificacion, Usuario, Accion
        ORDER BY FechaModificacion DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}

/**
 * POST - Restaurar snapshot
 */
async function honeycomb_historial_restaurar(req, res) {
  try {
    const { tipoTejido, idHistorial } = req.body;
    const pool = await sql.connect();

    await pool.request()
      .input('tipoTejido', sql.Int, tipoTejido)
      .input('idHistorial', sql.Int, idHistorial)
      .execute('sp_DeshacerCambiosTarifas');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al restaurar' });
  }
}

/**
 * GET - Obtener tipos de tejido con indicador de imagen
 */
async function honeycomb_tipostejido(req, res) {
  try {
    const pool = await sql.connect();

    const result = await pool.request()
      .query(`
        SELECT 
          t.idTipoTejido,
          t.TipoTejido,
          t.Incremento,
          CASE 
            WHEN EXISTS (
              SELECT 1 
              FROM SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO_IMAGENES i
              WHERE i.idTipoTejido = t.idTipoTejido 
              AND i.Activo = 1
            ) THEN 1 
            ELSE 0 
          END AS TieneImagen
        FROM sol_articulos_honeycomb_tipostejido t
        ORDER BY t.TipoTejido
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tipos de tejido' });
  }
}

/**
 * GET - Obtener colores de tejido por tipo con indicador de imagen
 */
async function honeycomb_colorestejido(req, res) {
  try {
    const { tipotejido } = req.params;
    const pool = await sql.connect();

    const result = await pool.request()
      .input('tipotejido', sql.Int, tipotejido)
      .query(`
        SELECT 
          c.idColorTejido,
          c.idTipoTejido,
          c.ColorTejido,
          c.Referencia,
          c.CodigoColor,
          CASE 
            WHEN EXISTS (
              SELECT 1 
              FROM SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO_IMAGENES i
              WHERE i.idColorTejido = c.idColorTejido 
              AND i.Activo = 1
            ) THEN 1 
            ELSE 0 
          END AS TieneImagen
        FROM sol_articulos_honeycomb_colorestejido c
        WHERE c.idTipoTejido = @tipotejido
        ORDER BY c.ColorTejido
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener colores de tejido' });
  }
}

/**
 * GET - Obtener colores de perfil con indicador de imagen
 */
async function honeycomb_coloresperfil(req, res) {
  try {
    const pool = await sql.connect();

    const result = await pool.request()
      .query(`
        SELECT 
          p.idColorPerfil,
          p.ColorPerfil,
          p.Referencia,
          p.CodigoColor,
          CASE 
            WHEN EXISTS (
              SELECT 1 
              FROM SOL_ARTICULOS_HONEYCOMB_COLORESPERFIL_IMAGENES i
              WHERE i.idColorPerfil = p.idColorPerfil 
              AND i.Activo = 1
            ) THEN 1 
            ELSE 0 
          END AS TieneImagen
        FROM sol_articulos_honeycomb_coloresperfil p
        ORDER BY p.ColorPerfil
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener colores de perfil' });
  }
}

/**
 * GET - Obtener imagen por tipo e ID
 */
async function honeycomb_obtener_imagen(req, res) {
  try {
    const { tipo, id } = req.params;

    // Validar tipo
    const tiposValidos = {
      'tejido': 'SP_Honeycomb_TipoTejido_Imagen_Get',
      'color': 'SP_Honeycomb_ColorTejido_Imagen_Get',
      'perfil': 'SP_Honeycomb_ColorPerfil_Imagen_Get',
    };

    if (!tiposValidos[tipo]) {
      return res.status(400).send({ message: 'Tipo inválido' });
    }

    const pool = await sql.connect();
    const request = pool.request();

    // Agregar parámetro según el tipo
    if (tipo === 'tejido') {
      request.input('idTipoTejido', sql.Int, id);
    } else if (tipo === 'color') {
      request.input('idColorTejido', sql.Int, id);
    } else if (tipo === 'perfil') {
      request.input('idColorPerfil', sql.Int, id);
    }

    const result = await request.execute(tiposValidos[tipo]);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).send({ message: 'Imagen no encontrada' });
    }

    const imagen = result.recordset[0];

    // Configurar headers de cache
    res.set({
      'Cache-Control': 'public, max-age=604800', // 7 días
      'Content-Type': imagen.ContentType || 'image/jpeg',
      'Content-Length': imagen.Tamanio,
      'Last-Modified': imagen.FechaModificacion.toUTCString()
    });

    // Enviar imagen
    res.send(imagen.Contenido);

  } catch (error) {
    console.error('Error obteniendo imagen:', error);
    res.status(500).send({ message: 'Error del servidor', error: error.message });
  }
}

/**
 * POST - Subir/Actualizar imagen (Multipart)
 */
 

async function honeycomb_upload_image(req, res) {
  try {
    const { tipo, id } = req.params;

    if (!req.files || !req.files.imagen) {
      return res.status(400).send({ message: 'No se recibió ninguna imagen' });
    }

    const imagen = req.files.imagen;
    
    console.log('Archivo recibido:', {
      name: imagen.name,
      path: imagen.path,  // <-- La ruta en disco
      size: imagen.size
    });

    // Validar tamaño (max 5MB)
    if (imagen.size > 5 * 1024 * 1024) {
      return res.status(400).send({ message: 'La imagen no puede superar 5MB' });
    }

    // Validar por extensión
    const extension = imagen.name.substring(imagen.name.lastIndexOf('.')).toLowerCase();
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.webp'];
    
    if (!extensionesPermitidas.includes(extension)) {
      return res.status(400).send({ 
        message: 'Tipo de archivo no permitido. Solo JPG, PNG, WEBP',
        recibido: extension
      });
    }

    // Determinar ContentType
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    const contentType = contentTypeMap[extension] || 'image/jpeg';

    // LEER EL ARCHIVO DEL DISCO
    const imageBuffer = fs.readFileSync(imagen.path);

    const tiposValidos = {
      'tejido': { sp: 'SP_Honeycomb_TipoTejido_Imagen_Set', param: 'idTipoTejido', paramType: sql.Int },
      'color': { sp: 'SP_Honeycomb_ColorTejido_Imagen_Set', param: 'idColorTejido', paramType: sql.Int },
      'perfil': { sp: 'SP_Honeycomb_ColorPerfil_Imagen_Set', param: 'idColorPerfil', paramType: sql.Int }
    };

    if (!tiposValidos[tipo]) {
      return res.status(400).send({ message: 'Tipo inválido' });
    }

    const pool = await sql.connect();
    const request = pool.request();

    // Parámetros
    request.input(tiposValidos[tipo].param, tiposValidos[tipo].paramType, id);
    request.input('NombreArchivo', sql.NVarChar(255), imagen.name);
    request.input('Extension', sql.NVarChar(10), extension);
    request.input('Contenido', sql.VarBinary(sql.MAX), imageBuffer);  // <-- Buffer del archivo
    request.input('ContentType', sql.NVarChar(50), contentType);
    request.input('Tamanio', sql.Int, imagen.size);

    const result = await request.execute(tiposValidos[tipo].sp);

    // ELIMINAR EL ARCHIVO TEMPORAL
    fs.unlinkSync(imagen.path);

    res.status(200).send({
      message: 'Imagen guardada correctamente',
      success: result.recordset[0].Success === 1
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    
    // Intentar eliminar archivo temporal en caso de error
    try {
      if (req.files && req.files.imagen && req.files.imagen.path) {
        fs.unlinkSync(req.files.imagen.path);
      }
    } catch (e) {}
    
    res.status(500).send({ message: 'Error del servidor', error: error.message });
  }
}

/**
 * POST - Subir imagen desde Base64
 */
async function honeycomb_upload_image_base64(req, res) {
  try {
    const { tipo, id } = req.params;
    const { base64, filename, contentType } = req.body;

    if (!base64) {
      return res.status(400).send({ message: 'No se recibió la imagen en base64' });
    }

    // Remover el prefijo data:image/...;base64, si existe
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Validar tamaño (max 5MB)
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).send({ message: 'La imagen no puede superar 5MB' });
    }

    const tiposValidos = {
      'tejido': { sp: 'SP_Honeycomb_TipoTejido_Imagen_Set', param: 'idTipoTejido', paramType: sql.Int },
      'color': { sp: 'SP_Honeycomb_ColorTejido_Imagen_Set', param: 'idColorTejido', paramType: sql.Int },
      'perfil': { sp: 'SP_Honeycomb_ColorPerfil_Imagen_Set', param: 'idColorPerfil', paramType: sql.Int }
    };

    if (!tiposValidos[tipo]) {
      return res.status(400).send({ message: 'Tipo inválido' });
    }

    const pool = await sql.connect();
    const request = pool.request();

    // Determinar extensión
    const extension = filename ? path.extname(filename) : '.jpg';
    const nombreArchivo = filename || `${tipo}_${id}${extension}`;
    const contentTypeValue = contentType || 'image/jpeg';

    // Parámetros
    request.input(tiposValidos[tipo].param, tiposValidos[tipo].paramType, id);
    request.input('NombreArchivo', sql.NVarChar(255), nombreArchivo);
    request.input('Extension', sql.NVarChar(10), extension);
    request.input('Contenido', sql.VarBinary(sql.MAX), imageBuffer);
    request.input('ContentType', sql.NVarChar(50), contentTypeValue);
    request.input('Tamanio', sql.Int, imageBuffer.length);

    const result = await request.execute(tiposValidos[tipo].sp);

    res.status(200).send({
      message: 'Imagen guardada correctamente',
      success: result.recordset[0].Success === 1
    });

  } catch (error) {
    console.error('Error subiendo imagen base64:', error);
    res.status(500).send({ message: 'Error del servidor', error: error.message });
  }
}

/**
 * DELETE - Eliminar imagen
 */
async function honeycomb_delete_image(req, res) {
  try {
    const { tipo, id } = req.params;

    const tiposValidos = {
      'tejido': { sp: 'SP_Honeycomb_TipoTejido_Imagen_Delete', param: 'idTipoTejido', paramType: sql.Int },
      'color': { sp: 'SP_Honeycomb_ColorTejido_Imagen_Delete', param: 'idColorTejido', paramType: sql.Int },
      'perfil': { sp: 'SP_Honeycomb_ColorPerfil_Imagen_Delete', param: 'idColorPerfil', paramType: sql.Int }
    };

    if (!tiposValidos[tipo]) {
      return res.status(400).send({ message: 'Tipo inválido' });
    }

    const pool = await sql.connect();
    const request = pool.request();
    request.input(tiposValidos[tipo].param, tiposValidos[tipo].paramType, id);

    const result = await request.execute(tiposValidos[tipo].sp);

    res.status(200).send({
      message: 'Imagen eliminada correctamente',
      success: result.recordset[0].Success === 1
    });

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).send({ message: 'Error del servidor', error: error.message });
  }
}

/**
 * GET - Listar todas las imágenes disponibles
 */
async function honeycomb_list_images(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().execute('SP_Honeycomb_Imagenes_Disponibles');

    res.status(200).send(result.recordset);

  } catch (error) {
    console.error('Error listando imágenes:', error);
    res.status(500).send({ message: 'Error del servidor', error: error.message });
  }
}

// Backend - Añadir a honeycomb.js

/**
 * ========================================
 * ADMIN DATA - CRUD OPERATIONS
 * ========================================
 */

// TIPOS DE ACCIONAMIENTO

async function honeycomb_tiposaccionamiento(req, res) {
  try {
    const pool = await sql.connect();

    const result = await pool.request()
      .query(`
      SELECT 
      t.idTipoAccionamiento,
      t.TipoAccionamiento,
      t.Incremento,
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM sol_articulos_honeycomb_tiposaccionamiento_imagenes i
          WHERE i.idTipoAccionamiento = t.idTipoAccionamiento 
          AND i.Activo = 1
        ) THEN 1 
        ELSE 0 
      END AS TieneImagen
    FROM sol_articulos_honeycomb_tiposaccionamiento t
    -- Primero el accionamiento sin recargo: el configurador marca el primero por defecto
    ORDER BY t.Incremento, t.idTipoAccionamiento
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tipos de tejido' });
  }
}

async function honeycomb_tipoaccionamiento_insert(req, res) {
  try {
    const { TipoAccionamiento,Incremento } = req.body;
    
    if (!TipoAccionamiento) {
      return res.status(400).json({ error: 'TipoAccionamiento es requerido' });
    }

    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('TipoAccionamiento', sql.NVarChar(100), TipoAccionamiento)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_TipoAccionamiento_Insert');

    res.json({ 
      success: true, 
      idTipoAccionamiento: result.recordset[0].idTipoAccionamiento 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar tipo de tejido' });
  }
}

/* ---------------- NO RENOMBRAR LO QUE USAN LAS REGLAS (Productos → HoneyComb, 2026-11-13) ----------------
   La fabricación (motor v3, juego del producto 7) recibe de cada línea el TEXTO del tipo de tejido, del color de tejido,
   del color de perfil y del accionamiento (@TEJIDO_TIPO, @TEJIDO_COLOR, @COLOR_PERFIL, @ACCIONAMIENTO), y las reglas se
   condicionan por ese texto (p. ej. '@COLOR_PERFIL == BLANCO RAL 9016'). Si se renombra un elemento que sale en alguna
   condición, los pedidos NUEVOS dejan de cumplir la regla sin aviso. Por eso, si el nombre cambia y el nombre actual
   aparece en las condiciones de alguna regla (de componente, de código o de descripción) de los juegos de la HoneyComb,
   no se guarda. Los pedidos ya hechos guardan su texto y no se ven afectados. */
const RENOMBRABLES = {
  tipotejido:       { tabla: 'sol_articulos_honeycomb_tipostejido',        id: 'idTipoTejido',        nombre: 'TipoTejido',        parametro: '@TEJIDO_TIPO',   que: 'tipo de tejido' },
  colortejido:      { tabla: 'sol_articulos_honeycomb_colorestejido',      id: 'idColorTejido',       nombre: 'ColorTejido',       parametro: '@TEJIDO_COLOR',  que: 'color de tejido' },
  colorperfil:      { tabla: 'sol_articulos_honeycomb_coloresperfil',      id: 'idColorPerfil',       nombre: 'ColorPerfil',       parametro: '@COLOR_PERFIL',  que: 'color de perfil' },
  tipoaccionamiento:{ tabla: 'sol_articulos_honeycomb_tiposaccionamiento', id: 'idTipoAccionamiento', nombre: 'TipoAccionamiento', parametro: '@ACCIONAMIENTO', que: 'accionamiento' }
};

/* Devuelve { error, nombre }: error = mensaje si el cambio de nombre no se puede hacer (si no, null); nombre = el que hay
   que guardar (si solo cambian espacios al principio o al final, se queda el de antes: con espacios ya no coincidiría
   con el texto de las reglas) */
async function renombradoBloqueado(pool, clave, id, nuevoNombre) {
  const r = RENOMBRABLES[clave];
  const actual = await pool.request().input('id', sql.Int, id)
    .query(`select ${r.nombre} as nombre from dbo.${r.tabla} where ${r.id} = @id`);
  if (!actual.recordset.length) return { error: null, nombre: nuevoNombre };
  const guardado = actual.recordset[0].nombre;
  const anterior = String(guardado || '').trim();
  const nuevo = String(nuevoNombre || '').trim();
  if (anterior === nuevo) return { error: null, nombre: guardado };
  if (!anterior) return { error: null, nombre: nuevoNombre };
  /* charindex en lugar de like: los nombres pueden llevar [ ] % _ */
  const uso = await pool.request()
    .input('parametro', sql.NVarChar(50), r.parametro)
    .input('nombre', sql.NVarChar(200), anterior)
    .query(`
      select count(*) as n
      from dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2 x
      where x.sistema in (select s.sistema from dbo.SOL_FABRICACION_SISTEMAS s where s.producto = 7)
        and exists (select 1 from (values (x.nombre_parametro1), (x.nombre_parametro2), (x.nombre_parametro3), (x.nombre_parametro4)) c (cond)
                    where charindex(@parametro, c.cond) > 0 and charindex(@nombre, c.cond) > 0)`);
  const n = uso.recordset[0].n;
  if (!n) return { error: null, nombre: nuevoNombre };
  return { nombre: nuevoNombre, error: `El ${r.que} «${anterior}» se usa en ${n} ${n === 1 ? 'regla' : 'reglas'} de fabricación: no se puede renombrar. ` +
         'Cambie antes las reglas en Gestión de Fabricación (producto HONEYCOMB).' };
}

async function honeycomb_tipoaccionamiento_update(req, res) {
  try {
    const { idTipoAccionamiento, TipoAccionamiento, Incremento } = req.body;

    
    const pool = await sql.connect();
    const chk = await renombradoBloqueado(pool, 'tipoaccionamiento', idTipoAccionamiento, TipoAccionamiento);
    if (chk.error) return res.status(409).json({ error: chk.error, message: chk.error });
    await pool.request()
      .input('idTipoAccionamiento', sql.Int, idTipoAccionamiento)
      .input('TipoAccionamiento', sql.NVarChar(100), chk.nombre)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_TipoAccionamiento_Update');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tipo de accionamiento' });
  }
}

async function honeycomb_tipoaccionamiento_delete(req, res) {
  try {
    const { id } = req.params;

    const pool = await sql.connect();
    await pool.request()
      .input('idTipoAccionamiento', sql.Int, id)
      .execute('SP_Honeycomb_TipoAccionamiento_Delete');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar tipo de tejido' });
  }
}

// TIPOS DE TEJIDO
async function honeycomb_tipotejido_insert(req, res) {
  try {
    const { TipoTejido,Incremento } = req.body;
    
    if (!TipoTejido) {
      return res.status(400).json({ error: 'TipoTejido es requerido' });
    }

    const pool = await sql.connect();
    const result = await pool.request()
      .input('TipoTejido', sql.NVarChar(100), TipoTejido)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_TipoTejido_Insert');

    res.json({ 
      success: true, 
      idTipoTejido: result.recordset[0].idTipoTejido 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar tipo de tejido' });
  }
}

async function honeycomb_tipotejido_update(req, res) {
  try {
    const { idTipoTejido, TipoTejido, Incremento } = req.body;

    const pool = await sql.connect();
    const chk = await renombradoBloqueado(pool, 'tipotejido', idTipoTejido, TipoTejido);
    if (chk.error) return res.status(409).json({ error: chk.error, message: chk.error });
    await pool.request()
      .input('idTipoTejido', sql.Int, idTipoTejido)
      .input('TipoTejido', sql.NVarChar(100), chk.nombre)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_TipoTejido_Update');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tipo de tejido' });
  }
}

async function honeycomb_tipotejido_delete(req, res) {
  try {
    const { id } = req.params;

    const pool = await sql.connect();
    await pool.request()
      .input('idTipoTejido', sql.Int, id)
      .execute('SP_Honeycomb_TipoTejido_Delete');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar tipo de tejido' });
  }
}

// COLORES DE TEJIDO
/* Cada color de tejido va enlazado a su tejido del maestro (sql/sqlHoney/20): lo que se graba en la línea y lo que
   lee la fabricación sigue siendo el color de la HoneyComb (id -> Referencia), y la Referencia sale del maestro */
async function honeycomb_colortejido_getall(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      select c.idColorTejido, c.ColorTejido, c.idTipoTejido, t.TipoTejido, c.Referencia, c.CodigoColor, c.Incremento,
             c.tejido_maestro, m.nombre as maestro_nombre, m.color as maestro_color,
             ltrim(rtrim(m.cod_solupyme)) as maestro_cod, m.activo as maestro_activo
      from dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO c
      join dbo.SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO t on t.idTipoTejido = c.idTipoTejido
      left join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = c.tejido_maestro
      order by t.TipoTejido, c.ColorTejido`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener colores de tejido' });
  }
}

/* Tejido del maestro elegido para un color. Sin el campo (Excel, llamadas antiguas): { id: null, quitar: false }, se
   enlaza por la Referencia. Con el campo vacío ("Sin tejido" en Productos): { id: null, quitar: true }.
   Error si no existe, no está activo o no tiene código Solupyme */
async function tejidoMaestroElegido(pool, body) {
  if (!Object.prototype.hasOwnProperty.call(body || {}, 'tejido_maestro')) return { id: null, quitar: false };
  const valor = body.tejido_maestro;
  if (valor === undefined || valor === null || valor === '') return { id: null, quitar: true };
  const id = parseInt(valor, 10);
  if (isNaN(id)) return { error: 'Tejido del maestro no válido' };
  const r = await pool.request().input('id', sql.Int, id)
    .query('select idrow, ltrim(rtrim(cod_solupyme)) as cod, activo from dbo.SOL_TEJIDOS_MAESTRO where idrow = @id');
  if (!r.recordset.length) return { error: 'El tejido ' + id + ' no existe en el maestro de tejidos' };
  if (!r.recordset[0].activo) return { error: 'El tejido ' + id + ' no está activo en el maestro de tejidos' };
  if (!r.recordset[0].cod) return { error: 'El tejido ' + id + ' no tiene código Solupyme en el maestro' };
  return { id };
}

/* Enlace del color con el maestro: con tejido elegido, la Referencia pasa a ser su código Solupyme; "Sin tejido" quita
   el enlace y la Referencia (la fabricación sacará SIN ARTÍCULO) SOLO si el color estaba enlazado: un color sin enlace al que
   se le cambia otra cosa (p. ej. el incremento) conserva su Referencia; sin el campo (Excel, llamadas antiguas), se enlaza
   con el tejido del maestro que tenga ese código, si hay uno */
async function enlazarColorTejidoMaestro(pool, idColorTejido, maestro) {
  await pool.request()
    .input('idColorTejido', sql.Int, idColorTejido)
    .input('tejido', sql.Int, maestro.id)
    .input('quitar', sql.Bit, maestro.quitar ? 1 : 0)
    .query(`if @quitar = 1 and exists (select 1 from dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO
                                       where idColorTejido = @idColorTejido and tejido_maestro is not null)
        update dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO set tejido_maestro = null, Referencia = null
        where idColorTejido = @idColorTejido
      else if @tejido is not null
        update c set tejido_maestro = m.idrow, Referencia = ltrim(rtrim(m.cod_solupyme))
        from dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO c join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = @tejido
        where c.idColorTejido = @idColorTejido
      else
        update c set tejido_maestro = (select top 1 m.idrow from dbo.SOL_TEJIDOS_MAESTRO m
                                       where ltrim(rtrim(m.cod_solupyme)) = ltrim(rtrim(c.Referencia)) order by m.activo desc, m.idrow)
        from dbo.SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO c
        where c.idColorTejido = @idColorTejido`);
}

/* GET /honeycomb_tejidos_maestro: tejidos del maestro que se pueden enlazar con un color (tipo HONEYCOMB, activos) */
async function honeycomb_tejidos_maestro(req, res) {
  try {
    const pool = await sql.connect();
    const r = await pool.request().query(`
      select m.idrow as id, ltrim(rtrim(m.cod_solupyme)) as cod_solupyme, m.nombre, m.color, t.descripcion as tipo
      from dbo.SOL_TEJIDOS_MAESTRO m
      left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
      where m.activo = 1 and t.descripcion = 'HONEYCOMB'
      order by m.nombre, m.color`);
    res.json(r.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los tejidos del maestro' });
  }
}

async function honeycomb_colortejido_insert(req, res) {
  try {
    const { ColorTejido, idTipoTejido, Referencia, CodigoColor, Incremento } = req.body;


    if (!ColorTejido || !idTipoTejido) {
      return res.status(400).json({ error: 'ColorTejido e idTipoTejido son requeridos' });
    }


    const pool = await sql.connect();
    const maestro = await tejidoMaestroElegido(pool, req.body);
    if (maestro.error) return res.status(400).json({ error: maestro.error, message: maestro.error });
    const result = await pool.request()
      .input('ColorTejido', sql.NVarChar(100), ColorTejido)
      .input('idTipoTejido', sql.Int, idTipoTejido)
      .input('Referencia', sql.NVarChar(50), Referencia || null)
      .input('CodigoColor', sql.NVarChar(7), CodigoColor || null)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_ColorTejido_Insert');
    const idColorTejido = result.recordset[0].idColorTejido;
    await enlazarColorTejidoMaestro(pool, idColorTejido, maestro);

    res.json({ 
      success: true, 
      idColorTejido 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar color de tejido' });
  }
}

async function honeycomb_colortejido_update(req, res) {
  try {
    const { idColorTejido, ColorTejido, idTipoTejido, Referencia, CodigoColor, Incremento } = req.body;

    const pool = await sql.connect();
    const chk = await renombradoBloqueado(pool, 'colortejido', idColorTejido, ColorTejido);
    if (chk.error) return res.status(409).json({ error: chk.error, message: chk.error });
    const maestro = await tejidoMaestroElegido(pool, req.body);
    if (maestro.error) return res.status(400).json({ error: maestro.error, message: maestro.error });
    await pool.request()
      .input('idColorTejido', sql.Int, idColorTejido)
      .input('ColorTejido', sql.NVarChar(100), chk.nombre)
      .input('idTipoTejido', sql.Int, idTipoTejido)
      .input('Referencia', sql.NVarChar(50), Referencia || null)
      .input('CodigoColor', sql.NVarChar(7), CodigoColor || null)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_ColorTejido_Update');
    await enlazarColorTejidoMaestro(pool, idColorTejido, maestro);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar color de tejido' });
  }
}

async function honeycomb_colortejido_delete(req, res) {
  try {
    const { id } = req.params;

    const pool = await sql.connect();
    await pool.request()
      .input('idColorTejido', sql.Int, id)
      .execute('SP_Honeycomb_ColorTejido_Delete');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar color de tejido' });
  }
}

// COLORES DE PERFIL
async function honeycomb_colorperfil_insert(req, res) {
  try {
    const { ColorPerfil, Referencia, CodigoColor, Incremento } = req.body;

    if (!ColorPerfil) {
      return res.status(400).json({ error: 'ColorPerfil es requerido' });
    }

    const pool = await sql.connect();
    const result = await pool.request()
      .input('ColorPerfil', sql.NVarChar(100), ColorPerfil)
      .input('Referencia', sql.NVarChar(50), Referencia || null)
      .input('CodigoColor', sql.NVarChar(7), CodigoColor || null)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_ColorPerfil_Insert');

    res.json({ 
      success: true, 
      idColorPerfil: result.recordset[0].idColorPerfil 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al insertar color de perfil' });
  }
}

async function honeycomb_colorperfil_update(req, res) {
  try {
    const { idColorPerfil, ColorPerfil, Referencia, CodigoColor, Incremento } = req.body;

    const pool = await sql.connect();
    const chk = await renombradoBloqueado(pool, 'colorperfil', idColorPerfil, ColorPerfil);
    if (chk.error) return res.status(409).json({ error: chk.error, message: chk.error });
    await pool.request()
      .input('idColorPerfil', sql.Int, idColorPerfil)
      .input('ColorPerfil', sql.NVarChar(100), chk.nombre)
      .input('Referencia', sql.NVarChar(50), Referencia || null)
      .input('CodigoColor', sql.NVarChar(7), CodigoColor || null)
      .input('Incremento', sql.Decimal(12,2), Incremento)
      .execute('SP_Honeycomb_ColorPerfil_Update');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar color de perfil' });
  }
}

async function honeycomb_colorperfil_delete(req, res) {
  try {
    const { id } = req.params;

    const pool = await sql.connect();
    await pool.request()
      .input('idColorPerfil', sql.Int, id)
      .execute('SP_Honeycomb_ColorPerfil_Delete');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar color de perfil' });
  }
}

// IMPORT/EXPORT EXCEL
async function honeycomb_import_excel(req, res) {
  try {
    const { tipo, datos } = req.body;

    if (!tipo || !Array.isArray(datos) || datos.length === 0) {
      return res.status(400).json({ error: 'Tipo y datos son requeridos' });
    }

    const pool = await sql.connect();
    let insertados = 0;
    let errores = [];

    for (const item of datos) {
      try {
        if (tipo === 'tipotejido') {
          await pool.request()
            .input('TipoTejido', sql.NVarChar(100), item.TipoTejido)
            .execute('SP_Honeycomb_TipoTejido_Insert');
        } else if (tipo === 'colortejido') {
          await pool.request()
            .input('ColorTejido', sql.NVarChar(100), item.ColorTejido)
            .input('idTipoTejido', sql.Int, item.idTipoTejido)
            .input('Referencia', sql.NVarChar(50), item.Referencia || null)
            .input('CodigoColor', sql.NVarChar(7), item.CodigoColor || null)
            .execute('SP_Honeycomb_ColorTejido_Insert');
        } else if (tipo === 'colorperfil') {
          await pool.request()
            .input('ColorPerfil', sql.NVarChar(100), item.ColorPerfil)
            .input('Referencia', sql.NVarChar(50), item.Referencia || null)
            .input('CodigoColor', sql.NVarChar(7), item.CodigoColor || null)
            .execute('SP_Honeycomb_ColorPerfil_Insert');
        }
        insertados++;
      } catch (err) {
        errores.push({ item, error: err.message });
      }
    }

    res.json({ 
      success: true, 
      insertados, 
      errores: errores.length,
      detalleErrores: errores 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al importar datos' });
  }
}

async function honeycomb_export_excel(req, res) {
  try {
    const { tipo } = req.query;
    const pool = await sql.connect();
    let result;

    if (tipo === 'tipotejido') {
      result = await pool.request()
        .query('SELECT idTipoTejido, TipoTejido FROM sol_articulos_honeycomb_tipostejido ORDER BY TipoTejido');
    } else if (tipo === 'colortejido') {
      result = await pool.request()
        .execute('SP_Honeycomb_ColorTejido_GetAll');
    } else if (tipo === 'colorperfil') {
      result = await pool.request()
        .query('SELECT idColorPerfil, ColorPerfil, Referencia, CodigoColor FROM sol_articulos_honeycomb_coloresperfil ORDER BY ColorPerfil');
    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al exportar datos' });
  }
}

  // =============================================
// TARIFAS - CRUD
// =============================================

async function honeycomb_tarifas_get(req, res) {
  try {
    const { tipoTejido } = req.query;
    const pool = await sql.connect();

    const result = await pool.request()
      .input('tipoTejido', sql.Int, tipoTejido)
      .query(`
        SELECT * FROM SOL_ARTICULOS_TARIFA_HONEYCOMB
        WHERE TipoTejido = @tipoTejido
        ORDER BY Fila
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tarifas' });
  }
}

async function honeycomb_tarifa_update(req, res) {
  try {
    const tarifa = req.body;
    const pool = await sql.connect();

    await pool.request()
      .input('TipoTejido', sql.Int, tarifa.TipoTejido)
      .input('Fila', sql.Decimal(10, 2), tarifa.Fila)
      .input('Col_0_20', sql.Decimal(10, 2), tarifa.Col_0_20 || 0)
      .input('Col_0_40', sql.Decimal(10, 2), tarifa.Col_0_40 || 0)
      .input('Col_0_60', sql.Decimal(10, 2), tarifa.Col_0_60 || 0)
      .input('Col_0_80', sql.Decimal(10, 2), tarifa.Col_0_80 || 0)
      .input('Col_1_00', sql.Decimal(10, 2), tarifa.Col_1_00 || 0)
      .input('Col_1_20', sql.Decimal(10, 2), tarifa.Col_1_20 || 0)
      .input('Col_1_40', sql.Decimal(10, 2), tarifa.Col_1_40 || 0)
      .input('Col_1_60', sql.Decimal(10, 2), tarifa.Col_1_60 || 0)
      .input('Col_1_80', sql.Decimal(10, 2), tarifa.Col_1_80 || 0)
      .input('Col_2_00', sql.Decimal(10, 2), tarifa.Col_2_00 || 0)
      .input('Col_2_20', sql.Decimal(10, 2), tarifa.Col_2_20 || 0)
      .input('Col_2_40', sql.Decimal(10, 2), tarifa.Col_2_40 || 0)
      .input('Col_2_60', sql.Decimal(10, 2), tarifa.Col_2_60 || 0)
      .input('Col_2_80', sql.Decimal(10, 2), tarifa.Col_2_80 || 0)
      .input('Col_3_00', sql.Decimal(10, 2), tarifa.Col_3_00 || 0)
      .query(`
        UPDATE SOL_ARTICULOS_TARIFA_HONEYCOMB
        SET Col_0_20 = @Col_0_20, Col_0_40 = @Col_0_40, Col_0_60 = @Col_0_60,
            Col_0_80 = @Col_0_80, Col_1_00 = @Col_1_00, Col_1_20 = @Col_1_20,
            Col_1_40 = @Col_1_40, Col_1_60 = @Col_1_60, Col_1_80 = @Col_1_80,
            Col_2_00 = @Col_2_00, Col_2_20 = @Col_2_20, Col_2_40 = @Col_2_40,
            Col_2_60 = @Col_2_60, Col_2_80 = @Col_2_80, Col_3_00 = @Col_3_00
        WHERE TipoTejido = @TipoTejido AND Fila = @Fila
      `);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tarifa' });
  }
}

async function honeycomb_tarifas_update(req, res) {
  try {
    const tarifas = req.body;
    const pool = await sql.connect();

    for (const tarifa of tarifas) {
      await pool.request()
        .input('TipoTejido', sql.Int, tarifa.TipoTejido)
        .input('Fila', sql.Decimal(10, 2), tarifa.Fila)
        .input('Col_0_20', sql.Decimal(10, 2), tarifa.Col_0_20 || 0)
        .input('Col_0_40', sql.Decimal(10, 2), tarifa.Col_0_40 || 0)
        .input('Col_0_60', sql.Decimal(10, 2), tarifa.Col_0_60 || 0)
        .input('Col_0_80', sql.Decimal(10, 2), tarifa.Col_0_80 || 0)
        .input('Col_1_00', sql.Decimal(10, 2), tarifa.Col_1_00 || 0)
        .input('Col_1_20', sql.Decimal(10, 2), tarifa.Col_1_20 || 0)
        .input('Col_1_40', sql.Decimal(10, 2), tarifa.Col_1_40 || 0)
        .input('Col_1_60', sql.Decimal(10, 2), tarifa.Col_1_60 || 0)
        .input('Col_1_80', sql.Decimal(10, 2), tarifa.Col_1_80 || 0)
        .input('Col_2_00', sql.Decimal(10, 2), tarifa.Col_2_00 || 0)
        .input('Col_2_20', sql.Decimal(10, 2), tarifa.Col_2_20 || 0)
        .input('Col_2_40', sql.Decimal(10, 2), tarifa.Col_2_40 || 0)
        .input('Col_2_60', sql.Decimal(10, 2), tarifa.Col_2_60 || 0)
        .input('Col_2_80', sql.Decimal(10, 2), tarifa.Col_2_80 || 0)
        .input('Col_3_00', sql.Decimal(10, 2), tarifa.Col_3_00 || 0)
        .query(`
          UPDATE SOL_ARTICULOS_TARIFA_HONEYCOMB
          SET Col_0_20 = @Col_0_20, Col_0_40 = @Col_0_40, Col_0_60 = @Col_0_60,
              Col_0_80 = @Col_0_80, Col_1_00 = @Col_1_00, Col_1_20 = @Col_1_20,
              Col_1_40 = @Col_1_40, Col_1_60 = @Col_1_60, Col_1_80 = @Col_1_80,
              Col_2_00 = @Col_2_00, Col_2_20 = @Col_2_20, Col_2_40 = @Col_2_40,
              Col_2_60 = @Col_2_60, Col_2_80 = @Col_2_80, Col_3_00 = @Col_3_00
          WHERE TipoTejido = @TipoTejido AND Fila = @Fila
        `);
    }

    res.json({ success: true, message: 'Tarifas actualizadas correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tarifas' });
  }
}


// ════════════════════════════════════════════════════════════════
// TIPOS DE ARTÍCULO
// ════════════════════════════════════════════════════════════════

async function getTiposArticulo(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT Id, Nombre, Descripcion, TablaDestino, Activo, FechaAlta
      FROM SOL_ARTICULOS_HONEYCOMB_TIPO_ARTICULO
      WHERE Activo = 1
      ORDER BY Nombre
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tipos de artículo' });
  }
}

async function saveTipoArticulo(req, res) {
  try {
    const { Nombre, Descripcion, TablaDestino, Activo } = req.body;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Descripcion', sql.NVarChar(255), Descripcion || null)
      .input('TablaDestino', sql.NVarChar(100), TablaDestino || null)
      .input('Activo', sql.Bit, Activo !== false ? 1 : 0)
      .query(`
        INSERT INTO SOL_ARTICULOS_HONEYCOMB_TIPO_ARTICULO (Nombre, Descripcion, TablaDestino, Activo)
        OUTPUT INSERTED.Id
        VALUES (@Nombre, @Descripcion, @TablaDestino, @Activo)
      `);
    res.json({ success: true, Id: result.recordset[0].Id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear tipo de artículo' });
  }
}

async function updateTipoArticulo(req, res) {
  try {
    const { id } = req.params;
    const { Nombre, Descripcion, TablaDestino, Activo } = req.body;
    const pool = await sql.connect();
    await pool.request()
      .input('Id', sql.Int, id)
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Descripcion', sql.NVarChar(255), Descripcion || null)
      .input('TablaDestino', sql.NVarChar(100), TablaDestino || null)
      .input('Activo', sql.Bit, Activo !== false ? 1 : 0)
      .query(`
        UPDATE SOL_ARTICULOS_HONEYCOMB_TIPO_ARTICULO
        SET Nombre = @Nombre, Descripcion = @Descripcion,
            TablaDestino = @TablaDestino, Activo = @Activo
        WHERE Id = @Id
      `);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tipo de artículo' });
  }
}

async function deleteTipoArticulo(req, res) {
  try {
    const { id } = req.params;
    const pool = await sql.connect();
    // Soft delete
    await pool.request()
      .input('Id', sql.Int, id)
      .query(`UPDATE SOL_ARTICULOS_HONEYCOMB_TIPO_ARTICULO SET Activo = 0 WHERE Id = @Id`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar tipo de artículo' });
  }
}

// ════════════════════════════════════════════════════════════════
// ATRIBUTOS POR TIPO
// ════════════════════════════════════════════════════════════════

async function getAtributosByTipo(req, res) {
  try {
    const { idTipo } = req.params;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('IdTipoArticulo', sql.Int, idTipo)
      .query(`
        SELECT Id, IdTipoArticulo, Nombre, TipoDato,
               TablaFK, ColumnaFKId, ColumnaFKDesc,
               Obligatorio, Orden, Activo
        FROM SOL_ARTICULOS_HONEYCOMB_TIPO_ATRIBUTO
        WHERE IdTipoArticulo = @IdTipoArticulo AND Activo = 1
        ORDER BY Orden, Nombre
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener atributos' });
  }
}

async function saveTipoAtributo(req, res) {
  try {
    const { IdTipoArticulo, Nombre, TipoDato, TablaFK, ColumnaFKId, ColumnaFKDesc, Obligatorio, Orden } = req.body;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('IdTipoArticulo', sql.Int, IdTipoArticulo)
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('TipoDato', sql.NVarChar(10), TipoDato)
      .input('TablaFK', sql.NVarChar(100), TablaFK || null)
      .input('ColumnaFKId', sql.NVarChar(100), ColumnaFKId || 'Id')
      .input('ColumnaFKDesc', sql.NVarChar(100), ColumnaFKDesc || 'Nombre')
      .input('Obligatorio', sql.Bit, Obligatorio ? 1 : 0)
      .input('Orden', sql.Int, Orden || 0)
      .query(`
        INSERT INTO SOL_ARTICULOS_HONEYCOMB_TIPO_ATRIBUTO
          (IdTipoArticulo, Nombre, TipoDato, TablaFK, ColumnaFKId, ColumnaFKDesc, Obligatorio, Orden)
        OUTPUT INSERTED.Id
        VALUES (@IdTipoArticulo, @Nombre, @TipoDato, @TablaFK, @ColumnaFKId, @ColumnaFKDesc, @Obligatorio, @Orden)
      `);
    res.json({ success: true, Id: result.recordset[0].Id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear atributo' });
  }
}

async function updateTipoAtributo(req, res) {
  try {
    const { id } = req.params;
    const { Nombre, TipoDato, TablaFK, ColumnaFKId, ColumnaFKDesc, Obligatorio, Orden } = req.body;
    const pool = await sql.connect();
    await pool.request()
      .input('Id', sql.Int, id)
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('TipoDato', sql.NVarChar(10), TipoDato)
      .input('TablaFK', sql.NVarChar(100), TablaFK || null)
      .input('ColumnaFKId', sql.NVarChar(100), ColumnaFKId || 'Id')
      .input('ColumnaFKDesc', sql.NVarChar(100), ColumnaFKDesc || 'Nombre')
      .input('Obligatorio', sql.Bit, Obligatorio ? 1 : 0)
      .input('Orden', sql.Int, Orden || 0)
      .query(`
        UPDATE SOL_ARTICULOS_HONEYCOMB_TIPO_ATRIBUTO
        SET Nombre = @Nombre, TipoDato = @TipoDato, TablaFK = @TablaFK,
            ColumnaFKId = @ColumnaFKId, ColumnaFKDesc = @ColumnaFKDesc,
            Obligatorio = @Obligatorio, Orden = @Orden
        WHERE Id = @Id
      `);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar atributo' });
  }
}

async function deleteTipoAtributo(req, res) {
  try {
    const { id } = req.params;
    const pool = await sql.connect();
    await pool.request()
      .input('Id', sql.Int, id)
      .query(`UPDATE SOL_ARTICULOS_HONEYCOMB_TIPO_ATRIBUTO SET Activo = 0 WHERE Id = @Id`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar atributo' });
  }
}

// ════════════════════════════════════════════════════════════════
// ARTÍCULOS
// ════════════════════════════════════════════════════════════════

async function getArticulos(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT
        a.IdArticuloERP, a.CodSol, a.Descripcion,
        a.IdTipoArticulo, a.Activo,
        ISNULL(t.Nombre, '') AS NombreTipoArticulo
      FROM SOL_ARTICULOS_HONEYCOMB_ARTICULO a
      LEFT JOIN SOL_ARTICULOS_HONEYCOMB_TIPO_ARTICULO t ON t.Id = a.IdTipoArticulo
      ORDER BY a.Descripcion
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener artículos' });
  }
}

async function asignarTipoArticulo(req, res) {
  try {
    const { idArticuloERP, idTipoArticulo } = req.body;
    const pool = await sql.connect();
    await pool.request()
      .input('IdArticuloERP', sql.Int, idArticuloERP)
      .input('IdTipoArticulo', sql.Int, idTipoArticulo)
      .query(`
        UPDATE SOL_ARTICULOS_HONEYCOMB_ARTICULO
        SET IdTipoArticulo = @IdTipoArticulo
        WHERE IdArticuloERP = @IdArticuloERP
      `);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar tipo' });
  }
}

async function asignarTipoMasivo(req, res) {
  try {
    const { ids, idTipoArticulo } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: 'Sin artículos' });

    const pool = await sql.connect();
    const idsList = ids.map(id => parseInt(id)).join(',');
    await pool.request()
      .input('IdTipoArticulo', sql.Int, idTipoArticulo)
      .query(`
        UPDATE SOL_ARTICULOS_HONEYCOMB_ARTICULO
        SET IdTipoArticulo = @IdTipoArticulo
        WHERE IdArticuloERP IN (${idsList})
      `);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar tipo masivo' });
  }
}

// ════════════════════════════════════════════════════════════════
// VALORES DE ATRIBUTOS
// ════════════════════════════════════════════════════════════════

async function getValoresArticulo(req, res) {
  try {
    const { idArticuloERP } = req.params;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('IdArticuloERP', sql.Int, idArticuloERP)
      .query(`
        SELECT
          v.Id, v.IdArticuloERP, v.IdTipoAtributo,
          a.Nombre AS NombreAtributo, a.TipoDato,
          a.TablaFK, a.ColumnaFKId, a.ColumnaFKDesc,
          v.ValorTexto, v.ValorInt, v.ValorDecimal, v.ValorFK
        FROM SOL_ARTICULOS_HONEYCOMB_ARTICULO_VALOR v
        JOIN SOL_ARTICULOS_HONEYCOMB_TIPO_ATRIBUTO a ON a.Id = v.IdTipoAtributo
        WHERE v.IdArticuloERP = @IdArticuloERP
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener valores' });
  }
}

async function saveValoresArticulo(req, res) {
  try {
    const { idArticuloERP } = req.params;
    const { valores } = req.body;
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      for (const v of valores) {
        const req2 = new sql.Request(transaction);
        await req2
          .input('IdArticuloERP', sql.Int, idArticuloERP)
          .input('IdTipoAtributo', sql.Int, v.IdTipoAtributo)
          .input('ValorTexto', sql.NVarChar(255), v.ValorTexto || null)
          .input('ValorInt', sql.Int, v.ValorInt !== undefined ? v.ValorInt : null)
          .input('ValorDecimal', sql.Decimal(10, 4), v.ValorDecimal !== undefined ? v.ValorDecimal : null)
          .input('ValorFK', sql.Int, v.ValorFK !== undefined ? v.ValorFK : null)
          .query(`
            MERGE SOL_ARTICULOS_HONEYCOMB_ARTICULO_VALOR AS target
            USING (SELECT @IdArticuloERP AS IdArticuloERP, @IdTipoAtributo AS IdTipoAtributo) AS source
            ON target.IdArticuloERP = source.IdArticuloERP AND target.IdTipoAtributo = source.IdTipoAtributo
            WHEN MATCHED THEN
              UPDATE SET ValorTexto = @ValorTexto, ValorInt = @ValorInt,
                         ValorDecimal = @ValorDecimal, ValorFK = @ValorFK
            WHEN NOT MATCHED THEN
              INSERT (IdArticuloERP, IdTipoAtributo, ValorTexto, ValorInt, ValorDecimal, ValorFK)
              VALUES (@IdArticuloERP, @IdTipoAtributo, @ValorTexto, @ValorInt, @ValorDecimal, @ValorFK);
          `);
      }
      await transaction.commit();
      res.json({ success: true });
    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar valores' });
  }
}

// ════════════════════════════════════════════════════════════════
// FK OPTIONS DINÁMICO
// ════════════════════════════════════════════════════════════════

async function getFKOptions(req, res) {
  try {
    const { tabla, columnaId, columnaDesc } = req.query;

    // Whitelist de tablas permitidas para evitar SQL injection
    const tablasPermitidas = [
      'SOL_ARTICULOS_HONEYCOMB_TIPOS_TEJIDO',
      'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO',
      'SOL_ARTICULOS_HONEYCOMB_COLORESPERFIL',
      'SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO'
    ];

    if (!tablasPermitidas.includes(tabla.toUpperCase())) {
      return res.status(400).json({ error: `Tabla no permitida: ${tabla}` });
    }

    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT ${columnaId} AS Id, ${columnaDesc} AS Descripcion
      FROM ${tabla}
      ORDER BY ${columnaDesc}
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener opciones FK' });
  }
}

async function getTablasFK(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT Id, Nombre, Tabla, ColumnaId, ColumnaDesc, Activo
      FROM SOL_ARTICULOS_HONEYCOMB_TABLAS_FK
      WHERE Activo = 1
      ORDER BY Nombre
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener catálogo FK' });
  }
}

async function saveTablaFK(req, res) {
  try {
    const { Nombre, Tabla, ColumnaId, ColumnaDesc } = req.body;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('Nombre',      sql.NVarChar(100), Nombre)
      .input('Tabla',       sql.NVarChar(100), Tabla)
      .input('ColumnaId',   sql.NVarChar(100), ColumnaId)
      .input('ColumnaDesc', sql.NVarChar(100), ColumnaDesc)
      .query(`
        INSERT INTO SOL_ARTICULOS_HONEYCOMB_TABLAS_FK (Nombre, Tabla, ColumnaId, ColumnaDesc)
        OUTPUT INSERTED.Id
        VALUES (@Nombre, @Tabla, @ColumnaId, @ColumnaDesc)
      `);
    res.json({ success: true, Id: result.recordset[0].Id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear tabla FK' });
  }
}

async function updateTablaFK(req, res) {
  try {
    const { id } = req.params;
    const { Nombre, Tabla, ColumnaId, ColumnaDesc, Activo } = req.body;
    const pool = await sql.connect();
    await pool.request()
      .input('Id',          sql.Int,           id)
      .input('Nombre',      sql.NVarChar(100), Nombre)
      .input('Tabla',       sql.NVarChar(100), Tabla)
      .input('ColumnaId',   sql.NVarChar(100), ColumnaId)
      .input('ColumnaDesc', sql.NVarChar(100), ColumnaDesc)
      .input('Activo',      sql.Bit,           Activo !== false ? 1 : 0)
      .query(`
        UPDATE SOL_ARTICULOS_HONEYCOMB_TABLAS_FK
        SET Nombre = @Nombre, Tabla = @Tabla,
            ColumnaId = @ColumnaId, ColumnaDesc = @ColumnaDesc, Activo = @Activo
        WHERE Id = @Id
      `);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar tabla FK' });
  }
}

async function deleteTablaFK(req, res) {
  try {
    const { id } = req.params;
    const pool = await sql.connect();
    await pool.request()
      .input('Id', sql.Int, id)
      .query(`UPDATE SOL_ARTICULOS_HONEYCOMB_TABLAS_FK SET Activo = 0 WHERE Id = @Id`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar tabla FK' });
  }
}

/* Buscador de artículos Solupyme para el campo Referencia (código + descripción).
   Solo ayuda a escribir el código; Referencia sigue siendo texto. */
async function honeycomb_articulos_buscar(req, res) {
  try {
    const q = String(req.query.q || '').trim().substring(0, 50);
    if (q.length < 2) {
      return res.json([]);
    }

    // Cada palabra debe aparecer en el código o en la descripción ("honeycomb blanco").
    // %, _ y [ se buscan como texto, no como comodines del like
    const pool = await sql.connect();
    const request = pool.request();
    const filtros = q.split(/\s+/).slice(0, 5).map((palabra, i) => {
      request.input('w' + i, sql.NVarChar(160), '%' + palabra.replace(/[[%_]/g, c => '[' + c + ']') + '%');
      return `and (a.cod_solupyme like @w${i} or a.descripcion like @w${i})`;
    });
    const result = await request.query(`
        select top 50 ltrim(rtrim(a.cod_solupyme)) as codigo, upper(a.descripcion) as descripcion
        from articulos a
        where isnull(ltrim(rtrim(a.cod_solupyme)), '') <> ''
          ${filtros.join('\n          ')}
        order by a.cod_solupyme`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar artículos' });
  }
}



/* Cuáles de los códigos (?codigos=a,b,c) existen en Solupyme, con su descripción.
   admin-data marca en rojo las Referencias que no vuelven aquí. */
async function honeycomb_articulos_existen(req, res) {
  try {
    const codigos = [...new Set(String(req.query.codigos || '').split(',')
      .map(c => c.trim().substring(0, 25))
      .filter(c => c !== ''))].slice(0, 500);
    if (codigos.length === 0) {
      return res.json([]);
    }

    const pool = await sql.connect();
    const request = pool.request();
    codigos.forEach((c, i) => request.input('c' + i, sql.VarChar(25), c));
    const result = await request.query(`
        select ltrim(rtrim(a.cod_solupyme)) as codigo, upper(a.descripcion) as descripcion
        from articulos a
        where ltrim(rtrim(a.cod_solupyme)) in (${codigos.map((c, i) => '@c' + i).join(',')})`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al comprobar artículos' });
  }
}

module.exports = {
  honeycomb_articulos_existen,
  honeycomb_articulos_buscar,
  honeycomb_obtener_tarifa,
  incrementosHoneycomb,
  precioHoneycomb,
  honeycomb_tejidos_maestro,
  honeycomb_obtener_precio_lote,
  honeycomb_obtener_tarifa_tipotejido,
  honeycomb_actualizar_tarifa_tipotejido,
  honeycomb_snapshot,
  honeycomb_historial,
  honeycomb_historial_restaurar,
  honeycomb_tipostejido,
  honeycomb_colorestejido,
  honeycomb_coloresperfil,
  honeycomb_obtener_imagen,
  honeycomb_upload_image,
  honeycomb_upload_image_base64,
  honeycomb_delete_image,
  honeycomb_list_images,
  honeycomb_tipotejido_insert,
  honeycomb_tipotejido_update,
  honeycomb_tipotejido_delete,
  honeycomb_colortejido_getall,
  honeycomb_colortejido_insert,
  honeycomb_colortejido_update,
  honeycomb_colortejido_delete,
  honeycomb_colorperfil_insert,
  honeycomb_colorperfil_update,
  honeycomb_colorperfil_delete,
  honeycomb_import_excel,
  honeycomb_export_excel,
  honeycomb_tarifas_get,
  honeycomb_tarifa_update,
  honeycomb_tarifas_update,
  honeycomb_tiposaccionamiento,
  honeycomb_tipoaccionamiento_insert,
  honeycomb_tipoaccionamiento_update,
  honeycomb_tipoaccionamiento_delete,
  getTiposArticulo,
  saveTipoArticulo,
  updateTipoArticulo,
  deleteTipoArticulo,
  getAtributosByTipo,
  saveTipoAtributo,
  updateTipoAtributo,
  deleteTipoAtributo,
  getArticulos,
  asignarTipoArticulo,
  asignarTipoMasivo,
  getValoresArticulo,
  saveValoresArticulo,
  getFKOptions,
  getTablasFK,
  saveTablaFK,
  updateTablaFK,
  deleteTablaFK
}