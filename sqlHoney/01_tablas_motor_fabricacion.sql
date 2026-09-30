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
   - SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS: valores calculados por línea HoneyComb.
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
		tipo    varchar(10)  not null,  -- COLUMNA | FORMULA
		origen  varchar(255) not null,  -- nombre de columna o expresión
		orden   int          not null default(0),
		constraint FK_FABRICACION_PARAMETROS_SISTEMA foreign key (sistema) references dbo.SOL_FABRICACION_SISTEMAS(sistema),
		constraint UQ_FABRICACION_PARAMETROS_NAME unique(sistema, name),
		constraint CK_FABRICACION_PARAMETROS_TIPO check (tipo in ('COLUMNA','FORMULA'))
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
