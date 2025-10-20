const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function http(method, url, body, token) {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
  createMovie: (movie, token) => http("POST", "/api/movies", movie, token),
  updateMovie: (id, patch, token) =>
    http("PATCH", `/api/movies/${id}`, patch, token),
  deleteMovie: (id, token) =>
    http("DELETE", `/api/movies/${id}`, undefined, token),
};
