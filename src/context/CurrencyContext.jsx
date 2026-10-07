import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAnnounce } from "./AnnouncerContext";

const CurrencyContext = createContext(null);
const STORAGE_KEY = "currency";

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "USD" ? "USD" : "GHS";
  } catch {
    return "GHS";
  }
}

function save(currency) {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    return false;
  }
  return true;
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(readSaved);
  const { data } = useApi("/api/settings/currency");
  const announce = useAnnounce();

  const setCurrency = useCallback(
    (next) => {
      const value = next === "USD" ? "USD" : "GHS";
      setCurrencyState(value);
      save(value);
      announce(value === "USD" ? "Prices now shown in US dollars" : "Prices now shown in Ghana cedis");
    },
    [announce],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, settings: data?.currency ?? null }),
    [currency, setCurrency, data],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
