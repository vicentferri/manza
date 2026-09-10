'use strict'

var sql = require('mssql');

function Atributos_Articulos_Add(req,res)
{
    var id = req.body.id;
    var atributo = req.body.atributo;
    var valor = req.body.valor;

     var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('atributo',sql.VarChar(255),atributo);
        request.input('valor',sql.VarChar(8000),valor);
        request.execute('sp_articulos_fabricacion_relacion_cd_add_value', 
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


function Atributos_Articulos_New(req,res)
{
    var id = req.body.id;
    var atributo = req.body.atributo;
    var valor = req.body.valor;

     var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('atributo',sql.VarChar(255),atributo);
        request.input('valor',sql.VarChar(500),valor);
        request.execute('sp_articulos_fabricacion_relacion_cd_new_value', 
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


function Atributos_Articulos_Assign(req,res)
{
    var idrow = req.body.idrow;
    var articulos = req.body.articles;
     var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.input('articulos',sql.VarChar(8000),articulos);
        request.execute('sp_articulos_fabricacion_relacion_cd', 
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

function Atributos_Articulos_Update(req,res)
{
    var idrow = req.body.idrow;
    var valor = req.body.value;
     var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.input('valor',sql.VarChar(100),valor);
        request.execute('sp_articulos_fabricacion_relacion_update', 
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

function Atributos_Articulos_Delete(req,res)
{
    var idrow = req.body.idrow;

    console.log("ATRIBUTO=" + idrow);
   
     var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.execute('sp_articulos_fabricacion_relacion_cd_delete', 
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

function Atributos_Articulos_ddl(req,res)
{
    var sqlquery = "select distinct(atributo) as idrow,UPPER(atributo) as descripcion from SOL_ARTICULOS_CD_FABRICACION_RELACION order by atributo";
    new sql.Request().query(sqlquery, (err2,result) => {

    if (err2 == null){
       res.status(200).send({ Table : result.recordset });
    } else {
        res.status(500).send({ Table : null });
    }
    });
}

function Atributos_Articulos(req,res)
{
    var atributo = req.params.attr;
    var sqlquery = "select idrow,atributo,valor,dbo.fn_get_articles(articulos,',') as articulos from SOL_ARTICULOS_CD_FABRICACION_RELACION ";
    sqlquery += " where atributo='"+atributo+"' order by atributo";
     new sql.Request().query(sqlquery, (err2,result) => {

    if (err2 == null){
       res.status(200).send({ Table : result.recordset });
    } else {
        res.status(500).send({ Table : null });
    }
    });
}

function Signal(req,res)
{
  var id = req.params.id;
  var sqlquery = "update SOL_CORTINADECOR_HEADER set estado=1 where idrow="+id;
  new sql.Request().query(sqlquery, (err2,result) => {

    if (err2 == null){
        res.status(200).send({ message : 'OK' });
    } else {
        res.status(500).send({ message : 'KO' });	
    }
});
}

function fillAttributes(values,pos,len,res)
{
    var line = values.lines[pos];
    var id = line.id;
 
    var sqlquery = "select UPPER(atributte) as name,UPPER(value) as value from SOL_CORTINADECOR_LINES_ATTRIBUTES where id="+id;
    new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){

                            if (!line.attributes) 
                            {
                                line.attributes = result.recordset;
                            }

                            if (pos < len-1) 
                            {
                               pos = pos + 1;
                               fillAttributes(values,pos,len,res); 
                            }
                            else 
                            {
                                console.log("exit");
                                res.status(200).send({ Table : values });
                            }

                    } else {
                                res.status(500).send({Table : null});
                    }
            });
}

function cd_bestellung_detail(req,res)
{
    var id = req.params.id;

    var values = {
        header : {},
        lines : {}
    }

    var sqlquery = "select idrow,filename,id,date,name,lastname,business,nif,address,city,province,postcode,country,phone from SOL_CORTINADECOR_HEADER where idrow="+id;
    new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){

                        values.header = result.recordset;
                        //LINES//
                         var sqlquery = "select id,name,color,amount,cost from SOL_CORTINADECOR_LINES where idrow="+id;
                            new sql.Request().query(sqlquery, (err2,result) => {

                                            if (err2 == null){

                                                values.lines = result.recordset;
                                                var len = values.lines.length;
                                                fillAttributes(values,0,len,res);

                                            } else {
                                                res.status(500).send({ message : err2 });   
                                            }
                                    });
                        //LINES//
                    } else {
                        res.status(500).send({ message : err2 });   
                    }

    });

   
}

function get_model_lines(req,res)
{
 var sqlquery = "SELECT     TOP (100) PERCENT model.id, model.name, model._producto, model._tejido, model._color, sec.seccion, tej.descripcion ";
sqlquery += "FROM         dbo.SOL_ARTICULOS_TEJIDOS AS tej INNER JOIN ";
sqlquery += "dbo.SOL_ARTICULOS_TEJIDOS_CLIENTES AS rel ON tej.idrow = rel.id RIGHT OUTER JOIN ";
sqlquery += "dbo.SOL_CORTINADECOR_LINES_MODEL AS model ON rel.id = model._tejido LEFT OUTER JOIN ";
sqlquery += "dbo.SOL_SECCIONES AS sec ON sec.idrow = model._producto ";
sqlquery += "GROUP BY model.id, model.name, model._producto, model._tejido, model._color, sec.seccion, tej.descripcion ";
sqlquery += "ORDER BY model.id";
  new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
}

function set_model_lines_colores(req,res)
{
   

    let id = req.body.id;
    let idrow = req.body.idrow;
    let color = req.body.color;
    let op = req.body.op;
   
    try
    {

    var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('idrow',sql.Int,idrow);
        request.input('color',sql.VarChar(50),color);
        request.input('op',sql.Int,op);
        request.execute('sp_cortinadecor_model_addcolor', 
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
        catch(excepcion)
        {
            console.log(excepcion);
            res.status(500).send({message: 'KO'});
        }
           
}

function get_model_lines_colores(req,res)
{
    var idrow = req.params.idrow;

/*
var sqlquery = "SELECT     TOP (100) PERCENT model.id, model.color, ISNULL(model._color, - 1) AS _color, colo.descripcion AS descripcionc, ";
sqlquery += " dbo.fn_get_articles(model.articulos, ',') AS articulos ";
sqlquery += " FROM dbo.SOL_ARTICULOS_COLORES_MARCAS AS colo RIGHT OUTER JOIN ";
sqlquery += " dbo.SOL_CORTINADECOR_LINES_COLORES_MODEL AS model ON colo.idrow = model._color ";
sqlquery += " WHERE     (model.idrow = "+idrow+") ";
sqlquery += " ORDER BY model.color ";
*/

var sqlquery = "SELECT     TOP (100) PERCENT model.id, model.color, ISNULL(model._color, - 1) AS _color, attr.descripcion, attr.color AS idColor, colo.descripcion AS descripcionc, ";
sqlquery += " dbo.fn_get_articles(model.articulos, ',') AS articulos ";
sqlquery += " FROM  dbo.SOL_ARTICULOS_COLORES_MARCAS AS colo INNER JOIN ";
sqlquery += " dbo.SOL_ARTICULOS_TEJIDOS_ATRIBUTOS AS attr ON colo.idrow = attr.color RIGHT OUTER JOIN ";
sqlquery += " dbo.SOL_CORTINADECOR_LINES_COLORES_MODEL AS model ON attr.idrow = model._color ";
sqlquery += " WHERE     (model.idrow = "+idrow+") ";
sqlquery += " ORDER BY model.color";

     new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function set_model_colores(req,res)
{
    var id = req.params.id;
    var color = req.params.color;
     var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('color',sql.Int,color);
        request.execute('sp_cortinadecor_assigncolor', 
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

function set_model_create(req,res)
{
    let name = req.params.name;
    let producto = req.params.producto;
    let tejido = req.params.tejido;


var request = new sql.Request();
        request.input('name',sql.VarChar(255),name);
        request.input('producto',sql.Int,producto);
        request.input('tejido',sql.Int,tejido);
        request.execute('sp_cortinadecor_model_add', 
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


function set_model_delete(req,res)
{
    let ids = req.body.ids;
    console.log(ids);
    
var request = new sql.Request();
        request.input('ids',sql.VarChar(255),ids);
        request.execute('sp_cortinadecor_model_delete', 
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

function set_model_assign(req,res)
{
	var id       = req.params.id;
    var producto = req.params.producto;
    var tejido   = req.params.tejido;
	
    var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('producto',sql.Int,producto);
        request.input('tejido',sql.Int,tejido);
        request.execute('sp_cortinadecor_model_assign', 
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
	get_model_lines,
	set_model_assign,
    get_model_lines_colores,
    set_model_lines_colores,
    set_model_colores,
    cd_bestellung_detail,
    Signal,
    Atributos_Articulos,
    Atributos_Articulos_ddl,
    Atributos_Articulos_Assign,
    Atributos_Articulos_Delete,
    set_model_create,
    set_model_delete,
    Atributos_Articulos_Add,
    Atributos_Articulos_New,
    Atributos_Articulos_Update
}
