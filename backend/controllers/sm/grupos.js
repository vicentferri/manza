'use strict'

var sql = require('mssql');

function grupostejidos(req,res)
{
    var sqlquery = "select idrow,grupo,descripcion,nexos,precio,criterio,precio as coste from sol_articulos_tejidos_grupos order by grupo";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });	
        }
});
}

function tejidosgrupo(req,res)
{
    var idrow = req.params.idrow;

    var sqlquery = "select idrow,descripcion from sol_articulos_tejidos where idrow in ( ";
        sqlquery += "select data from string_to_table((select nexos from SOL_ARTICULOS_TEJIDOS_GRUPOS where idrow="+idrow+"),','))";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });	
            }
    });
    }


function grupostejidos_tejidos(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let ids = body.ids;
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('ids',sql.VarChar(8000),ids);
    request.execute('sp_tejidos_grupos_tejidos_add', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }

       
        });  
}

function grupostejidos_tejidos_del(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let ids = body.ids;
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('ids',sql.VarChar(8000),ids);
    request.execute('sp_tejidos_grupos_tejidos_del', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }

       
        });  
}

function grupostejidos_add(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let grupo = body.grupo;
    let descripcion = body.descripcion;
    let precio = body.precio;
    let criterio = body.criterio;

   
   var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('grupo',sql.VarChar(5),grupo);
    request.input('descripcion',sql.VarChar(50),descripcion);
    request.input('precio',sql.Decimal(12,4),precio);
    request.input('criterio',sql.Int,criterio);
    request.execute('sp_tejidos_grupos_add', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }

       
        });  
}

function grupostejidos_del(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
   
   
   var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.execute('sp_tejidos_grupos_del', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
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

    grupostejidos,
    grupostejidos_add,
    grupostejidos_del,
    grupostejidos_tejidos,
    tejidosgrupo,
    grupostejidos_tejidos_del

}