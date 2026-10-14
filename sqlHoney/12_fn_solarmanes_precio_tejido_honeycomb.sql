/* =====================================================================
   12 - fn_solarmanes_precio_tejido_honeycomb
   Precio del tejido HoneyComb en el generador de tarifas (tipoproducto 7):
     m2 = ancho x tejido plegado (tabla HONEYCOMB / ALTO_PLIEGUES)
     precio = preciom2 x m2 x margen1        (sin merma ni criterio)
   @ancho y @alto en cm, como fn_solarmanes_precio_tejido.
   Si el alto no está en la tabla devuelve NULL: la casilla queda sin precio
   en vez de salir con el tejido gratis.
   Requiere 11 (fn_fabricacion_tabla_valor).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.fn_solarmanes_precio_tejido_honeycomb') is not null
	drop function dbo.fn_solarmanes_precio_tejido_honeycomb
go

create function [dbo].[fn_solarmanes_precio_tejido_honeycomb]
(
	@ancho    decimal(12,4),   -- cm
	@alto     decimal(12,4),   -- cm
	@margen   decimal(12,4),   -- margen1
	@preciom2 decimal(12,4)
)
returns decimal(12,4)
as
begin
	declare @pliegues decimal(12,2) = dbo.fn_fabricacion_tabla_valor('HONEYCOMB', 'ALTO_PLIEGUES', @alto)

	if @pliegues is null
		return null

	return @preciom2 * (0.01 * @ancho) * (0.01 * @pliegues) * @margen
end
go
