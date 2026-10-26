# Registro de cambios: fabricación por reglas (motor v3) del enrollable

Todo cambio de código o de BD de la fabricación v3 del enrollable (tipo 1) se anota aquí, con su
estado en cada entorno. LOCAL = `JMANUEL-PC\SQLEXPRESS`, BD `SOLARMANES_DEV` (copia de producción
del 2026-10-21). PROD = `WIN-3JBJPPE5H0N\SQLEXPRESS`, BD `SOLARMANES_DEV`, la despliega el usuario.

Antecedente (en `C:\dev\sqlHoney\22_productos_y_sistemas_fabricacion.sql`, registrado en
`sqlHoney/REGISTRO_CAMBIOS.md`): tabla `SOL_FABRICACION_PRODUCTOS` y columnas `producto` y
`acc_sistema_id` en `SOL_FABRICACION_SISTEMAS`. Cada pareja producto + sistema es un juego de
reglas independiente (`ENROLLABLE_<código del sistema>`). Requisito de los scripts de esta carpeta.

| Script | Qué hace | LOCAL | PROD |
|---|---|---|---|
| `01_sol_pedidos_cola_tipo_1_parameters.sql` | Tabla `SOL_PEDIDOS_COLA_TIPO_1_PARAMETERS` (parámetros calculados por línea, como la del tipo 7) | 2026-10-22 | — |
| `02_temp_sp_fabricacion_tipo_1_v3.sql` | Procedimiento `temp_sp_fabricacion_tipo_1_v3` | 2026-10-22 | — |
| `03_sustituir_fabricacion_tipo_1.sql` | Sustituye la fabricación del enrollable: copia `dev_sp_fabricacion_tipo_1_copia_20261022`, el router llama solo al v3 y se borra el original (se deshace con `03_deshacer_...`) | 2026-10-22 | — |
| `04_busquedas_enrollable.sql` | Búsquedas del enrollable para las reglas: id → código de los catálogos `SOL_ACC_*`, tejido por tipo + color, salida de tejido; búsquedas por producto, de dos claves y con filtro en el motor. Cambia también el 02 (`descripcion2`) | 2026-10-22 | — |
| `05_tejido_del_maestro.sql` | Búsqueda `ENR_TEJIDO_SOLUPYME`: tejido del maestro (`nacc_tejido_id`) -> código Solupyme. `ENR_TEJIDO_ARTICULO` queda marcada como antigua | 2026-10-23 | — |
| `06_xml_cant_factor_enrollable.sql` | XML del enrollable: `CANT` y `FACTOR` según la unidad del artículo (como HoneyComb). Se deshace con `06_deshacer_...` | 2026-10-23 | — |
| `07_parametros_enrollable.sql` | Parámetros estándar de todo juego de enrollable (57), `sp_enrollable_parametros_base`, búsquedas del maestro de tejidos y columna `sp_parametros_base` del producto | 2026-10-23 | — |
| `comprobacion_produccion_solo_lectura.sql` | Antes y después de desplegar: huellas de los SPs que toca el 03, objetos ya existentes y líneas del modelo nuevo | — | — |

## 2026-10-22 · 01 y 02: tabla de parámetros y procedimiento

- `temp_sp_fabricacion_tipo_1_v3(@idPedido, @print, @real)` copia el patrón de
  `temp_sp_fabricacion_tipo_7` y usa los mismos `sp_fabricacion_reglas_parametros` y
  `sp_fabricacion_reglas_aplicar`, que no cambian.
- Solo procesa las líneas de tipo 1 con `nacc_accionamiento_id` (modelo nuevo). Las antiguas,
  incluidas las de Leroy Merlín, no se leen, no se borran y no se escriben.
- El juego de la línea es el de `SOL_FABRICACION_SISTEMAS` con `producto = 1` y
  `acc_sistema_id = nacc_sistema_id`. Sin juego o sin reglas: la línea se queda sin fabricación.
- Solo en modo real (`@real = 1`), como el tipo 7.
- `idpedido` es la posición entre las líneas de tipo 1 del pedido, ordenadas por id de línea.
  Sin columna `precio` (la tabla de fabricación del tipo 1 no la tiene).
- Consumo de los artículos en metros (unidad 3): las reglas lo escriben en cm y se divide por 100.
- Lo llama `sp_fabricacion_generate` desde el script 03. Antes, solo a mano o desde la simulación
  de la pantalla de reglas.
- Prueba: `pruebas/prueba_02_tipo_1_v3.sql`. Se hace dentro de una transacción que se deshace al
  final, sobre el pedido real 7304. Comprueba que el modo presupuesto no hace nada; que hay
  3 componentes y que la regla que no aplica no sale; la conversión de cm a metros; el
  enriquecimiento; la línea SIN ARTÍCULO; los parámetros guardados; que un sistema sin juego da
  hoja vacía; que la línea antigua queda intacta (huella); que no hay duplicados al repetir; y
  que no quedan restos. **10/10 OK** en LOCAL.

## 2026-10-22 · 03: sustitución de la fabricación del enrollable

**Decisión del usuario:** la fabricación actual del enrollable (también la de Leroy Merlín) no se
usa en producción. No deben convivir dos fabricaciones: se guarda una copia de la actual y se
sustituye por la nueva. Las líneas del modelo antiguo no se tocan: ni se calculan ni se borran.

Primero se probó un interruptor por línea, con las dos fabricaciones conviviendo. Se descartó
y se deshizo en LOCAL; sus huellas volvieron a ser las originales. Aquella prueba sacó a la luz
un fallo antiguo de `dev_sp_fabricacion_tipo_1`: arrastra `@grupo` (la contera de los motores)
de una línea a la siguiente cuando el soporte no está en `SOL_ARTICULOS_SOPORTES`. Con la
sustitución deja de importar.

- `03_sustituir_fabricacion_tipo_1.sql` hace tres pasos. Cada uno comprueba lo que espera
  encontrar; si no lo encuentra, se para con un error sin modificar nada. Si ya está aplicado,
  no hace nada.
  1. Crea la copia `dev_sp_fabricacion_tipo_1_copia_20261022` con el texto exacto del actual.
     Solo cambia el nombre de la cabecera, y se comprueba con SHA-256. Nadie la llama. El texto
     también está en `backup/dev_sp_fabricacion_tipo_1_definicion_20261022.sql`, exportado con
     node: misma huella que en la BD, con acentos y CRLF.
  2. En `sp_fabricacion_generate`, la llamada a `dev_sp_fabricacion_tipo_1` pasa a ser
     `temp_sp_fabricacion_tipo_1_v3`. Es un cambio quirúrgico; la llamada que está dentro de un
     comentario no se toca.
  3. Borra `dev_sp_fabricacion_tipo_1`, solo si la copia es idéntica y el router ya no lo llama.
- `03_deshacer_sustituir_fabricacion_tipo_1.sql` recrea el original desde la copia, restaura la
  llamada y borra la copia. Probado: aplicar, deshacer, volver a aplicar, y cada script dos
  veces seguidas.
- Huellas SHA-256 (LOCAL):
  - Original: `dev_sp_fabricacion_tipo_1` D31543E8…, `sp_fabricacion_generate` 23816903….
  - Con el 03: copia 503E0127…, `sp_fabricacion_generate` 7F18B753….
  - El deshacer devuelve exactamente las originales.
- Lo que hacía el SP antiguo, además de su fabricación, y deja de hacerse:
  - `prod_ok` / `prod_reason` del pedido: no se pierde nada. `temp_sp_fabricacion_tipo_3` se
    ejecuta después y siempre los sobrescribe.
  - `update SOL_PEDIDOS_COLA_TIPO_1 set con_color_id = 33, con_color_text = 'NINGUNO' where
    con_color_id = -1`, sobre toda la tabla: deja de ejecutarse.
- Nadie más llama a `dev_sp_fabricacion_tipo_1`: ni objetos de la BD (salvo el comentario de
  `sp_fabricacion_generate`) ni el backend. El precio del enrollable va por otro camino
  (`temp_sp_fabricacion_tipo_1_tarifa`).
- **Regresión (2.5)** con `pruebas/regresion_fabricacion.sql`:
  - Regenera la fabricación de cada pedido dentro de una transacción que se deshace.
  - Muestra: 94 pedidos (los más recientes por tipo 1, 2, 3, 4 y 7 y por cliente, incluidos
    Leroy 1 y 5, más los 5 enrollables con más líneas). Salidas en
    `C:\dev\sqlAccionamientos\pruebas\fab\regresion\`.
  - Dos fotos antes, idénticas entre sí: el proceso es determinista.
  - Después: los tipos 2, 3, 4 y 7 y los parámetros del 7, **idénticos**.
  - Tipo 1: pasa de 5.208 a 2.780 filas. Las líneas antiguas ya no se recalculan y conservan lo
    que tenían guardado. Muchos pedidos de la copia nunca se habían fabricado.
- **Prueba** `pruebas/prueba_03_sustituir.sql`: 7/7 OK, con rollback.
  - Leroy (pedido 17085): la fabricación del enrollable no se toca (mismas filas y mismos id).
  - Pedido 7304, con la línea del medio en el modelo nuevo: sale por reglas con idpedido 2, el
    mismo número que tenía. Las líneas antiguas no se tocan.
  - Un sistema sin juego da la hoja vacía.
- **Producción:**
  - Las líneas del modelo nuevo que ya existan (cliente 4) se fabricaron con el SP antiguo. Al
    regenerarlas con el 03, saldrán sin fabricación hasta que su sistema tenga reglas.
  - Ejecutar `comprobacion_produccion_solo_lectura.sql` antes de desplegar. Debe dar ORIGINAL en
    los dos procedimientos; después, CON EL 03.

## 2026-10-22 · 04: búsquedas del enrollable (paso 2.3)

**Decisión del usuario:**
- El enrollable se fabrica **solo con reglas**, como HoneyComb, y las reglas las hace el usuario
  con su equipo.
- Las tablas de valores (rangos) fueron una excepción de HoneyComb y no se usan en el enrollable.
- Las búsquedas se definen por script.
- Cada juego empieza vacío: no hay "duplicar juego".
- Los **tejidos se van a rehacer** como los accionamientos. Lo hará otro agente e informará de
  los cambios. Por eso todo lo del tejido queda como datos (búsquedas), no como lógica del motor.

**Motor (cambios aditivos):**
- `SOL_FABRICACION_BUSQUEDAS` recibe columnas nuevas opcionales:
  - `producto`: la ven todos los juegos de ese producto.
  - `clave2`: segunda clave; el parámetro tiene origen `@A;@B`.
  - `filtro_columna` y `filtro_valor`: filtro fijo.
  - `texto`: nombre legible para el desplegable de las condiciones.
- `fn_fabricacion_busqueda_visible(busqueda, sistema)` (nueva) decide qué búsquedas puede usar un
  juego: las generales (sin sistema ni producto), las del propio juego y las de su producto. La
  usan el motor, la validación y el backend. HoneyComb ve exactamente lo mismo que antes.
- `sp_fabricacion_reglas_parametros`:
  - Admite dos claves; si falta una de las dos entradas, el valor queda vacío.
  - Admite el filtro fijo.
  - Sin `clave2` ni filtro, la consulta dinámica es la misma de antes.
- `sp_fabricacion_parametro_edit`:
  - Valida las dos entradas (-6 si alguna no es un parámetro anterior).
  - Devuelve -9 si el número de entradas no corresponde a la búsqueda.
  - Normaliza el origen a `@A;@B`.
  - Mantiene el orden de los errores de siempre.
- `sp_fabricacion_parametros_valores`: los parámetros BUSQUEDA cuya búsqueda tiene `texto` dan su
  desplegable (código · nombre).
- Los tres objetos se reescriben a partir del texto desplegado; se comprobó que es el de
  `sqlHoney/04` y `05`.

**Búsquedas (producto 1):**
- `ENR_SISTEMA`, `ENR_ACCIONAMIENTO`, `ENR_TIPO_CADENA`, `ENR_TIPO_ARO`, `ENR_CADENA_MEDIDA`,
  `ENR_ALTURA`, `ENR_COLOR_CADENA`, `ENR_TIPO_MOTOR`, `ENR_MODELO_MOTOR`, `ENR_MANDO`,
  `ENR_CARGADOR`, `ENR_BATERIA`, `ENR_SOPORTE`, `ENR_COLOR_SOPORTE`, `ENR_TAPA`, `ENR_COLOR_TAPA`,
  `ENR_CONTRAPESO`, `ENR_COLOR_CONTRAPESO`: id → código, con el nombre para el desplegable.
- `ENR_ALTURA_VALOR`: id → valor.
- `ENR_TEJIDO_ARTICULO`: tipo + color → artículo, en `SOL_ARTICULOS_FABRICACION_RELACION` tipo 3
  (762 combinaciones, un artículo cada una). Es la misma relación que usaba la fabricación
  anterior.
- `ENR_SALIDA_TEJIDO`: `SOL_ARTICULOS_SALIDATEJIDO`.
- **`ENR_TEJIDO_ARTICULO` es provisional hasta el modelo nuevo de tejidos.** Bastará con volver a
  apuntarla a las tablas nuevas (datos): el motor y las reglas no cambian. La salida del tejido
  (`ENR_SALIDA_TEJIDO`) se queda como está; lo ha decidido el usuario.

**02:** cuando la regla tiene medidas propias (`param_ancho` / `param_alto`), `descripcion2` =
`'ancho x alto'`, como en la hoja anterior.

**Backend:**
- `/fabricacion/busquedas` filtra con `fn_fabricacion_busqueda_visible` y devuelve `dos_claves`.
- El listado de parámetros marca como "da un artículo" también las búsquedas cuyo resultado es la
  columna `articulos`.
- Mensaje para el error -9.

**Pantalla:** si la búsqueda elegida es de dos claves, aparece "Segundo parámetro". Se guarda
como `@A;@B` y en la lista se ve como `@A + @B → búsqueda`. Compila AOT.

**Pruebas:**
- `pruebas/prueba_04_busquedas.sql`, 11/11 con rollback: altas y validaciones (-6, -7 y -9),
  HoneyComb no ve las búsquedas del enrollable, soporte por código, tejido por tipo + color con
  1,652 m² y `descripcion2`, combinación inexistente → SIN ARTÍCULO.
- `pruebas/prueba_04_valores.js`, 4/4: el desplegable del soporte sale de `SOL_ACC_SOPORTE`, y los
  desplegables de HoneyComb salen sin cambios (34 valores).
- La foto de regresión de 94 pedidos es idéntica a la de después del 03.
- La batería `backend/test/fabricacion` da los mismos resultados que antes del 04 (los 13 fallos
  de siempre).
- Repetidas las pruebas 02 y 03: OK.
- **Pantalla probada en el navegador** con datos ZZ, ya borrados:
  - HoneyComb sin cambios: 15 parámetros y sus 3 búsquedas.
  - Alta del juego y de sus parámetros.
  - "Segundo parámetro": avisa si falta, se guarda como `@A + @B` y al editar vuelven las dos
    entradas.
  - Desplegable de códigos en las condiciones (`ZZSOP_PANT · ZZ SOPORTE PANTALLA`).
  - `@TEJIDO_ARTICULO` en "Artículo según el pedido".
- **Corregido en la pantalla:** el desplegable de valores de las condiciones solo se cargaba al
  cambiar de sistema. Un parámetro de búsqueda recién creado no tenía su lista hasta recargar. Ahora
  se recarga al guardar y al borrar un parámetro. Con HoneyComb no se notaba, porque sus valores
  vienen fijos por script.

## 2026-10-22 · Simulación por sistema (paso 2.6, solo simulación)

Sin cambios en la BD.

- **Backend** (`simular`):
  - En un juego del enrollable (con `acc_sistema_id`), la simulación sigue ejecutando el
    procedimiento para todo el pedido, pero solo devuelve la fabricación y los parámetros de las
    líneas de ese sistema (`nacc_sistema_id`).
  - Devuelve `Omitidas`: cuántas líneas son de otros sistemas y cuántas del modelo antiguo de
    accionamientos, que no se fabrican por reglas.
  - En HoneyComb `Omitidas` es `null` y todo sigue igual.
- **Pantalla:** aviso "No se muestran N líneas de otros sistemas ni N líneas del modelo antiguo…".
  Si el pedido no tiene líneas del sistema, se mantiene el aviso "El pedido no tiene líneas de
  Enrollable · X".
- **Prueba** `pruebas/prueba_simulacion.js`, 7/7:
  - El controlador se ejecuta dentro de una transacción que se deshace.
  - HoneyComb sale sin filtro.
  - En el pedido 7304 hay dos líneas en dos sistemas ZZ y una antigua: cada juego ve solo la suya,
    con su posición y las omitidas (1 + 1).
  - Un juego sin líneas en el pedido no muestra nada (omitidas 2 + 1).
- La batería `backend/test/fabricacion` da los mismos resultados. El frontend recompila sin
  errores.
- El aviso no se ha visto en el navegador: haría falta un pedido con líneas del modelo nuevo, y la
  simulación fabricaría de verdad en la BD local.

## 2026-10-23 · 05: tejido del maestro de tejidos

**Contexto:** desde el 23/10 las líneas del configurador nuevo guardan el tejido en
`SOL_PEDIDOS_COLA_TIPO_1.nacc_tejido_id`, que apunta a `SOL_TEJIDOS_MAESTRO` (ver `tejidos.md`). Los
campos `tej_tipo_id` y `tej_color_id` quedan a -1. La búsqueda `ENR_TEJIDO_ARTICULO` (tipo + color, de
la relación antigua) no sirve para esas líneas.

**Decisión del usuario:** no hay una regla por tejido. Cada sistema tiene **una regla de tejido** con
"artículo según el pedido" (`@TEJIDO_ARTICULO`) y el consumo del sistema, general para cualquier tejido
seleccionable. El tejido ya trae su código Solupyme, igual que en HoneyComb.

**Juego de un sistema** (parámetros, como HoneyComb):

| Parámetro | Tipo | Origen |
|---|---|---|
| `@TEJIDO_ID` | Dato del pedido | `nacc_tejido_id` |
| `@TEJIDO_REFERENCIA` | Búsqueda | `@TEJIDO_ID` → "Enrollable: tejido del maestro -> código Solupyme" |
| `@TEJIDO_ARTICULO` | Búsqueda | `@TEJIDO_REFERENCIA` → "Código Solupyme -> id del artículo" |

Regla: artículo `@TEJIDO_ARTICULO`; el consumo y las medidas propias los pone quien escribe las reglas
(por ejemplo, `@TEJIDO_ANCHO ** @ALTO *T 0.0001` con `@TEJIDO_ANCHO` = `@ANCHO -- 2`).

- El script 05 solo añade `ENR_TEJIDO_SOLUPYME` (`SOL_TEJIDOS_MAESTRO`, `idrow` → `cod_solupyme`). El motor
  no cambia. `ENR_TEJIDO_ARTICULO` pasa a llamarse "Enrollable (tejido antiguo)...", sin borrarla.
- `ENR_SALIDA_TEJIDO` no cambia (decisión del usuario).
- **Prueba** `pruebas/prueba_05_tejido_maestro.sql`, con rollback:
  - Un juego con una sola regla de tejido: el primer y el último tejido del maestro dan cada uno su artículo
    de Solupyme, con 100,5 × 140,5 cm → tejido de 98,5 × 140,5 y consumo 1,3839 m², descripcion2 `98.50 x 140.50`.
  - Una línea sin tejido sale como SIN ARTÍCULO.
  - Los 935 tejidos del maestro tienen exactamente un artículo en `ARTICULOS`.
  - Un `nacc_tejido_id` inexistente no se puede probar: la columna tiene clave ajena al maestro.
- **Medidas con decimales:** `ancho` y `alto` ya son `decimal(12,2)` en las líneas (6 decimales en la
  fabricación). Probado 100,5 × 140,5 con el motor sin cambios: condiciones, fórmulas, `*T`, `descripcion2`
  y metros.
- **Dato a tener en cuenta:** 454 de los 935 tejidos del maestro tienen el artículo de Solupyme **sin unidad**
  (`ARTICULOS.unidad1` vacía; el resto tiene m²). El consumo y el artículo salen bien, pero la columna Unidad
  de la hoja sale en blanco para esos. Se arregla en los datos de Solupyme.
- Regresión de 94 pedidos (tipos 2, 3, 4 y 7): fabricación idéntica. Solo cambia el texto de los parámetros
  guardados de HoneyComb (`@ANCHO` = `40.00` en vez de `40`) porque las medidas ya son decimales.

## 2026-10-23 · 06: XML del enrollable, CANT y FACTOR según la unidad

**Decisión del usuario:** el XML tiene que salir correcto. En HoneyComb, al principio el consumo iba siempre en
`FACTOR`, y era incorrecto: los artículos que se cuentan (Ud y otras) llevan el consumo en `CANT`. El tejido
va aparte. La regla debe valer para todas las fabricaciones; el usuario eligió **solo el enrollable por ahora**.

**Regla** (la de HoneyComb, `sqlHoney/06`, 2026-10-15), ahora también en el bloque del enrollable (`articulo = 1`) de
`sp_fichero_produccion_2`. Cada `<Detalles>` es una unidad:

| Unidad del artículo | `Cn_CANT` | `Cn_FACTOR` |
|---|---|---|
| 1 Ud, 4 juego, 5 par, 6 min (se cuentan) | el consumo (sin ceros a la derecha: `2`, `0,5`) | `1` |
| 2 m², 3 ml, **sin unidad** (se miden; el tejido) | `1` | el consumo |

- Antes: `CANT` = cantidad de la línea y `FACTOR` = consumo, para todos los artículos.
- Además: no se envían las líneas sin artículo (SIN ARTÍCULO) y los componentes salen en su orden (`orden, id`).
- Un artículo que se cuenta y no tiene unidad en Solupyme saldría como "se mide". Con el tejido no importa. Revisar los
  artículos que se usen en las reglas.
- `06_xml_cant_factor_enrollable.sql`: cambio quirúrgico sobre la definición que hay en la BD (se sustituye el bloque
  del cursor de los componentes; debe aparecer exactamente una vez). Se generan los dos scripts con
  `herramientas/generar_06.py`.
- Huellas SHA-256 de `sp_fichero_produccion_2` en LOCAL: original `FB3511DA…` (igual que el fichero `sqlHoney/06`),
  con el 06 `BB1B7F37…`. `06_deshacer_...` devuelve **exactamente** la original. Copia de la definición anterior en
  `backup/sp_fichero_produccion_2_antes_06_20261023.sql`.
- Los demás productos no cambian: japonés, vertical, Compac y HoneyComb.
- **Prueba** `pruebas/prueba_06_xml.sql`, 9/9 con rollback: línea de 2 unidades con un artículo de cada unidad.
  - Ud consumo 2 → `CANT 2, FACTOR 1`, y consumo 0,5 → `CANT 0,5`.
  - Juego → `CANT 1, FACTOR 1`.
  - m² → `CANT 1, FACTOR 3,25`.
  - ml (100,5 cm → 1,005 m) → `CANT 1, FACTOR 1,005`.
  - Tejido sin unidad → `CANT 1, FACTOR 1,3839`, `P1 0,985` y `P2 1,405` m.
  - El SIN ARTÍCULO no sale.
- **Regresión del XML** `pruebas/regresion_xml.js`: 68 pedidos reales de japonés, vertical, Compac y HoneyComb sin
  enrollable dan el XML **idéntico** con y sin el 06.
- **Efecto en los pedidos antiguos con enrollable:** si se vuelve a pedir el XML de un pedido ya fabricado con el SP
  antiguo, cambia (`CANT` y `FACTOR` por unidad; sin las líneas sin artículo). Ejemplo: un artículo en metros que
  antes salía `CANT 9, FACTOR 1,5` pasa a `CANT 1, FACTOR 1,5`. Los 40 pedidos de la muestra cambian.
- **Pendiente:** aplicar la misma regla a japonés, vertical y Compac. Ahí mandan `CANT` = cantidad de la línea (Compac
  `CANT` 1 fijo). Con datos reales cambiarían muchas líneas; antes habría que ver una foto del XML antes y después.

## 2026-10-23 · 07: parámetros estándar de la fabricación del enrollable

**Decisión del usuario:** definir todos los parámetros posibles de un enrollable para todos los sistemas (vienen del
configurador, son fáciles de definir); el equipo se encarga de las reglas. Referencia para quien escribe las reglas:
`PARAMETROS.md`.

- **57 parámetros por juego:** 28 son datos de la línea (medidas, cadena a medida, posición, impresión, salida del
  tejido y los ids de los pasos del configurador y del tejido) y 29 son búsquedas: los códigos legibles de cada
  catálogo `SOL_ACC_*` (búsquedas `ENR_*` del script 04) y los datos del tejido del maestro (código Solupyme, artículo,
  nombre, color, criterio, grupo, tipo, impresión digital).
- `sp_enrollable_parametros_base @sistema` crea los que falten en un juego. No pisa un parámetro que el equipo haya
  cambiado ni borra nada, y devuelve cuántos ha creado. Solo vale para juegos del enrollable (error en HoneyComb).
- El script lo aplica a todos los juegos que ya existen (en LOCAL: `ENROLLABLE_RHIN` y `ENROLLABLE_DUERO`, 57
  cada uno; repetirlo crea 0).
- `SOL_FABRICACION_PRODUCTOS.sp_parametros_base`: el producto dice qué procedimiento da de alta sus parámetros
  (enrollable: `sp_enrollable_parametros_base`; HoneyComb: ninguno, sus 15 parámetros no cambian).
- **Backend:** al añadir un sistema en la pantalla (`POST /fabricacion/sistemas`) el juego nace con sus parámetros
  y sin reglas. Un juego no se crea solo al dar de alta un sistema en `SOL_ACC_SISTEMA`: se añade desde la pantalla.
- Búsquedas nuevas: `ENR_TEJIDO_NOMBRE`, `_COLOR`, `_CRITERIO`, `_GRUPO`, `_IMPRESION`, `_TIPO_ID` y `ENR_TEJIDO_TIPO`.
- No hay parámetros de cajón ZIP ni guía: el configurador nuevo no los modela todavía.
- **Prueba** `pruebas/prueba_07_parametros.sql`, 8/8 con rollback: una línea con todos los pasos informados con
  códigos ZZ; 38 parámetros de la línea comprobados con su valor esperado, una regla con códigos (soporte y tapa, mando) se
  cumple, una cadena sin motor deja los pasos del motor vacíos y HoneyComb no puede usar el procedimiento.
- La prueba de productos y sistemas (`prueba_productos_sistemas.js`) se adapta: un juego nuevo trae 57 parámetros.
  Todas las pruebas anteriores siguen pasando; la regresión de fabricación de los tipos 2, 3, 4 y 7 es idéntica.
- **Batería `backend/test/fabricacion`:** 3 comprobaciones pasan a fallo (medidas decimales). No vienen de este
  cambio: esta rama no incluye los commits de medidas decimales de `main` (`068213f`, `706f291`) y la BD local ya
  tiene esas columnas decimales. En `main` pasan.

### Pendiente

- Unidad en blanco en la hoja para los 454 tejidos cuyo artículo no tiene `unidad1` en Solupyme.
- Regla CANT / FACTOR por unidad en japonés, vertical y Compac (el usuario decidió no tocarlos de momento).
- 2.6 (comparación, aparcada): hoja y parámetros por pedido, con diferencias frente a otro pedido.
- 2.7: guía de reglas del enrollable. Reparar `backend/test/fabricacion/run.js`.
