'use strict'

var sql = require('mssql');

function publish_familia(req,res){

      var params = req.body;
   
        var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),params.ids);
        request.input('publish',sql.Int,params.value);
        request.execute('Publish_NH_Familias', 
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

 function put_familia(req,res){

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

 	
 	if (values.length == 7)
 	{

 			if (values[6] == true){
 				values[6] = "1";
 			} else {
 				values[6] = "0";
 			}
 	}
 	

 		var request = new sql.Request();
	    request.input('Nombre',sql.VarChar(50),values[0]);
        request.input('Descripcion',sql.VarChar(100),values[1]);
        request.input('Descripcion_l1',sql.VarChar(100),values[2]);
        request.input('Descripcion_l2',sql.VarChar(100),values[3]);
        request.input('Descripcion_l3',sql.VarChar(100),values[4]);
        request.input('Descripcion_l4',sql.VarChar(100),values[5]);
        request.input('publish',sql.Int,values[6]);
        request.execute('Update NH_Familia', 
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


function familias(req,res){

        	var sqlquery = "select nombre,descripcion,descripcion_l1,descripcion_l2,descripcion_l3,descripcion_l4,isnull(publish,0) as publish from nh_master_subfamilias";
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
	
function familias_filter(req,res){

            var sqlquery = "select nombre as id,descripcion as name from nh_master_subfamilias order by descripcion";
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


function api_familias(req,res){

    		var sqlquery = "select nombre,descripcion as nombre_es,descripcion_l1 as nombre_gb,descripcion_l2 as nombre_fr from NH_MASTER_SUBFAMILIAS ";
    		sqlquery +=" where isnull(publish,0)=1 order by descripcion";

    		new sql.Request().query(sqlquery, (err2,result) => {

    			if (err2 == null)
    			{
    				res.status(200).send({ Table : result.recordset });
    			} 
    			else 
    			{
    				console.log(err2);
    				res.status(500).send({ message : err2});
    			}
    		});
}

module.exports = {
	familias,
	api_familias,
	put_familia,
    publish_familia,
    familias_filter
};