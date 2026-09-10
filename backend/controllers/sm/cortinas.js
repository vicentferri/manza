'use strict'

var sql = require('mssql');
var config = require('../../setup/config');



var idPedido = -1;

function Check(value,defValue)
{
	return (value == null) ? defValue : value;
}

function Add_Tipo_1(idrow,values){

    var id 				  = 0
	var instrucciones     =  Check(values.instrucciones,-1);
	var ancho    	      =  Check(values.ancho,-1);
	var alto              =  Check(values.alto,-1);
    var cantidad          =  Check(values.cantidad,-1);
    var acc_tipo_id       =  Check(values.acc_tipo_id,-1);
    var acc_tipo_text     =  Check(values.acc_tipo_text,-1);
    var acc_marca_id      =  Check(values.acc_marca_id,-1);
    var acc_marca_text    =  Check(values.acc_marca_text,-1);
    var acc_tubo_id       =  Check(values.acc_tubo_id,-1);
    var acc_tubo_text     =  Check(values.acc_tubo_text,-1);
    var acc_modelo_id     =  Check(values.acc_modelo_id,-1);
    var acc_modelo_text   =  Check(values.acc_modelo_text,-1);
    var acc_posicion_id   =  Check(values.acc_posicion_id,-1);
    var acc_posicion_text =  Check(values.acc_posicion_text,-1);
    var sop_tipo_id       =  Check(values.sop_tipo_id,-1);
    var sop_tipo_text     =  Check(values.sop_tipo_text,-1);
    var sop_color_id      =  Check(values.sop_color_id,-1);
    var sop_color_text    =  Check(values.sop_color_text,-1);
    var tej_tipo_id       =  Check(values.tej_tipo_id,-1);
    var tej_tipo_text     =  Check(values.tej_tipo_text,-1);
    var tej_color_id      =  Check(values.tej_color_id,-1);
    var tej_color_text    =  Check(values.tej_color_text,-1);
    var tej_salida_id     =  Check(values.tej_salida_id ,-1);
    var tej_salida_text   =  Check(values.tej_salida_text,-1);
    var con_tipo_id       =  Check(values.con_tipo_id,-1);
    var con_tipo_text     =  Check(values.con_tipo_text,-1);
    var tap_tipo_id       =  Check(values.tap_tipo_id,-1);
    var tap_tipo_text     =  Check(values.tap_tipo_text,-1);
    var tap_color_id      =  Check(values.tap_color_id,-1);
    var tap_color_text    =  Check(values.tap_color_text,-1);
    var cad_altura_id     =  Check(values.cad_altura_id,-1);
    var cad_altura_text   =  Check(values.cad_altura_text,-1);
    var cad_color_id      =  Check(values.cad_color_id,-1);
    var cad_color_text    =  Check(values.cad_color_text,-1);
    var cad_Altura        =  Check(values.cad_Altura,-1);
    var cad_Tipo          =  Check(values.cad_Tipo,-1);
    var con_color_id      =  Check(values.con_color_id,-1);
    var con_color_text    =  Check(values.con_color_id,-1);
    var impresion         =  Check(values.impresion,-1);
    var impresion_imagen  =  Check(values.impresion_imagen,-1);
    var mando_id          =  Check(values.mando_id,-1);
    var mando_text        =  Check(values.mando_text,-1);
        
    var request = new sql.Request();
     request.input('id',sql.Int,id);   
     request.input('idrow',sql.Int,idrow);
	 request.input('ancho',sql.Int,ancho);
	 request.input('alto',sql.Int,alto);
     request.input('cantidad',sql.Int,cantidad);
     request.input('acc_tipo_id',sql.Int,acc_tipo_id);
     request.input('acc_tipo_text',sql.VarChar(250),acc_tipo_text);
     request.input('acc_marca_id',sql.Int,acc_marca_id);
     request.input('acc_marca_text',sql.VarChar(250),acc_marca_text);
     request.input('acc_tubo_id',sql.Int,acc_tubo_id);
     request.input('acc_tubo_text',sql.VarChar(250),acc_tubo_text);
     request.input('acc_modelo_id',sql.Int,acc_modelo_id);
     request.input('acc_modelo_text',sql.VarChar(250),acc_modelo_text);
     request.input('acc_posicion_id',sql.Int,acc_posicion_id);
     request.input('acc_posicion_text',sql.VarChar(250),acc_posicion_text);
     request.input('sop_tipo_id',sql.Int,sop_tipo_id);
     request.input('sop_tipo_text',sql.VarChar(250),sop_tipo_text);
     request.input('sop_color_id',sql.Int,sop_color_id);
     request.input('sop_color_text',sql.VarChar(250),sop_color_text);
     request.input('tej_tipo_id',sql.Int,tej_tipo_id);
     request.input('tej_tipo_text',sql.VarChar(250),tej_tipo_text);
     request.input('tej_color_id',sql.Int,tej_color_id);
     request.input('tej_color_text',sql.VarChar(250),tej_color_text);
     request.input('tej_salida_id',sql.Int,tej_salida_id);
     request.input('tej_salida_text',sql.VarChar(250),tej_salida_text);
     request.input('con_tipo_id',sql.Int,con_tipo_id);
     request.input('con_tipo_text',sql.VarChar(250),con_tipo_text);
     request.input('tap_tipo_id',sql.Int,tap_tipo_id);
     request.input('tap_tipo_text',sql.VarChar(250),tap_tipo_text);
     request.input('tap_color_id',sql.Int,tap_color_id);
     request.input('tap_color_text',sql.VarChar(250),tap_color_text);
     request.input('cad_altura_id',sql.Int,cad_altura_id);
     request.input('cad_altura_text',sql.VarChar(250));
     request.input('cad_color_id',sql.Int,cad_color_id);
     request.input('cad_color_text',sql.VarChar(250),cad_color_text);
     request.input('cad_Altura',sql.VarChar(250));
     request.input('cad_Tipo',sql.VarChar(250),cad_Tipo);
     request.input('con_color_id',sql.Int,con_color_id);
     request.input('con_color_text',sql.VarChar(250),con_color_text);
     if (impresion == true) 
      request.input('impresion',sql.Int,1);
 	 else
 	  request.input('impresion',sql.Int,0);

     request.input('impresion_imagen',sql.VarChar(250),impresion_imagen);
     request.input('mando_id',sql.Int,mando_id);
     request.input('mando_text',sql.VarChar(250),mando_text);
	 request.input('instrucciones',sql.VarChar(250),instrucciones);
	 request.execute('sp_sol_pedidos_cola_tipo_1_add', 
		function(err, recordsets, returnValue) {
			console.dir(recordsets);

			if (err){
				console.log(err);
			}
       });
}

function Add_Tipo_2(idrow,values){


 	var id 				  = 0
    var isel1 = 0;
    var isel2 = 0;
    var PJ_Ancho_1         = -1;
    var PJ_Alto_1          = -1;
    var PJ_Cantidad_1      = -1;
    var pj_tejidos_id      = -1;
    var pj_tejidos_text    = '';
    var pj_tejidosC_id     = -1;
    var pj_tejidosC_text   = '';
    var PJ_Contrapeso_1    = -1;
    var impresion          = 0;
    var impresion_imagen   = '';
    var PJ_Ancho_2 		   = -1;
    var PJ_Cantidad_2      = -1;
    var PJ_NumeroVias_2    = -1;
    var PJ_PosicionMando_2 = -1;
    var PJ_TipoRecogida_2  = -1;
    var PJ_ColorRiel_2     = -1;
    var PJ_TipoSoporte_2   = -1;

	var sel1 = values.PJ_SEL_1;
    if (sel1)
    {
    	isel1 			  = 1;
    	PJ_Ancho_1        = values.PJ_Ancho_1;
        PJ_Alto_1         = values.PJ_Alto_1;
        PJ_Cantidad_1     = values.PJ_Cantidad_1;
        pj_tejidos_id     = values.pj_tejidos_id;
        pj_tejidos_text   = values.pj_tejidos_text;
        pj_tejidosC_id    = values.pj_tejidosC_id;
        pj_tejidosC_text  = values.pj_tejidosC_text;
        PJ_Contrapeso_1   = values.PJ_Contrapeso_1;
        if (values.impresion == true)
        impresion         = 1;
        else
        impresion         = 0;

        impresion_imagen  = values.impresion_imagen;
    }
                    
    var sel2 = values.PJ_SEL_2;
    if (sel2)
    {
    	isel2 			    = 1;
    	PJ_Ancho_2 	        = values.PJ_Ancho_2;
        PJ_Cantidad_2       = values.PJ_Cantidad_2;
        PJ_NumeroVias_2     = values.PJ_NumeroVias_2;
        PJ_PosicionMando_2  = values.PJ_PosicionMando_2;
        PJ_TipoRecogida_2   = values.PJ_TipoRecogida_2;
        PJ_ColorRiel_2      = values.PJ_ColorRiel_2;
        PJ_TipoSoporte_2    = values.PJ_TipoSoporte_2;
    }

        var instrucciones   = values.instrucciones;

        var request = new sql.Request();
        request.input('id',sql.Int,id);   
        request.input('idrow',sql.Int,idrow);
     	request.input('PJ_SEL_1',sql.Int,isel1);
     	request.input('PJ_Ancho_1',sql.Int,PJ_Ancho_1);
		request.input('PJ_Alto_1',sql.Int,PJ_Alto_1);
		request.input('PJ_Cantidad_1',sql.Int,PJ_Cantidad_1);
 		request.input('pj_tejidos_id',sql.Int,pj_tejidos_id);
		request.input('pj_tejidos_text',sql.VarChar(250),pj_tejidos_text);
		request.input('pj_tejidosC_id',sql.Int,pj_tejidosC_id);
		request.input('pj_tejidosC_text',sql.VarChar(250),pj_tejidosC_text);
		request.input('PJ_Contrapeso_1',PJ_Contrapeso_1);
		request.input('impresion',sql.Int,impresion);
		request.input('impresion_imagen',sql.VarChar(250),impresion_imagen);
		request.input('PJ_SEL_2',sql.Int,isel2);
		request.input('PJ_Ancho_2',sql.Int,PJ_Ancho_2);
		request.input('PJ_Cantidad_2',sql.Int,PJ_Cantidad_2);
		request.input('PJ_NumeroVias_2',sql.VarChar(250),PJ_NumeroVias_2);
		request.input('PJ_PosicionMando_2',sql.VarChar(250),PJ_PosicionMando_2);
		request.input('PJ_TipoRecogida_2',sql.VarChar(250).PJ_TipoRecogida_2);
		request.input('PJ_ColorRiel_2',sql.VarChar(250),PJ_ColorRiel_2);
		request.input('PJ_TipoSoporte_2',sql.VarChar(250),PJ_TipoSoporte_2);
		request.input('instrucciones',sql.VarChar(250),instrucciones);
		request.execute('sol_pedidos_cola_tipo_2_add', 
		function(err, recordsets, returnValue) {
			console.dir(recordsets);

			if (err){
				console.log(err);
			}
       });
}

function Add_Tipo_3(idrow,values){

	var instrucciones = values.instrucciones;
 	var id 				  = 0
    var isel1 = 0;
    var isel2 = 0;

	var PV_Ancho_1 = -1;
  	var PV_Alto_1 = -1;
  	var PV_Cantidad_1 = -1;
  	var PV_AnchoLama_1= -1;
  	var PV_PosicionMecanismo_1= -1;
  	var PV_ColorRiel_1 = -1;
  	var PV_Accionamiento_1 = -1;
  	var PV_TipoSoporte_1 = -1;
  	var PV_TipoRecogida_1 = -1;
  	var PV_Tejido_id = -1;
  	var PV_Tejido_text = -1;
  	var PV_Tejido_c1_id = -1;
  	var PV_Tejido_c1_text = -1;
  	var PV_Tejido_c2_id = -1;
  	var PV_Tejido_c2_text = -1;

	var PV_Ancho_2 = -1;
  	var PV_Cantidad_2 = -1;
  	var PV_AlturaMin_2 = -1;
  	var PV_AlturaMax_2 = -1;
  	var PV_AnchoLama_2 = -1;
  	var PV_PosicionMecanismo_2 = -1;
  	var PV_ColorRiel_2 = -1;
  	var PV_Accionamiento_2 = -1;
  	var PV_TipoSoporte_2 = -1;
  	var PV_TipoRecogida_2 = -1;
	

    var sel1 = values.PV_SEL_1;
    if (sel1)
    {
		isel1 = 1;
		PV_Ancho_1 = values.PV_Ancho_1;
  		PV_Alto_1 = values.PV_Alto_1;
  		PV_Cantidad_1 = values.PV_Cantidad_1;
  		PV_AnchoLama_1= values.PV_AnchoLama_1;
  		PV_PosicionMecanismo_1= values.PV_PosicionMecanismo_1;
  		PV_ColorRiel_1 = values.PV_ColorRiel_1;
  		PV_Accionamiento_1 = values.PV_Accionamiento_1;
  		PV_TipoSoporte_1 = values.PV_TipoSoporte_1;
  		PV_TipoRecogida_1 = values.PV_TipoRecogida_1;
  		PV_Tejido_id = values.PV_Tejido_id;
  		PV_Tejido_text = values.PV_Tejido_text;
  		PV_Tejido_c1_id = values.PV_Tejido_c1_id;
  		PV_Tejido_c1_text = values.PV_Tejido_c1_text;
  		PV_Tejido_c2_id = values.PV_Tejido_c2_id;
  		PV_Tejido_c2_text = values.PV_Tejido_c2_text;
    }

	var sel2 = values.PV_SEL_2;
    if (sel2)
    {
		isel2 = 1;
		PV_Ancho_2 = values.PV_Ancho_2;
  		PV_Cantidad_2 = values.PV_Cantidad_2;
  		PV_AlturaMin_2 = values.PV_AlturaMin_2;
  		PV_AlturaMax_2 = values.PV_AlturaMax_2;
  		PV_AnchoLama_2 = values.PV_AnchoLama_2;
  		PV_PosicionMecanismo_2 = values.PV_PosicionMecanismo_2;
  		PV_ColorRiel_2 = values.PV_ColorRiel_2;
  		PV_Accionamiento_2 = values.PV_Accionamiento_2;
  		PV_TipoSoporte_2 = values.PV_TipoSoporte_2;
  		PV_TipoRecogida_2 = values.PV_TipoRecogida_2;
    }

var request = new sql.Request();
  request.input('id',sql.Int,id);
  request.input('idrow',sql.Int,idrow);
  request.input('PV_SEL_1',sql.Int,isel1);
  request.input('PV_Ancho_1',sql.Int,PV_Ancho_1);
  request.input('PV_Alto_1',sql.Int,PV_Alto_1);
  request.input('PV_Cantidad_1',sql.Int,PV_Cantidad_1);
  request.input('PV_AnchoLama_1',sql.VarChar(250),PV_AnchoLama_1);
  request.input('PV_PosicionMecanismo_1',sql.VarChar(250),PV_PosicionMecanismo_1);
  request.input('PV_ColorRiel_1',sql.VarChar(250),PV_ColorRiel_1);
  request.input('PV_Accionamiento_1',sql.VarChar(250),PV_Accionamiento_1);
  request.input('PV_TipoSoporte_1',sql.VarChar(250),PV_TipoSoporte_1);
  request.input('PV_TipoRecogida_1',sql.VarChar(250),PV_TipoRecogida_1);
  request.input('PV_Tejido_id',sql.Int,PV_Tejido_id );
  request.input('PV_Tejido_text',sql.VarChar(250),PV_Tejido_text);
  request.input('PV_Tejido_c1_id',sql.Int,PV_Tejido_c1_id);
  request.input('PV_Tejido_c1_text',sql.VarChar(250),PV_Tejido_c1_text);
  request.input('PV_Tejido_c2_id',sql.VarChar(250),PV_Tejido_c2_id);
  request.input('PV_Tejido_c2_text',sql.VarChar(250),PV_Tejido_c2_text);
  request.input('PV_SEL_2',sql.Int,isel2);
  request.input('PV_Ancho_2',sql.Int,PV_Ancho_2);
  request.input('PV_Cantidad_2',sql.Int,PV_Cantidad_2);
  request.input('PV_AlturaMin_2',sql.Int,PV_AlturaMin_2);
  request.input('PV_AlturaMax_2',sql.Int,PV_AlturaMax_2);
  request.input('PV_AnchoLama_2',sql.VarChar(250),PV_AnchoLama_2);
  request.input('PV_PosicionMecanismo_2',sql.VarChar(250),PV_PosicionMecanismo_2);
  request.input('PV_ColorRiel_2',sql.VarChar(250),PV_ColorRiel_2 );
  request.input('PV_Accionamiento_2',sql.VarChar(250),PV_Accionamiento_2);
  request.input('PV_TipoSoporte_2',sql.VarChar(250),PV_TipoSoporte_2);
  request.input('PV_TipoRecogida_2',sql.VarChar(250),PV_TipoRecogida_2);
  request.input('instrucciones',sql.VarChar(250),instrucciones);
  request.execute('sol_pedidos_cola_tipo_3_add', 
		function(err, recordsets, returnValue) {
			console.dir(recordsets);

			if (err){
				console.log(err);
			}
       });
}

function Add_Tipo_4(idrow,values){

    var id 				  = 0
   
	var instrucciones = values.instrucciones;
  	var junquillo = values.junquillo;
  	var ancho = values.ancho;
  	var ancho2 = values.ancho2;
  	var alto = values.alto;
 	var cantidad = values.cantidad;
  	var acc_tipo_id = values.com_acc_tipo_id;
  	var acc_tipo_text = values.com_acc_tipo_text;
  	var acc_marca_id = values.com_acc_marca_id;
  	var acc_marca_text = values.com_acc_marca_text;
  	var acc_tubo_id = values.com_acc_tubo_id;
  	var acc_tubo_text = values.com_acc_tubo_text;
  	var acc_modelo_id = values.com_acc_modelo_id;
  	var acc_modelo_text = values.com_acc_modelo_text;
  	var acc_posicion_id = values.com_acc_posicion_id;
  	var acc_posicion_text = values.com_acc_posicion_text;
  	var sop_tipo_id = values.com_sop_tipo_id;
  	var sop_tipo_text = values.com_sop_tipo_text;
  	var sop_color_id = values.com_sop_color_id;
  	var sop_color_text = values.com_sop_color_text;
  	var tej_tipo_id = values.com_tej_tipo_id;
  	var tej_tipo_text = values.com_tej_tipo_text;
  	var tej_color_id = values.com_tej_color_id;
  	var tej_color_text = values.com_tej_color_text;
  	var tej_salida_id = values.com_tej_salida_id;
  	var tej_salida_text = values.com_tej_salida_text;
  	var con_tipo_id = values.com_con_tipo_id;
  	var con_tipo_text = values.com_con_tipo_text;
  	var tap_tipo_id = values.com_tap_tipo_id;
  	var tap_tipo_text = values.com_tap_tipo_text;
  	var tap_color_id = values.com_tap_color_id;
  	var tap_color_text = values.com_tap_color_text;
  	var cad_altura_id = values.com_cad_altura_id;
  	var cad_altura_text = values.com_cad_altura_text;
  	var cad_color_id = values.com_cad_color_id;
  	var cad_color_text = values.com_cad_color_text;
  	var cad_Altura = values.com_cad_Altura;
  	var cad_Tipo = values.com_cad_Tipo;
  	var con_color_id = values.com_con_color_id;
  	var con_color_text = values.com_con_color_text;


	var request = new sql.Request();
  	request.input('id',sql.Int,id);
  	request.input('idrow',sql.Int,idrow);
  	request.input('junquillo',sql.VarChar(50),junquillo);
  	request.input('ancho',sql.Int,ancho);
  	request.input('ancho2',sql.Int,ancho2);
  	request.input('alto',sql.Int,alto);
  	request.input('cantidad',sql.Int,cantidad);
  	request.input('acc_tipo_id',sql.VarChar(50),acc_tipo_id);
  	request.input('acc_tipo_text',sql.VarChar(250),acc_tipo_text);
  	request.input('acc_marca_id',sql.VarChar(50),acc_marca_id);
  	request.input('acc_marca_text',sql.VarChar(250),acc_marca_text);
  	request.input('acc_tubo_id',sql.VarChar(50),acc_tubo_id);
  	request.input('acc_tubo_text',sql.VarChar(250),acc_tubo_text);
  	request.input('acc_modelo_id',sql.VarChar(50),acc_modelo_id);
  	request.input('acc_modelo_text',sql.VarChar(250),acc_modelo_text);
  	request.input('acc_posicion_id',sql.VarChar(50),acc_posicion_id);
  	request.input('acc_posicion_text',sql.VarChar(250),acc_posicion_text);
  	request.input('sop_tipo_id',sql.VarChar(50),sop_tipo_id);
  	request.input('sop_tipo_text',sql.VarChar(250),sop_tipo_text);
  	request.input('sop_color_id',sql.VarChar(50),sop_color_id);
  	request.input('sop_color_text',sql.VarChar(250),sop_color_text);
  	request.input('tej_tipo_id',sql.VarChar(50),tej_tipo_id);
  	request.input('tej_tipo_text',sql.VarChar(250),tej_tipo_text);
  	request.input('tej_color_id',sql.VarChar(50),tej_color_id);
  	request.input('tej_color_text',sql.VarChar(250),tej_color_text);
  	request.input('tej_salida_id',sql.VarChar(50),tej_salida_id);
  	request.input('tej_salida_text',sql.VarChar(250),tej_salida_text);
  	request.input('con_tipo_id',sql.VarChar(50),con_tipo_id);
  	request.input('con_tipo_text',sql.VarChar(250),con_tipo_text);
  	request.input('tap_tipo_id',sql.VarChar(50),tap_tipo_id);
  	request.input('tap_tipo_text',sql.VarChar(250),tap_tipo_text);
  	request.input('tap_color_id',sql.VarChar(50),tap_color_id);
  	request.input('tap_color_text',sql.VarChar(250),tap_color_text);
  	request.input('cad_altura_id',sql.VarChar(50),cad_altura_id);
  	request.input('cad_altura_text',sql.VarChar(250),cad_altura_text);
  	request.input('cad_color_id',sql.VarChar(50), cad_color_id);
  	request.input('cad_color_text',sql.VarChar(250),cad_color_text);
  	request.input('cad_Altura',sql.VarChar(50),cad_Altura);
  	request.input('cad_Tipo',sql.VarChar(50),cad_Tipo);
  	request.input('con_color_id',sql.VarChar(50),con_color_id);
  	request.input('con_color_text',sql.VarChar(250),con_color_text);
  	request.input('instrucciones',sql.VarChar(250),instrucciones);
  	request.execute('sol_pedidos_cola_tipo_4_add', 
		function(err, recordsets, returnValue) {
			console.dir(recordsets);

			if (err){
				console.log(err);
			}
       });
}


function bestellungen(req,res){
	 
	 var query =  " SELECT  TOP (100) PERCENT dbo.SOL_PEDIDOS_COLA.idrow, dbo.SOL_PEDIDOS_COLA.cliente, dbo.SOL_PEDIDOS_COLA.fecha, dbo.SOL_PEDIDOS_COLA.referencia, dbo.SOL_PEDIDOS_COLA.estado, ";
         query += " dbo.SOL_PEDIDOS_COLA.refgeneral, DATEDIFF(dd, dbo.SOL_PEDIDOS_COLA.fecha, GETDATE()) AS dias, dbo.SOL_PEDIDOS_COLA_LINEAS.articulo, dbo.SOL_PEDIDOS_COLA_LINEAS.ancho, ";
         query += " dbo.SOL_PEDIDOS_COLA_LINEAS.alto, dbo.SOL_PEDIDOS_COLA_LINEAS.cantidad, dbo.SOL_PEDIDOS_COLA_LINEAS.tipo, ";
		 query += " case dbo.SOL_PEDIDOS_COLA_LINEAS.tipo when 1 then 'DEVA' when 2 then 'TORMES' when 3 then 'VERTICAL' when 4 then 'COMPAC' end as TipoArticulo, ";
		 query += " 'Leroy Merlín' as nomcliente ";
		 query += " FROM dbo.SOL_PEDIDOS_COLA LEFT OUTER JOIN ";
         query += " dbo.SOL_PEDIDOS_COLA_LINEAS ON dbo.SOL_PEDIDOS_COLA.idrow = dbo.SOL_PEDIDOS_COLA_LINEAS.idrow ";
		 query += " ORDER BY dbo.SOL_PEDIDOS_COLA.fecha DESC";
        var request = new sql.Request();
        request.query(query, function (err, recordset) {
			
			if (!recordset)
			res.json({message:'ko'});
			
            res.send(recordset.recordsets[0]);
        });
}

function hinzufugen(req,res){

   var jsonIN = req.body;

   var cliente = 1;
   var referencia = 'TEST';

   /* Create the input */

   var id = 0;
   var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.input('cliente',sql.Int,cliente);
    request.input('referencia',sql.VarChar(255),referencia);
    request.output('refPedido', sql.VarChar(250));
    request.execute('sp_pedidos_cola_add', 
    function(err, recordsets, returnValue) {

      if (err)
      {
        idPedido = -1;
        console.log(err);
      }

      if (recordsets.returnValue)
      {
          idPedido = recordsets.returnValue;
          referencia = recordsets.output.refPedido;
      	 if (idPedido > 0)
      	 {
      		 for (var i=0, len = jsonIN.length; i<len;i++)
           {
      	        var tipo = jsonIN[i].TipoCortina;      	        
                if (tipo == 1) Add_Tipo_1(idPedido,jsonIN[i]);
      	        if (tipo == 2) Add_Tipo_2(idPedido,jsonIN[i]);	
      	        if (tipo == 3) Add_Tipo_3(idPedido,jsonIN[i]);
      	        if (tipo == 4) Add_Tipo_4(idPedido,jsonIN[i]);
                res.json({message:'ok',referencia:referencia});
      		 }
      	}
        else
        {
          res.json({message:'ko'});
        }
    }
  });
}

module.exports = {
	hinzufugen,
    bestellungen
}

