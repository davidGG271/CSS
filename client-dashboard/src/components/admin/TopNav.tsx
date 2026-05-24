import { Bell, Moon, Search, Sun, Zap, Plus, Package, ShoppingCart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { useAdmin } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";
import { logoutUnificado } from "@/lib/auth-unified";
import { useAuth } from "@/lib/auth-store";

export function TopNav() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const user = useAuth();
  const [q, setQ] = useState("");
  const products = useAdmin((s) => s.products);
  const orders = useAdmin((s) => s.orders);

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const pending = orders.filter((o) => o.status === "Pendiente").length;
  const totalNotifs = lowStock + outOfStock + pending;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="text-foreground hover:text-[var(--neon-purple)]" />

      <form
        className="relative hidden flex-1 max-w-md md:block"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            toast.info(`Buscando "${q}"`, { description: "Resultados globales filtrados." });
          }
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar productos, pedidos, clientes..."
          className="pl-9 bg-muted/40 border-border/50 focus-visible:ring-[var(--neon-purple)]"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="hidden gap-2 border-[var(--neon-purple)]/40 hover:border-[var(--neon-purple)] hover:text-[var(--neon-purple)] sm:inline-flex"
          onClick={() => navigate({ to: "/admin/productos" })}
        >
          <Plus className="h-4 w-4" /> Producto
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="hidden gap-2 border-[var(--neon-blue)]/40 hover:border-[var(--neon-blue)] hover:text-[var(--neon-blue)] sm:inline-flex"
          onClick={() => navigate({ to: "/admin/builds" })}
        >
          <Zap className="h-4 w-4" /> Nueva Build
        </Button>

        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {totalNotifs > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--neon-pink)] px-1 text-[10px] font-bold text-white animate-pulse-glow">
                  {totalNotifs}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pending > 0 && (
              <DropdownMenuItem onClick={() => navigate({ to: "/admin/pedidos" })} className="gap-2">
                <ShoppingCart className="h-4 w-4 text-[var(--neon-blue)]" />
                <div className="flex-1">
                  <p className="text-sm">{pending} pedidos pendientes</p>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </div>
              </DropdownMenuItem>
            )}
            {lowStock > 0 && (
              <DropdownMenuItem onClick={() => navigate({ to: "/admin/inventario" })} className="gap-2">
                <Package className="h-4 w-4 text-[var(--neon-pink)]" />
                <div className="flex-1">
                  <p className="text-sm">{lowStock} productos con stock bajo</p>
                  <p className="text-xs text-muted-foreground">Reabastecer pronto</p>
                </div>
              </DropdownMenuItem>
            )}
            {outOfStock > 0 && (
              <DropdownMenuItem onClick={() => navigate({ to: "/admin/inventario" })} className="gap-2">
                <Package className="h-4 w-4 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm">{outOfStock} productos agotados</p>
                  <p className="text-xs text-muted-foreground">Sin stock</p>
                </div>
              </DropdownMenuItem>
            )}
            {totalNotifs === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">Todo en orden ✨</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full p-1 pr-3 transition-all hover:bg-muted/50">
              <div className="relative">
                <Avatar className="h-9 w-9 border-2 border-[var(--neon-purple)] shadow-[0_0_15px_-3px_var(--neon-purple)]">
                  <AvatarFallback className="gradient-neon font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-[var(--neon-green)]" />
              </div>
              <div className="hidden text-left leading-tight md:block">
                <p className="text-sm font-bold text-foreground">{user?.name || "Admin"}</p>
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] text-[var(--neon-green)] font-semibold">
                  Online
                </Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/configuracion" })}>Configuración</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/perfil" })}>Perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                logoutUnificado();
                toast.success("Sesión cerrada", { duration: 2000 });
                navigate({ to: "/" });
              }}
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
