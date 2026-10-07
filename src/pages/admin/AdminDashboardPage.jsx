import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import AccessDenied from "../../components/AccessDenied";
import { FieldError, inputClasses } from "../../components/form/TextField";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAnnounce } from "../../context/AnnouncerContext";
import { useAdminStats } from "../../context/AdminStatsContext";
import { formatDate, formatGhs, pluralise } from "../../lib/format";

const PERIODS = [
  ["today", "Today"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["all", "All time"],
];

const THRESHOLD_ERROR = "Enter a whole number from 0 to 1,000.";
const card = "rounded-card border border-border bg-surface p-5 sm:p-6";
const plainLink = "font-semibold text-accent underline underline-offset-4 hover:text-accent-dark";

function shortDate(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

function periodText(period) {
  if (!period?.from) return "All time";
  if (period.from === period.to) return shortDate(period.to);
  return `${shortDate(period.from)} – ${shortDate(period.to)}`;
}

function StatCard({ label, value, note }) {
  return (
    <div className={card}>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-3 text-3xl font-bold wrap-break-word xl:text-2xl 2xl:text-3xl">{value}</p>
      {note && <div className="mt-2 text-sm text-text-muted">{note}</div>}
    </div>
  );
}

function ThresholdForm({ current, onSaved }) {
  const [value, setValue] = useState(String(current));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(String(current));
  }, [current]);

  async function submit(event) {
    event.preventDefault();
    setSaved(false);
    const text = value.trim();
    if (!/^\d+$/.test(text) || Number(text) > 1000) {
      setError(THRESHOLD_ERROR);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const data = await api("/api/admin/settings/low-stock-threshold", {
        method: "PATCH",
        body: { value: Number(text) },
      });
      setSaved(true);
      onSaved(data.lowStockThreshold);
    } catch (err) {
      setError(err.fields?.value ?? err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 border-t border-border pt-5">
      <label htmlFor="low-stock-threshold" className="block text-sm font-semibold">
        Low-stock threshold
      </label>
      <p id="threshold-hint" className="mt-1 text-sm text-text-muted">
        Products with this many or fewer left are listed. 0 lists only out-of-stock products.
      </p>
      <div className="mt-3 flex gap-3">
        <input
          id="low-stock-threshold"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSaved(false);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "threshold-hint threshold-error" : "threshold-hint"}
          className={`${inputClasses} max-w-32 ${error ? "border-status-alert-text" : "border-input-border"}`}
        />
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <FieldError id="threshold-error">{error}</FieldError>
      {saved && (
        <p role="status" className="mt-2 text-sm font-medium text-status-success-text">
          Threshold saved.
        </p>
      )}
    </form>
  );
}

export default function AdminDashboardPage() {
  useDocumentTitle("Dashboard · Admin");
  const [params, setParams] = useSearchParams();
  const requested = params.get("period");
  const period = PERIODS.some(([value]) => value === requested) ? requested : "7d";
  const { data, error, loading, reload } = useApi(`/api/admin/dashboard?period=${period}`);
  const { setStock } = useAdminStats();
  const announce = useAnnounce();

  useEffect(() => {
    if (data?.stock) setStock(data.stock);
  }, [data, setStock]);

  if (error?.status === 403) return <AccessDenied />;

  function choosePeriod(value) {
    const next = new URLSearchParams();
    if (value !== "7d") next.set("period", value);
    setParams(next);
    announce(`Showing ${PERIODS.find(([v]) => v === value)[1].toLowerCase()}`);
  }

  const sales = data?.sales;
  const refunds = data?.refunds;
  const stock = data?.stock;
  const alerts = stock ? [...stock.outOfStock, ...stock.lowStock] : [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Dashboard</h1>
          <p className="mt-2 min-h-6 text-text-muted">{data ? periodText(data.period) : ""}</p>
        </div>
        <div role="group" aria-label="Period" className="grid w-full grid-cols-2 gap-1 rounded-card border border-border bg-surface p-1 sm:flex sm:w-auto sm:rounded-full">
          {PERIODS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => choosePeriod(value)}
              aria-pressed={period === value}
              className={`min-h-11 rounded-full px-4 text-[15px] font-medium whitespace-nowrap transition-colors sm:px-5 ${
                period === value ? "bg-text text-bg" : "text-text hover:bg-text/8"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : !data ? (
          <div className="space-y-6" aria-hidden="true">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-card bg-disabled" />
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-card bg-disabled" />
          </div>
        ) : (
          <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
            <section aria-label="Sales summary" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Revenue" value={formatGhs(sales.revenueGhs)} note="Paid, minus refunds" />
              <StatCard
                label="Orders"
                value={sales.orderCount}
                note="Cancelled orders not counted"
              />
              <StatCard
                label="Average order value"
                value={sales.averageOrderValueGhs === null ? "—" : formatGhs(sales.averageOrderValueGhs)}
                note="Revenue ÷ orders"
              />
              <StatCard
                label="Refunded"
                value={formatGhs(refunds.refundedInPeriodGhs)}
                note={
                  refunds.refundedInPeriodGhs === 0 && refunds.failedRefunds === 0 ? (
                    "No refunds in this period."
                  ) : refunds.failedRefunds > 0 ? (
                    <>
                      <span className="font-semibold text-status-alert-text">
                        {pluralise(refunds.failedRefunds, "failed refund")}
                      </span>
                      : open each order's Refunds section to retry.{" "}
                      <Link to="/admin/orders" className={plainLink}>
                        View orders
                      </Link>
                    </>
                  ) : (
                    "0 failed refunds"
                  )
                }
              />
            </section>

            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]">
              <section aria-labelledby="recent-heading" className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="recent-heading" className="text-xl font-semibold sm:text-2xl">
                    Recent orders
                  </h2>
                  <Link to="/admin/orders" className={`inline-flex min-h-11 items-center ${plainLink}`}>
                    View all orders
                  </Link>
                </div>
                {data.recentOrders.length === 0 ? (
                  <p className="mt-4 text-text-muted">No orders yet.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto" role="region" aria-label="Recent orders table" tabIndex={0}>
                    <table className="w-full min-w-[36rem] text-left">
                      <thead>
                        <tr className="border-b border-border text-sm text-text-muted">
                          <th scope="col" className="py-2 pr-4 font-medium">Order</th>
                          <th scope="col" className="py-2 pr-4 font-medium">Date</th>
                          <th scope="col" className="py-2 pr-4 font-medium">Customer</th>
                          <th scope="col" className="py-2 pr-4 font-medium">Total</th>
                          <th scope="col" className="py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-border last:border-b-0">
                            <td className="py-2 pr-4">
                              <Link
                                to={`/admin/orders/${order.id}`}
                                className={`inline-flex min-h-11 items-center whitespace-nowrap ${plainLink}`}
                              >
                                {order.orderNumber}
                              </Link>
                            </td>
                            <td className="py-2 pr-4 whitespace-nowrap">{formatDate(order.placedAt)}</td>
                            <td className="py-2 pr-4">{order.customerName}</td>
                            <td className="py-2 pr-4 font-semibold whitespace-nowrap">{formatGhs(order.totalGhs)}</td>
                            <td className="py-2">
                              <StatusBadge status={order.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <div className="grid items-start gap-6 md:grid-cols-2 2xl:grid-cols-1">
                <section aria-labelledby="stock-heading" className={card}>
                  <h2 id="stock-heading" className="text-xl font-semibold sm:text-2xl">
                    Low-stock alerts
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">Threshold: {stock.lowStockThreshold}</p>
                  {alerts.length === 0 ? (
                    <p className="mt-4 text-text-body">All products are well stocked.</p>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      {alerts.map((product) => {
                        const out = product.stock === 0;
                        return (
                          <li
                            key={product.id}
                            className={`flex items-center justify-between gap-3 rounded-field px-4 py-3 ${
                              out
                                ? "bg-status-alert-bg text-status-alert-text"
                                : "bg-status-pending-bg text-status-pending-text"
                            }`}
                          >
                            <Link
                              to={`/product/${product.id}`}
                              className="min-w-0 font-semibold wrap-break-word underline-offset-4 hover:underline"
                            >
                              {product.name}
                            </Link>
                            <span className="shrink-0 text-sm font-semibold">
                              {out ? "Out of stock" : `${product.stock} left`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <ThresholdForm
                    current={stock.lowStockThreshold}
                    onSaved={(value) => {
                      announce(`Low-stock threshold set to ${value}`);
                      reload();
                    }}
                  />
                </section>

                <section aria-labelledby="attention-heading" className={card}>
                  <h2 id="attention-heading" className="text-xl font-semibold sm:text-2xl">
                    Needs attention
                  </h2>
                  <dl className="mt-4 divide-y divide-border">
                    <div className="flex items-center justify-between gap-4 py-2">
                      <dt>
                        <Link
                          to="/admin/orders?status=Pending"
                          className={`inline-flex min-h-11 items-center ${plainLink}`}
                        >
                          Pending orders
                        </Link>
                      </dt>
                      <dd className="text-xl font-bold">{data.counts.pendingOrders}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <dt>
                        <Link
                          to="/admin/reviews?status=hidden"
                          className={`inline-flex min-h-11 items-center ${plainLink}`}
                        >
                          Hidden reviews
                        </Link>
                      </dt>
                      <dd className="text-xl font-bold">{data.counts.hiddenReviews}</dd>
                    </div>
                    <div className="py-3">
                      <div className="flex items-center justify-between gap-4">
                        <dt>Failed refunds</dt>
                        <dd className="text-xl font-bold">{refunds.failedRefunds}</dd>
                      </div>
                      {refunds.failedRefunds > 0 && (
                        <p className="mt-1 text-sm text-text-muted">
                          Open each order's Refunds section to retry.{" "}
                          <Link to="/admin/orders" className={plainLink}>
                            View orders
                          </Link>
                        </p>
                      )}
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
