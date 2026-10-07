'use strict'

/*
 * 3. Motor por reglas aislado de la configuración HoneyComb.
 * En una transacción (se deshace) se da de alta un sistema de prueba TSUITE con sus
 * parámetros, búsquedas, tabla de valores y reglas, y una línea de pedido tipo 7:
 *   - sp_fabricacion_reglas_parametros: COLUMNA, FORMULA, BUSQUEDA, TABLA
 *   - sp_fabricacion_reglas_aplicar: condiciones Y/O, consumos, artículos fijos y según el
 *     pedido (SIN ARTÍCULO), basura en artículos, reglas por cliente
 *   - fn_fabricacion_articulos_detalle (texto de la pantalla)
 */

const { eq, ok, num } = require('../lib/informe');
const E = require('../lib/entorno');

const S = 'TSUITE';

async function retorno(texto, entradas) {
  return E.valor('declare @r int\n' + texto.replace('exec ', 'exec @r = ') + '\nselect @r as r', entradas);
}

async function preparar() {
  const art = (cod) => E.valor('select top 1 idrow from articulos where ltrim(rtrim(cod_solupyme)) = @c', { c: cod });
  const ctx = {
    art04810: await art('04810'),
    a1: await E.valor('select idrow from articulos where idrow = 16472'),
    a2: await E.valor('select idrow from articulos where idrow = 16476')
  };
  ok(ctx.art04810 && ctx.a1 && ctx.a2, 'faltan los artículos de prueba en ARTICULOS (04810, 16472, 16476)');

  await E.q(`
    insert into SOL_FABRICACION_SISTEMAS(sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo)
    values ('${S}', 'Sistema de prueba', 7, 'SOL_PEDIDOS_COLA_TIPO_7', 'SOL_PEDIDOS_COLA_TIPO_7_FABRICACION', 'SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS', 'temp_sp_fabricacion_tipo_7', 1)

    insert into SOL_FABRICACION_BUSQUEDAS(busqueda, sistema, descripcion, tabla, clave, resultado) values
      ('TS_REF', '${S}', 'color -> referencia', 'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO', 'idColorTejido', 'Referencia'),
      ('TS_POR_NOMBRE', '${S}', 'nombre -> referencia', 'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO', 'ColorTejido', 'Referencia'),
      ('TS_MALA', '${S}', 'columna inexistente', 'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO', 'no_existe', 'Referencia')

    insert into SOL_FABRICACION_TABLAS(sistema, tabla, descripcion, clave_texto, valor_texto) values ('${S}', 'T1', 'prueba', 'alto', 'valor')
    insert into SOL_FABRICACION_TABLAS_VALORES(idtabla, clave, valor)
    select idrow, v.c, v.v from SOL_FABRICACION_TABLAS cross join (values (10, 1), (20, 2), (30, 3)) v(c, v)
    where sistema = '${S}' and tabla = 'T1'

    insert into SOL_FABRICACION_PARAMETROS(sistema, name, tipo, origen, orden, busqueda, tabla) values
      ('${S}', '@ANTES',     'FORMULA',  '@ANCHO ++ 1',     5,   null, null),
      ('${S}', '@ANCHO',     'COLUMNA',  'ancho',           10,  null, null),
      ('${S}', '@ALTO',      'COLUMNA',  'alto',            20,  null, null),
      ('${S}', '@COLOR_ID',  'COLUMNA',  'tej_color_id',    30,  null, null),
      ('${S}', '@COLOR',     'COLUMNA',  'tej_color_text',  40,  null, null),
      ('${S}', '@REF',       'BUSQUEDA', '@COLOR_ID',       50,  'TS_REF', null),
      ('${S}', '@ART',       'BUSQUEDA', '@REF',            60,  'ARTICULO_POR_CODIGO', null),
      ('${S}', '@REF_OTRO',  'BUSQUEDA', '@COLOR_ID',       70,  'HC_TEJIDO_REFERENCIA', null),
      ('${S}', '@REF_NOMBRE','BUSQUEDA', '@COLOR',          80,  'TS_POR_NOMBRE', null),
      ('${S}', '@MALA',      'BUSQUEDA', '@COLOR_ID',       90,  'TS_MALA', null),
      ('${S}', '@T',         'TABLA',    '@ALTO',           100, null, 'T1'),
      ('${S}', '@ALTO_MAS',  'FORMULA',  '@ALTO ++ 0.5',    105, null, null),
      ('${S}', '@T_DEC',     'TABLA',    '@ALTO_MAS',       110, null, 'T1'),
      ('${S}', '@T_TXT',     'TABLA',    '@COLOR',          120, null, 'T1'),
      ('${S}', '@T_NO',      'TABLA',    '@ALTO',           130, null, 'NO_EXISTE'),
      ('${S}', '@F',         'FORMULA',  '@ANCHO -- 5',     140, null, null),
      ('${S}', '@M2',        'FORMULA',  '@F ** @T *T 0.01',150, null, null)`);

  ctx.idPedido = await E.valor(`
    insert into SOL_PEDIDOS_COLA(cliente, cliente_entrega, Fecha, referencia, refgeneral, refcliente)
    values (1, 1, getdate(), 'TSUITE', 'TSUITE', 'TSUITE')
    select cast(scope_identity() as int)`);
  ctx.id = await E.valor(`
    declare @t table(idrow int)
    insert into @t exec sol_pedidos_cola_tipo_7_add 0, @p, 100, 20, 1, 1, 'OPACO', 8, 'BEIGE', 1, 'BLANCO RAL 9016', 1, 'MANUAL', 10, null, null, null
    select cast(idrow as int) from @t`, { p: ctx.idPedido });
  ok(ctx.id > 0, 'no se ha creado la línea de prueba');
  return ctx;
}

async function parametros(ctx, cambios) {
  if (cambios) {
    const sets = Object.keys(cambios).map(k => k + ' = @' + k).join(', ');
    await E.q('update SOL_PEDIDOS_COLA_TIPO_7 set ' + sets + ' where id = @id', Object.assign({ id: ctx.id }, cambios));
  }
  const r = await E.filas(`
    declare @p table(name varchar(255), type varchar(255), value varchar(255))
    insert into @p exec sp_fabricacion_reglas_parametros '${S}', @id
    select name, value from @p`, { id: ctx.id });
  const m = {};
  r.forEach(f => { m[f.name] = f.value; });
  return m;
}

async function aplicar(cliente, valores) {
  const ins = Object.keys(valores).map((k, i) => `insert into @p values (@n${i}, 'TEST', @v${i})`).join('\n');
  const entradas = { cliente: cliente === null ? { tipo: E.sql.Int, valor: null } : cliente };
  Object.keys(valores).forEach((k, i) => { entradas['n' + i] = k; entradas['v' + i] = valores[k]; });
  return E.filas(`declare @p dbo.Parameters3Type\n${ins}\nexec sp_fabricacion_reglas_aplicar '${S}', @cliente, @p`, entradas);
}

async function regla(cliente, orden, atributo, articulos, c1, op1, c2, op2, c3, consumo) {
  const id = await retorno(`exec sp_fabricacion_regla_add '${S}', @cli, @orden, @atr, @arts, @c1, @op1, @c2, @op2, @c3, '-', null, @consumo`, {
    cli: { tipo: E.sql.Int, valor: cliente }, orden, atr: atributo, arts: articulos,
    c1: c1 || '', op1: op1 || '-', c2: c2 || '', op2: op2 || '-', c3: c3 || '', consumo: consumo
  });
  ok(id > 0, 'no se ha creado la regla ' + atributo + ' (' + id + ')');
  return id;
}

module.exports = async function (inf) {
  inf.empezar('3. Motor por reglas con un sistema de prueba (parámetros, búsquedas, tablas, reglas, clientes)');

  await E.enTransaccion(async () => {
    const ctx = await preparar();
    const A = String(ctx.art04810);

    await inf.test('COLUMNA, FORMULA, BUSQUEDA y TABLA con un pedido normal', async () => {
      const p = await parametros(ctx);
      eq([p['@ANCHO'], p['@ALTO'], p['@COLOR_ID'], p['@COLOR']], ['100', '20', '8', 'BEIGE'], 'columnas');
      eq([p['@REF'], p['@ART'], p['@REF_NOMBRE']], ['04810', A, '04810'], 'búsquedas en cadena');
      eq([p['@T'], p['@T_DEC']], ['2.00', '3.00'], 'tabla: 20 exacto; 20,5 -> fila siguiente (30)');
      eq([p['@F'], p['@M2']], ['95.0000', '1.9000'], 'fórmulas con parámetros de tabla');
    });

    await inf.test('BUSQUEDA: solo usa búsquedas del sistema o generales, y una mal definida no da error', async () => {
      const p = await parametros(ctx);
      eq(p['@REF_OTRO'], null, 'HC_TEJIDO_REFERENCIA es de HONEYCOMB: no vale para otro sistema');
      eq(p['@MALA'], null, 'búsqueda con una columna que no existe');
    });

    await inf.test('BUSQUEDA: color sin referencia, color inexistente y referencia que no está en Solupyme', async () => {
      let p = await parametros(ctx, { tej_color_id: 9, tej_color_text: 'OTRO COLOR' });
      eq([p['@REF'], p['@ART']], [null, null], 'color sin Referencia');
      p = await parametros(ctx, { tej_color_id: 999999, tej_color_text: 'NADA' });
      eq([p['@REF'], p['@ART']], [null, null], 'color inexistente');
      await E.q("update SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO set Referencia = 'ZZ_NO_EXISTE' where idColorTejido = 8");
      p = await parametros(ctx, { tej_color_id: 8, tej_color_text: 'BEIGE' });
      eq([p['@REF'], p['@ART']], ['ZZ_NO_EXISTE', null], 'referencia inexistente en ARTICULOS');
      await E.q("update SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO set Referencia = '  04810 ' where idColorTejido = 8");
      p = await parametros(ctx);
      eq([p['@REF'], p['@ART']], ['04810', A], 'referencia con espacios');
      await E.q("update SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO set Referencia = '04810' where idColorTejido = 8");
    });

    await inf.test('BUSQUEDA: el valor del pedido no puede inyectar SQL', async () => {
      for (const malicioso of ["BEIGE' OR '1'='1", "x]; drop table SOL_FABRICACION_TABLAS --", "' + (select top 1 name from sys.tables) + '"]) {
        const p = await parametros(ctx, { tej_color_text: malicioso });
        eq(p['@REF_NOMBRE'], null, malicioso);
      }
      eq(await E.valor("select count(*) from SOL_FABRICACION_TABLAS where sistema = 'TSUITE'"), 1, 'la tabla sigue ahí');
      const p = await parametros(ctx, { tej_color_text: 'beige' });
      eq(p['@REF_NOMBRE'], '04810', 'sin distinguir mayúsculas');
    });

    await inf.test('TABLA: fila siguiente, por debajo del mínimo, por encima del máximo y entrada no numérica', async () => {
      const casos = [[5, '1.00'], [10, '1.00'], [11, '2.00'], [15, '2.00'], [30, '3.00'], [31, null], [0, '1.00'], [-5, '1.00']];
      for (const [alto, esperado] of casos) {
        const p = await parametros(ctx, { alto, tej_color_text: 'BEIGE' });
        eq(p['@T'], esperado, 'alto ' + alto);
      }
      const p = await parametros(ctx, { alto: 31 });
      eq(p['@M2'], '-1.0000', 'consumo que usa una tabla sin fila: -1');
      eq([p['@T_TXT'], p['@T_NO']], [null, null], 'entrada de texto / tabla inexistente');
    });

    await inf.test('FORMULA con un parámetro que aún no se ha calculado (orden menor): -1', async () => {
      const p = await parametros(ctx, { alto: 20 });
      eq(p['@ANTES'], '-1.0000');
    });

    /* Reglas */
    const r = {};
    r.fijo = await regla(null, 10, 'FIJO', String(ctx.a1), null, null, null, null, null, '2');
    r.y = await regla(null, 20, 'COND_Y', String(ctx.a1), '@ANCHO >> 50', 'Y', '@COLOR == beige', null, null, '@ANCHO -- 5');
    r.o = await regla(null, 30, 'COND_O', String(ctx.a1), '@ANCHO >> 500', 'O', '@COLOR == BEIGE', null, null, '1');
    r.cadena = await regla(null, 40, 'CADENA', String(ctx.a1), '@ANCHO >> 500', 'O', '@COLOR == BEIGE', 'Y', '@ALTO >> 500', '1');
    r.guion = await regla(null, 50, 'GUION', String(ctx.a1), '1 <= @ANCHO <= 1000', '-', '@ALTO << 1', null, null, '1');
    r.tejido = await regla(null, 60, 'TEJIDO', '@ART', null, null, null, null, null, '@M2');
    r.mezcla = await regla(null, 70, 'MEZCLA', ctx.a1 + ',@ART', null, null, null, null, null, '3;@ANCHO');
    r.posicional = await regla(null, 80, 'POSICIONAL', [ctx.a1, ctx.a2, ctx.a1].join(','), null, null, null, null, null, '1;2');
    r.basura = await regla(null, 90, 'BASURA', '1e5,$,.,abc,,-3,+3,99999999999,' + ctx.a2 + ',16476.0', null, null, null, null, null, '1');
    r.vacia = await regla(null, 100, 'SIN_ARTICULOS', '', null, null, null, null, null, '1');
    r.consumoVacio = await regla(null, 110, 'CONSUMO_VACIO', String(ctx.a1), null, null, null, null, null, '');
    r.robusta = await regla(null, 120, 'ROBUSTA', String(ctx.a1), '@COLOR >> 5', null, null, null, null, '1');
    r.decimal = await regla(null, 130, 'DINAMICO_DECIMAL', '@ART_DEC', null, null, null, null, null, '1');
    r.malConsumo = await regla(null, 140, 'CONSUMO_MAL', String(ctx.a2), null, null, null, null, null, '@ANCHO ** abc');

    const valores = { '@ANCHO': '100', '@ALTO': '20', '@COLOR': 'BEIGE', '@ART': A, '@M2': '1.90', '@ART_DEC': A + '.00' };
    const res = await aplicar(1, valores);
    const de = (id) => res.filter(f => f.idregla === id).map(f => [f.articulo, Number(f.consumo), f.aviso]);

    await inf.test('Reglas: sin condiciones, Y, O y cadena de izquierda a derecha', () => {
      eq(de(r.fijo), [[ctx.a1, 2, null]], 'sin condiciones: siempre');
      eq(de(r.y), [[ctx.a1, 95, null]], 'Y');
      eq(de(r.o), [[ctx.a1, 1, null]], 'O');
      eq(de(r.cadena), [], '(no O sí) Y no = no');
      eq(de(r.guion), [], "'-' cuenta como Y");
      eq(de(r.robusta), [], 'condición numérica sobre un texto: no se cumple (sin error)');
    });

    await inf.test('Reglas: artículo según el pedido, mezcla y consumos por posición', () => {
      eq(de(r.tejido), [[ctx.art04810, 1.9, null]], 'artículo dinámico');
      eq(de(r.mezcla), [[ctx.a1, 3, null], [ctx.art04810, 100, null]], 'fijo + dinámico con dos consumos');
      eq(de(r.posicional), [[ctx.a1, 1, null], [ctx.a2, 2, null], [ctx.a1, 1, null]], 'tercer artículo sin consumo: 1');
      eq(de(r.decimal), [[ctx.art04810, 1, null]], 'id con decimales (16578.00)');
      eq(de(r.consumoVacio), [[ctx.a1, 1, null]], 'consumo vacío: 1');
      eq(de(r.malConsumo), [[ctx.a2, -1, null]], 'consumo mal escrito: -1');
    });

    await inf.test('Reglas: basura en Artículos se ignora sin error; regla sin artículos no genera nada', () => {
      eq(de(r.basura), [[ctx.a2, 1, null]], "'1e5,$,.,abc,,-3,+3,99999999999,id,16476.0' -> solo id");
      eq(de(r.vacia), [], 'sin artículos');
    });

    await inf.test('SIN ARTÍCULO: parámetro vacío o id que no existe -> línea sin artículo con aviso', async () => {
      let x = await aplicar(1, Object.assign({}, valores, { '@ART': null }));
      eq(x.filter(f => f.idregla === r.tejido).map(f => [f.articulo, f.aviso]),
        [[null, 'SIN ARTÍCULO: TEJIDO (@ART = vacío)']], 'vacío');
      eq(x.filter(f => f.idregla === r.mezcla).map(f => [f.articulo, f.aviso]),
        [[ctx.a1, null], [null, 'SIN ARTÍCULO: MEZCLA (@ART = vacío)']], 'en la mezcla, el fijo sigue');
      x = await aplicar(1, Object.assign({}, valores, { '@ART': '99999999' }));
      eq(x.filter(f => f.idregla === r.tejido).map(f => [f.articulo, f.aviso]),
        [[null, 'SIN ARTÍCULO: TEJIDO (@ART = 99999999)']], 'id inexistente');
      x = await aplicar(1, Object.assign({}, valores, { '@ART': 'ABC' }));
      eq(x.filter(f => f.idregla === r.tejido).map(f => f.articulo), [null], 'valor no numérico');
    });

    await inf.test('Reglas por cliente: con reglas propias solo usa las suyas; sin reglas, las generales', async () => {
      const propia = await regla(5, 10, 'SOLO_CLIENTE5', String(ctx.a2), null, null, null, null, null, '7');
      const c5 = await aplicar(5, valores);
      eq(c5.map(f => [f.idregla, f.articulo, Number(f.consumo)]), [[propia, ctx.a2, 7]], 'cliente 5');
      const c1 = await aplicar(1, valores);
      ok(c1.length > 5 && !c1.some(f => f.idregla === propia), 'cliente 1 usa las generales');
      const sin = await aplicar(null, valores);
      eq(sin.length, c1.length, 'sin cliente: generales');
      await E.q('delete from SOL_ARTICULOS_FABRICACION_RELACION_V2 where idrow = @id', { id: propia });
    });

    await inf.test('Orden de las líneas: por orden y, a igual orden, por regla', async () => {
      const x = await aplicar(1, valores);
      const ordenes = x.map(f => f.orden);
      eq(ordenes, ordenes.slice().sort((a, b) => a - b), 'ordenado');
    });

    await inf.test('Medidas propias del componente (param_ancho / param_alto): valor del parámetro o, si no hay, las de la línea', async () => {
      const ambas = await regla(null, 150, 'MEDIDAS', String(ctx.a1), null, null, null, null, null, '1');
      const soloAncho = await regla(null, 160, 'SOLO_ANCHO', String(ctx.a1), null, null, null, null, null, '1');
      const sinValor = await regla(null, 170, 'SIN_VALOR', String(ctx.a1), null, null, null, null, null, '1');
      await E.q(`update SOL_ARTICULOS_FABRICACION_RELACION_V2 set param_ancho = '@F', param_alto = '@T' where idrow = @a
        update SOL_ARTICULOS_FABRICACION_RELACION_V2 set param_ancho = '@f' where idrow = @b
        update SOL_ARTICULOS_FABRICACION_RELACION_V2 set param_ancho = '@COLOR', param_alto = '@NO_EXISTE' where idrow = @c`,
        { a: ambas, b: soloAncho, c: sinValor });
      const x = await aplicar(1, Object.assign({}, valores, { '@F': '95.00', '@T': '2.00' }));
      const m = (id) => x.filter(f => f.idregla === id).map(f => [f.ancho === null ? null : Number(f.ancho), f.alto === null ? null : Number(f.alto), f.con_ancho, f.con_alto]);
      eq(m(ambas), [[95, 2, true, true]], 'ancho y alto de sus parámetros');
      eq(m(soloAncho), [[95, null, true, false]], 'solo ancho (el alto será el de la línea)');
      eq(m(sinValor), [[null, null, true, true]], 'parámetro de texto / inexistente: vacío, no la medida de la línea');
      eq(m(r.fijo), [[null, null, false, false]], 'regla sin medidas');
    });

    await inf.test('Texto de Artículos en la pantalla (fn_fabricacion_articulos_detalle)', async () => {
      const t = await E.valor('select dbo.fn_fabricacion_articulos_detalle(@a)', { a: ctx.a1 + ',@tejido_articulo' });
      ok(/@TEJIDO_ARTICULO \(según pedido\)/.test(t), 'falta el artículo dinámico: ' + t);
      ok(t.length > '@TEJIDO_ARTICULO (según pedido) '.length, 'falta el artículo fijo: ' + t);
      eq(await E.valor('select dbo.fn_fabricacion_articulos_detalle(@a)', { a: '1e5,$,.,abc,,-3,+3,99999999999' }), '', 'basura');
      eq(await E.valor('select dbo.fn_fabricacion_articulos_detalle(null)'), '', 'null');
    });
  });
};
