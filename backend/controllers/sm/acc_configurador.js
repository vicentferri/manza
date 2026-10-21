'use strict'

const sql = require('mssql');

/*
 * Configurador nuevo de accionamientos (modelo SOL_ACC_*), para los clientes con el
 * interruptor activo en SOL_ACC_CLIENTE. Leroy (clientes 1 y 5) no tiene fila y no pasa
 * por aquí: sigue con /api/lm/* y el configurador de siempre.
 * Scripts: C:\dev\sqlAccionamientos\ (04 interruptor, 05 y 08 columnas nacc_, 06 y 09 SPs de alta,
 *          07 soportes, tapas y contrapesos, 10 longitud de la cadena a medida,
 *          11-13 presupuestos y su conversión en pedido, 16-22 precio: suplementos, tarifa por
 *          sistema, precio base, valoración de la línea, desglose y alta con precio)
 *
 *   GET  /api/sm/acc_cfg/activo/:cliente       ¿usa el configurador nuevo?
 *   GET  /api/sm/acc_cfg/opciones/:cliente     árbol de opciones activas, con sus relaciones
 *   POST /api/sm/acc_cfg/precio/:cliente       precio de una línea con su desglose (sin grabar nada)
 *   POST /api/sm/acc_cfg/pedido/:cliente/:ref       alta del pedido (solo enrollables del flujo nuevo)
 *   POST /api/sm/acc_cfg/presupuesto/:cliente/:ref  alta del presupuesto (ídem)
 *   POST /api/sm/acc_cfg/presupuesto_a_pedido/:id   convertir en pedido un presupuesto del flujo nuevo
 */

/* Mensajes de los códigos de sp_acc_pedido_tipo_1_add */
const ERRORES_LINEA = {
  '-1': 'El pedido no existe',
  '-2': 'El cliente no tiene activado el configurador nuevo',
  '-3': 'Accionamiento no válido',
  '-4': 'El sistema no está disponible para ese accionamiento',
  '-5': 'Tipo de cadena no válido',
  '-6': 'Tipo de aro o de cadena a medida no válido para ese tipo de cadena',
  '-7': 'Altura no válida',
  '-8': 'El color no está permitido para ese tipo de cadena',
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
  '-23': 'Falta la tarifa (T1 o T2) con la que se calculó el precio'
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

    const [accionamientos, sistemas, tiposCadena, aros, medidas, alturas, colores,
           tiposMotor, modelos, mandos, cargadores, baterias,
           accSis, cadCol, motSis, modMan, modCar, modBat,
           soportes, tapas, contrapesos, coloresSoporte, coloresTapa, coloresContrapeso,
           sopSis, tapSis, sopCol, tapCol, conCol] = await Promise.all([
      lista('SOL_ACC_ACCIONAMIENTO'),
      lista('SOL_ACC_SISTEMA'),
      q(`select id, accionamiento_id, codigo, nombre from dbo.SOL_ACC_TIPO_CADENA where activo = 1 order by orden, nombre`),
      q(`select id, tipo_cadena_id, codigo, nombre from dbo.SOL_ACC_TIPO_ARO_CADENA where activo = 1 order by orden, nombre`),
      q(`select id, tipo_cadena_id, codigo, nombre from dbo.SOL_ACC_TIPO_CADENA_MEDIDA where activo = 1 order by orden, nombre`),
      q(`select id, codigo, valor, nombre from dbo.SOL_ACC_ALTURA where activo = 1 order by orden, valor`),
      lista('SOL_ACC_COLOR_CADENA'),
      q(`select id, accionamiento_id, codigo, nombre from dbo.SOL_ACC_TIPO_MOTOR where activo = 1 order by orden, nombre`),
      q(`select id, tipo_motor_id, codigo, nombre from dbo.SOL_ACC_MODELO_MOTOR where activo = 1 order by orden, nombre`),
      lista('SOL_ACC_MANDO'),
      lista('SOL_ACC_CARGADOR'),
      lista('SOL_ACC_BATERIA'),
      q('select accionamiento_id, sistema_id from dbo.SOL_ACC_ACCIONAMIENTO_SISTEMA'),
      q('select tipo_cadena_id, color_cadena_id from dbo.SOL_ACC_TIPO_CADENA_COLOR'),
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
      q('select soporte_id, color_soporte_id from dbo.SOL_ACC_SOPORTE_COLOR'),
      q('select tapa_id, color_tapa_id from dbo.SOL_ACC_TAPA_COLOR'),
      q('select contrapeso_id, color_contrapeso_id from dbo.SOL_ACC_CONTRAPESO_COLOR')
    ]);

    /* Solo se enlazan ids de opciones activas: una opción oculta desaparece de todas las listas */
    const activos = (filas) => new Set(filas.map(f => f.id));
    const sisActivos = activos(sistemas), colActivos = activos(colores), manActivos = activos(mandos),
          carActivos = activos(cargadores), batActivos = activos(baterias),
          colSopActivos = activos(coloresSoporte), colTapActivos = activos(coloresTapa), colConActivos = activos(coloresContrapeso);
    const filtrar = (ids, conjunto) => (ids || []).filter(id => conjunto.has(id));

    const sisPorAcc = agrupar(accSis, 'accionamiento_id', 'sistema_id');
    const colPorTipo = agrupar(cadCol, 'tipo_cadena_id', 'color_cadena_id');
    const sisPorModelo = agrupar(motSis, 'modelo_motor_id', 'sistema_id');
    const manPorModelo = agrupar(modMan, 'modelo_motor_id', 'mando_id');
    const carPorModelo = agrupar(modCar, 'modelo_motor_id', 'cargador_id');
    const batPorModelo = agrupar(modBat, 'modelo_motor_id', 'bateria_id');
    const sisPorSoporte = agrupar(sopSis, 'soporte_id', 'sistema_id');
    const sisPorTapa = agrupar(tapSis, 'tapa_id', 'sistema_id');
    const colPorSoporte = agrupar(sopCol, 'soporte_id', 'color_soporte_id');
    const colPorTapa = agrupar(tapCol, 'tapa_id', 'color_tapa_id');
    const colPorContrapeso = agrupar(conCol, 'contrapeso_id', 'color_contrapeso_id');

    res.status(200).send({
      accionamientos: accionamientos.map(a => Object.assign(a, { sistemas: filtrar(sisPorAcc[a.id], sisActivos) })),
      sistemas,
      tiposCadena: tiposCadena.map(t => Object.assign(t, {
        colores: filtrar(colPorTipo[t.id], colActivos),
        aros: aros.filter(x => x.tipo_cadena_id === t.id).map(({ id, codigo, nombre }) => ({ id, codigo, nombre })),
        medidas: medidas.filter(x => x.tipo_cadena_id === t.id).map(({ id, codigo, nombre }) => ({ id, codigo, nombre }))
      })),
      alturas,
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
      /* soportes y tapas: los del sistema elegido (sistemas); contrapesos: todos. Cada uno con sus colores */
      soportes: soportes.map(x => Object.assign(x, { sistemas: filtrar(sisPorSoporte[x.id], sisActivos), colores: filtrar(colPorSoporte[x.id], colSopActivos) })),
      tapas: tapas.map(x => Object.assign(x, { sistemas: filtrar(sisPorTapa[x.id], sisActivos), colores: filtrar(colPorTapa[x.id], colTapActivos) })),
      contrapesos: contrapesos.map(x => Object.assign(x, { colores: filtrar(colPorContrapeso[x.id], colConActivos) })),
      coloresSoporte,
      coloresTapa,
      coloresContrapeso
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
    .input('ancho', sql.Decimal(12, 2), entero(l.ancho))
    .input('alto', sql.Decimal(12, 2), entero(l.alto))
    .input('cantidad', sql.Int, entero(l.cantidad) || 1)
    .input('tej_tipo_id', sql.Int, enteroAntiguo(l.tej_tipo_id))
    .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
    .input('tipo_tarifa', sql.VarChar(2), TIPOS_TARIFA.includes(l.tipo_tarifa) ? l.tipo_tarifa : null)
    .input('accionamiento', sql.Int, entero(n.accionamiento))
    .input('sistema', sql.Int, entero(n.sistema))
    .input('tipo_cadena', sql.Int, entero(n.tipo_cadena))
    .input('tipo_aro', sql.Int, entero(n.tipo_aro))
    .input('cadena_medida', sql.Int, entero(n.cadena_medida))
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

/* Pedido y presupuesto se graban igual; solo cambian los SPs y el nombre de sus parámetros */
const DOCUMENTOS = {
  pedido:      { cabecera: 'sp_acc_pedido_add', ref: 'refPedido', linea: 'sp_acc_pedido_tipo_1_add', id: 'idPedido', nombre: 'pedido' },
  presupuesto: { cabecera: 'sp_acc_presupuesto_add', ref: 'refPresupuesto', linea: 'sp_acc_presupuesto_tipo_1_add', id: 'idPresupuesto', nombre: 'presupuesto' }
};

/* POST /acc_cfg/pedido/:cliente/:ref y /acc_cfg/presupuesto/:cliente/:ref   body: [ líneas ]
   Cada línea: { TipoCortina: 1, ancho, alto, cantidad, codeCentro, tipo_tarifa ('T1' o 'T2'),
                 nacc: { accionamiento, sistema, tipo_cadena, tipo_aro, cadena_medida, altura,
                         color_cadena, tipo_motor, modelo_motor, mando, cargador, bateria,
                         soporte, soporte_color, tapa, tapa_color, contrapeso, contrapeso_color,
                         cadena_longitud (cm, solo en la cadena a medida) },
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

  const otras = lineas.findIndex(l => entero(l.TipoCortina) !== 1 || !l.nacc);
  if (otras >= 0) {
    return res.status(400).send({ message: `Línea ${otras + 1}: el configurador nuevo, de momento, solo admite enrollables` });
  }

  let transaction;
  try {
    const pool = await sql.connect();

    /* Precio de cada línea, fuera de la transacción */
    const precios = [];
    for (let i = 0; i < lineas.length; i++) {
      const p = await precioLinea(pool, cliente, lineas[i]);
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
      const n = l.nacc || {};
      const r = await new sql.Request(transaction)
        .input(doc.id, sql.Int, idDocumento)
        .input('centro', sql.Int, entero(l.codeCentro) || 1)
        .input('ancho', sql.Int, entero(l.ancho))
        .input('alto', sql.Int, entero(l.alto))
        .input('cantidad', sql.Int, entero(l.cantidad))
        .input('accionamiento', sql.Int, entero(n.accionamiento))
        .input('sistema', sql.Int, entero(n.sistema))
        .input('tipo_cadena', sql.Int, entero(n.tipo_cadena))
        .input('tipo_aro', sql.Int, entero(n.tipo_aro))
        .input('cadena_medida', sql.Int, entero(n.cadena_medida))
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
  pedido,
  presupuesto,
  presupuesto_a_pedido
};
