'use strict'

var sql = require('mssql');

function put_contrapeso(req,res){

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
        values[0] = "-1";
    }


  
        var request = new sql.Request();
        request.input('idrow',sql.Int,values[0]);
        request.input('descripcion',sql.VarChar(255),values[1]);
        request.input('grupo',sql.Int,values[2]);
        request.execute('sp_master_sm_contrapesos', 
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

    function contrapesos(req,res){

  
            var sqlquery = "select idrow,descripcion,tipo,grupo,(select descripcion from sol_grupo_modelo where idrow = grupo) as desgrupo from SOL_ARTICULOS_CONTRAPESO order by tipo,descripcion";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
     
}

function contrapesosclientes(req,res)
{
    var sqlquery = "select id,idrow,cliente,desccliente,desccontrapeso,traduccion,dgrupo from vw_contrapesos_clientes order by cliente,idrow";
     new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

 function form_contrapesos(req,res){

            var sqlquery = "select idrow as id,dgrupo as label from SOL_ARTICULOS_CONTRAPESO order by tipo,dgrupo";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
        
}

function contrapesosclientes_put(req,res)
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
        request.input('contrapeso',sql.Int,values[2]);
        request.input('traduccion',sql.VarChar(255),values[3]);
        request.execute('sp_master_sm_contrapesos_clientes', 
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

function contrapesoscolor_put(req,res)
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
        request.input('contrapeso',sql.Int,values[2]);
        request.input('color',sql.Int,values[3]);
        request.execute('sp_master_sm_contrapesos_colores', 
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


function contrapesoscoloresclientes(req,res)
{
    var sqlquery = "select idrow,cliente,desccliente,contrapeso,desccontrapeso,id,color,dgrupo from vw_contrapesos_colores order by cliente";
     new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function contrapesoclientestarifas(req,res){

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
        values[0] = "-1";
    }


   console.log(values);

        var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('idrow',sql.Int,values[1]);
        request.input('ancho',sql.VarChar(15),values[2]);
        request.input('pvp',sql.VarChar(15),values[3]);
        request.input('c1',sql.VarChar(25),values[4]);
        
        
        request.execute('sp_master_sm_contrapesoclientestarifas', 
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

 function contrapesoclientestarifas_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_contrapesoclientestarifas_delete', 
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

function contrapesoclientes_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_contrapesos_clientes_del', 
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

function contrapesocolor_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_contrapesos_color_del', 
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

function articulos_contrapesoclientestarifas(req,res)
{
     var query = "SELECT [id],[idrow],(Select descripcion from SOL_ARTICULOS_CONTRAPESO where idrow = SOL_ARTICULOS_CONTRAPESO_CLIENTES_TARIFAS.idrow) as DesCon,[ancho],[pvp],[c1] FROM [SOL_ARTICULOS_CONTRAPESO_CLIENTES_TARIFAS]";
     ExecuteSQL(query,res);
}

function ExecuteSQL(query,res)
{
    new sql.Request().query(query, (err2,result) => {

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

function contrapeso_form(req,res)
{
    
    let sqlquery = "SELECT idrow as value, dgrupo as label FROM SOL_ARTICULOS_CONTRAPESO order by dgrupo";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}


module.exports = {
    contrapesos,
    put_contrapeso,
    contrapesosclientes,
    contrapesosclientes_put,
    form_contrapesos,
    contrapesoscoloresclientes,
    contrapesoclientestarifas,
    contrapesoclientestarifas_del,
    articulos_contrapesoclientestarifas,
    contrapeso_form,
    contrapesoclientes_del,
    contrapesoscolor_put,
    contrapesocolor_del
}