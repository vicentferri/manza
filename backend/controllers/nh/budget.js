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

function budget_zustand(req,res)
 {

    var zustand = req.params.zustand;

    if (zustand != null)
    {
 
        if (zustand  == '-1')
        {
          var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
              query += " from vw_nh_budget_cue  order by fecha desc,codigo";
        }
        else 
        {
          var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
              query += " from vw_nh_budget_cue where estado="+zustand+" order by fecha desc,codigo ";
        }
   }
         ExecuteSQL(query,res);         
}

function budget2(req,res)
 {

    var idrow = req.params.idrow;
 
    if (idrow != null)
    {
      var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
          query += " from vw_nh_budget_cue where idrow="+idrow;
    }
    else 
    {
      var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
          query += " from vw_nh_budget_cue order by fecha desc,codigo ";
    }
         ExecuteSQL(query,res);         
}

function budget2_lin(req,res)
 {

    var idrow = req.params.idrow;
 
    if (idrow != null)
    {
      var query =  " select * from vw_nh_budget_cue_lines ";
          query += " where idrow="+idrow+" order by id";
         ExecuteSQL(query,res);       
   }  
}

function budget2_lin_tipo(req,res)
 {

    var idrow = req.params.idrow;
    var tipo  = req.params.tipo;
 
    if (idrow != null)
    {

      if (tipo == 1)
      {
        var query =  " select * from vw_nh_budget_cue_lines_tipo_1 where idrow="+idrow+" order by id";
      }

      if (tipo == 2)
      {
        var query =  " select * from vw_nh_budget_cue_lines_tipo_2 where idrow="+idrow+" order by id";
      }

      if (tipo == 3)
      {
        var query =  " select * from vw_nh_budget_cue_lines_tipo_3 where idrow="+idrow+" order by id";
      }

      if (tipo == 4)
      {
        var query =  " select * from vw_nh_budget_cue_lines_tipo_4 where idrow="+idrow+" order by id";
      }
        
      ExecuteSQL(query,res);       
   }  
}

function budget_to_bestellung(req,res)
{
  var params = req.body;
  
  var request = new sql.Request();
  request.input('idrow',sql.Int,params.idrow);
  request.execute('sp_sol_presupuesto_a_pedido', 
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
	
	budget_zustand,
	budget2_lin_tipo,
	budget2_lin,
	budget2,
  budget_to_bestellung

}