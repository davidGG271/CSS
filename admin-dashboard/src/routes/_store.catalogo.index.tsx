import { createFileRoute, Link } from "@tanstack/react-router";
/*import { categories, products } from "@/lib/products"; NUEVO*/
import { ProductCard } from "@/components/store/product-card";

/*NUEVO*/
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/lib/products";
import { getProductos } from "@/lib/products-api";


export const Route = createFileRoute("/_store/catalogo/")({
  component: Catalog,
  head: () => ({ meta: [{ title: "Catálogo — CyC Computer" }] }),
});

function Catalog() {

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error cargando productos.</p>;


  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold">Catálogo completo</h1>
        <p className="text-muted-foreground">{products.length} productos disponibles</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/catalogo"
          className="rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary-glow"
        >
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/catalogo/$category"
            params={{ category: c.slug }}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm transition-smooth hover:border-primary/60"
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

