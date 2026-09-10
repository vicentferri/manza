'use strict'

var sql = require('mssql');
var fs = require('fs');
var path = require('path');
var sharp = require('sharp');

var UPLOADS_DIR = path.join(__dirname, '../../uploads_impresion_digital');
var ORIGINALES_DIR = path.join(UPLOADS_DIR, 'originales');
var WEB_DIR = path.join(UPLOADS_DIR, 'web');
var PERSONALIZACIONES_DIR = path.join(UPLOADS_DIR, 'personalizaciones');

[ORIGINALES_DIR, WEB_DIR, PERSONALIZACIONES_DIR].forEach(function (dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

var WEB_MAX_SIZE = 1600;
var WEB_QUALITY = 82;

function toBit(value, def) {
    if (value === undefined || value === null || value === '') { return def; }
    return (value === true || value === 1 || value === '1' || value === 'true') ? 1 : 0;
}

function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function colecciones(req, res) {
    try {
        var request = new sql.Request();
        var result = await request.query(`
            SELECT c.idrow, c.nombre, c.activo, c.fecha_creacion,
                   (SELECT COUNT(*) FROM impresion_digital_imagenes i WHERE i.coleccion_id = c.idrow) AS num_imagenes
            FROM impresion_digital_colecciones c
            ORDER BY c.nombre
        `);
        res.status(200).send({ Table: result.recordset });
    } catch (err) {
        console.error('[GET /impresion_digital_colecciones]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

async function coleccion_put(req, res) {
    try {
        var idrow = req.body.idrow;
        var nombre = (req.body.nombre || '').trim();
        var activo = toBit(req.body.activo, 1);

        if (!nombre) {
            return res.status(400).send({ message: 'KO', detail: 'El nombre es obligatorio' });
        }

        var request = new sql.Request();
        request.input('nombre', sql.VarChar(255), nombre);
        request.input('activo', sql.Bit, activo);

        if (idrow) {
            request.input('idrow', sql.Int, idrow);
            await request.query(`
                UPDATE impresion_digital_colecciones
                SET nombre = @nombre, activo = @activo
                WHERE idrow = @idrow
            `);
            return res.status(200).send({ message: 'OK', idrow: idrow });
        }

        var result = await request.query(`
            INSERT INTO impresion_digital_colecciones (nombre, activo)
            OUTPUT INSERTED.idrow
            VALUES (@nombre, @activo)
        `);
        res.status(200).send({ message: 'OK', idrow: result.recordset[0].idrow });
    } catch (err) {
        console.error('[POST /impresion_digital_coleccion]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

async function coleccion_del(req, res) {
    try {
        var idrow = req.body.idrow;
        var request = new sql.Request();
        request.input('idrow', sql.Int, idrow);

        var check = await request.query(`SELECT COUNT(*) AS total FROM impresion_digital_imagenes WHERE coleccion_id = @idrow`);
        if (check.recordset[0].total > 0) {
            return res.status(400).send({ message: 'KO', detail: 'La colección tiene imágenes asociadas' });
        }

        await request.query(`DELETE FROM impresion_digital_colecciones WHERE idrow = @idrow`);
        res.status(200).send({ message: 'OK' });
    } catch (err) {
        console.error('[POST /impresion_digital_coleccion_del]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

async function imagenes(req, res) {
    try {
        var coleccionId = req.query.coleccion_id ? parseInt(req.query.coleccion_id, 10) : null;
        var activo = req.query.activo;
        var pagina = parseInt(req.query.pagina, 10) || 1;
        var porPagina = parseInt(req.query.porPagina, 10) || 24;
        var offset = (pagina - 1) * porPagina;

        var where = [];
        var request = new sql.Request();

        if (coleccionId) {
            where.push('i.coleccion_id = @coleccionId');
            request.input('coleccionId', sql.Int, coleccionId);
        }
        if (activo === '0' || activo === '1') {
            where.push('i.activo = @activo');
            request.input('activo', sql.Bit, parseInt(activo, 10));
        }

        var whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : '';

        request.input('offset', sql.Int, offset);
        request.input('porPagina', sql.Int, porPagina);

        var result = await request.query(`
            SELECT i.idrow, i.coleccion_id, c.nombre AS coleccion_nombre, i.nombre, i.precio, i.activo,
                   i.personalizable, i.archivo_web, i.archivo_original, i.ancho, i.alto, i.fecha_creacion,
                   COUNT(*) OVER() AS total_registros
            FROM impresion_digital_imagenes i
            INNER JOIN impresion_digital_colecciones c ON c.idrow = i.coleccion_id
            ${whereSql}
            ORDER BY i.fecha_creacion DESC
            OFFSET @offset ROWS FETCH NEXT @porPagina ROWS ONLY
        `);

        var total = result.recordset.length ? result.recordset[0].total_registros : 0;
        res.status(200).send({ Table: result.recordset, total: total, pagina: pagina, porPagina: porPagina });
    } catch (err) {
        console.error('[GET /impresion_digital_imagenes]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

async function imagen_upload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'KO', detail: 'No se recibió ningún archivo' });
        }

        var coleccionId = req.body.coleccion_id ? parseInt(req.body.coleccion_id, 10) : null;
        var nombreColeccionNueva = (req.body.coleccion_nueva || '').trim();
        var nombre = (req.body.nombre || req.file.originalname).trim();
        var precio = parseFloat(req.body.precio) || 0;
        var activo = toBit(req.body.activo, 1);
        var personalizable = toBit(req.body.personalizable, 0);

        if (nombreColeccionNueva) {
            var insertColeccion = new sql.Request();
            insertColeccion.input('nombre', sql.VarChar(255), nombreColeccionNueva);
            insertColeccion.input('activo', sql.Bit, 1);
            var coleccionResult = await insertColeccion.query(`
                INSERT INTO impresion_digital_colecciones (nombre, activo)
                OUTPUT INSERTED.idrow
                VALUES (@nombre, @activo)
            `);
            coleccionId = coleccionResult.recordset[0].idrow;
        }

        if (!coleccionId) {
            fs.unlink(req.file.path, function () { });
            return res.status(400).send({ message: 'KO', detail: 'Debe indicar una colección' });
        }

        var webFilename = path.basename(req.file.filename, path.extname(req.file.filename)) + '.jpg';

        var metadata = await sharp(req.file.path)
            .resize({ width: WEB_MAX_SIZE, height: WEB_MAX_SIZE, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: WEB_QUALITY })
            .toFile(path.join(WEB_DIR, webFilename));

        var request = new sql.Request();
        request.input('coleccionId', sql.Int, coleccionId);
        request.input('nombre', sql.VarChar(255), nombre);
        request.input('precio', sql.Decimal(10, 2), precio);
        request.input('activo', sql.Bit, activo);
        request.input('personalizable', sql.Bit, personalizable);
        request.input('archivoWeb', sql.VarChar(255), 'web/' + webFilename);
        request.input('archivoOriginal', sql.VarChar(255), 'originales/' + req.file.filename);
        request.input('ancho', sql.Int, metadata.width);
        request.input('alto', sql.Int, metadata.height);

        var result = await request.query(`
            INSERT INTO impresion_digital_imagenes
                (coleccion_id, nombre, precio, activo, personalizable, archivo_web, archivo_original, ancho, alto)
            OUTPUT INSERTED.idrow
            VALUES (@coleccionId, @nombre, @precio, @activo, @personalizable, @archivoWeb, @archivoOriginal, @ancho, @alto)
        `);

        res.status(200).send({ message: 'OK', idrow: result.recordset[0].idrow, coleccion_id: coleccionId });
    } catch (err) {
        console.error('[POST /impresion_digital_imagen]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

async function imagen_update(req, res) {
    try {
        var idrow = req.body.idrow;
        var coleccionId = req.body.coleccion_id;
        var nombre = (req.body.nombre || '').trim();
        var precio = parseFloat(req.body.precio) || 0;
        var activo = toBit(req.body.activo, 1);
        var personalizable = toBit(req.body.personalizable, 0);

        var request = new sql.Request();
        request.input('idrow', sql.Int, idrow);
        request.input('coleccionId', sql.Int, coleccionId);
        request.input('nombre', sql.VarChar(255), nombre);
        request.input('precio', sql.Decimal(10, 2), precio);
        request.input('activo', sql.Bit, activo);
        request.input('personalizable', sql.Bit, personalizable);

        await request.query(`
            UPDATE impresion_digital_imagenes
            SET coleccion_id = @coleccionId, nombre = @nombre, precio = @precio,
                activo = @activo, personalizable = @personalizable
            WHERE idrow = @idrow
        `);

        res.status(200).send({ message: 'OK' });
    } catch (err) {
        console.error('[POST /impresion_digital_imagen_update]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

async function imagen_del(req, res) {
    try {
        var idrow = req.body.idrow;
        var request = new sql.Request();
        request.input('idrow', sql.Int, idrow);

        var result = await request.query(`SELECT archivo_web, archivo_original FROM impresion_digital_imagenes WHERE idrow = @idrow`);

        if (!result.recordset[0]) {
            return res.status(404).send({ message: 'KO', detail: 'No existe la imagen' });
        }

        var row = result.recordset[0];

        var delRequest = new sql.Request();
        delRequest.input('idrow', sql.Int, idrow);
        await delRequest.query(`DELETE FROM impresion_digital_imagenes WHERE idrow = @idrow`);

        [row.archivo_web, row.archivo_original].forEach(function (rel) {
            fs.unlink(path.join(UPLOADS_DIR, rel), function (err) { if (err) { console.error(err); } });
        });

        res.status(200).send({ message: 'OK' });
    } catch (err) {
        console.error('[POST /impresion_digital_imagen_del]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

async function imagen_preview(req, res) {
    try {
        var imagenId = parseInt(req.body.imagen_id, 10);
        var texto = req.body.texto || '';
        var x = parseFloat(req.body.x) || 0;
        var y = parseFloat(req.body.y) || 0;
        var fontSize = parseFloat(req.body.fontSize) || 32;
        var fontFamily = req.body.fontFamily || 'Arial';
        var color = req.body.color || '#000000';

        var request = new sql.Request();
        request.input('idrow', sql.Int, imagenId);
        var result = await request.query(`SELECT archivo_web FROM impresion_digital_imagenes WHERE idrow = @idrow`);

        if (!result.recordset[0]) {
            return res.status(404).send({ message: 'KO', detail: 'No existe la imagen' });
        }

        var imagePath = path.join(UPLOADS_DIR, result.recordset[0].archivo_web);
        var baseImage = sharp(imagePath);
        var baseMetadata = await baseImage.metadata();

        var svg = `<svg width="${baseMetadata.width}" height="${baseMetadata.height}" xmlns="http://www.w3.org/2000/svg">
            <text x="${x}" y="${y + fontSize}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" fill="${escapeXml(color)}">${escapeXml(texto)}</text>
        </svg>`;

        var composed = await baseImage
            .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
            .png()
            .toBuffer();

        var previewName = 'preview_' + imagenId + '_' + Date.now() + '.png';
        fs.writeFile(path.join(PERSONALIZACIONES_DIR, previewName), composed, function () { });

        res.status(200).send({ message: 'OK', previewUrl: '/uploads_impresion_digital/personalizaciones/' + previewName });
    } catch (err) {
        console.error('[POST /impresion_digital_imagen_preview]', err);
        res.status(500).send({ message: 'KO', detail: err.message });
    }
}

module.exports = {
    colecciones,
    coleccion_put,
    coleccion_del,
    imagenes,
    imagen_upload,
    imagen_update,
    imagen_del,
    imagen_preview
};
