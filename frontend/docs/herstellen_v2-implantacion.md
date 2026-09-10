# herstellen_v2 — Recepción de Pedidos (notas para informe de implantación)

> Documento de trabajo. Recoge todo lo modificado para redactar más tarde el
> informe de implantación. Fecha de los cambios: 2026-09-08.

## 1. Objetivo

Crear una versión 2 de la pantalla `/routes/herstellen` (Recepción de Pedidos,
antes servida por `PreBestellungV2Component` / `pre-bestellung-v2`):

- Eliminar el grid **jqxGrid** y pasar toda la tabla a HTML, manteniendo un
  funcionamiento equivalente (grupos de columnas, fila de filtros, orden,
  paginación, selección, exportación).
- Quitar la pestaña **Otros**.
- Renombrar la pestaña **Cortinadecor** → **Canal B2B**, con un desplegable de
  clientes del canal (por defecto siempre *Cortinadecor*), filtrando por la
  nueva columna `SQL_CORTINADECOR_HEADER.cliente_solarmanes`.

`pre-bestellung-v2` se conserva intacto como *fallback* (rutas `''` y
`prebestell2`).

## 2. Archivos nuevos

| Archivo | Líneas | Descripción |
|---|---|---|
| `src/app/shared/pedidos-grid/pedidos-grid.component.ts` | 260 | Componente de tabla HTML reutilizable `<app-pedidos-grid>` |
| `src/app/shared/pedidos-grid/pedidos-grid.component.html` | 143 | Plantilla del grid |
| `src/app/shared/pedidos-grid/pedidos-grid.component.css` | 148 | Estilos (cabecera *sticky*, badges, truncado de celdas) |
| `src/app/shared/pedidos-grid/pedidos-grid.component.spec.ts` | 25 | Test de creación |
| `src/app/routes/herstellen/pre-bestellung-v3/pre-bestellung-v3.component.ts` | 612 | Componente de pantalla `PreBestellungV3Component` |
| `src/app/routes/herstellen/pre-bestellung-v3/pre-bestellung-v3.component.html` | 542 | Plantilla (pestañas, barra de acciones, modales) |
| `src/app/routes/herstellen/pre-bestellung-v3/pre-bestellung-v3.component.css` | 60 | Estilos de la barra de acciones |
| `src/app/routes/herstellen/pre-bestellung-v3/pre-bestellung-v3.component.spec.ts` | 25 | Test de creación |

## 3. Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/app/routes/herstellen/herstellen.module.ts` | `import` + `declarations` de `PreBestellungV3Component`; nueva ruta `{ path: 'herstellen_v2', component: PreBestellungV3Component, data: { title: 'Recepción de Pedidos' } }` |
| `src/app/shared/shared.module.ts` | `declarations` + `exports` de `PedidosGridComponent` |
| `src/app/layouts/sidebar/sidebar.component.html` | El enlace del menú **Pedidos** apunta a `/routes/herstellen/herstellen_v2` (antes `prebestell2`) |

> Nota: `shared.module.ts` también contenía cambios previos, ajenos a esta
> tarea (registro de `ImpresionDigitalSelectorComponent`).

## 4. Componente `<app-pedidos-grid>` (sustituto de jqxGrid)

Configurable mediante un array `PedidosGridColumn[]`:

```ts
interface PedidosGridColumn {
  field: string;          // clave en el objeto de datos
  header: string;         // texto de cabecera
  group?: string;         // cabecera de grupo (Pedido / Dirección Entrega / Dirección Fiscal)
  width?: number;         // ancho en px (también recorta el contenido)
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'date' | 'datetime' | 'dias' | 'flag';
  format?: string;        // override de formato de fecha
}
```

Equivalencias con jqxGrid:

| jqxGrid | `<app-pedidos-grid>` |
|---|---|
| `columngroups` | doble fila de `<thead>` con `colspan` |
| `showfilterrow` | fila de `<input>` por columna → objeto `filters` |
| `sortable` | clic en cabecera: asc → desc → sin orden |
| `pageable`, `pagesizeoptions ["50","100","500"]`, `pagesize 500` | `PagerService` + selector de tamaño |
| `selectionmode: singlerow` | clic en fila → `selectionChange`, clase `.pg-selected` |
| `diasRenderer` (badge verde/amarillo/rojo) | `type: 'dias'` con `[ngStyle]` según valor |
| `cellclassname` FAB/ID (rojo=0 / verde>0) | `type: 'flag'` con `[ngClass]` |
| `cellsformat` fechas | `type: 'date' | 'datetime'` con `DatePipe` |
| celda larga (jqx no la recortaba) | `.pg-cell` con `max-width = col.width` + `text-overflow: ellipsis`; texto completo en `title` |
| `exportdata('xls', … /api/export_grid)` | `ExcelService.exportAsExcelFile(grid.processedRows, 'pedidos')` (xlsx en cliente, respeta filtros y orden) |

Detalles:

- La carga es no paginada en servidor (igual que v2): se trae todo el array y
  se pagina/filtra/ordena en cliente.
- La respuesta del backend llega como `{ "Table": [...] }`; `getScope()` lo
  soporta (`data.Table` o array directo).

## 5. Pantalla `PreBestellungV3Component`

### Pestañas

| Pestaña | `cliente` | Nota |
|---|---|---|
| Leroy Merlin | 1 | igual que v2 |
| **Canal B2B** | 2 | renombrada; + desplegable de cliente de canal |
| Solarmanes | 4 | igual que v2 |
| Leroy Merlin Online | 5 | igual que v2 |
| ~~Otros~~ | 99 | **eliminada** (borradas todas las ramas `cliente === 99`, `myGrid6`, `source6`, `settings6`) |

### Canal B2B — desplegable de cliente de canal

- `canalCliente` (por defecto `'cortinadecor'`; opción `'*'` = Todos).
- `rebuildCanalClientes()` se ejecuta en cada `getScope()` de la pestaña B2B y
  construye la lista: **Cortinadecor** (siempre) + un elemento por cada valor
  distinto de `cliente_solarmanes` presente en los resultados (texto en Title
  Case) + conserva el seleccionado aunque no tenga pedidos en el rango.
- `applyCanalFilter()` → `rowsB2BView`: filtra `rowsB2B` por `cliente_solarmanes`.
  Las filas con el campo vacío se muestran bajo el cliente por defecto
  (Cortinadecor).
- La columna **Cliente SM** (`cliente_solarmanes`) se añade a la tabla B2B.
- No hay endpoint de catálogo de clientes de canal: el desplegable solo lista
  clientes con pedidos en el rango/estado consultado.

### Forma real de los datos del endpoint `bestellungen_zustand_customer/:estado/:cliente`

- **cliente 1 / 4 / 5**: `idrow, dias, fecha(ISO), codigo, nomfiscal,
  observaciones, refcliente, referencia, dirfiscal, pobfiscal, provfiscal,
  cpfiscal, nombre, domicilio, cp, poblacion, provincia, estado, descestado,
  detalles, prod_ok, prod_reason, fabricacion, cliente, ID`
- **cliente 2**: `refcliente, idrow, filename, id, date(YYYY-MM-DD), name,
  lastname, business, nif, address, city, province, postcode, country, phone,
  estado, descestado, dias, detalles, prod_ok, prod_reason, referencia,
  fabricacion, IMD, cliente_solarmanes`
- **No existe `factura_codigo` en ninguna variante** → columna "Fra." eliminada
  de todas las tablas (en v2 salía siempre vacía).
- `estado` `0` = "Pdte. Aceptación" (no es "todos"); `-1` = todos los estados.

### Barra de acciones

Reorganizada en 4 grupos (`<fieldset>` + `<legend>`):

| Grupo | Botones |
|---|---|
| Documentos | Exportar · Imprimir · Ver Fichero Entrada |
| Fabricación | Fichero · Detalle · Reconstruir · Editar · Iniciar (verde) · Detener (ámbar) · Reprocesar *(solo cliente 5)* |
| Modificar pedido | Estado `[select]` + Cambiar · Cambiar Cliente · Cambiar Referencia |
| Eliminar | Borrar Pedido (rojo) |

Todos operan sobre `this.selectedRow` de la pestaña activa (antes
`getSelectedRows(myGridX)`). Se conservan las mismas llamadas de servicio que
v2. `Setzustand`, `Print`, `HojaFabricacion`, `VerHojaFabricacion`,
`ActualizarCliente`, `ActualizarReferenciaCliente`, `Herstellung`, etc. sin
cambios funcionales.

- El modal "Detalle Fabricación" pasa a `<app-pedidos-grid>` (`colsDetalle`).
- `Borrar Pedido`: `POST /api/bestellung_delete` con `{ ids: "<idrow>",
  cliente: <n> }`; tras la respuesta ejecuta `getScope()` (equivalente a pulsar
  **Consultar**).

### Código muerto de v2 eliminado

`VerDetalle` + modal `staticModal4`, botones ocultos de ERP
(`SetDocumentEXP`, `EnlazarFactura`, `ExportToERP`) + modal `staticModal9`,
`loadHeader` / `loadlines` / `loadlinesTipo`, objeto `document`.

## 6. Dependencias de backend

| Endpoint | Situación |
|---|---|
| `GET /api/bestellungen_zustand_customer/:estado/2` | ✅ Devuelve `cliente_solarmanes` en todas las variantes (hubo que corregirlo: al principio solo lo traía la consulta de `estado = -1`). Valores en minúsculas: `cortinadecor`, `ejemplo`, … |
| `POST /api/bestellung_delete` (`cliente: 2`) | ✅ Funciona tras corrección backend. (Durante las pruebas hubo un periodo en que respondía `{message:"OK"}` sin borrar y un 502 general del endpoint por el cambio de SQL.) |

Pendiente / a verificar en implantación:
- Confirmar que la consulta de cada estado concreto (no solo `-1`) sigue
  devolviendo `cliente_solarmanes` tras cualquier despliegue posterior.
- Valores canónicos de `cliente_solarmanes` y alta de nuevos clientes de canal.

## 7. Estado de pruebas

- `ng build --aot` → **compila sin errores ni warnings**.
- Verificado contra el endpoint real (clientes 1, 2 y 5): forma de datos,
  presencia de `cliente_solarmanes`, pedido de prueba `137335` (cliente
  `ejemplo`, `PRUEBA-0001`).
- Pendiente de prueba funcional completa en navegador por parte de usuario:
  filtros/orden/paginación, exportación XLSX, acciones de fabricación, borrado.

## 8. Despliegue

1. `ng build --prod` (presupuesto de bundle 10 MB warn / 20 MB error, sin
   cambios).
2. No hay migraciones de front. Sí depende de los cambios de backend del
   punto 6 (columna `cliente_solarmanes` en `SQL_CORTINADECOR_HEADER` y en las
   consultas por estado; `bestellung_delete` para `cliente = 2`).
3. Ruta pública: `#/routes/herstellen/herstellen_v2`. El menú lateral
   **Pedidos** ya apunta ahí; `prebestell2` sigue disponible como respaldo.
4. Rollback: revertir el enlace del sidebar a `prebestell2` (v2 queda operativo).
