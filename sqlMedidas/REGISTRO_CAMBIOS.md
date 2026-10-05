# Registro de cambios — Medidas de fabricación (rama `cambios_configurador`)

Cada cambio de BD lleva un script repetible en esta carpeta. No se borran filas: lo que se revierte o corrige se anota en una fila nueva.
Los scripts están en UTF-8; ejecutarlos con `sqlcmd -f 65001` para que no se rompan las tildes.

## Base de datos

| # | Fecha | Objeto | Cambio | Script | DEV | TEST | PROD |
|---|---|---|---|---|---|---|---|
| 001 | 2026-10-05 | `sp_tarifas_calculate_prices_link` | Cliente 5 (Leroy Web) deja de sumar una vía extra (`--if @clientes = 5 set @vias = @vias + 1`). Iguala TEST con DEV. | `001_sp_tarifas_calculate_prices_link_sin_via_extra_cli5.sql` (backup previo de TEST: `backup_001_...`) | ✔ (origen) | ⚠ ver 001b | — |
| 001b | 2026-10-05 | `sp_tarifas_calculate_prices_link` | La primera aplicación en TEST se hizo con una página de códigos errónea: la lógica quedó bien (línea comentada), pero se rompieron las tildes de algunos comentarios y la cabecera del script quedó dentro de la definición. Hay que volver a ejecutar `001` con `-f 65001` para dejarlo idéntico a DEV. | `001_...sql` | — | **pendiente** | — |

## Código

| Fecha | Cambio |
|---|---|
| 2026-10-05 | Backend: quitados los 83 prefijos `[SOLARMANES_DEV].[dbo].` → `[dbo].` (las consultas usan la BD de la conexión). |
| 2026-10-05 | `server.js` lee `backend/.env` (PORT, DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD). Sin `.env` usa los valores de producción. Plantilla en `backend/.env.example`; `.env` ignorado en git. |
