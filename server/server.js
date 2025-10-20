import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { readJSON, writeJSON, dataPaths } from "./utils/db.js";
import crypto from "crypto";

process.loadEnvFile();
const app = express();

// CORS configurado para permitir credenciales (cookies)
app.use(
  cors({
    origin: "http://localhost:5173", // URL del cliente Vite
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.SECRET_KEY;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --- Auth ---
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res
        .status(400)
        .json({ error: "username y password son requeridos" });

    const users = await readJSON(dataPaths.users);
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Enviar token en cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: false, // Cambiar a true en producción con HTTPS
      sameSite: "lax", // Protección CSRF
      maxAge: 3600000, // 1 hora en milisegundos
    });

    res.json({ success: true, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en /api/login" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Verificar estado de autenticación
app.get("/api/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ authenticated: false });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, username: decoded.username });
  });
});

function authMiddleware(req, res, next) {
  // Leer el token de la cookie
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Token no proporcionado" });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token inválido" });
    req.user = decoded; // { sub, username, iat, exp }
    next();
  });
}

// --- Movies ---
app.get("/api/movies", async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  res.json(movies);
});

app.get("/api/movies/:id", async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  const movie = movies.find((m) => m.id === req.params.id);
  if (!movie) return res.status(404).json({ error: "No encontrada" });
  res.json(movie);
});

app.post("/api/movies", authMiddleware, async (req, res) => {
  const { title, year } = req.body || {};
  if (!title) return res.status(400).json({ error: "title es requerido" });
  const movies = await readJSON(dataPaths.movies);
  const newMovie = {
    id: crypto.randomUUID(),
    title,
    year: year || new Date().getFullYear(),
    watched: false,
    createdBy: req.user.username,
  };
  movies.push(newMovie);
  await writeJSON(dataPaths.movies, movies);
  res.status(201).json(newMovie);
});

app.patch("/api/movies/:id", authMiddleware, async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  const idx = movies.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "No encontrada" });
  const patch = req.body || {};
  movies[idx] = { ...movies[idx], ...patch };
  await writeJSON(dataPaths.movies, movies);
  res.json(movies[idx]);
});

app.delete("/api/movies/:id", authMiddleware, async (req, res) => {
  const movies = await readJSON(dataPaths.movies);
  const idx = movies.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "No encontrada" });
  const [removed] = movies.splice(idx, 1);
  await writeJSON(dataPaths.movies, movies);
  res.json({ deleted: removed.id });
});

app.listen(PORT, () =>
  console.log(`API escuchando en http://localhost:${PORT}`)
);
