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

### Pendiente

- 2.3: búsqueda con varias claves en el motor (y lo que pida la lista de reglas del compañero).
- 2.6: script de hoja y parámetros por pedido, con diferencias frente a otro pedido.
- 2.7: guía de reglas del enrollable. Reparar `backend/test/fabricacion/run.js`.
- La simulación de la pantalla ejecuta el procedimiento para todo el pedido y muestra todas sus
  líneas v3, sean del sistema que sean.
