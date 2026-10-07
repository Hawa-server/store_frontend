import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CircleCheck, MapPin, Smartphone } from "lucide-react";
import Button from "../components/Button";
import Img from "../components/Img";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import StatusBadge from "../components/StatusBadge";
import NotFoundPage from "./NotFoundPage";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCart } from "../context/CartContext";
import { firstName, useAuth } from "../context/AuthContext";
import { formatDateTime, formatGhs, ikUrl, tintClass } from "../lib/format";

const statusNotes = {
  Pending: "We're preparing your order.",
  Shipped: "Your order is on its way.",
  Delivered: "Your order has been delivered.",
  Cancelled: "This order was cancelled.",
};

const card = "rounded-card border border-border bg-surface p-5 sm:p-8";

function Row({ label, children, strong = false }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? "pt-1" : ""}`}>
      <dt className={strong ? "text-lg font-semibold" : "text-text-body"}>{label}</dt>
      <dd className={strong ? "text-3xl font-bold sm:text-4xl" : "font-medium"}>{children}</dd>
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="space-y-3">
        <div className="size-14 rounded-full bg-disabled" />
        <div className="h-12 w-2/3 rounded-full bg-disabled" />
        <div className="h-5 w-1/2 rounded-full bg-disabled" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="h-64 rounded-card bg-disabled" />
        <div className="h-64 rounded-card bg-disabled" />
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  useDocumentTitle("Order confirmed");
  const { token } = useParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { data, error, loading, reload } = useApi(`/api/orders/confirmation/${encodeURIComponent(token)}`);
  const order = data?.order;

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (error && (error.status === 404 || error.status === 400)) {
    return (
      <NotFoundPage
        title="This order link is invalid or has expired"
        message="Order links work for 30 days. If you placed this order while logged in, you can still find it in your account."
        actions={
          <>
            <Button to="/products">Back to the shop</Button>
            {user && (
              <Button to="/orders" variant="secondary">
                My orders
              </Button>
            )}
          </>
        }
      />
    );
  }

  return (
    <PageContainer className="py-10 lg:py-14">
      {error ? (
        <ErrorMessage error={error} onRetry={reload} />
      ) : loading ? (
        <ConfirmationSkeleton />
      ) : (
        <>
          <header className="max-w-3xl">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-status-success-bg text-status-success-text">
              <CircleCheck className="size-8" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-accent uppercase">Order confirmed</p>
            <h1 className="mt-2 font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl lg:text-6xl">
              Thank you, {firstName({ name: order.delivery.name })}!
            </h1>
            <p className="mt-4 text-lg text-text-body">
              Your order number is{" "}
              <strong className="font-semibold tracking-wide whitespace-nowrap text-text">{order.orderNumber}</strong>.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-text-muted">
              <StatusBadge status={order.status} />
              <span>{statusNotes[order.status]}</span>
              <span>Placed {formatDateTime(order.placedAt)}</span>
            </div>
            <p className="mt-3 text-text-muted">
              We've emailed your receipt to{" "}
              <span className="font-semibold wrap-break-word text-text">{order.email}</span>.
            </p>
          </header>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
            <section aria-labelledby="items-heading" className={card}>
              <h2 id="items-heading" className="text-2xl font-semibold">
                Your items
              </h2>
              <ul className="mt-6 divide-y divide-border">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div
                      className={`size-16 shrink-0 overflow-hidden rounded-xl sm:size-20 ${tintClass()}`}
                    >
                      <Img
                        src={ikUrl(item.image?.url, "w-200")}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug font-semibold">{item.name}</p>
                      <p className="text-sm text-text-muted">
                        Qty {item.quantity} × {formatGhs(item.unitPriceGhs)}
                      </p>
                    </div>
                    <p className="font-semibold whitespace-nowrap">{formatGhs(item.lineTotalGhs)}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="paid-heading" className={`${card} lg:sticky lg:top-28 lg:row-span-2`}>
              <h2 id="paid-heading" className="text-2xl font-semibold">
                Payment summary
              </h2>
              <dl className="mt-6 space-y-3">
                <Row label="Subtotal">{formatGhs(order.subtotalGhs)}</Row>
                <Row label="Delivery">{formatGhs(order.deliveryFeeGhs)}</Row>
                <div className="border-t border-border pt-4">
                  <Row label="Total paid" strong>
                    {formatGhs(order.totalGhs)}
                  </Row>
                </div>
              </dl>
              <div className="mt-8 flex flex-col gap-3">
                <Button to="/products" className="min-h-14 w-full text-lg">
                  Continue shopping
                </Button>
                {user && (
                  <Button to="/orders" variant="secondary" className="w-full">
                    My orders
                  </Button>
                )}
              </div>
            </section>

            <div className="grid gap-8 sm:grid-cols-2">
              <section aria-labelledby="delivery-heading" className={card}>
                <h2 id="delivery-heading" className="flex items-center gap-2 text-xl font-semibold">
                  <MapPin className="size-5" strokeWidth={1.7} aria-hidden="true" />
                  Delivery
                </h2>
                <p className="mt-4 font-semibold">{order.delivery.name}</p>
                <p className="text-text-body">{order.delivery.phone}</p>
                <p className="mt-2 whitespace-pre-line text-text-body">{order.delivery.address}</p>
              </section>
              <section aria-labelledby="payment-heading" className={card}>
                <h2 id="payment-heading" className="flex items-center gap-2 text-xl font-semibold">
                  <Smartphone className="size-5" strokeWidth={1.7} aria-hidden="true" />
                  Payment
                </h2>
                <p className="mt-4 font-semibold">
                  {order.paymentMethod === "mobile_money" ? "Mobile money" : order.paymentMethod}
                </p>
                <p className="text-text-body">Paid in Ghana cedis (GH₵)</p>
              </section>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
