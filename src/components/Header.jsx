import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import PageContainer from "./PageContainer";
import ThemeToggle from "./ThemeToggle";
import Logo from "./ui/Logo";
import { useCategories } from "../context/CategoriesContext";
import { useCart } from "../context/CartContext";
import { firstName, useAuth } from "../context/AuthContext";

const iconButton =
  "relative size-11 items-center justify-center rounded-full text-text transition-colors hover:bg-text/8";

function useNavItems() {
  const { categories } = useCategories();
  return [
    { to: "/products", label: "All products" },
    ...categories.map((category) => ({ to: `/category/${category.slug}`, label: category.name })),
  ];
}

function DesktopNav({ items }) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Categories" className="hidden flex-1 justify-center lg:flex">
      <ul className="flex items-center gap-1 xl:gap-3">
        {items.map((item) => {
          const highlight = item.to === "/products" && pathname === "/";
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `relative inline-flex min-h-11 items-center px-2.5 text-[15px] font-medium whitespace-nowrap transition-colors after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-text after:transition-transform hover:after:scale-x-100 ${
                    isActive || highlight ? "after:scale-x-100" : "text-text/80 after:scale-x-0 hover:text-text"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileMenu({ items, open, onClose, buttonRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector("a")?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(event) {
      if (!panelRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, buttonRef]);

  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-bg shadow-lg lg:hidden"
    >
      <PageContainer className="py-4">
        <nav aria-label="Categories">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex min-h-13 items-center justify-between text-lg ${
                      isActive ? "font-semibold text-text" : "font-medium text-text/85"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && <span className="size-2 rounded-full bg-accent" aria-hidden="true" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <MobileAccount />
      </PageContainer>
    </div>
  );
}

const accountCard = "flex min-h-12 items-center gap-3 rounded-field border border-border bg-surface px-4 font-medium";

function MobileAccount() {
  const { user, logout, loggingOut } = useAuth();

  if (!user) {
    return (
      <Link to="/login" className={`mt-4 ${accountCard}`}>
        <User className="size-5" strokeWidth={1.6} aria-hidden="true" />
        Log in or create an account
      </Link>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-text-muted">
        Signed in as <span className="font-semibold text-text">{user.name}</span>
      </p>
      <Link to="/account" className={accountCard}>
        <User className="size-5" strokeWidth={1.6} aria-hidden="true" />
        Your account
      </Link>
      <button type="button" onClick={logout} disabled={loggingOut} className={`w-full ${accountCard}`}>
        <LogOut className="size-5" strokeWidth={1.6} aria-hidden="true" />
        {loggingOut ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}

function DesktopAccount() {
  const { user, logout, loggingOut } = useAuth();

  if (!user) {
    return (
      <Link to="/login" className={`${iconButton} hidden lg:inline-flex`} aria-label="Log in">
        <User className="size-5.5" strokeWidth={1.6} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <>
      <Link
        to="/account"
        className="hidden min-h-11 items-center gap-2 rounded-full pr-3 pl-2.5 text-[15px] font-medium transition-colors hover:bg-text/8 lg:inline-flex"
      >
        <User className="size-5.5" strokeWidth={1.6} aria-hidden="true" />
        <span className="max-w-28 truncate">{firstName(user)}</span>
        <span className="sr-only">, your account</span>
      </Link>
      <button
        type="button"
        onClick={logout}
        disabled={loggingOut}
        aria-label="Log out"
        title="Log out"
        className={`${iconButton} hidden disabled:opacity-50 lg:inline-flex`}
      >
        <LogOut className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </button>
    </>
  );
}

export default function Header() {
  const items = useNavItems();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { pathname } = useLocation();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const cartLabel = itemCount === 1 ? "Cart, 1 item" : `Cart, ${itemCount} items`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-md">
      <PageContainer className="relative flex h-16 items-center lg:h-20">
        <div className="flex flex-1 lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            className={`${iconButton} -ml-2.5 inline-flex`}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Categories"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-6" strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <Menu className="size-6" strokeWidth={1.6} aria-hidden="true" />
            )}
          </button>
        </div>

        <Logo />

        <DesktopNav items={items} />

        <div className="flex flex-1 items-center justify-end gap-0.5 lg:flex-none lg:gap-1">
          <DesktopAccount />
          <ThemeToggle />
          <Link to="/cart" className={`${iconButton} -mr-2.5 inline-flex`} aria-label={cartLabel}>
            <ShoppingBag className="size-5.5" strokeWidth={1.6} aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] leading-none font-bold text-on-accent">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>

        <MobileMenu
          items={items}
          open={menuOpen}
          onClose={closeMenu}
          buttonRef={menuButtonRef}
        />
      </PageContainer>
    </header>
  );
}
