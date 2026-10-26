/* =====================================================================
   02 - Medidas con decimales: parámetros de los SPs de alta int -> decimal(12,2)
   Los SPs de alta del configurador de siempre (pedido, presupuesto y la tabla
   temporal de la valoración) reciben ancho/alto como int y truncan 120,5 a 120.
   Este script solo cambia el tipo de esos parámetros y, en los de presupuesto,
   el texto de la descripción (120 o 120,5 en vez de 120.00):

     tipo 1 enrollable : @ancho @alto
     tipo 3 vertical   : @PV_Ancho_1 @PV_Alto_1 @PV_Ancho_2 @PV_AlturaMin_2 @PV_AlturaMax_2
     tipo 4 Compac     : @ancho @ancho2 @alto
   (japonés y HoneyComb ya los tenían en decimal)

   El resto de cada SP es la definición de SOLARMANES_DEV local del 2026-10-22
   (copia en backup/). Antes de tocar nada se comprueba la huella (checksum y
   longitud) de los nueve SPs: si alguno no es ni el original revisado ni el ya
   modificado, NO SE APLICA NINGUNO; compárelo con backup/ antes de seguir.
   Se puede ejecutar varias veces. Requiere el 01 (columnas).
   Para deshacer: ejecutar los ficheros de backup/ cambiando CREATE por ALTER.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

declare @huellas table (sp sysname, ck_original int, len_original int, ck_nuevo int, len_nuevo int)
insert into @huellas values
	('sp_sol_pedidos_cola_tipo_1_add', 1769307993, 7609, -1447249083, 7627),
	('sp_sol_presupuestos_cola_tipo_1_add', 799621813, 5206, -234996438, 5242),
	('sol_temp_pedidos_cola_tipo_1_add', -1710586670, 6505, -1697766416, 6523),
	('sol_pedidos_cola_tipo_3_add', -1041525095, 4446, -1595532300, 4494),
	('sol_presupuestos_cola_tipo_3_add', -1393091120, 4602, -698831176, 4666),
	('sol_temp_pedidos_cola_tipo_3_add', -1952263522, 4467, 1507662716, 4515),
	('sol_pedidos_cola_tipo_4_add', 597352974, 4153, -387546635, 4181),
	('sol_presupuestos_cola_tipo_4_add', 1076678199, 4246, 1419026961, 4290),
	('sol_temp_pedidos_cola_tipo_4_add', -1069864685, 4180, 839335800, 4208)

declare @distintos table (sp sysname, estado varchar(30))
insert into @distintos (sp, estado)
select h.sp, case when m.object_id is null then 'NO EXISTE' else 'DISTINTO' end
from @huellas h
left join sys.sql_modules m on m.object_id = object_id('dbo.' + h.sp)
where m.object_id is null
   or not ((checksum(m.definition) = h.ck_original and len(m.definition) = h.len_original)
        or (checksum(m.definition) = h.ck_nuevo and len(m.definition) = h.len_nuevo))

if exists (select 1 from @distintos)
begin
	select * from @distintos
	raiserror('02: NO SE EJECUTA, hay SPs distintos de la versión revisada (ver la lista)', 16, 1)
	set noexec on
end
else if exists (select 1 from sys.columns where object_id = object_id('dbo.SOL_PRESUPUESTOS_COLA_TIPO_1') and name = 'ancho' and type_name(user_type_id) = 'int')
begin
	raiserror('02: NO SE EJECUTA, falta el 01 (columnas)', 16, 1)
	set noexec on
end
go

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

                                                  where idrow = case when @cliente in (1, 5) and acc_tipo_id = 3 then 676

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
		mando_text = (select descripcion from [SOLARMANES_DEV].[DBO].[SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO] where idrow=mando_id)
		where id=@id2

		execute sp_pedidos_t1_asigna_48 @id2
	 end


	 
	 

	 return 1


	 end
go

	 ALTER PROCEDURE [dbo].[sp_sol_presupuestos_cola_tipo_1_add]	
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
	  set @descripcion = 'Enrollable ' + cast(@cantidad as varchar) + 'x' + format(@ancho, '0.##', 'es-ES') + 'x' + format(@alto, '0.##', 'es-ES')
  
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
go




ALTER PROCEDURE [dbo].[sol_temp_pedidos_cola_tipo_1_add]	
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
go

ALTER PROCEDURE [dbo].[sol_pedidos_cola_tipo_3_add]  
  (
  @id int,
  @idrow int,
  @PV_SEL_1 int,
  @PV_Ancho_1 decimal(12,2),
  @PV_Alto_1 decimal(12,2),
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
  @PV_Ancho_2 decimal(12,2),
  @PV_Cantidad_2 int,
  @PV_AlturaMin_2 decimal(12,2),
  @PV_AlturaMax_2 decimal(12,2),
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
	  
	   UPDATE [SOLARMANES_DEV].[dbo].[SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into  [SOLARMANES_DEV].[DBO].[SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@PV_Ancho_1,@PV_Alto_1,@PV_Cantidad_1,3)
	  set @id = scope_identity()

	  if @id > 0
	  begin


  insert into  [SOLARMANES_DEV].[DBO].[sol_pedidos_cola_tipo_3](
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
go

ALTER PROCEDURE [dbo].[sol_presupuestos_cola_tipo_3_add]  
  (
  @id int,
  @idrow int,
  @PV_SEL_1 int,
  @PV_Ancho_1 decimal(12,2),
  @PV_Alto_1 decimal(12,2),
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
  @PV_Ancho_2 decimal(12,2),
  @PV_Cantidad_2 int,
  @PV_AlturaMin_2 decimal(12,2),
  @PV_AlturaMax_2 decimal(12,2),
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

	  set @descripcion = 'P.Vertical ' + cast(@pv_cantidad_1 as varchar) + 'x' + format(@PV_Ancho_1, '0.##', 'es-ES') + 'x' + format(@PV_Alto_1, '0.##', 'es-ES')

	  UPDATE [SOLARMANES_DEV].[dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow

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
go

	 ALTER PROCEDURE [dbo].[sol_temp_pedidos_cola_tipo_3_add]  
  (
  @id int,
  @idrow int,
  @PV_SEL_1 int,
  @PV_Ancho_1 decimal(12,2),
  @PV_Alto_1 decimal(12,2),
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
  @PV_Ancho_2 decimal(12,2),
  @PV_Cantidad_2 int,
  @PV_AlturaMin_2 decimal(12,2),
  @PV_AlturaMax_2 decimal(12,2),
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
	  
	   UPDATE [SOLARMANES_DEV].[dbo].[TEMP_SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow

	  insert into  [SOLARMANES_DEV].[DBO].[TEMP_SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@PV_Ancho_1,@PV_Alto_1,@PV_Cantidad_1,3)
	  set @id = scope_identity()

	  if @id > 0
	  begin


  insert into  [SOLARMANES_DEV].[DBO].[temp_sol_pedidos_cola_tipo_3](
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
go

  ALTER PROCEDURE [dbo].[sol_pedidos_cola_tipo_4_add]
(
  @id int,
  @idrow int,
  @junquillo varchar(50),
  @ancho decimal(12,2),
  @ancho2 decimal(12,2),
  @alto decimal(12,2),
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

	  UPDATE [SOLARMANES_DEV].[dbo].[SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow
	  

	  insert into  [SOLARMANES_DEV].[DBO].[SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,4)
	  set @id = scope_identity()

	  if @id > 0
	  begin


insert into  [SOLARMANES_DEV].[DBO].[SOL_PEDIDOS_COLA_TIPO_4](
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
go

	 ALTER PROCEDURE [dbo].[sol_presupuestos_cola_tipo_4_add]
(
  @id int,
  @idrow int,
  @junquillo varchar(50),
  @ancho decimal(12,2),
  @ancho2 decimal(12,2),
  @alto decimal(12,2),
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
	  set @descripcion = 'Compac ' + cast(@cantidad as varchar) + 'x' + format(@ancho, '0.##', 'es-ES') + 'x' + format(@alto, '0.##', 'es-ES')

	  UPDATE [SOLARMANES_DEV].[dbo].[SOL_PRESUPUESTOS_COLA] set cliente_entrega = @centro where idrow=@idrow


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
go

  ALTER PROCEDURE [dbo].[sol_temp_pedidos_cola_tipo_4_add]
(
 @id int,
  @idrow int,
  @junquillo varchar(50),
  @ancho decimal(12,2),
  @ancho2 decimal(12,2),
  @alto decimal(12,2),
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

	  UPDATE [SOLARMANES_DEV].[dbo].[TEMP_SOL_PEDIDOS_COLA] set cliente_entrega = @centro where idrow=@idrow
	  

	  insert into  [SOLARMANES_DEV].[DBO].[TEMP_SOL_PEDIDOS_COLA_LINEAS](idrow,line,articulo,ancho,alto,cantidad,tipo)
	  values(@idrow,@line,@articulo,@ancho,@alto,@cantidad,4)
	  set @id = scope_identity()

	  if @id > 0
	  begin


insert into  [SOLARMANES_DEV].[DBO].[TEMP_SOL_PEDIDOS_COLA_TIPO_4](
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
go

set noexec off
go

/* Comprobación: los parámetros de medida de los nueve SPs tienen que salir en decimal(12,2) */
select o.name as sp, p.name as parametro, type_name(p.user_type_id) as tipo, p.precision, p.scale
from sys.parameters p
join sys.objects o on o.object_id = p.object_id
where o.name in ('sp_sol_pedidos_cola_tipo_1_add', 'sp_sol_presupuestos_cola_tipo_1_add', 'sol_temp_pedidos_cola_tipo_1_add', 'sol_pedidos_cola_tipo_3_add', 'sol_presupuestos_cola_tipo_3_add', 'sol_temp_pedidos_cola_tipo_3_add', 'sol_pedidos_cola_tipo_4_add', 'sol_presupuestos_cola_tipo_4_add', 'sol_temp_pedidos_cola_tipo_4_add')
  and p.name in ('@ancho', '@ancho2', '@alto', '@PV_Ancho_1', '@PV_Alto_1', '@PV_Ancho_2', '@PV_AlturaMin_2', '@PV_AlturaMax_2')
order by o.name, p.parameter_id
go
