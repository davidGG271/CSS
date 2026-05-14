import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart, cart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/carrito")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Carrito — CyC Computer" }] }),
});

function CartPage() {
  const { items, subtotal, count } = useCart();
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 8990;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold">Tu carrito</h1>
      <p className="text-muted-foreground">{count} {count === 1 ? "producto" : "productos"}</p>

      {items.length === 0 ? (
        <div className="mt-12 grid place-items-center rounded-2xl border border-dashed border-border bg-surface/40 p-16 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">Tu carrito está vacío</p>
          <p className="text-sm text-muted-foreground">Descubrí componentes y PCs increíbles en nuestro catálogo.</p>
          <Link
            to="/catalogo"
            className="mt-6 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map(({ id, product, qty, isCustom }) => (
              <div key={id} className="flex gap-4 rounded-xl border border-border bg-gradient-card p-4">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-surface text-5xl">
                  {product.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                  {isCustom ? (
                    <p className="font-semibold">{product.name}</p>
                  ) : (
                    <Link to="/producto/$id" params={{ id: product.id }} className="font-semibold hover:text-primary-glow">
                      {product.name}
                    </Link>
                  )}
                  {isCustom && (
                    <ul className="mt-1 text-xs text-muted-foreground">
                      {product.specs.slice(0, 4).map((s) => (
                        <li key={s.label}>· {s.label}: {s.value}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1 font-display text-lg font-bold text-gradient">{formatPrice(product.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => cart.remove(id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center rounded-lg border border-border bg-surface">
                    <button onClick={() => cart.setQty(id, qty - 1)} className="px-2 py-1">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                    <button onClick={() => cart.setQty(id, qty + 1)} className="px-2 py-1">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-gradient-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold">Resumen</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span></div>
              {shipping === 0 && subtotal > 0 && <p className="text-xs text-success">¡Envío gratis aplicado!</p>}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-bold text-gradient">{formatPrice(total)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block rounded-lg bg-gradient-primary py-3 text-center font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
            >
              Continuar al pago
            </Link>
            <Link to="/catalogo" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
