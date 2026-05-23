import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { TopNav } from "@/components/admin/TopNav";
import { getRolActual } from "@/lib/auth-unified";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    const search = location.search as Record<string, string>;
    if (search.sso && typeof window !== "undefined") {
      try {
        const data = JSON.parse(atob(search.sso));
        localStorage.setItem("cyc-rol", "ADMIN");
        localStorage.setItem("cyc-user", JSON.stringify(data));
        throw redirect({ to: "/admin", replace: true });
      } catch (e) {}
    }

    const rol = getRolActual();
    if (rol !== "ADMIN") {
      if (typeof window !== "undefined") {
        const clientUrl = import.meta.env.VITE_CLIENT_URL || "http://localhost:8000";
        window.location.href = `${clientUrl}/login`;
      }
      throw redirect({ to: "/" }); // Fallback local seguro
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
