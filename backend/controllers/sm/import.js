'use strict'

var sql = require('mssql');


function gettables(req,res)
{
    let params = req.params;
    let table = "";
    let sqlquery = "";

    if (params.table == "SISTEMA") {
        table = "SOLARMANES_CARACTERISTICA_SISTEMA";
        sqlquery = "select tag,descripcion from " + table + " order by descripcion";
    }

    if (params.table == "MODELO") {
        table = "SOLARMANES_CARACTERISTICA_MODELO";
        sqlquery = "select tag,descripcion from " + table + " order by descripcion";
    }
 
    if (params.table == "ACCIONAMIENTO") {
        table = "SOLARMANES_CARACTERISTICA_ACCIONAMIENTO";
        sqlquery = "select tag,descripcion from " + table + " order by descripcion";
    }

    if (params.table == "TEJIDOS") {
        table = "SOLARMANES_AGRUPACION_TEJIDOS";
        sqlquery = "select agrupacion from " + table + " order by agrupacion";
    }

    if (params.table == "GRUPOS") {
        table = "SOLARMANES_CARACTERISTICA_GRUPOS";
        sqlquery = "select tag,descripcion from " + table + " order by descripcion";
    }

    if (params.table == "CLIENTES") {
        table = "NH_CLIENTES_IMPORTACION";
        sqlquery = "select idrow as tag,razon_social as descripcion from " + table + " order by razon_social";
    }

    if (params.table == "TIPO_CLIENTES") {
        table = "SOLARMANES_CLIENTES_TIPOS";
        sqlquery = "select codter as tag,dester as descripcion from  " + table + " order by codter";
    }
    if (params.table == "TIPO_TARIFA") {
        table = "SOLARMANES_TIPO_TARIFA";
        sqlquery = "select codtar as tag,destar as descripcion,cliente from  " + table + " order by codtar";
    }



    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });

}

function import_tables(req,res)
{
    let body = req.body;

    var request = new sql.Request();
        request.input('table',sql.VarChar(50),body.table);
        request.input('itag', sql.VarChar(50),body.tag); 
        request.input('descripcion', sql.VarChar(50),body.descripcion); 
        request.execute('sp_solarmanes_caracteristicas', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    res.status(200).send({message: 'OK'});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });
}

module.exports = {
    import_tables,
    gettables
}