import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, RotateCcw, Smartphone } from "lucide-react";
import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";
import FormAlert from "../components/form/FormAlert";
import OrderItemsCard from "../components/orders/OrderItemsCard";
import StatusTimeline from "../components/orders/StatusTimeline";
import NotFoundPage from "./NotFoundPage";
import { api } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAnnounce } from "../context/AnnouncerContext";
import { formatDate, formatDateTime, formatGhs } from "../lib/format";
import { shopperRefundText, statusLabels } from "../lib/orders";

const REFUND_TIMING = "Refunds usually take a few business days to reach your mobile money wallet.";
const card = "rounded-card border border-border bg-surface p-5 sm:p-7";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi(`/api/orders/${encodeURIComponent(id)}`);
  const [updated, setUpdated] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState(null);
  const announce = useAnnounce();
  const order = updated ?? data?.order;
  useDocumentTitle(order ? `Order ${order.orderNumber}` : "Order details");

  useEffect(() => {
    setUpdated(null);
    setNotice(null);
  }, [id]);

  if (error && (error.status === 404 || error.status === 400)) {
    return (
      <NotFoundPage
        title="We couldn't find that order"
        message="It may belong to a different account, or the link may be wrong."
        actions={<Button to="/orders">Back to my orders</Button>}
      />
    );
  }

  async function cancelOrder() {
    setCancelling(true);
    try {
      const result = await api(`/api/orders/${order.id}/cancel`, { method: "POST" });
      setUpdated(result.order);
      setNotice({ tone: "success", text: result.message ?? "Order cancelled", detail: REFUND_TIMING });
      announce(result.message ?? "Order cancelled");
    } catch (err) {
      setNotice({ tone: "error", text: err.message });
      announce(err.message);
      if (err.status === 409) {
        setUpdated(null);
        reload();
      }
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  }

  return (
    <PageContainer className="py-8 lg:py-12">
      <Link
        to="/orders"
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-text-muted hover:text-text"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        My orders
      </Link>

      {error ? (
        <div className="mt-6">
          <ErrorMessage error={error} onRetry={reload} />
        </div>
      ) : loading && !order ? (
        <div className="mt-6 space-y-6" aria-hidden="true">
          <div className="h-12 w-1/2 animate-pulse rounded-full bg-disabled" />
          <div className="h-72 animate-pulse rounded-card bg-disabled" />
        </div>
      ) : (
        <>
          <header className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              <p className="text-sm text-text-muted">Placed {formatDateTime(order.placedAt)}</p>
              <h1 className="mt-1 font-display text-3xl leading-tight font-semibold sm:text-5xl">
                Order <span className="whitespace-nowrap">{order.orderNumber}</span>
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <StatusBadge status={order.status} />
                <span className="text-text-body">{statusLabels[order.status]}</span>
              </div>
            </div>
            {order.canCancel && (
              <Button variant="secondary" onClick={() => setConfirming(true)}>
                Cancel order
              </Button>
            )}
          </header>

          {notice && (
            <FormAlert tone={notice.tone} className="mt-6 max-w-2xl">
              <p>{notice.text}</p>
              {notice.detail && <p className="mt-1 font-normal">{notice.detail}</p>}
            </FormAlert>
          )}

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
            <div className="space-y-6">
              <OrderItemsCard order={order} title="Items" />

              {order.refunds.length > 0 && (
                <section aria-labelledby="refunds-heading" className={card}>
                  <h2 id="refunds-heading" className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
                    <RotateCcw className="size-5" strokeWidth={1.7} aria-hidden="true" />
                    Refunds
                  </h2>
                  <ul className="mt-4 divide-y divide-border">
                    {order.refunds.map((refund) => (
                      <li key={refund.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                        <div>
                          <p className="font-semibold">{shopperRefundText(refund.status)}</p>
                          <p className="text-sm text-text-muted">
                            {formatDate(refund.createdAt)}
                            {refund.reason && <> · {refund.reason}</>}
                          </p>
                        </div>
                        <p className="font-semibold">{formatGhs(refund.amountGhs)}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-text-muted">{REFUND_TIMING}</p>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section aria-labelledby="history-heading" className={card}>
                <h2 id="history-heading" className="text-xl font-semibold">
                  Order progress
                </h2>
                <StatusTimeline history={order.statusHistory} />
              </section>
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

          <ConfirmDialog
            open={confirming}
            title="Cancel this order?"
            message="This can't be undone. We'll put the items back and refund your mobile money wallet."
            confirmLabel="Yes, cancel order"
            busy={cancelling}
            onConfirm={cancelOrder}
            onCancel={() => setConfirming(false)}
          />
        </>
      )}
    </PageContainer>
  );
}
