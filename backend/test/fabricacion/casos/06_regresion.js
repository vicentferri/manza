'use strict'

/*
 * 6. Regresión y aislamiento: la HoneyComb no cambia nada de los demás productos.
 *   - Los scripts sqlHoney solo crean/modifican los objetos previstos.
 *   - Los objetos nuevos del motor solo los usa el motor (no CD, no SM antiguo).
 *   - sp_fichero_produccion_2: con pedidos reales, el XML es idéntico al de la versión
 *     original (backup del 2026-09-29) salvo los bloques HoneyComb.
 *   - temp_sp_fabricacion_tipo_7 no toca la fabricación de otros tipos ni de otros pedidos.
 *   - sp_fabricacion_generate regenera pedidos reales de todos los tipos sin errores.
 * En una transacción (se deshace).
 */

const fs = require('fs');
const path = require('path');
const { eq, ok } = require('../lib/informe');
const E = require('../lib/entorno');

const SQLHONEY = path.join(E.RAIZ, 'sqlHoney');

/* Objetos que pueden crear o modificar los scripts de sqlHoney (aislamiento: nada compartido salvo lo previsto) */
const PERMITIDOS = [
  'SOL_FABRICACION_SISTEMAS', 'SOL_FABRICACION_PARAMETROS', 'SOL_ARTICULOS_FABRICACION_RELACION_V2',
  'SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS', 'SOL_FABRICACION_BUSQUEDAS', 'SOL_FABRICACION_TABLAS', 'SOL_FABRICACION_TABLAS_VALORES',
  'sol_pedidos_cola_tipo_7_add', 'temp_sp_fabricacion_tipo_7', 'sp_fichero_produccion_2',
  'fn_fabricacion_condicion', 'fn_fabricacion_pos_operador', 'sp_fabricacion_evaluar', 'sp_fabricacion_reglas_parametros',
  'fn_fabricacion_articulos_detalle', 'sp_fabricacion_reglas_aplicar',
  'sp_fabricacion_regla_add', 'sp_fabricacion_regla_update', 'sp_fabricacion_regla_edit', 'sp_fabricacion_regla_borrar',
  'sp_fabricacion_parametros_valores', 'sp_fabricacion_parametro_edit', 'sp_fabricacion_parametro_borrar',
  'sp_fabricacion_tabla_guardar', 'sp_fabricacion_tabla_borrar'
].map(x => x.toUpperCase());

const MOTOR = ['fn_fabricacion_condicion', 'fn_fabricacion_pos_operador', 'sp_fabricacion_evaluar', 'sp_fabricacion_reglas_parametros',
  'sp_fabricacion_reglas_aplicar', 'fn_fabricacion_articulos_detalle'];

function sinHoneyComb(xml) {
  return String(xml).replace(/<Detalles><Articulo>22000<\/Articulo>[\s\S]*?<\/Detalles>/g, '');
}

async function xmlDe(procedimiento, idPedido) {
  const r = await E.filas('exec ' + procedimiento + ' @p', { p: idPedido });
  return r.map(f => f[Object.keys(f)[0]]).join('');
}

async function huella(idPedido) {
  const h = {};
  for (const t of [1, 2, 3, 4]) {
    h['T' + t] = await E.valor(`
      select cast(count(*) as varchar) + ':' + cast(isnull(checksum_agg(binary_checksum(f.articulo, f.cantidad, f.unidad, f.orden, f.consumo, f.cod_sol)), 0) as varchar)
      from SOL_PEDIDOS_COLA_TIPO_${t}_FABRICACION f
      join SOL_PEDIDOS_COLA_TIPO_${t} x on x.id = f.idrow
      join SOL_PEDIDOS_COLA_LINEAS l on l.id = x.idrow
      where l.idrow = @p`, { p: idPedido });
  }
  h.T7_otros = await E.valor(`
    select cast(count(*) as varchar) + ':' + cast(isnull(checksum_agg(binary_checksum(*)), 0) as varchar)
    from SOL_PEDIDOS_COLA_TIPO_7_FABRICACION
    where idrow not in (select x.id from SOL_PEDIDOS_COLA_TIPO_7 x join SOL_PEDIDOS_COLA_LINEAS l on l.id = x.idrow where l.idrow = @p)`, { p: idPedido });
  return h;
}

module.exports = async function (inf) {
  inf.empezar('6. Regresión y aislamiento (resto de productos, XML, objetos compartidos)');

  await inf.test('Los scripts sqlHoney solo crean o modifican los objetos previstos', () => {
    const encontrados = [];
    fs.readdirSync(SQLHONEY).filter(f => /^0\d_.*\.sql$/i.test(f)).forEach(f => {
      const texto = fs.readFileSync(path.join(SQLHONEY, f), 'utf8');
      const re = /^\s*(?:create|alter)\s+(?:procedure|proc|function|table|view|trigger)\s+(?:\[?dbo\]?\.)?\[?([A-Za-z0-9_]+)\]?/gim;
      let m;
      while ((m = re.exec(texto))) encontrados.push({ fichero: f, objeto: m[1] });
    });
    ok(encontrados.length > 20, 'no se han leído los scripts');
    eq(encontrados.filter(x => PERMITIDOS.indexOf(x.objeto.toUpperCase()) === -1).map(x => x.fichero + ': ' + x.objeto), [], 'objetos no previstos');
  });

  await inf.test('Los objetos nuevos del motor solo los usa el motor v3', async () => {
    const usos = await E.filas(`
      select o.name as usa, m2.name as usado
      from sys.sql_modules m join sys.objects o on o.object_id = m.object_id
      cross join (select name from sys.objects where name in (${MOTOR.map(x => "'" + x + "'").join(',')})) m2
      where o.name <> m2.name and m.definition like '%' + m2.name + '%'`);
    const permitidos = MOTOR.concat(['temp_sp_fabricacion_tipo_7']);
    eq(usos.filter(u => permitidos.indexOf(u.usa) === -1).map(u => u.usa + ' -> ' + u.usado), [], 'usos fuera del motor');
  });

  await E.enTransaccion(async () => {
    /* Pedidos reales: los 3 últimos de cada tipo y todos los HoneyComb */
    const pedidos = (await E.filas(`
      select distinct idrow from (
        select idrow, tipo, row_number() over (partition by tipo order by idrow desc) n
        from (select distinct idrow, tipo from SOL_PEDIDOS_COLA_LINEAS where tipo in (1, 2, 3, 4, 7)) x
      ) y where n <= case when tipo = 7 then 20 else 3 end`)).map(f => f.idrow);
    const conHoneyComb = (await E.filas('select distinct idrow from SOL_PEDIDOS_COLA_LINEAS where tipo = 7')).map(f => f.idrow);

    const original = fs.readFileSync(path.join(SQLHONEY, 'backup', 'sp_fichero_produccion_2_DEV_20260929.sql'), 'utf8')
      .replace(/\[dbo\]\.\[sp_fichero_produccion_2\]/i, '[dbo].[sp_fichero_produccion_2_original_test]');
    await new E.sql.Request().batch(original);

    await inf.test('XML: idéntico a la versión original para los demás productos (' + pedidos.length + ' pedidos reales)', async () => {
      const distintos = [];
      let conDetalles = 0;
      for (const p of pedidos) {
        const antes = sinHoneyComb(await xmlDe('sp_fichero_produccion_2_original_test', p));
        const ahora = sinHoneyComb(await xmlDe('sp_fichero_produccion_2', p));
        if (antes !== ahora) distintos.push(p);
        if (ahora.indexOf('<Detalles>') !== -1) conDetalles++;
      }
      eq(distintos, [], 'pedidos con XML distinto fuera de la HoneyComb');
      ok(conDetalles >= 10, 'pocos pedidos con contenido para comparar (' + conDetalles + ')');
    });

    await inf.test('La fabricación HoneyComb no toca otros tipos ni otros pedidos', async () => {
      const malos = [];
      for (const p of pedidos) {
        const antes = await huella(p);
        await E.q('exec temp_sp_fabricacion_tipo_7 @p, 0, 1', { p });
        const despues = await huella(p);
        if (JSON.stringify(antes) !== JSON.stringify(despues)) malos.push(p + ': ' + JSON.stringify(antes) + ' -> ' + JSON.stringify(despues));
      }
      eq(malos, [], 'cambios fuera de la HoneyComb del pedido');
    });

    await inf.test('sp_fabricacion_generate regenera pedidos reales de todos los tipos sin errores', async () => {
      const errores = [];
      for (const p of pedidos) {
        try {
          await E.q('exec sp_fabricacion_generate @p, 1, 0, 1', { p });
        } catch (e) {
          errores.push(p + ': ' + e.message);
        }
      }
      eq(errores, [], 'errores');
    });

    await inf.test('XML de los pedidos HoneyComb reales: sin "null", sin SIN ARTÍCULO y con código en cada componente', async () => {
      const malos = [];
      for (const p of conHoneyComb) {
        const xml = await xmlDe('sp_fichero_produccion_2', p);
        const hc = (xml.match(/<Detalles><Articulo>22000<\/Articulo>[\s\S]*?<\/Detalles>/g) || []).join('');
        if (/null/i.test(hc)) malos.push(p + ': contiene null');
        if (/SIN ART/i.test(hc)) malos.push(p + ': contiene SIN ARTÍCULO');
        const vacios = (hc.match(/<C\d+><\/C\d+>/g) || []).length;
        if (vacios) malos.push(p + ': ' + vacios + ' componentes sin código');
      }
      eq(malos, [], 'pedidos HoneyComb con XML incorrecto');
    });
  });
};
