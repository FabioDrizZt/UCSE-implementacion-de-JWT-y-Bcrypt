import express from 'express';
import cors from 'cors';
// TODO: Importar jsonwebtoken para generar y verificar tokens JWT
// import jwt from 'jsonwebtoken';
// TODO: Importar bcryptjs para hashear y comparar contraseñas
// import bcrypt from 'bcryptjs';
import { readJSON, writeJSON, dataPaths } from './utils/db.js';
// TODO: Importar crypto para generar IDs únicos seguros
// import crypto from 'crypto';

process.loadEnvFile();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
// TODO: Descomentar cuando implementes JWT
// const SECRET_KEY = process.env.SECRET_KEY;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --- Auth ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username y password son requeridos' });

    const users = await readJSON(dataPaths.users);
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    // TODO: Implementar bcrypt.compare() para verificar contraseñas hasheadas
    // const ok = await bcrypt.compare(password, user.passwordHash);
    // TEMPORAL: Comparación insegura en texto plano (solo para desarrollo)
    const ok = password === user.password;
    if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // TODO: Implementar JWT real con jwt.sign()
    // const token = jwt.sign({ sub: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    // TEMPORAL: Token simulado (solo para desarrollo)
    const token = `fake-token-${user.username}-${Date.now()}`;
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en /api/login' });
  }
});

function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  
  // TODO: Implementar verificación real con jwt.verify()
  // jwt.verify(token, SECRET_KEY, (err, decoded) => {
  //   if (err) return res.status(401).json({ error: 'Token inválido' });
  //   req.user = decoded; // { sub, username, iat, exp }
  //   next();
  // });
  
  // TEMPORAL: Validación simplificada (solo para desarrollo)
  if (!token.startsWith('fake-token-')) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  // Extraer username del token fake
  const parts = token.split('-');
  req.user = { username: parts[2] || 'unknown' };
  next();
}

// --- Movies ---
app.get('/api/movies', async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  res.json(movies);
});

app.get('/api/movies/:id', async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  const movie = movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: 'No encontrada' });
  res.json(movie);
});

app.post('/api/movies', authMiddleware, async (req, res) => {
  const { title, year } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title es requerido' });
  const movies = await readJSON(dataPaths.movies);
  
  // TODO: Usar crypto.randomUUID() para generar IDs seguros
  // const newMovie = { id: crypto.randomUUID(), title, year: year || new Date().getFullYear(), watched: false, createdBy: req.user.username };
  // TEMPORAL: ID basado en timestamp (no seguro para producción)
  const newMovie = { id: `movie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title, year: year || new Date().getFullYear(), watched: false, createdBy: req.user.username };
  
  movies.push(newMovie);
  await writeJSON(dataPaths.movies, movies);
  res.status(201).json(newMovie);
});

app.patch('/api/movies/:id', authMiddleware, async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  const idx = movies.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrada' });
  const patch = req.body || {};
  movies[idx] = { ...movies[idx], ...patch };
  await writeJSON(dataPaths.movies, movies);
  res.json(movies[idx]);
});

app.delete('/api/movies/:id', authMiddleware, async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  const idx = movies.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrada' });
  const [removed] = movies.splice(idx, 1);
  await writeJSON(dataPaths.movies, movies);
  res.json({ deleted: removed.id });
});

app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
