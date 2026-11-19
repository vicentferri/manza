# Tests de la fabricación por reglas (HoneyComb)

```
node backend/test/fabricacion/run.js          # todo (unos 3 min)
node backend/test/fabricacion/run.js 5        # solo la sección 5
node backend/test/fabricacion/run.js 2 3 4    # varias
```

- **No cambia la BD.** Todo lo que escribe va en una transacción que se deshace al terminar.
  Incluye los pedidos de prueba y lo que hace `sp_pedidos_cola_add`, que regenera los 20 últimos pedidos.
- **BD que usa.** La del backend: `backend/server.js`, más `backend/.env` si existe. Solo acepta bases `*_DEV` o `*_TEST`. Para otra hay que pasar `--bd=NOMBRE`.
- **Sección 8.** Necesita el backend en marcha (`https://localhost:3001` o la variable `TEST_API`). Si no lo está, da un AVISO.
- **Resultados.**
  - `OK`.
  - `FALLO`: hay que arreglarlo. El proceso termina con código 1.
  - `AVISO`: configuración incompleta, datos de DEV o un comportamiento antiguo fuera del alcance. Hay que decidir qué hacer.

| Sección | Qué prueba |
|---|---|
| 1 Frontend | `fabricacion-reglas.util.ts` (el `.ts` real, transpilado): condiciones, consumos, reglas, operandos |
| 2 Fórmulas | `sp_fabricacion_evaluar` y `fn_fabricacion_condicion`: resultados, `-1` y nunca error con datos malos, igual que mrp_cd en lo válido, coherencia con el frontend |
| 3 Motor | Sistema de prueba `TSUITE`: COLUMNA/FORMULA/BUSQUEDA/TABLA, inyección SQL, reglas Y/O, artículo según el pedido, SIN ARTÍCULO, reglas por cliente |
| 4 Configuración | Controladores reales de la pantalla v3 y de admin-data, con cada código de error |
| 5 Pedido | Pedido de principio a fin con el código real del backend. Pasos: alta → hoja (cada línea con exactamente los componentes de las reglas que cumple) → orden (hoja y XML en el orden de las reglas) → parámetros → XML → simulación → modificar → cambios de configuración (tejido del maestro de un color) → cliente con reglas propias |
| 6 Regresión | Usos del motor v3 (solo los conocidos). XML de pedidos reales en orden y bien formado. El tipo 7 no toca otros tipos. Regenerar pedidos reales. XML de los pedidos HoneyComb reales |
| 7 Datos | `ALTO_PLIEGUES` = Excel. Parámetros y reglas coherentes. Referencias. Cobertura de combinaciones y tramos |
| 8 HTTP | Las rutas nuevas existen y no responden sin sesión ni con un token falso |

Al cambiar el motor, las reglas o los scripts de `sql/sqlHoney`, hay que pasar todos los tests antes de llevar nada a PROD.

## Qué no lleva escrito la batería

La configuración se cambia desde las pantallas, así que la batería la lee de la BD en vez de llevarla escrita:

- **El orden de cada componente** lo decide su regla. El del tejido se lee de la regla general `@TEJIDO_ARTICULO` (estaba en
  el 350 el 7/10 y pasó al 240 al renumerar las reglas).
- **Qué componentes lleva cada línea** se calcula con las reglas: las que no tienen condición, las de su color de perfil y
  las de su tramo de ancho. Una condición de otra forma da FALLO («condiciones que la prueba no sabe evaluar»): hay que
  enseñársela a `componentesEsperados` en `casos/05_pedido.js`.
- **Quién usa el motor v3:** `USOS_MOTOR` en `casos/06_regresion.js`. Un uso nuevo da FALLO: revisarlo y, si es correcto,
  añadirlo.

## Avisos conocidos (2026-11-19)

- Alto > 280 cm: el tejido va al XML con consumo -1. Los configuradores limitan el alto a 280 y `/acc_cfg` lo rechaza;
  el alta antigua por API no lo valida. Decisión pendiente.
- La referencia del cliente va al XML sin escapar (`&`, `<`): afecta a todos los productos.
- XML con una línea vacía (NULL) en pedidos reales de vertical y panel japonés de Leroy: falta la apertura de `<Detalles>`.
- CASQUILLO sin regla para anchos de menos de 30 o más de 130 cm (el configurador va de 40 a 120).
- Ninguna regla depende del accionamiento.

## Historial

- **2026-11-19:** puesta al día (estaba en 50 OK / 17 FALLOS, todos por pruebas desfasadas): operador `//`, medidas
  decimales, orden del tejido leído de la configuración, reglas de los cuatro colores de perfil, ids de hoy, tejido del
  maestro en los colores (sql/sqlHoney/20), medidas de corte con decimales en el XML. Fuera de la sección 6 las dos pruebas
  que leían `C:\dev\prod\sqlHoney` (scripts 01-16 y copia de `sp_fichero_produccion_2` del 29/09, borrados a propósito);
  al fallar esa lectura se cancelaban otras 4 pruebas de la sección. Resultado: 81 OK, 0 FALLOS, 6 AVISOS.

## Otras pruebas de la fabricación

- `sql/sqlHoney/pruebas/foto_fabricacion_hc.js grabar|comparar [--motor=nuevo]`: 15 fabricaciones HoneyComb grabadas, a
  comparar después de cualquier cambio (fuera del repo).
- `sql/sqlHoney/pruebas/prueba_hc_nuevo.js`: HoneyComb con el motor nuevo (precios, perfil, alta, conversión).
- `C:\dev\sqlHoney\pruebas\foto_fabricacion_regresion.js`: fabricación de pedidos reales antes y después.
