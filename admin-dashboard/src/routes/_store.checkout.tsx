import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CreditCard, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { cart, useCart } from "@/lib/cart-store";
import { checkoutCart } from "@/lib/orders-api";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/_store/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Pago - CyC Computer" }] }),
});

function Checkout() {
  const { items, subtotal, activeCartId } = useCart();
  const user = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "pay" | "done">("info");
  const [method, setMethod] = useState<"card" | "transfer" | "mp">("card");
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);

  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 8990;
  const total = subtotal + shipping;

  if (!user?.idCliente && step !== "done") {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-muted-foreground">Necesitas iniciar sesion o crear una cuenta para finalizar la compra.</p>
        <Link to="/login" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Iniciar sesion
        </Link>
      </div>
    );
  }

  if (items.length === 0 && step !== "done") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Tu carrito esta vacio.</p>
        <Link to="/catalogo" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Ver productos
        </Link>
      </div>
    );
  }

  const finish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.idCliente) return setErr("Inicia sesion para finalizar la compra.");
    if (!activeCartId) return setErr("No se encontro un carrito activo.");

    setPaying(true);
    setErr("");
    try {
      await checkoutCart({
        idCliente: user.idCliente,
        idCarrito: activeCartId,
        metodoPago: method,
      });
      cart.clear();
      setStep("done");
      setTimeout(() => navigate({ to: "/" }), 4000);
    } catch {
      setErr("No se pudo confirmar la compra. Revisa el stock o intenta nuevamente.");
    } finally {
      setPaying(false);
    }
  };

  if (step === "done") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-4 font-display text-3xl font-bold">Compra confirmada</h1>
        <p className="mt-2 text-muted-foreground">Tu pedido quedo registrado en la API.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Finalizar compra</h1>

      <div className="mt-4 flex gap-2 text-sm">
        {[["info", "1. Datos"], ["pay", "2. Pago"]].map(([key, label]) => (
          <span key={key} className={`rounded-full px-3 py-1 ${step === key ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-muted-foreground"}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={step === "info" ? (event) => { event.preventDefault(); setStep("pay"); } : finish} className="space-y-6">
          {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

          {step === "info" && (
            <section className="rounded-2xl border border-border bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold">Datos de envio</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre completo" defaultValue={user?.name} required />
                <Field label="Email" type="email" defaultValue={user?.email} required />
                <Field label="Telefono" defaultValue={user?.phone} required />
                <Field label="DNI" defaultValue={user?.dni} required />
                <Field label="Direccion" defaultValue={user?.address} required className="sm:col-span-2" />
                <Field label="Ciudad" defaultValue={user?.city} required />
                <Field label="Codigo postal" required />
              </div>
              <button type="submit" className="mt-6 w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow">
                Continuar al pago
              </button>
            </section>
          )}

          {step === "pay" && (
            <section className="rounded-2xl border border-border bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold">Metodo de pago</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {([
                  ["card", "Tarjeta"],
                  ["mp", "Mercado Pago"],
                  ["transfer", "Transferencia"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={`rounded-lg border p-4 text-left transition-smooth ${
                      method === key ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="mt-1 text-sm font-semibold">{label}</div>
                  </button>
                ))}
              </div>

              {method === "card" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Numero de tarjeta" placeholder="1234 5678 9012 3456" required className="sm:col-span-2" />
                  <Field label="Titular" required />
                  <Field label="Vencimiento" placeholder="MM/AA" required />
                  <Field label="CVV" placeholder="123" required />
                </div>
              )}

              {method !== "card" && (
                <p className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                  El pago quedara registrado con estado aprobado para completar el flujo de prueba.
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep("info")} className="text-sm text-muted-foreground hover:text-foreground">
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                >
                  <Lock className="h-4 w-4" /> {paying ? "Procesando..." : `Pagar ${formatPrice(total)}`}
                </button>
              </div>
            </section>
          )}
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-display text-lg font-bold">Tu pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map(({ product, qty, id }) => (
              <div key={id} className="flex gap-3 text-sm">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-surface text-2xl">{product.emoji}</div>
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">x{qty}</p>
                </div>
                <span className="font-semibold">{formatPrice(product.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Envio</span><span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span></div>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-xl font-bold text-gradient">{formatPrice(total)}</span>
          </div>
          <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3" /> Pago de prueba conectado a la API
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

