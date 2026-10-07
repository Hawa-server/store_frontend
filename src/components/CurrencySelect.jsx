import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

export default function CurrencySelect({ layout = "inline", className = "" }) {
  const id = useId();
  const { currency, setCurrency } = useCurrency();
  const stacked = layout === "stacked";

  return (
    <div className={`${stacked ? "flex flex-col gap-2" : "flex items-center gap-2"} ${className}`}>
      <label htmlFor={id} className={stacked ? "text-sm font-semibold" : "sr-only 2xl:not-sr-only 2xl:text-sm 2xl:text-text-muted"}>
        Currency
      </label>
      <div className="relative">
        <select
          id={id}
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className={`min-h-11 appearance-none rounded-field border border-input-border bg-surface py-2 pr-9 pl-3 text-[15px] font-medium text-text hover:border-text ${
            stacked ? "w-full" : ""
          }`}
        >
          <option value="GHS">{stacked ? "GH₵ (Ghana cedi)" : "GH₵"}</option>
          <option value="USD">{stacked ? "US$ (US dollar)" : "US$"}</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
