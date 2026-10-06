-- 005 · 2026-10-06 · Honeycomb (tipo 7): parámetros de medida de sol_pedidos_cola_tipo_7_add a decimal(12,2).
--
-- Por qué un script aparte: el cuerpo de este SP lo define la rama honeyComb_v3
-- (sqlHoney/02_sol_pedidos_cola_tipo_7_add.sql, que además crea la línea en SOL_PEDIDOS_COLA_LINEAS).
-- Este script NO lleva el cuerpo: lee la definición que haya en la BD (la antigua o la de Honeycomb),
-- cambia solo "@ancho INT" y "@alto INT" a decimal(12,2) y la vuelve a aplicar. Así esta rama queda completa
-- (Honeycomb guarda medias medidas, ver 004) sin traer lógica de la otra ni pisarla.
--
-- Repetible: si los dos parámetros ya son decimal, no hace nada.
-- Orden: si después se aplica el 02 de Honeycomb, ese script ya trae decimal(12,2); no hay que repetir este.
-- Ejecutar con: sqlcmd -S localhost -U sa -P ... -C -d <BD> -f 65001 -b -i 005_sp_tipo_7_medidas_decimales.sql
SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

DECLARE @obj int = OBJECT_ID('dbo.sol_pedidos_cola_tipo_7_add');
IF @obj IS NULL
BEGIN
    RAISERROR('No existe dbo.sol_pedidos_cola_tipo_7_add.', 16, 1);
    RETURN;
END

-- Nada que hacer si los dos parámetros ya son decimal y el SP tiene ANSI_NULLS y QUOTED_IDENTIFIER activados.
-- Si alguna opción está desactivada (p. ej. se creó con sqlcmd sin -I), se recrea con ellas activadas,
-- que es como se crea el resto de la BD y como lo crea el 02 de Honeycomb.
IF NOT EXISTS (SELECT 1 FROM sys.parameters p JOIN sys.types t ON t.user_type_id = p.user_type_id
               WHERE p.object_id = @obj AND p.name IN ('@ancho', '@alto') AND t.name <> 'decimal')
   AND NOT EXISTS (SELECT 1 FROM sys.sql_modules WHERE object_id = @obj AND (uses_ansi_nulls = 0 OR uses_quoted_identifier = 0))
BEGIN
    PRINT '005: @ancho y @alto ya son decimal; no se cambia nada.';
    RETURN;
END

DECLARE @def nvarchar(max) = OBJECT_DEFINITION(@obj);
DECLARE @p int, @q int, @param nvarchar(20), @i int = 1;

-- "CREATE PROCEDURE" -> "CREATE OR ALTER PROCEDURE" (solo la primera aparición)
SET @p = PATINDEX('%CREATE%PROC%', @def);
IF @p = 0 BEGIN RAISERROR('No se encuentra CREATE PROCEDURE en la definición.', 16, 1); RETURN; END
SET @def = STUFF(@def, @p, LEN('CREATE'), 'CREATE OR ALTER');

-- En la lista de parámetros (la primera aparición de cada nombre), el tipo INT pasa a decimal(12,2)
WHILE @i <= 2
BEGIN
    SET @param = CASE @i WHEN 1 THEN '@ancho' ELSE '@alto' END;
    SET @p = PATINDEX('%' + @param + '[ ' + CHAR(9) + ']%', @def);
    IF @p = 0 BEGIN RAISERROR('No se encuentra el parámetro %s.', 16, 1, @param); RETURN; END
    SET @q = @p + LEN(@param);
    WHILE SUBSTRING(@def, @q, 1) IN (' ', CHAR(9)) SET @q += 1;
    IF UPPER(SUBSTRING(@def, @q, 3)) = 'INT' AND SUBSTRING(@def, @q + 3, 1) NOT LIKE '[A-Za-z0-9_]'
        SET @def = STUFF(@def, @q, 3, 'decimal(12,2)');
    ELSE IF UPPER(SUBSTRING(@def, @q, 7)) <> 'DECIMAL'
    BEGIN
        RAISERROR('El parámetro %s no es INT ni decimal: revisarlo a mano.', 16, 1, @param);
        RETURN;
    END
    SET @i += 1;
END

EXEC sys.sp_executesql @def;
PRINT '005: sol_pedidos_cola_tipo_7_add con @ancho y @alto en decimal(12,2).';
GO

-- Comprobación: los dos parámetros deben salir como decimal, con las dos opciones a 1
SELECT p.name AS parametro, t.name AS tipo, p.precision, p.scale, m.uses_ansi_nulls, m.uses_quoted_identifier
FROM sys.parameters p JOIN sys.types t ON t.user_type_id = p.user_type_id
JOIN sys.sql_modules m ON m.object_id = p.object_id
WHERE p.object_id = OBJECT_ID('dbo.sol_pedidos_cola_tipo_7_add') AND p.name IN ('@ancho', '@alto');
GO
