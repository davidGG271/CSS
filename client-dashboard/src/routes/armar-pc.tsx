import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Cpu, Plus, Trash2, X } from "lucide-react";
import {
  builderSlots,
  formatPrice,
  products,
  type ComponentType,
  type Product,
} from "@/lib/products";
import { cart } from "@/lib/cart-store";

export const Route = createFileRoute("/armar-pc")({
  component: BuilderPage,
  head: () => ({
    meta: [
      { title: "Armá tu PC — CyC Computer" },
      { name: "description", content: "Configurá tu PC pieza por pieza con nuestro catálogo de componentes." },
    ],
  }),
});

type Selection = Partial<Record<ComponentType, string>>;

function BuilderPage() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState<Selection>({});
  const [openSlot, setOpenSlot] = useState<ComponentType | null>(null);
  const [buildName, setBuildName] = useState("Mi PC personalizada");

  const byType = useMemo(() => {
    const map = new Map<ComponentType, Product[]>();
    for (const p of products) {
      if (!p.componentType) continue;
      const list = map.get(p.componentType) ?? [];
      list.push(p);
      map.set(p.componentType, list);
    }
    return map;
  }, []);

  const selectedProducts = useMemo(() => {
    const result: { type: ComponentType; product: Product }[] = [];
    for (const slot of builderSlots) {
      const id = selection[slot.type];
      if (!id) continue;
      const p = products.find((x) => x.id === id);
      if (p) result.push({ type: slot.type, product: p });
    }
    return result;
  }, [selection]);

  const subtotal = selectedProducts.reduce((s, i) => s + i.product.price, 0);
  const assemblyFee = subtotal > 0 ? 49990 : 0;
  const total = subtotal + assemblyFee;

  const requiredFilled = builderSlots
    .filter((s) => s.required)
    .every((s) => selection[s.type]);

  const handleAddToCart = () => {
    if (!requiredFilled) return;
    const specs = selectedProducts.map((s) => ({
      label: builderSlots.find((b) => b.type === s.type)!.name,
      value: s.product.name,
    }));
    cart.addCustom({
      name: buildName.trim() || "Mi PC personalizada",
      brand: "CyC Custom Build",
      price: total,
      emoji: "🛠️",
      description: "PC personalizada armada con el configurador CyC.",
      specs,
    });
    navigate({ to: "/carrito" });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-10 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-glow">
          <Cpu className="h-3.5 w-3.5" /> PC Builder
        </div>
        <h1 className="font-display text-4xl font-bold md:text-5xl">Armá tu PC</h1>
        <p className="mt-2 text-muted-foreground">
          Elegí cada componente de nuestro catálogo. Al finalizar, tu PC se sumará al carrito como un producto único listo para comprar.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {builderSlots.map((slot) => {
            const list = byType.get(slot.type) ?? [];
            const selectedId = selection[slot.type];
            const selected = selectedId ? products.find((p) => p.id === selectedId) : null;
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
                        {selected.name} · <span className="text-gradient font-semibold">{formatPrice(selected.price)}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {list.length} opciones disponibles
                      </p>
                    )}
                  </div>
                  <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
                    {selected ? "Cambiar" : "Elegir"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {list.map((p) => {
                        const active = selectedId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelection((prev) => ({ ...prev, [slot.type]: p.id }));
                              setOpenSlot(null);
                            }}
                            className={`flex gap-3 rounded-xl border p-3 text-left transition-smooth ${
                              active
                                ? "border-primary bg-primary/10 shadow-glow"
                                : "border-border bg-surface/50 hover:border-primary/50"
                            }`}
                          >
                            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-surface text-3xl">
                              {p.emoji}
                            </span>
                            <div className="flex-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.brand}</p>
                              <p className="text-sm font-semibold leading-tight">{p.name}</p>
                              <p className="mt-1 font-display text-base font-bold text-gradient">
                                {formatPrice(p.price)}
                              </p>
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
                        <X className="h-3 w-3" /> Quitar selección
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

          <label className="mt-4 block text-xs font-medium text-muted-foreground">
            Nombre de la PC
          </label>
          <input
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <div className="mt-4 space-y-2 text-sm">
            {selectedProducts.length === 0 && (
              <p className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
                Empezá eligiendo componentes para ver el resumen.
              </p>
            )}
            {selectedProducts.map(({ type, product }) => {
              const slot = builderSlots.find((s) => s.type === type)!;
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Componentes</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Armado profesional</span>
                <span>{formatPrice(assemblyFee)}</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-gradient">{formatPrice(total)}</span>
          </div>

          {!requiredFilled && (
            <p className="mt-3 text-xs text-muted-foreground">
              Faltan completar los componentes obligatorios.
            </p>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!requiredFilled}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Agregar PC al carrito
          </button>
        </aside>
      </div>
    </div>
  );
}
