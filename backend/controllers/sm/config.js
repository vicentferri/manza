'use strict'

var sql = require('mssql');


function configuracion_sm_post(req,res){

    let params = req.body;
    let modelosm = (params.modelosm == null) ? 1 : params.modelosm;

    var request = new sql.Request();
    request.input('modelosm',sql.Int,modelosm);
    request.execute('sp_configuracion_sm_update', 
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


function configuracion_post(req,res){

    let params = req.body;
    let modelo = (params.modelo == null) ? 1 : params.modelo;

    var request = new sql.Request();
    request.input('modelo',sql.Int,modelo);
    request.execute('sp_configuracion_update', 
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

    function configuracion_get(req,res){

  
            var sqlquery = "select * from configuracion";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
    
}

module.exports = {
    configuracion_post,
    configuracion_sm_post,
    configuracion_get
}