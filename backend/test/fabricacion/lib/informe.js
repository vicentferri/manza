'use strict'

/*
 * Mini framework de tests (sin dependencias).
 *   OK     el test se cumple
 *   FALLO  el test no se cumple: hay que arreglarlo
 *   AVISO  no es un fallo del código probado (configuración incompleta, datos de DEV,
 *          comportamiento antiguo fuera del alcance): se informa para decidir
 */

const COLOR = process.stdout.isTTY
  ? { ok: '\x1b[32m', fallo: '\x1b[31m', aviso: '\x1b[33m', titulo: '\x1b[1m', fin: '\x1b[0m' }
  : { ok: '', fallo: '', aviso: '', titulo: '', fin: '' };

class Informe {
  constructor() {
    this.ok = 0;
    this.fallos = [];
    this.avisos = [];
    this.seccion = '';
  }

  empezar(seccion) {
    this.seccion = seccion;
    console.log('\n' + COLOR.titulo + seccion + COLOR.fin);
  }

  async test(nombre, fn) {
    try {
      await fn();
      this.ok++;
      console.log('  ' + COLOR.ok + '[OK]' + COLOR.fin + '    ' + nombre);
    } catch (e) {
      const mensaje = (e && e.message) ? e.message : String(e);
      this.fallos.push({ seccion: this.seccion, nombre, mensaje });
      console.log('  ' + COLOR.fallo + '[FALLO] ' + nombre + COLOR.fin);
      console.log('          ' + mensaje.split('\n').join('\n          '));
    }
  }

  aviso(nombre, detalle) {
    this.avisos.push({ seccion: this.seccion, nombre, detalle });
    console.log('  ' + COLOR.aviso + '[AVISO]' + COLOR.fin + ' ' + nombre + (detalle ? '\n          ' + detalle : ''));
  }

  resumen() {
    console.log('\n' + COLOR.titulo + 'RESUMEN' + COLOR.fin);
    console.log('  OK: ' + this.ok + '   FALLOS: ' + this.fallos.length + '   AVISOS: ' + this.avisos.length);
    this.fallos.forEach(f => console.log('  ' + COLOR.fallo + '[FALLO]' + COLOR.fin + ' ' + f.seccion + ' > ' + f.nombre));
    this.avisos.forEach(a => console.log('  ' + COLOR.aviso + '[AVISO]' + COLOR.fin + ' ' + a.seccion + ' > ' + a.nombre));
    return this.fallos.length === 0;
  }
}

function texto(v) {
  return JSON.stringify(v);
}

function eq(real, esperado, que) {
  if (texto(real) !== texto(esperado)) {
    throw new Error((que ? que + ': ' : '') + 'esperado ' + texto(esperado) + ', obtenido ' + texto(real));
  }
}

function ok(condicion, mensaje) {
  if (!condicion) {
    throw new Error(mensaje || 'condición no cumplida');
  }
}

/* Números (los decimal de SQL llegan como number) con tolerancia de redondeo */
function num(real, esperado, que) {
  if (real === null || real === undefined || Math.abs(Number(real) - Number(esperado)) > 0.0001) {
    throw new Error((que ? que + ': ' : '') + 'esperado ' + esperado + ', obtenido ' + texto(real));
  }
}

module.exports = { Informe, eq, ok, num };
