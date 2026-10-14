# manza: ERP SOLARMANES / HARU

Monorepo con el backend (Node + Express + mssql) y el frontend (Angular). Remoto:
`github.com/vicentferri/manza`. Los textos de la interfaz, los comentarios y los commits se
escriben en español.

## Estructura

- `backend/server.js`: servidor HTTPS. Monta `routes/routes.js` en `/api`, `routes/sm_routes.js`
  en `/api/sm` y `routes/link_routes.js` en `/api/lm`. Los controladores están en
  `backend/controllers/{common,nh,sm,sm/lm,haru,export}`.
- `frontend/src/app/manza/config`: el **configurador de clientes** (el que se usa). Cada tipo de
  cortina tiene su componente (`enrollable`, `japones`, `vertical`, `compac`, `honeycomb`) y su
  resumen (`preview-N`).
- `frontend/src/app/routes/`: la zona interna (configuración, maestros, fabricación, tarifas), con
  el layout de menú lateral.
- `frontend/src/app/leroymerlin/config`: **código muerto**. No hay que revisarlo ni adaptarlo.
- `backend/server_old.js`: no se usa.
- **La lógica de fabricación, tarifas y XML de producción está en stored procedures de SQL Server**,
  no en el repo. El backend solo los llama. Los SPs de HoneyComb sí están versionados en
  `sqlHoney/`.

## Dominio

- Tipos de producto (`tipo` / `TipoCortina`, tabla `SOL_ARTICULOS_PRODUCTOS`): 1 enrollable,
  2 panel japonés, 3 vertical, 4 Compac / Solar Mini, 6 cajón ZIP, 7 HoneyComb.
- Clientes (`NH_CLIENTES`): 1 Leroy Merlín, 5 Leroy Merlín Web, 2 CortinaDecor, 4 Solarmanes
  (nosotros; los usuarios internos usan el configurador como cliente 4).
- Hay dos tablas de usuarios:
  - `USERS`: internos, con `ambito` 'I'/'Interno', `isAdmin` y permisos en `USERS_PERMISOS`.
  - `CLIENTES_USERS`: clientes, con los productos visibles en `prod_1`…`prod_7`.
  - Las dos tienen su propio `IDROW`, así que **un id puede coincidir** entre ellas.
  - El login (`controllers/common/users.js` → `Authenticate`) busca primero en `USERS` y después
    en `CLIENTES_USERS`. El frontend guarda la respuesta completa en `localStorage.currentUser`.

## Entorno local

- Backend: `cd backend && npm start` (nodemon). Frontend: `cd frontend && npm start` (`ng serve`
  en http://localhost:8080). Para instalar el frontend hace falta `npm install --legacy-peer-deps`.
- En `origin/main`, `server.js` y `environment.ts` apuntan a **producción** (puerto 8080,
  `92.222.16.22`, BD `SOLARMANES_DEV`, que a pesar del nombre es la BD real de producción, y
  `https://www.manzasm.com`).
  - En local se editan a mano: `server.js` con `localhost`, puerto 3001 y la BD de la rama
    (`SOLARMANES_DEV` o `SOLARMANES_TEST`), y `environment.ts` con `https://localhost:3001`.
  - **Nunca hay que commitear `backend/server.js` ni `frontend/src/environments/environment.ts`
    con la configuración local.** Ya pasó (a65a7c0, revertido en 4697481).
- `server.js` no lee `backend/.env`. Ese fichero solo lo usan los tests.
- El backend solo funciona por HTTPS, con un certificado autofirmado. Para aceptar el certificado
  hay que abrir una URL de la API (`https://localhost:3001/api/sm/...`), **nunca la raíz `/`**:
  sin `backend/dist/index.html` el proceso se cae (en nodemon se reinicia con `rs`).
- SQL Server local: `sqlcmd -S localhost -U sa -C ...`. Hace falta `-C` por el certificado. Las
  bases de datos son SOLARMANES, SOLARMANES_DEV y SOLARMANES_TEST.

## Reglas de trabajo

- **Cambios en la BD**: Nunca modificar producción, simpre en local y nunca sin pedir permiso
- **Cambios front y back** : Nunca hacer git push sin permiso
- **Para todos** : Siempre hacer un plan de desarrollo, qu eyo validare 
