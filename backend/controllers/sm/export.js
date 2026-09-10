'use strict'

var sql = require('mssql');

function exportFile(req, res) {


    var sqlquery = "select articulo,cantidad,unidad,orden,cod_sol,fam_sol from sol_pedidos_cola_tipo_1_fabricacion order by isnull(orden,99)";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {

            var content_type = "application/octet-stream";
            var content_disposition = "attachment; filename=detail.json";
            res.setHeader('Content-type', content_type);
            res.setHeader('Content-disposition', content_disposition);
            res.send(result.recordset);
            //res.status(200).send(result.recordset);
        } else {
            res.status(500).send({ message: err2 });
        }
    });

}

function getDetail_ID(req,res){

    let idrow = req.params.idrow;
    let cliente = req.params.cli;
    let id = req.params.id;

    if (cliente == 2)
    {
      var sqlquery = "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol from SOL_CORTINADECOR_LINES_FABRICACION ";
          sqlquery += " where idrow="+id+" order by orden";
    }
    else
    {
    var sqlquery =  "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol ";
        sqlquery += "from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow=(select id from SOL_PEDIDOS_COLA_TIPO_1 where idrow="+id+")";
        sqlquery += " union ";
        sqlquery += "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol "; 
        sqlquery += "from SOL_PEDIDOS_COLA_TIPO_2_FABRICACION where idrow=(select id from SOL_PEDIDOS_COLA_TIPO_2 where idrow="+id+")";
        sqlquery += " union ";
        sqlquery += "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol ";
        sqlquery += " from SOL_PEDIDOS_COLA_TIPO_3_FABRICACION where idrow=(select id from SOL_PEDIDOS_COLA_TIPO_3 where idrow="+id+")";
        sqlquery += " union ";
        sqlquery += "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol ";
        sqlquery += " from SOL_PEDIDOS_COLA_TIPO_4_FABRICACION where idrow=(select id from SOL_PEDIDOS_COLA_TIPO_4 where idrow="+id+")";
        sqlquery += " order by orden ";
    }     


   
    new sql.Request().query(sqlquery, (err2, result) => {
        if (err2 == null) {
            res.status(200).send({ Table : result.recordset});
        } else {
            res.status(500).send({ message: err2 });
        }
    });

}


function getDetail(req, res) {

    var id = req.params.id;
    var cliente = req.params.cli;
    var force = req.params.force;

     var request = new sql.Request();
     request.input('idPedido', sql.Int, id);
     request.input('cliente', sql.Int, cliente);
     request.input('force', sql.Int, force);
     request.execute('sp_fabricacion_generate',
        function (err, recordsets, returnValue) {

        if (err == null) {

           if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else 
                {
                /* GET DATA */
                if (cliente == 2)
                {
                  var sqlquery = "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol from SOL_CORTINADECOR_LINES_FABRICACION ";
                      sqlquery += " where idrow in (select id from sol_cortinadecor_lines where idrow="+id+") order by idpedido,orden";
                }
                else
                {
                var sqlquery =  "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow in ( ";
                    sqlquery += "select id from SOL_PEDIDOS_COLA_TIPO_1 where idrow in (select id from sol_pedidos_cola_lineas where idrow="+id+"))";
                    sqlquery += " union ";
                    sqlquery += "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol from SOL_PEDIDOS_COLA_TIPO_2_FABRICACION where idrow in ( ";
                    sqlquery += "select id from SOL_PEDIDOS_COLA_TIPO_2 where idrow in (select id from sol_pedidos_cola_lineas where idrow="+id+"))";
                    sqlquery += " union ";
                    sqlquery += "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol from SOL_PEDIDOS_COLA_TIPO_3_FABRICACION where idrow in ( ";
                    sqlquery += "select id from SOL_PEDIDOS_COLA_TIPO_3 where idrow in (select id from sol_pedidos_cola_lineas where idrow="+id+"))";
                    sqlquery += " union ";
                    sqlquery += "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol from SOL_PEDIDOS_COLA_TIPO_4_FABRICACION where idrow in ( ";
                    sqlquery += "select id from SOL_PEDIDOS_COLA_TIPO_4 where idrow in (select id from sol_pedidos_cola_lineas where idrow="+id+"))";
                }     

               
               
                new sql.Request().query(sqlquery, (err2, result) => {
                    if (err2 == null) {
                        res.status(200).send({ Table : result.recordset});
                    } else {
                        res.status(500).send({ message: err2 });
                    }
                });
                /* GET DATA */
                }
            } 
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });

}

function getDetailSIM(req, res) {

    var id = req.params.id;
    var cliente = req.params.cli;
    var force = req.params.force;
             
                var sqlquery =  "select id,idpedido,articulo,descripcion,cantidad,unidad,orden,ubicacion,consumo,descunidad,isnull(cod_sol,'') as cod_sol,fam_sol from SOL_ARTICULOS_LINES_FABRICACION where idrow in ( ";
                    sqlquery += "select id from sol_pedidos_cola_lineas where idrow="+id+")";
                new sql.Request().query(sqlquery, (err2, result) => {
                    if (err2 == null) {
                        res.status(200).send({ Table : result.recordset});
                    } else {
                        res.status(500).send({ message: err2 });
                    }
                });
                

}


function getDetailParameters(req, res) {

    var id = req.params.id;
    var cliente = req.params.cli;
    var force = req.params.force;

    var sqlquery = "";

    if (cliente == 2)
    {
      sqlquery += "select idrow,idpedido,parametro,valor from SOL_CORTINADECOR_LINES_PARAMETERS";
      sqlquery += " where idrow in (select id from sol_cortinadecor_lines where idrow="+id+") order by idpedido,parametro";
    }
    else 
    {
        sqlquery += "select idrow,idpedido,parametro,valor from SOL_ARTICULOS_LINES_FABRICACION_PARAMETERS";
        sqlquery += " where idrow in (select id from SOL_PEDIDOS_COLA_LINEAS where idrow="+id+") order by idpedido,parametro";  
    }
               
                new sql.Request().query(sqlquery, (err2, result) => {
                    if (err2 == null) {
                        res.status(200).send({ Table : result.recordset});
                    } else {
                        res.status(500).send({ message: err2 });
                    }
                });
}

function exportCSV(req, res) {

    var id = req.params.id;
    var cliente = req.params.cli;


    var request = new sql.Request();
    request.input('idPedido', sql.Int, id);
    request.input('cliente', sql.Int, cliente);
    request.input('file',sql.Int, 1);
    request.execute('sp_fabricacion_generate',
        function (err, recordsets, returnValue) {

            if (err == null) 
            {
                if (recordsets.returnValue == null) 
                {
                    res.status(500).send({ message: 'KO' });
                }
                else 
                {
                  var CSV = '';
                  for (var pos=0;pos<recordsets.recordset.length;pos++)
                  {
                    CSV += recordsets.recordset[pos].value;
                  }

                  if (cliente == 2){
                    id = '001001_' + id;
                  }
                 var content_type = "application/octet-stream";
                 var content_disposition = "attachment; filename="+id+".xml";
                 res.setHeader('Content-type', content_type);
                 res.setHeader('Content-disposition', content_disposition);
                 res.send(CSV);
                } 
            }
            else 
            {
               res.status(500).send({ message: 'KO' }); 
            }
        });

}

function ordenfabricacion_articulos_edit(req,res)
{
    let model = req.body;
    var request = new sql.Request();
    request.input('id', sql.Int, model.id);
    request.input('cliente', sql.Int, model.cliente);
    request.input('cantidad', sql.Int,model.cantidad)
    request.input('consumo', sql.Int, model.consumo);
    request.execute('sp_ordenfabricacion_articulos_edit',
       function (err, recordsets, returnValue) {

       if (err == null) {
           res.status(200).send({ message: 'OK' });
          
       }
       else 
       {
           res.status(500).send({ message: 'KO' });
       }
   });
}

function ordenfabricacion_articulos(req,res)
{
    let model = req.body;
    console.log(model);
    var request = new sql.Request();
     request.input('idrow', sql.Int, model.idrow);
     request.input('cliente', sql.Int, model.cliente);
     request.input('articles', sql.VarChar(8000),model.articles)
     request.input('operation', sql.Int, model.operation);
     request.input('article',sql.Int,model.articulo);
     request.execute('sp_ordenfabricacion_articulos',
        function (err, recordsets, returnValue) {

        if (err == null) {
            res.status(200).send({ message: 'OK' });
           
        }
        else 
        {
            res.status(500).send({ message: 'KO' });
        }
    });
 
}



module.exports = {
    exportFile,
    exportCSV,
    getDetail,
    getDetail_ID,
    getDetailSIM,
    ordenfabricacion_articulos,
    ordenfabricacion_articulos_edit,
    getDetailParameters

}

