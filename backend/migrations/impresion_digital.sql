-- ─────────────────────────────────────────────────────────────────────────────
-- Gestión de Impresiones Digitales (jul 2026)
--   Catálogo de imágenes ("motivos") organizadas por colección, para ser
--   seleccionadas y opcionalmente personalizadas (texto posicionable) desde
--   los configuradores de producto (Enrollable, Panel Japonés, Vertical, Compac).
--
--   impresion_digital_colecciones   Cabecera de colección.
--   impresion_digital_imagenes      Imágenes de una colección. archivo_web es
--                                    la versión redimensionada para uso en
--                                    frontend/lienzo; archivo_original se
--                                    conserva para la impresión final.
-- ─────────────────────────────────────────────────────────────────────────────

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'impresion_digital_colecciones')
BEGIN
    CREATE TABLE impresion_digital_colecciones (
        idrow INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        activo BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'impresion_digital_imagenes')
BEGIN
    CREATE TABLE impresion_digital_imagenes (
        idrow INT IDENTITY(1,1) PRIMARY KEY,
        coleccion_id INT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        activo BIT NOT NULL DEFAULT 1,
        personalizable BIT NOT NULL DEFAULT 0,
        archivo_web VARCHAR(255) NOT NULL,
        archivo_original VARCHAR(255) NOT NULL,
        ancho INT NULL,
        alto INT NULL,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_impresion_digital_imagenes_coleccion
            FOREIGN KEY (coleccion_id) REFERENCES impresion_digital_colecciones(idrow)
    );

    CREATE INDEX IX_impresion_digital_imagenes_coleccion ON impresion_digital_imagenes(coleccion_id);
END
GO
