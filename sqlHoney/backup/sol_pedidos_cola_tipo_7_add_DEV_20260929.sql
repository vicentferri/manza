
-- =============================================
-- SP: sol_pedidos_cola_tipo_7_add
-- =============================================
CREATE PROCEDURE sol_pedidos_cola_tipo_7_add
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

