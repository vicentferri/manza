'use strict'


var sql = require('mssql');

function tejidos_cliente_producto_operate(req,res)
{
    let params = req.body;

    console.log(params);
    let values = (params.ids == null) ? '' : params.ids;
    let cliente = (params.cliente == null) ? -1 : params.cliente;
    let producto = (params.producto == null) ? -1 : params.producto
    let tejido = (params.tejido == null) ? -1 : params.tejido;
    let operation = (params.operation == null) ? -1 : params.operation;
   
var request = new sql.Request();
        request.input('values',sql.VarChar(2500),values);
        request.input('cliente',sql.Int,cliente);
        request.input('producto',sql.Int,producto);
        request.input('tejido',sql.Int,tejido);
        request.input('operation',sql.Int,operation);
        request.execute('sp_articulos_tejidos_clientes_productos_delete', 
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

function tejidos_cliente_producto(req,res)
{
    let sqlquery = "select tab.idrow,tab.cliente,cli.NomFiscal,tab.producto,tab.tejido,tab.impresion,tab.diasfabricacion,";
    sqlquery += "dbo.fn_TipoArticulo(tab.producto) as descproducto,tej.descripcion from  [SOLARMANES_DEV].[dbo].[sol_articulos_tejidos_clientes_productos] tab ";
    sqlquery += " inner join NH_CLIENTES cli on cli.IdCliente = tab.CLIENTE ";
    sqlquery += " inner join SOL_ARTICULOS_TEJIDOS tej on tej.idrow = tab.tejido ";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
                    }
        });
}

function del_tejido_cliente(req,res){
	
	var params = req.body;
  
    var values = params.ids;

    var request = new sql.Request();
        request.input('values',sql.VarChar(2500),values);
        request.execute('sp_master_sm_tejidos_cliente_delete', 
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

function del_tejido_atributos(req,res){
	
    let body = req.body;
    let idrow = body.ids.join(";");
 
        var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.execute('sp_master_sm_tejidoatributos_delete', 
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

function del_tejido(req,res){
	
	var params = req.body;
  
    var values = params.ids;

    var request = new sql.Request();
        request.input('values',sql.VarChar(2500),values);
        request.execute('sp_master_sm_tejidos_delete', 
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

function put_tejido(req,res){

    var params = req.body;

    const idrow = (params.idrow == null) ? -1 : params.idrow;
    const descripcion = params.descripcion;
   

        var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.input('tejido',sql.VarChar(255),descripcion);
        request.execute('sp_master_sm_tejidos', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                    res.status(200).send({message: 'OK'});
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });
 }

function Tejido_Cliente_Producto(kunde,values,producto,impresion,dias)
{
     var request = new sql.Request();
        request.input('kunde',sql.Int,kunde);
        request.input('values',sql.VarChar(2500),values);
        request.input('producto',sql.Int,producto);
        request.input('impresion',sql.Int,impresion);
        request.input('dias',sql.Int,dias);
        request.execute('sp_master_sm_tejidos_clientes_multiple_productos', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    return -1;
                }
                else
                {
                   return 1;
                }
            }
            else 
            {
               return -1;
            }
    });
}

function put_tejidos_clientes(req,res){

    var params = req.body;
    var values = params.ids;
    var kunde = params.value;
    var productos = params.productos;


    var request = new sql.Request();
        request.input('kunde',sql.Int,kunde);
        request.input('values',sql.VarChar(2500),values);
        request.execute('sp_master_sm_tejidos_clientes_multiple', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    for (var i=0;i<productos.length;i++)
                    {
                        var item = productos[i];
                        var producto = item.id;
                        var sel = item.sel;
                        var impresion = (item.imp == true) ? 1 : 0;
                        var dias = item.dias;
                        if (sel == true)
                        {
                            Tejido_Cliente_Producto(kunde,values,producto,impresion,dias);
                        }
                    }

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

function del_tejidos_colores_traduccion(req,res)
{
    var params = req.body;
    var values = params.ids;
     var request = new sql.Request();
        request.input('values',sql.VarChar(8000),values);
        request.execute('sp_master_sm_tejidos_colores_delete', 
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

function put_tejidos_colores_traduccion(req,res)
{
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


    var request = new sql.Request();
        request.input('idrow',sql.Int,values[0]);
        request.input('traduccion',sql.VarChar(255),values[4]);
        request.execute('sp_master_sm_tejidos_colores_traduccion', 
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


function put_tejidos_colores(req,res){

    var params = req.body;
  
    var values = params.ids;
    var kunde = params.kunde;
    var tejido = params.value;

    var request = new sql.Request();
        request.input('tejido',sql.Int,tejido);
        request.input('cliente',sql.Int,kunde);
        request.input('values',sql.VarChar(2500),values);
        request.execute('sp_master_sm_tejidos_colores_multiple', 
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

function put_tejidos_atributos(req,res){

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
            values[0] = -1;
        }

     

        var request = new sql.Request();
        request.input('idrow',sql.Int,values[0]);
        request.input('tejido',sql.Int,values[1]);
        request.input('color',sql.Int,values[2]);
        request.input('cliente',sql.Int,values[3]);
        request.input('descripcion',sql.VarChar(255),values[4]);
        request.input('anchomax',sql.Decimal(12,2),values[5]);
        request.input('impresiondigital',sql.Bit,values[6]);
        request.input('codigoprov',sql.NVarChar(25),values[7]);
        request.execute('sp_master_sm_tejidoatributos', 
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

function put_tejidos_descripcion(req,res)
{
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
   
    var request = new sql.Request();
        request.input('id',sql.Int,values[0]);
        request.input('descripcion',sql.VarChar(50),values[3]);
        request.execute('sp_master_sm_tejidos_clientes', 
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

function tejidos_colores_delete(req,res)
{
    var ids  = req.body.ids;
   

   var request = new sql.Request();
        request.input('ids',sql.VarChar(8000),ids);
        request.execute('sp_tejidos_colores_delete', 
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

function tejidos_colores_assign(req,res)
{
    var tejido  = req.body.tejido;
    var colores = req.body.colores; 
   

   var request = new sql.Request();
        request.input('tejido',sql.Int,tejido);
        request.input('colores',sql.VarChar(8000),colores);
        request.execute('sp_tejidos_colores_assign', 
        function(err, recordsets, returnValue) {

            console.log(err);
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

function tejidos_colores(req,res)
{
    var sqlquery = "select idrow,tejido,color,desctejido,desccolor,isnull(impresion_digital,0) as impresion_digital from vw_articulos_colores order by desctejido,desccolor";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
                    }
        });
}

function tejidos_atributos(req,res)
{
    var sqlquery = "SELECT [idrow],[tejido],[Ntejido],[color],[Ncolor],[cliente],[Ncliente],[descripcion],[anchomax],[impresiondigital],[codigoprov] FROM [SOLARMANES_DEV].[dbo].[SOL_ARTICULOS_TEJIDOS_ATRIBUTOS]";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
                    }
        });
}

function tejidos_colores_filtered(req,res)
{
    var tejido = req.params.tejido;
    var ops = req.params.ops;

    if (ops == 0)
    {
        var sqlquery = "select idrow,descripcion from SOL_ARTICULOS_COLORES_MARCAS where not idrow in (";
        sqlquery += " select color from   vw_articulos_colores where tejido="+tejido+") order by descripcion";
    } else 
    {
        var sqlquery = "select idrow,desccolor as descripcion from vw_articulos_colores ";
        sqlquery +=" where tejido="+tejido+" order by desctejido,desccolor";
    }

    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
                    }
        });
}

function tejidos_tarifas(req,res)
{
    var sqlquery = "select idrow,nombre from SOL_TARIFAS_SIMULATE where activa=1 order by nombre";
    new sql.Request().query(sqlquery, (err2,result) => {
        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
                    }
        });
}

function tejidos_clientes_descripcion(req,res)
{
    var sqlquery = "select idrow,cliente,descripcion,traduccion,c1,c2,c3,tarifa,desctarifa from vw_articulos_tejidos_clientes order by cliente";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });   
                    }
        });
}

function tejidos_clientes(req,res)
{
    var cliente = req.params.cliente;

   
     var sqlquery = "select tejidos.idrow,tejidos.descripcion,rel.descripcion as descCliente from SOL_ARTICULOS_TEJIDOS_CLIENTES rel ";
        sqlquery += " inner join SOL_ARTICULOS_TEJIDOS tejidos on tejidos.IDROW = rel.id ";
        sqlquery += " inner join sol_clientes clientes on clientes.idrow = rel.cliente ";
        sqlquery += " where rel.cliente = " + cliente;

        new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tejidos_clientes_filter(req,res)
{
    var cliente = req.params.cliente;
   
   
     var sqlquery = "select id,descripcion as name from sol_articulos_tejidos_clientes ";
        sqlquery += " where cliente in (" + cliente + ")";

        new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });
}

function tejidos_salida(req,res){

			var sqlquery = "select idrow,descripcion from sol_articulos_salidatejido";
				new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        		sql.close();
        	});
     	
}

function tejidos(req,res){

 
			var sqlquery = "select idrow,descripcion,info_tecnica,uso_recomendado,opacidad,coste,criterio,densidad,coste3,criterio3,coste4,criterio4 from SOL_ARTICULOS_TEJIDOS order by descripcion";
				new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
     	
}

function tejidos_ext(req,res){

    var id = req.params.id;
    var sqlquery = "select uso_recomendado,info_tecnica,opacidad from sol_articulos_tejidos where idrow="+id;
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                        res.status(500).send({ message : err2 });   
                    }
            });

}

function tejidos_ext_set(req,res){
    
    var id    = req.body.id;
    var value1 = req.body.value; 
    var value2 = req.body.value2; 
    var value3 = req.body.value3; 
 

   var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('value',sql.VarChar(8000),value1);
        request.input('value2',sql.VarChar(8000),value2);
        request.input('value3',sql.VarChar(255),value3);
        request.execute('sp_articulos_tejidos_ext', 
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
	tejidos,
	tejidos_salida,
    tejidos_clientes,
    put_tejido,
    put_tejidos_clientes,
    put_tejidos_colores,
    tejidos_clientes_descripcion,
    put_tejidos_descripcion,
    tejidos_clientes_filter,
	del_tejido,
	del_tejido_cliente,
    tejidos_cliente_producto,
    tejidos_cliente_producto_operate,
    put_tejidos_colores_traduccion,
    del_tejidos_colores_traduccion,
    tejidos_ext,
    tejidos_ext_set,
    tejidos_colores,
    tejidos_colores_assign,
    tejidos_colores_delete,
    tejidos_colores_filtered,
    tejidos_tarifas,
    put_tejidos_atributos,
    del_tejido_atributos,
    tejidos_atributos
}