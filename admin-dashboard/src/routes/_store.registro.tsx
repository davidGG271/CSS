import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { auth } from "@/lib/auth-store";
import { createCliente } from "@/lib/clients-api";

export const Route = createFileRoute("/_store/registro")({
  component: Register,
  head: () => ({ meta: [{ title: "Crear cuenta - CyC Computer" }] }),
});

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", dni: "", email: "", phone: "", pwd: "", pwd2: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const upd = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.dni || !form.email || !form.pwd) return setErr("Completa los campos obligatorios");
    if (form.dni.length !== 8) return setErr("El DNI debe tener 8 digitos");
    if (form.pwd !== form.pwd2) return setErr("Las contrasenas no coinciden");

    setLoading(true);
    setErr("");
    try {
      const cliente = await createCliente({
        nombre: form.name,
        dni: form.dni,
        correo: form.email,
        contrasena: form.pwd,
      });
      auth.register({
        idCliente: cliente.idCliente,
        name: cliente.nombre,
        email: cliente.correo,
        dni: cliente.dni,
        phone: form.phone,
      });
      navigate({ to: "/cuenta" });
    } catch {
      setErr("No se pudo crear la cuenta. Revisa DNI/correo o intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto grid max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-elegant">
        <h1 className="font-display text-3xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sumate a CyC Computer y accede a beneficios exclusivos.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <Field label="Nombre completo *" value={form.name} onChange={upd("name")} />
          <Field label="DNI *" value={form.dni} onChange={upd("dni")} maxLength={8} />
          <Field label="Email *" type="email" value={form.email} onChange={upd("email")} />
          <Field label="Telefono" value={form.phone} onChange={upd("phone")} />
          <Field label="Contrasena *" type="password" value={form.pwd} onChange={upd("pwd")} />
          <Field label="Repetir contrasena *" type="password" value={form.pwd2} onChange={upd("pwd2")} />
          <button
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ya tenes cuenta? <Link to="/login" className="text-primary-glow hover:underline">Inicia sesion</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

