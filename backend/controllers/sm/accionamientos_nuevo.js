'use strict'

const sql = require('mssql');

/*
 * Modelo nuevo de accionamientos (tablas SOL_ACC_*).
 * Pantalla: routes/setup/accionamientos-nuevo ("Productos", antes "Accionamientos nuevo")
 * Scripts:  C:\dev\sqlAccionamientos\ (01 tablas, 02 accionamientos fijos CADENA y MOTOR),
 *           prod/sqlSolarMini/01 (Solar Mini, catálogos mini_* y tejidos sin sistema)
 *           y prod/sqlCajonZip/01 (Cajón ZIP, catálogos y relaciones zip_*, tejidos sin sistema)
 *           y prod/sqlPanelJapones/01 (Panel japonés, catálogos pj_*, tejidos sin sistema)
 *
 * Las tablas y columnas salen solo de CATALOGOS y RELACIONES: el cliente manda la
 * clave del catálogo, nunca un nombre de tabla.
 */

/* Listas del Vertical: cuelgan del tipo de vertical y cada tipo tiene las suyas */
const POR_TIPO_VERTICAL = { padre: 'tipo_id', tablaPadre: 'SOL_ACC_VER_TIPO', codigoPorPadre: true, nombrePadre: true, copiable: true };

/* padre: columna FK; tablaPadre: catálogo del que cuelga;
   codigoPadre: código obligatorio del registro padre (TIPO_CADENA solo bajo CADENA...) */
const CATALOGOS = {
  accionamientos:      { tabla: 'SOL_ACC_ACCIONAMIENTO', protegidos: ['CADENA', 'MOTOR', 'SIN_CADENA'] },
  sistemas:            { tabla: 'SOL_ACC_SISTEMA' },
  colores_cadena:      { tabla: 'SOL_ACC_COLOR_CADENA' },
  /* Alturas de Aro cadena (script 34: son los antiguos tipos de aro), cada una con sus colores */
  alturas:             { tabla: 'SOL_ACC_ALTURA', valor: true },
  mandos:              { tabla: 'SOL_ACC_MANDO' },
  cargadores:          { tabla: 'SOL_ACC_CARGADOR' },
  baterias:            { tabla: 'SOL_ACC_BATERIA' },
  tipos_cadena:        { tabla: 'SOL_ACC_TIPO_CADENA', padre: 'accionamiento_id', tablaPadre: 'SOL_ACC_ACCIONAMIENTO', codigoPadre: 'CADENA',
                         protegidos: ['ARO_CADENA', 'CADENA_A_MEDIDA'] },
  tipos_motor:         { tabla: 'SOL_ACC_TIPO_MOTOR', padre: 'accionamiento_id', tablaPadre: 'SOL_ACC_ACCIONAMIENTO', codigoPadre: 'MOTOR' },
  modelos_motor:       { tabla: 'SOL_ACC_MODELO_MOTOR', padre: 'tipo_motor_id', tablaPadre: 'SOL_ACC_TIPO_MOTOR' },
  /* Soportes, tapas y contrapesos genéricos: cada sistema marca los suyos (contrapesos desde el script 37).
     Cada pieza tiene su propio catálogo de colores (script 07) */
  soportes:            { tabla: 'SOL_ACC_SOPORTE' },
  tapas:               { tabla: 'SOL_ACC_TAPA' },
  contrapesos:         { tabla: 'SOL_ACC_CONTRAPESO' },
  colores_soporte:     { tabla: 'SOL_ACC_COLOR_SOPORTE' },
  colores_tapa:        { tabla: 'SOL_ACC_COLOR_TAPA' },
  colores_contrapeso:  { tabla: 'SOL_ACC_COLOR_CONTRAPESO' },
  /* Solar Mini (sqlSolarMini/01): listas planas, sin relaciones entre ellas. Sin sistema: sus suplementos van
     por cliente y medida. JR y JC son los códigos del configurador de siempre */
  mini_junquillos:     { tabla: 'SOL_ACC_MINI_JUNQUILLO', sinSistema: true, protegidos: ['JR', 'JC'] },
  mini_colores_perfil: { tabla: 'SOL_ACC_MINI_COLOR_PERFIL', sinSistema: true },
  mini_colores_ral:    { tabla: 'SOL_ACC_MINI_COLOR_RAL', sinSistema: true },
  mini_colores_cadena: { tabla: 'SOL_ACC_MINI_COLOR_CADENA', sinSistema: true },
  mini_colores_tapa:   { tabla: 'SOL_ACC_MINI_COLOR_TAPA', sinSistema: true },
  /* Cajón ZIP (sqlCajonZip/01): producto propio, sin sistemas. La raíz es el modelo de cajón; sus soportes,
     salidas, tipos de motor, guías y colores se marcan en él (RELACIONES zip_*). Todo es propio del ZIP.
     El color lleva RAL y hex (extras); el lacado es una lista aislada, siempre disponible */
  zip_modelos_cajon:     { tabla: 'SOL_ACC_ZIP_MODELO_CAJON', sinSistema: true },
  zip_soportes:          { tabla: 'SOL_ACC_ZIP_SOPORTE', sinSistema: true },
  zip_posiciones_salida: { tabla: 'SOL_ACC_ZIP_POSICION_SALIDA', sinSistema: true },
  zip_tipos_motor:       { tabla: 'SOL_ACC_ZIP_TIPO_MOTOR', sinSistema: true },
  zip_modelos_motor:     { tabla: 'SOL_ACC_ZIP_MODELO_MOTOR', sinSistema: true, padre: 'tipo_motor_id', tablaPadre: 'SOL_ACC_ZIP_TIPO_MOTOR' },
  zip_mandos:            { tabla: 'SOL_ACC_ZIP_MANDO', sinSistema: true },
  zip_guias:             { tabla: 'SOL_ACC_ZIP_GUIA', sinSistema: true },
  zip_contrapesos:       { tabla: 'SOL_ACC_ZIP_CONTRAPESO', sinSistema: true },
  zip_colores:           { tabla: 'SOL_ACC_ZIP_COLOR', sinSistema: true,
                           extras: [{ columna: 'ral', max: 20 }, { columna: 'hex', max: 7, patron: /^#[0-9A-F]{6}$/, mayusculas: true,
                                      error: 'El color hex tiene que ser # y 6 cifras hexadecimales (p. ej. #FFFFFF)' }] },
  zip_lacados:           { tabla: 'SOL_ACC_ZIP_LACADO', sinSistema: true },
  /* Vertical (sqlVertical/01): producto propio, sin sistemas. La raíz es el tipo de vertical (fijo: NORMAL, INCLINADA,
     VIENA) y cada tipo tiene SUS PROPIAS listas (padre tipo_id; código y nombre únicos dentro del tipo: codigoPorPadre).
     fijo: no se dan de alta ni se borran registros (solo renombrar, ordenar, ocultar y suplementos).
     nombrePadre: en los suplementos el elemento se enseña con su tipo delante ("Viena · Derecha").
     copiable: se pueden copiar los registros de un tipo a otro (POST /acc/:catalogo/copiar) */
  ver_tipos:                 { tabla: 'SOL_ACC_VER_TIPO', sinSistema: true, fijo: true, grupoPropio: true, protegidos: ['NORMAL', 'INCLINADA', 'VIENA'] },
  ver_modalidades:           { tabla: 'SOL_ACC_VER_MODALIDAD', sinSistema: true, fijo: true, protegidos: ['COMPLETA', 'SOLO_MECANISMO', 'SOLO_TEJIDO'] },
  ver_anchos_lama:           { tabla: 'SOL_ACC_VER_ANCHO_LAMA', sinSistema: true, valor: true, positivo: true, unidad: 'mm', ...POR_TIPO_VERTICAL },
  ver_posiciones_mecanismo:  { tabla: 'SOL_ACC_VER_POSICION_MECANISMO', sinSistema: true, ...POR_TIPO_VERTICAL },
  ver_colores_riel:          { tabla: 'SOL_ACC_VER_COLOR_RIEL', sinSistema: true, ...POR_TIPO_VERTICAL },
  ver_accionamientos:        { tabla: 'SOL_ACC_VER_ACCIONAMIENTO', sinSistema: true, ...POR_TIPO_VERTICAL },
  ver_soportes:              { tabla: 'SOL_ACC_VER_SOPORTE', sinSistema: true, ...POR_TIPO_VERTICAL },
  ver_recogidas:             { tabla: 'SOL_ACC_VER_RECOGIDA', sinSistema: true, ...POR_TIPO_VERTICAL },
  /* Panel japonés (sqlPanelJapones/01): producto propio, sin sistemas ni tipos; listas planas y propias del panel.
     Modalidades fijas (COMPLETA, SOLO_RIEL, SOLO_TEJIDO); el número de vías es un valor entero (entero: true) */
  pj_modalidades:            { tabla: 'SOL_ACC_PJ_MODALIDAD', sinSistema: true, fijo: true, protegidos: ['COMPLETA', 'SOLO_RIEL', 'SOLO_TEJIDO'] },
  pj_vias:                   { tabla: 'SOL_ACC_PJ_VIAS', sinSistema: true, valor: true, positivo: true, entero: true, unidad: 'vías' },
  pj_colores_mecanismo:      { tabla: 'SOL_ACC_PJ_COLOR_MECANISMO', sinSistema: true },
  pj_posiciones_mando:       { tabla: 'SOL_ACC_PJ_POSICION_MANDO', sinSistema: true },
  pj_recogidas:              { tabla: 'SOL_ACC_PJ_RECOGIDA', sinSistema: true },
  pj_contrapesos:            { tabla: 'SOL_ACC_PJ_CONTRAPESO', sinSistema: true },
  pj_soportes:               { tabla: 'SOL_ACC_PJ_SOPORTE', sinSistema: true }
};

/* Relaciones N:M: origen = registro que se edita, destino = opciones que se marcan */
const RELACIONES = {
  accionamiento_sistema: { tabla: 'SOL_ACC_ACCIONAMIENTO_SISTEMA', origen: 'accionamiento_id', destino: 'sistema_id',
                           catOrigen: 'accionamientos', catDestino: 'sistemas' },
  tipo_cadena_color:     { tabla: 'SOL_ACC_TIPO_CADENA_COLOR', origen: 'tipo_cadena_id', destino: 'color_cadena_id',
                           catOrigen: 'tipos_cadena', catDestino: 'colores_cadena' },
  /* Aro cadena: colores que admite cada altura (script 34); Cadena a medida sigue con tipo_cadena_color */
  altura_color:          { tabla: 'SOL_ACC_ALTURA_COLOR', origen: 'altura_id', destino: 'color_cadena_id',
                           catOrigen: 'alturas', catDestino: 'colores_cadena' },
  modelo_motor_mando:    { tabla: 'SOL_ACC_MODELO_MOTOR_MANDO', origen: 'modelo_motor_id', destino: 'mando_id',
                           catOrigen: 'modelos_motor', catDestino: 'mandos' },
  modelo_motor_cargador: { tabla: 'SOL_ACC_MODELO_MOTOR_CARGADOR', origen: 'modelo_motor_id', destino: 'cargador_id',
                           catOrigen: 'modelos_motor', catDestino: 'cargadores' },
  modelo_motor_bateria:  { tabla: 'SOL_ACC_MODELO_MOTOR_BATERIA', origen: 'modelo_motor_id', destino: 'bateria_id',
                           catOrigen: 'modelos_motor', catDestino: 'baterias' },
  /* Desde el sistema se marcan sus soportes, sus tapas y sus contrapesos (script 37) */
  sistema_soporte:       { tabla: 'SOL_ACC_SOPORTE_SISTEMA', origen: 'sistema_id', destino: 'soporte_id',
                           catOrigen: 'sistemas', catDestino: 'soportes' },
  sistema_tapa:          { tabla: 'SOL_ACC_TAPA_SISTEMA', origen: 'sistema_id', destino: 'tapa_id',
                           catOrigen: 'sistemas', catDestino: 'tapas' },
  sistema_contrapeso:    { tabla: 'SOL_ACC_CONTRAPESO_SISTEMA', origen: 'sistema_id', destino: 'contrapeso_id',
                           catOrigen: 'sistemas', catDestino: 'contrapesos' },
  /* Colores que admite cada pieza */
  soporte_color:         { tabla: 'SOL_ACC_SOPORTE_COLOR', origen: 'soporte_id', destino: 'color_soporte_id',
                           catOrigen: 'soportes', catDestino: 'colores_soporte' },
  tapa_color:            { tabla: 'SOL_ACC_TAPA_COLOR', origen: 'tapa_id', destino: 'color_tapa_id',
                           catOrigen: 'tapas', catDestino: 'colores_tapa' },
  contrapeso_color:      { tabla: 'SOL_ACC_CONTRAPESO_COLOR', origen: 'contrapeso_id', destino: 'color_contrapeso_id',
                           catOrigen: 'contrapesos', catDestino: 'colores_contrapeso' },
  /* Cajón ZIP (sqlCajonZip/01): desde el modelo de cajón se marca lo que ofrece; guías y contrapesos con sus colores */
  zip_modelo_cajon_soporte:    { tabla: 'SOL_ACC_ZIP_MODELO_CAJON_SOPORTE', origen: 'modelo_cajon_id', destino: 'soporte_id',
                                 catOrigen: 'zip_modelos_cajon', catDestino: 'zip_soportes' },
  zip_modelo_cajon_salida:     { tabla: 'SOL_ACC_ZIP_MODELO_CAJON_POSICION_SALIDA', origen: 'modelo_cajon_id', destino: 'posicion_salida_id',
                                 catOrigen: 'zip_modelos_cajon', catDestino: 'zip_posiciones_salida' },
  zip_modelo_cajon_tipo_motor: { tabla: 'SOL_ACC_ZIP_MODELO_CAJON_TIPO_MOTOR', origen: 'modelo_cajon_id', destino: 'tipo_motor_id',
                                 catOrigen: 'zip_modelos_cajon', catDestino: 'zip_tipos_motor' },
  zip_modelo_cajon_guia:       { tabla: 'SOL_ACC_ZIP_MODELO_CAJON_GUIA', origen: 'modelo_cajon_id', destino: 'guia_id',
                                 catOrigen: 'zip_modelos_cajon', catDestino: 'zip_guias' },
  zip_modelo_cajon_color:      { tabla: 'SOL_ACC_ZIP_MODELO_CAJON_COLOR', origen: 'modelo_cajon_id', destino: 'color_id',
                                 catOrigen: 'zip_modelos_cajon', catDestino: 'zip_colores' },
  zip_modelo_motor_mando:      { tabla: 'SOL_ACC_ZIP_MODELO_MOTOR_MANDO', origen: 'modelo_motor_id', destino: 'mando_id',
                                 catOrigen: 'zip_modelos_motor', catDestino: 'zip_mandos' },
  zip_guia_contrapeso:         { tabla: 'SOL_ACC_ZIP_GUIA_CONTRAPESO', origen: 'guia_id', destino: 'contrapeso_id',
                                 catOrigen: 'zip_guias', catDestino: 'zip_contrapesos' },
  zip_guia_color:              { tabla: 'SOL_ACC_ZIP_GUIA_COLOR', origen: 'guia_id', destino: 'color_id',
                                 catOrigen: 'zip_guias', catDestino: 'zip_colores' },
  zip_contrapeso_color:        { tabla: 'SOL_ACC_ZIP_CONTRAPESO_COLOR', origen: 'contrapeso_id', destino: 'color_id',
                                 catOrigen: 'zip_contrapesos', catDestino: 'zip_colores' },
  /* Vertical (sqlVertical/01): modalidades de cada tipo (la Inclinada, solo la completa) */
  ver_tipo_modalidad:          { tabla: 'SOL_ACC_VER_TIPO_MODALIDAD', origen: 'tipo_id', destino: 'modalidad_id',
                                 catOrigen: 'ver_tipos', catDestino: 'ver_modalidades' }
};

/* El código se usará en las reglas de fabricación: mayúsculas, números y _ */
const CODIGO = /^[A-Z0-9_]+$/;
const TABLA_ACC = /^SOL_ACC_[A-Z_]+$/;
const TABLA_SOL = /^SOL_[A-Z0-9_]+$/;
const COLUMNA = /^[a-z_]+$/;

function texto(value, max) {
  if (value === null || value === undefined) return '';
  return String(value).trim().substring(0, max);
}

function entero(value) {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function decimal(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return isNaN(n) ? null : n;
}

/* "Aro cadena 1,5" → "ARO_CADENA_1_5" (misma regla que la pantalla para la vista previa) */
function codigoDesde(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 40);
}

function errorSql(err, res) {
  const numero = err && (err.number || (err.originalError && err.originalError.info && err.originalError.info.number));
  if (numero === 2627 || numero === 2601) {
    return res.status(400).send({ message: 'Ya existe un registro con ese nombre, código o valor' });
  }
  if (numero === 547) {
    return res.status(400).send({ message: 'No se puede borrar: hay registros que dependen de él. Ocúltelo en su lugar' });
  }
  console.error(err);
  return res.status(500).send({ message: 'KO' });
}

/* Tablas y columnas que apuntan a un catálogo (FK). Sale del propio esquema, así cualquier
   tabla nueva que cuelgue del catálogo cuenta como dependencia sin tocar este fichero */
const referenciasCache = {};
async function referencias(pool, tabla) {
  if (!referenciasCache[tabla]) {
    const result = await pool.request().input('tabla', sql.NVarChar(128), 'dbo.' + tabla).query(`
      select object_name(fkc.parent_object_id) as tabla, col_name(fkc.parent_object_id, fkc.parent_column_id) as columna
      from sys.foreign_key_columns fkc
      where fkc.referenced_object_id = object_id(@tabla)
        /* solo la columna que apunta al id (en una FK compuesta, como la de la tarifa del Vertical a
           (tipo_id, id) del ancho de lama, la de tipo_id no es una dependencia del registro) */
        and col_name(fkc.referenced_object_id, fkc.referenced_column_id) = 'id'`);
    const validas = result.recordset.filter(r => COLUMNA.test(r.columna));
    referenciasCache[tabla] = {
      internas: validas.filter(r => TABLA_ACC.test(r.tabla)),
      /* Fuera del catálogo: juegos de fabricación, tarifas, líneas de pedidos y presupuestos... */
      externas: validas.filter(r => !TABLA_ACC.test(r.tabla) && TABLA_SOL.test(r.tabla))
    };
  }
  return referenciasCache[tabla];
}

/* Cómo se llama en la pantalla cada tabla de fuera del catálogo que usa un registro */
function usoExterno(tabla, n) {
  const plural = n === 1 ? '' : 's';
  if (tabla === 'SOL_FABRICACION_SISTEMAS') return `${n} juego${plural} de fabricación (bórrelo en Reglas de fabricación)`;
  if (tabla === 'SOL_TARIFAS_SIMULATE') return `${n} línea${plural} de tarifa`;
  if (/^SOL_PEDIDOS_COLA_/.test(tabla)) return `${n} línea${plural} de pedido`;
  if (/^SOL_PRESUPUESTOS_COLA_/.test(tabla)) return `${n} línea${plural} de presupuesto`;
  return `${n} en ${tabla}`;
}

/* Código libre en la tabla a partir de una base: BASE, BASE_2, BASE_3...
   padre { columna, valor }: el código solo tiene que ser único dentro de su padre (listas del Vertical: la
   «Derecha» de la Normal y la de la Viena son DERECHA las dos) */
async function codigoLibre(pool, tabla, base, id, padre) {
  const request = pool.request()
    .input('base', sql.VarChar(50), base)
    .input('patron', sql.VarChar(60), base.replace(/_/g, '[_]') + '%')
    .input('id', sql.Int, id);
  let filtroPadre = '';
  if (padre) {
    request.input('padre', sql.Int, padre.valor);
    filtroPadre = ` and ${padre.columna} = @padre`;
  }
  const result = await request
    .query(`select codigo from dbo.${tabla} where (codigo = @base or codigo like @patron) and id <> @id${filtroPadre}`);
  const usados = new Set(result.recordset.map(r => r.codigo));
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}

/* ---------------- CATÁLOGOS ---------------- */

/* GET /acc/:catalogo?padre=id — con el número de registros que dependen de cada uno */
async function lista(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const padre = entero(req.query.padre);
  if (cat.padre && padre === null) return res.status(400).send({ message: 'Falta el registro padre' });
  try {
    const pool = await sql.connect();
    const refs = await referencias(pool, cat.tabla);
    const dependencias = refs.internas.length
      ? refs.internas.map(r => `(select count(*) from dbo.${r.tabla} d where d.${r.columna} = x.id)`).join(' + ')
      : '0';
    /* Una columna por tabla externa (uso_0, uso_1...): se convierten después en el texto de "uso_externo" */
    const externas = refs.externas
      .map((r, i) => `, (select count(*) from dbo.${r.tabla} d where d.${r.columna} = x.id) as uso_${i}`).join('');
    const request = pool.request().input('tabla', sql.VarChar(50), cat.tabla);
    let where = '';
    if (cat.padre) {
      request.input('padre', sql.Int, padre);
      where = `where x.${cat.padre} = @padre`;
    }
    /* suplementos: líneas de precio del elemento (script 16); suplemento_fijo: el importe general
       sin tramos, el que se edita directamente en la tabla */
    const result = await request.query(`
      select x.*, ${dependencias} as dependencias${externas},
             (select count(*) from dbo.SOL_ACC_SUPLEMENTO s where s.catalogo = @tabla and s.elemento_id = x.id) as suplementos,
             (select s.importe from dbo.SOL_ACC_SUPLEMENTO s where s.catalogo = @tabla and s.elemento_id = x.id
                and s.cliente is null and s.sistema_id is null and s.medida is null) as suplemento_fijo
      from dbo.${cat.tabla} x ${where}
      order by x.orden, ${cat.valor ? 'x.valor' : 'x.nombre'}`);
    const protegidos = cat.protegidos || [];
    const filas = result.recordset.map(r => {
      const usos = [];
      refs.externas.forEach((e, i) => {
        const n = r['uso_' + i];
        delete r['uso_' + i];
        if (n > 0) {
          usos.push(usoExterno(e.tabla, n));
          r.dependencias += n;
        }
      });
      return Object.assign(r, { protegido: protegidos.includes(r.codigo), uso_externo: usos.join(', ') });
    });
    res.status(200).send({ Table: filas });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/:catalogo — id > 0 modifica, si no da de alta.
   El código es opcional: si no llega se genera a partir del nombre (o del valor).
   No toca orden ni visibilidad (tienen sus propias rutas) ni nombre_pt (las traducciones van aparte) */
async function guardar(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const body = req.body || {};
  const id = entero(body.id) || 0;
  const nombre = texto(body.nombre, 100);
  const valor = decimal(body.valor);
  const padre = entero(body[cat.padre]);
  let codigo = texto(body.codigo, 50).toUpperCase();

  if (cat.fijo && id <= 0) return res.status(400).send({ message: 'Esta lista es fija: no se pueden añadir registros' });
  if (cat.valor && valor === null) return res.status(400).send({ message: 'El valor tiene que ser un número' });
  if (cat.positivo && valor <= 0) return res.status(400).send({ message: 'El valor tiene que ser mayor que 0' });
  if (cat.entero && valor !== Math.floor(valor)) return res.status(400).send({ message: 'El valor tiene que ser un número entero' });
  if (!cat.valor && !nombre) return res.status(400).send({ message: 'El nombre no puede estar vacío' });
  if (codigo && !CODIGO.test(codigo)) return res.status(400).send({ message: 'Código no válido: use letras, números o _' });

  /* Columnas propias del catálogo (el color del ZIP: RAL y hex), opcionales; vacías → NULL */
  const extras = [];
  for (const e of (cat.extras || [])) {
    let v = texto(body[e.columna], e.max);
    if (e.mayusculas) v = v.toUpperCase();
    if (v && e.patron && !e.patron.test(v)) return res.status(400).send({ message: e.error || `Valor no válido en ${e.columna}` });
    extras.push({ columna: e.columna, max: e.max, valor: v || null });
  }

  try {
    const pool = await sql.connect();

    let actual = null;
    if (id > 0) {
      const a = await pool.request().input('id', sql.Int, id).query(`select codigo from dbo.${cat.tabla} where id = @id`);
      actual = a.recordset[0];
      if (!actual) return res.status(404).send({ message: 'El registro no existe' });
      if ((cat.protegidos || []).includes(actual.codigo) && codigo && codigo !== actual.codigo) {
        return res.status(400).send({ message: `El código ${actual.codigo} es fijo: lo usa la pantalla y no se puede cambiar` });
      }
    }

    if (cat.padre && id <= 0) {
      if (padre === null) return res.status(400).send({ message: 'Falta el registro padre' });
      const p = await pool.request().input('padre', sql.Int, padre)
        .query(`select codigo from dbo.${cat.tablaPadre} where id = @padre`);
      if (!p.recordset[0]) return res.status(400).send({ message: 'El registro padre no existe' });
      if (cat.codigoPadre && p.recordset[0].codigo !== cat.codigoPadre) {
        return res.status(400).send({ message: `Solo se puede dar de alta bajo el registro de código ${cat.codigoPadre}` });
      }
    }

    if (!codigo) {
      if (actual) {
        codigo = actual.codigo;
      } else {
        const base = codigoDesde(nombre || (valor !== null ? String(valor) : ''));
        if (!base) return res.status(400).send({ message: 'No se puede generar el código: escriba uno en Avanzado' });
        codigo = await codigoLibre(pool, cat.tabla, base, id, cat.codigoPorPadre ? { columna: cat.padre, valor: padre } : null);
      }
    }

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('codigo', sql.VarChar(50), codigo)
      .input('nombre', sql.VarChar(100), nombre || null);
    const columnas = ['codigo', 'nombre'];
    if (cat.valor) {
      request.input('valor', sql.Decimal(10, 2), valor);
      columnas.push('valor');
    }
    extras.forEach(e => {
      request.input(e.columna, sql.VarChar(e.max), e.valor);
      columnas.push(e.columna);
    });

    let result;
    if (id > 0) {
      /* El padre no se cambia al modificar: el registro se queda donde se creó */
      result = await request.query(`
        update dbo.${cat.tabla} set ${columnas.map(c => `${c} = @${c}`).join(', ')} where id = @id;
        select @id as id, @codigo as codigo`);
    } else {
      /* Los nuevos van al final de su lista */
      const filtroPadre = cat.padre ? `where ${cat.padre} = @padre` : '';
      if (cat.padre) request.input('padre', sql.Int, padre);
      const insertar = (cat.padre ? [cat.padre] : []).concat(columnas, ['orden', 'activo']);
      const valores = (cat.padre ? ['@padre'] : []).concat(columnas.map(c => `@${c}`),
        [`(select isnull(max(orden), 0) + 1 from dbo.${cat.tabla} ${filtroPadre})`, '1']);
      result = await request.query(`
        insert into dbo.${cat.tabla} (${insertar.join(', ')}) values (${valores.join(', ')});
        select cast(scope_identity() as int) as id, @codigo as codigo`);
    }
    res.status(200).send({ message: 'OK', id: result.recordset[0].id, codigo: result.recordset[0].codigo });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/:catalogo/visible { id, activo } — mostrar u ocultar en el configurador */
async function visible(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const body = req.body || {};
  const id = entero(body.id);
  if (id === null) return res.status(400).send({ message: 'Falta el registro' });
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('activo', sql.Bit, body.activo ? 1 : 0)
      .query(`update dbo.${cat.tabla} set activo = @activo where id = @id; select @@rowcount as filas`);
    if (!result.recordset[0].filas) return res.status(404).send({ message: 'El registro no existe' });
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/:catalogo/orden { ids: [...] } — el orden de la lista es el de los ids */
async function orden(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const ids = ((req.body || {}).ids || []).map(entero).filter(n => n !== null);
  if (ids.length === 0) return res.status(400).send({ message: 'Faltan los registros' });

  let transaction;
  try {
    const pool = await sql.connect();
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    for (let i = 0; i < ids.length; i++) {
      await new sql.Request(transaction).input('id', sql.Int, ids[i]).input('orden', sql.Int, i + 1)
        .query(`update dbo.${cat.tabla} set orden = @orden where id = @id`);
    }
    await transaction.commit();
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* POST /acc/:catalogo/delete { id } — solo si nada depende de él (si no, ocultar) */
async function borrar(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const id = entero((req.body || {}).id);
  if (id === null) return res.status(400).send({ message: 'Falta el registro' });
  if (cat.fijo) return res.status(400).send({ message: 'Esta lista es fija: no se pueden borrar registros. Puede ocultarlo' });
  try {
    const pool = await sql.connect();
    if (cat.protegidos) {
      const a = await pool.request().input('id', sql.Int, id).query(`select codigo from dbo.${cat.tabla} where id = @id`);
      if (a.recordset[0] && cat.protegidos.includes(a.recordset[0].codigo)) {
        return res.status(400).send({ message: `${a.recordset[0].codigo} es fijo y no se puede borrar. Puede ocultarlo` });
      }
    }
    /* Los suplementos no tienen FK al elemento (script 16): se comprueba aquí */
    const s = await pool.request().input('id', sql.Int, id).input('tabla', sql.VarChar(50), cat.tabla)
      .query('select count(*) as n from dbo.SOL_ACC_SUPLEMENTO where catalogo = @tabla and elemento_id = @id');
    if (s.recordset[0].n > 0) {
      return res.status(400).send({ message: 'Tiene suplementos de precio: quítelos antes de borrarlo, u ocúltelo' });
    }
    await pool.request().input('id', sql.Int, id).query(`delete from dbo.${cat.tabla} where id = @id`);
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    errorSql(err, res);
  }
}

/* ---------------- RELACIONES N:M ---------------- */

/* GET /acc/rel/:relacion/:id — todas las opciones del destino, con marcado = 1/0 */
async function relacion(req, res) {
  const rel = RELACIONES[req.params.relacion];
  if (!rel) return res.status(400).send({ message: 'Relación no válida' });
  const id = entero(req.params.id);
  if (id === null) return res.status(400).send({ message: 'Falta el registro' });
  const destino = CATALOGOS[rel.catDestino];
  try {
    const pool = await sql.connect();
    /* Columnas propias del destino (RAL y hex del color del ZIP): la pantalla pinta una muestra del color */
    const extras = (destino.extras || []).map(e => `d.${e.columna}, `).join('');
    const result = await pool.request().input('id', sql.Int, id).query(`
      select d.id, d.codigo, ${destino.valor ? 'isnull(d.nombre, cast(d.valor as varchar(20)))' : 'd.nombre'} as nombre, ${extras}d.activo,
             case when r.${rel.destino} is null then 0 else 1 end as marcado
      from dbo.${destino.tabla} d
      left join dbo.${rel.tabla} r on r.${rel.destino} = d.id and r.${rel.origen} = @id
      order by d.orden, d.${destino.valor ? 'valor' : 'nombre'}`);
    res.status(200).send({ Table: result.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/rel/:relacion/:id { ids: [...] } — sustituye las opciones marcadas */
async function relacion_guardar(req, res) {
  const rel = RELACIONES[req.params.relacion];
  if (!rel) return res.status(400).send({ message: 'Relación no válida' });
  const id = entero(req.params.id);
  if (id === null) return res.status(400).send({ message: 'Falta el registro' });
  const ids = [...new Set(((req.body || {}).ids || []).map(entero).filter(n => n !== null))];

  let transaction;
  try {
    const pool = await sql.connect();
    const origen = await pool.request().input('id', sql.Int, id)
      .query(`select 1 as ok from dbo.${CATALOGOS[rel.catOrigen].tabla} where id = @id`);
    if (!origen.recordset[0]) return res.status(404).send({ message: 'El registro no existe' });

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    await new sql.Request(transaction).input('id', sql.Int, id)
      .query(`delete from dbo.${rel.tabla} where ${rel.origen} = @id`);
    if (ids.length > 0) {
      /* Solo se insertan los destinos que existen: un id inventado no llega a la FK */
      await new sql.Request(transaction).input('id', sql.Int, id).query(`
        insert into dbo.${rel.tabla} (${rel.origen}, ${rel.destino})
        select @id, d.id from dbo.${CATALOGOS[rel.catDestino].tabla} d where d.id in (${ids.join(',')})`);
    }
    await transaction.commit();
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* ---------------- MOTORES POR SISTEMA (script 14) ---------------- */

/* GET /acc/matriz/motores — sistemas en columnas y modelos de motor, agrupados por tipo, en filas.
   Cada modelo trae los sistemas a los que está asignado. Incluye los ocultos (la pantalla los pinta en gris) */
async function matriz_motores(req, res) {
  try {
    const pool = await sql.connect();
    const q = async (consulta) => (await pool.request().query(consulta)).recordset;
    const [sistemas, tipos, modelos, asignados] = await Promise.all([
      /* conMotor: el sistema tiene el accionamiento MOTOR en el paso 1 (si no, el configurador no llega a sus motores) */
      q(`select s.id, s.codigo, s.nombre, s.activo,
                case when exists (select 1 from dbo.SOL_ACC_ACCIONAMIENTO_SISTEMA r
                                  join dbo.SOL_ACC_ACCIONAMIENTO a on a.id = r.accionamiento_id and a.codigo = 'MOTOR'
                                  where r.sistema_id = s.id) then 1 else 0 end as conMotor
         from dbo.SOL_ACC_SISTEMA s order by s.orden, s.nombre`),
      q(`select t.id, t.codigo, t.nombre, t.activo from dbo.SOL_ACC_TIPO_MOTOR t
         join dbo.SOL_ACC_ACCIONAMIENTO a on a.id = t.accionamiento_id and a.codigo = 'MOTOR'
         order by t.orden, t.nombre`),
      q('select id, tipo_motor_id, codigo, nombre, activo from dbo.SOL_ACC_MODELO_MOTOR order by orden, nombre'),
      q('select modelo_motor_id, sistema_id from dbo.SOL_ACC_MODELO_MOTOR_SISTEMA')
    ]);
    const porModelo = {};
    asignados.forEach(r => (porModelo[r.modelo_motor_id] = porModelo[r.modelo_motor_id] || []).push(r.sistema_id));
    res.status(200).send({
      sistemas,
      tipos: tipos.map(t => Object.assign(t, {
        modelos: modelos.filter(m => m.tipo_motor_id === t.id)
          .map(m => ({ id: m.id, codigo: m.codigo, nombre: m.nombre, activo: m.activo, sistemas: porModelo[m.id] || [] }))
      }))
    });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/matriz/motores { sistema_id, modelo_ids: [...], marcado } — asigna o quita varios
   modelos en un sistema de una vez: una casilla, todos los modelos de un tipo o una columna entera */
async function matriz_motores_guardar(req, res) {
  const body = req.body || {};
  const sistema = entero(body.sistema_id);
  const ids = [...new Set((body.modelo_ids || []).map(entero).filter(n => n !== null))];
  if (sistema === null) return res.status(400).send({ message: 'Falta el sistema' });
  if (ids.length === 0) return res.status(400).send({ message: 'Faltan los motores' });

  let transaction;
  try {
    const pool = await sql.connect();
    const s = await pool.request().input('sistema', sql.Int, sistema)
      .query('select 1 as ok from dbo.SOL_ACC_SISTEMA where id = @sistema');
    if (!s.recordset[0]) return res.status(404).send({ message: 'El sistema no existe' });

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction).input('sistema', sql.Int, sistema);
    if (body.marcado) {
      /* Solo los modelos que existen y que aún no están asignados */
      await request.query(`
        insert into dbo.SOL_ACC_MODELO_MOTOR_SISTEMA (modelo_motor_id, sistema_id)
        select m.id, @sistema from dbo.SOL_ACC_MODELO_MOTOR m
        where m.id in (${ids.join(',')})
          and not exists (select 1 from dbo.SOL_ACC_MODELO_MOTOR_SISTEMA x where x.modelo_motor_id = m.id and x.sistema_id = @sistema)`);
    } else {
      await request.query(`
        delete from dbo.SOL_ACC_MODELO_MOTOR_SISTEMA
        where sistema_id = @sistema and modelo_motor_id in (${ids.join(',')})`);
    }
    await transaction.commit();
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* ---------------- SUPLEMENTOS DE PRECIO (script 16) ---------------- */

const MEDIDAS = ['ANCHO', 'ALTO', 'LONGITUD'];
/* La longitud de la cadena solo tiene sentido en los elementos de la cadena */
const CATALOGOS_CADENA = ['tipos_cadena', 'alturas', 'colores_cadena'];

/* Nombre que se enseña de un elemento (las alturas pueden no tener nombre: su valor en cm) */
function nombreElemento(cat, alias) {
  const propio = cat.valor
    ? `isnull(${alias}.nombre, cast(cast(${alias}.valor as float) as varchar(20)) + ' ${cat.unidad || 'cm'}')` : `${alias}.nombre`;
  /* Listas del Vertical: con su tipo delante ("Viena · Derecha"), porque cada tipo tiene las suyas */
  return cat.nombrePadre ? `${nombrePadre(cat, alias)} + ' · ' + ${propio}` : propio;
}

/* Nombre del registro del que cuelga (el tipo de vertical); null si el catálogo no lo enseña */
function nombrePadre(cat, alias) {
  return cat.nombrePadre ? `(select p.nombre from dbo.${cat.tablaPadre} p where p.id = ${alias}.${cat.padre})` : 'null';
}

async function elementoExiste(pool, cat, id) {
  const r = await pool.request().input('id', sql.Int, id)
    .query(`select ${nombreElemento(cat, 'x')} as nombre from dbo.${cat.tabla} x where x.id = @id`);
  return r.recordset[0] || null;
}

const SELECT_SUPLEMENTO = `
  select s.id, s.catalogo, s.elemento_id, s.cliente, c.descripcion as cliente_nombre, s.sistema_id, si.nombre as sistema_nombre,
         s.medida, s.hasta, s.importe, s.activo
  from dbo.SOL_ACC_SUPLEMENTO s
  left join dbo.SOL_CLIENTES c on c.idrow = s.cliente
  left join dbo.SOL_ACC_SISTEMA si on si.id = s.sistema_id`;

/* GET /acc/sup/:catalogo/:id — líneas de precio de un elemento */
async function suplementos(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const id = entero(req.params.id);
  if (id === null) return res.status(400).send({ message: 'Falta el registro' });
  try {
    const pool = await sql.connect();
    const elemento = await elementoExiste(pool, cat, id);
    if (!elemento) return res.status(404).send({ message: 'El registro no existe' });
    const r = await pool.request().input('tabla', sql.VarChar(50), cat.tabla).input('id', sql.Int, id).query(`${SELECT_SUPLEMENTO}
      where s.catalogo = @tabla and s.elemento_id = @id
      order by case when s.cliente is null then 0 else 1 end, c.descripcion,
               case when s.sistema_id is null then 0 else 1 end, si.nombre, s.medida, s.hasta`);
    res.status(200).send({ elemento: elemento.nombre, longitud: CATALOGOS_CADENA.includes(req.params.catalogo),
                           sinSistema: !!cat.sinSistema, lineas: r.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/sup/:catalogo/:id/fijo { importe } — importe general fijo (sin cliente, sistema ni tramos),
   el que se teclea directamente en la tabla. Vacío o null lo quita */
async function suplemento_fijo(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const id = entero(req.params.id);
  if (id === null) return res.status(400).send({ message: 'Falta el registro' });
  const body = req.body || {};
  const quitar = body.importe === null || body.importe === undefined || String(body.importe).trim() === '';
  const importe = quitar ? null : decimal(body.importe);
  if (!quitar && (importe === null || importe < 0)) return res.status(400).send({ message: 'El importe tiene que ser un número mayor o igual que 0' });

  try {
    const pool = await sql.connect();
    if (!(await elementoExiste(pool, cat, id))) return res.status(404).send({ message: 'El registro no existe' });
    const request = pool.request().input('tabla', sql.VarChar(50), cat.tabla).input('id', sql.Int, id).input('importe', sql.Decimal(10, 2), importe);
    const general = 'catalogo = @tabla and elemento_id = @id and cliente is null and sistema_id is null';
    if (quitar) {
      await request.query(`delete from dbo.SOL_ACC_SUPLEMENTO where ${general} and medida is null`);
    } else {
      const tramos = await request.query(`select count(*) as n from dbo.SOL_ACC_SUPLEMENTO where ${general} and medida is not null`);
      if (tramos.recordset[0].n > 0) {
        return res.status(400).send({ message: 'El precio general va por tramos: cámbielo en el detalle (···)' });
      }
      await request.query(`
        update dbo.SOL_ACC_SUPLEMENTO set importe = @importe where ${general} and medida is null;
        if @@rowcount = 0 insert into dbo.SOL_ACC_SUPLEMENTO (catalogo, elemento_id, importe) values (@tabla, @id, @importe)`);
    }
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/sup/:catalogo/:id { lineas: [{ cliente, sistema_id, medida, hasta, importe, activo }] }
   Sustituye todas las líneas del elemento (el detalle se guarda entero). En cada ámbito
   (cliente + sistema) hay o un importe fijo o tramos de una sola medida, sin "hasta" repetidos */
async function suplementos_guardar(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  const id = entero(req.params.id);
  if (id === null) return res.status(400).send({ message: 'Falta el registro' });
  const longitud = CATALOGOS_CADENA.includes(req.params.catalogo);

  const lineas = [];
  for (const l of ((req.body || {}).lineas || [])) {
    const vacio = (v) => v === null || v === undefined || String(v).trim() === '';
    const linea = {
      cliente: vacio(l.cliente) ? null : entero(l.cliente),
      sistema_id: vacio(l.sistema_id) ? null : entero(l.sistema_id),
      medida: vacio(l.medida) ? null : String(l.medida).toUpperCase(),
      hasta: vacio(l.hasta) ? null : decimal(l.hasta),
      importe: decimal(l.importe),
      activo: l.activo === false || l.activo === 0 ? 0 : 1
    };
    if (linea.importe === null || linea.importe < 0) return res.status(400).send({ message: 'Cada línea necesita un importe mayor o igual que 0' });
    if (linea.medida && !MEDIDAS.includes(linea.medida)) return res.status(400).send({ message: 'Medida no válida' });
    if (linea.medida === 'LONGITUD' && !longitud) return res.status(400).send({ message: 'La longitud de cadena solo vale en los elementos de la cadena' });
    if (cat.sinSistema && linea.sistema_id !== null) return res.status(400).send({ message: 'Este producto no tiene sistemas: deje el sistema en Todos' });
    if (linea.medida && (linea.hasta === null || linea.hasta <= 0)) return res.status(400).send({ message: 'Un tramo necesita un "hasta" mayor que 0' });
    if (!linea.medida && linea.hasta !== null) return res.status(400).send({ message: 'Indique la medida del tramo o deje vacío el "hasta"' });
    lineas.push(linea);
  }

  const ambitos = {};
  lineas.forEach(l => (ambitos[`${l.cliente}|${l.sistema_id}`] = ambitos[`${l.cliente}|${l.sistema_id}`] || []).push(l));
  for (const grupo of Object.values(ambitos)) {
    const fijos = grupo.filter(l => !l.medida);
    const medidas = new Set(grupo.filter(l => l.medida).map(l => l.medida));
    if (fijos.length > 1) return res.status(400).send({ message: 'Hay dos importes fijos para el mismo cliente y sistema' });
    if (fijos.length && medidas.size) return res.status(400).send({ message: 'Para un mismo cliente y sistema, ponga un importe fijo o tramos, no las dos cosas' });
    if (medidas.size > 1) return res.status(400).send({ message: 'Para un mismo cliente y sistema, los tramos tienen que ser de una sola medida' });
    const hastas = grupo.filter(l => l.medida).map(l => l.hasta);
    if (new Set(hastas).size !== hastas.length) return res.status(400).send({ message: 'Hay dos tramos con el mismo "hasta"' });
  }

  let transaction;
  try {
    const pool = await sql.connect();
    if (!(await elementoExiste(pool, cat, id))) return res.status(404).send({ message: 'El registro no existe' });
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    await new sql.Request(transaction).input('tabla', sql.VarChar(50), cat.tabla).input('id', sql.Int, id)
      .query('delete from dbo.SOL_ACC_SUPLEMENTO where catalogo = @tabla and elemento_id = @id');
    for (const l of lineas) {
      /* Cliente y sistema inexistentes los para la FK */
      await new sql.Request(transaction)
        .input('tabla', sql.VarChar(50), cat.tabla).input('id', sql.Int, id)
        .input('cliente', sql.Int, l.cliente).input('sistema', sql.Int, l.sistema_id)
        .input('medida', sql.VarChar(10), l.medida).input('hasta', sql.Decimal(10, 2), l.hasta)
        .input('importe', sql.Decimal(10, 2), l.importe).input('activo', sql.Bit, l.activo)
        .query(`insert into dbo.SOL_ACC_SUPLEMENTO (catalogo, elemento_id, cliente, sistema_id, medida, hasta, importe, activo)
                values (@tabla, @id, @cliente, @sistema, @medida, @hasta, @importe, @activo)`);
    }
    await transaction.commit();
    res.status(200).send({ message: 'OK' });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    const numero = err && (err.number || (err.originalError && err.originalError.info && err.originalError.info.number));
    if (numero === 547) return res.status(400).send({ message: 'Cliente o sistema no válido' });
    errorSql(err, res);
  }
}

/* GET /acc/suplementos — resumen de todos los suplementos, con el nombre de su elemento */
async function suplementos_resumen(req, res) {
  try {
    const pool = await sql.connect();
    const nombres = Object.keys(CATALOGOS).map(clave => {
      const cat = CATALOGOS[clave];
      /* grupo: el tipo de vertical de las listas del Vertical (para filtrar el resumen por tipo) */
      return `select '${clave}' as clave, '${cat.tabla}' as tabla, x.id, ${nombreElemento(cat, 'x')} as nombre,
                     cast(${cat.grupoPropio ? 'x.nombre' : nombrePadre(cat, 'x')} as varchar(100)) as grupo, x.activo from dbo.${cat.tabla} x`;
    }).join(' union all ');
    const r = await pool.request().query(`
      with elementos as (${nombres})
      select e.clave, e.nombre as elemento_nombre, e.grupo, e.activo as elemento_activo, sup.*
      from (${SELECT_SUPLEMENTO}) sup
      join elementos e on e.tabla = sup.catalogo and e.id = sup.elemento_id
      order by e.clave, e.nombre, sup.cliente_nombre, sup.sistema_nombre, sup.medida, sup.hasta`);
    res.status(200).send({ Table: r.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* GET /acc/clientes — clientes para elegir en los suplementos */
async function clientes(req, res) {
  try {
    const pool = await sql.connect();
    const r = await pool.request().query('select idrow as id, descripcion as nombre from dbo.SOL_CLIENTES order by descripcion');
    res.status(200).send({ Table: r.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* ---------------- TEJIDOS DISPONIBLES (scripts 29 y 36; Solar Mini: sqlSolarMini/01) ---------------- */

/* Tejidos del maestro (SOL_TEJIDOS_MAESTRO, una fila por tejido + color) que ofrece el configurador.
   Una sola lista para todos los clientes, guardada en un "destino":
   - enrollable: una por sistema (SOL_ACC_SISTEMA_TEJIDO, script 36)
   - Solar Mini: una sola, sin sistema (SOL_ACC_MINI_TEJIDO, sqlSolarMini/01)
   clave: columnas que, además del tejido, identifican la lista (con su valor); vacía en el Solar Mini */
function destinoSistema(sistema) {
  return { tabla: 'SOL_ACC_SISTEMA_TEJIDO', clave: [{ columna: 'sistema_id', param: 'sistema', valor: sistema }] };
}
const DESTINO_MINI = { tabla: 'SOL_ACC_MINI_TEJIDO', clave: [] };
/* Cajón ZIP (sqlCajonZip/01): una sola lista para todos los modelos de cajón */
const DESTINO_ZIP = { tabla: 'SOL_ACC_ZIP_TEJIDO', clave: [] };
/* Panel japonés (sqlPanelJapones/01): una sola lista */
const DESTINO_PJ = { tabla: 'SOL_ACC_PJ_TEJIDO', clave: [] };

function conClave(request, destino) {
  destino.clave.forEach(k => request.input(k.param, sql.Int, k.valor));
  return request;
}

/* Condición de la lista: "sistema_id = @sistema" (con prefijo si hace falta); vacía en el Solar Mini */
function condicion(destino, alias) {
  return destino.clave.map(k => `${alias ? alias + '.' : ''}${k.columna} = @${k.param}`).join(' and ');
}

async function sistemaValido(pool, sistema) {
  if (sistema === null) return false;
  const r = await pool.request().input('sistema', sql.Int, sistema)
    .query('select 1 as ok from dbo.SOL_ACC_SISTEMA where id = @sistema');
  return r.recordset.length > 0;
}

async function disponibles(pool, destino) {
  const where = condicion(destino);
  const r = await conClave(pool.request(), destino)
    .query(`select count(*) as n from dbo.${destino.tabla}${where ? ' where ' + where : ''}`);
  return r.recordset[0].n;
}

/* Los tejidos activos del maestro, con disponible = 1/0 en la lista */
async function leerTejidos(res, destino) {
  try {
    const pool = await sql.connect();
    const on = condicion(destino, 'pt');
    const r = await conClave(pool.request(), destino).query(`
      select m.idrow as id, m.cod_solupyme, m.nombre, m.color, m.tipo_tejido, t.descripcion as tipo,
             m.criterio, m.impresion_digital, m.coste_m2, m.grupo,
             case when pt.tejido is null then 0 else 1 end as disponible
      from dbo.SOL_TEJIDOS_MAESTRO m
      left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
      left join dbo.${destino.tabla} pt on pt.tejido = m.idrow${on ? ' and ' + on : ''}
      where m.activo = 1
      order by m.nombre, m.criterio, m.color`);
    res.status(200).send({ Table: r.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* { ids: [...], disponible } — marca o quita varios tejidos de una vez */
async function guardarTejidos(req, res, pool, destino) {
  const body = req.body || {};
  const ids = [...new Set((body.ids || []).map(entero).filter(n => n !== null))];
  if (ids.length === 0) return res.status(400).send({ message: 'Faltan los tejidos' });
  const usuario = texto(req.user && (req.user.email || req.user.name), 100) || null;
  const columnas = destino.clave.map(k => k.columna).concat(['tejido', 'usuario']).join(', ');
  const valores = destino.clave.map(k => '@' + k.param).concat(['m.idrow', '@usuario']).join(', ');
  const on = condicion(destino, 'pt');
  const where = condicion(destino);

  let transaction;
  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    /* De 500 en 500 para no pasar del límite de parámetros de SQL Server */
    for (let i = 0; i < ids.length; i += 500) {
      const lote = ids.slice(i, i + 500);
      const request = conClave(new sql.Request(transaction), destino).input('usuario', sql.VarChar(100), usuario);
      lote.forEach((id, j) => request.input('id' + j, sql.Int, id));
      const enIds = lote.map((id, j) => '@id' + j).join(', ');
      if (body.disponible) {
        /* Solo tejidos activos del maestro; los que ya están se dejan como estaban */
        await request.query(`
          insert into dbo.${destino.tabla} (${columnas})
          select ${valores} from dbo.SOL_TEJIDOS_MAESTRO m
          where m.idrow in (${enIds}) and m.activo = 1
            and not exists (select 1 from dbo.${destino.tabla} pt where pt.tejido = m.idrow${on ? ' and ' + on : ''})`);
      } else {
        await request.query(`delete from dbo.${destino.tabla} where ${where ? where + ' and ' : ''}tejido in (${enIds})`);
      }
    }
    await transaction.commit();

    res.status(200).send({ message: 'OK', disponibles: await disponibles(pool, destino) });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* Lista de la que se copia: un sistema del enrollable (por defecto) u otro tipo de vertical */
const ORIGEN_SISTEMA = { tabla: 'SOL_ACC_SISTEMA_TEJIDO', columna: 'sistema_id' };
const ORIGEN_TIPO_VERTICAL = { tabla: 'SOL_ACC_VER_TIPO_TEJIDO', columna: 'tipo_id' };

/* La lista pasa a tener exactamente los tejidos de la lista origen (los suyos de antes se quitan).
   Todo en una transacción */
async function copiarTejidos(req, res, pool, destino, origen, lista = ORIGEN_SISTEMA) {
  const usuario = texto(req.user && (req.user.email || req.user.name), 100) || null;
  const columnas = destino.clave.map(k => k.columna).concat(['tejido', 'usuario']).join(', ');
  const valores = destino.clave.map(k => '@' + k.param).concat(['st.tejido', '@usuario']).join(', ');
  const where = condicion(destino);

  let transaction;
  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    await conClave(new sql.Request(transaction), destino)
      .input('origen', sql.Int, origen)
      .input('usuario', sql.VarChar(100), usuario)
      .query(`
        delete from dbo.${destino.tabla}${where ? ' where ' + where : ''};
        insert into dbo.${destino.tabla} (${columnas})
        select ${valores} from dbo.${lista.tabla} st where st.${lista.columna} = @origen`);
    await transaction.commit();

    res.status(200).send({ message: 'OK', disponibles: await disponibles(pool, destino) });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* GET /acc/tejidos/:sistema — los del sistema del enrollable */
async function tejidos(req, res) {
  const sistema = entero(req.params.sistema);
  try {
    const pool = await sql.connect();
    if (!await sistemaValido(pool, sistema)) return res.status(400).send({ message: 'Sistema no válido' });
  } catch (err) {
    return errorSql(err, res);
  }
  return leerTejidos(res, destinoSistema(sistema));
}

/* POST /acc/tejidos/:sistema { ids: [...], disponible } */
async function tejidos_guardar(req, res) {
  const sistema = entero(req.params.sistema);
  try {
    const pool = await sql.connect();
    if (!await sistemaValido(pool, sistema)) return res.status(400).send({ message: 'Sistema no válido' });
    return guardarTejidos(req, res, pool, destinoSistema(sistema));
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/tejidos/:sistema/copiar { origen } — el sistema queda con los tejidos del sistema origen */
async function tejidos_copiar(req, res) {
  const sistema = entero(req.params.sistema);
  const origen = entero((req.body || {}).origen);
  if (origen === sistema) return res.status(400).send({ message: 'Elija otro sistema del que copiar' });
  try {
    const pool = await sql.connect();
    if (!await sistemaValido(pool, sistema) || !await sistemaValido(pool, origen)) {
      return res.status(400).send({ message: 'Sistema no válido' });
    }
    return copiarTejidos(req, res, pool, destinoSistema(sistema), origen);
  } catch (err) {
    errorSql(err, res);
  }
}

/* Rutas de una lista de tejidos sin sistema (Solar Mini, Cajón ZIP):
   GET  /acc/<producto>/tejidos                       los del producto
   POST /acc/<producto>/tejidos { ids, disponible }   marca o quita
   POST /acc/<producto>/tejidos/copiar { origen }     el producto queda con los tejidos de un sistema del enrollable */
function tejidosSinSistema(destino) {
  return {
    leer: (req, res) => leerTejidos(res, destino),
    guardar: async (req, res) => {
      try {
        const pool = await sql.connect();
        return guardarTejidos(req, res, pool, destino);
      } catch (err) {
        errorSql(err, res);
      }
    },
    copiar: async (req, res) => {
      const origen = entero((req.body || {}).origen);
      try {
        const pool = await sql.connect();
        if (!await sistemaValido(pool, origen)) return res.status(400).send({ message: 'Sistema no válido' });
        return copiarTejidos(req, res, pool, destino, origen);
      } catch (err) {
        errorSql(err, res);
      }
    }
  };
}

const TEJIDOS_MINI = tejidosSinSistema(DESTINO_MINI);
const TEJIDOS_ZIP = tejidosSinSistema(DESTINO_ZIP);
const TEJIDOS_PJ = tejidosSinSistema(DESTINO_PJ);

/* ---------------- VERTICAL: TEJIDOS POR TIPO (sqlVertical/01) ---------------- */

/* Una lista por tipo de vertical (SOL_ACC_VER_TIPO_TEJIDO); vale para cualquier ancho de lama */
function destinoTipoVertical(tipo) {
  return { tabla: 'SOL_ACC_VER_TIPO_TEJIDO', clave: [{ columna: 'tipo_id', param: 'tipo', valor: tipo }] };
}

async function tipoVerticalValido(pool, tipo) {
  if (tipo === null) return false;
  const r = await pool.request().input('tipo', sql.Int, tipo).query('select 1 as ok from dbo.SOL_ACC_VER_TIPO where id = @tipo');
  return r.recordset.length > 0;
}

/* GET /acc/ver/tejidos/:tipo */
async function ver_tejidos(req, res) {
  const tipo = entero(req.params.tipo);
  try {
    const pool = await sql.connect();
    if (!await tipoVerticalValido(pool, tipo)) return res.status(400).send({ message: 'Tipo de vertical no válido' });
  } catch (err) {
    return errorSql(err, res);
  }
  return leerTejidos(res, destinoTipoVertical(tipo));
}

/* POST /acc/ver/tejidos/:tipo { ids: [...], disponible } */
async function ver_tejidos_guardar(req, res) {
  const tipo = entero(req.params.tipo);
  try {
    const pool = await sql.connect();
    if (!await tipoVerticalValido(pool, tipo)) return res.status(400).send({ message: 'Tipo de vertical no válido' });
    return guardarTejidos(req, res, pool, destinoTipoVertical(tipo));
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/ver/tejidos/:tipo/copiar { origen } — el tipo queda con los tejidos de otro tipo de vertical */
async function ver_tejidos_copiar(req, res) {
  const tipo = entero(req.params.tipo);
  const origen = entero((req.body || {}).origen);
  if (origen === tipo) return res.status(400).send({ message: 'Elija otro tipo del que copiar' });
  try {
    const pool = await sql.connect();
    if (!await tipoVerticalValido(pool, tipo) || !await tipoVerticalValido(pool, origen)) {
      return res.status(400).send({ message: 'Tipo de vertical no válido' });
    }
    return copiarTejidos(req, res, pool, destinoTipoVertical(tipo), origen, ORIGEN_TIPO_VERTICAL);
  } catch (err) {
    errorSql(err, res);
  }
}

/* ---------------- COPIAR UNA LISTA DE UN PADRE A OTRO (listas del Vertical) ---------------- */

/* POST /acc/:catalogo/copiar { origen, destino } — añade al padre destino (tipo de vertical) los registros del
   origen que aún no tenga (mismo código, nombre o valor), al final de su lista y con sus suplementos.
   No quita ni cambia nada de lo que ya tiene. Todo en una transacción */
async function copiar(req, res) {
  const cat = CATALOGOS[req.params.catalogo];
  if (!cat) return res.status(400).send({ message: 'Catálogo no válido' });
  if (!cat.copiable) return res.status(400).send({ message: 'Esta lista no se puede copiar' });
  const body = req.body || {};
  const origen = entero(body.origen);
  const destino = entero(body.destino);
  if (origen === null || destino === null) return res.status(400).send({ message: 'Faltan el origen o el destino' });
  if (origen === destino) return res.status(400).send({ message: 'Elija otro del que copiar' });

  /* Columnas que se copian (el padre y el orden se ponen aparte; el código se conserva: es único dentro del padre) */
  const columnas = ['codigo', 'nombre', 'nombre_pt'].concat(cat.valor ? ['valor'] : [], ['activo']);
  /* Ya lo tiene si coincide el código, el nombre (no vacío) o el valor */
  const repetido = ['d.codigo = o.codigo', 'd.nombre = o.nombre'].concat(cat.valor ? ['d.valor = o.valor'] : []).join(' or ');

  let transaction;
  try {
    const pool = await sql.connect();
    const padres = await pool.request().input('origen', sql.Int, origen).input('destino', sql.Int, destino)
      .query(`select id from dbo.${cat.tablaPadre} where id in (@origen, @destino)`);
    if (padres.recordset.length !== 2) return res.status(400).send({ message: 'El origen o el destino no existen' });

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const nuevos = await new sql.Request(transaction).input('origen', sql.Int, origen).input('destino', sql.Int, destino).query(`
      select o.id from dbo.${cat.tabla} o
      where o.${cat.padre} = @origen
        and not exists (select 1 from dbo.${cat.tabla} d where d.${cat.padre} = @destino and (${repetido}))
      order by o.orden, o.${cat.valor ? 'valor' : 'nombre'}`);

    for (const fila of nuevos.recordset) {
      const r = await new sql.Request(transaction)
        .input('id', sql.Int, fila.id).input('destino', sql.Int, destino).input('tabla', sql.VarChar(50), cat.tabla)
        .query(`
          declare @nuevo table (id int);
          insert into dbo.${cat.tabla} (${cat.padre}, ${columnas.join(', ')}, orden)
          output inserted.id into @nuevo
          select @destino, ${columnas.join(', ')},
                 (select isnull(max(orden), 0) + 1 from dbo.${cat.tabla} where ${cat.padre} = @destino)
          from dbo.${cat.tabla} where id = @id;
          insert into dbo.SOL_ACC_SUPLEMENTO (catalogo, elemento_id, cliente, sistema_id, medida, hasta, importe, activo)
          select s.catalogo, n.id, s.cliente, s.sistema_id, s.medida, s.hasta, s.importe, s.activo
          from dbo.SOL_ACC_SUPLEMENTO s cross join @nuevo n
          where s.catalogo = @tabla and s.elemento_id = @id;
          select id from @nuevo`);
      if (!r.recordset[0]) throw new Error('No se pudo copiar el registro ' + fila.id);
    }
    await transaction.commit();

    const total = await pool.request().input('origen', sql.Int, origen)
      .query(`select count(*) as n from dbo.${cat.tabla} where ${cat.padre} = @origen`);
    res.status(200).send({ message: 'OK', copiados: nuevos.recordset.length, yaEstaban: total.recordset[0].n - nuevos.recordset.length });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* ---------------- VERTICAL: TARIFA BASE (sqlVertical/10) ----------------
   Por tipo + ancho de lama + tejido. Cada "juego" de la tarifa es un ancho de lama (o ninguno: líneas sin lama y
   anchos de lama sin filas propias) y un cliente (o ninguno: general):
   - mecanismo: tramos de ancho (hasta cm → precio de una cortina o un riel)
   - tejido: € por metro lineal de lama de cada tejido (por nombre: todos sus colores)
   Al guardar se sustituye el juego entero. Lo calcula fn_acc_ver_precio_base */

/* Ancho de lama del tipo (null = sin ancho de lama). Devuelve undefined si no es del tipo */
async function lamaDelTipo(pool, tipo, valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const id = entero(valor);
  if (id === null) return undefined;
  const r = await pool.request().input('id', sql.Int, id).input('tipo', sql.Int, tipo)
    .query('select id from dbo.SOL_ACC_VER_ANCHO_LAMA where id = @id and tipo_id = @tipo');
  return r.recordset.length ? id : undefined;
}

/* Cliente de la tarifa (null = general). Devuelve undefined si no existe */
async function clienteTarifa(pool, valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const id = entero(valor);
  if (id === null) return undefined;
  const r = await pool.request().input('id', sql.Int, id).query('select idrow from dbo.SOL_CLIENTES where idrow = @id');
  return r.recordset.length ? id : undefined;
}

/* Condición del juego de la tarifa (ancho de lama y cliente pueden ser null) */
const JUEGO_TARIFA = `tipo_id = @tipo
  and ((ancho_lama_id is null and @lama is null) or ancho_lama_id = @lama)
  and ((cliente is null and @cliente is null) or cliente = @cliente)`;

/* GET /acc/ver/tarifa/:tipo — los anchos de lama y los tejidos del tipo y todas sus filas de tarifa */
async function ver_tarifa(req, res) {
  const tipo = entero(req.params.tipo);
  try {
    const pool = await sql.connect();
    if (!await tipoVerticalValido(pool, tipo)) return res.status(400).send({ message: 'Tipo de vertical no válido' });
    const q = (texto) => pool.request().input('tipo', sql.Int, tipo).query(texto).then(r => r.recordset);
    const [anchosLama, tejidos, mecanismo, tejido] = await Promise.all([
      q(`select id, codigo, valor, nombre, activo from dbo.SOL_ACC_VER_ANCHO_LAMA where tipo_id = @tipo order by orden, valor`),
      /* tejidos del tipo agrupados por nombre (la tarifa es la misma para todos sus colores) */
      q(`select m.nombre, count(*) as colores from dbo.SOL_ACC_VER_TIPO_TEJIDO vt
         join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = vt.tejido
         where vt.tipo_id = @tipo group by m.nombre order by m.nombre`),
      q(`select ancho_lama_id, cliente, hasta, precio from dbo.SOL_ACC_VER_TARIFA_MECANISMO where tipo_id = @tipo
         order by ancho_lama_id, cliente, hasta`),
      q(`select ancho_lama_id, cliente, tejido_nombre, precio from dbo.SOL_ACC_VER_TARIFA_TEJIDO where tipo_id = @tipo
         order by ancho_lama_id, cliente, tejido_nombre`)
    ]);
    res.status(200).send({ anchosLama, tejidos, mecanismo, tejido });
  } catch (err) {
    errorSql(err, res);
  }
}

/* Comprueba tipo, ancho de lama y cliente del cuerpo; devuelve { tipo, lama, cliente } o envía el error */
async function juegoTarifa(req, res, pool) {
  const tipo = entero(req.params.tipo);
  const body = req.body || {};
  if (!await tipoVerticalValido(pool, tipo)) { res.status(400).send({ message: 'Tipo de vertical no válido' }); return null; }
  const lama = await lamaDelTipo(pool, tipo, body.ancho_lama_id);
  if (lama === undefined) { res.status(400).send({ message: 'El ancho de lama no es de este tipo' }); return null; }
  const cliente = await clienteTarifa(pool, body.cliente);
  if (cliente === undefined) { res.status(400).send({ message: 'Cliente no válido' }); return null; }
  return { tipo, lama, cliente };
}

/* Sustituye las filas de un juego de la tarifa en una transacción */
async function sustituirJuego(req, res, pool, juego, tabla, filas, insertar) {
  const usuario = texto(req.user && (req.user.email || req.user.name), 100) || null;
  let transaction;
  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const conJuego = (r) => r.input('tipo', sql.Int, juego.tipo).input('lama', sql.Int, juego.lama)
      .input('cliente', sql.Int, juego.cliente).input('usuario', sql.VarChar(100), usuario);
    await conJuego(new sql.Request(transaction)).query(`delete from dbo.${tabla} where ${JUEGO_TARIFA}`);
    for (const f of filas) await insertar(conJuego(new sql.Request(transaction)), f);
    await transaction.commit();
    res.status(200).send({ message: 'OK', filas: filas.length });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* POST /acc/ver/tarifa/:tipo/mecanismo { ancho_lama_id, cliente, tramos: [{ hasta, precio }] } (tramos vacío = borrar) */
async function ver_tarifa_mecanismo(req, res) {
  const tramos = (req.body || {}).tramos;
  if (!Array.isArray(tramos)) return res.status(400).send({ message: 'Faltan los tramos' });
  const filas = tramos.map(t => ({ hasta: decimal(t.hasta), precio: decimal(t.precio) }));
  if (filas.some(f => f.hasta === null || f.hasta <= 0 || f.hasta > 10000)) {
    return res.status(400).send({ message: 'Cada tramo necesita un ancho "hasta" mayor que 0 (en cm)' });
  }
  if (filas.some(f => f.precio === null || f.precio < 0)) return res.status(400).send({ message: 'Cada tramo necesita un precio (0 o más)' });
  if (new Set(filas.map(f => f.hasta)).size !== filas.length) return res.status(400).send({ message: 'Hay dos tramos con el mismo ancho' });
  try {
    const pool = await sql.connect();
    const juego = await juegoTarifa(req, res, pool);
    if (!juego) return;
    return sustituirJuego(req, res, pool, juego, 'SOL_ACC_VER_TARIFA_MECANISMO', filas, (r, f) => r
      .input('hasta', sql.Decimal(10, 2), f.hasta).input('precio', sql.Decimal(10, 2), f.precio)
      .query(`insert into dbo.SOL_ACC_VER_TARIFA_MECANISMO (tipo_id, ancho_lama_id, cliente, hasta, precio, usuario)
              values (@tipo, @lama, @cliente, @hasta, @precio, @usuario)`));
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/ver/tarifa/:tipo/tejido { ancho_lama_id, cliente, precios: [{ tejido_nombre, precio }] }
   Un tejido sin precio no se guarda (no tiene tarifa) */
async function ver_tarifa_tejido(req, res) {
  const precios = (req.body || {}).precios;
  if (!Array.isArray(precios)) return res.status(400).send({ message: 'Faltan los precios' });
  const filas = precios.map(p => ({ nombre: texto(p.tejido_nombre, 100), precio: decimal(p.precio) }))
    .filter(f => f.precio !== null);
  if (filas.some(f => !f.nombre)) return res.status(400).send({ message: 'Falta el nombre de un tejido' });
  if (filas.some(f => f.precio < 0 || f.precio > 100000)) return res.status(400).send({ message: 'El precio por metro no es válido' });
  if (new Set(filas.map(f => f.nombre)).size !== filas.length) return res.status(400).send({ message: 'Hay un tejido repetido' });
  try {
    const pool = await sql.connect();
    const juego = await juegoTarifa(req, res, pool);
    if (!juego) return;
    return sustituirJuego(req, res, pool, juego, 'SOL_ACC_VER_TARIFA_TEJIDO', filas, (r, f) => r
      .input('nombre', sql.VarChar(100), f.nombre).input('precio', sql.Decimal(10, 4), f.precio)
      .query(`insert into dbo.SOL_ACC_VER_TARIFA_TEJIDO (tipo_id, ancho_lama_id, cliente, tejido_nombre, precio, usuario)
              values (@tipo, @lama, @cliente, @nombre, @precio, @usuario)`));
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/ver/tarifa/:tipo/copiar { origen } — trae la tarifa de otro tipo: cada ancho de lama va al del mismo
   valor (en mm) de este tipo y las filas sin ancho de lama, a las sin ancho de lama. Solo añade los juegos (ancho
   de lama + cliente) que este tipo aún no tenga, y en el tejido, los tejidos que falten: no cambia nada de lo que ya hay */
async function ver_tarifa_copiar(req, res) {
  const tipo = entero(req.params.tipo);
  const origen = entero((req.body || {}).origen);
  if (origen === tipo) return res.status(400).send({ message: 'Elija otro tipo del que copiar' });
  const usuario = texto(req.user && (req.user.email || req.user.name), 100) || null;
  let transaction;
  try {
    const pool = await sql.connect();
    if (!await tipoVerticalValido(pool, tipo) || !await tipoVerticalValido(pool, origen)) {
      return res.status(400).send({ message: 'Tipo de vertical no válido' });
    }
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const r = await new sql.Request(transaction)
      .input('tipo', sql.Int, tipo).input('origen', sql.Int, origen).input('usuario', sql.VarChar(100), usuario).query(`
        /* lama del origen → lama del destino (mismo valor); null → null; las que no tienen pareja no se copian */
        declare @mapa table (o int null, d int null)
        insert @mapa values (null, null)
        insert @mapa select lo.id, ld.id from dbo.SOL_ACC_VER_ANCHO_LAMA lo
          join dbo.SOL_ACC_VER_ANCHO_LAMA ld on ld.tipo_id = @tipo and ld.valor = lo.valor where lo.tipo_id = @origen

        insert into dbo.SOL_ACC_VER_TARIFA_MECANISMO (tipo_id, ancho_lama_id, cliente, hasta, precio, usuario)
        select @tipo, m.d, t.cliente, t.hasta, t.precio, @usuario
        from dbo.SOL_ACC_VER_TARIFA_MECANISMO t
        join @mapa m on (m.o = t.ancho_lama_id or (m.o is null and t.ancho_lama_id is null))
        where t.tipo_id = @origen
          and not exists (select 1 from dbo.SOL_ACC_VER_TARIFA_MECANISMO x where x.tipo_id = @tipo
                          and (x.ancho_lama_id = m.d or (x.ancho_lama_id is null and m.d is null))
                          and (x.cliente = t.cliente or (x.cliente is null and t.cliente is null)))
        declare @nm int = @@rowcount

        insert into dbo.SOL_ACC_VER_TARIFA_TEJIDO (tipo_id, ancho_lama_id, cliente, tejido_nombre, precio, usuario)
        select @tipo, m.d, t.cliente, t.tejido_nombre, t.precio, @usuario
        from dbo.SOL_ACC_VER_TARIFA_TEJIDO t
        join @mapa m on (m.o = t.ancho_lama_id or (m.o is null and t.ancho_lama_id is null))
        where t.tipo_id = @origen
          and not exists (select 1 from dbo.SOL_ACC_VER_TARIFA_TEJIDO x where x.tipo_id = @tipo
                          and (x.ancho_lama_id = m.d or (x.ancho_lama_id is null and m.d is null))
                          and (x.cliente = t.cliente or (x.cliente is null and t.cliente is null))
                          and x.tejido_nombre = t.tejido_nombre)
        declare @nt int = @@rowcount

        /* filas del origen que no se han podido copiar porque su ancho de lama no está en este tipo */
        select @nm as mecanismo, @nt as tejido,
          (select count(*) from dbo.SOL_ACC_VER_TARIFA_MECANISMO t where t.tipo_id = @origen and t.ancho_lama_id is not null
             and not exists (select 1 from @mapa m where m.o = t.ancho_lama_id and m.d is not null))
          + (select count(*) from dbo.SOL_ACC_VER_TARIFA_TEJIDO t where t.tipo_id = @origen and t.ancho_lama_id is not null
             and not exists (select 1 from @mapa m where m.o = t.ancho_lama_id and m.d is not null)) as sinLama`);
    await transaction.commit();
    res.status(200).send(Object.assign({ message: 'OK' }, r.recordset[0]));
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* ---------------- PANEL JAPONÉS: TARIFA DEL SOLO RIEL (sqlPanelJapones/03) ----------------
   Por número de vías: tramos de ancho del mecanismo (hasta cm → precio de un riel), generales o de un cliente. Si
   el cliente tiene filas para esas vías manda su juego entero. Lo lee sp_acc_pj_precio_linea */

/* GET /acc/pj/tarifa_riel — las vías y todas las filas de la tarifa */
async function pj_tarifa_riel(req, res) {
  try {
    const pool = await sql.connect();
    const q = (texto) => pool.request().query(texto).then(r => r.recordset);
    const [vias, filas] = await Promise.all([
      q(`select id, codigo, cast(valor as int) as valor, isnull(nombre, cast(cast(valor as int) as varchar(10)) + ' vías') as nombre, activo
         from dbo.SOL_ACC_PJ_VIAS order by orden, valor`),
      q(`select t.vias_id, t.cliente, c.descripcion as cliente_nombre, t.hasta, t.precio, t.modified, t.usuario
         from dbo.SOL_ACC_PJ_TARIFA_RIEL t left join dbo.SOL_CLIENTES c on c.idrow = t.cliente
         order by t.vias_id, t.cliente, t.hasta`)
    ]);
    res.status(200).send({ vias, filas });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/pj/tarifa_riel { vias_id, cliente, tramos: [{ hasta, precio }] } — sustituye el juego (vías + cliente);
   tramos vacío = borrarlo */
async function pj_tarifa_riel_guardar(req, res) {
  const body = req.body || {};
  const vias = entero(body.vias_id);
  const tramos = body.tramos;
  if (!Array.isArray(tramos)) return res.status(400).send({ message: 'Faltan los tramos' });
  const filas = tramos.map(t => ({ hasta: decimal(t.hasta), precio: decimal(t.precio) }));
  if (filas.some(f => f.hasta === null || f.hasta <= 0 || f.hasta > 10000)) {
    return res.status(400).send({ message: 'Cada tramo necesita un ancho "hasta" mayor que 0 (en cm)' });
  }
  if (filas.some(f => f.precio === null || f.precio < 0)) return res.status(400).send({ message: 'Cada tramo necesita un precio (0 o más)' });
  if (new Set(filas.map(f => f.hasta)).size !== filas.length) return res.status(400).send({ message: 'Hay dos tramos con el mismo ancho' });
  const usuario = texto(req.user && (req.user.email || req.user.name), 100) || null;
  let transaction;
  try {
    const pool = await sql.connect();
    const v = await pool.request().input('id', sql.Int, vias).query('select id from dbo.SOL_ACC_PJ_VIAS where id = @id');
    if (!v.recordset.length) return res.status(400).send({ message: 'Número de vías no válido' });
    const cliente = await clienteTarifa(pool, body.cliente);
    if (cliente === undefined) return res.status(400).send({ message: 'Cliente no válido' });
    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const conJuego = (r) => r.input('vias', sql.Int, vias).input('cliente', sql.Int, cliente).input('usuario', sql.VarChar(100), usuario);
    await conJuego(new sql.Request(transaction))
      .query('delete from dbo.SOL_ACC_PJ_TARIFA_RIEL where vias_id = @vias and ((cliente is null and @cliente is null) or cliente = @cliente)');
    for (const f of filas) {
      await conJuego(new sql.Request(transaction)).input('hasta', sql.Decimal(10, 2), f.hasta).input('precio', sql.Decimal(12, 2), f.precio)
        .query('insert into dbo.SOL_ACC_PJ_TARIFA_RIEL (vias_id, cliente, hasta, precio, usuario) values (@vias, @cliente, @hasta, @precio, @usuario)');
    }
    await transaction.commit();
    res.status(200).send({ message: 'OK', filas: filas.length });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

/* ---------------- IMPRESIÓN DIGITAL: importe fijo por producto (sqlImpresion/01) ----------------
   Una fila por producto en SOL_ACC_IMPRESION_DIGITAL. La opción sale en el configurador solo si el producto tiene
   incluido algún tejido apto (impresion_digital del maestro): aquí se enseñan esos tejidos y dónde están */
const IMPRESION = {
  enrollable: { producto: 1, tejidos: `select m.nombre, m.color, m.cod_solupyme, s.nombre as donde
                 from dbo.SOL_ACC_SISTEMA_TEJIDO x join dbo.SOL_ACC_SISTEMA s on s.id = x.sistema_id and s.activo = 1
                 join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = x.tejido` },
  mini: { producto: 4, tejidos: `select m.nombre, m.color, m.cod_solupyme, null as donde
           from dbo.SOL_ACC_MINI_TEJIDO x join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = x.tejido` },
  zip: { producto: 6, tejidos: `select m.nombre, m.color, m.cod_solupyme, null as donde
          from dbo.SOL_ACC_ZIP_TEJIDO x join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = x.tejido` },
  pj: { producto: 2, tejidos: `select m.nombre, m.color, m.cod_solupyme, null as donde
         from dbo.SOL_ACC_PJ_TEJIDO x join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = x.tejido` },
  ver: { producto: 3, tejidos: `select m.nombre, m.color, m.cod_solupyme, t.nombre as donde
          from dbo.SOL_ACC_VER_TIPO_TEJIDO x join dbo.SOL_ACC_VER_TIPO t on t.id = x.tipo_id and t.activo = 1
          join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = x.tejido` }
};

/* GET /acc/impresion/:producto — importe y tejidos aptos incluidos (con dónde: sistema o tipo) */
async function impresion(req, res) {
  const cfg = IMPRESION[req.params.producto];
  if (!cfg) return res.status(400).send({ message: 'Producto no válido' });
  try {
    const pool = await sql.connect();
    const fila = await pool.request().input('producto', sql.Int, cfg.producto)
      .query('select producto, nombre, importe, modified, usuario from dbo.SOL_ACC_IMPRESION_DIGITAL where producto = @producto');
    if (!fila.recordset.length) return res.status(400).send({ message: 'Falta sqlImpresion/01 en la base de datos' });
    const tejidos = await pool.request().query(`${cfg.tejidos}
      where m.activo = 1 and isnull(m.impresion_digital, 0) = 1 order by m.nombre, m.color`);
    const aptos = await pool.request()
      .query('select count(*) as n from dbo.SOL_TEJIDOS_MAESTRO where activo = 1 and isnull(impresion_digital, 0) = 1');
    /* un tejido con color una vez, con todos los sitios donde está */
    const porClave = {};
    const lista = [];
    tejidos.recordset.forEach(t => {
      const k = t.nombre + '|' + t.color;
      if (!porClave[k]) { porClave[k] = { nombre: t.nombre, color: t.color, cod_solupyme: t.cod_solupyme, donde: [] }; lista.push(porClave[k]); }
      if (t.donde && !porClave[k].donde.includes(t.donde)) porClave[k].donde.push(t.donde);
    });
    res.status(200).send(Object.assign(fila.recordset[0], { tejidos: lista, aptosMaestro: aptos.recordset[0].n }));
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/impresion/:producto { importe } — vacío = sin importe (la impresión vale 0 y el configurador avisa) */
async function impresion_guardar(req, res) {
  const cfg = IMPRESION[req.params.producto];
  if (!cfg) return res.status(400).send({ message: 'Producto no válido' });
  const valor = (req.body || {}).importe;
  const importe = decimal(valor);
  if (valor !== null && valor !== undefined && valor !== '' && (importe === null || importe < 0 || importe > 100000)) {
    return res.status(400).send({ message: 'El importe no es válido' });
  }
  const usuario = texto(req.user && (req.user.email || req.user.name), 100) || null;
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('producto', sql.Int, cfg.producto).input('importe', sql.Decimal(10, 2), importe)
      .input('usuario', sql.VarChar(100), usuario)
      .query(`update dbo.SOL_ACC_IMPRESION_DIGITAL set importe = @importe, modified = getdate(), usuario = @usuario
              where producto = @producto; select @@rowcount as n`);
    if (!r.recordset[0].n) return res.status(400).send({ message: 'Falta sqlImpresion/01 en la base de datos' });
    res.status(200).send({ message: 'OK', importe });
  } catch (err) {
    errorSql(err, res);
  }
}

module.exports = {
  impresion,
  impresion_guardar,
  ver_tarifa,
  ver_tarifa_mecanismo,
  ver_tarifa_tejido,
  ver_tarifa_copiar,
  ver_tejidos,
  ver_tejidos_guardar,
  ver_tejidos_copiar,
  copiar,
  mini_tejidos: TEJIDOS_MINI.leer,
  mini_tejidos_guardar: TEJIDOS_MINI.guardar,
  mini_tejidos_copiar: TEJIDOS_MINI.copiar,
  zip_tejidos: TEJIDOS_ZIP.leer,
  zip_tejidos_guardar: TEJIDOS_ZIP.guardar,
  zip_tejidos_copiar: TEJIDOS_ZIP.copiar,
  pj_tarifa_riel,
  pj_tarifa_riel_guardar,
  pj_tejidos: TEJIDOS_PJ.leer,
  pj_tejidos_guardar: TEJIDOS_PJ.guardar,
  pj_tejidos_copiar: TEJIDOS_PJ.copiar,
  tejidos,
  tejidos_guardar,
  tejidos_copiar,
  suplementos,
  suplemento_fijo,
  suplementos_guardar,
  suplementos_resumen,
  clientes,
  lista,
  guardar,
  visible,
  orden,
  borrar,
  relacion,
  relacion_guardar,
  matriz_motores,
  matriz_motores_guardar
};
