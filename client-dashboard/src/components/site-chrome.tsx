import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, User as UserIcon, Search, Cpu } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";

const nav = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/armar-pc", label: "Armá tu PC" },
  { to: "/catalogo/componentes", label: "Componentes" },
  { to: "/catalogo/perifericos", label: "Periféricos" },
];

export function Header() {
  const { count } = useCart();
  const user = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </span>
          <span>
            CyC <span className="text-gradient">Computer</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-md px-3 py-1.5 text-sm transition-smooth ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden flex-1 max-w-xs items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 lg:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar productos..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            to={user ? "/cuenta" : "/login"}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-smooth hover:border-primary/60"
          >
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? user.name : "Ingresar"}</span>
          </Link>
          <Link
            to="/carrito"
            className="relative flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-surface/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary">
              <Cpu className="h-4 w-4 text-primary-foreground" />
            </span>
            CyC <span className="text-gradient">Computer</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Tecnología de punta y armado profesional desde 2010.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Tienda</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/catalogo">Catálogo completo</Link></li>
            <li><Link to="/catalogo/computadoras">PCs Armadas</Link></li>
            <li><Link to="/catalogo/notebooks">Notebooks</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Cuenta</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login">Iniciar sesión</Link></li>
            <li><Link to="/registro">Crear cuenta</Link></li>
            <li><Link to="/cuenta">Mi cuenta</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>hola@cyccomputer.com</li>
            <li>+54 11 5555-1234</li>
            <li>Av. Tecnología 2024, CABA</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CyC Computer. Todos los derechos reservados.
      </div>
    </footer>
  );
}
