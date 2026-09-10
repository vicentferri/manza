'use script'

var sql = require('mssql');

function calidades_filter(req,res){

 var familia = req.params.fam;

    if (familia != null)
    {
            var sqlquery = "select idrow as id,nombre as name from nh_master_calidades ";
            sqlquery += " where familia = '"+familia+"'";
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
}    

function publish_calidad(req,res){

      var params = req.body;
 
        var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),params.ids);
        request.input('publish',sql.Int,params.value);
        request.execute('Publish_NH_Calidades', 
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
*/

function calidades(req,res)
{
        	var sqlquery = "select idrow,familia,nombre,nombre_l1,nombre_l2,isnull(publish,0) as publish from ";
        	sqlquery += "nh_master_calidades order by familia,nombre";
     
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


 function api_calidades(req,res)
 {
            var sqlquery = "select idrow,familia,nombre as nombre_es,nombre_l1 as nombre_gb,nombre_l2 as nombre_fr from ";
        	sqlquery += "nh_master_calidades where isnull(publish,0)=1 order by familia,nombre";

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

 

 function put_calidad(req,res){

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

 
 	if (values.length == 6)
 	{

 			if (values[5] == true){
 				values[5] = "1";
 			} else {
 				values[5] = "0";
 			}
 	}
 	//console.log(values[6]);

 		var request = new sql.Request();
	    request.input('id',sql.Int,values[0]);
        request.input('publish',sql.Int,values[5]);
        request.execute('Update_NH_Calidades', 
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
	calidades,
	api_calidades,
	put_calidad,
    publish_calidad,
    calidades_filter
}
