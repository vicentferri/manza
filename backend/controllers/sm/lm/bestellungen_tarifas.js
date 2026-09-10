'use strict'

var sql = require('mssql');
var fs = require('fs');
var path = require('path');
const  { v4 : uuidv4 } = require('uuid');
 
var idPedido = -1;

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
 
function Check(value,defValue)
{
    return (value == null) ? defValue : value;
}
 
function Add_Tipo_1(idrow,values,res){
 
    var id                = 0
   
    var instrucciones     =  Check(values.instrucciones,-1);
    var ancho             =  Check(values.ancho,-1);
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
    var codeCentro        =  Check(values.codeCentro,-1);
    var SubTipoCortina    =  Check(values.SubTipoCortina,1);
    var idral             =  Check(values.Tipo1_CajonRAL,1);
    var Estancia_ID    =  Check(values.estancia_id, -1);
    var Estancia    =  Check(values.estancia_obs, -1);
    var idcajon             =  Check(values.Tipo1_Cajon,-1);
    var idguia             =  Check(values.Tipo1_Guia,-1);

    if (values.precios != null)
    {
      var FechaEntrega           =  Check(values.precios.T1_Fecha_Entrega);
      var T1_Cantidad            =  Check(values.precios.T1_Cantidad);
      var T1_Tejido              =  Check(values.precios.T1_Tejido);
      var T1_Tejido_C1           =  Check(values.precios.T1_Tejido_C1);
      var T1_Inc_CadenaMetalica     =  Check(values.precios.T1_Inc_CadenaMetalica);
      var T1_Inc_CadenaMetalica_C1  =  Check(values.precios.T1_Inc_CadenaMetalica_C1);
      var T1_Inc_Contrapeso       =  Check(values.precios.T1_Inc_Contrapeso);
      var T1_Inc_Contrapeso_C1    =  Check(values.precios.T1_Inc_Contrapeso_C1);
      var T1_Inc_Mando        =  Check(values.precios.T1_Inc_Mando);
      var T1_Inc_Mando_C1       =  Check(values.precios.T1_Inc_Mando_C1);
      var T1_Inc_Impresion      =  Check(values.precios.T1_Inc_Impresion);
      var T1_Inc_Impresion_C1     =  Check(values.precios.T1_Inc_Impresion_C1);
      var T1_PVP            =  Check(values.precios.T1_PVP);
      var T1_PVP_C1         =  Check(values.precios.T1_PVP_C1);
      var T1_Fecha_Entrega      =  Check(values.precios.T1_Fecha_Entrega);
      var T1_Transporte       =  Check(values.precios.T1_Transporte);
    }



         
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
     request.input('cad_altura_text',sql.VarChar(250),cad_Altura);
     request.input('cad_color_id',sql.Int,cad_color_id);
     request.input('cad_color_text',sql.VarChar(250),cad_color_text);
     request.input('cad_Altura',sql.VarChar(250),cad_Altura);
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
     request.input('centro',sql.Int,codeCentro);
     request.input('SubTipoCortina',sql.Int,SubTipoCortina);
     request.input('idral',sql.Int,idral);
     request.input('strFechaEntrega',sql.VarChar(10),FechaEntrega);
     request.input('T1_Cantidad',sql.VarChar(25),T1_Cantidad);
     request.input('T1_Tejido',sql.VarChar(25),T1_Tejido);
   request.input('T1_Tejido_C1',sql.VarChar(25),T1_Tejido_C1);
   request.input('T1_Inc_CadenaMetalica',sql.VarChar(25),T1_Inc_CadenaMetalica);
   request.input('T1_Inc_CadenaMetalica_C1',sql.VarChar(25),T1_Inc_CadenaMetalica_C1);
   request.input('T1_Inc_Contrapeso',sql.VarChar(25),T1_Inc_Contrapeso);
   request.input('T1_Inc_Contrapeso_C1',sql.VarChar(25),T1_Inc_Contrapeso_C1);
   request.input('T1_Inc_Mando',sql.VarChar(25),T1_Inc_Mando);
   request.input('T1_Inc_Mando_C1',sql.VarChar(25),T1_Inc_Mando_C1);
   request.input('T1_Inc_Impresion',sql.VarChar(25),T1_Inc_Impresion);
   request.input('T1_Inc_Impresion_C1',sql.VarChar(25),T1_Inc_Impresion_C1);
   request.input('T1_PVP',sql.VarChar(25),T1_PVP);
   request.input('T1_PVP_C1',sql.VarChar(25),T1_PVP_C1);
   request.input('T1_Fecha_Entrega',sql.VarChar(25),T1_Fecha_Entrega);
   request.input('T1_Transporte',sql.VarChar(25),T1_Transporte);
   request.input('Estancia_ID',sql.Int,Estancia_ID);
   request.input('Estancia',sql.VarChar(250),Estancia);
   request.input('idcajon',sql.Int,idcajon);
   request.input('idguia',sql.Int,idguia);
     request.execute('sol_temp_pedidos_cola_tipo_1_add', 
        function(err, recordsets, returnValue) {
            
            if (err){
                console.log(err);
            } 
            else
            {
                /* AHORA LLAMO AL PROCEDIMIENTO */

                 var idLinea = 0;
                 var v1 = 0;
                 var v2 = '';
                 var request2 = new sql.Request();
                 request2.input('idrow',sql.Int,idrow);
                 request2.output('idLinea',sql.Int,idLinea);
                 request2.output('v1',sql.Decimal(12,2),v1);
                 request2.output('v2', sql.VarChar(255),v2);
                 request2.execute('temp_sp_fabricacion_calculate', 
                function(err2, recordsets2, returnValue2) {

                    if (recordsets2.returnValue)
                    {

                        idLinea = recordsets2.output.idLinea;
                        v1      = recordsets2.output.v1;
                        v2      = recordsets2.output.v2;
                        
                        res.json({message:'OK',idLinea:idLinea,v1:v1,v2:v2});
                    }
                    else 
                    {
                        res.json({message:'KO',referencia:-1});
                    }
                });
            }
       });
     
}

function calculate_pvp_cajon_guia(req,res){
    var v1 = 0;
    var v2 = 0;
    var request2 = new sql.Request();
    request2.input('idrow',sql.Int,req.params.idrow);
    request2.output('v1',sql.Decimal(12,2),v1);
    request2.output('v2', sql.Decimal(12,2),v2);
    request2.execute('sp_calculate_cajon_guia', 
     
     function(err2, recordsets2, returnValue2) {

     if (recordsets2.returnValue)
     {

        v1      = recordsets2.output.v1;
        v2      = recordsets2.output.v2;
                        
        res.json({message:'OK',v1:v1,v2:v2});
      }
      else 
      {
         res.json({message:'KO',referencia:-1});
      }
    } );     
}
 
function Add_Tipo_2(idrow,values,res){
 
 
    var id                = 0
  
    var PJ_TipoJapones     = -1;
    var PJ_Ancho_1         = -1;
    var PJ_Alto_1          = -1;
    var PJ_Cantidad_1      = -1;
    var PJ_Contrapeso_1    = -1;
    var pj_tejidos_id      = -1;
    var pj_tejidos_text    = '';
    var pj_tejidosC_id     = -1;
    var pj_tejidosC_text   = '';
    var PJ_Ancho_2         = -1;
    var PJ_NumeroVias_2    = -1;
    var PJ_PosicionMando_2 = -1;
    var PJ_TipoRecogida_2  = '';
    var PJ_ColorRiel_2     = -1;
    var PJ_TipoSoporte_2   = -1;
    var PJ_Impresion       = 0;
    var PJ_ID_Imagen       = '';
    var PJ_Estancia        = -1;
    var PJ_Estancia_Obs    = '';
    var PJ_NumeroPortatelas = 0;
    var PJ_NumeroLamas      = 0;
    var PJ_AnchoLama        = 0;
    var PJ_AltoLamaTerminada = 0;
 
 
        PJ_TipoJapones    = values.PJ_TipoJapones;
        PJ_Ancho_1        = values.PJ_Ancho_1;
        PJ_Alto_1         = values.PJ_Alto_1;
        PJ_Cantidad_1     = values.PJ_Cantidad_1;
        PJ_Contrapeso_1   = values.PJ_Contrapeso_1;
        pj_tejidos_id     = values.PJ_tejidos_id;
        pj_tejidos_text   = values.PJ_tejidos_text;
        pj_tejidosC_id    = values.PJ_tejidosC_id;
        pj_tejidosC_text  = values.PJ_tejidosC_text;
        PJ_Ancho_2        = values.PJ_Ancho_2;
        PJ_NumeroVias_2     = values.PJ_NumeroVias_2;
        PJ_PosicionMando_2  = values.PJ_PosicionMando_2;
        PJ_TipoRecogida_2   = values.PJ_TipoRecogida_2;

        PJ_ColorRiel_2      = values.PJ_ColorRiel_2;
        PJ_TipoSoporte_2    = values.PJ_TipoSoporte_2;
        PJ_Estancia         = values.PJ_Estancia,
        PJ_Estancia_Obs     = values.PJ_Estancia_Obs,
        PJ_NumeroPortatelas = values.PJ_NumeroPortatelas;
        PJ_NumeroLamas      = values.PJ_NumeroLamas;
        PJ_AnchoLama        = values.PJ_AnchoLama;
        PJ_AltoLamaTerminada = values.PJ_AltoLamaTerminada;
        if (values.impresion == true)
        PJ_Impresion         = 1;
        else
        PJ_Impresion         = 0;
 
        PJ_ID_Imagen  = values.impresion_imagen;

        var T2_TejidoColor_2    = values.Tipo2_TejidoColor_2;
        var T2_TejidoColor_3    = values.Tipo2_TejidoColor_3;
        var T2_TejidoColor_4    = values.Tipo2_TejidoColor_4;
        var T2_TejidoColor_5    = values.Tipo2_TejidoColor_5;
        var PJ_CombinarColores  = values.PJ_CombinarColores;

        var iCombinarColores = 0;
        if (PJ_CombinarColores == true) iCombinarColores = 1;


        var instrucciones   = values.instrucciones;

        var codeCentro        =  Check(values.codeCentro,-1);

        if (values.precios != null)
        {
        var FechaEntrega      =  Check(values.precios.T2_Fecha_Entrega);
        var T2_Cantidad     =  Check(values.precios.T2_Cantidad);
        var T2_Tejido     =  Check(values.precios.T2_Tejido);
        var T2_Tejido_C1    =  Check(values.precios.T2_Tejido_C1);
        var T2_NumeroVias   =  Check(values.precios.T2_NumeroVias);
        var T2_NumeroVias_C1  =  Check(values.precios.T2_NumeroVias_C1);
        var T2_NumSoportes    =  Check(values.precios.T2_NumSoportes);
        var T2_TipoSoporte    =  Check(values.precios.T2_TipoSoporte);
        var T2_TipoSoporte_C1 =  Check(values.precios.T2_TipoSoporte_C1);
        var T2_Inc_Impresion  =  Check(values.precios.T2_Inc_Impresion);
        var T2_Inc_Impresion_C1 =  Check(values.precios.T2_Inc_Impresion_C1);
        var T2_PVP        =  Check(values.precios.T2_PVP);
        var T2_PVP_C1     =  Check(values.precios.T2_PVP_C1);
        var T2_FechaEntrega   =  Check(values.precios.T2_FechaEntrega);
        var T2_Transporte   =  Check(values.precios.T2_Transporte);
        var T2_SoporteTotal   =  Check(values.precios.T2_SoporteTotal);
        }
       
 
        var request = new sql.Request();
        request.input('id',sql.Int,id);   
        request.input('idrow',sql.Int,idrow);
        //request.input('TipoJapones',sql.Int,PJ_TipoJapones);
        request.input('PJ_Ancho_1',sql.Int,PJ_Ancho_1);
        request.input('PJ_Alto_1',sql.Int,PJ_Alto_1);
        request.input('PJ_Cantidad_1',sql.Int,PJ_Cantidad_1);
        request.input('PJ_Contrapeso_1',PJ_Contrapeso_1);
        request.input('pj_tejidos_id',sql.Int,pj_tejidos_id);
        request.input('pj_tejidos_text',sql.VarChar(250),pj_tejidos_text);
        request.input('pj_tejidosC_id',sql.Int,pj_tejidosC_id);
        request.input('pj_tejidosC_text',sql.VarChar(250),pj_tejidosC_text);
        request.input('PJ_Ancho_2',sql.Int,PJ_Ancho_2);
        request.input('PJ_NumeroVias_2',sql.VarChar(250),PJ_NumeroVias_2);
        request.input('PJ_PosicionMando_2',sql.VarChar(250),PJ_PosicionMando_2);
        request.input('PJ_TipoRecogida_2',sql.VarChar(250),PJ_TipoRecogida_2);
        request.input('PJ_ColorRiel_2',sql.VarChar(250),PJ_ColorRiel_2);
        request.input('PJ_TipoSoporte_2',sql.VarChar(250),PJ_TipoSoporte_2);
        request.input('PJ_Estancia_ID',sql.Int,PJ_Estancia);
        request.input('PJ_Estancia',sql.VarChar(250),PJ_Estancia_Obs);
        request.input('PJ_NumeroPortatelas',sql.Int,PJ_NumeroPortatelas);
        request.input('PJ_NumeroLamas',sql.Int,PJ_NumeroLamas);
        request.input('PJ_AnchoLama',sql.Decimal(12,2),PJ_AnchoLama);
        request.input('PJ_AnchoLamaTerminada',sql.Decimal(12,2),PJ_AltoLamaTerminada);
        request.input('impresion',sql.Int,PJ_Impresion);
        request.input('impresion_imagen',sql.VarChar(250),PJ_ID_Imagen);
        request.input('instrucciones',sql.VarChar(250),instrucciones);
        //request.input('centro',sql.Int,codeCentro);
        //request.input('strFechaEntrega',sql.VarChar(10),FechaEntrega);
        //request.input('T2_Cantidad',sql.Int,T2_Cantidad);
        request.input('T2_Tejido_2',sql.VarChar(25),T2_Tejido);
        //request.input('T2_Tejido_C1',sql.VarChar(25),T2_Tejido_C1);
        //request.input('T2_NumeroVias',sql.VarChar(25),T2_NumeroVias);
        //request.input('T2_NumeroVias_C1',sql.VarChar(25),T2_NumeroVias_C1);
        //request.input('T2_NumSoportes',sql.VarChar(25),T2_NumSoportes);
        //request.input('T2_TipoSoporte',sql.VarChar(25),T2_TipoSoporte);
        //request.input('T2_TipoSoporte_C1',sql.VarChar(25),T2_TipoSoporte_C1);
        //request.input('T2_Inc_Impresion',sql.VarChar(25),T2_Inc_Impresion);
        //request.input('T2_Inc_Impresion_C1',sql.VarChar(25),T2_Inc_Impresion_C1);
        //request.input('T2_PVP',sql.VarChar(25),T2_PVP);
        //request.input('T2_PVP_C1',sql.VarChar(25),T2_PVP_C1);
        //request.input('T2_FechaEntrega',sql.VarChar(25),T2_FechaEntrega);
        //request.input('T2_Transporte',sql.VarChar(25),T2_Transporte);
        //request.input('T2_SoporteTotal',sql.VarChar(25),T2_SoporteTotal);

        request.input('T2_TejidoColor_2',sql.VarChar(10),T2_TejidoColor_2);
        request.input('T2_Tejido_3',sql.VarChar(25),T2_Tejido);
        request.input('T2_TejidoColor_3',sql.VarChar(10),T2_TejidoColor_3);
        request.input('T2_Tejido_4',sql.VarChar(25),T2_Tejido);
        request.input('T2_TejidoColor_4',sql.VarChar(10),T2_TejidoColor_4);
        request.input('T2_Tejido_5',sql.VarChar(25),T2_Tejido);
        request.input('T2_TejidoColor_5',sql.VarChar(10),T2_TejidoColor_5);
        //request.input('iCombinarColores',sql.Int,iCombinarColores);

        request.execute('sol_temp_pedidos_cola_tipo_2_add', 
        function(err, recordsets, returnValue) {
            
            if (err){
                console.log(err);
            }
            else
            {
                /* AHORA LLAMO AL PROCEDIMIENTO */

                 var idLinea = 0;
                 var v1 = 0;
                 var v2 = '';
                 var request2 = new sql.Request();
                 request2.input('idrow',sql.Int,idrow);
                 request2.output('idLinea',sql.Int,idLinea);
                 request2.output('v1',sql.Decimal(12,2),v1);
                 request2.output('v2', sql.VarChar(255),v2);
                 request2.execute('temp_sp_fabricacion_calculate', 
                function(err2, recordsets2, returnValue2) {

                    if (recordsets2.returnValue)
                    {

                        idLinea = recordsets2.output.idLinea;
                        v1      = recordsets2.output.v1;
                        v2      = recordsets2.output.v2;
                        res.json({message:'OK',idLinea:idLinea,v1:v1,v2:v2});
                    }
                    else 
                    {
                        res.json({message:'KO',referencia:-1});
                    }
                });
            }
                        
       });
 
}
 
function Add_Tipo_3(idrow,values,res){
 
    var instrucciones = values.instrucciones;
    var id                = 0
   
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

    var codeCentro        =  Check(values.codeCentro,-1);
    var TipoVertical      =  values.TipoVertical;

    var PV_Impresion_1       = 0;
    var PV_ID_Imagen_1      = '';
    var PV_Impresion_2       = 0;
    var PV_ID_Imagen_2      = '';

    var Estancia_ID            = -1;
    var Estancia               = "";
 
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
        Estancia_ID = values.PV_estancia_id_1;
        Estancia = values.PV_estancia_obs_1;
        PV_ID_Imagen_1 = '';
        PV_Impresion_1 = 0;
        if (values.impresion == true)
            PV_Impresion_1         = 1;
            else
            PV_Impresion_1         = 0;
     
            PV_ID_Imagen_1  = values.impresion_imagen;
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

        PV_Tejido_id = values.PV_Tejido_id;
        PV_Tejido_text = values.PV_Tejido_text;
        PV_Tejido_c1_id = values.PV_Tejido_c1_id;
        PV_Tejido_c1_text = values.PV_Tejido_c1_text;
        PV_Tejido_c2_id = values.PV_Tejido_c2_id;
        PV_Tejido_c2_text = values.PV_Tejido_c2_text;
        Estancia_ID = values.PV_estancia_id_2;
        Estancia = values.PV_estancia_obs_2;
        PV_Impresion_2 = 0;
        PV_ID_Imagen_2 = '';
        if (values.impresion == true)
            PV_Impresion_2         = 1;
            else
            PV_Impresion_2         = 0;
     
            PV_ID_Imagen_2  = values.impresion_imagen
    }
    
    if (values.precios != null)
    {
     var FechaEntrega      =  Check(values.precios.T3_Fecha_Entrega);
      var T3_Cantidad = Check(values.precios.T3_Cantidad);  
   var T3_Tejido = Check(values.precios.T3_Tejido); 
   var T3_Tejido_C1 = Check(values.precios.T3_Tejido_C1); 
   var T3_TejidosCombinados = Check(values.precios.T3_TejidosCombinados); 
   var T3_TejidosCombinados_C1 = Check(values.precios.T3_TejidosCombinados_C1); 
   var T3_TipoSoporte = Check(values.precios.T3_TipoSoporte);
   var T3_NumSoportes = Check(values.precios.T3_NumSoportes); 
   var T3_TipoSoporte_C1 = Check(values.precios.T3_TipoSoporte_C1); 
   var T3_PVP = Check(values.precios.T3_PVP); 
   var T3_PVP_C1 = Check(values.precios.T3_PVP_C1); 
   var T3_Fecha_Entrega = Check(values.precios.T3_Fecha_Entrega); 
   var T3_Transporte = Check(values.precios.T3_Transporte); 
   var T32_Cantidad = Check(values.precios.T32_Cantidad); 
   var T32_Tejido = Check(values.precios.T32_Tejido); 
   var T32_Tejido_C1 = Check(values.precios.T32_Tejido_C1); 
   var T32_TejidosCombinados = Check(values.precios.T32_TejidosCombinados); 
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
  request.input('centro',sql.Int,codeCentro);
  request.input('strFechaEntrega',sql.VarChar(10),FechaEntrega);
  request.input('T3_Cantidad',sql.Int,T3_Cantidad);  
  request.input('T3_Tejido',sql.VarChar(25),T3_Tejido); 
  request.input('T3_Tejido_C1',sql.VarChar(25),T3_Tejido_C1); 
  request.input('T3_TejidosCombinados',sql.VarChar(25),T3_TejidosCombinados); 
  request.input('T3_TejidosCombinados_C1',sql.VarChar(25),T3_TejidosCombinados_C1); 
  request.input('T3_TipoSoporte',sql.VarChar(25),T3_TipoSoporte);
  request.input('T3_NumSoportes',sql.VarChar(25),T3_NumSoportes); 
  request.input('T3_TipoSoporte_C1',sql.VarChar(25),T3_TipoSoporte_C1); 
  request.input('T3_PVP',sql.VarChar(25),T3_PVP); 
  request.input('T3_PVP_C1',sql.VarChar(25),T3_PVP_C1); 
  request.input('T3_Fecha_Entrega',sql.VarChar(25),T3_Fecha_Entrega); 
  request.input('T3_Transporte',sql.VarChar(25),T3_Transporte); 
  request.input('T32_Cantidad',sql.Int,T32_Cantidad); 
  request.input('T32_Tejido',sql.VarChar(25),T32_Tejido); 
  request.input('T32_Tejido_C1',sql.VarChar(25),T32_Tejido_C1); 
  request.input('T32_TejidosCombinados',sql.VarChar(25),T32_TejidosCombinados); 
  request.input('TipoVertical',sql.Int,TipoVertical);
  request.input('impresion_1',sql.Int,PV_Impresion_1);
  request.input('impresion_imagen_1',sql.VarChar(250),PV_ID_Imagen_1);
  request.input('impresion_2',sql.Int,PV_Impresion_2);
  request.input('impresion_imagen_2',sql.VarChar(250),PV_ID_Imagen_2);
  request.input('Estancia_ID',sql.Int,Estancia_ID);
   request.input('Estancia',sql.VarChar(250),Estancia);
  request.execute('sol_temp_pedidos_cola_tipo_3_add', 
        function(err, recordsets, returnValue) {
            
            if (err){
                console.log(err);
            }
            else
            {
                /* AHORA LLAMO AL PROCEDIMIENTO */

                 var idLinea = 0;
                 var v1 = 0;
                 var v2 = '';
                 var request2 = new sql.Request();
                 request2.input('idrow',sql.Int,idrow);
                 request2.output('idLinea',sql.Int,idLinea);
                 request2.output('v1',sql.Decimal(12,2),v1);
                 request2.output('v2', sql.VarChar(255),v2);
                 request2.execute('temp_sp_fabricacion_calculate', 
                function(err2, recordsets2, returnValue2) {

                    if (recordsets2.returnValue)
                    {

                        idLinea = recordsets2.output.idLinea;
                        v1      = recordsets2.output.v1;
                        v2      = recordsets2.output.v2;
                        res.json({message:'OK',idLinea:idLinea,v1:v1,v2:v2});
                    }
                    else 
                    {
                        res.json({message:'KO',referencia:-1});
                    }
                });
            }
       });
     
}
 
function Add_Tipo_4(idrow,values,res){
 
    var id                = 0
    
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
    var codeCentro        =  Check(values.codeCentro,-1);
    var FechaEntrega      =  Check(values.precios.T4_Fecha_Entrega);
    var perfileria        =  values.perfileria;
    var ral        =  values.ral;
    var Estancia_ID = values.com_estancia_id;
    var Estancia    = values.com_estancia_obs;
    var Impresion       = 0;
    var ID_Imagen      = values.impresion_imagen;

    if (values.impresion == true)
        Impresion         = 1;
        else
        Impresion         = 0;


    if (values.precios != null)
    {
     var T4_Cantidad = Check(values.precios.T4_Cantidad);
  var T4_Tejido = Check(values.precios.T4_Tejido);
  var T4_Tejido_C1 = Check(values.precios.T4_Tejido_C1);
  var T4_Coeficiente = Check(values.precios.T4_Coeficiente);
  var T4_PVP = Check(values.precios.T4_PVP);
  var T4_PVP_C1 = Check(values.precios.T4_PVP_C1);
  var T4_Fecha_Entrega = Check(values.precios.T4_Fecha_Entrega);
  var T4_Transporte = Check(values.precios.T4_Transporte);
    }
 
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
    request.input('centro',sql.Int,codeCentro);
    request.input('strFechaEntrega',sql.VarChar(10),FechaEntrega);
     request.input('T4_Cantidad',sql.Int,T4_Cantidad);
  request.input('T4_Tejido',sql.VarChar(25),T4_Tejido);
  request.input('T4_Tejido_C1',sql.VarChar(25),T4_Tejido_C1);
  request.input('T4_Coeficiente',sql.VarChar(25),T4_Coeficiente);
  request.input('T4_PVP',sql.VarChar(25),T4_PVP);
  request.input('T4_PVP_C1',sql.VarChar(25),T4_PVP_C1);
  request.input('T4_Fecha_Entrega',sql.VarChar(25),T4_Fecha_Entrega);
  request.input('T4_Transporte',sql.VarChar(25),T4_Transporte);
  request.input('perfileria',sql.VarChar(10),perfileria);
  request.input('ral',sql.Int,ral);
  request.input('impresion',sql.Int,Impresion);
  request.input('impresion_imagen',sql.VarChar(250),ID_Imagen);
  request.input('Estancia_ID',sql.Int,Estancia_ID);
  request.input('Estancia',sql.VarChar(250),Estancia);
    request.execute('sol_temp_pedidos_cola_tipo_4_add', 
        function(err, recordsets, returnValue) {
            
            if (err){
                console.log(err);
            } 
            else
            {
                /* AHORA LLAMO AL PROCEDIMIENTO */

                 var idLinea = 0;
                 var v1 = 0;
                 var v2 = '';
                 var request2 = new sql.Request();
                 request2.input('idrow',sql.Int,idrow);
                 request2.output('idLinea',sql.Int,idLinea);
                 request2.output('v1',sql.Decimal(12,2),v1);
                 request2.output('v2', sql.VarChar(255),v2);
                 request2.execute('temp_sp_fabricacion_calculate', 
                function(err2, recordsets2, returnValue2) {

                    if (recordsets2.returnValue)
                    {

                        idLinea = recordsets2.output.idLinea;
                        v1      = recordsets2.output.v1;
                        v2      = recordsets2.output.v2;
                        res.json({message:'OK',idLinea:idLinea,v1:v1,v2:v2});
                    }
                    else 
                    {
                        res.json({message:'KO',referencia:-1});
                    }
                });
            }
       });
     
}
 

 

 


function process(data,res)
{
    var jsonIN     = data.lineas;
    var cliente    = data.cliente;
    var referencia = data.referencia;

    var id = 0;
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.input('cliente',sql.Int,cliente);
    request.input('referencia',sql.VarChar(255),referencia);
    request.output('refPedido', sql.VarChar(250));
    request.execute('sol_temp_pedidos_cola_add', 
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
                if (tipo == 1) Add_Tipo_1(idPedido,jsonIN[i],res);
                if (tipo == 2) Add_Tipo_2(idPedido,jsonIN[i],res);  
                if (tipo == 3) Add_Tipo_3(idPedido,jsonIN[i],res);
                if (tipo == 4) Add_Tipo_4(idPedido,jsonIN[i],res);
             }
        }
        else
        {
          res.json({message:'ko'});
        }
    }
 
  });
 
}
         


 function reprocessFile(name,res)
 {
       var path_file = 'uploads/prices/'+name;
       fs.exists(path_file,function(exists)
       {
          if (exists)
          {
              let rawdata = fs.readFileSync(path_file);  
              let jsonIN = JSON.parse(rawdata);  
              process(jsonIN,res);
          }
  
       });
 }

 function getvalues(req,res)
 {
    let tipo = req.params.tipo;


    let sqlquery = "";

    if (tipo === '1'){
    sqlquery="select articulo,descripcion,cantidad,descunidad,cod_sol,precio,precio2,desde,hasta,mmeca from temp_sol_pedidos_cola_tipo_1_fabricacion ";
    sqlquery += "where precio>0 and idrow="+req.params.idrow+" order by articulo";
    }

    if (tipo === '2'){
    sqlquery="select articulo,descripcion,cantidad,descunidad,cod_sol,precio,precio2,desde,hasta,mmeca from temp_sol_pedidos_cola_tipo_2_fabricacion ";
    sqlquery += "where precio>0 and idrow="+req.params.idrow+" order by articulo";
    }

    if (tipo === '3'){
    sqlquery="select articulo,descripcion,cantidad,descunidad,cod_sol,precio,precio2,desde,hasta,mmeca from temp_sol_pedidos_cola_tipo_3_fabricacion ";
    sqlquery += "where precio>0 and idrow="+req.params.idrow+" order by articulo";
    }

    if (tipo === '4'){
    sqlquery="select articulo,descripcion,cantidad,descunidad,cod_sol,precio,precio2,desde,hasta,mmeca from temp_sol_pedidos_cola_tipo_4_fabricacion ";
    sqlquery += "where precio>=0 and idrow="+req.params.idrow+" order by articulo";
    }

    ExecuteSQL(sqlquery,res);

 }

function calculate_prices(req,res)
{

    process(req.body,res);
   
    /*res.status(200).send({message: 'OK',v1: 100,v2: 200})
    /*
    const lineas = req.body.lineas;
    const referencia = req.body.referencia;
    const cliente    = req.body.cliente;
    const fileName = uuidv4() + ".json";


    var json = JSON.stringify(req.body);
    var jfile = 'uploads/prices/'+fileName;
    fs.writeFile(jfile, json, 'utf8', function(err)
    {
        if (err)
        {
            res.status(500).send({message: 'KO'});
        }
        else 
        {
            console.log(fileName);
            process(req.body,res);
        }
    });
   */
}


 
module.exports = {
    calculate_prices,
    getvalues,
    calculate_pvp_cajon_guia
}