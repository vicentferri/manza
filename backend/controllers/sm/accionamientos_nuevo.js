'use strict'

const sql = require('mssql');

/*
 * Modelo nuevo de accionamientos (tablas SOL_ACC_*).
 * Pantalla: routes/setup/accionamientos-nuevo ("Productos", antes "Accionamientos nuevo")
 * Scripts:  C:\dev\sqlAccionamientos\ (01 tablas, 02 accionamientos fijos CADENA y MOTOR)
 *
 * Las tablas y columnas salen solo de CATALOGOS y RELACIONES: el cliente manda la
 * clave del catálogo, nunca un nombre de tabla.
 */

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
  /* Soportes y tapas genéricos (cada sistema marca los suyos); contrapesos para todos los sistemas.
     Cada pieza tiene su propio catálogo de colores (script 07) */
  soportes:            { tabla: 'SOL_ACC_SOPORTE' },
  tapas:               { tabla: 'SOL_ACC_TAPA' },
  contrapesos:         { tabla: 'SOL_ACC_CONTRAPESO' },
  colores_soporte:     { tabla: 'SOL_ACC_COLOR_SOPORTE' },
  colores_tapa:        { tabla: 'SOL_ACC_COLOR_TAPA' },
  colores_contrapeso:  { tabla: 'SOL_ACC_COLOR_CONTRAPESO' }
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
  /* Desde el sistema se marcan sus soportes y sus tapas */
  sistema_soporte:       { tabla: 'SOL_ACC_SOPORTE_SISTEMA', origen: 'sistema_id', destino: 'soporte_id',
                           catOrigen: 'sistemas', catDestino: 'soportes' },
  sistema_tapa:          { tabla: 'SOL_ACC_TAPA_SISTEMA', origen: 'sistema_id', destino: 'tapa_id',
                           catOrigen: 'sistemas', catDestino: 'tapas' },
  /* Colores que admite cada pieza */
  soporte_color:         { tabla: 'SOL_ACC_SOPORTE_COLOR', origen: 'soporte_id', destino: 'color_soporte_id',
                           catOrigen: 'soportes', catDestino: 'colores_soporte' },
  tapa_color:            { tabla: 'SOL_ACC_TAPA_COLOR', origen: 'tapa_id', destino: 'color_tapa_id',
                           catOrigen: 'tapas', catDestino: 'colores_tapa' },
  contrapeso_color:      { tabla: 'SOL_ACC_CONTRAPESO_COLOR', origen: 'contrapeso_id', destino: 'color_contrapeso_id',
                           catOrigen: 'contrapesos', catDestino: 'colores_contrapeso' }
};

/* El código se usará en las reglas de fabricación: mayúsculas, números y _ */
const CODIGO = /^[A-Z0-9_]+$/;
const TABLA_ACC = /^SOL_ACC_[A-Z_]+$/;
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
      where fkc.referenced_object_id = object_id(@tabla)`);
    referenciasCache[tabla] = result.recordset.filter(r => TABLA_ACC.test(r.tabla) && COLUMNA.test(r.columna));
  }
  return referenciasCache[tabla];
}

/* Código libre en la tabla a partir de una base: BASE, BASE_2, BASE_3... */
async function codigoLibre(pool, tabla, base, id) {
  const result = await pool.request()
    .input('base', sql.VarChar(50), base)
    .input('patron', sql.VarChar(60), base.replace(/_/g, '[_]') + '%')
    .input('id', sql.Int, id)
    .query(`select codigo from dbo.${tabla} where (codigo = @base or codigo like @patron) and id <> @id`);
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
    const dependencias = refs.length
      ? refs.map(r => `(select count(*) from dbo.${r.tabla} d where d.${r.columna} = x.id)`).join(' + ')
      : '0';
    const request = pool.request().input('tabla', sql.VarChar(50), cat.tabla);
    let where = '';
    if (cat.padre) {
      request.input('padre', sql.Int, padre);
      where = `where x.${cat.padre} = @padre`;
    }
    /* suplementos: líneas de precio del elemento (script 16); suplemento_fijo: el importe general
       sin tramos, el que se edita directamente en la tabla */
    const result = await request.query(`
      select x.*, ${dependencias} as dependencias,
             (select count(*) from dbo.SOL_ACC_SUPLEMENTO s where s.catalogo = @tabla and s.elemento_id = x.id) as suplementos,
             (select s.importe from dbo.SOL_ACC_SUPLEMENTO s where s.catalogo = @tabla and s.elemento_id = x.id
                and s.cliente is null and s.sistema_id is null and s.medida is null) as suplemento_fijo
      from dbo.${cat.tabla} x ${where}
      order by x.orden, ${cat.valor ? 'x.valor' : 'x.nombre'}`);
    const protegidos = cat.protegidos || [];
    res.status(200).send({ Table: result.recordset.map(r => Object.assign(r, { protegido: protegidos.includes(r.codigo) })) });
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

  if (cat.valor && valor === null) return res.status(400).send({ message: 'El valor tiene que ser un número' });
  if (!cat.valor && !nombre) return res.status(400).send({ message: 'El nombre no puede estar vacío' });
  if (codigo && !CODIGO.test(codigo)) return res.status(400).send({ message: 'Código no válido: use letras, números o _' });

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
        codigo = await codigoLibre(pool, cat.tabla, base, id);
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
    const result = await pool.request().input('id', sql.Int, id).query(`
      select d.id, d.codigo, ${destino.valor ? 'isnull(d.nombre, cast(d.valor as varchar(20)))' : 'd.nombre'} as nombre, d.activo,
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
  return cat.valor ? `isnull(${alias}.nombre, cast(cast(${alias}.valor as float) as varchar(20)) + ' cm')` : `${alias}.nombre`;
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
    res.status(200).send({ elemento: elemento.nombre, longitud: CATALOGOS_CADENA.includes(req.params.catalogo), lineas: r.recordset });
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
      return `select '${clave}' as clave, '${cat.tabla}' as tabla, x.id, ${nombreElemento(cat, 'x')} as nombre, x.activo from dbo.${cat.tabla} x`;
    }).join(' union all ');
    const r = await pool.request().query(`
      with elementos as (${nombres})
      select e.clave, e.nombre as elemento_nombre, e.activo as elemento_activo, sup.*
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

/* ---------------- TEJIDOS DISPONIBLES (script 29) ---------------- */

/* Tejidos del maestro (SOL_TEJIDOS_MAESTRO, una fila por tejido + color) que se ofrecen en un
   producto del configurador (SOL_ACC_PRODUCTO_TEJIDO). Una sola lista para todos los clientes.
   De momento solo el enrollable; el configurador todavía no la lee */
async function productoValido(pool, producto) {
  if (producto === null) return false;
  const r = await pool.request().input('producto', sql.Int, producto)
    .query('select 1 as ok from dbo.SOL_ARTICULOS_PRODUCTOS where idrow = @producto');
  return r.recordset.length > 0;
}

/* GET /acc/tejidos/:producto — los tejidos activos del maestro, con disponible = 1/0 */
async function tejidos(req, res) {
  const producto = entero(req.params.producto);
  try {
    const pool = await sql.connect();
    if (!await productoValido(pool, producto)) return res.status(400).send({ message: 'Producto no válido' });
    const r = await pool.request().input('producto', sql.Int, producto).query(`
      select m.idrow as id, m.cod_solupyme, m.nombre, m.color, m.tipo_tejido, t.descripcion as tipo,
             m.criterio, m.impresion_digital, m.coste_m2, m.grupo,
             case when pt.tejido is null then 0 else 1 end as disponible
      from dbo.SOL_TEJIDOS_MAESTRO m
      left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
      left join dbo.SOL_ACC_PRODUCTO_TEJIDO pt on pt.tejido = m.idrow and pt.producto = @producto
      where m.activo = 1
      order by m.nombre, m.criterio, m.color`);
    res.status(200).send({ Table: r.recordset });
  } catch (err) {
    errorSql(err, res);
  }
}

/* POST /acc/tejidos/:producto { ids: [...], disponible } — marca o quita varios tejidos de una vez */
async function tejidos_guardar(req, res) {
  const producto = entero(req.params.producto);
  const body = req.body || {};
  const ids = [...new Set((body.ids || []).map(entero).filter(n => n !== null))];
  if (ids.length === 0) return res.status(400).send({ message: 'Faltan los tejidos' });

  let transaction;
  try {
    const pool = await sql.connect();
    if (!await productoValido(pool, producto)) return res.status(400).send({ message: 'Producto no válido' });
    const usuario = texto(req.user && (req.user.email || req.user.name), 100) || null;

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    /* De 500 en 500 para no pasar del límite de parámetros de SQL Server */
    for (let i = 0; i < ids.length; i += 500) {
      const lote = ids.slice(i, i + 500);
      const request = new sql.Request(transaction)
        .input('producto', sql.Int, producto)
        .input('usuario', sql.VarChar(100), usuario);
      lote.forEach((id, j) => request.input('id' + j, sql.Int, id));
      const enIds = lote.map((id, j) => '@id' + j).join(', ');
      if (body.disponible) {
        /* Solo tejidos activos del maestro; los que ya están se dejan como estaban */
        await request.query(`
          insert into dbo.SOL_ACC_PRODUCTO_TEJIDO (producto, tejido, usuario)
          select @producto, m.idrow, @usuario from dbo.SOL_TEJIDOS_MAESTRO m
          where m.idrow in (${enIds}) and m.activo = 1
            and not exists (select 1 from dbo.SOL_ACC_PRODUCTO_TEJIDO pt where pt.producto = @producto and pt.tejido = m.idrow)`);
      } else {
        await request.query(`delete from dbo.SOL_ACC_PRODUCTO_TEJIDO where producto = @producto and tejido in (${enIds})`);
      }
    }
    await transaction.commit();

    const total = await pool.request().input('producto', sql.Int, producto)
      .query('select count(*) as n from dbo.SOL_ACC_PRODUCTO_TEJIDO where producto = @producto');
    res.status(200).send({ message: 'OK', disponibles: total.recordset[0].n });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    errorSql(err, res);
  }
}

module.exports = {
  tejidos,
  tejidos_guardar,
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
