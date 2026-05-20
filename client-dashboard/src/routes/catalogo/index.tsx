import { createFileRoute, Link } from "@tanstack/react-router";
/*import { categories, products } from "@/lib/products"; NUEVO*/
import { ProductCard } from "@/components/product-card";

/*NUEVO*/
import { useQuery } from "@tanstack/react-query";
import { catalogCategories, productMatchesSearch } from "@/lib/products";
import { getProductos } from "@/lib/products-api";


export const Route = createFileRoute("/catalogo/")({
  component: Catalog,
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({ meta: [{ title: "Catálogo — CyC Computer" }] }),
});

function Catalog() {
  const { q } = Route.useSearch();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error cargando productos.</p>;

  const list = products.filter((p) => productMatchesSearch(p, q ?? ""));

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold">Catálogo completo</h1>
        <p className="text-muted-foreground">
          {list.length} productos disponibles{q ? ` para "${q}"` : ""}
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/catalogo"
          className="rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary-glow"
        >
          Todos
        </Link>
        {catalogCategories.map((c) => (
          <Link
            key={c.slug}
            to="/catalogo/$category"
            params={{ category: c.slug }}
            search={q ? { q } : {}}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm transition-smooth hover:border-primary/60"
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {catalogCategories.map((c) => (
          <div key={c.slug} className="rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-sm font-semibold">{c.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.subcategories.map((sub) => (
                <Link
                  key={sub}
                  to="/catalogo/$category"
                  params={{ category: c.slug }}
                  search={q ? { tipo: sub, q } : { tipo: sub }}
                  className="cursor-pointer rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition-smooth hover:border-primary/60 hover:bg-primary/10 hover:text-primary-glow"
                >
                  {sub}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
