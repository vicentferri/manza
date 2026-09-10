'use strict'

var sql = require('mssql');

function subfamilias_filter(req,res){

    var familia = req.params.fam;

    if (familia != null)
    {
            var sqlquery = "select idrow as id,nombre as name from nh_master_subfamilias_tipos ";
            sqlquery += " where subfamilia = '"+familia+"'";
            sqlquery += "order by nombre";
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

 function publish_subfamilia(req,res){

      var params = req.body;
 
        var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),params.ids);
        request.input('publish',sql.Int,params.value);
        request.execute('Publish_NH_SubFamilias', 
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

 function put_subfamilia(req,res){

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


 	if (values.length == 4)
 	{

 			if (values[3] == true){
 				values[3] = "1";
 			} else {
 				values[3] = "0";
 			}
 	}
 	
 
 		var request = new sql.Request();
	    request.input('idrow',sql.Int,values[0]);
        request.input('publish',sql.Int,values[3]);
        request.execute('Update_NH_SubFamilias', 
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


function subfamilias(req,res){

        	var sqlquery = "select idrow,subfamilia,nombre,nombre_l1,nombre_l2,isnull(publish,0) as publish from nh_master_subfamilias_tipos";
        	sqlquery += " order by subfamilia,nombre";
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
	


function api_subfamilias(req,res){

            var sqlquery = "select idrow,subfamilia as familia,nombre as nombre_es,nombre_l1 as nombre_gb,nombre_l2 as nombre_fr,isnull(publish,0) as publish from nh_master_subfamilias_tipos";
            sqlquery += " where isnull(publish,0)=1 order by subfamilia,nombre";
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
	subfamilias,
	api_subfamilias,
	put_subfamilia,
    publish_subfamilia,
    subfamilias_filter
};