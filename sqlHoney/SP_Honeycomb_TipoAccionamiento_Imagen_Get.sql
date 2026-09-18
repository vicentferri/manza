USE [SOLARMANES_DEV]
GO
/****** Objeto: StoredProcedure [dbo].[SP_Honeycomb_TipoAccionamiento_Imagen_Get] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- SP: Obtener imagen de tipo de accionamiento
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[SP_Honeycomb_TipoAccionamiento_Imagen_Get]
    @idTipoAccionamiento INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        idTipoAccionamiento,
        NombreArchivo,
        Extension,
        Contenido,
        ContentType,
        Tamanio,
        FechaModificacion
    FROM sol_articulos_honeycomb_tiposaccionamiento_imagenes
    WHERE idTipoAccionamiento = @idTipoAccionamiento
        AND Activo = 1;
END
GO
