/* =====================================================================
   01 - Medidas con decimales: columnas int -> decimal(12,2)
   El configurador (manza/config, flujo de siempre) admite medidas con decimales
   (0,5 cm; 0,1 cm en HoneyComb), pero varias columnas de ancho/alto son int y
   el decimal se pierde al grabar. Las de pedidos de enrollable, japonés y cajón
   ZIP ya eran decimal(12,2); este script iguala el resto:

     pedidos      SOL_PEDIDOS_COLA_TIPO_3 / _4 / _7
     presupuestos SOL_PRESUPUESTOS_COLA_LINEAS / _TIPO_1 / _TIPO_3 / _TIPO_4 / _TIPO_7
     valoración   temp_sol_pedidos_cola_tipo_3 / _4 (las usa calculate_prices)

   Solo cambia columnas que sigan siendo int (se puede ejecutar varias veces).
   int -> decimal(12,2) no pierde datos. Ninguna columna tiene índices,
   restricciones ni objetos con SCHEMABINDING (comprobado en local el 2026-10-22).
   Al final se refrescan las vistas que leen estas tablas, para que publiquen el
   tipo nuevo.
   Después: 02_sps_alta_medidas_decimal.sql
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

set xact_abort on
set nocount on

declare @columnas table (tabla sysname, columna sysname)

insert into @columnas (tabla, columna)
select t.tabla, c.columna
from (values ('SOL_PEDIDOS_COLA_TIPO_3'), ('SOL_PRESUPUESTOS_COLA_TIPO_3'), ('temp_sol_pedidos_cola_tipo_3')) t(tabla)
cross join (values ('PV_Ancho_1'), ('PV_Alto_1'), ('PV_Ancho_2'), ('PV_AlturaMin_2'), ('PV_AlturaMax_2')) c(columna)
union all
select t.tabla, c.columna
from (values ('SOL_PEDIDOS_COLA_TIPO_4'), ('SOL_PRESUPUESTOS_COLA_TIPO_4'), ('temp_sol_pedidos_cola_tipo_4')) t(tabla)
cross join (values ('ancho'), ('ancho2'), ('alto')) c(columna)
union all
select t.tabla, c.columna
from (values ('SOL_PEDIDOS_COLA_TIPO_7'), ('SOL_PRESUPUESTOS_COLA_TIPO_7'), ('SOL_PRESUPUESTOS_COLA_LINEAS'), ('SOL_PRESUPUESTOS_COLA_TIPO_1')) t(tabla)
cross join (values ('ancho'), ('alto')) c(columna)

/* Todas tienen que existir: si falta alguna, la BD no es la esperada y no se toca nada */
if exists (select 1 from @columnas x
           where not exists (select 1 from sys.columns sc where sc.object_id = object_id('dbo.' + x.tabla) and sc.name = x.columna))
begin
	select x.tabla, x.columna as columna_que_falta from @columnas x
	where not exists (select 1 from sys.columns sc where sc.object_id = object_id('dbo.' + x.tabla) and sc.name = x.columna)
	raiserror('01: NO SE EJECUTA, faltan columnas (ver la lista)', 16, 1)
	return
end

declare @tabla sysname, @columna sysname, @nulos varchar(10), @sql nvarchar(max), @cambiadas int = 0

begin try
	begin transaction

	declare cur cursor local fast_forward for
		select x.tabla, x.columna, case when sc.is_nullable = 1 then 'null' else 'not null' end
		from @columnas x
		join sys.columns sc on sc.object_id = object_id('dbo.' + x.tabla) and sc.name = x.columna
		where type_name(sc.user_type_id) = 'int'
		order by x.tabla, x.columna
	open cur
	fetch next from cur into @tabla, @columna, @nulos
	while @@fetch_status = 0
	begin
		set @sql = N'alter table dbo.' + quotename(@tabla) + N' alter column ' + quotename(@columna) + N' decimal(12,2) ' + @nulos
		exec sp_executesql @sql
		print '01: ' + @tabla + '.' + @columna + ' -> decimal(12,2)'
		set @cambiadas += 1
		fetch next from cur into @tabla, @columna, @nulos
	end
	close cur
	deallocate cur

	/* Vistas que leen estas tablas (y las vistas que leen esas vistas) */
	declare @vistas table (id int primary key, nivel int)
	declare @nivel int = 0

	insert into @vistas (id, nivel)
	select distinct d.referencing_id, 0
	from sys.sql_expression_dependencies d
	join sys.views v on v.object_id = d.referencing_id
	where d.referenced_id in (select distinct object_id('dbo.' + tabla) from @columnas)

	while @@rowcount > 0
	begin
		set @nivel += 1
		insert into @vistas (id, nivel)
		select distinct d.referencing_id, @nivel
		from sys.sql_expression_dependencies d
		join sys.views v on v.object_id = d.referencing_id
		where d.referenced_id in (select id from @vistas where nivel = @nivel - 1)
		  and d.referencing_id not in (select id from @vistas)
	end

	declare @vista nvarchar(600)
	declare curv cursor local fast_forward for
		select quotename(object_schema_name(id)) + '.' + quotename(object_name(id)) from @vistas order by nivel, id
	open curv
	fetch next from curv into @vista
	while @@fetch_status = 0
	begin
		exec sp_refreshview @vista
		fetch next from curv into @vista
	end
	close curv
	deallocate curv

	commit transaction
	declare @refrescadas int = (select count(*) from @vistas)
	print '01: OK, columnas cambiadas: ' + cast(@cambiadas as varchar(10)) + ', vistas refrescadas: ' + cast(@refrescadas as varchar(10))
end try
begin catch
	if @@trancount > 0 rollback transaction
	declare @msg nvarchar(2048) = '01: ERROR, no se ha cambiado nada: ' + error_message()
	raiserror(@msg, 16, 1)
end catch
go

/* Comprobación: no debe quedar ninguna de estas columnas en int */
select o.name as tabla, c.name as columna, type_name(c.user_type_id) as tipo, c.precision, c.scale
from sys.columns c
join sys.objects o on o.object_id = c.object_id
where o.name in ('SOL_PEDIDOS_COLA_TIPO_3', 'SOL_PRESUPUESTOS_COLA_TIPO_3', 'temp_sol_pedidos_cola_tipo_3',
                 'SOL_PEDIDOS_COLA_TIPO_4', 'SOL_PRESUPUESTOS_COLA_TIPO_4', 'temp_sol_pedidos_cola_tipo_4',
                 'SOL_PEDIDOS_COLA_TIPO_7', 'SOL_PRESUPUESTOS_COLA_TIPO_7', 'SOL_PRESUPUESTOS_COLA_LINEAS', 'SOL_PRESUPUESTOS_COLA_TIPO_1')
  and c.name in ('ancho', 'ancho2', 'alto', 'PV_Ancho_1', 'PV_Alto_1', 'PV_Ancho_2', 'PV_AlturaMin_2', 'PV_AlturaMax_2')
order by o.name, c.name
go
