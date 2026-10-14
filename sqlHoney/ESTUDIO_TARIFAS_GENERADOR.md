# Estudio: cálculos del generador de tarifas por tipo de producto

Pantalla `routes/herstellen/tarifasimul-search` y su detalle `tarifasimul`. Estudio previo para añadir
HoneyComb al generador (rama `honeyComb_tarifas`). Solo cubre el **primer nivel**: cómo el generador
construye el mapa de precios de cada tarifa. No cubre cómo el configurador consume esos mapas.

- Fecha: 2026-10-08. Actualizado el 2026-10-13 con las decisiones de HoneyComb y su implantación en
  DEV (apartados 4.6 y 7). Los apartados 1 a 5 describen el generador **antes** de HoneyComb; donde
  cambió algo se indica con "(13.10)".
- Fuente: BD local `SOLARMANES_DEV` y código del repo. Para el estudio (08.10) no se ejecutó ningún SP,
  porque todos escriben en tablas: las comprobaciones se hicieron llamando a las funciones desde un
  `SELECT`. Para la implantación (13.10) se calculó el SP del mapa sobre tablas de prueba (destino 3,
  ids negativos) y se probó en pantalla con tarifas de prueba que se borraron después.
- Objetos SQL estudiados:
  - SPs del mapa: `sp_solarmanes_precio_tejido_tabla_tarifa` (general) y
    `sp_solarmanes_precio_tejido_tabla_tarifa_lineablanca`.
  - Desglose de una celda: `sp_simulate_table_details`.
  - Mantenimiento de la tarifa: `sp_tarifas_simulate`, `sp_tarifas_simulate_articles`.
  - Funciones de tejido: `fn_solarmanes_precio_tejido`, `fn_solarmanes_precio_tejido_vertical`,
    `fn_solarmanes_precio_tejido_nyd`, `fn_Vertical_numLamas`.
  - Funciones comunes: `fn_Tarifa_Lineales`, `fn_precio_tarifa_montaje`, `fn_solarmanes_peso_tejido`,
    `fn_solarmanes_peso_tejido_valor`, `temp_fn_precio_tarifa_embalaje`,
    `fn_solarmanes_precio_articulos_tipo_7`, `fn_solarmanes_precio_articulos_tipo_8`.
- Frontend: `frontend/src/app/routes/herstellen/tarifas-simulate/tarifas-simulate.component.ts`.

Índice:

1. Numeración de productos
2. Visión general: qué es una tarifa y cómo se calcula su mapa
3. Lo común a todos los productos
4. Ficha de cada producto (4.6 HoneyComb)
5. Ejemplos verificados (una celda por producto)
6. Hallazgos
7. HoneyComb: decisiones y estado de la implantación

---

## 1. Numeración de productos

El campo `SOL_TARIFAS_SIMULATE.tipoproducto` del generador **no coincide** con `TipoCortina`
(`SOL_ARTICULOS_PRODUCTOS`) del configurador:

| tipoproducto | Producto      | Tarifas en DEV |
|--------------|---------------|----------------|
| 1            | Enrollable    | 3.166          |
| 2            | Panel japonés | 2              |
| 3            | Vertical      | 199            |
| 4            | Línea blanca  | 33             |
| 5            | Noche y día   | 46             |
| 7 (13.10)    | HoneyComb     | 0 (alta en DEV, pendiente de crear tarifas reales) |

Hasta el 08.10 HoneyComb no existía en el generador. Desde el 13.10 es el `tipoproducto` 7, el mismo
número que en el configurador (`TipoCortina` 7); el 6 queda sin usar a propósito, porque en el
configurador es el cajón ZIP.

---

## 2. Visión general

Una **tarifa** del generador (`SOL_TARIFAS_SIMULATE`) es un escandallo: una cabecera con el tejido,
los márgenes y los parámetros de cálculo, más una lista de artículos (`SOL_TARIFAS_SIMULATE_LINES`) y
una tabla de tiempos de montaje (`SOL_TARIFAS_SIMULATE_TIMES`).

A partir de eso, el SP del mapa recorre una **rejilla de medidas** (filas = altos, columnas = anchos)
y en cada celda calcula un precio sumando **componentes**. El resultado es la tabla ancho × alto que se
ve en la pantalla y la que se exporta.

```
cabecera + líneas + tiempos ──► para cada (alto, ancho) de la rejilla ──► suma de componentes ──► mapa
```

Lo que **cambia por producto**:

- la rejilla (qué altos y anchos);
- el suplemento de alto (`c01`);
- la función que calcula el tejido;
- el margen que se aplica al montaje (solo vertical);
- en línea blanca, el SP y la definición de unitarios.

Todo lo demás es **común**.

---

## 3. Lo común a todos los productos

### 3.1 Datos de entrada

**Cabecera (`SOL_TARIFAS_SIMULATE`)**

| Campo | Significado | Uso en el cálculo |
|-------|-------------|-------------------|
| `tipoproducto` | Producto (tabla del apartado 1) | Elige rejilla, función de tejido y SP |
| `criterio` | Ancho del rollo (cm) o de la lama (mm, verticales) | Función de tejido |
| `preciom2` | Coste del tejido por m² (o por mL en vertical y línea blanca) | Función de tejido |
| `margen1` (MTej) | Margen del tejido | Tejido, montaje y desmultiplicador |
| `margen2` (MCli) | Margen del cliente | Multiplica casi toda la celda |
| `margen3` (MMec) | Margen del mecanismo | Valor que se copia a `mmeca` en las líneas |
| `margen4` (MAcc) | Margen del accionamiento | **No interviene en ningún cálculo** (solo se guarda, clona y muestra) |
| `preciomontaje` | Precio por minuto de mano de obra | Montaje |
| `densidad` | Peso del tejido (por defecto 0,33) | Desmultiplicador |
| `desmultiplicador`, `desmultiplicador_trigger`, `desmultiplicador_value` | Recargo por peso: activo sí/no, umbral (1,90), importe (1,12) | Desmultiplicador |

Valores por defecto al crear una tarifa (`sp_tarifas_simulate`): márgenes 2,22 / 1 / 2,22 / 2,22.

**Líneas (`SOL_TARIFAS_SIMULATE_LINES`)**

| Campo | Significado |
|-------|-------------|
| `articulo` | Artículo del escandallo (tabla `articulos`) |
| `cantidad` | Consumo: unidades, o metros por metro de ancho si es lineal |
| `precio` | Coste del artículo. Se copia de `articulos.precio_coste1` |
| `mmeca` | Margen de la línea. Se copia de `margen3` de la cabecera |
| `precio2` | **Columna calculada: `precio × mmeca`**. Es el precio que usan todos los componentes |
| `unidad` | 1, 4, 5 = por unidad; 3 = por metro lineal (copiada de `articulos.unidad1`) |
| `desde`, `hasta` | Tramo de anchos (cm) en el que se aplica una línea lineal |
| `k` | Cantidad fija adicional (metros extra en lineales; importe fijo en monetarios) |
| `dto` | Descuento en lineales |
| `syntaxis` | Parámetros de los artículos de `tipocalculo` 7 y 8 |

Atributos del artículo que cambian cómo se cuenta (`articulos`):

- `vertical` = 1: artículo que se cobra por alto (componente Verticales).
- `tipocalculo` = 7: cantidad por ancho. `tipocalculo` = 8: portatela y pletina.
- Embalaje: artículos 6912 y 6913 (identificados por id, fijos en el código).

**Tiempos (`SOL_TARIFAS_SIMULATE_TIMES`)**

Tramos de ancho con los minutos de mano de obra. Si la tarifa no tiene ninguno, `sp_tarifas_simulate`
crea estos: 40–200 → 20, 201–300 → 25, 301–400 → 35, 401–600 → 60. Existe una tabla maestra
(`SOL_TARIFAS_SIMULATE_TIMES_MASTER`) que la pantalla aplica a todas las tarifas desbloqueadas con el
botón "Act. Mano de Obra".

### 3.2 La rejilla y las variables de cada celda

- **Columnas (anchos):** `c02` = 40 cm, y cada columna suma 20 cm: `ancho(cN) = 40 + 20·(N − 2)`.
  `c30` = 600 cm (6,00 m). En línea blanca llega a `c60` = 1.200 cm.
- **Filas (altos):** dependen del producto (apartado 4).
- **(13.10)** El SP del mapa declara la rejilla de cada producto en un solo sitio, al principio
  (`@altoini`, `@altopaso`, `@suplemento`, `@pymax` y `@colmax`, la última columna). Alto de la fila =
  `@altoini + @altopaso·fila`; `c01` = alto + `@suplemento`. Las columnas por encima de `@colmax` se
  guardan a NULL. Los productos 1 a 5 conservan exactamente sus valores de antes.
- En cada fila el SP guarda dos valores:
  - `c00` = **alto** de la fila (m). Es el que reciben la función de tejido y el componente Verticales.
  - `c01` = **alto con suplemento** (m). Es el que reciben el desmultiplicador y las funciones de
    `tipocalculo` 7 y 8 (que en realidad no lo usan).

### 3.3 Fórmula de una celda (mapa completo, bloque 10)

Para un ancho X (cm) y una fila de alto Y (m) con alto suplementado Ys:

```
Precio(X, Y) = margen2 · [ Tejido(X, Y)
                         + Unitarios
                         + Lineales(X)
                         + Montaje(X)
                         + margen1 · Desmultiplicador(X, Ys)
                         + Verticales · Y ]
             + Embalaje(X)
             + CantidadPorAncho(X)
             + Monetarios
             + Pletina(X)
```

- Los cuatro últimos componentes quedan **fuera del margen del cliente**.
- Verificado: la fórmula reproduce al céntimo el mapa guardado de 9 celdas de los productos 1, 2, 3 y
  5 (apartado 5).

### 3.4 Componentes comunes

En todos ellos, `precio2 = precio × mmeca`, es decir, el coste del artículo ya lleva el margen de la
línea (normalmente `margen3` = 2,22).

**Unitarios** (no dependen de la medida)

```
Unitarios = Σ cantidad · precio2
  de las líneas con unidad 1, 4 o 5, artículo no vertical y tipocalculo < 7
```

Es el mismo importe en todas las celdas. En línea blanca la definición cambia (apartado 4.4).

**Lineales** (`fn_Tarifa_Lineales(tarifa, X)`)

```
Lineales(X) = Σ [ cantidad · X/100 + k ] · precio2  −  dto
  de las líneas con unidad 3, desde ≤ X ≤ hasta, artículo no vertical y tipocalculo < 7
```

- Son los artículos que se cortan a la medida del ancho: tubo, perfil, contrapeso, cordón…
- `cantidad` son metros de artículo por metro de ancho. `k` añade metros fijos.
- `desde`/`hasta` permiten usar un artículo distinto según el tramo de ancho (por ejemplo, un tubo
  más grueso a partir de cierto ancho).
- El `dto` se resta una sola vez y se toma de una de las líneas del tramo, no se suma.

**Montaje** (`fn_precio_tarifa_montaje(tarifa, X, preciomontaje, margen)`)

```
Montaje(X) = tiempo(tramo de X) · preciomontaje · margen
  margen = margen1, salvo en vertical, que es 1,45 fijo
```

Si ningún tramo de tiempos contiene X, el montaje vale 0.

**Desmultiplicador o recargo por peso** (`fn_solarmanes_peso_tejido_valor`)

```
si desmultiplicador = 1 y densidad · (X/100) · Ys > desmultiplicador_trigger:
    Desmultiplicador = desmultiplicador_value          (por defecto 1,12)
si no:
    Desmultiplicador = 0
```

Es un recargo fijo cuando la cortina pesa más de un umbral. En la fórmula se multiplica por `margen1`
y por `margen2`. El mapa "Peso" (bloque 6) muestra `densidad · ancho · Ys`, es decir, el peso.

**Verticales**

```
Verticales · Y = (Σ cantidad · precio2 de los artículos con vertical = 1) · Y
```

Artículos que se consumen por metro de alto (por ejemplo, la cadena). Se multiplica por el alto de la
fila sin suplemento.

**Embalaje** (`temp_fn_precio_tarifa_embalaje(tarifa, X, 1)`)

```
si la tarifa tiene el artículo 6912:  alto_caja = 0,755
si tiene el 6913:                     alto_caja = 0,615
si no tiene ninguno:                  Embalaje = 0
Embalaje(X) = precio · (X/100 + 0,30) · alto_caja
```

Usa `precio` (coste), no `precio2`, y no lleva margen: es caja = (ancho + 30 cm) × alto de caja.

**Cantidad por ancho** (`fn_solarmanes_precio_articulos_tipo_7`)

Para cada línea con artículo de `tipocalculo` = 7 y unidad 1, 4 o 5, con `syntaxis` = `cant;anchoRef;min`:

```
uds = max( cant · redondeo(X / anchoRef) , min )      (redondeo al entero más cercano)
CantidadPorAncho(X) = Σ uds · precio2
```

Ejemplo: un soporte cada 50 cm, mínimo 2: `1;50;2`.

**Portatela y pletina** (`fn_solarmanes_precio_articulos_tipo_8`)

Para cada línea con artículo de `tipocalculo` = 8, con `syntaxis` = `vías;min`:

```
valor = (redondeo(X / vías) + min) · vías      (redondeo al entero más cercano)
Pletina(X) = Σ valor · precio2 / (cantidad · 100)       (0 si cantidad = 0)
```

**Monetarios**

```
Monetarios = Σ k · precio2   de todas las líneas
```

Importe fijo por tarifa. Ojo: suma el `k` de todas las líneas, también de las lineales (hallazgo 2).

### 3.5 Bloques del SP (mapas parciales)

La pantalla de detalle permite ver cada componente por separado. Todos los productos usan los mismos
bloques:

| Bloque | Mapa | Contenido |
|--------|------|-----------|
| 1  | Tejido | Función de tejido del producto, `@type` 1 (con merma). HoneyComb: `fn_solarmanes_precio_tejido_honeycomb` |
| 12 | Tejido sin merma | `@type` 2. Solo en enrollable y línea blanca |
| 13 | Merma | `@type` 3. Solo en enrollable y línea blanca |
| 2  | Artículos ML | Lineales(X) |
| 3  | Artículos UD | Unitarios |
| 4  | Mano de obra | Montaje(X) |
| 5  | Mecanismo | Lineales + Unitarios + Montaje (sin margen2) |
| 6  | Peso | densidad · ancho · Ys |
| 7  | Desmultiplicador | margen1 · Desmultiplicador |
| 8  | Verticales | Verticales · Y |
| 9  | Cantidad por ancho | `tipocalculo` 7 |
| 20 | Pletina | `tipocalculo` 8 |
| 14 | Monetarios | Monetarios |
| 15 | Embalaje | Embalaje(X) |
| 10 | Completo | Fórmula del apartado 3.3 |

En el bloque 5 (Mecanismo) del SP general el montaje se calcula con la tarifa **1** en lugar de la
tarifa actual (`fn_precio_tarifa_montaje(1, …)`); el de línea blanca usa la actual.

### 3.6 Destino del resultado (`@dest`)

| dest | Tabla | Quién lo usa |
|------|-------|--------------|
| 0 | `SOL_TARIFAS_SIMULATE_TABLE` | Pantalla de detalle |
| 1 | `SOL_TARIFAS_SIMULATE_TABLE_EXPORT` | Exportar mapas (filtra filas por el **alto** de `SOL_TARIFAS_EXPORTACION`: `minx` y `maxx` no los usa ningún producto) |
| 2 | `SOL_TARIFAS_SIMULATE_TABLE_EXPORT_C1` | Exportación C1 |
| 3 | `SOL_TARIFAS_SIMULATE_CLIENTE_TABLE` | Mapas de cliente |
| 4 | `SOL_TARIFAS_SIMULATE_TABLE_SYNC` | Exportar tarifas SP (columnas hasta `c30`, 6 m) |

### 3.7 La merma: cómo se lee la tabla de criterios (enrollable)

Se explica aquí porque es la parte menos obvia y la base de tres productos (enrollable, panel y línea
blanca). La interpretación de los números es nuestra; el SP no la documenta.

El tejido se compra en rollos de ancho fijo. El **criterio** es ese ancho en cm. Al cortar una cortina
a veces se gasta más tela de la que mide:

- **m²**: tela que mide la cortina.
- **m2crit**: tela que realmente se consume del rollo.
- **Merma** = m2crit − m².

`fn_solarmanes_precio_tejido(X, Y, criterio, margen1, preciom2, type)`:

1. Ancho y alto se redondean hacia arriba a múltiplos de 20 cm (en el mapa ya lo son).
2. Al alto se le suman 0,25 m (enrolle): `anchoC × altoC = m²`.
3. Se calcula `m2crit` según el criterio:

| Criterio | Hasta este ancho: m² reales | Si no: rollo completo hasta | Por encima: tela girada, ancho × (según el alto) |
|----------|-----------------------------|-----------------------------|----------------------------------------------|
| 180 | < 1,40 | 1,80 × alto | alto < 2,05 → 1,85; < 3,65 → 3,45; < 5,25 → 5,05; resto → 6,25 |
| 200 | < 1,60 | 2,00 × alto | alto ≤ 2,05 → 2,05; < 4,05 → 3,85; < 5,85 → 5,65; resto → 6,25 |
| 250 | < 1,80 | 2,60 × alto | alto < 2,85 → 2,65; ≤ 5,05 → 5,05; resto → 6,25 |
| 300 | < 2,40 | 3,00 × alto | alto < 3,25 → 3,05; resto → 6,25 |
| 320 | < 2,60 | 3,20 × alto | alto < 3,45 → 3,25; resto → 6,25 |

- **Criterio**: ancho del rollo.
- **Hasta este ancho: m² reales**: si la cortina es más estrecha, el sobrante del rollo se considera
  aprovechable y solo se cobra su tela. No hay merma.
- **Si no: rollo completo hasta**: entre ese ancho y el ancho del rollo, el sobrante es demasiado
  estrecho para aprovecharlo y se cobra el rollo entero.
- **Por encima: tela girada**: la cortina es más ancha que el rollo, así que se corta la tela girada. El
  ancho de la cortina pasa a ser el largo que se consume, y el alto se cubre con bandas fijas. La
  primera banda es el rollo + 0,05 y cada banda siguiente suma el rollo − 0,20 (en 180: 1,85 → 3,45 →
  5,05), con un tope de 6,25. Los umbrales de alto ya incluyen los 0,25 de enrolle.
- En el criterio 250 el rollo completo es 2,60, no 2,50. Puede que el rollo real mida 2,60 o que sea un
  error.

Precio según `type`:

- 1 (total): `preciom2 · (m² · margen1 + (m2crit − m²))`. **La merma se cobra a coste, sin margen.**
- 2 (sin merma): `preciom2 · m² · margen1`.
- 3 (solo merma): `preciom2 · (m2crit − m²)`.

Ejemplos con criterio 180, `preciom2` = 5 y margen1 = 2,22 (verificados contra la función en DEV):

| Medida | anchoC × altoC | m² | m2crit | Merma | Precio |
|--------|----------------|----|--------|-------|--------|
| 100 × 140 | 1,00 × 1,65 | 1,65 | 1,65 (m² reales) | 0 | 5·(1,65·2,22) = 18,32 |
| 160 × 140 | 1,60 × 1,65 | 2,64 | 1,80 × 1,65 = 2,97 (rollo completo) | 0,33 | 5·(2,64·2,22 + 0,33) = 30,95 |
| 200 × 140 | 2,00 × 1,65 | 3,30 | 2,00 × 1,85 = 3,70 (girada, 1 banda) | 0,40 | 5·(3,30·2,22 + 0,40) = 38,63 |
| 200 × 250 | 2,00 × 2,85 (2,50 sube a 2,60) | 5,70 | 2,00 × 3,45 = 6,90 (girada, 2 bandas) | 1,20 | 5·(5,70·2,22 + 1,20) = 69,27 |

---

## 4. Ficha de cada producto

Resumen:

La columna 7 (HoneyComb) se añadió el 13.10; las demás son el estado del 08.10, salvo donde se indica.

| | 1 Enrollable | 2 Panel | 3 Vertical | 4 Línea blanca | 5 Noche y día | 7 HoneyComb (13.10) |
|---|---|---|---|---|---|---|
| SP del mapa | general | general | general | `_lineablanca` | general | general |
| Altos (filas) | 0,60–6,00, paso 0,20 (28) | 0,60–6,00, paso 0,20 (28) | 1,00–4,00, paso 0,10 (31) | 1 fila: 1,00 | 0,60–3,00, paso 0,20 (13) | 0,40–2,80, paso 0,20 (13) |
| Suplemento (`c01`) | +0,25 | +0,055 | +0,055 | +0 | +0,25 | **tabla** `ALTO_PLIEGUES` (tejido plegado) |
| Anchos (columnas) | 0,40–6,00 | 0,40–6,00 | 0,40–6,00 | 0,40–12,00 | 0,40–6,00 (guarda hasta 3,00) | 0,40–1,40 (`c02`–`c07`) |
| Función de tejido | `fn_solarmanes_precio_tejido` | la misma | `fn_solarmanes_precio_tejido_vertical` | la de enrollable | `fn_solarmanes_precio_tejido_nyd` | `fn_solarmanes_precio_tejido_honeycomb` |
| Unidad del precio del tejido | m² | m² | mL | mL (etiqueta) | m² | m² |
| Criterios en la interfaz | 140, 180, 200, 240, 250, 300, 320, 350 | (ninguno) | 0, 89, 127 | (ninguno) | 0, 250, 280, 300 | (ninguno, `criterio` = NULL) |
| Criterios en DEV | 0, 127, 140, 180, 200, 240, 250, 300, 320, 350 | 300 | 89, 127 | 0, 200, 320 | 0, 250, 280, 300 | — |
| Coste del tejido en el detalle | `coste` / `criterio` | `coste` / `criterio` (13.10; antes no se cargaba) | `coste3` / `criterio3` | `coste4` / `criterio4` | `coste` / `criterio` (13.10; antes no se cargaba) | `coste` (sin criterio) |
| Margen del montaje | margen1 | margen1 | **1,45 fijo** | margen1 | margen1 | margen1 |
| Unitarios | general | general | general | **incluye `tipocalculo` 7 y 8** | general | general |
| Bloques 12 y 13 (merma) | sí | no | no | sí | no | no (no hay merma) |

### 4.1 Enrollable (tipoproducto 1)

- **Rejilla:** altos 0,60 a 6,00 de 0,20 en 0,20 (28 filas); anchos 0,40 a 6,00 (29 columnas).
- **Suplemento:** `c01` = alto + 0,25 (enrolle).
- **Tejido:** `fn_solarmanes_precio_tejido` con merma por criterio (apartado 3.7).
- **Criterios con rama en la función:** 180, 200, 250, 300 y 320. **140, 240, 350 y 0 dan tejido 0**
  (hallazgo 1).
- **Resto:** todos los componentes comunes, con el montaje a `margen1`.

### 4.2 Panel japonés (tipoproducto 2)

- **Rejilla:** igual que enrollable.
- **Suplemento:** `c01` = alto + 0,055. Solo afecta al desmultiplicador.
- **Tejido en el mapa:** la misma función de enrollable, **incluido su +0,25 interno y la merma**. El
  +0,055 no llega a la función de tejido.
- **Tejido en el desglose de una celda** (`sp_simulate_table_details`): fórmula distinta, sin merma:
  `margen2 · (X/100) · (alto + 0,055) · preciom2 · margen1` (hallazgo 4).
- **Frontend:** no tiene lista de criterios propia. Hasta el 08.10 tampoco cargaba el coste del tejido
  al elegirlo; desde el 13.10 carga `coste` y `criterio`, como el enrollable.

### 4.3 Vertical (tipoproducto 3)

- **Rejilla:** altos 1,00 a 4,00 de 0,10 en 0,10 (31 filas); anchos 0,40 a 6,00.
- **Suplemento:** `c01` = alto + 0,055.
- **Tejido:** `fn_solarmanes_precio_tejido_vertical`. Se cobra por metro lineal de lama:

```
lamas = (X − 1,5 + 3) / 7,5      si criterio = 89  (lama de 89 mm)
lamas = (X − 1,5 + 3) / 11,5     si criterio = 127 (lama de 127 mm)
lamas se redondea al entero más cercano y, si es impar, se suma 1
mL = (Y·100 + 5,5) / 100 · lamas
Tejido = preciom2 · margen1 · mL
```

  Con criterio 0 (aparece en la interfaz) no hay rama: la función devuelve NULL (no tiene `isnull`) y la casilla entera del mapa queda sin precio.
- **Montaje:** margen **1,45 fijo**, en vez de `margen1`.
- **Precio del tejido:** por mL (`coste3`, `criterio3`).

### 4.4 Línea blanca (tipoproducto 4)

- **SP propio:** `sp_solarmanes_precio_tejido_tabla_tarifa_lineablanca`, con 63 columnas.
- **Rejilla:** **una sola fila**, alto 1,00; anchos 0,40 a 12,00 (`c02`–`c60`).
- **Suplemento:** `c01` = alto (sin suplemento).
- **Tejido:** la función de enrollable con alto 1,00 (internamente 1,25). En DEV las tarifas de línea
  blanca tienen `preciom2` = 0 o criterio 0, así que el tejido sale 0: el precio es el del mecanismo.
- **Unitarios:** a diferencia del SP general, incluye los artículos de `tipocalculo` 7 y 8, que además
  se cobran en su propia función (hallazgo 3).
- **Líneas:** `sp_tarifas_simulate` pone `hasta` = 1.200 en todas las líneas.
- **Montaje:** los tramos de tiempos por defecto acaban en 600 cm; por encima el montaje sale 0 si no
  se amplían los tramos.

### 4.5 Noche y día (tipoproducto 5)

- **Rejilla:** altos 0,60 a 3,00 de 0,20 en 0,20 (13 filas); anchos 0,40 a 6,00 calculados.
- **Guardado:** en `SOL_TARIFAS_SIMULATE_TABLE` solo se guardan las columnas `c02`–`c15` (anchos
  0,40 a 3,00).
- **Suplemento:** `c01` = alto + 0,25.
- **Tejido:** `fn_solarmanes_precio_tejido_nyd`. Igual que el enrollable (rejilla de 20 cm, alto
  + 0,25) pero con **doble tela**:

```
m² = anchoC · altoC · 2
m2crit = m²   salvo:
  criterio 250 y anchoC ≥ 1,80 → 2,6 · altoC · 2
  criterio 280 y anchoC ≥ 2,00 → 2,8 · altoC · 2
  criterio 300 y anchoC ≥ 2,20 → 3,0 · altoC · 2
Tejido = preciom2 · (m² · margen1 + (m2crit − m²))
```

  Con criterio 0 (aparece en la interfaz) no hay rama y el tejido sale 0. No hay tela girada.
- **Frontend:** hasta el 08.10 no cargaba el coste del tejido al elegirlo; desde el 13.10 carga `coste` y
  `criterio`, como el enrollable.

### 4.6 HoneyComb (tipoproducto 7, 13.10)

Es el producto nuevo. Sale de las decisiones del apartado 7 y está implantado en DEV (scripts 09 a 15 de
`sqlHoney/`). Se diferencia de los demás en lo que sigue; todo lo demás es el generador común.

- **Rejilla:** altos 0,40 a 2,80 de 0,20 en 0,20 (13 filas); anchos 0,40 a 1,40 (`c02`–`c07`). Las
  columnas `c08` en adelante se guardan a NULL y la pantalla las oculta.
- **Suplemento (`c01`):** no es un valor fijo. Se busca el alto (en cm) en la tabla
  `HONEYCOMB / ALTO_PLIEGUES` (`SOL_FABRICACION_TABLAS` y `_VALORES`, cargada por el script 07 de la
  fabricación) y el valor es el **tejido plegado** necesario, en cm. La regla es la del motor de
  fabricación: se toma la menor altura de la tabla que sea ≥ al alto pedido
  (`fn_fabricacion_tabla_valor`). Ejemplos: 40 cm → 56; 100 cm → 140; 280 cm → 392. La tabla va de 30 a
  280 cm, de 1 en 1, y equivale a alto × 1,4 con redondeos.
- **Tejido:** `fn_solarmanes_precio_tejido_honeycomb`. **Sin merma ni criterio**: se cobra el tejido
  plegado exacto de la tabla.

```
m² = ancho · tejido plegado          (ambos en m; el ancho no se redondea)
Tejido = preciom2 · m² · margen1
```

  Si el alto no está en la tabla, la función devuelve NULL y la casilla queda **sin precio** (no sale
  con el tejido gratis, que es lo que pasa en los criterios sin rama del hallazgo 1).
- **Por qué no hay merma:** de un tubo entero se aprovecha todo el tejido (decisión de producción).
- **Coste del tejido:** `preciom2` sale del campo `coste` de `SOL_ARTICULOS_TEJIDOS` (€/m², sin criterio).
  Los tejidos HoneyComb son los idrow 252–256 (OPACO BEIGE, BLANCO, GRIS CLARO, GRIS OSCURO y NEGRO,
  16 mm), con `coste` = 9,35, y están asignados al producto 7 para los clientes 1, 2, 4 y 5.
- **Margen del montaje:** `margen1`, como la mayoría.
- **Artículos de `tipocalculo` 7 y 8:** HoneyComb no los usa. Aun así esas funciones ignoran el alto, así
  que el valor de `c01` no les afecta.
- **Peso (desmultiplicador):** recibe `c01`, es decir, el tejido plegado, que es el tejido que se pesa.
- **Exportación:** tipo 8 de `SOL_TARIFAS_EXPORTACION` (HONEYCOMB, ancho 0,40–1,40, alto 0,40–2,80). Su
  `select` final devuelve `c00`–`c07`.
- **Frontend:** producto HONEYCOMB en la lista, criterio vacío, etiqueta "Precio m2", coste desde
  `coste`, alto de la casilla = 0,40 + 0,20·fila y columnas desde 1,60 ocultas.

Ejemplo verificado (tarifa de prueba copiada de la 5144, con el tejido 252 a 9,35 €/m², `margen1` 2,22 y
`margen2` 1). Casilla ancho 1,00 × alto 1,40, `c01` = 1,96:

| Componente | Importe (€) |
|------------|-------------|
| Tejido (1,00 · 1,96 · 9,35 · 2,22) | 40,68 |
| Unitarios | 5,64 |
| Lineales | 11,77 |
| Montaje | 9,32 |
| Embalaje | 0,87 |
| Resto (verticales, peso, T7, monetarios, pletina) | 0,00 |
| **Total** | **68,28** |

El mapa, el desglose y un recálculo independiente con las funciones coinciden al céntimo en las 4 casillas
comprobadas (0,40 × 0,40 = 24,79; 1,00 × 0,40 = 39,22 en la fila 0,40; 1,00 × 1,40 = 68,28; 1,40 × 2,80 =
146,49). La tarifa de prueba se borró después.

---

## 5. Ejemplos verificados (una celda por producto)

Celda de **ancho 200 cm**; alto 1,40 (línea blanca: 1,00). Importes en €. Columnas: Tejido, Unitarios,
Lineales, Montaje, Desmultiplicador (ya con `margen1`), Verticales, Embalaje, Cantidad por ancho (T7),
Monetarios, Pletina (T8).

| Tarifa | Producto | Crit. | preciom2 | margen1 | margen2 | Tejido | Unit. | Lin. | Mont. | Desm. | Vert. | Emb. | T7 | Monet. | T8 | Total | Mapa guardado |
|--------|----------|-------|----------|---------|---------|--------|-------|------|-------|-------|-------|------|----|--------|----|-------|---------------|
| 5144 | 1 Enrollable   | 250 | 4,85 | 2,22 | 1 | 40,33  | 5,64  | 23,53 | 9,32  | 0 | 0 | 1,54 | 0     | 0    | 0 | 80,37  | 80,37  |
| 5075 | 2 Panel        | 300 | 2,85 | 2,22 | 1 | 20,88  | 0,58  | 5,59  | 9,32  | 0 | 0 | 1,54 | 0     | 0    | 0 | 37,91  | 37,91  |
| 5068 | 3 Vertical     | 127 | 0,40 | 2,22 | 1 | 23,26  | 9,50  | 17,12 | 6,09  | 0 | 0 | 1,54 | 13,90 | 0,20 | 0 | 71,61  | 71,61  |
| 4948 | 5 Noche y día  | 280 | 8,00 | 2,22 | 1 | 138,34 | 10,79 | 34,32 | 18,65 | 0 | 0 | 1,54 | 1,60  | 0    | 0 | 205,23 | 205,23 |
| 4839 | 4 Línea blanca | 0   | 0    | 2,22 | 1 | 0      | 6,57  | 10,92 | 18,65 | 0 | 0 | 1,54 | 71,75 | 0    | 0 | 109,43 | 106,79 |

- Las sumas pueden diferir en un céntimo por el redondeo de cada componente.
- Verificadas además 4 celdas más (tarifas 5145, 5068 con alto 1,50, 5127 y 4046): todas cuadran.
- En la tarifa 5144 el desmultiplicador está activo pero no salta: 0,33 · 2,00 · 1,65 = 1,09 < 1,90.
- **Línea blanca no cuadra** con el mapa guardado: la diferencia (2,64) es exactamente la de los
  unitarios que incluyen `tipocalculo` 7 y 8 (6,57 frente a 3,93). Además el mapa guardado tiene filas
  0,60 / 0,80 / 1,00 con +0,25, que no es lo que genera el SP actual. El mapa se generó con una versión
  anterior del SP (hallazgo 3).

---

## 6. Hallazgos

1. **Los criterios sin rama dejan el tejido a 0 €.** La interfaz ofrece 140, 240 y 350 en enrollables y
   0 en vertical y noche y día, pero las funciones no tienen rama para ellos: `m2crit` queda NULL y el
   precio del tejido sale 0. Verificado: con 240 o 350 el tejido de 100×140 sale 0,00, y con 180, 18,32.
   En DEV hay 379 tarifas de enrollable (criterios 0, 127, 140, 240, 350 o vacío) y 4 de noche y día (criterio 0), todas bloqueadas. En vertical, con criterio 0 la función devuelve NULL y la casilla entera del mapa queda sin precio (hoy no hay tarifas verticales con criterio 0).
2. **`k` se cuenta dos veces en las líneas lineales.** Lineales suma `(cantidad·X/100 + k)·precio2` y
   Monetarios vuelve a sumar `k·precio2` de todas las líneas. Hay 196 tarifas en DEV con `k` en líneas
   lineales (todas bloqueadas); el importe es pequeño (≈ 0,2 € por línea, p. ej. tarifa 5068).
3. **Línea blanca cobra dos veces los artículos de `tipocalculo` 7 y 8.** Su SP los incluye en
   Unitarios y además los cobra en Cantidad por ancho y Pletina. En la tarifa 4839 son 2,64 € por celda.
   Los mapas guardados son de una versión anterior y no lo reflejan: si se regeneran, subirán.
4. **El desglose de una celda no coincide con el mapa** en varios productos
   (`sp_simulate_table_details`):
   - Panel: usa otra fórmula de tejido (m² con +0,055, sin merma ni +0,25).
   - Noche y día: usa la función de enrollable (una sola tela) en vez de `_nyd`.
   - Vertical, línea blanca y noche y día: no calcula `c01`, así que el desmultiplicador sale 0.
   - Línea blanca: usa la rejilla de enrollable (altos de 0,60 en adelante) y los unitarios generales.
   - El frontend calcula el alto del panel como 0,655 + 0,2·fila.
   El desglose solo es informativo; el mapa y la exportación no se ven afectados.

   **Corregido el 13.10 (script 14) salvo línea blanca.** El desglose usa ahora el mismo `c01` que el mapa
   (+0,25 en 1 y 5, +0,055 en 2 y 3, tabla en 7), el tejido de panel con `fn_solarmanes_precio_tejido` y el de
   noche y día con `_nyd`, los monetarios sin el filtro `k > 0` y suma la pletina al total. Antes descuadraba
   hasta 2,47 € en panel y 161,62 € en noche y día; ahora coincide con el mapa con un céntimo como máximo
   por redondeo. El frontend sigue calculando el alto del panel como 0,655 + 0,2·fila. Línea blanca no se
   toca: su descuadre viene del hallazgo 3.
5. **Noche y día solo guarda hasta 3,00 m de ancho** en `SOL_TARIFAS_SIMULATE_TABLE`, aunque calcula
   hasta 6,00.
6. **Añadir un artículo reescribe todas las líneas de la tarifa.** `sp_tarifas_simulate_articles` pone
   `precio` = coste actual del artículo y `mmeca` = `margen3` en **todas** las líneas, no solo en la
   nueva. Se pierden los precios o márgenes editados a mano en las demás líneas (en DEV hay 603 líneas
   con `mmeca` distinto de `margen3`).
7. **`margen4` (MAcc) no interviene en ningún cálculo.**
8. **El bloque 5 (Mecanismo) del SP general usa los tiempos de la tarifa 1** en lugar de los de la
   tarifa actual.
9. **La rejilla está fija en el código:** inicio en 0,40 y paso de 0,20 en el SP del mapa, en el
   desglose y en el frontend.

   **Corregido en parte el 13.10 (script 13).** En el SP del mapa la rejilla de cada producto se declara
   ahora en un solo sitio (apartado 3.2), lo que permitió añadir HoneyComb con otros altos y otras
   columnas. Se comprobó que no cambia nada en los demás: 17 tarifas de los tipos 1 a 5, en los 15
   bloques, dan exactamente el mismo mapa antes y después. El desglose y el frontend siguen teniendo las
   coordenadas escritas en el código, ahora con una rama más para el tipo 7.
10. **(13.10) La exportación solo filtra por alto.** `SOL_TARIFAS_EXPORTACION` tiene `minx` y `maxx`, pero
    ningún producto los usa: solo se aplica `miny`/`maxy`. El ancho lo limita la rejilla de cada producto.
11. **(13.10) La exportación tiene un `select` final distinto por tipo.** Un tipo de exportación nuevo
    que no tenga el suyo calcula las filas pero no devuelve nada a la pantalla. Se detectó al probar
    HoneyComb (tipo 8) y se añadió su `select` en el script 15.
12. **(13.10) Ocultar columnas una a una bloquea la pantalla.** Con jqxGrid, `hidecolumn` repinta la tabla
    en cada llamada: en el mapa de 61 columnas la página quedó 20–30 segundos sin responder. Hay que
    agrupar los cambios entre `beginupdate` y `endupdate` y tocar solo las columnas que cambian. En
    línea blanca, además, `ShowHide` actúa sobre la tabla de líneas del escandallo y no sobre el mapa,
    así que el mapa de línea blanca muestra todas las columnas.

---

## 7. HoneyComb: decisiones y estado de la implantación

El estudio previo (08.10) dejó 11 puntos por decidir para añadir HoneyComb al generador. Se cerraron el
13.10 y el producto está implantado en la BD local `SOLARMANES_DEV`.

### 7.1 Qué hereda HoneyComb sin tocar

- La fórmula de la celda (apartado 3.3) y todos los componentes comunes: Unitarios, Lineales, Montaje,
  Desmultiplicador, Verticales, Embalaje, Cantidad por ancho, Pletina y Monetarios.
- Las líneas del escandallo, los márgenes, los tiempos de montaje, los bloques y los destinos.
- Pantallas de búsqueda, clonado, bloqueo y edición.

### 7.2 Las 11 decisiones

| # | Decisión | Resultado |
|---|----------|-----------|
| 1 | Número de `tipoproducto` | **7**, como en el configurador. El 6 queda libre (en el configurador es el cajón ZIP) |
| 2 | Rejilla de altos | **0,40 a 2,80, paso 0,20** (13 filas) |
| 3 | Rejilla de anchos | **0,40 a 1,40, paso 0,20** (6 columnas, `c02`–`c07`). Empieza en 0,40, como el resto del generador, así que no hizo falta tocar el inicio de la rejilla |
| 4 | Suplemento de alto (`c01`) | **Tabla `HONEYCOMB / ALTO_PLIEGUES`**: devuelve el tejido plegado, que se cobra tal cual, sin merma ni suplemento adicional |
| 5 | Función de tejido | `ancho · tejido plegado · preciom2 · margen1`, **sin merma** (de un tubo entero se aprovecha todo) |
| 6 | Unidad de `preciom2` | **m²** |
| 7 | Criterios | **No aplica** (`criterio` = NULL, desplegable vacío) |
| 8 | Margen del montaje | **`margen1`** |
| 9 | Coste del tejido en el detalle | **Campo `coste`** de `SOL_ARTICULOS_TEJIDOS`. Los campos `coste3` y `coste4` pertenecen a vertical y al producto 4; `coste` es €/m² como HoneyComb, y los tejidos HoneyComb no se comparten con otros productos |
| 10 | Exportación | **Fila 8** de `SOL_TARIFAS_EXPORTACION`: ancho 0,40–1,40, alto 0,40–2,80 |
| 11 | Hallazgos | Se corrigen **el 4 y el 9** dentro del trabajo; el resto queda aparte para no cambiar los precios de las tarifas que ya existen |

Además se decidió que HoneyComb **no lleva artículos de `tipocalculo` 7 y 8**.

### 7.3 Datos de partida (script 09)

- Producto 7 `HONEYCOMB` dado de alta en `SOL_ARTICULOS_PRODUCTOS`. Lo exige una clave ajena de
  `SOL_ARTICULOS_TEJIDOS_CLIENTES_PRODUCTOS`. Efecto lateral: `AT_Configuracion_Cliente_Nuevo_Inicio` crea
  desde ahora también filas de accionamientos del producto 7 en los clientes nuevos.
- `COSTE` = 9,35 en los tejidos 252–256 (estaban a 0,00).
- Los 5 tejidos asignados al producto 7 para los clientes 1, 2, 4 y 5 (20 filas, `IMPRESION` 0,
  `DIASFABRICACION` 5). Las columnas `opacidad`, `Ntejido` y `codigoprov` de esa tabla son calculadas: salen
  con opacidad "OPACO POLIESTER" y sin nombre ni código de proveedor, porque los tejidos HoneyComb no los
  tienen por cliente. El generador no los necesita.

### 7.4 Cambios hechos (todos en DEV; TEST y PROD sin aplicar)

| Script | Objeto | Cambio |
|--------|--------|--------|
| `09` | Datos de tejidos | Producto 7, coste y asignación (7.3) |
| `10` | `SOL_TARIFAS_EXPORTACION` | Fila 8 HONEYCOMB (`idrow` es IDENTITY: se inserta con id explícito) |
| `11` | `fn_fabricacion_tabla_valor` | Función nueva: menor clave ≥ entrada. Es la misma regla que ya aplicaba el motor de fabricación, que la llevaba escrita dentro de un SP |
| `12` | `fn_solarmanes_precio_tejido_honeycomb` | Función nueva: el tejido (apartado 4.6) |
| `13` | `sp_solarmanes_precio_tejido_tabla_tarifa` | Tipo 7 en los bloques 1 y 10 y rejilla por producto declarada en un solo sitio |
| `14` | `sp_simulate_table_details` | Tipo 7 y desglose alineado con el mapa (hallazgo 4) |
| `15` | `sp_solarmanes_tabla_tarifa_export_v2` | Tipo 8: cabecera de anchos hasta 1,40 y `select` final propio |
| — | `tarifas-simulate.component.ts` | Producto 7, criterio vacío, `coste`, alto de la casilla, columnas ocultas (apartado 4.6) |

Antes de tocar los tres SPs se guardó su versión anterior en `sqlHoney/backup/`
(`*_antes_honeycomb_tarifas_20261013.sql`). Cada cambio está anotado en `REGISTRO_CAMBIOS.md`.

### 7.5 Cómo se comprobó

- **Regresión de los productos que ya existían:** 17 tarifas de los tipos 1 a 5, en los 15 bloques,
  calculadas hacia una tabla de pruebas (destino 3, ids negativos) antes y después del cambio. Los 255
  mapas salen idénticos, sin ninguna celda distinta. Se compararon en los dos sentidos y se borraron.
- **Exportación:** la salida de los tipos existentes es idéntica a la de antes.
- **Desglose:** diferencia con el mapa de como mucho 0,01 € en 27 casillas de 9 tarifas.
- **HoneyComb:** tarifa de prueba copiada de la 5144 con el tejido 252 y recalculada a mano con las
  funciones: mapa, desglose y recálculo coinciden al céntimo.
- **En pantalla (local contra DEV):** alta, guardado, mapa, desglose, clonado, desplegable de exportación
  y exportación por el endpoint. Las tarifas de prueba se borraron.

### 7.6 Pendiente y por probar

- **No probado en pantalla:** "Agregar artículos" con HoneyComb, generación múltiple, edición múltiple,
  bloqueo y el botón "Exportar" completo (el Excel). Ninguna depende del tipo de producto, salvo que la
  generación múltiple use el tipo en sus plantillas.
- **No hay tarifas HoneyComb reales:** hay que crearlas (una por tejido).
- **Los clientes no consumen estas tarifas todavía.** El configurador HoneyComb sigue cobrando con
  `SOL_ARTICULOS_TARIFA_HONEYCOMB` (matriz 15×15 ya calculada, sin coste de tejido). Esa unificación es la
  fase siguiente (ver `HoneyComb.md` y el registro de cambios).
- **TEST y PROD:** los scripts 09 a 15 y el frontend no están aplicados. Hay que añadirlos al orden de
  despliegue y a la checklist de PRODUCCIÓN de `REGISTRO_CAMBIOS.md`. Antes de PROD, la regresión del
  SP del mapa (7.5) hay que repetirla con las tarifas de PROD.
- **Hallazgos sin tocar:** 1, 2, 3, 5, 6, 7, 8 (y los nuevos 10, 11 y 12 salvo lo ya corregido). Los
  hallazgos 2 y 6 afectarían también a HoneyComb si lleva líneas con `k` o si se añaden artículos.

Ver también `HoneyComb.md` (unificación de tarifas) y `REGISTRO_CAMBIOS.md`.
