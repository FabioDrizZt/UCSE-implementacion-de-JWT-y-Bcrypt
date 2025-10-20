import { readJSON, writeJSON, dataPaths } from "../utils/db.js";
import crypto from "crypto";

process.loadEnvFile();

const seedMovies = [
  { title: "El Padrino", year: 1972, watched: false },
  { title: "Pulp Fiction", year: 1994, watched: true },
  { title: "El Caballero de la Noche", year: 2008, watched: false },
  { title: "Forrest Gump", year: 1994, watched: true },
  { title: "Inception", year: 2010, watched: false },
  { title: "Matrix", year: 1999, watched: true },
  { title: "Interstellar", year: 2014, watched: false },
  {
    title: "El Señor de los Anillos: El Retorno del Rey",
    year: 2003,
    watched: true,
  },
  { title: "Gladiador", year: 2000, watched: false },
  { title: "Parasite", year: 2019, watched: false },
];

const run = async () => {
  const movies = await readJSON(dataPaths.movies).catch(() => []);

  if (movies.length > 0) {
    console.log(`Ya existen ${movies.length} película(s) en la base de datos`);
    const shouldContinue = process.argv.includes("--force");
    if (!shouldContinue) {
      console.log("Usa --force para agregar películas de todas formas");
      return;
    }
  }

  let addedCount = 0;
  for (const movie of seedMovies) {
    const exists = movies.some(
      (m) => m.title === movie.title && m.year === movie.year
    );
    if (!exists) {
      movies.push({
        id: crypto.randomUUID(),
        ...movie,
        createdBy: "seed",
      });
      addedCount++;
    }
  }

  if (addedCount === 0) {
    console.log("Todas las películas semilla ya existen");
    return;
  }

  await writeJSON(dataPaths.movies, movies);
  console.log(`✅ ${addedCount} película(s) semilla agregadas exitosamente`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
