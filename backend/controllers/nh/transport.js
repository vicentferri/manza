'use strict'

var sql = require('mssql');

function Send_TransportTicket(req,res){

      var albaran = req.body.albaran;

      var sqlquery =  "select numeroalbaran,nremitente,cnombre,cdireccion,cpoblacion,cpostal,cdpais,bultos,strbultos,";
          sqlquery += "kilos,strkilos,volumen,strvolumen,observacionesa,observacionesb,portes,tfno_cons,email_cons ";
          sqlquery += " from NH_ALBARAN_AZKAR where albaran=" + albaran;

          new sql.Request().query(sqlquery, (err2,result) => {

                if (err2 == null)
                {
                    var numeroalbaran = result.recordset.numeroalbaran;
                    var nremitente = result.recordset.nremitente;
                    var cnombre = result.recordset.cnombre;
                    var cdireccion = result.recordset.cdireccion;
                    var cpoblacion = result.recordset.cpoblacion;
                    var cpostal = result.recordset.cpostal;
                    var cdpais = result.recordset.cdpais;
                    var bultos = result.recordset.bultos;
                    var strbultos = result.recordset.strbultos
                    var kilos = result.recordset.kilos;
                    var strkilos = result.recordset.strkilos;
                    var volumen = result.recordset.volumen;
                    var strvolumen = result.recordset.strvolumen;
                    var observacionesa = result.recordset.observacionesa;
                    var observacionesb = result.recordset.observacionesb;
                    var portes = result.recordset.portes;
                    var tfno_cons = result.recordset.tfno_cons;
                    var email_cons = result.recordset.email_cons;

                    var text = "AZKAR FILE";
                    text += numeroalbaran + ";";
                    text += nremitente + ";";
                    text += cnombre + ";";
                    text += cdireccion + ";";
                    text += cpoblacion + ";";
                    text += cpostal + ";";
                    text += cdpais + ";";
                    text += bultos + ";";
                    text += strbultos + ";";
                    text += kilos + ";";
                    text += strkilos + ";";
                    text += volumen + ";";
                    text += strvolumen + ";";
                    text += observacionesa + ";";
                    text += observacionesb + ";";
                    text += portes  + ";";
                    text += tfno_cons + ";";
                    text += email_cons + ";";

                    var content_type = "application/octet-stream";
                    var content_disposition = "attachment; filename="+albaran+"txt";
                    res.setHeader('Content-type', content_type );
                    res.setHeader('Content-disposition', content_disposition);
                    res.send(text);

                } 
                else 
                {
                    console.log(err2);
                    res.status(500).send({ message : err2});
                }

            });

/*
	var text_ready = "This is a content of a txt file."
	res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=file.txt'});
	res.end( text_ready );
*/
/*
	var text="hello world";
	res.setHeader('Content-type', "application/octet-stream");
	res.setHeader('Content-disposition', 'attachment; filename=file.txt');
	res.send(text);
*/
      /*

var sqlquery = "select top 1  numeroalbaran,nremitente,cnombre,cdireccion,cpoblacion,cpostal,cdpais,bultos,";
	sqlquery += "strbultos,kilos,strkilos,volumen,strvolumen,observacionesa,observacionesb,portes,tfno_cons,email_cons";
    sqlquery += " from nh_albaran_azkar where albaran=" + albaran;

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
   */
}

function Neue_TransportTicket(req,res){

  	   var params = req.body;

  	   var albaran = params.albaran;
  	   var transporte = params.transporte;
  	   var numeroalbaran = params.numeroalbaran;
  	   var nremitente = params.nremitente;
  	   var cnombre = params.cnombre;
  	   var cdireccion = params.cdireccion;
  	   var cpoblacion = params.cpoblacion;
  	   var cpostal = params.cpostal;
  	   var cdpais = params.cdpais;
  	   var bultos = params.bultos;
  	   var kilos = params.kilos;
  	   var volumen = params.volumen;
  	   var observacionesa = params.observacionesa;
  	   var observacionesb = params.observacionesb;
  	   var portes = param.portes;
  	   var tfno_cons = params.tfno_cons;
  	   var email_cons = params.emnail_cons;
 
        var request = new sql.Request();
        request.input('albaran',sql.Int,albaran);
        request.input('transporte',sql.Int,transporte);
		    request.input('numeroalbaran',sql.Int,numeroalbaran);
 		    request.input('nremitente',sql.Int,nremitente);
 		    request.input('cnombre',sql.VarChar(32),cnombre);
 		    request.input('cdireccion',sql.VarChar(32),cdireccion);
 		    request.input('cpoblacion',sql.VarChar(27),cpoblacion);
 		    request.input('cpostal',sql.Int,cpostal);
     		request.input('cdpais',sql.Int,cdpais);
     		request.input('bultos',sql.Int,bultos);
     		request.input('kilos',sql.Int,kilos);
     		request.input('volumen',sql.Decimal(12,3),volumen);
     		request.input('observacionesa',sql.VarChar(38),observacionesa);
     		request.input('observacionesb',sql.VarChar(38),observacionesb);
     		request.input('portes',sql.Int,portes);
     		request.input('tfno_cons',sql.VarChar(15),tfno_cons);
     		request.input('email_cons',sql.VarChar(80),email_cons);
        request.execute('sp_NH_Albaran_Azkar', 
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
	Neue_TransportTicket,
	Send_TransportTicket
}