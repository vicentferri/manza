# Parámetros de la fabricación del enrollable

Todo juego de reglas de un sistema (`ENROLLABLE_<código del sistema>`) nace con estos **57 parámetros**
(script `07_parametros_enrollable.sql`; la pantalla de reglas los crea al añadir un sistema). Son todos los datos
que trae una línea del configurador nuevo. Las reglas se escriben con ellos; los parámetros no se tocan.

Un paso que la línea no usa (por ejemplo `@MANDO` en una cadena) queda **vacío**. Las condiciones sobre un
parámetro vacío no se cumplen.

Formas de escribir una condición: `@SOPORTE == CORTO`, `@ANCHO >= 100.5`, `0 <= @ANCHO <= 160`, `@ALTO >> 200`.
Las medidas son decimales (100,5 cm). Las comparaciones con texto no distinguen mayúsculas.

## Datos de la línea

| Parámetro | Qué es | Valores |
|---|---|---|
| `@CANTIDAD` | Cortinas de la línea | entero |
| `@ANCHO`, `@ALTO` | Medidas de la cortina, en cm | decimal, p. ej. `100.50` |
| `@CADENA_LONGITUD` | Largo de la cadena a medida, en cm | decimal; vacío si no es a medida |
| `@POSICION_ID`, `@POSICION` | Posición del accionamiento | `1` / `DERECHA`, `2` / `IZQUIERDA` |
| `@IMPRESION` | Impresión digital en el tejido | `0` / `1` |
| `@SALIDA_TEJIDO_ID`, `@SALIDA_TEJIDO` | Salida del tejido | `1` / `CASCADA`, `2` / `PEGADO PARED` |
| `@SALIDA_TEJIDO_ARTICULO` | Artículo de la salida del tejido (`SOL_ARTICULOS_SALIDATEJIDO`) | id de artículo |

## Pasos del configurador

Cada paso tiene su id (`..._ID`, el de la línea) y su **código legible**, el `codigo` del catálogo `SOL_ACC_*`
(se ve en la pantalla de Productos > Accionamientos). Escriba las condiciones con el código, no con el id.

| Código | Id | Catálogo |
|---|---|---|
| `@SISTEMA` | `@SISTEMA_ID` | Sistema (`RHIN`, `DUERO`...) |
| `@ACCIONAMIENTO` | `@ACCIONAMIENTO_ID` | `CADENA`, `MOTOR`, `SIN_CADENA` |
| `@TIPO_CADENA` | `@TIPO_CADENA_ID` | Tipo de cadena |
| `@TIPO_ARO` | `@TIPO_ARO_ID` | Tipo de aro de cadena |
| `@CADENA_MEDIDA` | `@CADENA_MEDIDA_ID` | Tipo de cadena a medida |
| `@ALTURA`, `@ALTURA_VALOR` | `@ALTURA_ID` | Altura de la cadena (código y valor en cm) |
| `@COLOR_CADENA` | `@COLOR_CADENA_ID` | Color de cadena |
| `@TIPO_MOTOR` | `@TIPO_MOTOR_ID` | Tipo de motor |
| `@MODELO_MOTOR` | `@MODELO_MOTOR_ID` | Modelo de motor |
| `@MANDO` | `@MANDO_ID` | Mando |
| `@CARGADOR` | `@CARGADOR_ID` | Cargador |
| `@BATERIA` | `@BATERIA_ID` | Batería |
| `@SOPORTE`, `@COLOR_SOPORTE` | `@SOPORTE_ID`, `@COLOR_SOPORTE_ID` | Soporte y su color |
| `@TAPA`, `@COLOR_TAPA` | `@TAPA_ID`, `@COLOR_TAPA_ID` | Tapa y su color |
| `@CONTRAPESO`, `@COLOR_CONTRAPESO` | `@CONTRAPESO_ID`, `@COLOR_CONTRAPESO_ID` | Contrapeso y su color |

## Tejido (maestro de tejidos)

El tejido elegido trae su código Solupyme. **No hace falta una regla por tejido**: una sola regla de tejido por
sistema, con artículo "según el pedido" `@TEJIDO_ARTICULO` y el consumo que corresponda.

| Parámetro | Qué es |
|---|---|
| `@TEJIDO_ID` | Id del tejido en el maestro (`nacc_tejido_id`) |
| `@TEJIDO_REFERENCIA` | Código Solupyme (5 cifras, `03258`) |
| `@TEJIDO_ARTICULO` | Id del artículo del tejido en Solupyme. Si no existe: línea SIN ARTÍCULO |
| `@TEJIDO_NOMBRE`, `@TEJIDO_COLOR` | Nombre comercial y color |
| `@TEJIDO_CRITERIO` | Ancho del rollo, en cm (`300`) |
| `@TEJIDO_GRUPO` | Grupo del maestro (`B300`) |
| `@TEJIDO_TIPO_ID`, `@TEJIDO_TIPO` | Tipo de tejido (screen, blackout...) |
| `@TEJIDO_IMPRESION` | El tejido admite impresión digital (`1` / `0`) |

Ejemplo de regla de tejido, con el parámetro de usuario `@TEJIDO_ANCHO` = fórmula `@ANCHO -- 2`:
artículo `@TEJIDO_ARTICULO`, consumo `@TEJIDO_ANCHO ** @ALTO *T 0.0001` (m², 4 decimales sin redondear), con las
medidas del componente `@TEJIDO_ANCHO` y `@ALTO`.

## Qué falta

- Cajón ZIP y guía (`idcajon`, `idguia`): el configurador nuevo todavía no los modela, así que no hay parámetros.
- Los parámetros propios del sistema (como `@TEJIDO_ANCHO`) los añade el equipo en la pantalla, con un orden
  mayor que los de los que depende. Los estándar usan órdenes del 10 al 580.
- Cada cantidad (consumo) en un artículo con unidad **m** (ml) se escribe en cm: el motor lo pasa a metros.
- En el XML a producción, los artículos que se cuentan (Ud, juego, par, min) llevan el consumo en `CANT`; los
  que se miden (m², ml, y el tejido sin unidad) llevan `CANT` 1 y el consumo en `FACTOR` (script 06). Un artículo
  que se cuenta debe tener su unidad en Solupyme.
