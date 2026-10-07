'use strict'

/*
 * 4. Configuración: controladores reales del backend (fabricacion_reglas.js, honeycomb.js)
 * y los procedimientos que llaman, con todos sus códigos de error. En una transacción.
 */

const { eq, ok } = require('../lib/informe');
const E = require('../lib/entorno');

const HC = 'HONEYCOMB';

module.exports = async function (inf) {
  inf.empezar('4. Configuración: parámetros, tablas, reglas y búsqueda de artículos (controladores + SPs)');

  const fab = E.controlador('sm/fabricacion_reglas');
  const hc = E.controlador('sm/honeycomb');
  const post = (fn, body) => E.llamar(fn, { body });
  const get = (fn, query) => E.llamar(fn, { query });

  await E.enTransaccion(async () => {
    /* Otro sistema activo, para comprobar que no se mezclan búsquedas ni tablas */
    await E.q(`
      insert into SOL_FABRICACION_SISTEMAS(sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo)
      values ('TSUITE2', 'Prueba', 7, 'SOL_PEDIDOS_COLA_TIPO_7', 'SOL_PEDIDOS_COLA_TIPO_7_FABRICACION', 'SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS', 'temp_sp_fabricacion_tipo_7', 1)
      insert into SOL_FABRICACION_BUSQUEDAS(busqueda, sistema, descripcion, tabla, clave, resultado)
      values ('TS2_REF', 'TSUITE2', 'x', 'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO', 'idColorTejido', 'Referencia')
      insert into SOL_FABRICACION_TABLAS(sistema, tabla, descripcion, clave_texto, valor_texto) values ('TSUITE2', 'T2', 'x', 'a', 'b')`);

    const param = (name) => E.filas('select name, tipo, origen, orden, busqueda, tabla from SOL_FABRICACION_PARAMETROS where sistema = @s and name = @n', { s: HC, n: name });

    await inf.test('Parámetros: alta, nombre sin @, modificación sin duplicar y borrado', async () => {
      eq((await post(fab.parametro_edit, { sistema: HC, name: '@TS_X1', tipo: 'FORMULA', origen: '@ANCHO -- 1', orden: 900 })).status, 200, 'alta');
      eq((await post(fab.parametro_edit, { sistema: HC, name: 'ts_x2', tipo: 'formula', origen: '@ALTO', orden: 901 })).status, 200, 'sin @');
      eq((await param('@TS_X2')).length, 1, 'se guarda como @TS_X2');
      eq((await post(fab.parametro_edit, { sistema: HC, name: '@ts_x1', tipo: 'FORMULA', origen: '@ANCHO -- 2', orden: 900 })).status, 200, 'modificar');
      const x1 = await param('@TS_X1');
      eq([x1.length, x1[0].origen], [1, '@ANCHO -- 2'], 'modificado y sin duplicar');
      eq((await post(fab.parametro_delete, { sistema: HC, name: '@TS_X2' })).status, 200, 'borrar');
      eq((await post(fab.parametro_delete, { sistema: HC, name: '@TS_X2' })).status, 404, 'borrar otra vez');
    });

    await inf.test('Parámetros: BUSQUEDA y TABLA guardan su búsqueda/tabla; al cambiar de tipo se limpian', async () => {
      eq((await post(fab.parametro_edit, { sistema: HC, name: '@TS_B', tipo: 'BUSQUEDA', origen: '@tejido_color_id', orden: 905, busqueda: 'HC_TEJIDO_REFERENCIA' })).status, 200, 'búsqueda');
      eq(await param('@TS_B'), [{ name: '@TS_B', tipo: 'BUSQUEDA', origen: '@TEJIDO_COLOR_ID', orden: 905, busqueda: 'HC_TEJIDO_REFERENCIA', tabla: null }], 'búsqueda guardada');
      eq((await post(fab.parametro_edit, { sistema: HC, name: '@TS_B', tipo: 'TABLA', origen: '@ALTO', orden: 905, tabla: 'ALTO_PLIEGUES', busqueda: 'HC_TEJIDO_REFERENCIA' })).status, 200, 'a tabla');
      eq(await param('@TS_B'), [{ name: '@TS_B', tipo: 'TABLA', origen: '@ALTO', orden: 905, busqueda: null, tabla: 'ALTO_PLIEGUES' }], 'tabla guardada, búsqueda limpia');
      eq((await post(fab.parametro_edit, { sistema: HC, name: '@TS_B', tipo: 'FORMULA', origen: '@ALTO', orden: 905, tabla: 'ALTO_PLIEGUES' })).status, 200, 'a fórmula');
      eq((await param('@TS_B'))[0].tabla, null, 'tabla limpia');
      eq((await post(fab.parametro_edit, { sistema: HC, name: '@TS_C', tipo: 'COLUMNA', origen: 'ANCHO', orden: 906 })).status, 200, 'columna');
      eq((await param('@TS_C'))[0].origen, 'ancho', 'nombre real de la columna');
    });

    await inf.test('Parámetros: cada error con su mensaje', async () => {
      const casos = [
        [{ sistema: 'NOPE', name: '@A', tipo: 'FORMULA', origen: '1' }, 'Sistema no válido'],
        [{ sistema: HC, name: '@', tipo: 'FORMULA', origen: '1' }, 'Nombre no válido'],
        [{ sistema: HC, name: '@A B', tipo: 'FORMULA', origen: '1' }, 'Nombre no válido'],
        [{ sistema: HC, name: '@AÑO', tipo: 'FORMULA', origen: '1' }, 'Nombre no válido'],
        [{ sistema: HC, name: '@ALTURA_MÍNIMA', tipo: 'FORMULA', origen: '1' }, 'Nombre no válido'],
        [{ sistema: HC, name: "@A';--", tipo: 'FORMULA', origen: '1' }, 'Nombre no válido'],
        [{ sistema: HC, name: '@A', tipo: 'OTRO', origen: '1' }, 'Tipo no válido: COLUMNA, FORMULA, BUSQUEDA o TABLA'],
        [{ sistema: HC, name: '@A', tipo: 'COLUMNA', origen: 'no_existe' }, 'La columna no existe'],
        [{ sistema: HC, name: '@A', tipo: 'FORMULA', origen: '  ' }, 'La fórmula no puede estar vacía'],
        [{ sistema: HC, name: '@A', tipo: 'BUSQUEDA', origen: '@NO', orden: 900, busqueda: 'HC_TEJIDO_REFERENCIA' }, 'El parámetro de entrada'],
        [{ sistema: HC, name: '@A', tipo: 'BUSQUEDA', origen: '@TEJIDO_M2', orden: 100, busqueda: 'HC_TEJIDO_REFERENCIA' }, 'El parámetro de entrada'],
        [{ sistema: HC, name: '@TS_X1', tipo: 'TABLA', origen: '@TS_X1', orden: 950, tabla: 'ALTO_PLIEGUES' }, 'El parámetro de entrada'],
        [{ sistema: HC, name: '@A', tipo: 'BUSQUEDA', origen: '@ALTO', orden: 'abc', busqueda: 'HC_TEJIDO_REFERENCIA' }, 'El parámetro de entrada'],
        [{ sistema: HC, name: '@A', tipo: 'BUSQUEDA', origen: '@ALTO', orden: 900, busqueda: 'NOPE' }, 'Búsqueda no válida'],
        [{ sistema: HC, name: '@A', tipo: 'BUSQUEDA', origen: '@ALTO', orden: 900 }, 'Búsqueda no válida'],
        [{ sistema: HC, name: '@A', tipo: 'BUSQUEDA', origen: '@ALTO', orden: 900, busqueda: 'TS2_REF' }, 'Búsqueda no válida'],
        [{ sistema: HC, name: '@A', tipo: 'TABLA', origen: '@ALTO', orden: 900, tabla: 'NOPE' }, 'Tabla de valores no válida'],
        [{ sistema: HC, name: '@A', tipo: 'TABLA', origen: '@ALTO', orden: 900, tabla: 'T2' }, 'Tabla de valores no válida']
      ];
      const malos = [];
      for (const [body, mensaje] of casos) {
        const r = await post(fab.parametro_edit, body);
        if (r.status !== 400 || String(r.data.message).indexOf(mensaje) !== 0) {
          malos.push(JSON.stringify(body) + ' -> ' + r.status + ' ' + r.data.message);
        }
      }
      eq(malos, [], 'respuestas distintas de la esperada');
      eq(await E.valor("select count(*) from SOL_FABRICACION_PARAMETROS where sistema = 'HONEYCOMB' and name = '@A'"), 0, 'no se ha guardado nada');
    });

    await inf.test('Tablas de valores: errores', async () => {
      const filas = (n) => Array.from({ length: n }, (_, i) => ({ clave: i, valor: i }));
      const casos = [
        [{ sistema: HC, tabla: 'TS_T', valores: [] }, 'La tabla no tiene valores'],
        [{ sistema: HC, tabla: 'TS_T' }, 'La tabla no tiene valores'],
        [{ sistema: HC, tabla: 'TS_T', valores: filas(5001) }, 'La tabla no tiene valores'],
        [{ sistema: HC, tabla: 'TS_T', valores: [{ clave: 'abc', valor: 1 }] }, 'La tabla no tiene valores'],
        [{ sistema: HC, tabla: 'TS_T', valores: [{ clave: 1, valor: '' }] }, 'La tabla no tiene valores'],
        [{ sistema: HC, tabla: 'TS_T', valores: [{ clave: '"/><x', valor: 1 }] }, 'La tabla no tiene valores'],
        [{ sistema: HC, tabla: 'TS_T', valores: [{ clave: 1e30, valor: 1 }] }, 'La tabla no tiene valores'],
        [{ sistema: HC, tabla: 'TS T', valores: filas(2) }, 'Nombre no válido'],
        [{ sistema: HC, tabla: "x';drop", valores: filas(2) }, 'Nombre no válido'],
        [{ sistema: HC, tabla: '', valores: filas(2) }, 'Nombre no válido'],
        [{ sistema: HC, tabla: 'TAMAÑO', valores: filas(2) }, 'Nombre no válido'],
        [{ sistema: HC, tabla: 'ALTURA_MÍNIMA', valores: filas(2) }, 'Nombre no válido'],
        [{ sistema: 'NOPE', tabla: 'TS_T', valores: filas(2) }, 'Sistema no válido'],
        [{ sistema: HC, tabla: 'TS_T', valores: [{ clave: 1, valor: 1 }, { clave: '1,00', valor: 2 }] }, 'Hay claves repetidas'],
        [{ sistema: HC, tabla: 'TS_T', valores: [{ clave: 0.001, valor: 1 }, { clave: 0.004, valor: 2 }] }, 'Hay claves repetidas']
      ];
      const malos = [];
      for (const [body, mensaje] of casos) {
        const r = await post(fab.tabla_guardar, body);
        if (r.status !== 400 || String(r.data.message).indexOf(mensaje) !== 0) {
          malos.push(JSON.stringify(body).substring(0, 120) + ' -> ' + r.status + ' ' + r.data.message);
        }
      }
      eq(malos, [], 'respuestas distintas de la esperada');
      eq(await E.valor("select count(*) from SOL_FABRICACION_TABLAS where tabla = 'TS_T'"), 0, 'no se ha guardado nada');
    });

    await inf.test('Tablas de valores: alta con coma decimal, listado, sustitución completa y nombre en minúsculas', async () => {
      let r = await post(fab.tabla_guardar, { sistema: HC, tabla: 'ts_t', descripcion: 'Prueba', clave_texto: 'Alto', valor_texto: 'cm',
        valores: [{ clave: '20', valor: '2,5' }, { clave: '10,5', valor: 1 }, { clave: 30, valor: '3' }] });
      eq(r.status, 200, 'alta');
      r = await get(fab.tabla_valores, { sistema: HC, tabla: 'TS_T' });
      eq(r.data.Table, [{ clave: 10.5, valor: 1 }, { clave: 20, valor: 2.5 }, { clave: 30, valor: 3 }], 'valores ordenados');
      r = await get(fab.tablas, { sistema: HC });
      const t = r.data.Table.find(x => x.tabla === 'TS_T');
      eq([t.filas, t.desde, t.hasta, t.descripcion, t.clave_texto], [3, 10.5, 30, 'Prueba', 'Alto'], 'resumen');
      eq((await post(fab.tabla_guardar, { sistema: HC, tabla: 'TS_T', descripcion: 'Otra', valores: [{ clave: 1, valor: 9 }] })).status, 200, 'sustituir');
      r = await get(fab.tabla_valores, { sistema: HC, tabla: 'TS_T' });
      eq(r.data.Table, [{ clave: 1, valor: 9 }], 'solo quedan las filas nuevas');
      eq(await E.valor("select count(*) from SOL_FABRICACION_TABLAS where tabla = 'TS_T'"), 1, 'una sola tabla');
      const muchas = Array.from({ length: 5000 }, (_, i) => ({ clave: i, valor: i * 2 }));
      eq((await post(fab.tabla_guardar, { sistema: HC, tabla: 'TS_T', valores: muchas })).status, 200, '5000 filas');
      eq(await E.valor("select count(*) from SOL_FABRICACION_TABLAS_VALORES v join SOL_FABRICACION_TABLAS t on t.idrow = v.idtabla where t.tabla = 'TS_T'"), 5000);
    });

    await inf.test('Tablas de valores: no se borra una tabla en uso; borrar quita también sus filas', async () => {
      let r = await post(fab.tabla_delete, { sistema: HC, tabla: 'ALTO_PLIEGUES' });
      eq([r.status, r.data.message], [400, 'La tabla la usa algún parámetro: cambie o borre antes el parámetro'], 'en uso');
      eq((await post(fab.tabla_delete, { sistema: HC, tabla: 'NO_EXISTE' })).status, 404, 'inexistente');
      eq((await post(fab.tabla_delete, { sistema: 'TSUITE2', tabla: 'TS_T' })).status, 404, 'de otro sistema');
      const id = await E.valor("select idrow from SOL_FABRICACION_TABLAS where tabla = 'TS_T'");
      eq((await post(fab.tabla_delete, { sistema: HC, tabla: 'ts_t' })).status, 200, 'borrar (minúsculas)');
      eq(await E.valor('select count(*) from SOL_FABRICACION_TABLAS_VALORES where idtabla = @id', { id }), 0, 'filas borradas');
      eq(await E.valor("select count(*) from SOL_FABRICACION_TABLAS_VALORES v join SOL_FABRICACION_TABLAS t on t.idrow = v.idtabla where t.tabla = 'ALTO_PLIEGUES'"), 251, 'ALTO_PLIEGUES intacta');
    });

    await inf.test('Búsquedas: las del sistema y las generales, no las de otros sistemas', async () => {
      const r = await get(fab.busquedas, { sistema: HC });
      eq(r.data.Table.map(b => b.busqueda).sort(), ['ARTICULO_POR_CODIGO', 'HC_PERFIL_REFERENCIA', 'HC_TEJIDO_REFERENCIA']);
      const r2 = await get(fab.busquedas, { sistema: 'TSUITE2' });
      eq(r2.data.Table.map(b => b.busqueda).sort(), ['ARTICULO_POR_CODIGO', 'TS2_REF']);
    });

    await inf.test('Reglas: listado (artículo según el pedido incluido), alta, edición y errores', async () => {
      let r = await get(fab.reglas, { sistema: HC });
      eq(r.status, 200, 'listado');
      const tejido = r.data.Table.find(x => x.articulos === '@TEJIDO_ARTICULO');
      ok(tejido, 'falta la regla del tejido');
      eq(tejido.detalle, '@TEJIDO_ARTICULO (según pedido) ', 'texto de la regla del tejido');
      ok(r.data.Table.every(x => x.detalle !== null), 'todas las reglas tienen texto');

      const base = { sistema: HC, cliente: '', orden: 999, atributo: 'TS_REGLA', articulos: '16472', nombre_parametro1: '@ANCHO >> 1', operacion: 'y', consumo: '1' };
      r = await post(fab.regla_save, Object.assign({}, base, { idrow: 0 }));
      eq(r.status, 200, 'alta');
      const id = r.data.idrow;
      let fila = (await E.filas('select cliente, operacion, operacion2, atributo from SOL_ARTICULOS_FABRICACION_RELACION_V2 where idrow = @id', { id }))[0];
      eq(fila, { cliente: null, operacion: 'Y', operacion2: '-', atributo: 'TS_REGLA' }, 'guardada (cliente vacío = todos, op en mayúscula)');
      eq((await post(fab.regla_save, Object.assign({}, base, { idrow: id, cliente: 5, atributo: 'TS_EDITADA' }))).status, 200, 'editar');
      eq((await E.filas('select cliente, atributo from SOL_ARTICULOS_FABRICACION_RELACION_V2 where idrow = @id', { id }))[0], { cliente: 5, atributo: 'TS_EDITADA' });
      eq((await post(fab.regla_save, Object.assign({}, base, { idrow: id, sistema: 'TSUITE2' }))).status, 404, 'no cambia de sistema');
      eq((await post(fab.regla_save, Object.assign({}, base, { idrow: 0, sistema: 'NOPE' }))).data.message, 'Sistema no válido');
      eq((await post(fab.regla_save, Object.assign({}, base, { idrow: 0, cliente: 99999999 }))).data.message, 'Cliente no válido');

      const upd = (campo, valor) => post(fab.regla_update, { idrow: id, campo, valor });
      eq((await upd('sistema', 'X')).status, 400, 'campo no editable');
      eq((await upd('operacion', 'x')).status, 200);
      eq((await upd('operacion2', 'o')).status, 200);
      eq((await upd('orden', 'abc')).status, 400, 'orden no numérico');
      eq((await upd('cliente', '99999999')).status, 400, 'cliente inexistente');
      eq((await upd('cliente', '')).status, 200, 'cliente vacío');
      eq((await upd('consumo', '@ANCHO -- 1')).status, 200);
      fila = (await E.filas('select cliente, operacion, operacion2, consumo from SOL_ARTICULOS_FABRICACION_RELACION_V2 where idrow = @id', { id }))[0];
      eq(fila, { cliente: null, operacion: '-', operacion2: 'O', consumo: '@ANCHO -- 1' }, 'edición en la tabla');
      eq((await post(fab.regla_update, { idrow: 99999999, campo: 'orden', valor: '1' })).status, 400, 'regla inexistente');

      eq((await post(fab.regla_delete, { idrow: id })).status, 200, 'borrar');
      eq((await post(fab.regla_delete, { idrow: id })).status, 404, 'borrar otra vez');
    });

    await inf.test('Catálogos de la pantalla: sistemas, clientes, columnas, valores y artículos', async () => {
      eq((await get(fab.sistemas, {})).data.Table.some(s => s.sistema === HC), true, 'sistemas');
      const cli = (await get(fab.clientes, {})).data.Table.map(c => c.idrow);
      ok(cli.indexOf(1) !== -1 && cli.indexOf(5) !== -1, 'clientes 1 y 5');
      const col = (await get(fab.columnas, { sistema: HC })).data.Table.map(c => c.name);
      ok(col.indexOf('ancho') !== -1 && col.indexOf('id') === -1 && col.indexOf('idrow') === -1, 'columnas');
      eq((await get(fab.columnas, { sistema: 'NOPE' })).data.Table, [], 'columnas de un sistema inexistente');
      const val = (await get(fab.parametros_valores, { sistema: HC })).data.Table;
      ok(val.some(v => v.name === '@TEJIDO_COLOR_ID' && v.valor === '8'), 'valores del color de tejido');
      eq((await get(fab.articulos, { ids: '16472,abc,16476' })).data.Table.length, 2, 'artículos');
      eq((await get(fab.articulos, { ids: '' })).data.Table, [], 'sin ids');
      eq((await get(fab.articulos, { ids: '16472);drop table x;--' })).data.Table.length, 1, 'ids con texto');
    });

    await inf.test('Simulación: errores de entrada', async () => {
      eq((await post(fab.simular, { sistema: HC })).status, 400, 'sin pedido');
      eq((await post(fab.simular, { sistema: HC, idPedido: 'abc' })).status, 400, 'pedido no numérico');
      eq((await post(fab.simular, { sistema: 'NOPE', idPedido: 1 })).status, 400, 'sistema no válido');
      const r = await post(fab.simular, { sistema: HC, idPedido: 99999999 });
      eq([r.status, r.data.Fabricacion, r.data.Pedido], [200, [], null], 'pedido inexistente');
    });

    await inf.test('admin-data: búsqueda de artículos Solupyme (ventana de Referencia)', async () => {
      const buscar = async (q) => (await get(hc.honeycomb_articulos_buscar, { q })).data;
      eq(await buscar(''), [], 'vacío');
      eq(await buscar('a'), [], 'una letra');
      const r = await buscar('honeycomb opaco');
      ok(r.some(a => a.codigo === '04810'), 'encuentra 04810');
      ok(r.every(a => /HONEYCOMB/.test(a.descripcion) && /OPACO/.test(a.descripcion)), 'cada palabra en la descripción');
      ok(r.length <= 50, 'máximo 50');
      eq((await buscar('04810')).map(a => a.codigo), ['04810'], 'por código');
      eq(await buscar("'; drop table articulos --"), [], 'texto con SQL');
      ok(Array.isArray(await buscar('x'.repeat(300))), 'texto muy largo');
      ok(Array.isArray(await buscar('a b c d e f g h')), 'muchas palabras');
      const comodin = await buscar('%%');
      eq(comodin, [], '% se busca como texto, no como comodín');
      const guion = await buscar('__');
      ok(guion.every(a => (a.codigo + a.descripcion).indexOf('__') !== -1), '_ se busca como texto');
    });

    await inf.test('admin-data: comprobación de Referencias existentes', async () => {
      const existen = async (codigos) => (await get(hc.honeycomb_articulos_existen, { codigos })).data;
      eq((await existen('04755, 04810,XXXX,,04755')).map(a => a.codigo).sort(), ['04755', '04810'], 'repetidos y vacíos');
      eq(await existen(''), [], 'vacío');
      const muchos = Array.from({ length: 600 }, (_, i) => 'C' + i).join(',') + ',04810';
      ok(Array.isArray(await existen(muchos)), '600 códigos (se limita a 500)');
      eq(await existen("04810') or 1=1 --"), [], 'texto con SQL');
    });
  });
};
