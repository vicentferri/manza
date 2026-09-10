'use strict'

var sql = require('mssql');


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


function tipo_incrementos(req,res)
{
     var query = "select idrow,descripcion,tabla from SOL_ARTICULOS_INCREMENTOS_TIPOS order by descripcion";
     ExecuteSQL(query,res);
}

function articulos_incrementos_genericos(req,res)
{
     var query = "SELECT [id],cliente,(select NomCliente from NH_CLIENTES where IdCliente = cliente) as NomCli,marca,(select descripcion from SOL_ARTICULOS_ACCIONAMIENTOS_TIPOS where id = marca) as DesMar,modelo,(select descripcion from SOL_ARTICULOS_COLORES_MARCAS where idrow = modelo and tipo = 2) as DesMod,producto,(select descripcion from SOL_ARTICULOS_PRODUCTOS where idrow = producto) as DesPro,[descripcion],[pvp],[c1],[cod_solupyme],grupo,(select descripcion from sol_grupo_modelo where idrow = grupo) as dgrupo FROM [dbo].[SOL_ARTICULOS_INCREMENTOS_GENERICOS]";
     ExecuteSQL(query,res);
}


function producto_incrementos(req,res)
{
    let tabla = req.params.tabla;

    let query = "select idrow,descripcion from " + tabla;
    ExecuteSQL(query,res);
}

function producto_tabla_incrementos(req,res)
{
    let tipo = req.body.tipo;
    let producto = req.body.producto;
    let cliente = req.body.cliente;
    let bruto = req.body.bruto; 
    
    console.log(req.body);
        var request = new sql.Request();
        request.input('cliente',sql.Int,cliente);
        request.input('tipo',sql.Int,tipo);
        request.input('producto',sql.Int,producto);
        request.input('bruto',sql.Int,bruto);
        request.execute('sp_articulos_tabla_incrementos', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {    
            res.status(200).send({message: 'OK',Table:recordsets.recordset});
            }
            else 
            {
            res.status(500).send({message: 'KO'});
            }

        });
}

function producto_incremento_update(req,res)
{
    let body = req.body;
    let id = body.id;
    let pvp = body.pvp;
    let c1 = body.c1;

    var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('pvp',sql.Decimal(12,2),pvp);
        request.input('c1',sql.VarChar(15),c1);
        request.execute('sp_articulos_tabla_incrementos_update', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {    
               res.status(200).send({message: 'OK',retValue:returnValue});
            }
            else 
            {
              res.status(500).send({message: 'KO'});
            }

          });

}

function incremetosgenericos(req,res){

    var params = req.body;

    const id = params.id;
    const cliente = params.cliente;
    const marca = params.marca;
    const modelo = params.modelo;
    const producto = params.producto;
    const descripcion = params.descripcion;
    const pvp = params.pvp;
    const c1 = params.c1;
    const cod_solupyme = params.cod_solupyme;

    
        var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('cliente',sql.Int,cliente);
        request.input('marca',sql.Int,marca);
        request.input('modelo',sql.Int,modelo);
        request.input('producto',sql.Int,producto);
        request.input('descripcion',sql.VarChar(255),descripcion);
        request.input('pvp',sql.VarChar(15),pvp);
        request.input('c1',sql.VarChar(15),c1);
        request.input('cod_solupyme',sql.VarChar(255),cod_solupyme);
        request.execute('sp_master_sm_incrementosgenericos', 
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

 function incrementosG_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_incrementosgenericos_delete', 
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

function incremetos(req,res){

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
        request.input('cliente',sql.Int,values[1]);
        request.input('value',sql.Int,values[2]);
        request.input('bruto',sql.Bit,values[3]);
        request.input('idtarifa',sql.Int,values[4]);
                
        request.execute('sp_master_sm_incrementos', 
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

 function incremetos_cajones(req,res){

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
        request.input('cliente',sql.Int,values[1]);
        request.input('value',sql.Int,values[2]);
        request.input('bruto',sql.Bit,values[3]);
        request.input('idtarifa',sql.Int,values[4]);
                
        request.execute('sp_master_sm_incrementos_cajones', 
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

 function incremetos_lacados(req,res){

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
        request.input('descripcion',sql.VarChar(255),values[1]);
        request.input('pvp',sql.VarChar(15),values[2]);
        request.input('c1',sql.VarChar(15),values[3]);
        request.input('Basico',sql.Bit,values[4]);
        request.input('dias',sql.Int,values[5]);
        request.input('factor',sql.VarChar(15),values[6]);
        
        
        request.execute('sp_master_sm_incrementoslacados', 
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

 function incrementos_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_incrementos_delete', 
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

function incrementos_cajones_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_incrementos_cajones_delete', 
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

function incrementoslacados_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_incrementoslacados_delete', 
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

function articulos_incrementos(req,res)
{
     var query = "SELECT [id],[cliente],[Ncliente],[value],(Select descripcion from SOL_ARTICULOS_GUIAS where idrow = value) as DesGui,[bruto],[idtarifa],(select descripcion from SOL_GRUPO_MODELO where idrow = (Select grupo from SOL_ARTICULOS_GUIAS where idrow = value)) as dgrupo  FROM [SOL_ARTICULOS_INCREMENTOS]";
     ExecuteSQL(query,res);
}

function articulos_incrementos_cajones(req,res)
{
     var query = "SELECT [id],[cliente],[Ncliente],[value],(Select descripcion from SOL_ARTICULOS_CAJONES where idrow = value) as DesCajon,[bruto],[idtarifa],(Select descripcion from SOL_GRUPO_MODELO where idrow = (Select grupo from SOL_ARTICULOS_CAJONES where idrow = value)) as dgrupo FROM [SOL_ARTICULOS_INCREMENTOS_CAJONES]";
     ExecuteSQL(query,res);
}

function articulos_incrementos_lacados(req,res)
{
     var query = "SELECT [id],[descripcion],[pvp],[c1],[Basico],[dias],[factor] FROM [SOL_ARTICULOS_INCREMENTOS_LACADOS]";
     ExecuteSQL(query,res);
}

module.exports = {
	tipo_incrementos,
    producto_incrementos,
    producto_tabla_incrementos,
    producto_incremento_update,
    articulos_incrementos_genericos,
    incremetosgenericos,
    incrementosG_del,
    incremetos,
    incrementos_del,
    articulos_incrementos,
    articulos_incrementos_lacados,
    incremetos_lacados,
    incrementoslacados_del,
    incremetos_cajones,
    incrementos_cajones_del,
    articulos_incrementos_cajones
}