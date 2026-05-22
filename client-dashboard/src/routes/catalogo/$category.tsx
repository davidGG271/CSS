import { createFileRoute, Link, notFound } from "@tanstack/react-router";
/*import { categories, products, type Category } from "@/lib/products";NUEVO*/
import { ProductCard } from "@/components/product-card";

import { useQuery } from "@tanstack/react-query";
import { getProductos } from "@/lib/products-api";
import {
  catalogCategories,
  productMatchesCatalogCategory,
  productMatchesCatalogSubcategory,
  productMatchesSearch,
} from "@/lib/products";


export const Route = createFileRoute("/catalogo/$category")({
  component: CategoryPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tipo: typeof search.tipo === "string" ? search.tipo : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: ({ params }) => ({
    meta: [{ title: `${params.category} — CyC Computer` }],
  }),
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { tipo, q } = Route.useSearch();

  const cat = catalogCategories.find((c) => c.slug === category);
  if (!cat) throw notFound();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error cargando productos.</p>;

  const activeSubcategory = cat.subcategories.includes(tipo ?? "") ? tipo : undefined;
  const list = products
    .filter((p) => productMatchesCatalogCategory(p, cat.slug))
    .filter((p) => !activeSubcategory || productMatchesCatalogSubcategory(p, activeSubcategory))
    .filter((p) => productMatchesSearch(p, q ?? ""));


  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <p className="text-5xl">{cat.emoji}</p>
        <h1 className="mt-2 font-display text-4xl font-bold">{cat.name}</h1>
        <p className="text-muted-foreground">
          {cat.description} · {list.length} productos
          {activeSubcategory ? ` en ${activeSubcategory}` : ""}
          {q ? ` para "${q}"` : ""}
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/catalogo"
          search={q ? { q } : {}}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm transition-smooth hover:border-primary/60"
        >
          Todos
        </Link>
        {catalogCategories.map((c) => (
          <Link
            key={c.slug}
            to="/catalogo/$category"
            params={{ category: c.slug }}
            search={q ? { q } : {}}
            className={`rounded-full border px-4 py-2 text-sm transition-smooth ${c.slug === category
                ? "border-primary bg-primary/10 text-primary-glow"
                : "border-border bg-surface hover:border-primary/60"
              }`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {activeSubcategory && (
          <Link
            to="/catalogo/$category"
            params={{ category: cat.slug }}
            search={q ? { q } : {}}
            className="cursor-pointer rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-glow transition-smooth hover:bg-primary/15"
          >
            Todos los tipos
          </Link>
        )}
        {cat.subcategories.map((sub) => (
          <Link
            key={sub}
            to="/catalogo/$category"
            params={{ category: cat.slug }}
            search={q ? { tipo: sub, q } : { tipo: sub }}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-smooth ${
              activeSubcategory === sub
                ? "border-primary bg-primary/10 text-primary-glow"
                : "border-border bg-surface text-muted-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-primary-glow"
            }`}
          >
            {sub}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center">
          <p className="font-semibold">No se encontraron productos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q
              ? `No hay resultados para "${q}"${activeSubcategory ? ` en ${activeSubcategory}` : ""}.`
              : "Pronto agregaremos productos en esta categoria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
