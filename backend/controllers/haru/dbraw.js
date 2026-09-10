'use strict'

var sql = require('mssql');


function UpdateTable(req,res)
{
    var params = req.body;

    var sqlquery = "update " + params.table + " set " + params.field + "='" + params.value + "' where " + params.column + "=" + params.id;


    new sql.Request().query(sqlquery, (err2, result) => {
        if (err2 == null) {
            
            res.status(200).send({ message: 'OK', id: params.id });
        }
        else {
            console.log(err2);
            res.status(500).send({ message: err2 });
        }
    });
   
}



module.exports = {
    UpdateTable
}