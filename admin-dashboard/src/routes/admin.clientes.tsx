import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, Edit, Eye, Search, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdmin, type Customer, formatCurrency } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clientes")({
  component: CustomersPage,
});

function CustomersPage() {
  const customers = useAdmin((s) => s.customers);
  const orders = useAdmin((s) => s.orders);
  const updateCustomer = useAdmin((s) => s.updateCustomer);
  const deleteCustomer = useAdmin((s) => s.deleteCustomer);
  const toggleBlock = useAdmin((s) => s.toggleBlockCustomer);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  const filtered = useMemo(
    () => customers.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())),
    [customers, search],
  );

  const customerOrders = (cid: string) => orders.filter((o) => o.customerId === cid);

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Los clientes se registran desde la tienda. Aquí los gestionas." />

      <Card className="glow-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o correo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="glow-card border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-center">Compras</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell className="font-mono text-xs">{c.dni}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                    <TableCell className="text-center">{c.purchases}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={c.status === "Activo" ? "border-[var(--neon-green)]/30 text-[var(--neon-green)]" : "border-destructive/30 text-destructive"}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setViewing(c)}><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setForm(c); }}>
                          <Edit className="h-4 w-4 text-[var(--neon-blue)]" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { toggleBlock(c.id); toast.success(c.status === "Activo" ? "Cliente bloqueado" : "Cliente desbloqueado"); }}>
                          {c.status === "Activo" ? <Ban className="h-4 w-4 text-amber-500" /> : <Unlock className="h-4 w-4 text-[var(--neon-green)]" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDelId(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View detail */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-gradient">{viewing.name}</DialogTitle>
                <DialogDescription>Cliente desde {viewing.joinedAt}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Correo</p><p>{viewing.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Teléfono</p><p>{viewing.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">DNI</p><p>{viewing.dni}</p></div>
                <div><p className="text-xs text-muted-foreground">Compras</p><p>{viewing.purchases}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Dirección</p><p>{viewing.address}</p></div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Historial de compras</h3>
                <div className="space-y-1.5">
                  {customerOrders(viewing.id).map((o) => (
                    <div key={o.id} className="flex justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm">
                      <span className="font-mono text-xs">{o.id}</span>
                      <span className="text-muted-foreground">{o.date}</span>
                      <span className="font-medium">{formatCurrency(o.total)}</span>
                    </div>
                  ))}
                  {customerOrders(viewing.id).length === 0 && <p className="text-sm text-muted-foreground">Sin compras registradas.</p>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Editar cliente</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (editing) {
                updateCustomer(editing.id, form);
                toast.success("Cliente actualizado");
                setEditing(null);
              }
            }}
          >
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Correo</Label><Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Teléfono</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Dirección</Label><Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Customer["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button type="submit" className="gradient-neon text-white">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>Se borrarán sus datos del panel.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (delId) { deleteCustomer(delId); toast.success("Cliente eliminado"); setDelId(null); } }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
