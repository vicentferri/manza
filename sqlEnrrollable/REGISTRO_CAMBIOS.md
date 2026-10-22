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

### Pendiente

- Cuando llegue el modelo nuevo de tejidos: volver a apuntar `ENR_TEJIDO_ARTICULO` (la salida del tejido no cambia).
- 2.6: script de hoja y parámetros por pedido, con diferencias frente a otro pedido.
- 2.7: guía de reglas del enrollable. Reparar `backend/test/fabricacion/run.js`.
- La simulación de la pantalla ejecuta el procedimiento para todo el pedido y muestra todas sus
  líneas v3, sean del sistema que sean.
