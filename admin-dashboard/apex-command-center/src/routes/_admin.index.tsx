import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Cpu,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatCurrency, useAdmin } from "@/lib/store";

export const Route = createFileRoute("/_admin/")({
  component: Dashboard,
});

const salesSeries = [
  { d: "Lun", ventas: 4200, ganancias: 1450 },
  { d: "Mar", ventas: 5100, ganancias: 1820 },
  { d: "Mié", ventas: 4800, ganancias: 1700 },
  { d: "Jue", ventas: 6900, ganancias: 2410 },
  { d: "Vie", ventas: 8400, ganancias: 3100 },
  { d: "Sáb", ventas: 9800, ganancias: 3700 },
  { d: "Dom", ventas: 7600, ganancias: 2900 },
];

const categorySeries = [
  { name: "GPUs", value: 38 },
  { name: "CPUs", value: 24 },
  { name: "PCs Armadas", value: 18 },
  { name: "Periféricos", value: 12 },
  { name: "Otros", value: 8 },
];

const COLORS = ["var(--neon-purple)", "var(--neon-blue)", "var(--neon-cyan)", "var(--neon-pink)", "var(--neon-green)"];

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  delta: number;
  icon: typeof Activity;
  accent: string;
}) {
  const up = delta >= 0;
  return (
    <Card className="glow-card glow-hover relative overflow-hidden border-border/50">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold md:text-3xl">{value}</p>
            <div className={`flex items-center gap-1 text-xs ${up ? "text-[var(--neon-green)]" : "text-destructive"}`}>
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{Math.abs(delta)}% vs ayer</span>
            </div>
          </div>
          <div
            className="grid h-12 w-12 place-items-center rounded-xl"
            style={{ background: `color-mix(in oklch, ${accent} 18%, transparent)`, boxShadow: `0 0 20px -6px ${accent}` }}
          >
            <Icon className="h-6 w-6" style={{ color: accent }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const products = useAdmin((s) => s.products);
  const orders = useAdmin((s) => s.orders);
  const customers = useAdmin((s) => s.customers);

  const today = orders.reduce((sum, o) => sum + o.total, 0);
  const monthly = today * 22;
  const pending = orders.filter((o) => o.status === "Pendiente").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3);
  const profits = Math.round(today * 0.34);

  const topProducts = [...products].sort((a, b) => b.price - a.price).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Control"
        description="Visión general del negocio en tiempo real"
        actions={
          <>
            <Badge className="gap-1 border-[var(--neon-green)]/40 bg-[var(--neon-green)]/10 text-[var(--neon-green)]" variant="outline">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neon-green)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neon-green)]" />
              </span>
              Sistema Online
            </Badge>
            <Button asChild className="gradient-neon glow text-white hover:opacity-90">
              <Link to="/builds">
                <Zap className="mr-1 h-4 w-4" /> Nueva Build
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ventas del día" value={formatCurrency(today)} delta={12.4} icon={DollarSign} accent="var(--neon-purple)" />
        <StatCard label="Ventas mensuales" value={formatCurrency(monthly)} delta={8.1} icon={TrendingUp} accent="var(--neon-blue)" />
        <StatCard label="Clientes" value={String(customers.length)} delta={4.2} icon={Users} accent="var(--neon-cyan)" />
        <StatCard label="Pedidos pendientes" value={String(pending)} delta={-2.0} icon={ShoppingCart} accent="var(--neon-pink)" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glow-card border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Rendimiento semanal</CardTitle>
              <Badge variant="outline" className="border-[var(--neon-purple)]/40 text-[var(--neon-purple)]">
                Ganancias {formatCurrency(profits)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesSeries}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--neon-purple)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--neon-purple)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Area type="monotone" dataKey="ventas" stroke="var(--neon-purple)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="ganancias" stroke="var(--neon-cyan)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glow-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display">Categorías populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categorySeries}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {categorySeries.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {categorySeries.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                    {c.name}
                  </span>
                  <span className="font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glow-card border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Últimos pedidos</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/pedidos">Ver todos →</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 transition hover:border-[var(--neon-purple)]/40 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-xs font-bold text-white">
                    {o.customerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{o.id}</p>
                    <p className="text-xs text-muted-foreground">{o.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(o.total)}</p>
                  <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glow-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Package className="h-4 w-4 text-[var(--neon-pink)]" /> Alertas de stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin alertas de stock bajo.</p>
            )}
            {lowStock.map((p) => (
              <div key={p.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="text-[var(--neon-pink)]">{p.stock} u.</span>
                </div>
                <Progress value={(p.stock / 10) * 100} className="h-1.5" />
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/inventario">Ir a inventario</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="glow-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[var(--neon-cyan)]" /> Productos más vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts.map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), ventas: Math.floor(p.price / 50) }))}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey="ventas" fill="var(--neon-purple)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
