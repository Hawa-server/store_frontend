import { Star } from "lucide-react";
import { pluralise } from "../../lib/format";

const sizes = { sm: "size-3.5", md: "size-4.5", lg: "size-5" };

function Stars({ className }) {
  return (
    <span className="flex shrink-0 gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`${className} shrink-0`} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export default function StarRating({ rating, count, size = "md", label = "full", className = "" }) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  const starClass = sizes[size];
  const spoken =
    count === undefined
      ? `${rating} out of 5 stars`
      : `${rating} out of 5 stars, ${pluralise(count, "review")}`;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="text-border">
          <Stars className={starClass} />
        </span>
        <span className="absolute inset-y-0 left-0 overflow-hidden text-gold" style={{ width: `${percent}%` }}>
          <Stars className={starClass} />
        </span>
      </span>
      <span className="sr-only">{spoken}</span>
      {label === "compact" && (
        <span className="text-sm text-text-muted" aria-hidden="true">
          {rating}
          {count !== undefined && ` (${count})`}
        </span>
      )}
      {label === "short" && (
        <span className="text-sm text-text-muted" aria-hidden="true">
          {rating}/5
        </span>
      )}
      {label === "full" && (
        <span className="text-text-muted" aria-hidden="true">
          {rating} out of 5
        </span>
      )}
    </span>
  );
}
