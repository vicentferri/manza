/* sp_pedidos_t1_asigna_48 (lo llama sp_sol_pedidos_cola_tipo_1_add al guardar cada línea del enrollable).
   Cambios:
   - El incremento del cargador va por la cantidad de cortinas de la línea, como el mando: PVP x cantidad y C1
     multiplicado con dbo.C1_Multiply. Antes se guardaba el precio de un solo cargador y no cuadraba con el T1_PVP.
   - El código 48 del mando sale de la fila del modelo de motor de la línea (el precio del mando va por modelo);
     si no hay fila de ese modelo, de cualquiera, como hasta ahora.
   Idempotente (ALTER). */

alter procedure [dbo].[sp_pedidos_t1_asigna_48]
(
 @idrow int
)
as
begin


declare @modelo int
declare @modelo_48 varchar(10) = ''

declare @mando int
declare @mando_48 varchar(10) = ''

declare @cantidad int
declare @cargador int
declare @cargador_pvp decimal(12,2) = 0
declare @cargador_c1 varchar(10) = ''
declare @cargador_48 varchar(10) = ''

select @cargador = cargador,@modelo = acc_modelo_id,@mando  = mando_id, @cantidad = isnull(cantidad, 1) from sol_pedidos_cola_tipo_1
where id=@idrow

if @cantidad < 1 set @cantidad = 1

	if @cargador > 0
	begin
		   select @cargador_pvp = pvp,
				  @cargador_c1 = c1,
				  @cargador_48 = codigo_48 from SOL_ARTICULOS_MANDOS_CARGADORES where idrow=@cargador

			update sol_pedidos_cola_tipo_1  set
			T1_Inc_Cargador = @cargador_pvp * @cantidad,
			T1_Inc_Cargador_C1 = case when @cantidad > 1 then dbo.C1_Multiply(@cargador_c1, @cantidad) else @cargador_c1 end,
			T1_Inc_Cargador_48 = @cargador_48
			where id = @idrow
	end

	if @modelo > 0
	begin
		select  @modelo_48= codigo_48 from SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE
		where modelo=@modelo and cliente=1

			update sol_pedidos_cola_tipo_1  set
			T1_Inc_Modelo_48 = @modelo_48
			where id = @idrow
	end

	if @mando > 0
	begin
		select top 1 @mando_48= codigo_48 from SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE
		where id=@mando and cliente=1
		order by case when modelo=@modelo then 0 else 1 end

			update sol_pedidos_cola_tipo_1  set
			T1_Inc_Mando_48 = @mando_48
			where id = @idrow
	end


end
