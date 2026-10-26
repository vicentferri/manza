/* Prueba de la simulación por sistema (POST /fabricacion/simular, paso 2.6) contra la BD local.
   El controlador se ejecuta dentro de una transacción que se deshace al final (se sustituye sql.connect),
   así la fabricación que lanza la simulación no deja nada cambiado.
   Pedido real 7304: línea 9348 -> sistema ZZ_SIMA, línea 9346 -> sistema ZZ_SIMB, línea 9347 antigua.
   Ejecutar desde C:\dev\prod\backend:  node ../sqlEnrrollable/pruebas/prueba_simulacion.js */
const fs = require('fs');
const sql = require('C:/dev/prod/backend/node_modules/mssql');
const fab = require('C:/dev/prod/backend/controllers/sm/fabricacion_reglas');

const src = fs.readFileSync('C:/dev/prod/backend/server.js', 'utf8');
const config = new Function(src.match(/var config = \{[\s\S]*?\n\};/)[0] + '; return config;')();

let fallos = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLO ') + m); if (!c) fallos++; };
const llamar = (fn, req) => new Promise(resolve => {
  const res = { status(c) { this.code = c; return this; }, send(b) { resolve({ code: this.code, body: b }); } };
  fn(Object.assign({ query: {}, params: {}, body: {} }, req), res);
});

(async () => {
  const pool = await sql.connect(config);
  const conectar = sql.connect;
  const tx = new sql.Transaction(pool);
  await tx.begin();
  sql.connect = async () => ({ request: () => new sql.Request(tx) });
  const q = async (s) => (await new sql.Request(tx).query(s)).recordset;
  try {
    /* ---- HoneyComb: igual que antes, sin Omitidas ---- */
    const hc = (await q(`select top 1 l.idrow p from sol_pedidos_cola_lineas l join SOL_PEDIDOS_COLA_TIPO_7 t on t.idrow = l.id
                         where l.tipo = 7 order by l.idrow desc`))[0].p;
    let r = await llamar(fab.simular, { body: { idPedido: hc, sistema: 'HONEYCOMB' } });
    ok(r.code === 200 && r.body.Omitidas === null && r.body.Fabricacion.length > 0 && r.body.Parametros.length > 0,
      `HoneyComb (pedido ${hc}): ${r.body.Fabricacion.length} componentes, sin filtro por sistema (Omitidas null)`);

    /* ---- Enrollable: dos sistemas ZZ en el pedido 7304 ---- */
    const acc = (await q('select top 1 id from SOL_ACC_ACCIONAMIENTO order by id'))[0].id;
    const ids = {};
    for (const c of ['ZZ_SIMA', 'ZZ_SIMB', 'ZZ_SIMC']) {
      ids[c] = (await q(`insert SOL_ACC_SISTEMA (codigo, nombre) output inserted.id values ('${c}', '${c}')`))[0].id;
      const juego = 'ENROLLABLE_' + c;
      await q(`insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
               select '${juego}', 'Enrollable · ${c}', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, ${ids[c]}
               from SOL_FABRICACION_PRODUCTOS where producto = 1`);
      await q(`insert SOL_FABRICACION_PARAMETROS (sistema, name, tipo, origen, orden) values ('${juego}', '@ANCHO', 'COLUMNA', 'ancho', 1)`);
      await q(`insert SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema, orden, atributo, valor, articulos, nombre_parametro1, consumo)
               values ('${juego}', 1, 'ZZ ${c}', '', '${c === 'ZZ_SIMA' ? 55 : 24}', '', '1')`);
    }
    await q(`update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = ${acc}, nacc_sistema_id = ${ids.ZZ_SIMA} where id = 9348`);
    await q(`update SOL_PEDIDOS_COLA_TIPO_1 set nacc_accionamiento_id = ${acc}, nacc_sistema_id = ${ids.ZZ_SIMB} where id = 9346`);

    r = await llamar(fab.simular, { body: { idPedido: 7304, sistema: 'ENROLLABLE_ZZ_SIMA' } });
    let f = r.body.Fabricacion || [];
    ok(r.code === 200 && f.length === 1 && f[0].articulo === 55 && f[0].idpedido === 2 && r.body.Parametros.length === 1 && r.body.Parametros[0].idpedido === 2,
      `ZZ_SIMA: solo su línea (pos 2, artículo 55, 1 parámetro) -> ${JSON.stringify(f.map(x => [x.idpedido, x.articulo]))}`);
    ok(JSON.stringify(r.body.Omitidas) === JSON.stringify({ otros_sistemas: 1, modelo_antiguo: 1 }),
      'ZZ_SIMA: omitidas 1 de otro sistema y 1 del modelo antiguo -> ' + JSON.stringify(r.body.Omitidas));

    r = await llamar(fab.simular, { body: { idPedido: 7304, sistema: 'ENROLLABLE_ZZ_SIMB' } });
    f = r.body.Fabricacion || [];
    ok(f.length === 1 && f[0].articulo === 24 && f[0].idpedido === 1 && JSON.stringify(r.body.Omitidas) === JSON.stringify({ otros_sistemas: 1, modelo_antiguo: 1 }),
      `ZZ_SIMB: solo su línea (pos 1, artículo 24) y omitidas 1 + 1 -> ${JSON.stringify(f.map(x => [x.idpedido, x.articulo]))} ${JSON.stringify(r.body.Omitidas)}`);
    const linea2 = (await q('select count(*) n from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = 9348'))[0].n;
    ok(linea2 === 1, 'la simulación de ZZ_SIMB también fabrica la línea de ZZ_SIMA (el procedimiento es del pedido); solo cambia lo que se muestra');

    r = await llamar(fab.simular, { body: { idPedido: 7304, sistema: 'ENROLLABLE_ZZ_SIMC' } });
    ok(r.code === 200 && r.body.Fabricacion.length === 0 && r.body.Parametros.length === 0 && JSON.stringify(r.body.Omitidas) === JSON.stringify({ otros_sistemas: 2, modelo_antiguo: 1 }),
      'ZZ_SIMC (sin líneas en el pedido): nada que mostrar y omitidas 2 + 1 -> ' + JSON.stringify(r.body.Omitidas));
  } catch (e) {
    console.log('ERROR', e.message); fallos++;
  } finally {
    sql.connect = conectar;
    await tx.rollback();
    const restos = (await new sql.Request(pool).query(`select (select count(*) from SOL_ACC_SISTEMA where codigo like 'ZZ[_]SIM%')
      + (select count(*) from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]SIM%')
      + (select count(*) from SOL_PEDIDOS_COLA_TIPO_1 where id in (9346, 9348) and nacc_accionamiento_id is not null) n`)).recordset[0].n;
    ok(restos === 0, 'rollback: sin restos');
    console.log(fallos === 0 ? 'TODO OK' : fallos + ' FALLOS');
    await sql.close();
  }
})();
