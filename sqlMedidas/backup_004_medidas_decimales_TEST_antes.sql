-- BACKUP · estado de SOLARMANES_TEST antes de 004_medidas_decimales.sql (2026-10-06).
-- Restaurar los SP: ejecutar este fichero. Las columnas solo se pueden volver a int si no hay decimales guardados:
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_1] ALTER COLUMN [ancho] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_1] ALTER COLUMN [alto] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_LINEAS] ALTER COLUMN [ancho] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_LINEAS] ALTER COLUMN [alto] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_3] ALTER COLUMN [PV_Ancho_1] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_3] ALTER COLUMN [PV_Alto_1] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_3] ALTER COLUMN [PV_Ancho_2] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_3] ALTER COLUMN [PV_AlturaMin_2] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_3] ALTER COLUMN [PV_AlturaMax_2] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_3] ALTER COLUMN [PV_Ancho_1] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_3] ALTER COLUMN [PV_Alto_1] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_3] ALTER COLUMN [PV_Ancho_2] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_3] ALTER COLUMN [PV_AlturaMin_2] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_3] ALTER COLUMN [PV_AlturaMax_2] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_3] ALTER COLUMN [PV_Ancho_1] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_3] ALTER COLUMN [PV_Alto_1] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_3] ALTER COLUMN [PV_Ancho_2] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_3] ALTER COLUMN [PV_AlturaMin_2] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_3] ALTER COLUMN [PV_AlturaMax_2] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_4] ALTER COLUMN [ancho] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_4] ALTER COLUMN [ancho2] int NULL;
--   ALTER TABLE dbo.[temp_sol_pedidos_cola_tipo_4] ALTER COLUMN [alto] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_4] ALTER COLUMN [ancho] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_4] ALTER COLUMN [ancho2] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_4] ALTER COLUMN [alto] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_4] ALTER COLUMN [ancho] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_4] ALTER COLUMN [ancho2] int NULL;
--   ALTER TABLE dbo.[SOL_PRESUPUESTOS_COLA_TIPO_4] ALTER COLUMN [alto] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_7] ALTER COLUMN [ancho] int NULL;
--   ALTER TABLE dbo.[SOL_PEDIDOS_COLA_TIPO_7] ALTER COLUMN [alto] int NULL;
-- dbo.fn_medida_txt no existía: DROP FUNCTION dbo.fn_medida_txt; (después de restaurar los SP)
GO

-- ===== sol_temp_pedidos_cola_tipo_1_add




CREATE OR ALTER PROCEDURE [dbo].[sol_temp_pedidos_cola_tipo_1_add]	
	(
	 @id int,
	 @idrow int,
	 @ancho int,
	 @alto  int,
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
	 @SubTipoCortina Int = 1,
	  @idral Int = -1,
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
	 @idguia int = -1
	 )
	 as
	 begin

	  declare @line int
	  declare @articulo int
	  declare @id2 int
	
	  set @line = 10
	  set @articulo = 1
	  
	   UPDATE [TEMP_SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into  [TEMP_SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,1)
	  set @id = scope_identity()
	  
	 
	  if @id > 0
	  begin
	  insert into [TEMP_SOL_PEDIDOS_COLA_TIPO_1](idrow,ancho,alto,cantidad,acc_tipo_id,acc_tipo_text,acc_marca_id,acc_marca_text,
				  acc_tubo_id,acc_tubo_text,acc_modelo_id,acc_modelo_text,acc_posicion_id,acc_posicion_text,sop_tipo_id,
     sop_tipo_text,sop_color_id,sop_color_text,tej_tipo_id,tej_tipo_text,tej_color_id,tej_color_text,tej_salida_id,tej_salida_text,
     con_tipo_id,con_tipo_text,tap_tipo_id,tap_tipo_text,tap_color_id,tap_color_text,cad_altura_id,cad_altura_text,cad_color_id,
     cad_color_text,cad_Altura,cad_Tipo,con_color_id,con_color_text,impresion,impresion_imagen,mando_id,mando_text,instrucciones,strFechaEntrega,
	 T1_Cantidad,T1_Tejido,T1_Tejido_C1,T1_Inc_CadenaMetalica,T1_Inc_CadenaMetalica_C1,T1_Inc_Contrapeso,T1_Inc_Contrapeso_C1,
	 T1_Inc_Mando,T1_Inc_Mando_C1,T1_Inc_Impresion,T1_Inc_Impresion_C1,T1_PVP,T1_PVP_C1,T1_Fecha_Entrega,T1_Transporte,SubTipoCortina,idral,Estancia_ID,Estancia,idcajon,idguia)
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
	 @T1_Inc_Mando,@T1_Inc_Mando_C1,@T1_Inc_Impresion,@T1_Inc_Impresion_C1,@T1_PVP,@T1_PVP_C1,@T1_Fecha_Entrega,@T1_Transporte,@SubTipoCortina,@idral,@Estancia_ID,@Estancia,@idcajon,@idguia)


	  set @id2 = scope_identity()

	 update [temp_sol_pedidos_cola_tipo_1] set
		acc_tipo_text = (select descripcion from [sol_articulos_accionamientos] where idrow=acc_tipo_id),
		acc_marca_text = (select descripcion from [sol_articulos_accionamientos_TIPOS] where id=acc_marca_id),
		acc_tubo_text = (select descripcion from [sol_articulos_tubos] where idrow=acc_tubo_id),
		acc_modelo_text = (select descripcion from [SOL_ARTICULOS_COLORES_MARCAS] where idrow=acc_modelo_id),
		acc_posicion_text = (select descripcion from [SOL_ARTICULOS_posicionmando] where idrow=acc_posicion_id),
		sop_tipo_text = (select descripcion from [SOL_ARTICULOS_SOPORTES] where idrow=sop_tipo_id),
		sop_color_text = (select descripcion from [SOL_ARTICULOS_COLORES_MARCAS] where idrow=sop_color_id),
		tej_tipo_text = (select descripcion from [SOL_ARTICULOS_TEJIDOS] where idrow=tej_tipo_id),
		tej_color_text = (select descripcion from [SOL_ARTICULOS_COLORES_MARCAS] where idrow=tej_color_id),
		tej_salida_text = (select descripcion from [SOL_ARTICULOS_SALIDATEJIDO] where idrow=tej_salida_id),
		con_tipo_text = (select descripcion from [SOL_ARTICULOS_CONTRAPESO] where idrow=con_tipo_id),
		tap_tipo_text = (select descripcion from [SOL_ARTICULOS_TAPAS] where idrow=tap_tipo_id),
		tap_color_text = (select descripcion from [SOL_ARTICULOS_COLORES_MARCAS] where idrow=tap_color_id),
		con_color_text = (select descripcion from [SOL_ARTICULOS_COLORES_MARCAS] where idrow=con_color_id),
		mando_text = (select descripcion from [SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO] where idrow=mando_id)
		where id=@id2
	 end
	 

	 return 1


	 end
GO

-- ===== sp_sol_pedidos_cola_tipo_1_add
CREATE OR ALTER PROCEDURE [dbo].[sp_sol_pedidos_cola_tipo_1_add]	
	(
	@id int,
	 @idrow int,
	 @ancho int,
	 @alto  int,
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
		acc_tipo_text = (select descripcion from [DBO].[sol_articulos_accionamientos] where idrow=acc_tipo_id),
		acc_marca_text = (select descripcion from [DBO].[sol_articulos_accionamientos_TIPOS] where id=acc_marca_id),
		acc_tubo_text = (select descripcion from [DBO].[sol_articulos_tubos] where idrow=acc_tubo_id),
		--acc_modelo_text = (select descripcion from [DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=acc_modelo_id),
		--acc_modelo_text = (select descripcion from [DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=676),
		acc_modelo_text = (select descripcion from [DBO].[SOL_ARTICULOS_COLORES_MARCAS]

                                                  where idrow = case when @cliente in (1, 5) and acc_tipo_id = 3 then 676

                                                                     else acc_modelo_id end),
		acc_posicion_text = (select descripcion from [DBO].[SOL_ARTICULOS_posicionmando] where idrow=acc_posicion_id),
		sop_tipo_text = (select descripcion from [DBO].[SOL_ARTICULOS_SOPORTES] where idrow=sop_tipo_id),
		sop_color_text = (select descripcion from [DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=sop_color_id),
		tej_tipo_text = (select descripcion from [DBO].[SOL_ARTICULOS_TEJIDOS] where idrow=tej_tipo_id),
		tej_color_text = (select descripcion from [DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=tej_color_id),
		tej_salida_text = (select descripcion from [DBO].[SOL_ARTICULOS_SALIDATEJIDO] where idrow=tej_salida_id),
		con_tipo_text = (select descripcion from [DBO].[SOL_ARTICULOS_CONTRAPESO] where idrow=con_tipo_id),
		tap_tipo_text = (select descripcion from [DBO].[SOL_ARTICULOS_TAPAS] where idrow=tap_tipo_id),
		tap_color_text = (select descripcion from [DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=tap_color_id),
		con_color_text = (select descripcion from [DBO].[SOL_ARTICULOS_COLORES_MARCAS] where idrow=con_color_id),
		mando_text = (select descripcion from [DBO].[SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO] where idrow=mando_id)
		where id=@id2

		execute sp_pedidos_t1_asigna_48 @id2
	 end


	 
	 

	 return 1


	 end
GO

-- ===== sp_sol_presupuestos_cola_tipo_1_add
CREATE OR ALTER PROCEDURE [dbo].[sp_sol_presupuestos_cola_tipo_1_add]	
	(
	 @id int,
	 @idrow int,
	 @ancho int,
	 @alto  int,
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
	 @idguia int = -1
	 )
	 as
	 begin

	  declare @line int
	  declare @articulo int
	  declare @descripcion varchar(255)
	
	  set @line = 10
	  set @articulo = 1
	  set @descripcion = 'Enrollable ' + cast(@cantidad as varchar) + 'x' + cast(@ancho as varchar) + 'x' + cast(@alto as varchar)
  
	UPDATE [dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into SOL_PRESUPUESTOS_COLA_LINEAS(idrow,line,articulo,ancho,alto,cantidad,tipo,observaciones,descripcion,lista)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,1,'',@descripcion,@line)
	  set @id = scope_identity()
	  
	 
	  if @id > 0
	  begin
	  insert into SOL_PRESUPUESTOS_COLA_TIPO_1(idrow,ancho,alto,cantidad,acc_tipo_id,acc_tipo_text,acc_marca_id,acc_marca_text,
				  acc_tubo_id,acc_tubo_text,acc_modelo_id,acc_modelo_text,acc_posicion_id,acc_posicion_text,sop_tipo_id,
     sop_tipo_text,sop_color_id,sop_color_text,tej_tipo_id,tej_tipo_text,tej_color_id,tej_color_text,tej_salida_id,tej_salida_text,
     con_tipo_id,con_tipo_text,tap_tipo_id,tap_tipo_text,tap_color_id,tap_color_text,cad_altura_id,cad_altura_text,cad_color_id,
     cad_color_text,cad_Altura,cad_Tipo,con_color_id,con_color_text,impresion,impresion_imagen,mando_id,mando_text,instrucciones,strFechaEntrega,
	 T1_Cantidad,T1_Tejido,T1_Tejido_C1,T1_Inc_CadenaMetalica,T1_Inc_CadenaMetalica_C1,T1_Inc_Contrapeso,T1_Inc_Contrapeso_C1,
	 T1_Inc_Mando,T1_Inc_Mando_C1,T1_Inc_Impresion,T1_Inc_Impresion_C1,T1_PVP,T1_PVP_C1,T1_Fecha_Entrega,T1_Transporte,Estancia_ID,Estancia,idcajon,idguia)
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
	 @T1_Inc_Mando,@T1_Inc_Mando_C1,@T1_Inc_Impresion,@T1_Inc_Impresion_C1,@T1_PVP,@T1_PVP_C1,@T1_Fecha_Entrega,@T1_Transporte,@Estancia_ID,@Estancia,@idcajon,@idguia)
	 end
	 

	 return 1


	 end
GO

-- ===== sol_temp_pedidos_cola_tipo_2_add
CREATE OR ALTER PROCEDURE [dbo].[sol_temp_pedidos_cola_tipo_2_add]
(
@id int,
@idrow int,
@PJ_Ancho_1 decimal(12,2),
@PJ_Alto_1 decimal(12,2),
@PJ_Cantidad_1 int,
@PJ_Contrapeso_1 int,
@pj_tejidos_id int,
@pj_tejidos_text varchar(250),
@pj_tejidosC_id int,
@pj_tejidosC_text  varchar(250),
@PJ_Ancho_2 decimal(12,2),
@PJ_NumeroVias_2 varchar(250),
@PJ_PosicionMando_2 varchar(250),
@PJ_TipoRecogida_2 varchar(250),
@PJ_ColorRiel_2 varchar(250),
@PJ_TipoSoporte_2 varchar(250),
@PJ_Estancia_ID int,
@PJ_Estancia varchar(250),
@PJ_NumeroPortatelas int,
@PJ_NumeroLamas int,
@PJ_AnchoLama decimal(12,2),
@PJ_AnchoLamaTerminada decimal(12,2),
@impresion        int,
@impresion_imagen  varchar(250),
@instrucciones   varchar(250),
@T2_Tejido_2	varchar(10)	= '-1',
@T2_TejidoColor_2	varchar(10)	= '-1',
@T2_Tejido_3	varchar(10)	= '-1',
@T2_TejidoColor_3	varchar(10)	= '-1',
@T2_Tejido_4	varchar(10)	= '-1',
@T2_TejidoColor_4	varchar(10)	= '-1',
@T2_Tejido_5	varchar(10)	= '-1',
@T2_TejidoColor_5	varchar(10)	= '-1',
@PJ_ID_Quiero_2	int	= 0,
@PJ_ID_Quiero_3	int	= 0,
@PJ_ID_Quiero_4	int	= 0,
@PJ_ID_Quiero_5	int	= 0,
@PJ_ID_Imagen_2	varchar(10)	= '-1',
@PJ_ID_Imagen_3	varchar(10)	= '-1',
@PJ_ID_Imagen_4	varchar(10)	= '-1',
@PJ_ID_Imagen_5	varchar(10)	= '-1'
)
as
begin

	  declare @line int
	  declare @articulo int
	  declare @descripcion varchar(255)
	
	  set @line = 20
	  set @articulo = 2
	  set @descripcion = 'P.Japones ' + cast(@pj_cantidad_1 as varchar) + 'x' + cast(@pj_ancho_1 as varchar) + 'x' + cast(@pj_alto_1 as varchar)
	  
	  insert into TEMP_SOL_PEDIDOS_COLA_LINEAS(idrow,line,articulo,ancho,alto,cantidad,tipo,observaciones,descripcion,lista)
	  values(@idrow,@line,@articulo,@pj_ancho_1,@pj_alto_1,@pj_cantidad_1,2,'',@descripcion,@line)
	  set @id = scope_identity()

	  if @id > 0
	  begin

insert into TEMP_SOL_PEDIDOS_COLA_TIPO_2(
IDROW,PJ_Ancho_1,PJ_Alto_1,PJ_Cantidad_1,pj_tejidos_id,pj_tejidos_text,pj_tejidosC_id,pj_tejidosC_text,
PJ_Contrapeso_1,impresion,impresion_imagen,PJ_Ancho_2,PJ_NumeroVias_2,PJ_PosicionMando_2,PJ_TipoRecogida_2,
PJ_ColorRiel_2,PJ_TipoSoporte_2,instrucciones,
PJ_Estancia_ID,PJ_Estancia,PJ_NumeroPortatelas,PJ_NumeroLamas,PJ_AnchoLama,PJ_AltoLamaTerminada,T2_TejidoColor_2,T2_TejidoColor_3,T2_TejidoColor_4,T2_TejidoColor_5
)
values(@ID,@PJ_Ancho_1,@PJ_Alto_1,@PJ_Cantidad_1,@pj_tejidos_id,@pj_tejidos_text,@pj_tejidosC_id,@pj_tejidosC_text,
@PJ_Contrapeso_1,@impresion,@impresion_imagen,
@PJ_Ancho_2,@PJ_NumeroVias_2,@PJ_PosicionMando_2,@PJ_TipoRecogida_2,@PJ_ColorRiel_2,@PJ_TipoSoporte_2,
@instrucciones,@PJ_Estancia_ID,@PJ_Estancia,@PJ_NumeroPortatelas,@PJ_NumeroLamas,@PJ_AnchoLama,@PJ_AnchoLamaTerminada,@T2_TejidoColor_2,@T2_TejidoColor_3,@T2_TejidoColor_4,@T2_TejidoColor_5
)

end

return 1

end
GO

-- ===== sol_presupuestos_cola_tipo_2_add
CREATE OR ALTER PROCEDURE [dbo].[sol_presupuestos_cola_tipo_2_add]
(
@id int,
@idrow int,
@TipoJapones int,
@PJ_Ancho_1 decimal(12,2),
@PJ_Alto_1 decimal(12,2),
@PJ_Cantidad_1 int,
@PJ_Contrapeso_1 int,
@pj_tejidos_id int,
@pj_tejidos_text varchar(250),
@pj_tejidosC_id int,
@pj_tejidosC_text  varchar(250),
@PJ_Ancho_2 decimal(12,2),
@PJ_NumeroVias_2 varchar(250),
@PJ_PosicionMando_2 varchar(250),
@PJ_TipoRecogida_2 varchar(250),
@PJ_ColorRiel_2 varchar(250),
@PJ_TipoSoporte_2 varchar(250),
@PJ_Estancia_ID int,
@PJ_Estancia varchar(250),
@PJ_NumeroPortatelas int,
@PJ_NumeroLamas int,
@PJ_AnchoLama decimal(12,2),
@PJ_AltoLamaTerminada decimal(12,2),
@impresion        int,
@impresion_imagen  varchar(250),
@instrucciones   varchar(250),
 @centro int = 1,
  @strFechaEntrega varchar(10),
  @T2_Cantidad	int = 1,
@T2_Tejido	varchar(25)	= '',
@T2_Tejido_C1	varchar(25)= '',
@T2_NumeroVias	varchar(25)	= '',
@T2_NumeroVias_C1	varchar(25)	= '',
@T2_NumSoportes	varchar(25)	= '',
@T2_TipoSoporte	varchar(25)	= '',
@T2_TipoSoporte_C1	varchar(25)	= '',
@T2_Inc_Impresion	varchar(25)	= '',
@T2_Inc_Impresion_C1	varchar(25)	= '',
@T2_PVP	varchar(25)	= '',
@T2_PVP_C1	varchar(25)	= '',
@T2_FechaEntrega	varchar(25)	= '',
@T2_Transporte	varchar(25)	= '',
@T2_SoporteTotal	varchar(25)	= '',
@T2_TejidoColor_2	varchar(10)	= '-1',
@T2_TejidoColor_3	varchar(10)	= '-1',
@T2_TejidoColor_4	varchar(10)	= '-1',
@T2_TejidoColor_5	varchar(10)	= '-1',
@iCombinarColores	int	= 0
)

as
begin

	  declare @line int
	  declare @articulo int
	  declare @descripcion varchar(255)
	
	  set @line = 20
	  set @articulo = 2
	  set @descripcion = 'P.Japones ' + cast(@pj_cantidad_1 as varchar) + 'x' + cast(@pj_ancho_1 as varchar) + 'x' + cast(@pj_alto_1 as varchar)
	  
	  UPDATE [dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into SOL_PRESUPUESTOS_COLA_LINEAS(idrow,line,articulo,ancho,alto,cantidad,tipo,observaciones,descripcion,lista)
	  values(@idrow,@line,@articulo,@pj_ancho_1,@pj_alto_1,@pj_cantidad_1,2,'',@descripcion,@line)
	  set @id = scope_identity()

	  if @id > 0
	  begin

insert into SOL_PRESUPUESTOS_COLA_TIPO_2(
IDROW,PJ_Ancho_1,PJ_Alto_1,PJ_Cantidad_1,pj_tejidos_id,pj_tejidos_text,pj_tejidosC_id,pj_tejidosC_text,
PJ_Contrapeso_1,impresion,impresion_imagen,PJ_Ancho_2,PJ_NumeroVias_2,PJ_PosicionMando_2,PJ_TipoRecogida_2,
PJ_ColorRiel_2,PJ_TipoSoporte_2,instrucciones,PJ_Estancia_ID,PJ_Estancia,PJ_NumeroPortatelas,PJ_NumeroLamas,PJ_AnchoLama,
PJ_AltoLamaTerminada,TipoJapones,strFechaEntrega,
T2_Cantidad,
T2_Tejido,
T2_Tejido_C1,
T2_NumeroVias,
T2_NumeroVias_C1,
T2_NumSoportes,
T2_TipoSoporte,
T2_TipoSoporte_C1,
T2_Inc_Impresion,
T2_Inc_Impresion_C1,
T2_PVP,
T2_PVP_C1,
T2_FechaEntrega,
T2_Transporte,
T2_SoporteTotal,
T2_TejidoColor_2,T2_TejidoColor_3,T2_TejidoColor_4,T2_TejidoColor_5,
PJ_CombinarColores
)
values(@ID,@PJ_Ancho_1,@PJ_Alto_1,@PJ_Cantidad_1,@pj_tejidos_id,@pj_tejidos_text,@pj_tejidosC_id,@pj_tejidosC_text,
@PJ_Contrapeso_1,@impresion,@impresion_imagen,
@PJ_Ancho_2,@PJ_NumeroVias_2,@PJ_PosicionMando_2,@PJ_TipoRecogida_2,@PJ_ColorRiel_2,@PJ_TipoSoporte_2,
@instrucciones,@PJ_Estancia_ID,@PJ_Estancia,@PJ_NumeroPortatelas,@PJ_NumeroLamas,@PJ_AnchoLama,@PJ_AltoLamaTerminada,@TipoJapones,@strFechaEntrega,
@T2_Cantidad,
@T2_Tejido,
@T2_Tejido_c1,
@T2_NumeroVias,
@T2_NumeroVias_C1,
@T2_NumSoportes,
@T2_TipoSoporte,
@T2_TipoSoporte_C1,
@T2_Inc_Impresion,
@T2_Inc_Impresion_C1,
@T2_PVP,
@T2_PVP_C1,
@T2_FechaEntrega,
@T2_Transporte,
@T2_SoporteTotal,@T2_TejidoColor_2,@T2_TejidoColor_3,@T2_TejidoColor_4,@T2_TejidoColor_5,
@iCombinarColores)
end

return 1

end
GO

-- ===== sol_temp_pedidos_cola_tipo_3_add
CREATE OR ALTER PROCEDURE [dbo].[sol_temp_pedidos_cola_tipo_3_add]  
  (
  @id int,
  @idrow int,
  @PV_SEL_1 int,
  @PV_Ancho_1 int,
  @PV_Alto_1 int,
  @PV_Cantidad_1 int,
  @PV_AnchoLama_1 varchar(250),
  @PV_PosicionMecanismo_1 varchar(250),
  @PV_ColorRiel_1 varchar(250),
  @PV_Accionamiento_1 varchar(250),
  @PV_TipoSoporte_1 varchar(250),
  @PV_TipoRecogida_1 varchar(250),
  @PV_Tejido_id int,
  @PV_Tejido_text varchar(250),
  @PV_Tejido_c1_id int,
  @PV_Tejido_c1_text varchar(250),
  @PV_Tejido_c2_id varchar(250),
  @PV_Tejido_c2_text varchar(250),
  @PV_SEL_2 int,
  @PV_Ancho_2 int,
  @PV_Cantidad_2 int,
  @PV_AlturaMin_2 int,
  @PV_AlturaMax_2 int,
  @PV_AnchoLama_2 varchar(250),
  @PV_PosicionMecanismo_2 varchar(250),
  @PV_ColorRiel_2 varchar(250),
  @PV_Accionamiento_2 varchar(250),
  @PV_TipoSoporte_2 varchar(250),
  @PV_TipoRecogida_2 varchar(250),
  @instrucciones varchar(250),
   @centro int = 1,
    @strFechaEntrega varchar(10),
	@T3_Cantidad int = 1,
	@T3_Tejido	varchar(25) = '',
	@T3_Tejido_C1 varchar(25) = '',	
	@T3_TejidosCombinados varchar(25) = '',	 
	@T3_TejidosCombinados_C1 varchar(25) = '',	
	@T3_TipoSoporte varchar(25) = '',
 	@T3_NumSoportes	varchar(25) = '',
	@T3_TipoSoporte_C1	varchar(25) = '',
	@T3_PVP	varchar(25) = '',
	@T3_PVP_C1	varchar(25) = '',
	@T3_Fecha_Entrega	varchar(25) = '',
	@T3_Transporte	varchar(25) = '',
	@T32_Cantidad int = 1,	
	@T32_Tejido	varchar(25) = '',
	@T32_Tejido_C1	varchar(25) = '',
	@T32_TejidosCombinados	varchar(25) = '',
	@TipoVertical int,
	@impresion_1  int,
	@impresion_imagen_1  varchar(250),
	@impresion_2        int,
	@impresion_imagen_2  varchar(250),
	@Estancia_ID int,
	@Estancia varchar(250)
  )
  as
  begin

  	  declare @line int
	  declare @articulo int
	
	  set @line = 30
	  set @articulo = 3
	  
	   UPDATE [dbo].[TEMP_SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into  [DBO].[TEMP_SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@PV_Ancho_1,@PV_Alto_1,@PV_Cantidad_1,3)
	  set @id = scope_identity()

	  if @id > 0
	  begin


  insert into  [DBO].[temp_sol_pedidos_cola_tipo_3](
  idrow,
  PV_SEL_1 ,
  PV_Ancho_1 ,
  PV_Alto_1 ,
  PV_Cantidad_1 ,
  PV_AnchoLama_1 ,
  PV_PosicionMecanismo_1 ,
  PV_ColorRiel_1 ,
  PV_Accionamiento_1 ,
  PV_TipoSoporte_1 ,
  PV_TipoRecogida_1 ,
  PV_Tejido_id ,
  PV_Tejido_text ,
  PV_Tejido_c1_id ,
  PV_Tejido_c1_text ,
  PV_Tejido_c2_id ,
  PV_Tejido_c2_text ,
  PV_SEL_2 ,
  PV_Ancho_2 ,
  PV_Cantidad_2 ,
  PV_AlturaMin_2 ,
  PV_AlturaMax_2 ,
  PV_AnchoLama_2 ,
  PV_PosicionMecanismo_2 ,
  PV_ColorRiel_2 ,
  PV_Accionamiento_2 ,
  PV_TipoSoporte_2 ,
  PV_TipoRecogida_2 ,
  instrucciones,strFechaEntrega,
  T3_Cantidad,	
	 T3_Tejido,	
	 T3_Tejido_C1,	
	 T3_TejidosCombinados,	
	 T3_TejidosCombinados_C1,	
	 T3_TipoSoporte,
 	 T3_NumSoportes,
	 T3_TipoSoporte_C1,	
	 T3_PVP,	
	 T3_PVP_C1,	
	 T3_Fecha_Entrega,	
	 T3_Transporte,	
	 T32_Cantidad,	
	 T32_Tejido,	
	 T32_Tejido_C1,	
	 T32_TejidosCombinados,
	 TipoVertical,
	 impresion_1,
	 impresion_imagen_1,
	 impresion_2,
	 impresion_imagen_2,
	 Estancia_ID,
	 Estancia
)
  values(
  @id ,
  @PV_SEL_1 ,
  @PV_Ancho_1 ,
  @PV_Alto_1 ,
  @PV_Cantidad_1 ,
  @PV_AnchoLama_1 ,
  @PV_PosicionMecanismo_1 ,
  @PV_ColorRiel_1 ,
  @PV_Accionamiento_1 ,
  @PV_TipoSoporte_1 ,
  @PV_TipoRecogida_1 ,
  @PV_Tejido_id ,
  @PV_Tejido_text ,
  @PV_Tejido_c1_id ,
  @PV_Tejido_c1_text ,
  @PV_Tejido_c2_id ,
  @PV_Tejido_c2_text ,
  @PV_SEL_2 ,
  @PV_Ancho_2 ,
  @PV_Cantidad_2 ,
  @PV_AlturaMin_2 ,
  @PV_AlturaMax_2 ,
  @PV_AnchoLama_2 ,
  @PV_PosicionMecanismo_2 ,
  @PV_ColorRiel_2 ,
  @PV_Accionamiento_2 ,
  @PV_TipoSoporte_2 ,
  @PV_TipoRecogida_2 ,
  @instrucciones,@strFechaEntrega,
  @T3_Cantidad,	
	 @T3_Tejido,	
	 @T3_Tejido_C1,	
	 @T3_TejidosCombinados,	
	 @T3_TejidosCombinados_C1,	
	 @T3_TipoSoporte,
 	 @T3_NumSoportes,	
	 @T3_TipoSoporte_C1,	
	 @T3_PVP,	
	 @T3_PVP_C1,	
	 @T3_Fecha_Entrega,	
	 @T3_Transporte,	
	 @T32_Cantidad,	
	 @T32_Tejido,	
	 @T32_Tejido_C1,	
	 @T32_TejidosCombinados,
	 @TipoVertical,
	 @impresion_1,
	 @impresion_imagen_1,
	 @impresion_2,
	 @impresion_imagen_2,
	 @Estancia_ID,
	 @Estancia

)

  end

  return 1

  end
GO

-- ===== sol_pedidos_cola_tipo_3_add
CREATE OR ALTER PROCEDURE [dbo].[sol_pedidos_cola_tipo_3_add]  
  (
  @id int,
  @idrow int,
  @PV_SEL_1 int,
  @PV_Ancho_1 int,
  @PV_Alto_1 int,
  @PV_Cantidad_1 int,
  @PV_AnchoLama_1 varchar(250),
  @PV_PosicionMecanismo_1 varchar(250),
  @PV_ColorRiel_1 varchar(250),
  @PV_Accionamiento_1 varchar(250),
  @PV_TipoSoporte_1 varchar(250),
  @PV_TipoRecogida_1 varchar(250),
  @PV_Tejido_id int,
  @PV_Tejido_text varchar(250),
  @PV_Tejido_c1_id int,
  @PV_Tejido_c1_text varchar(250),
  @PV_Tejido_c2_id varchar(250),
  @PV_Tejido_c2_text varchar(250),
  @PV_SEL_2 int,
  @PV_Ancho_2 int,
  @PV_Cantidad_2 int,
  @PV_AlturaMin_2 int,
  @PV_AlturaMax_2 int,
  @PV_AnchoLama_2 varchar(250),
  @PV_PosicionMecanismo_2 varchar(250),
  @PV_ColorRiel_2 varchar(250),
  @PV_Accionamiento_2 varchar(250),
  @PV_TipoSoporte_2 varchar(250),
  @PV_TipoRecogida_2 varchar(250),
  @instrucciones varchar(250),
   @centro int = 1,
    @strFechaEntrega varchar(10),
	@T3_Cantidad int = 1,
	@T3_Tejido	varchar(25) = '',
	@T3_Tejido_C1 varchar(25) = '',	
	@T3_TejidosCombinados varchar(25) = '',	 
	@T3_TejidosCombinados_C1 varchar(25) = '',	
	@T3_TipoSoporte varchar(25) = '',
 	@T3_NumSoportes	varchar(25) = '',
	@T3_TipoSoporte_C1	varchar(25) = '',
	@T3_PVP	varchar(25) = '',
	@T3_PVP_C1	varchar(25) = '',
	@T3_Fecha_Entrega	varchar(25) = '',
	@T3_Transporte	varchar(25) = '',
	@T32_Cantidad int = 1,	
	@T32_Tejido	varchar(25) = '',
	@T32_Tejido_C1	varchar(25) = '',
	@T32_TejidosCombinados	varchar(25) = '',
	@TipoVertical int,
	@impresion_1  int,
	@impresion_imagen_1  varchar(250),
	@impresion_2        int,
	@impresion_imagen_2  varchar(250),
	@Estancia_ID int,
	 @Estancia varchar(250)
  )
  as
  begin

  	  declare @line int
	  declare @articulo int
	
	  set @line = 30
	  set @articulo = 3
	  
	   UPDATE [dbo].[SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into  [DBO].[SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@PV_Ancho_1,@PV_Alto_1,@PV_Cantidad_1,3)
	  set @id = scope_identity()

	  if @id > 0
	  begin


  insert into  [DBO].[sol_pedidos_cola_tipo_3](
  idrow,
  PV_SEL_1 ,
  PV_Ancho_1 ,
  PV_Alto_1 ,
  PV_Cantidad_1 ,
  PV_AnchoLama_1 ,
  PV_PosicionMecanismo_1 ,
  PV_ColorRiel_1 ,
  PV_Accionamiento_1 ,
  PV_TipoSoporte_1 ,
  PV_TipoRecogida_1 ,
  PV_Tejido_id ,
  PV_Tejido_text ,
  PV_Tejido_c1_id ,
  PV_Tejido_c1_text ,
  PV_Tejido_c2_id ,
  PV_Tejido_c2_text ,
  PV_SEL_2 ,
  PV_Ancho_2 ,
  PV_Cantidad_2 ,
  PV_AlturaMin_2 ,
  PV_AlturaMax_2 ,
  PV_AnchoLama_2 ,
  PV_PosicionMecanismo_2 ,
  PV_ColorRiel_2 ,
  PV_Accionamiento_2 ,
  PV_TipoSoporte_2 ,
  PV_TipoRecogida_2 ,
  instrucciones,strFechaEntrega,
  T3_Cantidad,	
	 T3_Tejido,	
	 T3_Tejido_C1,	
	 T3_TejidosCombinados,	
	 T3_TejidosCombinados_C1,	
	 T3_TipoSoporte,
 	 T3_NumSoportes,
	 T3_TipoSoporte_C1,	
	 T3_PVP,	
	 T3_PVP_C1,	
	 T3_Fecha_Entrega,	
	 T3_Transporte,	
	 T32_Cantidad,	
	 T32_Tejido,	
	 T32_Tejido_C1,	
	 T32_TejidosCombinados,
	 TipoVertical,
	 impresion_1,
	 impresion_imagen_1,
	 impresion_2,
	 impresion_imagen_2,
	 Estancia_ID,
	 Estancia
)
  values(
  @id ,
  @PV_SEL_1 ,
  @PV_Ancho_1 ,
  @PV_Alto_1 ,
  @PV_Cantidad_1 ,
  @PV_AnchoLama_1 ,
  @PV_PosicionMecanismo_1 ,
  @PV_ColorRiel_1 ,
  @PV_Accionamiento_1 ,
  @PV_TipoSoporte_1 ,
  @PV_TipoRecogida_1 ,
  @PV_Tejido_id ,
  @PV_Tejido_text ,
  @PV_Tejido_c1_id ,
  @PV_Tejido_c1_text ,
  @PV_Tejido_c2_id ,
  @PV_Tejido_c2_text ,
  @PV_SEL_2 ,
  @PV_Ancho_2 ,
  @PV_Cantidad_2 ,
  @PV_AlturaMin_2 ,
  @PV_AlturaMax_2 ,
  @PV_AnchoLama_2 ,
  @PV_PosicionMecanismo_2 ,
  @PV_ColorRiel_2 ,
  @PV_Accionamiento_2 ,
  @PV_TipoSoporte_2 ,
  @PV_TipoRecogida_2 ,
  @instrucciones,@strFechaEntrega,
  @T3_Cantidad,	
	 @T3_Tejido,	
	 @T3_Tejido_C1,	
	 @T3_TejidosCombinados,	
	 @T3_TejidosCombinados_C1,	
	 @T3_TipoSoporte,
 	 @T3_NumSoportes,	
	 @T3_TipoSoporte_C1,	
	 @T3_PVP,	
	 @T3_PVP_C1,	
	 @T3_Fecha_Entrega,	
	 @T3_Transporte,	
	 @T32_Cantidad,	
	 @T32_Tejido,	
	 @T32_Tejido_C1,	
	 @T32_TejidosCombinados,
	 @TipoVertical,
	 @impresion_1,
	 @impresion_imagen_1,
	 @impresion_2,
	 @impresion_imagen_2,
	 @Estancia_ID,
	 @Estancia

)

  end

  return 1

  end
GO

-- ===== sol_presupuestos_cola_tipo_3_add
CREATE OR ALTER PROCEDURE [dbo].[sol_presupuestos_cola_tipo_3_add]  
  (
  @id int,
  @idrow int,
  @PV_SEL_1 int,
  @PV_Ancho_1 int,
  @PV_Alto_1 int,
  @PV_Cantidad_1 int,
  @PV_AnchoLama_1 varchar(250),
  @PV_PosicionMecanismo_1 varchar(250),
  @PV_ColorRiel_1 varchar(250),
  @PV_Accionamiento_1 varchar(250),
  @PV_TipoSoporte_1 varchar(250),
  @PV_TipoRecogida_1 varchar(250),
  @PV_Tejido_id int,
  @PV_Tejido_text varchar(250),
  @PV_Tejido_c1_id int,
  @PV_Tejido_c1_text varchar(250),
  @PV_Tejido_c2_id varchar(250),
  @PV_Tejido_c2_text varchar(250),
  @PV_SEL_2 int,
  @PV_Ancho_2 int,
  @PV_Cantidad_2 int,
  @PV_AlturaMin_2 int,
  @PV_AlturaMax_2 int,
  @PV_AnchoLama_2 varchar(250),
  @PV_PosicionMecanismo_2 varchar(250),
  @PV_ColorRiel_2 varchar(250),
  @PV_Accionamiento_2 varchar(250),
  @PV_TipoSoporte_2 varchar(250),
  @PV_TipoRecogida_2 varchar(250),
  @instrucciones varchar(250),
   @centro int = 1,
    @strFechaEntrega varchar(10),
	@T3_Cantidad int = 1,
	@T3_Tejido	varchar(25) = '',
	@T3_Tejido_C1 varchar(25) = '',	
	@T3_TejidosCombinados varchar(25) = '',	 
	@T3_TejidosCombinados_C1 varchar(25) = '',	
	@T3_TipoSoporte varchar(25) = '',
 	@T3_NumSoportes	varchar(25) = '',
	@T3_TipoSoporte_C1	varchar(25) = '',
	@T3_PVP	varchar(25) = '',
	@T3_PVP_C1	varchar(25) = '',
	@T3_Fecha_Entrega	varchar(25) = '',
	@T3_Transporte	varchar(25) = '',
	@T32_Cantidad int = 1,	
	@T32_Tejido	varchar(25) = '',
	@T32_Tejido_C1	varchar(25) = '',
	@T32_TejidosCombinados	varchar(25) = '',
	@impresion_1  int,
	@impresion_imagen_1  varchar(250),
	@impresion_2        int,
	@impresion_imagen_2  varchar(250),
	@Estancia_ID int,
	 @Estancia varchar(250)
	
  )
  as
  begin

  	  declare @line int
	  declare @articulo int
	  declare @descripcion varchar(255)
	
	  set @line = 30
	  set @articulo = 3

	  set @descripcion = 'P.Vertical ' + cast(@pv_cantidad_1 as varchar) + 'x' + cast(@pv_ancho_1 as varchar) + 'x' + cast(@pv_alto_1 as varchar)

	  UPDATE [dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into SOL_PRESUPUESTOS_COLA_LINEAS(idrow,line,articulo,ancho,alto,cantidad,tipo,observaciones,descripcion,lista)
	  values(@idrow,@line,@articulo,@PV_Ancho_1,@PV_Alto_1,@PV_Cantidad_1,3,'',@descripcion,@line)
	  set @id = scope_identity()

	  if @id > 0
	  begin


  insert into sol_presupuestos_cola_tipo_3(
  idrow,
  PV_SEL_1 ,
  PV_Ancho_1 ,
  PV_Alto_1 ,
  PV_Cantidad_1 ,
  PV_AnchoLama_1 ,
  PV_PosicionMecanismo_1 ,
  PV_ColorRiel_1 ,
  PV_Accionamiento_1 ,
  PV_TipoSoporte_1 ,
  PV_TipoRecogida_1 ,
  PV_Tejido_id ,
  PV_Tejido_text ,
  PV_Tejido_c1_id ,
  PV_Tejido_c1_text ,
  PV_Tejido_c2_id ,
  PV_Tejido_c2_text ,
  PV_SEL_2 ,
  PV_Ancho_2 ,
  PV_Cantidad_2 ,
  PV_AlturaMin_2 ,
  PV_AlturaMax_2 ,
  PV_AnchoLama_2 ,
  PV_PosicionMecanismo_2 ,
  PV_ColorRiel_2 ,
  PV_Accionamiento_2 ,
  PV_TipoSoporte_2 ,
  PV_TipoRecogida_2 ,
  instrucciones,strFechaEntrega,
  T3_Cantidad,	
	 T3_Tejido,	
	 T3_Tejido_C1,	
	 T3_TejidosCombinados,	
	 T3_TejidosCombinados_C1,	
	 T3_TipoSoporte,
 	 T3_NumSoportes,
	 T3_TipoSoporte_C1,	
	 T3_PVP,	
	 T3_PVP_C1,	
	 T3_Fecha_Entrega,	
	 T3_Transporte,	
	 T32_Cantidad,	
	 T32_Tejido,	
	 T32_Tejido_C1,	
	 T32_TejidosCombinados,
	 impresion_1,
	 impresion_imagen_1,
	 impresion_2,
	 impresion_imagen_2,
	 Estancia_Id,
	 Estancia
	 	
)
  values(
  @id ,
  @PV_SEL_1 ,
  @PV_Ancho_1 ,
  @PV_Alto_1 ,
  @PV_Cantidad_1 ,
  @PV_AnchoLama_1 ,
  @PV_PosicionMecanismo_1 ,
  @PV_ColorRiel_1 ,
  @PV_Accionamiento_1 ,
  @PV_TipoSoporte_1 ,
  @PV_TipoRecogida_1 ,
  @PV_Tejido_id ,
  @PV_Tejido_text ,
  @PV_Tejido_c1_id ,
  @PV_Tejido_c1_text ,
  @PV_Tejido_c2_id ,
  @PV_Tejido_c2_text ,
  @PV_SEL_2 ,
  @PV_Ancho_2 ,
  @PV_Cantidad_2 ,
  @PV_AlturaMin_2 ,
  @PV_AlturaMax_2 ,
  @PV_AnchoLama_2 ,
  @PV_PosicionMecanismo_2 ,
  @PV_ColorRiel_2 ,
  @PV_Accionamiento_2 ,
  @PV_TipoSoporte_2 ,
  @PV_TipoRecogida_2 ,
  @instrucciones,@strFechaEntrega,
  @T3_Cantidad,	
	 @T3_Tejido,	
	 @T3_Tejido_C1,	
	 @T3_TejidosCombinados,	
	 @T3_TejidosCombinados_C1,	
	 @T3_TipoSoporte,
 	 @T3_NumSoportes,	
	 @T3_TipoSoporte_C1,	
	 @T3_PVP,	
	 @T3_PVP_C1,	
	 @T3_Fecha_Entrega,	
	 @T3_Transporte,	
	 @T32_Cantidad,	
	 @T32_Tejido,	
	 @T32_Tejido_C1,	
	 @T32_TejidosCombinados,
	 @impresion_1,
	 @impresion_imagen_1,
	 @impresion_2,
	 @impresion_imagen_2,
	 @Estancia_ID,
	 @Estancia
	 
)

  end

  return 1

  end
GO

-- ===== sol_temp_pedidos_cola_tipo_4_add
CREATE OR ALTER PROCEDURE [dbo].[sol_temp_pedidos_cola_tipo_4_add]
(
 @id int,
  @idrow int,
  @junquillo varchar(50),
  @ancho int,
  @ancho2 int,
  @alto int,
  @cantidad int,
  @acc_tipo_id varchar(50),
  @acc_tipo_text varchar(250),
  @acc_marca_id varchar(50),
  @acc_marca_text varchar(250),
  @acc_tubo_id varchar(50),
  @acc_tubo_text varchar(250),
  @acc_modelo_id varchar(50),
  @acc_modelo_text varchar(250),
  @acc_posicion_id varchar(50),
  @acc_posicion_text varchar(250),
  @sop_tipo_id varchar(50),
  @sop_tipo_text varchar(250),
  @sop_color_id varchar(50),
  @sop_color_text  varchar(250),
  @tej_tipo_id varchar(50),
  @tej_tipo_text varchar(250),
  @tej_color_id varchar(50),
  @tej_color_text varchar(250),
  @tej_salida_id varchar(50),
  @tej_salida_text varchar(250),
  @con_tipo_id varchar(50),
  @con_tipo_text varchar(250),
  @tap_tipo_id varchar(50),
  @tap_tipo_text varchar(250),
  @tap_color_id varchar(50),
  @tap_color_text varchar(250),
  @cad_altura_id varchar(50),
  @cad_altura_text varchar(250),
  @cad_color_id varchar(50),
  @cad_color_text varchar(250),
  @cad_Altura varchar(50),
  @cad_Tipo varchar(50),
  @con_color_id varchar(50),
  @con_color_text varchar(250),
  @instrucciones varchar(250) = '',
  @centro int = 1,
  @strFechaEntrega varchar(10) = '',
@T4_Cantidad	int	= 1,
@T4_Tejido	varchar(25) = '',
@T4_Tejido_C1	varchar(25)	= '',
@T4_Coeficiente	varchar(25)	= '',
@T4_PVP	varchar(25)	= '',
@T4_PVP_C1	varchar(25)	= '',
@T4_Fecha_Entrega	varchar(25)	= '',
@T4_Transporte	varchar(25)	= '',
@perfileria varchar(10),
@ral int,
@impresion  int,
	@impresion_imagen  varchar(250),
	@Estancia_ID int,
	 @Estancia varchar(250)
)
as
begin

	  declare @line int
	  declare @articulo int
	
	  set @line = 40
	  set @articulo = 4

	  UPDATE [dbo].[TEMP_SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow
	  

	  insert into  [DBO].[TEMP_SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,4)
	  set @id = scope_identity()

	  if @id > 0
	  begin


insert into  [DBO].[TEMP_SOL_PEDIDOS_COLA_TIPO_4](
  idrow,
  junquillo,
  ancho ,
  ancho2 ,
  alto ,
  cantidad ,
  acc_tipo_id ,
  acc_tipo_text ,
  acc_marca_id ,
  acc_marca_text ,
  acc_tubo_id ,
  acc_tubo_text ,
  acc_modelo_id ,
  acc_modelo_text ,
  acc_posicion_id ,
  acc_posicion_text ,
  sop_tipo_id ,
  sop_tipo_text ,
  sop_color_id ,
  sop_color_text  ,
  tej_tipo_id ,
  tej_tipo_text ,
  tej_color_id ,
  tej_color_text ,
  tej_salida_id ,
  tej_salida_text ,
  con_tipo_id ,
  con_tipo_text ,
  tap_tipo_id ,
  tap_tipo_text ,
  tap_color_id ,
  tap_color_text ,
  cad_altura_id ,
  cad_altura_text ,
  cad_color_id ,
  cad_color_text ,
  cad_Altura ,
  cad_Tipo ,
  con_color_id ,
  con_color_text ,
instrucciones, strFechaEntrega,
T4_Cantidad,
T4_Tejido,
T4_Tejido_C1,
T4_Coeficiente,
T4_PVP,
T4_PVP_C1,
T4_Fecha_Entrega,
T4_Transporte,perfileria,ral,impresion,
	 impresion_imagen, Estancia_ID, Estancia )
VALUES(
  @id,
  @junquillo,
  @ancho,
  @ancho2,
  @alto,
  @cantidad,
  @acc_tipo_id,
  @acc_tipo_text,
  @acc_marca_id,
  @acc_marca_text,
  @acc_tubo_id,
  @acc_tubo_text,
  @acc_modelo_id,
  @acc_modelo_text,
  @acc_posicion_id,
  @acc_posicion_text,
  @sop_tipo_id,
  @sop_tipo_text,
  @sop_color_id,
  @sop_color_text,
  @tej_tipo_id,
  @tej_tipo_text,
  @tej_color_id,
  @tej_color_text,
  @tej_salida_id,
  @tej_salida_text,
  @con_tipo_id,
  @con_tipo_text,
  @tap_tipo_id,
  @tap_tipo_text,
  @tap_color_id,
  @tap_color_text,
  @cad_altura_id,
  @cad_altura_text,
  @cad_color_id,
  @cad_color_text,
  @cad_Altura,
  @cad_Tipo,
  @con_color_id,
  @con_color_text,
  @instrucciones,@strFechaEntrega,
  @T4_Cantidad,
  @T4_Tejido,
  @T4_Tejido_C1,
  @T4_Coeficiente,
  @T4_PVP,
  @T4_PVP_C1, 
  @T4_Fecha_Entrega,
  @T4_Transporte,@perfileria, @ral,@impresion,
	 @impresion_imagen, @Estancia_ID, @Estancia)

  end

return 1
end
GO

-- ===== sol_pedidos_cola_tipo_4_add
CREATE OR ALTER PROCEDURE [dbo].[sol_pedidos_cola_tipo_4_add]
(
  @id int,
  @idrow int,
  @junquillo varchar(50),
  @ancho int,
  @ancho2 int,
  @alto int,
  @cantidad int,
  @acc_tipo_id varchar(50),
  @acc_tipo_text varchar(250),
  @acc_marca_id varchar(50),
  @acc_marca_text varchar(250),
  @acc_tubo_id varchar(50),
  @acc_tubo_text varchar(250),
  @acc_modelo_id varchar(50),
  @acc_modelo_text varchar(250),
  @acc_posicion_id varchar(50),
  @acc_posicion_text varchar(250),
  @sop_tipo_id varchar(50),
  @sop_tipo_text varchar(250),
  @sop_color_id varchar(50),
  @sop_color_text  varchar(250),
  @tej_tipo_id varchar(50),
  @tej_tipo_text varchar(250),
  @tej_color_id varchar(50),
  @tej_color_text varchar(250),
  @tej_salida_id varchar(50),
  @tej_salida_text varchar(250),
  @con_tipo_id varchar(50),
  @con_tipo_text varchar(250),
  @tap_tipo_id varchar(50),
  @tap_tipo_text varchar(250),
  @tap_color_id varchar(50),
  @tap_color_text varchar(250),
  @cad_altura_id varchar(50),
  @cad_altura_text varchar(250),
  @cad_color_id varchar(50),
  @cad_color_text varchar(250),
  @cad_Altura varchar(50),
  @cad_Tipo varchar(50),
  @con_color_id varchar(50),
  @con_color_text varchar(250),
  @instrucciones varchar(250),
   @centro int = 1,
    @strFechaEntrega varchar(10),
	@T4_Cantidad	int	= 1,
@T4_Tejido	varchar(25) = '',
@T4_Tejido_C1	varchar(25)	= '',
@T4_Coeficiente	varchar(25)	= '',
@T4_PVP	varchar(25)	= '',
@T4_PVP_C1	varchar(25)	= '',
@T4_Fecha_Entrega	varchar(25)	= '',
@T4_Transporte	varchar(25)	= '',
@perfileria varchar(10),
@impresion  int,
	@impresion_imagen  varchar(250),
	@Estancia_ID int,
	 @Estancia varchar(250)

)
as
begin

	  declare @line int
	  declare @articulo int
	
	  set @line = 40
	  set @articulo = 4

	  UPDATE [dbo].[SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow
	  

	  insert into  [DBO].[SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,4)
	  set @id = scope_identity()

	  if @id > 0
	  begin


insert into  [DBO].[SOL_PEDIDOS_COLA_TIPO_4](
  idrow,
  junquillo,
  ancho ,
  ancho2 ,
  alto ,
  cantidad ,
  acc_tipo_id ,
  acc_tipo_text ,
  acc_marca_id ,
  acc_marca_text ,
  acc_tubo_id ,
  acc_tubo_text ,
  acc_modelo_id ,
  acc_modelo_text ,
  acc_posicion_id ,
  acc_posicion_text ,
  sop_tipo_id ,
  sop_tipo_text ,
  sop_color_id ,
  sop_color_text  ,
  tej_tipo_id ,
  tej_tipo_text ,
  tej_color_id ,
  tej_color_text ,
  tej_salida_id ,
  tej_salida_text ,
  con_tipo_id ,
  con_tipo_text ,
  tap_tipo_id ,
  tap_tipo_text ,
  tap_color_id ,
  tap_color_text ,
  cad_altura_id ,
  cad_altura_text ,
  cad_color_id ,
  cad_color_text ,
  cad_Altura ,
  cad_Tipo ,
  con_color_id ,
  con_color_text ,
instrucciones, strFechaEntrega,
T4_Cantidad,
T4_Tejido,
T4_Tejido_C1,
T4_Coeficiente,
T4_PVP,
T4_PVP_C1,
T4_Fecha_Entrega,
T4_Transporte,perfileria,impresion,
	 impresion_imagen,
	 Estancia_ID,
	 Estancia
)
VALUES(
  @id,
  @junquillo,
  @ancho,
  @ancho2,
  @alto,
  @cantidad,
  @acc_tipo_id,
  @acc_tipo_text,
  @acc_marca_id,
  @acc_marca_text,
  @acc_tubo_id,
  @acc_tubo_text,
  @acc_modelo_id,
  @acc_modelo_text,
  @acc_posicion_id,
  @acc_posicion_text,
  @sop_tipo_id,
  @sop_tipo_text,
  @sop_color_id,
  @sop_color_text,
  @tej_tipo_id,
  @tej_tipo_text,
  @tej_color_id,
  @tej_color_text,
  @tej_salida_id,
  @tej_salida_text,
  @con_tipo_id,
  @con_tipo_text,
  @tap_tipo_id,
  @tap_tipo_text,
  @tap_color_id,
  @tap_color_text,
  @cad_altura_id,
  @cad_altura_text,
  @cad_color_id,
  @cad_color_text,
  @cad_Altura,
  @cad_Tipo,
  @con_color_id,
  @con_color_text,
  @instrucciones,@strFechaEntrega,
  @T4_Cantidad,
  @T4_Tejido,
  @T4_Tejido_C1,
  @T4_Coeficiente,
  @T4_PVP,
  @T4_PVP_C1, 
  @T4_Fecha_Entrega,
  @T4_Transporte,@perfileria,@impresion,
	 @impresion_imagen,
	 @Estancia_ID,
	 @Estancia
  )

  end

return 1
end
GO

-- ===== sol_presupuestos_cola_tipo_4_add
CREATE OR ALTER PROCEDURE [dbo].[sol_presupuestos_cola_tipo_4_add]
(
  @id int,
  @idrow int,
  @junquillo varchar(50),
  @ancho int,
  @ancho2 int,
  @alto int,
  @cantidad int,
  @acc_tipo_id varchar(50),
  @acc_tipo_text varchar(250),
  @acc_marca_id varchar(50),
  @acc_marca_text varchar(250),
  @acc_tubo_id varchar(50),
  @acc_tubo_text varchar(250),
  @acc_modelo_id varchar(50),
  @acc_modelo_text varchar(250),
  @acc_posicion_id varchar(50),
  @acc_posicion_text varchar(250),
  @sop_tipo_id varchar(50),
  @sop_tipo_text varchar(250),
  @sop_color_id varchar(50),
  @sop_color_text  varchar(250),
  @tej_tipo_id varchar(50),
  @tej_tipo_text varchar(250),
  @tej_color_id varchar(50),
  @tej_color_text varchar(250),
  @tej_salida_id varchar(50),
  @tej_salida_text varchar(250),
  @con_tipo_id varchar(50),
  @con_tipo_text varchar(250),
  @tap_tipo_id varchar(50),
  @tap_tipo_text varchar(250),
  @tap_color_id varchar(50),
  @tap_color_text varchar(250),
  @cad_altura_id varchar(50),
  @cad_altura_text varchar(250),
  @cad_color_id varchar(50),
  @cad_color_text varchar(250),
  @cad_Altura varchar(50),
  @cad_Tipo varchar(50),
  @con_color_id varchar(50),
  @con_color_text varchar(250),
  @instrucciones varchar(250),
   @centro int = 1,
    @strFechaEntrega varchar(10),
	@T4_Cantidad	int	= 1,
@T4_Tejido	varchar(25) = '',
@T4_Tejido_C1	varchar(25)	= '',
@T4_Coeficiente	varchar(25)	= '',
@T4_PVP	varchar(25)	= '',
@T4_PVP_C1	varchar(25)	= '',
@T4_Fecha_Entrega	varchar(25)	= '',
@T4_Transporte	varchar(25)	= '',
@impresion  int,
	@impresion_imagen  varchar(250),
	@Estancia_ID int,
	 @Estancia varchar(250)


)
as
begin

	  declare @line int
	  declare @articulo int
	  declare @descripcion varchar(255)
	
	  set @line = 40
	  set @articulo = 4
	  set @descripcion = 'Compac ' + cast(@cantidad as varchar) + 'x' + cast(@ancho as varchar) + 'x' + cast(@alto as varchar)

	  UPDATE [dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow


	  insert into SOL_PRESUPUESTOS_COLA_LINEAS(idrow,line,articulo,ancho,alto,cantidad,tipo,lista)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,4,@line)
	  set @id = scope_identity()

	  if @id > 0
	  begin


insert into SOL_PRESUPUESTOS_COLA_TIPO_4(
  idrow,
  junquillo,
  ancho ,
  ancho2 ,
  alto ,
  cantidad ,
  acc_tipo_id ,
  acc_tipo_text ,
  acc_marca_id ,
  acc_marca_text ,
  acc_tubo_id ,
  acc_tubo_text ,
  acc_modelo_id ,
  acc_modelo_text ,
  acc_posicion_id ,
  acc_posicion_text ,
  sop_tipo_id ,
  sop_tipo_text ,
  sop_color_id ,
  sop_color_text  ,
  tej_tipo_id ,
  tej_tipo_text ,
  tej_color_id ,
  tej_color_text ,
  tej_salida_id ,
  tej_salida_text ,
  con_tipo_id ,
  con_tipo_text ,
  tap_tipo_id ,
  tap_tipo_text ,
  tap_color_id ,
  tap_color_text ,
  cad_altura_id ,
  cad_altura_text ,
  cad_color_id ,
  cad_color_text ,
  cad_Altura ,
  cad_Tipo ,
  con_color_id ,
  con_color_text ,
instrucciones, strFechaEntrega,
T4_Cantidad,
T4_Tejido,
T4_Tejido_C1,
T4_Coeficiente,
T4_PVP,
T4_PVP_C1,
T4_Fecha_Entrega,
T4_Transporte,impresion,
	 impresion_imagen,
	 Estancia_ID,
	 EStancia
)
VALUES(
  @id,
  @junquillo,
  @ancho,
  @ancho2,
  @alto,
  @cantidad,
  @acc_tipo_id,
  @acc_tipo_text,
  @acc_marca_id,
  @acc_marca_text,
  @acc_tubo_id,
  @acc_tubo_text,
  @acc_modelo_id,
  @acc_modelo_text,
  @acc_posicion_id,
  @acc_posicion_text,
  @sop_tipo_id,
  @sop_tipo_text,
  @sop_color_id,
  @sop_color_text,
  @tej_tipo_id,
  @tej_tipo_text,
  @tej_color_id,
  @tej_color_text,
  @tej_salida_id,
  @tej_salida_text,
  @con_tipo_id,
  @con_tipo_text,
  @tap_tipo_id,
  @tap_tipo_text,
  @tap_color_id,
  @tap_color_text,
  @cad_altura_id,
  @cad_altura_text,
  @cad_color_id,
  @cad_color_text,
  @cad_Altura,
  @cad_Tipo,
  @con_color_id,
  @con_color_text,
  @instrucciones,@strFechaEntrega,
  @T4_Cantidad,
  @T4_Tejido,
  @T4_Tejido_C1,
  @T4_Coeficiente,
  @T4_PVP,
  @T4_PVP_C1, 
  @T4_Fecha_Entrega,
  @T4_Transporte,@impresion,
	 @impresion_imagen,
	 @Estancia_ID,
	 @Estancia
  )

  end

return 1
end
GO

-- ===== temp_sp_fabricacion_tipo_2_tarifa

	CREATE OR ALTER PROCEDURE [dbo].[temp_sp_fabricacion_tipo_2_tarifa]
(
 @idrow int,
 @iancho decimal(12,2),
 @ialto decimal(12,2),
 @cantidad int,
 @preciomontaje decimal(12,4) = 0.21,
 @criterio int				  = 180,
 @margen decimal(12,4)		  = 2.22,
 @preciom2 decimal(12,4)	  = 3.31,
 @densidad decimal(12,3)	  = 0.330,
 @desmult int				  = 0,
 @v1 decimal(12,2) output,
 @v2 varchar(255) output
)
as
begin



 declare @c00 decimal(12,2)
 declare @c01 decimal(12,2)
 declare @c02 decimal(12,2)
 declare @unitarios decimal(12,4)
 declare @verticales decimal(12,4)
 declare @metrolineal decimal(12,4)
 declare @alto decimal(12,4)
 declare @alto2 decimal(12,4)
 declare @cliente int
 declare @impresion int 
 declare @lamas int 

 set @cliente = (select cliente from temp_sol_pedidos_cola where idrow = (select idrow from temp_sol_pedidos_cola_lineas where id = (select idrow from temp_sol_pedidos_cola_tipo_2 where id = @idrow)))
 SELECT @lamas = PJ_NumeroLamas,@impresion = impresion FROM [dbo].[temp_sol_pedidos_cola_tipo_2] WHERE id = @idrow

 
 select @unitarios = ISNULL(sum(cantidad*precio2),0) from temp_sol_pedidos_cola_tipo_3_fabricacion where idrow=@idrow and unidad in (1,4,5) and articulo in (select idrow from articulos where isnull(vertical,0)=0)
 select @verticales = ISNULL(sum(cantidad*precio2),0) from temp_sol_pedidos_cola_tipo_3_fabricacion where idrow=@idrow and articulo in (select idrow from articulos where isnull(vertical,0)=1)
 
 set @v1 = -1
 set @v2 = ''

 
 if @cliente <> 1 AND @cliente <> 5
 begin
 declare @tipo int
 declare @marca int
  declare @tejido int
  declare @tarifa int

  declare @margen2 decimal(12,4) = 1
 

 declare @monetarios decimal(12,4)
 
 declare @tipoproducto int
 declare @grupo int

  declare @sp_sistema nvarchar(50)
  declare @sp_modelo  nvarchar(50) 
  declare @sp_accionamiento  nvarchar(50) 
  declare @sp_tejido  nvarchar(50) 
  declare @sp_grupo  nvarchar(50) 
  declare @sp_tarifa  nvarchar(3) 
  declare @p1  decimal(5, 2) 
  declare @p2  decimal(5 ,2) 

  declare @sincronizado bit
 
 select    @tejido = PJ_Tejidos_id from temp_sol_pedidos_cola_tipo_2 where id =@idrow

 set @grupo = (select idrow from sol_articulos_tejidos_grupos where CHARINDEX(',' + cast(@tejido as nvarchar) ,nexos) > 0)

 if @grupo is null 
 begin
 if (select count(*) from sol_articulos_tejidos_grupos where CHARINDEX(cast(@tejido as nvarchar) ,nexos) > 0) = 1 set @grupo = (select idrow from sol_articulos_tejidos_grupos where CHARINDEX(cast(@tejido as nvarchar) ,nexos) > 0)
 if (select count(*) from sol_articulos_tejidos_grupos where CHARINDEX(cast(@tejido as nvarchar) ,nexos) > 0) > 1 set @grupo = (select idrow from sol_articulos_tejidos_grupos where substring(nexos,1,len(@tejido)) = @tejido )
 end

 if @grupo is null set @grupo = 0

 select top 1 @tarifa = idrow,  @sincronizado = op_synchronized from SOL_TARIFAS_SIMULATE where tipoproducto = 1  and tejido = -1 and sp_tarifa = 'T14' and grupo = @grupo
 AND sp_sistema = '2C27774C-ED24-478A-95D0-057F52B034C8'
 if @tarifa is null set @tarifa = 0

 if @tarifa > 0
 begin

 if @sincronizado = 0
 begin

	set @v1 = 10
	set @v2 = 20
end

if @sincronizado = 1 
	 begin

	  select @sp_sistema = ISNULL(sp_sistema,''),
			 @sp_modelo = ISNULL(sp_modelo,''),	
			 @sp_accionamiento = ISNULL(sp_accionamiento,''),
			 @sp_tejido = ISNULL(sp_tejido,''),
			 @sp_grupo = ISNULL(sp_grupo,''),
			 @sp_tarifa = ISNULL(sp_tarifa,'')
			 
	  from SOL_TARIFAS_SIMULATE where idrow=@tarifa


	   set @c02 = (SELECT [dbo].[solarmnes_pvp_t1yt2] (
				   @sp_sistema
				  ,@sp_modelo
				  ,@sp_accionamiento
				  ,@sp_tejido
				  ,@sp_grupo
				  ,@sp_tarifa
				  ,@iancho/100
				  ,@ialto))

				  if @c02 = -99
	begin
	 set @v1 = -99
	 set @v2 = 'No hay tarifa'

	 
	end

	end

	if @c02 <> -99
	begin
	if @impresion = 1 set @c02 = @c02 + 32.34
	
	set @v1 = @c02
	set @v2 = cast(@cantidad*@c02 as varchar)
	end

	end
	
	
	if @tarifa = 0
	begin
	 set @v1 = -99
	 set @v2 = 'No hay tarifa'
	
	end
	end

	if @cliente = 1 OR @cliente = 5
	begin
	
	declare @tubos int 
	declare @tejidos int
	declare @marcas int 
	declare @Ancho decimal(12,2)
	
	
	declare @ancholama int
	declare @producto int
	declare @centro int
	
	declare @subproducto int 
	declare @vias int = -1
	declare @modelo int = -1
	declare @cajonmodelo int = -1
	declare @cajonlacado int = -1
	declare @guiamodelo int = -1
	declare @guialacado int = -1
	declare @color int = -1
	

	declare @v3 decimal(12,2)

	
	
	

	SELECT @tejidos = [PJ_Tejidos_id]     
      ,@color =   [pj_tejidosC_id]    
      ,@vias = PJ_NumeroVias_2
	  ,@cantidad = PJ_Cantidad_1
	  , @alto = (case when PJ_NumeroVias_2 = - 1 then PJ_AltoLamaTerminada else  PJ_Alto_1 end),@Ancho = PJ_Ancho_2,@ancholama = PJ_AnchoLama
	  ,@lamas = PJ_NumeroLamas,@impresion = impresion

  FROM [dbo].[temp_sol_pedidos_cola_tipo_2] WHERE id = @idrow

  set @tubos = -1
 set @marcas = -1
 
  
  set @subproducto = 1
  set @producto = 2
  ---PARA SOLO TEJIDO
  IF @lamas = 1 SET @lamas = 2

  ---
  if @vias = -1 set @vias = @lamas
 
 set @v2 = ''

	EXECUTE  [dbo].[sp_tarifas_calculate_prices3_AT] 
   @cliente
  ,@tubos
  ,@tejidos
  ,@marcas
  ,@Ancho
  ,@Alto
  ,@impresion
  ,@ancholama
  ,@producto
  ,@centro
  ,@cantidad
  ,@subproducto
  ,@vias
  ,@modelo
  ,@cajonmodelo
  ,@cajonlacado
  ,@guiamodelo
  ,@guialacado
  ,@color
  ,@v1 OUTPUT
  ,@v2 OUTPUT
  ,@v3 OUTPUT

  --select 'AQUI DEVUELVE EL C2 DE AT:' + @v2
 
 
			--set  @v2 = [dbo].[C1_Multiply](@v2,@cantidad * @vias)
		

	set @v1 = (SELECT	@v1) 
	set @v2 = (SELECT	@v2)
	end

	
	return 1

	end
GO

-- ===== sp_tarifas_calculate_prices3_AT
CREATE OR ALTER PROCEDURE [dbo].[sp_tarifas_calculate_prices3_AT]
(
	@clientes int,
	@tubos int,
	@tejidos int,
	@marcas int,
	@Ancho decimal(12,2),
	@Alto decimal(12,2),
	@impresion int,
	@ancholama int,
	@producto int,
	@centro int,
	@cantidad int,
	@subproducto int, 
	@vias int = -1,
	@modelo int = -1,
	@cajonmodelo int = -1,
	@cajonlacado int = -1,
	@guiamodelo int = -1,
	@guialacado int = -1,
	@color int = -1,
	@v1 decimal(12,2) output,
	@v2 varchar(255) output,
	@v3 decimal(12,2) output
)
as
begin
	declare @AnchoMaximo decimal(12,2)
	set @AnchoMaximo = 0
	
	set nocount on 

	declare @desglose table(label varchar(255),precio decimal(12,2), c1 varchar(15))

	set @Ancho = @Ancho / 100
	set @Alto = @Alto / 100

declare @x int
declare @y int
declare @idrow int = 0
declare @message varchar(500)
declare @iImpresion int
declare @existe int
declare @fecha datetime
declare @coefpvp decimal(12,2)
declare @modpvp  int
declare @coefc1  decimal(12,2)
declare @modpvc  int

declare @v1_e decimal(12,2)
declare @v2_e varchar(25)

declare @guiapvp decimal(12,2)
declare @guiac1 varchar(25)

declare @motorpvp decimal(12,2)
declare @motorc1 varchar(25)

declare @lacadopvp decimal(12,2)
declare @lacadoc1 varchar(25)



set @v1 = 0
set @v2 = ''

if @producto = 1 /* ENROLLABLE */
begin

if @marcas = 55 select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes  and tejidos=@tejidos and marcas=55 and impresion = @impresion and producto=@producto		
if @marcas <> 55 select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes  and tejidos=@tejidos and marcas=1 and impresion = @impresion and producto=@producto
		
		

end

if @producto = 2 /* JAPONES */
begin
declare @maxancho int
	 select @maxancho=max(ancho)
	from SOL_ARTICULOS_MECANISMO_JAPONES_TARIFAS where vias=@vias and cliente=@clientes 

	if @Ancho * 100 <= @maxancho
	begin

		select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and 
	impresion = @impresion and producto=@producto
	end

end

if @producto = 3 /* VERTICAL */
begin
select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and impresion = @impresion 
	and producto=@producto and ancholama=@ancholama and tipos = @marcas
end

if @producto = 4 /* COMPAC */
begin
	select @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and impresion = @impresion 
	and producto=@producto 
end


if @producto = 6 /* PANEL ZIP */
begin
	select top 1 @idrow=isnull(idrow,0) from sol_articulos_tarifas where clientes = @clientes and tejidos=@tejidos and 
	impresion = @impresion and producto=@producto 
	--and cajon=@cajonmodelo and lacado=@cajonlacado
end



if @idrow > 0
begin

	select @AnchoMaximo = 100.0*replace(max(rx),',','.') from SOL_ARTICULOS_TARIFAS_LINEAS where idrow=@idrow and y=1 and len(isnull(v1,''))>0 group by idrow

	if @producto = 2
	begin
	 set @ancho = @ancholama
	 set @Ancho = @Ancho / 100
	end


	declare @tx int
	declare @ty int

	set @ty = (select count(*) from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Ancho and y=0)
	set @tx = (select count(*) from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Alto and x=0 )

	if @tx = 0 or @ty = 0
	begin
	 set @v1 = -99
	 set @v2 = 'C1 0000000'

	 insert into @desglose(label, precio,c1) values('Tejido',@v1,@v2)
	end


	if @tx <> 0 and @ty <> 0
	begin

	--select 'ANCHO:' + cast(@Ancho as varchar)
	--select 'ALTO:' + cast(@Alto as varchar)
	--select 'IDROW:' + cast(@idrow as varchar)

	select top 1 @x=x from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Ancho and y=0 order by y
	select top 1 @y=y from sol_articulos_tarifas_lineas where idrow=@idrow and isnumeric(v1)=1 and v1>=@Alto and x=0 order by x
	
	select @v1=replace(v1,',','.'),@v2=v2 from sol_articulos_tarifas_lineas 
	where idrow=@idrow and isnumeric(v1)=1 and x=@x and y=@y
	
	--select 'PVP:' + cast(@v1 as varchar)

	if @producto = 1 or @producto = 2 or @producto = 3 or @producto = 4 or @producto = 6
	begin

		if @producto = 1
		begin
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
			select 'HIER 1 C1:' + cast(@v2 as varchar)
		end

	
		if @producto = 2 
		begin
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@vias)
			select 'HIER 2 C1:' + cast(@v2 as varchar)
		end

		if @producto = 3 
		begin
			
			if @subproducto = 2
			begin
				set @v1 = 1.5*@v1
				SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
				SELECT  @v2 = [dbo].[C1_Multiply](@v2,1.5)
			end
			else
			begin
				SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
				select 'HIER 3 C1:' + cast(@v2 as varchar)
			end

			
		end
		

		if @producto = 4
		begin
			SELECT  @v2 = [dbo].[C1_Multiply](@v2,@cantidad)
			select 'HIER 4 C1:' + cast(@v2 as varchar)
		end

		if @producto = 6
		begin
			insert into @desglose(label, precio,c1) values('Tejido',@v1,@v2)
		end

		

		
		/*
		if @producto = 2
		begin
			if @subproducto = 1 or @subproducto = 3
			begin
				set @v1_e = 0
				set @v2_e = ''
				set @Ancho = @Ancho * 100
				execute sp_panel_japones_valora @vias,@clientes,@Ancho, @cantidad, @v1_e out, @v2_e out

				set @v1 = @v1  + @v1_e
				set @v2 = dbo.C1_Sum(@v2,@v2_e)
			end
		end
		*/

		/*
		if @producto = 6 and @guiamodelo > 0 and @guialacado >= 0
		begin

				set @guiapvp = 0
				set @guiac1 = 'C1 0000000'
				select top 1 @guiapvp = pvp, @guiac1=c1 from SOL_ARTICULOS_INCREMENTOS where cliente=@clientes and tipo=1 and value=@guiamodelo and 
				bruto=@guialacado and altura >= @Alto*100

				print @guiapvp

				set @v1 += @guiapvp 
				set @v2 = [dbo].[C1_Sum](@v2,@guiac1)
		end
		*/

		

	    if @producto = 6 and @marcas > 0 and @modelo > 0 or  @producto = 1 and @marcas > 0 and @modelo > 0
		begin
		
			print 'in v1=' + cast(@v1 as varchar)
			print 'in v2=' + @v2
			print 'marca:' + cast(@marcas as varchar)
			print 'modelo:' + cast(@modelo as varchar)
			print 'color:' + cast(@color as varchar)

			--- incrementos de lacados para cajon zip
			if @producto = 6 and @cajonlacado <> -1 
		begin
		declare @basico bit
		declare @factor decimal(5,2)

			SELECT top 1  @lacadopvp=PVP, @lacadoc1=C1, @basico = Basico, @factor= factor FROM SOL_ARTICULOS_INCREMENTOS_LACADOS WHERE id=@cajonlacado

			if @basico = 1 
			begin
			if @lacadopvp is null
			begin
			set	@lacadopvp = 0
			set	@lacadoc1 = 'C1 0000000'
			end
			end

			if @basico = 0
			begin
			set @lacadopvp = @v1*@factor
			set @lacadoc1 = [dbo].[C1_Multiply](@v2,@factor)
			end


			print 'lacadopvp:' + cast(@lacadopvp as varchar)
			print 'lacadoc1:' + @lacadoc1

			set @v1 += @lacadopvp 
			set @v2 = [dbo].[C1_Sum](@v2,@lacadoc1)
					

			end
			---incremento de motor
			SELECT top 1  @motorpvp=PVP, @motorc1=C1 FROM SOL_ARTICULOS_INCREMENTOS_GENERICOS WHERE PRODUCTO=@producto AND MARCA=@marcas AND MODELO=@modelo and cliente = @clientes

			if @motorpvp is null
			begin
			set	@motorpvp = 0
			set	@motorc1 = 'C1 0000000'
			end

			print 'motorpvp:' + cast(@motorpvp as varchar)
			print 'motorc1:' + @motorc1

			set @v1 += @motorpvp 
			set @v2 = [dbo].[C1_Sum](@v2,@motorc1)
			
			print 'out v1=' + cast(@v1 as varchar)
			print 'out v2=' + @v2

			insert into @desglose(label, precio,c1) values('Accionamiento',@motorpvp,@motorc1)
		
			if @color > 0
			begin
				insert into @desglose(label, precio,c1)
				select top 1 descripcion,precio,c1 from SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE where modelo=@color
			end


			insert into @desglose(label, precio,c1) values('Total',@v1,@v2)
		end

		--- incrementos de lacados para compac
		
		if @producto = 4 and @cajonlacado > 0
		begin
		

			SELECT top 1  @lacadopvp=PVP, @lacadoc1=C1, @basico = Basico, @factor= factor FROM SOL_ARTICULOS_INCREMENTOS_LACADOS WHERE id=@cajonlacado

			if @basico = 1 
			begin
				if @lacadopvp is null
				begin
					set	@lacadopvp = 0
					set	@lacadoc1 = 'C1 0000000'
				end
			end

			if @basico = 0
			begin
			set @lacadopvp = @v1*@factor
			set @lacadoc1 = [dbo].[C1_Multiply](@v2,@factor)
			end


			select 'lacadopvp:' + cast(@lacadopvp as varchar)
			select 'lacadoc1:' + @lacadoc1

			set @v1 += @lacadopvp 
			set @v2 = [dbo].[C1_Sum](@v2,@lacadoc1)
					

			select 'FINAL:' + cast(@v2 as varchar)

			end
			end

	


	/*Test ob es eina Promotion gibt */
	set @fecha = getdate()
	select @existe = count(*) from vw_nh_clientes_promociones where idcliente=@clientes and idrow=@centro and @fecha>=desde and @fecha<=hasta and promocion_activa=1
	if @existe > 0 and @tx <> 0 and @ty <> 0
	begin

	select @coefpvp = promocion_coeficiente,
		   @modpvp  = promocion_modificapvp,
		   @coefc1  = promocion_coeficiente2,
	       @modpvc  = promocion_modificapvc from vw_nh_clientes_promociones where idcliente=@clientes and idrow=@centro and @fecha>=desde and @fecha<=hasta and promocion_activa=1

		   if @modpvp = 1
		   begin
			 set @v1 = @v1*(1-0.01*@coefpvp)
		   end 

		   if @modpvc = 1
		   begin
			 set @v2 = dbo.C1_Modif(@v2,@coefc1)
		   end 


	end


end
end

set @message = 'C='+cast(@clientes as varchar) + ',Tu='+cast(@tubos as varchar) + ',Te=' + cast(@tejidos as varchar) + ',Ma='+cast(@marcas as varchar)
set @message +='An=' + cast(@ancho as varchar) + ',Al=' + cast(@alto as varchar) + ',Imp=' + cast(@impresion as varchar)
set @message +=',IDROW='+cast(@idrow as varchar) + ',V1='+cast(@v1 as varchar) + ',V2=' + @v2 
insert into messages(mensaje) values(@message)


update SOL_ARTICULOS_TARIFAS_CLIENTES set 
promocion_activa = 0
where promocion_activa=1 and hasta<getdate()

--select 'HIER=' + cast(@v2 as varchar)

set @v3 = @AnchoMaximo

select * from @desglose


return 1

end
GO

-- ===== sol_pedidos_cola_tipo_6_add
CREATE OR ALTER PROCEDURE [dbo].[sol_pedidos_cola_tipo_6_add]
(
  @id int,
  @idrow int,
  @ancho int,
  @alto int,
  @cantidad int,
  @acc_tipo_id varchar(50),
  @acc_tipo_text varchar(250),
  @acc_marca_id varchar(50),
  @acc_marca_text varchar(250),
  @acc_tubo_id varchar(50),
  @acc_tubo_text varchar(250),
  @acc_modelo_id varchar(50),
  @acc_modelo_text varchar(250),
  @acc_posicion_id varchar(50),
  @acc_posicion_text varchar(250),
  @tej_tipo_id varchar(50),
  @tej_tipo_text varchar(250),
  @tej_color_id varchar(50),
  @tej_color_text varchar(250),
  @tej_salida_id varchar(50),
  @tej_salida_text varchar(250),
  @impresion	int	,
  @impresion_imagen	varchar(250),
  @mando_id	int,
  @mando_text	varchar(250),
  @cajon_modelo	int	,
  @cajon_color	varchar(25)	,
  @cajon_vista	varchar(25),
  @cajon_soporte	varchar(25)	,
  @cajon_lacado	int	,
  @cajon_salida varchar(25),
  @guia_tipo	int	,
  @guia_color	varchar(25),
  @guia_lacado	int,
  @centro int = 1,
  @strFechaEntrega varchar(10),
  @T6_Cantidad	int	= 1,
  @T6_Tejido	varchar(25) = '',
  @T6_Tejido_C1	varchar(25)	= '',
  @T6_Coeficiente	varchar(25)	= '',
  @T6_PVP	varchar(25)	= '',
  @T6_PVP_C1	varchar(25)	= '',
  @T6_Fecha_Entrega	varchar(25)	= '',
  @T6_Transporte	varchar(25)	= ''
  )
  as
  begin


	  declare @line int
	  declare @articulo int
	  declare @FechaEntrega datetime
	
	  set @line = 60
	  set @articulo = 6

	  UPDATE [dbo].[SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow
	  

	  insert into  [DBO].[SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,4)
	  set @id = scope_identity()

	  if @id > 0
	  begin
			set @FechaEntrega = cast(@strFechaEntrega as datetime)
		
			insert into SOL_PEDIDOS_COLA_TIPO_6(idrow,tipo,ancho,alto,cantidad,
			acc_tipo_id,acc_tipo_text,acc_marca_id,acc_marca_text,acc_tubo_id,acc_tubo_text,acc_modelo_id,acc_modelo_text,acc_posicion_id,acc_posicion_text,
			tej_tipo_id,tej_tipo_text,tej_color_id,tej_color_text,tej_salida_id,tej_salida_text,impresion,impresion_imagen,mando_id,mando_text,
			strFechaEntrega,FechaEntrega,
			cajon_modelo,cajon_color,cajon_vista,cajon_soporte,cajon_salida,cajon_lacado,guia_tipo,guia_color,guia_lacado,
			T6_Cantidad,T6_Tejido,T6_Tejido_C1,T6_Coeficiente,T6_PVP,T6_PVP_C1,T6_Fecha_Entrega,T6_Transporte)
			values(
			 @idrow,@articulo,@ancho,@alto,@cantidad,
			 @acc_tipo_id,@acc_tipo_text,@acc_marca_id,@acc_marca_text,@acc_tubo_id,@acc_tubo_text,@acc_modelo_id,@acc_modelo_text,@acc_posicion_id,@acc_posicion_text,
			 @tej_tipo_id,@tej_tipo_text,@tej_color_id,@tej_color_text,@tej_salida_id,@tej_salida_text,@impresion,@impresion_imagen,@mando_id,@mando_text,
			 @centro,@strFechaEntrega,
			 @cajon_modelo,@cajon_color,@cajon_vista,@cajon_soporte,@cajon_salida,@cajon_lacado,@guia_tipo,@guia_color,@guia_lacado,
			 @T6_Cantidad,@T6_Tejido,@T6_Tejido_C1,@T6_Coeficiente,@T6_PVP,@T6_PVP_C1,@T6_Fecha_Entrega,@T6_Transporte)
	  end

	  return 1

	end
GO

-- ===== sol_presupuestos_cola_tipo_6_add
CREATE OR ALTER PROCEDURE [dbo].[sol_presupuestos_cola_tipo_6_add]
(
  @id int,
  @idrow int,
  @ancho int,
  @alto int,
  @cantidad int,
  @acc_tipo_id varchar(50),
  @acc_tipo_text varchar(250),
  @acc_marca_id varchar(50),
  @acc_marca_text varchar(250),
  @acc_tubo_id varchar(50),
  @acc_tubo_text varchar(250),
  @acc_modelo_id varchar(50),
  @acc_modelo_text varchar(250),
  @acc_posicion_id varchar(50),
  @acc_posicion_text varchar(250),
  @tej_tipo_id varchar(50),
  @tej_tipo_text varchar(250),
  @tej_color_id varchar(50),
  @tej_color_text varchar(250),
  @tej_salida_id varchar(50),
  @tej_salida_text varchar(250),
  @impresion	int	,
  @impresion_imagen	varchar(250),
  @mando_id	int,
  @mando_text	varchar(250),
  @cajon_modelo	int	,
  @cajon_color	varchar(25)	,
  @cajon_vista	varchar(25),
  @cajon_soporte	varchar(25)	,
  @cajon_lacado	int	,
  @cajon_salida varchar(25),
  @guia_tipo	int	,
  @guia_color	varchar(25),
  @guia_lacado	int,
  @centro int = 1,
  @strFechaEntrega varchar(10),
  @T6_Cantidad	int	= 1,
  @T6_Tejido	varchar(25) = '',
  @T6_Tejido_C1	varchar(25)	= '',
  @T6_Coeficiente	varchar(25)	= '',
  @T6_PVP	varchar(25)	= '',
  @T6_PVP_C1	varchar(25)	= '',
  @T6_Fecha_Entrega	varchar(25)	= '',
  @T6_Transporte	varchar(25)	= ''
  )
  as
  begin


	  declare @line int
	  declare @articulo int
	  declare @FechaEntrega datetime
	
	  set @line = 60
	  set @articulo = 6

	  UPDATE [dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow
	  

	  insert into  [DBO].[SOL_PRESUPUESTOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,6)
	  set @id = scope_identity()

	  if @id > 0
	  begin
			set @FechaEntrega = cast(@strFechaEntrega as datetime)
		
			insert into SOL_PRESUPUESTOS_COLA_TIPO_6(idrow,tipo,ancho,alto,cantidad,
			acc_tipo_id,acc_tipo_text,acc_marca_id,acc_marca_text,acc_tubo_id,acc_tubo_text,acc_modelo_id,acc_modelo_text,acc_posicion_id,acc_posicion_text,
			tej_tipo_id,tej_tipo_text,tej_color_id,tej_color_text,tej_salida_id,tej_salida_text,impresion,impresion_imagen,mando_id,mando_text,
			strFechaEntrega,FechaEntrega,
			cajon_modelo,cajon_color,cajon_vista,cajon_soporte,cajon_salida,cajon_lacado,guia_tipo,guia_color,guia_lacado,
			T6_Cantidad,T6_Tejido,T6_Tejido_C1,T6_Coeficiente,T6_PVP,T6_PVP_C1,T6_Fecha_Entrega,T6_Transporte)
			values(
			 @idrow,@articulo,@ancho,@alto,@cantidad,
			 @acc_tipo_id,@acc_tipo_text,@acc_marca_id,@acc_marca_text,@acc_tubo_id,@acc_tubo_text,@acc_modelo_id,@acc_modelo_text,@acc_posicion_id,@acc_posicion_text,
			 @tej_tipo_id,@tej_tipo_text,@tej_color_id,@tej_color_text,@tej_salida_id,@tej_salida_text,@impresion,@impresion_imagen,@mando_id,@mando_text,
			 @centro,@strFechaEntrega,
			 @cajon_modelo,@cajon_color,@cajon_vista,@cajon_soporte,@cajon_salida,@cajon_lacado,@guia_tipo,@guia_color,@guia_lacado,
			 @T6_Cantidad,@T6_Tejido,@T6_Tejido_C1,@T6_Coeficiente,@T6_PVP,@T6_PVP_C1,@T6_Fecha_Entrega,@T6_Transporte)
	  end

	  return 1

	end
GO

-- ===== sol_pedidos_cola_tipo_7_add

-- =============================================
-- SP: sol_pedidos_cola_tipo_7_add
-- =============================================
CREATE OR ALTER PROCEDURE sol_pedidos_cola_tipo_7_add
    @id                   INT,
    @idrow                INT,
    @ancho                INT,
    @alto                 INT,
    @cantidad             INT,
    @tej_tipo_id          INT,
    @tej_tipo_text        VARCHAR(250),
    @tej_color_id         INT,
    @tej_color_text       VARCHAR(250),
    @color_perfil_id      INT,
    @color_perfil_text    VARCHAR(250),
    @hc_accionamiento_id  INT,
    @hc_accionamiento_text VARCHAR(250),
    @T7_PVP               DECIMAL(12,2),
    @T7_PVP_C1            VARCHAR(25),
    @T7_Fecha_Entrega     VARCHAR(25),
    @T7_Transporte        VARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;

    IF @id = 0
    BEGIN
        -- INSERT
        INSERT INTO SOL_PEDIDOS_COLA_TIPO_7 (
            idrow, ancho, alto, cantidad,
            tej_tipo_id, tej_tipo_text,
            tej_color_id, tej_color_text,
            color_perfil_id, color_perfil_text,
            hc_accionamiento_id, hc_accionamiento_text,
            T7_PVP, T7_PVP_C1, T7_Fecha_Entrega, T7_Transporte
        )
        VALUES (
            @idrow, @ancho, @alto, @cantidad,
            @tej_tipo_id, @tej_tipo_text,
            @tej_color_id, @tej_color_text,
            @color_perfil_id, @color_perfil_text,
            @hc_accionamiento_id, @hc_accionamiento_text,
            @T7_PVP, @T7_PVP_C1, @T7_Fecha_Entrega, @T7_Transporte
        );

        SELECT SCOPE_IDENTITY() AS idrow;
    END
    ELSE
    BEGIN
        -- UPDATE
        UPDATE SOL_PEDIDOS_COLA_TIPO_7 SET
            ancho                 = @ancho,
            alto                  = @alto,
            cantidad              = @cantidad,
            tej_tipo_id           = @tej_tipo_id,
            tej_tipo_text         = @tej_tipo_text,
            tej_color_id          = @tej_color_id,
            tej_color_text        = @tej_color_text,
            color_perfil_id       = @color_perfil_id,
            color_perfil_text     = @color_perfil_text,
            hc_accionamiento_id   = @hc_accionamiento_id,
            hc_accionamiento_text = @hc_accionamiento_text,
            T7_PVP                = @T7_PVP,
            T7_PVP_C1             = @T7_PVP_C1,
            T7_Fecha_Entrega      = @T7_Fecha_Entrega,
            T7_Transporte         = @T7_Transporte
        WHERE id = @id;

        SELECT @id AS id;
    END
END;
GO

