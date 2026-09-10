
'use strict'

var sql = require('mssql');

function uploadImage(req,res){
    res.status(200).send({message: 'OK'});
}

function bulk_genericos_en(req,res){

    
    var ids = req.body.ids;
    var caracteristicas = req.body.caracteristicas;
    var beneficios = req.body.beneficios;
    var recomendado = req.body.recomendado;
    var aportamos = req.body.aportamos;

 
   var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),ids);
        request.input('composiciontecnica',sql.VarChar(500),caracteristicas);
        request.input('beneficios',sql.VarChar(500),beneficios);
        request.input('recomendado',sql.VarChar(500),recomendado);
        request.input('queaportamos',sql.VarChar(500),aportamos);
        request.execute('Update_NH_Articulos_Genericos_en', 
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

function bulk_genericos_fr(req,res){

    
    var ids = req.body.ids;
    var caracteristicas = req.body.caracteristicas;
    var beneficios = req.body.beneficios;
    var recomendado = req.body.recomendado;
    var aportamos = req.body.aportamos;

 
   var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),ids);
        request.input('composiciontecnica',sql.VarChar(500),caracteristicas);
        request.input('beneficios',sql.VarChar(500),beneficios);
        request.input('recomendado',sql.VarChar(500),recomendado);
        request.input('queaportamos',sql.VarChar(500),aportamos);
        request.execute('Update_NH_Articulos_Genericos_fr', 
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

function bulk_genericos(req,res){

    
    var ids = req.body.ids;
    var caracteristicas = req.body.caracteristicas;
    var beneficios = req.body.beneficios;
    var recomendado = req.body.recomendado;
    var aportamos = req.body.aportamos;
    var caracteristicas_en = req.body.caracteristicas_en;
    var beneficios_en = req.body.beneficios_en;
    var recomendado_en = req.body.recomendado_en;
    var aportamos_en = req.body.aportamos_en;
    var caracteristicas_fr = req.body.caracteristicas_fr;
    var beneficios_fr = req.body.beneficios_fr;
    var recomendado_fr = req.body.recomendado_fr;
    var aportamos_fr = req.body.aportamos_fr;

 
   var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),ids);
        request.input('composiciontecnica',sql.VarChar(500),caracteristicas);
        request.input('beneficios',sql.VarChar(500),beneficios);
        request.input('recomendado',sql.VarChar(500),recomendado);
        request.input('queaportamos',sql.VarChar(500),aportamos);
        request.input('composiciontecnica_en',sql.VarChar(500),caracteristicas_en);
        request.input('beneficios_en',sql.VarChar(500),beneficios_en);
        request.input('recomendado_en',sql.VarChar(500),recomendado_en);
        request.input('queaportamos_en',sql.VarChar(500),aportamos_en);
        request.input('composiciontecnica_fr',sql.VarChar(500),caracteristicas_fr);
        request.input('beneficios_fr',sql.VarChar(500),beneficios_fr);
        request.input('recomendado_fr',sql.VarChar(500),recomendado_fr);
        request.input('queaportamos_fr',sql.VarChar(500),aportamos_fr);
        request.execute('Update_NH_Articulos_Genericos', 
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

function publish_articulo(req,res){

      var params = req.body;
      
        var request = new sql.Request();
        request.input('ids',sql.VarChar(2500),params.ids);
        request.input('publish',sql.Int,params.value);
        request.execute('Publish_NH_Articulos', 
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

 function put_articulo(req,res){

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

 	if (values.length == 12)
 	{
 		    if (values[0] == ""){
 		    	values[0] = "-1";
 		    }

 		    if (values[5] == ""){
 		    	values[5] = "1";
 		    }

 			if (values[11] == true){
 				values[11] = "1";
 			} else {
 				values[11] = "0";
 			}
 	}
 
 		var request = new sql.Request();
	    request.input('idrow',sql.Int,values[0]);
        request.input('web_descripcion',sql.VarChar(100),values[2]);
        request.input('web_descripcion_l1',sql.VarChar(100),values[3]);
        request.input('web_descripcion_l2',sql.VarChar(100),values[4]);
        request.input('categoria',sql.Int,values[5]);
        request.input('publish',sql.Int,values[11]);
        request.input('queaportamos',sql.VarChar(2500),values[6]);
        request.input('recomendado',sql.VarChar(2500),values[7]);
        request.input('beneficios',sql.VarChar(2500),values[8]);
        request.input('composicion',sql.VarChar(2500),values[9]);
        request.input('agrupacion',sql.VarChar(250),values[10]);
        request.execute('Update_NH_Articulos', 
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

function articulos_filtered(req,res){
    var criterio = req.params.criterio;
    var alias = req.params.alias;
    var barras = req.params.barras;
    var familia = req.params.familia;
    var subfamilia = req.params.subfamilia;
    var color = req.params.color;
    var composicion = req.params.composicion;
    var calidad = req.params.calidad;
    var publicados = req.params.publicados;



    var sqlquery = "select idrow,descripcion,web_descripcion,web_descripcion_l1,web_descripcion_l2,categoria,ncategoria,";
    sqlquery += " isnull(publish,0) as publish,udsbolsa,udscaja,queaportamos,recomendado,beneficios,composicion_tecnica, ";
    sqlquery += " queaportamos_en,recomendado_en,beneficios_en,composicion_tecnica_en,";
    sqlquery += " queaportamos_fr,recomendado_fr,beneficios_fr,composicion_tecnica_fr,";
    sqlquery += " color,agrupacion,descfamilia,descsubfamilia,desccalidad,isnull(web_image_1,'-') as web_image_1 from vw_nh_articulos ";
    sqlquery += " where 1=1 ";
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

function articulos(req,res){

        	var sqlquery = "select idrow,descripcion,web_descripcion,web_descripcion_l1,web_descripcion_l2,categoria,ncategoria,";
        	sqlquery += " isnull(publish,0) as publish,udsbolsa,udscaja,queaportamos,recomendado,beneficios,composicion_tecnica,agrupacion,web_image_1,";
            sqlquery += " queaportamos_en,recomendado_en,beneficios_en,composicion_tecnica_en,";
            sqlquery += " queaportamos_fr,recomendado_fr,beneficios_fr,composicion_tecnica_fr ";
            sqlquery += " from vw_nh_articulos order by descripcion";

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
	


function api_articulos(req,res){

        	var sqlquery = "select idrow,descripcion,web_descripcion as nombre_es,web_descripcion_l1 as nombre_gb,web_descripcion_l2 as nombre_fr,categoria,ncategoria,";
        	sqlquery += "  udsbolsa,udscaja,queaportamos,recomendado,beneficios,composicion_tecnica,agrupacion,web_image_1,";
            sqlquery += " queaportamos_en,recomendado_en,beneficios_en,composicion_tecnica_en,";
            sqlquery += " queaportamos_fr,recomendado_fr,beneficios_fr,composicion_tecnica_fr ";
            sqlquery += " from vw_nh_articulos where isnull(publish,0)=1  order by descripcion";

    		new sql.Request().query(sqlquery, (err2,result) => {

    			if (err2 == null)
    			{
    				res.status(200).send({ Table : result.recordset });
    			} 
    			else 
    			{
    				console.log(err2);
    				res.status(500).send({ message : err2});
    			}

    		});
    		
}

function api_stock(req,res){


      var sqlquery = "select articulo,stock from NH_ARTICULOS_STOCK order by articulo";
      new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null)
                {
                    res.status(200).send({ Table : result.recordset });
                } 
                else 
                {
                    console.log(err2);
                    res.status(500).send({ message : err2});
                }

            });
}

function api_stock_article(req,res){

      var articulo = req.params.articulo;

      var sqlquery = "select articulo,stock from NH_ARTICULOS_STOCK where articulo=" + articulo;
      new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null)
                {
                    res.status(200).send({ Table : result.recordset });
                } 
                else 
                {
                    console.log(err2);
                    res.status(500).send({ message : err2});
                }

            });
}

function stock_add(req,res){

    var articulo = req.params.article;
    var amount   = req.params.amount;
    var ud       = req.params.ud;

    var request = new sql.Request();
        request.input('article',sql.Int,articulo);
        request.input('id',sql.Int,amount);
        request.input('amount',sql.Int,ud);
        request.execute('NH_AddStockInfo', 
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

function api_tarifa(req,res){

    var articulo = req.params.articulo;

    var sqlquery = "select articulo,uds_bolsa,uds_caja,precio_ud_bolsa,precio_ud_caja from NH_ARTICULOS_TARIFAS ";
    
    if (articulo != null){
        sqlquery += "where articulo=" + articulo;
    }

    sqlquery += " order by articulo";

     new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null)
                {
                    res.status(200).send({ Table : result.recordset });
                } 
                else 
                {
                    console.log(err2);
                    res.status(500).send({ message : err2});
                }

            });
}


function unidades(req,res){


      var sqlquery = "select unidad,descripcion from SOL_ARTICULOS_UNIDADES order by unidad";
      new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null)
                {
                    res.status(200).send({ Table : result.recordset });
                } 
                else 
                {
                    console.log(err2);
                    res.status(500).send({ message : err2});
                }

            });
}

module.exports = {
	articulos,
	api_articulos,
	put_articulo,
    publish_articulo,
    articulos_filtered,
    uploadImage,
    bulk_genericos,
    bulk_genericos_en,
    bulk_genericos_fr,
    api_stock,
    api_stock_article,
    api_tarifa,
    stock_add,
    unidades

};