import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Search, Trash2, Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientes, deleteCliente, type ClienteFrontend, getOrders } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/clientes")({
  component: CustomersPage,
});

function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<ClienteFrontend | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const { data: customers = [], isLoading, isError, error } = useQuery({
    queryKey: ["clientes"],
    queryFn: getClientes,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["pedidos"],
    queryFn: getOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente eliminado");
      setDelId(null);
    },
    onError: () => toast.error("No se pudo eliminar el cliente"),
  });

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.dni.includes(search),
      ),
    [customers, search],
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--neon-purple)]" />
        <p>Cargando clientes desde la base de datos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-destructive">
        <AlertCircle className="h-10 w-10" />
        <p className="text-lg font-semibold">Error al cargar clientes</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Error desconocido"}
        </p>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["clientes"] })}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${customers.length} clientes registrados en la tienda`}
      />

      <Card className="glow-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, correo o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
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
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-[var(--neon-green)]/30 text-[var(--neon-green)]"
                      >
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setViewing(c)}
                          aria-label="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDelId(c.id)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Sin clientes registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ver detalle */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-md">
          {viewing && (() => {
            const clientOrders = orders.filter((o) => Number(o.customerId) === Number(viewing.id));
            const totalSpent = clientOrders.reduce((sum, o) => sum + o.total, 0);
            const latestOrders = clientOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
            
            return (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-gradient">{viewing.name}</DialogTitle>
                <DialogDescription>ID Cliente: {viewing.id}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Correo</p>
                    <p>{viewing.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">DNI</p>
                    <p className="font-mono">{viewing.dni}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/30 p-4 shadow-sm">
                  <h4 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-[var(--neon-purple)]" />
                    Métricas de Compra
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Gastado</span>
                      <span className="font-display text-xl font-bold text-[var(--neon-green)] drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">
                        S/ {totalSpent.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pedidos Totales</span>
                      <span className="font-display text-xl font-bold text-foreground">
                        {clientOrders.length}
                      </span>
                    </div>
                  </div>
                </div>

                {latestOrders.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Últimos Pedidos</h4>
                    <div className="space-y-3">
                      {latestOrders.map(o => (
                        <div key={o.id} className="flex items-center justify-between text-sm rounded-lg bg-background/50 p-2.5 border border-border/30">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">#{o.id.padStart(4, '0')}</span>
                            <Badge variant="outline" className="text-[10px] border-[var(--neon-blue)]/30 text-[var(--neon-blue)]">{o.status}</Badge>
                          </div>
                          <span className="font-medium text-[var(--neon-cyan)]">S/ {o.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )})()}
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <AlertDialog open={!!delId} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => delId && deleteMutation.mutate(delId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

