'use strict'

const sql = require('mssql');

/*
 * Configuración de la fabricación por reglas (motor v3).
 * Pantalla: routes/herstellen/artikeln_fab_cd_v3
 * Sistemas:   SOL_FABRICACION_SISTEMAS (hoy HONEYCOMB)
 * Reglas:     SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema + cliente; cliente NULL = todos)
 * Parámetros: SOL_FABRICACION_PARAMETROS (por sistema)
 * Motor:      sp_fabricacion_reglas_parametros / sp_fabricacion_reglas_aplicar,
 *             envuelto por el procedimiento de cada sistema (temp_sp_fabricacion_tipo_7)
 */

const CAMPOS_REGLA = ['orden', 'cliente', 'atributo', 'articulos', 'consumo',
  'nombre_parametro1', 'nombre_parametro2', 'nombre_parametro3', 'nombre_parametro4',
  'operacion', 'operacion2', 'operacion3', 'param_ancho', 'param_alto'];

const ERRORES_REGLA = {
  '-1': 'Sistema no válido',
  '-2': 'Cliente no válido',
  '-3': 'El parámetro de ancho o alto del componente no existe'
};

const ERRORES_PARAMETRO = {
  '-1': 'Nombre no válido: use @ seguido de letras, números o _',
  '-2': 'Tipo no válido: COLUMNA, FORMULA, BUSQUEDA o TABLA',
  '-3': 'La columna no existe en la tabla de datos del sistema',
  '-4': 'La fórmula no puede estar vacía',
  '-5': 'Sistema no válido',
  '-6': 'El parámetro de entrada no existe o no tiene un orden menor que este',
  '-7': 'Búsqueda no válida',
  '-8': 'Tabla de valores no válida'
};

const ERRORES_TABLA = {
  '-1': 'Nombre no válido: use letras, números o _',
  '-2': 'La tabla no tiene valores o hay valores que no son números',
  '-3': 'Hay claves repetidas',
  '-5': 'Sistema no válido'
};

/* Los nombres de tablas y procedimientos salen del catálogo; se validan antes de usarlos en SQL */
const IDENTIFICADOR = /^[A-Za-z0-9_]+$/;

function texto(value, max) {
  if (value === null || value === undefined) return '';
  return String(value).substring(0, max);
}

function operador(value) {
  const op = texto(value, 1).toUpperCase();
  return (op === 'Y' || op === 'O') ? op : '-';
}

function cliente(value) {
  const id = parseInt(value, 10);
  return isNaN(id) ? null : id;
}

async function sistemaActivo(pool, nombre) {
  const result = await pool.request()
    .input('sistema', sql.VarChar(50), texto(nombre, 50))
    .query('select * from SOL_FABRICACION_SISTEMAS where sistema = @sistema and activo = 1');
  const sistema = result.recordset[0];
  if (!sistema) return null;
  const nombres = [sistema.tabla_origen, sistema.tabla_fabricacion, sistema.tabla_parametros, sistema.procedimiento];
  return nombres.every(n => IDENTIFICADOR.test(n)) ? sistema : null;
}

/* ---------------- CATALOGOS ---------------- */

async function sistemas(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      select sistema, descripcion from SOL_FABRICACION_SISTEMAS
      where activo = 1 order by descripcion`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function clientes(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      select idrow, descripcion from SOL_CLIENTES order by descripcion`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Código, descripción y unidad de una lista de artículos (?ids=1,2,3) */
async function articulos(req, res) {
  const ids = String(req.query.ids || '').split(',')
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
  if (ids.length === 0) {
    return res.status(200).send({ Table: [] });
  }
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      select a.idrow, isnull(a.cod_solupyme,'') as cod_sol, upper(a.descripcion) as descripcion,
             a.unidad1 as unidad, u.descripcion as descUnidad
      from articulos a
      left join SOL_ARTICULOS_UNIDADES u on u.unidad = a.unidad1
      where a.idrow in (${ids.join(',')})`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ---------------- REGLAS ---------------- */

async function reglas(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(req.query.sistema, 50))
      .query(`
        select r.idrow, r.sistema, r.cliente, isnull(c.descripcion, 'Todos') as cliente_nombre,
               r.orden, r.atributo, r.articulos, dbo.fn_fabricacion_articulos_detalle(r.articulos) as detalle,
               r.nombre_parametro1, r.operacion, r.nombre_parametro2, r.operacion2,
               r.nombre_parametro3, r.operacion3, r.nombre_parametro4, r.consumo,
               isnull(r.param_ancho, '') as param_ancho, isnull(r.param_alto, '') as param_alto
        from SOL_ARTICULOS_FABRICACION_RELACION_V2 r
        join SOL_FABRICACION_SISTEMAS s on s.sistema = r.sistema and s.activo = 1
        left join SOL_CLIENTES c on c.idrow = r.cliente
        where r.sistema = @sistema
        order by case when r.cliente is null then 0 else 1 end, c.descripcion, r.orden, r.idrow`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function regla_add(req, res) {
  const body = req.body || {};
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(body.sistema, 50))
      .input('cliente', sql.Int, cliente(body.cliente))
      .input('orden', sql.Int, parseInt(body.orden, 10) || 0)
      .input('atributo', sql.VarChar(50), texto(body.atributo, 50))
      .input('articulos', sql.VarChar(1024), texto(body.articulos, 1024))
      .input('nombre_parametro1', sql.VarChar(50), texto(body.nombre_parametro1, 50))
      .input('operacion', sql.Char(1), operador(body.operacion))
      .input('nombre_parametro2', sql.VarChar(50), texto(body.nombre_parametro2, 50))
      .input('operacion2', sql.Char(1), operador(body.operacion2))
      .input('nombre_parametro3', sql.VarChar(50), texto(body.nombre_parametro3, 50))
      .input('operacion3', sql.Char(1), operador(body.operacion3))
      .input('nombre_parametro4', sql.VarChar(50), texto(body.nombre_parametro4, 50))
      .input('consumo', sql.VarChar(255), texto(body.consumo, 255))
      .input('param_ancho', sql.VarChar(50), texto(body.param_ancho, 50))
      .input('param_alto', sql.VarChar(50), texto(body.param_alto, 50))
      .execute('sp_fabricacion_regla_add');
    if (result.returnValue > 0) {
      res.status(200).send({ message: 'OK', idrow: result.returnValue });
    } else {
      res.status(400).send({ message: ERRORES_REGLA[String(result.returnValue)] || 'KO' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Guarda la regla completa desde la ventana de edición: idrow > 0 modifica, si no crea */
async function regla_save(req, res) {
  const body = req.body || {};
  const idrow = parseInt(body.idrow, 10) || 0;
  if (idrow <= 0) {
    return regla_add(req, res);
  }
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('idrow', sql.Int, idrow)
      .input('sistema', sql.VarChar(50), texto(body.sistema, 50))
      .input('cliente', sql.Int, cliente(body.cliente))
      .input('orden', sql.Int, parseInt(body.orden, 10) || 0)
      .input('atributo', sql.VarChar(50), texto(body.atributo, 50))
      .input('articulos', sql.VarChar(1024), texto(body.articulos, 1024))
      .input('nombre_parametro1', sql.VarChar(50), texto(body.nombre_parametro1, 50))
      .input('operacion', sql.Char(1), operador(body.operacion))
      .input('nombre_parametro2', sql.VarChar(50), texto(body.nombre_parametro2, 50))
      .input('operacion2', sql.Char(1), operador(body.operacion2))
      .input('nombre_parametro3', sql.VarChar(50), texto(body.nombre_parametro3, 50))
      .input('operacion3', sql.Char(1), operador(body.operacion3))
      .input('nombre_parametro4', sql.VarChar(50), texto(body.nombre_parametro4, 50))
      .input('consumo', sql.VarChar(255), texto(body.consumo, 255))
      .input('param_ancho', sql.VarChar(50), texto(body.param_ancho, 50))
      .input('param_alto', sql.VarChar(50), texto(body.param_alto, 50))
      .execute('sp_fabricacion_regla_edit');
    if (result.returnValue === 1) {
      res.status(200).send({ message: 'OK', idrow: idrow });
    } else if (result.returnValue === 0) {
      res.status(404).send({ message: 'Regla no encontrada' });
    } else {
      res.status(400).send({ message: ERRORES_REGLA[String(result.returnValue)] || 'KO' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function regla_update(req, res) {
  const body = req.body || {};
  if (CAMPOS_REGLA.indexOf(body.campo) === -1) {
    return res.status(400).send({ message: 'Campo no editable' });
  }
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('idrow', sql.Int, parseInt(body.idrow, 10))
      .input('campo', sql.VarChar(50), body.campo)
      .input('valor', sql.VarChar(1024), texto(body.valor, 1024))
      .execute('sp_fabricacion_regla_update');
    if (result.returnValue === 1) {
      res.status(200).send({ message: 'OK' });
    } else {
      res.status(400).send({ message: 'Regla no encontrada o valor no válido' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function regla_delete(req, res) {
  const body = req.body || {};
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('idrow', sql.Int, parseInt(body.idrow, 10))
      .execute('sp_fabricacion_regla_borrar');
    if (result.returnValue > 0) {
      res.status(200).send({ message: 'OK' });
    } else {
      res.status(404).send({ message: 'Regla no encontrada' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ---------------- PARAMETROS ---------------- */

async function parametros(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(req.query.sistema, 50))
      .query(`
        select p.idrow, p.name, p.tipo, p.origen, p.orden, p.busqueda, p.tabla,
               case when p.tipo = 'BUSQUEDA' and exists (
                      select 1 from SOL_FABRICACION_BUSQUEDAS b
                      where b.busqueda = p.busqueda and (b.sistema is null or b.sistema = p.sistema)
                        and upper(b.tabla) = 'ARTICULOS' and upper(b.resultado) = 'IDROW')
                    then 1 else 0 end as devuelve_articulo
        from SOL_FABRICACION_PARAMETROS p
        where p.sistema = @sistema
        order by p.orden, p.idrow`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Valores posibles de los parámetros que tienen catálogo (desplegable de las condiciones) */
async function parametros_valores(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(req.query.sistema, 50))
      .execute('sp_fabricacion_parametros_valores');
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function columnas(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(req.query.sistema, 50))
      .query(`
        select c.name from SOL_FABRICACION_SISTEMAS s
        join sys.columns c on c.object_id = object_id('dbo.' + s.tabla_origen)
        where s.sistema = @sistema and s.activo = 1 and c.name not in ('id','idrow')
        order by c.column_id`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function parametro_edit(req, res) {
  const body = req.body || {};
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(body.sistema, 50))
      .input('name', sql.VarChar(50), texto(body.name, 50))
      .input('tipo', sql.VarChar(10), texto(body.tipo, 10))
      .input('origen', sql.VarChar(255), texto(body.origen, 255))
      .input('orden', sql.Int, parseInt(body.orden, 10) || 0)
      .input('busqueda', sql.VarChar(50), body.busqueda ? texto(body.busqueda, 50) : null)
      .input('tablaValores', sql.VarChar(50), body.tabla ? texto(body.tabla, 50) : null)
      .execute('sp_fabricacion_parametro_edit');
    if (result.returnValue === 1) {
      res.status(200).send({ message: 'OK' });
    } else {
      res.status(400).send({ message: ERRORES_PARAMETRO[String(result.returnValue)] || 'KO' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function parametro_delete(req, res) {
  const body = req.body || {};
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(body.sistema, 50))
      .input('name', sql.VarChar(50), texto(body.name, 50))
      .execute('sp_fabricacion_parametro_borrar');
    if (result.returnValue > 0) {
      res.status(200).send({ message: 'OK' });
    } else {
      res.status(404).send({ message: 'Parámetro no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ---------------- SIMULACION ---------------- */

/* Ejecuta la fabricación del sistema para el pedido y devuelve el resultado.
   Estructura esperada (como el tipo 7): tabla_fabricacion.idrow y tabla_parametros.idrow
   -> tabla_origen.id; tabla_origen.idrow -> SOL_PEDIDOS_COLA_LINEAS.id */
async function simular(req, res) {
  const body = req.body || {};
  const idPedido = parseInt(body.idPedido, 10);
  if (!idPedido) {
    return res.status(400).send({ message: 'Debe indicar el ID del pedido' });
  }
  try {
    const pool = await sql.connect();
    const sistema = await sistemaActivo(pool, body.sistema);
    if (!sistema) {
      return res.status(400).send({ message: 'Sistema no válido' });
    }

    await pool.request()
      .input('idPedido', sql.Int, idPedido)
      .input('print', sql.Int, 0)
      .input('real', sql.Int, 1)
      .execute(sistema.procedimiento);

    const fabricacion = await pool.request()
      .input('idPedido', sql.Int, idPedido)
      .input('tipo', sql.Int, sistema.tipo_linea)
      .query(`
        select f.id, f.idpedido, f.orden, f.articulo, f.descripcion, f.cantidad, f.unidad, f.descUnidad,
               f.consumo, isnull(f.cod_sol,'') as cod_sol, f.fam_sol
        from dbo.[${sistema.tabla_fabricacion}] f
        join dbo.[${sistema.tabla_origen}] t on t.id = f.idrow
        join SOL_PEDIDOS_COLA_LINEAS l on l.id = t.idrow and l.tipo = @tipo
        where l.idrow = @idPedido
        order by f.idpedido, f.orden, f.id`);

    const params = await pool.request()
      .input('idPedido', sql.Int, idPedido)
      .input('tipo', sql.Int, sistema.tipo_linea)
      .query(`
        select p.idpedido, p.parametro, p.valor
        from dbo.[${sistema.tabla_parametros}] p
        join dbo.[${sistema.tabla_origen}] t on t.id = p.idrow
        join SOL_PEDIDOS_COLA_LINEAS l on l.id = t.idrow and l.tipo = @tipo
        where l.idrow = @idPedido
        order by p.idpedido, p.id`);

    /* Qué reglas se han usado: las propias del cliente del pedido o las generales */
    const info = await pool.request()
      .input('idPedido', sql.Int, idPedido)
      .input('sistema', sql.VarChar(50), sistema.sistema)
      .query(`
        select p.cliente, c.descripcion as cliente_nombre,
               case when exists (select 1 from SOL_ARTICULOS_FABRICACION_RELACION_V2 r
                                 where r.sistema = @sistema and r.cliente = p.cliente)
                    then 1 else 0 end as reglas_cliente
        from SOL_PEDIDOS_COLA p
        left join SOL_CLIENTES c on c.idrow = p.cliente
        where p.idrow = @idPedido`);

    res.status(200).send({
      Fabricacion: fabricacion.recordset,
      Parametros: params.recordset,
      Pedido: info.recordset[0] || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ---------------- BUSQUEDAS Y TABLAS DE VALORES ---------------- */

/* Búsquedas disponibles para el sistema (las generales y las suyas). Solo se dan de alta por script. */
async function busquedas(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(req.query.sistema, 50))
      .query(`
        select busqueda, descripcion from SOL_FABRICACION_BUSQUEDAS
        where sistema is null or sistema = @sistema
        order by descripcion`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function tablas(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(req.query.sistema, 50))
      .query(`
        select t.tabla, t.descripcion, t.clave_texto, t.valor_texto,
               count(v.idrow) as filas, min(v.clave) as desde, max(v.clave) as hasta
        from SOL_FABRICACION_TABLAS t
        left join SOL_FABRICACION_TABLAS_VALORES v on v.idtabla = t.idrow
        where t.sistema = @sistema
        group by t.tabla, t.descripcion, t.clave_texto, t.valor_texto
        order by t.tabla`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function tabla_valores(req, res) {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(req.query.sistema, 50))
      .input('tabla', sql.VarChar(50), texto(req.query.tabla, 50))
      .query(`
        select v.clave, v.valor
        from SOL_FABRICACION_TABLAS t
        join SOL_FABRICACION_TABLAS_VALORES v on v.idtabla = t.idrow
        where t.sistema = @sistema and t.tabla = @tabla
        order by v.clave`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Guarda la tabla completa: body { sistema, tabla, descripcion, clave_texto, valor_texto, valores: [{clave, valor}] } */
async function tabla_guardar(req, res) {
  const body = req.body || {};
  const valores = Array.isArray(body.valores) ? body.valores : [];
  const numeros = valores.map(v => ({
    clave: parseFloat(String(v.clave).replace(',', '.')),
    valor: parseFloat(String(v.valor).replace(',', '.'))
  }));
  if (numeros.length === 0 || numeros.length > 5000 || numeros.some(v => !isFinite(v.clave) || !isFinite(v.valor))) {
    return res.status(400).send({ message: ERRORES_TABLA['-2'] });
  }
  /* Solo números: el XML no lleva texto del usuario */
  const xml = numeros.map(v => '<v c="' + v.clave + '" v="' + v.valor + '"/>').join('');
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(body.sistema, 50))
      .input('tabla', sql.VarChar(50), texto(body.tabla, 50))
      .input('descripcion', sql.VarChar(150), texto(body.descripcion, 150))
      .input('clave_texto', sql.VarChar(50), texto(body.clave_texto, 50))
      .input('valor_texto', sql.VarChar(50), texto(body.valor_texto, 50))
      .input('valores', sql.Xml, xml)
      .execute('sp_fabricacion_tabla_guardar');
    if (result.returnValue > 0) {
      res.status(200).send({ message: 'OK' });
    } else {
      res.status(400).send({ message: ERRORES_TABLA[String(result.returnValue)] || 'KO' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

async function tabla_delete(req, res) {
  const body = req.body || {};
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('sistema', sql.VarChar(50), texto(body.sistema, 50))
      .input('tabla', sql.VarChar(50), texto(body.tabla, 50))
      .execute('sp_fabricacion_tabla_borrar');
    if (result.returnValue > 0) {
      res.status(200).send({ message: 'OK' });
    } else if (result.returnValue === -1) {
      res.status(400).send({ message: 'La tabla la usa algún parámetro: cambie o borre antes el parámetro' });
    } else {
      res.status(404).send({ message: 'Tabla no encontrada' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

module.exports = {
  busquedas,
  tablas,
  tabla_valores,
  tabla_guardar,
  tabla_delete,
  sistemas,
  clientes,
  articulos,
  reglas,
  regla_add,
  regla_save,
  regla_update,
  regla_delete,
  parametros,
  parametros_valores,
  columnas,
  parametro_edit,
  parametro_delete,
  simular
}
