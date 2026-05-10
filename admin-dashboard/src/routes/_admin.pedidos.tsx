import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Printer, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ORDER_STATUSES, formatCurrency, useAdmin, type Order, type OrderStatus } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/pedidos")({
  component: OrdersPage,
});

const statusColor: Record<OrderStatus, string> = {
  Pendiente: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Pagado: "bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border-[var(--neon-cyan)]/30",
  "En preparación": "bg-[var(--neon-blue)]/15 text-[var(--neon-blue)] border-[var(--neon-blue)]/30",
  Enviado: "bg-[var(--neon-purple)]/15 text-[var(--neon-purple)] border-[var(--neon-purple)]/30",
  Entregado: "bg-[var(--neon-green)]/15 text-[var(--neon-green)] border-[var(--neon-green)]/30",
  Cancelado: "bg-destructive/15 text-destructive border-destructive/30",
};

function OrdersPage() {
  const orders = useAdmin((s) => s.orders);
  const updateStatus = useAdmin((s) => s.updateOrderStatus);
  const cancelOrder = useAdmin((s) => s.cancelOrder);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewing, setViewing] = useState<Order | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const m = filter === "all" || o.status === filter;
        const s = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
        return m && s;
      }),
    [orders, search, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Pedidos" description="Seguimiento de ventas y entregas" />

      <Card className="glow-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar pedido o cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-medium">{o.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{o.date}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(o.total)}</TableCell>
                    <TableCell><Badge variant="outline">{o.paymentMethod}</Badge></TableCell>
                    <TableCell>
                      <Select value={o.status} onValueChange={(v) => { updateStatus(o.id, v as OrderStatus); toast.success(`${o.id} → ${v}`); }}>
                        <SelectTrigger className={`h-8 w-40 border ${statusColor[o.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setViewing(o)} aria-label="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { window.print(); toast.info("Imprimiendo..."); }} aria-label="Imprimir">
                          <Printer className="h-4 w-4 text-[var(--neon-blue)]" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={o.status === "Cancelado"}
                          onClick={() => { cancelOrder(o.id); toast.success("Pedido cancelado"); }}
                          aria-label="Cancelar"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Sin pedidos.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-3">
                  <span className="text-gradient">{viewing.id}</span>
                  <Badge variant="outline" className={statusColor[viewing.status]}>{viewing.status}</Badge>
                </DialogTitle>
                <DialogDescription>Código: {viewing.transactionCode}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium">{viewing.customerName}</p></div>
                <div><p className="text-xs text-muted-foreground">Fecha</p><p>{viewing.date}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Dirección</p><p>{viewing.address}</p></div>
                <div><p className="text-xs text-muted-foreground">Pago</p><p>{viewing.paymentMethod}</p></div>
                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-[var(--neon-purple)]">{formatCurrency(viewing.total)}</p></div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Productos</h3>
                <div className="space-y-2">
                  {viewing.items.map((it) => (
                    <div key={it.productId} className="flex justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm">
                      <span>{it.name} <span className="text-muted-foreground">× {it.quantity}</span></span>
                      <span className="font-medium">{formatCurrency(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Historial</h3>
                <div className="space-y-2">
                  {viewing.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="h-2 w-2 rounded-full bg-[var(--neon-purple)]" />
                      <span className="text-muted-foreground">{h.date}</span>
                      <span>{h.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
