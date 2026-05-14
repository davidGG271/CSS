import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, User as UserIcon, Package, MapPin } from "lucide-react";
import { auth, useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/cuenta")({
  component: Account,
  head: () => ({ meta: [{ title: "Mi cuenta — CyC Computer" }] }),
});

function Account() {
  const user = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
    });
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <p>Ingresá para ver tu cuenta.</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    auth.update(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mi cuenta</p>
            <h1 className="font-display text-3xl font-bold">Hola, {user.name}</h1>
          </div>
        </div>
        <button
          onClick={() => { auth.logout(); navigate({ to: "/" }); }}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm transition-smooth hover:border-destructive/60 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <nav className="rounded-2xl border border-border bg-gradient-card p-2 lg:col-span-1">
          {([
            { Icon: UserIcon, label: "Datos personales", active: true },
            { Icon: Package, label: "Mis pedidos", active: false },
            { Icon: MapPin, label: "Direcciones", active: false },
          ] as const).map(({ Icon, label, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-smooth ${
                active ? "bg-primary/15 text-primary-glow" : "text-muted-foreground hover:bg-surface"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        <form onSubmit={save} className="rounded-2xl border border-border bg-gradient-card p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Datos personales</h2>
          <p className="text-sm text-muted-foreground">Actualizá tu información de contacto y envío.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" value={form.name} onChange={upd("name")} />
            <Field label="Email" type="email" value={form.email} onChange={upd("email")} />
            <Field label="Teléfono" value={form.phone} onChange={upd("phone")} />
            <Field label="Ciudad" value={form.city} onChange={upd("city")} />
            <Field label="Dirección" value={form.address} onChange={upd("address")} className="sm:col-span-2" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              Guardar cambios
            </button>
            {saved && <span className="text-sm text-success">✓ Guardado</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, className = "", ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
