import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setUnauthenticatedHandler } from "../lib/api";
import { useCart } from "./CartContext";
import { useAnnounce } from "./AnnouncerContext";

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
    async (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      announce(`Logged in as ${nextUser.name}`);
      await refreshCart();
    },
    [announce, refreshCart],
  );

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await api("/api/auth/logout", { method: "POST", authRedirect: false });
    } catch (error) {
      setLoggingOut(false);
      announce(error.message);
      return;
    }
    setUser(null);
    setLoggingOut(false);
    await refreshCart();
    announce("Logged out");
    navigate("/");
  }, [announce, navigate, refreshCart]);

  const takeNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, loggingOut, notice, takeNotice, login, logout, refresh }),
    [user, loading, loggingOut, notice, takeNotice, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function firstName(user) {
  return user?.name?.trim().split(/\s+/)[0] ?? "";
}
