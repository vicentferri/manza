'use strict'

var sql = require('mssql');

function ExecuteSQL(query,res)
{
  	new sql.Request().query(query, (err2,result) => {

      if (err2 == null)
      {
        	res.status(200).send(result.recordset);
      }
      else
      {
        	res.status(500).send({ message : err2 });	
      }
  });
}

function ExecuteSQL_OK(query,res)
{
  	new sql.Request().query(query, (err2,result) => {

      if (err2 == null)
      {
        	res.status(200).send({message : "OK"});
      }
      else
      {
        	res.status(500).send({ message : err2 });	
      }
  });
}

 /* 
  07.01.2018  - Reconexión a BBDD Producción
 */
function estancias(req,res){

  var cliente = req.params.cli;
  
  var query = "select idrow,descripcion from [dbo].[sol_articulos_estancias]";
	ExecuteSQL(query,res);
}

function cajones(req,res){

  var cliente = req.params.cli;
  var tipo = req.params.tipo;

  
   var query = "select idrow,descripcion from [dbo].[vw_articulos_cajones] where cliente="+cliente+" and grupo = (select grupo from sol_articulos_accionamientos_tipos tip where tip.id = "+tipo+")";
  ExecuteSQL(query,res);
  
  
  }
  
  


function cajon_cliente(req,res){

   
   var query = "select idrow,(select descripcion from SOL_ARTICULOS_CAJONES where idrow = [dbo].[SOL_ARTICULOS_CAJONES_CLIENTES].idrow) as descajon,cliente, (select dbo.AT_Cliente(cliente)) as descliente,(select dgrupo from SOL_ARTICULOS_CAJONES where idrow = [dbo].[SOL_ARTICULOS_CAJONES_CLIENTES].idrow) as Grupo from [dbo].[SOL_ARTICULOS_CAJONES_CLIENTES]";
   ExecuteSQL(query,res);
  }

  function put_cajon_cliente(req,res){

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

   
  
       var request = new sql.Request();
       request.input('idrow',sql.Int,values[0]);
       request.input('cliente',sql.Int,values[1]);
       request.execute('sp_master_sm_cajones_clientes', 
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

function cajon_cliente_del(req,res)
{
    let body = req.body;
    
    var request = new sql.Request();
    request.input('idrow',sql.Int,body.ids[0]);
    request.input('cliente',sql.Int,body.ids[1]);
    request.execute('sp_master_sm_cajones_clientes_del', 
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

function cajon(req,res){

   
    var query = "select idrow,descripcion,grupo,(select descripcion from sol_grupo_modelo where idrow = grupo) as desgrupo from [dbo].[sol_articulos_cajones]";
    ExecuteSQL(query,res);
   }
   
   
   function put_cajon(req,res){

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
          request.input('descripcion',sql.VarChar(255),values[1]);
          request.input('grupo',sql.Int,values[2]);
          request.execute('sp_master_sm_cajones', 
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

function cajones_del(req,res){

   let body = req.body;
   let ids = body.ids.join(";");
   let operation = body.operation;

   if (operation == 0){
      let query = "delete from [dbo].[sol_articulos_cajones] where idrow=" + ids; 
      ExecuteSQL_OK(query,res);
   }

 }

function guias(req,res){

  var cliente = req.params.cli;
  var tipo = req.params.tipo
  
  var query = "select idrow,descripcion from [dbo].[sol_articulos_guias] where grupo = (select grupo from sol_articulos_accionamientos_tipos tip where tip.id = "+tipo+")";
  ExecuteSQL(query,res);
}

function guia(req,res){

      
   var query = "select idrow,descripcion,grupo,(select descripcion from sol_grupo_modelo where idrow = grupo) as desgrupo from [dbo].[sol_articulos_guias]";
   ExecuteSQL(query,res);
 }

 function put_guia(req,res){

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
       request.input('descripcion',sql.VarChar(255),values[1]);
       request.input('grupo',sql.Int,values[2]);
       request.execute('sp_master_sm_guias', 
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

function guias_del(req,res){

   let body = req.body;
   let ids = body.ids.join(";");
   let operation = body.operation;

   if (operation == 0){
      let query = "delete from [dbo].[sol_articulos_guias] where idrow=" + ids; 
      ExecuteSQL_OK(query,res);
   }

 }

 /* 
  08.01.2018  - Reconexión a BBDD Producción
 */
function accion(req,res){

     var cliente = req.params.cli;
     var producto = req.params.pro;

     

     if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente asociado a la petición'});
     } 
     else 
     {
        var query = "select idrow as id,descripcion as text from [dbo].[vw_accionamientos_cliente] where cliente="+cliente+" and producto="+producto;
        ExecuteSQL(query,res);
     }     
}

function accion_gen(req,res){

    var cliente = req.params.cli;

    if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente asociado a la petición'});
     } 
     else 
     {
        var query = "select idrow as id,descripcion as text from SOL_ARTICULOS_ACCIONAMIENTOS where not idrow in (select idrow  from [dbo].[vw_accionamientos_cliente] where cliente="+cliente+")";
        ExecuteSQL(query,res);
     }     
}

/* 
  08.01.2018  - Reconexión a BBDD Producción
 */
function accionT(req,res){

      var cliente = req.params.cli;
      var idrow = req.params.idrow;
      var tipo = req.params.tipo;

     if (cliente == null && idrow == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        /* MODIFIED VFF 17.12.2019 */
        var query = "select id,TipoCliente as text,mando from [dbo].[vw_accionamientosmarcas_clientes] where idrow="+idrow+" and cliente="+cliente+" and producto="+tipo;
        query += " order by TipoCliente";

        ExecuteSQL(query,res);
      }
}


function accionT_gen(req,res){

      var cliente = req.params.cli;
      var idrow = req.params.idrow;

     if (cliente == null && idrow == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        /* MODIFIED VFF 17.12.2019 */
        var query = "select id,descripcion as text,mando from sol_articulos_accionamientos_tipos where idrow="+idrow+" and not id in ";
        query += "(select id from [dbo].[vw_accionamientosmarcas_clientes] where idrow="+idrow+" and cliente="+cliente+")";
        ExecuteSQL(query,res);
      }
}
/* 
  08.01.2018  - Reconexión a BBDD Producción
 */
function accionC(req,res){

      var cliente = req.params.cli;
      var acc = req.params.acc;
      var tipo = req.params.tipo;
      var produc = req.params.produc;
      

     if (cliente == null && idrow == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        if (cliente == 1 || cliente ==5) 
        {
          var query = "select distinct(descripcion) as text,idrow as id,pvp as precio,c1,isnull(codigo_48,'') codigo_48 from [dbo].[vw_accionamientos_colores] where cliente="+cliente+" and tipoidrow="+acc+" and id="+tipo+" and producto="+produc;
          query += "and not idrow in (select id from [dbo].[SOL_ARTICULOS_COLORES_MARCAS_CLIENTES_EXCLUIDOS] where cliente="+cliente+")";
        } 
        else 
        {
          var query = "select distinct(descripcion) as text,idrow as id, pvp as precio,c1,isnull(codigo_48,'') codigo_48 from vw_accionamientos_colores where dbo.PermittedType(vw_accionamientos_colores.idrow,"+cliente+")=1 and tipoidrow="+acc+" and id="+tipo+" and producto="+produc+" and cliente="+cliente;
        }
        

        if (acc==1){
          query += " and cadena = 1";
        }


        ExecuteSQL(query,res);

      }
}

function Cargadores(req,res)
{
  var id = req.params.id;
  var query = "select idrow as id,descripcion as text,pvp as precio,c1,codigo_48 from SOL_ARTICULOS_MANDOS_CARGADORES where id_marca="+id;
  ExecuteSQL(query,res);
}

function lacados(req,res){

   var cliente = req.params.cli;
   
   

  if (cliente == null && idrow == null)
  {
     res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
  } 
  else 
  {
     
       var query = "select distinct(descripcion) as text,id,pvp as precio,c1 from [dbo].[SOL_ARTICULOS_INCREMENTOS_LACADOS]";
       
     


     ExecuteSQL(query,res);

   }
}

function accionC_gen(req,res){

      var cliente = req.params.cli;
      var acc = req.params.acc;
      var tipo = req.params.tipo;

     if (cliente == null && idrow == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        if (cliente == 1 || cliente == 5) 
        {
          var query = "select distinct(descripcion) as text,idrow as id from [dbo].[vw_accionamientos_colores] where tipoidrow="+acc+" and id="+tipo;
          query += "and not idrow in (select id from [dbo].[SOL_ARTICULOS_COLORES_MARCAS_CLIENTES_EXCLUIDOS] where cliente="+cliente+")";
        } 
        else 
        {
          var query = "select distinct(descripcion) as text,idrow as id from [dbo].[vw_accionamientos_colores] where tipoidrow="+acc+" and id="+tipo;
        }
        

        if (acc==1){
          query += " and cadena = 1";
        }

        ExecuteSQL(query,res);

      }
}

function soportes(req,res)
{
  var cliente = req.params.cli;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
      var query = "select id,traduccion as text  from [dbo].[vw_soportes_clientes] where cliente="+cliente;
        ExecuteSQL(query,res);
    }
}

function soportes_gen(req,res)
{
  var cliente = req.params.cli;
  var tipo    = req.params.tipo;


  if (tipo == null)
     {
        res.status(500).send({message:'No existe tipo asociado a la petición'});
     } 
     else 
     {
      if (cliente === '4' )
      {
      var query = "select id,descsoporte as text from vw_soportes_clientes where cliente="+cliente+" and grupo = (select grupo from sol_articulos_accionamientos_tipos tip where tip.id = "+tipo+")";
      } 
      else 
      {
      var query = "select id,traduccion as text from vw_soportes_clientes where cliente="+cliente+" and grupo = (select grupo from sol_articulos_accionamientos_tipos tip where tip.id = "+tipo+")";
      }
        ExecuteSQL(query,res);
    }
}

function soportesC(req,res)
{
  var cliente = req.params.cli;
  var id = req.params.id;

  if (cliente == null || id == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
       var query = "select idrow as id,color as text from [dbo].[vw_articulos_soportes_colores] where id="+id+" and cliente ="+cliente;
        ExecuteSQL(query,res);
    }
}

function contrapeso(req,res)
{
  var cliente = req.params.cli;
  

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
       //var query = "select idrow as id,descripcion as text from SOL_ARTICULOS_CONTRAPESO";
       //    query += " where not idrow in (select id from SOL_ARTICULOS_CONTRAPESO_CLIENTES_EXCLUIDOS where cliente="+cliente+")";

        var query = "select id,descripcion as text,precio,c1 from SOL_ARTICULOS_CONTRAPESO_CLIENTES where cliente="+cliente;
        ExecuteSQL(query,res);
    }

}

function contrapeso_GEN(req,res)
{
  var cliente = req.params.cli;
  var tipo    = req.params.tipo;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
       //var query = "select idrow as id,descripcion as text from SOL_ARTICULOS_CONTRAPESO";
       //    query += " where not idrow in (select id from SOL_ARTICULOS_CONTRAPESO_CLIENTES_EXCLUIDOS where cliente="+cliente+")";

        var query = "select id,descripcion as text,precio,c1 from vw_contrapesos_clientes_grupo where cliente="+cliente+" and grupo = (select grupo from sol_articulos_accionamientos_tipos tip where tip.id = "+tipo+")";
        ExecuteSQL(query,res);
    }

}

function contrapesoC(req,res)
{
  var cliente = req.params.cli;
  var id = req.params.id;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query = "select id,color as text from [dbo].[vw_contrapesos_colores] where contrapeso=" + id + " and cliente =" + cliente; 
        ExecuteSQL(query,res);
    }
}


function tejidos_producto(req,res)
{
  var cliente  = req.params.cli;
  var producto = req.params.pro;
  var user     = req.user;
  var subcli   = (req.params.subcli == null)  ? 1 : req.params.subcli;


   if (cliente == null || producto == null)
   {

   }
   else 
    {
      var query = "select TEJIDO as id,Ntejido as text,isnull(codigoprov,'') as codigoprov,opacidad from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS] where CLIENTE="+cliente+" and PRODUCTO="+producto;
      query += " order by Ntejido";
     
      if (subcli == 2)
      {
        var query = "select TEJIDO as id,Ntejido as text,isnull(codigoprov2,'') as codigoprov,opacidad from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS] where CLIENTE="+cliente+" and PRODUCTO="+producto;
        query += " order by Ntejido";
      }
     
      ExecuteSQL(query,res);
    }
}


function tejidos_producto_id(req,res)
{
  var cliente = req.params.cli;
  var producto = req.params.pro;
  var subcli   = (req.params.subcli == null)  ? 1 : req.params.subcli;

   if (cliente == null || producto == null)
   {

   }
   else 
    {
      
      var query = "select id,descripcion as text,codigoprov,(select opacidad from SOL_ARTICULOS_TEJIDOS where idrow=SOL_ARTICULOS_TEJIDOS_CLIENTES.id) as opacidad from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES] where cliente="+cliente+" and id in ";
      query += "(select tejido from  [dbo].[sol_articulos_tejidos_clientes_productos] where impresion=1 and cliente="+cliente+" and producto = "+producto+") order by descripcion ";
      
      if (subcli == 2)
      {
        var query = "select id,descripcion as text,codigoprov2 as codigoprov,(select opacidad from SOL_ARTICULOS_TEJIDOS where idrow=SOL_ARTICULOS_TEJIDOS_CLIENTES.id) as opacidad from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES] where cliente="+cliente+" and id in ";
      query += "(select tejido from  [dbo].[sol_articulos_tejidos_clientes_productos] where impresion=1 and cliente="+cliente+" and producto = "+producto+") order by descripcion ";
      }
     
     
      ExecuteSQL(query,res);
    }
}



function tejidos(req,res)
{
  var cliente = req.params.cli;
  var id = req.params.id;


  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query = "select id,descripcion as text,codigoprov from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES] ";
        query += " where cliente="+cliente+" order by descripcion";
        ExecuteSQL(query,res);
    }
}

function tejidosC(req,res)
{
  var cliente = req.params.cli;
  var id = req.params.id;
  var subcliente = (req.params.subcli == null) ? 1 : req.params.subcli;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
      if (cliente == 1 || cliente == 5)
        {
          var query = "select color as id,descripcion as text,ancmax,color_hex,isnull(codigoprov,'') as codigoprov from [dbo].[vw_tejidos_colores] where tejido="+id;
          query += " and cliente="+cliente+" order by color";

          if (subcliente == 2)
          {
            var query = "select color as id,descripcion as text,ancmax,color_hex,isnull(codigoprov2,'') as codigoprov from [dbo].[vw_tejidos_colores] where tejido="+id;
            query += " and cliente="+cliente+" order by color";  
          }
        } 
        else 
        {
          var query = "select color as id,nombrecolor as text,ancmax,color_hex from vw_tejidos_colores_3009 where tejido="+id;
          query += " order by nombrecolor";
        }
        ExecuteSQL(query,res);
    }
}

function tejidosCID(req,res)
{
  var cliente = req.params.cli;
  var id = req.params.id;
  var subcliente = (req.params.subcli == null) ? 1 : req.params.subcli;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
      if (cliente == 1 || cliente == 5)
        {
          var query = "select color as id,descripcion as text,ancmax,color_hex,codigoprov from [dbo].[vw_tejidos_colores] ";
          query +=" where impresiondigital=1 and impresiondigital2=1 and tejido="+id;
          query += " order by color";

          if (subcliente == 2)
          {
            var query = "select color as id,descripcion as text,ancmax,color_hex,codigoprov2 as codigoprov from [dbo].[vw_tejidos_colores] ";
            query +=" where impresiondigital=1 and impresiondigital2=1 and tejido="+id;
            query += " order by color";
            }
        }
        else 
        {
           var query = "select color as id,nombrecolor as text,ancmax,color_hex from vw_tejidos_colores_3009 where tejido="+id;
           query += " and impresion_digital=1 order by nombrecolor";
        }

        ExecuteSQL(query,res);
    }
}



function tapas(req,res)
{
  var cliente = req.params.cli;
  var id = req.params.id;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
      var query = "select id,traduccion as text from [dbo].[vw_tapas_clientes] where cliente="+cliente+" order by traduccion";
        ExecuteSQL(query,res);
    }
}

function tapas_gen(req,res)
{
  var cliente = req.params.cli;
  var tipo = req.params.tipo;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
      if (cliente === '4' )
      {
      var query = "select id,desctapa as text from vw_tapas_clientes where cliente="+cliente+" and grupo = (select grupo from sol_articulos_accionamientos_tipos tip where tip.id = "+tipo+")";
      } 
      else 
      {
      var query = "select id,traduccion as text from vw_tapas_clientes where cliente="+cliente+" and grupo = (select grupo from sol_articulos_accionamientos_tipos tip where tip.id = "+tipo+")";
      }

        ExecuteSQL(query,res);
    }
}

function tapasC(req,res)
{
  var cliente = req.params.cli;
  var id = req.params.id;

  if (cliente == null || id == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query = "select id,color as text from [dbo].[vw_articulos_tapas] where idrow="+id;
        ExecuteSQL(query,res);
    }
}

function posMando(req,res)
{
  var cliente = req.params.cli;
 

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query = " select idrow as id,descripcion as text from [dbo].[SOL_ARTICULOS_POSICIONMANDO]";
        ExecuteSQL(query,res);
    }
}

function salTejido(req,res)
{
  var cliente = req.params.cli;
 

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query = "select idrow as id,descripcion as text from [dbo].[sol_articulos_salidatejido]";
        ExecuteSQL(query,res);
    }
}

function radiomandos(req,res)
{
  var cliente = req.params.cli;
 

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query = "select  id,descripcion as text,precio,c1 from [dbo].[sol_articulos_accionamientos_radio_tipo_cliente] where cliente=1 order by descripcion";
        ExecuteSQL(query,res);
    }
}

function radiomandos_gen(req,res)
{
  var modelo = req.params.model;
  var cliente = req.params.cli;
  var tipo = req.params.tipo;


  if (modelo == null)
  {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
  } 
  else 
  {
      var query = "SELECT idrow as id, descripcion as text,";
      query += "isnull((select top 1 precio from sol_articulos_accionamientos_radio_tipo_cliente where id=dbo.SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO.idrow and cliente="+cliente+" and producto="+tipo+"),0) as precio,";
      query += "isnull((select top 1 c1 from sol_articulos_accionamientos_radio_tipo_cliente where id=dbo.SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO.idrow and cliente="+cliente+" and producto="+tipo+"),'0') as c1,";
      query += "isnull((select top 1 codigo_48 from sol_articulos_accionamientos_radio_tipo_cliente where id=dbo.SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO.idrow and cliente="+cliente+" and producto="+tipo+"),'0') as codigo_48 ";
      query += " FROM SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO WHERE "+modelo+" IN (select data from dbo.string_to_table(modelos,','))  and dbo.AT_mando_cliente(dbo.SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO.idrow," + cliente + "," + tipo + ") > 0 ";
      ExecuteSQL(query,res);
  }
}

function tubos(req,res)
{
  var cliente = req.params.cli;
 

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query =  "select idrow as id,descripcion as text,anchomax as ancmax from [dbo].[sol_articulos_tubos] ";
        //query  += " where not idrow in (select id from [dbo].[sol_articulos_tubos_clientes_excluidos] where cliente="+cliente+") "; 
        ExecuteSQL(query,res);
    }
}

function altCadena(req,res)
{
  var cliente = req.params.cli;
 

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query =  "select value as id,descripcion as text from [dbo].[sol_articulos_accionamientos_cadena] where tipo='C' order by value";
        ExecuteSQL(query,res);
    }
}

function altCadenaM(req,res)
{
  var cliente = req.params.cli;
 

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query =  "select value as id,descripcion as text from [dbo].[sol_articulos_accionamientos_cadena] where tipo='M' order by value";
        ExecuteSQL(query,res);
    }
}


function existePromocion(req,res)
{
    var cliente = req.params.cli;
    var centro  = req.params.cent;

    if (cliente != null && centro != null)
    {
     var query = "select count(*) as existe from [dbo].[vw_nh_clientes_promociones] ";
     query += "where idcliente="+cliente+" and usuario="+centro+" and promocion_activa=1";
     query += " and desde<=getdate()";
     ExecuteSQL(query,res);
    }
}


function datosPromocion(req,res)
{
    var cliente = req.params.cli;
    var centro  = req.params.cent;
    if (cliente != null && centro != null)
    {
     var query = "select promocion_coeficiente,promocion_coeficiente2,promocion_modificapvp,promocion_modificapvc,desde,hasta,promocion_mensaje,imagen_banner from [dbo].[vw_nh_clientes_promociones] where idcliente="+cliente+" and usuario="+centro+" and promocion_activa=1";
    } 
    ExecuteSQL(query,res);
}

function userInfo(req,res)
{
    var cliente = req.params.cli;
    if (cliente != null)
    {
     var query = "SELECT ISNULL(prod_1,0) AS prod_1, ISNULL(prod_2,0) AS prod_2, " +
                 "ISNULL(prod_3,0) AS prod_3, ISNULL(prod_4,0) AS prod_4, ISNULL(prod_7,0) AS prod_7 " +
                 "FROM dbo.CLIENTES_USERS WHERE IDROW=" + parseInt(cliente);
     ExecuteSQL(query,res);
    }
}




function tejidos_producto_web(req,res)
{
  var cliente = req.params.cli;
  var producto = req.params.pro;

   if (cliente == null || producto == null)
   {

   }
   else 
    {
      /*
      var query = "select id,descripcion as text,isnull(ovov,'') as codigoprov from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES] where cliente="+cliente+" and id in ";
      query += "(select tejido from  [dbo].[sol_articulos_tejidos_clientes_productos] where cliente="+cliente+" and producto = "+producto+") ";
      query += " and not id in (14,15,18,32,42,51,59) order by descripcion ";
     */
     var query = "select cli.id,cli.descripcion as text,isnull(cli.codigoprov,'') as codigoprov,tej.opacidad,tej.info_tecnica,tej.uso_recomendado ";
    query += " from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES] cli ";
    query += " inner join [dbo].[sol_articulos_tejidos] tej on tej.idrow = cli.id ";
    query += " where cli.cliente="+cliente+" and cli.id in ";
    query += " (select tejido from  [dbo].[sol_articulos_tejidos_clientes_productos] ";
    query += " where cliente="+cliente+" and producto = 1) ";
    query += " and not cli.id in (14,15,18,32,42,51,59) order by cli.descripcion ";

     
      ExecuteSQL(query,res);
    }
}


function tejidos_producto_id_web(req,res)
{
  var cliente = req.params.cli;
  var producto = req.params.pro;

   if (cliente == null || producto == null)
   {

   }
   else 
    {
      /*
      var query = "select id,descripcion as text,codigoprov from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES] where cliente="+cliente+" and id in ";
      query += "(select tejido from  [dbo].[sol_articulos_tejidos_clientes_productos] where impresion=1 and cliente="+cliente+" and producto = "+producto+") ";
      query += " and not id in (14,15,18,32,42,51,59) order by descripcion ";
      */
      var query = "select cli.id,cli.descripcion as text,isnull(cli.codigoprov,'') as codigoprov,tej.opacidad,tej.info_tecnica,tej.uso_recomendado ";
    query += " from [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES] cli ";
    query += " inner join [dbo].[sol_articulos_tejidos] tej on tej.idrow = cli.id ";
    query += " where cli.cliente="+cliente+" and cli.id in ";
    query += " (select tejido from  [dbo].[sol_articulos_tejidos_clientes_productos] ";
    query += " where impresion=1 and cliente="+cliente+" and producto = 1) ";
    query += " and not cli.id in (14,15,18,32,42,51,59) order by cli.descripcion ";
      ExecuteSQL(query,res);
    }
}





function tarifa_limites(req, res) {
  var cliente = parseInt(req.params.cli);
  var producto = parseInt(req.params.pro);
  var tejido = parseInt(req.params.tejido);
  var marca = parseInt(req.params.marca);
  var impresion = parseInt(req.params.impresion);

  if (isNaN(cliente) || isNaN(producto) || isNaN(tejido)) {
    return res.status(400).send({ message: 'Parámetros inválidos' });
  }
  if (isNaN(marca)) marca = 1;
  impresion = (impresion === 1) ? 1 : 0;

  // Misma selección de tarifa que sp_tarifas_calculate_prices3_AT:
  // enrollable (1) filtra marca 55 o 1 sin alternativa; panel zip (6) sin marca.
  // Se replica la forma exacta de cada select (sin top 1 en el 1, top 1 en el 6) para que,
  // mientras existan tarifas duplicadas, se quede con la misma fila que el SP.
  var marcaFiltro = (marca === 55) ? 55 : 1;
  var prod = (producto === 2) ? 6 : 1;

  var seleccion = (prod === 1)
    ? `select @idrow = isnull(idrow,0) from sol_articulos_tarifas
        where clientes = ${cliente} and tejidos = ${tejido} and marcas = ${marcaFiltro} and impresion = ${impresion} and producto = 1;`
    : `select top 1 @idrow = isnull(idrow,0) from sol_articulos_tarifas
        where clientes = ${cliente} and tejidos = ${tejido} and impresion = ${impresion} and producto = 6;`;

  // Límites a partir de las cabeceras que tienen al menos una celda con precio
  // (hay matrices con columnas/filas en la cabecera pero sin precios, que el SP valora a 0).
  var query = `
    declare @idrow int = 0;
    ${seleccion}

    ;with celdas as (
        select x, y from sol_articulos_tarifas_lineas
        where idrow = @idrow and x > 0 and y > 0 and try_cast(replace(v1,',','.') as decimal(12,2)) is not null
    ),
    anchos as (
        select l.x, v = try_cast(replace(l.v1,',','.') as decimal(10,2)) from sol_articulos_tarifas_lineas l
        where l.idrow = @idrow and l.y = 0 and l.x > 0 and exists (select 1 from celdas c where c.x = l.x)
    ),
    altos as (
        select l.y, v = try_cast(replace(l.v1,',','.') as decimal(10,2)) from sol_articulos_tarifas_lineas l
        where l.idrow = @idrow and l.x = 0 and l.y > 0 and exists (select 1 from celdas c where c.y = l.y)
    )
    select
        @idrow as idrow,
        isnull((select min(v) from anchos) * 100, 100) as min_ancho,
        isnull((select max(v) from anchos) * 100, 380) as max_ancho,
        isnull((select min(v) from altos) * 100, 100) as min_alto,
        isnull((select max(v) from altos) * 100, 300) as max_alto;
  `;

  ExecuteSQL(query, res);
}

module.exports = {
    estancias,
	  accion,
    accionT,
    accionC,
    soportes,
    soportesC,
    contrapeso,
    contrapesoC,
    tejidos,
    tejidosC,
    tejidosCID,
    tapas,
    tapasC,
    posMando,
    salTejido,
    radiomandos,
    radiomandos_gen,
    tubos,
    altCadena,
    altCadenaM,
    tejidos_producto,
    tejidos_producto_id,
    existePromocion,
    datosPromocion,
    tejidos_producto_web,
    tejidos_producto_id_web,
    accion_gen,
    accionT_gen,
    accionC_gen,
    soportes_gen,
    tapas_gen,
    cajones,
    cajones_del,
    guias,
    guias_del,
    lacados,
    contrapeso_GEN,
    cajon,
    guia,
    put_cajon,
    put_guia,
    cajon_cliente,
    put_cajon_cliente,
    cajon_cliente_del,
    Cargadores,
    userInfo,
    tarifa_limites
}

