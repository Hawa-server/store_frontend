import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { loginPath, useAuth } from "./AuthContext";
import { useAnnounce } from "./AnnouncerContext";
import ConfirmDialog from "../components/ConfirmDialog";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const announce = useAnnounce();
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState(() => new Set());
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(() => new Set());
  const [askingLogin, setAskingLogin] = useState(false);
  const inFlight = useRef(new Set());
  const userId = user?.id ?? null;

  const refreshIds = useCallback(async () => {
    try {
      const data = await api("/api/wishlist/ids", { authRedirect: false });
      setIds(new Set(data.productIds));
      setCount(data.productIds.length);
    } catch {
      setIds(new Set());
      setCount(0);
    }
  }, []);

  useEffect(() => {
    inFlight.current = new Set();
    setPending(new Set());
    if (userId === null) {
      setIds(new Set());
      setCount(0);
      return;
    }
    refreshIds();
  }, [userId, refreshIds]);

  const mark = useCallback((productId, saved, nextCount) => {
    setIds((current) => {
      const next = new Set(current);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });
    if (typeof nextCount === "number") setCount(nextCount);
  }, []);

  const setBusy = useCallback((productId, busy) => {
    if (busy) inFlight.current.add(productId);
    else inFlight.current.delete(productId);
    setPending(new Set(inFlight.current));
  }, []);

  const toggle = useCallback(
    async (product) => {
      if (!userId) {
        setAskingLogin(true);
        return { ok: false };
      }
      if (inFlight.current.has(product.id)) return { ok: false };
      const wasSaved = ids.has(product.id);
      setBusy(product.id, true);
      mark(product.id, !wasSaved);
      try {
        const data = await api(`/api/wishlist/${product.id}`, { method: wasSaved ? "DELETE" : "PUT" });
        mark(product.id, data.saved, data.count);
        announce(data.saved ? "Saved to wishlist" : "Removed from wishlist");
        return { ok: true };
      } catch (error) {
        mark(product.id, wasSaved);
        announce(error.message);
        return { ok: false, error };
      } finally {
        setBusy(product.id, false);
      }
    },
    [userId, ids, mark, setBusy, announce],
  );

  const remove = useCallback(
    async (productId) => {
      setBusy(productId, true);
      try {
        const data = await api(`/api/wishlist/${productId}`, { method: "DELETE" });
        mark(productId, false, data.count);
        return data;
      } finally {
        setBusy(productId, false);
      }
    },
    [mark, setBusy],
  );

  const value = useMemo(
    () => ({
      count,
      isSaved: (productId) => ids.has(productId),
      isPending: (productId) => pending.has(productId),
      toggle,
      remove,
      refreshIds,
    }),
    [count, ids, pending, toggle, remove, refreshIds],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={askingLogin}
        title="Save it for later"
        message="Log in to save products to your wishlist."
        confirmLabel="Log in"
        cancelLabel="Not now"
        onConfirm={() => {
          setAskingLogin(false);
          navigate(loginPath(`${location.pathname}${location.search}`));
        }}
        onCancel={() => setAskingLogin(false)}
      />
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
