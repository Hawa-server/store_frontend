import { useCallback } from "react";
import { formatGhs } from "./format";
import { useCurrency } from "../context/CurrencyContext";

const usdFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatUsd(cents) {
  return `US$ ${usdFormat.format(cents / 100)}`;
}

export function useMoney() {
  const { currency } = useCurrency();
  return useCallback(
    ({ ghs, usd }) => (currency === "USD" && Number.isInteger(usd) ? formatUsd(usd) : formatGhs(ghs)),
    [currency],
  );
}
