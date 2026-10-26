# Medidas con decimales en el configurador (manza/config, flujo de siempre)

Objetivo: que las medidas que se configuran con decimales se graben y se valoren bien. El paso es de
**0,5 cm**, y de **0,1 cm en HoneyComb**. Solo afecta al configurador de siempre (`manza-enrollable`,
`japones`, `vertical`, `compac`, `honeycomb` → `/api/lm/bestellungen_hinzu2`, `budget_hinzu2`,
`calculate_prices`). El configurador nuevo de accionamientos va en otra rama y no se toca.

## Qué pasaba

- El backend enviaba ancho y alto como `sql.Int`, y el driver (tedious) hace `value | 0`. Así,
  **120,5 se grababa como 120** en todos los tipos, sin ningún aviso.
- Detrás había SPs con `@ancho int` y columnas `int`. En pedidos, enrollable, japonés y cajón ZIP ya
  eran `decimal(12,2)`. Vertical, Compac y HoneyComb seguían en `int`, igual que todos los presupuestos.
- **Tarifa:** la valoración (`calculate_prices`) graba la línea en las tablas `temp_` con los mismos
  tipos, así que **se cobraba el tramo de la medida truncada**: 120,5 cm se cobraba como 120. Los SPs de
  tarifa (`temp_sp_fabricacion_tipo_N_tarifa`, `sp_tarifas_calculate_prices3_AT`,
  `solarmnes_pvp_t1yt2`) ya trabajaban en decimal: buscan la primera celda con medida ≥ la pedida, en
  metros con 2 decimales, así que 1,205 se redondea a 1,21 y cae en el tramo siguiente, que es lo
  correcto. No hay que cambiarlos.
- **HoneyComb** valora aparte (`honeycomb_obtener_tarifa` → `sp_ObtenerPrecioHoneycomb`). Pasaba
  `ancho × 0,01` como `Decimal(10,2)`, de modo que 120,3 cm se redondeaba a 1,20 m y caía en el tramo
  inferior.

## Orden de ejecución (SQL)

| Script | Qué hace | DEV local | PROD |
|---|---|---|---|
| `00_comprobacion_prod_solo_lectura.sql` | Solo lectura. Muestra el tipo actual de las columnas y si cada uno de los nueve SPs está ORIGINAL, YA APLICADO o DISTINTO | ✅ 2026-10-22 | ⏳ |
| `01_columnas_medidas_decimal.sql` | 32 columnas `int` → `decimal(12,2)`: `SOL_PEDIDOS_COLA_TIPO_3/4/7`, `SOL_PRESUPUESTOS_COLA_LINEAS/TIPO_1/3/4/7` y `temp_sol_pedidos_cola_tipo_3/4` (ancho, alto, ancho2, `PV_Ancho_1/2`, `PV_Alto_1`, `PV_AlturaMin_2/Max_2`). Solo cambia las que siguen en `int`. Al final refresca las 17 vistas que leen esas tablas (`sp_refreshview`). Todo en una transacción | ✅ 2026-10-22 | ⏳ |
| `02_sps_alta_medidas_decimal.sql` | Parámetros de medida `int` → `decimal(12,2)` en los SPs de alta de pedido, presupuesto y `temp_` de los tipos 1, 3 y 4 (los del japonés y la HoneyComb ya lo eran). En los de presupuesto, la descripción pasa a `format(..., '0.##', 'es-ES')` (120 o 120,5 en lugar de 120.00). El resto del SP es la definición local del 2026-10-22. **Antes de cambiar nada comprueba la huella de los nueve SPs: si alguno es distinto, no aplica ninguno.** Requiere el 01 | ✅ 2026-10-22 | ⏳ |
| `03_tarifa_japones_ancho_lama.sql` | Tarifa del japonés de Leroy. El ancho de lama lo calcula el configurador con decimales (ancho del mecanismo / vías + 5, redondeado a 0,05: 88,35), pero `temp_sp_fabricacion_tipo_2_tarifa` y `sp_tarifas_calculate_prices3_AT` lo recibían en `int` y lo truncaban. Ahora va en `decimal(12,2)` y, solo en el japonés (`producto = 2`), se sube al cm superior con `ceiling()` antes de pasar a metros. Sin ese redondeo, 80,35 → 0,8035 → 0,80 y seguiría cayendo en la columna inferior. En el vertical, `@ancholama` elige la tarifa (89, 127…), llega entero y no cambia. Misma comprobación de huella que el 02. Requiere el 01 | ✅ 2026-10-22 | ⏳ |
| `backup/*.sql` | Definición original de los SPs que cambian el 02 y el 03, para comparar o deshacer (cambiando CREATE por ALTER) | — | — |

Con sqlcmd: `sqlcmd -S ... -d <BD> -f 65001 -b -i <script>`. Los dos scripts se pueden ejecutar varias
veces; comprobado en local relanzándolos.

## Código

| Fichero | Cambio |
|---|---|
| `backend/controllers/sm/lm/bestellungen.js`, `budget.js`, `bestellungen_tarifas.js` | Las medidas pasan de `sql.Int` a `sql.Decimal(12,2)` (tipos 1, 2, 3, 4 y 7). Así se guarda también el ancho calculado del japonés, por ejemplo 88,35, que antes quedaba en 88 |
| `backend/controllers/sm/honeycomb.js` | `honeycomb_obtener_tarifa`: redondeo hacia arriba al cm entero antes de pasar a metros (`Math.ceil(x) / 100`) |
| `frontend/src/app/manza/config/medidas.ts` (nuevo) | `errorPasoMedidas()`, `PASO_MEDIDA` (0,5) y `PASO_MEDIDA_HONEYCOMB` (0,1). El `step` del input solo afecta a las flechas: lo que se teclea a mano se comprueba aquí |
| `enrollable`, `japones`, `vertical`, `compac`, `honeycomb` (`*.component.ts`) | `T1Check`…`T7Check` rechazan las medidas que no son múltiplo del paso. En el japonés solo se comprueba lo que teclea el usuario: el ancho de lama lo calcula el configurador, salvo en solo lamas |

## Verificación en local (2026-10-22)

- **Guardado de punta a punta** con los controladores reales, en una transacción deshecha
  (`lib/entorno.js` de los tests de fabricación). Pedido con una línea de cada tipo (1, 2, 3, 4 y 7):
  120,5 × 150,5; japonés 88,35 × 245,5 con mecanismo de 250,5; vertical 251,5 × 248,5; Compac
  37,5/38,5 × 58,5; HoneyComb 100,3 × 120,7. Se guardan exactos en pedido, en presupuesto y en la
  conversión de presupuesto a pedido. Descripción del presupuesto: `Enrollable 4x120,5x150,5`.
- **Valoración** (cliente 1, rejilla local):
  - Enrollable con ancho 120 → 129,88 €; 120,5 → 142,67 € (= 121).
  - Alto 140,5 → tramo de 160, 160,5 → 180 y 200,5 → 220 (enrollable y vertical).
  - Compac con 120,5 → -99 (sin tarifa): 120 es el máximo de su rejilla.
- **Cliente 4** (rejilla remota `88.30.3.157`): no se puede probar en local porque falta el servidor
  enlazado. Usa la misma búsqueda `p1 >= ancho/100` en `decimal(5,2)`; comprobado que 120,5/100 da 1,21.
- **HoneyComb:** 120,3 cm → antes columna 1,20 (211,05 €), ahora 1,40 (232,61 €).
- **Regresión del 03**: últimas 60 líneas valoradas de los tipos 1, 2, 3 y 4 de Leroy (clientes 1 y 5),
  cada una en su transacción deshecha, antes y después del 03. 237 de 240 dan el mismo precio, incluidas
  4 de Compac que ya fallaban antes. Cambian 3 japoneses con lama de 60,60 cm: antes columna 0,60
  (114,65 €), ahora 0,80 (139,57 €). Los otros 27 japoneses con lama decimal no cruzan columna y no
  cambian. Es una subida de precio para las lamas que quedan justo por encima de una columna.
  **Confirmado por el usuario (2026-10-22):** tramo siguiente. El ancho de lama lo calcula el
  configurador y puede tener cualquier medida, no solo de 0,5 en 0,5.

## Pendiente / a tener en cuenta

- La rama `origin/cambios_configurador` (no integrada) tiene su propia versión de este cambio
  (`sqlMedidas/001-005`, aplicada en TEST el 2026-10-06), junto con los límites de fabricación por cliente.
  El 2026-10-22 el usuario decidió seguir con esta versión sobre `main`. Al integrar esa rama
  chocarán los mismos SPs, las mismas líneas del backend y las validaciones del frontend, y sus
  `001-005` no deben aplicarse encima de estos.

- Los pedidos y presupuestos antiguos conservan su medida truncada; no hay forma de recuperar el decimal.
- La descripción del presupuesto del japonés y la HoneyComb (SPs que ya eran decimal y que no se
  tocan) sigue saliendo como `88.35x245.50`.
- `sp_ObtenerPrecioHoneycomb` monta el nombre de columna con `FORMAT(..., '0.00')`, que depende del
  idioma de la sesión: en una sesión en español sale `Col_1,20` y falla. El backend no se ve afectado
  porque tedious conecta en `us_english`, pero desde SSMS en español no funciona.
