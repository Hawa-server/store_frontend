import { Link, useSearchParams } from "react-router-dom";
import { Plus, TriangleAlert } from "lucide-react";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";
import AccessDenied from "../../components/AccessDenied";
import { inputClasses } from "../../components/form/TextField";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { pluralise } from "../../lib/format";
import { pageFromParams } from "../../lib/orders";
import { DISCOUNT_STATUSES, datesText, statusText, usageText, valueText } from "../../lib/discounts";

const badgeStyles = {
  active: "bg-status-success-bg text-status-success-text",
  scheduled: "bg-status-pending-bg text-status-pending-text",
  expired: "bg-status-cancelled-bg text-status-cancelled-text",
  used_up: "bg-status-cancelled-bg text-status-cancelled-text",
  off: "bg-status-alert-bg text-status-alert-text",
};

export function DiscountStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap ${badgeStyles[status] ?? badgeStyles.off}`}>
      {statusText[status] ?? status}
    </span>
  );
}

export function OverLimitNote({ code }) {
  if (!code.overLimit) return null;
  return (
    <span className="mt-1 flex items-center gap-1 text-sm font-medium text-status-alert-text">
      <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      Used more than its limit
    </span>
  );
}

const editLink = "inline-flex min-h-11 items-center self-start rounded-full border border-text px-4 text-sm font-semibold hover:bg-text hover:text-bg";

export default function AdminDiscountsPage() {
  useDocumentTitle("Discounts · Admin");
  const [params, setParams] = useSearchParams();
  const statusParam = params.get("status") ?? "";
  const status = DISCOUNT_STATUSES.some(([value]) => value === statusParam) ? statusParam : "";
  const page = pageFromParams(params);

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const { data, error, loading, reload } = useApi(`/api/admin/discount-codes?${query}`);

  if (error?.status === 403) return <AccessDenied />;

  function setStatus(value) {
    const next = new URLSearchParams();
    if (value) next.set("status", value);
    setParams(next);
  }

  const codes = data?.items ?? [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Discounts</h1>
          {data && (
            <p className="mt-2 text-text-muted">
              {pluralise(data.totalItems, "code")}
              {status ? ` with status “${statusText[status]}”` : ", newest first"}
            </p>
          )}
        </div>
        <Button to="/admin/discounts/new">
          <Plus className="size-5" aria-hidden="true" />
          New code
        </Button>
      </div>

      <div className="mt-8 max-w-xs">
        <label htmlFor="discount-status" className="mb-2 block text-sm font-semibold">
          Status
        </label>
        <select
          id="discount-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={`${inputClasses} border-input-border`}
        >
          <option value="">All codes</option>
          {DISCOUNT_STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="space-y-3" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-field bg-disabled" />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-12 text-center">
            <p className="font-display text-3xl font-semibold">
              {status ? `No ${statusText[status].toLowerCase()} codes.` : "No discount codes yet."}
            </p>
            {status ? (
              <Button variant="secondary" onClick={() => setStatus("")} className="mt-6">
                Show all codes
              </Button>
            ) : (
              <Button to="/admin/discounts/new" className="mt-6">
                Create a code
              </Button>
            )}
          </div>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""} aria-busy={loading}>
            <ul className="space-y-3 md:hidden" aria-label="Discount codes">
              {codes.map((code) => (
                <li key={code.id} className="flex gap-4 rounded-card border border-border bg-surface p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold tracking-wide">{code.code}</p>
                      <DiscountStatusBadge status={code.status} />
                    </div>
                    <p className="mt-1">{valueText(code)}</p>
                    <p className="text-sm text-text-muted">{datesText(code)}</p>
                    <p className="text-sm text-text-muted">{usageText(code)}</p>
                    <OverLimitNote code={code} />
                  </div>
                  <Link to={`/admin/discounts/${code.id}`} className={editLink}>
                    Edit<span className="sr-only"> {code.code}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-card border border-border bg-surface md:block" role="region" aria-label="Discount codes table" tabIndex={0}>
              <table className="w-full min-w-[44rem] text-left">
                <thead>
                  <tr className="border-b border-border text-sm text-text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">Code</th>
                    <th scope="col" className="px-4 py-3 font-medium">Discount</th>
                    <th scope="col" className="px-4 py-3 font-medium">Dates</th>
                    <th scope="col" className="px-4 py-3 font-medium">Used</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/discounts/${code.id}`}
                          className="-my-2 inline-block py-2 font-semibold tracking-wide text-accent underline underline-offset-4 hover:text-accent-dark"
                        >
                          {code.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{valueText(code)}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{datesText(code)}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {usageText(code)}
                        <OverLimitNote code={code} />
                      </td>
                      <td className="px-4 py-3">
                        <DiscountStatusBadge status={code.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} label="Discount code pages" />
          </div>
        )}
      </div>
    </>
  );
}
