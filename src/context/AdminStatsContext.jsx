import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AdminStatsContext = createContext(null);

export function AdminStatsProvider({ children }) {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(null);

  const setStock = useCallback((stock) => {
    setLowStockCount(stock?.lowStockCount ?? 0);
    setLowStockThreshold(stock?.lowStockThreshold ?? null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api("/api/admin/dashboard");
      setStock(data.stock);
    } catch {
      setLowStockCount(0);
    }
  }, [setStock]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ lowStockCount, lowStockThreshold, setStock, refresh }),
    [lowStockCount, lowStockThreshold, setStock, refresh],
  );

  return <AdminStatsContext.Provider value={value}>{children}</AdminStatsContext.Provider>;
}

export function useAdminStats() {
  return useContext(AdminStatsContext);
}
