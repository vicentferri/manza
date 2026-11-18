/* sp_sol_pedidos_cola_tipo_1_add: pedidos de Leroy Merlin Web (cliente 5), enrollable con motor.
   La web envía el mando con los códigos de su integración (0 sin mando, 1 un canal, 6 seis canales; antes 3 = seis
   canales y 4 = sin mando) y el cargador como 0/1 en Tipo1_Cargador. Se traducen a los ids de
   SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO y SOL_ARTICULOS_MANDOS_CARGADORES para que el pedido guarde el texto del
   mando, el cargador, sus incrementos y códigos 48 (sp_pedidos_t1_asigna_48) y se impriman.
   Parte del script 03 (promoción motor 676 solo para el cliente 5). Idempotente (ALTER).
   Además rellena el código 48 del mando de 6 canales del motor 676 (clientes 1 y 5), vacío hasta ahora: el kit AM25
   (motor, mando y cargador) lleva el mismo código, 48007312. sp_pedidos_t1_asigna_48 saca de esas filas el 48 del mando
   y también el del motor (sin top 1, se queda con la última leída). Las filas de SIN MANDO se quedan sin código. */

update SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE
set codigo_48 = '48007312'
where modelo = 676 and cliente in (1, 5) and id = 8 and isnull(codigo_48, '') = ''
GO

ALTER PROCEDURE [dbo].[sp_sol_pedidos_cola_tipo_1_add]
	(
	@id int,
	 @idrow int,
	 @ancho decimal(12,2),
	 @alto  decimal(12,2),
     @cantidad int,
     @acc_tipo_id  int,
     @acc_tipo_text varchar(250),
     @acc_marca_id int,
     @acc_marca_text varchar(250),
     @acc_tubo_id  int,
     @acc_tubo_text varchar(250),
     @acc_modelo_id int,
     @acc_modelo_text varchar(250),
     @acc_posicion_id  int,
     @acc_posicion_text varchar(250),
     @sop_tipo_id      int,
     @sop_tipo_text  varchar(250),
     @sop_color_id      int,
     @sop_color_text varchar(250),
     @tej_tipo_id       int,
     @tej_tipo_text varchar(250),
     @tej_color_id     int,
     @tej_color_text varchar(250),
     @tej_salida_id    int,
     @tej_salida_text varchar(250),
     @con_tipo_id      int,
     @con_tipo_text varchar(250),
     @tap_tipo_id       int,
     @tap_tipo_text varchar(250),
     @tap_color_id     int,
     @tap_color_text varchar(250),
     @cad_altura_id     int,
     @cad_altura_text varchar(250),
     @cad_color_id     int,
     @cad_color_text  varchar(250),
     @cad_Altura     varchar(250),
     @cad_Tipo       varchar(250),
     @con_color_id      int,
     @con_color_text  varchar(250),
     @impresion         int,
     @impresion_imagen varchar(250),
     @mando_id         int,
     @mando_text       varchar(250),
	 @instrucciones    varchar(250),
	 @centro int = 1,
	 @strFechaEntrega varchar(10),
	 @T1_Cantidad	int	= 1,
	 @T1_Tejido	varchar(25)	= '',
	 @T1_Tejido_C1	varchar(25)	= '',
	 @T1_Inc_CadenaMetalica	varchar(25)= '',
	 @T1_Inc_CadenaMetalica_C1	varchar(25)= '',
	 @T1_Inc_Contrapeso	varchar(25)	= '',
	 @T1_Inc_Contrapeso_C1	varchar(25)= '',
	 @T1_Inc_Mando	varchar(25)	= '',
	 @T1_Inc_Mando_C1	varchar(25)	= '',
	 @T1_Inc_Impresion	varchar(25)= '',
	 @T1_Inc_Impresion_C1	varchar(25)	= '',
	 @T1_PVP	varchar(25)	= '',
	 @T1_PVP_C1	varchar(25)	= '',
	 @T1_Fecha_Entrega	varchar(25)	= '',
	 @T1_Transporte	varchar(25)= '',
	 @Estancia_ID int,
	 @Estancia varchar(250),
	 @idcajon int = -1,
	 @idguia int = -1,
	 @cargador int = -1,
	 @T1_Inc_Cargador	varchar(25)= '',
	 @T1_Inc_Cargador_C1	varchar(25)	= ''
	 )
	 as
	 begin

	  declare @line int
	  declare @articulo int
	  declare @id2 int

	  declare @cliente int --nuevo



                select @cliente = cliente     -- nuevo

                from [SOL_PEDIDOS_COLA]

                where idrow = @idrow

	  /* Leroy Merlin Web (cliente 5), enrollable con motor: el JSON de la web trae los códigos de su integración
	     (los mismos que sp_tarifas_calculate_prices_link) y aquí se pasan a los ids de nuestras tablas.
	     Mando (SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO): 0 sin mando -> 4, 1 un canal -> 6, 6 seis canales -> 8;
	     también los códigos antiguos de la web: 3 seis canales -> 8, 4 sin mando -> 4.
	     Cargador (Tipo1_Cargador): 1 -> el cargador del modelo de motor (SOL_ARTICULOS_MANDOS_CARGADORES.id_marca;
	     el modelo es siempre el 676, la promoción de abajo); 0 o sin enviar -> sin cargador. */
	  if @cliente = 5 and @acc_tipo_id = 3
	  begin
		  set @mando_id = case @mando_id when 0 then 4 when 1 then 6 when 6 then 8 when 3 then 8 else @mando_id end

		  if @cargador = 1
			  set @cargador = isnull((select top 1 idrow from SOL_ARTICULOS_MANDOS_CARGADORES where id_marca = 676 order by idrow), -1)
		  else
			  set @cargador = -1
	  end

	  set @line = 10
	  set @articulo = 1

	   UPDATE [SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into  [SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,1)
	  set @id = scope_identity()


	  if @id > 0
	  begin
	  insert into  [SOL_PEDIDOS_COLA_TIPO_1](idrow,ancho,alto,cantidad,acc_tipo_id,acc_tipo_text,acc_marca_id,acc_marca_text,
				  acc_tubo_id,acc_tubo_text,acc_modelo_id,acc_modelo_text,acc_posicion_id,acc_posicion_text,sop_tipo_id,
     sop_tipo_text,sop_color_id,sop_color_text,tej_tipo_id,tej_tipo_text,tej_color_id,tej_color_text,tej_salida_id,tej_salida_text,
     con_tipo_id,con_tipo_text,tap_tipo_id,tap_tipo_text,tap_color_id,tap_color_text,cad_altura_id,cad_altura_text,cad_color_id,
     cad_color_text,cad_Altura,cad_Tipo,con_color_id,con_color_text,impresion,impresion_imagen,mando_id,mando_text,instrucciones,strFechaEntrega,
	 T1_Cantidad,T1_Tejido,T1_Tejido_C1,T1_Inc_CadenaMetalica,T1_Inc_CadenaMetalica_C1,T1_Inc_Contrapeso,T1_Inc_Contrapeso_C1,
	 T1_Inc_Mando,T1_Inc_Mando_C1,T1_Inc_Impresion,T1_Inc_Impresion_C1,T1_PVP,T1_PVP_C1,T1_Fecha_Entrega,T1_Transporte, Estancia_ID, Estancia,idcajon,idguia,
	 cargador,T1_Inc_Cargador,T1_Inc_Cargador_C1)
	 values(
	 @id ,
	 @ancho ,
	 @alto  ,
     @cantidad ,
     @acc_tipo_id  ,
     @acc_tipo_text ,
     @acc_marca_id ,
     @acc_marca_text ,
     @acc_tubo_id  ,
     @acc_tubo_text ,
     @acc_modelo_id ,
     @acc_modelo_text ,
     @acc_posicion_id  ,
     @acc_posicion_text ,
     @sop_tipo_id      ,
     @sop_tipo_text  ,
     @sop_color_id      ,
     @sop_color_text ,
     @tej_tipo_id       ,
     @tej_tipo_text ,
     @tej_color_id     ,
     @tej_color_text ,
     @tej_salida_id    ,
     @tej_salida_text ,
     @con_tipo_id      ,
     @con_tipo_text ,
     @tap_tipo_id       ,
     @tap_tipo_text ,
     @tap_color_id     ,
     @tap_color_text ,
     @cad_altura_id     ,
     @cad_altura_text ,
     @cad_color_id     ,
     @cad_color_text  ,
     @cad_Altura     ,
     @cad_Tipo       ,
     @con_color_id,@con_color_text  ,@impresion,@impresion_imagen,@mando_id,@mando_text, @instrucciones,@strFechaEntrega,
	 @T1_Cantidad,@T1_Tejido,@T1_Tejido_C1,@T1_Inc_CadenaMetalica,@T1_Inc_CadenaMetalica_C1,@T1_Inc_Contrapeso,@T1_Inc_Contrapeso_C1,
	 @T1_Inc_Mando,@T1_Inc_Mando_C1,@T1_Inc_Impresion,@T1_Inc_Impresion_C1,@T1_PVP,@T1_PVP_C1,@T1_Fecha_Entrega,@T1_Transporte,@Estancia_ID, @Estancia,@idcajon,@idguia,
	 @cargador,@T1_Inc_Cargador,@T1_Inc_Cargador_C1)


	  set @id2 = scope_identity()

	 update [sol_pedidos_cola_tipo_1] set
		acc_tipo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[sol_articulos_accionamientos] where idrow=acc_tipo_id),
		acc_marca_text = (select descripcion from [SOLARMANES_DEV].[DBO].[sol_articulos_accionamientos_TIPOS] where id=acc_marca_id),
		acc_tubo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[sol_articulos_tubos] where idrow=acc_tubo_id),
		--acc_modelo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=acc_modelo_id),
		--acc_modelo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=676),
		acc_modelo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_COLORES_MARCAS]

                                                  where idrow = case when @cliente = 5 and acc_tipo_id = 3 then 676

                                                                     else acc_modelo_id end),
		acc_posicion_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_posicionmando] where idrow=acc_posicion_id),
		sop_tipo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_SOPORTES] where idrow=sop_tipo_id),
		sop_color_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=sop_color_id),
		tej_tipo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_TEJIDOS] where idrow=tej_tipo_id),
		tej_color_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=tej_color_id),
		tej_salida_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_SALIDATEJIDO] where idrow=tej_salida_id),
		con_tipo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_CONTRAPESO] where idrow=con_tipo_id),
		tap_tipo_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_TAPAS] where idrow=tap_tipo_id),
		tap_color_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=tap_color_id),
		con_color_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=con_color_id),
		mando_text = isnull((select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO] where idrow=mando_id), case when mando_id > 0 then mando_text end)
		where id=@id2

		execute sp_pedidos_t1_asigna_48 @id2
	 end





	 return 1


	 end

