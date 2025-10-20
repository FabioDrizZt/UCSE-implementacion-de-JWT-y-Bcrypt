# Full-stack simple: Express + React + Node + API con JSON + Filesystem

Pequeño proyecto **CRUD de Películas** para clase: backend en **Express** que persiste en archivo JSON usando **filesystem**, y frontend **React** que consume la API con peticiones asíncronas. Incluye `api.http` para probar con **REST Client** de VS Code.

## ⚠️ Estado Actual del Proyecto

**Este proyecto está en modo de desarrollo sin seguridad implementada:**

- ✅ Sistema funcional de CRUD de películas
- ✅ Autenticación básica (login/logout)
- ❌ **Sin encriptación de contraseñas** (almacenadas en texto plano)
- ❌ **Sin tokens JWT reales** (usa tokens simulados)
- ❌ **Sin generación segura de IDs** (usa timestamps + random)

### 📝 Funcionalidades Pendientes (TODO)

Para llevar este proyecto a producción, se deben implementar:

1. **bcryptjs**: Hasheo y verificación segura de contraseñas
   - Instalar: `pnpm install bcryptjs`
   - Implementar en: `server/scripts/seed-users.js` y `server/server.js`

2. **jsonwebtoken (JWT)**: Autenticación basada en tokens seguros
   - Instalar: `pnpm install jsonwebtoken`
   - Implementar en: `server/server.js` (middleware authMiddleware)

3. **crypto.randomUUID()**: Generación de IDs únicos seguros
   - Ya disponible en Node.js (módulo nativo)
   - Implementar en: `server/server.js` y scripts de seed

Consulta los comentarios `TODO` en el código para más detalles.

## Estructura

```
fullstack-express-react-fs-jwt/
  server/            # API Express + FS
  client/            # React (Vite)
  api.http           # pruebas REST
  README.md
```

## 1) Backend (server)

```bash
cd server
pnpm install
pnpm run seed-users    # crea usuario: prof / 123456
pnpm run seed-movies   # crea películas de ejemplo
pnpm run dev           # http://localhost:4000
```

Variables en `server/.env` (opcional):
```
PORT=4000
DATA_DIR=./data
DEFAULT_USERNAME=prof
DEFAULT_PASSWORD=123456
```

### Endpoints

- `GET /api/health` → verificar estado
- `POST /api/login` → devuelve `{ token }` (token simulado)
- `GET /api/movies` → lista todas las películas
- `GET /api/movies/:id` → obtener detalle
- `POST /api/movies` _(Auth)_ → crear película
- `PATCH /api/movies/:id` _(Auth)_ → actualizar película
- `DELETE /api/movies/:id` _(Auth)_ → eliminar película

## 2) Frontend (client)

```bash
cd client
pnpm install
pnpm run dev      # Vite en http://localhost:5173
```

Opcional: crea `client/.env` con `VITE_API_URL=http://localhost:4000`.

## 3) Probar con REST Client (VS Code)

Instala extensión **REST Client** (humao.rest-client). Abre `api.http`, inicia el servidor y:

1. Ejecuta _Login_ → copia el token y pégalo en `@token`.
2. Ejecuta _Crear/Actualizar/Eliminar_.

## Notas

- **Persistencia**: se utiliza `fs/promises` para leer/escribir `data/*.json`
- **IDs**: actualmente usa timestamps + random (TODO: migrar a crypto.randomUUID())
- **Autenticación**: sistema simplificado sin JWT real (TODO: implementar jsonwebtoken)
- **Contraseñas**: almacenadas en texto plano (TODO: implementar bcryptjs)

```
Usuario: prof
Password: 123456
```

## Seguridad

⚠️ **IMPORTANTE**: Este proyecto NO debe usarse en producción sin implementar las funcionalidades de seguridad marcadas como TODO en el código.
