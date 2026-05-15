import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";
import { cart } from "@/lib/cart-store";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow">
      {product.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
          {product.badge}
        </span>
      )}
      <Link to="/producto/$id" params={{ id: product.id }} className="flex-1">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-surface to-background">
          <div className="absolute inset-0 grid-noise opacity-30" />
          <div className="absolute inset-0 grid place-items-center text-7xl transition-transform duration-500 group-hover:scale-110">
            {product.emoji}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">{product.name}</h3>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {product.rating} · {product.stock} en stock
          </div>
        </div>
      </Link>
      <div className="flex items-end justify-between gap-2 px-4 pb-4">
        <div>
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p>
          )}
          <p className="font-display text-lg font-bold text-gradient">{formatPrice(product.price)}</p>
        </div>
        <button
          onClick={() => cart.add(product)}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-smooth hover:bg-primary-glow"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
