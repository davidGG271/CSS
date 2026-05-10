import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Users,
  Warehouse,
  Cpu,
  Bell,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Zap,
} from "lucide-react";
import { useAdmin } from "@/lib/store";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Productos", url: "/productos", icon: Boxes },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Inventario", url: "/inventario", icon: Warehouse },
  { title: "PCs Armadas", url: "/builds", icon: Cpu },
  { title: "Notificaciones", url: "/notificaciones", icon: Bell },
  { title: "Reportes", url: "/reportes", icon: BarChart3 },
  { title: "Configuración", url: "/configuracion", icon: SettingsIcon },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const settings = useAdmin((s) => s.settings);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-neon glow font-display text-lg font-black text-white shadow-lg">
            {settings.logoText}
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-wider text-gradient">
                {settings.storeName}
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <Zap className="h-3 w-3 text-[var(--neon-cyan)]" /> Admin Panel
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={
                        "transition-all data-[active=true]:bg-gradient-to-r data-[active=true]:from-[color-mix(in_oklch,var(--neon-purple)_30%,transparent)] data-[active=true]:to-[color-mix(in_oklch,var(--neon-blue)_25%,transparent)] data-[active=true]:text-foreground data-[active=true]:shadow-[0_0_20px_-6px_var(--neon-purple)]"
                      }
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toast.success("Sesión cerrada", { description: "Has salido del panel." })}
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4 text-destructive" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
