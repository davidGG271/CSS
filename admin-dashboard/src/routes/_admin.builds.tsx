import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, Cpu, Edit, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdmin, formatCurrency, type Product, type ProductCategory } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/builds")({
  component: BuildsPage,
});

const SLOTS: { key: string; label: string; category: ProductCategory; icon: string }[] = [
  { key: "cpu", label: "Procesador", category: "Procesadores", icon: "🧠" },
  { key: "mb", label: "Motherboard", category: "Motherboards", icon: "🔌" },
  { key: "gpu", label: "Tarjeta gráfica", category: "GPUs", icon: "🎮" },
  { key: "ram", label: "Memoria RAM", category: "RAM", icon: "💾" },
  { key: "ssd", label: "Almacenamiento", category: "SSD", icon: "💿" },
  { key: "psu", label: "Fuente de poder", category: "Fuentes", icon: "⚡" },
  { key: "case", label: "Case", category: "Cases", icon: "🗄️" },
  { key: "cool", label: "Refrigeración", category: "Refrigeración", icon: "❄️" },
];

interface SelectedMap { [slotKey: string]: string }

function checkCompatibility(picks: Product[]) {
  const issues: string[] = [];
  const cpu = picks.find((p) => p.category === "Procesadores");
  const mb = picks.find((p) => p.category === "Motherboards");
  const psu = picks.find((p) => p.category === "Fuentes");

  if (cpu && mb && cpu.socket && mb.socket && cpu.socket !== mb.socket) {
    issues.push(`Socket incompatible: CPU ${cpu.socket} vs MB ${mb.socket}`);
  }
  const totalConsumption = picks.reduce((s, p) => s + (p.consumption || 0), 0);
  if (psu && psu.wattage && totalConsumption > psu.wattage * 0.85) {
    issues.push(`Fuente insuficiente: requiere ~${Math.ceil(totalConsumption / 0.85)}W, tienes ${psu.wattage}W`);
  }
  picks.forEach((p) => { if (p.stock === 0) issues.push(`Sin stock: ${p.name}`); });
  return { issues, totalConsumption };
}

function BuildsPage() {
  const products = useAdmin((s) => s.products);
  const builds = useAdmin((s) => s.builds);
  const addBuild = useAdmin((s) => s.addBuild);
  const updateBuild = useAdmin((s) => s.updateBuild);
  const deleteBuild = useAdmin((s) => s.deleteBuild);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [picks, setPicks] = useState<SelectedMap>({});
  const [delId, setDelId] = useState<string | null>(null);

  const pickedProducts = useMemo(
    () => Object.values(picks).map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
    [picks, products],
  );
  const total = pickedProducts.reduce((s, p) => s + p.price, 0);
  const { issues, totalConsumption } = checkCompatibility(pickedProducts);

  const reset = () => { setName(""); setPicks({}); setEditingId(null); };

  const openNew = () => { reset(); setOpen(true); };

  const openEdit = (id: string) => {
    const b = builds.find((x) => x.id === id);
    if (!b) return;
    setEditingId(id);
    setName(b.name);
    const map: SelectedMap = {};
    b.componentIds.forEach((pid) => {
      const p = products.find((x) => x.id === pid);
      if (!p) return;
      const slot = SLOTS.find((s) => s.category === p.category);
      if (slot) map[slot.key] = pid;
    });
    setPicks(map);
    setOpen(true);
  };

  const save = () => {
    if (!name.trim()) { toast.error("Nombre requerido"); return; }
    if (pickedProducts.length === 0) { toast.error("Selecciona al menos un componente"); return; }
    const payload = {
      name,
      componentIds: pickedProducts.map((p) => p.id),
      totalPrice: total,
      estimatedConsumption: totalConsumption,
    };
    if (editingId) {
      updateBuild(editingId, payload);
      toast.success("Build actualizada");
    } else {
      addBuild(payload);
      toast.success("Build creada");
    }
    setOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PCs Armadas"
        description="Configurador de equipos gamer con compatibilidad automática"
        actions={
          <Button onClick={openNew} className="gradient-neon glow text-white">
            <Plus className="mr-1 h-4 w-4" /> Nueva Build
          </Button>
        }
      />

      {builds.length === 0 ? (
        <Card className="glow-card border-dashed border-[var(--neon-purple)]/40">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-neon glow">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-display text-xl">No hay builds aún</h3>
            <p className="max-w-sm text-sm text-muted-foreground">Crea tu primera PC armada combinando componentes del inventario.</p>
            <Button onClick={openNew} className="gradient-neon text-white"><Zap className="mr-1 h-4 w-4" />Crear Build</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((b) => {
            const comps = b.componentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
            return (
              <Card key={b.id} className="glow-card glow-hover border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-lg">{b.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(b.id)}>
                        <Edit className="h-4 w-4 text-[var(--neon-blue)]" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDelId(b.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    {comps.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon-purple)]" />
                        <span className="truncate">{c.name}</span>
                      </div>
                    ))}
                    {comps.length > 4 && <p className="text-xs text-muted-foreground">+{comps.length - 4} más</p>}
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-3">
                    <Badge variant="outline" className="border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)]">
                      {b.estimatedConsumption}W
                    </Badge>
                    <span className="font-display text-lg font-bold text-gradient">{formatCurrency(b.totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Configurator */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-gradient">
              {editingId ? "Editar Build" : "Configurador Gamer"}
            </DialogTitle>
            <DialogDescription>Selecciona componentes del inventario. La compatibilidad se calcula al instante.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre de la build</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. NEONFORGE Apex 7800X3D" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SLOTS.map((slot) => {
                const opts = products.filter((p) => p.category === slot.category && p.status === "Activo");
                const sel = picks[slot.key];
                const selProd = opts.find((p) => p.id === sel);
                return (
                  <div key={slot.key} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <Label className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      <span>{slot.icon}</span> {slot.label}
                    </Label>
                    <Select
                      value={sel || ""}
                      onValueChange={(v) => setPicks({ ...picks, [slot.key]: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Sin seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {opts.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">Sin opciones disponibles</div>}
                        {opts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {formatCurrency(p.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selProd && (
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Stock: {selProd.stock}</span>
                        {selProd.socket && <Badge variant="outline" className="text-[10px]">{selProd.socket}</Badge>}
                        {selProd.wattage && <Badge variant="outline" className="text-[10px]">{selProd.wattage}W</Badge>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Card className="glow-card border-[var(--neon-purple)]/30">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Consumo estimado</span>
                  <Badge className="bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border-[var(--neon-cyan)]/30" variant="outline">
                    {totalConsumption}W
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Componentes</span>
                  <span className="font-medium">{pickedProducts.length}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="font-display text-sm">Total</span>
                  <span className="font-display text-2xl font-bold text-gradient">{formatCurrency(total)}</span>
                </div>

                {issues.length === 0 && pickedProducts.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-[var(--neon-green)]/30 bg-[var(--neon-green)]/10 p-2 text-sm text-[var(--neon-green)]">
                    <Check className="h-4 w-4" /> Configuración compatible
                  </div>
                )}
                {issues.map((i, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-sm text-amber-400">
                    <AlertTriangle className="mt-0.5 h-4 w-4" /> <span>{i}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="gradient-neon text-white">
              {editingId ? "Guardar cambios" : "Crear Build"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar build?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => { if (delId) { deleteBuild(delId); toast.success("Build eliminada"); setDelId(null); } }}
            >Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
