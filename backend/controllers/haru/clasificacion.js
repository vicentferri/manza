'use strict'

var sql = require('mssql');

function clientes_paises(req,res)
{
    var sqlquery = "select pais as uid,NombrePais as descripcion from Busqueda_Clientes ";
    sqlquery += "group by pais,nombrePais order by NombrePais";
    new sql.Request().query(sqlquery, (err2,result) => {

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

function clientes_provincias(req,res)
{
    var pais = req.params.pais;

    var sqlquery = "select ProvFiscal as uid,ProvFiscal as descripcion from Busqueda_Clientes where pais= "+pais;
    sqlquery += " group by ProvFiscal order by ProvFiscal";
    new sql.Request().query(sqlquery, (err2,result) => {

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



function clientes_actividad(req,res)
{
    var sqlquery = "select idrow as uid,descripcion from clientes_actividad ";
    sqlquery += " order by descripcion";

 new sql.Request().query(sqlquery, (err2,result) => {

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

function clientes_cadena(req,res)
{
    var sqlquery = "select idrow as uid,descripcion from clientes_cadena  ";
    sqlquery += " order by descripcion";

    

 new sql.Request().query(sqlquery, (err2,result) => {

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

function clientes_gestion(req,res)
{
	
    var sqlquery = "select idrow as uid,descripcion from clientes_gestion  ";
    sqlquery += " order by descripcion";

 new sql.Request().query(sqlquery, (err2,result) => {

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

function clientes_sector(req,res)
{
    var sqlquery = "select idrow as uid,descripcion from clientes_sector  ";
    sqlquery += " order by descripcion";

 new sql.Request().query(sqlquery, (err2,result) => {

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


function clientes_search(req,res)
{
    var params    = req.body;

    var sqlquery = "select  0 as selected, idrow,numero,nombre,nombre_domicilio,poblacion_domicilio,iddireccion from Busqueda_Clientes_Avanzada where 1 = 1 ";

    if (params.tag.pais != "-100")
    {
        sqlquery += " and pais=" + params.tag.pais;
    }

    if (params.tag.provincia != "-100")
    {
        //sqlquery += " and provfiscal='" + params.tag.provincia + "'";
    }

    if (params.tag.gestion != "-100")
    {
        sqlquery += " and gestion=" + params.tag.gestion;
    }

    if (params.tag.actividad != "-100")
    {
        sqlquery += " and actividad=" + params.tag.actividad;
    }

    if (params.tag.sector != "-100")
    {
        sqlquery += " and sector=" + params.tag.sector;
    }

    if (params.tag.cadena != "-100")
    {
        sqlquery += " and cadena=" + params.tag.cadena;
    }

    if (params.tag.criterio != "")
    {
        sqlquery += " and ( nombre like '" + params.tag.criterio + "%'";
        sqlquery += " or nomcomercial like '" + params.tag.criterio + "%')";
    }
    

    sqlquery += " order by nombre";

   
     new sql.Request().query(sqlquery, (err2,result) => {

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

function clientes_lista(req,res){

  let sqlquery = "select idcliente,NomCliente from nh_clientes order by NomCliente";
  new sql.Request().query(sqlquery, (err2,result) => {

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

function importar_clientes(req,res)
{
    let body = req.body;
    let percon = body.percon;
    let tfno1 = body.tfno1;
    let tfno2 = body.tfno2;
    let fax = body.fax;
    let email = body.email;
    let movil = body.movil;
    let habitual = body.habitual;
    let nombre = body.nombre;
    let razon_social = body.razon_social;
    let dir = body.dir;
    let codpos = body.codpos;
    let pob = body.pob;
    let prv = body.prv;
    let cif = body.cif;
    let agente = body.agente;
    let codigo = body.codigo;
    let tag = body.tag;

    var request = new sql.Request();
	  request.input('percon',sql.VarChar(255),percon);
    request.input('tfno1',sql.VarChar(255),tfno1);
    request.input('tfno2',sql.VarChar(255),tfno2);
    request.input('fax',sql.VarChar(255),fax);
		request.input('email',sql.VarChar(255),email);
		request.input('movil',sql.VarChar(255),movil);
		request.input('habitual',sql.VarChar(255),habitual);
		request.input('nombre',sql.VarChar(255),nombre);
		request.input('razon_social',sql.VarChar(255),razon_social);
    request.input('dir',sql.VarChar(255),dir);
		request.input('codpos',sql.VarChar(255),codpos);
		request.input('pob',sql.VarChar(255),pob);
		request.input('prv',sql.VarChar(255),prv);
		request.input('cif',sql.VarChar(255),cif);
		request.input('agente',sql.VarChar(255),agente);
    request.input('codigo',sql.VarChar(255),codigo);
    request.input('tag',sql.VarChar(255),tag);
    request.execute('sp_import_clientes', 
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
	clientes_actividad,
	clientes_cadena,
	clientes_gestion,
	clientes_sector,
  clientes_paises,
  clientes_provincias,
  clientes_search,
  clientes_lista,
  importar_clientes
}