import { useEffect, useId, useRef, useState } from "react";
import { Tag, X } from "lucide-react";
import Button from "../Button";
import { FieldError, inputClasses } from "../form/TextField";
import { formatGhs } from "../../lib/format";

export default function DiscountCodeBox({ applied, error, checking, onApply, onRemove }) {
  const [open, setOpen] = useState(Boolean(applied || error));
  const [code, setCode] = useState(applied?.code ?? "");
  const inputRef = useRef(null);
  const focusInput = useRef(false);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  useEffect(() => {
    if (error) setOpen(true);
  }, [error]);

  useEffect(() => {
    if (focusInput.current && inputRef.current) {
      focusInput.current = false;
      inputRef.current.focus();
    }
  });

  function apply(event) {
    event.preventDefault();
    if (checking) return;
    onApply(code.trim());
  }

  if (applied) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold">Discount code</p>
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-input-border bg-bg pr-1 pl-4 font-semibold">
          <Tag className="size-4" strokeWidth={1.8} aria-hidden="true" />
          {applied.code}
          <button
            type="button"
            onClick={() => {
              focusInput.current = true;
              setCode(applied.code);
              onRemove();
            }}
            aria-label={`Remove discount code ${applied.code}`}
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-text/8"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </span>
        <p className="text-sm font-semibold text-status-success-text">You save {formatGhs(applied.discountGhs)}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          focusInput.current = true;
          setOpen(true);
        }}
        aria-expanded="false"
        className="inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
      >
        <Tag className="size-4" strokeWidth={1.8} aria-hidden="true" />
        Have a discount code?
      </button>
    );
  }

  return (
    <form onSubmit={apply} noValidate>
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={inputId}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${inputClasses} min-w-0 flex-1 uppercase ${error ? "border-status-alert-text" : "border-input-border"}`}
        />
        <Button type="submit" variant="secondary" disabled={checking} className="min-h-12 shrink-0 px-5">
          {checking ? "Checking…" : "Apply"}
        </Button>
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </form>
  );
}
