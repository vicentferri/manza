# Documentación Técnica: Corrección en `loadClientes()`

Este documento detalla el diagnóstico y la solución aplicada para la carga de clientes en los desplegables de la aplicación.

---

## 1. Diagnóstico del Problema en `loadClientes()`

* **Archivo afectado:** `frontend/src/app/routes/setup/master/master.component.ts`
* **Pantallas afectadas:** Todas las operaciones de mantenimiento que utilizan el selector de clientes (`operation: 302` - Tiendas de Clientes API, `operation: 201`, `216`, `217`, `218`, `219`, `222`, `229`).

### Causa:
1. El endpoint `GET /api/sm/clientesapi` devuelve una lista de objetos con las columnas de base de datos:
   * `idrow` (ID del cliente)
   * `descripcion` (Nombre fiscal del cliente)
   * Varios campos adicionales (`C1_Comercial`, etc.).
2. En las plantillas HTML (por ejemplo, en el modal de tiendas `master.component.html:2658`), el elemento `<select>` itera sobre `clientes` buscando:
   ```html
   <option *ngFor="let pow of clientes" [value]="pow.value">
     {{ pow.label }}
   </option>
   ```
3. La implementación original de `loadClientes()` hacía:
   ```typescript
   this.clientes = data.Table;
   this.clientes.push({ 'value': '-1', 'label': 'Seleccionar Cliente' });
   ```
   Al asignar `data.Table` directamente sin transformar los datos, los objetos no tenían las propiedades `value` ni `label` (eran `undefined`).
   Por consiguiente, el desplegable se renderizaba con opciones vacías (líneas en blanco) y solo aparecía visible la última opción: *"Seleccionar Cliente"*.

---

## 2. Solución Aplicada

Se actualizó la función `loadClientes()` en `frontend/src/app/routes/setup/master/master.component.ts` (líneas 638–654) para transformar los registros recibidos al formato `{ value, label }` que espera el selector de la interfaz:

```typescript
    loadClientes() {

        this.service.HTTP_Get('/sm/clientesapi').subscribe(
            data => {
                this.clientes = [];
                var values = data.Table || [];
                if (values.length > 0) {
                    values.forEach(element => {
                        this.clientes.push({ 'value': element.idrow, 'label': element.descripcion });
                    });
                }
                this.clientes.push({ 'value': '-1', 'label': 'Seleccionar Cliente' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }
```

---

## 3. Estado de Rutas y Resto del Código

* **Rutas de domicilios en el Frontend (`master.component.ts`):** Quedan tal cual en la versión original de Git:
  * Modificación: `route = "/domicilios"` (línea 2405)
  * Eliminación: `var route = '/domicilios_del'` (línea 2538)
  * Agregar domicilio: `let url = '/domicilios/'` (línea 5038)
* **Backend (`routes.js` y `sm_routes.js`):** Intactos en su versión original de Git.
* **Lógica interna de modales y operaciones:** Sin ninguna alteración adicional (sin reseteos ni validaciones extras).

---

## 4. Nota Adicional: Diagnóstico de `clientes_users` (Error 404 en Producción)

Para referencia técnica, el error `404 Not Found` en el endpoint `/api/sm/clientes_users` en el servidor de producción se debe a que el proceso Node.js en ejecución en el servidor `manzasm.com` aún no tiene cargadas en memoria las rutas añadidas en `sm_routes.js` (requiere subir los archivos del backend y reiniciar el proceso Node / PM2 en el servidor).
