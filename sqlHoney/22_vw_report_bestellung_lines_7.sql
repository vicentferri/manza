/* =====================================================================
   22 - vw_report_bestellung_lines_7: líneas HoneyComb de cada PEDIDO
   La impresión del pedido (Solarmanes_Pedido.rpt) lee las líneas de cada producto
   de vw_report_bestellung_lines_N por IDROW = número de pedido. Las vistas de los
   tipos 1-4 unen SOL_PEDIDOS_COLA_LINEAS con su tabla de tipo y devuelven el pedido
   en IDROW. La del tipo 7 leía solo SOL_PEDIDOS_COLA_TIPO_7, cuyo idrow es el id de
   la LÍNEA desde el 03 (migración de líneas tipo 7): el pedido no encontraba sus
   líneas HoneyComb.

   Ahora se hace como vw_reports_budget_lines_7 (presupuestos, script 17) y como las
   de los otros productos:
     IDROW  = número de pedido (antes: id de línea)
     TIPO   = 7
     linea  = id de la línea (lo que antes salía en idrow)
     cliente = dbo.AT_Cliente_cola_pedidos(IDROW), como en vw_report_bestellung_lines_1
   El resto de columnas, iguales que antes y en el mismo orden.

   No la usa ningún otro objeto de la BD ni el backend (comprobado el 2026-10-22):
   solo los informes de Crystal. No tiene permisos propios.
   Copia de la versión anterior: backup/vw_report_bestellung_lines_7_antes_22_20261022.sql
   Idempotente: se puede ejecutar varias veces.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_PEDIDOS_COLA_TIPO_7') is null or object_id('dbo.SOL_PEDIDOS_COLA_LINEAS') is null
   or object_id('dbo.AT_Cliente_cola_pedidos') is null
begin
	raiserror('22: NO SE EJECUTA, faltan SOL_PEDIDOS_COLA_TIPO_7, SOL_PEDIDOS_COLA_LINEAS o AT_Cliente_cola_pedidos', 16, 1)
	set noexec on
end
go

if object_id('dbo.vw_report_bestellung_lines_7') is not null
	drop view dbo.vw_report_bestellung_lines_7
go

/* Líneas HoneyComb de cada pedido (IDROW = pedido). La usa la impresión del pedido. */
create view dbo.vw_report_bestellung_lines_7
as
select l.IDROW, l.TIPO, t.id, l.ID as linea, t.ancho, t.alto, t.cantidad,
       t.tej_tipo_id, t.tej_tipo_text, t.tej_color_id, t.tej_color_text,
       t.color_perfil_id, t.color_perfil_text, t.hc_accionamiento_id, t.hc_accionamiento_text,
       t.T7_PVP, t.T7_PVP_C1, t.T7_Fecha_Entrega, t.T7_Transporte,
       t.fecha_creacion,
       dbo.AT_Cliente_cola_pedidos(l.IDROW) as cliente
from dbo.SOL_PEDIDOS_COLA_LINEAS l
inner join dbo.SOL_PEDIDOS_COLA_TIPO_7 t on l.ID = t.idrow
where l.TIPO = 7
go

set noexec off
go

/* Comprobación: líneas HoneyComb que no salen en la vista (tiene que dar 0 filas) */
select t.id, t.idrow as linea_sin_pedido
from dbo.SOL_PEDIDOS_COLA_TIPO_7 t
where not exists (select 1 from dbo.vw_report_bestellung_lines_7 v where v.id = t.id)
go
