USE [SOLARMANES_DEV]
GO
/****** Objeto: Table [dbo].[sol_articulos_honeycomb_tiposaccionamiento_imagenes] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Tabla: Imagen por tipo de accionamiento
-- =============================================
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'sol_articulos_honeycomb_tiposaccionamiento_imagenes'
)
BEGIN
    CREATE TABLE [dbo].[sol_articulos_honeycomb_tiposaccionamiento_imagenes] (
        [idTipoAccionamiento] INT NOT NULL,
        [NombreArchivo]       NVARCHAR(255) NULL,
        [Extension]           NVARCHAR(10) NULL,
        [Contenido]           VARBINARY(MAX) NULL,
        [ContentType]         NVARCHAR(50) NULL,
        [Tamanio]             INT NULL,
        [FechaModificacion]   DATETIME NULL CONSTRAINT DF_HoneycombTipoAccionamientoImagenes_FechaModificacion DEFAULT (GETDATE()),
        [Activo]              BIT NOT NULL CONSTRAINT DF_HoneycombTipoAccionamientoImagenes_Activo DEFAULT (1),
        CONSTRAINT PK_HoneycombTipoAccionamientoImagenes PRIMARY KEY CLUSTERED ([idTipoAccionamiento]),
        CONSTRAINT FK_HoneycombTipoAccionamientoImagenes_TipoAccionamiento FOREIGN KEY ([idTipoAccionamiento])
            REFERENCES [dbo].[sol_articulos_honeycomb_tiposaccionamiento] ([idTipoAccionamiento])
    );
END
GO
