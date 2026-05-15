import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import { useState } from "react";
/*import { products, formatPrice } from "@/lib/products"; NUEVO*/
import { cart } from "@/lib/cart-store";

/* NUEVO */
import { useQuery } from "@tanstack/react-query";
import { getProductoById } from "@/lib/products-api";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/producto/$id")({
  component: ProductPage,
  head: () => ({
    meta: [{ title: "Producto — CyC Computer" }],
  }),
});

function ProductPage() {
  const { id } = Route.useParams();

  /*NUEVO*/
  const { data: p, isLoading, error } = useQuery({
    queryKey: ["producto", id],
    queryFn: () => getProductoById(id),
  });

  if (isLoading) return <p>Cargando producto...</p>;
  if (error || !p) return <p>No se pudo cargar el producto.</p>;

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    cart.add(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/catalogo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-elegant">
          <div className="absolute inset-0 grid-noise opacity-30" />
          <div className="absolute inset-0 grid place-items-center text-[14rem]">{p.emoji}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-primary-glow">{p.brand}</p>
          <h1 className="mt-2 font-display text-4xl font-bold">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" /> {p.rating}
            </span>
            <span>·</span>
            <span className="text-success">{p.stock} disponibles</span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            {p.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(p.oldPrice)}</span>
            )}
            <span className="font-display text-4xl font-bold text-gradient">{formatPrice(p.price)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">o 12 cuotas sin interés</p>

          <p className="mt-6 text-muted-foreground">{p.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {p.specs.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface px-3 py-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="text-sm font-medium">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border bg-surface">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-lg">−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-lg">+</button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
            >
              {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary-glow" /> Envío gratis en 24-48hs</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-glow" /> Garantía oficial 1 año</span>
          </div>
        </div>
      </div>
    </div>
  );
}
