# Tejidos: reestructuración y maestro de tejidos

Documento vivo. Aquí se recoge el estado actual de los tejidos, el plan de la nueva pantalla
y todo cambio que se haga (código y BD), para que el trabajo de la rama `fabricacion-tipo-1`
(motor v3 del enrollable) pueda apoyarse en él sin pisarse.

- Rama: `fabricacion-tipo-1`.
- Estado: tablas, carga, backend y pantalla hechos en local (2026-10-22). Pendiente: procedimiento de coste ml y grupo.
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
| Coste ml | **Calculado** | A partir del coste m² con una fórmula que dará el usuario. |
| Grupo | **Calculado** | Con una fórmula que dará el usuario. |

Los campos calculados nunca se teclean.

### Decisiones del usuario (2026-10-22)

1. Una fila por tejido + color.
2. Tipos de tejido: screen, blackout, etc. Llegan en un Excel aparte.
3. Todos los tejidos tienen coste m²; el coste ml se calcula desde el m² con una fórmula.
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
  coste_ml decimal(10,4) null      -- calculado (3.3)
  grupo varchar(10) null           -- calculado (3.3)
  calculado datetime null          -- última vez que se calcularon coste_ml y grupo
  activo bit not null default 1
  created / modified datetime, usuario int
  índices: (tipo_tejido); único (nombre, color, criterio)
```

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

- SP `sp_tejidos_maestro_calcular` (un tejido o todos) que aplica las fórmulas y guarda
  `coste_ml`, `grupo` y `calculado`.
- Hasta tener las fórmulas el SP existe pero deja los dos campos a NULL; la pantalla muestra
  "pendiente".
- Se recalcula al guardar un tejido, tras la carga del Excel y con un botón "Recalcular".

### 3.4 Backend

Controlador `backend/controllers/sm/tejidos_maestro.js` (consultas con parámetros, mismo patrón
que `accionamientos_nuevo.js`; no hacen falta procedimientos). Rutas en `/api/sm`, todas con
`Auth.ensureAuth`:

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/tejidos_maestro` | Lista completa con la descripción del tipo. |
| POST | `/tejidos_maestro` | Alta (`idrow` vacío) o modificación. Nunca escribe coste ml ni grupo. Código a 5 cifras. |
| POST | `/tejidos_maestro/activo` | `{ ids, activo }`: baja o reactivación. |
| GET | `/tejidos_maestro/tipos` | Tipos de tejido con cuántos tejidos los usan. |
| POST | `/tejidos_maestro/tipos` | Alta, cambio de nombre o baja de un tipo. |

Pendiente: `/tejidos_maestro/calcular` cuando exista el procedimiento de coste ml y grupo.

### 3.5 Frontend

Componente `routes/setup/tejidos-maestro`, ruta `/routes/master/tejidos-maestro` con
`PermisosGuard` y permiso `config_tejidos` (los administradores entran siempre). Mosaico
"Maestro de Tejidos" en la sección Tejidos de `setup`; permiso en la lista de la pantalla de
usuarios; título en `shared/page-titles.ts`.

- Tabla con búsqueda, filtro por columna, orden y paginación de 50.
- Filtros rápidos: tipo (o "sin tipo"), impresión digital, activos / bajas, "sin tipo o sin criterio".
- Alta / edición en modal (doble clic en la fila o botón Editar). Coste ml y grupo solo lectura ("pendiente").
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
| 6 | Procedimiento de cálculo de coste ml y grupo | Lo definirá el usuario |
| 7 | Uso del maestro desde tarifas / fabricación v3 y relación con las tablas actuales | Por decidir |

Nota (2026-10-22): `environment.ts` está como en `main` (apunta a producción), así que la pantalla
local no lee el backend local. La pantalla compila y se pinta; la API se probó aparte.

Cada script se aplica primero en local; las pruebas en
la BD local se deshacen al terminar.

---

## 5. Preguntas abiertas

- ~~P1. Criterio~~: es el ancho del rollo en cm (respondido 2026-10-22).
- **P2. Fórmulas** de coste ml y grupo: las definirá el usuario más adelante.
- **P3. Futuro.** Cuándo y cómo el maestro sustituirá a `SOL_ARTICULOS_TEJIDOS`, a
  `SOL_ARTICULOS_TEJIDOS_GRUPOS` y a las tablas de HoneyComb (fase 7).
- ~~P4. Precio m²~~: son de prueba; se cargan y se modificarán en el futuro.
- ~~P5. Filas incompletas~~: se cargan y se completan desde la pantalla.
- ~~P6. Colores numéricos~~: se cargan así.

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
