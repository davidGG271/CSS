import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

function RedirectToStore() {
  useEffect(() => {
    const clientUrl = import.meta.env.VITE_CLIENT_URL || "http://localhost:8000";
    window.location.href = clientUrl;
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d1a",
        color: "#fff",
        fontFamily: "sans-serif",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: "2rem" }}>⚡</div>
      <p>Redirigiendo a la tienda...</p>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: RedirectToStore,
});
