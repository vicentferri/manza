'use strict'

const sql = require('mssql');

/*
 * Revisión de precios de los pedidos de CortinaDecor (cliente 2). Solo informativa.
 *
 * Compara el `cost` de cada línea (SOL_CORTINADECOR_LINES, total de la línea) con la tarifa de CortinaDecor
 * cargada desde su Excel ("cortinadecor sql/importar_tarifa.js") y guarda el resultado en SOL_CD_REVISION.
 *
 *   Hoja    : SOL_CD_TARIFAS_HOJAS (ANCHO DE LAMA para verticales; si no, SISTEMA)
 *   Tabla   : 1) SOL_CD_TARIFAS_REGLAS (panel Cortinadecor > Tarifas: Referencia + color -> tabla, hoja opcional)
 *             2) automática: SOL_CD_TARIFAS_TEJIDOS (nuestro _tejido + ASIA -> clave)
 *             siempre dentro de la hoja y vigente en la fecha del pedido
 *   Celda   : SOL_CD_TARIFAS_PRECIOS, columnas = ancho y filas = alto (m), redondeo al escalón superior
 *   Increm. : SOL_CD_INCREMENTOS_REGLAS (condición sobre un atributo -> artículo de SOL_CD_INCREMENTOS_ARTICULOS o
 *             importe fijo, x cantidad fija o por ancho). Solo en cortinas enteras (líneas valoradas con tabla).
 *             Lo que no tiene regla no suma.
 *   Esperado: redondeo a céntimos de (celda + incrementos) x cantidad
 *
 * Estados:
 *   OK                     cuadra (diferencia de redondeo como mucho)
 *   DIFERENCIA             no cuadra
 *   SIN TARIFA             no hay hoja o tabla para la línea (sistema sin hoja, tejido sin tabla en esa hoja...)
 *   FUERA DE RANGO         la medida supera la tabla
 *   DICCIONARIO INCOMPLETO la línea no tiene nuestro tejido (falta en el diccionario de cdeco/cd_producto_v2)
 *   NO VALORABLE           producto o artículo sin tarifa por medida todavía (paneles, fotográficos, accesorios...)
 *
 * Se aplican estas reglas (cortinadecor sql/REGISTRO_CAMBIOS.md):
 *   - ASIA: el color que envían contiene "ASIA" (tejido oriental).
 *   - Productos valorados por ahora: 1 enrollable y 3 vertical.
 */

const PRODUCTOS_VALORADOS = [1, 3];
const TOLERANCIA = 0.02;      // € por unidad: diferencias de redondeo
const EPSILON = 1e-9;

/* ---------- Utilidades ---------- */

function normalizar(valor) {
  return String(valor == null ? '' : valor)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/�/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim();
}

function numero(valor) {
  if (valor === null || valor === undefined) return null;
  const n = parseFloat(String(valor).replace(',', '.'));
  return isNaN(n) ? null : n;
}

const redondear = n => Math.round((n + Number.EPSILON) * 100) / 100;

function fechaISO(valor) {
  if (!valor) return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  return isNaN(d) ? null : d.toISOString().substring(0, 10);
}

/* Primer valor de los atributos indicados (nombres normalizados) */
function atributo(atributos, nombres) {
  for (const n of nombres) {
    const a = atributos.find(x => x.nombre === n && x.valor !== '');
    if (a) return a.valor;
  }
  return null;
}

/* ---------- Datos de referencia ---------- */

async function cargarReferencia(pool) {
  const r = await pool.request().query(`
    select atributo, valor, hoja from SOL_CD_TARIFAS_HOJAS;
    select idtejido, asia, clave from SOL_CD_TARIFAS_TEJIDOS;
    select idrow, vigencia_desde, vigencia_hasta, hoja, titulo, clave, tipo from SOL_CD_TARIFAS where tipo = 'M';
    select p.idtarifa, p.ancho, p.alto, p.precio
      from SOL_CD_TARIFAS_PRECIOS p inner join SOL_CD_TARIFAS t on t.idrow = p.idtarifa
     where t.tipo = 'M';
    select idrow, nombre, atributo, campo, modo, valor, producto, codigo, importe, cantidad_modo, cantidad, divisor, minimo
      from SOL_CD_INCREMENTOS_REGLAS where activo = 1 order by idrow;
    select codigo, descripcion, precio from SOL_CD_INCREMENTOS_ARTICULOS;
    select idrow, referencia, color_modo, color, hoja, clave from SOL_CD_TARIFAS_REGLAS where activo = 1;
  `);
  const [hojas, tejidos, tarifas, precios, incrementos, articulos, reglas] = r.recordsets;

  const ref = {
    reglas: reglas.map(rg => ({
      id: rg.idrow, referencia: normalizar(rg.referencia), referencia_texto: rg.referencia,
      modo: normalizar(rg.color_modo), color: normalizar(rg.color), color_texto: rg.color,
      hoja: rg.hoja || null, clave: rg.clave
    })),
    hojas: new Map(hojas.map(h => [normalizar(h.atributo) + '|' + normalizar(h.valor), h.hoja])),
    tejidos: new Map(),
    tarifas: tarifas.map(t => ({
      id: t.idrow, hoja: t.hoja, titulo: t.titulo, clave: t.clave,
      desde: fechaISO(t.vigencia_desde), hasta: fechaISO(t.vigencia_hasta),
      anchos: [], altos: [], celdas: new Map()
    })),
    incrementos: incrementos.map(i => ({
      id: i.idrow, nombre: i.nombre, atributo: i.atributo ? normalizar(i.atributo) : null,
      campo: normalizar(i.campo), modo: normalizar(i.modo), valor: normalizar(i.valor),
      producto: i.producto || null, codigo: i.codigo || null, importe: i.importe == null ? null : Number(i.importe),
      cantidad_modo: normalizar(i.cantidad_modo), cantidad: Number(i.cantidad),
      divisor: i.divisor == null ? null : Number(i.divisor), minimo: i.minimo == null ? null : Number(i.minimo)
    })),
    articulos: new Map(articulos.map(a => [a.codigo, { descripcion: a.descripcion, precio: Number(a.precio) }]))
  };

  tejidos.forEach(t => {
    const k = t.idtejido + '|' + (t.asia ? 1 : 0);
    if (!ref.tejidos.has(k)) ref.tejidos.set(k, []);
    ref.tejidos.get(k).push(t.clave);
  });

  const porId = new Map(ref.tarifas.map(t => [t.id, t]));
  precios.forEach(p => {
    const t = porId.get(p.idtarifa);
    if (!t) return;
    const ancho = Number(p.ancho), alto = Number(p.alto);
    t.celdas.set(ancho + '|' + alto, Number(p.precio));
    if (!t.anchos.includes(ancho)) t.anchos.push(ancho);
    if (!t.altos.includes(alto)) t.altos.push(alto);
  });
  ref.tarifas.forEach(t => { t.anchos.sort((a, b) => a - b); t.altos.sort((a, b) => a - b); });

  return ref;
}

const vigente = (x, fecha) => (!fecha || !x.desde || x.desde <= fecha) && (!fecha || !x.hasta || x.hasta >= fecha);

/* ---------- Hoja y tabla ---------- */

/* Hoja por ANCHO DE LAMA (verticales) o SISTEMA */
function hojaDeLinea(atributos, ref) {
  const lama = atributo(atributos, ['ANCHO DE LAMA']);
  const sistema = atributo(atributos, ['SISTEMA']);
  const hoja = lama ? ref.hojas.get('ANCHO DE LAMA|' + normalizar(lama)) : ref.hojas.get('SISTEMA|' + normalizar(sistema));
  let motivo = null;
  if (!hoja) motivo = lama ? 'Ancho de lama "' + lama + '" sin hoja en la tarifa' : (sistema ? 'Sistema "' + sistema + '" sin hoja en la tarifa' : 'La línea no indica el sistema');
  return { hoja: hoja || null, sistema, lama, motivo };
}

const ORDEN_MODO = { IGUAL: 0, CONTIENE: 1, TODOS: 2 };
const MODO_TEXTO = { IGUAL: 'color', CONTIENE: 'color contiene', TODOS: 'cualquier color' };

function describirRegla(rg) {
  return rg.referencia_texto + ' + ' + MODO_TEXTO[rg.modo] + (rg.modo === 'TODOS' ? '' : ' "' + rg.color_texto + '"') +
    ' → ' + rg.clave + (rg.hoja ? ' (hoja ' + rg.hoja + ')' : '');
}

/* Reglas del panel que encajan con la referencia y el color, en orden de preferencia */
function reglasAplicables(referencia, color, ref) {
  const r = normalizar(referencia), c = normalizar(color);
  return ref.reglas
    .filter(rg => rg.referencia === r && (rg.modo === 'TODOS' || (rg.modo === 'IGUAL' && c === rg.color) || (rg.modo === 'CONTIENE' && c.includes(rg.color))))
    .sort((a, b) => (ORDEN_MODO[a.modo] - ORDEN_MODO[b.modo]) || (b.color.length - a.color.length) || ((b.hoja ? 1 : 0) - (a.hoja ? 1 : 0)));
}

/*
 * Tabla que hay que consultar para una línea.
 * entrada: { referencia, color, _tejido, tejido, _producto, hoja (por SISTEMA/lama), motivoHoja }
 * Devuelve { tarifa, hoja, origen (REGLA | AUTOMATICA | AUTOMATICA ASIA), regla (texto), avisos[] }
 *       o  { tarifa: null, estado, motivo, avisos[] }
 */
function resolverTabla(entrada, ref, fecha) {
  const avisos = [];
  const buscar = (hoja, claves) => ref.tarifas.find(t => t.hoja === hoja && claves.includes(t.clave) && vigente(t, fecha));
  const falla = (estado, motivo) => ({ tarifa: null, estado, motivo, avisos });

  /* 1. Reglas del panel.
   * Una regla con hoja solo vale para las líneas de esa hoja (las que traen ese SISTEMA o ancho de lama);
   * si la línea no indica sistema ni lama (paneles, etc.), la regla con hoja sí se aplica y fija la hoja. */
  const deLaReferencia = ref.reglas.some(rg => rg.referencia === normalizar(entrada.referencia));
  const otrasHojas = [];
  for (const rg of reglasAplicables(entrada.referencia, entrada.color, ref)) {
    if (rg.hoja && entrada.hoja && rg.hoja !== entrada.hoja) {
      if (!otrasHojas.includes(rg.hoja)) otrasHojas.push(rg.hoja);
      continue;
    }
    const hoja = rg.hoja || entrada.hoja;
    if (!hoja) {
      avisos.push('Regla «' + describirRegla(rg) + '»: ' + (entrada.motivoHoja || 'la línea no indica la hoja'));
      continue;
    }
    const tarifa = buscar(hoja, [rg.clave]);
    if (tarifa) return { tarifa, hoja, origen: 'REGLA', regla: describirRegla(rg), avisos };
    avisos.push('Regla «' + describirRegla(rg) + '»: la hoja ' + hoja + ' no tiene la tabla ' + rg.clave);
  }
  if (otrasHojas.length) {
    avisos.push('Hay reglas de esta referencia y color solo para ' + otrasHojas.join(', ') + '; la línea es de ' + entrada.hoja);
  }

  /* 2. Automática: tejido del diccionario + ASIA */
  if (!deLaReferencia && !PRODUCTOS_VALORADOS.includes(entrada._producto)) {
    return falla('NO VALORABLE', entrada._producto ? 'Producto ' + entrada._producto + ' aún no se valora' : 'Sin producto: accesorio o artículo sin tarifa por medida');
  }
  if (!entrada.hoja) return falla('SIN TARIFA', entrada.motivoHoja);
  if (!(entrada._tejido > 0)) {
    return falla('DICCIONARIO INCOMPLETO', 'La referencia no tiene nuestro tejido en el diccionario de CortinaDecor ni una regla en el panel de tarifas');
  }
  const tejido = entrada.tejido || String(entrada._tejido);
  const asia = /ASIA/i.test(entrada.color || '');
  const propias = ref.tejidos.get(entrada._tejido + '|0');
  const orientales = asia ? ref.tejidos.get(entrada._tejido + '|1') : null;

  if (orientales) {
    const tarifa = buscar(entrada.hoja, orientales);
    if (tarifa) {
      return { tarifa, hoja: entrada.hoja, origen: 'AUTOMATICA ASIA', tejido, avisos,
        regla: 'Tejido ' + tejido + ' (diccionario) + color ASIA → ' + tarifa.clave };
    }
    avisos.push('La hoja ' + entrada.hoja + ' no tiene tabla de ' + orientales.join(' / ') + ' (tejido oriental): se usa la de nuestro tejido');
  } else if (asia && propias) {
    avisos.push('Color ASIA sin tejido oriental equivalente: se usa la tabla de nuestro tejido');
  }
  if (!propias) return Object.assign(falla('SIN TARIFA', 'El tejido ' + tejido + ' no tiene tabla en la tarifa'), { tejido });
  const tarifa = buscar(entrada.hoja, propias);
  if (!tarifa) {
    return Object.assign(falla('SIN TARIFA', 'La hoja ' + entrada.hoja + ' no tiene tabla de ' + propias.join(' / ') + (fecha ? ' vigente el ' + fecha : '')), { tejido });
  }
  return { tarifa, hoja: entrada.hoja, origen: 'AUTOMATICA', tejido, avisos,
    regla: 'Tejido ' + tejido + ' (diccionario) → ' + tarifa.clave };
}

/* ---------- Revisión de una línea ---------- */

function revisarLinea(linea, ref) {
  const cantidad = linea.amount > 0 ? linea.amount : 1;
  const precioCD = linea.cost == null ? null : Number(linea.cost);
  const fecha = linea.fecha;
  const detalle = { referencia: linea.name, color: linea.color };
  const r = {
    id: linea.id, idrow: linea.idrow, estado: null, idtarifa: null, ancho_tarifa: null, alto_tarifa: null,
    precio_tarifa: null, suplementos: null, cantidad, esperado: null, precio_cd: precioCD, diferencia: null, detalle
  };
  const fin = (estado, motivo) => { r.estado = estado; if (motivo) detalle.motivo = motivo; return r; };

  /* Hoja por SISTEMA / ANCHO DE LAMA */
  const h = hojaDeLinea(linea.atributos, ref);
  detalle.sistema = h.sistema;
  if (h.lama) detalle.ancho_lama = h.lama;

  /* Tabla: reglas del panel (referencia + color) y, si no hay, asignación automática */
  const sol = resolverTabla({
    referencia: linea.name, color: linea.color, _tejido: linea._tejido, tejido: linea.tejido,
    _producto: linea._producto, hoja: h.hoja, motivoHoja: h.motivo
  }, ref, fecha);
  if (sol.avisos.length) detalle.avisos = sol.avisos;
  if (sol.tejido) detalle.tejido = sol.tejido;
  if (!sol.tarifa) return fin(sol.estado, sol.motivo);
  r.idtarifa = sol.tarifa.id;
  detalle.hoja = sol.hoja;
  detalle.tabla = sol.tarifa.titulo;
  detalle.clave = sol.tarifa.clave;
  detalle.origen = sol.origen;
  detalle.regla = sol.regla;
  const tarifa = sol.tarifa;

  /* Medidas (cm) -> celda (m) */
  const ancho = numero(atributo(linea.atributos, ['ANCHO', 'ANCHO CM', 'WIDTH']));
  const alto = numero(atributo(linea.atributos, ['ALTO', 'ALTO CM', 'HEIGHT']));
  detalle.ancho = ancho;
  detalle.alto = alto;
  if (!(ancho > 0) || !(alto > 0)) return fin('NO VALORABLE', 'La línea no trae ancho y alto');
  const columna = tarifa.anchos.find(a => a >= ancho / 100 - EPSILON);
  const fila = tarifa.altos.find(a => a >= alto / 100 - EPSILON);
  if (columna === undefined || fila === undefined) {
    return fin('FUERA DE RANGO', 'Máximo de la tabla: ' + tarifa.anchos[tarifa.anchos.length - 1] + ' x ' + tarifa.altos[tarifa.altos.length - 1] + ' m');
  }
  const precio = tarifa.celdas.get(columna + '|' + fila);
  if (precio === undefined) return fin('FUERA DE RANGO', 'La tabla no tiene precio para ' + columna + ' x ' + fila + ' m');
  r.ancho_tarifa = columna;
  r.alto_tarifa = fila;
  r.precio_tarifa = precio;

  /* Incrementos (es una cortina entera: se ha valorado con una tabla) */
  const producto = linea._producto || (/^VERTICALES/.test(sol.hoja) ? 3 : 1);
  const inc = calcularIncrementos(linea.atributos, producto, ancho, ref);
  r.suplementos = inc.total;
  if (inc.lista.length) detalle.incrementos = inc.lista;
  if (inc.avisos.length) detalle.avisos = (detalle.avisos || []).concat(inc.avisos);

  return comparar(r, precio + r.suplementos);
}

/*
 * Incrementos de una cortina: reglas activas cuya condición cumple la línea.
 * Devuelve { total (unitario), lista: [{ nombre, codigo, descripcion, cantidad, precio, importe, condicion }], avisos }
 */
function calcularIncrementos(atributos, producto, ancho, ref) {
  const lista = [], avisos = [];
  for (const rg of ref.incrementos) {
    if (rg.producto && rg.producto !== producto) continue;
    let condicion = null;
    if (rg.atributo) {
      const encaja = atributos.some(a => {
        if (a.nombre !== rg.atributo) return false;
        const v = rg.campo === 'VALOR2' ? a.valor2 : a.valor;
        return rg.modo === 'CONTIENE' ? v.includes(rg.valor) : v === rg.valor;
      });
      if (!encaja) continue;
      condicion = rg.atributo + (rg.campo === 'VALOR2' ? ' (valor 2)' : '') + (rg.modo === 'CONTIENE' ? ' contiene ' : ' = ') + rg.valor;
    }

    let cantidad = rg.cantidad;
    if (rg.cantidad_modo === 'ANCHO') {
      cantidad = Math.max(rg.minimo || 0, Math.ceil(ancho / rg.divisor - EPSILON));
      condicion = (condicion ? condicion + ' · ' : '') + 'ancho ' + ancho + ' / ' + rg.divisor + ' hacia arriba' + (rg.minimo ? ', mínimo ' + rg.minimo : '');
    }

    let precio = rg.importe, descripcion = null;
    if (rg.codigo) {
      const art = ref.articulos.get(rg.codigo);
      if (!art) {
        avisos.push('Incremento «' + rg.nombre + '»: el artículo ' + rg.codigo + ' no está en la lista de incrementos (no suma)');
        continue;
      }
      precio = art.precio;
      descripcion = art.descripcion;
    }
    lista.push({ nombre: rg.nombre, codigo: rg.codigo, descripcion, cantidad, precio, importe: precio * cantidad, condicion });
  }
  return { total: lista.reduce((t, i) => t + i.importe, 0), lista, avisos };
}

/* Esperado y estado a partir del precio unitario */
function comparar(r, unitario) {
  r.esperado = redondear(redondear(unitario) * r.cantidad);
  if (r.precio_cd === null) {
    r.estado = 'DIFERENCIA';
    r.detalle.motivo = 'La línea no trae precio';
    return r;
  }
  r.diferencia = redondear(r.precio_cd - r.esperado);
  const tolerancia = TOLERANCIA * r.cantidad + EPSILON;
  r.estado = Math.abs(r.diferencia) <= tolerancia ? 'OK' : 'DIFERENCIA';
  return r;
}

/* ---------- Carga de líneas y grabación ---------- */

/* filtro: { idrow } o { desde, hasta } (fechas AAAA-MM-DD del pedido) */
async function cargarLineas(pool, filtro) {
  const request = pool.request();
  let where;
  if (filtro.idrow) {
    request.input('idrow', sql.Int, filtro.idrow);
    where = 'h.idrow = @idrow';
  } else {
    request.input('desde', sql.Date, filtro.desde);
    request.input('hasta', sql.Date, filtro.hasta);
    where = 'try_convert(date, h.date) between @desde and @hasta';
  }
  const r = await request.query(`
    select l.id, l.idrow, l.name, l.color, l.amount, l.cost, l._producto, l._tejido, t.descripcion as tejido,
           try_convert(date, h.date) as fecha
      from SOL_CORTINADECOR_LINES l
     inner join SOL_CORTINADECOR_HEADER h on h.idrow = l.idrow
      left join SOL_ARTICULOS_TEJIDOS t on t.idrow = l._tejido
     where ${where};
    select a.id, a.atributte, a.value, a.value2
      from SOL_CORTINADECOR_LINES_ATTRIBUTES a
     inner join SOL_CORTINADECOR_LINES l on l.id = a.id
     inner join SOL_CORTINADECOR_HEADER h on h.idrow = l.idrow
     where ${where};
  `);
  const [lineas, atributos] = r.recordsets;
  const porLinea = new Map(lineas.map(l => [l.id, []]));
  atributos.forEach(a => {
    const lista = porLinea.get(a.id);
    if (lista) lista.push({ nombre: normalizar(a.atributte), valor: normalizar(a.value), valor2: normalizar(a.value2) });
  });
  return lineas.map(l => Object.assign(l, { fecha: fechaISO(l.fecha), atributos: porLinea.get(l.id) || [] }));
}

async function grabar(pool, resultados) {
  if (!resultados.length) return;
  const tabla = new sql.Table('SOL_CD_REVISION');
  tabla.create = false;
  tabla.columns.add('id', sql.Int, { nullable: false });
  tabla.columns.add('idrow', sql.Int, { nullable: false });
  tabla.columns.add('estado', sql.VarChar(30), { nullable: false });
  tabla.columns.add('idtarifa', sql.Int, { nullable: true });
  tabla.columns.add('ancho_tarifa', sql.Decimal(6, 2), { nullable: true });
  tabla.columns.add('alto_tarifa', sql.Decimal(6, 2), { nullable: true });
  tabla.columns.add('precio_tarifa', sql.Decimal(14, 6), { nullable: true });
  tabla.columns.add('suplementos', sql.Decimal(12, 4), { nullable: true });
  tabla.columns.add('cantidad', sql.Int, { nullable: true });
  tabla.columns.add('esperado', sql.Decimal(12, 2), { nullable: true });
  tabla.columns.add('precio_cd', sql.Decimal(12, 2), { nullable: true });
  tabla.columns.add('diferencia', sql.Decimal(12, 2), { nullable: true });
  tabla.columns.add('detalle', sql.NVarChar(sql.MAX), { nullable: true });
  tabla.columns.add('fecha_revision', sql.DateTime, { nullable: false });
  const ahora = new Date();
  resultados.forEach(x => tabla.rows.add(x.id, x.idrow, x.estado, x.idtarifa, x.ancho_tarifa, x.alto_tarifa, x.precio_tarifa,
    x.suplementos, x.cantidad, x.esperado, x.precio_cd, x.diferencia, JSON.stringify(x.detalle), ahora));

  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    /* Se revisan siempre pedidos completos: se sustituye la revisión anterior de esos pedidos
       (también la de líneas que ya no existan). Los idrow son enteros de la BD. */
    const pedidos = [...new Set(resultados.map(x => parseInt(x.idrow, 10)).filter(n => n > 0))];
    for (let i = 0; i < pedidos.length; i += 1000) {
      await new sql.Request(tx).query('delete from SOL_CD_REVISION where idrow in (' + pedidos.slice(i, i + 1000).join(',') + ')');
    }
    await new sql.Request(tx).bulk(tabla);
    await tx.commit();
  } catch (e) {
    try { await tx.rollback(); } catch (e2) { /* ya deshecha */ }
    throw e;
  }
}

/* Revisa las líneas del filtro, guarda el resultado y lo devuelve */
async function revisar(pool, filtro, opciones) {
  const ref = await cargarReferencia(pool);
  const lineas = await cargarLineas(pool, filtro);
  const resultados = lineas.map(l => revisarLinea(l, ref));
  if (!(opciones && opciones.sinGrabar)) await grabar(pool, resultados);
  return resultados;
}

function resumen(resultados) {
  const porEstado = {};
  resultados.forEach(r => {
    const e = porEstado[r.estado] || (porEstado[r.estado] = { lineas: 0, diferencia: 0 });
    e.lineas++;
    e.diferencia = redondear(e.diferencia + (r.diferencia || 0));
  });
  return { lineas: resultados.length, pedidos: new Set(resultados.map(r => r.idrow)).size, estados: porEstado };
}

/* ---------- Rejilla de pedidos de CortinaDecor (prebestell2) ---------- */

const MAX_DIAS_REJILLA = 400;   // no se revisan rangos mayores al cargar la rejilla (solo se muestra lo ya revisado)
let tablaRevisionExiste = false;

/* "11/3/2026" (en-US, como lo manda prebestell2) o "2026-11-03" -> "2026-11-03" */
function fechaRejilla(valor) {
  const t = String(valor || '').trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0');
  return null;
}

/*
 * Antes de listar los pedidos: revisa los del rango de fechas y devuelve las piezas de SQL para añadir a cada pedido
 * el resumen de su revisión. Devuelve null si las tablas de revisión no existen (la rejilla se carga como siempre).
 *   rev_estado : DIFERENCIA (alguna línea no cuadra) | REVISAR (alguna línea sin tarifa, fuera de rango o sin tejido)
 *                | OK | NO VALORABLE (ninguna línea se puede valorar) | null (sin revisar)
 *   rev_cd / rev_nuestro / rev_dif : totales de las líneas valoradas; rev_sin_valorar: líneas sin nuestro precio
 */
async function prepararRejilla(desde, hasta) {
  const pool = await sql.connect();
  if (!tablaRevisionExiste) {
    const r = await pool.request().query("select case when object_id('dbo.SOL_CD_REVISION', 'U') is null or object_id('dbo.SOL_CD_TARIFAS_REGLAS', 'U') is null or object_id('dbo.SOL_CD_INCREMENTOS_REGLAS', 'U') is null then 0 else 1 end as existe");
    if (!r.recordset[0].existe) return null;
    tablaRevisionExiste = true;
  }
  const d = fechaRejilla(desde), h = fechaRejilla(hasta);
  if (d && h && d <= h && (new Date(h) - new Date(d)) / 86400000 <= MAX_DIAS_REJILLA) {
    try {
      await revisar(pool, { desde: d, hasta: h });
    } catch (e) {
      console.log('cd_revision rejilla: ' + e.message);
    }
  }
  return {
    columnas: `, rev.rev_estado, rev.rev_cd, rev.rev_nuestro, rev.rev_dif, rev.rev_sin_valorar`,
    apply: `outer apply (
      select case when count(*) = 0 then null
                  when sum(case when r.estado = 'DIFERENCIA' then 1 else 0 end) > 0 then 'DIFERENCIA'
                  when sum(case when r.estado in ('SIN TARIFA', 'FUERA DE RANGO', 'DICCIONARIO INCOMPLETO') then 1 else 0 end) > 0 then 'REVISAR'
                  when sum(case when r.estado = 'OK' then 1 else 0 end) > 0 then 'OK'
                  else 'NO VALORABLE' end as rev_estado,
             sum(case when r.esperado is not null then r.precio_cd end) as rev_cd,
             sum(r.esperado) as rev_nuestro,
             sum(r.diferencia) as rev_dif,
             sum(case when r.esperado is null then 1 else 0 end) as rev_sin_valorar
        from SOL_CD_REVISION r where r.idrow = v.idrow) rev`
  };
}

/* ---------- Endpoints ---------- */

/* GET /api/sm/cd_revision/:idrow : revisa un pedido y devuelve sus líneas */
async function revision_pedido(req, res) {
  const idrow = parseInt(req.params.idrow, 10);
  if (!(idrow > 0)) return res.status(400).send({ message: 'Pedido no válido' });
  try {
    const pool = await sql.connect();
    const resultados = await revisar(pool, { idrow });
    res.status(200).send({ Table: resultados, resumen: resumen(resultados) });
  } catch (e) {
    console.log('cd_revision_pedido: ' + e.message);
    res.status(500).send({ message: e.message });
  }
}

/* POST /api/sm/cd_revision/lote { desde, hasta } : revisa los pedidos de esas fechas y devuelve el resumen */
async function revision_lote(req, res) {
  const desde = String((req.body && req.body.desde) || '');
  const hasta = String((req.body && req.body.hasta) || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta) || desde > hasta) {
    return res.status(400).send({ message: 'Indique desde y hasta (AAAA-MM-DD)' });
  }
  try {
    const pool = await sql.connect();
    const resultados = await revisar(pool, { desde, hasta });
    res.status(200).send({ resumen: resumen(resultados) });
  } catch (e) {
    console.log('cd_revision_lote: ' + e.message);
    res.status(500).send({ message: e.message });
  }
}

module.exports = {
  revision_pedido,
  revision_lote,
  prepararRejilla,
  /* para pruebas y procesos */
  revisar,
  revisarLinea,
  resolverTabla,
  hojaDeLinea,
  cargarReferencia,
  cargarLineas,
  resumen,
  normalizar
};
