'use strict'

var sql = require('mssql');


/*
*/
function backup_restore(req,res){
   
    let body = req.body;

    var request = new sql.Request();
    request.input('int',sql.Int,body.id);
    request.execute('backup_recover', 
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

/*
*/
function backup_delete(req,res)
{
    let body = req.body;

    var request = new sql.Request();
    request.input('id',sql.Int,body.id);
    request.execute('backup_delete', 
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

/*
*/
function backup_create(req,res){
   
    var request = new sql.Request();
    request.execute('backup_create', 
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

/*
*/
function search(req,res){

    var sqlquery = "select id,name,date from backup_history order by date desc";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });	
            }
    });
}

module.exports = {
    search,
    backup_create,
    backup_restore,
    backup_delete
}
