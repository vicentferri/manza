'use strict'

/*
 * 8. Rutas HTTP del backend en marcha: las rutas nuevas existen y no responden sin sesión.
 * No usa credenciales ni toca la BD: el middleware de autenticación las corta antes.
 * Servidor: TEST_API (por defecto https://localhost:3001). Si no está en marcha, AVISO.
 */

const https = require('https');
const http = require('http');
const { eq } = require('../lib/informe');

const BASE = process.env.TEST_API || 'https://localhost:3001';

const RUTAS = [
  ['GET', '/api/sm/fabricacion/sistemas'], ['GET', '/api/sm/fabricacion/clientes'], ['GET', '/api/sm/fabricacion/articulos'],
  ['GET', '/api/sm/fabricacion/reglas'], ['POST', '/api/sm/fabricacion/reglas'], ['POST', '/api/sm/fabricacion/reglas/update'],
  ['POST', '/api/sm/fabricacion/reglas/save'], ['POST', '/api/sm/fabricacion/reglas/delete'],
  ['GET', '/api/sm/fabricacion/parametros'], ['GET', '/api/sm/fabricacion/parametros/valores'], ['GET', '/api/sm/fabricacion/columnas'],
  ['POST', '/api/sm/fabricacion/parametros'], ['POST', '/api/sm/fabricacion/parametros/delete'], ['POST', '/api/sm/fabricacion/simular'],
  ['GET', '/api/sm/fabricacion/busquedas'], ['GET', '/api/sm/fabricacion/tablas'], ['GET', '/api/sm/fabricacion/tablas/valores'],
  ['POST', '/api/sm/fabricacion/tablas'], ['POST', '/api/sm/fabricacion/tablas/delete'],
  ['GET', '/api/sm/honeycomb_articulos_buscar?q=honeycomb'], ['GET', '/api/sm/honeycomb_articulos_existen?codigos=04810']
];

function peticion(metodo, ruta, cabeceras) {
  const url = new URL(BASE + ruta);
  const cliente = url.protocol === 'https:' ? https : http;
  return new Promise((resolver, rechazar) => {
    const req = cliente.request(url, {
      method: metodo,
      headers: Object.assign({ 'Content-Type': 'application/json' }, cabeceras),
      rejectUnauthorized: false, /* certificado local autofirmado */
      timeout: 10000
    }, res => {
      let datos = '';
      res.on('data', d => { datos += d; });
      res.on('end', () => resolver({ status: res.statusCode, body: datos }));
    });
    req.on('timeout', () => req.destroy(new Error('sin respuesta')));
    req.on('error', rechazar);
    req.end(metodo === 'POST' ? '{}' : undefined);
  });
}

module.exports = async function (inf) {
  inf.empezar('8. Rutas HTTP (' + BASE + '): existen y piden sesión');

  try {
    await peticion('GET', '/api/sm/fabricacion/sistemas', {});
  } catch (e) {
    inf.aviso('El backend no está en marcha en ' + BASE + ': no se comprueban las rutas HTTP (' + e.message + ')');
    return;
  }

  await inf.test('Sin cabecera Authorization: todas las rutas nuevas responden "no tiene la autenticacion"', async () => {
    const malos = [];
    for (const [metodo, ruta] of RUTAS) {
      const r = await peticion(metodo, ruta, {});
      if (r.status !== 404 || r.body.indexOf('no tiene la autenticacion') === -1) malos.push(metodo + ' ' + ruta + ' -> ' + r.status + ' ' + r.body.substring(0, 80));
    }
    eq(malos, [], 'rutas que no piden sesión o que no existen');
  });

  await inf.test('Con un token falso: todas las rutas nuevas responden "el token no es valido"', async () => {
    const malos = [];
    for (const [metodo, ruta] of RUTAS) {
      const r = await peticion(metodo, ruta, { Authorization: 'token.falso.de.prueba' });
      if (r.status !== 404 || r.body.indexOf('el token no es valido') === -1) malos.push(metodo + ' ' + ruta + ' -> ' + r.status + ' ' + r.body.substring(0, 80));
    }
    eq(malos, [], 'rutas que aceptan un token falso');
  });
};
