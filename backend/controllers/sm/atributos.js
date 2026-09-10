'use strict'

var sql = require('mssql');

function tipoatributo(req,res){

    var sqlquery = "select idrow,descripcion from articulos_tipo_atributo order by descripcion";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });   
            }
    });

}


function atributo_details(req,res){

    let idrow  = req.params.idrow;

    var sqlquery = "select id,atributo,tipo,descripcion,seleccion,url from vw_articulos_atributos_detalles where idrow="+idrow;
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });   
            }
    });

}


function tipoatributo_set(req,res)
{
    let body = req.body;
    let atributo = body.atributo;
    let ids = body.ids;
  
var request = new sql.Request();
        request.input('atributo',sql.Int,atributo);
        request.input('ids',sql.VarChar(8000),ids);
        request.execute('sp_articulos_tipoatributo_set', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                    res.status(200).send({message: 'OK'});
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
            });
}

module.exports = {
tipoatributo,
tipoatributo_set,
atributo_details
}

