'use script'

var sql = require('mssql');


function publish_categoria(req,res){

      var params = req.body;
   
        var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),params.ids);
        request.input('publish',sql.Int,params.value);
        request.execute('Publish_NH_Categorias', 
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

 function put_categoria(req,res){

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
        request.input('nombre',sql.VarChar(100),values[1]);
        request.input('nombre_l1',sql.VarChar(100),values[2]);
        request.input('nombre_l2',sql.VarChar(100),values[3]);
        request.input('publish',sql.Int,values[4]);
        request.execute('NH_Categorias_Insertar', 
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


function categorias(req,res){

        	var sqlquery = "select idrow,nombre,nombre_l1,nombre_l2,isnull(publish,0) as publish from nh_master_categorias";
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
	
function form_categorias(req,res)
 {
            var sqlquery = "select idrow as value,nombre as label from nh_master_categorias order by nombre";

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


function api_categorias(req,res){

        	var sqlquery = "select idrow,nombre as nombre_es,nombre_l1 as nombre_gb,nombre_l2 as nombre_fr from nh_master_categorias";
        	sqlquery += " where isnull(publish,0)=1 order by nombre";

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
	categorias,
	api_categorias,
	put_categoria,
    publish_categoria,
    form_categorias
};