# Guía: configurar la fabricación HoneyComb

Pantalla: menú **Fabricación → Configuración** (`/routes/herstellen/artikeln_fab_cd_v3`).
Requiere el permiso `fab_config` (Setup → Usuarios).

La fabricación de una HoneyComb es la lista de componentes (artículos + consumo) que acaba en el XML de
producción. Se construye así: **parámetros del pedido → reglas → componentes**.

**Sistema** (selector arriba a la derecha): cada producto que usa este motor es un sistema, con sus propios
parámetros y reglas. Hoy solo existe **HoneyComb**; las tres pestañas trabajan sobre el sistema elegido.

## 0. Entorno de trabajo

- Trabajar primero en **DEV** (backend local `https://localhost:3001` → BD `SOLARMANES_DEV`).
- Pedidos HoneyComb de prueba en DEV: **16950** (varilla, perfil blanco) y **16866** (motor, perfil antracita, junto a un enrollable).
  Para más casos, crear pedidos desde el configurador HoneyComb contra DEV.
- Lo que se configure en DEV **no pasa solo a producción** (son datos). Ver `REGISTRO_CAMBIOS.md`, paso 5.

## 1. Pestaña Parámetros

Son las variables que pueden usar las reglas. Ya existen:

| Parámetro | Valor |
|---|---|
| `@CANTIDAD`, `@ANCHO`, `@ALTO` | cantidad, ancho y alto (cm) |
| `@TEJIDO_TIPO_ID` / `@TEJIDO_TIPO` | tipo de tejido (id / texto, p. ej. OPACO) |
| `@TEJIDO_COLOR_ID` / `@TEJIDO_COLOR` | color del tejido |
| `@COLOR_PERFIL_ID` / `@COLOR_PERFIL` | color del perfil |
| `@ACCIONAMIENTO_ID` / `@ACCIONAMIENTO` | accionamiento (p. ej. CON VARILLA) |

- **Dato del pedido**: lee una columna del pedido HoneyComb.
- **Fórmula**: cálculo sobre parámetros anteriores (menor *Orden*). Operadores: `++` suma, `--` resta,
  `**` multiplica. Ejemplos: `@ANCHO -- 1.5` (ancho de corte), `@ALTO ** 2`.
- Guardar con un nombre existente lo sobrescribe. Pulsar una fila la carga en el formulario.
- Borrar un parámetro que usa una regla hace que esa regla deje de cumplirse.

> Mejor usar los `_ID` en las condiciones: el texto puede cambiar si se renombra un color o un tejido.

## 2. Pestaña Reglas

Cada regla dice: *si se cumplen estas condiciones, añade estos artículos con este consumo*.

| Campo | Qué poner |
|---|---|
| Cliente | **Todos** (regla general) o un cliente concreto. Ver "Reglas por cliente" abajo. |
| Orden | Posición del componente en la hoja y en el XML (C1, C2…). |
| Elemento | Texto libre descriptivo (PERFIL, TEJIDO, CORDÓN…). |
| Condición 1-4 | `@P == VALOR`, `@P >> 10`, `@P >= 10`, `@P << 10`, `@P <= 10`, `10 <= @P <= 20` |
| Op | Unión con la condición anterior: `Y` (y), `O` (o). `-` también cuenta como *y*. |
| Consumo | Uno por artículo separado por `;`. Si hay uno solo vale para todos. Vacío = 1. |
| Artículos | Ids separados por coma. Botón **Asignar Artículos** para buscarlos. |

Reglas prácticas:
- Una condición vacía se ignora. Una regla **sin condiciones se aplica siempre** (componentes fijos).
- `==` no distingue mayúsculas ni espacios (`CON VARILLA` = `con varilla`).
- **Unidades**: si el artículo se mide en metros (unidad 3), el consumo se escribe **en cm**
  (`@ANCHO -- 2` → 98 cm → 0,98 m en la hoja). En unidades (piezas) se escribe el número de piezas.
- Las celdas de la tabla se pueden editar directamente. El icono de goma borra la regla.
- La regla vacía que ya existe (orden 10, sin artículos) no genera nada; se puede borrar.

Ejemplo (perfil manual blanco + perfil de fijación cuando es varilla y perfil blanco):

| Orden | Elemento | Condición 1 | Op | Condición 2 | Consumo | Artículos |
|---|---|---|---|---|---|---|
| 1 | PERFIL | `@ACCIONAMIENTO_ID == 2` | Y | `@COLOR_PERFIL_ID == 1` | `@ANCHO -- 1.5;@ANCHO` | `16472,16476` |

Los artículos HoneyComb del ERP están en `SOL_ARTICULOS_HONEYCOMB_ARTICULO` (perfiles por color, etc.).

### Reglas por cliente

- Las reglas con cliente **Todos** son la fabricación general.
- Si un cliente tiene **al menos una** regla propia en el sistema, sus pedidos usan **solo sus reglas** y no las de
  Todos. Por eso, para un cliente con fabricación distinta hay que darle de alta **la fabricación completa**, no
  solo la pieza que cambia.
- Un cliente sin reglas propias usa las de Todos.
- En la tabla, la columna *Cliente* se puede cambiar directamente (desplegable).
- Al simular, un aviso indica qué reglas se han usado (las del cliente o las generales).

## 3. Pestaña Simulación

1. Poner el **ID del pedido** y pulsar **Simular Pedido**.
2. Izquierda: valores de los parámetros de cada línea. Derecha: componentes generados.
3. **Fichero Fabricación** descarga el XML (`<Articulo>22000</Articulo>` por cada unidad).

Qué revisar:
- Que salgan todos los componentes esperados y ninguno de más.
- Un consumo `-1` significa que la fórmula no se pudo calcular (parámetro mal escrito o no numérico).
- Si no sale nada: comprobar en la tabla de parámetros que el valor es el esperado y que la condición lo escribe igual.

Método recomendado: montar un caso por combinación (accionamiento × color de perfil × tipo de tejido,
y medidas límite si hay reglas por tramos) y simularlos todos antes de dar la configuración por buena.

## 4. Al terminar

Avisar para generar el script que lleve las reglas y parámetros de DEV a producción.
