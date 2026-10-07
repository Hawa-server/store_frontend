import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const data = await api("/api/cart");
      setCart(data.cart);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const apply = useCallback((data) => {
    setCart(data.cart);
    setError(null);
    return data;
  }, []);

  const addItem = useCallback(
    async (productId, quantity) =>
      apply(await api("/api/cart/items", { method: "POST", body: { productId, quantity } })),
    [apply],
  );

  const setQuantity = useCallback(
    async (lineId, quantity) =>
      apply(await api(`/api/cart/items/${lineId}`, { method: "PATCH", body: { quantity } })),
    [apply],
  );

  const removeItem = useCallback(
    async (lineId) => apply(await api(`/api/cart/items/${lineId}`, { method: "DELETE" })),
    [apply],
  );

  const value = useMemo(
    () => ({
      cart,
      error,
      loading,
      itemCount: cart?.itemCount ?? 0,
      refreshCart,
      addItem,
      setQuantity,
      removeItem,
    }),
    [cart, error, loading, refreshCart, addItem, setQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
