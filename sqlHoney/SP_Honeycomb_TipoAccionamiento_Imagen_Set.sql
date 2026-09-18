USE [SOLARMANES_DEV]
GO
/****** Objeto: StoredProcedure [dbo].[SP_Honeycomb_TipoAccionamiento_Imagen_Set] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- SP: Guardar/Actualizar imagen de tipo de accionamiento
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[SP_Honeycomb_TipoAccionamiento_Imagen_Set]
    @idTipoAccionamiento INT,
    @NombreArchivo NVARCHAR(255),
    @Extension NVARCHAR(10),
    @Contenido VARBINARY(MAX),
    @ContentType NVARCHAR(50),
    @Tamanio INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM sol_articulos_honeycomb_tiposaccionamiento_imagenes WHERE idTipoAccionamiento = @idTipoAccionamiento)
    BEGIN
        UPDATE sol_articulos_honeycomb_tiposaccionamiento_imagenes
        SET
            NombreArchivo = @NombreArchivo,
            Extension = @Extension,
            Contenido = @Contenido,
            ContentType = @ContentType,
            Tamanio = @Tamanio,
            FechaModificacion = GETDATE(),
            Activo = 1
        WHERE idTipoAccionamiento = @idTipoAccionamiento;
    END
    ELSE
    BEGIN
        INSERT INTO sol_articulos_honeycomb_tiposaccionamiento_imagenes
            (idTipoAccionamiento, NombreArchivo, Extension, Contenido, ContentType, Tamanio, Activo)
        VALUES
            (@idTipoAccionamiento, @NombreArchivo, @Extension, @Contenido, @ContentType, @Tamanio, 1);
    END

    SELECT 1 AS Success;
END
GO
