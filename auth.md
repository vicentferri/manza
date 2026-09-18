# Plan: endpoints backend sin autenticación (riesgo de seguridad real)

> Documento de trabajo para que otro agente (sin contexto previo de esta conversación)
> pueda ejecutar el fix. Todas las citas de fichero:línea están verificadas contra el
> estado del repo en el momento de escribir esto (rama `main`). Antes de tocar nada,
> vuelve a comprobar que las líneas no se han movido.
>
> Este problema es independiente del descrito en `integracion.md` (ese es un bug de
> coherencia de UI; este es un agujero de seguridad real en el backend). Se pueden
> ejecutar en cualquier orden, pero **no dependen entre sí**.

## Contexto de la arquitectura (necesario para entender el alcance)

- `backend/server.js`:
  - Levanta un servidor **HTTPS** con certificado real (`backend/Certificado/manzasm.*`,
    líneas 18-21), pensado para producción pública (`https://www.manzasm.com`, confirmado por
    `frontend/src/environments/environment.ts`).
  - CORS completamente abierto: `app.use(cors({ origin: '*', ... }))` (línea 31-35) — cualquier
    origen puede llamar a la API.
  - Monta tres routers Express, cada uno con su propio prefijo (líneas 70-75):
    - `app.use('/api', master_routes)` → `backend/routes/routes.js` (130 rutas registradas).
    - `app.use('/api/sm', sm_routes)` → `backend/routes/sm_routes.js` (335 rutas registradas).
    - `app.use('/api/lm', lm_routes)` → `backend/routes/link_routes.js` (~50 rutas).
- Middleware de autenticación: `backend/middlewares/authenticated.js`, exporta `ensureAuth`.
  Lee `req.headers.authorization`, decodifica el JWT con `jwt-simple` usando un secreto
  hardcodeado (`'clave_secreta_del_curso_angular'`, línea 6 — también hardcodeado igual en
  `backend/services/jwt.js:8`, otro problema aparte que no es objeto de este documento), y si es
  válido y no ha caducado deja pasar (`next()`).
  - Este middleware **no se aplica globalmente**. Cada ruta tiene que añadirlo explícitamente
    como segundo argumento: `router.post('/algo', Auth.ensureAuth, Controller.algo)`.
  - Cobertura actual: `sm_routes.js` lo usa en 40 de sus 335 rutas (~12%). `routes.js` lo usa en
    **0 rutas activas** (hay un único ejemplo, comentado, en la línea 94:
    `//api.post('/customer_new',AuthController.ensureAuth,ClientesController.NeueKunde);` — indicio
    de que en algún momento se pensó usarlo ahí y no se llegó a activar). `link_routes.js` no lo
    importa ni lo usa en **ninguna** ruta.
  - Esto no es "por diseño" (p. ej. una API pública intencionada) — es aplicación ad-hoc e
    incompleta del middleware, ruta a ruta, sin ningún criterio visible de qué debería estar
    protegido.

## El problema concreto

### 1. Todo `link_routes.js` (`/api/lm/*`) es público, sin excepción

`backend/routes/link_routes.js` no importa `authenticated.js` ni usa `Auth.ensureAuth` en
ninguna de sus ~50 rutas. Ejemplos representativos (todas GET/POST directos, sin middleware):

```js
lmapi.get('/userinfo/:cli', LM.userInfo);                                    // línea 90
lmapi.get('/tejidos/:cli', LM.tejidos);                                      // línea 35
lmapi.post('/bestellungen_hinzu/:cli', Best.bestellungen_hinzu);             // línea 99
lmapi.post('/bestellungen_hinzu2/:cli/:ref', Best.bestellungen_hinzu2);      // línea 100
lmapi.get('/bestellungen', Best.bestellungen);                               // línea 102
lmapi.get('/budget', Budget.budget);                                         // línea 109
lmapi.post('/budget_hinzu/:cli', Budget.budget_hinzu);                       // línea 110
lmapi.post('/calculate_prices', BestellungenTarifas.calculate_prices);       // línea 128
```

Todos los `:cli`/`:cliente` se leen directamente de la URL sin validar contra ningún usuario
autenticado. En la práctica, cualquiera con acceso a internet (CORS `*`, HTTPS público) puede,
sin loguearse:
- Leer qué productos/tarifas/tejidos/pedidos tiene cualquier cliente (`:cli` es solo un ID
  numérico, fácil de iterar).
- **Crear pedidos y presupuestos** (`bestellungen_hinzu*`, `budget_hinzu*`) atribuidos a
  cualquier cliente.
- Leer `userinfo/:cli`, que expone qué productos (`prod_1..prod_7`) tiene habilitados un cliente.

### 2. Las mismas rutas de cajones/guías duplicadas en `sm_routes.js` también están sin proteger

`backend/routes/sm_routes.js`, líneas 473-486 (bloque que registra funciones del mismo
controlador `LM` que `link_routes.js`):
```js
smapi.get('/cajones:cli/:tipo', LM.cajones);          // línea 473
smapi.get('/guias/:cli/:tipo', LM.guias);             // línea 474
smapi.post('/cajones_del', LM.cajones_del);           // línea 476
smapi.post('/guias_del', LM.guias_del);               // línea 477
smapi.post('/put_guia', LM.put_guia);                 // línea 483
smapi.post('/put_cajon', LM.put_cajon);                // línea 484
```
Ninguna lleva `Auth.ensureAuth`. `put_cajon`/`put_guia`/`*_del` son escrituras/borrados.

### 3. Gestión de usuarios completamente abierta (el más grave)

- `POST /api/register` (`backend/routes/routes.js:138`) y
  `POST /api/sm/register` (`backend/routes/sm_routes.js:417`) → `register()` en
  `backend/controllers/common/users.js:10`. **Crea un usuario interno (`USERS`) y acepta
  `isAdmin` directamente del body** (línea 26: `params.isAdmin ? 1 : 0`). Sin `Auth.ensureAuth`,
  cualquiera puede hacer un `POST` con `{ "isAdmin": true, "username": "...", "password": "..." }`
  y crearse una cuenta de administrador interno, y luego loguearse normalmente con
  `POST /api/authenticate`.
- `POST /api/sm/client_register` (`backend/routes/sm_routes.js:427`) → `client_register()` en
  `backend/controllers/sm/clientes.js:519`. Igual de abierto, crea cuentas en `CLIENTES_USERS`.
- `GET /api/users` (`routes.js:137`) y `GET /api/sm/users` (`sm_routes.js:416`) → `users()` en
  `backend/controllers/common/users.js:46`. Lista **todos** los usuarios internos (nombre,
  email, rol, `isAdmin`, etc., aunque no la contraseña) sin autenticación.
- `POST /api/sm/users/:id/permisos` (`sm_routes.js:423`) → `savePermisos()`
  (`backend/controllers/common/users.js:219`). **Sobrescribe los permisos de cualquier usuario
  por `idrow`**, sin comprobar quién hace la petición ni que `idrow` corresponda al propio
  usuario o a un admin.
- `GET /api/sm/users/:id/permisos` (`sm_routes.js:422`) → `getPermisos()` (línea 209). Lee los
  permisos de cualquier usuario por id.

## Impacto

Con CORS abierto y el servidor expuesto en `https://www.manzasm.com`, esto no es un riesgo
teórico: cualquiera que conozca (o adivine) la URL puede, sin credenciales:
1. Crearse una cuenta de administrador interno (`/register` con `isAdmin: true`) y loguearse.
2. Leer/crear/borrar pedidos, presupuestos y tarifas de cualquier cliente vía `/api/lm/*`.
3. Reescribir los permisos de cualquier usuario existente.
4. Listar todos los usuarios internos del sistema.

## ⚠️ Aviso importante antes de aplicar el fix: dos bugs de frontend que romperán llamadas legítimas

Si simplemente se añade `Auth.ensureAuth` a todas las rutas de arriba sin más, **se rompen dos
flujos reales de la aplicación**, porque el frontend no siempre envía el token:

1. **`frontend/src/app/leroymerlin/config/lmsmapi.service.ts`**, métodos `altaPedido()`
   (líneas 172-176) y `altaPresupuesto()` (líneas 178-182) — construyen los headers a mano
   **sin** cabecera `Authorization`:
   ```ts
   altaPedido(body: any, referencia: string) {
       var url: string = this.urlAltaPedido2 + '/' + referencia;
       const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
       return this.http.post(url, body, { headers: headers }).pipe(map((response: any) => response));
   }
   ```
   Estos métodos llaman exactamente a `bestellungen_hinzu2`/`budget_hinzu2` (ver
   `urlAltaPedido2`/`urlAltaPresupuesto2`, líneas 48-50 del mismo fichero), que son dos de las
   rutas a proteger. **Hay que arreglar esto primero** (añadir el header `authorization` con
   `localStorage.getItem('registerToken')`, igual que ya hace `HTTP_Post` en el mismo fichero,
   líneas 285-294) o esos dos endpoints seguirán teniendo que quedar sin `Auth.ensureAuth` hasta
   que se arregle.

2. **`frontend/src/app/manza/config/smapi.service.ts`**, método `HTTP_Get()` (líneas 353-363) —
   construye un objeto `headers` con el token pero **nunca lo usa** en la llamada real:
   ```ts
   public HTTP_Get(route: string) {
       var url: string = route;
       let registerToken = localStorage.getItem('registerToken');
       if (registerToken != null) {
           var headers = new Headers();
           headers.set('authorization', registerToken)
       }
       return this.http.get(url).pipe(map((response: any) => response));   // <-- no usa `headers`
   }
   ```
   Este método se usa, entre otros, desde `frontend/src/app/manza/config/config.component.ts:337`
   para llamar a `/api/lm/prices_values/...`. Si se protege esa ruta sin arreglar este bug, la
   llamada dejará de funcionar (nunca ha mandado token realmente, así que hoy "funciona" solo
   porque el endpoint no lo exige).

**Recomendación de orden de ejecución:**
1. Arreglar los dos bugs de frontend de arriba (pasar los headers correctamente).
2. Probar manualmente que esos flujos (crear pedido, crear presupuesto, ver precios en manza)
   siguen funcionando y ahora sí envían la cabecera `Authorization` (comprobar en la pestaña
   Network del navegador).
3. Solo entonces añadir `Auth.ensureAuth` en el backend (paso siguiente).
4. Repetir la prueba manual de esos mismos flujos para confirmar que con el token todo sigue
   funcionando, y que sin token (petición manual con curl/Postman) ahora responden 404
   `{"message":"no tiene la autenticacion"}`.

Antes de proteger cada ruta, es buena práctica auditar rápidamente (grep de `api/lm/` y de la
URL concreta en `frontend/src`) si hay alguna otra llamada que construya sus propios headers a
mano en vez de usar `HTTP_Get`/`HTTP_Post`, por si hay más casos similares no listados aquí.

## Cambios necesarios (plan de ejecución)

### Paso 1 — Frontend: arreglar el envío del token (bloqueante, ver aviso arriba)

- `frontend/src/app/leroymerlin/config/lmsmapi.service.ts`: en `altaPedido()` (línea ~174) y
  `altaPresupuesto()` (línea ~180), añadir la cabecera `authorization` igual que en `HTTP_Post`
  del mismo fichero (líneas 285-294):
  ```ts
  const registerToken = localStorage.getItem('registerToken');
  let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  if (registerToken) {
    headers = headers.set('authorization', registerToken);
  }
  ```
- `frontend/src/app/manza/config/smapi.service.ts`: en `HTTP_Get()` (líneas 353-363), pasar
  realmente el objeto `headers` a la llamada:
  ```ts
  public HTTP_Get(route: string) {
      const registerToken = localStorage.getItem('registerToken');
      let headers = new HttpHeaders();
      if (registerToken) {
          headers = headers.set('authorization', registerToken);
      }
      return this.http.get(route, { headers }).pipe(map((response: any) => response));
  }
  ```
  (Nota: cambia `Headers` de `@angular/http` por `HttpHeaders` de `@angular/common/http` si no
  está ya importado así en el fichero — revisar los imports existentes al aplicar el cambio.)

### Paso 2 — Backend: importar el middleware en `link_routes.js`

Añadir, junto a los otros `require` de ese fichero (línea 7 en adelante):
```js
var Auth = require('../middlewares/authenticated');
```

### Paso 3 — Backend: añadir `Auth.ensureAuth` a las rutas de `link_routes.js`

Añadir `Auth.ensureAuth` como segundo argumento en **todas** las rutas del fichero
(`backend/routes/link_routes.js`, líneas 18-130), por ejemplo:
```js
lmapi.get('/accion/:cli/:pro', Auth.ensureAuth, LM.accion);
lmapi.get('/userinfo/:cli', Auth.ensureAuth, LM.userInfo);
lmapi.post('/bestellungen_hinzu2/:cli/:ref', Auth.ensureAuth, Best.bestellungen_hinzu2);
// ...y así con cada línea del fichero
```
Recorrer el fichero entero (~50 rutas) y aplicar el mismo patrón a cada una. No dejar ninguna
sin proteger salvo que se identifique una razón explícita para que sea pública (no se ha
encontrado ninguna en este análisis — todas devuelven datos de cliente o permiten escritura).

### Paso 4 — Backend: proteger las rutas duplicadas de cajones/guías en `sm_routes.js`

`Auth` ya está importado en ese fichero (línea 4: `var Auth = require('../middlewares/authenticated');`).
Añadir `Auth.ensureAuth` en las líneas 473-486:
```js
smapi.get('/cajones:cli/:tipo', Auth.ensureAuth, LM.cajones);
smapi.get('/guias/:cli/:tipo', Auth.ensureAuth, LM.guias);
smapi.post('/cajones_del', Auth.ensureAuth, LM.cajones_del);
smapi.post('/guias_del', Auth.ensureAuth, LM.guias_del);
smapi.get('/guia', Auth.ensureAuth, LM.guia);
smapi.get('/cajon', Auth.ensureAuth, LM.cajon);
smapi.get('/cajoncliente', Auth.ensureAuth, LM.cajon_cliente);
smapi.post('/put_guia', Auth.ensureAuth, LM.put_guia);
smapi.post('/put_cajon', Auth.ensureAuth, LM.put_cajon);
smapi.post('/put_cajoncliente', Auth.ensureAuth, LM.put_cajon_cliente);
smapi.post('/cajoncliente_del', Auth.ensureAuth, LM.cajon_cliente_del);
```

### Paso 5 — Backend: proteger gestión de usuarios

En `backend/routes/sm_routes.js` (línea 4 ya tiene `Auth` importado):
```js
smapi.get('/users', Auth.ensureAuth, UsersController.users);                        // línea 416
smapi.post('/register', Auth.ensureAuth, UsersController.register);                 // línea 417
smapi.get('/users/:id/permisos', Auth.ensureAuth, UsersController.getPermisos);      // línea 422
smapi.post('/users/:id/permisos', Auth.ensureAuth, UsersController.savePermisos);    // línea 423
smapi.post('/client_register', Auth.ensureAuth, ClientesController.client_register); // línea 427
```
En `backend/routes/routes.js` (falta importar, línea 15 ya tiene
`var AuthController = require('../middlewares/authenticated');` pero **ojo**: esa variable se
re-declara más abajo apuntando a otra cosa — ver nota siguiente):
```js
api.get('/users', AuthController.ensureAuth, UsersController.users);      // línea 137 — usar el AuthController de la línea 15, ANTES de que se reasigne en la línea 214
api.post('/register', AuthController.ensureAuth, UsersController.register); // línea 138
```

**⚠️ Nota crítica sobre `routes.js`:** la variable `AuthController` se declara dos veces en este
fichero con significados distintos:
- Línea 15: `var AuthController = require('../middlewares/authenticated');` (el middleware de
  auth, lo que se necesita para `ensureAuth`).
- Línea 214: `var AuthController = require('../controllers/common/users');` (el controlador de
  login, reasigna/pisa la variable anterior para usar `AuthController.Authenticate` en la línea
  215).

Como en JavaScript `var` tiene *hoisting* de la declaración pero no del valor, y ambas líneas
están en el mismo scope de módulo, **la segunda asignación (línea 214) sobreescribe la primera
para todo el fichero a partir de que se ejecuta esa línea** — pero como el código de definición
de rutas se ejecuta secuencialmente de arriba a abajo, las líneas 137-138 (que están *antes* de
la línea 214) sí ven el middleware de auth correcto en el momento en que se registran esas rutas
(Express solo necesita la referencia a la función en el momento de `route.get/post(...)`, y en
ese instante `AuthController` todavía es el middleware). Aun así, es un nombre de variable
compartido confuso y frágil: **recomendado renombrar** una de las dos variables (p. ej. la de la
línea 214 a `LoginController`) al tocar este fichero, para que quede inequívoco y no se rompa si
alguien reordena las líneas más adelante.

### Paso 6 — Probar

1. Con Postman/curl, sin cabecera `Authorization`, confirmar que cada ruta tocada devuelve ahora
   `404 {"message":"no tiene la autenticacion"}` (comportamiento de `ensureAuth` cuando falta el
   header, ver `backend/middlewares/authenticated.js:11-14`).
2. Logueado desde la app (token real en `localStorage.registerToken`), confirmar que los flujos
   de negocio siguen funcionando: login → ver tejidos/precios en `/leroy/config` y en
   `/manza/config/`, crear un pedido de prueba (`altaPedido`), crear un presupuesto de prueba
   (`altaPresupuesto`), crear/listar/borrar un usuario desde `/routes/setup/master`.
3. Confirmar que un token expirado (`exp` pasado) devuelve `401 {"message":"el token ha expirado"}`
   y uno manipulado/inválido devuelve `404 {"message":"el token no es valido"}` (comportamiento
   ya existente del middleware, solo hay que verificar que ahora se ejerce en las rutas nuevas).

## Fuera de alcance de este documento (mencionado para que quede constancia, no para ejecutar aquí)

- El secreto JWT hardcodeado (`'clave_secreta_del_curso_angular'`, repetido en
  `backend/middlewares/authenticated.js:6` y `backend/services/jwt.js:8`) debería vivir en una
  variable de entorno, no en el código fuente. No se aborda en este plan.
- `backend/services/jwt.js`, función `createToken` (línea 6): el payload del JWT que realmente
  se firma solo incluye `sub, name, surname, email, role, image, iat, exp` — **no incluye**
  `idrow`, `isAdmin`, `ambito`, `tipo` ni `permisos`, aunque `Authenticate` le pasa un objeto con
  todos esos campos (`responderLogin`, línea 115 de `users.js`). Además `user._id` no existe en
  ese objeto (el campo real es `idrow`), así que `sub` sale `undefined` en todos los tokens
  emitidos. Si en el futuro algún endpoint protegido con `ensureAuth` necesita comprobar
  `req.user.idrow` o `req.user.isAdmin` (hoy solo `backend/controllers/sm/accionamientos.js:453`
  usa `req.user.sub`, que ya está roto por este mismo motivo), habrá que arreglar `createToken`
  primero. No se toca en este plan porque no bloquea añadir `ensureAuth` (que solo comprueba que
  el token sea válido y no haya expirado, no mira su contenido) — pero cualquier lógica de
  autorización más fina que se quiera añadir después sí lo necesitará.
- No se cubre la incoherencia del campo `integracion` (ver `integracion.md`) — es un problema de
  UI, no de seguridad del backend, y son independientes.
- No se revisan aquí las otras ~295 rutas de `sm_routes.js` ni las ~130 de `routes.js` que no
  están relacionadas con LeroyMerlin ni con gestión de usuarios; puede que tengan el mismo
  problema, pero está fuera del alcance de lo detectado en esta investigación. Si se quiere una
  auditoría completa de todas las rutas del backend, es una tarea aparte.
