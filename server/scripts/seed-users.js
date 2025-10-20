import bcrypt from "bcryptjs";
import { readJSON, writeJSON, dataPaths } from "../utils/db.js";
import crypto from "crypto";

process.loadEnvFile();

const username = process.env.DEFAULT_USERNAME || "prof";
const password = process.env.DEFAULT_PASSWORD || "123456";
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

const run = async () => {
  const users = await readJSON(dataPaths.users).catch(() => []);
  const exists = users.some((u) => u.username === username);
  if (exists) {
    console.log("Usuario ya existe, nada que hacer");
    return;
  }
  const passwordHash = await bcrypt.hash(password, saltRounds);
  users.push({ id: crypto.randomUUID(), username, passwordHash });
  await writeJSON(dataPaths.users, users);
  console.log(`Usuario semilla creado: ${username} / (password: ${password})`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
