/* =====================================================================
   01 - Sincronizar SOL_CLIENTES con NH_CLIENTES
   Las 16 tablas de configuración por cliente (tejidos, accionamientos, soportes,
   tapas, contrapesos...) tienen una clave foránea a SOL_CLIENTES.idrow, pero el
   alta de clientes solo crea la ficha en NH_CLIENTES. Resultado: los clientes
   nuevos salen en los desplegables y no se les puede asignar nada.

   Este script inserta en SOL_CLIENTES los clientes de NH_CLIENTES que no estén,
   con el MISMO id (SOL_CLIENTES.idrow = NH_CLIENTES.IdCliente). Antes de
   2026-10-15 faltaban 9 (BCM), 10 (CERRAMIENTOS PICON) y 14 (DECORIZA).

   Solo inserta: no modifica ni borra. Se puede ejecutar varias veces.
   El id se pone a mano (IDENTITY_INSERT): si se dejara que la tabla lo asignara
   no coincidiría con el de NH_CLIENTES.
   Después de este script, ejecutar el 02 para que los clientes nuevos se den de
   alta en las dos tablas.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_CLIENTES') is null or object_id('dbo.NH_CLIENTES') is null
begin
	raiserror('01: NO SE EJECUTA, faltan SOL_CLIENTES o NH_CLIENTES', 16, 1)
	set noexec on
end
go

set xact_abort on
begin try
	begin transaction

	declare @nuevos table(id int, descripcion varchar(255), larga bit)

	insert into @nuevos(id, descripcion, larga)
	select n.IdCliente,
		isnull(nullif(ltrim(rtrim(n.NomFiscal)), ''), isnull(nullif(ltrim(rtrim(n.NomCliente)), ''), 'CLIENTE ' + cast(n.IdCliente as varchar(10)))),
		0
	from dbo.NH_CLIENTES n
	where not exists (select 1 from dbo.SOL_CLIENTES s where s.idrow = n.IdCliente)

	update @nuevos set larga = 1 where len(descripcion) > 50

	set identity_insert dbo.SOL_CLIENTES on

	insert into dbo.SOL_CLIENTES(idrow, descripcion, cif, C1_Comercial, C2_Rappel, C3_Publicidad, Mar_Cliente, Mar_Acc, Mar_Mec)
	select n.IdCliente, left(x.descripcion, 50), left(n.[NIF/CIF], 50),
		n.C1_Comercial, n.C2_Rappel, n.C3_Publicidad, n.Mar_Cliente, n.Mar_Acc, n.Mar_Mec
	from dbo.NH_CLIENTES n
	join @nuevos x on x.id = n.IdCliente

	print '01: clientes añadidos a SOL_CLIENTES: ' + cast(@@rowcount as varchar(10))

	set identity_insert dbo.SOL_CLIENTES off

	select 'AÑADIDO' as estado, id, descripcion, case when larga = 1 then 'nombre cortado a 50 caracteres' else '' end as aviso
	from @nuevos order by id

	commit transaction
end try
begin catch
	if @@trancount > 0 rollback transaction
	set identity_insert dbo.SOL_CLIENTES off
	declare @e nvarchar(2000) = error_message()
	raiserror('01: ERROR, no se ha cambiado nada: %s', 16, 1, @e)
end catch
go

/* Comprobación: no debe quedar ningún cliente de NH_CLIENTES sin su fila en SOL_CLIENTES */
select 'AVISO: cliente de NH_CLIENTES sin fila en SOL_CLIENTES' as aviso, n.IdCliente, n.NomFiscal
from dbo.NH_CLIENTES n
where not exists (select 1 from dbo.SOL_CLIENTES s where s.idrow = n.IdCliente)
go
set noexec off
go
