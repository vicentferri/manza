/* =====================================================================
   10 - Datos: tipo de exportación 8 HONEYCOMB en SOL_TARIFAS_EXPORTACION
   (rama honeyComb_tarifas, generador de tarifas).
   Ancho 0,40-1,40 y alto 0,40-2,80. El SP del mapa solo filtra por alto
   (miny/maxy); el ancho lo limita la rejilla del tipo de producto 7.
   idrow es IDENTITY: se inserta con id 8 explícito. Idempotente.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if not exists (select 1 from dbo.SOL_TARIFAS_EXPORTACION where idrow = 8)
begin
	set identity_insert dbo.SOL_TARIFAS_EXPORTACION on
	insert into dbo.SOL_TARIFAS_EXPORTACION(idrow, descripcion, minx, maxx, miny, maxy)
	values (8, 'HONEYCOMB', 0.40, 1.40, 0.40, 2.80)
	set identity_insert dbo.SOL_TARIFAS_EXPORTACION off
end
else if not exists (select 1 from dbo.SOL_TARIFAS_EXPORTACION where idrow = 8 and descripcion = 'HONEYCOMB')
	raiserror('SOL_TARIFAS_EXPORTACION ya tiene un idrow 8 que no es HONEYCOMB: revisar antes de seguir.', 16, 1)
go
