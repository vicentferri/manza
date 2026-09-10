'use strict'


var sql = require('mssql');


function tabla_tejidos(req,res){

var params = req.params;
var criterio = params.criterio;
var margen = params.margen;
var preciom2 = params.preciom2;

//console.log(criterio);
//console.log(margen);
//console.log(preciom2);

        var request = new sql.Request();
        request.input('criterio',sql.Int,criterio);
        request.input('margen',sql.Decimal(12,2),margen);
        request.input('preciom2',sql.Decimal(12,2),preciom2);
        request.execute('sp_solarmanes_precio_tejido_tabla', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                		//console.log(recordsets);
                    res.status(200).send({ Table : recordsets.recordsets });
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
	tabla_tejidos
}