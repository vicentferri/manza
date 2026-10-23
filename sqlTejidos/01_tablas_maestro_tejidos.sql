/* =====================================================================
   01 - Maestro de tejidos (ver tejidos.md)
   SOL_TEJIDOS_TIPOS    -> catálogo de tipos de tejido (screen, opaco, PVC...)
   SOL_TEJIDOS_MAESTRO  -> una fila por tejido + color, con su código Solupyme.
     cod_solupyme      -> código de 5 cifras con ceros a la izquierda ('03258'),
                          igual que ARTICULOS.COD_SOLUPYME
     criterio          -> ancho del rollo en cm
     nombre + color + criterio no se repiten (VERA BLOCK 200 y 250 son tejidos distintos)
     coste_m2          -> se mantiene en la pantalla del maestro
     coste_ml, grupo   -> calculados por un procedimiento (pendiente de definir);
                          no se teclean
   Tablas independientes: no se enlazan con SOL_ARTICULOS_TEJIDOS ni con ARTICULOS.
   No se borran tejidos: baja lógica con activo = 0.
   Idempotente: crea lo que falte y añade los tipos que no existan.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_TEJIDOS_TIPOS') is null
begin
	create table dbo.SOL_TEJIDOS_TIPOS
	(
		idrow int identity(1,1) not null constraint PK_SOL_TEJIDOS_TIPOS primary key clustered,
		descripcion varchar(50) not null constraint UQ_SOL_TEJIDOS_TIPOS_DESCRIPCION unique,
		activo bit not null constraint DF_SOL_TEJIDOS_TIPOS_ACTIVO default 1,
		created datetime not null constraint DF_SOL_TEJIDOS_TIPOS_CREATED default getdate(),
		modified datetime null,
		usuario int null
	)
end
go

if object_id('dbo.SOL_TEJIDOS_MAESTRO') is null
begin
	create table dbo.SOL_TEJIDOS_MAESTRO
	(
		idrow int identity(1,1) not null constraint PK_SOL_TEJIDOS_MAESTRO primary key clustered,
		cod_solupyme varchar(20) not null constraint UQ_SOL_TEJIDOS_MAESTRO_COD_SOLUPYME unique,
		tipo_tejido int null
			constraint FK_SOL_TEJIDOS_MAESTRO_SOL_TEJIDOS_TIPOS references dbo.SOL_TEJIDOS_TIPOS(idrow),
		nombre varchar(100) not null,
		color varchar(100) not null,
		criterio int null
			constraint CK_SOL_TEJIDOS_MAESTRO_CRITERIO check (criterio > 0),
		impresion_digital bit not null constraint DF_SOL_TEJIDOS_MAESTRO_IMPRESION default 0,
		coste_m2 decimal(10,4) not null
			constraint CK_SOL_TEJIDOS_MAESTRO_COSTE_M2 check (coste_m2 >= 0),
		coste_ml decimal(10,4) null,
		grupo varchar(10) null,
		calculado datetime null,
		activo bit not null constraint DF_SOL_TEJIDOS_MAESTRO_ACTIVO default 1,
		created datetime not null constraint DF_SOL_TEJIDOS_MAESTRO_CREATED default getdate(),
		modified datetime null,
		usuario int null
	)

	create nonclustered index IX_SOL_TEJIDOS_MAESTRO_TIPO on dbo.SOL_TEJIDOS_MAESTRO(tipo_tejido)
	create unique nonclustered index UQ_SOL_TEJIDOS_MAESTRO_NOMBRE_COLOR_CRITERIO on dbo.SOL_TEJIDOS_MAESTRO(nombre, color, criterio)
end
go

-- Tipos de tejido facilitados por el usuario (2026-10-22)
insert into dbo.SOL_TEJIDOS_TIPOS (descripcion)
select t.descripcion
from (values
	('ECO'),
	('MICROPERFORADO FIBRA VIDRIO'),
	('MICROPERFORADO PET'),
	('MICROPERFORADO POLIESTER'),
	('MICROPERFORADO TREVIRA'),
	('MOJACAR POLIESTER'),
	('MOSQUITERA'),
	('NOCHE DIA POLIESTER'),
	('OPACO FIBRA VIDRIO'),
	('OPACO POLIESTER'),
	('OPACO POLIESTER Y RECICLADO'),
	('OPACO TREVIRA'),
	('PVC'),
	('TRASLUCIDO'),
	('TRASLUCIDO POLIESTER Y RECICLADO')
) t(descripcion)
where not exists (select 1 from dbo.SOL_TEJIDOS_TIPOS x where x.descripcion = t.descripcion)
go
