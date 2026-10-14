/* =====================================================================
   11 - fn_fabricacion_tabla_valor
   Valor de una tabla de fabricación (SOL_FABRICACION_TABLAS / _VALORES) para
   una entrada: la menor clave >= entrada (150,5 usa 151). Sin fila = NULL.
   Es la misma regla que aplica el motor v3 (parámetros TABLA en
   sp_fabricacion_reglas_parametros). La usa el generador de tarifas HoneyComb
   para el tejido plegado (HONEYCOMB / ALTO_PLIEGUES).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.fn_fabricacion_tabla_valor') is not null
	drop function dbo.fn_fabricacion_tabla_valor
go

create function [dbo].[fn_fabricacion_tabla_valor]
(
	@sistema varchar(50),
	@tabla   varchar(50),
	@entrada decimal(12,2)
)
returns decimal(12,2)
as
begin
	declare @valor decimal(12,2)

	select top 1 @valor = v.valor
	from dbo.SOL_FABRICACION_TABLAS t
	join dbo.SOL_FABRICACION_TABLAS_VALORES v on v.idtabla = t.idrow
	where t.sistema = @sistema and t.tabla = @tabla
	  and v.clave >= @entrada
	order by v.clave

	return @valor
end
go
