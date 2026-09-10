'use strict'

var sql = require('mssql');

function put_soporte(req,res){

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
        request.execute('sp_master_sm_soportes', 
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

    function soportes(req,res){

            var sqlquery = "select idrow,descripcion,grupo,(select descripcion from sol_grupo_modelo where idrow = grupo) as desgrupo,tipo from SOL_ARTICULOS_SOPORTES order by tipo,descripcion";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
        
}



 function form_soportes(req,res){

            var sqlquery = "select idrow as id,dgrupo as label from SOL_ARTICULOS_SOPORTES order by tipo,dgrupo";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
        
}

function soportesform(req,res){

    var sqlquery = "select idrow as value,dgrupo as label from SOL_ARTICULOS_SOPORTES order by tipo,dgrupo";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });   
            }
    });

}



function soportesclientes(req,res)
{
    var sqlquery = "select id,idrow,cliente,desccliente,descsoporte,traduccion,dgrupo from vw_soportes_clientes order by cliente,idrow";
     new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function soportescoloresclientes(req,res)
{
    var sqlquery = "select idrow,id,cliente,desccliente,traduccion,color,idsoporte, (select descripcion from SOL_ARTICULOS_SOPORTES where idrow = id) as dessoporte,dgrupo from vw_articulos_soportes_colores order by cliente,traduccion";
     new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function soportesclientes_delete(req,res)
{
    let body = req.body;
    let idrow = body.ids.join(";");
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.execute('sp_articulos_soportes_clientes_delete', 
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

function soportesolores_delete(req,res)
{
    let body = req.body;
    let idrow = body.ids.join(";");
    var request = new sql.Request();

    request.input('id',sql.Int,idrow);
    request.execute('sp_master_sm_soporte_color_del', 
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

function soportesclientes_put(req,res)
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

  
   var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('cliente',sql.Int,values[1]);
        request.input('soporte',sql.Int,values[2]);
        request.input('traduccion',sql.VarChar(255),values[3]);
        request.execute('sp_master_sm_soportes_clientes', 
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

function soportescolores_put(req,res)
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

  
   var request = new sql.Request();
        request.input('idrow',sql.Int,values[0]);
        request.input('id',sql.Int,values[1]);
        request.input('color',sql.Int,values[2]);
        request.input('cliente',sql.Int,values[3]);
        
        request.execute('sp_master_sm_soportes_colores', 
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
    soportes,
    put_soporte,
    soportesclientes,
    soportesclientes_put,
    soportesclientes_delete,
    form_soportes,
    soportescoloresclientes,
    soportesform,
    soportescolores_put,
    soportesolores_delete
    
}