import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Cpu, Plus, Trash2, X } from "lucide-react";
import { builderSlots, formatPrice, type ComponentType, type Product } from "@/lib/products";
import { cart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { getProductos } from "@/lib/products-api";
import { addProductoToPcArmada, createPcArmada } from "@/lib/pc-armada-api";

export const Route = createFileRoute("/armar-pc")({
  component: BuilderPage,
  head: () => ({
    meta: [
      { title: "Arma tu PC - CyC Computer" },
      { name: "description", content: "Configura tu PC pieza por pieza con nuestro catalogo de componentes." },
    ],
  }),
});

type Selection = Partial<Record<ComponentType, string>>;

function BuilderPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });
  const [selection, setSelection] = useState<Selection>({});
  const [openSlot, setOpenSlot] = useState<ComponentType | null>(null);
  const [buildName, setBuildName] = useState("Mi PC personalizada");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const byType = useMemo(() => {
    const map = new Map<ComponentType, Product[]>();
    for (const product of products) {
      if (!product.componentType) continue;
      const list = map.get(product.componentType) ?? [];
      list.push(product);
      map.set(product.componentType, list);
    }
    return map;
  }, [products]);

  const selectedProducts = useMemo(() => {
    const result: { type: ComponentType; product: Product }[] = [];
    for (const slot of builderSlots) {
      const id = selection[slot.type];
      if (!id) continue;
      const product = products.find((item) => item.id === id);
      if (product) result.push({ type: slot.type, product });
    }
    return result;
  }, [products, selection]);

  const subtotal = selectedProducts.reduce((sum, item) => sum + item.product.price, 0);
  const assemblyFee = subtotal > 0 ? 49990 : 0;
  const total = subtotal + assemblyFee;
  const requiredFilled = builderSlots.filter((slot) => slot.required).every((slot) => selection[slot.type]);

  const handleAddToCart = async () => {
    if (!requiredFilled) return;
    if (!user?.idCliente) return navigate({ to: "/login" });

    setSaving(true);
    setErr("");
    try {
      const pcArmada = await createPcArmada({
        idCliente: user.idCliente,
        nombre: buildName.trim() || "Mi PC personalizada",
        precio: total,
        stock: 1,
        tipo: "custom",
        descripcion: "PC personalizada armada con el configurador CyC.",
      });

      await Promise.all(
        selectedProducts.map(({ product }) =>
          addProductoToPcArmada({
            idPcArmada: pcArmada.idPcArmada,
            idProducto: Number(product.id),
            cantidad: 1,
          }),
        ),
      );

      await cart.addPcArmada(pcArmada.idPcArmada);
      navigate({ to: "/carrito" });
    } catch {
      setErr("No se pudo guardar la PC personalizada. Revisa la API o intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <p className="container mx-auto px-4 py-12 text-muted-foreground">Cargando componentes...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-10 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-glow">
          <Cpu className="h-3.5 w-3.5" /> PC Builder
        </div>
        <h1 className="font-display text-4xl font-bold md:text-5xl">Arma tu PC</h1>
        <p className="mt-2 text-muted-foreground">
          Elegi cada componente desde el catalogo conectado a la API. Al finalizar se crea una PC armada y se agrega al carrito real.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {builderSlots.map((slot) => {
            const list = byType.get(slot.type) ?? [];
            const selectedId = selection[slot.type];
            const selected = selectedId ? products.find((product) => product.id === selectedId) : null;
            const isOpen = openSlot === slot.type;

            return (
              <div key={slot.type} className="rounded-2xl border border-border bg-gradient-card shadow-card">
                <button
                  type="button"
                  onClick={() => setOpenSlot(isOpen ? null : slot.type)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface text-2xl">
                    {slot.emoji}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{slot.name}</p>
                      {!slot.required && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                          opcional
                        </span>
                      )}
                      {selected && <Check className="h-4 w-4 text-success" />}
                    </div>
                    {selected ? (
                      <p className="text-sm text-muted-foreground">
                        {selected.name} - <span className="text-gradient font-semibold">{formatPrice(selected.price)}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{list.length} opciones disponibles</p>
                    )}
                  </div>
                  <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
                    {selected ? "Cambiar" : "Elegir"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {list.map((product) => {
                        const active = selectedId === product.id;
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSelection((prev) => ({ ...prev, [slot.type]: product.id }));
                              setOpenSlot(null);
                            }}
                            className={`flex gap-3 rounded-xl border p-3 text-left transition-smooth ${
                              active ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-surface/50 hover:border-primary/50"
                            }`}
                          >
                            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface text-3xl">
                              {product.emoji}
                            </span>
                            <div className="flex-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                              <p className="text-sm font-semibold leading-tight">{product.name}</p>
                              <p className="mt-1 font-display text-base font-bold text-gradient">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {selected && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = { ...selection };
                          delete next[slot.type];
                          setSelection(next);
                        }}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" /> Quitar seleccion
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-gradient-card p-6 shadow-card lg:sticky lg:top-20">
          <h2 className="font-display text-xl font-bold">Tu build</h2>
          <label className="mt-4 block text-xs font-medium text-muted-foreground">Nombre de la PC</label>
          <input
            value={buildName}
            onChange={(event) => setBuildName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <div className="mt-4 space-y-2 text-sm">
            {selectedProducts.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
                Empeza eligiendo componentes para ver el resumen.
              </p>
            )}
            {selectedProducts.map(({ type, product }) => {
              const slot = builderSlots.find((item) => item.type === type)!;
              return (
                <div key={type} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{slot.name}</p>
                    <p className="line-clamp-1 text-sm">{product.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...selection };
                        delete next[type];
                        setSelection(next);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Quitar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {subtotal > 0 && (
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Componentes</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Armado profesional</span><span>{formatPrice(assemblyFee)}</span></div>
            </div>
          )}

          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-gradient">{formatPrice(total)}</span>
          </div>

          {!requiredFilled && <p className="mt-3 text-xs text-muted-foreground">Faltan completar los componentes obligatorios.</p>}
          {err && <p className="mt-3 text-xs text-destructive">{err}</p>}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!requiredFilled || saving}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {saving ? "Guardando..." : "Agregar PC al carrito"}
          </button>
        </aside>
      </div>
    </div>
  );
}
