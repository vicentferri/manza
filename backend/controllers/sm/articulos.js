'use strict'

var sql = require('mssql');

function search_articulos(req,res){

    var sqlquery = "select idrow,descripcion,cod_solupyme,fam_solupyme,precio_coste1,precio_coste,precio_venta,";
      sqlquery += " plazo_entrega,tiempo_fabricacion,clasificacion,synchro_date,tipoprod,elemento,descelemento,";
      sqlquery += " descunidad,consumo,margen,vertical,tipocalculo,desctipocalculo,tipoatributo,descatributo ";
      sqlquery += " from busqueda_articulos ";

    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null)
        {
            res.status(200).send({ Table : result.recordset });
        }
        else
        {
            res.status(500).send({ message : err2 });	
        }
    });
}

module.exports = {
    search_articulos
}