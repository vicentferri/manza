'use script'

var sql = require('mssql');
var auth = require('../../middlewares/authenticated');

function Load(req,res)
{
    //var group = req.user.group;
    //var sub   = req.user.sub;
    
        //var sqlquery = "select pais as id,descripcion as name from NH_MASTER_PAISES where kon_grupo='"+group+"' ";
        var sqlquery = "select pais as id,descripcion as name from MASTER_PAISES ";
        new sql.Request().query(sqlquery, (err2,result) => {
        if (err2 == null)
        {
            res.status(200).send({ Table : result.recordset });
        }
        else
        {
            console.log(err2);
            res.status(500).send({ message : err2 });
        }
        });
}

function LoadToken(req,res)
{
    var token = req.params.token;
    if (token)
    {
        var group = auth.checkAuth(token.replace(/['""]+/g,''));
        var sqlquery = "select pais as id,descripcion as name from NH_MASTER_PAISES where kon_grupo='"+group+"' ";
        new sql.Request().query(sqlquery, (err2,result) => {
        if (err2 == null)
        {
            res.status(200).send({ Table : result.recordset });
        }
        else
        {
            console.log(err2);
            res.status(500).send({ message : err2 });
        }
        });
    }
}

module.exports = {
    Load,
    LoadToken
}
