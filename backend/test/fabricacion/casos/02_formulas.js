'use strict'

/*
 * 2. Fórmulas (sp_fabricacion_evaluar) y condiciones (fn_fabricacion_condicion) en SQL.
 * Solo calculan con variables de tabla: no escriben nada.
 * - Resultados esperados de cada operador y de las cadenas.
 * - Nada mal escrito puede dar error de SQL (pararía la fabricación del pedido): da -1 / no se cumple.
 * - Para lo válido, mismo resultado que las funciones antiguas de mrp_cd.
 * - Coherencia con el frontend: lo que la pantalla da por bueno se calcula; lo que rechaza da -1.
 */

const { eq, ok, num } = require('../lib/informe');
const E = require('../lib/entorno');

const PARAMETROS = {
  '@ANCHO': '150', '@ALTO': '200', '@TEJIDO_ANCHO': '145.00', '@TEJIDO_ALTO': '212.00', '@DEC': '88.15',
  '@COLOR': 'BEIGE', '@ACC': 'CON VARILLA', '@PERFIL': 'BLANCO RAL 9016', '@VACIO': null,
  '@DOLAR': '$', '@PUNTO': '.', '@EXP': '1e5', '@COMA': '1,5', '@CERO': '0'
};

function literal(v) {
  return v === null || v === undefined ? 'null' : "N'" + String(v).replace(/'/g, "''") + "'";
}

function declararParametros() {
  return 'declare @p dbo.Parameters3Type\n' + Object.keys(PARAMETROS)
    .map(k => 'insert into @p values (' + literal(k) + ", 'TEST', " + literal(PARAMETROS[k]) + ')').join('\n');
}

/* Evalúa varias expresiones en una sola ida a la BD: { expr: { valor, error } } */
async function evaluar(expresiones) {
  const texto = declararParametros() + `
    declare @e table(n int, expr varchar(255))
    declare @r table(n int, valor decimal(18,4), error nvarchar(4000))
    ${expresiones.map((x, i) => 'insert into @e values (' + i + ', ' + literal(x) + ')').join('\n')}
    declare @n int = 0, @x varchar(255), @v decimal(18,4)
    while @n < ${expresiones.length}
    begin
      select @x = expr from @e where n = @n
      set @v = null
      begin try
        exec sp_fabricacion_evaluar @x, @p, @v out
        insert into @r values (@n, @v, null)
      end try
      begin catch
        insert into @r values (@n, null, error_message())
      end catch
      set @n = @n + 1
    end
    select n, valor, error from @r order by n`;
  const r = await E.filas(texto);
  const res = {};
  r.forEach(f => { res[expresiones[f.n]] = { valor: f.valor, error: f.error }; });
  return res;
}

/* Evalúa condiciones con la función nueva y con el reparto antiguo de mrp_cd */
async function condiciones(lista) {
  const texto = declararParametros() + `
    declare @e table(n int, c varchar(255))
    declare @r table(n int, nueva int, antigua int, error_nueva nvarchar(4000), error_antigua nvarchar(4000))
    ${lista.map((x, i) => 'insert into @e values (' + i + ', ' + literal(x) + ')').join('\n')}
    declare @n int = 0, @c varchar(255), @nueva int, @antigua int, @en nvarchar(4000), @ea nvarchar(4000)
    while @n < ${lista.length}
    begin
      select @c = c from @e where n = @n
      select @nueva = null, @antigua = null, @en = null, @ea = null
      begin try set @nueva = dbo.fn_fabricacion_condicion(@c, @p) end try begin catch set @en = error_message() end catch
      begin try
        declare @s varchar(255) = replace(@c, ' ', '')
        set @antigua = 0
        if (select count(*) from dbo.string_to_table_delimiter(@s,'<=')) = 3 set @antigua = dbo.fn_fabricacion_intervalo(@s, @p)
        if (select count(*) from dbo.string_to_table_delimiter(@s,'<=')) = 2 set @antigua = dbo.fn_fabricacion_valor_menor_igual(@s, @p)
        if (select count(*) from dbo.string_to_table_delimiter(@s,'<<')) = 2 set @antigua = dbo.fn_fabricacion_valor_menor(@s, @p)
        if (select count(*) from dbo.string_to_table_delimiter(@s,'==')) = 2 set @antigua = dbo.fn_fabricacion_igual(@s, @p)
        if (select count(*) from dbo.string_to_table_delimiter(@s,'>=')) = 2 set @antigua = dbo.fn_fabricacion_valor_mayor_igual(@s, @p)
        if (select count(*) from dbo.string_to_table_delimiter(@s,'>>')) = 2 set @antigua = dbo.fn_fabricacion_valor_mayor(@s, @p)
      end try begin catch set @ea = error_message() end catch
      insert into @r values (@n, @nueva, @antigua, @en, @ea)
      set @n = @n + 1
    end
    select n, nueva, antigua, error_nueva, error_antigua from @r order by n`;
  const r = await E.filas(texto);
  const res = {};
  r.forEach(f => { res[lista[f.n]] = f; });
  return res;
}

module.exports = async function (inf, util) {
  inf.empezar('2. Fórmulas y condiciones en SQL (sp_fabricacion_evaluar, fn_fabricacion_condicion)');

  const esperados = {
    '400': 400, '1,5': 1.5, '@ANCHO': 150, '@ancho': 150, '@DEC': 88.15, '@COMA': 1.5, '@CERO': 0,
    '@ANCHO -- 0': 150, '@ANCHO -- 5': 145, '@ANCHO ++ 2.5': 152.5, '@ANCHO ** 2': 300,
    '@ANCHO *R 0.013': 2, '@DEC *R 1': 89, '@ANCHO *T 0.0133': 1.995, '@ANCHO *T 0.0001': 0.015,
    '@ANCHO ** 0.0133': 1.995, /* mrp_cd daba 1,50 (0,0133 -> 0,01); desde 2026-10-07 se guardan 4 decimales */
    '@ANCHO -- 1.5 ** 2': 297, '@ANCHO ** 2 -- 1.5': 298.5, '@ANCHO -- 1.5 ** 2 ++ 10': 307,
    '@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001': 3.074, '@tejido_ancho**@tejido_alto*t0,0001': 3.074,
    '@ANCHO -- 1,5': 148.5, '@ANCHO--1,5**2': 297, '@ANCHO ** @COMA': 225, '@COMA ** 2': 3,
    '0.01 ** @ALTO ** 2': 4, '0,01 ** @ALTO ** 2': 4, '0.013 *R @ANCHO *R 1': 2,
    '@ANCHO -- -5': 155, '@ANCHO ++ -5': 145, '@ANCHO -- 5 *T 0.01': 1.45, '@ANCHO ++ 0.005 *T 1': 150.005,
    '@ANCHO *R 0': 0, '@ANCHO -- 151': -1 /* -1 legítimo: es el resultado de la operación */,
    '@ANCHO ** 6000': 900000, '@ANCHO ** -6000': -900000
  };
  const invalidos = ['', 'abc', '@NO_EXISTE', '@ANCHO ** @NO_EXISTE', '@ANCHO -- abc', '@ANCHO -- 1 **', '@ANCHO //2',
    '@ANCHO *X 2', '@COLOR', '@COLOR ** 2', '@VACIO', '@VACIO -- 1', '@ANCHO ** @VACIO', '@DOLAR', '@PUNTO', '@EXP',
    '-- 5', '@ANCHO ** 10000', '@ANCHO ** 1000000000', '@ANCHO ** 1000000000 -- 1', '@ANCHO ** 100000000000 -- 1', '@ANCHO ++ 1e5',
    '@ANCHO -- $', '@ANCHO ** .'];

  const res = await evaluar(Object.keys(esperados).concat(invalidos));

  await inf.test('Operadores y cadenas: resultado esperado (' + Object.keys(esperados).length + ' expresiones)', () => {
    const malos = Object.keys(esperados).filter(x => res[x].error || Math.abs(Number(res[x].valor) - esperados[x]) > 0.0001)
      .map(x => JSON.stringify(x) + ' -> ' + (res[x].error || res[x].valor) + ' (esperado ' + esperados[x] + ')');
    eq(malos, [], 'expresiones con resultado distinto');
  });

  await inf.test('Mal escrito o no calculable: -1 y nunca error de SQL (' + invalidos.length + ' expresiones)', () => {
    const malos = invalidos.filter(x => res[x].error || Number(res[x].valor) !== -1)
      .map(x => JSON.stringify(x) + ' -> ' + (res[x].error ? 'ERROR ' + res[x].error : res[x].valor));
    eq(malos, [], 'expresiones que no dan -1');
  });

  await inf.test('*T trunca a 4 decimales (no redondea) y *R redondea hacia arriba', async () => {
    /* Los operandos se calculan con 6 decimales (0.0000666 -> 0.000067) */
    const r = await evaluar(['@ANCHO *T 0.013333', '@ANCHO *R 0.013333', '@DEC *T 0.1', '@DEC *R 0.1', '@ANCHO *T 0.000066',
      '@ANCHO *T 0.01333333', '@ANCHO *T 0.00001', '@DEC *T 0.11', '@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.00001']);
    num(r['@ANCHO *T 0.013333'].valor, 1.9999, '150 x 0,013333 = 1,99995 -> *T (4 decimales)');
    num(r['@ANCHO *R 0.013333'].valor, 2, '-> *R');
    num(r['@DEC *T 0.1'].valor, 8.815, '88,15 x 0,1 = 8,815 -> *T');
    num(r['@DEC *R 0.1'].valor, 9, '-> *R');
    num(r['@ANCHO *T 0.000066'].valor, 0.0099, '150 x 0,000066 = 0,0099 -> *T');
    num(r['@ANCHO *T 0.01333333'].valor, 1.9999, '150 x 0,01333333 = 1,9999995 -> 1,9999 (no 2,0000)');
    num(r['@ANCHO *T 0.00001'].valor, 0.0015, '150 x 0,00001 = 0,0015 -> *T');
    num(r['@DEC *T 0.11'].valor, 9.6965, '88,15 x 0,11 = 9,6965');
    num(r['@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.00001'].valor, 0.3074, '145 x 212 x 0,00001 = 0,3074');
  });

  await inf.test('Una operación válida da lo mismo que la función antigua (sp_fabricacion_tag) con números de 2 decimales (la antigua redondea a 2)', async () => {
    const ops = ['++', '--', '**', '*R'];
    const numeros = ['0', '1', '1.5', '0.25', '33.33', '2'];
    const exprs = [];
    ['@ANCHO', '@DEC', '@TEJIDO_ANCHO'].forEach(p => ops.forEach(o => numeros.forEach(n => exprs.push(p + o + n))));
    const nuevo = await evaluar(exprs);
    const texto = declararParametros() + `
      declare @e table(n int, expr varchar(255)) declare @r table(n int, valor decimal(12,2))
      ${exprs.map((x, i) => 'insert into @e values (' + i + ', ' + literal(x) + ')').join('\n')}
      declare @n int = 0, @x varchar(255), @v decimal(12,2)
      while @n < ${exprs.length}
      begin select @x = expr from @e where n = @n set @v = null exec sp_fabricacion_tag @x, @p, @v out insert into @r values (@n, @v) set @n = @n + 1 end
      select n, valor from @r order by n`;
    const antiguo = await E.filas(texto);
    /* La antigua deja 2 decimales (redondea); la nueva guarda 4: se comparan a 2 decimales */
    const distintos = antiguo.filter(f => Math.abs(Number(f.valor) - Number(nuevo[exprs[f.n]].valor)) > 0.0051)
      .map(f => exprs[f.n] + ': antes ' + f.valor + ', ahora ' + nuevo[exprs[f.n]].valor);
    eq(distintos, [], 'diferencias con sp_fabricacion_tag (' + exprs.length + ' casos)');
  });

  const conds = {
    '@ANCHO == 150': 1, '@ANCHO == 151': 0, '@ANCHO == 150.00': 1, '@ANCHO == 150,0': 1, '@DEC == 88.150': 1,
    '@ANCHO >> 149': 1, '@ANCHO >> 150': 0, '@ANCHO >= 150': 1, '@ANCHO >= 150.01': 0,
    '@ANCHO << 151': 1, '@ANCHO << 150': 0, '@ANCHO <= 150': 1, '@ANCHO <= 149.99': 0,
    '150 <= @ANCHO <= 150': 1, '150.01 <= @ANCHO <= 200': 0, '36,1 <= @ANCHO <= 162': 1, '@ANCHO >> 149,5': 1,
    '@COLOR == beige': 1, '@COLOR == BEIGE ': 1, '@PERFIL == BLANCORAL9016': 1, '@PERFIL == blanco ral 9016': 1,
    '@ACC == CON VARILLA': 1, '@ACC == MANUAL': 0, '@ancho == 150': 1,
    '@NO_EXISTE == 1': 0, '@NO_EXISTE >> 1': 0, '': 0, 'basura': 0, '@VACIO >> 1': 0, '@VACIO ==': 0,
    '@ANCHO >> abc': 0, '@COLOR >> 5': 0, '@COLOR <= 5': 0, '30 <= @COLOR <= 36': 0, '@COMA >> 1': 1,
    '@DOLAR >> 0': 0, '@EXP >> 0': 0, 'abc <= @ANCHO <= 200': 0,
    '62.1 <= @DEC <= 88.1': 0, '88.2 <= @DEC <= 130': 0
  };
  const rc = await condiciones(Object.keys(conds));

  await inf.test('Condiciones: resultado esperado y nunca error de SQL (' + Object.keys(conds).length + ' condiciones)', () => {
    const malos = Object.keys(conds).filter(c => rc[c].error_nueva || rc[c].nueva !== conds[c])
      .map(c => JSON.stringify(c) + ' -> ' + (rc[c].error_nueva ? 'ERROR ' + rc[c].error_nueva : rc[c].nueva) + ' (esperado ' + conds[c] + ')');
    eq(malos, [], 'condiciones con resultado distinto');
  });

  await inf.test('Condiciones válidas: mismo resultado que las funciones antiguas de mrp_cd', () => {
    /* Diferencias buscadas: lo que antes daba error, == numérico (150 == 150.00) y coma decimal */
    const cambiosBuscados = ['@ANCHO == 150.00', '@ANCHO == 150,0', '@DEC == 88.150', '36,1 <= @ANCHO <= 162', '@ANCHO >> 149,5', '@COMA >> 1'];
    const distintos = Object.keys(conds)
      .filter(c => !rc[c].error_antigua && cambiosBuscados.indexOf(c) === -1 && rc[c].nueva !== rc[c].antigua)
      .map(c => c + ': antes ' + rc[c].antigua + ', ahora ' + rc[c].nueva);
    eq(distintos, [], 'diferencias con mrp_cd');
    const antesError = Object.keys(conds).filter(c => rc[c].error_antigua).length;
    ok(antesError >= 6, 'el caso de prueba debería incluir condiciones que antes daban error (' + antesError + ')');
  });

  if (!util) {
    inf.aviso('Coherencia frontend/SQL no comprobada: no se ha cargado el util del frontend');
    return;
  }

  await inf.test('Coherencia frontend/SQL: lo que la pantalla acepta se calcula y lo que rechaza da -1', async () => {
    const nombres = Object.keys(PARAMETROS);
    const numericos = ['@ANCHO', '@ALTO', '@TEJIDO_ANCHO', '@TEJIDO_ALTO', '@DEC', '@COMA', '@CERO'];
    /* El frontend no conoce los valores (texto, vacío) ni el rango del resultado (desbordamiento): solo la sintaxis */
    const corpus = Object.keys(esperados).concat(invalidos)
      .filter(x => !/@(COLOR|VACIO|DOLAR|PUNTO|EXP)\b/i.test(x) && !/\d{9,}/.test(x) && x !== '@ANCHO ** 10000');
    const r = await evaluar(corpus);
    const incoherentes = [];
    corpus.forEach(x => {
      const errores = util.validarConsumo(x, nombres);
      const calcula = !r[x].error && Number(r[x].valor) !== -1;
      const usaNumericos = (x.match(/@[A-Za-z0-9_]+/g) || []).every(p => numericos.indexOf(p.toUpperCase()) !== -1);
      if (errores.length === 0 && usaNumericos && !calcula && x !== '' && x !== '@ANCHO -- 151') {
        incoherentes.push('la pantalla acepta ' + JSON.stringify(x) + ' pero SQL da ' + (r[x].error || r[x].valor));
      }
      if (errores.length > 0 && calcula) {
        incoherentes.push('la pantalla rechaza ' + JSON.stringify(x) + ' (' + errores[0] + ') pero SQL calcula ' + r[x].valor);
      }
    });
    eq(incoherentes, [], 'incoherencias');
  });
};
