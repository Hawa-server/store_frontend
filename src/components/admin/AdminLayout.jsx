import { Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Menu, MessageSquareText, Package, Tag, X } from "lucide-react";
import { AdminStatsProvider, useAdminStats } from "../../context/AdminStatsContext";
import RequireAdmin from "../RequireAdmin";
import ThemeToggle from "../ThemeToggle";
import LogoMark from "../ui/LogoMark";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, badge: true },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/products", label: "Products", icon: Tag },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
];

const navLink = ({ isActive }) =>
  `flex min-h-12 items-center gap-3 rounded-xl px-4 text-[15px] font-medium transition-colors focus-visible:outline-on-footer ${
    isActive ? "bg-admin-active text-on-footer" : "text-on-footer/80 hover:bg-on-footer/10 hover:text-on-footer"
  }`;

function Brand() {
  return (
    <Link
      to="/admin"
      className="inline-flex min-h-11 items-center gap-3 focus-visible:outline-on-footer"
      aria-label="Adorn admin"
    >
      <LogoMark tone="footer" className="size-9" />
      <span aria-hidden="true">
        <span className="block font-display text-2xl leading-none font-bold tracking-[0.2em] uppercase">Adorn</span>
        <span className="mt-1 block text-[11px] font-semibold tracking-[0.3em] text-on-footer/70 uppercase">Admin</span>
      </span>
    </Link>
  );
}

function SidebarNav() {
  const { lowStockCount } = useAdminStats();

  return (
    <nav aria-label="Admin">
      <ul className="space-y-1">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={navLink}>
              <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {badge && lowStockCount > 0 && (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-on-accent"
                  >
                    {lowStockCount}
                  </span>
                  <span className="sr-only">, {lowStockCount} low-stock {lowStockCount === 1 ? "product" : "products"}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="space-y-1">
      <ThemeToggle tone="sidebar" withLabel className="w-full justify-start rounded-xl px-4" />
      <Link
        to="/"
        className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-on-footer/80 hover:bg-on-footer/10 hover:text-on-footer focus-visible:outline-on-footer"
      >
        <ArrowLeft className="size-5" strokeWidth={1.6} aria-hidden="true" />
        View store
      </Link>
    </div>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    setMenuOpen(false);
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-admin-bg text-text">
      <a
        href="#admin-main"
        className="sr-only z-50 rounded-full bg-text px-5 py-3 font-semibold text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="hidden bg-footer text-on-footer lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:justify-between lg:p-6">
        <div className="space-y-10">
          <Brand />
          <SidebarNav />
        </div>
        <SidebarFooter />
      </aside>

      <header className="sticky top-0 z-40 bg-footer text-on-footer lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Brand />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            aria-label="Admin menu"
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-on-footer/10 focus-visible:outline-on-footer"
          >
            {menuOpen ? (
              <X className="size-6" strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <Menu className="size-6" strokeWidth={1.6} aria-hidden="true" />
            )}
          </button>
        </div>
        {menuOpen && (
          <div id="admin-menu" className="space-y-4 border-t border-on-footer/15 px-4 pt-3 pb-5">
            <SidebarNav />
            <SidebarFooter />
          </div>
        )}
      </header>

      <main id="admin-main" ref={mainRef} tabIndex={-1} className="focus:outline-none lg:pl-72">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Suspense fallback={<div className="h-80 animate-pulse rounded-card bg-disabled" aria-hidden="true" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminStatsProvider>
        <Shell />
      </AdminStatsProvider>
    </RequireAdmin>
  );
}
