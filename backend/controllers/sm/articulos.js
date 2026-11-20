'use strict'

var sql = require('mssql');

/* Texto de búsqueda para LIKE: sin espacios sobrantes y con los comodines de SQL Server (% _ [) como texto normal */
function patronLike(valor) {
    return '%' + String(valor).trim().replace(/[\[%_]/g, '[$&]') + '%';
}

/* Buscador de artículos (shared/search-artikel).
   Devuelve únicamente los artículos marcados con '*' en Solupyme (modelo = '*') y no bloqueados (bloqueado = 0),
   sincronizados desde las funciones del ERP [dbo].[Articulo_Modelo](@Codart) y [dbo].[Articulo_bloqueado](@Codart).
   body { criterio, alias, barras }:
   - criterio: descripción; varios criterios separados por + (tienen que estar todos)
   - alias: "Referencia" de la pantalla, contra el código Solupyme o el alias del artículo
   - barras: código de barras */
async function search_articulos(req, res) {
    var body = req.body || {};
    var criterios = String(body.criterio == null ? '' : body.criterio).split('+')
        .map(c => c.trim())
        .filter(c => c !== '');
    var alias = String(body.alias == null ? '' : body.alias).trim();
    var barras = String(body.barras == null ? '' : body.barras).trim();

    try {
        var pool = await sql.connect();
        var request = pool.request();
        var filtros = [
            "ltrim(rtrim(isnull(b.modelo, ''))) = '*'",
            "isnull(b.bloqueado, 0) = 0"
        ];

        criterios.forEach((c, i) => {
            request.input('criterio' + i, sql.VarChar(200), patronLike(c));
            filtros.push('b.descripcion like @criterio' + i);
        });
        if (alias !== '') {
            request.input('alias', sql.VarChar(100), patronLike(alias));
            filtros.push('(b.cod_solupyme like @alias or a.alias like @alias)');
        }
        if (barras !== '') {
            request.input('barras', sql.VarChar(100), patronLike(barras));
            filtros.push('a.barras like @barras');
        }

        var sqlquery = "select b.idrow,b.descripcion,b.cod_solupyme,b.fam_solupyme,b.precio_coste1,b.precio_coste,b.precio_venta,";
        sqlquery += " b.plazo_entrega,b.tiempo_fabricacion,b.clasificacion,b.synchro_date,b.tipoprod,b.elemento,b.descelemento,";
        sqlquery += " b.descunidad,b.consumo,b.margen,b.vertical,b.tipocalculo,b.desctipocalculo,b.tipoatributo,b.descatributo";
        sqlquery += " from busqueda_articulos b";
        if (alias !== '' || barras !== '') {
            sqlquery += " join ARTICULOS a on a.idrow = b.idrow";
        }
        sqlquery += " where " + filtros.join(' and ');

        var result = await request.query(sqlquery);
        res.status(200).send({ Table: result.recordset });
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ message: 'No se han podido cargar los artículos' });
    }
}

/* Refresca modelo (*) y bloqueado en dbo.ARTICULOS consultando las funciones del ERP
   [B98247596].[dbo].[Articulo_Modelo] y [B98247596].[dbo].[Articulo_bloqueado] en [88.30.3.157] */
async function sincronizar_erp(req, res) {
    try {
        var pool = await sql.connect();
        await pool.request().execute('sp_articulos_sincronizar_erp');
        res.status(200).send({ message: 'OK' });
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ message: 'No se ha podido sincronizar con el ERP' });
    }
}

module.exports = {
    search_articulos,
    sincronizar_erp
}
