-- 002 · 2026-10-05 (ampliado 2026-10-06 con cliente) · Límites de FABRICACIÓN (no de tarifa)
-- por cliente / producto / composición / accionamiento / motor / tejido.
-- Fuente: MEDIDAS LEROY MANZA.xlsx (raíz del repo). Las filas del Excel son del cliente 1 (Leroy Merlin).
-- Repetible: crea la tabla si no existe, borra y recarga las filas de origen 'EXCEL_2026-10-05' y recrea la función.
-- Ejecutar con: sqlcmd -f 65001 -d <BD> -i 002_medidas_fabricacion.sql
--
-- Claves (NULL = cualquiera):
--   cliente      : cliente al que aplican las filas. NULL = límites generales para los clientes sin filas propias.
--                  Un cliente sin filas propias ni generales no tiene límites de fabricación.
--   tipo_cortina : TipoCortina del configurador (1 enrollable, 2 panel japonés, 3 vertical, 4 compac, 7 honeycomb)
--   subtipo      : enrollable -> SubTipoCortina (1 normal, 2 cajón ZIP)
--                  panel/vertical -> composición (1 mecanismo+tejido / tejido+riel, 2 solo tejido, 3 solo mecanismo / riel)
--                  vertical -> 4 = vertical inclinada (ancho = riel; alto = altura mínima y altura máxima)
--   accionamiento: sol_articulos_accionamientos.idrow (16 = SIN CADENA / Magic)
--   modelo_acc   : modelo de accionamiento (idrow de vw_accionamientos_colores, p.ej. motor 676)
--   tejido       : sol_articulos_tejidos.idrow (id base, igual para todos los clientes)
-- Medidas en cm; NULL = sin límite en ese sentido.
--
-- Resolución (fn_limites_fabricacion):
--   1. Si el cliente tiene filas propias de ese tipo_cortina, se usan solo esas; si no, las generales (cliente NULL).
--   2. Se cruzan todas las filas que encajan y gana la más restrictiva
--      (mínimo = el mayor de los mínimos, máximo = el menor de los máximos).
--   3. El ancmax del color (ancho del rollo, límite físico) se aplica siempre, a cualquier cliente.
-- Para dar de alta un cliente: insertar sus filas (o copiar las del cliente 1 cambiando el cliente).
GO

IF OBJECT_ID('dbo.sol_medidas_fabricacion') IS NULL
BEGIN
    CREATE TABLE dbo.sol_medidas_fabricacion (
        id            int IDENTITY(1,1) PRIMARY KEY,
        cliente       int          NULL,
        tipo_cortina  int          NOT NULL,
        subtipo       int          NULL,
        accionamiento int          NULL,
        modelo_acc    int          NULL,
        tejido        int          NULL,
        min_ancho     decimal(6,1) NULL,
        max_ancho     decimal(6,1) NULL,
        min_alto      decimal(6,1) NULL,
        max_alto      decimal(6,1) NULL,
        descripcion   varchar(100) NOT NULL,
        origen        varchar(50)  NOT NULL,
        activo        bit          NOT NULL DEFAULT 1,
        created       datetime     NOT NULL DEFAULT getdate()
    );
END
GO

-- Tablas creadas con la primera versión de este script (sin cliente)
IF COL_LENGTH('dbo.sol_medidas_fabricacion', 'cliente') IS NULL
    ALTER TABLE dbo.sol_medidas_fabricacion ADD cliente int NULL;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sol_medidas_fabricacion_tipo' AND object_id = OBJECT_ID('dbo.sol_medidas_fabricacion'))
    DROP INDEX IX_sol_medidas_fabricacion_tipo ON dbo.sol_medidas_fabricacion;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sol_medidas_fabricacion_cliente_tipo' AND object_id = OBJECT_ID('dbo.sol_medidas_fabricacion'))
    CREATE INDEX IX_sol_medidas_fabricacion_cliente_tipo ON dbo.sol_medidas_fabricacion (cliente, tipo_cortina, subtipo);
GO

DELETE FROM dbo.sol_medidas_fabricacion WHERE origen IN ('EXCEL_2026-10-05', 'USUARIO_2026-10-06');

INSERT INTO dbo.sol_medidas_fabricacion
    (tipo_cortina, subtipo, accionamiento, modelo_acc, tejido, min_ancho, max_ancho, min_alto, max_alto, descripcion, origen)
VALUES
-- ENROLLABLE (tipo 1, subtipo 1): por defecto para tejidos que no están en el Excel
 (1, 1, NULL, NULL, NULL,  60, 280,  60, 300, 'ENROLLABLE - resto de tejidos (por defecto, confirmado 2026-10-05)', 'EXCEL_2026-10-05'),
-- ENROLLABLES CADENA: por tejido (las filas "ID" del Excel tienen los mismos valores que su tejido sin ID)
 (1, 1, NULL, NULL,  13,   60, 280,  60, 300, 'ARCE OPACO (183)',               'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  47,   60, 280,  60, 300, 'ARCE OPACO (250)',               'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  48,   60, 280,  60, 300, 'ARCE OPACO (300)',               'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  59,   60, 200,  60, 300, 'SERGE OUT',                      'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 198,   60, 280,  60, 300, 'LIDO RD',                        'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  16,   60, 240,  60, 300, 'ARCO (cli 5: VERA TRANSP 200)',  'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 204,   60, 240,  60, 300, 'ARCO (cli 1: LUMINA)',           'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 169,   60, 280,  60, 300, 'BERGEN',                         'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 203,   60, 280,  60, 300, 'IMPRESSIONS',                    'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 197,   60, 280,  60, 300, 'LIDO',                           'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 199,   60, 280,  60, 300, 'SOHO',                           'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  52,   60, 280,  60, 300, 'SOLAR 1% (cli 5: WOW 1%)',       'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  53,   60, 280,  60, 300, 'SOLAR 5% (cli 5: WOW 5%)',       'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  54,   60, 280,  60, 300, 'SOLAR 10% (cli 5: WOW 10%)',     'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 225,   60, 280,  60, 300, 'SOLAR 1% (cli 1: IBIZA 420)',    'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  71,   60, 280,  60, 300, 'SOLAR 5% (cli 1: IBIZA 380)',    'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  70,   60, 280,  60, 300, 'SOLAR 10% (cli 1: IBIZA 335)',   'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  18,   60, 280,  60, 300, 'SARGA 5',                        'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  42,   60, 260,  60, 300, 'SARGA 1',                        'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  17,   60, 280,  60, 300, 'JARA 1',                         'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,   6,   60, 280,  60, 300, 'BREZO 5',                        'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,   9,   60, 280,  60, 300, 'OLMO 10',                        'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 100,   60, 280,  60, 300, 'BARI 5',                         'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 106,   60, 280,  60, 300, 'ECO 3 (ECOPLANET 3%)',           'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 201,   60, 280,  60, 300, 'SEA TEX NXT',                    'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 200,   60, 280,  60, 300, 'SEA TEX NXT RD',                 'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL,  32,   60, 280,  60, 300, 'METAL 3 (ZILARIO 3)',            'EXCEL_2026-10-05'),
 (1, 1, NULL, NULL, 202,   60, 280,  60, 300, 'SILKMOON',                       'EXCEL_2026-10-05'),
-- ENROLLABLES MOTOR: solo ancho mínimo por modelo de motor (accionamiento 3); el resto lo pone el tejido
 (1, 1, 3, 676,  NULL,   60, NULL, NULL, NULL, 'MOTOR AM25 PLUS L',              'EXCEL_2026-10-05'),
 (1, 1, 3, 1141, NULL,   90, NULL, NULL, NULL, 'MOTOR AM35 PLUS L',              'EXCEL_2026-10-05'),
 (1, 1, 3, 1153, NULL,   60, NULL, NULL, NULL, 'MOTOR TTGO MEC (NICE PROMO 35 mecánico)', 'EXCEL_2026-10-05'),
 (1, 1, 3, 679,  NULL,   90, NULL, NULL, NULL, 'MOTOR AM35 PLUS S WIFI',         'EXCEL_2026-10-05'),
 (1, 1, 3, 975,  NULL,   90, NULL, NULL, NULL, 'MOTOR TTGO VIA RADIO (NICE PROMO 35 VR)', 'EXCEL_2026-10-05'),
-- MAGIC (enrollable sin cadena)
 (1, 1, 16, NULL, NULL, 100, 180,  60, 180, 'MAGIC - todos',                  'EXCEL_2026-10-05'),
-- CAJÓN ZIP (enrollable subtipo 2)
 (1, 2, NULL, NULL, NULL, 100, 300, 100, 300, 'CAJON ZIP - todos',            'EXCEL_2026-10-05'),
-- COMPAC
 (4, NULL, NULL, NULL, NULL, 40, 120,  60, 220, 'COMPAC - todos',             'EXCEL_2026-10-05'),
-- PANEL JAPONÉS (composición 1 mec+tejido, 2 solo tejido, 3 solo mecanismo)
 (2, 1, NULL, NULL, NULL, 100, 280, 100, 300, 'PANEL MECANISMO + TEJIDO',     'EXCEL_2026-10-05'),
 (2, 2, NULL, NULL, NULL,  60, 200, 100, 300, 'PANEL TEJIDO',                 'EXCEL_2026-10-05'),
 (2, 3, NULL, NULL, NULL, 100, 280, NULL, NULL, 'PANEL MECANISMO',            'EXCEL_2026-10-05'),
-- VERTICAL (composición 1 tejido+riel, 2 solo tejido, 3 solo riel)
 (3, 1, NULL, NULL, NULL, 100, 280, 100, 400, 'VERTICAL MECANISMO + TEJIDO',  'EXCEL_2026-10-05'),
 (3, 2, NULL, NULL, NULL, NULL, NULL, 100, 300, 'VERTICAL TEJIDO',            'EXCEL_2026-10-05'),
 (3, 3, NULL, NULL, NULL, 100, 280, NULL, NULL, 'VERTICAL MECANISMO',         'EXCEL_2026-10-05'),
-- HONEYCOMB (no está en el Excel; se mantienen los límites actuales del configurador)
 (7, NULL, NULL, NULL, NULL, 30, 130,  30, 280, 'HONEYCOMB - todos (límites actuales)', 'EXCEL_2026-10-05');

-- Vertical inclinada: no está en el Excel. El usuario confirmó el 2026-10-06 los mismos límites que la vertical
-- mecanismo + tejido; el alto se aplica a la altura mínima y a la máxima.
INSERT INTO dbo.sol_medidas_fabricacion
    (tipo_cortina, subtipo, accionamiento, modelo_acc, tejido, min_ancho, max_ancho, min_alto, max_alto, descripcion, origen)
VALUES
 (3, 4, NULL, NULL, NULL, 100, 280, 100, 400, 'VERTICAL INCLINADA (como mecanismo + tejido)', 'USUARIO_2026-10-06');

-- Todas estas filas son de Leroy Merlin (cliente 1)
UPDATE dbo.sol_medidas_fabricacion SET cliente = 1 WHERE origen IN ('EXCEL_2026-10-05', 'USUARIO_2026-10-06') AND cliente IS NULL;
GO

CREATE OR ALTER FUNCTION dbo.fn_limites_fabricacion
(
    @cliente       int,
    @tipo_cortina  int,
    @subtipo       int,
    @accionamiento int,
    @modelo_acc    int,
    @tejido        int,
    @color         int
)
RETURNS TABLE
AS
RETURN
WITH filas AS (
    SELECT f.*
    FROM dbo.sol_medidas_fabricacion f
    WHERE f.activo = 1
      AND f.tipo_cortina = @tipo_cortina
      -- Filas propias del cliente para este producto; si no tiene, las generales (cliente NULL)
      AND (f.cliente = @cliente
           OR (f.cliente IS NULL AND NOT EXISTS (SELECT 1 FROM dbo.sol_medidas_fabricacion g
                                                 WHERE g.activo = 1 AND g.cliente = @cliente AND g.tipo_cortina = @tipo_cortina)))
      AND (f.subtipo       IS NULL OR f.subtipo       = @subtipo)
      AND (f.accionamiento IS NULL OR f.accionamiento = @accionamiento)
      AND (f.modelo_acc    IS NULL OR f.modelo_acc    = @modelo_acc)
      AND (f.tejido        IS NULL OR f.tejido        = @tejido)
),
color AS (
    SELECT max_ancho = CAST(MIN(c.ancmax) AS decimal(6,1))
    FROM dbo.vw_tejidos_colores c
    WHERE c.tejido = @tejido AND c.color = @color AND c.ancmax > 0
)
SELECT
    min_ancho = (SELECT MAX(min_ancho) FROM filas),
    max_ancho = (SELECT MIN(v) FROM (SELECT max_ancho AS v FROM filas UNION ALL SELECT max_ancho FROM color) x),
    min_alto  = (SELECT MAX(min_alto) FROM filas),
    max_alto  = (SELECT MIN(max_alto) FROM filas),
    -- Para explicar el límite al usuario: de dónde sale el ancho máximo
    origen_max_ancho = CASE
        WHEN (SELECT max_ancho FROM color) IS NOT NULL
         AND (SELECT max_ancho FROM color) <= ISNULL((SELECT MIN(max_ancho) FROM filas), 99999) THEN 'COLOR'
        ELSE (SELECT TOP 1 descripcion FROM filas WHERE max_ancho IS NOT NULL ORDER BY max_ancho, tejido DESC) END,
    origen_min_ancho = (SELECT TOP 1 descripcion FROM filas WHERE min_ancho IS NOT NULL ORDER BY min_ancho DESC, modelo_acc DESC),
    n_filas = (SELECT COUNT(*) FROM filas);
GO

/* Comprobaciones rápidas, cliente 1 (esperado entre corchetes). Cualquier otro cliente: sin límites salvo el rollo del color.
select * from dbo.fn_limites_fabricacion(1,1,1,1,NULL,13,NULL)   -- Arce opaco cadena      [60-280 x 60-300]
select * from dbo.fn_limites_fabricacion(1,1,1,1,NULL,59,NULL)   -- Serge out              [60-200 x 60-300]
select * from dbo.fn_limites_fabricacion(1,1,1,3,1141,13,NULL)   -- Arce + AM35 PLUS L     [90-280 x 60-300]
select * from dbo.fn_limites_fabricacion(1,1,1,16,NULL,13,NULL)  -- Magic                  [100-180 x 60-180]
select * from dbo.fn_limites_fabricacion(1,1,2,NULL,NULL,13,NULL)-- Cajón ZIP              [100-300 x 100-300]
select * from dbo.fn_limites_fabricacion(1,4,NULL,NULL,NULL,NULL,NULL) -- Compac           [40-120 x 60-220]
select * from dbo.fn_limites_fabricacion(1,3,2,NULL,NULL,NULL,NULL) -- Vertical tejido     [- x 100-300]
select * from dbo.fn_limites_fabricacion(1,3,4,NULL,NULL,NULL,NULL) -- Vertical inclinada  [100-280 x 100-400]
*/
