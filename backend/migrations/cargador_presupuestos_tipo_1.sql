-- ─────────────────────────────────────────────────────────────────────────────
-- Cargador en los presupuestos de enrollable (tipo 1)
--   Los pedidos ya guardan el cargador (SOL_PEDIDOS_COLA_TIPO_1.cargador); los
--   presupuestos no, así que se perdía al guardar y al reabrir.
--   Añade cargador / T1_Inc_Cargador / T1_Inc_Cargador_C1 a
--   SOL_PRESUPUESTOS_COLA_TIPO_1 y al SP que la rellena (parámetros con valor
--   por defecto, así las llamadas antiguas siguen funcionando).
-- ─────────────────────────────────────────────────────────────────────────────

IF COL_LENGTH('SOL_PRESUPUESTOS_COLA_TIPO_1', 'cargador') IS NULL
    ALTER TABLE SOL_PRESUPUESTOS_COLA_TIPO_1 ADD cargador INT NULL;
GO
IF COL_LENGTH('SOL_PRESUPUESTOS_COLA_TIPO_1', 'T1_Inc_Cargador') IS NULL
    ALTER TABLE SOL_PRESUPUESTOS_COLA_TIPO_1 ADD T1_Inc_Cargador VARCHAR(25) NULL;
GO
IF COL_LENGTH('SOL_PRESUPUESTOS_COLA_TIPO_1', 'T1_Inc_Cargador_C1') IS NULL
    ALTER TABLE SOL_PRESUPUESTOS_COLA_TIPO_1 ADD T1_Inc_Cargador_C1 VARCHAR(25) NULL;
GO

	 ALTER PROCEDURE [dbo].[sp_sol_presupuestos_cola_tipo_1_add]	
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
	 @T1_Inc_Cargador varchar(25) = '',
	 @T1_Inc_Cargador_C1 varchar(25) = ''
	 )
	 as
	 begin

	  declare @line int
	  declare @articulo int
	  declare @descripcion varchar(255)
	
	  set @line = 10
	  set @articulo = 1
	  set @descripcion = 'Enrollable ' + cast(@cantidad as varchar) + 'x' + cast(@ancho as varchar) + 'x' + cast(@alto as varchar)
  
	UPDATE [SOLARMANES_DEV].[dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow

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
	 T1_Inc_Mando,T1_Inc_Mando_C1,T1_Inc_Impresion,T1_Inc_Impresion_C1,T1_PVP,T1_PVP_C1,T1_Fecha_Entrega,T1_Transporte,Estancia_ID,Estancia,idcajon,idguia,cargador,T1_Inc_Cargador,T1_Inc_Cargador_C1)
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
	 @T1_Inc_Mando,@T1_Inc_Mando_C1,@T1_Inc_Impresion,@T1_Inc_Impresion_C1,@T1_PVP,@T1_PVP_C1,@T1_Fecha_Entrega,@T1_Transporte,@Estancia_ID,@Estancia,@idcajon,@idguia,@cargador,@T1_Inc_Cargador,@T1_Inc_Cargador_C1)
	 end
	 

	 return 1


	 end
GO
