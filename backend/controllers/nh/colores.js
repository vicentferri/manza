'use strict'

var sql = require('mssql');

function colores_filter(req,res){

            var sqlquery = "select colores_nombre as id,colores_descripcion as name from nh_master_colores order by colores_descripcion";
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

function publish_color(req,res){

      var params = req.body;

        var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),params.ids);
        request.input('publish',sql.Int,params.value);
        request.execute('Publish_NH_Colores', 
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


function colores(req,res)
{
        	var sqlquery = "select colores_nombre,colores_descripcion,colores_descripcion_l1,colores_descripcion_l2,";
        	sqlquery += "colores_descripcionbreve,isnull(publish,0) as publish from NH_master_colores order by colores_nombre";
     
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


 function api_colores(req,res)
 {
        	var sqlquery = "select colores_nombre,colores_descripcion as nombre_es,colores_descripcion_l1 as nombre_gb,colores_descripcion_l2 as nombre_fr,";
        	sqlquery += "colores_descripcionbreve from NH_master_colores where isnull(publish,0)=1 order by colores_nombre";
     
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

 function put_colores(req,res){

 	var params = req.body;
 	//console.log(params);

 	var ids = [];
 	var values = [];

 	for (var i=0;i<params.length; i++)
 	{
 		var id = params[i].id;
 		var value = params[i].value;
 		ids.push(id);
 		values.push(value);
 	}

 	//console.log(ids);
 	//console.log(values);

 	if (values.length == 5)
 	{

 			if (values[4] == true){
 				values[4] = "1";
 			} else {
 				values[4] = "0";
 			}
 	}
 	//console.log(values[6]);

 		var request = new sql.Request();
	    request.input('Nombre',sql.VarChar(50),values[0]);
        request.input('publish',sql.Int,values[4]);
        request.execute('Update_NH_Colores', 
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
	colores,
	api_colores,
	put_colores,
    publish_color,
    colores_filter
}
