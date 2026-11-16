'use strict'

const sql = require('mssql');
/* Fase 2: claves de las listas (CATALOGOS) y productos con tejidos, para el surtido de cada perfil */
const { CATALOGOS } = require('./accionamientos_nuevo');

/*
 * Perfil de configurador de un cliente (sqlPerfiles 01-08, PLAN_FASE1_PERFILES.md).
 * Un perfil dice qué productos ve el configurador de un cliente, con qué motor (ANTIGUO / NUEVO), con qué
 * nombre, con qué documentos y con qué parámetros. Con él, el front deja de comprobar números de cliente.
 * Dentro del perfil, cada usuario sigue restringiendo los productos con sus casillas prod_N (decisión 8);
 * eso lo hace el front con /api/lm/userinfo.
 *
 *   GET /api/sm/cfg/perfil/:cliente[?idioma=ES]
 *     { perfil: { codigo, nombre, idioma, politica_novedades },
 *       productos: [ { tipo, visible, motor, orden, nombre, documentos: [ { subtipo, etiqueta, url, icono } ] } ],
 *       documentos: [ ... ]   (los de la barra superior, sin producto)
 *       parametros: { clave: valor } }
 *
 * Un cliente sin fila en CFG_CLIENTE_PERFIL usa el perfil ESTANDAR.
 * Nombre de producto: override del perfil en el idioma > base en el idioma > override en ES > base en ES.
 */

const PERFIL_POR_DEFECTO = 'ESTANDAR';

function entero(value) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function idiomaValido(value) {
  const i = String(value || '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(i) ? i : null;
}

/* Perfil efectivo del cliente (vw_cfg_cliente_perfil: el suyo si está activo; si no, ESTANDAR, igual que las
   vistas de los interruptores). Un cliente que no está en SOL_CLIENTES también usa ESTANDAR. null si no hay ninguno */
async function perfilDeCliente(pool, cliente) {
  const r = await pool.request()
    .input('cliente', sql.Int, cliente)
    .input('defecto', sql.VarChar(30), PERFIL_POR_DEFECTO)
    .query(`select top 1 p.id, p.codigo, p.nombre, p.idioma, p.politica_novedades
            from dbo.CFG_PERFIL p
            where p.id = coalesce(
              (select perfil_id from dbo.vw_cfg_cliente_perfil where cliente = @cliente),
              (select id from dbo.CFG_PERFIL where codigo = @defecto and activo = 1))`);
  return r.recordset[0] || null;
}

/* Lo que se devuelve para un perfil (lo usa también la vista previa de la pantalla de Perfiles) */
async function resolverPerfil(pool, perfil, idioma) {
  const idiomaTexto = idioma || perfil.idioma || 'ES';
  const req = () => pool.request()
    .input('perfil', sql.Int, perfil.id)
    .input('idioma', sql.VarChar(5), idiomaTexto);

  const [productos, documentos, parametros] = await Promise.all([
    req().query(`
      select pp.tipo_producto as tipo, pp.visible, pp.motor, pp.orden,
             coalesce(
               (select texto from dbo.CFG_TEXTO where perfil_id = @perfil and ambito = 'PRODUCTO' and catalogo is null
                  and clave = cast(pp.tipo_producto as varchar(50)) and idioma = @idioma),
               (select texto from dbo.CFG_TEXTO where perfil_id is null and ambito = 'PRODUCTO' and catalogo is null
                  and clave = cast(pp.tipo_producto as varchar(50)) and idioma = @idioma),
               (select texto from dbo.CFG_TEXTO where perfil_id = @perfil and ambito = 'PRODUCTO' and catalogo is null
                  and clave = cast(pp.tipo_producto as varchar(50)) and idioma = 'ES'),
               (select texto from dbo.CFG_TEXTO where perfil_id is null and ambito = 'PRODUCTO' and catalogo is null
                  and clave = cast(pp.tipo_producto as varchar(50)) and idioma = 'ES')) as nombre
      from dbo.CFG_PERFIL_PRODUCTO pp
      where pp.perfil_id = @perfil
      order by pp.orden, pp.tipo_producto`),
    req().query(`
      select tipo_producto as tipo, subtipo, etiqueta, url, icono
      from dbo.CFG_PERFIL_DOCUMENTO
      where perfil_id = @perfil and activo = 1
      order by isnull(tipo_producto, 0), subtipo, orden, id`),
    req().query('select clave, valor from dbo.CFG_PERFIL_PARAMETRO where perfil_id = @perfil')
  ]);

  const docs = documentos.recordset;
  const sinProducto = ({ tipo, ...d }) => d;
  const params = {};
  parametros.recordset.forEach(p => { params[p.clave] = p.valor; });

  return {
    perfil: { codigo: perfil.codigo, nombre: perfil.nombre, idioma: perfil.idioma, politica_novedades: perfil.politica_novedades },
    productos: productos.recordset.map(p => ({
      tipo: p.tipo,
      visible: p.visible === true,
      motor: p.motor,
      orden: p.orden,
      nombre: p.nombre,
      documentos: docs.filter(d => d.tipo === p.tipo).map(sinProducto)
    })),
    documentos: docs.filter(d => d.tipo === null).map(sinProducto),
    parametros: params
  };
}

/* GET /cfg/perfil/:cliente */
async function perfil(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  try {
    const pool = await sql.connect();
    const p = await perfilDeCliente(pool, cliente);
    if (!p) return res.status(404).send({ message: 'No hay perfil para el cliente' });
    res.status(200).send(await resolverPerfil(pool, p, idiomaValido(req.query.idioma)));
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ======================================================================================================
 * Pantalla Productos -> Perfiles (solo "Nuevo sistema"). Cambios en vivo, cada uno con su fila en CFG_AUDITORIA.
 *   GET  /cfg/admin/perfiles                       perfiles con su número de clientes
 *   GET  /cfg/admin/clientes                       clientes (SOL_CLIENTES) con su perfil asignado y el efectivo
 *   GET  /cfg/admin/perfil/:id                     productos (nombre base y del perfil), documentos y parámetros
 *   GET  /cfg/admin/perfil/:id/vista               lo que recibe el configurador con este perfil (vista previa)
 *   POST /cfg/admin/perfil                         alta o cambio { id?, codigo, nombre, idioma, politica_novedades, activo }
 *   POST /cfg/admin/perfil/:id/duplicar            { codigo, nombre }: copia productos, nombres, documentos y parámetros
 *   POST /cfg/admin/cliente_perfil                 { cliente, perfil_id }
 *   POST /cfg/admin/perfil/:id/producto            { tipo, visible, motor, orden, nombre } (nombre vacío = el base)
 *   POST /cfg/admin/perfil/:id/documento           alta o cambio { id?, tipo_producto, subtipo, etiqueta, url, icono, orden, activo }
 *   POST /cfg/admin/perfil/:id/documento/:doc/borrar
 *   POST /cfg/admin/perfil/:id/parametro           { clave, valor } (valor vacío = se borra)
 * ====================================================================================================== */

const TIPOS_PRODUCTO = [1, 2, 3, 4, 6, 7];
const MOTORES = ['ANTIGUO', 'NUEVO'];
const POLITICAS = ['OCULTAR', 'MOSTRAR'];

function usuarioDe(req) {
  return (req.user && (req.user.email || req.user.name)) || null;
}

function texto(value, max) {
  if (value === null || value === undefined) return '';
  return String(value).trim().substring(0, max);
}

function error400(res, message) {
  return res.status(400).send({ message });
}

async function auditar(conexion, usuario, tabla, clave, accion, antes, despues) {
  await conexion.request()
    .input('usuario', sql.VarChar(255), usuario)
    .input('tabla', sql.VarChar(50), tabla)
    .input('clave', sql.VarChar(200), String(clave))
    .input('accion', sql.VarChar(10), accion)
    .input('antes', sql.NVarChar(sql.MAX), antes === undefined || antes === null ? null : JSON.stringify(antes))
    .input('despues', sql.NVarChar(sql.MAX), despues === undefined || despues === null ? null : JSON.stringify(despues))
    .query(`insert into dbo.CFG_AUDITORIA (usuario, tabla, clave, accion, antes, despues)
            values (@usuario, @tabla, @clave, @accion, @antes, @despues)`);
}

async function perfilPorId(conexion, id) {
  const r = await conexion.request().input('id', sql.Int, id)
    .query('select id, codigo, nombre, idioma, politica_novedades, activo from dbo.CFG_PERFIL where id = @id');
  return r.recordset[0] || null;
}

/* Ejecuta fn(transaction) en una transacción; si falla, la deshace */
async function enTransaccion(pool, fn) {
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const resultado = await fn(transaction);
    await transaction.commit();
    return resultado;
  } catch (err) {
    try { await transaction.rollback(); } catch (e) { /* ya deshecha */ }
    throw err;
  }
}

function responderError(res, err) {
  console.error(err);
  if (err && err.esValidacion) return res.status(400).send({ message: err.message });
  res.status(500).send({ message: 'KO' });
}

function validacion(message) {
  const e = new Error(message);
  e.esValidacion = true;
  return e;
}

/* GET /cfg/admin/perfiles */
async function admin_perfiles(req, res) {
  try {
    const pool = await sql.connect();
    const r = await pool.request().query(`
      select p.id, p.codigo, p.nombre, p.idioma, p.politica_novedades, p.activo,
             (select count(*) from dbo.CFG_CLIENTE_PERFIL cp where cp.perfil_id = p.id) as clientes
      from dbo.CFG_PERFIL p
      order by p.id`);
    res.status(200).send(r.recordset);
  } catch (err) { responderError(res, err); }
}

/* GET /cfg/admin/clientes */
async function admin_clientes(req, res) {
  try {
    const pool = await sql.connect();
    const r = await pool.request().query(`
      select c.idrow as cliente, c.descripcion, cp.perfil_id, v.perfil_id as perfil_efectivo
      from dbo.SOL_CLIENTES c
      left join dbo.CFG_CLIENTE_PERFIL cp on cp.cliente = c.idrow
      left join dbo.vw_cfg_cliente_perfil v on v.cliente = c.idrow
      order by c.idrow`);
    res.status(200).send(r.recordset);
  } catch (err) { responderError(res, err); }
}

/* GET /cfg/admin/perfil/:id */
async function admin_perfil(req, res) {
  const id = entero(req.params.id);
  if (id === null) return error400(res, 'Perfil no válido');
  try {
    const pool = await sql.connect();
    const perfil = await perfilPorId(pool, id);
    if (!perfil) return res.status(404).send({ message: 'El perfil no existe' });
    const req2 = () => pool.request().input('perfil', sql.Int, id);
    const [productos, documentos, parametros] = await Promise.all([
      req2().query(`
        select pp.tipo_producto as tipo, pp.visible, pp.motor, pp.orden,
               (select texto from dbo.CFG_TEXTO where perfil_id is null and ambito = 'PRODUCTO' and catalogo is null
                  and clave = cast(pp.tipo_producto as varchar(50)) and idioma = 'ES') as nombre_base,
               (select texto from dbo.CFG_TEXTO where perfil_id = @perfil and ambito = 'PRODUCTO' and catalogo is null
                  and clave = cast(pp.tipo_producto as varchar(50)) and idioma = 'ES') as nombre_perfil
        from dbo.CFG_PERFIL_PRODUCTO pp
        where pp.perfil_id = @perfil
        order by pp.orden, pp.tipo_producto`),
      req2().query(`
        select id, tipo_producto, subtipo, etiqueta, url, icono, orden, activo
        from dbo.CFG_PERFIL_DOCUMENTO where perfil_id = @perfil
        order by isnull(tipo_producto, 0), subtipo, orden, id`),
      req2().query('select clave, valor from dbo.CFG_PERFIL_PARAMETRO where perfil_id = @perfil order by clave')
    ]);
    res.status(200).send({
      perfil,
      productos: productos.recordset,
      documentos: documentos.recordset,
      parametros: parametros.recordset
    });
  } catch (err) { responderError(res, err); }
}

/* GET /cfg/admin/perfil/:id/vista */
async function admin_vista(req, res) {
  const id = entero(req.params.id);
  if (id === null) return error400(res, 'Perfil no válido');
  try {
    const pool = await sql.connect();
    const perfil = await perfilPorId(pool, id);
    if (!perfil) return res.status(404).send({ message: 'El perfil no existe' });
    res.status(200).send(await resolverPerfil(pool, perfil, idiomaValido(req.query.idioma)));
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil — el código no se cambia una vez creado (ESTANDAR es el de por defecto) */
async function admin_guardar_perfil(req, res) {
  const b = req.body || {};
  const id = b.id ? entero(b.id) : null;
  const nombre = texto(b.nombre, 100);
  const idioma = idiomaValido(b.idioma) || 'ES';
  const politica = POLITICAS.includes(b.politica_novedades) ? b.politica_novedades : null;
  const activo = b.activo === false || b.activo === 0 ? 0 : 1;
  if (!nombre) return error400(res, 'Falta el nombre');
  if (!politica) return error400(res, 'Política de novedades no válida (OCULTAR o MOSTRAR)');
  try {
    const pool = await sql.connect();
    const resultado = await enTransaccion(pool, async (t) => {
      if (id) {
        const antes = await perfilPorId(t, id);
        if (!antes) throw validacion('El perfil no existe');
        if (antes.codigo === PERFIL_POR_DEFECTO && !activo) {
          throw validacion('El perfil ESTANDAR no se puede desactivar: es el de los clientes sin perfil');
        }
        await t.request().input('id', sql.Int, id).input('nombre', sql.NVarChar(100), nombre)
          .input('idioma', sql.VarChar(5), idioma).input('politica', sql.VarChar(10), politica).input('activo', sql.Bit, activo)
          .query(`update dbo.CFG_PERFIL set nombre = @nombre, idioma = @idioma, politica_novedades = @politica, activo = @activo
                  where id = @id`);
        await auditar(t, usuarioDe(req), 'CFG_PERFIL', id, 'CAMBIO', antes, await perfilPorId(t, id));
        return id;
      }
      const codigo = texto(b.codigo, 30).toUpperCase();
      if (!/^[A-Z0-9_]{2,30}$/.test(codigo)) throw validacion('El código solo admite letras, números y _ (de 2 a 30)');
      const existe = await t.request().input('codigo', sql.VarChar(30), codigo)
        .query('select 1 as ok from dbo.CFG_PERFIL where codigo = @codigo');
      if (existe.recordset.length) throw validacion('Ya hay un perfil con ese código');
      const r = await t.request().input('codigo', sql.VarChar(30), codigo).input('nombre', sql.NVarChar(100), nombre)
        .input('idioma', sql.VarChar(5), idioma).input('politica', sql.VarChar(10), politica).input('activo', sql.Bit, activo)
        .query(`insert into dbo.CFG_PERFIL (codigo, nombre, idioma, politica_novedades, activo)
                values (@codigo, @nombre, @idioma, @politica, @activo); select scope_identity() as id`);
      const nuevo = r.recordset[0].id;
      /* Un perfil nuevo empieza con todos los productos ocultos y con el motor antiguo (el 6 solo existe con el nuevo) */
      await t.request().input('perfil', sql.Int, nuevo).query(`
        insert into dbo.CFG_PERFIL_PRODUCTO (perfil_id, tipo_producto, visible, motor, orden)
        select @perfil, v.tipo, 0, v.motor, v.orden
        from (values (1, 'ANTIGUO', 1), (2, 'ANTIGUO', 2), (3, 'ANTIGUO', 3), (4, 'ANTIGUO', 4),
                     (7, 'ANTIGUO', 5), (6, 'NUEVO', 6)) v (tipo, motor, orden)`);
      await auditar(t, usuarioDe(req), 'CFG_PERFIL', nuevo, 'ALTA', null, await perfilPorId(t, nuevo));
      return nuevo;
    });
    res.status(200).send({ message: 'OK', id: resultado });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/duplicar */
async function admin_duplicar(req, res) {
  const origen = entero(req.params.id);
  const b = req.body || {};
  const codigo = texto(b.codigo, 30).toUpperCase();
  const nombre = texto(b.nombre, 100);
  if (origen === null) return error400(res, 'Perfil no válido');
  if (!/^[A-Z0-9_]{2,30}$/.test(codigo)) return error400(res, 'El código solo admite letras, números y _ (de 2 a 30)');
  if (!nombre) return error400(res, 'Falta el nombre');
  try {
    const pool = await sql.connect();
    const nuevo = await enTransaccion(pool, async (t) => {
      const p = await perfilPorId(t, origen);
      if (!p) throw validacion('El perfil no existe');
      const existe = await t.request().input('codigo', sql.VarChar(30), codigo)
        .query('select 1 as ok from dbo.CFG_PERFIL where codigo = @codigo');
      if (existe.recordset.length) throw validacion('Ya hay un perfil con ese código');
      const r = await t.request()
        .input('origen', sql.Int, origen).input('codigo', sql.VarChar(30), codigo).input('nombre', sql.NVarChar(100), nombre)
        .query(`
          insert into dbo.CFG_PERFIL (codigo, nombre, idioma, politica_novedades, activo)
          select @codigo, @nombre, idioma, politica_novedades, 1 from dbo.CFG_PERFIL where id = @origen;
          declare @nuevo int = scope_identity();
          insert into dbo.CFG_PERFIL_PRODUCTO (perfil_id, tipo_producto, visible, motor, orden)
            select @nuevo, tipo_producto, visible, motor, orden from dbo.CFG_PERFIL_PRODUCTO where perfil_id = @origen;
          insert into dbo.CFG_TEXTO (perfil_id, ambito, catalogo, clave, idioma, texto)
            select @nuevo, ambito, catalogo, clave, idioma, texto from dbo.CFG_TEXTO where perfil_id = @origen;
          insert into dbo.CFG_PERFIL_DOCUMENTO (perfil_id, tipo_producto, subtipo, etiqueta, url, icono, orden, activo)
            select @nuevo, tipo_producto, subtipo, etiqueta, url, icono, orden, activo from dbo.CFG_PERFIL_DOCUMENTO where perfil_id = @origen;
          insert into dbo.CFG_PERFIL_PARAMETRO (perfil_id, clave, valor)
            select @nuevo, clave, valor from dbo.CFG_PERFIL_PARAMETRO where perfil_id = @origen;
          /* Fase 2: también el surtido (los textos de opciones y tejidos ya van arriba con CFG_TEXTO) */
          insert into dbo.CFG_PERFIL_OPCION (perfil_id, catalogo, opcion_id, visible)
            select @nuevo, catalogo, opcion_id, visible from dbo.CFG_PERFIL_OPCION where perfil_id = @origen;
          insert into dbo.CFG_PERFIL_TEJIDO (perfil_id, producto, tejido, visible, ancho_min, ancho_max, alto_min, alto_max)
            select @nuevo, producto, tejido, visible, ancho_min, ancho_max, alto_min, alto_max from dbo.CFG_PERFIL_TEJIDO where perfil_id = @origen;
          select @nuevo as id;`);
      const id = r.recordset[0].id;
      await auditar(t, usuarioDe(req), 'CFG_PERFIL', id, 'ALTA', null, { duplicado_de: p.codigo, codigo, nombre });
      return id;
    });
    res.status(200).send({ message: 'OK', id: nuevo });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/cliente_perfil */
async function admin_cliente_perfil(req, res) {
  const b = req.body || {};
  const cliente = entero(b.cliente);
  const perfilId = entero(b.perfil_id);
  if (cliente === null || perfilId === null) return error400(res, 'Cliente o perfil no válido');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      const c = await t.request().input('cliente', sql.Int, cliente)
        .query('select idrow from dbo.SOL_CLIENTES where idrow = @cliente');
      if (!c.recordset.length) throw validacion('El cliente no existe');
      if (!await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      const antes = await t.request().input('cliente', sql.Int, cliente)
        .query('select perfil_id from dbo.CFG_CLIENTE_PERFIL where cliente = @cliente');
      const anterior = antes.recordset[0] ? antes.recordset[0].perfil_id : null;
      await t.request().input('cliente', sql.Int, cliente).input('perfil', sql.Int, perfilId).query(`
        if exists (select 1 from dbo.CFG_CLIENTE_PERFIL where cliente = @cliente)
          update dbo.CFG_CLIENTE_PERFIL set perfil_id = @perfil where cliente = @cliente
        else
          insert into dbo.CFG_CLIENTE_PERFIL (cliente, perfil_id) values (@cliente, @perfil)`);
      await auditar(t, usuarioDe(req), 'CFG_CLIENTE_PERFIL', cliente, anterior === null ? 'ALTA' : 'CAMBIO',
        anterior === null ? null : { perfil_id: anterior }, { perfil_id: perfilId });
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/producto */
async function admin_producto(req, res) {
  const perfilId = entero(req.params.id);
  const b = req.body || {};
  const tipo = parseInt(b.tipo, 10);
  const visible = b.visible === true || b.visible === 1 ? 1 : 0;
  const motor = MOTORES.includes(b.motor) ? b.motor : null;
  const orden = Number.isInteger(parseInt(b.orden, 10)) ? parseInt(b.orden, 10) : 0;
  const nombre = texto(b.nombre, 200);
  if (perfilId === null) return error400(res, 'Perfil no válido');
  if (!TIPOS_PRODUCTO.includes(tipo)) return error400(res, 'Producto no válido');
  if (!motor) return error400(res, 'Motor no válido (ANTIGUO o NUEVO)');
  if (tipo === 7 && motor === 'NUEVO') return error400(res, 'La HoneyComb todavía no tiene configurador nuevo');
  if (tipo === 6 && visible && motor !== 'NUEVO') return error400(res, 'El Cajón ZIP propio solo existe con el configurador nuevo');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      if (!await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      const clave = perfilId + '/' + tipo;
      const leer = async () => (await t.request().input('perfil', sql.Int, perfilId).input('tipo', sql.Int, tipo).query(`
        select pp.visible, pp.motor, pp.orden,
               (select texto from dbo.CFG_TEXTO where perfil_id = @perfil and ambito = 'PRODUCTO' and catalogo is null
                  and clave = cast(@tipo as varchar(50)) and idioma = 'ES') as nombre
        from dbo.CFG_PERFIL_PRODUCTO pp where pp.perfil_id = @perfil and pp.tipo_producto = @tipo`)).recordset[0] || null;
      const antes = await leer();
      await t.request().input('perfil', sql.Int, perfilId).input('tipo', sql.Int, tipo)
        .input('visible', sql.Bit, visible).input('motor', sql.VarChar(10), motor).input('orden', sql.Int, orden)
        .input('nombre', sql.NVarChar(200), nombre || null)
        .query(`
          if exists (select 1 from dbo.CFG_PERFIL_PRODUCTO where perfil_id = @perfil and tipo_producto = @tipo)
            update dbo.CFG_PERFIL_PRODUCTO set visible = @visible, motor = @motor, orden = @orden
            where perfil_id = @perfil and tipo_producto = @tipo
          else
            insert into dbo.CFG_PERFIL_PRODUCTO (perfil_id, tipo_producto, visible, motor, orden)
            values (@perfil, @tipo, @visible, @motor, @orden);
          /* nombre en el perfil: vacío = se usa el base */
          delete from dbo.CFG_TEXTO
          where perfil_id = @perfil and ambito = 'PRODUCTO' and catalogo is null and clave = cast(@tipo as varchar(50)) and idioma = 'ES';
          if @nombre is not null
            insert into dbo.CFG_TEXTO (perfil_id, ambito, catalogo, clave, idioma, texto)
            values (@perfil, 'PRODUCTO', null, cast(@tipo as varchar(50)), 'ES', @nombre);`);
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_PRODUCTO', clave, antes ? 'CAMBIO' : 'ALTA', antes, await leer());
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/documento */
async function admin_documento(req, res) {
  const perfilId = entero(req.params.id);
  const b = req.body || {};
  const id = b.id ? entero(b.id) : null;
  const tipo = b.tipo_producto === null || b.tipo_producto === '' || b.tipo_producto === undefined ? null : parseInt(b.tipo_producto, 10);
  const subtipo = b.subtipo === null || b.subtipo === '' || b.subtipo === undefined ? null : parseInt(b.subtipo, 10);
  const etiqueta = texto(b.etiqueta, 100);
  const url = texto(b.url, 300);
  const icono = texto(b.icono, 50) || null;
  const orden = Number.isInteger(parseInt(b.orden, 10)) ? parseInt(b.orden, 10) : 0;
  const activo = b.activo === false || b.activo === 0 ? 0 : 1;
  if (perfilId === null) return error400(res, 'Perfil no válido');
  if (tipo !== null && !TIPOS_PRODUCTO.includes(tipo)) return error400(res, 'Producto no válido');
  if (subtipo !== null && !(subtipo > 0)) return error400(res, 'Subtipo no válido');
  if (!etiqueta) return error400(res, 'Falta la etiqueta');
  if (!url || /^\s*javascript:/i.test(url)) return error400(res, 'Falta la dirección del documento');
  try {
    const pool = await sql.connect();
    const resultado = await enTransaccion(pool, async (t) => {
      if (!await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      const leer = async (docId) => (await t.request().input('id', sql.Int, docId).input('perfil', sql.Int, perfilId)
        .query(`select id, tipo_producto, subtipo, etiqueta, url, icono, orden, activo
                from dbo.CFG_PERFIL_DOCUMENTO where id = @id and perfil_id = @perfil`)).recordset[0] || null;
      const r = t.request().input('perfil', sql.Int, perfilId).input('tipo', sql.Int, tipo).input('subtipo', sql.Int, subtipo)
        .input('etiqueta', sql.NVarChar(100), etiqueta).input('url', sql.VarChar(300), url).input('icono', sql.VarChar(50), icono)
        .input('orden', sql.Int, orden).input('activo', sql.Bit, activo);
      if (id) {
        const antes = await leer(id);
        if (!antes) throw validacion('El documento no existe');
        await r.input('id', sql.Int, id).query(`
          update dbo.CFG_PERFIL_DOCUMENTO set tipo_producto = @tipo, subtipo = @subtipo, etiqueta = @etiqueta, url = @url,
                 icono = @icono, orden = @orden, activo = @activo
          where id = @id and perfil_id = @perfil`);
        await auditar(t, usuarioDe(req), 'CFG_PERFIL_DOCUMENTO', id, 'CAMBIO', antes, await leer(id));
        return id;
      }
      const nuevo = (await r.query(`
        insert into dbo.CFG_PERFIL_DOCUMENTO (perfil_id, tipo_producto, subtipo, etiqueta, url, icono, orden, activo)
        values (@perfil, @tipo, @subtipo, @etiqueta, @url, @icono, @orden, @activo); select scope_identity() as id`)).recordset[0].id;
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_DOCUMENTO', nuevo, 'ALTA', null, await leer(nuevo));
      return nuevo;
    });
    res.status(200).send({ message: 'OK', id: resultado });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/documento/:doc/borrar */
async function admin_borrar_documento(req, res) {
  const perfilId = entero(req.params.id);
  const id = entero(req.params.doc);
  if (perfilId === null || id === null) return error400(res, 'Documento no válido');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      const antes = (await t.request().input('id', sql.Int, id).input('perfil', sql.Int, perfilId)
        .query(`select id, tipo_producto, subtipo, etiqueta, url, icono, orden, activo
                from dbo.CFG_PERFIL_DOCUMENTO where id = @id and perfil_id = @perfil`)).recordset[0];
      if (!antes) throw validacion('El documento no existe');
      await t.request().input('id', sql.Int, id).query('delete from dbo.CFG_PERFIL_DOCUMENTO where id = @id');
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_DOCUMENTO', id, 'BAJA', antes, null);
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/parametro */
async function admin_parametro(req, res) {
  const perfilId = entero(req.params.id);
  const b = req.body || {};
  const clave = texto(b.clave, 50).toLowerCase();
  const valor = texto(b.valor, 200);
  if (perfilId === null) return error400(res, 'Perfil no válido');
  if (!/^[a-z0-9_]{1,50}$/.test(clave)) return error400(res, 'La clave solo admite minúsculas, números y _');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      if (!await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      const r0 = await t.request().input('perfil', sql.Int, perfilId).input('clave', sql.VarChar(50), clave)
        .query('select valor from dbo.CFG_PERFIL_PARAMETRO where perfil_id = @perfil and clave = @clave');
      const antes = r0.recordset[0] ? r0.recordset[0].valor : null;
      await t.request().input('perfil', sql.Int, perfilId).input('clave', sql.VarChar(50), clave)
        .input('valor', sql.NVarChar(200), valor).query(`
          delete from dbo.CFG_PERFIL_PARAMETRO where perfil_id = @perfil and clave = @clave;
          if @valor <> '' insert into dbo.CFG_PERFIL_PARAMETRO (perfil_id, clave, valor) values (@perfil, @clave, @valor);`);
      const accion = antes === null ? 'ALTA' : (valor === '' ? 'BAJA' : 'CAMBIO');
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_PARAMETRO', perfilId + '/' + clave, accion,
        antes === null ? null : { valor: antes }, valor === '' ? null : { valor });
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* ======================================================================================================
 * Fase 2: surtido de cada perfil (sqlPerfiles 10-14; PLAN_FASE2_SURTIDO.md). Solo "Nuevo sistema", con auditoría.
 *   GET  /cfg/admin/perfil/:id/opciones/:catalogo        filas del maestro con lo del perfil (visible, nombre ES/PT)
 *   POST /cfg/admin/perfil/:id/opciones/:catalogo        { cambios: [{ id, visible?, nombre?, nombre_pt? }] }
 *   POST /cfg/admin/perfil/:id/opciones/:catalogo/todo   { visible } todas las filas del maestro
 *   GET  /cfg/admin/perfil/:id/tejidos/:producto         tejidos incluidos en el producto con lo del perfil
 *   POST /cfg/admin/perfil/:id/tejidos/:producto         { cambios: [{ tejido, visible?, nombre?, color?, nombre_pt?, color_pt?,
 *                                                           ancho_min?, ancho_max?, alto_min?, alto_max? }] }
 *   POST /cfg/admin/perfil/:id/tejidos/:producto/todo    { visible }
 *   POST /cfg/admin/perfil/:id/copiar_surtido            { origen }: opciones, tejidos y sus textos (reemplaza)
 *   GET  /cfg/admin/perfil/:id/avisos                    productos con motor nuevo sin ningún tejido visible
 *   GET  /cfg/admin/cliente/:cliente/codigos             códigos del cliente
 *   POST /cfg/admin/cliente/:cliente/codigos             { cambios: [{ ambito, catalogo, clave, codigo }] } (codigo vacío = se borra)
 * Nombre / color vacío = el del maestro. Una propiedad que no llega no se toca.
 * ====================================================================================================== */

/* Tejidos incluidos en cada producto (la misma inclusión que usan las opciones del configurador) */
const TEJIDOS_PRODUCTO = {
  ENR: 'select distinct tejido from dbo.SOL_ACC_SISTEMA_TEJIDO',
  MINI: 'select tejido from dbo.SOL_ACC_MINI_TEJIDO',
  ZIP: 'select tejido from dbo.SOL_ACC_ZIP_TEJIDO',
  VER: 'select distinct tejido from dbo.SOL_ACC_VER_TIPO_TEJIDO',
  PJ: 'select tejido from dbo.SOL_ACC_PJ_TEJIDO'
};
/* Producto de Fase 1 (CFG_PERFIL_PRODUCTO.tipo_producto) de cada producto con tejidos */
const TIPO_DE_PRODUCTO = { ENR: 1, PJ: 2, VER: 3, MINI: 4, ZIP: 6 };

function medidaNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  if (isNaN(n) || n <= 0) throw validacion('Las medidas tienen que ser números mayores que 0 (o vacías)');
  return Math.round(n * 100) / 100;
}

/* Escribe (o borra si viene vacío) un texto del perfil */
async function guardarTexto(t, perfilId, ambito, catalogo, clave, idioma, valor) {
  const v = texto(valor, 200);
  await t.request().input('perfil', sql.Int, perfilId).input('ambito', sql.VarChar(10), ambito)
    .input('catalogo', sql.VarChar(50), catalogo).input('clave', sql.VarChar(50), String(clave))
    .input('idioma', sql.VarChar(5), idioma).input('texto', sql.NVarChar(200), v || null).query(`
      delete from dbo.CFG_TEXTO where perfil_id = @perfil and ambito = @ambito and catalogo = @catalogo and clave = @clave and idioma = @idioma;
      if @texto is not null
        insert into dbo.CFG_TEXTO (perfil_id, ambito, catalogo, clave, idioma, texto)
        values (@perfil, @ambito, @catalogo, @clave, @idioma, @texto);`);
}

/* Textos del perfil de un ámbito/catálogo: { 'clave|idioma': texto } */
async function textosPerfil(conexion, perfilId, ambito, catalogos) {
  const r = await conexion.request().input('perfil', sql.Int, perfilId).input('ambito', sql.VarChar(10), ambito)
    .query('select catalogo, clave, idioma, texto from dbo.CFG_TEXTO where perfil_id = @perfil and ambito = @ambito');
  const m = {};
  r.recordset.filter(x => catalogos.includes(x.catalogo)).forEach(x => { m[x.catalogo + '|' + x.clave + '|' + x.idioma] = x.texto; });
  return m;
}

function catalogoValido(clave) {
  return Object.prototype.hasOwnProperty.call(CATALOGOS, clave) ? CATALOGOS[clave] : null;
}

/* GET /cfg/admin/perfil/:id/opciones/:catalogo */
async function admin_opciones(req, res) {
  const perfilId = entero(req.params.id);
  const cat = catalogoValido(req.params.catalogo);
  if (perfilId === null || !cat) return error400(res, 'Perfil o lista no válidos');
  try {
    const pool = await sql.connect();
    const perfil = await perfilPorId(pool, perfilId);
    if (!perfil) return res.status(404).send({ message: 'El perfil no existe' });
    const columnas = ['m.id', 'm.codigo', 'm.nombre', 'm.activo', 'm.orden'];
    if (cat.valor) columnas.push('m.valor');
    let join = '';
    if (cat.padre) { columnas.push('m.' + cat.padre + ' as padre_id', 'p.nombre as padre'); join = ` left join dbo.${cat.tablaPadre} p on p.id = m.${cat.padre}`; }
    const filas = (await pool.request().query(
      `select ${columnas.join(', ')} from dbo.${cat.tabla} m${join} order by ${cat.padre ? 'p.nombre, ' : ''}m.orden, m.nombre`)).recordset;
    const vis = (await pool.request().input('perfil', sql.Int, perfilId).input('catalogo', sql.VarChar(50), req.params.catalogo)
      .query('select opcion_id, visible from dbo.CFG_PERFIL_OPCION where perfil_id = @perfil and catalogo = @catalogo')).recordset;
    const visMap = new Map(vis.map(v => [v.opcion_id, v.visible === true]));
    const txt = await textosPerfil(pool, perfilId, 'OPCION', [req.params.catalogo]);
    const porDefecto = perfil.politica_novedades === 'MOSTRAR';
    res.status(200).send({
      politica: perfil.politica_novedades,
      filas: filas.map(f => ({
        id: f.id, codigo: f.codigo, nombre: f.nombre, valor: f.valor, activo: f.activo === true,
        padre_id: f.padre_id, padre: f.padre,
        visible_perfil: visMap.has(f.id) ? visMap.get(f.id) : null,
        visible: visMap.has(f.id) ? visMap.get(f.id) : porDefecto,
        nombre_es: txt[req.params.catalogo + '|' + f.id + '|ES'] || '',
        nombre_pt: txt[req.params.catalogo + '|' + f.id + '|PT'] || ''
      }))
    });
  } catch (err) { responderError(res, err); }
}

/* Guarda la visibilidad de un conjunto de opciones (dentro de la transacción) */
async function guardarVisibleOpcion(t, perfilId, catalogo, id, visible) {
  await t.request().input('perfil', sql.Int, perfilId).input('catalogo', sql.VarChar(50), catalogo)
    .input('id', sql.Int, id).input('visible', sql.Bit, visible ? 1 : 0).query(`
      if exists (select 1 from dbo.CFG_PERFIL_OPCION where perfil_id = @perfil and catalogo = @catalogo and opcion_id = @id)
        update dbo.CFG_PERFIL_OPCION set visible = @visible where perfil_id = @perfil and catalogo = @catalogo and opcion_id = @id
      else
        insert into dbo.CFG_PERFIL_OPCION (perfil_id, catalogo, opcion_id, visible) values (@perfil, @catalogo, @id, @visible)`);
}

/* POST /cfg/admin/perfil/:id/opciones/:catalogo */
async function admin_guardar_opciones(req, res) {
  const perfilId = entero(req.params.id);
  const catalogo = req.params.catalogo;
  const cat = catalogoValido(catalogo);
  const cambios = req.body && Array.isArray(req.body.cambios) ? req.body.cambios : [];
  if (perfilId === null || !cat) return error400(res, 'Perfil o lista no válidos');
  if (!cambios.length) return error400(res, 'No hay cambios');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      if (!await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      for (const c of cambios) {
        const id = entero(c.id);
        if (id === null) throw validacion('Opción no válida');
        const existe = await t.request().input('id', sql.Int, id).query(`select 1 as ok from dbo.${cat.tabla} where id = @id`);
        if (!existe.recordset.length) throw validacion('La opción ' + id + ' no existe en la lista');
        if (c.visible !== undefined) await guardarVisibleOpcion(t, perfilId, catalogo, id, c.visible === true || c.visible === 1);
        if (c.nombre !== undefined) await guardarTexto(t, perfilId, 'OPCION', catalogo, id, 'ES', c.nombre);
        if (c.nombre_pt !== undefined) await guardarTexto(t, perfilId, 'OPCION', catalogo, id, 'PT', c.nombre_pt);
      }
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_OPCION', perfilId + '/' + catalogo, 'CAMBIO', null, cambios);
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/opciones/:catalogo/todo */
async function admin_opciones_todo(req, res) {
  const perfilId = entero(req.params.id);
  const catalogo = req.params.catalogo;
  const cat = catalogoValido(catalogo);
  const visible = !!(req.body && (req.body.visible === true || req.body.visible === 1));
  if (perfilId === null || !cat) return error400(res, 'Perfil o lista no válidos');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      if (!await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      await t.request().input('perfil', sql.Int, perfilId).input('catalogo', sql.VarChar(50), catalogo)
        .input('visible', sql.Bit, visible ? 1 : 0).query(`
          delete from dbo.CFG_PERFIL_OPCION where perfil_id = @perfil and catalogo = @catalogo;
          insert into dbo.CFG_PERFIL_OPCION (perfil_id, catalogo, opcion_id, visible)
          select @perfil, @catalogo, id, @visible from dbo.${cat.tabla};`);
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_OPCION', perfilId + '/' + catalogo, 'CAMBIO', null, { todo: visible });
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* GET /cfg/admin/perfil/:id/tejidos/:producto */
async function admin_tejidos(req, res) {
  const perfilId = entero(req.params.id);
  const producto = String(req.params.producto || '').toUpperCase();
  if (perfilId === null || !TEJIDOS_PRODUCTO[producto]) return error400(res, 'Perfil o producto no válidos');
  try {
    const pool = await sql.connect();
    const perfil = await perfilPorId(pool, perfilId);
    if (!perfil) return res.status(404).send({ message: 'El perfil no existe' });
    const filas = (await pool.request().query(`
      select m.idrow as id, m.cod_solupyme, m.nombre, m.color, m.criterio, m.grupo, t.descripcion as tipo
      from dbo.SOL_TEJIDOS_MAESTRO m
      left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
      where m.activo = 1 and m.idrow in (${TEJIDOS_PRODUCTO[producto]})
      order by t.descripcion, m.nombre, m.color, m.criterio`)).recordset;
    const pt = (await pool.request().input('perfil', sql.Int, perfilId).input('producto', sql.VarChar(5), producto)
      .query(`select tejido, visible, ancho_min, ancho_max, alto_min, alto_max from dbo.CFG_PERFIL_TEJIDO
              where perfil_id = @perfil and producto = @producto`)).recordset;
    const ptMap = new Map(pt.map(x => [x.tejido, x]));
    const txt = await textosPerfil(pool, perfilId, 'TEJIDO', ['NOMBRE', 'COLOR']);
    const porDefecto = perfil.politica_novedades === 'MOSTRAR';
    res.status(200).send({
      politica: perfil.politica_novedades,
      filas: filas.map(f => {
        const p = ptMap.get(f.id);
        return Object.assign(f, {
          visible_perfil: p ? p.visible === true : null,
          visible: p ? p.visible === true : porDefecto,
          ancho_min: p ? p.ancho_min : null, ancho_max: p ? p.ancho_max : null,
          alto_min: p ? p.alto_min : null, alto_max: p ? p.alto_max : null,
          nombre_es: txt['NOMBRE|' + f.id + '|ES'] || '', nombre_pt: txt['NOMBRE|' + f.id + '|PT'] || '',
          color_es: txt['COLOR|' + f.id + '|ES'] || '', color_pt: txt['COLOR|' + f.id + '|PT'] || ''
        });
      })
    });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/tejidos/:producto */
async function admin_guardar_tejidos(req, res) {
  const perfilId = entero(req.params.id);
  const producto = String(req.params.producto || '').toUpperCase();
  const cambios = req.body && Array.isArray(req.body.cambios) ? req.body.cambios : [];
  if (perfilId === null || !TEJIDOS_PRODUCTO[producto]) return error400(res, 'Perfil o producto no válidos');
  if (!cambios.length) return error400(res, 'No hay cambios');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      const perfil = await perfilPorId(t, perfilId);
      if (!perfil) throw validacion('El perfil no existe');
      const porDefecto = perfil.politica_novedades === 'MOSTRAR';
      for (const c of cambios) {
        const tejido = entero(c.tejido);
        if (tejido === null) throw validacion('Tejido no válido');
        const incl = await t.request().input('tejido', sql.Int, tejido)
          .query(`select 1 as ok where @tejido in (${TEJIDOS_PRODUCTO[producto]})`);
        if (!incl.recordset.length) throw validacion('El tejido ' + tejido + ' no está incluido en el producto');
        const medidas = ['ancho_min', 'ancho_max', 'alto_min', 'alto_max'];
        const tocaFila = c.visible !== undefined || medidas.some(k => c[k] !== undefined);
        if (tocaFila) {
          const actual = (await t.request().input('perfil', sql.Int, perfilId).input('producto', sql.VarChar(5), producto)
            .input('tejido', sql.Int, tejido).query(`select visible, ancho_min, ancho_max, alto_min, alto_max from dbo.CFG_PERFIL_TEJIDO
              where perfil_id = @perfil and producto = @producto and tejido = @tejido`)).recordset[0];
          const v = c.visible !== undefined ? (c.visible === true || c.visible === 1) : (actual ? actual.visible === true : porDefecto);
          const m = {};
          medidas.forEach(k => { m[k] = c[k] !== undefined ? medidaNull(c[k]) : (actual ? actual[k] : null); });
          if (m.ancho_min !== null && m.ancho_max !== null && m.ancho_min > m.ancho_max) throw validacion('El ancho mínimo no puede ser mayor que el máximo');
          if (m.alto_min !== null && m.alto_max !== null && m.alto_min > m.alto_max) throw validacion('El alto mínimo no puede ser mayor que el máximo');
          const r = t.request().input('perfil', sql.Int, perfilId).input('producto', sql.VarChar(5), producto)
            .input('tejido', sql.Int, tejido).input('visible', sql.Bit, v ? 1 : 0);
          medidas.forEach(k => r.input(k, sql.Decimal(10, 2), m[k]));
          await r.query(`
            if exists (select 1 from dbo.CFG_PERFIL_TEJIDO where perfil_id = @perfil and producto = @producto and tejido = @tejido)
              update dbo.CFG_PERFIL_TEJIDO set visible = @visible, ancho_min = @ancho_min, ancho_max = @ancho_max,
                     alto_min = @alto_min, alto_max = @alto_max
              where perfil_id = @perfil and producto = @producto and tejido = @tejido
            else
              insert into dbo.CFG_PERFIL_TEJIDO (perfil_id, producto, tejido, visible, ancho_min, ancho_max, alto_min, alto_max)
              values (@perfil, @producto, @tejido, @visible, @ancho_min, @ancho_max, @alto_min, @alto_max)`);
        }
        if (c.nombre !== undefined) await guardarTexto(t, perfilId, 'TEJIDO', 'NOMBRE', tejido, 'ES', c.nombre);
        if (c.nombre_pt !== undefined) await guardarTexto(t, perfilId, 'TEJIDO', 'NOMBRE', tejido, 'PT', c.nombre_pt);
        if (c.color !== undefined) await guardarTexto(t, perfilId, 'TEJIDO', 'COLOR', tejido, 'ES', c.color);
        if (c.color_pt !== undefined) await guardarTexto(t, perfilId, 'TEJIDO', 'COLOR', tejido, 'PT', c.color_pt);
      }
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_TEJIDO', perfilId + '/' + producto, 'CAMBIO', null, cambios);
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/tejidos/:producto/todo — conserva las medidas de las filas que ya existen */
async function admin_tejidos_todo(req, res) {
  const perfilId = entero(req.params.id);
  const producto = String(req.params.producto || '').toUpperCase();
  const visible = !!(req.body && (req.body.visible === true || req.body.visible === 1));
  if (perfilId === null || !TEJIDOS_PRODUCTO[producto]) return error400(res, 'Perfil o producto no válidos');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      if (!await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      await t.request().input('perfil', sql.Int, perfilId).input('producto', sql.VarChar(5), producto)
        .input('visible', sql.Bit, visible ? 1 : 0).query(`
          update dbo.CFG_PERFIL_TEJIDO set visible = @visible where perfil_id = @perfil and producto = @producto;
          insert into dbo.CFG_PERFIL_TEJIDO (perfil_id, producto, tejido, visible)
          select @perfil, @producto, i.tejido, @visible from (${TEJIDOS_PRODUCTO[producto]}) i
          where not exists (select 1 from dbo.CFG_PERFIL_TEJIDO x where x.perfil_id = @perfil and x.producto = @producto and x.tejido = i.tejido);`);
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_TEJIDO', perfilId + '/' + producto, 'CAMBIO', null, { todo: visible });
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/perfil/:id/copiar_surtido — reemplaza el surtido (opciones, tejidos y sus textos) por el de otro perfil */
async function admin_copiar_surtido(req, res) {
  const perfilId = entero(req.params.id);
  const origen = entero(req.body && req.body.origen);
  if (perfilId === null || origen === null) return error400(res, 'Perfil no válido');
  if (perfilId === origen) return error400(res, 'El perfil de origen es el mismo');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      const o = await perfilPorId(t, origen);
      if (!o || !await perfilPorId(t, perfilId)) throw validacion('El perfil no existe');
      await t.request().input('perfil', sql.Int, perfilId).input('origen', sql.Int, origen).query(`
        delete from dbo.CFG_PERFIL_OPCION where perfil_id = @perfil;
        delete from dbo.CFG_PERFIL_TEJIDO where perfil_id = @perfil;
        delete from dbo.CFG_TEXTO where perfil_id = @perfil and ambito in ('OPCION', 'TEJIDO');
        insert into dbo.CFG_PERFIL_OPCION (perfil_id, catalogo, opcion_id, visible)
          select @perfil, catalogo, opcion_id, visible from dbo.CFG_PERFIL_OPCION where perfil_id = @origen;
        insert into dbo.CFG_PERFIL_TEJIDO (perfil_id, producto, tejido, visible, ancho_min, ancho_max, alto_min, alto_max)
          select @perfil, producto, tejido, visible, ancho_min, ancho_max, alto_min, alto_max from dbo.CFG_PERFIL_TEJIDO where perfil_id = @origen;
        insert into dbo.CFG_TEXTO (perfil_id, ambito, catalogo, clave, idioma, texto)
          select @perfil, ambito, catalogo, clave, idioma, texto from dbo.CFG_TEXTO where perfil_id = @origen and ambito in ('OPCION', 'TEJIDO');`);
      await auditar(t, usuarioDe(req), 'CFG_PERFIL_OPCION', perfilId, 'CAMBIO', null, { copiado_de: o.codigo });
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

/* GET /cfg/admin/perfil/:id/avisos — productos visibles con motor nuevo que se quedarían sin tejidos */
async function admin_avisos(req, res) {
  const perfilId = entero(req.params.id);
  if (perfilId === null) return error400(res, 'Perfil no válido');
  try {
    const pool = await sql.connect();
    const productos = (await pool.request().input('perfil', sql.Int, perfilId).query(`
      select tipo_producto from dbo.CFG_PERFIL_PRODUCTO where perfil_id = @perfil and visible = 1 and motor = 'NUEVO'`)).recordset
      .map(p => p.tipo_producto);
    const avisos = [];
    for (const producto of Object.keys(TIPO_DE_PRODUCTO)) {
      if (!productos.includes(TIPO_DE_PRODUCTO[producto])) continue;
      const r = await pool.request().input('perfil', sql.Int, perfilId).input('producto', sql.VarChar(5), producto).query(`
        select count(*) as n from (${TEJIDOS_PRODUCTO[producto]}) i
        join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = i.tejido and m.activo = 1
        where dbo.fn_cfg_tejido_visible(@perfil, @producto, i.tejido) = 1`);
      if (r.recordset[0].n === 0) avisos.push({ producto, tipo: TIPO_DE_PRODUCTO[producto], mensaje: 'No tiene ningún tejido visible' });
    }
    res.status(200).send(avisos);
  } catch (err) { responderError(res, err); }
}

/* GET /cfg/admin/cliente/:cliente/codigos */
async function admin_codigos(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return error400(res, 'Cliente no válido');
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('cliente', sql.Int, cliente)
      .query('select ambito, catalogo, clave, codigo from dbo.CFG_CLIENTE_CODIGO where cliente = @cliente order by ambito, catalogo, clave');
    res.status(200).send(r.recordset);
  } catch (err) { responderError(res, err); }
}

/* POST /cfg/admin/cliente/:cliente/codigos */
async function admin_guardar_codigos(req, res) {
  const cliente = entero(req.params.cliente);
  const cambios = req.body && Array.isArray(req.body.cambios) ? req.body.cambios : [];
  if (cliente === null) return error400(res, 'Cliente no válido');
  if (!cambios.length) return error400(res, 'No hay cambios');
  try {
    const pool = await sql.connect();
    await enTransaccion(pool, async (t) => {
      const c0 = await t.request().input('cliente', sql.Int, cliente).query('select 1 as ok from dbo.SOL_CLIENTES where idrow = @cliente');
      if (!c0.recordset.length) throw validacion('El cliente no existe');
      for (const c of cambios) {
        const ambito = c.ambito === 'OPCION' || c.ambito === 'TEJIDO' ? c.ambito : null;
        const catalogo = texto(c.catalogo, 50);
        const clave = entero(c.clave);
        if (!ambito || !catalogo || clave === null) throw validacion('Código no válido');
        if (ambito === 'OPCION' && !catalogoValido(catalogo)) throw validacion('Lista no válida: ' + catalogo);
        if (ambito === 'TEJIDO' && !TEJIDOS_PRODUCTO[catalogo]) throw validacion('Producto no válido: ' + catalogo);
        const codigo = texto(c.codigo, 50);
        await t.request().input('cliente', sql.Int, cliente).input('ambito', sql.VarChar(10), ambito)
          .input('catalogo', sql.VarChar(50), catalogo).input('clave', sql.VarChar(50), String(clave))
          .input('codigo', sql.VarChar(50), codigo || null).query(`
            delete from dbo.CFG_CLIENTE_CODIGO where cliente = @cliente and ambito = @ambito and catalogo = @catalogo and clave = @clave;
            if @codigo is not null
              insert into dbo.CFG_CLIENTE_CODIGO (cliente, ambito, catalogo, clave, codigo) values (@cliente, @ambito, @catalogo, @clave, @codigo);`);
      }
      await auditar(t, usuarioDe(req), 'CFG_CLIENTE_CODIGO', cliente, 'CAMBIO', null, cambios);
    });
    res.status(200).send({ message: 'OK' });
  } catch (err) { responderError(res, err); }
}

module.exports = {
  perfil,
  admin_opciones,
  admin_guardar_opciones,
  admin_opciones_todo,
  admin_tejidos,
  admin_guardar_tejidos,
  admin_tejidos_todo,
  admin_copiar_surtido,
  admin_avisos,
  admin_codigos,
  admin_guardar_codigos,
  admin_perfiles,
  admin_clientes,
  admin_perfil,
  admin_vista,
  admin_guardar_perfil,
  admin_duplicar,
  admin_cliente_perfil,
  admin_producto,
  admin_documento,
  admin_borrar_documento,
  admin_parametro
};
