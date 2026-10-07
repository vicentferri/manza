'use strict'

/*
 * Tests del motor de fabricación por reglas (v3) y de la HoneyComb.
 *
 *   node backend/test/fabricacion/run.js                 todas las secciones
 *   node backend/test/fabricacion/run.js 2 5             solo las secciones 2 y 5
 *   node backend/test/fabricacion/run.js --bd=NOMBRE     permite una BD que no sea *_DEV / *_TEST
 *
 * La BD queda como estaba: lo que escribe cada sección va en una transacción que se
 * deshace al terminar (ver lib/entorno.js). Ver README.md.
 */

const E = require('./lib/entorno');
const { Informe } = require('./lib/informe');

const FICHEROS = {
  1: '01_frontend', 2: '02_formulas', 3: '03_motor', 4: '04_configuracion',
  5: '05_pedido', 6: '06_regresion', 7: '07_datos', 8: '08_http'
};
const SECCIONES = {};
Object.keys(FICHEROS).forEach(n => {
  Object.defineProperty(SECCIONES, n, { enumerable: true, get: () => require('./casos/' + FICHEROS[n]) });
});

(async () => {
  const args = process.argv.slice(2);
  const bd = (args.find(a => a.startsWith('--bd=')) || '').substring(5);
  const pedidas = args.filter(a => /^\d+$/.test(a)).map(Number);
  const ejecutar = pedidas.length ? pedidas : Object.keys(SECCIONES).map(Number);

  const inf = new Informe();
  let util = null;
  try {
    const nombre = await E.conectar({ bd });
    console.log('BD: ' + nombre + '   secciones: ' + ejecutar.join(', '));
    /* La sección 2 usa el util del frontend que carga la 1 */
    if (ejecutar.indexOf(1) === -1 && ejecutar.indexOf(2) !== -1) {
      util = await SECCIONES[1](new Informe());
    }
    for (const n of ejecutar) {
      if (!SECCIONES[n]) continue;
      const r = await SECCIONES[n](inf, util);
      if (n === 1) util = r;
    }
  } catch (e) {
    inf.fallos.push({ seccion: inf.seccion || 'arranque', nombre: 'error inesperado', mensaje: e.message });
    console.log('\nERROR: ' + (e.stack || e.message));
  } finally {
    await E.cerrar().catch(() => { });
  }
  const bien = inf.resumen();
  process.exit(bien ? 0 : 1);
})();
