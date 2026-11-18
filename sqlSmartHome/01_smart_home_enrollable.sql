/* ─────────────────────────────────────────────────────────────────────────────
   Smart Home en el enrollable con motor (configurador manza/config, flujo antiguo)
   - SOL_ARTICULOS_SMART_HOME: precio y C1 de la opción (una fila activa).
   - SOL_ARTICULOS_SMART_HOME_CLIENTES: clientes que la ven (1 Leroy Merlín, 4 Solarmanes).
   - SOL_ARTICULOS_SMART_HOME_MARCAS: marcas de motor que la admiten; se buscan en la descripción
     del modelo (SOL_ARTICULOS_COLORES_MARCAS.descripcion), que es donde está la marca.
   - dbo.fn_smart_home_aplica(@cliente, @modelo): 1 si el modelo de motor admite Smart Home para el cliente.
   - smart_home / T1_Inc_SmartHome / T1_Inc_SmartHome_C1 en pedidos y presupuestos del tipo 1
     (+ T1_Inc_SmartHome_48 en pedidos: el código 48 del motor de la línea).
   - sp_sol_pedidos_cola_tipo_1_add y sp_sol_presupuestos_cola_tipo_1_add: parámetros nuevos con valor
     por defecto (las llamadas antiguas y la web de Leroy siguen igual).
   - sp_pedidos_t1_asigna_48: importe del Smart Home por cortina (PVP x cantidad, C1 multiplicado), como el cargador.
   Requisitos: parte de los SP con medidas decimales (sqlMedidas) y núcleo (sqlMandos/05).
   Vuelta atrás: 01b_vuelta_atras_smart_home.sql
   ───────────────────────────────────────────────────────────────────────────── */

IF OBJECT_ID('dbo.SOL_ARTICULOS_SMART_HOME') IS NULL
    CREATE TABLE dbo.SOL_ARTICULOS_SMART_HOME (
        idrow       INT IDENTITY(1,1) PRIMARY KEY,
        descripcion VARCHAR(100)  NOT NULL,
        pvp         DECIMAL(10,2) NOT NULL,
        c1          VARCHAR(11)   NOT NULL,
        activo      BIT           NOT NULL DEFAULT 1
    );
GO
IF OBJECT_ID('dbo.SOL_ARTICULOS_SMART_HOME_CLIENTES') IS NULL
    CREATE TABLE dbo.SOL_ARTICULOS_SMART_HOME_CLIENTES (cliente INT NOT NULL PRIMARY KEY);
GO
IF OBJECT_ID('dbo.SOL_ARTICULOS_SMART_HOME_MARCAS') IS NULL
    CREATE TABLE dbo.SOL_ARTICULOS_SMART_HOME_MARCAS (marca VARCHAR(50) NOT NULL PRIMARY KEY);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.SOL_ARTICULOS_SMART_HOME)
    INSERT INTO dbo.SOL_ARTICULOS_SMART_HOME (descripcion, pvp, c1, activo) VALUES ('SMART HOME', 136.84, 'C1 0007202', 1);
INSERT INTO dbo.SOL_ARTICULOS_SMART_HOME_CLIENTES (cliente)
    SELECT v.cliente FROM (VALUES (1), (4)) v(cliente)
    WHERE NOT EXISTS (SELECT 1 FROM dbo.SOL_ARTICULOS_SMART_HOME_CLIENTES c WHERE c.cliente = v.cliente);
INSERT INTO dbo.SOL_ARTICULOS_SMART_HOME_MARCAS (marca)
    SELECT v.marca FROM (VALUES ('A-OK'), ('AOK'), ('SOMFY'), ('NICE')) v(marca)
    WHERE NOT EXISTS (SELECT 1 FROM dbo.SOL_ARTICULOS_SMART_HOME_MARCAS m WHERE m.marca = v.marca);
GO

CREATE OR ALTER FUNCTION dbo.fn_smart_home_aplica (@cliente INT, @modelo INT)
RETURNS BIT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.SOL_ARTICULOS_SMART_HOME WHERE activo = 1)
       AND EXISTS (SELECT 1 FROM dbo.SOL_ARTICULOS_SMART_HOME_CLIENTES WHERE cliente = @cliente)
       AND EXISTS (SELECT 1 FROM dbo.SOL_ARTICULOS_COLORES_MARCAS m
                   JOIN dbo.SOL_ARTICULOS_SMART_HOME_MARCAS k ON m.descripcion COLLATE DATABASE_DEFAULT LIKE '%' + k.marca COLLATE DATABASE_DEFAULT + '%'
                   WHERE m.idrow = @modelo)
        RETURN 1;
    RETURN 0;
END
GO

IF COL_LENGTH('SOL_PEDIDOS_COLA_TIPO_1', 'smart_home') IS NULL
    ALTER TABLE SOL_PEDIDOS_COLA_TIPO_1 ADD smart_home INT NULL;
IF COL_LENGTH('SOL_PEDIDOS_COLA_TIPO_1', 'T1_Inc_SmartHome') IS NULL
    ALTER TABLE SOL_PEDIDOS_COLA_TIPO_1 ADD T1_Inc_SmartHome VARCHAR(25) NULL;
IF COL_LENGTH('SOL_PEDIDOS_COLA_TIPO_1', 'T1_Inc_SmartHome_C1') IS NULL
    ALTER TABLE SOL_PEDIDOS_COLA_TIPO_1 ADD T1_Inc_SmartHome_C1 VARCHAR(25) NULL;
IF COL_LENGTH('SOL_PEDIDOS_COLA_TIPO_1', 'T1_Inc_SmartHome_48') IS NULL
    ALTER TABLE SOL_PEDIDOS_COLA_TIPO_1 ADD T1_Inc_SmartHome_48 VARCHAR(25) NULL;
IF COL_LENGTH('SOL_PRESUPUESTOS_COLA_TIPO_1', 'smart_home') IS NULL
    ALTER TABLE SOL_PRESUPUESTOS_COLA_TIPO_1 ADD smart_home INT NULL;
IF COL_LENGTH('SOL_PRESUPUESTOS_COLA_TIPO_1', 'T1_Inc_SmartHome') IS NULL
    ALTER TABLE SOL_PRESUPUESTOS_COLA_TIPO_1 ADD T1_Inc_SmartHome VARCHAR(25) NULL;
IF COL_LENGTH('SOL_PRESUPUESTOS_COLA_TIPO_1', 'T1_Inc_SmartHome_C1') IS NULL
    ALTER TABLE SOL_PRESUPUESTOS_COLA_TIPO_1 ADD T1_Inc_SmartHome_C1 VARCHAR(25) NULL;
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
	 @T1_Inc_Cargador_C1	varchar(25)	= '',
	 @nucleo int = -1,
	 @smart_home int = -1,
	 @T1_Inc_SmartHome varchar(25) = '',
	 @T1_Inc_SmartHome_C1 varchar(25) = ''
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

	  /* Leroy Merlin Web (cliente 5), enrollable con motor: el JSON de la web trae los c¢digos de su integraci¢n
	     (los mismos que sp_tarifas_calculate_prices_link) y aqu¡ se pasan a los ids de nuestras tablas.
	     Mando (SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO): 0 sin mando -> 4, 1 un canal -> 6, 6 seis canales -> 8;
	     tambi‚n los c¢digos antiguos de la web: 3 seis canales -> 8, 4 sin mando -> 4.
	     Cargador (Tipo1_Cargador): 1 -> el cargador del modelo de motor (SOL_ARTICULOS_MANDOS_CARGADORES.id_marca;
	     el modelo es siempre el 676, la promoci¢n de abajo); 0 o sin enviar -> sin cargador.
	     N£cleo (nucleo): se guarda tal cual, 1 lleva / 0 no lleva / -1 no enviado. */
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
	 cargador,T1_Inc_Cargador,T1_Inc_Cargador_C1,nucleo,smart_home,T1_Inc_SmartHome,T1_Inc_SmartHome_C1)
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
	 @cargador,@T1_Inc_Cargador,@T1_Inc_Cargador_C1,@nucleo,@smart_home,@T1_Inc_SmartHome,@T1_Inc_SmartHome_C1)


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
GO

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
	 @T1_Inc_Cargador_C1 varchar(25) = '',
	 @smart_home int = -1,
	 @T1_Inc_SmartHome varchar(25) = '',
	 @T1_Inc_SmartHome_C1 varchar(25) = ''
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
	 T1_Inc_Mando,T1_Inc_Mando_C1,T1_Inc_Impresion,T1_Inc_Impresion_C1,T1_PVP,T1_PVP_C1,T1_Fecha_Entrega,T1_Transporte,Estancia_ID,Estancia,idcajon,idguia,cargador,T1_Inc_Cargador,T1_Inc_Cargador_C1,smart_home,T1_Inc_SmartHome,T1_Inc_SmartHome_C1)
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
	 @T1_Inc_Mando,@T1_Inc_Mando_C1,@T1_Inc_Impresion,@T1_Inc_Impresion_C1,@T1_PVP,@T1_PVP_C1,@T1_Fecha_Entrega,@T1_Transporte,@Estancia_ID,@Estancia,@idcajon,@idguia,@cargador,@T1_Inc_Cargador,@T1_Inc_Cargador_C1,@smart_home,@T1_Inc_SmartHome,@T1_Inc_SmartHome_C1)
	 end
	 

	 return 1


	 end
GO

ALTER procedure [dbo].[sp_pedidos_t1_asigna_48]
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

declare @smart_home int
declare @smart_pvp decimal(12,2) = 0
declare @smart_c1 varchar(25) = ''

select @smart_home = smart_home, @cargador = cargador,@modelo = acc_modelo_id,@mando  = mando_id, @cantidad = isnull(cantidad, 1) from sol_pedidos_cola_tipo_1
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



	/* Smart Home (sqlSmartHome/01): por cortina, como el cargador. Código 48: el del motor de la línea */
	if @smart_home = 1
	begin
		select top 1 @smart_pvp = pvp, @smart_c1 = c1 from SOL_ARTICULOS_SMART_HOME where activo = 1 order by idrow

		update sol_pedidos_cola_tipo_1 set
		T1_Inc_SmartHome = @smart_pvp * @cantidad,
		T1_Inc_SmartHome_C1 = case when @cantidad > 1 then dbo.C1_Multiply(@smart_c1, @cantidad) else @smart_c1 end,
		T1_Inc_SmartHome_48 = @modelo_48
		where id = @idrow
	end

end
GO
