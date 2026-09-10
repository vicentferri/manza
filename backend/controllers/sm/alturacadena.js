'use strict'

var sql = require('mssql');


function alturacadena(req,res){
    
    var sqlquery = "select value as idrow,descripcion from sol_articulos_accionamientos_cadena where tipo='C' order by value";
    new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

  

module.exports = {
    alturacadena
}