'use strict'

var sql = require('mssql');
var fs = require('fs');
var path = require('path');



function ExecuteSQL(query,res)
{
  	new sql.Request().query(query, (err2,result) => {

      if (err2 == null)
      {
        	res.status(200).send(result.recordset);
      }
      else
      {
        	res.status(500).send({ message : err2 });	
      }
  });
}

function C1_Multiply_Perform(c1,mult)
{
    var sqlquery = "select [solarmanes_dev].[dbo].[C1_Multiply] ('"+c1+"',"+mult+") as res";
    new sql.Request().query(sqlquery, (err2,result) => {
        if (err2 == null)
        {
              return result.recordset[0].res;
        }
        else
        {
            console.log(err2);
              return 0;
        }
    });
}

function C1_Sum_Perform(c1,c2)
{
    var sqlquery = "select [solarmanes_dev].[dbo].[C1_Sum] ('"+c1+"',"+c2+") as res";
    new sql.Request().query(sqlquery, (err2,result) => {
        if (err2 == null)
        {
              return result.recordset[0].res;
        }
        else
        {
            console.log(err2);
              return 0;
        }
    });
}

function Test(req,res)
{
    res.status(200).send({message:'ok'});
}


function C1_Multiply(req,res){

      var c1 = req.params.c1;
      var mult = req.params.mult;

     
     if (c1 == null && mult == null)
     {
        res.status(500).send({message:'No existe cliente o idrow asociado a la petición'});
     } 
     else 
     {
        var query = "select [solarmanes_dev].[dbo].[C1_Multiply] ('"+c1+"',"+mult+") as res";
        ExecuteSQL(query,res);
      }
 
}

function C1_Sumatory(req,res){


    var params = req.body;
    var c1 = params.c1;
    var c2 = params.c2;
    var c3 = params.c3;
    var c4 = params.c4;
    var c5 = params.c5;
    var c6 = params.c6;
    var c7 = params.c7;
    var c8 = params.c8;

    /*
    var url = c1 + "+" + c2;
    if (c3 != "") { url += "+" + c3; }
    if (c4 != "") { url += "+" + c4; }
    if (c5 != "") { url += "+" + c5; }
    if (c6 != "") { url += "+" + c6; }
    if (c7 != "") { url += "+" + c7; }
    if (c8 != "") { url += "+" + c8; }
    */

    var url = c1 + "+" + c2 + "+" + c3 + "+" + c4 + "+" + c5 + "+" + c6 +  "+" + c7 + "+" + c8; 

    var query = "select [solarmanes_dev].[dbo].[C1_SumValues] ('"+url+"') as res";
  
    ExecuteSQL(query,res);
  
}

function C1_Sum(req,res){

      var c1 = req.params.c1;
      var c2 = req.params.c2;
      var c3 = req.params.c3;
      var c4 = req.params.c4;
      var c5 = req.params.c5;
      var c6 = req.params.c6;
      var c7 = req.params.c7;
      var c8 = req.params.c8;

      var ret = '';

      if (req.params.c1 && req.params.c2)
      {
            ret = C1_Sum_Perform(c1,c2);
      }

      if (req.params.c3 && req.params.c3 != "")
      {
            ret = C1_Sum_Perform(res,c3);
      }

      if (req.params.c4  && req.params.c4 != "")
      {
            ret = C1_Sum_Perform(res,c4);
      }

      if (req.params.c5  && req.params.c5 != "")
      {
            ret = C1_Sum_Perform(res,c5);
      }

      if (req.params.c6  && req.params.c6 != "")
      {
            ret = C1_Sum_Perform(res,c6);
      }

      if (req.params.c7  && req.params.c7 != "")
      {
            ret = C1_Sum_Perform(res,c7);
      }

      if (req.params.c8  && req.params.c8 != "")
      {
            ret = C1_Sum_Perform(res,c8);
      }
    
        res.status(200).send({message:ret});
}


function Vertical_ST_Tarifa(req,res)
{
    var ancholama = req.params.ancholama;
    var tejido    = req.params.tejido;
    var alto      = req.params.alto;
    var lamas     = req.params.lamas;
    var a1        = 0;
    var a2        = 0;


    
    var request = new sql.Request();
        request.input('ancholama',sql.Int,ancholama);
        request.input('tejido',sql.Int,tejido);
        request.input('alto',sql.Decimal(12,2),alto);
        request.input('lamas',sql.Int,lamas);
        request.output('pvp',sql.Decimal(12,2),a1);
        request.output('c1',sql.VarChar(255),a2);
        request.execute('sp_tarifa_vertical_solotejido', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    a1 = recordsets.output.pvp;
                    a2 = recordsets.output.c1;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }
           
            });
}


function  tarifa_accesorio(req,res)
{
	var mecanismo = req.params.idrow;
    var ancho     = req.params.ancho;
    var cantidad  = req.params.cantidad;
    var a1 		  = 0;
    var a2 	      = '';
    
	var request = new sql.Request();
        request.input('idrow',sql.Int,mecanismo);
        request.input('ancho',sql.Decimal(12,2),ancho);
        request.input('cantidad',sql.Int,cantidad);
		request.output('pvp',sql.Decimal(12,2),a1);
		request.output('c1',sql.VarChar(255),a2);
        request.execute('sp_tarifa_accesorios', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
					
					a1 = recordsets.output.pvp;
					a2 = recordsets.output.c1;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }
           
            });

}

function mecanismo_vertical(req,res){

	var ancholama = req.params.alama;
	var ancho     = req.params.ancho;
    var cantidad  = req.params.cantidad;
    var a1 = 0;
    var a2 = '';
    
	var request = new sql.Request();
        request.input('ancholama',sql.Int,ancholama);
		request.input('ancho',sql.Decimal(12,2),ancho);
        request.input('cantidad',sql.Int,cantidad);
		request.output('pvp',sql.Decimal(12,2),a1);
        request.output('c1',sql.VarChar(25),a2);
        request.execute('sp_tarifa_mecanismo_vertical', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
				
					a1 = recordsets.output.pvp;
                    a2 = recordsets.output.c1;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }
           
            });

}


	

function paneljapones(req,res){


	var vias = req.params.vias;
	var cliente = req.params.cliente;
    var altura = req.params.altura;
    var cantidad = req.params.cantidad;
	var a1      = 0;
	var a2      = '';

	var request = new sql.Request();
        request.input('vias',sql.Int,vias);
        request.input('cliente',sql.Int,cliente);
        request.input('altura',sql.Decimal(12,2),altura);
        request.input('cantidad',sql.Int,cantidad);
		request.output('pvp',sql.Decimal(12,2),a1);
		request.output('c1',sql.VarChar(255),a2);
        request.execute('sp_panel_japones_valora', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
					a1 = recordsets.output.pvp;
                    a2 = recordsets.output.c1;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
}

function alturacadena(req,res){


	var cadena  = req.params.cadena;
	var cliente = req.params.cliente;
	var altura  = req.params.altura;
	var a1      = 0;
	var a2      = '';

	var request = new sql.Request();
        request.input('cadena',sql.Int,cadena);
        request.input('cliente',sql.Int,cliente);
		request.input('altura',sql.Decimal(12,2),altura);
		request.output('pvp',sql.Decimal(12,2),a1);
		request.output('c1',sql.VarChar(255),a2);
        request.execute('sp_alturacadena_valora', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
					a1 = recordsets.output.pvp;
					a2 = recordsets.output.c1;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });

}

function contrapeso(req,res){

	var contrapeso = req.params.contrapeso;
	var ancho      = req.params.ancho;
	var a1         = 0;
	var a2         = '';

	var request = new sql.Request();
        request.input('contrapeso',sql.Int,contrapeso);
		request.input('ancho',sql.Decimal(12,2),ancho);
		request.output('pvp',sql.Decimal(12,2),a1);
		request.output('c1',sql.VarChar(255),a2);
        request.execute('sp_contrapeso_tarifa_valora', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
					a1 = recordsets.output.pvp;
					a2 = recordsets.output.c1;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
	
}

function calculate(req,res){
	
	var cliente = req.params.cliente;
	var tubo    = req.params.tubo;
	var tejido  = req.params.tejido;
	var marca   = req.params.marca;
	var ancho   = req.params.ancho;
	var alto    = req.params.alto;
	var imp     = req.params.impresion;
	var producto  = req.params.producto;
    var ancholama = req.params.ancholama;
	var a1      = 0;
	var a2      = '';
	

	var value = "CLI="+cliente+",TUBO="+tubo+",TEJ="+tejido+",MARCA="+marca+",AN="+ancho+",AL="+alto+",IMP="+imp+",PRO="+producto+",AL="+ancholama;
	//console.log(value);

	var request = new sql.Request();
        request.input('clientes',sql.Int,cliente);
		request.input('tubos',sql.Int,tubo);
		request.input('tejidos',sql.Int,tejido);
		request.input('marcas',sql.Int,marca);
		request.input('Ancho',sql.Decimal(12,2),ancho);
		request.input('Alto',sql.Decimal(12,2),alto);
		request.input('impresion',sql.Int,imp);
		request.input('producto',sql.Int,producto);
        request.input('ancholama',sql.Int,ancholama);
		request.output('v1',sql.Decimal(12,2),a1);
		request.output('v2',sql.VarChar(255),a2);
        request.execute('sp_tarifas_calculate_prices', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
					a1 = recordsets.output.v1;
					a2 = recordsets.output.v2;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
	
}

function calculate2(req,res){
    
    var cliente = req.params.cliente;
    var tubo    = req.params.tubo;
    var tejido  = req.params.tejido;
    var marca   = req.params.marca;
    var ancho   = req.params.ancho;
    var alto    = req.params.alto;
    var imp     = req.params.impresion;
    var producto    = req.params.producto;
    var ancholama   = req.params.ancholama;
    var centro      = req.params.centro;
    var cantidad    = req.params.cantidad;
    var a1      = 0;
    var a2      = '';
    

    var value = "CLI="+cliente+",TUBO="+tubo+",TEJ="+tejido+",MARCA="+marca+",AN="+ancho+",AL="+alto+",IMP="+imp+",PRO="+producto+",AL="+ancholama+",CE="+centro+",Cant="+cantidad;
    //console.log(value);

    var request = new sql.Request();
        request.input('clientes',sql.Int,cliente);
        request.input('tubos',sql.Int,tubo);
        request.input('tejidos',sql.Int,tejido);
        request.input('marcas',sql.Int,marca);
        request.input('Ancho',sql.Decimal(12,2),ancho);
        request.input('Alto',sql.Decimal(12,2),alto);
        request.input('impresion',sql.Int,imp);
        request.input('producto',sql.Int,producto);
        request.input('ancholama',sql.Int,ancholama);
        request.input('centro',sql.Int,centro);
        request.input('cantidad',sql.Int,cantidad);
        request.output('v1',sql.Decimal(12,2),a1);
        request.output('v2',sql.VarChar(255),a2);
        request.execute('sp_tarifas_calculate_prices2', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    a1 = recordsets.output.v1;
                    a2 = recordsets.output.v2;
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
    
}

function calculate_auto(req,res)
{
    var cliente = req.params.cliente;
    var tubo    = req.params.tubo;
    var tejido  = req.params.tejido;
    var marca   = req.params.marca;
    var ancho   = req.params.ancho;
    var alto    = req.params.alto;
    var imp     = req.params.impresion;
    var producto    = req.params.producto;
    var ancholama   = req.params.ancholama;
    var centro      = req.params.centro;
    var cantidad    = req.params.cantidad;
    var subproducto = req.params.subproducto;
    var a1      = 0;
    var a2      = '';
    

if (cliente > 1)
{
    var value = "CLI="+cliente+",TUBO="+tubo+",TEJ="+tejido+",MARCA="+marca+",AN="+ancho+",AL="+alto+",IMP="+imp+",PRO="+producto+",AL="+ancholama+",CE="+centro+",Cant="+cantidad;
}


    var request = new sql.Request();
        request.input('clientes',sql.Int,cliente);
        request.input('tubos',sql.Int,tubo);
        request.input('tejidos',sql.Int,tejido);
        request.input('marcas',sql.Int,marca);
        request.input('Ancho',sql.Decimal(12,2),ancho);
        request.input('Alto',sql.Decimal(12,2),alto);
        request.input('impresion',sql.Int,imp);
        request.input('producto',sql.Int,producto);
        request.input('ancholama',sql.Int,ancholama);
        request.input('centro',sql.Int,centro);
        request.input('cantidad',sql.Int,cantidad);
        request.input('subproducto',sql.Int,subproducto);
        request.output('v1',sql.Decimal(12,2),a1);
        request.output('v2',sql.VarChar(255),a2);
        request.execute('sp_tarifas_calculate_prices_auto', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    a1 = recordsets.output.v1;
                    a2 = recordsets.output.v2;
                    
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });

}

function calculate3(req,res){
    
    var cliente = req.params.cliente;
    var tubo    = req.params.tubo;
    var tejido  = req.params.tejido;
    var marca   = req.params.marca;
    var ancho   = req.params.ancho;
    var alto    = req.params.alto;
    var imp     = req.params.impresion;
    var producto    = req.params.producto;
    var ancholama   = req.params.ancholama;
    var centro      = req.params.centro;
    var cantidad    = req.params.cantidad;
    var subproducto = req.params.subproducto;
    var a1      = 0;
    var a2      = '';
    

    var value = "HOLA CLI="+cliente+",TUBO="+tubo+",TEJ="+tejido+",MARCA="+marca+",AN="+ancho+",AL="+alto+",IMP="+imp+",PRO="+producto+",AL="+ancholama+",CE="+centro+",Cant="+cantidad;


    var request = new sql.Request();
        request.input('clientes',sql.Int,cliente);
        request.input('tubos',sql.Int,tubo);
        request.input('tejidos',sql.Int,tejido);
        request.input('marcas',sql.Int,marca);
        request.input('Ancho',sql.Decimal(12,2),ancho);
        request.input('Alto',sql.Decimal(12,2),alto);
        request.input('impresion',sql.Int,imp);
        request.input('producto',sql.Int,producto);
        request.input('ancholama',sql.Int,ancholama);
        request.input('centro',sql.Int,centro);
        request.input('cantidad',sql.Int,cantidad);
        request.input('subproducto',sql.Int,subproducto);
        request.output('v1',sql.Decimal(12,2),a1);
        request.output('v2',sql.VarChar(255),a2);
        request.execute('sp_tarifas_calculate_prices3', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    a1 = recordsets.output.v1;
                    a2 = recordsets.output.v2;
                    
                    res.status(200).send({message: 'OK',v1:a1,v2: a2});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
    
}

function links(req,res){

    var link = req.body.link;

    var referencia = link.referencia;
    var pixis = link.pixis;
    var provider = link.provider;
    var idsm = link.idsm;
    var a1 = '';

 

var request = new sql.Request();
        request.input('referencia',sql.VarChar(50),referencia);
        request.input('pixis',sql.VarChar(50),pixis);
        request.input('provider',sql.VarChar(50),provider);
        request.input('idsm',sql.VarChar(50),idsm);
        request.output('retValue',sql.VarChar(50),a1);
        request.execute('sp_pedidos_referencia_pixis', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    a1 = recordsets.output.retValue;
 
                    res.status(200).send({message: 'OK',v1: a1});
                }
            }
            else 
            {
                console.log(err);
                res.status(500).send({message: 'KO'});
            }

           
            });
}


function getTarif(req,res){

    var tarif = req.body.tarif;

    var cliente     =  tarif.cliente;
    var centro      =  tarif.centro;
    var producto    =  tarif.producto;
    var subproducto =  tarif.subproducto;
    var ancho       =  tarif.ancho;
    var alto        =  tarif.alto;
    var cantidad    =  tarif.cantidad;
    var tejido      =  tarif.tejido;
    var marca       =  tarif.marca;
    var tubo        =  tarif.tubo;
    var impresion   =  tarif.impresion;
    var ancholama   =  tarif.ancholama;
    var numlamas    =  tarif.numlamas;
    var vias        =  (tarif.vias == null) ? -1 : tarif.vias;
    var soporte     =  (tarif.soporte == null) ? 'TEC' : tarif.soporte;
    var tejcombi    =  (tarif.tejcombi == null) ? 0 : tarif.tejcombi;
    var a1          = 0;
    var a2          = '';
    var d2          =   0;
    var m2          =   0;
    var y2          =   0;
    var d3          =   0;
    var m3          =   0;
    var y3          =   0;
    var dt          =   0;

    if (marca == 'COM') marca = '-1';
    if (tubo == 'T18') tubo = '8';

 
 var value = "CLI="+cliente+",TUBO="+tubo+",TEJ="+tejido+",MARCA="+marca+",AN="+ancho+",AL="+alto+",IMP="+impresion+",PRO="+producto;
 value += ",AL="+ancholama+",Numlamas="+numlamas+",CE="+centro+",Cant="+cantidad+",vias="+vias+",soporte="+soporte+",tejcombi="+tejcombi;
  

    var request = new sql.Request();
        request.input('clientes',sql.Int,cliente);
        request.input('tubos',sql.Int,tubo);
        request.input('tejidos',sql.Int,tejido);
        request.input('marcas',sql.Int,marca);
        request.input('Ancho',sql.Decimal(12,2),ancho);
        request.input('Alto',sql.Decimal(12,2),alto);
        request.input('impresion',sql.Int,impresion);
        request.input('producto',sql.Int,producto);
        request.input('ancholama',sql.Int,ancholama);
        request.input('numlamas',sql.Int,numlamas);
        request.input('centro',sql.Int,centro);
        request.input('cantidad',sql.Int,cantidad);
        request.input('subproducto',sql.Int,subproducto);
        request.input('vias',sql.Int,vias);
        request.input('soporte',sql.VarChar(25),soporte);
        request.input('tejidoscombinados',sql.Int,tejcombi);
        request.output('v1',sql.Decimal(12,2),a1);
        request.output('v2',sql.VarChar(255),a2);
        request.output('d2',sql.Int,d2);
        request.output('m2',sql.Int,m2);
        request.output('y2',sql.Int,y2);
        request.output('d3',sql.Int,d3);
        request.output('m3',sql.Int,m3);
        request.output('y3',sql.Int,y3);
        request.output('dt',sql.Int,dt);
        request.execute('sp_tarifas_calculate_prices_link', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    res.status(500).send({message: 'KO'});
                }
                else
                {
                    a1 = recordsets.output.v1;
                    a2 = recordsets.output.v2;
                    d3 = recordsets.output.d3;
                    m3 = recordsets.output.m3;
                    y3 = recordsets.output.y3;
                    dt = recordsets.output.dt;
 
                    res.status(200).send({message: 'OK',v1: a1,v2: a2,de: d3,me: m3,ye: y3,dt: dt});
                }
            }
            else 
            {
                
                res.status(500).send({message: 'KO'});
            }

           
            });
}


module.exports = {
	calculate,
    calculate2,
    calculate3,
    calculate_auto,
	contrapeso,
	alturacadena,
	paneljapones,
	mecanismo_vertical,
	tarifa_accesorio,
    Vertical_ST_Tarifa,
    C1_Multiply,
    C1_Sum,
    C1_Sumatory,
    Test,
    getTarif,
    links
}