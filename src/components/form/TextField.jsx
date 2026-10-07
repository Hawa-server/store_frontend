import { useId } from "react";
import { CircleAlert } from "lucide-react";

export const inputClasses =
  "block min-h-12 w-full rounded-field border bg-surface px-4 py-3 text-base text-text placeholder:text-placeholder transition-colors focus-visible:border-text focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent disabled:bg-disabled";

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-status-alert-text">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export default function TextField({
  label,
  error,
  hint,
  multiline = false,
  className = "",
  inputClassName = "",
  children,
  ...props
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const Control = multiline ? "textarea" : "input";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-text">
        {label}
      </label>
      <div className="relative">
        <Control
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClasses} ${error ? "border-status-alert-text" : "border-input-border"} ${inputClassName}`}
          {...props}
        />
        {children}
      </div>
      {hint && (
        <p id={hintId} className="mt-2 text-sm text-text-muted">
          {hint}
        </p>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
