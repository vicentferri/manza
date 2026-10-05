# Fabricación por reglas (motor v3) — HoneyComb (tipo 7)

Objetivo: personalizar la fabricación desde `routes/herstellen/artikeln_fab_cd_v3`, con la misma metodología que
CortinaDecor (`sp_fabricacion_mrp_cd`), sin cambiar los demás tipos. Hoy solo usa el motor la **HoneyComb**; está
preparado para migrar otros sistemas (catálogo de sistemas) y para fabricaciones distintas por **cliente**.

## Orden de ejecución (SQL)

| Script | Qué hace | DEV | TEST | PROD |
|---|---|---|---|---|
| `01_tablas_motor_fabricacion.sql` | `SOL_FABRICACION_SISTEMAS` (alta HONEYCOMB), `SOL_FABRICACION_PARAMETROS` (+11 parámetros base HoneyComb), columna `cliente` en `SOL_ARTICULOS_FABRICACION_RELACION_V2`, `SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS`, columnas `valores_tabla/valor/texto` en `SOL_FABRICACION_PARAMETROS` (catálogo de valores posibles, enlazado para los 8 parámetros de tejido, perfil y accionamiento) | ✅ 2026-10-05 | ⏳ | ⏳ |
| `02_sol_pedidos_cola_tipo_7_add.sql` | Crea la línea tipo 7 en `SOL_PEDIDOS_COLA_LINEAS`; `TIPO_7.idrow` = id de línea | ✅ 2026-09-29 | ⏳ | ⏳ |
| `03_migracion_lineas_tipo_7.sql` | Repunta las filas `TIPO_7` antiguas (idrow = pedido) a una línea nueva | ✅ 2026-09-29 (2 filas) | ⏳ | ⏳ |
| `04_temp_sp_fabricacion_tipo_7.sql` | Motor genérico (`fn_fabricacion_condicion`, `fn_fabricacion_pos_operador`, `sp_fabricacion_evaluar` con cadenas de operaciones, `sp_fabricacion_reglas_parametros`, `sp_fabricacion_reglas_aplicar`) y el nuevo `temp_sp_fabricacion_tipo_7` | ✅ 2026-09-29 | ⏳ | ⏳ |
| `05_sps_configuracion_fabricacion.sql` | SPs de reglas/parámetros (`sp_fabricacion_regla_*`, `sp_fabricacion_parametro_*`, `sp_fabricacion_parametros_valores`), limitados a sistemas del catálogo | ✅ 2026-10-05 | ⏳ | ⏳ |
| `06_sp_fichero_produccion_2.sql` | Bloque XML `articulo = 7` → `<Articulo>22000</Articulo>` | ✅ 2026-09-29 | ⏳ | ⏳ |

Scripts idempotentes. Ejecutar con `SET QUOTED_IDENTIFIER ON` (ya incluido; el motor usa métodos XML).
Con sqlcmd: `sqlcmd -S ... -d <BD> -I -f 65001 -b -i <script>`.

**Orden de despliegue:** los SQL 01→06 y el backend a la vez que el frontend. El script 02 debe ir junto al 03
para que no convivan pedidos nuevos y antiguos con distinto significado de `idrow`.

`06` reemplaza `sp_fichero_produccion_2` completo (copia de DEV + bloque `if @articulo = 7`); la versión de PROD es
idéntica a la de DEV, así que el script es válido tal cual.

Copias de las versiones anteriores en `backup/` (DEV 2026-09-29).

## Código

- `backend/controllers/sm/fabricacion_reglas.js` (nuevo) y rutas `/api/sm/fabricacion/*` en
  `backend/routes/sm_routes.js` (con `Auth.ensureAuth`): sistemas, clientes, reglas, parámetros, columnas, simular.
- `backend/controllers/sm/export.js`: la hoja de fabricación (`getDetail`, `getDetail_ID`) incluye el tipo 7.
- `frontend/.../artikeln-fac-cd-v3`: pantalla del motor (selector de sistema, parámetros, reglas con cliente,
  simulación, XML). Tabla de reglas de solo lectura con acciones (editar / duplicar / borrar), columna de estado
  con validación, ventana de edición con desplegables y ajuste de columnas al contenido.
  `fabricacion-reglas.util.ts` (nuevo): interpretación, reconstrucción y validación de condiciones y consumos.
- Endpoints añadidos: `/fabricacion/articulos`, `/fabricacion/reglas/save` (`sp_fabricacion_regla_edit`),
  `/fabricacion/parametros/valores` (`sp_fabricacion_parametros_valores`: desplegable de valores en las condiciones).

## Cómo funciona

1. **Sistemas** (`SOL_FABRICACION_SISTEMAS`): cada sistema indica `tipo_linea`, `tabla_origen` (datos del pedido),
   `tabla_fabricacion`, `tabla_parametros` y `procedimiento`. Solo los sistemas activos del catálogo son editables
   desde la pantalla (las reglas `ENROLLABLE` del modelo SM antiguo y las de CortinaDecor quedan fuera).
2. **Parámetros** (`SOL_FABRICACION_PARAMETROS`, por sistema), editables en la pantalla:
   - `COLUMNA`: valor de una columna de la `tabla_origen` del sistema (validada contra `sys.columns`).
   - `FORMULA`: expresión `++ -- ** *R` sobre parámetros anteriores (se calculan por `orden`).
3. **Reglas** (`SOL_ARTICULOS_FABRICACION_RELACION_V2`, `sistema` + `cliente`): hasta 4 condiciones
   (`==`, `>>`, `>=`, `<<`, `<=`, `a <= @P <= b`, sin distinguir mayúsculas ni espacios).
   Op `O` = OR con la anterior; `Y`/`-` = AND. Condición vacía = se ignora; sin condiciones = siempre.
4. **Cliente** (`SOL_CLIENTES.idrow`, NULL = Todos): si el cliente del pedido (`SOL_PEDIDOS_COLA.cliente`) tiene
   reglas propias en el sistema, se usan **solo las suyas**; si no, las de Todos.
5. **Consumo**: uno por artículo separado por `;` (uno solo vale para todos; vacío = 1). Igual que CD:
   en artículos de unidad 3 (metros) el consumo se escribe en cm y se divide entre 100.
6. **Salida HoneyComb**: `SOL_PEDIDOS_COLA_TIPO_7_FABRICACION` + `SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS`; el XML usa
   `FACTOR = consumo`, `CANT = 1` por unidad, `P1/P2 = ancho/alto` en metros.

**Migrar otro producto al motor**: alta en `SOL_FABRICACION_SISTEMAS`, sus parámetros, y un procedimiento como
`temp_sp_fabricacion_tipo_7` (llama a `sp_fabricacion_reglas_parametros` y `sp_fabricacion_reglas_aplicar` y escribe
en sus tablas). La simulación de la pantalla asume la misma estructura que el tipo 7:
`tabla_fabricacion.idrow` / `tabla_parametros.idrow` → `tabla_origen.id`; `tabla_origen.idrow` → línea del pedido.

## Checklist de paso a PRODUCCIÓN

1. **Copia de seguridad** en PROD de: `temp_sp_fabricacion_tipo_7`, `sol_pedidos_cola_tipo_7_add`, `sp_fichero_produccion_2`.
2. **SQL** en PROD, en este orden y seguidos: `01` → `02` → `03` → `04` → `05` → `06`.
   - `03` imprime cada fila HoneyComb migrada (pedido → línea nueva); guardar la salida.
   - `06`: la versión de PROD es idéntica a la de DEV/TEST (confirmado 2026-09-29).
3. **Backend** (reiniciar el servicio):
   - `backend/controllers/sm/fabricacion_reglas.js` (nuevo)
   - `backend/routes/sm_routes.js`
   - `backend/controllers/sm/export.js`
4. **Frontend**: `ng build --prod` con `artikeln-fac-cd-v3` (ts + html) y copiar el build a `backend/dist/`.
5. **Datos de configuración**: las reglas (`SOL_ARTICULOS_FABRICACION_RELACION_V2`) y los parámetros
   (`SOL_FABRICACION_PARAMETROS`) son **datos**, no código: lo que se configure en DEV/TEST no pasa solo a PROD.
   O se configuran directamente en PROD tras el despliegue, o se exportan con un script (pendiente de generar cuando
   la configuración esté cerrada). Comprobar que los ids de artículo y de cliente coinciden en PROD.
6. **Permisos**: dar `fab_config` (Setup → Usuarios → Fabricación → Configuración) a quien vaya a configurar.
7. **Comprobación**: simular un pedido HoneyComb real en la pantalla y revisar el XML; generar la fabricación de un
   pedido con Compac (tipo 4) y comprobar que ya no pierde sus componentes.

**Rollback**: volver a crear los 3 procedimientos desde la copia del paso 1. Las tablas nuevas y la columna
`cliente` pueden quedarse (nadie más las usa). Las líneas tipo 7 creadas por `02/03` no afectan a los demás tipos.

## Corrección incluida

El `temp_sp_fabricacion_tipo_7` anterior leía `sol_pedidos_cola_tipo_4` y hacía `DELETE` en
`sol_pedidos_cola_tipo_4_fabricacion`, lo que borraba la fabricación de Compac/SolarMini al generar pedidos con líneas tipo 4
(comprobado en DEV con el pedido 17019: antes quedaba 1 fila; ahora, 17 componentes).

## Verificación en DEV (2026-09-29)

- Regresión con `sp_fabricacion_generate` (force) en los pedidos 17075 (T1), 17063 (T2), 17067 (T3), 16988 (mixto):
  fabricación y XML idénticos antes y después.
- 17019 (T4): fabricación restaurada. 16866 (T1 + HoneyComb): nuevo `<Detalles>` 22000 en el XML.
- Motor probado con reglas de prueba dentro de una transacción con rollback (AND/OR, intervalos, fórmulas,
  varios artículos/consumos, unidad en metros); ciclo completo por API sobre el backend local.
- `sp_fabricacion_evaluar` quita los espacios de la expresión (la forma de 3 términos `0.01 ** @ALTO ** 2`
  devolvía 0 con espacios).
- Pedido de prueba 17076 (`PRUEBA-HC-CLAUDE`, cliente Leroy Merlin) creado por `/api/lm/bestellungen_hinzu2`:
  línea tipo 7, fabricación y XML correctos.
- Sistemas y cliente: migración de la primera versión (parámetros movidos a `SOL_FABRICACION_PARAMETROS`, reglas
  existentes quedan como Todos). Probado: reglas generales; reglas propias de Leroy sustituyen a las generales; el
  mismo pedido con otro cliente vuelve a las generales; se rechazan cliente inexistente, sistema no catalogado y el
  borrado de reglas `ENROLLABLE`.

## Pendiente / supuestos a confirmar

- `<Precio>` del XML HoneyComb = `T7_PVP_C1` (o `T7_PVP` si es nulo). `T7_PVP_C1` ya es cantidad × precio de
  tarifa: lo calcula `honeycomb_obtener_tarifa` (`pvp_c1 = cantidad * precio`), así que no se vuelve a multiplicar.
  Con cantidad > 1 cada `<Detalles>` lleva ese total (igual que el tipo 1): confirmar con el ERP.
- Presupuestos (`/api/lm/budget_hinzu2`) no guardan líneas tipo 7.
- Tejido en m² (unidad 2): las fórmulas no pueden multiplicar dos parámetros (ancho × alto); falta un parámetro `@M2`.
- `temp_sp_fabricacion_tipo_7` con `@real = 0` (presupuestos `temp_`) no hace nada: no existen tablas `temp_` de tipo 7.
- `sp_fabricacion_mrp_sm` (modelo SM antiguo, no usado por el router) recorre todas las reglas de
  `SOL_ARTICULOS_FABRICACION_RELACION_V2` sin filtrar por sistema; si algún día se reactiva, filtrar `sistema`.
