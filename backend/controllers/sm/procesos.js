'use script'

var sql = require('mssql');

function procesos_cambiar_precios_tarifas(req,res)
{
   var request = new sql.Request();
        request.input('proceed',sql.Int,1);
        request.execute('sp_solarmanes_cambio_precio_tarifa_all', 
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

function procesos_cambiar_precios_montaje_tarifas(req,res)
{
    let body = req.body;
    let preciomontaje = body.preciomontaje;

   var request = new sql.Request();
        request.input('preciomontaje',sql.Decimal(12,2),preciomontaje);
        request.execute('sp_solarmanes_cambio_precio_montaje', 
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
    procesos_cambiar_precios_tarifas,
    procesos_cambiar_precios_montaje_tarifas
}