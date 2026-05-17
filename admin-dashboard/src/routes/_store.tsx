import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Header, Footer } from "@/components/store/site-chrome";
import { getRolActual } from "@/lib/auth-unified";

export const Route = createFileRoute("/_store")({
  beforeLoad: () => {
    const rol = getRolActual();
    if (rol === "ADMIN") {
      throw redirect({ to: "/admin" });
    }
  },
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
