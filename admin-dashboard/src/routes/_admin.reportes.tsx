import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdmin, formatCurrency } from "@/lib/store";

export const Route = createFileRoute("/_admin/reportes")({
  component: ReportsPage,
});

const monthly = [
  { m: "Ene", ventas: 42000, ingresos: 14000 },
  { m: "Feb", ventas: 51000, ingresos: 18000 },
  { m: "Mar", ventas: 48000, ingresos: 17000 },
  { m: "Abr", ventas: 69000, ingresos: 24000 },
  { m: "May", ventas: 84000, ingresos: 31000 },
  { m: "Jun", ventas: 98000, ingresos: 37000 },
];

function ReportsPage() {
  const products = useAdmin((s) => s.products);
  const customers = useAdmin((s) => s.customers);
  const top = [...products].sort((a, b) => b.price - a.price).slice(0, 6).map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), v: Math.floor(p.price / 40) }));
  const frequent = [...customers].sort((a, b) => b.purchases - a.purchases).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" description="Analítica y comparativas del negocio" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glow-card border-border/50">
          <CardHeader><CardTitle className="font-display">Ventas mensuales</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="ventas" stroke="var(--neon-purple)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ingresos" stroke="var(--neon-cyan)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glow-card border-border/50">
          <CardHeader><CardTitle className="font-display">Productos más vendidos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="var(--neon-blue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glow-card border-border/50">
        <CardHeader><CardTitle className="font-display">Clientes frecuentes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {frequent.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg gradient-neon text-xs font-bold text-white">
                  {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-[var(--neon-purple)]/30 text-[var(--neon-purple)]">{c.purchases} compras</Badge>
                <span className="text-sm font-semibold">{formatCurrency(c.purchases * 850)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
