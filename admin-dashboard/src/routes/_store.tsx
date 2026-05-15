import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/store/site-chrome";

export const Route = createFileRoute("/_store")({
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
