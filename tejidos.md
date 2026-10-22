# Tejidos: reestructuración y maestro de tejidos

Documento vivo. Aquí se recoge el estado actual de los tejidos, el plan de la nueva pantalla
y todo cambio que se haga (código y BD), para que el trabajo de la rama `fabricacion-tipo-1`
(motor v3 del enrollable) pueda apoyarse en él sin pisarse.

- Rama: `fabricacion-tipo-1`.
- Estado: **PLAN PENDIENTE DE VALIDAR**. Decisiones recibidas; esperando los Excel y las fórmulas.
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
## 3. Propuesta (a validar)

### 3.1 Modelo de datos

Tablas nuevas, independientes de las actuales (las pantallas y SPs de hoy siguen igual):

```
SOL_TEJIDOS_TIPOS                       -- catálogo de tipos de tejido (Excel 2)
  idrow int identity PK
  descripcion varchar(50) not null unique
  activo bit not null default 1

SOL_TEJIDOS_MAESTRO                     -- una fila por tejido + color (Excel 1)
  idrow int identity PK
  cod_solupyme varchar(20) not null unique
  tipo_tejido int not null   -> SOL_TEJIDOS_TIPOS.idrow
  nombre varchar(100) not null
  color varchar(100) not null
  coste_m2 decimal(10,4) not null
  criterio int null
  impresion_digital bit not null default 0
  coste_ml decimal(10,4) null   -- calculado (3.3)
  grupo varchar(10) null        -- calculado (3.3)
  calculado datetime null       -- última vez que se calcularon coste_ml y grupo
  activo bit not null default 1
  created / modified datetime, usuario int
  unique (nombre, color)
```

- No hay borrado: baja lógica con `activo = 0`.
- El tipo de dato de `criterio` y los largos de los textos se ajustarán a lo que traiga el Excel.

### 3.2 Carga desde los Excel

El usuario pasa dos Excel: **tipos de tejido** y **tejidos**. Con ellos se generan scripts SQL
idempotentes (`MERGE` por `descripcion` en tipos y por `cod_solupyme` en tejidos), para que la
misma carga se aplique en local y luego la despliegue el usuario en PROD.

Antes de generar los scripts se valida el Excel y se informa al usuario de:

- Códigos Solupyme vacíos o repetidos.
- Tipos de tejido que no están en el Excel de tipos.
- Coste m² vacío, no numérico o ≤ 0; criterio no numérico.
- Impresión digital con valores que no sean sí/no (se aceptan Sí/No, S/N, 1/0, X/vacío).
- Tejido + color repetido con distinto código.

### 3.3 Campos calculados (coste ml y grupo)

- SP `sp_tejidos_maestro_calcular` (un tejido o todos) que aplica las fórmulas y guarda
  `coste_ml`, `grupo` y `calculado`.
- Hasta tener las fórmulas el SP existe pero deja los dos campos a NULL; la pantalla muestra
  "pendiente".
- Se recalcula al guardar un tejido, tras la carga del Excel y con un botón "Recalcular".

### 3.4 Backend

Controlador nuevo `backend/controllers/sm/tejidos_maestro.js`, montado en `/api/sm`:

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/tejidos_maestro` | Lista completa con el nombre del tipo. |
| POST | `/tejidos_maestro` | Alta / modificación (SP `sp_tejidos_maestro_set`, que recalcula). |
| POST | `/tejidos_maestro_baja` | Baja / reactivación (`activo`). |
| POST | `/tejidos_maestro_calcular` | Recalcular coste ml y grupo de uno o de todos. |
| GET/POST | `/tejidos_tipos` | Catálogo de tipos de tejido. |

### 3.5 Frontend

Componente nuevo `routes/setup/tejidos-maestro`, ruta `/routes/master/tejidos-maestro`,
mosaico nuevo en `setup.component.html` y permiso nuevo `config_tejidos` (como
`config_accionamientos`). Mismo estilo que la pantalla de tejidos actual:

- Tabla con búsqueda general, filtro por columna, orden y paginación de 50.
- Columnas: Código Solupyme · Tipo · Nombre · Color · Coste m² · Criterio · Impresión digital ·
  Coste ml (solo lectura) · Grupo (solo lectura).
- Modal de alta/edición (tipo en desplegable, impresión digital como casilla).
- Filtros rápidos: por tipo, "impresión digital", "dados de baja", "sin calcular".
- Gestión del catálogo de tipos de tejido en un modal.

### 3.6 Ficheros que se tocan (para no pisar al otro agente)

- Nuevos: `tejidos.md`, `sqlTejidos/` (scripts numerados e idempotentes),
  `backend/controllers/sm/tejidos_maestro.js`, `frontend/src/app/routes/setup/tejidos-maestro/`.
- Existentes, con cambios mínimos (añadir líneas): `backend/routes/sm_routes.js`,
  `frontend/src/app/routes/setup/setup.module.ts`,
  `frontend/src/app/routes/setup/setup/setup.component.html`.
- **No se tocan**: `sqlEnrrollable/`, `sqlHoney/`, `fabricacion_reglas.js`, las pantallas de
  tejidos actuales, `server.js`, `environment.ts`.

---

## 4. Plan por fases

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Este documento y validación del plan | Decisiones recibidas; falta validar la propuesta |
| 1 | `sqlTejidos/01_tablas_maestro_tejidos.sql` (las dos tablas) en local | Pendiente |
| 2 | `sqlTejidos/02_sps_maestro_tejidos.sql` (lista, alta/edición, baja, calcular vacío) | Pendiente |
| 3 | Backend: controlador y rutas | Pendiente |
| 4 | Frontend: pantalla, mosaico y permiso | Pendiente |
| 5 | Validación de los Excel y scripts de carga `03_carga_tipos_tejido.sql`, `04_carga_tejidos.sql` | Esperando los Excel |
| 6 | Fórmulas de coste ml y grupo en `sp_tejidos_maestro_calcular` | Esperando las fórmulas |
| 7 | Uso del maestro desde tarifas / fabricación v3 y relación con las tablas actuales | Por decidir |

Las fases 1-4 no dependen de los Excel. Cada script se aplica primero en local; las pruebas en
la BD local se deshacen al terminar.

---

## 5. Preguntas abiertas

- **P1. Criterio.** ¿Qué representa (ancho de rollo en cm u otra cosa)? Define el tipo de dato y
  la validación. Se puede confirmar al ver el Excel.
- **P2. Fórmulas.** Coste ml y grupo: ¿dependen solo del coste m² y el criterio, o también del
  tipo de tejido / impresión digital? (Lo dará el usuario.)
- **P3. Futuro.** Cuándo y cómo el maestro sustituirá a `SOL_ARTICULOS_TEJIDOS`, a
  `SOL_ARTICULOS_TEJIDOS_GRUPOS` y a las tablas de HoneyComb (fase 7).

---

## 6. Registro de cambios

| Fecha | Cambio | Local | PROD |
|---|---|---|---|
| 2026-10-22 | Creado el documento con el análisis y el plan | — | — |
| 2026-10-22 | Decisiones del usuario: fila por tejido + color, carga solo desde Excel, coste m² con ml calculado, impresión digital, HoneyComb incluido | — | — |
