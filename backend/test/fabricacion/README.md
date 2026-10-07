# Tests de la fabricación por reglas (HoneyComb)

```
node backend/test/fabricacion/run.js          # todo (unos 15 s)
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
| 5 Pedido | Pedido de principio a fin con el código real del backend. Pasos: alta → hoja → parámetros → XML → simulación → modificar → cambios de configuración → cliente con reglas propias |
| 6 Regresión | Objetos que tocan los scripts. XML idéntico al original fuera de la HoneyComb. El tipo 7 no toca otros tipos. Regenerar pedidos reales |
| 7 Datos | `ALTO_PLIEGUES` = Excel. Parámetros y reglas coherentes. Referencias. Cobertura de combinaciones y tramos |
| 8 HTTP | Las rutas nuevas existen y no responden sin sesión ni con un token falso |

Al cambiar el motor, las reglas o los scripts de `sqlHoney`, hay que pasar todos los tests antes de llevar nada a TEST o PROD.
