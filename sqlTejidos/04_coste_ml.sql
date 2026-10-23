/* =====================================================================
   04 - Coste ml del maestro de tejidos (ver tejidos.md, 3.3)
   Calculadora del usuario "CALCULADORA PRECIO ML VERTICAL.xlsx" (2026-10-23), por lama:
     tejido por ml       = coste m² × ancho lama (m) × 1 m
     corte de bobina     = precio minuto mano de obra × minutos de corte
     ml por bobina       = (ancho bobina ÷ ancho lama) × alto bobina
     mano de obra por ml = corte de bobina ÷ ml por bobina
     coste ml            = tejido por ml + mano de obra por ml
   Ejemplo: 7,42 €/m², lama 89 mm, 0,28 €/min, 20 min, bobina 1 × 30 m -> 0,6604 + 0,0166 = 0,6770.

   SOL_TEJIDOS_PARAMETROS        -> PRECIO_MINUTO_MO (se cambia desde la pantalla)
   SOL_TEJIDOS_LAMAS             -> anchos de lama (89 y 127 mm) con su corte y su bobina
   SOL_TEJIDOS_MAESTRO_COSTE_ML  -> lamas marcadas en cada tejido y su coste ml calculado.
                                    Solo se calcula a los tejidos marcados (no a todos).
   Quita SOL_TEJIDOS_MAESTRO.coste_ml (una columna no vale para dos lamas; estaba vacía).
   Amplía sp_tejidos_maestro_calcular (script 03) para calcular también el coste ml.
   Requiere los scripts 01 y 03. Idempotente.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_TEJIDOS_PARAMETROS') is null
begin
	create table dbo.SOL_TEJIDOS_PARAMETROS
	(
		clave varchar(50) not null constraint PK_SOL_TEJIDOS_PARAMETROS primary key clustered,
		descripcion varchar(100) not null,
		valor decimal(10,4) not null,
		modified datetime null,
		usuario int null
	)
end
go

if not exists (select 1 from dbo.SOL_TEJIDOS_PARAMETROS where clave = 'PRECIO_MINUTO_MO')
	insert into dbo.SOL_TEJIDOS_PARAMETROS (clave, descripcion, valor)
	values ('PRECIO_MINUTO_MO', 'Precio minuto mano de obra (€)', 0.28)
go

if object_id('dbo.SOL_TEJIDOS_LAMAS') is null
begin
	create table dbo.SOL_TEJIDOS_LAMAS
	(
		ancho_mm int not null constraint PK_SOL_TEJIDOS_LAMAS primary key clustered
			constraint CK_SOL_TEJIDOS_LAMAS_ANCHO check (ancho_mm > 0),
		tiempo_corte_min decimal(10,2) not null constraint CK_SOL_TEJIDOS_LAMAS_TIEMPO check (tiempo_corte_min >= 0),
		ancho_bobina_m decimal(10,4) not null constraint CK_SOL_TEJIDOS_LAMAS_ANCHO_BOBINA check (ancho_bobina_m > 0),
		alto_bobina_m decimal(10,4) not null constraint CK_SOL_TEJIDOS_LAMAS_ALTO_BOBINA check (alto_bobina_m > 0)
	)
end
go

-- Lamas de la calculadora del usuario (2026-10-23)
insert into dbo.SOL_TEJIDOS_LAMAS (ancho_mm, tiempo_corte_min, ancho_bobina_m, alto_bobina_m)
select l.ancho_mm, l.tiempo, l.ancho, l.alto
from (values (89, 20, 1, 30), (127, 20, 1, 30)) l(ancho_mm, tiempo, ancho, alto)
where not exists (select 1 from dbo.SOL_TEJIDOS_LAMAS x where x.ancho_mm = l.ancho_mm)
go

if object_id('dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML') is null
begin
	create table dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML
	(
		tejido int not null
			constraint FK_SOL_TEJIDOS_MAESTRO_COSTE_ML_MAESTRO references dbo.SOL_TEJIDOS_MAESTRO(idrow) on delete cascade,
		ancho_mm int not null
			constraint FK_SOL_TEJIDOS_MAESTRO_COSTE_ML_LAMAS references dbo.SOL_TEJIDOS_LAMAS(ancho_mm),
		coste_ml decimal(10,4) null,
		calculado datetime null,
		constraint PK_SOL_TEJIDOS_MAESTRO_COSTE_ML primary key clustered (tejido, ancho_mm)
	)
end
go

-- La columna coste_ml del maestro se sustituye por la tabla anterior (solo se quita si está vacía)
if col_length('dbo.SOL_TEJIDOS_MAESTRO', 'coste_ml') is not null
begin
	if exists (select 1 from dbo.SOL_TEJIDOS_MAESTRO where coste_ml is not null)
		raiserror('SOL_TEJIDOS_MAESTRO.coste_ml tiene datos: revisar antes de quitarla', 16, 1)
	else
		exec('alter table dbo.SOL_TEJIDOS_MAESTRO drop column coste_ml')
end
go

if object_id('dbo.sp_tejidos_maestro_calcular') is not null
	drop procedure dbo.sp_tejidos_maestro_calcular
go

/* Calcula el grupo (script 03) y el coste ml de las lamas marcadas de un tejido (@idrow)
   o de todos (@idrow NULL). Devuelve cuántos tejidos ha calculado, cuántos se han quedado
   sin grupo y cuántos costes ml ha calculado */
create procedure dbo.sp_tejidos_maestro_calcular
	@idrow int = null
as
begin
	set nocount on

	declare @calculados int, @costes_ml int
	declare @precio_minuto decimal(10,4) = (select valor from dbo.SOL_TEJIDOS_PARAMETROS where clave = 'PRECIO_MINUTO_MO')

	-- Grupo = letra de ceiling(coste m² × 1,10) (mínimo A) + criterio
	update m
	set grupo = case when m.criterio is null then null else l.letra + cast(m.criterio as varchar(10)) end,
		calculado = getdate()
	from dbo.SOL_TEJIDOS_MAESTRO m
	cross apply (select case when ceiling(m.coste_m2 * 1.10) < 2 then 2
	                         else cast(ceiling(m.coste_m2 * 1.10) as int) end as precio) p
	left join dbo.SOL_TEJIDOS_GRUPOS_LETRAS l on l.precio = p.precio
	where @idrow is null or m.idrow = @idrow

	set @calculados = @@rowcount

	-- Coste ml = tejido por ml + mano de obra por ml (calculadora del usuario)
	update c
	set coste_ml = round(m.coste_m2 * a.ancho_m
	                     + (@precio_minuto * l.tiempo_corte_min) / ((l.ancho_bobina_m / a.ancho_m) * l.alto_bobina_m), 4),
		calculado = getdate()
	from dbo.SOL_TEJIDOS_MAESTRO_COSTE_ML c
	inner join dbo.SOL_TEJIDOS_MAESTRO m on m.idrow = c.tejido
	inner join dbo.SOL_TEJIDOS_LAMAS l on l.ancho_mm = c.ancho_mm
	cross apply (select cast(l.ancho_mm as decimal(18,8)) / 1000 as ancho_m) a
	where @idrow is null or c.tejido = @idrow

	set @costes_ml = @@rowcount

	select @calculados as calculados,
	       (select count(*) from dbo.SOL_TEJIDOS_MAESTRO m
	        where m.grupo is null and (@idrow is null or m.idrow = @idrow)) as sin_grupo,
	       @costes_ml as costes_ml
end
go

exec dbo.sp_tejidos_maestro_calcular
go
