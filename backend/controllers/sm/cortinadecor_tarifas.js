'use strict'

const sql = require('mssql');
const motor = require('./cortinadecor_precios');

/*
 * Panel Cortinadecor > Tarifas (routes/cdeco/cd_tarifas, permiso cdeco_tarifas).
 *
 *   Tablas      : SOL_CD_TARIFAS_REGLAS, Referencia + color -> tabla de la tarifa (hoja opcional).
 *                 Se muestran las referencias y colores recibidos con la tabla que se les aplica hoy
 *                 (motor.resolverTabla: reglas y, si no hay, automática por tejido del diccionario + ASIA).
 *   Incrementos : SOL_CD_INCREMENTOS_REGLAS (condición -> artículo o importe x cantidad) y
 *                 SOL_CD_INCREMENTOS_ARTICULOS (artículos con precio).
 */

const MODOS_COLOR = ['TODOS', 'IGUAL', 'CONTIENE'];
const MESES_POR_DEFECTO = 6;

function texto(valor, max) {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/\s+/g, ' ').trim().substring(0, max);
}

function usuario(req) {
  return texto(req.user && (req.user.email || req.user.name), 100) || null;
}

function fechaDesde(valor) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(valor || ''))) return String(valor);
  const d = new Date();
  d.setMonth(d.getMonth() - MESES_POR_DEFECTO);
  return d.toISOString().substring(0, 10);
}

const hoy = () => new Date().toISOString().substring(0, 10);

function error(res, donde, e) {
  console.log(donde + ': ' + (e && e.message));
  res.status(500).send({ message: (e && e.message) || 'Error' });
}

/* ---------- Referencias y colores recibidos, con la tabla que se aplica ---------- */

async function analizar(pool, desde) {
  const ref = await motor.cargarReferencia(pool);
  const r = await pool.request().input('desde', sql.Date, desde).query(`
    select l.name, l.color, l._tejido, t.descripcion as tejido, l._producto, sis.value as sistema, lama.value as lama,
           count(*) as lineas, max(try_convert(date, h.date)) as ultima
      from SOL_CORTINADECOR_LINES l
     inner join SOL_CORTINADECOR_HEADER h on h.idrow = l.idrow
      left join SOL_ARTICULOS_TEJIDOS t on t.idrow = l._tejido
     outer apply (select top 1 a.value from SOL_CORTINADECOR_LINES_ATTRIBUTES a where a.id = l.id and a.atributte = 'SISTEMA') sis
     outer apply (select top 1 a.value from SOL_CORTINADECOR_LINES_ATTRIBUTES a where a.id = l.id and a.atributte = 'ANCHO DE LAMA') lama
     where try_convert(date, h.date) >= @desde
     group by l.name, l.color, l._tejido, t.descripcion, l._producto, sis.value, lama.value`);

  const N = motor.normalizar;
  const fecha = hoy();
  const referencias = new Map();
  const dameReferencia = (nombre) => {
    const k = N(nombre);
    if (!referencias.has(k)) referencias.set(k, { clave: k, nombres: {}, lineas: 0, ultima: null, colores: new Map() });
    return referencias.get(k);
  };

  for (const fila of r.recordset) {
    const referencia = dameReferencia(fila.name);
    referencia.nombres[fila.name] = (referencia.nombres[fila.name] || 0) + fila.lineas;
    referencia.lineas += fila.lineas;
    const ultima = fila.ultima ? fila.ultima.toISOString().substring(0, 10) : null;
    if (ultima && (!referencia.ultima || ultima > referencia.ultima)) referencia.ultima = ultima;

    const kc = N(fila.color);
    if (!referencia.colores.has(kc)) referencia.colores.set(kc, { color: fila.color || '', lineas: 0, ultima: null, resoluciones: new Map() });
    const color = referencia.colores.get(kc);
    color.lineas += fila.lineas;
    if (ultima && (!color.ultima || ultima > color.ultima)) color.ultima = ultima;

    const atributos = [];
    if (fila.sistema) atributos.push({ nombre: 'SISTEMA', valor: N(fila.sistema), valor2: '' });
    if (fila.lama) atributos.push({ nombre: 'ANCHO DE LAMA', valor: N(fila.lama), valor2: '' });
    const h = motor.hojaDeLinea(atributos, ref);
    const sol = motor.resolverTabla({
      referencia: fila.name, color: fila.color, _tejido: fila._tejido, tejido: fila.tejido,
      _producto: fila._producto, hoja: h.hoja, motivoHoja: h.motivo
    }, ref, fecha);

    const clave = [h.sistema || '', h.lama || '', sol.tarifa ? sol.tarifa.id : sol.estado + '|' + sol.motivo].join('|');
    if (!color.resoluciones.has(clave)) {
      color.resoluciones.set(clave, {
        sistema: h.sistema || null, lama: h.lama || null, hoja: sol.hoja || h.hoja || null,
        idtarifa: sol.tarifa ? sol.tarifa.id : null, clave: sol.tarifa ? sol.tarifa.clave : null,
        tabla: sol.tarifa ? sol.tarifa.titulo : null, origen: sol.origen || null, regla: sol.regla || null,
        estado: sol.tarifa ? 'OK' : sol.estado, motivo: sol.motivo || null, avisos: sol.avisos, tejido: fila.tejido || null, lineas: 0
      });
    }
    color.resoluciones.get(clave).lineas += fila.lineas;
  }

  /* Referencias que solo están en las reglas (dadas de alta a mano, aún sin pedidos) */
  ref.reglas.forEach(rg => dameReferencia(rg.referencia_texto).nombres[rg.referencia_texto] = dameReferencia(rg.referencia_texto).nombres[rg.referencia_texto] || 0);

  return [...referencias.values()].map(x => {
    const nombre = Object.entries(x.nombres).sort((a, b) => b[1] - a[1])[0][0];
    const colores = [...x.colores.values()].map(c => Object.assign(c, { resoluciones: [...c.resoluciones.values()].sort((a, b) => b.lineas - a.lineas) }))
      .sort((a, b) => b.lineas - a.lineas);
    const tablas = {};
    let sinTabla = 0, noValorable = 0, porRegla = 0;
    colores.forEach(c => c.resoluciones.forEach(s => {
      if (s.clave) tablas[s.clave] = (tablas[s.clave] || 0) + s.lineas;
      else if (s.estado === 'NO VALORABLE') noValorable += s.lineas;
      else sinTabla += s.lineas;
      if (s.origen === 'REGLA') porRegla += s.lineas;
    }));
    return {
      referencia: nombre, clave: x.clave, lineas: x.lineas, ultima: x.ultima, colores,
      tablas: Object.entries(tablas).map(([clave, lineas]) => ({ clave, lineas })).sort((a, b) => b.lineas - a.lineas),
      sin_tabla: sinTabla, no_valorable: noValorable, por_regla: porRegla,
      reglas: ref.reglas.filter(rg => rg.referencia === x.clave).length
    };
  }).sort((a, b) => b.lineas - a.lineas);
}

/* GET /api/sm/cd_tarifas/referencias?desde=AAAA-MM-DD : resumen por referencia (sin colores) */
async function referencias(req, res) {
  try {
    const pool = await sql.connect();
    const desde = fechaDesde(req.query.desde);
    const lista = await analizar(pool, desde);
    res.status(200).send({ desde, Table: lista.map(x => Object.assign({}, x, { colores: undefined, n_colores: x.colores.length })) });
  } catch (e) { error(res, 'cd_tarifas_referencias', e); }
}

/* GET /api/sm/cd_tarifas/referencia?nombre=...&desde=... : colores de una referencia y sus reglas */
async function referencia(req, res) {
  const nombre = texto(req.query.nombre, 255);
  if (!nombre) return res.status(400).send({ message: 'Indique la referencia' });
  try {
    const pool = await sql.connect();
    const desde = fechaDesde(req.query.desde);
    const lista = await analizar(pool, desde);
    const k = motor.normalizar(nombre);
    const x = lista.find(r => r.clave === k) || { referencia: nombre, clave: k, lineas: 0, colores: [], tablas: [] };
    const reglas = (await pool.request().query('select * from SOL_CD_TARIFAS_REGLAS order by referencia, color_modo, color')).recordset
      .filter(rg => motor.normalizar(rg.referencia) === k);
    res.status(200).send({ desde, referencia: x, reglas });
  } catch (e) { error(res, 'cd_tarifas_referencia', e); }
}

/* ---------- Tablas de la tarifa ---------- */

/* GET /api/sm/cd_tarifas/tablas : tablas vigentes (para elegir en las reglas) */
async function tablas(req, res) {
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('hoy', sql.Date, hoy()).query(`
      select idrow as id, hoja, clave, titulo, tipo from SOL_CD_TARIFAS
       where vigencia_desde <= @hoy and (vigencia_hasta is null or vigencia_hasta >= @hoy)
       order by hoja, clave`);
    const hojas = (await pool.request().query('select atributo, valor, hoja from SOL_CD_TARIFAS_HOJAS order by atributo, valor')).recordset;
    res.status(200).send({ Table: r.recordset, hojas });
  } catch (e) { error(res, 'cd_tarifas_tablas', e); }
}

/* GET /api/sm/cd_tarifas/tabla/:id : matriz completa de una tabla */
async function tabla(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!(id > 0)) return res.status(400).send({ message: 'Tabla no válida' });
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('id', sql.Int, id).query(`
      select idrow as id, hoja, clave, titulo, tipo, nombre_cd, nombre_nuestro, vigencia_desde, vigencia_hasta from SOL_CD_TARIFAS where idrow = @id;
      select ancho, alto, precio from SOL_CD_TARIFAS_PRECIOS where idtarifa = @id order by alto, ancho;`);
    if (!r.recordsets[0].length) return res.status(404).send({ message: 'La tabla no existe' });
    const celdas = r.recordsets[1];
    const anchos = [...new Set(celdas.map(c => Number(c.ancho)))].sort((a, b) => a - b);
    const altos = [...new Set(celdas.map(c => Number(c.alto)))].sort((a, b) => a - b);
    const mapa = new Map(celdas.map(c => [Number(c.ancho) + '|' + Number(c.alto), Number(c.precio)]));
    res.status(200).send({
      tabla: r.recordsets[0][0], anchos, altos,
      filas: altos.map(alto => ({ alto, precios: anchos.map(ancho => { const p = mapa.get(ancho + '|' + alto); return p === undefined ? null : p; }) }))
    });
  } catch (e) { error(res, 'cd_tarifas_tabla', e); }
}

/* ---------- Reglas Referencia + color -> tabla ---------- */

async function validarRegla(pool, body) {
  const regla = {
    idrow: parseInt(body.idrow, 10) || 0,
    referencia: texto(body.referencia, 255),
    color_modo: texto(body.color_modo, 10).toUpperCase() || 'TODOS',
    color: texto(body.color, 255),
    hoja: texto(body.hoja, 50) || null,
    clave: texto(body.clave, 100),
    activo: body.activo === false || body.activo === 0 || body.activo === '0' ? 0 : 1,
    nota: texto(body.nota, 255) || null
  };
  if (!regla.referencia) return { error: 'Indique la referencia' };
  if (!MODOS_COLOR.includes(regla.color_modo)) return { error: 'Condición de color no válida' };
  if (regla.color_modo === 'TODOS') regla.color = '';
  else if (!regla.color) return { error: 'Indique el color' };
  if (!regla.clave) return { error: 'Indique la tabla' };
  const r = await pool.request()
    .input('clave', sql.VarChar(100), regla.clave)
    .input('hoja', sql.VarChar(50), regla.hoja)
    .query('select count(*) n, sum(case when @hoja is null or hoja = @hoja then 1 else 0 end) en_hoja from SOL_CD_TARIFAS where clave = @clave');
  if (!r.recordset[0].n) return { error: 'La tabla ' + regla.clave + ' no existe en la tarifa' };
  if (!r.recordset[0].en_hoja) return { error: 'La hoja ' + regla.hoja + ' no tiene la tabla ' + regla.clave };
  return { regla };
}

/* POST /api/sm/cd_tarifas/reglas : alta (sin idrow) o modificación */
async function regla_guardar(req, res) {
  try {
    const pool = await sql.connect();
    const v = await validarRegla(pool, req.body || {});
    if (v.error) return res.status(400).send({ message: v.error });
    const rg = v.regla;
    const request = pool.request()
      .input('idrow', sql.Int, rg.idrow)
      .input('referencia', sql.VarChar(255), rg.referencia)
      .input('color_modo', sql.VarChar(10), rg.color_modo)
      .input('color', sql.VarChar(255), rg.color)
      .input('hoja', sql.VarChar(50), rg.hoja)
      .input('clave', sql.VarChar(100), rg.clave)
      .input('activo', sql.Bit, rg.activo)
      .input('nota', sql.VarChar(255), rg.nota)
      .input('usuario', sql.VarChar(100), usuario(req));
    const r = await request.query(rg.idrow
      ? `update SOL_CD_TARIFAS_REGLAS set referencia = @referencia, color_modo = @color_modo, color = @color, hoja = @hoja,
                clave = @clave, activo = @activo, nota = @nota, usuario = @usuario, fecha_modif = getdate()
          where idrow = @idrow;
         select @idrow as idrow, @@rowcount as n`
      : `insert into SOL_CD_TARIFAS_REGLAS (referencia, color_modo, color, hoja, clave, activo, nota, usuario)
         values (@referencia, @color_modo, @color, @hoja, @clave, @activo, @nota, @usuario);
         select cast(scope_identity() as int) as idrow, 1 as n`);
    if (!r.recordset[0].n) return res.status(404).send({ message: 'La regla no existe' });
    res.status(200).send({ message: 'OK', idrow: r.recordset[0].idrow });
  } catch (e) {
    if (e && (e.number === 2601 || e.number === 2627)) return res.status(409).send({ message: 'Ya hay una regla para esa referencia, color y hoja' });
    error(res, 'cd_tarifas_regla_guardar', e);
  }
}

/* DELETE /api/sm/cd_tarifas/reglas/:id */
async function regla_borrar(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!(id > 0)) return res.status(400).send({ message: 'Regla no válida' });
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('id', sql.Int, id).query('delete from SOL_CD_TARIFAS_REGLAS where idrow = @id; select @@rowcount n');
    if (!r.recordset[0].n) return res.status(404).send({ message: 'La regla no existe' });
    res.status(200).send({ message: 'OK' });
  } catch (e) { error(res, 'cd_tarifas_regla_borrar', e); }
}

/* ---------- Incrementos ---------- */

/* GET /api/sm/cd_tarifas/incrementos : reglas y artículos */
async function incrementos(req, res) {
  try {
    const pool = await sql.connect();
    const r = await pool.request().query(`
      select r.*, a.descripcion as articulo, a.precio as precio_articulo
        from SOL_CD_INCREMENTOS_REGLAS r left join SOL_CD_INCREMENTOS_ARTICULOS a on a.codigo = r.codigo
       order by r.idrow;
      select a.codigo, a.descripcion, a.precio, a.fichero, a.fecha_modif, a.usuario,
             (select count(*) from SOL_CD_INCREMENTOS_REGLAS r where r.codigo = a.codigo) as reglas
        from SOL_CD_INCREMENTOS_ARTICULOS a order by a.codigo;`);
    res.status(200).send({ reglas: r.recordsets[0], articulos: r.recordsets[1] });
  } catch (e) { error(res, 'cd_tarifas_incrementos', e); }
}

function numeroONulo(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? NaN : n;
}

/* POST /api/sm/cd_tarifas/incrementos/reglas : alta (sin idrow) o modificación */
async function incremento_guardar(req, res) {
  const b = req.body || {};
  const rg = {
    idrow: parseInt(b.idrow, 10) || 0,
    nombre: texto(b.nombre, 100),
    atributo: texto(b.atributo, 100).toUpperCase() || null,
    campo: texto(b.campo, 10).toUpperCase() || 'VALOR',
    modo: texto(b.modo, 10).toUpperCase() || 'IGUAL',
    valor: texto(b.valor, 255).toUpperCase() || null,
    producto: [1, 3].includes(parseInt(b.producto, 10)) ? parseInt(b.producto, 10) : null,
    codigo: texto(b.codigo, 20) || null,
    importe: numeroONulo(b.importe),
    cantidad_modo: texto(b.cantidad_modo, 10).toUpperCase() || 'FIJA',
    cantidad: numeroONulo(b.cantidad),
    divisor: numeroONulo(b.divisor),
    minimo: numeroONulo(b.minimo),
    activo: b.activo === false || b.activo === 0 || b.activo === '0' ? 0 : 1,
    nota: texto(b.nota, 255) || null
  };
  if (!rg.nombre) return res.status(400).send({ message: 'Indique el nombre del incremento' });
  if (!['VALOR', 'VALOR2'].includes(rg.campo) || !['IGUAL', 'CONTIENE'].includes(rg.modo)) return res.status(400).send({ message: 'Condición no válida' });
  if (rg.atributo && !rg.valor) return res.status(400).send({ message: 'Indique el valor del atributo' });
  if (!rg.atributo) rg.valor = null;
  if (rg.codigo) rg.importe = null;
  else if (rg.importe === null || isNaN(rg.importe)) return res.status(400).send({ message: 'Indique un artículo o un importe' });
  if (rg.cantidad_modo === 'FIJA') {
    if (rg.cantidad === null) rg.cantidad = 1;
    if (isNaN(rg.cantidad) || rg.cantidad <= 0) return res.status(400).send({ message: 'La cantidad debe ser mayor que 0' });
    rg.divisor = null; rg.minimo = null;
  } else if (rg.cantidad_modo === 'ANCHO') {
    if (!(rg.divisor > 0)) return res.status(400).send({ message: 'Indique el divisor del ancho (cm)' });
    if (rg.minimo !== null && (isNaN(rg.minimo) || rg.minimo < 0)) return res.status(400).send({ message: 'Mínimo no válido' });
    rg.cantidad = 1;
  } else {
    return res.status(400).send({ message: 'Tipo de cantidad no válido' });
  }

  try {
    const pool = await sql.connect();
    if (rg.codigo) {
      const a = await pool.request().input('codigo', sql.VarChar(20), rg.codigo).query('select count(*) n from SOL_CD_INCREMENTOS_ARTICULOS where codigo = @codigo');
      if (!a.recordset[0].n) return res.status(400).send({ message: 'El artículo ' + rg.codigo + ' no está en la lista de incrementos' });
    }
    const request = pool.request()
      .input('idrow', sql.Int, rg.idrow)
      .input('nombre', sql.VarChar(100), rg.nombre)
      .input('atributo', sql.VarChar(100), rg.atributo)
      .input('campo', sql.VarChar(10), rg.campo)
      .input('modo', sql.VarChar(10), rg.modo)
      .input('valor', sql.VarChar(255), rg.valor)
      .input('producto', sql.Int, rg.producto)
      .input('codigo', sql.VarChar(20), rg.codigo)
      .input('importe', sql.Decimal(12, 4), rg.importe)
      .input('cantidad_modo', sql.VarChar(10), rg.cantidad_modo)
      .input('cantidad', sql.Decimal(9, 3), rg.cantidad)
      .input('divisor', sql.Decimal(9, 3), rg.divisor)
      .input('minimo', sql.Decimal(9, 3), rg.minimo)
      .input('activo', sql.Bit, rg.activo)
      .input('nota', sql.VarChar(255), rg.nota)
      .input('usuario', sql.VarChar(100), usuario(req));
    const r = await request.query(rg.idrow
      ? `update SOL_CD_INCREMENTOS_REGLAS set nombre = @nombre, atributo = @atributo, campo = @campo, modo = @modo, valor = @valor,
                producto = @producto, codigo = @codigo, importe = @importe, cantidad_modo = @cantidad_modo, cantidad = @cantidad,
                divisor = @divisor, minimo = @minimo, activo = @activo, nota = @nota, usuario = @usuario, fecha_modif = getdate()
          where idrow = @idrow;
         select @idrow as idrow, @@rowcount as n`
      : `insert into SOL_CD_INCREMENTOS_REGLAS (nombre, atributo, campo, modo, valor, producto, codigo, importe, cantidad_modo, cantidad, divisor, minimo, activo, nota, usuario)
         values (@nombre, @atributo, @campo, @modo, @valor, @producto, @codigo, @importe, @cantidad_modo, @cantidad, @divisor, @minimo, @activo, @nota, @usuario);
         select cast(scope_identity() as int) as idrow, 1 as n`);
    if (!r.recordset[0].n) return res.status(404).send({ message: 'El incremento no existe' });
    res.status(200).send({ message: 'OK', idrow: r.recordset[0].idrow });
  } catch (e) { error(res, 'cd_tarifas_incremento_guardar', e); }
}

/* DELETE /api/sm/cd_tarifas/incrementos/reglas/:id */
async function incremento_borrar(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!(id > 0)) return res.status(400).send({ message: 'Incremento no válido' });
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('id', sql.Int, id).query('delete from SOL_CD_INCREMENTOS_REGLAS where idrow = @id; select @@rowcount n');
    if (!r.recordset[0].n) return res.status(404).send({ message: 'El incremento no existe' });
    res.status(200).send({ message: 'OK' });
  } catch (e) { error(res, 'cd_tarifas_incremento_borrar', e); }
}

/* POST /api/sm/cd_tarifas/incrementos/articulos : alta o modificación de un artículo (por código) */
async function articulo_guardar(req, res) {
  const b = req.body || {};
  const codigo = texto(b.codigo, 20);
  const descripcion = texto(b.descripcion, 255);
  const precio = numeroONulo(b.precio);
  if (!codigo) return res.status(400).send({ message: 'Indique el código' });
  if (!descripcion) return res.status(400).send({ message: 'Indique la descripción' });
  if (precio === null || isNaN(precio) || precio < 0) return res.status(400).send({ message: 'Precio no válido' });
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('codigo', sql.VarChar(20), codigo)
      .input('descripcion', sql.VarChar(255), descripcion)
      .input('precio', sql.Decimal(14, 6), precio)
      .input('usuario', sql.VarChar(100), usuario(req))
      .query(`update SOL_CD_INCREMENTOS_ARTICULOS set descripcion = @descripcion, precio = @precio, usuario = @usuario, fecha_modif = getdate()
               where codigo = @codigo;
              if @@rowcount = 0
                insert into SOL_CD_INCREMENTOS_ARTICULOS (codigo, descripcion, precio, usuario) values (@codigo, @descripcion, @precio, @usuario)`);
    res.status(200).send({ message: 'OK' });
  } catch (e) { error(res, 'cd_tarifas_articulo_guardar', e); }
}

/* DELETE /api/sm/cd_tarifas/incrementos/articulos/:codigo (solo si ningún incremento lo usa) */
async function articulo_borrar(req, res) {
  const codigo = texto(req.params.codigo, 20);
  if (!codigo) return res.status(400).send({ message: 'Artículo no válido' });
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('codigo', sql.VarChar(20), codigo).query(`
      if exists (select 1 from SOL_CD_INCREMENTOS_REGLAS where codigo = @codigo) select -1 as n
      else begin delete from SOL_CD_INCREMENTOS_ARTICULOS where codigo = @codigo; select @@rowcount as n end`);
    const n = r.recordset[0].n;
    if (n === -1) return res.status(409).send({ message: 'Hay incrementos que usan este artículo' });
    if (!n) return res.status(404).send({ message: 'El artículo no existe' });
    res.status(200).send({ message: 'OK' });
  } catch (e) { error(res, 'cd_tarifas_articulo_borrar', e); }
}

/* GET /api/sm/cd_tarifas/atributos?desde= : atributos recibidos y sus valores más frecuentes (ayuda para las condiciones) */
async function atributos(req, res) {
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('desde', sql.Date, fechaDesde(req.query.desde)).query(`
      select upper(a.atributte) as atributo, upper(isnull(a.value, '')) as valor, upper(isnull(a.value2, '')) as valor2, count(*) as n
        from SOL_CORTINADECOR_LINES_ATTRIBUTES a
       inner join SOL_CORTINADECOR_LINES l on l.id = a.id
       inner join SOL_CORTINADECOR_HEADER h on h.idrow = l.idrow
       where try_convert(date, h.date) >= @desde and isnull(a.atributte, '') <> ''
       group by upper(a.atributte), upper(isnull(a.value, '')), upper(isnull(a.value2, ''))`);
    const porAtributo = new Map();
    r.recordset.forEach(x => {
      if (!porAtributo.has(x.atributo)) porAtributo.set(x.atributo, { atributo: x.atributo, lineas: 0, valores: new Map(), valores2: new Map() });
      const a = porAtributo.get(x.atributo);
      a.lineas += x.n;
      if (x.valor) a.valores.set(x.valor, (a.valores.get(x.valor) || 0) + x.n);
      if (x.valor2) a.valores2.set(x.valor2, (a.valores2.get(x.valor2) || 0) + x.n);
    });
    const top = m => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50).map(([valor, lineas]) => ({ valor, lineas }));
    res.status(200).send({
      Table: [...porAtributo.values()].sort((a, b) => b.lineas - a.lineas)
        .map(a => ({ atributo: a.atributo, lineas: a.lineas, valores: top(a.valores), valores2: top(a.valores2) }))
    });
  } catch (e) { error(res, 'cd_tarifas_atributos', e); }
}

module.exports = {
  referencias,
  referencia,
  tablas,
  tabla,
  regla_guardar,
  regla_borrar,
  incrementos,
  incremento_guardar,
  incremento_borrar,
  articulo_guardar,
  articulo_borrar,
  atributos,
  analizar
};
