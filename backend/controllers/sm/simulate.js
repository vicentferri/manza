'use script'

var sql = require('mssql');

function simulate_origin_info(req,res)
{

var sqlquery = "select idrow,fecha,numero,cantidad,ancho,alto,tejido,color from sol_ordenes_produccion ";
sqlquery += " order by ancho desc,alto ";
new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
  
}


function simulate_sim_info(req,res)
{

var sqlquery = "select idrow,fecha,numero,referencia,cantidad,ancho,alto,tejido,color,step,type from sol_ordenes_produccion_processed";
	sqlquery += " order by step, type, ancho desc,alto";
new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
  
}



function simulate_processed_info(req,res)
{
	 var request = new sql.Request();
        request.execute('sp_ordenes_produccion_simulate', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({Table: recordsets});
                }
                else
                {
                    res.status(200).send(recordsets.recordset);
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });

/*
var sqlquery = "select idrow,fecha,numero,referencia,cantidad,ancho,alto,tejido,color,step,type from sol_ordenes_produccion_processed ";
sqlquery += " order by step, ancho desc,alto ";
new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
  */
}






module.exports = {
	simulate_origin_info,
	simulate_processed_info,
	simulate_sim_info
}