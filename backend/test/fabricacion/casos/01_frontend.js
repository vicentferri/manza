'use strict'

/*
 * 1. Validación del frontend (fabricacion-reglas.util.ts de la pantalla v3).
 * Se transpila el .ts real con el typescript del frontend: no hay copia que mantener.
 */

const path = require('path');
const fs = require('fs');
const Module = require('module');
const { eq, ok } = require('../lib/informe');
const E = require('../lib/entorno');

const UTIL = path.join(E.FRONTEND, 'src', 'app', 'routes', 'herstellen', 'artikeln-fac-cd-v3', 'fabricacion-reglas.util.ts');
const PARAMETROS = ['@CANTIDAD', '@ANCHO', '@ALTO', '@TEJIDO_COLOR_ID', '@TEJIDO_COLOR', '@COLOR_PERFIL', '@ACCIONAMIENTO',
  '@TEJIDO_REFERENCIA', '@TEJIDO_ARTICULO', '@TEJIDO_ANCHO', '@TEJIDO_ALTO'];

function cargarUtil() {
  const ts = require(path.join(E.FRONTEND, 'node_modules', 'typescript'));
  const js = ts.transpileModule(fs.readFileSync(UTIL, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 }
  }).outputText;
  const m = new Module(UTIL);
  m._compile(js, UTIL);
  return m.exports;
}

module.exports = async function (inf) {
  inf.empezar('1. Frontend: validación de condiciones, consumos y reglas (fabricacion-reglas.util.ts)');

  let u;
  try {
    u = cargarUtil();
  } catch (e) {
    inf.aviso('No se puede cargar el util del frontend (¿falta frontend/node_modules?)', e.message);
    return;
  }

  await inf.test('Condiciones: se leen y se vuelven a escribir igual', () => {
    const casos = [
      ['@ANCHO == 100', '==', '@ANCHO == 100'],
      ['@ACCIONAMIENTO == CON VARILLA', '==', '@ACCIONAMIENTO == CON VARILLA'],
      ['@ancho>>10', '>>', '@ANCHO >> 10'],
      ['@ANCHO >= 10', '>=', '@ANCHO >= 10'],
      ['@ANCHO << 10', '<<', '@ANCHO << 10'],
      ['@ANCHO <= 10,5', '<=', '@ANCHO <= 10.5'],
      ['30 <= @ANCHO <= 36', 'entre', '30 <= @ANCHO <= 36'],
      ['36,1<=@ancho<=62', 'entre', '36.1 <= @ANCHO <= 62'],
    ];
    casos.forEach(([texto, op, escrito]) => {
      const c = u.parseCondicion(texto);
      eq(c.modo + ' ' + c.operador, 'guiado ' + op, texto);
      eq(u.buildCondicion(c), escrito, texto);
    });
    eq(u.parseCondicion('').parametro, '', 'vacía');
    eq(u.parseCondicion('basura').modo, 'texto', 'basura');
    eq(u.buildCondicion(u.parseCondicion('basura')), 'basura', 'basura se conserva');
  });

  await inf.test('Condiciones: errores de validación', () => {
    eq(u.validarCondicion('', PARAMETROS), [], 'vacía');
    eq(u.validarCondicion('@ANCHO >> 10', PARAMETROS), [], 'válida');
    eq(u.validarCondicion('@acho == 1', PARAMETROS), ['El parámetro @ACHO no existe'], 'parámetro inexistente');
    eq(u.validarCondicion('@ANCHO >> abc', PARAMETROS), ['Con >> el valor tiene que ser un número'], 'no numérico');
    eq(u.validarCondicion('62 <= @ANCHO <= 30', PARAMETROS).length, 1, 'intervalo al revés');
    ok(u.validarCondicion('@ANCHO ==', PARAMETROS).length > 0, '"@ANCHO ==" sin valor tiene que dar error');
    ok(u.validarCondicion('ANCHO > 3', PARAMETROS).length > 0, 'sintaxis incorrecta tiene que dar error');
  });

  await inf.test('Consumos: tipos y reescritura (coma -> punto, mayúsculas)', () => {
    const casos = [
      ['', 'numero', '1'],
      ['400', 'numero', '400'],
      ['1,5', 'numero', '1.5'],
      ['@ancho', 'parametro', '@ANCHO'],
      ['@ANCHO -- 0', 'operacion', '@ANCHO -- 0'],
      ['@ANCHO--1,5**2', 'operacion', '@ANCHO -- 1.5 ** 2'],
      ['@tejido_ancho**@tejido_alto*T0,0001', 'operacion', '@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001'],
      ['@ANCHO -- -5', 'operacion', '@ANCHO -- -5'],
      ['@ANCHO*t0.5*r2', 'operacion', '@ANCHO *T 0.5 *R 2'],
      ['0.01 ** @ALTO ** 2', 'texto', '0.01 ** @ALTO ** 2'],
    ];
    casos.forEach(([texto, tipo, escrito]) => {
      const c = u.parseConsumo(texto);
      eq(c.tipo, tipo, JSON.stringify(texto));
      eq(u.buildConsumo(c), escrito, JSON.stringify(texto));
    });
    eq(u.parseConsumo('@ANCHO -- 1.5 ** 2 ++ 10').extra.length, 2, 'cadena de 3 operaciones');
  });

  await inf.test('Consumos: errores de validación', () => {
    ['', '400', '1,5', '@ANCHO', '@ANCHO -- 0', '@ANCHO -- 1.5 ** 2', '@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001',
      '0.01 ** @ALTO ** 2', '0.01 *R @ALTO *R 2', '@ANCHO -- -5', '@ANCHO *R 0.013']
      .forEach(c => eq(u.validarConsumo(c, PARAMETROS), [], JSON.stringify(c)));
    eq(u.validarConsumo('@ANCHO ** @NO_EXISTE', PARAMETROS), ['El parámetro @NO_EXISTE no existe'], 'operando inexistente');
    eq(u.validarConsumo('@NO -- @NO', PARAMETROS), ['El parámetro @NO no existe'], 'el error no se repite');
    ['@ANCHO -- 1 **', '@ANCHO // 2', '@ANCHO *X 2', 'abc', '@ANCHO -- abc', '@ANCHO -- 1.']
      .forEach(c => eq(u.validarConsumo(c, PARAMETROS).length, 1, JSON.stringify(c) + ' tiene que dar error'));
  });

  await inf.test('Operandos de la casilla de operación', () => {
    const esperado = { '1.5': true, '1,5': true, '-3': true, '@ANCHO': true, ' @alto ': true, 'abc': false, '': false, '1.': false, '@': false };
    Object.keys(esperado).forEach(t => eq(u.operandoValido(t), esperado[t], JSON.stringify(t)));
  });

  await inf.test('Regla completa: artículos fijos, artículo según el pedido y número de consumos', () => {
    const v = (regla) => u.validarRegla(regla, PARAMETROS);
    eq(v({ articulos: '16472,16476', consumo: '@ANCHO -- 1.5;@ANCHO' }).total, 0, 'dos artículos, dos consumos');
    eq(v({ articulos: '@TEJIDO_ARTICULO', consumo: '@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001' }).total, 0, 'tejido según el pedido');
    eq(v({ articulos: '16472;@TEJIDO_ARTICULO', consumo: '1;@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001' }).total, 0, 'mezcla con ;');
    /* Medidas propias del componente (XML P1/P2) */
    eq(v({ articulos: '@TEJIDO_ARTICULO', consumo: '1', param_ancho: '@TEJIDO_ANCHO', param_alto: '@tejido_alto' }).total, 0, 'medidas del tejido');
    eq(v({ articulos: '1', consumo: '1', param_ancho: '@NO_HAY', param_alto: '' }).campos.medidas, ['El parámetro @NO_HAY no existe'], 'medida inexistente');
    eq(v({ articulos: '', consumo: '1' }).campos.articulos, ['La regla no tiene artículos'], 'sin artículos');
    eq(v({ articulos: '@NO_HAY', consumo: '1' }).campos.articulos, ['El parámetro @NO_HAY no existe'], 'parámetro inexistente');
    eq(v({ articulos: 'abc', consumo: '1' }).campos.articulos, ['Id de artículo no válido: abc'], 'id no válido');
    eq(v({ articulos: '1e5', consumo: '1' }).campos.articulos, ['Id de artículo no válido: 1e5'], '1e5 no es un id');
    eq(v({ articulos: '1,2', consumo: '1;2;3' }).campos.consumo, ['Hay 3 consumos para 2 artículos'], 'consumos de más');
    /* Artículo según el pedido: tiene que ser un parámetro que dé el id de un artículo */
    const dan = ['@TEJIDO_ARTICULO'];
    const va = (articulos) => u.validarRegla({ articulos, consumo: '1' }, PARAMETROS, dan);
    eq(va('@TEJIDO_ARTICULO').total, 0, '@TEJIDO_ARTICULO da un artículo');
    eq(va('16472,@TEJIDO_ARTICULO').total, 0, 'fijo + dinámico');
    eq(va('@TEJIDO_REFERENCIA').campos.articulos, ['El parámetro @TEJIDO_REFERENCIA no da un artículo (use una búsqueda que devuelva el id del artículo)'], 'la Referencia no es un artículo');
    eq(va('@ANCHO').total, 1, 'una columna tampoco');
    eq(va('@NO_HAY').campos.articulos, ['El parámetro @NO_HAY no existe'], 'inexistente: un solo error');
    eq(v({ articulos: '@TEJIDO_REFERENCIA', consumo: '1' }).total, 0, 'sin la lista, como antes');
    const r = v({ articulos: '1', consumo: '@NO', nombre_parametro1: '@NO == 1', nombre_parametro2: 'mal' });
    eq(Object.keys(r.campos).sort(), ['consumo', 'nombre_parametro1', 'nombre_parametro2'], 'errores por campo');
    eq(r.total, 3, 'total de errores');
  });

  return u;
};
