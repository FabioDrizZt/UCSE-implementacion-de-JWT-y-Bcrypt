const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function http(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Incluir cookies automáticamente
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getMovies: () => http("GET", "/api/movies"),
  getMovie: (id) => http("GET", `/api/movies/${id}`),
  login: (username, password) =>
    http("POST", "/api/login", { username, password }),
  logout: () => http("POST", "/api/logout"),
  checkAuth: () => http("GET", "/api/me"),
  createMovie: (movie) => http("POST", "/api/movies", movie),
  updateMovie: (id, patch) => http("PATCH", `/api/movies/${id}`, patch),
  deleteMovie: (id) => http("DELETE", `/api/movies/${id}`),
};
