import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdmin } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventario")({
  component: InventoryPage,
});

function InventoryPage() {
  const products = useAdmin((s) => s.products);
  const movements = useAdmin((s) => s.movements);
  const addMovement = useAdmin((s) => s.addMovement);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", type: "Entrada" as "Entrada" | "Salida", quantity: 1, reason: "" });

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3);
  const outOfStock = products.filter((p) => p.stock === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Stock en tiempo real y movimientos"
        actions={
          <Button onClick={() => setOpen(true)} className="gradient-neon text-white">
            <Plus className="mr-1 h-4 w-4" /> Registrar movimiento
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="glow-card border-border/50">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--neon-pink)]/15">
              <AlertTriangle className="h-6 w-6 text-[var(--neon-pink)]" />
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Stock bajo</p>
              <p className="font-display text-2xl font-bold">{lowStock.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glow-card border-border/50">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-destructive/15">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Agotados</p>
              <p className="font-display text-2xl font-bold">{outOfStock.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glow-card border-border/50">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--neon-green)]/15">
              <ArrowDownToLine className="h-6 w-6 text-[var(--neon-green)]" />
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Movimientos</p>
              <p className="font-display text-2xl font-bold">{movements.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glow-card border-border/50">
          <CardHeader><CardTitle className="font-display">Stock por producto</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} className="border-border/30">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-center">{p.stock}</TableCell>
                    <TableCell>
                      {p.stock === 0 ? (
                        <Badge variant="outline" className="border-destructive/30 text-destructive">Agotado</Badge>
                      ) : p.stock <= 3 ? (
                        <Badge variant="outline" className="border-[var(--neon-pink)]/30 text-[var(--neon-pink)]">Bajo</Badge>
                      ) : (
                        <Badge variant="outline" className="border-[var(--neon-green)]/30 text-[var(--neon-green)]">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glow-card border-border/50">
          <CardHeader><CardTitle className="font-display">Historial de movimientos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id} className="border-border/30">
                    <TableCell className="text-muted-foreground text-xs">{m.date}</TableCell>
                    <TableCell>{m.productName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={m.type === "Entrada" ? "border-[var(--neon-green)]/30 text-[var(--neon-green)]" : "border-[var(--neon-pink)]/30 text-[var(--neon-pink)]"}>
                        {m.type === "Entrada" ? <ArrowDownToLine className="mr-1 inline h-3 w-3" /> : <ArrowUpFromLine className="mr-1 inline h-3 w-3" />}
                        {m.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{m.quantity}</TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">Sin movimientos.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Registrar movimiento</DialogTitle></DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.productId) { toast.error("Selecciona producto"); return; }
              const p = products.find((x) => x.id === form.productId)!;
              addMovement({ ...form, productName: p.name });
              toast.success("Movimiento registrado");
              setOpen(false);
              setForm({ productId: "", type: "Entrada", quantity: 1, reason: "" });
            }}
          >
            <div className="space-y-1.5">
              <Label>Producto</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona producto" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "Entrada" | "Salida" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrada">Entrada</SelectItem>
                    <SelectItem value="Salida">Salida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cantidad</Label>
                <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Motivo</Label>
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ej. Reposición" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="gradient-neon text-white">Registrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
