'use strict'

var sql = require('mssql');

function put_tapa(req,res){

    var params = req.body;


    var ids = [];
    var values = [];

    for (var i=0;i<params.length; i++)
    {
        var id = params[i].id;
        var value = params[i].value;
        ids.push(id);
        values.push(value);
    }

    if (values[0] == ''){
        values[0] = -1;
    }

    console.log(values);
   
        var request = new sql.Request();
        request.input('idrow',sql.Int,values[0]);
        request.input('descripcion',sql.VarChar(255),values[1]);
        request.input('grupo',sql.Int,values[2]);
        request.execute('sp_master_sm_tapas', 
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

    function tapas(req,res){

   
            var sqlquery = "select idrow,descripcion,tipo,grupo,(select descripcion from sol_grupo_modelo where idrow = grupo) as desgrupo from SOL_ARTICULOS_TAPAS order by tipo,descripcion";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
        
}

function form_tapas(req,res){

            var sqlquery = "select idrow as id,descripcion as label from SOL_ARTICULOS_TAPAS order by tipo,descripcion";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
        
}

function tapasclientes(req,res)
{
    var sqlquery = "select id,idrow,cliente,desccliente,desctapa,traduccion,dgrupo from vw_tapas_clientes order by cliente,idrow";
     new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tapasclientescolores(req,res)
{
    var sqlquery = "SELECT [tapas],[idrow],[id],[color],idtapa,tamano,dgrupo FROM [SOLARMANES_DEV].[dbo].[vw_articulos_tapas] order by tapas";
     new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tapasclientes_delete(req,res)
{
    let body = req.body;
    let idrow = body.ids.join(";");
 
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.execute('sp_articulos_tapas_clientes_delete', 
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

function tapascolores_delete(req,res)
{
    let body = req.body;
    let idrow = body.ids.join(";");
 
    var request = new sql.Request();
    request.input('id',sql.Int,idrow);
    request.execute('sp_master_sm_tapa_color_del', 
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

function tapasclientes_put(req,res)
{
    var params = req.body;
    var ids = [];
    var values = [];

    for (var i=0;i<params.length; i++)
    {
        var id = params[i].id;
        var value = params[i].value;
        ids.push(id);
        values.push(value);
    }

    if (values[0] == ''){
        values[0] = -1;
    }

    console.log(values);

   var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('cliente',sql.Int,values[1]);
        request.input('tapa',sql.Int,values[2]);
        request.input('traduccion',sql.VarChar(255),values[3]);
        request.execute('sp_master_sm_tapas_clientes', 
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

function tapascolores_put(req,res)
{
    var params = req.body;
    var ids = [];
    var values = [];

    for (var i=0;i<params.length; i++)
    {
        var id = params[i].id;
        var value = params[i].value;
        ids.push(id);
        values.push(value);
    }

    if (values[0] == ''){
        values[0] = -1;
    }

    console.log(values);

   var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('idrow',sql.Int,values[1]);
        request.input('color',sql.Int,values[2]);
        request.input('tamano',sql.Int,values[3]);
       
        request.execute('sp_master_sm_tapas_colores', 
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

function tapasform(req,res){

    var sqlquery = "select idrow as value,dgrupo as label from SOL_ARTICULOS_TAPAS order by tipo,dgrupo";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });   
            }
    });

}

module.exports = {
    tapas,
    put_tapa,
    tapasclientes,
    tapasclientes_put,
    tapasclientes_delete,
    form_tapas,
    tapasform,
    tapasclientescolores,
    tapascolores_put,
    tapascolores_delete
}