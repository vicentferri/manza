
CREATE PROCEDURE [dbo].[temp_sp_fabricacion_tipo_7]
(
	@idPedido int,
	@print int = 0,
	@real int = 0
)
as
begin
set nocount on

declare @idLinea int
declare @idTipo int
declare @articulos varchar(8000)
 
declare @Tejido int
declare @TejidoColor int

declare @acc_posicion_id varchar(10)
declare @tap_tipo_id varchar(10)
declare @tap_color_id varchar(10)
declare @con_color_id int
declare @cad_tipo int
declare @cad_altura varchar(200)
declare @consumo decimal(12,2)
declare @Ancho decimal(12,6)
declare @Ancho2 decimal(12,6)
declare @Alto decimal(12,6)
declare @Orden int
declare @nAncho decimal(12,6)
declare @nAlto decimal(12,6)
declare @descripcion2 varchar(500)
declare @id int
declare @Pos int

declare @ErrorString varchar(1000)
declare @Error int
declare @cantidad int
declare @descAncho decimal(12,6)
declare @descAlto decimal(12,6)
declare @descTubo decimal(12,6)
declare @descOculto decimal(12,6)
declare @descVisto decimal(12,6)
declare @descMacarron decimal(12,6)
declare @cad_color_text varchar(50)
declare @perfileria varchar(10)
declare @junquillo char(2)
declare @color varchar(10)

declare @mmeca decimal(12,4) 

set @mmeca = 2.22

set @Error = 0
set @ErrorString = ''

declare @lineas table(id int,tipo int)

if @real = 1
begin
	insert into @lineas(id,tipo)
	select id,tipo from sol_pedidos_cola_lineas where idrow=@idPedido
end
else
begin 
	insert into @lineas(id,tipo)
	select id,tipo from temp_sol_pedidos_cola_lineas where idrow=@idPedido
end


set @Pos = 1

declare itCursor cursor forward_only for
select id,tipo from @lineas
open itCursor 
fetch next from itCursor into @idLinea,@idTipo
while @@fetch_status = 0
begin

	   set @descOculto = 0
	   set @descVisto = 0
	   set @descMacarron = 0

	   /* DESCUENTOS */
	   

			if @real = 1
			begin
			 select 
			   @junquillo       = junquillo,
			   @cantidad        = cantidad,
			   @id              = id,
			   @Ancho           = ancho,
			   @Ancho2          = ancho2,
			   @Alto            = alto,
			   @Tejido          = tej_tipo_id,
			   @TejidoColor     = tej_color_id,
			   @color			= acc_modelo_id,
			   @acc_posicion_id = acc_posicion_id,
			   @tap_color_id    = tap_color_id,
			   @cad_tipo        = cad_tipo,
			   @cad_altura      = cad_altura,
			   @cad_color_text  = cad_color_text,
			   @perfileria      = perfileria
			   from sol_pedidos_cola_tipo_4 where idrow = @idLinea
	 
				delete from sol_pedidos_cola_tipo_4_fabricacion where idrow = @id
			end
			else
			begin

			   select 
			   @junquillo       = junquillo,
			   @cantidad        = cantidad,
			   @id              = id,
			   @Ancho           = ancho,
			   @Ancho2          = ancho2,
			   @Alto            = alto,
			   @Tejido          = tej_tipo_id,
			   @TejidoColor     = tej_color_id,
			   @color			= acc_modelo_id,
			   @acc_posicion_id = acc_posicion_id,
			   @tap_color_id    = tap_color_id,
			   @cad_tipo        = cad_tipo,
			   @cad_altura      = cad_altura,
			   @cad_color_text  = cad_color_text,
			   @perfileria      = perfileria
			   from temp_sol_pedidos_cola_tipo_4 where idrow = @idLinea
	 
				delete from temp_sol_pedidos_cola_tipo_4_fabricacion where idrow = @id
		   end

			/* CADENA */

				set @articulos = ''
				set @orden += 1
				set @consumo = 2*@cad_altura		
				if @color = 'BLA'	set @articulos='2978'
				if @color = 'GRI'	set @articulos='2980'
				if @color = 'NEG'	set @articulos='2979'
				/* INCLUYE SOPORTE ACCIONAMIENTO, CADENA Y 00388*/
				if @real = 1
				begin
				insert into sol_pedidos_cola_tipo_4_fabricacion(idrow,idpedido,numero,articulo,descripcion,cantidad,unidad,orden,consumo,ancho,alto)
				select @id,@Pos,1,data,'',1*@cantidad,3,@orden,@consumo,@consumo,@alto from dbo.string_to_table(@articulos,',')
				end
				else
				begin
				insert into temp_sol_pedidos_cola_tipo_4_fabricacion(idrow,idpedido,numero,articulo,descripcion,cantidad,unidad,orden,consumo,ancho,alto)
				select @id,@Pos,1,data,'',1*@cantidad,3,@orden,@consumo,@consumo,@alto from dbo.string_to_table(@articulos,',')
				end
			
			/* CADENA */


		
		
	set @Pos = @Pos + 1

	--PROCESS

	if @real = 1
		begin
		update sol_pedidos_cola_tipo_7_fabricacion set 
		unidad = (select UPPER(unidad1) from articulos where idrow=articulo),
		precio = isnull((select precio_coste from articulos where idrow=articulo),0),
		mmeca = @mmeca
		where idrow = @id

		update sol_pedidos_cola_tipo_7_fabricacion set 
		descripcion = (select UPPER(descripcion) from articulos where idrow=articulo),
		descUnidad = (select descripcion from SOL_ARTICULOS_UNIDADES where SOL_ARTICULOS_UNIDADES.unidad=sol_pedidos_cola_tipo_7_fabricacion.unidad),
		cod_sol = (select cod_solupyme from articulos where articulos.idrow = sol_pedidos_cola_tipo_7_fabricacion.articulo),
		fam_sol = (select fam_solupyme from articulos where articulos.idrow = sol_pedidos_cola_tipo_7_fabricacion.articulo),
		seccion = (select isnull(seccion,'') from articulos where articulos.idrow = sol_pedidos_cola_tipo_7_fabricacion.articulo)
		where idrow = @id
				end
				else
				begin

		update temp_sol_pedidos_cola_tipo_7_fabricacion set 
		unidad = (select UPPER(unidad1) from articulos where idrow=articulo),
		precio = isnull((select precio_coste from articulos where idrow=articulo),0),
		mmeca = @mmeca
		where idrow = @id

		update temp_sol_pedidos_cola_tipo_7_fabricacion set 
		descripcion = (select UPPER(descripcion) from articulos where idrow=articulo),
		descUnidad = (select descripcion from SOL_ARTICULOS_UNIDADES where SOL_ARTICULOS_UNIDADES.unidad=temp_sol_pedidos_cola_tipo_7_fabricacion.unidad),
		cod_sol = (select cod_solupyme from articulos where articulos.idrow = temp_sol_pedidos_cola_tipo_7_fabricacion.articulo),
		fam_sol = (select fam_solupyme from articulos where articulos.idrow = temp_sol_pedidos_cola_tipo_7_fabricacion.articulo),
		seccion = (select isnull(seccion,'') from articulos where articulos.idrow = temp_sol_pedidos_cola_tipo_7_fabricacion.articulo)
		where idrow = @id
		end

fetch next from itCursor into @idLinea,@idTipo
end
close itCursor
deallocate itCursor

		

		

end



