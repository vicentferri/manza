'use strict'

/*
 * 7. Datos y configuración HoneyComb de la BD.
 *   FALLO: incoherencias que rompen la fabricación (parámetro que usa otro posterior,
 *          regla con un artículo o parámetro inexistente, Referencia que no existe...).
 *   AVISO: configuración incompleta que hay que decidir (combinaciones sin perfil,
 *          tramos de medidas sin regla, colores sin Referencia...).
 */

const fs = require('fs');
const path = require('path');
const { eq, ok } = require('../lib/informe');
const E = require('../lib/entorno');

const HC = 'HONEYCOMB';

function parametrosUsados(texto) {
  return (String(texto || '').match(/@[A-Za-z0-9_]+/g) || []).map(p => p.toUpperCase());
}

/* Huecos de un grupo de reglas con condiciones 'a <= @P <= b' entre desde y hasta (pasos de 0,01) */
function huecos(intervalos, desde, hasta) {
  const ordenados = intervalos.slice().sort((x, y) => x[0] - y[0]);
  const res = [];
  let cubierto = desde;
  ordenados.forEach(([a, b]) => {
    if (a > cubierto + 0.0001) res.push([cubierto, a]);
    cubierto = Math.max(cubierto, b + 0.01);
  });
  if (cubierto < hasta) res.push([cubierto, hasta]);
  return res;
}

module.exports = async function (inf) {
  inf.empezar('7. Datos y configuración HoneyComb (integridad y cobertura)');

  const parametros = await E.filas('select name, tipo, origen, orden, busqueda, tabla from SOL_FABRICACION_PARAMETROS where sistema = @s order by orden', { s: HC });
  const porNombre = {};
  parametros.forEach(p => { porNombre[p.name.toUpperCase()] = p; });
  const reglas = await E.filas(`select idrow, cliente, orden, atributo, articulos, nombre_parametro1, nombre_parametro2, nombre_parametro3, nombre_parametro4, consumo
    from SOL_ARTICULOS_FABRICACION_RELACION_V2 where sistema = @s`, { s: HC });

  await inf.test('Tabla ALTO_PLIEGUES: claves de 1 en 1 sin huecos y pliegues que no bajan al subir el alto', async () => {
    const v = await E.filas(`select v.clave, v.valor from SOL_FABRICACION_TABLAS t join SOL_FABRICACION_TABLAS_VALORES v on v.idtabla = t.idrow
      where t.sistema = @s and t.tabla = 'ALTO_PLIEGUES' order by v.clave`, { s: HC });
    ok(v.length > 0, 'la tabla está vacía');
    const saltos = v.slice(1).filter((f, i) => Math.abs(f.clave - v[i].clave - 1) > 0.0001).map(f => f.clave);
    eq(saltos, [], 'altos que no siguen al anterior');
    const bajadas = v.slice(1).filter((f, i) => f.valor < v[i].valor).map(f => f.clave);
    eq(bajadas, [], 'altos con menos pliegues que el anterior');
  });

  await inf.test('Tabla ALTO_PLIEGUES: igual que el Excel honeycombAltura.xlsx', async () => {
    const excel = path.join(E.RAIZ, 'honeycombAltura.xlsx');
    if (!fs.existsSync(excel)) {
      inf.aviso('No está honeycombAltura.xlsx en la raíz del proyecto: no se compara con el Excel');
      return;
    }
    const XLSX = require(path.join(E.BACKEND, 'node_modules', 'xlsx'));
    const hoja = XLSX.readFile(excel).Sheets[XLSX.readFile(excel).SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja, { header: 1 })
      .filter(f => f.length >= 2 && isFinite(parseFloat(f[0])) && isFinite(parseFloat(f[1])))
      .map(f => [parseFloat(f[0]), parseFloat(f[1])]);
    const bd = (await E.filas(`select v.clave, v.valor from SOL_FABRICACION_TABLAS t join SOL_FABRICACION_TABLAS_VALORES v on v.idtabla = t.idrow
      where t.sistema = @s and t.tabla = 'ALTO_PLIEGUES' order by v.clave`, { s: HC })).map(f => [f.clave, f.valor]);
    eq(bd, filas.sort((a, b) => a[0] - b[0]), 'BD frente al Excel');
  });

  await inf.test('Parámetros: cada uno solo usa parámetros calculados antes (orden menor)', () => {
    const malos = [];
    parametros.forEach(p => {
      const usados = p.tipo === 'FORMULA' ? parametrosUsados(p.origen) : (p.tipo === 'COLUMNA' ? [] : [String(p.origen).toUpperCase()]);
      usados.forEach(u => {
        const q = porNombre[u];
        if (!q) malos.push(p.name + ' usa ' + u + ', que no existe');
        else if (q.orden >= p.orden) malos.push(p.name + ' (orden ' + p.orden + ') usa ' + u + ' (orden ' + q.orden + ')');
      });
    });
    eq(malos, []);
  });

  await inf.test('Parámetros: búsquedas y tablas que existen; columnas que existen', async () => {
    const busquedas = (await E.filas('select busqueda from SOL_FABRICACION_BUSQUEDAS where sistema is null or sistema = @s', { s: HC })).map(b => b.busqueda);
    const tablas = (await E.filas('select tabla from SOL_FABRICACION_TABLAS where sistema = @s', { s: HC })).map(t => t.tabla);
    const columnas = (await E.filas("select c.name from sys.columns c join SOL_FABRICACION_SISTEMAS s on c.object_id = object_id('dbo.' + s.tabla_origen) where s.sistema = @s", { s: HC })).map(c => c.name);
    const malos = [];
    parametros.forEach(p => {
      if (p.tipo === 'BUSQUEDA' && busquedas.indexOf(p.busqueda) === -1) malos.push(p.name + ': búsqueda ' + p.busqueda);
      if (p.tipo === 'TABLA' && tablas.indexOf(p.tabla) === -1) malos.push(p.name + ': tabla ' + p.tabla);
      if (p.tipo === 'COLUMNA' && columnas.indexOf(p.origen) === -1) malos.push(p.name + ': columna ' + p.origen);
    });
    eq(malos, []);
  });

  await inf.test('Reglas: artículos que existen y parámetros que existen', async () => {
    const ids = [...new Set([].concat(...reglas.map(r => String(r.articulos || '').replace(/;/g, ',').split(',').map(a => a.trim()).filter(a => /^\d+$/.test(a)))))];
    const existen = ids.length ? (await E.filas('select idrow from articulos where idrow in (' + ids.join(',') + ')')).map(a => String(a.idrow)) : [];
    const malos = ids.filter(i => existen.indexOf(i) === -1).map(i => 'artículo ' + i + ' no existe');
    reglas.forEach(r => {
      const usados = [r.nombre_parametro1, r.nombre_parametro2, r.nombre_parametro3, r.nombre_parametro4, r.consumo, r.articulos].map(parametrosUsados);
      [].concat(...usados).filter(u => !porNombre[u]).forEach(u => malos.push('regla ' + r.idrow + ' (' + r.atributo + ') usa ' + u + ', que no existe'));
      String(r.articulos || '').split(/[,;]/).map(a => a.trim()).filter(a => a.charAt(0) === '@').forEach(a => {
        const p = porNombre[a.toUpperCase()];
        if (p && p.tipo !== 'BUSQUEDA') malos.push('regla ' + r.idrow + ': el artículo ' + a + ' es un parámetro ' + p.tipo + ', no una búsqueda');
      });
    });
    eq(malos, []);
  });

  const colores = await E.filas(`select c.idColorTejido, c.ColorTejido, c.idTipoTejido, t.TipoTejido, ltrim(rtrim(c.Referencia)) as Referencia,
      (select count(*) from articulos a where ltrim(rtrim(a.cod_solupyme)) = ltrim(rtrim(c.Referencia))) as n,
      (select top 1 a.unidad1 from articulos a where ltrim(rtrim(a.cod_solupyme)) = ltrim(rtrim(c.Referencia))) as unidad
    from SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO c left join SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO t on t.idTipoTejido = c.idTipoTejido`);

  await inf.test('Colores de tejido: cada Referencia existe en Solupyme una sola vez y se mide en m²', () => {
    const con = colores.filter(c => c.Referencia);
    eq(con.filter(c => c.n === 0).map(c => c.ColorTejido + ' (' + c.Referencia + ')'), [], 'Referencias que no existen');
    eq(con.filter(c => c.n > 1).map(c => c.ColorTejido + ' (' + c.Referencia + ' x' + c.n + ')'), [], 'códigos repetidos en ARTICULOS');
    eq(con.filter(c => c.n === 1 && c.unidad !== 2).map(c => c.ColorTejido + ' (unidad ' + c.unidad + ')'), [], 'tejidos que no van en m²');
  });

  const sinReferencia = colores.filter(c => !c.Referencia && c.TipoTejido);
  if (sinReferencia.length) {
    inf.aviso('Colores de tejido sin Referencia (salen SIN ARTÍCULO): ' + sinReferencia.map(c => c.ColorTejido + ' [' + c.TipoTejido + ']').join(', '));
  }
  const tipoInexistente = colores.filter(c => !c.TipoTejido);
  if (tipoInexistente.length) {
    inf.aviso('Colores de tejido con un tipo que no existe (no salen en admin-data ni en el configurador): '
      + tipoInexistente.map(c => c.ColorTejido + ' [tipo ' + c.idTipoTejido + ']').join(', '));
  }

  /* Cobertura: reglas por tramos de medida */
  const grupos = {};
  reglas.filter(r => r.cliente === null).forEach(r => {
    const conds = [r.nombre_parametro1, r.nombre_parametro2, r.nombre_parametro3, r.nombre_parametro4].filter(c => String(c || '').trim());
    const m = conds.length === 1 ? /^\s*([\d.,]+)\s*<=\s*(@[A-Za-z0-9_]+)\s*<=\s*([\d.,]+)\s*$/.exec(conds[0]) : null;
    const clave = r.atributo + '|' + r.orden;
    grupos[clave] = grupos[clave] || { atributo: r.atributo, intervalos: [], otros: 0, parametro: null };
    if (m) {
      grupos[clave].intervalos.push([parseFloat(m[1].replace(',', '.')), parseFloat(m[3].replace(',', '.'))]);
      grupos[clave].parametro = m[2].toUpperCase();
    } else {
      grupos[clave].otros++;
    }
  });
  Object.keys(grupos).map(k => grupos[k]).filter(g => g.intervalos.length > 1 && g.otros === 0).forEach(g => {
    const h = huecos(g.intervalos, 20, 300).map(([a, b]) => a.toFixed(2) + '–' + b.toFixed(2));
    if (h.length) {
      inf.aviso(g.atributo + ': medidas de ' + g.parametro + ' sin regla (entre 20 y 300 cm): ' + h.join(', '),
        'Con medidas con decimales los saltos entre tramos (p. ej. 88,1 -> 88,2) también quedan sin componente.');
    }
  });

  /* Cobertura: combinaciones del configurador sin perfil o sin tejido */
  await E.enTransaccion(async () => {
    const acc = await E.filas('select idTipoAccionamiento as id, TipoAccionamiento as texto from SOL_ARTICULOS_HONEYCOMB_TIPOSACCIONAMIENTO');
    const perfiles = await E.filas('select idColorPerfil as id, ColorPerfil as texto from SOL_ARTICULOS_HONEYCOMB_COLORESPERFIL');
    const tejidos = colores.filter(c => c.TipoTejido);
    const idPedido = await E.valor(`insert into SOL_PEDIDOS_COLA(cliente, cliente_entrega, Fecha, referencia, refgeneral, refcliente)
      values (1, 1, getdate(), 'TSUITE_COB', 'TSUITE_COB', 'TSUITE_COB') select cast(scope_identity() as int)`);
    const combos = [];
    for (const a of acc) for (const p of perfiles) for (const t of tejidos) {
      combos.push({ a, p, t });
      await E.q(`declare @x table(id int) insert into @x exec sol_pedidos_cola_tipo_7_add 0, @ped, 100, 150, 1, @tt, @ttx, @tc, @tcx, @p, @px, @a, @ax, 0, null, null, null`, {
        ped: idPedido, tt: t.idTipoTejido, ttx: t.TipoTejido, tc: t.idColorTejido, tcx: t.ColorTejido, p: p.id, px: p.texto, a: a.id, ax: a.texto
      });
    }
    await E.q('exec temp_sp_fabricacion_tipo_7 @p, 0, 1', { p: idPedido });
    const fab = await E.filas(`select f.idpedido, f.orden, f.articulo from SOL_PEDIDOS_COLA_TIPO_7_FABRICACION f
      join SOL_PEDIDOS_COLA_TIPO_7 t on t.id = f.idrow join SOL_PEDIDOS_COLA_LINEAS l on l.id = t.idrow where l.idrow = @p`, { p: idPedido });
    const atributoDe = {};
    reglas.forEach(r => { atributoDe[r.orden] = String(r.atributo || '').toUpperCase(); });

    await inf.test('Cobertura: se genera la fabricación de todas las combinaciones (' + combos.length + ')', () => {
      eq(new Set(fab.map(f => f.idpedido)).size, combos.length, 'combinaciones con fabricación');
    });

    const sinPerfil = new Set(), sinTejido = new Set();
    combos.forEach((c, i) => {
      const f = fab.filter(x => x.idpedido === i + 1);
      if (!f.some(x => /^PERFIL/.test(atributoDe[x.orden]))) sinPerfil.add(c.p.texto);
      if (!f.some(x => atributoDe[x.orden] === 'TEJIDO' && x.articulo !== null)) sinTejido.add(c.t.ColorTejido + ' [' + c.t.TipoTejido + ']');
    });
    if (sinPerfil.size) inf.aviso('Colores de perfil sin ningún PERFIL en la fabricación: ' + [...sinPerfil].join(', '), 'Faltan sus reglas (hoy solo hay reglas para BLANCO RAL 9016).');
    if (sinTejido.size) inf.aviso('Colores de tejido que salen SIN ARTÍCULO: ' + [...sinTejido].join(', '));
    const dependenAcc = reglas.some(r => [r.nombre_parametro1, r.nombre_parametro2, r.nombre_parametro3, r.nombre_parametro4].some(c => /@ACCIONAMIENTO/i.test(c || '')));
    if (!dependenAcc) inf.aviso('Ninguna regla depende del accionamiento: MANUAL, CON VARILLA y MOTOR llevan los mismos componentes');
  });
};
