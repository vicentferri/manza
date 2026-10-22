/* =====================================================================
   02 - temp_sp_fabricacion_tipo_1_v3: fabricación del enrollable con el
   motor de reglas v3 (el de HoneyComb, sqlHoney/04).
   Solo procesa las líneas de tipo 1 del modelo nuevo de accionamientos
   (SOL_PEDIDOS_COLA_TIPO_1.nacc_accionamiento_id informado). Las del modelo
   antiguo (Leroy Merlín incluido) las sigue haciendo dev_sp_fabricacion_tipo_1;
   de ellas no se borra ni se escribe nada aquí.
   Juego de reglas de la línea: el de SOL_FABRICACION_SISTEMAS con producto 1 y
   acc_sistema_id = nacc_sistema_id (clave ENROLLABLE_<código del sistema>). Cada
   sistema es un juego independiente; si el sistema no tiene juego, o el juego no
   tiene reglas, la línea queda sin fabricación (hoja vacía, sin aviso).
   Como temp_sp_fabricacion_tipo_7:
     - Solo modo real (@real = 1). En modo presupuesto (tablas temp_) no hace nada.
     - Parámetros: sp_fabricacion_reglas_parametros (COLUMNA lee SOL_PEDIDOS_COLA_TIPO_1).
     - Reglas: sp_fabricacion_reglas_aplicar (reglas del cliente si tiene, si no las generales).
     - Consumo de los artículos en metros (unidad 3): la regla lo escribe en cm.
     - Artículo dinámico no resuelto: línea sin artículo con el aviso "SIN ARTÍCULO" (no va al XML).
   Diferencias con el tipo 7: idpedido es la posición de la línea entre las de tipo 1 del
   pedido (como dev_sp_fabricacion_tipo_1) y la tabla de fabricación no tiene precio.
   Firma igual que los demás temp_sp_fabricacion_tipo_N (@print no se usa).
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.temp_sp_fabricacion_tipo_1_v3') is not null
	drop procedure dbo.temp_sp_fabricacion_tipo_1_v3
go

create procedure [dbo].[temp_sp_fabricacion_tipo_1_v3]
(
	@idPedido int,
	@print int = 0,
	@real int = 0
)
as
begin
set nocount on

/* Las tablas temp_ (presupuestos) no generan fabricación por reglas */
if @real <> 1
	return 0

declare @parametros as dbo.Parameters3Type
declare @componentes table(orden int, articulo int, consumo decimal(18,4), idregla int, aviso varchar(255),
                           ancho decimal(12,2), alto decimal(12,2), con_ancho bit, con_alto bit)
declare @lineas table(pos int, idLinea int)

declare @idLinea int
declare @Pos int
declare @id int
declare @cliente int
declare @cantidad decimal(12,2)
declare @ancho decimal(12,2)
declare @alto decimal(12,2)
declare @accionamiento int
declare @accSistema int
declare @sistema varchar(50)

select @cliente = cliente from SOL_PEDIDOS_COLA where idrow = @idPedido

/* Posición entre las líneas de tipo 1 del pedido, en el orden de las líneas */
insert into @lineas(pos, idLinea)
select row_number() over (order by id), id
from sol_pedidos_cola_lineas
where idrow = @idPedido and tipo = 1

declare itLineas cursor local forward_only for
select pos, idLinea from @lineas order by pos
open itLineas
fetch next from itLineas into @Pos, @idLinea
while @@fetch_status = 0
begin

	set @id = null
	set @accionamiento = null
	select top 1 @id = id, @cantidad = cantidad, @ancho = ancho, @alto = alto,
	       @accionamiento = nacc_accionamiento_id, @accSistema = nacc_sistema_id
	from SOL_PEDIDOS_COLA_TIPO_1 where idrow = @idLinea

	/* Solo líneas del modelo nuevo */
	if @id is not null and @accionamiento is not null
	begin

		delete from SOL_PEDIDOS_COLA_TIPO_1_FABRICACION where idrow = @id
		delete from SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS where idrow = @id
		delete from @parametros
		delete from @componentes

		set @sistema = null
		select top 1 @sistema = sistema
		from SOL_FABRICACION_SISTEMAS
		where producto = 1 and acc_sistema_id = @accSistema and isnull(activo, 1) = 1

		if @sistema is not null
		begin

			/* PARAMETROS */
			insert into @parametros(name, type, value)
			execute sp_fabricacion_reglas_parametros @sistema, @id

			insert into SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS(idrow, idpedido, parametro, valor)
			select @id, @Pos, name, value from @parametros

			/* REGLAS */
			insert into @componentes(orden, articulo, consumo, idregla, aviso, ancho, alto, con_ancho, con_alto)
			execute sp_fabricacion_reglas_aplicar @sistema, @cliente, @parametros

			/* Ancho / alto: los de la regla si los tiene; si no, los de la línea */
			insert into SOL_PEDIDOS_COLA_TIPO_1_FABRICACION(idrow, idpedido, numero, articulo, descripcion, cantidad, unidad, orden, consumo, ancho, alto)
			select @id, @Pos, 1, articulo, isnull(aviso, ''), @cantidad, case when articulo is null then null else 1 end, orden, consumo,
			       case when con_ancho = 1 then ancho else @ancho end,
			       case when con_alto = 1  then alto  else @alto  end
			from @componentes
			order by orden, idregla

			/* ENRIQUECER */
			update SOL_PEDIDOS_COLA_TIPO_1_FABRICACION set
			unidad = (select UPPER(unidad1) from articulos where idrow = articulo)
			where idrow = @id and articulo is not null

			/* Unidad 3 (metros): el consumo de la regla se expresa en cm */
			update SOL_PEDIDOS_COLA_TIPO_1_FABRICACION set
			consumo = 0.01 * consumo
			where idrow = @id and unidad = 3

			update SOL_PEDIDOS_COLA_TIPO_1_FABRICACION set
			descripcion = (select UPPER(descripcion) from articulos where idrow = articulo),
			descUnidad  = (select descripcion from SOL_ARTICULOS_UNIDADES where SOL_ARTICULOS_UNIDADES.unidad = SOL_PEDIDOS_COLA_TIPO_1_FABRICACION.unidad),
			cod_sol     = (select cod_solupyme from articulos where articulos.idrow = SOL_PEDIDOS_COLA_TIPO_1_FABRICACION.articulo),
			fam_sol     = (select fam_solupyme from articulos where articulos.idrow = SOL_PEDIDOS_COLA_TIPO_1_FABRICACION.articulo),
			seccion     = (select isnull(clasificacion,'99') from articulos where articulos.idrow = SOL_PEDIDOS_COLA_TIPO_1_FABRICACION.articulo)
			where idrow = @id and articulo is not null

		end

	end

	fetch next from itLineas into @Pos, @idLinea
end
close itLineas
deallocate itLineas

return 1
end
go
