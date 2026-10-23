/* Genera sqlTejidos/02_carga_tejidos.sql a partir de TEJIDOS.xlsx (ver tejidos.md).
   Uso (desde la raíz del repo, usa el xlsx de backend/node_modules):
     node sqlTejidos/herramientas/generar_02_carga_tejidos.js [ruta del Excel]
   Columnas esperadas: CÓDIGO SP, CRITERIO, NOMBRE, COLOR, TIPO TEJIDO, IMPRESIÓN DIGITAL, PRECIO/M2.
   PRECIO/ML y GRUPO se ignoran: son calculados. */
const path = require('path');
const fs = require('fs');
const XLSX = require(path.join(__dirname, '../../backend/node_modules/xlsx'));

const excel = process.argv[2] || path.join(__dirname, '../../TEJIDOS.xlsx');
const salida = path.join(__dirname, '../02_carga_tejidos.sql');

const wb = XLSX.readFile(excel);
const ws = wb.Sheets[wb.SheetNames[0]];
const filas = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

const cabecera = filas[0].map(c => String(c).trim().toUpperCase());
const col = nombre => {
    const i = cabecera.indexOf(nombre);
    if (i < 0) { throw new Error('Falta la columna ' + nombre); }
    return i;
};
const C = {
    codigo: col('CÓDIGO SP'), criterio: col('CRITERIO'), nombre: col('NOMBRE'), color: col('COLOR'),
    tipo: col('TIPO TEJIDO'), impresion: col('IMPRESIÓN DIGITAL'), coste: col('PRECIO/M2')
};

const texto = v => (v == null ? '' : String(v)).replace(/\s+/g, ' ').trim();
const sql = v => (v == null || v === '' ? 'null' : "N'" + String(v).replace(/'/g, "''") + "'");
const si = v => ['SÍ', 'SI', 'S', 'X', '1', 'TRUE'].includes(texto(v).toUpperCase()) ? 1 : 0;

const errores = [];
const vistos = new Set();
const claves = new Set();
const valores = [];

filas.slice(1).forEach((r, i) => {
    if (!r.some(v => v != null && texto(v) !== '')) { return; }
    const fila = i + 2;
    const codigo = String(r[C.codigo]).trim().padStart(5, '0');
    const nombre = texto(r[C.nombre]);
    const color = texto(r[C.color]);
    const criterio = r[C.criterio] == null || texto(r[C.criterio]) === '' ? null : Number(r[C.criterio]);
    const coste = Number(r[C.coste]);
    const tipo = texto(r[C.tipo]) || null;

    if (!/^\d{1,5}$/.test(String(r[C.codigo]).trim())) { errores.push(`Fila ${fila}: código no válido (${r[C.codigo]})`); }
    if (vistos.has(codigo)) { errores.push(`Fila ${fila}: código repetido ${codigo}`); }
    if (!nombre || !color) { errores.push(`Fila ${fila}: falta nombre o color`); }
    if (criterio != null && !(Number.isInteger(criterio) && criterio > 0)) { errores.push(`Fila ${fila}: criterio no válido (${r[C.criterio]})`); }
    if (!(coste >= 0)) { errores.push(`Fila ${fila}: precio m² no válido (${r[C.coste]})`); }
    const clave = [nombre, color, criterio].join('|');
    if (claves.has(clave)) { errores.push(`Fila ${fila}: nombre + color + criterio repetido (${clave})`); }
    vistos.add(codigo);
    claves.add(clave);

    valores.push(`(${sql(codigo)}, ${sql(tipo)}, ${sql(nombre)}, ${sql(color)}, ${criterio == null ? 'null' : criterio}, ` +
        `${si(r[C.impresion])}, ${Math.round(coste * 10000) / 10000})`);
});

if (errores.length) {
    console.error(errores.join('\n'));
    process.exit(1);
}

const bloques = [];
for (let i = 0; i < valores.length; i += 500) {
    bloques.push('insert into #tejidos (cod_solupyme, tipo, nombre, color, criterio, impresion_digital, coste_m2) values\n\t' +
        valores.slice(i, i + 500).join(',\n\t') + '\n');
}

const script = `/* =====================================================================
   02 - Carga inicial del maestro de tejidos desde TEJIDOS.xlsx (ver tejidos.md)
   Generado con sqlTejidos/herramientas/generar_02_carga_tejidos.js: no editar a mano.
   ${valores.length} tejidos. Requiere el script 01.
   - cod_solupyme a 5 cifras con ceros a la izquierda.
   - El tipo se busca por descripción en SOL_TEJIDOS_TIPOS; si falta queda NULL.
   - Coste ml y grupo quedan a NULL (los calculará su procedimiento).
   Idempotente: solo inserta los códigos que no existen; no cambia los ya cargados
   (los cambios posteriores se hacen desde la pantalla).
   ===================================================================== */
set nocount on
set xact_abort on
go

if object_id('tempdb..#tejidos') is not null drop table #tejidos
create table #tejidos
(
	cod_solupyme varchar(20) not null,
	tipo varchar(50) null,
	nombre varchar(100) not null,
	color varchar(100) not null,
	criterio int null,
	impresion_digital bit not null,
	coste_m2 decimal(10,4) not null
)

${bloques.join('\n')}
-- Tipos que no existen en el catálogo: se para la carga
if exists (select 1 from #tejidos t where t.tipo is not null
           and not exists (select 1 from dbo.SOL_TEJIDOS_TIPOS x where x.descripcion = t.tipo))
begin
	select distinct t.tipo as tipo_desconocido from #tejidos t
	where t.tipo is not null and not exists (select 1 from dbo.SOL_TEJIDOS_TIPOS x where x.descripcion = t.tipo)
	raiserror('Hay tipos de tejido que no están en SOL_TEJIDOS_TIPOS', 16, 1)
	return
end

begin transaction

insert into dbo.SOL_TEJIDOS_MAESTRO (cod_solupyme, tipo_tejido, nombre, color, criterio, impresion_digital, coste_m2)
select t.cod_solupyme, x.idrow, t.nombre, t.color, t.criterio, t.impresion_digital, t.coste_m2
from #tejidos t
left join dbo.SOL_TEJIDOS_TIPOS x on x.descripcion = t.tipo
where not exists (select 1 from dbo.SOL_TEJIDOS_MAESTRO m where m.cod_solupyme = t.cod_solupyme)

print cast(@@rowcount as varchar) + ' tejidos insertados'

commit transaction

drop table #tejidos
go
`;

// Con BOM para que SSMS y sqlcmd lean bien las tildes
fs.writeFileSync(salida, '﻿' + script, 'utf8');
console.log(`Generado ${salida} con ${valores.length} tejidos`);
