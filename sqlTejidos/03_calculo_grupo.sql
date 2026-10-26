/* =====================================================================
   03 - Grupo de precio del maestro de tejidos (ver tejidos.md, 3.3)
   Fórmula del usuario (2026-10-23):
     precio de grupo = coste m² + 10 %, redondeado a la unidad superior
                       (si ya es entero se queda igual; mínimo 2 = grupo A)
     letra           = SOL_TEJIDOS_GRUPOS_LETRAS (2 = A ... 16 = Ñ ... 55 = AZ)
     grupo           = letra + criterio (ancho máximo de pieza en cm)
   Ejemplo: 3,90 €/m², criterio 300 -> 4,29 -> 5 -> D -> D300.
   Sin criterio, o con precio de grupo por encima del último de la tabla, el grupo queda NULL.
   El script 04 amplía sp_tejidos_maestro_calcular para calcular también el coste ml.
   Requiere el script 01. Idempotente: al final recalcula todos los tejidos.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_TEJIDOS_GRUPOS_LETRAS') is null
begin
	create table dbo.SOL_TEJIDOS_GRUPOS_LETRAS
	(
		precio int not null constraint PK_SOL_TEJIDOS_GRUPOS_LETRAS primary key clustered,
		letra nvarchar(5) not null constraint UQ_SOL_TEJIDOS_GRUPOS_LETRAS_LETRA unique
	)
end
go

-- Correspondencia facilitada por el usuario (2026-10-23)
merge dbo.SOL_TEJIDOS_GRUPOS_LETRAS as d
using (values
	(2, N'A'),
	(3, N'B'),
	(4, N'C'),
	(5, N'D'),
	(6, N'E'),
	(7, N'F'),
	(8, N'G'),
	(9, N'H'),
	(10, N'I'),
	(11, N'J'),
	(12, N'K'),
	(13, N'L'),
	(14, N'M'),
	(15, N'N'),
	(16, N'Ñ'),
	(17, N'O'),
	(18, N'P'),
	(19, N'Q'),
	(20, N'R'),
	(21, N'S'),
	(22, N'T'),
	(23, N'U'),
	(24, N'V'),
	(25, N'W'),
	(26, N'X'),
	(27, N'Y'),
	(28, N'Z'),
	(29, N'AA'),
	(30, N'AB'),
	(31, N'AC'),
	(32, N'AD'),
	(33, N'AE'),
	(34, N'AF'),
	(35, N'AG'),
	(36, N'AH'),
	(37, N'AI'),
	(38, N'AJ'),
	(39, N'AK'),
	(40, N'AL'),
	(41, N'AM'),
	(42, N'AN'),
	(43, N'AÑ'),
	(44, N'AO'),
	(45, N'AP'),
	(46, N'AQ'),
	(47, N'AR'),
	(48, N'AS'),
	(49, N'AT'),
	(50, N'AU'),
	(51, N'AV'),
	(52, N'AW'),
	(53, N'AX'),
	(54, N'AY'),
	(55, N'AZ')
) as o(precio, letra)
on d.precio = o.precio
when matched and d.letra <> o.letra then update set letra = o.letra
when not matched then insert (precio, letra) values (o.precio, o.letra);
go

if object_id('dbo.sp_tejidos_maestro_calcular') is not null
	drop procedure dbo.sp_tejidos_maestro_calcular
go

/* Calcula el grupo de un tejido (@idrow) o de todos (@idrow NULL).
   Devuelve cuántos tejidos ha calculado y cuántos se han quedado sin grupo */
create procedure dbo.sp_tejidos_maestro_calcular
	@idrow int = null
as
begin
	set nocount on

	declare @calculados int

	update m
	set grupo = case when m.criterio is null then null else l.letra + cast(m.criterio as varchar(10)) end,
		calculado = getdate()
	from dbo.SOL_TEJIDOS_MAESTRO m
	cross apply (select case when ceiling(m.coste_m2 * 1.10) < 2 then 2
	                         else cast(ceiling(m.coste_m2 * 1.10) as int) end as precio) p
	left join dbo.SOL_TEJIDOS_GRUPOS_LETRAS l on l.precio = p.precio
	where @idrow is null or m.idrow = @idrow

	set @calculados = @@rowcount

	select @calculados as calculados,
	       (select count(*) from dbo.SOL_TEJIDOS_MAESTRO m
	        where m.grupo is null and (@idrow is null or m.idrow = @idrow)) as sin_grupo
end
go

exec dbo.sp_tejidos_maestro_calcular
go
