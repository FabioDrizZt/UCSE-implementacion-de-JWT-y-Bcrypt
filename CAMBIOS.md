# Guía de Implementación: De Versión Base a Producción

Este documento describe los cambios necesarios para transformar la versión base (sin seguridad) en una aplicación lista para producción con JWT y bcrypt.

## 🎯 Objetivo

Implementar las siguientes funcionalidades de seguridad:

1. ✅ Hasheo seguro de contraseñas con **bcryptjs**
2. ✅ Autenticación con tokens **JWT** (JSON Web Tokens)
3. ✅ Generación segura de IDs con **crypto.randomUUID()**

---

## 📦 Paso 1: Instalar Dependencias

```bash
cd server
pnpm install bcryptjs jsonwebtoken
```

O si prefieres, mueve las dependencias de `devDependencies` a `dependencies` en `package.json`:

```json
"dependencies": {
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "express": "^4.19.2",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 🔐 Paso 2: Implementar bcrypt en seed-users.js

**Archivo**: `server/scripts/seed-users.js`

### Cambios a realizar:

1. **Descomentar imports**:
   ```javascript
   import bcrypt from "bcryptjs";
   import crypto from "crypto";
   ```

2. **Descomentar configuración de salt rounds**:
   ```javascript
   const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
   ```

3. **Reemplazar el código temporal** con el código seguro:
   ```javascript
   // ANTES (inseguro):
   const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
   users.push({ id: userId, username, password });
   
   // DESPUÉS (seguro):
   const passwordHash = await bcrypt.hash(password, saltRounds);
   users.push({ id: crypto.randomUUID(), username, passwordHash });
   ```

4. **Eliminar el mensaje de advertencia** temporal.

---

## 🔑 Paso 3: Implementar JWT en server.js

**Archivo**: `server/server.js`

### 3.1. Descomentar imports

```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
```

### 3.2. Descomentar SECRET_KEY

```javascript
const SECRET_KEY = process.env.SECRET_KEY;
```

**Importante**: Agrega `SECRET_KEY` a tu archivo `.env`:
```
SECRET_KEY=tu-clave-secreta-muy-larga-y-compleja
```

### 3.3. Actualizar endpoint `/api/login`

Reemplazar la comparación temporal con bcrypt:

```javascript
// ANTES (inseguro):
const ok = password === user.password;

// DESPUÉS (seguro):
const ok = await bcrypt.compare(password, user.passwordHash);
```

Reemplazar el token simulado con JWT real:

```javascript
// ANTES (inseguro):
const token = `fake-token-${user.username}-${Date.now()}`;

// DESPUÉS (seguro):
const token = jwt.sign(
  { sub: user.id, username: user.username }, 
  SECRET_KEY, 
  { expiresIn: '1h' }
);
```

### 3.4. Actualizar authMiddleware

Reemplazar la validación temporal con verificación JWT real:

```javascript
// ANTES (inseguro):
if (!token.startsWith('fake-token-')) {
  return res.status(401).json({ error: 'Token inválido' });
}
const parts = token.split('-');
req.user = { username: parts[2] || 'unknown' };
next();

// DESPUÉS (seguro):
jwt.verify(token, SECRET_KEY, (err, decoded) => {
  if (err) return res.status(401).json({ error: 'Token inválido' });
  req.user = decoded; // { sub, username, iat, exp }
  next();
});
```

### 3.5. Actualizar generación de IDs en POST /api/movies

Reemplazar el ID temporal con crypto.randomUUID():

```javascript
// ANTES (inseguro):
const newMovie = { 
  id: `movie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
  title, 
  year: year || new Date().getFullYear(), 
  watched: false, 
  createdBy: req.user.username 
};

// DESPUÉS (seguro):
const newMovie = { 
  id: crypto.randomUUID(), 
  title, 
  year: year || new Date().getFullYear(), 
  watched: false, 
  createdBy: req.user.username 
};
```

---

## 🗑️ Paso 4: Limpiar y Regenerar Datos

Después de implementar los cambios, necesitas regenerar los datos con las nuevas características de seguridad:

```bash
# Eliminar datos antiguos
rm server/data/users.json
rm server/data/movies.json

# Regenerar con contraseñas hasheadas
pnpm run seed-users
pnpm run seed-movies
```

---

## ✅ Paso 5: Verificar la Implementación

1. **Iniciar el servidor**:
   ```bash
   cd server
   pnpm run dev
   ```

2. **Verificar los datos**:
   - Abre `server/data/users.json` y verifica que la contraseña esté hasheada (no en texto plano)
   - Debe verse algo como: `"passwordHash": "$2a$10$..."`

3. **Probar con REST Client**:
   - Abre `api.http`
   - Ejecuta el login → obtendrás un JWT real
   - Copia el token y úsalo en las demás peticiones

4. **Probar con el frontend**:
   ```bash
   cd client
   pnpm run dev
   ```
   - Inicia sesión con `prof / 123456`
   - Crea, edita y elimina películas

---

## 📚 Conceptos Clave

### JWT (JSON Web Token)

- **Estructura**: Header.Payload.Signature
- **Header**: Algoritmo y tipo de token
- **Payload**: Datos del usuario (sub, username, exp)
- **Signature**: Firma criptográfica usando SECRET_KEY
- **Expiración**: Token válido por 1 hora (`expiresIn: '1h'`)

### bcrypt

- **Hash**: Función unidireccional (no se puede revertir)
- **Salt**: Datos aleatorios agregados antes del hash
- **Salt Rounds**: Número de iteraciones (10 = 2^10 = 1024 iteraciones)
- **Compare**: Compara la contraseña en texto plano con el hash

### crypto.randomUUID()

- **UUID v4**: Identificador único universal
- **128 bits**: Prácticamente imposible que se repita
- **Formato**: `550e8400-e29b-41d4-a716-446655440000`

---

## 🔒 Variables de Entorno Recomendadas

Crea o actualiza `server/.env`:

```
PORT=4000
SECRET_KEY=genera-una-clave-larga-y-aleatoria-aqui-minimo-32-caracteres
DATA_DIR=./data
DEFAULT_USERNAME=prof
DEFAULT_PASSWORD=123456
SALT_ROUNDS=10
```

**Consejo**: Genera una SECRET_KEY segura con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎉 ¡Listo!

Después de implementar todos estos cambios, tu aplicación estará lista para producción con:

- ✅ Contraseñas hasheadas de forma segura
- ✅ Autenticación JWT con expiración
- ✅ IDs únicos generados de forma segura
- ✅ Middleware de autenticación robusto

---

## 📖 Referencias

- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [jsonwebtoken Documentation](https://github.com/auth0/node-jsonwebtoken)
- [JWT.io](https://jwt.io/) - Decodificador de tokens JWT
- [crypto.randomUUID() Node.js](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)

