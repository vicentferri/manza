/* Foto de regresión de la fabricación (pasos 2.4 / 2.5), contra la BD local.
   Para cada pedido de la muestra: abre una transacción, regenera su fabricación con
   sp_fabricacion_generate (@force = 1, sin XML), copia lo generado en una variable de tabla
   (sobrevive al rollback) y deshace. No deja nada cambiado.
   Se ejecuta antes y después de un cambio y se comparan las dos salidas (deben ser idénticas):
     sqlcmd -S <servidor> -U sa -C -d SOLARMANES_DEV -f 65001 -W -s "|" -h -1 -i regresion_fabricacion.sql -o antes.txt
   Muestra fija: los pedidos más recientes de cada tipo (1, 2, 3, 4, 7) y cliente (Leroy 1 y 5,
   nosotros 4, resto), más los cinco pedidos de enrollable con más líneas. */
set nocount on
set xact_abort off

declare @muestra table(pedido int primary key)
declare @foto table(pedido int, tipo int, linea int, seq int, idpedido int, numero int, articulo int,
                    descripcion varchar(512), descripcion2 varchar(512), cantidad decimal(18,6), unidad int,
                    consumo decimal(18,6), orden int, ancho decimal(18,6), alto decimal(18,6),
                    cod_sol varchar(100), fam_sol varchar(100), seccion varchar(50), descUnidad varchar(100))
declare @errores table(pedido int, error varchar(1000))

;with grupos as (
	select l.idrow pedido, l.tipo, p.cliente,
	       row_number() over (partition by l.tipo, p.cliente order by l.idrow desc) n
	from (select distinct idrow, tipo from sol_pedidos_cola_lineas where tipo in (1,2,3,4,7)) l
	join SOL_PEDIDOS_COLA p on p.idrow = l.idrow
	where p.cliente <> 2
)
insert @muestra(pedido)
select distinct pedido from grupos
where n <= case when tipo = 1 and cliente in (1,4,5) then 15 when tipo = 1 then 3 else 5 end
union
select pedido from (select top 5 idrow pedido from sol_pedidos_cola_lineas where tipo = 1
                    group by idrow order by count(*) desc, idrow desc) g

declare @p int
declare itMuestra cursor local fast_forward for select pedido from @muestra order by pedido
open itMuestra
fetch next from itMuestra into @p
while @@fetch_status = 0
begin
	begin tran
	begin try
		execute sp_fabricacion_generate @p, 1, 0, 1

		insert @foto
		select l.idrow, 1, t.id, row_number() over (partition by t.id order by f.id), f.idpedido, f.numero, f.articulo, f.descripcion, f.descripcion2,
		       f.cantidad, f.unidad, f.consumo, f.orden, f.ancho, f.alto, f.cod_sol, f.fam_sol, f.seccion, f.descUnidad
		from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_1 t on t.id = f.idrow
		join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @p
		union all
		select l.idrow, 2, t.id, row_number() over (partition by t.id order by f.id), f.idpedido, f.numero, f.articulo, f.descripcion, f.descripcion2,
		       f.cantidad, f.unidad, f.consumo, f.orden, f.ancho, f.alto, f.cod_sol, f.fam_sol, f.seccion, f.descUnidad
		from SOL_PEDIDOS_COLA_TIPO_2_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_2 t on t.id = f.idrow
		join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @p
		union all
		select l.idrow, 3, t.id, row_number() over (partition by t.id order by f.id), f.idpedido, f.numero, f.articulo, f.descripcion, f.descripcion2,
		       f.cantidad, f.unidad, f.consumo, f.orden, f.ancho, f.alto, f.cod_sol, f.fam_sol, f.seccion, f.descUnidad
		from SOL_PEDIDOS_COLA_TIPO_3_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_3 t on t.id = f.idrow
		join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @p
		union all
		select l.idrow, 4, t.id, row_number() over (partition by t.id order by f.id), f.idpedido, f.numero, f.articulo, f.descripcion, f.descripcion2,
		       f.cantidad, f.unidad, f.consumo, f.orden, f.ancho, f.alto, f.cod_sol, f.fam_sol, f.seccion, f.descUnidad
		from SOL_PEDIDOS_COLA_TIPO_4_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_4 t on t.id = f.idrow
		join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @p
		union all
		select l.idrow, 7, t.id, row_number() over (partition by t.id order by f.id), f.idpedido, f.numero, f.articulo, f.descripcion, f.descripcion2,
		       f.cantidad, f.unidad, f.consumo, f.orden, f.ancho, f.alto, f.cod_sol, f.fam_sol, f.seccion, f.descUnidad
		from SOL_PEDIDOS_COLA_TIPO_7_FABRICACION f join SOL_PEDIDOS_COLA_TIPO_7 t on t.id = f.idrow
		join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @p
		union all
		/* Parámetros de las líneas por reglas (tipo 7 y tipo 1 v3), como filas aparte */
		select l.idrow, 70, t.id, row_number() over (partition by t.id order by pa.id), pa.idpedido, null, null, pa.parametro, pa.valor,
		       null, null, null, null, null, null, null, null, null, null
		from SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS pa join SOL_PEDIDOS_COLA_TIPO_7 t on t.id = pa.idrow
		join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @p
		union all
		select l.idrow, 10, t.id, row_number() over (partition by t.id order by pa.id), pa.idpedido, null, null, pa.parametro, pa.valor,
		       null, null, null, null, null, null, null, null, null, null
		from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS pa join SOL_PEDIDOS_COLA_TIPO_1 t on t.id = pa.idrow
		join sol_pedidos_cola_lineas l on l.id = t.idrow where l.idrow = @p
	end try
	begin catch
		insert @errores values (@p, error_message())
	end catch
	if @@trancount > 0 rollback

	fetch next from itMuestra into @p
end
close itMuestra
deallocate itMuestra

select 'RESUMEN', (select count(*) from @muestra) pedidos, count(*) filas,
       sum(case when tipo = 1 then 1 else 0 end) t1, sum(case when tipo = 2 then 1 else 0 end) t2,
       sum(case when tipo = 3 then 1 else 0 end) t3, sum(case when tipo = 4 then 1 else 0 end) t4,
       sum(case when tipo = 7 then 1 else 0 end) t7, sum(case when tipo in (10,70) then 1 else 0 end) parametros,
       (select count(*) from @errores) errores
from @foto
select 'ERROR', pedido, error from @errores order by pedido
select pedido, tipo, linea, seq, idpedido, numero, articulo, descripcion, descripcion2, cantidad, unidad, consumo,
       orden, ancho, alto, cod_sol, fam_sol, seccion, descUnidad
from @foto order by pedido, tipo, linea, seq
