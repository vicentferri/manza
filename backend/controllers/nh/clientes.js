'use strict'

var sql = require('mssql');


function NeueKunde(req,res){

    var id            = (req.body.id == null) ? -1  : req.body.id;
    var cif           = req.body.cif;
    var nomfiscal     = req.body.nomfiscal;
    var dirfiscal     = req.body.dirfiscal;
    var cpfiscal      = req.body.cpfiscal;
    var pobfiscal     = req.body.pobfiscal;
    var provfiscal    = req.body.provfiscal;
    var telefono1     = req.body.Telefono1;
    var email         = req.body.email;
    var pais          = req.body.pais;
    var observaciones = req.body.observaciones;
    var nombrentrega  = req.body.nombrentrega;
    var domentrega    = req.body.domentrega;
    var cpentrega     = req.body.cpentrega;
    var pobentrega    = req.body.pobentrega;
    var proventrega   = req.body.proventrega;
    var paisentrega   = req.body.paisentrega;

    var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('cif',sql.VarChar(50),cif);
        request.input('nomfiscal',sql.VarChar(255),nomfiscal);
        request.input('dirfiscal',sql.VarChar(255),dirfiscal);
        request.input('cpfiscal',sql.VarChar(255),cpfiscal);
        request.input('pobfiscal',sql.VarChar(255),pobfiscal);
        request.input('provfiscal',sql.VarChar(255),provfiscal);
        request.input('telefono1',sql.VarChar(255),telefono1);
        request.input('email',sql.VarChar(255),email);
        request.input('pais',sql.Int,pais);
        request.input('observaciones',sql.VarChar(255),observaciones);
        request.input('nombrentrega',sql.VarChar(255),nombrentrega);
        request.input('domentrega',sql.VarChar(255),domentrega);
        request.input('cpentrega',sql.VarChar(50),cpentrega);
        request.input('pobentrega',sql.VarChar(255),pobentrega);
        request.input('proventrega',sql.VarChar(255),proventrega);
        request.input('paisentrega',sql.Int,paisentrega);
        request.execute('NH_CreateKunde', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    var id = recordsets.returnValue
                    res.status(200).send({message: 'OK', id: id});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
            });
}

function clientes(req,res){

    var sqlquery = "select idCliente,NomFiscal as NomCliente from vw_nh_customers_search order by NomFiscal";
new sql.Request().query(sqlquery, (err2,result) => {

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

function grupo_modelo_form(req,res)
{
    
    let sqlquery = "SELECT idrow as value, descripcion as label FROM SOL_GRUPO_MODELO order by descripcion";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}

function grupo_spmodelo_form(req,res)
{
    
    let sqlquery = "SELECT tag as value, descripcion as label FROM SOLARMANES_CARACTERISTICA_MODELO order by descripcion";
    
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
        }
    });
}

function form_clientes(req,res){

    var sqlquery = "select idCliente as value,NomFiscal as label from vw_nh_customers_search order by NomFiscal";
new sql.Request().query(sqlquery, (err2,result) => {

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

function form_colores(req,res){

    var sqlquery = "select idrow as value,descripcion + '-' + ltrim(str(idrow)) as label from SOL_ARTICULOS_COLORES_MARCAS where tipo = 1 and Bloqueo = 0 order by descripcion";
new sql.Request().query(sqlquery, (err2,result) => {

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


function form_tejidos(req,res){

    var sqlquery = "select idrow as value,descripcion as label from SOL_ARTICULOS_TEJIDOS order by descripcion";
new sql.Request().query(sqlquery, (err2,result) => {

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

function clientes_direcciones(req,res){

            var cliente = req.params.cli;

            var sqlquery = "select idrow,nombre from nh_clientes_domicilios where idcliente="+cliente+" order by nombre";
        new sql.Request().query(sqlquery, (err2,result) => {

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



module.exports = {
	clientes,
    clientes_direcciones,
    NeueKunde,
    form_clientes,
    form_tejidos,
    form_colores,
    grupo_modelo_form,
    grupo_spmodelo_form
};
