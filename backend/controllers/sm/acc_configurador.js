'use strict'

const sql = require('mssql');

/*
 * Configurador nuevo de accionamientos (modelo SOL_ACC_*), para los clientes con el
 * interruptor activo en SOL_ACC_CLIENTE. Leroy (clientes 1 y 5) no tiene fila y no pasa
 * por aquí: sigue con /api/lm/* y el configurador de siempre.
 * Scripts: C:\dev\sqlAccionamientos\ (04 interruptor, 05 y 08 columnas nacc_, 06 y 09 SPs de alta,
 *          07 soportes, tapas y contrapesos, 10 longitud de la cadena a medida,
 *          11-13 presupuestos y su conversión en pedido, 16-22 precio: suplementos, tarifa por
 *          sistema, precio base, valoración de la línea, desglose y alta con precio,
 *          29-31 tejidos del maestro: los disponibles, la línea los guarda y el precio T1/T2 con ellos;
 *          36 los disponibles son por sistema)
 *
 *   GET  /api/sm/acc_cfg/activo/:cliente       ¿usa el configurador nuevo?
 *   GET  /api/sm/acc_cfg/opciones/:cliente     árbol de opciones activas, con sus relaciones
 *   POST /api/sm/acc_cfg/precio/:cliente       precio de una línea con su desglose (sin grabar nada)
 *   POST /api/sm/acc_cfg/pedido/:cliente/:ref       alta del pedido (solo enrollables del flujo nuevo)
 *   POST /api/sm/acc_cfg/presupuesto/:cliente/:ref  alta del presupuesto (ídem)
 *   POST /api/sm/acc_cfg/presupuesto_a_pedido/:id   convertir en pedido un presupuesto del flujo nuevo
 *
 * Solar Mini (C:\dev\prod\sqlSolarMini 01-05; interruptor propio SOL_ACC_MINI_CLIENTE):
 *   GET  /api/sm/acc_cfg/mini/activo/:cliente    ¿usa el configurador nuevo del Solar Mini?
 *   GET  /api/sm/acc_cfg/mini/opciones/:cliente  listas activas del Solar Mini y sus tejidos
 *   POST /api/sm/acc_cfg/mini/precio/:cliente    precio de una línea de Solar Mini con su desglose
 *   El pedido y el presupuesto son los mismos de arriba: admiten líneas de enrollable y de Solar Mini.
 *
 * Cajón ZIP (C:\dev\prod\sqlCajonZip 01-05; interruptor propio SOL_ACC_ZIP_CLIENTE; tipo 6):
 *   GET  /api/sm/acc_cfg/zip/activo/:cliente     ¿usa el configurador nuevo del Cajón ZIP?
 *   GET  /api/sm/acc_cfg/zip/opciones/:cliente   listas activas del Cajón ZIP con sus relaciones y tejidos
 *   POST /api/sm/acc_cfg/zip/precio/:cliente     precio de una línea de Cajón ZIP con su desglose
 *   El pedido, el presupuesto y la conversión son los mismos de arriba: admiten también líneas de Cajón ZIP.
 *
 * Vertical (C:\dev\prod\sqlVertical 01-05; interruptor propio SOL_ACC_VER_CLIENTE; tipo 3). Leroy no pasa por aquí:
 *   GET  /api/sm/acc_cfg/ver/activo/:cliente     ¿usa el configurador nuevo del Vertical?
 *   GET  /api/sm/acc_cfg/ver/opciones/:cliente   tipos de vertical con sus propias listas, modalidades y tejidos
 *   POST /api/sm/acc_cfg/ver/precio/:cliente     precio de una línea de Vertical con su desglose (base pendiente de enlazar)
 *   Línea: { TipoCortina: 3, ancho, alto, cantidad, codeCentro, instrucciones, estancia_id, estancia_obs,
 *            nver: { tipo, modalidad, alto_min, alto_max, ancho_lama, posicion_mecanismo, color_riel, accionamiento,
 *                    soporte, recogida, tejido, tejido2 } }
 *   El pedido, el presupuesto y la conversión son los mismos de arriba: admiten también líneas de Vertical.
 *
 * Panel japonés (C:\dev\prod\sqlPanelJapones 01-06; interruptor propio SOL_ACC_PJ_CLIENTE; tipo 2). Leroy no pasa por aquí:
 *   GET  /api/sm/acc_cfg/pj/activo/:cliente      ¿usa el configurador nuevo del panel japonés?
 *   GET  /api/sm/acc_cfg/pj/opciones/:cliente    tipos de pedido, listas del mecanismo y tejidos (filas tejido + color)
 *   POST /api/sm/acc_cfg/pj/precio/:cliente      precio de una línea del panel con su desglose
 *   Línea: { TipoCortina: 2, ancho (mecanismo), alto (total; solo la completa), cantidad, codeCentro, tipo_tarifa ('T1'/'T2'),
 *            instrucciones, estancia_id, estancia_obs, impresion, impresion_imagen,
 *            npj: { modalidad, vias, portatelas, ancho_portatela (= ancho de lama), num_lamas, alto_lama, altura_mando (solo riel),
 *                   color_mecanismo, posicion_mando, recogida, contrapeso, soporte, tejido, combinacion, colores: [id por lama] } }
 *   En el solo tejido la línea no lleva ancho ni alto (van en npj). El pedido, el presupuesto y la conversión son los mismos.
 */

/* Mensajes de los códigos de sp_acc_pedido_tipo_1_add */
const ERRORES_LINEA = {
  '-1': 'El pedido no existe',
  '-2': 'El cliente no tiene activado el configurador nuevo',
  '-3': 'Accionamiento no válido',
  '-4': 'El sistema no está disponible para ese accionamiento',
  '-5': 'Tipo de cadena no válido',
  '-6': 'Hay datos de cadena que no corresponden a ese tipo de cadena',
  '-7': 'Altura no válida',
  '-8': 'El color no está permitido para esa altura o ese tipo de cadena',
  '-9': 'Hay datos de cadena o de motor que no corresponden al accionamiento',
  '-10': 'Tipo de motor no válido',
  '-11': 'Modelo de motor no válido',
  '-12': 'Mando, cargador o batería no asignado a ese modelo',
  '-13': 'El soporte no está disponible para ese sistema',
  '-14': 'Color de soporte no válido',
  '-15': 'La tapa no está disponible para ese sistema',
  '-16': 'Color de tapa no válido',
  '-17': 'Contrapeso no válido',
  '-18': 'Color de contrapeso no válido',
  '-19': 'Longitud de cadena no válida: obligatoria en la cadena a medida y solo en ella',
  '-20': 'El motor no está disponible para ese sistema',
  '-21': 'Precio de la línea incoherente',
  '-22': 'Desglose del precio no válido',
  '-23': 'Falta la tarifa (T1 o T2) con la que se calculó el precio',
  '-24': 'El tejido no está disponible en el configurador'
};

/* Mensajes de los códigos de sp_acc_mini_pedido_tipo_4_add / sp_acc_mini_presupuesto_tipo_4_add (sqlSolarMini/05) */
const ERRORES_MINI = {
  '-1': 'El documento no existe',
  '-2': 'El cliente no tiene activado el configurador nuevo del Solar Mini',
  '-21': 'Precio de la línea incoherente',
  '-22': 'Desglose del precio no válido',
  '-23': 'Falta la tarifa (T1 o T2) con la que se calculó el precio',
  '-30': 'Tipo de junquillo no válido',
  '-31': 'Elija un color de perfilería o un color RAL, no los dos',
  '-32': 'Color de perfilería no válido',
  '-33': 'Color RAL no válido',
  '-34': 'Color de cadena no válido',
  '-35': 'Color de tapas no válido',
  '-36': 'El tejido no está disponible para el Solar Mini',
  '-37': 'Posición del mando no válida',
  '-38': 'El segundo ancho es obligatorio con el junquillo Redondeado / Biselado, y solo con él',
  '-39': 'Altura de cadena no válida',
  '-40': 'Faltan las medidas o la cantidad',
  '-41': 'El tejido no admite impresión digital',
  '-42': 'Entre el ancho exterior y el interior no puede haber más de 2 cm de diferencia'
};

function entero(value) {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

/* Para los pasos que siguen en el modelo antiguo: sin valor = -1, como en el alta de siempre */
function enteroAntiguo(value) {
  const n = entero(value);
  return n === null ? -1 : n;
}

function decimal(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return isNaN(n) ? null : n;
}

/* Medidas en cm con decimales, en pasos de 0,5 como el configurador de siempre (frontend: config/medidas.ts).
   Devuelve el número, o null si falta, no es un número o no va en pasos de 0,5 */
const PASO_MEDIDA = 0.5;
const MAX_DIFERENCIA_BISELADO = 2;
function medida(value) {
  const n = decimal(value);
  if (n === null || n <= 0) return null;
  const pasos = n / PASO_MEDIDA;
  return Math.abs(pasos - Math.round(pasos)) > 1e-6 ? null : n;
}

/* Mensaje si alguna medida de la línea no es válida ('' si todas lo son). ancho2 solo si llega con valor */
function errorMedidas(l) {
  const vacio = (v) => v === null || v === undefined || v === '' || Number(v) === 0;
  if (medida(l.ancho) === null || medida(l.alto) === null) return 'El ancho y el alto tienen que ser mayores que 0 y en múltiplos de 0,5 cm';
  if (!vacio(l.ancho2) && medida(l.ancho2) === null) return 'El ancho exterior tiene que ir en múltiplos de 0,5 cm';
  /* Solar Mini Redondeado / Biselado (el único con ancho exterior): no más de 2 cm de diferencia con el interior */
  if (!vacio(l.ancho2) && Math.abs(medida(l.ancho2) - medida(l.ancho)) > MAX_DIFERENCIA_BISELADO) {
    return `Entre el ancho exterior y el interior no puede haber más de ${MAX_DIFERENCIA_BISELADO} cm de diferencia`;
  }
  return '';
}

function texto(value, max) {
  if (value === null || value === undefined) return null;
  const t = String(value).trim().substring(0, max);
  return t === '' ? null : t;
}

async function clienteActivo(pool, cliente) {
  const result = await pool.request().input('cliente', sql.Int, cliente)
    .query('select 1 as ok from dbo.SOL_ACC_CLIENTE where cliente = @cliente and activo = 1');
  return result.recordset.length > 0;
}

/* Interruptor del Solar Mini (sqlSolarMini/02), independiente del del enrollable */
async function miniActivo(pool, cliente) {
  const result = await pool.request().input('cliente', sql.Int, cliente)
    .query('select 1 as ok from dbo.SOL_ACC_MINI_CLIENTE where cliente = @cliente and activo = 1');
  return result.recordset.length > 0;
}

/* GET /acc_cfg/activo/:cliente — ante cualquier duda, false: el cliente sigue con el configurador de siempre */
async function activo(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(200).send({ activo: false });
  try {
    const pool = await sql.connect();
    res.status(200).send({ activo: await clienteActivo(pool, cliente) });
  } catch (err) {
    console.error(err);
    res.status(200).send({ activo: false });
  }
}

/* Agrupa las filas de una relación N:M en { origen: [destinos] } */
function agrupar(filas, origen, destino) {
  const mapa = {};
  filas.forEach(f => { (mapa[f[origen]] = mapa[f[origen]] || []).push(f[destino]); });
  return mapa;
}

/* GET /acc_cfg/opciones/:cliente — todo lo activo en una sola llamada (son catálogos pequeños);
   el configurador resuelve la cascada en el navegador con las listas de ids de cada opción */
async function opciones(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  try {
    const pool = await sql.connect();
    if (!await clienteActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo' });
    }
    const q = async (consulta) => (await pool.request().query(consulta)).recordset;
    const lista = (tabla, extra = '') =>
      q(`select id, codigo, nombre${extra} from dbo.${tabla} where activo = 1 order by orden, nombre`);

    const [accionamientos, sistemas, tiposCadena, alturas, colores,
           tiposMotor, modelos, mandos, cargadores, baterias,
           accSis, cadCol, altCol, motSis, modMan, modCar, modBat,
           soportes, tapas, contrapesos, coloresSoporte, coloresTapa, coloresContrapeso,
           sopSis, tapSis, conSis, sopCol, tapCol, conCol] = await Promise.all([
      lista('SOL_ACC_ACCIONAMIENTO'),
      lista('SOL_ACC_SISTEMA'),
      q(`select id, accionamiento_id, codigo, nombre from dbo.SOL_ACC_TIPO_CADENA where activo = 1 order by orden, nombre`),
      q(`select id, codigo, valor, nombre from dbo.SOL_ACC_ALTURA where activo = 1 order by orden, valor`),
      lista('SOL_ACC_COLOR_CADENA'),
      q(`select id, accionamiento_id, codigo, nombre from dbo.SOL_ACC_TIPO_MOTOR where activo = 1 order by orden, nombre`),
      q(`select id, tipo_motor_id, codigo, nombre from dbo.SOL_ACC_MODELO_MOTOR where activo = 1 order by orden, nombre`),
      lista('SOL_ACC_MANDO'),
      lista('SOL_ACC_CARGADOR'),
      lista('SOL_ACC_BATERIA'),
      q('select accionamiento_id, sistema_id from dbo.SOL_ACC_ACCIONAMIENTO_SISTEMA'),
      q('select tipo_cadena_id, color_cadena_id from dbo.SOL_ACC_TIPO_CADENA_COLOR'),
      /* script 34: colores de cadena que admite cada altura (Aro cadena) */
      q('select altura_id, color_cadena_id from dbo.SOL_ACC_ALTURA_COLOR'),
      q('select modelo_motor_id, sistema_id from dbo.SOL_ACC_MODELO_MOTOR_SISTEMA'),
      q('select modelo_motor_id, mando_id from dbo.SOL_ACC_MODELO_MOTOR_MANDO'),
      q('select modelo_motor_id, cargador_id from dbo.SOL_ACC_MODELO_MOTOR_CARGADOR'),
      q('select modelo_motor_id, bateria_id from dbo.SOL_ACC_MODELO_MOTOR_BATERIA'),
      lista('SOL_ACC_SOPORTE'),
      lista('SOL_ACC_TAPA'),
      lista('SOL_ACC_CONTRAPESO'),
      lista('SOL_ACC_COLOR_SOPORTE'),
      lista('SOL_ACC_COLOR_TAPA'),
      lista('SOL_ACC_COLOR_CONTRAPESO'),
      q('select soporte_id, sistema_id from dbo.SOL_ACC_SOPORTE_SISTEMA'),
      q('select tapa_id, sistema_id from dbo.SOL_ACC_TAPA_SISTEMA'),
      /* script 37: contrapesos de cada sistema */
      q('select contrapeso_id, sistema_id from dbo.SOL_ACC_CONTRAPESO_SISTEMA'),
      q('select soporte_id, color_soporte_id from dbo.SOL_ACC_SOPORTE_COLOR'),
      q('select tapa_id, color_tapa_id from dbo.SOL_ACC_TAPA_COLOR'),
      q('select contrapeso_id, color_contrapeso_id from dbo.SOL_ACC_CONTRAPESO_COLOR')
    ]);

    /* Tejidos del maestro disponibles en algún sistema (Productos -> Tejidos, script 36): una fila por
       tejido + color + criterio, con los sistemas que lo ofrecen. El configurador enseña los del sistema
       elegido y elige el criterio según el ancho de la cortina */
    const tejidosFilas = await q(`
      select m.idrow as id, m.nombre, m.color, m.criterio, m.grupo, m.impresion_digital, t.descripcion as tipo, st.sistema_id
      from dbo.SOL_ACC_SISTEMA_TEJIDO st
      join dbo.SOL_ACC_SISTEMA s on s.id = st.sistema_id and s.activo = 1
      join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = st.tejido and m.activo = 1
      left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
      order by t.descripcion, m.nombre, m.color, m.criterio`);
    const tejidos = [];
    const tejidoPorId = {};
    tejidosFilas.forEach(({ sistema_id, ...t }) => {
      if (!tejidoPorId[t.id]) { tejidoPorId[t.id] = Object.assign(t, { sistemas: [] }); tejidos.push(tejidoPorId[t.id]); }
      tejidoPorId[t.id].sistemas.push(sistema_id);
    });

    /* Solo se enlazan ids de opciones activas: una opción oculta desaparece de todas las listas */
    const activos = (filas) => new Set(filas.map(f => f.id));
    const sisActivos = activos(sistemas), colActivos = activos(colores), manActivos = activos(mandos),
          carActivos = activos(cargadores), batActivos = activos(baterias),
          colSopActivos = activos(coloresSoporte), colTapActivos = activos(coloresTapa), colConActivos = activos(coloresContrapeso);
    const filtrar = (ids, conjunto) => (ids || []).filter(id => conjunto.has(id));

    const sisPorAcc = agrupar(accSis, 'accionamiento_id', 'sistema_id');
    const colPorTipo = agrupar(cadCol, 'tipo_cadena_id', 'color_cadena_id');
    const colPorAltura = agrupar(altCol, 'altura_id', 'color_cadena_id');
    const sisPorModelo = agrupar(motSis, 'modelo_motor_id', 'sistema_id');
    const manPorModelo = agrupar(modMan, 'modelo_motor_id', 'mando_id');
    const carPorModelo = agrupar(modCar, 'modelo_motor_id', 'cargador_id');
    const batPorModelo = agrupar(modBat, 'modelo_motor_id', 'bateria_id');
    const sisPorSoporte = agrupar(sopSis, 'soporte_id', 'sistema_id');
    const sisPorTapa = agrupar(tapSis, 'tapa_id', 'sistema_id');
    const sisPorContrapeso = agrupar(conSis, 'contrapeso_id', 'sistema_id');
    const colPorSoporte = agrupar(sopCol, 'soporte_id', 'color_soporte_id');
    const colPorTapa = agrupar(tapCol, 'tapa_id', 'color_tapa_id');
    const colPorContrapeso = agrupar(conCol, 'contrapeso_id', 'color_contrapeso_id');

    res.status(200).send({
      accionamientos: accionamientos.map(a => Object.assign(a, { sistemas: filtrar(sisPorAcc[a.id], sisActivos) })),
      sistemas,
      tiposCadena: tiposCadena.map(t => Object.assign(t, {
        colores: filtrar(colPorTipo[t.id], colActivos)
      })),
      /* Aro cadena: cada altura con sus colores (script 34; antes había además tipos de aro) */
      alturas: alturas.map(a => Object.assign(a, { colores: filtrar(colPorAltura[a.id], colActivos) })),
      colores,
      /* Cada modelo con los sistemas a los que está asignado; el tipo, con los de sus modelos
         (un tipo aparece en un sistema si alguno de sus modelos está asignado a él) */
      tiposMotor: tiposMotor.map(t => {
        const mods = modelos.filter(m => m.tipo_motor_id === t.id).map(m => ({
          id: m.id, codigo: m.codigo, nombre: m.nombre,
          sistemas: filtrar(sisPorModelo[m.id], sisActivos),
          mandos: filtrar(manPorModelo[m.id], manActivos),
          cargadores: filtrar(carPorModelo[m.id], carActivos),
          baterias: filtrar(batPorModelo[m.id], batActivos)
        }));
        return Object.assign(t, { sistemas: [...new Set([].concat(...mods.map(m => m.sistemas)))], modelos: mods });
      }),
      mandos,
      cargadores,
      baterias,
      /* soportes, tapas y contrapesos: los del sistema elegido (sistemas). Cada uno con sus colores */
      soportes: soportes.map(x => Object.assign(x, { sistemas: filtrar(sisPorSoporte[x.id], sisActivos), colores: filtrar(colPorSoporte[x.id], colSopActivos) })),
      tapas: tapas.map(x => Object.assign(x, { sistemas: filtrar(sisPorTapa[x.id], sisActivos), colores: filtrar(colPorTapa[x.id], colTapActivos) })),
      contrapesos: contrapesos.map(x => Object.assign(x, { sistemas: filtrar(sisPorContrapeso[x.id], sisActivos), colores: filtrar(colPorContrapeso[x.id], colConActivos) })),
      coloresSoporte,
      coloresTapa,
      coloresContrapeso,
      tejidos
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ---------------- PRECIO (scripts 16-22) ---------------- */

/* Precio de una línea con sp_acc_precio_linea (scripts 19 y 25): la base sale del mapa guardado de
   la tarifa del generador del tipo elegido en el configurador (l.tipo_tarifa: 'T1' por grupo de
   tejido o 'T2' por tejido). Devuelve { codigo, mensaje, aviso } y, si codigo = 0, los importes por
   cortina, el total, las cinco partes para las columnas de siempre y el desglose. El aviso dice si
   falta la tarifa del otro tipo (o la elegida), para generarla. Se llama fuera de la transacción del
   alta. Las medidas se pasan igual que al alta (enteros en cm) para que coincida lo grabado */
async function precioLinea(pool, cliente, l) {
  const n = l.nacc || {};
  const d = (nombre) => [nombre, sql.Decimal(12, 2)];
  const salidas = [d('base'), d('importe_impresion'), d('suplementos'), d('unitario'), d('total'),
    d('col_tejido'), d('col_mando'), d('col_cargador'), d('col_contrapeso'), d('col_cadena')];
  const request = pool.request()
    .input('cliente', sql.Int, cliente)
    .input('ancho', sql.Decimal(12, 2), medida(l.ancho))
    .input('alto', sql.Decimal(12, 2), medida(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad) || 1)
    .input('tej_tipo_id', sql.Int, enteroAntiguo(l.tej_tipo_id))
    /* script 31: tejido del maestro (con él, tej_tipo_id llega a -1) */
    .input('tejido_maestro', sql.Int, entero(n.tejido))
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .input('tipo_tarifa', sql.VarChar(2), TIPOS_TARIFA.includes(l.tipo_tarifa) ? l.tipo_tarifa : null)
    .input('accionamiento', sql.Int, entero(n.accionamiento))
    .input('sistema', sql.Int, entero(n.sistema))
    .input('tipo_cadena', sql.Int, entero(n.tipo_cadena))
    .input('altura', sql.Int, entero(n.altura))
    .input('cadena_longitud', sql.Decimal(10, 2), decimal(n.cadena_longitud))
    .input('color_cadena', sql.Int, entero(n.color_cadena))
    .input('tipo_motor', sql.Int, entero(n.tipo_motor))
    .input('modelo_motor', sql.Int, entero(n.modelo_motor))
    .input('mando', sql.Int, entero(n.mando))
    .input('cargador', sql.Int, entero(n.cargador))
    .input('bateria', sql.Int, entero(n.bateria))
    .input('soporte', sql.Int, entero(n.soporte))
    .input('soporte_color', sql.Int, entero(n.soporte_color))
    .input('tapa', sql.Int, entero(n.tapa))
    .input('tapa_color', sql.Int, entero(n.tapa_color))
    .input('contrapeso', sql.Int, entero(n.contrapeso))
    .input('contrapeso_color', sql.Int, entero(n.contrapeso_color))
    .input('desglose', sql.Bit, 1)
    .output('tarifa', sql.Int)
    .output('mensaje', sql.VarChar(250))
    .output('aviso', sql.VarChar(250));
  salidas.forEach(([nombre, tipo]) => request.output(nombre, tipo));
  const r = await request.execute('sp_acc_precio_linea');
  const o = r.output;
  if (r.returnValue !== 0) {
    return { codigo: r.returnValue, mensaje: o.mensaje || 'No se puede calcular el precio', aviso: o.aviso || null };
  }
  return {
    codigo: 0,
    aviso: o.aviso || null,
    tipo_tarifa: l.tipo_tarifa,
    tarifa: o.tarifa,
    base: o.base, impresion: o.importe_impresion, suplementos: o.suplementos,
    unitario: o.unitario, total: o.total,
    columnas: { tejido: o.col_tejido, mando: o.col_mando, cargador: o.col_cargador, contrapeso: o.col_contrapeso, cadena: o.col_cadena },
    desglose: (r.recordset || []).map(f => ({ concepto: f.concepto, elemento: f.elemento, detalle: f.detalle, importe: f.importe }))
  };
}

/* Tarifas que puede elegir el configurador: T1 (por grupo de tejido) y T2 (por tejido) */
const TIPOS_TARIFA = ['T1', 'T2'];

/* El desglose va al SP del alta en XML: la BD está en nivel de compatibilidad 110 y no tiene OPENJSON */
function atributoXml(valor) {
  return String(valor === null || valor === undefined ? '' : valor)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function desgloseXml(desglose) {
  return '<d>' + desglose.map((f, i) =>
    `<l o="${i + 1}" c="${atributoXml(f.concepto)}" e="${atributoXml(f.elemento)}" t="${atributoXml(f.detalle)}" i="${Number(f.importe).toFixed(2)}"/>`
  ).join('') + '</d>';
}

/* POST /acc_cfg/precio/:cliente   body: una línea (la misma forma que en el alta). No graba nada */
async function precio(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  const l = req.body || {};
  if (!l.nacc) return res.status(400).send({ message: 'Falta la selección del accionamiento' });
  const errorM = errorMedidas(l);
  if (errorM) return res.status(400).send({ message: errorM });
  try {
    const pool = await sql.connect();
    if (!await clienteActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo' });
    }
    const p = await precioLinea(pool, cliente, l);
    if (p.codigo !== 0) return res.status(400).send({ message: p.mensaje, codigo: p.codigo, aviso: p.aviso });
    res.status(200).send(p);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ---------------- SOLAR MINI (sqlSolarMini/01-05) ----------------
   Mismo flujo que el enrollable, con sus propias listas (Productos → Solar Mini), su interruptor
   (SOL_ACC_MINI_CLIENTE) y su tarifa (producto Solar Mini en el generador). Una línea de Solar Mini:
   { TipoCortina: 4, ancho, ancho2 (solo con JR), alto, cantidad, codeCentro, tipo_tarifa ('T1' o 'T2'),
     nmini: { junquillo, color_perfil | color_ral, color_cadena, color_tapa, tejido (SOL_TEJIDOS_MAESTRO.idrow),
              altura_cadena (cm), posicion ('DER' o 'IZQ') },
     instrucciones, estancia_id, estancia_obs } */

/* GET /acc_cfg/mini/activo/:cliente — ante cualquier duda, false: el cliente sigue con el configurador de siempre */
async function mini_activo(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(200).send({ activo: false });
  try {
    const pool = await sql.connect();
    res.status(200).send({ activo: await miniActivo(pool, cliente) });
  } catch (err) {
    console.error(err);
    res.status(200).send({ activo: false });
  }
}

/* GET /acc_cfg/mini/opciones/:cliente — las listas activas del Solar Mini y sus tejidos del maestro */
async function mini_opciones(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  try {
    const pool = await sql.connect();
    if (!await miniActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del Solar Mini' });
    }
    const q = async (consulta) => (await pool.request().query(consulta)).recordset;
    const lista = (tabla) => q(`select id, codigo, nombre from dbo.${tabla} where activo = 1 order by orden, nombre`);
    const [junquillos, coloresPerfil, coloresRal, coloresCadena, coloresTapa, tejidos] = await Promise.all([
      lista('SOL_ACC_MINI_JUNQUILLO'),
      lista('SOL_ACC_MINI_COLOR_PERFIL'),
      lista('SOL_ACC_MINI_COLOR_RAL'),
      lista('SOL_ACC_MINI_COLOR_CADENA'),
      lista('SOL_ACC_MINI_COLOR_TAPA'),
      /* una fila por tejido + color + criterio; el configurador elige el criterio según el ancho */
      q(`select m.idrow as id, m.nombre, m.color, m.criterio, m.grupo, m.impresion_digital, t.descripcion as tipo
         from dbo.SOL_ACC_MINI_TEJIDO mt
         join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = mt.tejido and m.activo = 1
         left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
         order by t.descripcion, m.nombre, m.color, m.criterio`)
    ]);
    res.status(200).send({ junquillos, coloresPerfil, coloresRal, coloresCadena, coloresTapa, tejidos });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Precio de una línea de Solar Mini con sp_acc_mini_precio_linea (sqlSolarMini/04): base de la tarifa del
   producto Solar Mini (T1 o T2 con el tejido del maestro) + suplementos de sus listas. Misma respuesta que
   precioLinea (sin impresión ni columnas: el Solar Mini guarda el precio en T4_Tejido / T4_PVP) */
async function precioLineaMini(pool, cliente, l) {
  const n = l.nmini || {};
  const d = (nombre) => [nombre, sql.Decimal(12, 2)];
  const request = pool.request()
    .input('cliente', sql.Int, cliente)
    .input('ancho', sql.Decimal(12, 2), medida(l.ancho))
    .input('alto', sql.Decimal(12, 2), medida(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad) || 1)
    .input('tejido', sql.Int, entero(n.tejido))
    .input('tipo_tarifa', sql.VarChar(2), TIPOS_TARIFA.includes(l.tipo_tarifa) ? l.tipo_tarifa : null)
    .input('junquillo', sql.Int, entero(n.junquillo))
    .input('color_perfil', sql.Int, entero(n.color_perfil))
    .input('color_ral', sql.Int, entero(n.color_ral))
    .input('color_cadena', sql.Int, entero(n.color_cadena))
    .input('color_tapa', sql.Int, entero(n.color_tapa))
    .input('desglose', sql.Bit, 1)
    /* impresión digital: importe fijo, como el enrollable */
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .output('tarifa', sql.Int)
    .output('mensaje', sql.VarChar(250))
    .output('aviso', sql.VarChar(250));
  [d('base'), d('importe_impresion'), d('suplementos'), d('unitario'), d('total')].forEach(([nombre, tipo]) => request.output(nombre, tipo));
  const r = await request.execute('sp_acc_mini_precio_linea');
  const o = r.output;
  if (r.returnValue !== 0) {
    return { codigo: r.returnValue, mensaje: o.mensaje || 'No se puede calcular el precio', aviso: o.aviso || null };
  }
  return {
    codigo: 0,
    aviso: o.aviso || null,
    tipo_tarifa: l.tipo_tarifa,
    tarifa: o.tarifa,
    base: o.base, impresion: o.importe_impresion, suplementos: o.suplementos, unitario: o.unitario, total: o.total,
    desglose: (r.recordset || []).map(f => ({ concepto: f.concepto, elemento: f.elemento, detalle: f.detalle, importe: f.importe }))
  };
}

/* POST /acc_cfg/mini/precio/:cliente   body: una línea de Solar Mini. No graba nada */
async function mini_precio(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  const l = req.body || {};
  if (!l.nmini) return res.status(400).send({ message: 'Falta la selección del Solar Mini' });
  const errorM = errorMedidas(l);
  if (errorM) return res.status(400).send({ message: errorM });
  try {
    const pool = await sql.connect();
    if (!await miniActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del Solar Mini' });
    }
    const p = await precioLineaMini(pool, cliente, l);
    if (p.codigo !== 0) return res.status(400).send({ message: p.mensaje, codigo: p.codigo, aviso: p.aviso });
    res.status(200).send(p);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* ---------------- CAJÓN ZIP (sqlCajonZip/01-05) ----------------
   Producto propio (tipo 6), con sus listas (Productos → Cajón ZIP), su interruptor (SOL_ACC_ZIP_CLIENTE) y su
   tarifa (la del modelo de cajón en el generador). La raíz es el modelo de cajón. Una línea de Cajón ZIP:
   { TipoCortina: 6, ancho, alto, cantidad, codeCentro, tipo_tarifa ('T1' o 'T2'),
     nzip: { modelo_cajon, soporte, posicion_salida, color_cajon, vista ('EXTERIOR' o 'INTERIOR'),
             tejido (SOL_TEJIDOS_MAESTRO.idrow), tipo_motor, modelo_motor, mando, posicion (1 Derecha, 2 Izquierda),
             guia, color_guia, contrapeso, color_contrapeso, lacado },
     estancia_id, estancia_obs } */

/* Mensajes de los códigos de sp_acc_zip_pedido_tipo_6_add / sp_acc_zip_presupuesto_tipo_6_add (sqlCajonZip/05) */
const ERRORES_ZIP = {
  '-1': 'El documento no existe',
  '-2': 'El cliente no tiene activado el configurador nuevo del Cajón ZIP',
  '-21': 'Precio de la línea incoherente',
  '-22': 'Desglose del precio no válido',
  '-23': 'Falta la tarifa (T1 o T2) con la que se calculó el precio',
  '-30': 'Modelo de cajón no válido',
  '-31': 'El soporte no es de ese modelo de cajón',
  '-32': 'La posición de salida no es de ese modelo de cajón',
  '-33': 'El color del cajón no es de ese modelo de cajón',
  '-34': 'El tejido no está disponible para el Cajón ZIP',
  '-35': 'El tipo de motor no es de ese modelo de cajón',
  '-36': 'El motor no es de ese tipo de motor',
  '-37': 'El mando no es de ese motor',
  '-38': 'La guía no es de ese modelo de cajón',
  '-39': 'El color de la guía no es de esa guía',
  '-40': 'El contrapeso no es de esa guía',
  '-41': 'El color del contrapeso no es de ese contrapeso',
  '-42': 'Lacado no válido',
  '-43': 'Vista del cajón no válida (exterior o interior)',
  '-44': 'Posición del mando no válida',
  '-45': 'Faltan las medidas o la cantidad',
  '-46': 'La impresión digital necesita un tejido que la admita'
};

/* Interruptor del Cajón ZIP (sqlCajonZip/02), independiente de los del enrollable y del Solar Mini */
async function zipActivo(pool, cliente) {
  const result = await pool.request().input('cliente', sql.Int, cliente)
    .query('select 1 as ok from dbo.SOL_ACC_ZIP_CLIENTE where cliente = @cliente and activo = 1');
  return result.recordset.length > 0;
}

/* GET /acc_cfg/zip/activo/:cliente — ante cualquier duda, false: el cliente sigue con el configurador de siempre */
async function zip_activo(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(200).send({ activo: false });
  try {
    const pool = await sql.connect();
    res.status(200).send({ activo: await zipActivo(pool, cliente) });
  } catch (err) {
    console.error(err);
    res.status(200).send({ activo: false });
  }
}

/* GET /acc_cfg/zip/opciones/:cliente — todas las listas activas del Cajón ZIP con sus relaciones (ids de las
   opciones activas de cada una), para resolver la cascada en el navegador, y sus tejidos del maestro */
async function zip_opciones(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  try {
    const pool = await sql.connect();
    if (!await zipActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del Cajón ZIP' });
    }
    const q = async (consulta) => (await pool.request().query(consulta)).recordset;
    const lista = (tabla, extra = '') => q(`select id, codigo, nombre${extra} from dbo.${tabla} where activo = 1 order by orden, nombre`);
    const [modelosCajon, soportes, salidas, colores, tiposMotor, modelosMotor, mandos, guias, contrapesos, lacados,
           mcSop, mcSal, mcCol, mcTm, mcGuia, mmMan, gCon, gCol, cCol, tejidos, posiciones] = await Promise.all([
      lista('SOL_ACC_ZIP_MODELO_CAJON'),
      lista('SOL_ACC_ZIP_SOPORTE'),
      lista('SOL_ACC_ZIP_POSICION_SALIDA'),
      lista('SOL_ACC_ZIP_COLOR', ', ral, hex'),
      lista('SOL_ACC_ZIP_TIPO_MOTOR'),
      lista('SOL_ACC_ZIP_MODELO_MOTOR', ', tipo_motor_id'),
      lista('SOL_ACC_ZIP_MANDO'),
      lista('SOL_ACC_ZIP_GUIA'),
      lista('SOL_ACC_ZIP_CONTRAPESO'),
      lista('SOL_ACC_ZIP_LACADO'),
      q('select modelo_cajon_id, soporte_id from dbo.SOL_ACC_ZIP_MODELO_CAJON_SOPORTE'),
      q('select modelo_cajon_id, posicion_salida_id from dbo.SOL_ACC_ZIP_MODELO_CAJON_POSICION_SALIDA'),
      q('select modelo_cajon_id, color_id from dbo.SOL_ACC_ZIP_MODELO_CAJON_COLOR'),
      q('select modelo_cajon_id, tipo_motor_id from dbo.SOL_ACC_ZIP_MODELO_CAJON_TIPO_MOTOR'),
      q('select modelo_cajon_id, guia_id from dbo.SOL_ACC_ZIP_MODELO_CAJON_GUIA'),
      q('select modelo_motor_id, mando_id from dbo.SOL_ACC_ZIP_MODELO_MOTOR_MANDO'),
      q('select guia_id, contrapeso_id from dbo.SOL_ACC_ZIP_GUIA_CONTRAPESO'),
      q('select guia_id, color_id from dbo.SOL_ACC_ZIP_GUIA_COLOR'),
      q('select contrapeso_id, color_id from dbo.SOL_ACC_ZIP_CONTRAPESO_COLOR'),
      /* una fila por tejido + color + criterio; el configurador elige el criterio según el ancho */
      q(`select m.idrow as id, m.nombre, m.color, m.criterio, m.grupo, isnull(m.impresion_digital, 0) as impresion_digital, t.descripcion as tipo
         from dbo.SOL_ACC_ZIP_TEJIDO zt
         join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = zt.tejido and m.activo = 1
         left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
         order by t.descripcion, m.nombre, m.color, m.criterio`),
      /* posición del mando: Derecha e Izquierda del catálogo de siempre (como el enrollable nuevo) */
      q('select idrow as id, descripcion as nombre from dbo.SOL_ARTICULOS_POSICIONMANDO where idrow in (1, 2) order by idrow')
    ]);

    /* Solo se enlazan ids de opciones activas: una opción oculta desaparece de todas las listas */
    const activos = (filas) => new Set(filas.map(f => f.id));
    const filtrar = (ids, conjunto) => (ids || []).filter(id => conjunto.has(id));
    const sopA = activos(soportes), salA = activos(salidas), colA = activos(colores), tmA = activos(tiposMotor),
          guiaA = activos(guias), manA = activos(mandos), conA = activos(contrapesos);
    const sopPorModelo = agrupar(mcSop, 'modelo_cajon_id', 'soporte_id');
    const salPorModelo = agrupar(mcSal, 'modelo_cajon_id', 'posicion_salida_id');
    const colPorModelo = agrupar(mcCol, 'modelo_cajon_id', 'color_id');
    const tmPorModelo = agrupar(mcTm, 'modelo_cajon_id', 'tipo_motor_id');
    const guiaPorModelo = agrupar(mcGuia, 'modelo_cajon_id', 'guia_id');
    const manPorMotor = agrupar(mmMan, 'modelo_motor_id', 'mando_id');
    const conPorGuia = agrupar(gCon, 'guia_id', 'contrapeso_id');
    const colPorGuia = agrupar(gCol, 'guia_id', 'color_id');
    const colPorContrapeso = agrupar(cCol, 'contrapeso_id', 'color_id');

    res.status(200).send({
      modelosCajon: modelosCajon.map(m => Object.assign(m, {
        soportes: filtrar(sopPorModelo[m.id], sopA), salidas: filtrar(salPorModelo[m.id], salA),
        colores: filtrar(colPorModelo[m.id], colA), tiposMotor: filtrar(tmPorModelo[m.id], tmA),
        guias: filtrar(guiaPorModelo[m.id], guiaA)
      })),
      soportes, salidas, colores,
      /* cada tipo de motor con sus modelos, y cada modelo con sus mandos */
      tiposMotor: tiposMotor.map(t => Object.assign(t, {
        modelos: modelosMotor.filter(m => m.tipo_motor_id === t.id)
          .map(m => ({ id: m.id, codigo: m.codigo, nombre: m.nombre, mandos: filtrar(manPorMotor[m.id], manA) }))
      })),
      mandos,
      guias: guias.map(g => Object.assign(g, { contrapesos: filtrar(conPorGuia[g.id], conA), colores: filtrar(colPorGuia[g.id], colA) })),
      contrapesos: contrapesos.map(c => Object.assign(c, { colores: filtrar(colPorContrapeso[c.id], colA) })),
      lacados,
      tejidos,
      posiciones,
      vistas: [{ id: 'EXTERIOR', nombre: 'Visto desde el exterior' }, { id: 'INTERIOR', nombre: 'Visto desde el interior' }]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Precio de una línea de Cajón ZIP con sp_acc_zip_precio_linea (sqlCajonZip/04): base de la tarifa del modelo
   de cajón (T1 o T2 con el tejido del maestro) + suplementos de sus listas. Misma respuesta que precioLineaMini */
async function precioLineaZip(pool, cliente, l) {
  const n = l.nzip || {};
  const d = (nombre) => [nombre, sql.Decimal(12, 2)];
  const request = pool.request()
    .input('cliente', sql.Int, cliente)
    .input('ancho', sql.Decimal(12, 2), medida(l.ancho))
    .input('alto', sql.Decimal(12, 2), medida(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad) || 1)
    .input('modelo_cajon', sql.Int, entero(n.modelo_cajon))
    .input('tejido', sql.Int, entero(n.tejido))
    .input('tipo_tarifa', sql.VarChar(2), TIPOS_TARIFA.includes(l.tipo_tarifa) ? l.tipo_tarifa : null)
    .input('soporte', sql.Int, entero(n.soporte))
    .input('posicion_salida', sql.Int, entero(n.posicion_salida))
    .input('color_cajon', sql.Int, entero(n.color_cajon))
    .input('tipo_motor', sql.Int, entero(n.tipo_motor))
    .input('modelo_motor', sql.Int, entero(n.modelo_motor))
    .input('mando', sql.Int, entero(n.mando))
    .input('guia', sql.Int, entero(n.guia))
    .input('color_guia', sql.Int, entero(n.color_guia))
    .input('contrapeso', sql.Int, entero(n.contrapeso))
    .input('color_contrapeso', sql.Int, entero(n.color_contrapeso))
    .input('lacado', sql.Int, entero(n.lacado))
    .input('desglose', sql.Bit, 1)
    /* impresión digital: importe fijo por cortina del producto (sqlImpresion/02) */
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .output('tarifa', sql.Int)
    .output('mensaje', sql.VarChar(250))
    .output('aviso', sql.VarChar(250));
  [d('base'), d('importe_impresion'), d('suplementos'), d('unitario'), d('total')].forEach(([nombre, tipo]) => request.output(nombre, tipo));
  const r = await request.execute('sp_acc_zip_precio_linea');
  const o = r.output;
  if (r.returnValue !== 0) {
    return { codigo: r.returnValue, mensaje: o.mensaje || 'No se puede calcular el precio', aviso: o.aviso || null };
  }
  return {
    codigo: 0,
    aviso: o.aviso || null,
    tipo_tarifa: l.tipo_tarifa,
    tarifa: o.tarifa,
    base: o.base, impresion: o.importe_impresion, suplementos: o.suplementos, unitario: o.unitario, total: o.total,
    desglose: (r.recordset || []).map(f => ({ concepto: f.concepto, elemento: f.elemento, detalle: f.detalle, importe: f.importe }))
  };
}

/* POST /acc_cfg/zip/precio/:cliente   body: una línea de Cajón ZIP. No graba nada */
async function zip_precio(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  const l = req.body || {};
  if (!l.nzip) return res.status(400).send({ message: 'Falta la selección del Cajón ZIP' });
  const errorM = errorMedidas(l);
  if (errorM) return res.status(400).send({ message: errorM });
  try {
    const pool = await sql.connect();
    if (!await zipActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del Cajón ZIP' });
    }
    const p = await precioLineaZip(pool, cliente, l);
    if (p.codigo !== 0) return res.status(400).send({ message: p.mensaje, codigo: p.codigo, aviso: p.aviso });
    res.status(200).send(p);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Alta de una línea de Cajón ZIP dentro de la transacción del documento */
async function altaLineaZip(transaction, doc, idDocumento, l, p) {
  const n = l.nzip || {};
  return new sql.Request(transaction)
    .input(doc.id, sql.Int, idDocumento)
    .input('centro', sql.Int, entero(l.codeCentro) || 1)
    .input('modelo_cajon', sql.Int, entero(n.modelo_cajon))
    .input('ancho', sql.Decimal(12, 2), medida(l.ancho))
    .input('alto', sql.Decimal(12, 2), medida(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad))
    .input('soporte', sql.Int, entero(n.soporte))
    .input('posicion_salida', sql.Int, entero(n.posicion_salida))
    .input('color_cajon', sql.Int, entero(n.color_cajon))
    .input('vista', sql.VarChar(10), String(n.vista || '').toUpperCase().substring(0, 10))
    .input('tejido', sql.Int, entero(n.tejido))
    .input('tipo_motor', sql.Int, entero(n.tipo_motor))
    .input('modelo_motor', sql.Int, entero(n.modelo_motor))
    .input('mando', sql.Int, entero(n.mando))
    .input('posicion', sql.Int, entero(n.posicion))
    .input('guia', sql.Int, entero(n.guia))
    .input('color_guia', sql.Int, entero(n.color_guia))
    .input('contrapeso', sql.Int, entero(n.contrapeso))
    .input('color_contrapeso', sql.Int, entero(n.color_contrapeso))
    .input('lacado', sql.Int, entero(n.lacado))
    .input('estancia_id', sql.Int, enteroAntiguo(l.estancia_id))
    .input('estancia', sql.VarChar(2500), texto(l.estancia_obs, 2500))
    .input('pvp_unitario', sql.Decimal(12, 2), p.unitario)
    .input('desglose', sql.Xml, desgloseXml(p.desglose))
    .input('tipo_tarifa', sql.VarChar(2), p.tipo_tarifa)
    /* sqlImpresion/03 */
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .input('impresion_imagen', sql.VarChar(250), texto(l.impresion_imagen, 250))
    .execute(doc.lineaZip);
}

/* ---------------- VERTICAL (sqlVertical 01-05; interruptor propio SOL_ACC_VER_CLIENTE; tipo 3) ---------------- */

/* Mensajes de los códigos de sp_acc_ver_pedido_tipo_3_add / sp_acc_ver_presupuesto_tipo_3_add (sqlVertical/04) */
const ERRORES_VER = {
  '-1': 'El documento no existe',
  '-2': 'El cliente no tiene activado el configurador nuevo del Vertical',
  '-21': 'Precio de la línea incoherente',
  '-22': 'Desglose del precio no válido',
  '-50': 'Tipo de vertical no válido',
  '-51': 'Esa modalidad no está disponible para el tipo de vertical',
  '-52': 'Ancho de lama no válido para ese tipo y esa modalidad',
  '-53': 'Posición del mecanismo no válida para ese tipo y esa modalidad',
  '-54': 'Color del riel no válido para ese tipo y esa modalidad',
  '-55': 'Accionamiento no válido para ese tipo y esa modalidad',
  '-56': 'Soporte no válido para ese tipo y esa modalidad',
  '-57': 'Recogida no válida para ese tipo y esa modalidad',
  '-58': 'El tejido no está disponible para ese tipo de vertical (o la modalidad no lleva tejido)',
  '-59': 'Combinada no válida: solo en la Normal completa y con otro color del mismo tejido',
  '-60': 'Medidas o cantidad no válidas para esa modalidad',
  '-61': 'Inclinada: indique el espacio a cubrir y el alto mínimo y máximo (mínimo menor que máximo, 30° como mucho)',
  '-62': 'La impresión digital solo se puede pedir en la completa, sin combinar colores y con un tejido que la admita'
};

/* Interruptor del Vertical (sqlVertical/02), independiente de los demás productos */
async function verActivo(pool, cliente) {
  const result = await pool.request().input('cliente', sql.Int, cliente)
    .query('select 1 as ok from dbo.SOL_ACC_VER_CLIENTE where cliente = @cliente and activo = 1');
  return result.recordset.length > 0;
}

/* Medidas del Vertical: cada modalidad lleva las suyas (solo tejido sin ancho, solo mecanismo sin alto, la
   inclinada con alto mínimo y máximo); qué toca a cada una lo comprueba el SP (-60/-61). Aquí solo que las que
   lleguen sean números > 0 en pasos de 0,5 y que la cantidad sea un entero > 0 */
function errorMedidasVer(l) {
  const n = l.nver || {};
  const vacio = (v) => v === null || v === undefined || v === '';
  const nombres = { ancho: l.ancho, alto: l.alto, 'alto mínimo': n.alto_min, 'alto máximo': n.alto_max };
  for (const nombre of Object.keys(nombres)) {
    if (!vacio(nombres[nombre]) && medida(nombres[nombre]) === null) {
      return `El ${nombre} tiene que ser mayor que 0 y en múltiplos de 0,5 cm`;
    }
  }
  const cantidad = Number(l.cantidad);
  if (!Number.isInteger(cantidad) || cantidad <= 0) return 'La cantidad tiene que ser un número entero mayor que 0';
  return '';
}

/* Medida opcional: null si no llega */
function medidaVer(value) {
  return value === null || value === undefined || value === '' ? null : medida(value);
}

/* GET /acc_cfg/ver/activo/:cliente — ante cualquier duda, false */
async function ver_activo(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(200).send({ activo: false });
  try {
    const pool = await sql.connect();
    res.status(200).send({ activo: await verActivo(pool, cliente) });
  } catch (err) {
    console.error(err);
    res.status(200).send({ activo: false });
  }
}

/* GET /acc_cfg/ver/opciones/:cliente — los tipos de vertical activos, cada uno con SUS listas (solo lo activo),
   sus modalidades y los ids de sus tejidos; los tejidos del maestro van una sola vez */
async function ver_opciones(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  try {
    const pool = await sql.connect();
    if (!await verActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del Vertical' });
    }
    const q = async (consulta) => (await pool.request().query(consulta)).recordset;
    const porTipo = (tabla, extra = '') =>
      q(`select id, tipo_id, codigo, nombre${extra} from dbo.${tabla} where activo = 1 order by orden, ${extra ? 'valor' : 'nombre'}`);
    const [tipos, modalidades, tipoMod, lamas, posiciones, rieles, accionamientos, soportes, recogidas, tipoTej, tejidos] = await Promise.all([
      q('select id, codigo, nombre from dbo.SOL_ACC_VER_TIPO where activo = 1 order by orden, nombre'),
      q('select id, codigo, nombre from dbo.SOL_ACC_VER_MODALIDAD where activo = 1 order by orden, nombre'),
      q('select tipo_id, modalidad_id from dbo.SOL_ACC_VER_TIPO_MODALIDAD'),
      /* ancho de lama: el nombre es opcional; si no lo hay se enseña el valor en mm */
      q(`select id, tipo_id, codigo, isnull(nombre, cast(cast(valor as float) as varchar(20)) + ' mm') as nombre, valor
         from dbo.SOL_ACC_VER_ANCHO_LAMA where activo = 1 order by orden, valor`),
      porTipo('SOL_ACC_VER_POSICION_MECANISMO'),
      porTipo('SOL_ACC_VER_COLOR_RIEL'),
      porTipo('SOL_ACC_VER_ACCIONAMIENTO'),
      porTipo('SOL_ACC_VER_SOPORTE'),
      porTipo('SOL_ACC_VER_RECOGIDA'),
      q('select vt.tipo_id, vt.tejido from dbo.SOL_ACC_VER_TIPO_TEJIDO vt join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = vt.tejido and m.activo = 1'),
      /* una fila por tejido + color + criterio, solo los que tiene algún tipo */
      q(`select m.idrow as id, m.nombre, m.color, m.criterio, m.grupo, isnull(m.impresion_digital, 0) as impresion_digital, t.descripcion as tipo
         from dbo.SOL_TEJIDOS_MAESTRO m
         left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
         where m.activo = 1 and exists (select 1 from dbo.SOL_ACC_VER_TIPO_TEJIDO vt where vt.tejido = m.idrow)
         order by t.descripcion, m.nombre, m.color, m.criterio`)
    ]);

    /* Solo se enlazan modalidades activas */
    const modA = new Set(modalidades.map(m => m.id));
    const modPorTipo = agrupar(tipoMod, 'tipo_id', 'modalidad_id');
    const tejPorTipo = agrupar(tipoTej, 'tipo_id', 'tejido');
    const de = (filas, tipo) => filas.filter(f => f.tipo_id === tipo).map(f => {
      const { tipo_id, ...resto } = f;
      return resto;
    });

    res.status(200).send({
      tipos: tipos.map(t => Object.assign(t, {
        modalidades: (modPorTipo[t.id] || []).filter(id => modA.has(id)),
        anchosLama: de(lamas, t.id),
        posiciones: de(posiciones, t.id),
        coloresRiel: de(rieles, t.id),
        accionamientos: de(accionamientos, t.id),
        soportes: de(soportes, t.id),
        recogidas: de(recogidas, t.id),
        tejidos: tejPorTipo[t.id] || []
      })),
      modalidades,
      tejidos
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Precio de una línea de Vertical con sp_acc_ver_precio_linea (sqlVertical/03 y 10): base por tipo + ancho de lama +
   tejido (mecanismo y tejido, cada uno una línea del desglose; sin tarifa, 0 y aviso) + suplementos de sus listas. Misma respuesta que precioLineaMini. En la inclinada el alto es el máximo */
async function precioLineaVer(pool, cliente, l) {
  const n = l.nver || {};
  const alto = medidaVer(l.alto) !== null ? medidaVer(l.alto) : medidaVer(n.alto_max);
  const d = (nombre) => [nombre, sql.Decimal(12, 2)];
  const request = pool.request()
    .input('cliente', sql.Int, cliente)
    .input('tipo', sql.Int, entero(n.tipo))
    .input('modalidad', sql.Int, entero(n.modalidad))
    .input('ancho', sql.Decimal(12, 2), medidaVer(l.ancho))
    .input('alto', sql.Decimal(12, 2), alto)
    .input('cantidad', sql.Int, entero(l.cantidad) || 1)
    .input('ancho_lama', sql.Int, entero(n.ancho_lama))
    .input('posicion_mecanismo', sql.Int, entero(n.posicion_mecanismo))
    .input('color_riel', sql.Int, entero(n.color_riel))
    .input('accionamiento', sql.Int, entero(n.accionamiento))
    .input('soporte', sql.Int, entero(n.soporte))
    .input('recogida', sql.Int, entero(n.recogida))
    .input('tejido', sql.Int, entero(n.tejido))
    .input('tejido2', sql.Int, entero(n.tejido2))
    .input('desglose', sql.Bit, 1)
    /* impresión digital: importe fijo por cortina del producto, solo completa sin combinada (sqlImpresion/02) */
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .output('tarifa', sql.Int)
    .output('mensaje', sql.VarChar(250))
    .output('aviso', sql.VarChar(250));
  [d('base'), d('importe_impresion'), d('suplementos'), d('unitario'), d('total')].forEach(([nombre, tipo]) => request.output(nombre, tipo));
  const r = await request.execute('sp_acc_ver_precio_linea');
  const o = r.output;
  if (r.returnValue !== 0) {
    return { codigo: r.returnValue, mensaje: o.mensaje || 'No se puede calcular el precio', aviso: o.aviso || null };
  }
  return {
    codigo: 0,
    aviso: o.aviso || null,
    tipo_tarifa: null,
    tarifa: o.tarifa,
    base: o.base, impresion: o.importe_impresion, suplementos: o.suplementos, unitario: o.unitario, total: o.total,
    desglose: (r.recordset || []).map(f => ({ concepto: f.concepto, elemento: f.elemento, detalle: f.detalle, importe: f.importe }))
  };
}

/* POST /acc_cfg/ver/precio/:cliente   body: una línea de Vertical. No graba nada */
async function ver_precio(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  const l = req.body || {};
  if (!l.nver) return res.status(400).send({ message: 'Falta la selección del Vertical' });
  const errorM = errorMedidasVer(l);
  if (errorM) return res.status(400).send({ message: errorM });
  try {
    const pool = await sql.connect();
    if (!await verActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del Vertical' });
    }
    const p = await precioLineaVer(pool, cliente, l);
    if (p.codigo !== 0) return res.status(400).send({ message: p.mensaje, codigo: p.codigo, aviso: p.aviso });
    res.status(200).send(p);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Alta de una línea de Vertical dentro de la transacción del documento */
async function altaLineaVer(transaction, doc, idDocumento, l, p) {
  const n = l.nver || {};
  return new sql.Request(transaction)
    .input(doc.id, sql.Int, idDocumento)
    .input('centro', sql.Int, entero(l.codeCentro) || 1)
    .input('tipo', sql.Int, entero(n.tipo))
    .input('modalidad', sql.Int, entero(n.modalidad))
    .input('ancho', sql.Decimal(12, 2), medidaVer(l.ancho))
    .input('alto', sql.Decimal(12, 2), medidaVer(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad))
    .input('alto_min', sql.Decimal(12, 2), medidaVer(n.alto_min))
    .input('alto_max', sql.Decimal(12, 2), medidaVer(n.alto_max))
    .input('ancho_lama', sql.Int, entero(n.ancho_lama))
    .input('posicion_mecanismo', sql.Int, entero(n.posicion_mecanismo))
    .input('color_riel', sql.Int, entero(n.color_riel))
    .input('accionamiento', sql.Int, entero(n.accionamiento))
    .input('soporte', sql.Int, entero(n.soporte))
    .input('recogida', sql.Int, entero(n.recogida))
    .input('tejido', sql.Int, entero(n.tejido))
    .input('tejido2', sql.Int, entero(n.tejido2))
    .input('instrucciones', sql.VarChar(250), texto(l.instrucciones, 250))
    .input('estancia_id', sql.Int, enteroAntiguo(l.estancia_id))
    .input('estancia', sql.VarChar(2500), texto(l.estancia_obs, 2500))
    .input('pvp_unitario', sql.Decimal(12, 2), p.unitario)
    .input('desglose', sql.Xml, desgloseXml(p.desglose))
    /* sqlImpresion/03 */
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .input('impresion_imagen', sql.VarChar(250), texto(l.impresion_imagen, 250))
    .execute(doc.lineaVer);
}

/* ---------------- PANEL JAPONÉS (sqlPanelJapones 01-06; interruptor propio SOL_ACC_PJ_CLIENTE; tipo 2) ---------------- */

/* Mensajes de los códigos de sp_acc_pj_pedido_tipo_2_add / sp_acc_pj_presupuesto_tipo_2_add (sqlPanelJapones/05) */
const ERRORES_PJ = {
  '-1': 'El documento no existe',
  '-2': 'El cliente no tiene activado el configurador nuevo del panel japonés',
  '-21': 'Precio de la línea incoherente',
  '-22': 'Desglose del precio no válido',
  '-70': 'Tipo de pedido no válido',
  '-71': 'Número de vías no válido (la completa y el solo riel lo necesitan; el solo tejido no lo lleva)',
  '-72': 'Portatelas o lamas no válidas: las portatelas van de las vías al doble y, en la completa, hay tantas lamas como portatelas',
  '-73': 'Color del mecanismo no válido para ese tipo de pedido',
  '-74': 'Posición del mando no válida para ese tipo de pedido',
  '-75': 'Tipo de recogida no válido para ese tipo de pedido',
  '-76': 'Contrapeso no válido para ese tipo de pedido',
  '-77': 'Tipo de soporte no válido para ese tipo de pedido',
  '-78': 'El tejido no está disponible para el panel japonés (o el tipo de pedido no lleva tejido)',
  '-79': 'Colores de las lamas no válidos: uno por lama y del mismo tejido (sin combinación, todos el del tejido)',
  '-80': 'Medidas no válidas para ese tipo de pedido',
  '-81': 'La cantidad tiene que ser mayor que 0',
  '-82': 'La impresión digital solo se puede pedir con tejido y con colores que la admitan'
};

/* Interruptor del panel japonés (sqlPanelJapones/02), independiente de los demás productos */
async function pjActivo(pool, cliente) {
  const result = await pool.request().input('cliente', sql.Int, cliente)
    .query('select 1 as ok from dbo.SOL_ACC_PJ_CLIENTE where cliente = @cliente and activo = 1');
  return result.recordset.length > 0;
}

/* Número > 0 con como mucho dos decimales (ancho de portatela = ancho / vías + 5, alto de lama, altura del mando):
   null si no llega o no vale */
function medidaLibre(value) {
  const n = decimal(value);
  return n === null || n <= 0 ? null : Math.round(n * 100) / 100;
}

/* Medidas del panel: el ancho y el alto de la línea en pasos de 0,5 (la completa y el solo riel); las de la lama y la
   altura del mando, números > 0. Qué lleva cada tipo de pedido lo comprueba el SP (-80). Cantidad: entero > 0 */
function errorMedidasPj(l) {
  const n = l.npj || {};
  const vacio = (v) => v === null || v === undefined || v === '';
  if (!vacio(l.ancho) && medida(l.ancho) === null) return 'El ancho tiene que ser mayor que 0 y en múltiplos de 0,5 cm';
  if (!vacio(l.alto) && medida(l.alto) === null) return 'El alto tiene que ser mayor que 0 y en múltiplos de 0,5 cm';
  const libres = { 'ancho de portatela': n.ancho_portatela, 'alto de lama': n.alto_lama, 'altura del mando': n.altura_mando };
  for (const nombre of Object.keys(libres)) {
    if (!vacio(libres[nombre]) && medidaLibre(libres[nombre]) === null) return `El ${nombre} tiene que ser mayor que 0`;
  }
  const cantidad = Number(l.cantidad);
  if (!Number.isInteger(cantidad) || cantidad <= 0) return 'La cantidad tiene que ser un número entero mayor que 0';
  return '';
}

/* Colores de las lamas: array de ids del maestro (o "id,id") → "id,id,id"; null si no llega ninguno */
function coloresPj(valor) {
  const lista = Array.isArray(valor) ? valor : (valor === null || valor === undefined ? [] : String(valor).split(','));
  const ids = lista.map(v => entero(v));
  if (ids.length === 0) return null;
  return ids.map(v => (v === null ? '' : String(v))).join(',');
}

/* GET /acc_cfg/pj/activo/:cliente — ante cualquier duda, false */
async function pj_activo(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(200).send({ activo: false });
  try {
    const pool = await sql.connect();
    res.status(200).send({ activo: await pjActivo(pool, cliente) });
  } catch (err) {
    console.error(err);
    res.status(200).send({ activo: false });
  }
}

/* GET /acc_cfg/pj/opciones/:cliente — tipos de pedido, listas del mecanismo y tejidos activos (una fila por tejido +
   color: los colores de las lamas son las filas del mismo tejido) */
async function pj_opciones(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  try {
    const pool = await sql.connect();
    if (!await pjActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del panel japonés' });
    }
    const q = async (consulta) => (await pool.request().query(consulta)).recordset;
    const lista = (tabla) => q(`select id, codigo, nombre from dbo.${tabla} where activo = 1 order by orden, nombre`);
    const [modalidades, vias, colores, mandos, recogidas, contrapesos, soportes, tejidos] = await Promise.all([
      lista('SOL_ACC_PJ_MODALIDAD'),
      /* vías: el nombre es opcional; si no lo hay, "3 vías" */
      q(`select id, codigo, cast(valor as int) as valor, isnull(nombre, cast(cast(valor as int) as varchar(10)) + ' vías') as nombre
         from dbo.SOL_ACC_PJ_VIAS where activo = 1 order by orden, valor`),
      lista('SOL_ACC_PJ_COLOR_MECANISMO'),
      lista('SOL_ACC_PJ_POSICION_MANDO'),
      lista('SOL_ACC_PJ_RECOGIDA'),
      lista('SOL_ACC_PJ_CONTRAPESO'),
      lista('SOL_ACC_PJ_SOPORTE'),
      q(`select m.idrow as id, m.nombre, m.color, m.criterio, m.grupo, isnull(m.impresion_digital, 0) as impresion_digital, t.descripcion as tipo
         from dbo.SOL_ACC_PJ_TEJIDO pt
         join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = pt.tejido and m.activo = 1
         left join dbo.SOL_TEJIDOS_TIPOS t on t.idrow = m.tipo_tejido
         order by t.descripcion, m.nombre, m.color, m.criterio`)
    ]);
    res.status(200).send({ modalidades, vias, coloresMecanismo: colores, posicionesMando: mandos, recogidas, contrapesos, soportes, tejidos });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Precio de una línea del panel con sp_acc_pj_precio_linea (sqlPanelJapones/04): completa y solo tejido con la tarifa
   del generador (T1/T2, l.tipo_tarifa), solo riel con su tarifa propia; más suplementos e impresión. Misma respuesta
   que precioLineaMini */
async function precioLineaPj(pool, cliente, l) {
  const n = l.npj || {};
  const d = (nombre) => [nombre, sql.Decimal(12, 2)];
  const request = pool.request()
    .input('cliente', sql.Int, cliente)
    .input('modalidad', sql.Int, entero(n.modalidad))
    .input('ancho', sql.Decimal(12, 2), medidaVer(l.ancho))
    .input('alto', sql.Decimal(12, 2), medidaVer(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad) || 1)
    .input('vias', sql.Int, entero(n.vias))
    .input('num_lamas', sql.Int, entero(n.num_lamas))
    .input('ancho_lama', sql.Decimal(12, 2), medidaLibre(n.ancho_portatela))
    .input('alto_lama', sql.Decimal(12, 2), medidaLibre(n.alto_lama))
    .input('color_mecanismo', sql.Int, entero(n.color_mecanismo))
    .input('posicion_mando', sql.Int, entero(n.posicion_mando))
    .input('recogida', sql.Int, entero(n.recogida))
    .input('contrapeso', sql.Int, entero(n.contrapeso))
    .input('soporte', sql.Int, entero(n.soporte))
    .input('tejido', sql.Int, entero(n.tejido))
    .input('tipo_tarifa', sql.VarChar(2), TIPOS_TARIFA.includes(l.tipo_tarifa) ? l.tipo_tarifa : null)
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .input('desglose', sql.Bit, 1)
    .output('tarifa', sql.Int)
    .output('mensaje', sql.VarChar(250))
    .output('aviso', sql.VarChar(250));
  [d('base'), d('importe_impresion'), d('suplementos'), d('unitario'), d('total')].forEach(([nombre, tipo]) => request.output(nombre, tipo));
  const r = await request.execute('sp_acc_pj_precio_linea');
  const o = r.output;
  if (r.returnValue !== 0) {
    return { codigo: r.returnValue, mensaje: o.mensaje || 'No se puede calcular el precio', aviso: o.aviso || null };
  }
  return {
    codigo: 0,
    aviso: o.aviso || null,
    tipo_tarifa: l.tipo_tarifa || null,
    tarifa: o.tarifa,
    base: o.base, impresion: o.importe_impresion, suplementos: o.suplementos, unitario: o.unitario, total: o.total,
    desglose: (r.recordset || []).map(f => ({ concepto: f.concepto, elemento: f.elemento, detalle: f.detalle, importe: f.importe }))
  };
}

/* POST /acc_cfg/pj/precio/:cliente   body: una línea del panel japonés. No graba nada */
async function pj_precio(req, res) {
  const cliente = entero(req.params.cliente);
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  const l = req.body || {};
  if (!l.npj) return res.status(400).send({ message: 'Falta la selección del panel japonés' });
  const errorM = errorMedidasPj(l);
  if (errorM) return res.status(400).send({ message: errorM });
  try {
    const pool = await sql.connect();
    if (!await pjActivo(pool, cliente)) {
      return res.status(403).send({ message: 'El cliente no tiene activado el configurador nuevo del panel japonés' });
    }
    const p = await precioLineaPj(pool, cliente, l);
    if (p.codigo !== 0) return res.status(400).send({ message: p.mensaje, codigo: p.codigo, aviso: p.aviso });
    res.status(200).send(p);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* Alta de una línea del panel japonés dentro de la transacción del documento */
async function altaLineaPj(transaction, doc, idDocumento, l, p) {
  const n = l.npj || {};
  return new sql.Request(transaction)
    .input(doc.id, sql.Int, idDocumento)
    .input('centro', sql.Int, entero(l.codeCentro) || 1)
    .input('modalidad', sql.Int, entero(n.modalidad))
    .input('ancho', sql.Decimal(12, 2), medidaVer(l.ancho))
    .input('alto', sql.Decimal(12, 2), medidaVer(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad))
    .input('vias', sql.Int, entero(n.vias))
    .input('portatelas', sql.Int, entero(n.portatelas))
    .input('altura_mando', sql.Decimal(12, 2), medidaLibre(n.altura_mando))
    .input('color_mecanismo', sql.Int, entero(n.color_mecanismo))
    .input('posicion_mando', sql.Int, entero(n.posicion_mando))
    .input('recogida', sql.Int, entero(n.recogida))
    .input('contrapeso', sql.Int, entero(n.contrapeso))
    .input('soporte', sql.Int, entero(n.soporte))
    .input('ancho_portatela', sql.Decimal(12, 2), medidaLibre(n.ancho_portatela))
    .input('num_lamas', sql.Int, entero(n.num_lamas))
    .input('alto_lama', sql.Decimal(12, 2), medidaLibre(n.alto_lama))
    .input('tejido', sql.Int, entero(n.tejido))
    .input('combinacion', sql.Bit, n.combinacion === true || n.combinacion === 1 ? 1 : 0)
    .input('colores', sql.VarChar(4000), coloresPj(n.colores))
    .input('instrucciones', sql.VarChar(250), texto(l.instrucciones, 250))
    .input('estancia_id', sql.Int, enteroAntiguo(l.estancia_id))
    .input('estancia', sql.VarChar(2500), texto(l.estancia_obs, 2500))
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .input('impresion_imagen', sql.VarChar(250), texto(l.impresion_imagen, 250))
    .input('pvp_unitario', sql.Decimal(12, 2), p.unitario)
    .input('desglose', sql.Xml, desgloseXml(p.desglose))
    /* sqlPanelJapones/02 y 05: tarifa elegida (T1/T2), para recalcular al cargar un presupuesto */
    .input('tipo_tarifa', sql.VarChar(2), p.tipo_tarifa)
    .execute(doc.lineaPj);
}

/* Pedido y presupuesto se graban igual; solo cambian los SPs y el nombre de sus parámetros */
const DOCUMENTOS = {
  pedido:      { cabecera: 'sp_acc_pedido_add', ref: 'refPedido', linea: 'sp_acc_pedido_tipo_1_add',
                 lineaMini: 'sp_acc_mini_pedido_tipo_4_add', lineaZip: 'sp_acc_zip_pedido_tipo_6_add',
                 lineaVer: 'sp_acc_ver_pedido_tipo_3_add', lineaPj: 'sp_acc_pj_pedido_tipo_2_add',
                 id: 'idPedido', nombre: 'pedido' },
  presupuesto: { cabecera: 'sp_acc_presupuesto_add', ref: 'refPresupuesto', linea: 'sp_acc_presupuesto_tipo_1_add',
                 lineaMini: 'sp_acc_mini_presupuesto_tipo_4_add', lineaZip: 'sp_acc_zip_presupuesto_tipo_6_add',
                 lineaVer: 'sp_acc_ver_presupuesto_tipo_3_add', lineaPj: 'sp_acc_pj_presupuesto_tipo_2_add',
                 id: 'idPresupuesto', nombre: 'presupuesto' }
};

const esEnrollableNuevo = (l) => entero(l.TipoCortina) === 1 && !!l.nacc;
const esMiniNuevo = (l) => entero(l.TipoCortina) === 4 && !!l.nmini;
const esZipNuevo = (l) => entero(l.TipoCortina) === 6 && !!l.nzip;
const esVerNuevo = (l) => entero(l.TipoCortina) === 3 && !!l.nver;
const esPjNuevo = (l) => entero(l.TipoCortina) === 2 && !!l.npj;

/* Alta de una línea de Solar Mini dentro de la transacción del documento */
async function altaLineaMini(transaction, doc, idDocumento, l, p) {
  const n = l.nmini || {};
  const posicion = String(n.posicion || '').toUpperCase();
  return new sql.Request(transaction)
    .input(doc.id, sql.Int, idDocumento)
    .input('centro', sql.Int, entero(l.codeCentro) || 1)
    .input('junquillo', sql.Int, entero(n.junquillo))
    .input('ancho', sql.Decimal(12, 2), medida(l.ancho))
    .input('ancho2', sql.Decimal(12, 2), medida(l.ancho2) || 0)
    .input('alto', sql.Decimal(12, 2), medida(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad))
    .input('color_perfil', sql.Int, entero(n.color_perfil))
    .input('color_ral', sql.Int, entero(n.color_ral))
    .input('color_cadena', sql.Int, entero(n.color_cadena))
    .input('altura_cadena', sql.Decimal(10, 2), decimal(n.altura_cadena))
    .input('posicion', sql.VarChar(3), posicion.substring(0, 3))
    .input('color_tapa', sql.Int, entero(n.color_tapa))
    .input('tejido', sql.Int, entero(n.tejido))
    .input('instrucciones', sql.VarChar(250), texto(l.instrucciones, 250))
    .input('estancia_id', sql.Int, enteroAntiguo(l.estancia_id))
    .input('estancia', sql.VarChar(2500), texto(l.estancia_obs, 2500))
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .input('impresion_imagen', sql.VarChar(250), texto(l.impresion_imagen, 250))
    .input('pvp_unitario', sql.Decimal(12, 2), p.unitario)
    .input('desglose', sql.Xml, desgloseXml(p.desglose))
    .input('tipo_tarifa', sql.VarChar(2), p.tipo_tarifa)
    .execute(doc.lineaMini);
}

/* POST /acc_cfg/pedido/:cliente/:ref y /acc_cfg/presupuesto/:cliente/:ref   body: [ líneas ]
   Cada línea: { TipoCortina: 1, ancho, alto, cantidad, codeCentro, tipo_tarifa ('T1' o 'T2'),
                 nacc: { accionamiento, sistema, tipo_cadena, altura,
                         color_cadena, tipo_motor, modelo_motor, mando, cargador, bateria,
                         soporte, soporte_color, tapa, tapa_color, contrapeso, contrapeso_color,
                         cadena_longitud (cm, solo en la cadena a medida),
                         tejido (SOL_TEJIDOS_MAESTRO.idrow; con él tej_tipo_id/tej_color_id van a -1) },
                 y los pasos que siguen en el modelo antiguo con los nombres de CortinaTipo:
                 acc_tubo_id, acc_posicion_id, tej_tipo_id, tej_color_id, tej_salida_id,
                 Tipo1_Cajon, Tipo1_Guia, impresion, impresion_imagen, instrucciones, estancia_id, estancia_obs }
   El precio lo calcula aquí el servidor (no se fía del navegador), ANTES de la transacción porque
   la rejilla sincronizada se lee de un servidor remoto; una línea sin precio rechaza el documento.
   Todo el documento va en una transacción: si una línea no es válida no se graba nada. */
async function alta(doc, req, res) {
  const cliente = entero(req.params.cliente);
  /* El configurador manda '-' cuando no hay referencia (la ruta necesita el segmento) */
  const referencia = req.params.ref === '-' ? '' : (texto(req.params.ref, 255) || '');
  const lineas = Array.isArray(req.body) ? req.body : [];
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  if (lineas.length === 0) return res.status(400).send({ message: `El ${doc.nombre} no tiene líneas` });

  /* sqlSolarMini/05, sqlCajonZip/05, sqlVertical/04 y sqlPanelJapones/05: enrollables (nacc), Solar Mini (nmini),
     Cajón ZIP (nzip), Vertical (nver) y panel japonés (npj) nuevos pueden ir en el mismo documento */
  const otras = lineas.findIndex(l => !esEnrollableNuevo(l) && !esMiniNuevo(l) && !esZipNuevo(l) && !esVerNuevo(l) && !esPjNuevo(l));
  if (otras >= 0) {
    return res.status(400).send({ message: `Línea ${otras + 1}: el configurador nuevo, de momento, solo admite enrollables, Solar Mini, Cajón ZIP, Vertical y panel japonés` });
  }
  for (let i = 0; i < lineas.length; i++) {
    /* el Vertical y el panel tienen sus propias medidas (cada modalidad lleva las suyas) */
    const errorM = esVerNuevo(lineas[i]) ? errorMedidasVer(lineas[i])
      : esPjNuevo(lineas[i]) ? errorMedidasPj(lineas[i]) : errorMedidas(lineas[i]);
    if (errorM) return res.status(400).send({ message: `Línea ${i + 1}: ${errorM}` });
  }

  let transaction;
  try {
    const pool = await sql.connect();

    /* Cada producto con su interruptor (los SPs lo vuelven a comprobar) */
    if (lineas.some(esEnrollableNuevo) && !await clienteActivo(pool, cliente)) {
      return res.status(400).send({ message: ERRORES_LINEA['-2'] });
    }
    if (lineas.some(esMiniNuevo) && !await miniActivo(pool, cliente)) {
      return res.status(400).send({ message: ERRORES_MINI['-2'] });
    }
    if (lineas.some(esZipNuevo) && !await zipActivo(pool, cliente)) {
      return res.status(400).send({ message: ERRORES_ZIP['-2'] });
    }
    if (lineas.some(esVerNuevo) && !await verActivo(pool, cliente)) {
      return res.status(400).send({ message: ERRORES_VER['-2'] });
    }
    if (lineas.some(esPjNuevo) && !await pjActivo(pool, cliente)) {
      return res.status(400).send({ message: ERRORES_PJ['-2'] });
    }

    /* Precio de cada línea, fuera de la transacción */
    const precios = [];
    for (let i = 0; i < lineas.length; i++) {
      const l = lineas[i];
      const p = esMiniNuevo(l) ? await precioLineaMini(pool, cliente, l)
        : esZipNuevo(l) ? await precioLineaZip(pool, cliente, l)
        : esVerNuevo(l) ? await precioLineaVer(pool, cliente, l)
        : esPjNuevo(l) ? await precioLineaPj(pool, cliente, l) : await precioLinea(pool, cliente, l);
      if (p.codigo !== 0) return res.status(400).send({ message: `Línea ${i + 1}: ${p.mensaje}` });
      precios.push(p);
    }

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const cabecera = await new sql.Request(transaction)
      .input('cliente', sql.Int, cliente)
      .input('referencia', sql.VarChar(255), referencia)
      .output(doc.ref, sql.VarChar(255))
      .execute(doc.cabecera);
    const idDocumento = cabecera.returnValue;
    if (!(idDocumento > 0)) {
      await transaction.rollback();
      return res.status(400).send({ message: ERRORES_LINEA[String(idDocumento)] || `No se pudo crear el ${doc.nombre}` });
    }

    for (let i = 0; i < lineas.length; i++) {
      const l = lineas[i];
      if (esMiniNuevo(l)) {
        const rm = await altaLineaMini(transaction, doc, idDocumento, l, precios[i]);
        if (!(rm.returnValue > 0)) {
          await transaction.rollback();
          const motivo = ERRORES_MINI[String(rm.returnValue)] || 'Línea no válida';
          return res.status(400).send({ message: `Línea ${i + 1}: ${motivo}` });
        }
        continue;
      }
      if (esVerNuevo(l)) {
        const rv = await altaLineaVer(transaction, doc, idDocumento, l, precios[i]);
        if (!(rv.returnValue > 0)) {
          await transaction.rollback();
          const motivo = ERRORES_VER[String(rv.returnValue)] || 'Línea no válida';
          return res.status(400).send({ message: `Línea ${i + 1}: ${motivo}` });
        }
        continue;
      }
      if (esPjNuevo(l)) {
        const rp = await altaLineaPj(transaction, doc, idDocumento, l, precios[i]);
        if (!(rp.returnValue > 0)) {
          await transaction.rollback();
          const motivo = ERRORES_PJ[String(rp.returnValue)] || 'Línea no válida';
          return res.status(400).send({ message: `Línea ${i + 1}: ${motivo}` });
        }
        continue;
      }
      if (esZipNuevo(l)) {
        const rz = await altaLineaZip(transaction, doc, idDocumento, l, precios[i]);
        if (!(rz.returnValue > 0)) {
          await transaction.rollback();
          const motivo = ERRORES_ZIP[String(rz.returnValue)] || 'Línea no válida';
          return res.status(400).send({ message: `Línea ${i + 1}: ${motivo}` });
        }
        continue;
      }
      const n = l.nacc || {};
      const r = await new sql.Request(transaction)
        .input(doc.id, sql.Int, idDocumento)
        .input('centro', sql.Int, entero(l.codeCentro) || 1)
        .input('ancho', sql.Decimal(12, 2), medida(l.ancho))
        .input('alto', sql.Decimal(12, 2), medida(l.alto))
        .input('cantidad', sql.Int, entero(l.cantidad))
        .input('accionamiento', sql.Int, entero(n.accionamiento))
        .input('sistema', sql.Int, entero(n.sistema))
        .input('tipo_cadena', sql.Int, entero(n.tipo_cadena))
        .input('altura', sql.Int, entero(n.altura))
        .input('cadena_longitud', sql.Decimal(10, 2), decimal(n.cadena_longitud))
        .input('color_cadena', sql.Int, entero(n.color_cadena))
        .input('tipo_motor', sql.Int, entero(n.tipo_motor))
        .input('modelo_motor', sql.Int, entero(n.modelo_motor))
        .input('mando', sql.Int, entero(n.mando))
        .input('cargador', sql.Int, entero(n.cargador))
        .input('bateria', sql.Int, entero(n.bateria))
        .input('soporte', sql.Int, entero(n.soporte))
        .input('soporte_color', sql.Int, entero(n.soporte_color))
        .input('tapa', sql.Int, entero(n.tapa))
        .input('tapa_color', sql.Int, entero(n.tapa_color))
        .input('contrapeso', sql.Int, entero(n.contrapeso))
        .input('contrapeso_color', sql.Int, entero(n.contrapeso_color))
        /* script 30: tejido del maestro */
        .input('tejido', sql.Int, entero(n.tejido))
        .input('acc_tubo_id', sql.Int, enteroAntiguo(l.acc_tubo_id))
        .input('acc_posicion_id', sql.Int, enteroAntiguo(l.acc_posicion_id))
        .input('tej_tipo_id', sql.Int, enteroAntiguo(l.tej_tipo_id))
        .input('tej_color_id', sql.Int, enteroAntiguo(l.tej_color_id))
        .input('tej_salida_id', sql.Int, enteroAntiguo(l.tej_salida_id))
        .input('idcajon', sql.Int, enteroAntiguo(l.Tipo1_Cajon))
        .input('idguia', sql.Int, enteroAntiguo(l.Tipo1_Guia))
        .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
        .input('impresion_imagen', sql.VarChar(250), texto(l.impresion_imagen, 250))
        .input('instrucciones', sql.VarChar(250), texto(l.instrucciones, 250))
        .input('estancia_id', sql.Int, enteroAntiguo(l.estancia_id))
        .input('estancia', sql.VarChar(2500), texto(l.estancia_obs, 2500))
        .input('pvp_unitario', sql.Decimal(12, 2), precios[i].unitario)
        .input('pvp_tejido', sql.Decimal(12, 2), precios[i].columnas.tejido)
        .input('pvp_mando', sql.Decimal(12, 2), precios[i].columnas.mando)
        .input('pvp_cargador', sql.Decimal(12, 2), precios[i].columnas.cargador)
        .input('pvp_contrapeso', sql.Decimal(12, 2), precios[i].columnas.contrapeso)
        .input('pvp_cadena', sql.Decimal(12, 2), precios[i].columnas.cadena)
        .input('desglose', sql.Xml, desgloseXml(precios[i].desglose))
        .input('tipo_tarifa', sql.VarChar(2), precios[i].tipo_tarifa)
        .execute(doc.linea);
      if (!(r.returnValue > 0)) {
        await transaction.rollback();
        const motivo = ERRORES_LINEA[String(r.returnValue)] || 'Línea no válida';
        return res.status(400).send({ message: `Línea ${i + 1}: ${motivo}` });
      }
    }

    await transaction.commit();
    res.status(200).send({ message: 'OK', id: idDocumento, idPedido: idDocumento, referencia: cabecera.output[doc.ref] });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

function pedido(req, res) { return alta(DOCUMENTOS.pedido, req, res); }
function presupuesto(req, res) { return alta(DOCUMENTOS.presupuesto, req, res); }

/* POST /acc_cfg/presupuesto_a_pedido/:id — solo presupuestos del configurador nuevo (sp_acc_presupuesto_a_pedido).
   Los demás se convierten con el botón de siempre, que no se toca */
const ERRORES_CONVERSION = {
  '-1': 'El presupuesto no existe',
  '-2': 'El cliente del presupuesto no tiene activado el configurador nuevo: use "Convertir a Pedido"',
  '-3': 'El presupuesto no es del configurador nuevo (o tiene líneas de otros productos): use "Convertir a Pedido"'
};

async function presupuesto_a_pedido(req, res) {
  const id = entero(req.params.id);
  if (id === null) return res.status(400).send({ message: 'Presupuesto no válido' });
  try {
    const pool = await sql.connect();
    const r = await pool.request().input('idPresupuesto', sql.Int, id).execute('sp_acc_presupuesto_a_pedido');
    if (r.returnValue > 0) {
      const p = await pool.request().input('id', sql.Int, r.returnValue)
        .query('select REFERENCIA as referencia from dbo.SOL_PEDIDOS_COLA where IDROW = @id');
      return res.status(200).send({ message: 'OK', idPedido: r.returnValue, referencia: (p.recordset[0] || {}).referencia });
    }
    res.status(400).send({ message: ERRORES_CONVERSION[String(r.returnValue)] || 'No se pudo convertir el presupuesto' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

module.exports = {
  activo,
  opciones,
  precio,
  mini_activo,
  mini_opciones,
  mini_precio,
  zip_activo,
  zip_opciones,
  zip_precio,
  ver_activo,
  ver_opciones,
  ver_precio,
  pj_activo,
  pj_opciones,
  pj_precio,
  pedido,
  presupuesto,
  presupuesto_a_pedido
};
