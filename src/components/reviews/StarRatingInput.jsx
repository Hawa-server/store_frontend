import { useId } from "react";
import { Star } from "lucide-react";
import { FieldError } from "../form/TextField";

export default function StarRatingInput({ value, onChange, error }) {
  const name = useId();
  const errorId = error ? `${name}-error` : undefined;

  return (
    <fieldset aria-describedby={errorId}>
      <legend className="mb-2 text-sm font-semibold">Your rating</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full outline-offset-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
            />
            <Star
              className={`size-8 transition-colors ${star <= value ? "text-gold" : "text-input-border"}`}
              fill="currentColor"
              strokeWidth={0}
              aria-hidden="true"
            />
            <span className="sr-only">{star} out of 5 stars</span>
          </label>
        ))}
      </div>
      <p className="mt-1 text-sm text-text-muted" aria-hidden="true">
        {value ? `${value} out of 5 stars` : "Choose from 1 to 5 stars"}
      </p>
      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
}
