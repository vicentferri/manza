# Tejidos: reestructuración y maestro de tejidos

Documento vivo. Aquí se recoge el estado actual de los tejidos, el plan de la nueva pantalla
y todo cambio que se haga (código y BD), para que el trabajo de la rama `fabricacion-tipo-1`
(motor v3 del enrollable) pueda apoyarse en él sin pisarse.

- Rama: `fabricacion-tipo-1`.
- Estado: tablas, carga, grupo, coste ml, backend y pantalla hechos en local (2026-10-23).
- BD de trabajo: `SOLARMANES_DEV` en local. Producción la despliega el usuario.

---

## 1. Objetivo

Nueva pantalla en la zona interna (`/routes/master/...`, carpeta `frontend/src/app/routes/setup`)
para dar de alta y mantener **todos nuestros tejidos** (HoneyComb incluido). Cada fila es un
**tejido + color**, con un código Solupyme:

| Campo | Origen | Descripción |
|---|---|---|
| Código Solupyme | Excel / pantalla | Código del artículo en Solupyme. Único. |
| Tipo de tejido | Excel / pantalla | Screen, blackout, etc. Catálogo propio, cargado desde un segundo Excel. |
| Nombre del tejido | Excel / pantalla | Nombre comercial. |
| Color del tejido | Excel / pantalla | Texto del color. |
| Coste m² | Excel / pantalla | Todos los tejidos tienen coste en m². Se mantiene en esta pantalla (no viene de Solupyme). |
| Criterio | Excel / pantalla | |
| Impresión digital | Excel / pantalla | Sí / No. |
| Coste ml | **Calculado** | Solo en los tejidos y lamas (89 / 127 mm) que marque el usuario (3.3). |
| Grupo | **Calculado** | Con una fórmula que dará el usuario. |

Los campos calculados nunca se teclean.

### Decisiones del usuario (2026-10-22)

1. Una fila por tejido + color.
2. Tipos de tejido: screen, blackout, etc. Llegan en un Excel aparte.
3. Todos los tejidos tienen coste m²; el coste ml se calcula desde el m² con una fórmula, solo en
   los tejidos que elija el usuario y para la lama de 89 mm, la de 127 mm o las dos.
4. El coste se mantiene en esta pantalla.
5. HoneyComb entra en el maestro.
6. **La tabla se carga desde el Excel del usuario. No se toma nada de los datos actuales**
   (ni `SOL_ARTICULOS_TEJIDOS`, ni `ARTICULOS`, ni colores, ni grupos).

---

## 2. Estado actual (solo como contexto)

El maestro nuevo **no se alimenta ni se enlaza** con estas tablas. Se documentan para saber qué
existe hoy y qué habrá que decidir cuando el maestro sustituya a lo actual.

### Tablas implicadas

| Tabla | Filas | Qué guarda |
|---|---|---|
| `SOL_ARTICULOS_TEJIDOS` | 252 | Tejido (sin color). `descripcion`, `tipo` (siempre 3 = "Tejidos" de `SOL_ARTICULOS_TIPO`, no es tipo de tejido), `COSTE`/`CRITERIO` (enrollable, m²), `COSTE3`/`CRITERIO3` (vertical, ml), `COSTE4`/`CRITERIO4` (línea blanca, ml), `DENSIDAD`, `OPACIDAD`, `TARIFA`, ficha técnica. |
| `SOL_ARTICULOS_TEJIDOS_COLORES` | 1375 | Relación tejido × color (`color` → `SOL_ARTICULOS_COLORES_MARCAS.idrow`), `impresion_digital`, nombres desnormalizados. |
| `SOL_ARTICULOS_COLORES_MARCAS` | — | Catálogo de colores (compartido con otros artículos). |
| `SOL_ARTICULOS_TEJIDOS_ATRIBUTOS` | 2858 | Tejido × color **por cliente**: `codigoprov`, `codigoprov2` (referencias del cliente, p. ej. Leroy), `anchomax`, `color_hex`. |
| `SOL_ARTICULOS_TEJIDOS_GRUPOS` | 249 | Grupos de precio: letra (`A`, `C`, `E`…) + criterio (`C250`), `precio`, `nexos` (ids de tejido separados por comas, sin FK). |
| `ARTICULOS` (familia Solupyme `007`) | 1427 | Artículos de Solupyme de tejido. **Un código por tejido + color** (`00045` = JAVEA 5 0202 BLANCO PL). `PRECIO_COSTE1` lleva el coste. No hay enlace con `SOL_ARTICULOS_TEJIDOS`: solo coincide el texto de la descripción. |
| `SOL_ARTICULOS_HONEYCOMB_TIPOSTEJIDO` / `_COLORESTEJIDO` | 1 / 10 | Tejidos de HoneyComb, en tablas propias (fuera del modelo general). |

### Pantallas existentes

- `/routes/master/tejidos` (`routes/setup/tejidos`): CRUD de `SOL_ARTICULOS_TEJIDOS`, edición
  en línea de costes y criterios, asignación a clientes. Endpoints en
  `backend/controllers/sm/tejidos.js` (`/api/sm/tejidos`, `/tejido`, `/tejidos_cliente`…).
- `/routes/master/tejidos-colores` (`routes/setup/tejidos-colores`): catálogo tejido × color.

### Problemas detectados

1. **No hay enlace Solupyme ↔ tejido.** El código de Solupyme está en `ARTICULOS` (por tejido +
   color) y el tejido de la configuración en `SOL_ARTICULOS_TEJIDOS` (sin color); solo se
   relacionan por el nombre.
2. **El coste está repartido en tres pares de columnas** (`COSTE`, `COSTE3`, `COSTE4`), con la
   unidad implícita en el nombre de la columna (m² enrollable, ml vertical / línea blanca).
3. **No existe "tipo de tejido".** El campo `tipo` es el tipo de artículo (siempre 3).
4. **El grupo es manual** (`SOL_ARTICULOS_TEJIDOS_GRUPOS.nexos`, ids en texto sin FK).
5. 88 tejidos con `CRITERIO` NULL y 6 con 0.
6. HoneyComb tiene sus tejidos aparte.
7. Borrar un tejido falla por FK y su id se usa sin FK en tarifas, pedidos, presupuestos,
   CortinaDecor y producción (aplazado; ver `sqlClientes/README.md`). **La nueva pantalla no
   borrará: solo dará de baja (`activo = 0`).**

---
## 3. Propuesta

### 3.1 Modelo de datos (creado en local, script `sqlTejidos/01_tablas_maestro_tejidos.sql`)

Tablas nuevas, independientes de las actuales (las pantallas y SPs de hoy siguen igual):

```
SOL_TEJIDOS_TIPOS                       -- catálogo de tipos de tejido (15, del usuario)
  idrow int identity PK
  descripcion varchar(50) not null unique
  activo bit not null default 1
  created / modified datetime, usuario int

SOL_TEJIDOS_MAESTRO                     -- una fila por tejido + color (TEJIDOS.xlsx)
  idrow int identity PK
  cod_solupyme varchar(20) not null unique     -- 5 cifras con ceros: '03258'
  tipo_tejido int null      -> SOL_TEJIDOS_TIPOS.idrow
  nombre varchar(100) not null
  color varchar(100) not null
  criterio int null         check > 0          -- ancho del rollo en cm
  impresion_digital bit not null default 0
  coste_m2 decimal(10,4) not null  check >= 0
  grupo varchar(10) null           -- calculado (3.3)
  calculado datetime null          -- última vez que se calculó el grupo
  activo bit not null default 1
  created / modified datetime, usuario int
  índices: (tipo_tejido); único (nombre, color, criterio)

SOL_TEJIDOS_GRUPOS_LETRAS               -- precio de grupo → letra (2 = A … 55 = AZ), script 03

SOL_TEJIDOS_PARAMETROS                  -- script 04
  clave varchar(50) PK                  -- PRECIO_MINUTO_MO = 0,28 € (se cambia en la pantalla)
  descripcion, valor decimal(10,4), modified, usuario

SOL_TEJIDOS_LAMAS                       -- script 04: 89 y 127 mm
  ancho_mm int PK, tiempo_corte_min, ancho_bobina_m, alto_bobina_m   (20 min, 1 × 30 m)

SOL_TEJIDOS_MAESTRO_COSTE_ML            -- script 04: lamas marcadas en cada tejido
  tejido -> SOL_TEJIDOS_MAESTRO.idrow (on delete cascade), ancho_mm -> SOL_TEJIDOS_LAMAS
  coste_ml decimal(10,4) null, calculado datetime      PK (tejido, ancho_mm)
```

- La columna `coste_ml` que tenía el maestro se quitó en el script 04: cada tejido puede tener
  dos costes ml (uno por lama), y solo los que marque el usuario.

- No hay borrado: baja lógica con `activo = 0`.
- `tipo_tejido` y `criterio` admiten NULL porque el Excel trae filas sin ellos (3.2).
- **No se repite nombre + color + criterio**: VERA BLOCK / VERA TRANSP 200 y 250 son tejidos
  distintos con el mismo nombre y color (confirmado por el usuario).
- `cod_solupyme` es texto con ceros a la izquierda, como `ARTICULOS.COD_SOLUPYME`:
  `3258` y `03258` son artículos distintos en Solupyme.

### 3.2 Carga desde los Excel

- **Tipos de tejido**: los 15 que pasó el usuario ya están en el script 01.
- **Tejidos**: `TEJIDOS.xlsx` (raíz del repo, hoja `MASTER TEJIDOS CONFIGURADOR`), 935 filas.
  Columnas: `CÓDIGO SP`, `CRITERIO`, `NOMBRE`, `COLOR`, `TIPO TEJIDO`,
  `IMPRESIÓN DIGITAL`, `PRECIO/M2`, `PRECIO/ML` (vacía), `GRUPO` (vacía).
- `sqlTejidos/02_carga_tejidos.sql` lo genera `sqlTejidos/herramientas/generar_02_carga_tejidos.js`
  (`node sqlTejidos/herramientas/generar_02_carga_tejidos.js [Excel]`). El generador valida el Excel
  y para si hay errores. El script solo inserta los códigos que no existen: no pisa lo cambiado
  desde la pantalla. Cargados 935 tejidos (66 sin tipo y 18 sin criterio, se completan en la
  pantalla; 11 con impresión digital).

Análisis del Excel (2026-10-22):

| Comprobación | Resultado |
|---|---|
| Códigos | 935, sin repetir. En el Excel son números con formato de celda `00000` (se ven `03258`, el valor es `3258`): al cargar se rellenan a 5 cifras. |
| Tipos | Los 15 del catálogo coinciden exactos. **66 filas sin tipo** (SILKMOON RE LIFE, VIENA, ACUSTIC, DARKTEX, GALES…). |
| Criterio | 140, 180, 200, 250, 280, 300, 320, 350. **18 filas sin criterio** (VIENA…). |
| Color | **83 colores guardados como número sin formato**: se ven sin ceros también en Excel (ALPES `000` → `0`, GALES `063` → `63`). Se cargan así (decisión del usuario). |
| Nombre + color | VERA BLOCK / VERA TRANSP: correcto, se distinguen por criterio. IBIZA 1: corregido por el usuario. |
| Nombres | Algunos con espacios al final (`VERA BLOCK `): se recortan. |
| Impresión digital | 11 `SÍ`, el resto vacío → 1 / 0. |
| Precio m² | 2,00 a 11,34. Valores de prueba (confirmado): se cargan y se cambiarán más adelante. |
| Precio ml / grupo | Vacíos (se calcularán). |

### 3.3 Campos calculados (coste ml y grupo)

**Grupo** (fórmula del usuario, 2026-10-23):

1. Precio de grupo = coste m² + 10 %, redondeado a la unidad superior (`ceiling(coste_m2 * 1.10)`).
   Siempre con el coste m², aunque el tejido se venda por ml. Si ya es entero se queda igual
   (10,00 € → 11,00 → J). Mínimo grupo A (un precio de grupo por debajo de 2 cuenta como 2).
2. La letra sale del precio de grupo: A = 2 €, B = 3 €, C = 4 €, D = 5 €… (alfabeto con Ñ: N = 15,
   Ñ = 16, O = 17… Z = 28, AA = 29… AÑ = 43… AZ = 55). Tabla facilitada por el usuario, guardada en
   `SOL_TEJIDOS_GRUPOS_LETRAS`. Por encima de 55 no hay grupo.
3. Grupo = letra + criterio (ancho máximo de pieza en cm).

Ejemplo: JÁVEA, 3,90 €/m², ancho máximo 300 cm → 3,90 × 1,10 = 4,29 → 5 → D → **D300**.

- Sin criterio no hay grupo (queda "pendiente").
**Coste ml** (calculadora del usuario `CALCULADORA PRECIO ML VERTICAL.xlsx`, 2026-10-23), por lama:

| Parte | Cálculo |
|---|---|
| Tejido por ml | coste m² × ancho lama (m) × 1 m |
| Corte de bobina | precio minuto mano de obra × minutos de corte |
| ml por bobina | (ancho bobina ÷ ancho lama) × alto bobina |
| Mano de obra por ml | corte de bobina ÷ ml por bobina |
| **Coste ml** | tejido por ml + mano de obra por ml (4 decimales) |

Ejemplo de la calculadora: 7,42 €/m², 0,28 €/min, 20 min, bobina 1 × 30 m → **0,6770** (89 mm) y
**0,9660** (127 mm).

- Solo se calcula en los tejidos que marque el usuario, y para 89 mm, 127 mm o las dos.
- El precio minuto se cambia desde la pantalla ("Parámetros ml") y recalcula todos los costes ml.
- Los minutos de corte y la bobina están en `SOL_TEJIDOS_LAMAS` (de momento se cambian por script).

Implementación (`sqlTejidos/03_calculo_grupo.sql`, hecho en local):

- Tabla `SOL_TEJIDOS_GRUPOS_LETRAS` (precio → letra, 2…55).
- Procedimiento `sp_tejidos_maestro_calcular @idrow` (NULL = todos): guarda `grupo` y `calculado`
  y devuelve `calculados` y `sin_grupo`. El script lo ejecuta al final para todos.
- El backend lo llama al guardar un tejido; la pantalla tiene el botón "Recalcular grupos"
  (`POST /tejidos_maestro/calcular`).
- Resultado con los datos actuales: 917 con grupo (B200…L250), 18 sin grupo por no tener criterio.
- El script `04_coste_ml.sql` amplía el mismo procedimiento para calcular también el coste ml de
  las lamas marcadas; ahora devuelve además `costes_ml`. Con la carga inicial no hay ninguna marcada.

### 3.4 Backend

Controlador `backend/controllers/sm/tejidos_maestro.js` (consultas con parámetros, mismo patrón
que `accionamientos_nuevo.js`; el único procedimiento es el de cálculo, `sp_tejidos_maestro_calcular`). Rutas en `/api/sm`, todas con
`Auth.ensureAuth`:

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/tejidos_maestro` | Lista completa con la descripción del tipo. |
| POST | `/tejidos_maestro` | Alta (`idrow` vacío) o modificación, y recalcula. `lamas` (opcional, `[89]`, `[127]`, `[89, 127]` o `[]`): lamas a las que calcular coste ml. Nunca escribe grupo ni coste ml a mano. Código a 5 cifras. |
| POST | `/tejidos_maestro/activo` | `{ ids, activo }`: baja o reactivación. |
| GET | `/tejidos_maestro/tipos` | Tipos de tejido con cuántos tejidos los usan. |
| POST | `/tejidos_maestro/tipos` | Alta, cambio de nombre o baja de un tipo. |
| POST | `/tejidos_maestro/calcular` | Recalcula grupo y coste ml de todos (`sp_tejidos_maestro_calcular`). |
| POST | `/tejidos_maestro/ml` | `{ ids, lamas, marcar }`: marca (o quita) lamas en varios tejidos y recalcula. |
| GET | `/tejidos_maestro/ml_config` | Precio minuto y lamas con sus parámetros. |
| POST | `/tejidos_maestro/precio_minuto` | `{ valor }`: cambia el precio minuto y recalcula todos los costes ml. |

### 3.5 Frontend

Componente `routes/setup/tejidos-maestro`, ruta `/routes/master/tejidos-maestro` con
`PermisosGuard` y permiso `config_tejidos` (los administradores entran siempre). Mosaico
"Maestro de Tejidos" en la sección Tejidos de `setup`; permiso en la lista de la pantalla de
usuarios; título en `shared/page-titles.ts`.

- Tabla con búsqueda, filtro por columna, orden y paginación de 50.
- Filtros rápidos: tipo (o "sin tipo"), impresión digital, activos / bajas, "sin tipo o sin criterio".
- Alta / edición en modal: un clic en la fila abre el tejido (la casilla de selección no lo abre, queda
  para las acciones sobre varios) o botón Editar, con casillas "Calcular coste ml"
  89 mm / 127 mm. Grupo y coste ml solo lectura.
- Columnas "Coste ml 89" y "Coste ml 127" (vacías si la lama no está marcada); filtro "con / sin coste ml".
- Botón "Coste ml": marca o quita las lamas elegidas en los tejidos seleccionados.
- "Parámetros ml": cambia el precio minuto (recalcula todo) y muestra los parámetros de cada lama.
- "Recalcular": grupo y coste ml de todos.
- Dar de baja / reactivar la selección.
- Modal "Tipos de Tejido": alta, cambio de nombre y baja.

### 3.6 Ficheros que se tocan (para no pisar al otro agente)

- Nuevos: `tejidos.md`, `sqlTejidos/` (scripts numerados e idempotentes),
  `backend/controllers/sm/tejidos_maestro.js`, `frontend/src/app/routes/setup/tejidos-maestro/`.
- Existentes, con cambios mínimos (añadir líneas): `backend/routes/sm_routes.js`,
  `frontend/src/app/routes/setup/setup.module.ts`,
  `frontend/src/app/routes/setup/setup/setup.component.html`,
  `frontend/src/app/routes/setup/usuarios/usuarios.component.ts`,
  `frontend/src/app/shared/page-titles.ts`.
- **No se tocan**: `sqlEnrrollable/`, `sqlHoney/`, `fabricacion_reglas.js`, las pantallas de
  tejidos actuales, `server.js`, `environment.ts`.

---

## 4. Plan por fases

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Este documento y validación del plan | Hecho |
| 1 | `sqlTejidos/01_tablas_maestro_tejidos.sql` (las dos tablas + 15 tipos) | **Hecho en local** |
| 2 | `sqlTejidos/02_carga_tejidos.sql` desde `TEJIDOS.xlsx` (935 tejidos) | **Hecho en local** |
| 3 | Procedimientos | No hacen falta (el backend usa consultas con parámetros) |
| 4 | Backend: controlador y rutas | **Hecho**, probado contra la BD local |
| 5 | Frontend: pantalla, mosaico y permiso | **Hecho**; falta probarla con datos en el navegador (ver nota) |
| 6 | Cálculo del grupo (`03_calculo_grupo.sql`) | **Hecho en local** |
| 6b | Coste ml por lama (`04_coste_ml.sql`), backend y pantalla | **Hecho en local** |
| 7 | Uso del maestro desde tarifas / fabricación v3 y relación con las tablas actuales | Por decidir |

Pantalla probada en el navegador contra el backend local (2026-10-23): carga, selección, coste ml en
bloque, edición con lamas y cambio de precio minuto. `environment.ts` en local: `https://localhost:3001`
y `api_surl: '/api'` (no se commitea).

Pendiente: el token de sesión no lleva el id de usuario (solo nombre, apellidos, email y rol), así que
`usuario` se guarda vacío en las tablas del maestro.

Cada script se aplica primero en local; las pruebas en
la BD local se deshacen al terminar.

---

## 5. Preguntas abiertas

- ~~P1. Criterio~~: es el ancho del rollo en cm (respondido 2026-10-22).
- ~~P2. Fórmulas~~: grupo y coste ml definidos (2026-10-23).
- **P3. Futuro.** Cuándo y cómo el maestro sustituirá a `SOL_ARTICULOS_TEJIDOS`, a
  `SOL_ARTICULOS_TEJIDOS_GRUPOS` y a las tablas de HoneyComb (fase 7).
- ~~P4. Precio m²~~: son de prueba; se cargan y se modificarán en el futuro.
- ~~P5. Filas incompletas~~: se cargan y se completan desde la pantalla.
- ~~P6. Colores numéricos~~: se cargan así.

---

## 5b. Para la fabricación por reglas (otra sesión)

Desde el 2026-10-23 las líneas del configurador nuevo llevan el tejido del maestro en
`SOL_PEDIDOS_COLA_TIPO_1.nacc_tejido_id` (y en presupuestos), y `tej_tipo_id` / `tej_color_id` a -1. La
fabricación v3 (búsqueda "tejido por tipo + color" de `sqlEnrrollable/04`) tiene que leer
`nacc_tejido_id`: el maestro da nombre, color, criterio y el **código Solupyme**, que es
`ARTICULOS.COD_SOLUPYME` del artículo del tejido. No se ha tocado nada de la fabricación.

---

## 6. Registro de cambios

| Fecha | Cambio | Local | PROD |
|---|---|---|---|
| 2026-10-22 | Creado el documento con el análisis y el plan | — | — |
| 2026-10-22 | Decisiones del usuario: fila por tejido + color, carga solo desde Excel, coste m² con ml calculado, impresión digital, HoneyComb incluido | — | — |
| 2026-10-22 | `sqlTejidos/01_tablas_maestro_tejidos.sql`: tablas `SOL_TEJIDOS_TIPOS` (15 tipos) y `SOL_TEJIDOS_MAESTRO` (vacía) | Aplicado (`SOLARMANES_DEV`) | Pendiente |
| 2026-10-22 | Script 01: fuera `nombre_solupyme` (el usuario quitó `NOMBRE SP` del Excel); único (nombre, color, criterio). Tabla vacía recreada | Aplicado (`SOLARMANES_DEV`) | Pendiente |
| 2026-10-22 | `sqlTejidos/02_carga_tejidos.sql` (generado desde `TEJIDOS.xlsx`): 935 tejidos | Aplicado (`SOLARMANES_DEV`) | Pendiente |
| 2026-10-22 | Backend `tejidos_maestro.js` + rutas; pantalla `tejidos-maestro`, mosaico, permiso `config_tejidos`. Pruebas de la API deshechas (fila y tipo de prueba borrados, identidades reajustadas) | — | Pendiente |
| 2026-10-23 | `sqlTejidos/03_calculo_grupo.sql`: `SOL_TEJIDOS_GRUPOS_LETRAS` (2…55), `sp_tejidos_maestro_calcular`, grupos de los 935 tejidos. Backend recalcula al guardar y ruta `/calcular`; botón en la pantalla. Pruebas deshechas | Aplicado (`SOLARMANES_DEV`) | Pendiente |
| 2026-10-23 | `sqlTejidos/04_coste_ml.sql`: `SOL_TEJIDOS_PARAMETROS` (precio minuto 0,28), `SOL_TEJIDOS_LAMAS` (89 y 127), `SOL_TEJIDOS_MAESTRO_COSTE_ML`; fuera `SOL_TEJIDOS_MAESTRO.coste_ml`; `sp_tejidos_maestro_calcular` calcula también el coste ml. Script 01 sin `coste_ml`. Backend (rutas `/ml`, `/ml_config`, `/precio_minuto`) y pantalla. Pruebas deshechas | Aplicado (`SOLARMANES_DEV`) | Pendiente |
| 2026-10-23 | Pantalla: se inicializa el formulario con `lamas` y `ml` (la ventana de edición, siempre en la página, rompía el refresco de toda la pantalla). Pruebas en el navegador deshechas | — | — |
| 2026-10-23 | Pantalla: un clic en la fila abre el tejido (antes doble clic); la casilla solo selecciona | — | — |
| 2026-10-23 | Pantalla Productos → apartado Tejidos: qué tejidos del maestro salen en el configurador del enrollable (`SOL_ACC_PRODUCTO_TEJIDO`, script 29 de sqlAccionamientos). El configurador todavía no la usa | Aplicado (`SOLARMANES_DEV`, vacía) | Pendiente |
| 2026-10-23 | Configurador nuevo con los tejidos del maestro: la línea guarda `nacc_tejido_id`, criterio por ancho, precio T1 por el grupo del maestro y T2 por tejido + criterio (`acc_tejido_nombre`), generador con "Tejido del maestro (T2)" (scripts 30-32 de sqlAccionamientos) | Aplicado (`SOLARMANES_DEV`) | Pendiente |
| 2026-10-23 | Revisado "Generar Tarifa" con T2 del maestro: mapa idéntico al del tejido de siempre; corregida la generación múltiple (script 33 de sqlAccionamientos); buscador de tarifas con el tejido del maestro | Aplicado (`SOLARMANES_DEV`) | Pendiente |
| 2026-10-26 | Corregido `sqlTejidos/04_coste_ml.sql`: en una BD sin la columna `SOL_TEJIDOS_MAESTRO.coste_ml` (la que crea el 01 actual) fallaba con el error 207 al compilar el lote que la consulta. Ahora la consulta va en SQL dinámico. Probado: pasos 01 a 18 de `despliegue/` en una copia de la BD local, sin errores | Aplicado | En despliegue (el 04 se repite, es idempotente) |
| 2026-10-27 | Tejidos disponibles **por sistema** (decisión del usuario): `SOL_ACC_SISTEMA_TEJIDO`, script 36 de sqlAccionamientos, sustituye a `SOL_ACC_PRODUCTO_TEJIDO` (sus tejidos pasan a todos los sistemas). Pantalla Productos → Tejidos con selector de sistema y "Copiar de otro sistema"; el configurador nuevo pide el tejido después del sistema y solo enseña los de ese sistema | Aplicado (`SOLARMANES_DEV`) | Pendiente |
