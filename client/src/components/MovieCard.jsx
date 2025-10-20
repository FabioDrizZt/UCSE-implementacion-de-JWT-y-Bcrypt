import React from "react";

export default function MovieCard({
  movie,
  onToggle,
  onRemove,
  onEdit,
  canEdit,
}) {
  return (
    <article
      style={{
        position: "relative",
        border: movie.watched ? "2px solid var(--pico-primary)" : undefined,
      }}
    >
      <h3>{movie.title}</h3>
      <p>
        <small>
          {movie.year} · {movie.watched ? "Vista ✅" : "Pendiente ⏳"}
        </small>
      </p>
      {canEdit && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={onToggle} style={{ flex: "1 1 auto" }}>
            {movie.watched ? "Marcar no vista" : "Marcar vista"}
          </button>
          <button
            onClick={onEdit}
            className="secondary"
            style={{ flex: "1 1 auto" }}
          >
            Editar
          </button>
          <button
            onClick={onRemove}
            className="contrast"
            style={{ flex: "1 1 auto" }}
          >
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
