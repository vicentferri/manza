'use strict'

var sql = require('mssql');

function put_color(req,res){

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
        request.input('descripcion',sql.VarChar(255),values[2]);
        request.input('tipo',sql.Int,values[1]);
        request.input('impresion',sql.Int,values[3]);
        request.input('bloqueo',sql.Int,values[4]);
        request.execute('sp_master_sm_coloresmarcas', 
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

function colores_marcas(req,res){

 			var sqlquery = "select idrow,descripcion,idrow id,descripcion text,case tipo when 1 then 'COLOR' when 2 then 'MARCA' when 3 then 'OTROS' end as tipo, ";
            sqlquery += " case impresiondigital when 1 then 'PERMITIDA' when 0 then 'NO DISPONIBLE' end as impresiondigital,Bloqueo,isnull(codigo_48,'') codigo_48 ";
            sqlquery += " from SOL_ARTICULOS_COLORES_MARCAS order by tipo,descripcion";
        
            console.log(sqlquery);
				new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});    
}

function colores_marcas_form(req,res){
    let tipo = req.params.tipo;

    if (tipo == "-1")
    {
        var sqlquery = "select idrow,descripcion + '-' + ltrim(str(idrow))  as descripcion from SOL_ARTICULOS_COLORES_MARCAS where Bloqueo = 0 order by tipo,descripcion";
    } 
    else 
    {
    var sqlquery = "select idrow,descripcion + '-' + ltrim(str(idrow))  as descripcion from SOL_ARTICULOS_COLORES_MARCAS where tipo="+tipo+" and Bloqueo = 0 order by tipo,descripcion";
    }
       new sql.Request().query(sqlquery, (err2,result) => {

           if (err2 == null){
               res.status(200).send({ Table : result.recordset });
           } else {
               res.status(500).send({ message : err2 });	
           }
   });    
}



function colores_tejidos_atributos(req,res)
{
    var sqlquery = "select idrow,cliente,descCliente,tejido,descTejido,color,descripcion,traduccion from vw_nh_articulos_tejidos_atributos order by cliente,descTejido,descripcion";
    new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
    
}

function colores_tejidos_atributos_clientes(req,res)
{
    var cli = req.params.cli;
    var tej = req.params.tej;
    var sqlquery = "select idrow,cliente,descCliente,tejido,descTejido,color,descripcion,traduccion from ";
    sqlquery += " vw_nh_articulos_tejidos_atributos where cliente="+cli+" and tejido="+tej+" order by descripcion";
    new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
    
}

module.exports = {
	colores_marcas,
    colores_marcas_form,
    put_color,
    colores_tejidos_atributos,
    colores_tejidos_atributos_clientes
}