/* =====================================================================
   03 - Migración de SOL_PEDIDOS_COLA_TIPO_7 existentes
   Filas antiguas: idrow = id del pedido y sin línea en SOL_PEDIDOS_COLA_LINEAS.
   Para cada una se crea la línea tipo 7 y se repunta idrow a la línea.
   Solo toca filas cuyo idrow no sea ya una línea tipo 7 y sí sea un pedido.
   Idempotente.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

set nocount on

declare @id int, @idPedido int, @idLinea int

declare itMigrar cursor local forward_only for
select t.id, t.idrow
from SOL_PEDIDOS_COLA_TIPO_7 t
where not exists (select 1 from SOL_PEDIDOS_COLA_LINEAS l where l.id = t.idrow and l.tipo = 7)
  and exists (select 1 from SOL_PEDIDOS_COLA p where p.idrow = t.idrow)

open itMigrar
fetch next from itMigrar into @id, @idPedido
while @@fetch_status = 0
begin
	begin tran
		insert into SOL_PEDIDOS_COLA_LINEAS(idrow, line, articulo, ancho, alto, cantidad, tipo)
		select @idPedido, 70, 7, ancho, alto, cantidad, 7 from SOL_PEDIDOS_COLA_TIPO_7 where id = @id

		set @idLinea = scope_identity()

		update SOL_PEDIDOS_COLA_TIPO_7 set idrow = @idLinea where id = @id
	commit

	print 'TIPO_7 id=' + cast(@id as varchar) + ' pedido=' + cast(@idPedido as varchar) + ' -> linea=' + cast(@idLinea as varchar)

	fetch next from itMigrar into @id, @idPedido
end
close itMigrar
deallocate itMigrar
go
