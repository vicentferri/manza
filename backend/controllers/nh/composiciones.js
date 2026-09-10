'use script'



var sql = require('mssql');

function composiciones_filter(req,res){

            var sqlquery = "select idrow as id,descripcion as name from nh_master_composiciones order by descripcion";
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

function publish_composicion(req,res){

      var params = req.body;
      console.log(params);

        var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),params.ids);
        request.input('publish',sql.Int,params.value);
        request.execute('Publish_NH_Composiciones', 
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


 function put_composicion(req,res){

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


 	if (values.length == 5)
 	{
 		    if (values[0] == ""){
 		    	values[0] = "-1";
 		    }

 			if (values[4] == true){
 				values[4] = "1";
 			} else {
 				values[4] = "0";
 			}
 	}
 		var request = new sql.Request();
	    request.input('idrow',sql.Int,values[0]);
        request.input('Descripcion',sql.VarChar(100),values[1]);
        request.input('Descripcion_l1',sql.VarChar(100),values[2]);
        request.input('Descripcion_l2',sql.VarChar(100),values[3]);
        request.input('publish',sql.Int,values[4]);
        request.execute('NH_Composicion_Insertar', 
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


function composiciones(req,res){

     
        	var sqlquery = "select idrow,descripcion,descripcion_l1,descripcion_l2,isnull(publish,0) as publish from nh_master_composiciones";
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
	


function api_composiciones(req,res){

        	var sqlquery = "select idrow,descripcion as nombre_es,descripcion_l1 as nombre_gb,descripcion_l2 as nombre_fr from nh_master_composiciones";
        	sqlquery += " where isnull(publish,0)=1 order by descripcion";

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
	composiciones,
	api_composiciones,
	put_composicion,
    publish_composicion,
    composiciones_filter
};