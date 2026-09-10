'use strict'

var bcrypt = require('bcrypt-nodejs');
var sql = require('mssql');



function del_cliente(req,res)
{
    let body = req.body;
    console.log(body);
    
    var request = new sql.Request();
        request.input('ids',sql.VarChar(8000),body.ids);
        request.input('operation',sql.Int,body.operation);
        request.execute('sp_clientes_api_operate', 
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

function put_cliente(req,res){

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
        values[0] = "-1";
    }


   
        var request = new sql.Request();
        request.input('idrow',sql.Int,values[0]);
        request.input('descripcion',sql.VarChar(255),values[1]);
        request.execute('sp_master_sm_clientes', 
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

function clientes(req,res){

			var sqlquery = "select idCliente as idrow,NomFiscal as descripcion,isnull(C1_Comercial,0) as C1_Comercial,";
            sqlquery += "isnull(C2_Rappel,0) as C2_Rappel,isnull(C3_Publicidad,0) as C3_Publicidad,isnull(Mar_Cliente,0) as Mar_Cliente,";
            sqlquery += "isnull(Mar_Acc,0) as Mar_Acc,isnull(Mar_Mec,0) as Mar_Mec,isnull(Mar_Tejido,0) as Mar_Tejido,isnull(C4_ProntoPago,0) as C4_ProntoPago from NH_CLIENTES order by descripcion";
				new sql.Request().query(sqlquery, (err2,result) => {

        			if (err2 == null){
        				res.status(200).send({ Table : result.recordset });
        			} else {
        				res.status(500).send({ message : err2 });	
        			}
        	});
}

function clientes_tiendas(req,res)
{
    let cliente = 1;
    var sqlquery = "select idrow,cliente,cliente as idcliente,pais,centro,nomfiscal,nombre,domicilio,poblacion,provincia,telefono_1,email_1,diastransporte,codsolupyme,descpais,Usuario,Password from Link_ClientesDomicilios order by idcliente";
    new sql.Request().query(sqlquery, (err2,result) => {

        if (err2 == null){
            res.status(200).send({ Table : result.recordset });
        } else {
            res.status(500).send({ message : err2 });	
        }
});
}

function clientes_import(req,res){

    var sqlquery = "select * from NH_CLIENTES_IMPORTACION";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
                res.status(500).send({ message : err2 });	
            }
    });

}

function clientes_filter(req,res){

            var sqlquery = "select idCliente as id2,nomfiscal as label from NH_CLIENTES order by nomfiscal";
                new sql.Request().query(sqlquery, (err2,result) => {

                    if (err2 == null){
                        res.status(200).send({ Table : result.recordset });
                    } else {
                    res.status(500).send({ message : err2 });   
                    }
            });

}

function paises_filter(req,res){

    var sqlquery = "select pais,descripcion from master_paises order by pais";
        new sql.Request().query(sqlquery, (err2,result) => {

            if (err2 == null){
                res.status(200).send({ Table : result.recordset });
            } else {
            res.status(500).send({ message : err2 });   
            }
    });

}


function clientes_promociones(req,res){


    var request = new sql.Request();
        request.execute('sp_promociones_regulariza', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {  
              var sqlquery = "select idrow, nomfiscal as descripcion2, nombre as descripcion, promocion_coeficiente, promocion_coeficiente2, promocion_activa, promocion_modificapvp, promocion_modificapvc, ";
              sqlquery += " desde, hasta, promocion_mensaje, 'false' as selected,imagen_banner from vw_nh_clientes_promociones ";
               new sql.Request().query(sqlquery, (err2,result) => {

                            if (err2 == null){
                                res.status(200).send({ Table : result.recordset });
                            } else {
                                res.status(500).send({ message : err2 });   
                            }
                    });
           } else 
           {
            res.status(500).send({ message : 'ERROR' }); 
           }
   });

}

function clientes_promociones_cliente(req,res){

    var cliente = req.params.cliente;
    var request = new sql.Request();
        request.execute('sp_promociones_regulariza', 
        function(err, recordsets, returnValue) {

            if (err == null)
            {  
                /*
              var sqlquery = "select idrow, nomfiscal as descripcion2, nombre as descripcion, promocion_coeficiente, promocion_coeficiente2, promocion_activa, promocion_modificapvp, promocion_modificapvc, ";
              sqlquery += " desde, hasta, promocion_mensaje, 'false' as selected from vw_nh_clientes_promociones ";
              sqlquery += " where idcliente=" + cliente;
              */

              var sqlquery = "select idrow, nombre as descripcion, 'false' as selected from nh_clientes_domicilios ";
              sqlquery += " where idcliente=" + cliente;
                new sql.Request().query(sqlquery, (err2,result) => {

                            if (err2 == null){
                                res.status(200).send({ Table : result.recordset });
                            } else {
                                res.status(500).send({ message : err2 });   
                            }
                    });
           } else 
           {
            res.status(500).send({ message : 'ERROR' }); 
           }
   });

}

function clientes_promociones_activas(req,res)
{
    var sqlquery = "select * from vw_nh_clientes_promociones where promocion_activa=1 ";
      new sql.Request().query(sqlquery, (err2,result) => {

                  if (err2 == null){
                      res.status(200).send({ Table : result.recordset });
                  } else {
                      res.status(500).send({ message : err2 });   
                  }
          });
}

async function clientes_pedidos_promocion(req,res)
{
        try {
      
            const pool = await sql.connect();

          const result = await pool.request().query(`
            SELECT
              head.cliente_entrega,
              head.refcliente,
              SUM(t1.cantidad) AS total
            FROM  SOL_PEDIDOS_COLA              head
            INNER JOIN sol_pedidos_cola_lineas  lin ON lin.idrow = head.idrow
            INNER JOIN sol_pedidos_cola_tipo_1  t1  ON t1.idrow  = lin.id
            INNER JOIN vw_nh_clientes_promociones pro
                                                ON  pro.idrow = head.CLIENTE_ENTREGA
            WHERE CAST(head.fecha AS date) >= pro.desde
              AND CAST(head.fecha AS date) <= pro.hasta
              AND t1.tipo    = 1
              AND lin.articulo = 1
              AND t1.acc_modelo_id=676
            GROUP BY head.cliente_entrega, head.refcliente
            ORDER BY head.cliente_entrega, head.refcliente
          `);
          return res.json({ Table: result.recordset });
      
        } catch (err) {
          console.error('[GET /sm/pedidos_promocion]', err);
          return res.status(500).json({ message: 'ERROR', detail: err.message });
        }
     
}

function clientes_promociones_program(req,res)
{
    let params = req.body;
   
   
   let bpvp = 0;
   if (params.model.aplicaPVP) bpvp = 1;

   let bc1 = 0;
    if (params.model.aplicaC1) bc1 = 1;
 
    var request = new sql.Request();
        request.input('ids',sql.VarChar(8000),params.ids);
        request.input('strDesde', sql.VarChar(10),params.Desde); 
        request.input('strHasta', sql.VarChar(10),params.Hasta); 
        request.input('pvp',sql.Decimal(12,2),params.model.CoefPVP);
        request.input('c1',sql.Decimal(12,2),params.model.CoefC1);
        request.input('bpvp',sql.Int,bpvp);
        request.input('bc1',sql.Int,bc1);
        request.input('mensaje', sql.VarChar(255),params.model.Mensaje); 
        request.execute('sp_promociones_programa', 
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

function clientes_promociones_set(req,res)
{
     var params = req.body;

        var request = new sql.Request();
        request.input('id',sql.Int,params.idrow);
        /*
        request.input('coeficiente',sql.Decimal(12,2),params.promocion_coeficiente);
        request.input('coeficiente2',sql.Decimal(12,2),params.promocion_coeficiente2);
        request.input('activa',sql.Int,params.promocion_activa);
        request.input('modificapvp',sql.Int,params.promocion_modificapvp);
        request.input('modificapvc',sql.Int,params.promocion_modificapvc);
        request.input('strDesde', sql.VarChar(10),params.desde); 
        request.input('strHasta', sql.VarChar(10),params.hasta); 
        */
        request.input('mensaje', sql.VarChar(255),params.promocion_mensaje); 
        request.execute('sp_update_articulos_tarifas_clientes', 
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

function clientes_promociones_del(req,res)
{
    var params = req.body;
 
    const id = params.ids.map(i => i.idrow).join(';');


    var request = new sql.Request();
    request.input('ids',sql.VarChar(2500),new String(id));
    request.execute('sp_promociones_borrar', 
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

function domicilios(req,res)
{
    let body = req.body;
    console.log(body);
    
    let id = body.idrow;
    let operation = body.operation;
    let cliente = body.Cliente;
    let pais = body.Pais;
    let nombre = body.Nombre;
    let poblacion = body.Poblacion;
    let provincia = body.Provincia;
    let telefono = body.Telefono;
    let email = body.Email;
    let diastransporte = body.DiasTransporte;
    let codsolupyme = body.CodSolupyme;
    let centro = body.Centro;
    let usuario = body.Usuario;
    let password = body.Password;
   
    bcrypt.hash(password,null,null, function(error,hash)
	{

 
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.input('operation',sql.Int,operation);
    request.input('cliente',sql.Int,cliente);
    request.input('pais',sql.Int,pais);
    request.input('nombre', sql.VarChar(255),nombre); 
    request.input('poblacion', sql.VarChar(255),poblacion); 
    request.input('provincia', sql.VarChar(255),provincia); 
    request.input('telefono', sql.VarChar(255),telefono); 
    request.input('email', sql.VarChar(255),email); 
    request.input('diastransporte',sql.Int,diastransporte);
    request.input('codsolupyme', sql.VarChar(5),codsolupyme); 
    request.input('centro',sql.Int,centro);
    request.input('usuario', sql.VarChar(255),usuario); 
    request.input('password', sql.VarChar(255),password); 
    request.input('hash', sql.VarChar(512),hash); 
    request.execute('sp_nh_add_cliente_domicilio', 
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
    });
    
}

function domicilios_del(req,res)
{
    let body = req.body;
    let id = body.ids.join(',');
    var request = new sql.Request();
    request.input('id',sql.Int,id);
    request.execute('sp_nh_del_cliente_domicilio', 
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


async function clientes_promociones_banner(req,res)
{
    try {
        const idrow = parseInt(req.params.idrow, 10);
    
        if (!req.file) {
          return res.status(400).json({ message: 'ERROR', detail: 'No se recibió ningún archivo' });
        }
    
        // Ruta relativa que se guardará en la BD
        // Ajusta el prefijo de URL según cómo sirvas los estáticos
        const imagenBanner = '/uploads_banners/banners/' + req.file.filename;
    
        const pool = await sql.connect();
        // --- SQL Server ---
        // Ajusta el nombre de tabla, columna PK y pool de conexión a los del proyecto
        await pool.request()
          .input('idrow',        sql.Int,          idrow)
          .input('imagen_banner', sql.VarChar(255), imagenBanner)
          .query(`
            UPDATE SOL_ARTICULOS_TARIFAS_CLIENTES
            SET    imagen_banner = @imagen_banner
            WHERE  idrow         = @idrow
          `);
    
        // --- MySQL (alternativa) ---
        // await db.query(
        //   'UPDATE SOL_ARTICULOS_TARIFAS_CLIENTES SET imagen_banner = ? WHERE idrow = ?',
        //   [imagenBanner, idrow]
        // );
    
        return res.json({ message: 'ok', imagen_banner: imagenBanner });
    
      } catch (err) {
        console.error('[POST /sm/promocion_banner]', err);
        return res.status(500).json({ message: 'ERROR', detail: err.message });
      }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES_USERS: Listado de clientes externos con productos
// ─────────────────────────────────────────────────────────────────────────────
function getClientesUsers(req, res) {
    var sqlquery = "SELECT * FROM dbo.vw_clientes_users ORDER BY NAME";
    new sql.Request().query(sqlquery, (err, result) => {
        if (err) return res.status(500).send({ message: err });
        res.status(200).send({ Table: result.recordset });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES_USERS: Alta de cliente externo
// ─────────────────────────────────────────────────────────────────────────────
function client_register(req, res) {
    var params   = req.body;
    var password = params.password;

    bcrypt.hash(password, null, null, function (error, hash) {
        if (error) return res.status(500).send({ message: 'KO', error: error });

        var request = new sql.Request();
        request.input('idrow',      sql.Int,          params.idrow || null);
        request.input('name',       sql.VarChar(255), params.name);
        request.input('surname',    sql.VarChar(255), params.surname);
        request.input('email',      sql.VarChar(255), params.email);
        request.input('password',   sql.VarChar(512), hash);
        request.input('role',       sql.VarChar(50),  params.role || 'Cliente');
        request.input('empresa',    sql.Int,          params.empresa);
        request.input('subempresa', sql.Int,          params.subempresa);

        request.execute('Users_Client_Add', function (err, recordsets) {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'KO', error: err });
            }
            res.status(200).send({ message: 'OK', idrow: recordsets.returnValue });
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTES_USERS: Eliminación de clientes externos
// ─────────────────────────────────────────────────────────────────────────────
function clientes_users_del(req, res) {
    var params = req.body;
    var values = params.ids;

    var request = new sql.Request();
    request.input('values', sql.VarChar(2500), values);
    request.execute('sp_clientes_users_del', function (err, recordsets) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'KO', error: err });
        }
        res.status(200).send({ message: 'OK' });
    });
}

module.exports = {
    clientes,
    clientes_filter,
    del_cliente,
    put_cliente,
    clientes_promociones,
    clientes_promociones_set,
    clientes_promociones_program,
    clientes_promociones_cliente,
    clientes_import,
    clientes_tiendas,
    paises_filter,
    domicilios,
    domicilios_del,
    clientes_promociones_banner,
    clientes_promociones_del,
    clientes_promociones_activas,
    clientes_pedidos_promocion,
    getClientesUsers,
    client_register,
    clientes_users_del
}