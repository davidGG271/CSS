import { createFileRoute, Link, notFound } from "@tanstack/react-router";
/*import { categories, products, type Category } from "@/lib/products";NUEVO*/
import { ProductCard } from "@/components/product-card";

import { useQuery } from "@tanstack/react-query";
import { getProductos } from "@/lib/products-api";
import { categories, type Category } from "@/lib/products";


export const Route = createFileRoute("/catalogo/$category")({
  component: CategoryPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.category} — CyC Computer` }],
  }),
});

function CategoryPage() {
  const { category } = Route.useParams();

  const cat = categories.find((c) => c.slug === category);
  if (!cat) throw notFound();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error cargando productos.</p>;

  const list = products.filter((p) => p.category === (category as Category));


  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <p className="text-5xl">{cat.emoji}</p>
        <h1 className="mt-2 font-display text-4xl font-bold">{cat.name}</h1>
        <p className="text-muted-foreground">{cat.description} · {list.length} productos</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/catalogo"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm transition-smooth hover:border-primary/60"
        >
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/catalogo/$category"
            params={{ category: c.slug }}
            className={`rounded-full border px-4 py-2 text-sm transition-smooth ${c.slug === category
                ? "border-primary bg-primary/10 text-primary-glow"
                : "border-border bg-surface hover:border-primary/60"
              }`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-muted-foreground">Pronto agregaremos productos en esta categoría.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
