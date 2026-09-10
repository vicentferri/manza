'use strict'

var sql = require('mssql');

function ExecuteSQL(query,res)
{
    new sql.Request().query(query, (err2,result) => {

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


function tarifa_cliente(req,res)
{
     let cliente = req.params.cliente;

     var query = "select id,vias,ancho,pvp,c1,fecha from SOL_ARTICULOS_MECANISMO_JAPONES_TARIFAS where cliente="+cliente+" order by vias";
     ExecuteSQL(query,res);
}

function tarifa_cliente_update(req,res)
{
    let body = req.body;
    let id = body.id;
    let pvp = body.pvp;
    let c1 = body.c1;

    var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('pvp',sql.Decimal(12,2),pvp);
        request.input('c1',sql.VarChar(15),c1);
        request.execute('sp_panel_japones_tarifa_asigna', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {    
               res.status(200).send({message: 'OK',retValue:returnValue});
            }
            else 
            {
              res.status(500).send({message: 'KO'});
            }

          });

}

function mecanismojaponestarifas(req,res){

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


   console.log(values);

        var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('vias',sql.Int,values[1]);
        request.input('cliente',sql.Int,values[2]);
        request.input('ancho',sql.VarChar(15),values[3]);
        request.input('pvp',sql.VarChar(15),values[4]);
        request.input('c1',sql.VarChar(25),values[5]);
        
        
        request.execute('sp_master_sm_mecanismojaponestarifas', 
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

 function mecanismojaponestarifas_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    console.log(body);
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_master_sm_mecanismojaponestarifas_delete', 
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

function articulos_mecanismojaponestarifas(req,res)
{
     var query = "SELECT [id],[vias],[cliente],(select NomCliente from NH_CLIENTES where IdCliente = cliente) as NomCli,[ancho],[pvp],[c1] FROM [SOL_ARTICULOS_MECANISMO_JAPONES_TARIFAS]";
     ExecuteSQL(query,res);
}

module.exports = {
	tarifa_cliente,
    tarifa_cliente_update,
    mecanismojaponestarifas,
    mecanismojaponestarifas_del,
    articulos_mecanismojaponestarifas
}

