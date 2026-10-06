import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);

  const refreshCart = useCallback(async () => {
    try {
      const data = await api("/api/cart");
      setCart(data.cart);
    } catch {
      setCart(null);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = { cart, itemCount: cart?.itemCount ?? 0, refreshCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
