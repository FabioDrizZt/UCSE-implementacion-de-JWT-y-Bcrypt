import { useEffect, useState } from "react";
import { api } from "./services/api";
import MovieCard from "./components/MovieCard";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [username, setUsername] = useState("prof");
  const [password, setPassword] = useState("123456");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getMovies();
      setMovies(data);
      setLoading(false);
    };
    load();
  }, []);

  const login = async (e) => {
    e.preventDefault();
    const { token } = await api.login(username, password);
    setToken(token);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  const addMovie = async (e) => {
    e.preventDefault();
    if (!title) return;
    const movie = await api.createMovie(
      { title, year: Number(year) || undefined },
      token
    );
    setMovies((prev) => [...prev, movie]);
    setTitle("");
    setYear("");
  };

  const toggleWatched = async (movie) => {
    const updated = await api.updateMovie(
      movie.id,
      { watched: !movie.watched },
      token
    );
    setMovies((prev) => prev.map((m) => (m.id === movie.id ? updated : m)));
  };

  const remove = async (movie) => {
    await api.deleteMovie(movie.id, token);
    setMovies((prev) => prev.filter((m) => m.id !== movie.id));
  };

  const startEdit = (movie) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setYear(String(movie.year));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setYear("");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!title) return;
    const updated = await api.updateMovie(
      editingId,
      { title, year: Number(year) || undefined },
      token
    );
    setMovies((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
    setEditingId(null);
    setTitle("");
    setYear("");
  };

  return (
    <main className="container">
      <hgroup>
        <h1>🎬 Películas</h1>
        <p>
          Backend con filesystem (JSON), rutas CRUD y protección con JWT.
          Cliente React con fetch asíncrono y estado.
        </p>
      </hgroup>

      {token ? (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span>Sesión iniciada ✅</span>
          <button onClick={logout} className="secondary">
            Salir
          </button>
        </div>
      ) : (
        <form onSubmit={login}>
          <fieldset role="group">
            <input
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              placeholder="Contraseña"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Ingresar</button>
          </fieldset>
        </form>
      )}

      {token && (
        <form onSubmit={editingId ? saveEdit : addMovie}>
          <fieldset role="group">
            <input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Año"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              type="number"
            />
            <button type="submit">{editingId ? "Guardar" : "Agregar"}</button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="secondary">
                Cancelar
              </button>
            )}
          </fieldset>
        </form>
      )}

      {loading ? (
        <p aria-busy="true">Cargando películas...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              onToggle={() => toggleWatched(m)}
              onRemove={() => remove(m)}
              onEdit={() => startEdit(m)}
              canEdit={!!token}
            />
          ))}
        </div>
      )}
    </main>
  );
}
