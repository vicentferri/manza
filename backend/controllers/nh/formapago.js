'use strict'

var sql = require('mssql');


function formaspago(req,res)
{
   var sqlquery = "select formapago_codigo as id,formapago_nombre as name from FORMAPAGO";
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

function tipoefecto(req,res)
{
   var estado = req.params.estado;

   var sqlquery = "select distinct(tipoefecto) as id,descripcion as name from vercobros where estado="+estado;
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
  formaspago,
  tipoefecto
}