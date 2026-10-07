import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import AccessDenied from "../../components/AccessDenied";
import TextField, { inputClasses } from "../../components/form/TextField";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { formatDate, formatGhs, pluralise } from "../../lib/format";
import { STATUSES, pageFromParams } from "../../lib/orders";

const DATE_ORDER_ERROR = "The end date must be on or after the start date.";

function refundText(order) {
  if (order.refundStatus === "full") return "Full";
  if (order.refundStatus === "partial") return `Partial · ${formatGhs(order.refundedGhs)}`;
  return "None";
}

function readFilters(params) {
  return { status: params.get("status") ?? "", from: params.get("from") ?? "", to: params.get("to") ?? "" };
}

export default function AdminOrdersPage() {
  useDocumentTitle("Orders · Admin");
  const [params, setParams] = useSearchParams();
  const applied = readFilters(params);
  const page = pageFromParams(params);
  const [form, setForm] = useState(applied);
  const [dateError, setDateError] = useState(null);

  const query = new URLSearchParams();
  if (applied.status) query.set("status", applied.status);
  if (applied.from) query.set("from", applied.from);
  if (applied.to) query.set("to", applied.to);
  if (page > 1) query.set("page", String(page));
  const { data, error, loading, reload } = useApi(`/api/admin/orders?${query}`);

  useEffect(() => {
    setForm(readFilters(params));
  }, [params]);

  if (error?.status === 403) return <AccessDenied />;

  const filtered = Boolean(applied.status || applied.from || applied.to);
  const serverDateError = error?.fields?.to;
  const update = (key) => (event) => {
    setForm((f) => ({ ...f, [key]: event.target.value }));
    setDateError(null);
  };

  function apply(event) {
    event.preventDefault();
    if (form.from && form.to && form.to < form.from) {
      setDateError(DATE_ORDER_ERROR);
      return;
    }
    const next = new URLSearchParams();
    if (form.status) next.set("status", form.status);
    if (form.from) next.set("from", form.from);
    if (form.to) next.set("to", form.to);
    setParams(next);
  }

  function clear() {
    setDateError(null);
    setForm({ status: "", from: "", to: "" });
    setParams(new URLSearchParams());
  }

  const orders = data?.items ?? [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Orders</h1>
        {data && (
          <p className="text-text-muted">
            {pluralise(data.totalItems, "order")}
            {filtered ? " match these filters" : ", newest first"}
          </p>
        )}
      </div>

      <form
        onSubmit={apply}
        noValidate
        aria-label="Filter orders"
        className="mt-8 grid gap-4 rounded-card border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-start"
      >
        <div>
          <label htmlFor="filter-status" className="mb-2 block text-sm font-semibold">
            Status
          </label>
          <select
            id="filter-status"
            value={form.status}
            onChange={update("status")}
            className={`${inputClasses} border-input-border`}
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <TextField label="From" type="date" value={form.from} onChange={update("from")} max={form.to || undefined} />
        <TextField
          label="To"
          type="date"
          value={form.to}
          onChange={update("to")}
          min={form.from || undefined}
          error={dateError ?? serverDateError}
        />
        <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-1 lg:pt-7">
          <Button type="submit">Apply</Button>
          <Button variant="secondary" onClick={clear} disabled={!filtered && !form.status && !form.from && !form.to}>
            Clear filters
          </Button>
        </div>
      </form>

      <div className="mt-8">
        {error && !serverDateError ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : serverDateError ? (
          <p className="text-text-muted">Fix the dates above to see orders.</p>
        ) : loading ? (
          <div className="h-80 animate-pulse rounded-card bg-disabled" aria-hidden="true" />
        ) : orders.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-12 text-center">
            <p className="font-display text-3xl font-semibold">
              {filtered ? "No orders match these filters" : "No orders yet"}
            </p>
            {filtered && (
              <Button variant="secondary" onClick={clear} className="mt-6">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-card border border-border bg-surface" tabIndex={0} role="region" aria-label="Orders table">
              <table className="w-full min-w-[46rem] text-left">
                <thead>
                  <tr className="border-b border-border text-sm text-text-muted">
                    <th scope="col" className="px-5 py-3 font-medium">Order</th>
                    <th scope="col" className="px-5 py-3 font-medium">Date</th>
                    <th scope="col" className="px-5 py-3 font-medium">Customer</th>
                    <th scope="col" className="px-5 py-3 font-medium">Total</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-3">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex min-h-11 items-center font-semibold whitespace-nowrap text-accent underline underline-offset-4 hover:text-accent-dark"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">{formatDate(order.placedAt)}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium">
                          {order.customer.name}
                          {order.customer.isGuest && (
                            <span className="ml-2 rounded-full bg-status-cancelled-bg px-2 py-0.5 text-xs font-semibold text-status-cancelled-text">
                              Guest
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-text-muted">{order.customer.email}</p>
                      </td>
                      <td className="px-5 py-3 font-semibold whitespace-nowrap">{formatGhs(order.totalGhs)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">{refundText(order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} label="Order pages" />
          </>
        )}
      </div>
    </>
  );
}
