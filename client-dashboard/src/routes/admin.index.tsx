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
import { formatCurrency } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getProducts, getClientes } from "@/lib/admin-api";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

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
  const { data: products = [], isLoading: pLoading } = useQuery({ queryKey: ["productos"], queryFn: getProducts });
  const { data: orders = [], isLoading: oLoading } = useQuery({ queryKey: ["pedidos"], queryFn: getOrders });
  const { data: customers = [], isLoading: cLoading } = useQuery({ queryKey: ["clientes"], queryFn: getClientes });

  const { todaySales, monthlySales, pendingOrders, profits, salesSeries, categorySeries, topProducts } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todaySales = 0;
    let monthlySales = 0;
    let pendingOrders = 0;

    // Series de ventas semanales (Lun - Dom)
    const weekMap: Record<number, { d: string, ventas: number, ganancias: number }> = {
      1: { d: "Lun", ventas: 0, ganancias: 0 },
      2: { d: "Mar", ventas: 0, ganancias: 0 },
      3: { d: "Mié", ventas: 0, ganancias: 0 },
      4: { d: "Jue", ventas: 0, ganancias: 0 },
      5: { d: "Vie", ventas: 0, ganancias: 0 },
      6: { d: "Sáb", ventas: 0, ganancias: 0 },
      0: { d: "Dom", ventas: 0, ganancias: 0 },
    };

    const catMap: Record<string, number> = {};
    const prodMap: Record<string, { name: string, quantity: number, price: number }> = {};

    orders.forEach(o => {
      const oDate = new Date(o.date);
      // Pendientes (Pagado / En preparación / Pendiente)
      if (o.status === "Pagado" || o.status === "En preparación" || o.status === "Pendiente") {
        pendingOrders++;
      }

      // Ventas y métricas solo de pedidos no cancelados
      if (o.status !== "Cancelado") {
        // Ventas diarias y mensuales
        if (o.date.startsWith(todayStr)) todaySales += o.total;
        if (oDate.getMonth() === currentMonth && oDate.getFullYear() === currentYear) monthlySales += o.total;

        // Gráfico semanal
        const day = oDate.getDay();
        weekMap[day].ventas += 1;
        weekMap[day].ganancias += o.total;

        // Agrupación de items para categorías y productos top
        o.items.forEach(i => {
          // Find product to get category
          const prod = products.find(p => p.id === i.productId);
          const cat = prod?.category || "Otros";
          catMap[cat] = (catMap[cat] || 0) + i.quantity;

          if (!prodMap[i.name]) prodMap[i.name] = { name: i.name, quantity: 0, price: i.price };
          prodMap[i.name].quantity += i.quantity;
        });
      }
    });

    const profits = Math.round(monthlySales * 0.34);
    
    // Sort week days (1=Lun, 2=Mar... 0=Dom)
    const salesSeries = [weekMap[1], weekMap[2], weekMap[3], weekMap[4], weekMap[5], weekMap[6], weekMap[0]];
    
    // Process categories
    const totalCatItems = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
    const categorySeries = Object.entries(catMap).map(([name, value]) => ({
      name,
      value: Math.round((value / totalCatItems) * 100)
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    // Si no hay categorías de las ventas, usar unas por defecto
    const finalCategorySeries = categorySeries.length > 0 ? categorySeries : [{ name: "Sin ventas", value: 100 }];

    // Top products
    const topProducts = Object.values(prodMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5).map(p => ({
      name: p.name,
      ventas: p.quantity, // Número de unidades vendidas
    }));

    return { todaySales, monthlySales, pendingOrders, profits, salesSeries, categorySeries: finalCategorySeries, topProducts };
  }, [orders, products]);

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).slice(0, 5);

  if (pLoading || oLoading || cLoading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--neon-purple)]" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Control"
        description="Visión general del negocio en tiempo real conectada a la Base de Datos"
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
              <Link to="/admin">
                <Zap className="mr-1 h-4 w-4" /> Nueva Build
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ventas del día" value={formatCurrency(todaySales)} delta={5.4} icon={DollarSign} accent="var(--neon-purple)" />
        <StatCard label="Ventas mensuales" value={formatCurrency(monthlySales)} delta={12.1} icon={TrendingUp} accent="var(--neon-blue)" />
        <StatCard label="Clientes" value={String(customers.length)} delta={2.2} icon={Users} accent="var(--neon-cyan)" />
        <StatCard label="Pedidos pendientes" value={String(pendingOrders)} delta={-1.0} icon={ShoppingCart} accent="var(--neon-pink)" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glow-card border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Rendimiento semanal (Ingresos S/)</CardTitle>
              <Badge variant="outline" className="border-[var(--neon-purple)]/40 text-[var(--neon-purple)]">
                Ganancias mes: {formatCurrency(profits)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesSeries}>
                <defs>
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
                <Area type="monotone" name="Soles" dataKey="ganancias" stroke="var(--neon-cyan)" strokeWidth={2} fill="url(#g2)" />
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
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
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
                <Link to="/admin/pedidos">Ver todos →</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.length === 0 && <p className="text-sm text-muted-foreground">No hay pedidos recientes.</p>}
            {[...orders].reverse().slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 transition hover:border-[var(--neon-purple)]/40 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-xs font-bold text-white">
                    {o.customerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">#{o.id}</p>
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
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="text-[var(--neon-pink)] whitespace-nowrap">{p.stock} u.</span>
                </div>
                <Progress value={(p.stock / 10) * 100} className="h-1.5" />
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/admin/productos">Ir a inventario</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="glow-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[var(--neon-cyan)]" /> Productos más vendidos (Unidades)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            {topProducts.length > 0 ? (
              <BarChart data={topProducts}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar name="Unidades Vendidas" dataKey="ventas" fill="var(--neon-purple)" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No hay datos suficientes de ventas.</div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

