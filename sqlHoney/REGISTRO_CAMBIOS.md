# Fabricación por reglas (motor v3) — HoneyComb (tipo 7)

Objetivo: personalizar la fabricación desde `routes/herstellen/artikeln_fab_cd_v3`, con la misma metodología que
CortinaDecor (`sp_fabricacion_mrp_cd`), sin cambiar los demás tipos. Hoy solo usa el motor la **HoneyComb**; está
preparado para migrar otros sistemas (catálogo de sistemas) y para fabricaciones distintas por **cliente**.

## Orden de ejecución (SQL)

| Script | Qué hace | DEV | TEST | PROD |
|---|---|---|---|---|
| `01_tablas_motor_fabricacion.sql` | `SOL_FABRICACION_SISTEMAS` (alta HONEYCOMB), `SOL_FABRICACION_PARAMETROS` (+11 parámetros base HoneyComb), columna `cliente` en `SOL_ARTICULOS_FABRICACION_RELACION_V2`, `SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS`, columnas `valores_tabla/valor/texto` en `SOL_FABRICACION_PARAMETROS` (catálogo de valores posibles, enlazado para los 8 parámetros de tejido, perfil y accionamiento). **2026-10-06 (tejido):** tipos de parámetro `BUSQUEDA` y `TABLA` (columnas `busqueda`, `tabla`), `SOL_FABRICACION_BUSQUEDAS` (3 búsquedas), `SOL_FABRICACION_TABLAS` / `_VALORES` | ✅ 2026-10-05 · ✅ 2026-10-06 (tejido) | ⏳ | ⏳ |
| `02_sol_pedidos_cola_tipo_7_add.sql` | Crea la línea tipo 7 en `SOL_PEDIDOS_COLA_LINEAS`; `TIPO_7.idrow` = id de línea. **2026-10-06:** `@ancho`/`@alto` pasan de `INT` a `DECIMAL(12,2)` (medidas de 0,5 en 0,5 cm, rama `cambios_configurador`) | ✅ 2026-09-29 · ✅ 2026-10-06 (decimales) | ⏳ | ⏳ |
| `03_migracion_lineas_tipo_7.sql` | Repunta las filas `TIPO_7` antiguas (idrow = pedido) a una línea nueva | ✅ 2026-09-29 (2 filas) | ⏳ | ⏳ |
| `04_temp_sp_fabricacion_tipo_7.sql` | Motor genérico (`fn_fabricacion_condicion`, `fn_fabricacion_pos_operador`, `sp_fabricacion_evaluar` con cadenas de operaciones, `sp_fabricacion_reglas_parametros`, `sp_fabricacion_reglas_aplicar`) y el nuevo `temp_sp_fabricacion_tipo_7`. **2026-10-06 (tejido):** operandos que son parámetros (`@A ** @B`), operación `*T`, parámetros `BUSQUEDA`/`TABLA`, artículo dinámico (`@PARAM` en Artículos) con línea `SIN ARTÍCULO` si no se resuelve, `fn_fabricacion_articulos_detalle` | ✅ 2026-09-29 · ✅ 2026-10-06 (tejido) | ⏳ | ⏳ |
| `05_sps_configuracion_fabricacion.sql` | SPs de reglas/parámetros (`sp_fabricacion_regla_*`, `sp_fabricacion_parametro_*`, `sp_fabricacion_parametros_valores`), limitados a sistemas del catálogo. **2026-10-06 (tejido):** `sp_fabricacion_parametro_edit` admite `BUSQUEDA`/`TABLA`; nuevos `sp_fabricacion_tabla_guardar` / `_borrar` | ✅ 2026-10-05 · ✅ 2026-10-06 (tejido) | ⏳ | ⏳ |
| `06_sp_fichero_produccion_2.sql` | Bloque XML `articulo = 7` → `<Articulo>220.00</Articulo>` (hasta 2026-10-06: `22000`). **2026-10-06:** las líneas sin artículo (`SIN ARTÍCULO`) no van al XML | ✅ 2026-09-29 · ✅ 2026-10-06 | ⏳ | ⏳ |
| `07_datos_tabla_alto_pliegues_honeycomb.sql` | Datos: tabla `HONEYCOMB / ALTO_PLIEGUES` de `honeycombAltura.xlsx` (alto 30-280 cm → cm de tejido, 251 filas). Solo carga si no existe | ✅ 2026-10-06 | ⏳ | ⏳ |
| `08_datos_configuracion_honeycomb.sql` | Datos: 4 parámetros del tejido, 37 reglas HONEYCOMB + la regla del TEJIDO y Referencias de los colores de tejido, generado desde DEV (2026-10-08). Idempotente: solo añade lo que falta, no modifica ni borra; avisa de lo que difiere. Probado en DEV con rollback (DEV tal cual, BD sin configuración, caso parcial) | ✅ 2026-10-08 | ⏳ | ⏳ |

Scripts idempotentes. Ejecutar con `SET QUOTED_IDENTIFIER ON` (ya incluido; el motor usa métodos XML).
Con sqlcmd: `sqlcmd -S ... -d <BD> -I -f 65001 -b -i <script>`.

**Relación con la rama `cambios_configurador`** (2026-10-06): esa rama pasa a `decimal(12,2)` las columnas
`ancho`/`alto` de `SOL_PEDIDOS_COLA_TIPO_7` (`sqlMedidas/004`) y los parámetros de este SP (`sqlMedidas/005`, que lee
la definición que haya en la BD y solo cambia esos dos tipos, sin traer el cuerpo). El 02 ya lleva `DECIMAL(12,2)`,
así que el orden de aplicación entre las dos ramas da igual. Hasta que se aplique el 004, las columnas siguen en
`int` y el decimal se redondea al guardar, como hasta ahora.

**Orden de despliegue:** los SQL 01→07 y el backend a la vez que el frontend. El script 02 debe ir junto al 03
para que no convivan pedidos nuevos y antiguos con distinto significado de `idrow`.

`06` reemplaza `sp_fichero_produccion_2` completo (copia de DEV + bloque `if @articulo = 7`); la versión de PROD es
idéntica a la de DEV, así que el script es válido tal cual.

Copias de las versiones anteriores en `backup/` (DEV 2026-09-29; scripts 04-06 antes del tejido: `*_antes_tejido_20261006.sql`).

Documentación: `flujoHC.md` (funcionamiento), `diagramaFabricacionV3.md` (diagramas y plantilla para otros
productos), `GUIA_CONFIGURACION_FABRICACION.md` (uso de la pantalla).

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
- **2026-10-06 — Referencia de colores de tejido (preparación del tejido en fabricación).** En
  `manza/honeycomb-admin-data`, pestañas Colores de Tejido y Colores de Perfil, el campo *Referencia* ofrece un
  desplegable de artículos Solupyme (código + descripción) para escribir bien el `cod_solupyme`. Sigue guardándose
  como texto en `SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO.Referencia` / `..._COLORESPERFIL.Referencia` (sin FK ni validación). Endpoint nuevo
  `GET /api/sm/honeycomb_articulos_buscar?q=` (`honeycomb.js`, `Auth.ensureAuth`; cada palabra en código o
  descripción, máx. 50). Sin cambios en BD. Estado: DEV ✅ · TEST ⏳ · PROD ⏳.
  - **2026-10-07:** el desplegable nativo (`datalist`) se cambia por una **ventana de búsqueda**: botón lupa junto a
    Referencia → buscador con lista código/descripción → al pulsar un artículo se rellena. El campo ya no se puede
    escribir a mano (solo elegir de la lista o quitar con ✕), así que desde la pantalla no se pueden guardar
    códigos inexistentes; los que lleguen por *Importar Excel* siguen marcándose en rojo. Solo frontend
    (`honeycomb-admin-data` ts/html/scss); mismo endpoint. Probado en DEV (búsqueda, elegir, Escape).
- **2026-10-06 — Tejido en la fabricación (artículo y consumo automáticos).**
  - Backend `fabricacion_reglas.js`: `GET /fabricacion/busquedas`, `GET /fabricacion/tablas`,
    `GET /fabricacion/tablas/valores`, `POST /fabricacion/tablas` (guardar tabla completa; el XML para el SP se
    construye solo con números), `POST /fabricacion/tablas/delete`; `parametros` devuelve `busqueda`/`tabla`;
    `parametro_edit` los envía; la columna Artículos usa `fn_fabricacion_articulos_detalle` (admite `@PARAM`).
  - Backend `honeycomb.js`: `GET /api/sm/honeycomb_articulos_existen?codigos=` (qué Referencias existen en Solupyme).
  - Frontend v3: tipos de parámetro *Búsqueda* y *Tabla de valores*; pestaña **Tablas** (editar, importar Excel,
    guardar, borrar); en la regla, "+ Artículo según el pedido" (artículo dinámico); operandos con parámetro
    (desplegable al escribir `@`) y operación *por (2 decimales, sin redondear)* `*T`; simulación con las líneas
    `SIN ARTÍCULO` y consumo `-1` en rojo y aviso.
  - Frontend admin-data: Referencias que no existen en Solupyme en rojo (tejido y perfil).
  - Estado: DEV ✅ · TEST ⏳ · PROD ⏳.

## Cómo funciona

1. **Sistemas** (`SOL_FABRICACION_SISTEMAS`): cada sistema indica `tipo_linea`, `tabla_origen` (datos del pedido),
   `tabla_fabricacion`, `tabla_parametros` y `procedimiento`. Solo los sistemas activos del catálogo son editables
   desde la pantalla (las reglas `ENROLLABLE` del modelo SM antiguo y las de CortinaDecor quedan fuera).
2. **Parámetros** (`SOL_FABRICACION_PARAMETROS`, por sistema), editables en la pantalla:
   - `COLUMNA`: valor de una columna de la `tabla_origen` del sistema (validada contra `sys.columns`).
   - `FORMULA`: expresión `++ -- ** *R *T` sobre parámetros anteriores (se calculan por `orden`); los operandos
     pueden ser números o parámetros. `*T` multiplica y deja 2 decimales sin redondear.
   - `BUSQUEDA`: el valor de otro parámetro buscado en `SOL_FABRICACION_BUSQUEDAS` (tabla + columna clave + columna
     resultado, solo por script). Ej.: `@TEJIDO_COLOR_ID` → `Referencia` del color → `idrow` del artículo.
   - `TABLA`: el valor de `SOL_FABRICACION_TABLAS_VALORES` con la menor clave ≥ el valor de otro parámetro
     (150,5 → fila 151). Sin fila (por encima de la última) = vacío → consumo `-1`.
3. **Reglas** (`SOL_ARTICULOS_FABRICACION_RELACION_V2`, `sistema` + `cliente`): hasta 4 condiciones
   (`==`, `>>`, `>=`, `<<`, `<=`, `a <= @P <= b`, sin distinguir mayúsculas ni espacios).
   Op `O` = OR con la anterior; `Y`/`-` = AND. Condición vacía = se ignora; sin condiciones = siempre.
4. **Cliente** (`SOL_CLIENTES.idrow`, NULL = Todos): si el cliente del pedido (`SOL_PEDIDOS_COLA.cliente`) tiene
   reglas propias en el sistema, se usan **solo las suyas**; si no, las de Todos.
5. **Consumo**: uno por artículo separado por `;` (uno solo vale para todos; vacío = 1). Igual que CD:
   en artículos de unidad 3 (metros) el consumo se escribe en cm y se divide entre 100.
   **Artículos**: ids o `@PARAMETRO` (artículo según el pedido). Si el parámetro no da un artículo existente, se
   genera la línea `SIN ARTÍCULO: <elemento> (@PARAM = valor)` con `articulo` NULL: sale en la hoja y en la
   simulación (en rojo), **no** en el XML.
   **Tejido HoneyComb (configurado en DEV 2026-10-06)**: `@TEJIDO_REFERENCIA` (BUSQUEDA de `@TEJIDO_COLOR_ID`),
   `@TEJIDO_ARTICULO` (BUSQUEDA de la referencia), `@TEJIDO_ANCHO = @ANCHO -- 5` (valor de ejemplo, a confirmar),
   `@TEJIDO_ALTO` (TABLA `ALTO_PLIEGUES` de `@ALTO`), `@TEJIDO_M2 = @TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001`, y la
   regla orden 350 `TEJIDO`: artículo `@TEJIDO_ARTICULO`, consumo `@TEJIDO_M2`.
6. **Salida HoneyComb**: `SOL_PEDIDOS_COLA_TIPO_7_FABRICACION` + `SOL_PEDIDOS_COLA_TIPO_7_PARAMETERS`; el XML usa
   `FACTOR = consumo`, `CANT = 1` por unidad, `P1/P2 = ancho/alto` en metros.

**Migrar otro producto al motor**: alta en `SOL_FABRICACION_SISTEMAS`, sus parámetros, y un procedimiento como
`temp_sp_fabricacion_tipo_7` (llama a `sp_fabricacion_reglas_parametros` y `sp_fabricacion_reglas_aplicar` y escribe
en sus tablas). La simulación de la pantalla asume la misma estructura que el tipo 7:
`tabla_fabricacion.idrow` / `tabla_parametros.idrow` → `tabla_origen.id`; `tabla_origen.idrow` → línea del pedido.

## Checklist de paso a PRODUCCIÓN

1. **Copia de seguridad** en PROD de: `temp_sp_fabricacion_tipo_7`, `sol_pedidos_cola_tipo_7_add`, `sp_fichero_produccion_2`.
2. **SQL** en PROD, en este orden y seguidos: `01` → `02` → `03` → `04` → `05` → `06` → `07` → `08`.
   - `08` lleva los datos de configuración (ver paso 5). Leer sus mensajes y avisos al terminar: reglas que ya existían y
     difieren (no se tocan), artículos que no existen en PROD y Referencias sin artículo.
   - `03` imprime cada fila HoneyComb migrada (pedido → línea nueva); guardar la salida.
   - `06`: la versión de PROD es idéntica a la de DEV/TEST (confirmado 2026-09-29).
3. **Backend** (reiniciar el servicio):
   - `backend/controllers/sm/fabricacion_reglas.js` (nuevo)
   - `backend/routes/sm_routes.js`
   - `backend/controllers/sm/export.js`
   - `backend/controllers/sm/honeycomb.js` (buscador y comprobación de Referencias)
4. **Frontend**: `ng build --prod` con `artikeln-fac-cd-v3` (ts + html + css + util), `manza/honeycomb-admin-data` y
   `manza/honeycomb/honeycomb.service.ts`, y copiar el build a `backend/dist/`.
5. **Datos de configuración**: las reglas (`SOL_ARTICULOS_FABRICACION_RELACION_V2`) y los parámetros
   (`SOL_FABRICACION_PARAMETROS`, incluidos los de tejido) son **datos**, no código. La tabla `ALTO_PLIEGUES` sí va
   en el script `07`. Las Referencias de los colores (admin-data) también son datos: lo que se configure en DEV/TEST no pasa solo a PROD.
   Van en el script `08` (generado desde DEV el 2026-10-08): si la configuración de DEV cambia después, hay que
   regenerarlo (el generador no está en el repo; se puede rehacer desde las tablas). Comprobar que los ids de artículo
   coinciden en PROD: el propio script lo avisa al final.
6. **Permisos**: dar `fab_config` (Setup → Usuarios → Fabricación → Configuración) a quien vaya a configurar.
7. **Tests**: `node backend/test/fabricacion/run.js` contra TEST, antes de PROD. Tiene que dar 0 FALLOS, salvo los que estén aceptados en *Pendiente*.
8. **Comprobación**: simular un pedido HoneyComb real en la pantalla y revisar el XML; generar la fabricación de un
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

## Verificación en DEV (2026-10-06, tejido)

- Regresión (pedidos 17075, 17063, 17067, 17019, 16988, 16866, 16950, 17076): fabricación de los tipos 1-4 y 7 y XML
  **idénticos** antes y después de aplicar 01/04/05/06/07 (antes de dar de alta la regla de tejido).
- 37 reglas existentes: la columna Artículos da el mismo texto con `fn_fabricacion_articulos_detalle`.
- Pedido 17076 (120 × 150, BEIGE): `@TEJIDO_ARTICULO` = 16578 (04810), (120 − 5) × 210 = 24.150 cm² → **2,41 m²**
  (truncado; redondeado sería 2,42). Alto 20 → fila 30 (0,48 m²); 150,5 → fila 151 (212); alto 300 → consumo `-1`;
  color sin Referencia → línea `SIN ARTÍCULO`, en rojo en la simulación y fuera del XML (68 componentes en vez de 70).
- `@ANCHO -- 1.5 ** 2` sigue dando 237; parámetro inexistente → `-1`.
- Validaciones: parámetro de entrada inexistente o posterior, búsqueda o tabla inexistentes, tabla con claves
  repetidas, valores no numéricos o nombre inválido, borrar una tabla en uso: rechazados.
- Pantalla probada en el navegador (parámetros, tablas, regla con artículo dinámico, simulación, admin-data con
  Referencia inexistente en rojo). Importar Excel en la pestaña Tablas no se probó en el navegador.
- Nota: en DEV `SOL_PEDIDOS_COLA_TIPO_7.alto` sigue en `int` (el 004 de `sqlMedidas` no está aplicado en DEV), así que
  un pedido de DEV no puede guardar 150,5; la búsqueda con 150,5 se comprobó directamente.

## Robustez y batería de tests (2026-10-07)

**Tests:** `node backend/test/fabricacion/run.js`. Hay 8 secciones; ver `backend/test/fabricacion/README.md`.
- Corren dentro de una transacción con rollback: la BD queda igual, comprobado con checksums antes y después.
- Incluyen un pedido de principio a fin con el código real del backend.
- Resultado en DEV: **74 OK, 1 FALLO, 6 AVISOS**. El FALLO y los AVISOS están en *Pendiente*.

**Cambios hechos a raíz de los tests (DEV ✅ · TEST ⏳ · PROD ⏳):**
- `04` (copia: `backup/04_..._antes_robustez_20261007.sql`). Con datos mal escritos o no numéricos, el motor daba **error de SQL**, lo que paraba la fabricación de todo el pedido:
  - Antes daban error:
    - las condiciones `@COLOR >> 5`, `36,1 <= @ANCHO <= 62` y `@ANCHO >> 99,5`;
    - las fórmulas `1,5`, `@P ** 2` con un valor `1,5`, `@ANCHO -- abc`, parámetros con `$`, `.` o `1e5`, y los desbordamientos;
    - artículos `1e5` o `$`.
  - Ahora una condición así **no se cumple**, una fórmula da **`-1`** y un artículo mal escrito se ignora.
  - `fn_fabricacion_condicion` evalúa ella misma, sin las `fn_fabricacion_*` antiguas, que siguen intactas para CD:
    - da el mismo resultado en todo lo válido;
    - admite coma decimal;
    - `==` compara como números si los dos lados lo son (`150 == 150.00`), necesario cuando ancho/alto pasen a decimal.
  - `sp_fabricacion_evaluar` ya no usa `sp_fabricacion_tag`:
    - todo se calcula de izquierda a derecha y con `try_cast`;
    - da el mismo resultado que antes con números de 2 decimales (comprobado en 72 casos);
    - con más decimales ahora es exacto: `@ANCHO ** 0.0133` daba 1,50 y ahora da 2,00;
    - un parámetro de texto o vacío daba `0` y ahora da `-1`;
    - `0.01 *R @ALTO *R 2` daba `0`.
  - Artículos de una regla: solo dígitos, como en la pantalla.
- `05` (copia: `backup/05_..._antes_robustez_20261007.sql`):
  - los nombres de parámetro y de tabla aceptaban `Ñ` y tildes, por la collation;
  - ahora se validan con `Latin1_General_BIN`.
- `fabricacion_reglas.js`: el mensaje de tipo no válido incluye BUSQUEDA y TABLA.
- `honeycomb.js`: en el buscador de artículos, `%` y `_` se buscan como texto; antes eran comodines.
- `fabricacion-reglas.util.ts`: acepta `*r` / `*t` en minúscula, como SQL, y los guarda en mayúscula.
- **Regresión:**
  - XML idéntico al `sp_fichero_produccion_2` original fuera de la HoneyComb en 17 pedidos reales;
  - el tipo 7 no toca otros tipos;
  - fabricación y XML de los 8 pedidos de referencia, idénticos antes y después.
- **Importar Excel** en la pestaña Tablas, probado en el navegador: 251 filas sin guardar.

## Medidas de corte del tejido en el XML (2026-10-07)

**Problema:** el tejido de la HoneyComb iba al XML (`<Cn_P1>` / `<Cn_P2>`) con el ancho y el alto de la cortina, como todos los
componentes. En CortinaDecor (`sp_fabricacion_mrp_cd`), en cambio, el tejido lleva sus propias medidas de corte.
- Comprobado en un pedido real: cortina de 287 × 272,5; el tejido lleva 282,5 × 297,5; el resto de componentes, 2,87 × 2,73.

**Solución** (DEV ✅ · TEST ⏳ · PROD ⏳):
- `01`: dos columnas nuevas en `SOL_ARTICULOS_FABRICACION_RELACION_V2`, `param_ancho` y `param_alto`. Indican el parámetro del que sale el ancho / alto (cm) de la fila de la regla. Si son NULL, se usan las medidas de la línea, como antes.
- `04`:
  - `sp_fabricacion_reglas_aplicar` devuelve esas medidas (`ancho, alto, con_ancho, con_alto`);
  - `temp_sp_fabricacion_tipo_7` las guarda en la fila. Si el parámetro no se puede calcular, la medida queda vacía (0 en el XML), nunca la de la cortina.
- `05`:
  - nueva `fn_fabricacion_parametro_medida`;
  - `sp_fabricacion_regla_add/edit` aceptan `@param_ancho/@param_alto`, opcionales;
  - `regla_update` acepta los campos `param_ancho/param_alto`;
  - un parámetro inexistente devuelve -3.
- Backend (`fabricacion_reglas.js`) y pantalla: sección **Medidas del componente** en la ventana de la regla.
- Configuración DEV:
  - regla del tejido: consumo `@TEJIDO_ANCHO ** @TEJIDO_ALTO *T 0.0001`, ancho `@TEJIDO_ANCHO`, alto `@TEJIDO_ALTO`;
  - borrado el parámetro `@TEJIDO_M2`, porque el consumo va en la regla.
- **Resultado:**
  - en el pedido 19090 el tejido pasa de `P1=1,000000 P2=1,000000` a `P1=0,990000 P2=1,400000`;
  - el `FACTOR` (m²) y la hoja de fabricación son idénticos en los 9 pedidos de referencia;
  - el resto de componentes no cambian.
- **A confirmar con producción / ERP:** que esperan en `P1`/`P2` del tejido el ancho de corte y los pliegues.

**Además: orden de las líneas del XML.**
- `sp_fichero_produccion_2` devolvía las líneas con `select value from @CSV` sin `order by`, y SQL Server no garantiza ese orden.
- En DEV, el último bloque del pedido 16866 salió al principio (XML roto).
- `06`: columna `n identity` y `order by n`. Afecta a todos los productos, y es la misma salida pero siempre en orden.
- `sp_fichero_produccion_cd_2_V2` (CortinaDecor) tiene el mismo problema y no se ha tocado.

**Copias de seguridad:**
- `backup/01_..._antes_tejido_cortes_20261007.sql`
- `backup/04_..._antes_tejido_cortes_20261007.sql`
- `backup/05_..._antes_tejido_cortes_20261007.sql`
- `backup/06_..._antes_orden_xml_20261007.sql`

**Tests** (79 OK, 1 FALLO conocido: alto > 280 cm):
- medidas en el motor aislado, en los controladores, en el pedido de principio a fin y en la validación de la pantalla;
- XML en orden en todos los pedidos de muestra.
- Se encontró y corrigió en la pantalla:
  - los campos nuevos no estaban en `datafields` del grid;
  - por eso, al guardar la regla se habrían borrado las medidas.

## Consumos con 4 decimales (2026-10-07)

**Decisión:** el consumo del tejido se trunca a **4 decimales** (antes 2). Ejemplo: 99 × 140 cm = 13.860 cm² = **1,3860 m²** (antes 1,38).

**Cambio** (DEV ✅ · TEST ⏳ · PROD ⏳):
- `04`: `*T` trunca a 4 decimales. El resultado de `sp_fabricacion_evaluar`, los parámetros FORMULA, el consumo de las reglas y de los componentes pasan de `decimal(12,2)` a `decimal(18,4)`. Antes todo el camino redondeaba a 2 decimales, aunque la tabla de fabricación ya guardaba 6. Copia: `backup/04_..._antes_4_decimales_20261007.sql`.
- Un resultado de 1.000.000 o más devuelve -1. No cabe en la columna `consumo` (`decimal(12,6)`) y daría un error de SQL al guardar. Pasaba ya con valores entre 1 millón y 10.000 millones.
- Pantalla: el texto de `*T` pasa a *4 decimales, sin redondear*.
- Los parámetros FORMULA se guardan ahora con 4 decimales (`99.0000`; antes `99.00`).
- Las condiciones siguen comparando con 2 decimales.

**Efecto en los pedidos de referencia:**
- El tejido pasa de 1,38 a 1,386 m² (pedido 19090) y de 2,49 a 2,499 (17076).
- El `FACTOR` del XML pasa a `1,386000`.
- Lo demás no cambia en ningún pedido, ni en la HoneyComb ni en los demás tipos.
- Una regla con operaciones de más de 2 decimales (p. ej. `@ANCHO ** 0.0133`) ahora da 1,995 y no 2,00.
- **A confirmar con producción / ERP:** que aceptan m² con 4 decimales.

## Decisiones sobre `sp_fichero_produccion_2` (2026-10-07)

`sp_fichero_produccion_2` genera el XML de producción de **todos** los productos de SM (tipos 1, 2, 3, 4 y 7), así que cualquier cambio es sobre un objeto compartido.

**Decisión: se mantiene el orden garantizado de las líneas del XML.**
- Cambio: `@CSV` lleva una columna `n identity` y el resultado final se devuelve con `order by n`.
- Motivo: sin `order by`, SQL Server no garantiza el orden. En DEV, el final del pedido 16866 (`</Detalles></root>`) salió al principio y el XML quedó roto.
- Efecto en los demás productos: ninguno en el contenido. Con 19 pedidos reales de todos los tipos, el contenido es idéntico al del procedimiento original, comparando las líneas ordenadas.
- Copias de seguridad:
  - `backup/sp_fichero_produccion_2_DEV_20260929.sql`: versión original, anterior a la HoneyComb;
  - `backup/06_sp_fichero_produccion_2_antes_tejido_20261006.sql`;
  - `backup/06_sp_fichero_produccion_2_antes_orden_xml_20261007.sql`: justo antes del orden.
- Pendiente: `sp_fichero_produccion_cd_2_V2` (CortinaDecor) tiene el mismo riesgo y no se ha tocado.

**Decisión: el código de producto de la HoneyComb en el XML pasa de `22000` a `220.00`.**
- Es el valor de `<Articulo>` de cada `<Detalles>` HoneyComb.
- Copia: `backup/06_sp_fichero_produccion_2_antes_codigo_220_20261007.sql`.
- Comprobado en los 9 pedidos de referencia: solo cambia ese código. Los pedidos sin HoneyComb no cambian.
- **A confirmar con el ERP:** que existe el producto `220.00`.

## Sección del XML: clasificación del artículo (2026-10-07)

**Problema:** la etiqueta `Cn_SECCION` del XML de la HoneyComb salía de `articulos.seccion`, vacío en 25 de los ~28 artículos HoneyComb.
- El XML llevaba `0` en casi todos los componentes.
- CortinaDecor (`sp_fabricacion_mrp_cd`) y el enrollable de SM (la fabricación real) la sacan de `articulos.clasificacion` y ponen `99` si está vacía.

**Qué es cada campo** (deducido de los datos; no hay tabla que explique `clasificacion`):
- `articulos.clasificacion` es la categoría del material:
  - 01 perfilería y piezas principales;
  - 02 tejido y mano de obra de corte;
  - 03 termosellado;
  - 04 piezas pequeñas y accesorios;
  - 05 seguridad infantil y empaquetado;
  - 06 embalaje.
- `articulos.seccion` es otra cosa: el producto (`SOL_SECCIONES`: Enrollables, Verticales, Compac, Menorca...). La HoneyComb no figura ahí.

**Cambio** (DEV ✅ · TEST ⏳ · PROD ⏳):
- `04`: `seccion = isnull(clasificacion,'99')` en la fila de fabricación HoneyComb. Copia: `backup/04_..._antes_seccion_20261007.sql`.
- Comprobado en los 9 pedidos de referencia: en la hoja y en el XML solo cambia la sección; los tipos 1-4 no cambian.
- Ejemplo (pedido 19090):
  - tejido 04759: `SECCION=02` (antes 0);
  - perfilería, cordón y cinta: 01;
  - tornillería y piezas: 04;
  - fleje y precinto: 06 (antes 7);
  - etiqueta de producción: 04 (antes 7).
- Esos tres artículos se comparten con Menorca: tenían `seccion = 7`, ahora llevan su clasificación, como en CortinaDecor.
- **A confirmar con quien lleve el ERP:** qué hace el ERP con `SECCION`. Cambia el valor en casi todos los componentes de la HoneyComb.

## Pendiente / supuestos a confirmar

- `[preexistente]` En el tipo 3 (vertical), si `TipoLama` es NULL, la línea que abre `<Detalles>` sale NULL y el XML queda roto.
  - En DEV pasa en los pedidos de prueba 17051, 17052, 17057, 17062 y 17063.
- `[preexistente]` `sp_fichero_produccion_cd_2_V2` (CortinaDecor) devuelve las líneas del XML sin `order by`. Es el mismo riesgo que se ha corregido en `sp_fichero_produccion_2`.

- **DECIDIR — alto fuera de `ALTO_PLIEGUES` (> 280 cm):**
  - Hoy el tejido sale con consumo `-1` en la hoja (en rojo) **y en el XML de producción**. Es el FALLO de la sección 5.
  - Como el configurador no va a limitar las medidas, puede pasar.
  - Opciones:
    1. no mandar al XML las líneas con consumo `-1`, como SIN ARTÍCULO;
    2. bloquear la generación del XML del pedido;
    3. ampliar la tabla.
- `[preexistente]` La referencia del cliente va a `<DescCliente>` del XML sin escapar. Con `&` o `<` el fichero no es XML válido.
  - Afecta a todos los productos (`sp_fichero_produccion_2`).
- Configuración incompleta (AVISOS de la sección 7):
  - CASQUILLO no tiene regla para ancho < 30, > 130 ni en los saltos entre tramos con decimales (36,0–36,1, 62,0–62,1, 88,1–88,2);
  - solo hay reglas de perfil para BLANCO RAL 9016;
  - ninguna regla depende del accionamiento.

- `<Precio>` del XML HoneyComb = `T7_PVP_C1` (o `T7_PVP` si es nulo). `T7_PVP_C1` ya es cantidad × precio de
  tarifa: lo calcula `honeycomb_obtener_tarifa` (`pvp_c1 = cantidad * precio`), así que no se vuelve a multiplicar.
  Con cantidad > 1 cada `<Detalles>` lleva ese total (igual que el tipo 1): confirmar con el ERP.
- Presupuestos (`/api/lm/budget_hinzu2`) no guardan líneas tipo 7.
- Tejido: confirmar el descuento de ancho (`@TEJIDO_ANCHO = @ANCHO -- 5` es un ejemplo). Los 5 colores translúcidos
  no tienen artículo en Solupyme ni Referencia, y tienen `idTipoTejido = 8` cuando TRASLÚCIDO es el 10 (por eso
  tampoco salen en admin-data). MARFIL (04756) existe como artículo pero no como color.
- `GET /api/artikel_fabric_setup_sm` (`artikeln.js`, ninguna pantalla lo usa) lista todas las reglas con
  `fn_get_articles`, que falla con un artículo `@PARAM`; si se vuelve a usar, cambiarlo a `fn_fabricacion_articulos_detalle`.
- `temp_sp_fabricacion_tipo_7` con `@real = 0` (presupuestos `temp_`) no hace nada: no existen tablas `temp_` de tipo 7.
- `sp_fabricacion_mrp_sm` (modelo SM antiguo, no usado por el router) recorre todas las reglas de
  `SOL_ARTICULOS_FABRICACION_RELACION_V2` sin filtrar por sistema; si algún día se reactiva, filtrar `sistema`.
