import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { auth } from "@/lib/auth-store";

export const Route = createFileRoute("/registro")({
  component: Register,
  head: () => ({ meta: [{ title: "Crear cuenta — CyC Computer" }] }),
});

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", pwd: "", pwd2: "" });
  const [err, setErr] = useState("");

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.pwd) return setErr("Completá los campos obligatorios");
    if (form.pwd !== form.pwd2) return setErr("Las contraseñas no coinciden");
    auth.register({ name: form.name, email: form.email, phone: form.phone });
    navigate({ to: "/cuenta" });
  };

  return (
    <div className="container mx-auto grid max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-elegant">
        <h1 className="font-display text-3xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sumate a CyC Computer y accedé a beneficios exclusivos.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <Field label="Nombre completo *" value={form.name} onChange={upd("name")} />
          <Field label="Email *" type="email" value={form.email} onChange={upd("email")} />
          <Field label="Teléfono" value={form.phone} onChange={upd("phone")} />
          <Field label="Contraseña *" type="password" value={form.pwd} onChange={upd("pwd")} />
          <Field label="Repetir contraseña *" type="password" value={form.pwd2} onChange={upd("pwd2")} />
          <button className="mt-2 w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90">
            Crear cuenta
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta? <Link to="/login" className="text-primary-glow hover:underline">Iniciá sesión</Link>
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
