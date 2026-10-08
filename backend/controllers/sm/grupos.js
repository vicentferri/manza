'use strict'

var sql = require('mssql');

function grupostejidos(req,res)
{
    var sqlquery = "select idrow,grupo,descripcion,nexos,precio,criterio,precio as coste from sol_articulos_tejidos_grupos order by grupo";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });	
        }
});
}

function tejidosgrupo(req,res)
{
    var idrow = parseInt(req.params.idrow, 10) || 0;

    var sqlquery = "select idrow,descripcion from sol_articulos_tejidos where idrow in ( ";
        sqlquery += "select data from string_to_table((select ISNULL(nexos, '') from SOL_ARTICULOS_TEJIDOS_GRUPOS where idrow="+idrow+"),','))";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });	
            }
    });
}


function grupostejidos_tejidos(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let ids = body.ids;
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('ids',sql.VarChar(8000),ids);
    request.execute('sp_tejidos_grupos_tejidos_add', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }

       
        });  
}

function grupostejidos_tejidos_del(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let ids = body.ids;
    var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('ids',sql.VarChar(8000),ids);
    request.execute('sp_tejidos_grupos_tejidos_del', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }

       
        });  
}

function grupostejidos_add(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    let grupo = body.grupo;
    let descripcion = body.descripcion;
    let precio = body.precio;
    let criterio = body.criterio;

   
   var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.input('grupo',sql.VarChar(5),grupo);
    request.input('descripcion',sql.VarChar(50),descripcion);
    request.input('precio',sql.Decimal(12,4),precio);
    request.input('criterio',sql.Int,criterio);
    request.execute('sp_tejidos_grupos_add', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }

       
        });  
}

function grupostejidos_del(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
   
   
   var request = new sql.Request();
    request.input('idrow',sql.Int,idrow);
    request.execute('sp_tejidos_grupos_del', 
    function(err, recordsets, returnValue) {

        if (err == null)
        {       
            if (recordsets.returnValue == null)
            {
                res.status(500).send({message: 'KO'});
            }
            else
            {
                res.status(200).send({ message: 'OK',Table : recordsets.returnValue });
            }
        }
        else 
        {
            console.log(err);
            res.status(500).send({message: 'KO'});
        }

       
        });  
}


// Todos los tejidos con el grupo al que pertenecen (vacío si no tienen grupo).
// La pertenencia se guarda como lista "1,2,3" en SOL_ARTICULOS_TEJIDOS_GRUPOS.nexos
function tejidos_grupos_all(req,res)
{
    var sqlquery = "select t.idrow, t.descripcion, g.idrow as idgrupo, g.grupo, g.descripcion as grupo_descripcion, g.precio, g.criterio ";
        sqlquery += "from sol_articulos_tejidos t ";
        sqlquery += "left join SOL_ARTICULOS_TEJIDOS_GRUPOS g on ',' + replace(isnull(g.nexos,''),' ','') + ',' like '%,' + cast(t.idrow as varchar(10)) + ',%' ";
        sqlquery += "order by t.descripcion";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });
        }
    });
}

// "1, 2,abc,3" -> "1,2,3" (solo enteros positivos)
function parseIds(ids)
{
    return String(ids || '').split(',')
        .map(x => parseInt(x, 10))
        .filter(x => x > 0)
        .join(',');
}

// Quita los tejidos @ids de todos los grupos salvo @idgrupo y, si @idgrupo > 0, los añade a ese grupo.
// Un tejido solo puede pertenecer a un grupo (AT_nexos_grupos devuelve un único grupo por tejido).
async function moverTejidos(idgrupo, ids)
{
    const pool = await sql.connect();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const grupos = await new sql.Request(transaction)
            .input('idgrupo', sql.Int, idgrupo)
            .input('ids', sql.VarChar(8000), ids)
            .query("select idrow from SOL_ARTICULOS_TEJIDOS_GRUPOS where idrow <> @idgrupo and exists " +
                   "(select 1 from string_to_table(isnull(nexos,''),',') n where n.data in (select data from string_to_table(@ids,',')))");

        for (const g of grupos.recordset) {
            await new sql.Request(transaction)
                .input('idrow', sql.Int, g.idrow)
                .input('ids', sql.VarChar(8000), ids)
                .execute('sp_tejidos_grupos_tejidos_del');
        }

        if (idgrupo > 0) {
            await new sql.Request(transaction)
                .input('idrow', sql.Int, idgrupo)
                .input('ids', sql.VarChar(8000), ids)
                .execute('sp_tejidos_grupos_tejidos_add');
        }

        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function tejidosgrupos_asignar(req,res)
{
    let idgrupo = parseInt(req.body.idgrupo, 10) || 0;
    let ids = parseIds(req.body.ids);

    if (idgrupo <= 0 || ids == '') {
        return res.status(400).send({ message: 'KO' });
    }

    try {
        await moverTejidos(idgrupo, ids);
        res.status(200).send({ message: 'OK' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'KO' });
    }
}

async function tejidosgrupos_quitar(req,res)
{
    let ids = parseIds(req.body.ids);

    if (ids == '') {
        return res.status(400).send({ message: 'KO' });
    }

    try {
        await moverTejidos(0, ids);
        res.status(200).send({ message: 'OK' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'KO' });
    }
}


module.exports = {

    tejidos_grupos_all,
    tejidosgrupos_asignar,
    tejidosgrupos_quitar,
    grupostejidos,
    grupostejidos_add,
    grupostejidos_del,
    grupostejidos_tejidos,
    tejidosgrupo,
    grupostejidos_tejidos_del

}