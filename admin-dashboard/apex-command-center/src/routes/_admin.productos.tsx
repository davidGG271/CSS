import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Edit, Eye, Plus, Search, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/PageHeader";
import { PRODUCT_CATEGORIES, formatCurrency, useAdmin, type Product, type ProductCategory } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/productos")({
  component: ProductsPage,
});

const empty: Omit<Product, "id"> = {
  name: "",
  brand: "",
  category: "Procesadores",
  type: "",
  price: 0,
  stock: 0,
  description: "",
  image: "",
  status: "Activo",
  discount: 0,
};

function ProductsPage() {
  const products = useAdmin((s) => s.products);
  const addProduct = useAdmin((s) => s.addProduct);
  const updateProduct = useAdmin((s) => s.updateProduct);
  const deleteProduct = useAdmin((s) => s.deleteProduct);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(empty);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = filterCat === "all" || p.category === filterCat;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, search, filterCat]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setOpen(true);
  };
  const openView = (p: Product) => {
    setViewing(p);
    setViewOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }
    if (editing) {
      updateProduct(editing.id, form);
      toast.success("Producto actualizado", { description: form.name });
    } else {
      addProduct(form);
      toast.success("Producto creado", { description: form.name });
    }
    setOpen(false);
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo completo de hardware y periféricos"
        actions={
          <Button onClick={openCreate} className="gradient-neon glow text-white hover:opacity-90">
            <Plus className="mr-1 h-4 w-4" /> Nuevo producto
          </Button>
        }
      />

      <Card className="glow-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glow-card border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-16">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
                        {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.brand}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[var(--neon-purple)]/40 text-[var(--neon-purple)]">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.type}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(p.price)}</TableCell>
                    <TableCell className="text-center">
                      <span className={p.stock === 0 ? "text-destructive" : p.stock <= 3 ? "text-[var(--neon-pink)]" : ""}>
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.status === "Activo"
                            ? "bg-[var(--neon-green)]/15 text-[var(--neon-green)] border-[var(--neon-green)]/30"
                            : "bg-muted text-muted-foreground"
                        }
                        variant="outline"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openView(p)} aria-label="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label="Editar">
                          <Edit className="h-4 w-4 text-[var(--neon-blue)]" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDelId(p.id)} aria-label="Eliminar">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                      No se encontraron productos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-gradient">
              {editing ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
            <DialogDescription>Completa la información del producto.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de componente</Label>
                <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Ej. CPU, GPU, NVMe..." />
              </div>
              <div className="space-y-1.5">
                <Label>Precio</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Descuento (%)</Label>
                <Input type="number" min={0} max={100} value={form.discount} onChange={(e) => setForm({ ...form, discount: +e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Product["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
                {form.image ? (
                  <img src={form.image} alt="preview" className="max-h-32 rounded-lg" />
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
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="gradient-neon text-white">
                {editing ? "Guardar cambios" : "Crear producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{viewing.name}</DialogTitle>
                <DialogDescription>{viewing.brand} · {viewing.category}</DialogDescription>
              </DialogHeader>
              {viewing.image && (
                <img src={viewing.image} alt={viewing.name} className="aspect-video w-full rounded-xl object-cover" />
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Precio</p><p className="font-semibold">{formatCurrency(viewing.price)}</p></div>
                <div><p className="text-muted-foreground">Stock</p><p className="font-semibold">{viewing.stock}</p></div>
                <div><p className="text-muted-foreground">Tipo</p><p>{viewing.type}</p></div>
                <div><p className="text-muted-foreground">Descuento</p><p>{viewing.discount}%</p></div>
              </div>
              <p className="text-sm text-muted-foreground">{viewing.description}</p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (delId) {
                  deleteProduct(delId);
                  toast.success("Producto eliminado");
                  setDelId(null);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
