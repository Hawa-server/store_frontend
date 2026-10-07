import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-input-border bg-surface px-4 font-semibold transition-colors hover:border-text";
const disabledClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-disabled px-4 font-semibold text-text-muted";

export default function Pagination({ page, totalPages, label = "Pagination" }) {
  const [params] = useSearchParams();
  if (totalPages <= 1) return null;

  const hrefFor = (target) => {
    const next = new URLSearchParams(params);
    if (target <= 1) next.delete("page");
    else next.set("page", String(target));
    const query = next.toString();
    return query ? `?${query}` : "?";
  };

  return (
    <nav aria-label={label} className="mt-8 flex flex-wrap items-center justify-between gap-3">
      {page > 1 ? (
        <Link to={hrefFor(page - 1)} className={linkClass}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          <ChevronLeft className="size-4" />
          Previous
        </span>
      )}
      <p className="text-text-muted" aria-current="page">
        Page {Math.min(page, totalPages)} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link to={hrefFor(page + 1)} className={linkClass}>
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          Next
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
