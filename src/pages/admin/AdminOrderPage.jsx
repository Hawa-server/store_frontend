import { useEffect, useId, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import StatusBadge from "../../components/StatusBadge";
import AccessDenied from "../../components/AccessDenied";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormAlert from "../../components/form/FormAlert";
import TextField, { FieldError } from "../../components/form/TextField";
import OrderItemsCard from "../../components/orders/OrderItemsCard";
import StatusTimeline from "../../components/orders/StatusTimeline";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAnnounce } from "../../context/AnnouncerContext";
import { formatDateTime, formatGhs } from "../../lib/format";
import { parseGhsAmount } from "../../lib/orders";

const card = "rounded-card border border-border bg-surface p-5 sm:p-7";

const nextActions = {
  Pending: [
    { status: "Shipped", label: "Mark as shipped" },
    { status: "Cancelled", label: "Cancel order", confirm: true },
  ],
  Shipped: [{ status: "Delivered", label: "Mark as delivered" }],
};

const refundStatusStyles = {
  processed: "bg-status-success-bg text-status-success-text",
  requested: "bg-status-pending-bg text-status-pending-text",
  failed: "bg-status-alert-bg text-status-alert-text",
};

const refundStatusLabels = { processed: "Processed", requested: "Requested", failed: "Failed" };

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium wrap-break-word">{children}</dd>
    </div>
  );
}

function RefundForm({ order, onRefunded }) {
  const typeName = useId();
  const [type, setType] = useState("full");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [fields, setFields] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const left = order.totalGhs - order.refundedGhs;

  if (order.refundStatus === "full" || left <= 0) {
    return (
      <section aria-labelledby="refund-heading" className={card}>
        <h2 id="refund-heading" className="text-xl font-semibold">
          Refund
        </h2>
        <p className="mt-3 text-text-body">Refunded in full ({formatGhs(order.refundedGhs)}).</p>
      </section>
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setFields({});
    setResult(null);

    const body = { type, reason };
    if (type === "partial") {
      const parsed = parseGhsAmount(amount);
      if (parsed.error) {
        setFields({ amount: parsed.error });
        return;
      }
      body.amount = parsed.pesewas;
    }

    setSubmitting(true);
    try {
      const data = await api(`/api/admin/orders/${order.id}/refunds`, { method: "POST", body });
      onRefunded(data.order, data.refund);
      if (data.refund.status === "failed") {
        setResult({ tone: "error", text: `Paystack refused this refund: ${data.refund.failureReason}`, detail: "Use Retry in the refunds list." });
      } else {
        setResult({ tone: "success", text: `Refund of ${formatGhs(data.refund.amountGhs)} sent. The shopper has been emailed.` });
        setAmount("");
        setReason("");
        setType("full");
      }
    } catch (err) {
      setFields(err.fields ?? {});
      setResult({ tone: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="refund-heading" className={card}>
      <h2 id="refund-heading" className="text-xl font-semibold">
        Refund
      </h2>
      <dl className="mt-4 grid grid-cols-3 gap-3 rounded-field bg-admin-bg p-3 text-sm">
        <Detail label="Paid">{formatGhs(order.totalGhs)}</Detail>
        <Detail label="Refunded">{formatGhs(order.refundedGhs)}</Detail>
        <Detail label="Left to refund">
          <span className="font-bold">{formatGhs(left)}</span>
        </Detail>
      </dl>

      <form onSubmit={submit} noValidate className="mt-5 space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Refund type</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["full", "Full", "Everything left"],
              ["partial", "Partial", "Choose an amount"],
            ].map(([value, label, hint]) => (
              <label
                key={value}
                className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-field border p-3 ${
                  type === value ? "border-text bg-bg" : "border-input-border"
                }`}
              >
                <input
                  type="radio"
                  name={typeName}
                  value={value}
                  checked={type === value}
                  onChange={() => {
                    setType(value);
                    setFields({});
                  }}
                  className="mt-1 accent-text"
                />
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-sm text-text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          <FieldError>{fields.type}</FieldError>
        </fieldset>

        {type === "partial" && (
          <TextField
            label="Amount (GH₵)"
            inputMode="decimal"
            autoComplete="off"
            placeholder="50.00"
            hint={`Up to ${formatGhs(left)}, with at most 2 decimal places.`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={fields.amount}
          />
        )}

        <TextField
          label="Reason"
          multiline
          rows={3}
          maxLength={200}
          required
          hint={`Shown to the shopper in the refund email. ${reason.length}/200`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={fields.reason}
          inputClassName="resize-y"
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Sending refund…" : type === "full" ? `Refund ${formatGhs(left)}` : "Send partial refund"}
        </Button>
        {result && (
          <FormAlert tone={result.tone}>
            <p>{result.text}</p>
            {result.detail && <p className="mt-1 font-normal">{result.detail}</p>}
          </FormAlert>
        )}
      </form>
    </section>
  );
}

function RefundsTable({ order, onRetried }) {
  const [retrying, setRetrying] = useState(null);
  const [notice, setNotice] = useState(null);

  async function retry(refund) {
    setRetrying(refund.id);
    setNotice(null);
    try {
      const data = await api(`/api/admin/orders/${order.id}/refunds/${refund.id}/retry`, { method: "POST" });
      onRetried(data.order);
      setNotice(
        data.refund.status === "processed"
          ? { tone: "success", text: "Refund processed. The shopper has been emailed." }
          : { tone: "error", text: `It failed again: ${data.refund.failureReason}` },
      );
    } catch (err) {
      setNotice({ tone: "error", text: err.message });
    } finally {
      setRetrying(null);
    }
  }

  return (
    <section aria-labelledby="refunds-heading" className={card}>
      <h2 id="refunds-heading" className="text-xl font-semibold sm:text-2xl">
        Refunds
      </h2>
      {order.refunds.length === 0 ? (
        <p className="mt-3 text-text-muted">No refunds for this order.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {order.refunds.map((refund) => (
            <li key={refund.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-lg font-semibold whitespace-nowrap">{formatGhs(refund.amountGhs)}</p>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-semibold ${refundStatusStyles[refund.status]}`}>
                    {refundStatusLabels[refund.status] ?? refund.status}
                  </span>
                  <span className="text-sm text-text-muted capitalize">{refund.type}</span>
                </div>
                <p className="mt-1 text-text-body wrap-break-word">{refund.reason}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {formatDateTime(refund.createdAt)} · By {refund.issuedBy?.name ?? "System"}
                  {refund.providerReference && <> · Paystack refund {refund.providerReference}</>}
                </p>
                {refund.failureReason && (
                  <p className="mt-1 text-sm font-medium wrap-break-word text-status-alert-text">{refund.failureReason}</p>
                )}
              </div>
              {refund.status === "failed" && (
                <Button
                  variant="secondary"
                  onClick={() => retry(refund)}
                  disabled={retrying !== null}
                  className="min-h-11 px-5 text-sm"
                >
                  {retrying === refund.id ? "Retrying…" : "Retry"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {notice && (
        <FormAlert tone={notice.tone} className="mt-4">
          {notice.text}
        </FormAlert>
      )}
    </section>
  );
}

export default function AdminOrderPage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi(`/api/admin/orders/${encodeURIComponent(id)}`);
  const [updated, setUpdated] = useState(null);
  const [saving, setSaving] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [notice, setNotice] = useState(null);
  const announce = useAnnounce();
  const order = updated ?? data?.order;
  useDocumentTitle(order ? `${order.orderNumber} · Admin` : "Order · Admin");

  useEffect(() => {
    setUpdated(null);
    setNotice(null);
  }, [id]);

  if (error?.status === 403) return <AccessDenied />;

  async function changeStatus(action) {
    setSaving(action.status);
    setNotice(null);
    try {
      const result = await api(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        body: { status: action.status },
      });
      setUpdated(result.order);
      const text = `Order marked as ${action.status}. The shopper has been emailed.`;
      setNotice({ tone: "success", text });
      announce(text);
    } catch (err) {
      setNotice({ tone: "error", text: err.message });
      announce(err.message);
      if (err.status === 409) {
        setUpdated(null);
        reload();
      }
    } finally {
      setSaving(null);
      setConfirm(null);
    }
  }

  function applyUpdate(nextOrder) {
    setUpdated(nextOrder);
  }

  const actions = order ? nextActions[order.status] ?? [] : [];

  return (
    <>
      <Link
        to="/admin/orders"
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-text-muted hover:text-text"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All orders
      </Link>

      {error ? (
        <div className="mt-6">
          <ErrorMessage
            error={error.status === 404 || error.status === 400 ? { message: "Order not found." } : error}
            onRetry={error.status === 404 ? undefined : reload}
          />
        </div>
      ) : loading && !order ? (
        <div className="mt-6 space-y-6" aria-hidden="true">
          <div className="h-12 w-1/2 animate-pulse rounded-full bg-disabled" />
          <div className="h-80 animate-pulse rounded-card bg-disabled" />
        </div>
      ) : (
        <>
          <header className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              <p className="text-sm text-text-muted">Placed {formatDateTime(order.placedAt)}</p>
              <h1 className="mt-1 font-display text-3xl leading-tight font-semibold whitespace-nowrap sm:text-5xl">{order.orderNumber}</h1>
              <div className="mt-3">
                <StatusBadge status={order.status} />
              </div>
            </div>
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {actions.map((action) => (
                  <Button
                    key={action.status}
                    variant={action.confirm ? "secondary" : "primary"}
                    disabled={saving !== null}
                    onClick={() => (action.confirm ? setConfirm(action) : changeStatus(action))}
                  >
                    {saving === action.status ? "Saving…" : action.label}
                  </Button>
                ))}
              </div>
            )}
          </header>

          {notice && (
            <FormAlert tone={notice.tone} className="mt-6 max-w-2xl">
              {notice.text}
            </FormAlert>
          )}

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
            <div className="space-y-6">
              <OrderItemsCard order={order} totalLabel="Total paid" />
              <RefundsTable order={order} onRetried={applyUpdate} />
              <section aria-labelledby="history-heading" className={card}>
                <h2 id="history-heading" className="text-xl font-semibold sm:text-2xl">
                  Status history
                </h2>
                <StatusTimeline history={order.statusHistory} showChangedBy />
              </section>
            </div>

            <div className="space-y-6">
              <RefundForm key={order.id} order={order} onRefunded={applyUpdate} />
              <section aria-labelledby="contact-heading" className={card}>
                <h2 id="contact-heading" className="text-xl font-semibold">
                  Customer
                </h2>
                <dl className="mt-4 space-y-3">
                  <Detail label="Name">
                    {order.customer.name}
                    {order.customer.isGuest && (
                      <span className="ml-2 rounded-full bg-status-cancelled-bg px-2 py-0.5 text-xs font-semibold text-status-cancelled-text">
                        Guest
                      </span>
                    )}
                  </Detail>
                  <Detail label="Email">{order.customer.email}</Detail>
                  <Detail label="Phone">{order.customer.phone}</Detail>
                  <Detail label="Delivery address">
                    <span className="whitespace-pre-line">{order.deliveryAddress}</span>
                  </Detail>
                </dl>
              </section>
              <section aria-labelledby="payment-heading" className={card}>
                <h2 id="payment-heading" className="text-xl font-semibold">
                  Payment
                </h2>
                <dl className="mt-4 space-y-3">
                  <Detail label="Method">{order.paymentMethod === "mobile_money" ? "Mobile money" : order.paymentMethod}</Detail>
                  <Detail label="Paystack reference">
                    <span className="font-mono text-sm">{order.paymentReference}</span>
                  </Detail>
                </dl>
              </section>
            </div>
          </div>

          <ConfirmDialog
            open={confirm !== null}
            title="Cancel this order?"
            message="This puts the items back into stock and refunds everything not refunded yet. It can't be undone."
            confirmLabel="Yes, cancel order"
            busy={saving !== null}
            onConfirm={() => changeStatus(confirm)}
            onCancel={() => setConfirm(null)}
          />
        </>
      )}
    </>
  );
}
