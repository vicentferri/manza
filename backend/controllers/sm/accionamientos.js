'use strict'

var sql = require('mssql');

function put_accionamiento(req,res){

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
        request.execute('sp_master_sm_accionamientos', 
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

function accionamientos_tipos_colores(req,res){

  	var id = req.params.id;

			var sqlquery = "select combi.color,color.descripcion from SOL_ARTICULOS_ACCIONAMIENTOS_TIPOS_COLORES_MARCAS combi ";
				sqlquery += "inner join SOL_ARTICULOS_COLORES_MARCAS color on color.idrow = combi.color ";
				sqlquery += "where combi.id="+id+" group by combi.color,color.descripcion";
				new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
  
}

function put_accionamientostipo_config(req,res){

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
        request.input('idrow',sql.Int,values[1]);
        request.input('descripcion',sql.VarChar(255),values[2]);
        request.input('grupo',sql.Int,values[3]);
        request.input('mando',sql.Int,values[4]);
        request.execute('sp_articulos_accionamientos_tipos', 
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

function put_grupo_modelo(req,res){

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
            request.input('descripcion',sql.VarChar(255),values[1]);
            request.input('modelo',sql.VarChar(50),values[2]);
            request.execute('sp_grupo_modelo', 
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


function accionamientos_tipos(req,res){

 
		var idrow = req.params.idrow;
        	var sqlquery = "select id,idrow,descripcion from sol_articulos_accionamientos_tipos where idrow=" + idrow;
        	sqlquery += " order by descripcion";

           

        	new sql.Request().query(sqlquery, (err2,result) => {

        		if (err2 == null){
        			res.status(200).send({ Table : result.recordset });
        		} else {
        			res.status(500).send({ message : err2 });	
        		}
        	});
}



function accionamientos_tipos_form(req,res)
{
    let tipo = (req.params.tipo == null) ? "-1" : req.params.tipo;
    let sqlquery = "select id,dgrupo as descripcion from SOL_ARTICULOS_ACCIONAMIENTOS_TIPOS where idrow="+tipo+" order by dgrupo";
    console.log(sqlquery);
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}

function accionamientos_marcas_form(req,res)
{
    
    let sqlquery = "SELECT id as value, dgrupo as label FROM SOL_ARTICULOS_ACCIONAMIENTOS_TIPOS order by dgrupo";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}




function accionamientos_modelos_form(req,res)
{
    
    let sqlquery = "SELECT idrow as value, descripcion + '-' + ltrim(str(idrow)) as label FROM SOL_ARTICULOS_COLORES_MARCAS where tipo = 2 and Bloqueo = 0  order by descripcion";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}

function accionamientos_tipos_filter(req,res){

        var idrow = req.params.idrow;
            var sqlquery = "select id,descripcion as name from sol_articulos_accionamientos_tipos where idrow in (" + idrow + ")";
            sqlquery += " order by descripcion";

            new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

function accionamientos(req,res){
   
        	var sqlquery = "select idrow,descripcion from sol_articulos_accionamientos order by descripcion";
        	new sql.Request().query(sqlquery, (err2,result) => {

        		if (err2 == null){
        			res.status(200).send({ Table : result.recordset });
        		} else {
        			res.status(500).send({ message : err2 });	
        		}
        	});
}

function form_accionamientos(req,res){
   
            var sqlquery = "select idrow as value,descripcion as label from sol_articulos_accionamientos order by descripcion";
            new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

function accionamientos_filter(req,res){
   
            var sqlquery = "select idrow as id,descripcion as name from sol_articulos_accionamientos order by descripcion";
            new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

function accionamientos_clientes(req,res)
{
    var sqlquery = "select idrow,descCliente,descripcion,producto,Nproducto from [solarmanes_dev].[dbo].[vw_accionamientos_cliente]";
     new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

function accionamientosmarcas_clientes(req,res)
{
    var sqlquery = "select id,idrow,cliente,Accionamiento,descCliente,Tipo,TipoCliente,iddel,producto,Nproducto from [solarmanes_dev].[dbo].[vw_accionamientosmarcas_clientes]";
     new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

function accionamientosmarcas_clientes_del(req,res)
{
    let body = req.body;
    console.log(body);

    let ids = body.ids.join(',');
    console.log(ids);

    var request = new sql.Request();
  request.input('ids',sql.VarChar(8000),ids);
  request.input('operation',sql.Int,body.operation);
  request.input('origen',sql.Int,2);
  request.execute('sp_accionamientos_mapa_delete', 
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


/*
function accionamientostipo(req,res)
{
    var sqlquery = "select id,accionamiento from [solarmanes_dev].[dbo].[vw_accionamientostipos] group by id,accionamiento";
     new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}
*/

function accionamientostipo_config(req,res)
{

    var id = (req.query.id === undefined) ? -1 : req.query.id;

    var sqlquery = "select id,idrow,accionamiento,tipo,grupo,(select descripcion from sol_grupo_modelo where idrow = grupo) as desgrupo,mando from [solarmanes_dev].[dbo].[vw_accionamientostipos]";


    if (id != '-1'){
        sqlquery += " where id="+id;
    }

     new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

function grupo_modelo(req,res)
{

    var id = (req.query.id === undefined) ? -1 : req.query.id;

    var sqlquery = "select idrow,descripcion,modelo,(select descripcion from SOLARMANES_CARACTERISTICA_MODELO where tag = modelo) as desmodelo from [solarmanes_dev].[dbo].[sol_grupo_modelo]";


    if (id != '-1'){
        sqlquery += " where id="+id;
    }

     new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

/*
*/



function accionamientos_marcas(req,res)
{
    var sqlquery = "select id as idrow,(Accionamiento + '-' + Marca) as descripcion from [solarmanes_dev].[dbo].[vw_accionamientos_marcas] order by Accionamiento";
      new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}


function accionamientos_modelos(req,res)
{
    var tipo = req.params.tipo;
    var sqlquery = "select distinct(descripcion) as tipo,idrow from [solarmanes_dev].[dbo].[vw_accionamientos_colores] where tipoidrow=3 and id="+tipo;
    new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}

function accionamientos_mapa_add(req,res)
{
    let body = req.body;
    let user = req.user.sub;
    console.log(body);
   
     var request = new sql.Request();
    request.input('operation',sql.Int,body.operation);
    request.input('producto',sql.Int,body.Producto);
    request.input('accionamiento',sql.Int,body.Accionamiento);
    request.input('modelo',sql.Int,body.Modelo);
    request.input('color',sql.Int,body.Color);
    request.input('cliente',sql.Int,body.Cliente);
    request.input('usuario',sql.Int,user);
    request.execute('sp_accionamiento_mapa_operate', 
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

function accionamientos_mapa_delete(req,res)
{
    let body = req.body;
    
  var request = new sql.Request();
  request.input('ids',sql.VarChar(8000),body.ids);
  request.input('operation',sql.Int,body.operation);
  request.execute('sp_accionamientos_mapa_delete', 
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

function accionamientos_mapa(req,res)
{
    var tipo = req.params.tipo;
    var sqlquery = "select id,idrow,tipo,accionamiento,Nmodelo as descripcion,Ncliente as NomFiscal,cliente_permissions,Nproducto as descproducto,dgrupo as Grupo,Tag,isnull(codigo_48,'') codigo_48  from [dbo].[SOL_ARTICULOS_COLORES_MARCAS_CLIENTES_PRODUCTOS]";
    new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null){
                    res.status(200).send({ Table : result.recordset });
                } else {
                    res.status(500).send({ message : err2 });   
                }
            });
}


function put_accionamientos_clientes_traduccion(req,res)
{
    var params = req.body;

    var cliente = params.cliente;
    var tipo    = params.tipo;
    var traduccion = params.traduccion;

    var request = new sql.Request();
        request.input('cliente',sql.Int,cliente);
        request.input('accionamiento',sql.Int,tipo);
        request.input('traduccion',sql.VarChar(255),traduccion);
        request.execute('sp_articulos_accionamiento_cliente_traduccion', 
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

function put_accionamientos_clientes_traduccion_update(req,res)
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
        values[0] = "-1";
    }

    var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('traduccion',sql.VarChar(255),values[1]);
        request.execute('sp_articulos_accionamiento_cliente_traduccion_update', 
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

function put_accionamientos_clientes(req,res)
{

    var params = req.body;

    var kunde = params.value;
    var values = params.ids;

    var request = new sql.Request();
        request.input('kunde',sql.Int,kunde);
        request.input('values',sql.VarChar(8000),values);
        request.execute('sp_master_sm_accionamientos_clientes', 
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
function accionamientosclientestarifas(req,res){

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
        
        request.execute('sp_master_sm_accionamientosclientestarifas', 
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

 function accionamientosclientestarifas_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_accionamientosclientestarifas_delete', 
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

function accionamientosradiotipo(req,res){

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
        request.input('idrow',sql.Int,values[0]);
        request.input('descripcion',sql.VarChar(50),values[1]);
        request.input('modelos',sql.VarChar(255),values[2]);
        request.input('articulos',sql.VarChar(255),values[3]);

        request.execute('sp_master_sm_accionamientosradiotipo', 
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

 function accionamientosradiotipo_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    var request = new sql.Request();
    request.input('idrow',sql.Int,id);
    request.execute('sp_master_sm_accionamientosradiotipo_delete', 
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

function accionamientosradiotipocliente_v2(req,res)
{
    const { idrow, id, descripcion,cliente,precio,c1,producto,modelo,codigo_48 } = req.body;

    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('id',sql.Int,id);
    request.input('descripcion',sql.VarChar(99),descripcion);
    request.input('cliente',sql.Int,cliente);
    request.input('precio',sql.VarChar(15),precio);
    request.input('c1',sql.VarChar(25),c1);
    request.input('producto',sql.Int,producto);
    request.input('modelo',sql.Int,modelo);
    request.input('codigo_48',sql.VarChar(25),codigo_48);
    request.execute('sp_master_sm_accionamientosradiotipocliente', 
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


function accionamientosradiotipocliente(req,res){

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
        request.input('id',sql.Int,values[1]);
        request.input('descripcion',sql.VarChar(99),values[2]);
        request.input('cliente',sql.Int,values[3]);
        request.input('precio',sql.VarChar(15),values[4]);
        request.input('c1',sql.VarChar(25),values[5]);
        request.input('producto',sql.Int,values[6]);
        request.input('modelo',sql.Int,values[7]);
        request.execute('sp_master_sm_accionamientosradiotipocliente', 
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

 function accionamientosradiotipocliente_del(req,res)
{
    let body = req.body;
    //let id = body.ids.join(',');
    let idrow = body.idrow;
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.execute('sp_master_sm_accionamientosradiotipocliente_delete', 
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

function articulos_accionamientosclientestarifas(req,res)
{
     var query = "SELECT  [id],[idrow],(select NomCliente from NH_CLIENTES where IdCliente = idrow) as NomCli,[ancho],[pvp],[c1] FROM [SOL_ARTICULOS_ACCIONAMIENTOS_CLIENTES_TARIFAS]";
     ExecuteSQL(query,res);
}

function articulos_accionamientosradiotipo(req,res)
{
     var query = "SELECT [idrow],[descripcion],[modelos],[articulos] FROM [SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO]";
     ExecuteSQL(query,res);
}

function articulos_accionamientosradiotipocliente(req,res)
{
     var query = "SELECT [idrow],[id],(select descripcion from SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO where idrow = id) as DesMar,[descripcion],[cliente],[codigo_48],(select NomCliente from NH_CLIENTES where IdCliente = cliente) as NomCli,[precio],[c1],[producto],(select descripcion from SOL_ARTICULOS_PRODUCTOS where idrow = producto) as DesPro,[modelo],(select  descripcion from SOL_ARTICULOS_COLORES_MARCAS where idrow = modelo and tipo = 2) as DesMod FROM [SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE]";
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

function accionamientos_radiotipo_form(req,res)
{
    
    let sqlquery = "SELECT idrow as value, descripcion + '-' + ltrim(str(idrow)) as label FROM SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO order by descripcion";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}

function guia_form(req,res)
{
    
    let sqlquery = "SELECT idrow as value, dgrupo as label FROM SOL_ARTICULOS_GUIAS order by dgrupo";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}

function cajon_form(req,res)
{
    
    let sqlquery = "SELECT idrow as value, dgrupo as label FROM SOL_ARTICULOS_CAJONES order by dgrupo";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}



module.exports = {
	accionamientos,
    accionamientos_filter,
	accionamientos_tipos,
    accionamientos_tipos_filter,
	accionamientos_tipos_colores,
    put_accionamiento,
    accionamientos_clientes,
    put_accionamientos_clientes,
    accionamientosmarcas_clientes,
    accionamientosmarcas_clientes_del,
    accionamientos_marcas,
    put_accionamientos_clientes_traduccion,
    accionamientostipo_config,
    put_accionamientostipo_config,
    form_accionamientos,
    accionamientos_modelos,
    accionamientos_mapa,
    accionamientos_mapa_delete,
    accionamientos_mapa_add,
    accionamientos_tipos_form,
    accionamientos_marcas_form,
    accionamientos_modelos_form,
    accionamientosclientestarifas,
    accionamientosclientestarifas_del,
    accionamientosradiotipo,
    accionamientosradiotipo_del,
    accionamientosradiotipocliente,
    accionamientosradiotipocliente_del,
    articulos_accionamientosclientestarifas,
    articulos_accionamientosradiotipo,
    articulos_accionamientosradiotipocliente,
    accionamientos_radiotipo_form,
    guia_form,
    grupo_modelo,
    put_grupo_modelo,
    cajon_form,
    put_accionamientos_clientes_traduccion_update,
    accionamientosradiotipocliente_v2


}