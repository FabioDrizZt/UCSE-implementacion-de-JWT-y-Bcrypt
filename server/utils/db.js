import fs from "fs/promises";
import path from "path";

process.loadEnvFile();

const DATA_DIR = process.env.DATA_DIR || "./data";
export const dataPaths = {
  movies: path.join(DATA_DIR, "movies.json"),
  users: path.join(DATA_DIR, "users.json"),
};

export async function readJSON(filePath) {
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data || "null");
}

export async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
