'use strict'

var sql = require('mssql');

function put_ancholama(req,res){

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


   
        var request = new sql.Request();
        request.input('idrow',sql.Int,values[0]);
        request.input('descripcion',sql.VarChar(255),values[1]);
        request.execute('sp_master_sm_ancholama', 
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

    function anchoslama(req,res){

            var sqlquery = "select idrow as id,descripcion as name from sol_articulos_ancholama order by descripcion";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
        
}

module.exports = {
    anchoslama,
    put_ancholama
}