/* Foto de la fabricación del sistema RHIN para una línea de Aro cadena con cada altura, contra la BD local.
   Sirve para comprobar que pasar de tipos de aro a alturas (sqlAccionamientos/34 y sqlEnrrollable/08) no
   cambia la fabricación. Cada caso va en una transacción que se deshace: no deja restos.
     antes:   la línea lleva el tipo de aro (nacc_tipo_aro_id) con ese código
     despues: la línea lleva la altura (nacc_altura_id) con ese código
   Ejecutar desde C:\dev\prod\backend:  node ../sqlEnrrollable/pruebas/foto_fabricacion_alturas.js antes|despues <fichero.json>
   y comparar los dos ficheros. */
const fs = require('fs');
const sql = require('C:/dev/prod/backend/node_modules/mssql');

const src = fs.readFileSync('C:/dev/prod/backend/server.js', 'utf8');
const config = new Function(src.match(/var config = \{[\s\S]*?\n\};/)[0] + '; return config;')();
const [modo, salida] = process.argv.slice(2);
const PEDIDO = 7304, LINEA = 9348, SISTEMA = 'RHIN';

(async () => {
  if (!['antes', 'despues'].includes(modo) || !salida) throw new Error('uso: antes|despues <fichero.json>');
  const pool = await sql.connect(config);
  const q = async (s) => (await pool.request().query(s)).recordset;
  const [ids] = await q(`select (select id from SOL_ACC_ACCIONAMIENTO where codigo = 'CADENA') cadena,
                                (select id from SOL_ACC_SISTEMA where codigo = '${SISTEMA}') sistema,
                                (select id from SOL_ACC_TIPO_CADENA where codigo = 'ARO_CADENA') aro_cadena,
                                (select min(id) from SOL_ACC_COLOR_CADENA where activo = 1) color`);
  const codigos = modo === 'antes'
    ? await q('select id, codigo from SOL_ACC_TIPO_ARO_CADENA order by codigo')
    : await q('select id, codigo from SOL_ACC_ALTURA order by codigo');
  const foto = {};
  for (const c of codigos) {
    const t = new sql.Transaction(pool);
    await t.begin();
    try {
      const r = () => new sql.Request(t);
      await r().query(`update SOL_PEDIDOS_COLA_TIPO_1 set
          nacc_accionamiento_id = ${ids.cadena}, nacc_sistema_id = ${ids.sistema}, nacc_tipo_cadena_id = ${ids.aro_cadena},
          ${modo === 'antes' ? `nacc_tipo_aro_id = ${c.id}, nacc_altura_id = null` : `nacc_altura_id = ${c.id}`},
          nacc_color_cadena_id = ${ids.color}, nacc_cadena_longitud = null,
          nacc_tipo_motor_id = null, nacc_modelo_motor_id = null, nacc_mando_id = null, nacc_cargador_id = null, nacc_bateria_id = null,
          ancho = 120, alto = 160, cantidad = 1
        where id = ${LINEA}`);
      await r().input('p', sql.Int, PEDIDO).query('execute temp_sp_fabricacion_tipo_1_v3 @p, 0, 1');
      const filas = (await r().query(`select orden, articulo, cast(consumo as decimal(18,6)) consumo, descripcion, descripcion2
                                      from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = ${LINEA} order by orden, articulo`)).recordset;
      foto[c.codigo] = filas.map(f => [f.orden, f.articulo, String(f.consumo), f.descripcion, f.descripcion2].join(' | '));
    } finally {
      await t.rollback();
    }
  }
  fs.writeFileSync(salida, JSON.stringify(foto, null, 1));
  const total = Object.values(foto).reduce((a, f) => a + f.length, 0);
  console.log(`${modo}: ${Object.keys(foto).length} alturas, ${total} componentes -> ${salida}`);
  await sql.close();
})().catch(e => { console.log('ERROR', e.message); process.exit(1); });
