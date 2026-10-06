import { createContext, useContext } from "react";
import { useApi } from "../hooks/useApi";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const { data, error, loading, reload } = useApi("/api/categories");
  const value = { categories: data?.categories ?? [], error, loading, reload };
  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  return useContext(CategoriesContext);
}
