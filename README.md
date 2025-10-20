# Full‑stack simple: Express + React + Node + API con JSON + Filesystem (+ JWT opcional)

Pequeño proyecto **CRUD de Películas** para clase: backend en **Express** que persiste en archivo JSON usando **filesystem**, y frontend **React** que consume la API con peticiones asíncronas. Las rutas de escritura están protegidas con **JWT** y el usuario de ejemplo se crea con **bcryptjs** (hash de contraseña). 🧪 Incluye `api.http` para probar con **REST Client** de VS Code. 

> JWT es un estándar (RFC 7519) con *header*, *payload* y *signature*; aquí lo usamos para autenticación con expiración (`expiresIn`). `bcryptjs` se usa para hashear/verificar contraseñas con *salt rounds*. citeturn1search1

## Estructura
```
fullstack-express-react-fs-jwt/
  server/            # API Express + FS + JWT
  client/            # React (Vite)
  api.http           # pruebas REST
  README.md
```

## 1) Backend (server)
```bash
cd server
npm i
npm run seed     # crea usuario: prof / 123456
npm run dev      # http://localhost:4000
```
Variables en `server/.env`:
```
PORT=4000
SECRET_KEY=super-secret-dev-key
DATA_DIR=./data
DEFAULT_USERNAME=prof
DEFAULT_PASSWORD=123456
SALT_ROUNDS=10
```

### Endpoints
- `POST /api/login` → envía el JWT en una cookie HTTP-only (1h)
- `POST /api/logout` → elimina la cookie de autenticación
- `GET /api/me` → verifica si el usuario está autenticado
- `GET /api/movies` → lista
- `GET /api/movies/:id` → detalle
- `POST /api/movies` *(Auth)* → crea
- `PATCH /api/movies/:id` *(Auth)* → actualiza (ej. `watched`)
- `DELETE /api/movies/:id` *(Auth)* → elimina

**Nota sobre autenticación**: El token JWT se envía automáticamente mediante cookies HTTP-only. El frontend no necesita manejar el token manualmente, todo es transparente usando `credentials: 'include'` en las peticiones fetch.

## 2) Frontend (client)
```bash
cd client
npm i
npm run dev      # Vite en http://localhost:5173 (por defecto)
```
Opcional: crea `client/.env` con `VITE_API_URL=http://localhost:4000`.

## 3) Probar con REST Client (VS Code)
Instala extensión **REST Client** (humao.rest-client). Abre `api.http`, inicia el servidor y:
1. Ejecuta *Login* → copia el token y pégalo en `@token`.
2. Ejecuta *Crear/Actualizar/Eliminar*.

## Notas didácticas
- **Persistencia**: se utiliza `fs/promises` para leer/escribir `data/*.json` con helpers que aseguran archivos iniciales.
- **IDs**: se usan UUIDs con `crypto.randomUUID()` del runtime de Node. citeturn1search1
- **JWT**: firmado con `jsonwebtoken.sign(payload, SECRET_KEY, { expiresIn: '1h' })` y verificado en middleware. citeturn1search1
- **bcryptjs**: `hash`/`compare` con *salt rounds* configurables: mayor *salt* ⇒ más tiempo pero más seguridad. citeturn1search1

```
Usuario: prof
Password: 123456
```
