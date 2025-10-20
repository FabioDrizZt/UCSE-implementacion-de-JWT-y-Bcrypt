// TODO: Importar bcryptjs para hashear contraseñas
// import bcrypt from "bcryptjs";
import { readJSON, writeJSON, dataPaths } from "../utils/db.js";
// TODO: Importar crypto para generar IDs seguros
// import crypto from "crypto";

process.loadEnvFile();

const username = process.env.DEFAULT_USERNAME || "prof";
const password = process.env.DEFAULT_PASSWORD || "123456";
// TODO: Descomentar cuando implementes bcrypt
// const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

const run = async () => {
  const users = await readJSON(dataPaths.users).catch(() => []);
  const exists = users.some((u) => u.username === username);
  if (exists) {
    console.log("Usuario ya existe, nada que hacer");
    return;
  }
  
  // TODO: Implementar bcrypt.hash() para hashear la contraseña
  // const passwordHash = await bcrypt.hash(password, saltRounds);
  // users.push({ id: crypto.randomUUID(), username, passwordHash });
  
  // TEMPORAL: Almacenamiento inseguro en texto plano (solo para desarrollo)
  // TODO: Usar crypto.randomUUID() para generar ID seguro
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  users.push({ id: userId, username, password });
  
  await writeJSON(dataPaths.users, users);
  console.log(`Usuario semilla creado: ${username} / (password: ${password})`);
  console.log("⚠️  ADVERTENCIA: Contraseña almacenada en texto plano - NO usar en producción");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
