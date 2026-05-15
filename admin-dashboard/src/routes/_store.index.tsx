import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Cpu, Truck, ShieldCheck, Headphones } from "lucide-react";
import heroImg from "@/assets/hero-pc.jpg";
import { categories } from "@/lib/products";
import { ProductCard } from "@/components/store/product-card";
import { getProductos } from "@/lib/products-api";

export const Route = createFileRoute("/_store/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "CyC Computer — Tecnología que potencia tu mundo" },
      { name: "description", content: "Componentes, periféricos y PCs gamer. Envíos a todo el país y armado profesional." },
    ],
  }),
});

function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });
  const featured = products.slice(0, 4);
  const deals = products.filter((p) => p.oldPrice).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="container relative mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:py-28 md:items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-glow">
              <Cpu className="h-3 w-3" /> Nuevas RTX 50 Series disponibles
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-tight md:text-6xl">
              Construí tu setup <span className="text-gradient">de otro nivel</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Componentes, periféricos y PCs gamer armadas por expertos. Garantía oficial y envíos a todo el país.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
              >
                Explorar catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/catalogo/computadoras"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold transition-smooth hover:border-primary/60"
              >
                PCs armadas
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ["+10K", "Clientes felices"],
                ["15", "Años de experiencia"],
                ["24/7", "Soporte técnico"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="font-display text-2xl font-bold text-gradient">{k}</div>
                  <div className="text-xs text-muted-foreground">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
            <img
              src={heroImg}
              alt="PC gamer con iluminación RGB"
              width={1600}
              height={1024}
              className="relative rounded-2xl shadow-elegant"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto grid gap-4 px-4 py-12 md:grid-cols-4">
        {([
          { Icon: Truck, title: "Envíos 24-48hs", sub: "A todo el país" },
          { Icon: ShieldCheck, title: "Garantía oficial", sub: "Hasta 3 años" },
          { Icon: Cpu, title: "Armado profesional", sub: "Por nuestros técnicos" },
          { Icon: Headphones, title: "Soporte 24/7", sub: "WhatsApp y chat" },
        ] as const).map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary-glow">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold">Explorá por categoría</h2>
          <Link to="/catalogo" className="text-sm text-primary-glow hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/catalogo/$category"
              params={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 transition-smooth hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow"
            >
              <div className="text-5xl">{c.emoji}</div>
              <h3 className="mt-4 font-display text-lg font-semibold">{c.name}</h3>
              <p className="text-sm text-muted-foreground">{c.description}</p>
              <ArrowRight className="mt-4 h-5 w-5 text-primary-glow transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="mb-6 font-display text-3xl font-bold">Productos destacados</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* DEALS */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-3xl border border-primary/30 bg-gradient-card p-8 shadow-elegant">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">Ofertas de la semana</span>
              <h2 className="mt-1 font-display text-3xl font-bold">Promos imperdibles 🔥</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
