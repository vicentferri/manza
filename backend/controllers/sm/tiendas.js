'use strict'

var sql = require('mssql');

function ExecuteSQL(query,res)
{
  	new sql.Request().query(query, (err2,result) => {

      if (err2 == null)
      {
        	res.status(200).send(result.recordset);
      }
      else
      {
        	res.status(500).send({ message : err2 });	
      }
  });
}


function Tiendas(req,res)
{
  var cliente = req.params.cliente;

  if (cliente == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
      var query = "select idrow as id,(Nombre+' - '+ ISNULL(CODSOLUPYME,'000')) as text from NH_CLIENTES_DOMICILIOS where idcliente="+cliente+" order by Nombre";
      console.log(query);
      ExecuteSQL(query,res);
    }
}

function Tienda(req,res)
{
	var id = req.body.id;
	var entrega = req.body.entrega;

	var request = new sql.Request();
    	request.input('id', sql.Int, id);
     	request.input('entrega', sql.Int, entrega);
     	request.execute('sp_pedido_cliente_cambiar',
        function (err, recordsets, returnValue) {

        if (err == null) {

           if (recordsets.returnValue == null) 
           {
              res.status(500).send({ message: 'KO' });
           }
           else 
           {
           	  res.status(200).send({ message: 'OK' });
           }
       }
   });
}

function Referencia(req,res)
{
	var id = req.body.id;
	var referencia = req.body.referencia;

	var request = new sql.Request();
    	request.input('id', sql.Int, id);
     	request.input('referencia', sql.VarChar(50), referencia);
     	request.execute('sp_pedido_referencia_cambiar',
        function (err, recordsets, returnValue) {

        if (err == null) {

           if (recordsets.returnValue == null) 
           {
              res.status(500).send({ message: 'KO' });
           }
           else 
           {
           	  res.status(200).send({ message: 'OK' });
           }
       }
   });
}

module.exports = {
	
	Tiendas,
	Tienda,
	Referencia
}



