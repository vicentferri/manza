/*
 * Sintaxis de condiciones y consumos del motor de fabricación por reglas.
 * Replica lo que aceptan fn_fabricacion_condicion y sp_fabricacion_evaluar (SQL):
 *   Condición: @P == valor | @P >> n | @P >= n | @P << n | @P <= n | a <= @P <= b
 *   Consumo:   n | @P | @P ++ n | @P -- n | @P ** n | @P *R n | a ** @P ** b | a *R @P *R b
 *              y cadenas @P op n op n ... (se calculan de izquierda a derecha)
 * Los espacios se ignoran; los decimales se escriben con punto (se acepta coma).
 */

export type OperadorCondicion = '==' | '>>' | '>=' | '<<' | '<=' | 'entre';

export interface Condicion {
  modo: 'guiado' | 'texto';
  parametro: string;
  operador: OperadorCondicion;
  valor: string;
  desde: string;
  hasta: string;
  texto: string;
}

export type TipoConsumo = 'numero' | 'parametro' | 'operacion' | 'texto';

export type OperadorConsumo = '++' | '--' | '**' | '*R';

export interface Consumo {
  tipo: TipoConsumo;
  numero: string;
  parametro: string;
  operador: OperadorConsumo;
  extra: { operador: OperadorConsumo, numero: string }[];   /* operaciones siguientes de la cadena */
  texto: string;
}

export const OPERADORES_CONDICION = [
  { valor: '==', texto: 'igual a' },
  { valor: '>>', texto: 'mayor que' },
  { valor: '>=', texto: 'mayor o igual que' },
  { valor: '<<', texto: 'menor que' },
  { valor: '<=', texto: 'menor o igual que' },
  { valor: 'entre', texto: 'entre (incluidos)' },
];

export const OPERADORES_CONSUMO = [
  { valor: '--', texto: 'menos' },
  { valor: '++', texto: 'más' },
  { valor: '**', texto: 'por' },
  { valor: '*R', texto: 'por (redondeo arriba)' },
];

const NUMERO = '-?\\d+(?:[.,]\\d+)?';
const PARAM = '@[A-Za-z0-9_]+';

const RE_INTERVALO = new RegExp('^(' + NUMERO + ')<=(' + PARAM + ')<=(' + NUMERO + ')$');
const RE_BINARIA = new RegExp('^(' + PARAM + ')(==|>>|>=|<<|<=)(.+)$');
const RE_NUMERO = new RegExp('^' + NUMERO + '$');
const RE_PARAM = new RegExp('^' + PARAM + '$');
const OPERADOR = '(\\+\\+|--|\\*\\*|\\*R)';
const RE_OPERACION = new RegExp('^(' + PARAM + ')((?:' + OPERADOR + NUMERO + ')+)$');
const RE_PASO = new RegExp(OPERADOR + '(' + NUMERO + ')', 'g');
const RE_TRES_TERMINOS = new RegExp('^(' + NUMERO + ')(\\*\\*|\\*R)(' + PARAM + ')\\2(' + NUMERO + ')$');

function sinEspacios(texto: string): string {
  return String(texto || '').replace(/\s+/g, '');
}

function numero(texto: string): string {
  return String(texto || '').trim().replace(',', '.');
}

/* ---------------- CONDICIONES ---------------- */

export function condicionVacia(): Condicion {
  return { modo: 'guiado', parametro: '', operador: '==', valor: '', desde: '', hasta: '', texto: '' };
}

export function parseCondicion(texto: string): Condicion {
  const c = condicionVacia();
  const limpio = sinEspacios(texto);
  if (limpio === '') {
    return c;
  }

  let m = RE_INTERVALO.exec(limpio);
  if (m) {
    c.operador = 'entre';
    c.desde = numero(m[1]);
    c.parametro = m[2].toUpperCase();
    c.hasta = numero(m[3]);
    return c;
  }

  m = RE_BINARIA.exec(limpio);
  if (m) {
    c.parametro = m[1].toUpperCase();
    c.operador = m[2] as OperadorCondicion;
    /* En '==' el valor puede llevar espacios (CON VARILLA): se toma del texto original */
    c.valor = m[2] === '==' ? String(texto).split('==').slice(1).join('==').trim() : numero(m[3]);
    return c;
  }

  c.modo = 'texto';
  c.texto = String(texto).trim();
  return c;
}

export function buildCondicion(c: Condicion): string {
  if (c.modo === 'texto') {
    return String(c.texto || '').trim();
  }
  if (!c.parametro) {
    return '';
  }
  if (c.operador === 'entre') {
    return numero(c.desde) + ' <= ' + c.parametro + ' <= ' + numero(c.hasta);
  }
  const valor = c.operador === '==' ? String(c.valor || '').trim() : numero(c.valor);
  return c.parametro + ' ' + c.operador + ' ' + valor;
}

export function validarCondicion(texto: string, parametros: string[]): string[] {
  const errores: string[] = [];
  const limpio = sinEspacios(texto);
  if (limpio === '') {
    return errores;
  }

  let parametro = '';
  let m = RE_INTERVALO.exec(limpio);
  if (m) {
    parametro = m[2];
    if (parseFloat(numero(m[1])) > parseFloat(numero(m[3]))) {
      errores.push('El intervalo está al revés (el primer número es mayor que el segundo)');
    }
  }
  else {
    m = RE_BINARIA.exec(limpio);
    if (!m) {
      return ['Condición mal escrita: use @PARAMETRO == valor, >>, >=, <<, <= o a <= @PARAMETRO <= b'];
    }
    parametro = m[1];
    if (m[2] !== '==' && !RE_NUMERO.test(m[3])) {
      errores.push('Con ' + m[2] + ' el valor tiene que ser un número');
    }
    if (m[3] === '') {
      errores.push('Falta el valor');
    }
  }

  if (!existeParametro(parametro, parametros)) {
    errores.push('El parámetro ' + parametro.toUpperCase() + ' no existe');
  }
  return errores;
}

/* ---------------- CONSUMOS ---------------- */

export function consumoVacio(): Consumo {
  return { tipo: 'numero', numero: '1', parametro: '', operador: '--', extra: [], texto: '' };
}

export function parseConsumo(texto: string): Consumo {
  const c = consumoVacio();
  const limpio = sinEspacios(texto);
  if (limpio === '') {
    return c;
  }
  if (RE_NUMERO.test(limpio)) {
    c.numero = numero(limpio);
    return c;
  }
  if (RE_PARAM.test(limpio)) {
    c.tipo = 'parametro';
    c.parametro = limpio.toUpperCase();
    return c;
  }
  const m = RE_OPERACION.exec(limpio);
  if (m) {
    const pasos: { operador: OperadorConsumo, numero: string }[] = [];
    let paso: RegExpExecArray;
    RE_PASO.lastIndex = 0;
    while ((paso = RE_PASO.exec(m[2])) !== null) {
      pasos.push({ operador: paso[1] as OperadorConsumo, numero: numero(paso[2]) });
    }
    c.tipo = 'operacion';
    c.parametro = m[1].toUpperCase();
    c.operador = pasos[0].operador;
    c.numero = pasos[0].numero;
    c.extra = pasos.slice(1);
    return c;
  }
  c.tipo = 'texto';
  c.texto = String(texto).trim();
  return c;
}

export function buildConsumo(c: Consumo): string {
  switch (c.tipo) {
    case 'numero': return numero(c.numero);
    case 'parametro': return c.parametro;
    case 'operacion': return c.parametro + ' ' + c.operador + ' ' + numero(c.numero)
      + (c.extra || []).map(e => ' ' + e.operador + ' ' + numero(e.numero)).join('');
    default: return String(c.texto || '').trim();
  }
}

export function validarConsumo(texto: string, parametros: string[]): string[] {
  const limpio = sinEspacios(texto);
  if (limpio === '' || RE_NUMERO.test(limpio)) {
    return [];
  }

  let parametro = '';
  if (RE_PARAM.test(limpio)) {
    parametro = limpio;
  }
  else {
    const m2 = RE_OPERACION.exec(limpio);
    const m3 = RE_TRES_TERMINOS.exec(limpio);
    if (m2) {
      parametro = m2[1];
    }
    else if (m3) {
      parametro = m3[3];
    }
    else {
      return ['Consumo mal escrito: use un número, @PARAMETRO o @PARAMETRO ++ / -- / ** / *R número'];
    }
  }

  return existeParametro(parametro, parametros) ? [] : ['El parámetro ' + parametro.toUpperCase() + ' no existe'];
}

/* ---------------- REGLA COMPLETA ---------------- */

export interface ErroresRegla {
  total: number;
  campos: { [campo: string]: string[] };
}

export function validarRegla(regla: any, parametros: string[]): ErroresRegla {
  const campos: { [campo: string]: string[] } = {};
  const agregar = (campo: string, errores: string[]) => {
    if (errores.length > 0) {
      campos[campo] = (campos[campo] || []).concat(errores);
    }
  };

  ['nombre_parametro1', 'nombre_parametro2', 'nombre_parametro3', 'nombre_parametro4']
    .forEach(campo => agregar(campo, validarCondicion(regla[campo], parametros)));

  const articulos = String(regla.articulos || '').replace(/;/g, ',').split(',').map(a => a.trim()).filter(a => a !== '');
  if (articulos.length === 0) {
    agregar('articulos', ['La regla no tiene artículos']);
  }
  articulos.filter(a => !/^\d+$/.test(a)).forEach(a => agregar('articulos', ['Id de artículo no válido: ' + a]));

  const consumos = String(regla.consumo || '').split(';');
  consumos.forEach(c => agregar('consumo', validarConsumo(c, parametros)));
  if (String(regla.consumo || '').trim() !== '' && consumos.length > 1 && consumos.length !== articulos.length) {
    agregar('consumo', ['Hay ' + consumos.length + ' consumos para ' + articulos.length + ' artículos']);
  }

  let total = 0;
  Object.keys(campos).forEach(c => total += campos[c].length);
  return { total: total, campos: campos };
}

function existeParametro(nombre: string, parametros: string[]): boolean {
  const buscado = String(nombre || '').toUpperCase();
  return parametros.some(p => String(p).toUpperCase() === buscado);
}
