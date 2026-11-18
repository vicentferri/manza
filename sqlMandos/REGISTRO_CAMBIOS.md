# Registro de cambios: mandos y cargadores (rama arreglo-am25)

Scripts idempotentes; se aplican primero en local. Producción (`SOLARMANES_DEV` remoto) la despliega el usuario.

| Script | Qué hace | Local | PROD |
|---|---|---|---|
| `01_incrementos_mando_cargador_leroy.sql` | Clientes 1 y 5, enrollable: mando A-OK 1 canal 31,00 € · C1 0002000; mando A-OK 6 canales 76,80 € · C1 0004042 (la fila del motor AM35 PLUS L 6/18 del cliente 5 estaba a 71,78 € · C1 0003778 y con la descripción "INCREMENTO"); cargador USB AM25 31,00 € · C1 0002000 (promoción) | ✅ 2026-10-30 | pendiente |
| `02_sp_pedidos_t1_asigna_48.sql` | `sp_pedidos_t1_asigna_48`: el cargador se guarda por la cantidad (PVP × cantidad y C1 con `C1_Multiply`); el código 48 del mando sale de la fila del modelo de motor | ✅ 2026-10-30 | ✅ comprobado 2026-11-17 |
| `03_sp_pedidos_cola_t1_promo_motor_cliente5.sql` | `sp_sol_pedidos_cola_tipo_1_add`: la sustitución del modelo de motor por el 676 (M25 AM25 PLUS L, promoción) pasa de clientes 1 y 5 a solo el 5; el cliente 1 guarda el modelo elegido | ✅ local 2026-11-11 | ✅ incluido en el 04 |
| `04_sp_pedidos_cola_t1_mando_cargador_web.sql` | `sp_sol_pedidos_cola_tipo_1_add` (parte del 03): pedidos de Leroy Merlin Web (cliente 5) con motor. El mando llega con los códigos de la integración (0 sin mando, 1 un canal, 6 seis canales; antiguos 3 = seis canales, 4 = sin mando) y se guarda como 4 / 6 / 8 de `SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO`; `Tipo1_Cargador` = 1 se guarda como el cargador del motor 676 (idrow 4), lo demás sin cargador. Antes el mando 1 quedaba sin texto y el cargador no se guardaba ni se imprimía (la web lo cobra). Rellena además el código 48 (48007312, el del kit AM25) del mando de 6 canales del motor 676 en `SOL_ARTICULOS_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE` (clientes 1 y 5) | ✅ local 2026-11-17 | ✅ comprobado 2026-11-17 |
| `05_nucleo_pedidos_t1.sql` | Núcleo inteligente: columna `SOL_PEDIDOS_COLA_TIPO_1.nucleo` (int) y parámetro `@nucleo int = -1` en `sp_sol_pedidos_cola_tipo_1_add` (resto igual que el 04). La web envía `"nucleo"` 1 / 0; -1 = no enviado. Para volver atrás: ejecutar el 04 (la columna puede quedarse) | ✅ local 2026-11-17 | pendiente |
| `06_solarmanes_reenvio_pedidos_t1.sql` | BD **SOLARMANES**: `sp_sol_pedidos_cola_tipo_1_add`, el que llama el backend de Leroy Web (`C:\dev\LM`), era una copia antigua que insertaba directamente en `SOLARMANES_DEV`; por eso los scripts 02-04 nunca se aplicaban a los pedidos web. Pasa a reenviar a `SOLARMANES_DEV.dbo.sp_sol_pedidos_cola_tipo_1_add` con los mismos parámetros más `@cargador` y `@nucleo` (-1 por defecto); estancia NULL, como antes. Desde ahí los pedidos web traducen mando y cargador, guardan el motor 676 y el núcleo y pasan por `sp_pedidos_t1_asigna_48`. Requiere el 05. Vuelta atrás: `06b_vuelta_atras_solarmanes_pedidos_t1.sql` | ✅ local 2026-11-17 | pendiente |

## Código de la rama

- `backend/controllers/sm/lm/leroymerlin.js` (`radiomandos_gen`): el precio, el C1 y el código 48 del mando se toman de la fila
  del modelo de motor elegido (antes `top 1` de cualquier modelo).
- `frontend/src/app/manza/enrollable`:
  - El C1 total de la línea (`T1_PVP_C1`) suma el C1 del cargador; antes solo lo sumaba el PVP.
  - El cargador va por la cantidad, como el mando.
  - El C1 total se calcula cuando los C1 del mando y del cargador ya están multiplicados.
  - Al cambiar el mando o el cargador con la línea ya valorada, se recalculan el PVP y el C1.
  - Al cambiar a un motor sin ese cargador, la línea queda sin cargador.
  - Al editar una línea de la cesta se conserva el cargador.
  - `reset()` (tras agregar una línea) también limpia el cargador, su lista y su etiqueta. Antes la línea siguiente
    podía guardarse con el cargador de la anterior y con incremento 0.

## Pendiente

- Los pedidos ya guardados con cargador tienen el C1 total sin el del cargador (2000 de menos por cargador). No se corrigen.
- Script 04: la web tiene que enviar `"cargador"` (1 lleva / 0 no lleva) en cada línea con motor; hasta entonces sus pedidos siguen sin cargador.
  El backend de Leroy (`C:\dev\LM`, `controllers/sm/lm/bestellungen.js` → `Add_Tipo_1`) lo pasa al SP como `@cargador`
  (acepta también `Tipo1_Cargador`) y `"nucleo"` como `@nucleo`. Cargador en commit `fb8c3f7` del repo LM; núcleo sin commit (2026-11-17).
- Orden de despliegue en PROD: script 05 (SOLARMANES_DEV), después 06 (SOLARMANES) y por último el código de `C:\dev\LM`.
  `sqlSmartHome/01` (smart home en el configurador, clientes 1 y 4) parte del SP del 05: si se despliega, va después del 05.
  El 06 reenvía `@cargador`/`@nucleo` y no `@smart_home` (la web no lo usa), así que vale con o sin `sqlSmartHome/01`.
  Ese código envía `@cargador`/`@nucleo`: con el SP antiguo de SOLARMANES el alta de las líneas de enrollable falla.
- Probado en local por el camino real (Add_Tipo_1 de `C:\dev\LM` contra SOLARMANES, cliente 5 con motor): cargador 1 →
  CARGADOR USB MOTOR AM25 con 31,00 € / C1 0002000; cargador 0 o sin enviar → sin cargador; núcleo 1 / 0 / -1 guardado.
  Pruebas borradas.
- Los pedidos web ya guardados con el mando vacío (mando_id 1 o 3 sin texto) no se corrigen.
