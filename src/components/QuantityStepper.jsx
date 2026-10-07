import { useEffect, useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FieldError } from "./form/TextField";

const MAX = 99;

const stepButton =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-text/8 disabled:cursor-not-allowed disabled:text-text-muted/50 disabled:hover:bg-transparent";

export function parseQuantity(raw, min) {
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) return null;
  const quantity = Number(text);
  return quantity >= min && quantity <= MAX ? quantity : null;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 0,
  productName,
  disabled = false,
  size = "md",
  className = "",
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState(null);
  const [settled, setSettled] = useState(0);

  useEffect(() => {
    setDraft(String(value));
  }, [value, settled]);

  function send(quantity) {
    Promise.resolve(onChange(quantity)).finally(() => setSettled((n) => n + 1));
  }

  function commit() {
    const quantity = parseQuantity(draft, min);
    if (quantity === null) {
      setError(`Enter a whole number from ${min} to ${MAX}.`);
      setDraft(String(value));
      return;
    }
    setError(null);
    if (quantity !== value) send(quantity);
  }

  function step(delta) {
    setError(null);
    send(value + delta);
  }

  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <div
        className={`inline-flex items-center rounded-full border border-input-border bg-surface ${
          size === "lg" ? "h-14 px-1.5" : "h-12 px-0.5"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <button
          type="button"
          className={stepButton}
          onClick={() => step(-1)}
          disabled={disabled || value <= min}
          aria-label={`Decrease quantity of ${productName}`}
        >
          <Minus className="size-4.5" strokeWidth={1.8} aria-hidden="true" />
        </button>
        <label htmlFor={id} className="sr-only">
          Quantity of {productName}
        </label>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={draft}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              setDraft(String(value));
              setError(null);
            }
          }}
          className="h-11 w-11 rounded-md bg-transparent text-center text-base font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
        />
        <button
          type="button"
          className={stepButton}
          onClick={() => step(1)}
          disabled={disabled || value >= MAX}
          aria-label={`Increase quantity of ${productName}`}
        >
          <Plus className="size-4.5" strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
