# Registro de cambios: mandos y cargadores (rama arreglo-am25)

Scripts idempotentes; se aplican primero en local. Producción (`SOLARMANES_DEV` remoto) la despliega el usuario.

| Script | Qué hace | Local | PROD |
|---|---|---|---|
| `01_incrementos_mando_cargador_leroy.sql` | Clientes 1 y 5, enrollable: mando A-OK 1 canal 31,00 € · C1 0002000; mando A-OK 6 canales 76,80 € · C1 0004042 (la fila del motor AM35 PLUS L 6/18 del cliente 5 estaba a 71,78 € · C1 0003778 y con la descripción "INCREMENTO"); cargador USB AM25 31,00 € · C1 0002000 (promoción) | ✅ 2026-10-30 | pendiente |
| `02_sp_pedidos_t1_asigna_48.sql` | `sp_pedidos_t1_asigna_48`: el cargador se guarda por la cantidad (PVP × cantidad y C1 con `C1_Multiply`); el código 48 del mando sale de la fila del modelo de motor | ✅ 2026-10-30 | pendiente |

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

## Pendiente

- Los pedidos ya guardados con cargador tienen el C1 total sin el del cargador (2000 de menos por cargador). No se corrigen.
