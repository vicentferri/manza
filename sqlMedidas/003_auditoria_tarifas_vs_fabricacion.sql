-- 003 · 2026-10-05 (corregido 2026-10-06: Magic y Compac con sus límites; celdas vacías solo dentro de lo fabricable) · AUDITORÍA (solo lectura): huecos entre lo fabricable y lo que tiene precio.
-- Enrollable (producto 1 en sol_articulos_tarifas, clientes 1 y 5 que valoran con sp_tarifas_calculate_prices3_AT).
-- Matriz: fila y=0 = anchos (m), columna x=0 = altos (m), resto = precio (v1).
-- El SP busca la primera cabecera >= medida, así que una medida fabricable se queda sin precio si:
--   a) supera la mayor cabecera de la matriz, o
--   b) cae en una celda vacía.
-- Ejecutar con: sqlcmd -f 65001 -d <BD> -i 003_auditoria_tarifas_vs_fabricacion.sql
SET NOCOUNT ON;

;WITH tarifas AS (
    SELECT t.idrow, t.clientes, t.tejidos, t.marcas, t.impresion,
           tej.descripcion AS tejido_base
    FROM dbo.sol_articulos_tarifas t
    LEFT JOIN dbo.sol_articulos_tejidos tej ON tej.idrow = t.tejidos
    WHERE t.producto = 1 AND t.clientes IN (1, 5)
),
cab_x AS (   -- anchos de cabecera en cm
    SELECT l.idrow, l.x, ancho = TRY_CAST(REPLACE(l.v1, ',', '.') AS decimal(10,2)) * 100
    FROM dbo.sol_articulos_tarifas_lineas l JOIN tarifas t ON t.idrow = l.idrow
    WHERE l.y = 0 AND l.x > 0
),
cab_y AS (   -- altos de cabecera en cm
    SELECT l.idrow, l.y, alto = TRY_CAST(REPLACE(l.v1, ',', '.') AS decimal(10,2)) * 100
    FROM dbo.sol_articulos_tarifas_lineas l JOIN tarifas t ON t.idrow = l.idrow
    WHERE l.x = 0 AND l.y > 0
),
celdas AS (
    SELECT l.idrow, l.x, l.y, precio = TRY_CAST(REPLACE(l.v1, ',', '.') AS decimal(12,2))
    FROM dbo.sol_articulos_tarifas_lineas l JOIN tarifas t ON t.idrow = l.idrow
    WHERE l.x > 0 AND l.y > 0
),
fab AS (     -- límites de fabricación según la marca de la tarifa:
             --   55 = Magic (enrollable sin cadena, accionamiento 16), 44 = Compac (tipo 4),
             --   resto = enrollable con el tejido (los motores solo cambian el ancho mínimo).
    SELECT t.idrow, f.min_ancho, f.max_ancho, f.min_alto, f.max_alto
    FROM tarifas t
    CROSS APPLY dbo.fn_limites_fabricacion(
        t.clientes,  -- límites del cliente de la tarifa (sin filas propias = sin límites)
        CASE WHEN t.marcas = 44 THEN 4 ELSE 1 END,
        CASE WHEN t.marcas = 44 THEN NULL ELSE 1 END,
        CASE WHEN t.marcas = 55 THEN 16 WHEN t.marcas = 44 THEN NULL ELSE 1 END,
        NULL, t.tejidos, NULL) f
),
-- celdas que el SP usaría para alguna medida fabricable: la primera cabecera >= cada medida dentro del rango
uso AS (
    SELECT x.idrow, x.x, y.y
    FROM cab_x x
    JOIN cab_y y ON y.idrow = x.idrow
    JOIN fab f ON f.idrow = x.idrow
    WHERE x.ancho >= f.min_ancho
      AND (x.ancho <= f.max_ancho OR x.ancho = (SELECT MIN(x2.ancho) FROM cab_x x2 WHERE x2.idrow = x.idrow AND x2.ancho >= f.max_ancho))
      AND y.alto >= f.min_alto
      AND (y.alto <= f.max_alto OR y.alto = (SELECT MIN(y2.alto) FROM cab_y y2 WHERE y2.idrow = y.idrow AND y2.alto >= f.max_alto))
    -- (La primera columna/fila, que se cobra cuando la medida es menor que el mínimo cobrable, ya entra aquí:
    --  su cabecera es >= que el mínimo fabricable. Antes se añadía entera y contaba como vacías celdas no fabricables.)
)
SELECT
    t.idrow AS tarifa, t.clientes AS cliente, t.marcas AS marca, t.impresion,
    t.tejidos AS tejido, t.tejido_base,
    fab_ancho = CONCAT(f.min_ancho, '-', f.max_ancho), fab_alto = CONCAT(f.min_alto, '-', f.max_alto),
    tarifa_ancho = CONCAT((SELECT MIN(ancho) FROM cab_x WHERE idrow = t.idrow), '-', (SELECT MAX(ancho) FROM cab_x WHERE idrow = t.idrow)),
    tarifa_alto  = CONCAT((SELECT MIN(alto)  FROM cab_y WHERE idrow = t.idrow), '-', (SELECT MAX(alto)  FROM cab_y WHERE idrow = t.idrow)),
    -- a) fabricable por encima de la última cabecera
    sin_precio_ancho = CASE WHEN f.max_ancho > ISNULL((SELECT MAX(ancho) FROM cab_x WHERE idrow = t.idrow), 0)
                            THEN CONCAT('> ', (SELECT MAX(ancho) FROM cab_x WHERE idrow = t.idrow), ' hasta ', f.max_ancho) ELSE '' END,
    sin_precio_alto  = CASE WHEN f.max_alto > ISNULL((SELECT MAX(alto) FROM cab_y WHERE idrow = t.idrow), 0)
                            THEN CONCAT('> ', (SELECT MAX(alto) FROM cab_y WHERE idrow = t.idrow), ' hasta ', f.max_alto) ELSE '' END,
    -- b) celdas vacías dentro de lo fabricable
    celdas_vacias = (SELECT COUNT(*) FROM uso u
                     LEFT JOIN celdas c ON c.idrow = u.idrow AND c.x = u.x AND c.y = u.y
                     WHERE u.idrow = t.idrow AND (c.precio IS NULL OR c.precio <= 0))
FROM tarifas t
JOIN fab f ON f.idrow = t.idrow
ORDER BY
    CASE WHEN f.max_ancho > ISNULL((SELECT MAX(ancho) FROM cab_x WHERE idrow = t.idrow), 0)
           OR f.max_alto > ISNULL((SELECT MAX(alto) FROM cab_y WHERE idrow = t.idrow), 0) THEN 0 ELSE 1 END,
    t.clientes, t.tejido_base, t.marcas, t.impresion;
