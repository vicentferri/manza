/* Foto de la fabricación del sistema RHIN para una línea de Cadena a medida (150 cm) con cada color de cadena,
   contra la BD local. Sirve para comprobar que quitar el tipo de cadena a medida (sqlAccionamientos/35 y
   sqlEnrrollable/08) no cambia la fabricación. Cada caso va en una transacción que se deshace: no deja restos.
   La línea no lleva tipo de cadena a medida (antes era opcional para la fabricación y después no existe).
   Ejecutar desde C:\dev\prod\backend:  node ../sqlEnrrollable/pruebas/foto_fabricacion_cadena_medida.js <fichero.json>
   antes y después del cambio, y comparar los dos ficheros. */
const fs = require('fs');
const sql = require('C:/dev/prod/backend/node_modules/mssql');

const src = fs.readFileSync('C:/dev/prod/backend/server.js', 'utf8');
const config = new Function(src.match(/var config = \{[\s\S]*?\n\};/)[0] + '; return config;')();
const salida = process.argv[2];
const PEDIDO = 7304, LINEA = 9348, SISTEMA = 'RHIN';

(async () => {
  if (!salida) throw new Error('uso: <fichero.json>');
  const pool = await sql.connect(config);
  const q = async (s) => (await pool.request().query(s)).recordset;
  const [ids] = await q(`select (select id from SOL_ACC_ACCIONAMIENTO where codigo = 'CADENA') cadena,
                                (select id from SOL_ACC_SISTEMA where codigo = '${SISTEMA}') sistema,
                                (select id from SOL_ACC_TIPO_CADENA where codigo = 'CADENA_A_MEDIDA') medida`);
  const colores = await q('select id, codigo from SOL_ACC_COLOR_CADENA order by codigo');
  const foto = {};
  for (const c of colores) {
    const t = new sql.Transaction(pool);
    await t.begin();
    try {
      const r = () => new sql.Request(t);
      await r().query(`update SOL_PEDIDOS_COLA_TIPO_1 set
          nacc_accionamiento_id = ${ids.cadena}, nacc_sistema_id = ${ids.sistema}, nacc_tipo_cadena_id = ${ids.medida},
          nacc_altura_id = null, nacc_color_cadena_id = ${c.id}, nacc_cadena_longitud = 150,
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
  console.log(`${Object.keys(foto).length} colores, ${total} componentes -> ${salida}`);
  await sql.close();
})().catch(e => { console.log('ERROR', e.message); process.exit(1); });
