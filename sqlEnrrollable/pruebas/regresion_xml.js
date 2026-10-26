/* Foto del XML de producción (sp_fichero_produccion_2) antes y después del script 06, contra la BD local.
   Calcula el XML de una muestra de pedidos reales con el 06 aplicado, lo desaplica con el script de deshacer,
   calcula el XML otra vez y vuelve a aplicarlo. Comprueba:
     - pedidos SIN líneas de enrollable (japonés, vertical, Compac, HoneyComb): XML idéntico
     - pedidos con enrollable: cuántos y qué componentes cambian (CANT / FACTOR)
   sp_fichero_produccion_2 solo lee: no modifica datos. Termina con el 06 aplicado, como estaba.
   Ejecutar desde C:\dev\prod\backend:  node ../sqlEnrrollable/pruebas/regresion_xml.js */
const fs = require('fs');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const sql = require('C:/dev/prod/backend/node_modules/mssql');

const src = fs.readFileSync('C:/dev/prod/backend/server.js', 'utf8');
const config = new Function(src.match(/var config = \{[\s\S]*?\n\};/)[0] + '; return config;')();
const DIR = 'C:/dev/prod/sqlEnrrollable/';

const hash = t => crypto.createHash('sha1').update(t).digest('hex').slice(0, 10);
const sqlcmd = (f) => {
  /* la contraseña va en una variable de entorno (no en la línea de comandos) y la ruta es relativa al repositorio */
  try {
    return execFileSync('sqlcmd', ['-S', config.server, '-U', config.user, '-C', '-d', config.database, '-f', '65001', '-b', '-i', 'sqlEnrrollable/' + f],
      { cwd: 'C:/dev/prod', env: Object.assign({}, process.env, { SQLCMDPASSWORD: config.password }), stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  } catch (e) {
    throw new Error('sqlcmd ' + f + ': ' + String(e.stdout || '') + String(e.stderr || ''));
  }
};

async function fotos(pool, pedidos) {
  const r = {};
  for (const p of pedidos) {
    const res = await pool.request().input('id', sql.Int, p).execute('sp_fichero_produccion_2');
    r[p] = res.recordset.map(x => Object.values(x)[0]);
  }
  return r;
}

(async () => {
  const pool = await sql.connect(config);
  const q = async (s) => (await pool.request().query(s)).recordset;
  /* Muestra: los 20 pedidos más recientes de cada tipo 2, 3, 4 y 7 sin líneas de enrollable, y 40 con enrollable */
  const sinEnr = [];
  for (const tipo of [2, 3, 4, 7]) {
    const r = await q(`select top 20 l.idrow p from sol_pedidos_cola_lineas l join SOL_PEDIDOS_COLA c on c.idrow = l.idrow
                       where l.tipo = ${tipo} and c.cliente <> 2 and not exists (select 1 from sol_pedidos_cola_lineas x where x.idrow = l.idrow and x.tipo = 1)
                       group by l.idrow order by l.idrow desc`);
    r.forEach(x => sinEnr.push({ pedido: x.p, tipo }));
  }
  const conEnr = (await q(`select top 40 l.idrow p from sol_pedidos_cola_lineas l join SOL_PEDIDOS_COLA c on c.idrow = l.idrow
                           where l.tipo = 1 and c.cliente <> 2 and exists (select 1 from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_1 t on t.id = f.idrow where t.idrow = l.id)
                           group by l.idrow order by l.idrow desc`)).map(x => x.p);
  const todos = Array.from(new Set(sinEnr.map(x => x.pedido).concat(conEnr)));

  const conSix = await fotos(pool, todos);
  console.log(sqlcmd('06_deshacer_xml_cant_factor_enrollable.sql').trim());
  let sinSix;
  try {
    sinSix = await fotos(pool, todos);
  } finally {
    console.log(sqlcmd('06_xml_cant_factor_enrollable.sql').trim());
  }

  let distintosSinEnr = 0;
  sinEnr.forEach(x => { if (hash(conSix[x.pedido].join('\n')) !== hash(sinSix[x.pedido].join('\n'))) distintosSinEnr++; });
  console.log(`${distintosSinEnr === 0 ? 'OK   ' : 'FALLO '} ${sinEnr.length} pedidos de japonés, vertical, Compac y HoneyComb sin enrollable: ${distintosSinEnr} con el XML distinto`);

  /* Pedidos con enrollable: qué cambia, línea a línea */
  let pedidosCambian = 0, filasCambian = 0, filasTotal = 0, soloCantFactor = 0, otraCosa = 0, ejemplos = [];
  const comp = t => { const m = /^(<C\d+>)([^<]*)(<\/C\d+>)<C\d+_CANT>([^<]*)<\/C\d+_CANT>(.*)<C\d+_FACTOR>([^<]*)<\/C\d+_FACTOR>(.*)$/.exec(t); return m ? { cod: m[2], cant: m[4], medio: m[5], factor: m[6], resto: m[7] } : null; };
  conEnr.forEach(p => {
    const a = sinSix[p], b = conSix[p];
    let cambia = false;
    if (a.length !== b.length) { otraCosa++; cambia = true; }
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) continue;
      cambia = true; filasCambian++;
      const x = comp(a[i]), y = comp(b[i]);
      if (x && y && x.cod === y.cod && x.medio === y.medio && x.resto === y.resto) {
        soloCantFactor++;
        if (ejemplos.length < 6) ejemplos.push(`  pedido ${p}, art. ${x.cod}: CANT ${x.cant} -> ${y.cant}, FACTOR ${x.factor} -> ${y.factor}`);
      } else otraCosa++;
    }
    filasTotal += a.length;
    if (cambia) pedidosCambian++;
  });
  console.log(`INFO ${conEnr.length} pedidos con enrollable (fabricación antigua guardada): ${pedidosCambian} cambian su XML; ${filasCambian} componentes distintos de ${filasTotal} filas (${soloCantFactor} solo en CANT/FACTOR, ${otraCosa} de otro tipo: filas sin artículo o distinto número de filas)`);
  ejemplos.forEach(e => console.log(e));
  await sql.close();
})().catch(e => { console.log('ERROR', e.message); process.exit(1); });
