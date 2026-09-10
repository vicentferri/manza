# manza

Monorepo del ERP SOLARMANES / HARU.

## Estructura

| Carpeta      | Descripción                                        | Stack                     |
|--------------|----------------------------------------------------|---------------------------|
| `frontend/`  | Dashboard ERP                                      | Angular                   |
| `backend/`   | API REST + servidor HTTPS que sirve el build       | Node.js / Express / MSSQL |

## Frontend

```bash
cd frontend
npm install
npm start        # servidor de desarrollo
npm run build    # build de producción -> frontend/dist
```

## Backend

```bash
cd backend
npm install
npm start        # nodemon server.js (HTTPS en el puerto 8080)
```

El backend sirve los ficheros estáticos desde `backend/dist/` (copia del build del
frontend) y expone la API bajo `/api`, `/api/sm` y `/api/lm`.
