/* =====================================================================
   01 - Parámetros de fabricación del enrollable (motor v3)
   SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS guarda, por línea, los parámetros con
   los que se calculó su fabricación (igual que SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS).
     idrow    -> SOL_PEDIDOS_COLA_TIPO_1.id
     idpedido -> posición de la línea en el pedido (la misma que en la fabricación)
   La rellena temp_sp_fabricacion_tipo_1_v3 (script 02) y la lee la simulación de
   la pantalla de reglas (SOL_FABRICACION_PRODUCTOS.tabla_parametros del producto 1).
   Idempotente: no hace nada si la tabla ya existe.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

if object_id('dbo.SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS') is null
begin
	create table dbo.SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS
	(
		id int identity(1,1) not null constraint PK_SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS primary key clustered,
		idrow int not null,
		idpedido int null,
		parametro varchar(255) null,
		valor varchar(255) null
	)

	create nonclustered index IX_TIPO_1_PARAMETERS_IDROW on dbo.SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS(idrow)
end
go
