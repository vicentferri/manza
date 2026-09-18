USE [SOLARMANES_DEV]
GO
/****** Objeto: StoredProcedure [dbo].[SP_Honeycomb_TipoAccionamiento_Imagen_Delete] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- SP: Eliminar imagen de tipo de accionamiento
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[SP_Honeycomb_TipoAccionamiento_Imagen_Delete]
    @idTipoAccionamiento INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE sol_articulos_honeycomb_tiposaccionamiento_imagenes
    SET Activo = 0,
        FechaModificacion = GETDATE()
    WHERE idTipoAccionamiento = @idTipoAccionamiento;

    SELECT 1 AS Success;
END
GO
