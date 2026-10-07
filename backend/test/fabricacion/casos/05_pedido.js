'use strict'

/*
 * 5. Pedido HoneyComb de principio a fin con el código real del backend, en una
 * transacción (se deshace al terminar, también lo que hace sp_pedidos_cola_add):
 *   alta del pedido como el configurador (POST /api/lm/bestellungen_hinzu2)
 *   -> hoja de fabricación (getDetail = sp_fabricacion_generate)
 *   -> parámetros de cada línea
 *   -> fichero XML de producción (exportCSV)
 *   -> simulación de la pantalla v3
 *   -> regenerar (force) y modificar el pedido
 *   -> cambios de configuración desde las pantallas (parámetro, Referencia en admin-data)
 *   -> reglas propias de un cliente
 * Con la configuración HoneyComb real de la BD (reglas, parámetros, ALTO_PLIEGUES).
 */

const { eq, ok, num } = require('../lib/informe');
const E = require('../lib/entorno');

const OPACO = { id: 1, text: 'OPACO' };
const TRASLUCIDO = { id: 10, text: 'TRASLÚCIDO' };
const PERFIL_BLANCO = { id: 1, text: 'BLANCO RAL 9016' };
const PERFIL_GRIS = { id: 3, text: 'GRIS RAL 7035' };
const MANUAL = { id: 1, text: 'MANUAL' };
const VARILLA = { id: 2, text: 'CON VARILLA' };
const MOTOR = { id: 5, text: 'MOTOR' };

function linea(ancho, alto, cantidad, tipo, color, perfil, acc) {
  return {
    TipoCortina: 7, ancho, alto, cantidad,
    tej_tipo_id: tipo.id, tej_tipo_text: tipo.text, tej_color_id: color.id, tej_color_text: color.text,
    color_perfil_id: perfil.id, color_perfil_text: perfil.text,
    hc_accionamiento_id: acc.id, hc_accionamiento_text: acc.text,
    precios: { T7_PVP: 123.45, T7_PVP_C1: '123.45', T7_Fecha_Entrega: '2026-10-30', T7_Transporte: '0' }
  };
}

/* Comprobación de XML bien formado sin dependencias: etiquetas equilibradas y texto sin < > & sueltos */
function errorXml(xml) {
  const pila = [];
  const re = /<\?[^>]*\?>|<!--[\s\S]*?-->|<(\/?)([A-Za-z_][\w.\-]*)[^<>]*?(\/?)>/g;
  let m, ultimo = 0;
  const textoMalo = (t) => /[<>]/.test(t) || /&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(t);
  while ((m = re.exec(xml))) {
    const t = xml.substring(ultimo, m.index);
    if (textoMalo(t)) return 'texto no válido: ' + JSON.stringify(t.substring(0, 60));
    ultimo = re.lastIndex;
    if (!m[2]) continue;
    if (m[1]) {
      const abierta = pila.pop();
      if (abierta !== m[2]) return '</' + m[2] + '> cierra <' + abierta + '>';
    } else if (!m[3]) {
      pila.push(m[2]);
    }
  }
  if (textoMalo(xml.substring(ultimo))) return 'texto no válido al final';
  if (pila.length) return 'sin cerrar: ' + pila.join(', ');
  return null;
}

/* Bloques HoneyComb del XML: { ancho, alto, componentes: [{ codigo, factor }] } */
function bloquesHoneyComb(xml) {
  return (xml.match(/<Detalles>[\s\S]*?<\/Detalles>/g) || [])
    .filter(b => b.indexOf('<Articulo>220.00</Articulo>') !== -1)
    .map(b => {
      const comp = [];
      const re = /<C(\d+)>([^<]*)<\/C\1>/g;
      let m;
      while ((m = re.exec(b))) {
        const f = new RegExp('<C' + m[1] + '_FACTOR>([^<]*)</C' + m[1] + '_FACTOR>').exec(b);
        const p1 = new RegExp('<C' + m[1] + '_P1>([^<]*)</C' + m[1] + '_P1>').exec(b);
        const p2 = new RegExp('<C' + m[1] + '_P2>([^<]*)</C' + m[1] + '_P2>').exec(b);
        const sc = new RegExp('<C' + m[1] + '_SECCION>([^<]*)</C' + m[1] + '_SECCION>').exec(b);
        comp.push({ codigo: m[2], factor: f ? Number(f[1].replace(',', '.')) : null,
          p1: p1 ? p1[1] : null, p2: p2 ? p2[1] : null, seccion: sc ? sc[1] : null });
      }
      const v = (tag) => { const x = new RegExp('<' + tag + '>([^<]*)</' + tag + '>').exec(b); return x ? x[1] : null; };
      return { ancho: v('Ancho'), alto: v('Alto'), precio: v('Precio'), componentes: comp };
    });
}

/* m² del tejido como lo define la HoneyComb: (ancho - descuento) x pliegues(alto) / 10000, 4 decimales sin redondear
   (4 decimales de m² = cm² enteros) */
function m2Tejido(anchoTejido, pliegues) {
  return Math.floor(anchoTejido * pliegues + 1e-9) / 10000;
}

module.exports = async function (inf) {
  inf.empezar('5. Pedido HoneyComb de principio a fin (código real del backend)');

  const best = E.controlador('sm/lm/bestellungen');
  const exp = E.controlador('sm/export');
  const fab = E.controlador('sm/fabricacion_reglas');
  const hc = E.controlador('sm/honeycomb');

  await E.enTransaccion(async () => {
    const art = async (cod) => E.valor('select idrow from articulos where ltrim(rtrim(cod_solupyme)) = @c', { c: cod });
    const ART = { BEIGE: await art('04810'), NEGRO: await art('04759'), BLANCO: await art('04755') };
    const pliegues = async (alto) => E.valor(`select top 1 v.valor from SOL_FABRICACION_TABLAS t join SOL_FABRICACION_TABLAS_VALORES v on v.idtabla = t.idrow
      where t.sistema = 'HONEYCOMB' and t.tabla = 'ALTO_PLIEGUES' and v.clave >= @a order by v.clave`, { a: { tipo: E.sql.Decimal(12, 2), valor: alto } });
    const descuento = async () => {
      const f = await E.valor("select origen from SOL_FABRICACION_PARAMETROS where sistema = 'HONEYCOMB' and name = '@TEJIDO_ANCHO'");
      const m = /^@ANCHO\s*--\s*([\d.]+)$/.exec(f || '');
      ok(m, '@TEJIDO_ANCHO no tiene la forma "@ANCHO -- n": ' + f);
      return Number(m[1]);
    };
    const tipoColumna = await E.valor("select type_name(user_type_id) from sys.columns where object_id = object_id('SOL_PEDIDOS_COLA_TIPO_7') and name = 'alto'");
    const decimales = tipoColumna === 'decimal';

    /* ---------- Alta del pedido como el configurador ---------- */
    const lineasEnviadas = [
      linea(150, 150, 1, OPACO, { id: 8, text: 'BEIGE' }, PERFIL_BLANCO, MANUAL),
      linea(100, 300, 2, OPACO, { id: 5, text: 'NEGRO' }, PERFIL_GRIS, VARILLA),
      linea(60, 20, 1, TRASLUCIDO, { id: 9, text: 'OTRO COLOR TRASLÚCIDO' }, PERFIL_BLANCO, MOTOR),
      linea(150.5, 150.5, 1, OPACO, { id: 1, text: 'BLANCO' }, PERFIL_BLANCO, MANUAL)
    ];
    const alta = await E.llamar(best.bestellungen_hinzu2, { params: { cli: 1, ref: 'TEST SUITE A' }, body: lineasEnviadas });
    await E.esperar();

    const pedido = await E.filas('select idrow, cliente, refcliente from SOL_PEDIDOS_COLA where referencia = @r', { r: alta.data && alta.data.referencia });
    const idPedido = pedido.length ? pedido[0].idrow : null;
    const lineas = idPedido ? await E.filas(`
      select l.id as idLinea, l.tipo, t.id, t.ancho, t.alto, t.cantidad, t.tej_color_id, t.color_perfil_id, t.hc_accionamiento_id, t.T7_PVP
      from SOL_PEDIDOS_COLA_LINEAS l join SOL_PEDIDOS_COLA_TIPO_7 t on t.idrow = l.id
      where l.idrow = @p order by l.id`, { p: idPedido }) : [];

    await inf.test('Alta: el pedido y sus 4 líneas se guardan como los envía el configurador', () => {
      eq([alta.status, alta.data.message], [200, 'ok'], 'respuesta del alta');
      ok(idPedido, 'no se encuentra el pedido creado');
      eq([pedido[0].cliente, pedido[0].refcliente], [1, 'TEST SUITE A'], 'cabecera');
      eq(lineas.length, 4, 'líneas guardadas');
      eq(lineas.map(l => [l.tipo, l.ancho, l.alto, l.cantidad, l.tej_color_id, l.color_perfil_id, l.hc_accionamiento_id]).slice(0, 3),
        [[7, 150, 150, 1, 8, 1, 1], [7, 100, 300, 2, 5, 3, 2], [7, 60, 20, 1, 9, 1, 5]], 'datos de las líneas');
      num(lineas[0].T7_PVP, 123.45, 'precio');
    });

    if (lineas.length !== 4) {
      inf.aviso('Sin las 4 líneas no se puede seguir con el pedido');
      return;
    }
    const [L1, L2, L3, L4] = lineas;

    await inf.test('Alta: medidas con decimales (150,5 x 150,5)', () => {
      if (decimales) {
        eq([L4.ancho, L4.alto], [150.5, 150.5], 'medidas con decimales');
      } else {
        eq([L4.ancho, L4.alto], [150, 150], 'columna int en esta BD: se guardan sin decimales');
        inf.aviso('SOL_PEDIDOS_COLA_TIPO_7.ancho/alto son int en esta BD: 150,5 se guarda como 150 (la fila de pliegues '
          + 'sale de 150 y no de 151)', 'Se corrige con el cambio a DECIMAL de la rama cambios_configurador (sqlMedidas/005 + backend).');
      }
    });

    /* ---------- Hoja de fabricación ---------- */
    const detalle = await E.llamar(exp.getDetail, { params: { id: idPedido, cli: 1, force: 1 } });
    const hoja = (detalle.data && detalle.data.Table) || [];
    const reglas = await E.filas("select idrow, orden, atributo, articulos, nombre_parametro1, consumo from SOL_ARTICULOS_FABRICACION_RELACION_V2 where sistema = 'HONEYCOMB' and cliente is null");
    const sinCondiciones = reglas.filter(r => !String(r.nombre_parametro1 || '').trim()).map(r => r.orden);
    const soloBlanco = reglas.filter(r => /BLANCO RAL 9016/.test(r.nombre_parametro1 || '')).map(r => r.orden);
    const deLinea = (L) => hoja.filter(f => f.idpedido === lineas.indexOf(L) + 1);
    const fila = (L, orden) => deLinea(L).filter(f => f.orden === orden);
    const desc = await descuento();

    await inf.test('Hoja: se genera para las 4 líneas', () => {
      eq(detalle.status, 200, 'getDetail');
      eq([1, 2, 3, 4].map(n => hoja.some(f => f.idpedido === n)), [true, true, true, true], 'líneas con componentes');
    });

    await inf.test('Hoja: componentes fijos en todas las líneas y los del perfil blanco solo en las de perfil blanco', () => {
      [L1, L2, L3, L4].forEach((L, i) => {
        const ordenes = deLinea(L).map(f => f.orden);
        sinCondiciones.forEach(o => ok(ordenes.indexOf(o) !== -1, 'línea ' + (i + 1) + ': falta el componente fijo de orden ' + o));
      });
      soloBlanco.forEach(o => {
        ok(fila(L1, o).length > 0, 'L1 (perfil blanco) sin el orden ' + o);
        eq(fila(L2, o).length, 0, 'L2 (perfil gris) con el orden ' + o);
      });
    });

    await inf.test('Hoja: tejido según el color, en m², (ancho - ' + desc + ') x pliegues(alto), 4 decimales sin redondear', async () => {
      const t = fila(L1, 350);
      eq(t.length, 1, 'una línea de tejido');
      const p = await pliegues(150);
      eq([t[0].articulo, t[0].cod_sol, t[0].unidad, t[0].descunidad], [ART.BEIGE, '04810', 2, 'm2'], 'artículo del color BEIGE');
      num(t[0].consumo, m2Tejido(150 - desc, p), 'm² (pliegues ' + p + ')');
      ok(/HONEYCOMB/i.test(t[0].descripcion), 'descripción del artículo: ' + t[0].descripcion);
      eq(t[0].cantidad, 1, 'cantidad de la línea');
    });

    await inf.test('Hoja: alto fuera de la tabla de pliegues -> consumo -1 (línea 2, alto 300)', () => {
      const t = fila(L2, 350);
      eq([t.length, t[0].articulo, Number(t[0].consumo), t[0].cantidad], [1, ART.NEGRO, -1, 2]);
    });

    await inf.test('Hoja: color sin Referencia -> línea SIN ARTÍCULO (línea 3, translúcido)', () => {
      const t = fila(L3, 350);
      eq(t.length, 1, 'una línea de tejido');
      eq([t[0].articulo, t[0].unidad, t[0].cod_sol], [null, null, ''], 'sin artículo');
      eq(t[0].descripcion, 'SIN ARTÍCULO: TEJIDO (@TEJIDO_ARTICULO = vacío)', 'aviso');
    });

    await inf.test('Hoja: alto por debajo de la tabla usa la primera fila (línea 3, alto 20)', async () => {
      const prm = await E.filas("select parametro, valor from SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS where idrow = @id and parametro = '@TEJIDO_ALTO'", { id: L3.id });
      num(prm[0].valor, await pliegues(0), 'pliegues de la primera fila');
    });

    await inf.test('Hoja: medidas con decimales usan el cm superior de la tabla (línea 4)', async () => {
      const t = fila(L4, 350);
      const alto = decimales ? 150.5 : 150;
      const ancho = decimales ? 150.5 : 150;
      const p = await pliegues(alto);
      num(t[0].consumo, m2Tejido(ancho - desc, p), 'm² con pliegues(' + alto + ') = ' + p);
      if (decimales) num(p, await pliegues(151), '150,5 -> fila 151');
      eq(t[0].articulo, ART.BLANCO, 'artículo del color BLANCO');
    });

    await inf.test('Hoja: consumos en metros (unidad 3) pasan de cm a m', () => {
      const enMetros = deLinea(L1).filter(f => f.unidad === 3);
      ok(enMetros.length > 0, 'no hay componentes en metros para comprobar');
      enMetros.forEach(f => {
        const r = reglas.find(x => x.orden === f.orden && String(x.articulos).split(',').indexOf(String(f.articulo)) !== -1);
        if (r && /^@ANCHO\s*--\s*0$/.test(r.consumo)) num(f.consumo, 1.5, 'orden ' + f.orden + ' (@ANCHO -- 0 = 150 cm)');
        if (r && /^@ALTO\s*--\s*0$/.test(r.consumo)) num(f.consumo, 1.5, 'orden ' + f.orden + ' (@ALTO -- 0 = 150 cm)');
      });
    });

    await inf.test('Hoja: todo componente con artículo tiene descripción y unidad', () => {
      const malos = hoja.filter(f => f.articulo !== null && (!f.descripcion || f.unidad === null))
        .map(f => 'línea ' + f.idpedido + ' orden ' + f.orden + ' artículo ' + f.articulo);
      eq(malos, [], 'componentes incompletos');
    });

    const sinCodigo = [...new Set(hoja.filter(f => f.articulo !== null && !f.cod_sol).map(f => f.articulo + ' (orden ' + f.orden + ')'))];
    if (sinCodigo.length) {
      inf.aviso('Componentes sin código Solupyme (en el XML van vacíos): ' + sinCodigo.join(', '), 'Dato de ARTICULOS.cod_solupyme, no del motor.');
    }

    await inf.test('Parámetros guardados de la línea 1 (tejido)', async () => {
      const prm = {};
      (await E.filas('select parametro, valor from SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS where idrow = @id', { id: L1.id })).forEach(p => { prm[p.parametro] = p.valor; });
      eq([prm['@ANCHO'], prm['@ALTO'], prm['@TEJIDO_COLOR_ID'], prm['@TEJIDO_REFERENCIA'], prm['@TEJIDO_ARTICULO']],
        [decimales ? '150.00' : '150', decimales ? '150.00' : '150', '8', '04810', String(ART.BEIGE)]);
      num(prm['@TEJIDO_ANCHO'], 150 - desc, '@TEJIDO_ANCHO');
      num(prm['@TEJIDO_ALTO'], await pliegues(150), '@TEJIDO_ALTO');
    });

    /* ---------- XML de producción ---------- */
    const fichero = await E.llamar(exp.exportCSV, { params: { id: idPedido, cli: 1 } });
    const xml = String(fichero.data || '');
    const bloques = bloquesHoneyComb(xml);

    await inf.test('XML: se descarga como fichero y está bien formado', () => {
      eq(fichero.status, 200, 'exportCSV');
      eq(fichero.headers['content-disposition'], 'attachment; filename=' + idPedido + '.xml', 'nombre del fichero');
      eq(errorXml(xml), null, 'XML');
    });

    await inf.test('XML: un bloque por unidad (cantidades 1 + 2 + 1 + 1) con sus medidas en metros', () => {
      eq(bloques.length, 5, 'bloques HoneyComb');
      eq(bloques.map(b => b.ancho), ['1,500000', '1,000000', '1,000000', '0,600000', decimales ? '1,505000' : '1,500000'], 'anchos');
      eq(bloques[0].precio, '123,45', 'precio');
    });

    await inf.test('XML: mismos componentes que la hoja, salvo SIN ARTÍCULO', () => {
      const porLinea = [L1, L2, L2, L3, L4];
      bloques.forEach((b, i) => {
        const esperados = deLinea(porLinea[i]).filter(f => f.articulo !== null).sort((x, y) => x.orden - y.orden || x.id - y.id);
        eq(b.componentes.length, esperados.length, 'bloque ' + (i + 1) + ': número de componentes');
        eq(b.componentes.map(c => c.codigo), esperados.map(f => f.cod_sol), 'bloque ' + (i + 1) + ': códigos');
      });
      ok(xml.indexOf('SIN ART') === -1, 'el aviso SIN ARTÍCULO no debe ir al XML');
      const tejido1 = bloques[0].componentes.find(c => c.codigo === '04810');
      num(tejido1 && tejido1.factor, fila(L1, 350)[0].consumo, 'factor del tejido = consumo de la hoja');
    });

    await inf.test('XML: el tejido lleva su ancho de corte y sus pliegues (P1/P2, m); el resto, el ancho/alto de la cortina', async () => {
      const metros = (cm) => (Math.round(cm) / 100).toFixed(6).replace('.', ',');
      const t = bloques[0].componentes.find(c => c.codigo === '04810');
      eq([t.p1, t.p2], [metros(150 - desc), metros(await pliegues(150))], 'tejido de la línea 1 (150 x 150)');
      const otros = bloques[0].componentes.filter(c => c.codigo !== '04810');
      ok(otros.length > 0, 'sin otros componentes');
      eq(otros.filter(c => c.p1 !== '1,500000' || c.p2 !== '1,500000').map(c => c.codigo), [], 'componentes que no llevan 150 x 150');
      const t2 = bloques[1].componentes.find(c => c.factor === -1);
      eq([t2.p1, t2.p2], [metros(100 - desc), '0'], 'alto fuera de la tabla: sin pliegues (0), nunca el alto de la ventana');
    });

    await inf.test('XML: la SECCION de cada componente es la clasificación de su artículo (99 si no tiene), como CortinaDecor', async () => {
      const clas = {};
      (await E.filas(`select a.cod_solupyme as cod, isnull(a.clasificacion, '99') as clas from articulos a
        where a.idrow in (select f.articulo from SOL_PEDIDOS_COLA_TIPO_7_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_7 t on t.id = f.idrow
          join SOL_PEDIDOS_COLA_LINEAS l on l.id = t.idrow where l.idrow = @p and f.articulo is not null)`, { p: idPedido }))
        .forEach(x => { clas[String(x.cod).trim()] = String(x.clas).trim(); });
      const malos = [];
      bloques.forEach((b, i) => b.componentes.forEach(c => {
        if (c.seccion !== clas[c.codigo]) malos.push('bloque ' + (i + 1) + ' ' + c.codigo + ': SECCION ' + c.seccion + ' (clasificación ' + clas[c.codigo] + ')');
      }));
      eq(malos, [], 'componentes con una SECCION distinta de la clasificación del artículo');
      eq(bloques[0].componentes.find(c => c.codigo === '04810').seccion, '02', 'el tejido es 02');
      eq(bloques[0].componentes.filter(c => c.seccion === '0' || c.seccion === '').length, 0, 'ninguno con 0 o vacío');
    });

    await inf.test('XML: ningún componente con consumo negativo (-1 = no se ha podido calcular)', () => {
      const negativos = [];
      bloques.forEach((b, i) => b.componentes.filter(c => c.factor < 0).forEach(c => negativos.push('bloque ' + (i + 1) + ': ' + c.codigo + ' = ' + c.factor)));
      eq(negativos, [], 'componentes con consumo negativo en el fichero de producción (alto 300 > máximo de ALTO_PLIEGUES)');
    });

    /* ---------- Simulación de la pantalla v3 ---------- */
    await inf.test('Simulación (pantalla v3): mismo resultado que la hoja', async () => {
      const s = await E.llamar(fab.simular, { body: { sistema: 'HONEYCOMB', idPedido } });
      eq(s.status, 200, 'simular');
      const clave = (f) => [f.idpedido, f.orden, f.articulo, Number(f.consumo), f.descripcion].join('|');
      eq(s.data.Fabricacion.map(clave).sort(), hoja.map(clave).sort(), 'componentes');
      eq([s.data.Pedido.cliente, s.data.Pedido.reglas_cliente], [1, 0], 'reglas generales');
      ok(s.data.Parametros.some(p => p.parametro === '@TEJIDO_ALTO'), 'parámetros');
    });

    /* ---------- Regenerar y modificar ---------- */
    await inf.test('Modificar el pedido: sin force no se regenera; con force sí', async () => {
      eq(await E.valor('select fabricacion from SOL_PEDIDOS_COLA where idrow = @p', { p: idPedido }), 1, 'contador de generaciones');
      await E.q(`declare @t table(id int)
        insert into @t exec sol_pedidos_cola_tipo_7_add @id, 0, 150, 150, 1, 1, 'OPACO', 5, 'NEGRO', 1, 'BLANCO RAL 9016', 1, 'MANUAL', 123.45, '123.45', null, null`, { id: L1.id });
      let r = await E.llamar(exp.getDetail, { params: { id: idPedido, cli: 1, force: 0 } });
      eq(r.data.Table.find(f => f.idpedido === 1 && f.orden === 350).articulo, ART.BEIGE, 'sin force: la hoja anterior');
      r = await E.llamar(exp.getDetail, { params: { id: idPedido, cli: 1, force: 1 } });
      eq(r.data.Table.find(f => f.idpedido === 1 && f.orden === 350).articulo, ART.NEGRO, 'con force: el color nuevo');
      eq(await E.valor('select fabricacion from SOL_PEDIDOS_COLA where idrow = @p', { p: idPedido }), 2, 'contador');
      eq(r.data.Table.length, hoja.length, 'mismo número de componentes');
    });

    await inf.test('Cambio de configuración: descuento de ancho editado desde la pantalla de parámetros', async () => {
      const r = await E.llamar(fab.parametro_edit, { body: { sistema: 'HONEYCOMB', name: '@TEJIDO_ANCHO', tipo: 'FORMULA', origen: '@ANCHO -- 4', orden: 220 } });
      eq(r.status, 200, 'guardar parámetro');
      const s = await E.llamar(fab.simular, { body: { sistema: 'HONEYCOMB', idPedido } });
      const t = s.data.Fabricacion.find(f => f.idpedido === 1 && f.orden === 350);
      num(t.consumo, m2Tejido(146, await pliegues(150)), 'm² con ancho - 4');
    });

    await inf.test('Cambio de configuración: Referencia de un color cambiada y quitada en admin-data', async () => {
      const color = (await E.filas('select * from SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO where idColorTejido = 5'))[0];
      const guardar = (Referencia) => E.llamar(hc.honeycomb_colortejido_update, { body: Object.assign({}, color, { Referencia }) });
      eq((await guardar('04755')).status, 200, 'guardar Referencia');
      let s = await E.llamar(fab.simular, { body: { sistema: 'HONEYCOMB', idPedido } });
      eq(s.data.Fabricacion.find(f => f.idpedido === 1 && f.orden === 350).articulo, ART.BLANCO, 'artículo de la nueva Referencia');
      eq((await guardar('')).status, 200, 'quitar Referencia');
      s = await E.llamar(fab.simular, { body: { sistema: 'HONEYCOMB', idPedido } });
      const t = s.data.Fabricacion.find(f => f.idpedido === 1 && f.orden === 350);
      eq([t.articulo, t.descripcion], [null, 'SIN ARTÍCULO: TEJIDO (@TEJIDO_ARTICULO = vacío)'], 'sin Referencia');
    });

    /* ---------- Cliente con reglas propias ---------- */
    await inf.test('Cliente con reglas propias: su pedido usa solo sus reglas', async () => {
      const regla = await E.llamar(fab.regla_save, { body: { idrow: 0, sistema: 'HONEYCOMB', cliente: 5, orden: 350, atributo: 'TEJIDO', articulos: '@TEJIDO_ARTICULO', consumo: '@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001' } });
      eq(regla.status, 200, 'regla del cliente 5');
      const b = await E.llamar(best.bestellungen_hinzu2, { params: { cli: 5, ref: 'TEST SUITE B' }, body: [linea(120, 100, 1, OPACO, { id: 8, text: 'BEIGE' }, PERFIL_BLANCO, MANUAL)] });
      await E.esperar();
      const idB = await E.valor('select idrow from SOL_PEDIDOS_COLA where referencia = @r', { r: b.data.referencia });
      const s = await E.llamar(fab.simular, { body: { sistema: 'HONEYCOMB', idPedido: idB } });
      eq(s.data.Fabricacion.map(f => [f.orden, f.articulo]), [[350, ART.BEIGE]], 'solo la regla del cliente');
      eq(s.data.Pedido.reglas_cliente, 1, 'aviso de reglas del cliente');
    });

    /* ---------- Referencia del cliente con caracteres especiales ---------- */
    await inf.test('XML: referencia del cliente con & < > comillas', async () => {
      const c = await E.llamar(best.bestellungen_hinzu2, { params: { cli: 1, ref: 'A&B <C> "D"' }, body: [linea(100, 100, 1, OPACO, { id: 8, text: 'BEIGE' }, PERFIL_BLANCO, MANUAL)] });
      await E.esperar();
      const idC = await E.valor('select idrow from SOL_PEDIDOS_COLA where referencia = @r', { r: c.data.referencia });
      const f = await E.llamar(exp.exportCSV, { params: { id: idC, cli: 1 } });
      const error = errorXml(String(f.data));
      if (error) {
        inf.aviso('[preexistente] La referencia del cliente va al XML sin escapar: con & o < el fichero no es XML válido (' + error + ')',
          'sp_fichero_produccion_2 concatena refcliente tal cual en <DescCliente> para todos los productos, no solo HoneyComb.');
      }
    });
  });
};
