'use strict'
var sql = require('mssql');

function artikel_del(req,res){

   var body        = req.body;
   var ids     = body.ids;

   var request = new sql.Request();
    request.input('articles', sql.VarChar(8000), ids);
    request.execute('sp_articulos_delete',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
}

function artikel_add(req,res) {

    var body        = req.body;
   
    // var descripcion = body.descripcion;
    // var codsol      = body.codsol;
    // var famsol      = body.famsol;
    // var from        = body.from;
    // var codsec      = body.codsec;
    // var uprecio     = body.uprecio;

    var descripcion = body.nomart;
    var codsol      = body.codart;
    var famsol      = body.codfam;
    var from        = body.codart;
    var codsec      = body.codsec;
    var uprecio     = body.uprecio;
    
   var request = new sql.Request();
    request.input('descripcion', sql.VarChar(50), descripcion);
    request.input('cod_sol', sql.VarChar(25), codsol);
    request.input('fam_sol', sql.VarChar(25), famsol);
    request.input('from',sql.VarChar(25),from);
    request.input('uprecio',sql.Decimal(12,5),uprecio);
    request.input('clasificacion',sql.VarChar(25),codsec);
    request.execute('sp_articulos_add',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
   
}

function artikel_assign(req, res) {

    var body = req.body;


    var idrow      = (body.idrow == null) ? '0' : body.idrow;
    var tipo       = body.tipo;
    var descTipo   = body.tipo_value;
    var value1     = body.campo1_value;
    var descValue1 = body.campo1_value_descripcion;
    var value2     = body.campo2_value;
    var descValue2 = body.campo2_value_descripcion;
    var articles   = body.articles;
    var numero     = (body.numero == null) ? '1' : body.numero;

   var request = new sql.Request();
    request.input('idrow', sql.Int, idrow);
    request.input('tipo', sql.Int, tipo);
    request.input('descTipo',sql.VarChar(50),descTipo);
    request.input('value1', sql.Int, value1);
    request.input('descValue1', sql.VarChar(50), descValue1);
    request.input('value2', sql.Int, value2);
    request.input('descValue2', sql.VarChar(50), descValue2);
    request.input('articulos', sql.VarChar(8000), articles);
    request.input('numero', sql.Int, numero);
    request.execute('sp_articulos_fabricacion_relacion',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
    
}

function artikel_assign_fix(req, res) {

    var body = req.body;

    var idrow      = (body.idrow == null) ? '0' : body.idrow;
    var tipo       = body.tipo;
    var descTipo   = '';
    var value1     = '0';
    var descValue1 = '';
    var value2     = '0';
    var descValue2 = '';
    var articles   = body.articles;
    var producto   = body.producto;

   var request = new sql.Request();
    request.input('idrow', sql.Int, idrow);
    request.input('tipo', sql.Int, tipo);
    request.input('descTipo',sql.VarChar(50),descTipo);
    request.input('value1', sql.Int, value1);
    request.input('descValue1', sql.VarChar(50), descValue1);
    request.input('value2', sql.Int, value2);
    request.input('descValue2', sql.VarChar(50), descValue2);
    request.input('articulos', sql.VarChar(8000), articles);
    request.input('producto',sql.Int,producto);
    request.execute('sp_articulos_fabricacion_relacion_fix',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
    
}

function artikel_assign_delete(req, res) {

    var body = req.body;

    var idrow      = (body.idrow == null) ? '0' : body.idrow;
    var request = new sql.Request();
    request.input('idrow', sql.Int, idrow);
    request.execute('sp_articulos_fabricacion_relacion_delete',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
    
}

function artikel_fabric_desc_delete(req, res) {

    var body = req.body;

    var idrow      = (body.idrow == null) ? '0' : body.idrow;
    var request = new sql.Request();
    request.input('id', sql.Int, idrow);
    request.execute('sp_articulos_fabricacion_descuento_delete',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
    
}

function artikel_assign_delete_fix(req, res) {

    var body = req.body;

    var idrow      = (body.idrow == null) ? '0' : body.idrow;
    var request = new sql.Request();
    request.input('idrow', sql.Int, idrow);
    request.execute('sp_articulos_fabricacion_relacion_delete_fix',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
    
}


function artikeln(req, res) {

    var criterio = (req.params.criterio == null) ? '' : req.params.criterio;
    var alias = req.params.alias;


    var sqlquery = "select idrow,descripcion,cod_solupyme,fam_solupyme,precio_coste,precio_coste1,precio_venta,";
    sqlquery += "isnull(plazo_entrega,0) as plazo_entrega,isnull(tiempo_fabricacion,0) as tiempo_fabricacion,clasificacion, ";
    sqlquery += "synchro_date,tipoprod,descunidad,consumo,elemento,descelemento,margen,vertical,tipocalculo,desctipocalculo,descatributo,tipoatributo from busqueda_articulos ";

    if (criterio != ''){

        var values = criterio.split('+');
 
        if (values.length == 0) {
            sqlquery += " where descripcion like '%"+criterio+"%'";
        } else {
            sqlquery += " where ";

            for (var p=0;p<values.length;p++){
                sqlquery += " descripcion like '%"+values[p]+"%'";
                if (p<values.length-1){
                sqlquery += " and ";
                }
            }

 //           console.log(sqlquery);
        }
    } 

    //console.log(sqlquery);
    //sqlquery += " where 1=1 ";

    /*
    if (familia != null && familia != "-1")
    {
        sqlquery += " and subfamilia='"+familia+"'";
    }
    if (subfamilia != null && subfamilia != "-1")
    {
        sqlquery += " and subfamilia_tipo="+subfamilia;
    }
    if (color != null && color != "-1")
    {
        sqlquery += " and color='"+color+"'";
    }
    if (calidad != null && calidad != "-1")
    {
        sqlquery += " and calidad="+calidad;
    }
    if (criterio != null && criterio != "-1")
    {
        sqlquery += " and descripcion like '%"+criterio+"%'";
    }
    if (alias != null && alias != "-1")
    {
        sqlquery += " and alias like '%"+alias+"%'";
    }
    if (barras != null && barras != "-1")
    {
        sqlquery += " and barras like '%"+barras+"%'";
    }

    if (publicados == 'true'){
        sqlquery += " and publish=1";
    }

    sqlquery += " order by descripcion";

    if (criterio == "-1" && alias == "-1" && barras == "-1" && familia== "-1" 
        && subfamilia=="-1" && color=="-1" && calidad=="-1" && composicion=="-1"){

        var sqlquery = "";
        if (publicados == 'false')
        {
            sqlquery = "select top 25 idrow,descripcion,web_descripcion,web_descripcion_l1,web_descripcion_l2,categoria,ncategoria,";
            sqlquery += " isnull(publish,0) as publish,udsbolsa,udscaja,queaportamos,recomendado,beneficios,composicion_tecnica,isnull(web_image_1,'-') as web_image_1 ";
            sqlquery += " from vw_nh_articulos order by descripcion"; 
        } else {
            sqlquery = "select idrow,descripcion,web_descripcion,web_descripcion_l1,web_descripcion_l2,categoria,ncategoria,";
            sqlquery += " isnull(publish,0) as publish,udsbolsa,udscaja,queaportamos,recomendado,beneficios,composicion_tecnica,isnull(web_image_1,'-') as web_image_1 ";
            sqlquery += " from vw_nh_articulos where publish=1 order by descripcion"; 
        }
    }
*/    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}


function search_articles_assigned(req, res) {
    var search = req.body;
    var parent = search.parent;
    var customer = search.customer;

    var sqlquery = "select  idrow,descripcion,cod_solupyme,fam_solupyme,precio_coste,precio_venta,tipocalculo,desctipocalculo from busqueda_articulos ";
    sqlquery += " where 1=1 ";
    if (search.Descripcion) {
        sqlquery += " and descripcion like '%" + search.Descripcion + "%'";
    }

    if (search.Alias) {
        sqlquery += " and alias like '" + search.Alias + "%'";
    }

    if (search.Barras) {
        sqlquery += " and barras like '" + search.Barras + "%'";
    }


    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_tipo(req, res) {
   
    var sqlquery = "select idrow,descripcion from SOL_ARTICULOS_TIPO ";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_elements(req, res) {
   
    var sqlquery = "select idrow,nombre from ARTICULOS_ELEMENTOS ";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_tipocalculo(req, res) {
   
    var sqlquery = "select idrow,descripcion as nombre from SOL_ARTICULOS_TIPOCALCULO ";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function customers_tipo(req,res){
    var sqlquery = "select idrow,descripcion from SOL_CLIENTES";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric_simulate(req,res)
{
    let body  = req.body;
    let idrow = body.idrow;
   
    var request = new sql.Request();
        request.input('idPedido', sql.Int, idrow);
        request.execute('sp_fabricacion_mrp_cd',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
}

function artikel_fabric_sm_simulate(req,res)
{
    let body  = req.body;
    let idrow = body.idrow;
    console.info(body);
    var request = new sql.Request();
        request.input('idPedido', sql.Int, idrow);
        request.execute('sp_fabricacion_mrp_sm',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
}

function artikel_fabric_delete(req,res)
{
    let body = req.body;
    let idrow = body.idrow;
    var request = new sql.Request();
    request.input('idrow', sql.Int, idrow);
    request.execute('sp_solarmanes_configuracion_fabricacion_borrar',
    function (err, recordsets, returnValue) {

        if (err == null) {
            if (recordsets.returnValue == null) {
                res.status(500).send({ message: 'KO' });
            }
            else {
                res.status(200).send({ message: 'OK' });
            }
        }
        else {
            console.log(err);
            res.status(500).send({ message: 'KO' });
        }
    });

}

function artikel_fabric_setup_add(req,res)
{
        let body  = req.body;
        let idrow = body.idrow;
        let orden = body.orden;
        let sistema = body.sistema;
        let atributo = body.atributo;
        let valor = body.valor;
        let articulos = body.articulos;
        let nombre1   = body.nombre_parametro1;
        let nombre2   = body.nombre_parametro2;
        let operacion = body.operacion;
    
        var request = new sql.Request();
        request.input('idrow', sql.Int, idrow);
        request.input('orden', sql.Int, orden);
        request.input('sistema',sql.VarChar(50),sistema);
        request.input('atributo',sql.VarChar(50),atributo);
        request.input('valor',sql.VarChar(50),valor);
        request.input('articulos',sql.VarChar(1024),articulos);
        request.input('nombre_parametro1',sql.VarChar(50),nombre1);
        request.input('nombre_parametro2',sql.VarChar(50),nombre2);
        request.input('operacion',sql.VarChar(1),operacion);
        request.execute('sp_solarmanes_configuracion_fabricacion',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });

}

function artikel_fabric_setup_add_sm(req,res)
{
        let body  = req.body;
        let idrow = body.idrow;
        let orden = body.orden;
        let sistema = body.sistema;
        let atributo = body.atributo;
        let valor = body.valor;
        let articulos = body.articulos;
        let nombre1   = body.nombre_parametro1;
        let nombre2   = body.nombre_parametro2;
        let nombre3   = body.nombre_parametro3;
        let nombre4   = body.nombre_parametro4;
        let operacion = body.operacion;
        let operacion2 = body.operacion2;
        let operacion3 = body.operacion3;
    
        var request = new sql.Request();
        request.input('idrow', sql.Int, idrow);
        request.input('orden', sql.Int, orden);
        request.input('sistema',sql.VarChar(50),sistema);
        request.input('atributo',sql.VarChar(50),atributo);
        request.input('valor',sql.VarChar(50),valor);
        request.input('articulos',sql.VarChar(1024),articulos);
        request.input('nombre_parametro1',sql.VarChar(50),nombre1);
        request.input('nombre_parametro2',sql.VarChar(50),nombre2);
        request.input('nombre_parametro3',sql.VarChar(50),nombre3);
        request.input('nombre_parametro4',sql.VarChar(50),nombre4);
        request.input('operacion',sql.VarChar(1),operacion);
        request.input('operacion2',sql.VarChar(1),operacion2);
        request.input('operacion3',sql.VarChar(1),operacion3);
        request.execute('sp_solarmanes_configuracion_sm_fabricacion',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });

}

function artikel_fabric_parameters_del(req,res)
{
    var body = req.body;
    let name       = body.name;

    var request = new sql.Request();
    request.input('name', sql.VarChar(25), name);
    request.execute('sp_articulos_fabricacion_parametros_delete',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
}

function artikel_fabric_parameters_add(req,res)
{
    var body = req.body;
    let name       = body.nombre;
    let type       = body.tipo;
    let atribute   = body.atributo;
    let pos        = body.posicion;

  

    var request = new sql.Request();
    request.input('name', sql.VarChar(25), name);
    request.input('type',sql.VarChar(25),type);
    request.input('atributo',sql.VarChar(25),atribute);
    request.input('pos',sql.Int,pos);
    request.execute('sp_articulos_fabricacion_parametros_edit',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });
}

function artikel_fabric_parameters(req,res)
{
    var sqlquery = "select name as idrow,name,type,atributo,pos from SOL_ARTICULOS_CD_FABRICACION_RELACION_V2_PARAMETROS order by pos,atributo";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric_parameters_sm(req,res)
{
    var sqlquery = "select name as idrow,name,type,atributo,pos from SOL_ARTICULOS_FABRICACION_RELACION_V2_PARAMETROS order by name";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric_setup(req,res)
{
    var sqlquery = "select idrow,orden,sistema,atributo,valor,articulos,dbo.fn_get_articles(articulos,',') as detalle,nombre_parametro1,nombre_parametro2,operacion,consumo ";
    sqlquery += " from SOL_ARTICULOS_CD_FABRICACION_RELACION_V2 ";
    sqlquery += " order by sistema,orden,atributo ";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric_setup_sm(req,res)
{
    var sqlquery = "select idrow,orden,sistema,atributo,valor,articulos,dbo.fn_get_articles(articulos,',') as detalle,nombre_parametro1,nombre_parametro2,operacion,consumo, ";
    sqlquery += " operacion2,operacion3,nombre_parametro3,nombre_parametro4 from SOL_ARTICULOS_FABRICACION_RELACION_V2 ";
    sqlquery += " order by sistema,orden,atributo ";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric(req,res){

    var tipo = req.params.tipo;
    var cliente = req.params.cliente;

    var sqlquery = "select idrow,value1,descValue1,value2,descValue2,dbo.fn_get_articles(articulos,',') as articulos,consumo,cantidad,consumo2,cantidad2,";
    sqlquery += "  dbo.fn_get_articles(articulos2,',') as articulos2 from SOL_ARTICULOS_FABRICACION_RELACION ";
    sqlquery += " where tipo="+tipo;
    sqlquery += " order by descValue1, descValue2,value1,value2";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric_formulas(req,res)
{
    var sqlquery = "select idrow,formula from sol_articulos_formulas order by idrow";
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric_fix(req,res){

    var tipo = req.params.tipo;
    var producto = req.params.producto;
    var cliente = req.params.cliente;

/*
    var sqlquery = "select idrow,(select cod_solupyme from articulos where articulos.idrow=SOL_ARTICULOS_FABRICACION_FIJOS.articulo) as cod_solupyme, ";
    sqlquery += " dbo.fn_get_articles(articulo,',') as articulos,isnull(cantidad,1) as cantidad,isnull(constante,1) as constante,formula from SOL_ARTICULOS_FABRICACION_FIJOS ";
    sqlquery += " where tipo="+tipo + " and producto=" + producto;
*/
    var sqlquery = "select SOL_ARTICULOS_FABRICACION_FIJOS.idrow,(select cod_solupyme from articulos where articulos.idrow=SOL_ARTICULOS_FABRICACION_FIJOS.articulo) as cod_solupyme, ";
    sqlquery += " dbo.fn_get_articles(articulo,',') as articulos,isnull(cantidad,1) as cantidad,isnull(consumo,0) as consumo,isnull(constante,1) as constante,SOL_ARTICULOS_FABRICACION_FIJOS.formula as idformula, ";
    sqlquery += " sol_articulos_formulas.formula from SOL_ARTICULOS_FABRICACION_FIJOS ";
    sqlquery += " inner join sol_articulos_formulas on sol_articulos_formulas.idrow =  SOL_ARTICULOS_FABRICACION_FIJOS.formula ";
    sqlquery += " where SOL_ARTICULOS_FABRICACION_FIJOS.tipo="+tipo+ " and SOL_ARTICULOS_FABRICACION_FIJOS.producto=" + producto;
    new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
}

function artikel_fabric_desc(req,res){

    var body = req.body;

    var id      = (body.id == null) ? '0' : body.id;
    var value1  = body.value1;
    var value2  = body.value2;
    var value3  = body.value3;
    var value4  = body.value4;
    var value5  = body.value5;
    var ancho   = body.ancho;
    var alto    = body.alto;
    var tubo    = body.tubo;
    var oculto  = body.oculto;
    var visto   = body.visto;
    var macarron   = body.macarron;

    var request = new sql.Request();
    request.input('id', sql.Int, id);
    request.input('value1', sql.Int,value1);
    request.input('value2', sql.Int,value2);
    request.input('value3', sql.Int,value3);
    request.input('value4', sql.Int,value4);
    request.input('value5', sql.Int,value5);
    request.input('Ancho',sql.Decimal(12,2),ancho);
    request.input('Alto',sql.Decimal(12,2),alto);
    request.input('Tubo',sql.Decimal(12,2),tubo);
    request.input('Oculto',sql.Decimal(12,2),oculto);
    request.input('Visto',sql.Decimal(12,2),visto);
    request.input('Macarron',sql.Decimal(12,2),macarron);
    request.execute('sp_articulos_fabricacion_descuento',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });

   
}

   function artikel_fabric_desc_get(req,res)
   {
     var sqlquery = "select id,descValue1,descValue2,descValue3,descValue4,descValue5,Accionamiento,Ancho,Alto,Tubo,Oculto,Visto,Macarron ";
     sqlquery += " from sol_articulos_fabricacion_descuento order by Accionamiento,descValue1,descValue2,descValue3,descvalue4,descValue5";
     new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });
   }
 
 function artikel_parametres_get(req,res)
 {
      var idrow = req.params.idrow;
      var sqlquery = "select cantidad,ancho,minimo from ARTICULOS_TIPOCALCULO_PARAMETROS where idrow="+idrow;
      new sql.Request().query(sqlquery, (err2, result) => {

        if (err2 == null) {
            res.status(200).send({ Table: result.recordset });
        }
        else {
            res.status(500).send({ message: err2 });
        }
    });

 }

 function artikel_parametres(req,res)
 {
    var body = req.body;

    var id         = (body.id == null) ? '0' : body.id;
    var cantidad   = body.cantidad;
    var ancho      = body.ancho;
    var minimo     = body.minimo;

    var request = new sql.Request();
    request.input('idrow', sql.Int, id);
    request.input('cantidad',sql.Decimal(12,2),cantidad);
    request.input('ancho',sql.Decimal(12,2),ancho);
    request.input('minimo',sql.Decimal(12,2),minimo);
    request.execute('sp_articulos_tipocalculo_parametros',
        function (err, recordsets, returnValue) {

            if (err == null) {
                if (recordsets.returnValue == null) {
                    res.status(500).send({ message: 'KO' });
                }
                else {
                    res.status(200).send({ message: 'OK' });
                }
            }
            else {
                console.log(err);
                res.status(500).send({ message: 'KO' });
            }
        });

 }
 


module.exports = {
    artikeln,
    search_articles_assigned,
    artikel_assign,
    artikel_tipo,
    customers_tipo,
    artikel_fabric,
    artikel_add,
    artikel_del,
    artikel_assign_delete,
    artikel_fabric_fix,
    artikel_assign_fix,
    artikel_assign_delete_fix,
    artikel_fabric_desc,
    artikel_fabric_desc_get,
    artikel_fabric_formulas,
    artikel_elements,
    artikel_tipocalculo,
    artikel_fabric_desc_delete,
    artikel_parametres,
    artikel_parametres_get,
    artikel_fabric_setup,
    artikel_fabric_setup_add,
    artikel_fabric_parameters,
    artikel_fabric_simulate,
    artikel_fabric_delete,
    artikel_fabric_parameters_add,
    artikel_fabric_parameters_del,
    artikel_fabric_parameters_sm,
    artikel_fabric_setup_sm,
    artikel_fabric_setup_add_sm,
    artikel_fabric_sm_simulate
}