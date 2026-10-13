import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setUnauthenticatedHandler } from "../lib/api";
import { useCart } from "./CartContext";
import { useAnnounce } from "./AnnouncerContext";
import ConfirmDialog from "../components/ConfirmDialog";

const AuthContext = createContext(null);

export const SESSION_ENDED = "Your session has ended. Please log in again.";

export function safeNext(next) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function loginPath(next) {
  const target = safeNext(next);
  return target === "/" ? "/login" : `/login?next=${encodeURIComponent(target)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [linkedNotice, setLinkedNotice] = useState(null);
  const [logoutError, setLogoutError] = useState(null);
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const announce = useAnnounce();

  const refresh = useCallback(async () => {
    try {
      const data = await api("/api/auth/me", { authRedirect: false });
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setUnauthenticatedHandler(() => {
      setNotice(SESSION_ENDED);
      setUser(null);
      const { pathname, search } = window.location;
      if (pathname === "/login") return;
      navigate(loginPath(`${pathname}${search}`), { replace: true, state: { message: SESSION_ENDED } });
    });
    return () => setUnauthenticatedHandler(null);
  }, [navigate]);

  const login = useCallback(
    async (nextUser, linked) => {
      setUser(nextUser);
      setLoading(false);
      const found = linked && (linked.ordersLinked > 0 || linked.cartItemsAdded > 0 || linked.cartItemsReduced > 0);
      setLinkedNotice(found ? linked : null);
      announce(`Logged in as ${nextUser.name}`);
      await refreshCart();
    },
    [announce, refreshCart],
  );

  const logout = useCallback(() => {
    setLogoutError(null);
    setConfirmingLogout(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await api("/api/auth/logout", { method: "POST", authRedirect: false });
    } catch (error) {
      setLoggingOut(false);
      setLogoutError(error.message);
      announce(error.message);
      return;
    }
    setUser(null);
    setLinkedNotice(null);
    setConfirmingLogout(false);
    setLoggingOut(false);
    await refreshCart();
    announce("Logged out");
    navigate("/");
  }, [announce, navigate, refreshCart]);

  const takeNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const dismissLinked = useCallback(() => setLinkedNotice(null), []);

  const value = useMemo(
    () => ({ user, loading, loggingOut, notice, takeNotice, login, logout, refresh, linkedNotice, dismissLinked }),
    [user, loading, loggingOut, notice, takeNotice, login, logout, refresh, linkedNotice, dismissLinked],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={confirmingLogout}
        title="Log out of your account?"
        message="Your cart is saved to your account and will be back when you log in again."
        confirmLabel="Log out"
        cancelLabel="Cancel"
        busy={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      >
        {logoutError && (
          <p role="alert" className="mt-4 rounded-field bg-status-alert-bg px-3 py-2 text-sm font-medium text-status-alert-text">
            {logoutError}
          </p>
        )}
      </ConfirmDialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function firstName(user) {
  return user?.name?.trim().split(/\s+/)[0] ?? "";
}
