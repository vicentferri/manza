'use strict'

var sql = require('mssql');

function ExecuteSQL(query,res)
{
    new sql.Request().query(query, (err2,result) => {

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

  function Apply(value){
  	if (value != null){
  		return true;
  	} else {
  		return false;
  	}
  }
  function GetValue(value){
  	if (value != null){
  		return value;
  	} 
  }

  function Neue_Bestellung_Line(id,idrow,articulo,descripcion,referencia,cantidad,unidad,observaciones,
  	                            precio,dto,dto2,tiva,iva){

		var request = new sql.Request();
        request.input('id',sql.Int,id);
        request.input('idrow',sql.Int,idrow);
        request.input('articulo',sql.Int,articulo);
        request.input('descripcion',sql.VarChar(50),descripcion);
		request.input('referencia',sql.VarChar(50),referencia);
        request.input('cantidad',sql.Int,cantidad);
        request.input('unidad',sql.Int,unidad);
 		request.input('observaciones',sql.VarChar(255),observaciones);
 		request.input('precio',sql.Decimal(12,3),precio);
		request.input('dto',sql.Decimal(12,2),dto);
		request.input('dto2',sql.Decimal(12,2),dto2);
        request.input('tiva',sql.Int,tiva);
		request.input('iva',sql.Decimal(12,2),iva);
        request.execute('NH_Bestellung_Line_Hinzufugen', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else 
            {
                console.log(err);
                return true;
            }
            });

  }


  function Neue_Bestellung(req,res){

        

        var params = req.body;

        var ids = [];
 		var values = [];

 		//console.log(params);

 		var lin0 = params[0];
 		var lin1 = params[1];

        var id = "-1";
 		var cif = "";
 		var nomfiscal = "";
		var dirfiscal= "";
		var cpfiscal= "";
		var pobfiscal= "";
		var provfiscal= "";
		var telefono1= "";
		var email= "";
		var paisfiscal= "1";
		var observaciones= "";
		var nombrentrega= "";
		var domentrega= "";
		var cpentrega= "";
		var pobentrega= "";
		var proventrega= "";
		var paisentrega= "1";

		var article = "1";
		var descripcion = "";
		var referencia = "";
		var cantidad = "1";
		var unidad = "1";
		var observaciones = ""
		var precio = "0";
		var dto = "0";
		var tiva = "1";
		var iva = "0";
		
		//console.log(lin0.header.length);
 		
 		for (var i=0;i<lin0.header.length; i++)
 		{
 			if (Apply(lin0.header[i].cif)) 		 		cif = lin0.header[i].cif;
 			if (Apply(lin0.header[i].nomfiscal)) 		nomfiscal = lin0.header[i].nomfiscal;
			if (Apply(lin0.header[i].nomfiscal)) 		dirfiscal = lin0.header[i].dirfiscal;
			if (Apply(lin0.header[i].cpfiscal))  		cpfiscal = lin0.header[i].cpfiscal;			
			if (Apply(lin0.header[i].pobfiscal))  		pobfiscal = lin0.header[i].pobfiscal;
			if (Apply(lin0.header[i].provfiscal)) 		provfiscal= lin0.header[i].provfiscal;
			if (Apply(lin0.header[i].telefono1))  		telefono1= lin0.header[i].telefono1;
			if (Apply(lin0.header[i].email))      		email= lin0.header[i].email;
			if (Apply(lin0.header[i].paisfiscal)) 		paisfiscal= lin0.header[i].paisfiscal;
			if (Apply(lin0.header[i].observaciones)) 	observaciones= lin0.header[i].observaciones;
			if (Apply(lin0.header[i].nombrentrega)) 	nombrentrega= lin0.header[i].nombrentrega;
			if (Apply(lin0.header[i].domentrega)) 		domentrega= lin0.header[i].domentrega;
			if (Apply(lin0.header[i].cpentrega)) 		cpentrega= lin0.header[i].cpentrega;
			if (Apply(lin0.header[i].pobentrega)) 		pobentrega= lin0.header[i].pobentrega;
			if (Apply(lin0.header[i].proventrega)) 		proventrega= lin0.header[i].proventrega;
			if (Apply(lin0.header[i].paisentrega)) 		paisentrega= lin0.header[i].paisentrega;

			//console.log(lin0.header[i]);
 		}
 		
 		var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.input('cif',sql.VarChar(50),cif);
		request.input('nomfiscal',sql.VarChar(255),nomfiscal);
 		request.input('dirfiscal',sql.VarChar(255),dirfiscal);
 		request.input('cpfiscal',sql.VarChar(50),cpfiscal);
 		request.input('pobfiscal',sql.VarChar(255),pobfiscal);
 		request.input('provfiscal',sql.VarChar(255),provfiscal);
 		request.input('telefono1',sql.VarChar(50),telefono1);
 		request.input('email',sql.VarChar(255),email);
 		request.input('pais',sql.Int,paisfiscal);
 		request.input('observaciones',sql.VarChar(255),observaciones);
 		request.input('nombrentrega',sql.VarChar(255),nombrentrega);
 		request.input('domentrega',sql.VarChar(255),domentrega);
 		request.input('cpentrega',sql.VarChar(50),cpentrega);
 		request.input('pobentrega',sql.VarChar(255),pobentrega);
 		request.input('proventrega',sql.VarChar(255),proventrega);
 		request.input('paisentrega',sql.Int,paisentrega);
        request.execute('NH_Bestellung_Header_Hinzufugen', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {       
                if (recordsets.returnValue == null)
                {

                    res.status(500).send({message: 'KO'});
                }
                else
                {
                	var idPedido = recordsets.returnValue;
                	if (idPedido > 0){

                		for (var i=0;i<lin1.lines.length; i++){

							if (Apply(lin1.lines[i].article)) 	article = lin1.lines[i].article;
							if (Apply(lin1.lines[i].desc)) 		descripcion = lin1.lines[i].desc;
							if (Apply(lin1.lines[i].ref)) 		referencia = lin1.lines[i].ref;
							if (Apply(lin1.lines[i].cant)) 		cantidad = lin1.lines[i].cant;
							if (Apply(lin1.lines[i].ud)) 		unidad = lin1.lines[i].ud;
							if (Apply(lin1.lines[i].obs)) 		observaciones = lin1.lines[i].obs;
							if (Apply(lin1.lines[i].pre)) 		precio = lin1.lines[i].pre;
							if (Apply(lin1.lines[i].dto)) 		dto = lin1.lines[i].dto;
							if (Apply(lin1.lines[i].tiva)) 		tiva = lin1.lines[i].tiva;
							if (Apply(lin1.lines[i].iva)) 		cantidad = lin1.lines[i].iva;

							Neue_Bestellung_Line(-1,idPedido,article,descripcion,referencia,cantidad,unidad,
								observaciones,precio,dto,0,tiva,iva)
                			
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

  function bestellungen_zustanden_post(req,res)
  {
        var request = new sql.Request();
        request.input('cliente',sql.Int,req.body.cliente);
        request.input('estado',sql.Int,req.body.estado);
        request.input('ids',sql.VarChar(8000),req.body.ids);
        request.execute('sp_update_bestellungen_zustand', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {    
               res.status(200).send({message: 'OK',retValue:returnValue});
            }
            else 
            {
              res.status(500).send({message: 'KO'});
            }

          });
  }

  function bestellungen_zustanden(req,res)
  {
     var query = "select idrow as p1,descripcion as p2 from nh_pedidos_estados";
     ExecuteSQL(query,res);
  }

  

function bestellungen(req,res)
 {
 
    var query = "select idrow,cliente,fecha,referencia,estado,referencia,refcliente,refgeneral,dias,articulo,ancho,alto,cantidad,tipo,TipoArticulo,nomcliente from vw_cola_pedidos";
    query += " ORDER BY fecha DESC";
    ExecuteSQL(query,res);
}

function bestellungen2(req,res)
 {

    var idrow = req.params.idrow;
 
    if (idrow != null)
    {
      var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,refcliente,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
          query += " from vw_nh_bestellungen_cue where idrow="+idrow;
    }
    else 
    {
      var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,refcliente,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
          query += " from vw_nh_bestellungen_cue order by fecha desc,codigo ";
    }
         ExecuteSQL(query,res);         
}

function bestellungen_zustand(req,res)
 {

    var zustand = req.params.zustand;

    if (zustand != null)
    {
 
        if (zustand  == '-1')
        {
          var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,refcliente,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
              query += " from vw_nh_bestellungen_cue  order by fecha desc,codigo";
        }
        else 
        {
          var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,refcliente,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
              query += " from vw_nh_bestellungen_cue where estado="+zustand+" order by fecha desc,codigo ";
        }
   }
         ExecuteSQL(query,res);         
}

function bestellung_get(req,res)
{
  let customer = req.params.cli;
  let id = req.params.id;
  
  if (customer == 2)
  {
    var query =  " select '' as refcliente,idrow,filename,id,date,name,lastname,business,nif,address,city,province,postcode,country,phone,estado,descestado,dias ";
     query += " ,detalles,prod_ok,prod_reason,referencia,fabricacion from vw_cd_bestellungen_cue where idrow=" + id;
 }
 else
 {
    var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,refcliente,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
     query += " ,detalles,prod_ok,prod_reason,fabricacion from vw_nh_bestellungen_cue where idrow="+id;
 } 
 ExecuteSQL(query,res);   
}

function bestellung_lines_get(req,res)
{
  let customer = req.params.cli;
  let id = req.params.id;
  
  if (customer == 2)
  {
    var query =  "select lin.id,lin._producto as articulo,lin.cost,lin.amount as cantidad,lin.ancho,lin.alto,(lin.name+' '+lin.color) as referencia,";
    query += " lin._referencia_impresion,lin.observaciones,";
    query += " head.date as fecha, 'cortinadecor' as cliente, 'cw' as entrega from SOL_CORTINADECOR_LINES lin ";
    query += " inner join SOL_CORTINADECOR_HEADER head on head.idrow = lin.idrow ";
    query += " where lin.idrow=" + id;
  }
  else
  {
    var query =  "select lin.id,lin.articulo,isnull(lin.total,0) as cost,lin.cantidad,lin.ancho,lin.alto,lin.referencia,lin._referencia_impresion,lin.observaciones,";
    query += " head.fecha as fecha,cli.NomFiscal as cliente,dom.NOMBRE as entrega ";
    query += " from SOL_PEDIDOS_COLA_LINEAS lin  ";
    query += " inner join SOL_PEDIDOS_COLA head on head.IDROW = lin.IDROW ";
    query += " inner join NH_CLIENTES cli on cli.IdCliente = head.CLIENTE ";
    query += " inner join NH_CLIENTES_DOMICILIOS dom on dom.IDROW = head.CLIENTE_ENTREGA ";
    query += " where lin.idrow="+id;
  } 
  ExecuteSQL(query,res);   
}

function bestellungen_zustand_customer(req,res)
 {

    var zustand  = req.params.zustand;
    var customer = req.params.customer;
    var desde    = req.query.desde;
    var hasta    = req.query.hasta;

    if (zustand != null && customer != null)
    {
 
        if (zustand  == '-1')
        {
         
           if (customer == 2)
           {
          var query =  " select '' as refcliente,idrow,filename,id,date,name,lastname,business,nif,address,city,province,postcode,country,phone,estado,descestado,dias ";
              query += " ,detalles,prod_ok,prod_reason,referencia,fabricacion,IMD from vw_cd_bestellungen_cue  ";
              
              if (desde != null && hasta != null)
              {
                  query += " where (cast(date as datetime) >='"+desde+"' and cast(date as datetime) <='"+hasta+"')";
              }
              query += " order by idrow desc";
          }
          else
          {
          var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,refcliente,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
              query += " ,detalles,prod_ok,prod_reason,fabricacion,cliente,ID from vw_nh_bestellungen_cue where cliente_busqueda="+customer;

              if (desde != null && hasta != null)
              {
                  query += " and (fecha>='"+desde+"' and fecha<=dateadd(dd,1,'"+hasta+"'))";
              }
              query += " order by fecha desc,codigo";
          } 

        }
        else 
        {

          if (customer == 2)
          {
          var query =  " select '' as refcliente,idrow,filename,id,date,name,lastname,business,nif,address,city,province,postcode,country,phone,estado,descestado,dias ";
              query += " ,detalles,prod_ok,prod_reason,referencia,fabricacion,IMD from vw_cd_bestellungen_cue where estado="+zustand;
               if (desde != null && hasta != null)
              {
                  query += " and (cast(date as datetime) >='"+desde+"' and cast(date as datetime) <='"+hasta+"')";
              }
              query += " order by idrow desc ";
          } 
          else 
          {
          var query =  " select idrow,dias,fecha,codigo,nomfiscal,observaciones,refcliente,referencia,dirfiscal,pobfiscal,provfiscal,cpfiscal,nombre,domicilio,cp,poblacion,provincia,estado,descestado";
              query += " ,detalles,prod_ok,prod_reason,fabricacion,cliente,ID from vw_nh_bestellungen_cue where cliente_busqueda="+customer+" and estado="+zustand;

              if (desde != null && hasta != null)
              {
                  query += " and (fecha>='"+desde+"' and fecha<=dateadd(dd,1,'"+hasta+"'))";
              }

              query += " order by fecha desc,codigo ";


          }

        }


            var request = new sql.Request();
            request.input('cliente',sql.Int,customer);
            request.execute('sp_bestellungen_scope', 
            function(err, recordsets, returnValue) {
              
              if (err == null)
              {    
                  ExecuteSQL(query,res);
              }
              else 
              {
                res.status(500).send({message: 'KO'});
              }
            });
    }
}


function bestellungen2_lin(req,res)
 {

    var idrow = req.params.idrow;
 
    if (idrow != null)
    {
      var query =  " select * from vw_nh_bestellungen_cue_lines ";
          query += " where idrow="+idrow+" order by id";
         ExecuteSQL(query,res);       
   }  
}

function bestellungen2_lin_tipo(req,res)
 {

    var idrow = req.params.idrow;
    var tipo  = req.params.tipo;
 
    if (idrow != null)
    {

      if (tipo == 1)
      {
        var query =  " select * from vw_nh_bestellungen_cue_lines_tipo_1 where idrow="+idrow+" order by id";
      }

      if (tipo == 2)
      {
        var query =  " select * from vw_nh_bestellungen_cue_lines_tipo_2 where idrow="+idrow+" order by id";
      }

      if (tipo == 3)
      {
        var query =  " select * from vw_nh_bestellungen_cue_lines_tipo_3 where idrow="+idrow+" order by id";
      }

      if (tipo == 4)
      {
        var query =  " select * from vw_nh_bestellungen_cue_lines_tipo_4 where idrow="+idrow+" order by id";
      }
        
      ExecuteSQL(query,res);       
   }  
}


function Bestellung_Zustand(req,res)
{
 
  var idrow = req.body.idrow;
  var estado = req.body.estado;
  var cliente = req.body.cliente;

  
  var request = new sql.Request();
        request.input('idrow',sql.Int,idrow);
        request.input('estado',sql.Int,estado);
        request.input('cliente',sql.Int,cliente);
        request.execute('sp_pedido_estado', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {    
               res.status(200).send({message: 'OK',retValue:returnValue});
            }
            else 
            {
              res.status(500).send({message: 'KO'});
            }

          });
}

function bestellungen_process(req,res)
{
  var cliente = req.params.cliente;

 
  if (cliente == 2)
  {
  var query = "select dbo.OrdersToProduce_CD() as orders";
  } 
  else 
  {
    var query = "select dbo.OrdersToProduce() as orders";
  }

   new sql.Request().query(query, (err2,result) => {

      if (err2 == null)
      {
          
          res.status(200).send(result.recordset[0].orders);
      }
      else
      {
          res.status(500).send({ message : err2 }); 
      }
  });
}

function bestellung_delete(req,res)
{
    let body = req.body;
    let ids = body.ids;
    let cliente = body.cliente;

    var request = new sql.Request();
        request.input('id',sql.Int,ids);
        request.input('cliente',sql.Int,cliente);
        request.execute('sp_bestellung_delete', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {    
               res.status(200).send({message: 'OK',retValue:returnValue});
            }
            else 
            {
              res.status(500).send({message: 'KO'});
            }

          });
}


module.exports = {
	Neue_Bestellung,
  bestellungen,
  bestellungen2,
  bestellungen2_lin,
  bestellungen2_lin_tipo,
  bestellungen_zustanden,
  bestellungen_zustand,
  bestellungen_zustand_customer,
  Bestellung_Zustand,
  bestellungen_process,
  bestellungen_zustanden_post,
  bestellung_get,
  bestellung_lines_get,
  bestellung_delete
 
}
