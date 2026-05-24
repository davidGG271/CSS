import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { loginUnificado } from "@/lib/auth-unified";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Iniciar sesion - CyC Computer" }] }),
});

function Login() {
  const navigate = useNavigate();
  const user = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.rol === "ADMIN" ? "/admin" : "/cuenta"} />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !pwd) return setErr("Completa email y contrasena");

    setLoading(true);
    setErr("");
    try {
      const result = await loginUnificado(email, pwd);
      if (result.rol === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/cuenta" });
      }
    } catch (error: any) {
      setErr(error.message || "Correo o contrasena incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto grid max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-elegant">
        <h1 className="font-display text-3xl font-bold">Bienvenido de nuevo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Inicia sesion con tu correo y contrasena.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Contrasena</label>
            <input
              type="password"
              value={pwd}
              onChange={(event) => setPwd(event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No tenes cuenta? <Link to="/registro" className="text-primary-glow hover:underline">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
