import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { useCart, cart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Pago — CyC Computer" }] }),
});

function Checkout() {
  const { items, subtotal } = useCart();
  const user = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "pay" | "done">("info");
  const [method, setMethod] = useState<"card" | "transfer" | "mp">("card");

  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 8990;
  const total = subtotal + shipping;

  if (items.length === 0 && step !== "done") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Link to="/catalogo" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Ver productos
        </Link>
      </div>
    );
  }

  const finish = (e: React.FormEvent) => {
    e.preventDefault();
    cart.clear();
    setStep("done");
    setTimeout(() => navigate({ to: "/" }), 4000);
  };

  if (step === "done") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-4 font-display text-3xl font-bold">¡Compra confirmada!</h1>
        <p className="mt-2 text-muted-foreground">Recibirás un correo con los detalles de tu pedido.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Finalizar compra</h1>

      <div className="mt-4 flex gap-2 text-sm">
        {[["info", "1. Datos"], ["pay", "2. Pago"]].map(([k, l]) => (
          <span key={k} className={`rounded-full px-3 py-1 ${step === k ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-muted-foreground"}`}>
            {l}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={step === "info" ? (e) => { e.preventDefault(); setStep("pay"); } : finish} className="space-y-6">
          {step === "info" && (
            <section className="rounded-2xl border border-border bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold">Datos de envío</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre completo" defaultValue={user?.name} required />
                <Field label="Email" type="email" defaultValue={user?.email} required />
                <Field label="Teléfono" defaultValue={user?.phone} required />
                <Field label="DNI" required />
                <Field label="Dirección" defaultValue={user?.address} required className="sm:col-span-2" />
                <Field label="Ciudad" defaultValue={user?.city} required />
                <Field label="Código postal" required />
              </div>
              <button type="submit" className="mt-6 w-full rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow">
                Continuar al pago
              </button>
            </section>
          )}

          {step === "pay" && (
            <section className="rounded-2xl border border-border bg-gradient-card p-6">
              <h2 className="font-display text-xl font-bold">Método de pago</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {([
                  ["card", "💳", "Tarjeta"],
                  ["mp", "🏦", "Mercado Pago"],
                  ["transfer", "🏛️", "Transferencia"],
                ] as const).map(([k, e, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setMethod(k)}
                    className={`rounded-lg border p-4 text-left transition-smooth ${
                      method === k ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="text-2xl">{e}</div>
                    <div className="mt-1 text-sm font-semibold">{l}</div>
                  </button>
                ))}
              </div>

              {method === "card" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Número de tarjeta" placeholder="1234 5678 9012 3456" required className="sm:col-span-2" />
                  <Field label="Titular" required />
                  <Field label="Vencimiento" placeholder="MM/AA" required />
                  <Field label="CVV" placeholder="123" required />
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Cuotas</span>
                    <select
                      required
                      defaultValue="1"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-smooth focus:border-primary focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="1">1 cuota sin interés</option>
                      <option value="3">3 cuotas sin interés</option>
                      <option value="6">6 cuotas sin interés</option>
                      <option value="12">12 cuotas con interés</option>
                      <option value="18">18 cuotas con interés</option>
                    </select>
                  </label>
                </div>
              )}
              {method === "transfer" && (
                <p className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                  Te enviaremos los datos bancarios por email. Tu pedido se procesará al confirmar el pago.
                </p>
              )}
              {method === "mp" && (
                <p className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                  Serás redirigido a Mercado Pago para completar la compra de forma segura.
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep("info")} className="text-sm text-muted-foreground hover:text-foreground">
                  ← Volver
                </button>
                <button type="submit" className="flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow">
                  <Lock className="h-4 w-4" /> Pagar {formatPrice(total)}
                </button>
              </div>
            </section>
          )}
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-display text-lg font-bold">Tu pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-3 text-sm">
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
            <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span></div>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-xl font-bold text-gradient">{formatPrice(total)}</span>
          </div>
          <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3" /> Pago 100% seguro y encriptado
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
