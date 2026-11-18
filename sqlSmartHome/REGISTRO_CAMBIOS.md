# Smart Home en el enrollable con motor

Opción SÍ/NO junto a Mando y Cargador en el configurador (manza/enrollable, flujo antiguo), solo con
accionamiento motor de marca A-OK, SOMFY o NICE y para los clientes 1 (Leroy Merlín) y 4 (Solarmanes).
PVP 136,84 € y C1 `C1 0007202` **por cortina** (× cantidad, como el cargador). Código 48: el del motor
de la línea (`T1_Inc_Modelo_48`).

| Fecha | Cambio | DEV local | PROD |
|---|---|---|---|
| 2026-11-17 | `01_smart_home_enrollable.sql`: tablas `SOL_ARTICULOS_SMART_HOME`, `_CLIENTES`, `_MARCAS`, función `fn_smart_home_aplica`, columnas en pedidos/presupuestos tipo 1, ALTER de `sp_sol_pedidos_cola_tipo_1_add`, `sp_sol_presupuestos_cola_tipo_1_add` y `sp_pedidos_t1_asigna_48` | Aplicado y probado | Pendiente |

## Despliegue a PROD

1. Antes: tienen que estar en PROD los SP con medidas decimales (sqlMedidas) y el núcleo (`sqlMandos/05`),
   porque el 01 parte de esa versión de los SP (si no, comparar antes de ejecutar).
2. `01_smart_home_enrollable.sql` (con BOM, se puede abrir en SSMS). Vuelta atrás: `01b_vuelta_atras_smart_home.sql`.
3. Backend: `controllers/sm/lm/{leroymerlin,budget,bestellungen}.js`, `routes/link_routes.js`,
   `controllers/sm/impresion/enrollable.js`.
4. Frontend: build con `manza/enrollable`, `manza/config/{CortinaTipo,config.component,smapi.service}.ts`, `manza/preview-1`.

## Notas

- Las marcas se buscan en la descripción del modelo de motor (`SOL_ARTICULOS_COLORES_MARCAS`); un motor nuevo
  de esas marcas sale solo. Para añadir/quitar marcas o clientes: filas en `SOL_ARTICULOS_SMART_HOME_MARCAS` /
  `_CLIENTES`. Precio y C1 en `SOL_ARTICULOS_SMART_HOME`.
- En pedidos, `sp_pedidos_t1_asigna_48` recalcula el importe y el C1 desde la tabla (como el cargador); en
  presupuestos se guarda lo que manda el configurador.
- PDF (pestañas Nuevo y Producción): columna "Smart Home" en la plantilla de motor, solo si alguna línea lo lleva.
- Fuera de alcance: fabricación/XML, web de Leroy (cliente 5), configurador nuevo (`enrollable-nuevo`).
