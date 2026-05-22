import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { auth, useAuth } from "@/lib/auth-store";
import { loginCliente } from "@/lib/clients-api";

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
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <p>Ya iniciaste sesion como <b>{user.name}</b>.</p>
        <Link to="/cuenta" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Ir a mi cuenta
        </Link>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !pwd) return setErr("Completa email y contraseña");

    setLoading(true);
    setErr("");
    try {
      const { api } = await import("@/lib/api");
      // 1. Intentar como Administrador primero
      try {
        const { data: adminData } = await api.post("/admin/login", {
          correo: email,
          contrasena: pwd,
        });
        
        if (adminData && adminData.correo) {
          // Es administrador, redirigir al dashboard de admin
          // Forzamos una recarga completa para salir del router del cliente y entrar al de Vite
          window.location.href = "/admin";
          return;
        }
      } catch (adminErr) {
        // Falló como admin, pasamos a intentar como cliente
      }

      // 2. Intentar como Cliente
      const cliente = await loginCliente({
        correo: email,
        contrasena: pwd,
      });

      auth.register({
        idCliente: cliente.idCliente,
        name: cliente.nombre,
        email: cliente.correo,
        dni: cliente.dni,
      });
      navigate({ to: "/cuenta" });
    } catch {
      setErr("Correo o contraseña incorrectos.");
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
