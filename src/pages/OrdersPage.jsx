import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import Button from "../components/Button";
import Img from "../components/Img";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatDate, formatGhs, ikUrl, pluralise } from "../lib/format";
import { pageFromParams, statusLabels } from "../lib/orders";

function OrderCard({ order }) {
  const preview = order.items.slice(0, 3);
  const extra = order.items.length - preview.length;

  return (
    <li className="rounded-card border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-sm text-text-muted">{formatDate(order.placedAt)}</p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-wide">{order.orderNumber}</h2>
        </div>
        <p className="text-xl font-bold">{formatGhs(order.totalGhs)}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusBadge status={order.status} />
        <span className="text-sm text-text-body">{statusLabels[order.status]}</span>
      </div>

      <ul className="mt-5 space-y-3 border-t border-border pt-5">
        {preview.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-tint-default">
              <Img src={ikUrl(item.image?.url, "w-120")} alt="" className="size-full object-cover" />
            </div>
            <p className="min-w-0 flex-1 text-sm leading-snug">
              <span className="font-semibold">{item.name}</span>
              <span className="text-text-muted"> × {item.quantity}</span>
            </p>
          </li>
        ))}
      </ul>
      {extra > 0 && <p className="mt-2 text-sm text-text-muted">and {pluralise(extra, "more product")}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">{pluralise(order.itemCount, "item")}</p>
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline-offset-4 hover:text-accent-dark hover:underline"
        >
          View details<span className="sr-only"> of order {order.orderNumber}</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

export default function OrdersPage() {
  useDocumentTitle("My orders");
  const [params] = useSearchParams();
  const page = pageFromParams(params);
  const { data, error, loading, reload } = useApi(`/api/orders?page=${page}`);
  const orders = data?.items ?? [];

  return (
    <PageContainer className="py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Your account</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">My orders</h1>
          {data && data.totalItems > 0 && (
            <p className="text-text-muted">{pluralise(data.totalItems, "order")}, newest first</p>
          )}
        </div>

        <div className="mt-8">
          {error ? (
            <ErrorMessage error={error} onRetry={reload} />
          ) : loading ? (
            <div className="space-y-5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-card bg-disabled" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
              <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-tint-default text-text-muted">
                <Package className="size-7" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="mt-5 font-display text-3xl font-semibold">
                {page > 1 ? "No more orders" : "No orders yet"}
              </p>
              <p className="mx-auto mt-3 max-w-md text-text-body">
                {page > 1
                  ? "You've reached the end of your orders."
                  : "When you place an order while logged in, it will appear here so you can follow it."}
              </p>
              <Button to={page > 1 ? "/orders" : "/products"} className="mt-7">
                {page > 1 ? "Back to the first page" : "Start shopping"}
              </Button>
            </div>
          ) : (
            <>
              <ul className="space-y-5">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </ul>
              <Pagination page={data.page} totalPages={data.totalPages} label="Order pages" />
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
