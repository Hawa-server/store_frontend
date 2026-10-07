import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AdminStatsContext = createContext(null);

export function AdminStatsProvider({ children }) {
  const [lowStockCount, setLowStockCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await api("/api/admin/dashboard");
      setLowStockCount(data.stock?.lowStockCount ?? 0);
    } catch {
      setLowStockCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ lowStockCount, setLowStockCount, refresh }), [lowStockCount, refresh]);

  return <AdminStatsContext.Provider value={value}>{children}</AdminStatsContext.Provider>;
}

export function useAdminStats() {
  return useContext(AdminStatsContext);
}
