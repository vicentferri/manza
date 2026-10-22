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
- **Todavía no lo llama nadie.** `sp_fabricacion_generate` no cambia hasta el paso 2.4
  (interruptor por línea más el filtro en `dev_sp_fabricacion_tipo_1`). Solo se ejecuta a mano o
  desde la simulación de la pantalla de reglas.
- Prueba: `pruebas/prueba_02_tipo_1_v3.sql`. Se hace dentro de una transacción que se deshace al
  final, sobre el pedido real 7304. Comprueba que el modo presupuesto no hace nada; que hay
  3 componentes y que la regla que no aplica no sale; la conversión de cm a metros; el
  enriquecimiento; la línea SIN ARTÍCULO; los parámetros guardados; que un sistema sin juego da
  hoja vacía; que la línea antigua queda intacta (huella); que no hay duplicados al repetir; y
  que no quedan restos. **10/10 OK** en LOCAL.

### Pendiente

- 2.4: interruptor en `sp_fabricacion_generate` y filtro en `dev_sp_fabricacion_tipo_1`. Revisar
  la numeración `idpedido` en pedidos mixtos: el SP antiguo numera con su propio `@Pos`.
- 2.5: foto de regresión de los tipos 1, 2, 3, 4 y 7 antes y después.
- 2.3: búsqueda con varias claves en el motor (y lo que pida la lista de reglas del compañero).
- 2.6: script de hoja y parámetros por pedido, con diferencias frente a otro pedido.
- 2.7: guía de reglas del enrollable. Reparar `backend/test/fabricacion/run.js`.
- La simulación de la pantalla ejecuta el procedimiento para todo el pedido y muestra todas sus
  líneas v3, sean del sistema que sean.
