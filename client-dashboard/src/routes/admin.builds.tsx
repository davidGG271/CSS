import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, Cpu, Edit, Plus, Trash2, Zap, Upload } from "lucide-react";
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
import { formatCurrency, type Product, type ProductCategory } from "@/lib/store";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getPcArmadas, createPcArmada, createPcArmadaProducto, updatePcArmadaStock, deletePcArmada, updateProduct, updatePcArmada, BackendPcArmada } from "@/lib/admin-api";
import { compressImage } from "@/lib/image-utils";

export const Route = createFileRoute("/admin/builds")({
  component: BuildsPage,
});

const SLOTS: { key: string; label: string; type: string; icon: string }[] = [
  { key: "cpu", label: "Procesador", type: "Procesadores", icon: "🧠" },
  { key: "mb", label: "Placa Madre", type: "Placas Madres", icon: "🔌" },
  { key: "gpu", label: "Tarjeta gráfica", type: "Tarjetas Graficas", icon: "🎮" },
  { key: "ram", label: "Memoria RAM", type: "Memorias Ram", icon: "💾" },
  { key: "ssd", label: "Almacenamiento", type: "Almacenamiento", icon: "💿" },
  { key: "psu", label: "Fuente de poder", type: "Fuente", icon: "⚡" },
  { key: "case", label: "Case", type: "Case", icon: "🗄️" },
  { key: "cool", label: "Refrigeración", type: "Sistema de Refrigeracion", icon: "❄️" },
];

interface SelectedMap { [slotKey: string]: string }

function checkCompatibility(picks: Product[]) {
  const issues: string[] = [];
  const cpu = picks.find((p) => p.type === "Procesadores");
  const mb = picks.find((p) => p.type?.startsWith("Placa"));
  const psu = picks.find((p) => p.type === "Fuente");

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
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery({ queryKey: ["productos"], queryFn: getProducts });
  const { data: builds = [] } = useQuery({ queryKey: ["pc-armadas"], queryFn: getPcArmadas });

  const userStr = localStorage.getItem("cyc-user");
  const user = userStr ? JSON.parse(userStr) : null;
  const currentAdminId = user?.rol === "ADMIN" ? user.id : 1;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string>("");
  const [picks, setPicks] = useState<SelectedMap>({});
  const [delId, setDelId] = useState<string | null>(null);

  const handleImage = async (file?: File) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 0.4);
      setImage(compressed);
    } catch (e) {
      console.error(e);
      toast.error("Error al procesar la imagen");
    }
  };

  const pickedProducts = useMemo(
    () => Object.values(picks).map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
    [picks, products],
  );
  const total = pickedProducts.reduce((s, p) => s + p.price, 0);
  const { issues, totalConsumption } = checkCompatibility(pickedProducts);

  const reset = () => { setName(""); setImage(""); setPicks({}); setEditingId(null); };

  const openNew = () => { reset(); setOpen(true); };

  const openEdit = (id: string | number) => {
    const b = builds.find((x) => String(x.idPcArmada) === String(id));
    if (!b) return;
    setEditingId(String(id));
    setName(b.nombre);
    setImage(b.imagen || "");
    const map: SelectedMap = {};
    (b.productos || []).forEach((prodRel) => {
      const p = products.find((x) => String(x.id) === String(prodRel.idProducto));
      if (!p) return;
      const slot = SLOTS.find((s) => p.type && (s.type === p.type || (s.key === "mb" && p.type.startsWith("Placa"))));
      if (slot) map[slot.key] = p.id;
    });
    setPicks(map);
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: { name: string, image: string, pickedProducts: Product[], total: number, estimatedConsumption: number, isEdit: boolean }) => {
      if (payload.isEdit) {
        // En edición, solo actualizamos nombre e imagen
        await updatePcArmada(Number(editingId), {
          nombre: payload.name,
          imagen: payload.image,
        });
        return;
      }

      for (const p of payload.pickedProducts) {
        if (p.stock < 1) throw new Error(`Sin stock para: ${p.name}`);
      }

      const newPc = await createPcArmada({
        idAdmin: currentAdminId,
        nombre: payload.name,
        precio: payload.total,
        stock: 1,
        tipo: "Catálogo",
        imagen: payload.image,
        descripcion: `Consumo: ${payload.estimatedConsumption}W`,
      });

      for (const p of payload.pickedProducts) {
        await createPcArmadaProducto({
          idPcArmada: newPc.idPcArmada!,
          idProducto: Number(p.id),
          cantidad: 1,
        });
        await updateProduct(p.id, { stock: p.stock - 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pc-armadas"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("PC Armada guardada");
      setOpen(false);
      reset();
    },
    onError: (e: any) => toast.error(e.message || "Error al guardar")
  });

  const stockMutation = useMutation({
    mutationFn: async ({ pc, delta }: { pc: BackendPcArmada, delta: number }) => {
      const newStock = pc.stock + delta;
      if (newStock < 0) throw new Error("El stock no puede ser negativo");
      
      if (delta > 0) {
        for (const prodRel of pc.productos || []) {
          const fullProd = products.find(p => String(p.id) === String(prodRel.idProducto));
          if (!fullProd || fullProd.stock < prodRel.cantidad * delta) {
            throw new Error(`Stock insuficiente para: ${fullProd?.name || 'Desconocido'}`);
          }
        }
        for (const prodRel of pc.productos || []) {
          const fullProd = products.find(p => String(p.id) === String(prodRel.idProducto));
          await updateProduct(fullProd!.id, { stock: fullProd!.stock - (prodRel.cantidad * delta) });
        }
      } else if (delta < 0) {
        for (const prodRel of pc.productos || []) {
          const fullProd = products.find(p => String(p.id) === String(prodRel.idProducto));
          if (fullProd) {
            await updateProduct(fullProd.id, { stock: fullProd.stock + (prodRel.cantidad * Math.abs(delta)) });
          }
        }
      }
      await updatePcArmadaStock(pc.idPcArmada!, newStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pc-armadas"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
    onError: (e: any) => toast.error(e.message || "Error al actualizar stock")
  });

  const deleteMutation = useMutation({
    mutationFn: async (idStr: string) => {
      const pc = builds.find(x => String(x.idPcArmada) === idStr);
      if (!pc) return;
      if (pc.stock > 0) {
        for (const prodRel of pc.productos || []) {
          const fullProd = products.find(p => String(p.id) === String(prodRel.idProducto));
          if (fullProd) {
            await updateProduct(fullProd.id, { stock: fullProd.stock + (prodRel.cantidad * pc.stock) });
          }
        }
      }
      await deletePcArmada(pc.idPcArmada!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pc-armadas"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      toast.success("PC Armada eliminada");
      setDelId(null);
    },
    onError: () => toast.error("Error al eliminar la PC Armada")
  });

  const save = () => {
    if (!name.trim()) { toast.error("Nombre requerido"); return; }
    if (!editingId && pickedProducts.length === 0) { toast.error("Selecciona al menos un componente"); return; }
    saveMutation.mutate({
      name, image, pickedProducts, total, estimatedConsumption: totalConsumption, isEdit: !!editingId
    });
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
            const comps = (b.productos || []).map((rel) => products.find((p) => String(p.id) === String(rel.idProducto))).filter(Boolean) as Product[];
            return (
              <Card key={b.idPcArmada} className="glow-card glow-hover border-border/50 flex flex-col">
                {b.imagen && (
                  <div className="h-40 w-full overflow-hidden rounded-t-xl bg-muted">
                    <img src={b.imagen} alt={b.nombre} className="h-full w-full object-cover transition hover:scale-105" />
                  </div>
                )}
                <CardHeader className={b.imagen ? "pt-4" : ""}>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-lg">{b.nombre}</CardTitle>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(b.idPcArmada!)}>
                        <Edit className="h-4 w-4 text-[var(--neon-blue)]" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDelId(String(b.idPcArmada))}>
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
                    <div className="flex items-center gap-2">
                      <Button size="icon" className="h-7 w-7 bg-muted/30 border-border/50 hover:bg-muted" variant="outline" onClick={() => stockMutation.mutate({ pc: b, delta: -1 })} disabled={stockMutation.isPending}>-</Button>
                      <span className="text-sm font-medium w-4 text-center">{b.stock}</span>
                      <Button size="icon" className="h-7 w-7 bg-muted/30 border-border/50 hover:bg-muted" variant="outline" onClick={() => stockMutation.mutate({ pc: b, delta: 1 })} disabled={stockMutation.isPending}>+</Button>
                    </div>
                    <span className="font-display text-lg font-bold text-gradient">{formatCurrency(b.precio)}</span>
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
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. CyC Apex 7800X3D" />
            </div>

            <div className="space-y-1.5">
              <Label>Imagen</Label>
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--neon-purple)]/40 bg-muted/30 p-6 transition hover:border-[var(--neon-purple)] hover:bg-muted/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleImage(e.dataTransfer.files?.[0]);
                }}
              >
                {image ? (
                  <img src={image} alt="preview" className="max-h-32 rounded-lg" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[var(--neon-purple)]" />
                    <span className="text-sm text-muted-foreground">Arrastra o haz click para subir</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0] || undefined)} />
              </label>
              <Input
                placeholder="O pega una URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SLOTS.map((slot) => {
                const opts = products.filter((p) => p.status === "Activo" && p.type && (p.type === slot.type || (slot.key === "mb" && p.type.startsWith("Placa"))));
                const sel = picks[slot.key];
                const selProd = opts.find((p) => String(p.id) === String(sel));
                return (
                  <div 
                    key={slot.key} 
                    className="rounded-xl border border-border/50 bg-muted/30 p-3 opacity-90 transition-opacity hover:opacity-100"
                    onClickCapture={(e) => {
                      if (!!editingId) {
                        e.preventDefault();
                        e.stopPropagation();
                        toast.error("No se pueden editar los componentes de una PC creada, por favor cree otra nueva pc con los componentes que desea", { duration: 4000 });
                      }
                    }}
                  >
                    <Label className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      <span>{slot.icon}</span> {slot.label}
                    </Label>
                    <Select
                      value={String(sel || "")}
                      onValueChange={(v) => setPicks({ ...picks, [slot.key]: v })}
                      disabled={!!editingId}
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
            <Button onClick={save} className="gradient-neon text-white" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : editingId ? "Guardar cambios" : "Crear Build"}
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
              onClick={() => { if (delId) { deleteMutation.mutate(delId); } }}
              disabled={deleteMutation.isPending}
            >{deleteMutation.isPending ? "Eliminando..." : "Eliminar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

