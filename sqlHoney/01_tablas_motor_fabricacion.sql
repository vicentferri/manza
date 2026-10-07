/* =====================================================================
   01 - Tablas del motor de fabricación por reglas (v3)
   - SOL_FABRICACION_SISTEMAS: catálogo de sistemas que usan el motor.
     Cada sistema indica de qué tabla lee los datos del pedido y dónde
     escribe la fabricación. Hoy solo HONEYCOMB (tipo 7).
   - SOL_FABRICACION_PARAMETROS: parámetros configurables por sistema
     desde artikeln_fab_cd_v3:
        COLUMNA -> valor de una columna de la tabla_origen del sistema
        FORMULA -> expresión evaluada con sp_fabricacion_evaluar sobre los
                   parámetros anteriores (p.ej. '@ANCHO -- 4', '@ALTO ** 2')
   - SOL_ARTICULOS_FABRICACION_RELACION_V2.cliente: regla para un cliente
     (SOL_CLIENTES.idrow) o NULL = todos. Si un cliente tiene reglas propias
     en un sistema, sustituyen a las generales.
   - SOL_FABRICACION_PARAMETROS.valores_*: catálogo opcional de donde salen los
     valores posibles de un parámetro (desplegable en las condiciones de la pantalla).
   - SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS: valores calculados por línea HoneyComb.
   - 2026-10-06 (tejido): tipos de parámetro BUSQUEDA y TABLA (columnas busqueda/tabla),
     SOL_FABRICACION_BUSQUEDAS (búsquedas fijas por script: tabla + columna clave +
     columna resultado; la pantalla solo elige una) y SOL_FABRICACION_TABLAS / _VALORES
     (tablas de valores por sistema, p. ej. alto -> pliegues; datos en 07).
   Idempotente. En bases donde existía la versión anterior
   (SOL_ARTICULOS_HONEYCOMB_FABRICACION_PARAMETROS) migra sus filas y la elimina.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

/* ---------------- SISTEMAS ---------------- */
if object_id('dbo.SOL_FABRICACION_SISTEMAS') is null
begin
	create table dbo.SOL_FABRICACION_SISTEMAS
	(
		sistema           varchar(50)  not null primary key,
		descripcion       varchar(100) not null,
		tipo_linea        int          null,     -- SOL_PEDIDOS_COLA_LINEAS.tipo
		tabla_origen      sysname      not null, -- datos del pedido (parámetros COLUMNA)
		tabla_fabricacion sysname      not null, -- componentes generados
		tabla_parametros  sysname      not null, -- parámetros calculados por línea
		procedimiento     sysname      not null, -- genera la fabricación de un pedido (@idPedido, @print, @real)
		activo            bit          not null default(1)
	)
end
go

if not exists (select 1 from dbo.SOL_FABRICACION_SISTEMAS where sistema = 'HONEYCOMB')
	insert into dbo.SOL_FABRICACION_SISTEMAS(sistema, descripcion, tipo_linea, tabla_origen, tabla_fabricacion, tabla_parametros, procedimiento, activo)
	values('HONEYCOMB', 'HoneyComb', 7, 'SOL_PEDIDOS_COLA_TIPO_7', 'SOL_PEDIDOS_COLA_TIPO_7_FABRICACION', 'SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS', 'temp_sp_fabricacion_tipo_7', 1)
go

/* ---------------- PARAMETROS POR SISTEMA ---------------- */
if object_id('dbo.SOL_FABRICACION_PARAMETROS') is null
begin
	create table dbo.SOL_FABRICACION_PARAMETROS
	(
		idrow   int identity(1,1) not null primary key,
		sistema varchar(50)  not null,
		name    varchar(50)  not null,
		tipo    varchar(10)  not null,  -- COLUMNA | FORMULA | BUSQUEDA | TABLA
		origen  varchar(255) not null,  -- nombre de columna o expresión
		orden   int          not null default(0),
		constraint FK_FABRICACION_PARAMETROS_SISTEMA foreign key (sistema) references dbo.SOL_FABRICACION_SISTEMAS(sistema),
		constraint UQ_FABRICACION_PARAMETROS_NAME unique(sistema, name),
		constraint CK_FABRICACION_PARAMETROS_TIPO check (tipo in ('COLUMNA','FORMULA','BUSQUEDA','TABLA'))
	)
end
go

/* Migración desde la primera versión (solo HoneyComb) */
if object_id('dbo.SOL_ARTICULOS_HONEYCOMB_FABRICACION_PARAMETROS') is not null
begin
	exec('insert into dbo.SOL_FABRICACION_PARAMETROS(sistema, name, tipo, origen, orden)
	      select ''HONEYCOMB'', o.name, o.tipo, o.origen, o.orden
	      from dbo.SOL_ARTICULOS_HONEYCOMB_FABRICACION_PARAMETROS o
	      where not exists (select 1 from dbo.SOL_FABRICACION_PARAMETROS p where p.sistema = ''HONEYCOMB'' and p.name = o.name)')
	drop table dbo.SOL_ARTICULOS_HONEYCOMB_FABRICACION_PARAMETROS
end
go

/* Parámetros base HoneyComb */
merge dbo.SOL_FABRICACION_PARAMETROS as t
using (values
	('@CANTIDAD',         'COLUMNA', 'cantidad',              10),
	('@ANCHO',            'COLUMNA', 'ancho',                 20),
	('@ALTO',             'COLUMNA', 'alto',                  30),
	('@TEJIDO_TIPO_ID',   'COLUMNA', 'tej_tipo_id',           40),
	('@TEJIDO_TIPO',      'COLUMNA', 'tej_tipo_text',         50),
	('@TEJIDO_COLOR_ID',  'COLUMNA', 'tej_color_id',          60),
	('@TEJIDO_COLOR',     'COLUMNA', 'tej_color_text',        70),
	('@COLOR_PERFIL_ID',  'COLUMNA', 'color_perfil_id',       80),
	('@COLOR_PERFIL',     'COLUMNA', 'color_perfil_text',     90),
	('@ACCIONAMIENTO_ID', 'COLUMNA', 'hc_accionamiento_id',  100),
	('@ACCIONAMIENTO',    'COLUMNA', 'hc_accionamiento_text',110)
) as s(name, tipo, origen, orden)
on t.sistema = 'HONEYCOMB' and t.name = s.name
when not matched then
	insert(sistema, name, tipo, origen, orden) values('HONEYCOMB', s.name, s.tipo, s.origen, s.orden);
go

/* ---------------- CATALOGO DE VALORES POSIBLES DE CADA PARAMETRO ----------------
   Opcional. valores_tabla = catálogo; valores_valor = columna con el valor que se
   compara en la condición (id o texto); valores_texto = columna que se muestra. */
if col_length('dbo.SOL_FABRICACION_PARAMETROS', 'valores_tabla') is null
	alter table dbo.SOL_FABRICACION_PARAMETROS add
		valores_tabla sysname null,
		valores_valor sysname null,
		valores_texto sysname null
go

update p set valores_tabla = v.tabla, valores_valor = v.valor, valores_texto = v.texto
from dbo.SOL_FABRICACION_PARAMETROS p
join (values
	('@TEJIDO_TIPO_ID',   'SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO',        'idTipoTejido',        'TipoTejido'),
	('@TEJIDO_TIPO',      'SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO',        'TipoTejido',          'TipoTejido'),
	('@TEJIDO_COLOR_ID',  'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO',      'idColorTejido',       'ColorTejido'),
	('@TEJIDO_COLOR',     'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO',      'ColorTejido',         'ColorTejido'),
	('@COLOR_PERFIL_ID',  'SOL_ARTICULOS_HONEYCOMB_COLORESPERFIL',      'idColorPerfil',       'ColorPerfil'),
	('@COLOR_PERFIL',     'SOL_ARTICULOS_HONEYCOMB_COLORESPERFIL',      'ColorPerfil',         'ColorPerfil'),
	('@ACCIONAMIENTO_ID', 'SOL_ARTICULOS_HONEYCOMB_TIPOSACCIONAMIENTO', 'idTipoAccionamiento', 'TipoAccionamiento'),
	('@ACCIONAMIENTO',    'SOL_ARTICULOS_HONEYCOMB_TIPOSACCIONAMIENTO', 'TipoAccionamiento',   'TipoAccionamiento')
) as v(name, tabla, valor, texto) on p.sistema = 'HONEYCOMB' and p.name = v.name
where p.valores_tabla is null
go

/* ---------------- CLIENTE EN LAS REGLAS ---------------- */
if col_length('dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2', 'cliente') is null
	alter table dbo.SOL_ARTICULOS_FABRICACION_RELACION_V2 add cliente int null
go

/* ---------------- PARAMETROS CALCULADOS POR LINEA (HONEYCOMB) ---------------- */
if object_id('dbo.SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS') is null
begin
	create table dbo.SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS
	(
		id        int identity(1,1) not null primary key,
		idrow     int not null,          -- SOL_PEDIDOS_COLA_TIPO_7.id
		idpedido  int null,              -- posición de la línea en el pedido
		parametro varchar(255) null,
		valor     varchar(255) null
	)
	create index IX_TIPO_7_PARAMETERS_IDROW on dbo.SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS(idrow)
end
go

/* ---------------- TIPOS DE PARAMETRO ---------------- */
if exists (select 1 from sys.check_constraints where name = 'CK_FABRICACION_PARAMETROS_TIPO'
           and definition not like '%BUSQUEDA%')
	alter table dbo.SOL_FABRICACION_PARAMETROS drop constraint CK_FABRICACION_PARAMETROS_TIPO
go

if not exists (select 1 from sys.check_constraints where name = 'CK_FABRICACION_PARAMETROS_TIPO')
	alter table dbo.SOL_FABRICACION_PARAMETROS add constraint CK_FABRICACION_PARAMETROS_TIPO
		check (tipo in ('COLUMNA','FORMULA','BUSQUEDA','TABLA'))
go

if col_length('dbo.SOL_FABRICACION_PARAMETROS', 'busqueda') is null
	alter table dbo.SOL_FABRICACION_PARAMETROS add
		busqueda varchar(50) null,   -- tipo BUSQUEDA: SOL_FABRICACION_BUSQUEDAS.busqueda
		tabla    varchar(50) null    -- tipo TABLA: SOL_FABRICACION_TABLAS.tabla (del mismo sistema)
go

/* ---------------- BUSQUEDAS ---------------- */
if object_id('dbo.SOL_FABRICACION_BUSQUEDAS') is null
begin
	create table dbo.SOL_FABRICACION_BUSQUEDAS
	(
		busqueda    varchar(50)  not null primary key,
		sistema     varchar(50)  null,      -- NULL = disponible en todos los sistemas
		descripcion varchar(150) not null,
		tabla       sysname      not null,  -- dónde se busca
		clave       sysname      not null,  -- columna que se compara con el valor de entrada
		resultado   sysname      not null,  -- columna que se devuelve
		constraint FK_FABRICACION_BUSQUEDAS_SISTEMA foreign key (sistema) references dbo.SOL_FABRICACION_SISTEMAS(sistema)
	)
end
go

merge dbo.SOL_FABRICACION_BUSQUEDAS as t
using (values
	('ARTICULO_POR_CODIGO',  null,        'Código Solupyme -> id del artículo',
	 'ARTICULOS', 'cod_solupyme', 'idrow'),
	('HC_TEJIDO_REFERENCIA', 'HONEYCOMB', 'Color de tejido HoneyComb -> Referencia (código Solupyme)',
	 'SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO', 'idColorTejido', 'Referencia'),
	('HC_PERFIL_REFERENCIA', 'HONEYCOMB', 'Color de perfil HoneyComb -> Referencia (código Solupyme)',
	 'SOL_ARTICULOS_HONEYCOMB_COLORESPERFIL', 'idColorPerfil', 'Referencia')
) as s(busqueda, sistema, descripcion, tabla, clave, resultado)
on t.busqueda = s.busqueda
when matched then
	update set sistema = s.sistema, descripcion = s.descripcion, tabla = s.tabla, clave = s.clave, resultado = s.resultado
when not matched then
	insert(busqueda, sistema, descripcion, tabla, clave, resultado)
	values(s.busqueda, s.sistema, s.descripcion, s.tabla, s.clave, s.resultado);
go

/* ---------------- TABLAS DE VALORES ---------------- */
if object_id('dbo.SOL_FABRICACION_TABLAS') is null
begin
	create table dbo.SOL_FABRICACION_TABLAS
	(
		idrow       int identity(1,1) not null primary key,
		sistema     varchar(50)  not null,
		tabla       varchar(50)  not null,
		descripcion varchar(150) null,
		clave_texto varchar(50)  null,   -- cabecera de la columna clave (p. ej. Altura)
		valor_texto varchar(50)  null,   -- cabecera de la columna valor (p. ej. Pliegues (cm))
		constraint FK_FABRICACION_TABLAS_SISTEMA foreign key (sistema) references dbo.SOL_FABRICACION_SISTEMAS(sistema),
		constraint UQ_FABRICACION_TABLAS unique(sistema, tabla)
	)
end
go

if object_id('dbo.SOL_FABRICACION_TABLAS_VALORES') is null
begin
	create table dbo.SOL_FABRICACION_TABLAS_VALORES
	(
		idrow   int identity(1,1) not null primary key,
		idtabla int           not null,
		clave   decimal(12,2) not null,
		valor   decimal(12,2) not null,
		constraint FK_FABRICACION_TABLAS_VALORES_TABLA foreign key (idtabla) references dbo.SOL_FABRICACION_TABLAS(idrow) on delete cascade,
		constraint UQ_FABRICACION_TABLAS_VALORES unique(idtabla, clave)
	)
end
go
