/* =====================================================================
   02 - sol_pedidos_cola_tipo_7_add
   Cambio: al insertar, crea primero la línea en SOL_PEDIDOS_COLA_LINEAS
   (tipo=7, articulo=7) y guarda en SOL_PEDIDOS_COLA_TIPO_7.idrow el id de
   esa línea, igual que los tipos 1-4. Antes idrow era el id del pedido y el
   tipo 7 no existía para el router, la hoja de fabricación ni el XML.
   El parámetro @idrow sigue siendo el id del pedido (no cambia el backend).
   2026-10-06: @ancho/@alto pasan a DECIMAL(12,2) (medidas de 0,5 en 0,5 cm; rama
   cambios_configurador, scripts sqlMedidas/004 y 005). Igual que el resto de SP de alta.
   ===================================================================== */
set ansi_nulls on
go
set quoted_identifier on
go


alter procedure [dbo].[sol_pedidos_cola_tipo_7_add]
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
    @T7_Transporte        VARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;

    declare @idLinea int

    IF @id = 0
    BEGIN
        -- LINEA DEL PEDIDO
        insert into SOL_PEDIDOS_COLA_LINEAS(idrow, line, articulo, ancho, alto, cantidad, tipo)
        values(@idrow, 70, 7, @ancho, @alto, @cantidad, 7)

        set @idLinea = scope_identity()

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
            @idLinea, @ancho, @alto, @cantidad,
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

        UPDATE SOL_PEDIDOS_COLA_LINEAS SET
            ancho    = @ancho,
            alto     = @alto,
            cantidad = @cantidad
        WHERE id = (select idrow from SOL_PEDIDOS_COLA_TIPO_7 where id = @id) and tipo = 7;

        SELECT @id AS id;
    END
END;
go
