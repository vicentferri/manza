'use strict'

const sql = require('mssql');

/*
 * Configurador nuevo de accionamientos (modelo SOL_ACC_*), para los clientes con el
 * interruptor activo en SOL_ACC_CLIENTE. Leroy (clientes 1 y 5) no tiene fila y no pasa
 * por aquí: sigue con /api/lm/* y el configurador de siempre.
 * Scripts: C:\dev\sqlAccionamientos\ (04 interruptor, 05 columnas nacc_, 06 SPs de alta)
 *
 *   GET  /api/sm/acc_cfg/activo/:cliente       ¿usa el configurador nuevo?
 *   GET  /api/sm/acc_cfg/opciones/:cliente     árbol de opciones activas, con sus relaciones
 *   POST /api/sm/acc_cfg/pedido/:cliente/:ref  alta del pedido (solo enrollables del flujo nuevo)
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
  '-10': 'Tipo de motor no válido o no admitido en el sistema',
  '-11': 'Modelo de motor no válido',
  '-12': 'Mando, cargador o batería no asignado a ese modelo'
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
           accSis, cadCol, motSis, modMan, modCar, modBat] = await Promise.all([
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
      q('select tipo_motor_id, sistema_id from dbo.SOL_ACC_TIPO_MOTOR_SISTEMA'),
      q('select modelo_motor_id, mando_id from dbo.SOL_ACC_MODELO_MOTOR_MANDO'),
      q('select modelo_motor_id, cargador_id from dbo.SOL_ACC_MODELO_MOTOR_CARGADOR'),
      q('select modelo_motor_id, bateria_id from dbo.SOL_ACC_MODELO_MOTOR_BATERIA')
    ]);

    /* Solo se enlazan ids de opciones activas: una opción oculta desaparece de todas las listas */
    const activos = (filas) => new Set(filas.map(f => f.id));
    const sisActivos = activos(sistemas), colActivos = activos(colores), manActivos = activos(mandos),
          carActivos = activos(cargadores), batActivos = activos(baterias);
    const filtrar = (ids, conjunto) => (ids || []).filter(id => conjunto.has(id));

    const sisPorAcc = agrupar(accSis, 'accionamiento_id', 'sistema_id');
    const colPorTipo = agrupar(cadCol, 'tipo_cadena_id', 'color_cadena_id');
    const sisPorMotor = agrupar(motSis, 'tipo_motor_id', 'sistema_id');
    const manPorModelo = agrupar(modMan, 'modelo_motor_id', 'mando_id');
    const carPorModelo = agrupar(modCar, 'modelo_motor_id', 'cargador_id');
    const batPorModelo = agrupar(modBat, 'modelo_motor_id', 'bateria_id');

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
      tiposMotor: tiposMotor.map(t => Object.assign(t, {
        sistemas: filtrar(sisPorMotor[t.id], sisActivos),
        modelos: modelos.filter(m => m.tipo_motor_id === t.id).map(m => ({
          id: m.id, codigo: m.codigo, nombre: m.nombre,
          mandos: filtrar(manPorModelo[m.id], manActivos),
          cargadores: filtrar(carPorModelo[m.id], carActivos),
          baterias: filtrar(batPorModelo[m.id], batActivos)
        }))
      })),
      mandos,
      cargadores,
      baterias
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

/* POST /acc_cfg/pedido/:cliente/:ref  body: [ líneas ]
   Cada línea: { TipoCortina: 1, ancho, alto, cantidad, codeCentro,
                 nacc: { accionamiento, sistema, tipo_cadena, tipo_aro, cadena_medida, altura,
                         color_cadena, tipo_motor, modelo_motor, mando, cargador, bateria },
                 y los pasos que siguen en el modelo antiguo con los nombres de CortinaTipo:
                 acc_tubo_id, acc_posicion_id, sop_tipo_id, sop_color_id, tej_tipo_id, tej_color_id,
                 tej_salida_id, con_tipo_id, con_color_id, tap_tipo_id, tap_color_id, Tipo1_Cajon,
                 Tipo1_Guia, impresion, impresion_imagen, instrucciones, estancia_id, estancia_obs }
   Todo el pedido va en una transacción: si una línea no es válida no se graba nada. */
async function pedido(req, res) {
  const cliente = entero(req.params.cliente);
  /* El configurador manda '-' cuando no hay referencia (la ruta necesita el segmento) */
  const referencia = req.params.ref === '-' ? '' : (texto(req.params.ref, 255) || '');
  const lineas = Array.isArray(req.body) ? req.body : [];
  if (cliente === null) return res.status(400).send({ message: 'Cliente no válido' });
  if (lineas.length === 0) return res.status(400).send({ message: 'El pedido no tiene líneas' });

  const otras = lineas.findIndex(l => entero(l.TipoCortina) !== 1 || !l.nacc);
  if (otras >= 0) {
    return res.status(400).send({ message: `Línea ${otras + 1}: el configurador nuevo, de momento, solo admite enrollables` });
  }

  let transaction;
  try {
    const pool = await sql.connect();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const cabecera = await new sql.Request(transaction)
      .input('cliente', sql.Int, cliente)
      .input('referencia', sql.VarChar(255), referencia)
      .output('refPedido', sql.VarChar(255))
      .execute('sp_acc_pedido_add');
    const idPedido = cabecera.returnValue;
    if (!(idPedido > 0)) {
      await transaction.rollback();
      return res.status(400).send({ message: ERRORES_LINEA[String(idPedido)] || 'No se pudo crear el pedido' });
    }

    for (let i = 0; i < lineas.length; i++) {
      const l = lineas[i];
      const n = l.nacc || {};
      const r = await new sql.Request(transaction)
        .input('idPedido', sql.Int, idPedido)
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
        .input('color_cadena', sql.Int, entero(n.color_cadena))
        .input('tipo_motor', sql.Int, entero(n.tipo_motor))
        .input('modelo_motor', sql.Int, entero(n.modelo_motor))
        .input('mando', sql.Int, entero(n.mando))
        .input('cargador', sql.Int, entero(n.cargador))
        .input('bateria', sql.Int, entero(n.bateria))
        .input('acc_tubo_id', sql.Int, enteroAntiguo(l.acc_tubo_id))
        .input('acc_posicion_id', sql.Int, enteroAntiguo(l.acc_posicion_id))
        .input('sop_tipo_id', sql.Int, enteroAntiguo(l.sop_tipo_id))
        .input('sop_color_id', sql.Int, enteroAntiguo(l.sop_color_id))
        .input('tej_tipo_id', sql.Int, enteroAntiguo(l.tej_tipo_id))
        .input('tej_color_id', sql.Int, enteroAntiguo(l.tej_color_id))
        .input('tej_salida_id', sql.Int, enteroAntiguo(l.tej_salida_id))
        .input('con_tipo_id', sql.Int, enteroAntiguo(l.con_tipo_id))
        .input('con_color_id', sql.Int, enteroAntiguo(l.con_color_id))
        .input('tap_tipo_id', sql.Int, enteroAntiguo(l.tap_tipo_id))
        .input('tap_color_id', sql.Int, enteroAntiguo(l.tap_color_id))
        .input('idcajon', sql.Int, enteroAntiguo(l.Tipo1_Cajon))
        .input('idguia', sql.Int, enteroAntiguo(l.Tipo1_Guia))
        .input('impresion', sql.Int, l.impresion === true || l.impresion === 1 ? 1 : 0)
        .input('impresion_imagen', sql.VarChar(250), texto(l.impresion_imagen, 250))
        .input('instrucciones', sql.VarChar(250), texto(l.instrucciones, 250))
        .input('estancia_id', sql.Int, enteroAntiguo(l.estancia_id))
        .input('estancia', sql.VarChar(2500), texto(l.estancia_obs, 2500))
        .execute('sp_acc_pedido_tipo_1_add');
      if (!(r.returnValue > 0)) {
        await transaction.rollback();
        const motivo = ERRORES_LINEA[String(r.returnValue)] || 'Línea no válida';
        return res.status(400).send({ message: `Línea ${i + 1}: ${motivo}` });
      }
    }

    await transaction.commit();
    res.status(200).send({ message: 'OK', idPedido, referencia: cabecera.output.refPedido });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { /* ya revertida */ }
    }
    console.error(err);
    res.status(500).send({ message: 'KO' });
  }
}

module.exports = {
  activo,
  opciones,
  pedido
};
