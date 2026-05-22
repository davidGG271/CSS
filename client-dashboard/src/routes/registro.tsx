import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AxiosError } from "axios";
import { auth } from "@/lib/auth-store";
import { createCliente } from "@/lib/clients-api";

export const Route = createFileRoute("/registro")({
  component: Register,
  head: () => ({ meta: [{ title: "Crear cuenta - CyC Computer" }] }),
});

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", dni: "", email: "", pwd: "", pwd2: "" });
  const [touched, setTouched] = useState<Record<keyof typeof form, boolean>>({
    name: false,
    dni: false,
    email: false,
    pwd: false,
    pwd2: false,
  });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const upd = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value });

  const markTouched = (key: keyof typeof form) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const fieldErrors = {
    name: !form.name.trim() ? "Ingresa tu nombre completo" : "",
    dni: !form.dni ? "Ingresa tu DNI" : !/^\d{8}$/.test(form.dni) ? "El DNI debe tener 8 digitos" : "",
    email: !form.email
      ? "Ingresa tu correo"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ? "Ingresa un correo valido"
        : "",
    pwd: !form.pwd
      ? "Ingresa una contrasena"
      : form.pwd.length < 6
        ? "La contrasena debe tener al menos 6 caracteres"
        : "",
    pwd2: !form.pwd2
      ? "Repite la contrasena"
      : form.pwd !== form.pwd2
        ? "Las contrasenas no coinciden"
        : "",
  };

  const visibleError = (key: keyof typeof form) => {
    const shouldShow = touched[key] || Boolean(form[key]);
    return shouldShow ? fieldErrors[key] : "";
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, dni: true, email: true, pwd: true, pwd2: true });

    const firstError = Object.values(fieldErrors).find(Boolean);
    if (firstError) {
      setSuccess("");
      setErr("Revisa los campos marcados antes de continuar.");
      return;
    }

    setLoading(true);
    setErr("");
    setSuccess("");
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
      });
      setSuccess("Cuenta creada correctamente. Redirigiendo al inicio...");
      setTimeout(() => navigate({ to: "/" }), 1200);
    } catch (error) {
      const response = error instanceof AxiosError ? error.response?.data : null;
      const message = Array.isArray(response?.message) ? response.message[0] : response?.message;
      setErr(message ?? "No se pudo crear la cuenta. Revisa DNI/correo o intenta nuevamente.");
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
          {success && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{success}</p>}
          <Field label="Nombre completo *" value={form.name} onChange={upd("name")} onBlur={markTouched("name")} error={visibleError("name")} />
          <Field label="DNI *" value={form.dni} onChange={upd("dni")} onBlur={markTouched("dni")} maxLength={8} error={visibleError("dni")} />
          <Field label="Email *" type="email" value={form.email} onChange={upd("email")} onBlur={markTouched("email")} error={visibleError("email")} />
          <Field label="Contrasena *" type="password" value={form.pwd} onChange={upd("pwd")} onBlur={markTouched("pwd")} error={visibleError("pwd")} />
          <Field label="Repetir contrasena *" type="password" value={form.pwd2} onChange={upd("pwd2")} onBlur={markTouched("pwd2")} error={visibleError("pwd2")} />
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

function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-smooth focus:ring-2 ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/30"
            : "border-input focus:border-primary focus:ring-primary/30"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
