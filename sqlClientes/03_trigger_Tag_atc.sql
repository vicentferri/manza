/* =====================================================================
   03 - Trigger Tag_atc de SOL_ARTICULOS_TEJIDOS_CLIENTES
   Copia del trigger anterior: backup/Tag_atc_antes_20261015.sql

   Error corregido: el trigger hacía  set @Id = (Select idrow FROM inserted)  y
   solo admite UNA fila. Al asignar varios tejidos a un cliente a la vez
   (sp_master_sm_tejidos_clientes_multiple inserta una fila por tejido) fallaba con
   "Subquery returned more than 1 value" y no se asignaba ninguno.

   Ahora pone un Tag distinto a cada fila insertada. Mismo formato que antes
   (newid() como texto).

   OJO: los demás triggers Tag_* tienen el mismo patrón de una sola fila:
   Tag_aac, Tag_accionamientosc, Tag_accionamientosrt, Tag_accionamientosrtC,
   Tag_accionamientosTIPOS, Tag_accionamientosTIPOSC, Tag_accionamientosTIPOSCM,
   Tag_ACM, Tag_ACMCP, Tag_ail, Tag_ata, Tag_japones. Aquí solo se corrige Tag_atc.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_ARTICULOS_TEJIDOS_CLIENTES') is null
begin
	raiserror('03: NO SE EJECUTA, falta SOL_ARTICULOS_TEJIDOS_CLIENTES', 16, 1)
	set noexec on
end
go

if object_id('dbo.Tag_atc', 'TR') is not null
	drop trigger dbo.Tag_atc
go

create trigger [dbo].[Tag_atc] on [dbo].[SOL_ARTICULOS_TEJIDOS_CLIENTES]
after insert
as
begin
	set nocount on

	update t set Tag = convert(nvarchar(100), newid())
	from dbo.SOL_ARTICULOS_TEJIDOS_CLIENTES t
	join inserted i on i.idrow = t.idrow
end
go
set noexec off
go
