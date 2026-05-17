import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatCurrency } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/reportes")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["pedidos"],
    queryFn: getOrders,
  });

  const { monthly, top, frequent } = useMemo(() => {
    if (!orders.length) return { monthly: [], top: [], frequent: [] };

    // 1. Ventas Mensuales
    const monthMap: Record<string, { m: string, ingresos: number, ventas: number }> = {};
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    orders.forEach(o => {
      if (o.status === "Cancelado") return;
      
      const date = new Date(o.date);
      const mName = monthNames[date.getMonth()];
      if (!monthMap[mName]) monthMap[mName] = { m: mName, ingresos: 0, ventas: 0 };
      monthMap[mName].ingresos += o.total;
      monthMap[mName].ventas += 1; // Count orders
    });
    
    // Sort logic here is simplified, just taking the keys present
    const monthlyData = Object.values(monthMap);

    // 2. Productos Más Vendidos
    const prodMap: Record<string, { name: string, v: number }> = {};
    orders.forEach(o => {
      if (o.status === "Cancelado") return;
      
      o.items.forEach(i => {
        if (!prodMap[i.name]) prodMap[i.name] = { name: i.name, v: 0 };
        prodMap[i.name].v += i.quantity;
      });
    });
    const topProducts = Object.values(prodMap).sort((a, b) => b.v - a.v).slice(0, 6).map(p => ({
      name: p.name.split(" ").slice(0, 3).join(" "), // Visual truncation only
      v: p.v
    }));

    // 3. Clientes Frecuentes
    const clientMap: Record<string, { id: string, name: string, email: string, purchases: number, spent: number }> = {};
    orders.forEach(o => {
      if (o.status === "Cancelado") return;
      
      if (!clientMap[o.customerId]) {
        clientMap[o.customerId] = { id: o.customerId, name: o.customerName, email: o.customerName.toLowerCase().replace(" ", ".") + "@cliente.com", purchases: 0, spent: 0 };
      }
      clientMap[o.customerId].purchases += 1;
      clientMap[o.customerId].spent += o.total;
    });
    const frequentCustomers = Object.values(clientMap).sort((a, b) => b.purchases - a.purchases).slice(0, 5);

    return { monthly: monthlyData, top: topProducts, frequent: frequentCustomers };
  }, [orders]);

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--neon-purple)]" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" description="Analítica y comparativas del negocio extraídas de la base de datos" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glow-card border-border/50">
          <CardHeader><CardTitle className="font-display">Ingresos por Mes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" name="Ingresos (S/)" dataKey="ingresos" stroke="var(--neon-cyan)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glow-card border-border/50">
          <CardHeader><CardTitle className="font-display">Productos más vendidos (Unidades)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="v" name="Unidades" fill="var(--neon-blue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glow-card border-border/50">
        <CardHeader><CardTitle className="font-display">Clientes frecuentes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {frequent.length === 0 && <p className="text-sm text-muted-foreground">No hay datos de clientes aún.</p>}
          {frequent.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg gradient-neon text-xs font-bold text-white">
                  {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-[var(--neon-purple)]/30 text-[var(--neon-purple)]">{c.purchases} compras</Badge>
                <span className="text-sm font-semibold">{formatCurrency(c.spent)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
