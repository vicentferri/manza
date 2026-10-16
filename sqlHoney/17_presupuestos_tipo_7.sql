/* =====================================================================
   17 - Presupuestos con HoneyComb (tipo 7)
   2026-10-16. Hasta ahora /api/lm/budget_hinzu(2) descartaba las líneas tipo 7: el
   presupuesto se guardaba con cabecera y sin líneas. Se crea lo mismo que tienen los
   tipos 1-4 en presupuestos:

     1. Tabla SOL_PRESUPUESTOS_COLA_TIPO_7: copia de la estructura de
        SOL_PEDIDOS_COLA_TIPO_7 (mismos tipos de columna que en esta BD), con PK, fecha de
        creación por defecto y FK idrow -> SOL_PRESUPUESTOS_COLA_LINEAS.ID (como TIPO_1..4).
     2. sol_presupuestos_cola_tipo_7_add: línea (line 70, articulo 7, tipo 7) + fila tipo 7,
        y cliente_entrega = @centro como los tipos 1-4 (sin él el presupuesto no sale en la
        lista, que filtra por cliente_entrega).
     3. vw_reports_budget_lines_7 (líneas tipo 7 por presupuesto) y vw_nh_budget_cue_lines_tipo_7
        (detalle de la pantalla interna de presupuestos).
     4. AT_total_presupuestos: suma también T7_PVP.            (objeto existente)
     5. sp_sol_presupuesto_a_pedido: copia también el tipo 7.   (objeto existente)
     6. vw_cola_presupuestos: TipoArticulo 7 = 'HONEYCOMB'.      (objeto existente)

   Los objetos existentes (4, 5, 6) se reescriben enteros: es su definición de DEV con
   solo el cambio indicado. Copias en la carpeta backup, ficheros que acaban en
   _antes_presupuestos_tipo_7_20261016.sql. OJO al editar esta cabecera: SQL Server admite
   comentarios anidados, así que no se puede escribir en ella una barra seguida de asterisco.

   Idempotente: se puede ejecutar varias veces.
   Requiere: 02 (sol_pedidos_cola_tipo_7_add con línea) ya aplicado.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go

/* ---------------- 1. Tabla SOL_PRESUPUESTOS_COLA_TIPO_7 ---------------- */
if object_id('dbo.SOL_PRESUPUESTOS_COLA_TIPO_7') is null
begin
	/* select into copia columnas, tipos e identity de la tabla de pedidos */
	select top 0 * into dbo.SOL_PRESUPUESTOS_COLA_TIPO_7 from dbo.SOL_PEDIDOS_COLA_TIPO_7

	alter table dbo.SOL_PRESUPUESTOS_COLA_TIPO_7 add constraint PK_SOL_PRESUPUESTOS_COLA_TIPO_7 primary key clustered (id)
	alter table dbo.SOL_PRESUPUESTOS_COLA_TIPO_7 add constraint DF_SOL_PRESUPUESTOS_COLA_TIPO_7_fecha_creacion default (getdate()) for fecha_creacion
	alter table dbo.SOL_PRESUPUESTOS_COLA_TIPO_7 add constraint FK_SOL_PRESUPUESTOS_COLA_TIPO_7_SOL_PRESUPUESTOS_COLA_LINEAS
		foreign key (idrow) references dbo.SOL_PRESUPUESTOS_COLA_LINEAS (ID)

	print '17: tabla SOL_PRESUPUESTOS_COLA_TIPO_7 creada'
end
else
	print '17: la tabla SOL_PRESUPUESTOS_COLA_TIPO_7 ya existe (no se toca)'
go

/* ---------------- 2. sol_presupuestos_cola_tipo_7_add ---------------- */
if object_id('dbo.sol_presupuestos_cola_tipo_7_add') is not null
	drop procedure dbo.sol_presupuestos_cola_tipo_7_add
go

/* Alta de una HoneyComb en un presupuesto. Mismos parámetros que sol_pedidos_cola_tipo_7_add.
   @idrow = id del presupuesto. Devuelve el id de la fila tipo 7. */
create procedure [dbo].[sol_presupuestos_cola_tipo_7_add]
    @id                   INT,
    @idrow                INT,
    @ancho                DECIMAL(12,2),
    @alto                 DECIMAL(12,2),
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
    @T7_Transporte        VARCHAR(25),
    @centro               INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    declare @idLinea int

    -- TIENDA DE ENTREGA (como los tipos 1-4)
    if @centro is not null
        update SOL_PRESUPUESTOS_COLA set cliente_entrega = @centro where idrow = @idrow

    -- LINEA DEL PRESUPUESTO
    insert into SOL_PRESUPUESTOS_COLA_LINEAS(idrow, line, articulo, ancho, alto, cantidad, tipo, lista)
    values(@idrow, 70, 7, @ancho, @alto, @cantidad, 7, 70)

    set @idLinea = scope_identity()

    INSERT INTO SOL_PRESUPUESTOS_COLA_TIPO_7 (
        idrow, ancho, alto, cantidad,
        tej_tipo_id, tej_tipo_text,
        tej_color_id, tej_color_text,
        color_perfil_id, color_perfil_text,
        hc_accionamiento_id, hc_accionamiento_text,
        T7_PVP, T7_PVP_C1, T7_Fecha_Entrega, T7_Transporte
    )
    VALUES (
        @idLinea, @ancho, @alto, @cantidad,
        @tej_tipo_id, @tej_tipo_text,
        @tej_color_id, @tej_color_text,
        @color_perfil_id, @color_perfil_text,
        @hc_accionamiento_id, @hc_accionamiento_text,
        @T7_PVP, @T7_PVP_C1, @T7_Fecha_Entrega, @T7_Transporte
    );

    SELECT SCOPE_IDENTITY() AS idrow;
END
go

/* ---------------- 3a. vw_reports_budget_lines_7 ---------------- */
if object_id('dbo.vw_reports_budget_lines_7') is not null
	drop view dbo.vw_reports_budget_lines_7
go

/* Líneas HoneyComb de cada presupuesto (idrow = presupuesto). La usa AT_total_presupuestos. */
create view dbo.vw_reports_budget_lines_7
as
select l.IDROW, l.TIPO, t.id, t.ancho, t.alto, t.cantidad,
       t.tej_tipo_id, t.tej_tipo_text, t.tej_color_id, t.tej_color_text,
       t.color_perfil_id, t.color_perfil_text, t.hc_accionamiento_id, t.hc_accionamiento_text,
       t.T7_PVP, t.T7_PVP_C1, t.T7_Fecha_Entrega, t.T7_Transporte,
       dbo.AT_Cliente_cola_presupuestos(l.IDROW) as cliente
from dbo.SOL_PRESUPUESTOS_COLA_LINEAS l
inner join dbo.SOL_PRESUPUESTOS_COLA_TIPO_7 t on l.ID = t.idrow
where l.TIPO = 7
go

/* ---------------- 3b. vw_nh_budget_cue_lines_tipo_7 ---------------- */
if object_id('dbo.vw_nh_budget_cue_lines_tipo_7') is not null
	drop view dbo.vw_nh_budget_cue_lines_tipo_7
go

/* Detalle HoneyComb de la pantalla interna de presupuestos (/api/budget2_lin_tip/:idrow/7),
   con las mismas columnas de línea que vw_nh_budget_cue_lines_tipo_4. */
create view dbo.vw_nh_budget_cue_lines_tipo_7
as
select l.LISTA, l.ARTICULO, l.REFERENCIA, l.OBSERVACIONES, l.PRECIO, l.DESCUENTO, l.DESCRIPCION,
       l.CANTIDAD as Expr1, l.DESCUENTOV, l.TOTAL, l.ID, l.IDROW, l.TIPO,
       t.ancho, t.alto, t.cantidad,
       t.tej_tipo_id, t.tej_tipo_text, t.tej_color_id, t.tej_color_text,
       t.color_perfil_id, t.color_perfil_text, t.hc_accionamiento_id, t.hc_accionamiento_text,
       t.T7_PVP, t.T7_PVP_C1,
       dbo.AT_Cliente_cola_pedidos(l.IDROW) as cliente
from dbo.SOL_PRESUPUESTOS_COLA_LINEAS l
inner join dbo.SOL_PRESUPUESTOS_COLA_TIPO_7 t on l.ID = t.idrow
where l.TIPO = 7
go

/* ---------------- 4. AT_total_presupuestos (existente: + T7_PVP) ---------------- */
ALTER FUNCTION [dbo].[AT_total_presupuestos]
 (@idrow int)
RETURNS decimal(18,2) AS
BEGIN 

declare @valor as decimal(18,2)
declare @presupuesto1 decimal(18,2)
declare @presupuesto2 decimal(18,2)
declare @presupuesto3 decimal(18,2)
declare @presupuesto4 decimal(18,2)
declare @presupuesto7 decimal(18,2)

set @presupuesto1 = (SELECT  sum(T1_PVP) FROM vw_reports_budget_lines_1
WHERE     (idrow = @idrow))
IF @presupuesto1 IS NULL SET @presupuesto1 = 0

set @presupuesto2 = (SELECT  sum(T2_PVP) FROM vw_reports_budget_lines_2
WHERE     (idrow = @idrow))
IF @presupuesto2 IS NULL SET @presupuesto2 = 0

set @presupuesto3 = (SELECT  sum(T3_PVP) FROM vw_reports_budget_lines_3
WHERE     (idrow = @idrow))
IF @presupuesto3 IS NULL SET @presupuesto3 = 0

set @presupuesto4 = (SELECT  sum(T4_PVP) FROM vw_reports_budget_lines_4
WHERE     (idrow = @idrow))
IF @presupuesto4 IS NULL SET @presupuesto4 = 0

/* 2026-10-16: HONEYCOMB */
set @presupuesto7 = (SELECT  sum(T7_PVP) FROM vw_reports_budget_lines_7
WHERE     (idrow = @idrow))
IF @presupuesto7 IS NULL SET @presupuesto7 = 0

SET @valor = @presupuesto1+@presupuesto2+@presupuesto3+@presupuesto4+@presupuesto7

return @valor

END
go

/* ---------------- 5. sp_sol_presupuesto_a_pedido (existente: + bloque tipo 7) ---------------- */
ALTER PROCEDURE [dbo].[sp_sol_presupuesto_a_pedido]
(
	@idrow int = 15045
)
as
begin

declare @Pedido int
declare @idLinea int
declare @idNewLinea int
declare @Tipo int
declare @Fecha datetime = getdate()


INSERT INTO [dbo].[SOL_PEDIDOS_COLA]
           ([TIPO],[CODIGO],[EMPRESA],[FECHA],[TIPODOCUMENTO],[RESPONSABLE],[COMERCIAL],[COMERCIAL2],[COMISION1],[COMISION2],[CLIENTE],[CLIENTE_ENTREGA]
           ,[NUMEROPEDIDO],[FORMAPAGO],[FECHAVALOR],[FECHAVTO],[DTOESP],[DTOPP],[IVA],[RE],[PORTES],[EMBALAJES],[COMISION],[ALMACEN],[TRANSPORTE],[OBSERVACIONES],[CLOSED]
           ,[USUARIOS_CODIGOALTA],[USUARIOS_FECHAALTA],[USUARIOS_CODIGOMODIF],[USUARIOS_FECHAMODIF],[mBRUTO],[mDTOESP],[mDTOPP],[mBASE],[mIVA],[mRE],[mTOTAL],[FACTURA],[COMP_TELEFONO]
           ,[COMP_OBRA],[COMP_CODIGOOBRA],[COMP_LOCALIZACION],[COMP_FECHA],[BLOQUEO],[ESTADO],[ESTADO_V1],[ESTADO_V2],[ESTADO_V3],[ESTADO_V4],[ESTADO_V5],[VERSION],[REFERENCIA],[PARAMETROS]
           ,[INFO_PRODUCCION],[INFO_ALMACEN],[INFO_COMPRAS],[INFO_FACTURACION],[ESTADO_APROVISIONAMIENTO],[PRIORIDAD],[ENTREGA_PENDIENTE],[FORFAIT],[DIVISA],[FECHACAMBIO],[VALORCAMBIO],[INCOTERM]
           ,[NEED_PROFORM],[PROFORM],[ENLACE],[AUTORIZADO],[USUARIO_AUTORIZACION],[FECHA_AUTORIZACION],[MODIF],[CANAL],[NETO],[ESTADO_SEGUIMIENTO],[ESTADO_SEGUIMIENTO_DATE],[ESTADO_SEGUIMIENTO_BLOQUEO],[RESTO],[IMPRESION]
           ,[REFGENERAL],[VISIBLE],[FEC_OPERATION],[REFCLIENTE],
		    [REF_PIXIS],[REF_PROVIDER],[REF_IDSM],[REF_DATE],[DETALLES],[FECHA_TEMP])
SELECT [TIPO],[CODIGO],[EMPRESA],@Fecha,[TIPODOCUMENTO],[RESPONSABLE],[COMERCIAL],[COMERCIAL2],[COMISION1],[COMISION2],[CLIENTE],[CLIENTE_ENTREGA]
      ,[NUMEROPEDIDO],[FORMAPAGO],[FECHAVALOR],[FECHAVTO],[DTOESP],[DTOPP],[IVA],[RE],0,0,0,[ALMACEN],[TRANSPORTE],[OBSERVACIONES],[CLOSED]
	  ,[USUARIOS_CODIGOALTA],[USUARIOS_FECHAALTA],[USUARIOS_CODIGOMODIF],[USUARIOS_FECHAMODIF],[mBRUTO],[mDTOESP],[mDTOPP],[mBASE],[mIVA],[mRE],[mTOTAL],[FACTURA],[COMP_TELEFONO]
      ,[COMP_OBRA],[COMP_CODIGOOBRA],[COMP_LOCALIZACION],[COMP_FECHA],[BLOQUEO],0,[ESTADO_V1],[ESTADO_V2],[ESTADO_V3],[ESTADO_V4],[ESTADO_V5],[VERSION],[REFERENCIA],[PARAMETROS]
      ,[INFO_PRODUCCION],[INFO_ALMACEN],[INFO_COMPRAS],[INFO_FACTURACION],[ESTADO_APROVISIONAMIENTO],[PRIORIDAD],[ENTREGA_PENDIENTE],[FORFAIT],1,[FECHACAMBIO],[VALORCAMBIO],[INCOTERM]
      ,[NEED_PROFORM],[PROFORM],[ENLACE],[AUTORIZADO],[USUARIO_AUTORIZACION],[FECHA_AUTORIZACION],[MODIF],[CANAL],[NETO],[ESTADO_SEGUIMIENTO],[ESTADO_SEGUIMIENTO_DATE],[ESTADO_SEGUIMIENTO_BLOQUEO],[RESTO],[IMPRESION]
      ,[REFGENERAL],[VISIBLE],[FEC_OPERATION],[REFCLIENTE],'','','','','',[FEC_VALIDEZ]
  FROM [dbo].[SOL_PRESUPUESTOS_COLA] where idrow=@idrow

  set @Pedido = SCOPE_IDENTITY()

  if @Pedido > 0
  begin

  print 'Pedido=' + cast(@Pedido as varchar)

  declare itLineas cursor for
  select id,articulo from [dbo].[SOL_PRESUPUESTOS_COLA_LINEAS] where idrow=@idrow
  open itLineas
  fetch next from itLineas into @idLinea,@Tipo
  while @@fetch_status = 0
  begin

    INSERT INTO [dbo].[SOL_PEDIDOS_COLA_LINEAS]([IDROW],[ARTICULO],[ancho],[alto],[REFERENCIA],[UNIDAD]
	,[OBSERVACIONES],[PRECIO],[DESCUENTO],[DESCUENTO2],[COMISION],[SERVIDO],[ACTUAL],[CLOSED],[USUARIOS_CODIGOALTA],[USUARIOS_FECHAALTA],[USUARIOS_CODIGOMODIF],[USUARIOS_FECHAMODIF]
	,[ORIGEN],[ORIGENSTR],[DESCRIPCION],[CANTIDAD],[TIPOUNIDAD],[TOTAL],[BENEFICIO],[TOTALBENEFICIO],[TOTALFINAL],[PADRE],[TOMA],[MUESTRA],[FECHA],[LISTA]
	,[MULTIPLICADOR],[GRUPO],[FECHASERVICIO],[PRODUCCION_ESTADO],[ESTADO_APROVISIONAMIENTO],[SERVIDO_MANUAL],[PRESUPUESTOLINEA],[DEVOLUCION],
	[ANULACION],[PRESENTACION],[EMP],[TIVA],[IVA],[VALORIVA],[ENLACE],[CANTIDAD2],[IDSET],[IDMADRESET],[POSICION],[AMPLIADO],[EMBALAJE],[UNIDEMB]
	,[PESO_NETO],[PESO_BRUTO],[BULTOS],[BULTOS_MANUAL],[VOLUMEN],[PARTIDA],[COMERCIAL1],[COMERCIAL2],[COMISION1],[COMISION2],[COSTE],[DESCUENTOV],[TIPO],[LINE],[_referencia_impresion])
	SELECT @Pedido,[ARTICULO],[ancho],[alto],[REFERENCIA],[UNIDAD]
	,[OBSERVACIONES],[PRECIO],[DESCUENTO],[DESCUENTO2],[COMISION],[SERVIDO],[ACTUAL],[CLOSED],[USUARIOS_CODIGOALTA],[USUARIOS_FECHAALTA],[USUARIOS_CODIGOMODIF],[USUARIOS_FECHAMODIF]
	,[ORIGEN],[ORIGENSTR],[DESCRIPCION],[CANTIDAD],[TIPOUNIDAD],[TOTAL],[BENEFICIO],[TOTALBENEFICIO],[TOTALFINAL],[PADRE],[TOMA],[MUESTRA],[FECHA],[LISTA]
	,[MULTIPLICADOR],[GRUPO],[FECHASERVICIO],[PRODUCCION_ESTADO],[ESTADO_APROVISIONAMIENTO],[SERVIDO_MANUAL],[PRESUPUESTOLINEA],[DEVOLUCION]
	,[ANULACION],[PRESENTACION],[EMP],[TIVA],[IVA],[VALORIVA],[ENLACE],[CANTIDAD2],[IDSET],[IDMADRESET],[POSICION],[AMPLIADO],[EMBALAJE],[UNIDEMB]
	,[PESO_NETO],[PESO_BRUTO],[BULTOS],[BULTOS_MANUAL],[VOLUMEN],[PARTIDA],[COMERCIAL1],[COMERCIAL2],[COMISION1],[COMISION2],[COSTE],[DESCUENTOV],[TIPO],[LINE],''
	FROM [dbo].[SOL_PRESUPUESTOS_COLA_LINEAS] where id=@idLinea

	set @idNewLinea = SCOPE_IDENTITY()
	print 'Linea Pedido=' + cast(@idNewLinea as varchar) + ',Tipo=' + cast(@Tipo as varchar)
	if @idNewLinea > 0
	begin

		IF @Tipo = 1
		begin
	INSERT INTO [dbo].[SOL_PEDIDOS_COLA_TIPO_1]
  ([tipo],[idrow],[ancho],[alto],[cantidad],[acc_tipo_id],[acc_tipo_text],[acc_marca_id],[acc_marca_text],[acc_tubo_id],[acc_tubo_text],[acc_modelo_id],[acc_modelo_text]
,[acc_posicion_id],[acc_posicion_text],[sop_tipo_id],[sop_tipo_text],[sop_color_id],[sop_color_text],[tej_tipo_id],[tej_tipo_text],[tej_color_id],[tej_color_text],[tej_salida_id]
,[tej_salida_text],[con_tipo_id],[con_tipo_text],[tap_tipo_id],[tap_tipo_text],[tap_color_id],[tap_color_text],[cad_altura_id],[cad_altura_text],[cad_color_id],[cad_color_text]
,[cad_Altura],[cad_Tipo],[con_color_id],[con_color_text],[impresion],[impresion_imagen],[mando_id],[mando_text],[instrucciones],[strFechaEntrega],[FechaEntrega]
,[T1_Cantidad],[T1_Tejido],[T1_Tejido_C1],[T1_Inc_CadenaMetalica],[T1_Inc_CadenaMetalica_C1],[T1_Inc_Contrapeso],[T1_Inc_Contrapeso_C1],[T1_Inc_Mando]
,[T1_Inc_Mando_C1],[T1_Inc_Impresion],[T1_Inc_Impresion_C1],[T1_PVP],[T1_PVP_C1],[T1_Fecha_Entrega],[T1_Transporte])
SELECT [tipo],@idNewLinea,[ancho],[alto],[cantidad],[acc_tipo_id],[acc_tipo_text],[acc_marca_id],[acc_marca_text],[acc_tubo_id],[acc_tubo_text]
,[acc_modelo_id],[acc_modelo_text],[acc_posicion_id],[acc_posicion_text],[sop_tipo_id],[sop_tipo_text],[sop_color_id],[sop_color_text],[tej_tipo_id],[tej_tipo_text],[tej_color_id],[tej_color_text],[tej_salida_id]
,[tej_salida_text],[con_tipo_id],[con_tipo_text],[tap_tipo_id],[tap_tipo_text],[tap_color_id],[tap_color_text],[cad_altura_id],[cad_altura_text],[cad_color_id],[cad_color_text]
,[cad_Altura],[cad_Tipo],[con_color_id],[con_color_text],[impresion],[impresion_imagen],[mando_id],[mando_text],[instrucciones],[strFechaEntrega],[FechaEntrega],[T1_Cantidad],[T1_Tejido],[T1_Tejido_C1],[T1_Inc_CadenaMetalica],[T1_Inc_CadenaMetalica_C1],[T1_Inc_Contrapeso]
,[T1_Inc_Contrapeso_C1],[T1_Inc_Mando],[T1_Inc_Mando_C1],[T1_Inc_Impresion],[T1_Inc_Impresion_C1],[T1_PVP],[T1_PVP_C1],[T1_Fecha_Entrega],[T1_Transporte]
  FROM [dbo].[SOL_PRESUPUESTOS_COLA_TIPO_1] where idrow = @idLinea and tipo = @tipo
	end

	if @Tipo = 2
	begin
		INSERT INTO [dbo].[SOL_PEDIDOS_COLA_TIPO_2]
 ([IDROW],[TIPO],[TipoJapones],[PJ_Ancho_1],[PJ_Alto_1],[PJ_Cantidad_1],[pj_tejidos_id],[pj_tejidos_text],[pj_tejidosC_id],[pj_tejidosC_text],[PJ_Contrapeso_1],[impresion],[impresion_imagen]
,[PJ_Ancho_2],[PJ_NumeroVias_2],[PJ_PosicionMando_2],[PJ_TipoRecogida_2],[PJ_ColorRiel_2],[PJ_TipoSoporte_2],[instrucciones],[PJ_Estancia_ID],[PJ_Estancia],[PJ_NumeroPortatelas],[PJ_NumeroLamas],[PJ_AnchoLama],[PJ_AltoLamaTerminada],[strFechaEntrega]
,[FechaEntrega],[T2_Cantidad],[T2_Tejido],[T2_Tejido_C1],[T2_NumeroVias],[T2_NumeroVias_C1],[T2_NumSoportes],[T2_TipoSoporte],[T2_TipoSoporte_C1],[T2_Inc_Impresion],[T2_Inc_Impresion_C1]
,[T2_PVP],[T2_PVP_C1],[T2_FechaEntrega],[T2_Transporte],[T2_SoporteTotal],[T2_TejidoColor_2],[T2_TejidoColor_3],[T2_TejidoColor_4],[T2_TejidoColor_5],[PJ_CombinarColores])
  SELECT @idNewLinea,[TIPO],[TipoJapones],[PJ_Ancho_1],[PJ_Alto_1],[PJ_Cantidad_1],[pj_tejidos_id],[pj_tejidos_text],[pj_tejidosC_id],[pj_tejidosC_text],[PJ_Contrapeso_1],[impresion],[impresion_imagen]
,[PJ_Ancho_2],[PJ_NumeroVias_2],[PJ_PosicionMando_2],[PJ_TipoRecogida_2],[PJ_ColorRiel_2],[PJ_TipoSoporte_2],[instrucciones],[PJ_Estancia_ID],[PJ_Estancia],[PJ_NumeroPortatelas],[PJ_NumeroLamas],[PJ_AnchoLama],[PJ_AltoLamaTerminada],[strFechaEntrega]
,[FechaEntrega],[T2_Cantidad],[T2_Tejido],[T2_Tejido_C1],[T2_NumeroVias],[T2_NumeroVias_C1],[T2_NumSoportes],[T2_TipoSoporte],[T2_TipoSoporte_C1],[T2_Inc_Impresion],[T2_Inc_Impresion_C1]
,[T2_PVP],[T2_PVP_C1],[T2_FechaEntrega],[T2_Transporte],[T2_SoporteTotal],[T2_TejidoColor_2],[T2_TejidoColor_3],[T2_TejidoColor_4],[T2_TejidoColor_5],[PJ_CombinarColores]
FROM [dbo].[SOL_PRESUPUESTOS_COLA_TIPO_2] where idrow = @idLinea and tipo = @tipo
	end

	if @Tipo = 3
	begin
		INSERT INTO [dbo].[SOL_PEDIDOS_COLA_TIPO_3]
           ([idrow],[tipo],[PV_SEL_1],[PV_Ancho_1],[PV_Alto_1],[PV_Cantidad_1],[PV_AnchoLama_1],[PV_PosicionMecanismo_1]
,[PV_ColorRiel_1],[PV_Accionamiento_1],[PV_TipoSoporte_1],[PV_TipoRecogida_1],[PV_Tejido_id],[PV_Tejido_text],[PV_Tejido_c1_id],[PV_Tejido_c1_text],[PV_Tejido_c2_id],[PV_Tejido_c2_text]
,[PV_SEL_2],[PV_Ancho_2],[PV_Cantidad_2],[PV_AlturaMin_2],[PV_AlturaMax_2],[PV_AnchoLama_2],[PV_PosicionMecanismo_2]
,[PV_ColorRiel_2],[PV_Accionamiento_2],[PV_TipoSoporte_2],[PV_TipoRecogida_2],[instrucciones],[strFechaEntrega],[FechaEntrega],[T3_Cantidad],[T3_Tejido]
,[T3_Tejido_C1],[T3_TejidosCombinados],[T3_TejidosCombinados_C1],[T3_TipoSoporte],[T3_NumSoportes],[T3_TipoSoporte_C1],[T3_PVP],[T3_PVP_C1],[T3_Fecha_Entrega],[T3_Transporte]
,[T32_Cantidad],[T32_Tejido],[T32_Tejido_C1],[T32_TejidosCombinados])
select @idNewLinea,[tipo],[PV_SEL_1],[PV_Ancho_1],[PV_Alto_1],[PV_Cantidad_1],[PV_AnchoLama_1],[PV_PosicionMecanismo_1]
,[PV_ColorRiel_1],[PV_Accionamiento_1],[PV_TipoSoporte_1],[PV_TipoRecogida_1],[PV_Tejido_id],[PV_Tejido_text],[PV_Tejido_c1_id],[PV_Tejido_c1_text],[PV_Tejido_c2_id],[PV_Tejido_c2_text]
,[PV_SEL_2],[PV_Ancho_2],[PV_Cantidad_2],[PV_AlturaMin_2],[PV_AlturaMax_2],[PV_AnchoLama_2],[PV_PosicionMecanismo_2]
,[PV_ColorRiel_2],[PV_Accionamiento_2],[PV_TipoSoporte_2],[PV_TipoRecogida_2],[instrucciones],[strFechaEntrega],[FechaEntrega],[T3_Cantidad],[T3_Tejido]
,[T3_Tejido_C1],[T3_TejidosCombinados],[T3_TejidosCombinados_C1],[T3_TipoSoporte],[T3_NumSoportes],[T3_TipoSoporte_C1],[T3_PVP],[T3_PVP_C1],[T3_Fecha_Entrega],[T3_Transporte]
,[T32_Cantidad],[T32_Tejido],[T32_Tejido_C1],[T32_TejidosCombinados]
FROM [dbo].[SOL_PRESUPUESTOS_COLA_TIPO_3] where idrow = @idLinea and tipo = @tipo
	end

	if @Tipo = 4
	begin
		INSERT INTO [dbo].[SOL_PEDIDOS_COLA_TIPO_4]
           ([idrow]
,[tipo],[junquillo],[ancho],[ancho2],[alto],[cantidad],[acc_tipo_id],[acc_tipo_text]
,[acc_marca_id],[acc_marca_text],[acc_tubo_id],[acc_tubo_text],[acc_modelo_id],[acc_modelo_text],[acc_posicion_id]
,[acc_posicion_text],[sop_tipo_id],[sop_tipo_text],[sop_color_id],[sop_color_text],[tej_tipo_id],[tej_tipo_text],[tej_color_id],[tej_color_text],[tej_salida_id],[tej_salida_text]
,[con_tipo_id],[con_tipo_text],[tap_tipo_id],[tap_tipo_text],[tap_color_id],[tap_color_text],[cad_altura_id],[cad_altura_text],[cad_color_id],[cad_color_text],[cad_Altura],[cad_Tipo],[con_color_id]
,[con_color_text],[instrucciones],[strFechaEntrega],[FechaEntrega],[T4_Cantidad],[T4_Tejido],[T4_Tejido_C1],[T4_Coeficiente],[T4_PVP],[T4_PVP_C1],[T4_Fecha_Entrega],[T4_Transporte])
  SELECT @idNewLinea,[tipo],[junquillo],[ancho],[ancho2],[alto],[cantidad],[acc_tipo_id],[acc_tipo_text]
,[acc_marca_id],[acc_marca_text],[acc_tubo_id],[acc_tubo_text],[acc_modelo_id],[acc_modelo_text],[acc_posicion_id]
,[acc_posicion_text],[sop_tipo_id],[sop_tipo_text],[sop_color_id],[sop_color_text],[tej_tipo_id],[tej_tipo_text],[tej_color_id],[tej_color_text],[tej_salida_id],[tej_salida_text]
,[con_tipo_id],[con_tipo_text],[tap_tipo_id],[tap_tipo_text],[tap_color_id],[tap_color_text],[cad_altura_id],[cad_altura_text],[cad_color_id],[cad_color_text],[cad_Altura],[cad_Tipo],[con_color_id]
,[con_color_text],[instrucciones],[strFechaEntrega],[FechaEntrega],[T4_Cantidad],[T4_Tejido],[T4_Tejido_C1],[T4_Coeficiente],[T4_PVP],[T4_PVP_C1],[T4_Fecha_Entrega],[T4_Transporte]
FROM [dbo].[SOL_PRESUPUESTOS_COLA_TIPO_4] where idrow = @idLinea and tipo = @tipo
	end

	/* 2026-10-16: HONEYCOMB (SOL_PRESUPUESTOS_COLA_TIPO_7 no tiene columna tipo) */
	if @Tipo = 7
	begin
		INSERT INTO [dbo].[SOL_PEDIDOS_COLA_TIPO_7]
		([idrow],[ancho],[alto],[cantidad],[tej_tipo_id],[tej_tipo_text],[tej_color_id],[tej_color_text],[color_perfil_id],[color_perfil_text]
		,[hc_accionamiento_id],[hc_accionamiento_text],[T7_PVP],[T7_PVP_C1],[T7_Fecha_Entrega],[T7_Transporte])
		SELECT @idNewLinea,[ancho],[alto],[cantidad],[tej_tipo_id],[tej_tipo_text],[tej_color_id],[tej_color_text],[color_perfil_id],[color_perfil_text]
		,[hc_accionamiento_id],[hc_accionamiento_text],[T7_PVP],[T7_PVP_C1],[T7_Fecha_Entrega],[T7_Transporte]
		FROM [dbo].[SOL_PRESUPUESTOS_COLA_TIPO_7] where idrow = @idLinea
	end

	end


   
  fetch next from itLineas into @idLinea,@Tipo
  end
  close itLineas
  deallocate itLineas

  end


return 1

end
go

/* ---------------- 6. vw_cola_presupuestos (existente: TipoArticulo 7) ---------------- */
ALTER VIEW dbo.vw_cola_presupuestos
AS
SELECT     TOP (100) PERCENT dbo.SOL_PRESUPUESTOS_COLA.IDROW, dbo.SOL_PRESUPUESTOS_COLA.CLIENTE, dbo.SOL_PRESUPUESTOS_COLA.FECHA, 
                      dbo.SOL_PRESUPUESTOS_COLA.REFERENCIA, dbo.SOL_PRESUPUESTOS_COLA.ESTADO, dbo.SOL_PRESUPUESTOS_COLA.REFGENERAL, DATEDIFF(dd, 
                      dbo.SOL_PRESUPUESTOS_COLA.FECHA, GETDATE()) AS dias, dbo.SOL_PRESUPUESTOS_COLA_LINEAS.ARTICULO, dbo.SOL_PRESUPUESTOS_COLA_LINEAS.ancho, 
                      dbo.SOL_PRESUPUESTOS_COLA_LINEAS.alto, dbo.SOL_PRESUPUESTOS_COLA_LINEAS.CANTIDAD, dbo.SOL_PRESUPUESTOS_COLA_LINEAS.TIPO, 
                      CASE [SOLARMANES_DEV].[dbo].[SOL_PRESUPUESTOS_COLA_LINEAS].tipo WHEN 1 THEN 'DEVA' WHEN 2 THEN 'TORMES' WHEN 3 THEN 'VERTICAL' WHEN 4 THEN
                       'COMPAC' WHEN 7 THEN 'HONEYCOMB' END AS TipoArticulo, 'Leroy Merlín' AS nomcliente, dbo.SOL_PRESUPUESTOS_COLA_LINEAS.REFERENCIA AS REF, 
                      dbo.SOL_PRESUPUESTOS_COLA.CLIENTE_ENTREGA, ISNULL(dbo.SOL_PRESUPUESTOS_COLA.VISIBLE, 1) AS VISIBLE, 
                      dbo.SOL_PRESUPUESTOS_COLA.REFCLIENTE, dbo.SOL_PRESUPUESTOS_COLA.FEC_VALIDEZ
FROM         dbo.SOL_PRESUPUESTOS_COLA LEFT OUTER JOIN
                      dbo.SOL_PRESUPUESTOS_COLA_LINEAS ON dbo.SOL_PRESUPUESTOS_COLA.IDROW = dbo.SOL_PRESUPUESTOS_COLA_LINEAS.IDROW
WHERE     (ISNULL(dbo.SOL_PRESUPUESTOS_COLA.VISIBLE, 1) = 1)
go

/* ---------------- Comprobación ---------------- */
select 'RESUMEN 17' as resumen,
	case when object_id('dbo.SOL_PRESUPUESTOS_COLA_TIPO_7') is not null then 'OK' else 'FALTA' end as tabla,
	case when object_id('dbo.sol_presupuestos_cola_tipo_7_add') is not null then 'OK' else 'FALTA' end as sp_add,
	case when object_definition(object_id('dbo.AT_total_presupuestos')) like '%vw_reports_budget_lines_7%' then 'OK' else 'FALTA' end as total,
	case when object_definition(object_id('dbo.sp_sol_presupuesto_a_pedido')) like '%SOL_PRESUPUESTOS_COLA_TIPO_7%' then 'OK' else 'FALTA' end as a_pedido,
	case when object_definition(object_id('dbo.vw_cola_presupuestos')) like '%HONEYCOMB%' then 'OK' else 'FALTA' end as vista
go
