/* Prueba del desplegable de valores de las búsquedas del enrollable (sqlEnrrollable/04,
   sp_fabricacion_parametros_valores) contra la BD local. Todo en una transacción que se deshace.
   Ejecutar desde C:\dev\prod\backend:  node ../sqlEnrrollable/pruebas/prueba_04_valores.js */
const fs = require('fs');
const sql = require('C:/dev/prod/backend/node_modules/mssql');

const src = fs.readFileSync('C:/dev/prod/backend/server.js', 'utf8');
const config = new Function(src.match(/var config = \{[\s\S]*?\n\};/)[0] + '; return config;')();

let fallos = 0;
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FALLO ') + m); if (!c) fallos++; };
const clave = r => r.name + '|' + r.valor + '|' + r.texto;

(async () => {
  await sql.connect(config);
  const hcAntes = (await new sql.Request().input('sistema', sql.VarChar(50), 'HONEYCOMB').execute('sp_fabricacion_parametros_valores')).recordset.map(clave).sort();
  const tx = new sql.Transaction();
  await tx.begin();
  const q = async (s) => (await new sql.Request(tx).query(s)).recordset;
  const juego = 'ENROLLABLE_ZZ_V3A';
  try {
    const s1 = (await q("insert SOL_ACC_SISTEMA (codigo, nombre) output inserted.id values ('ZZ_V3A', 'ZZ v3 a')"))[0].id;
    await q("insert SOL_ACC_SOPORTE (codigo, nombre) values ('ZZSOP', 'ZZ soporte')");
    await q(`insert SOL_FABRICACION_SISTEMAS (sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo, producto, acc_sistema_id)
             select '${juego}', 'Enrollable · ZZ v3 a', 1, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, 1, 1, ${s1}
             from SOL_FABRICACION_PRODUCTOS where producto = 1`);
    await q(`insert SOL_FABRICACION_PARAMETROS (sistema, name, tipo, origen, orden, busqueda) values
             ('${juego}', '@SOPORTE_ID', 'COLUMNA', 'nacc_soporte_id', 10, null),
             ('${juego}', '@SOPORTE', 'BUSQUEDA', '@SOPORTE_ID', 20, 'ENR_SOPORTE'),
             ('${juego}', '@ALTURA_CM', 'BUSQUEDA', '@SOPORTE_ID', 30, 'ENR_ALTURA_VALOR')`);
    const v = (await new sql.Request(tx).input('sistema', sql.VarChar(50), juego).execute('sp_fabricacion_parametros_valores')).recordset;
    const soportes = (await q('select count(*) n from SOL_ACC_SOPORTE'))[0].n;
    const sop = v.filter(r => r.name === '@SOPORTE');
    ok(sop.some(r => r.valor === 'ZZSOP' && r.texto === 'ZZ SOPORTE') && sop.length === soportes,
      `@SOPORTE: códigos y nombres de SOL_ACC_SOPORTE (${sop.length} de ${soportes})`);
    ok(!v.some(r => r.name === '@ALTURA_CM'), 'una búsqueda sin columna texto no da desplegable');
    const hc = (await new sql.Request(tx).input('sistema', sql.VarChar(50), 'HONEYCOMB').execute('sp_fabricacion_parametros_valores')).recordset.map(clave).sort();
    ok(JSON.stringify(hc) === JSON.stringify(hcAntes), `desplegables de HoneyComb sin cambios (${hc.length} valores)`);
  } catch (e) {
    console.log('ERROR', e.message); fallos++;
  } finally {
    await tx.rollback();
    const restos = (await new sql.Request().query("select (select count(*) from SOL_ACC_SOPORTE where codigo = 'ZZSOP') + (select count(*) from SOL_FABRICACION_SISTEMAS where sistema like '%ZZ[_]V3%') n")).recordset[0].n;
    ok(restos === 0, 'rollback: sin restos');
    console.log(fallos === 0 ? 'TODO OK' : fallos + ' FALLOS');
    await sql.close();
  }
})();
