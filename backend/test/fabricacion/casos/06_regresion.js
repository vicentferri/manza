'use strict'

/*
 * 6. Regresión: la HoneyComb no estropea nada de los demás productos.
 *   - Quién usa el motor v3: solo los usos conocidos (motor de cada producto y CortinaDecor); uno nuevo es un fallo que hay
 *     que revisar y, si es correcto, añadir a USOS_MOTOR.
 *   - sp_fichero_produccion_2: con pedidos reales, el XML sale en orden y bien formado.
 *   - temp_sp_fabricacion_tipo_7 no toca la fabricación de otros tipos ni de otros pedidos.
 *   - sp_fabricacion_generate regenera pedidos reales de todos los tipos sin errores.
 *   - XML de los pedidos HoneyComb reales sin "null", sin SIN ARTÍCULO y con código en cada componente.
 * En una transacción (se deshace).
 *
 * 2026-11-19: fuera las dos pruebas que leían ficheros de C:\dev\prod\sqlHoney (los scripts 01-16 y la copia de
 * sp_fichero_produccion_2 del 29/09), que se borraron a propósito (commits 0e90e7a y 2a86ecf): la comprobación estática de
 * los scripts y el XML "idéntico al del 29/09" (desde entonces el XML de otros productos ha cambiado a propósito). La
 * regresión de la fabricación con pedidos reales está en C:\dev\sqlHoney\pruebas\foto_fabricacion_regresion.js y la de la
 * HoneyComb en sql/sqlHoney/pruebas/foto_fabricacion_hc.js.
 */

const { eq } = require('../lib/informe');
const E = require('../lib/entorno');

const MOTOR = ['fn_fabricacion_condicion', 'fn_fabricacion_pos_operador', 'sp_fabricacion_evaluar', 'sp_fabricacion_reglas_parametros',
  'sp_fabricacion_reglas_aplicar', 'fn_fabricacion_articulos_detalle'];

/* Quién puede usar el motor v3 (2026-11-19): el propio motor, la fabricación por reglas de cada producto
   (temp_sp_fabricacion_tipo_7 y temp_sp_fabricacion_tipo_N_v3), el resultado de las reglas de código y descripción del
   producto y la fabricación de CortinaDecor (sp_fabricacion_mrp_cd usa sp_fabricacion_evaluar) */
const USOS_MOTOR = [/^temp_sp_fabricacion_tipo_7$/i, /^temp_sp_fabricacion_tipo_\d+_v3$/i, /^sp_fabricacion_reglas_resultado$/i,
  /^sp_fabricacion_mrp_cd$/i];
/* Copias de seguridad guardadas como SPs en la BD (no se ejecutan) */
const COPIAS = /_copia|_test$|_antes_|_backup|_old$/i;

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
  inf.empezar('6. Regresión (resto de productos, XML, usos del motor)');

  await inf.test('El motor v3 solo lo usan el motor, la fabricación de cada producto y CortinaDecor (usos conocidos)', async () => {
    const usos = await E.filas(`
      select o.name as usa, m2.name as usado
      from sys.sql_modules m join sys.objects o on o.object_id = m.object_id
      cross join (select name from sys.objects where name in (${MOTOR.map(x => "'" + x + "'").join(',')})) m2
      where o.name <> m2.name and m.definition like '%' + m2.name + '%'`);
    const conocido = (nombre) => MOTOR.indexOf(nombre) !== -1 || USOS_MOTOR.some(re => re.test(nombre)) || COPIAS.test(nombre);
    eq(usos.filter(u => !conocido(u.usa)).map(u => u.usa + ' -> ' + u.usado), [],
      'usos nuevos del motor (revisar; si son correctos, añadirlos a USOS_MOTOR)');
  });

  await E.enTransaccion(async () => {
    /* Pedidos reales: los 3 últimos de cada tipo y todos los HoneyComb */
    const pedidos = (await E.filas(`
      select distinct idrow from (
        select idrow, tipo, row_number() over (partition by tipo order by idrow desc) n
        from (select distinct idrow, tipo from SOL_PEDIDOS_COLA_LINEAS where tipo in (1, 2, 3, 4, 7)) x
      ) y where n <= case when tipo = 7 then 20 else 3 end`)).map(f => f.idrow);
    const conHoneyComb = (await E.filas('select distinct idrow from SOL_PEDIDOS_COLA_LINEAS where tipo = 7')).map(f => f.idrow);

    await inf.test('XML: las líneas salen en orden (empieza en <root>, acaba en </root>, etiquetas equilibradas)', async () => {
      const malos = [], conNulos = [];
      for (const p of pedidos) {
        const filas = await E.filas('exec sp_fichero_produccion_2 @p', { p });
        if (filas.some(f => f.value === null)) {
          conNulos.push(p);
          continue;
        }
        const xml = filas.map(f => f.value).join('');
        const pila = [];
        let bien = /^<root>/.test(xml) && /<\/root>$/.test(xml);
        (xml.match(/<\/?[A-Za-z_][\w.\-]*>/g) || []).forEach(t => {
          if (t.charAt(1) === '/') { if (pila.pop() !== t.substring(2, t.length - 1)) bien = false; }
          else pila.push(t.substring(1, t.length - 1));
        });
        if (!bien || pila.length) malos.push(p);
      }
      eq(malos, [], 'pedidos con el XML desordenado');
      if (conNulos.length) {
        inf.aviso('[preexistente] XML con una línea vacía (NULL) en los pedidos ' + conNulos.join(', ') + ': falta la apertura de <Detalles>',
          'Pasa cuando un dato que se concatena es NULL (p. ej. TipoLama en el tipo 3). Afecta a otros productos, no a la HoneyComb.');
      }
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
        const hc = (xml.match(/<Detalles><Articulo>220\.00<\/Articulo>[\s\S]*?<\/Detalles>/g) || []).join('');
        if (/null/i.test(hc)) malos.push(p + ': contiene null');
        if (/SIN ART/i.test(hc)) malos.push(p + ': contiene SIN ARTÍCULO');
        const vacios = (hc.match(/<C\d+><\/C\d+>/g) || []).length;
        if (vacios) malos.push(p + ': ' + vacios + ' componentes sin código');
      }
      eq(malos, [], 'pedidos HoneyComb con XML incorrecto');
    });
  });
};
