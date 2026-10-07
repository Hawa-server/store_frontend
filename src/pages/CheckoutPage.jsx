import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, ShoppingBag, Smartphone, TriangleAlert } from "lucide-react";
import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import TextField from "../components/form/TextField";
import FormAlert from "../components/form/FormAlert";
import OrderSummary from "../components/checkout/OrderSummary";
import PaymentStatus from "../components/checkout/PaymentStatus";
import { api } from "../lib/api";
import { formatGhs } from "../lib/format";
import { loadPaystack } from "../lib/paystack";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useAnnounce } from "../context/AnnouncerContext";
import { useVerifyPayment } from "../hooks/useVerifyPayment";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const POPUP_ERROR = "We couldn't open the payment window. Please try again.";
const linkClass = "inline-flex min-h-11 items-center font-semibold underline underline-offset-4";

function SectionHeading({ children }) {
  return <h2 className="text-xl font-semibold sm:text-2xl">{children}</h2>;
}

function PaymentMethod() {
  return (
    <div className="flex items-start gap-4 rounded-card border-2 border-text bg-surface p-5">
      <Smartphone className="mt-0.5 size-6 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold">Mobile money</p>
        <p className="mt-1 text-text-body">MTN, Telecel or AirtelTigo. You'll approve the payment on your phone.</p>
      </div>
      <CircleCheck className="size-6 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <span className="sr-only">Selected</span>
    </div>
  );
}

function DetailsRecap({ form, onEdit, disabled }) {
  const rows = [
    ["Full name", form.name],
    ["Phone number", form.phone],
    ["Email", form.email],
    ["Delivery address", form.address],
  ];

  return (
    <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
      <dl className="grid gap-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className={label === "Delivery address" ? "sm:col-span-2" : ""}>
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="mt-0.5 font-semibold wrap-break-word whitespace-pre-line">{value}</dd>
          </div>
        ))}
      </dl>
      <Button variant="secondary" onClick={onEdit} disabled={disabled} className="mt-6">
        Edit details
      </Button>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]" aria-hidden="true">
      <div className="space-y-4">
        <div className="h-6 w-40 rounded-full bg-disabled" />
        <div className="h-12 rounded-field bg-disabled" />
        <div className="h-12 rounded-field bg-disabled" />
        <div className="h-28 rounded-field bg-disabled" />
      </div>
      <div className="h-80 rounded-card bg-disabled" />
    </div>
  );
}

export default function CheckoutPage() {
  useDocumentTitle("Checkout");
  const { cart, loading, error, refreshCart } = useCart();
  const { user } = useAuth();
  const announce = useAnnounce();
  const { state: payment, verify, reset } = useVerifyPayment();

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [fields, setFields] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [popup, setPopup] = useState("closed");
  const [popupError, setPopupError] = useState(null);

  const prefilled = useRef(false);
  const summaryHeading = useRef(null);
  const formHeading = useRef(null);
  const focusTarget = useRef(null);

  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
  }, [user]);

  useEffect(() => {
    if (!focusTarget.current) return;
    const target = focusTarget.current === "summary" ? summaryHeading.current : formHeading.current;
    focusTarget.current = null;
    target?.focus();
  }, [checkout]);

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  const busy = popup !== "closed" || payment.status === "verifying" || payment.status === "paid";

  async function createCheckout(event) {
    event?.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFields({});
    setFormError(null);
    setPopupError(null);
    reset();
    try {
      const data = await api("/api/checkout", { method: "POST", body: form });
      focusTarget.current = "summary";
      setCheckout(data.checkout);
      announce(`Total charged ${formatGhs(data.checkout.totalGhs)}. Review your order and pay.`);
    } catch (err) {
      const toCart = err.code === "OUT_OF_STOCK" || /cart is empty/i.test(err.message);
      setFields(err.fields ?? {});
      setFormError({ text: err.message, toCart });
      setCheckout(null);
      if (toCart) refreshCart();
    } finally {
      setSubmitting(false);
    }
  }

  function editDetails() {
    reset();
    setPopupError(null);
    focusTarget.current = "form";
    setCheckout(null);
  }

  async function pay() {
    if (!checkout || busy) return;
    const { reference, accessCode, authorizationUrl } = checkout;
    setPopup("opening");
    setPopupError(null);
    reset();

    let PaystackPop;
    try {
      PaystackPop = await loadPaystack();
    } catch {
      window.location.assign(authorizationUrl);
      return;
    }

    try {
      new PaystackPop().resumeTransaction(accessCode, {
        onLoad: () => setPopup("open"),
        onSuccess: () => {
          setPopup("closed");
          verify(reference);
        },
        onCancel: () => {
          setPopup("closed");
          verify(reference);
        },
        onError: (err) => {
          setPopup("closed");
          setPopupError(err?.message || POPUP_ERROR);
        },
      });
      setTimeout(() => setPopup((current) => (current === "opening" ? "open" : current)), 8000);
    } catch {
      setPopup("closed");
      setPopupError(POPUP_ERROR);
    }
  }

  const heading = (
    <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Checkout</h1>
  );

  if (!cart && loading) {
    return (
      <PageContainer className="py-8 lg:py-12">
        {heading}
        <div className="mt-8">
          <CheckoutSkeleton />
        </div>
      </PageContainer>
    );
  }

  if (!cart && error) {
    return (
      <PageContainer className="py-8 lg:py-12">
        {heading}
        <div className="mt-8">
          <ErrorMessage error={error} onRetry={refreshCart} />
        </div>
      </PageContainer>
    );
  }

  if (cart.items.length === 0 && payment.status !== "paid") {
    return (
      <PageContainer className="py-8 lg:py-12">
        {heading}
        <div className="mt-8 rounded-card border border-border bg-surface px-6 py-14 text-center">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-tint-default text-text-muted">
            <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mt-5 font-display text-3xl font-semibold">Your cart is empty</p>
          <p className="mx-auto mt-3 max-w-md text-text-body">Add something you love, then come back to check out.</p>
          <Button to="/products" className="mt-7">
            Keep shopping
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (cart.hasUnavailableItems && !checkout) {
    return (
      <PageContainer className="py-8 lg:py-12">
        {heading}
        <FormAlert className="mt-8 max-w-2xl" action={<Link to="/cart" className={linkClass}>Back to your cart</Link>}>
          Some items in your cart are no longer available in the quantity you chose. Update your cart to continue.
        </FormAlert>
      </PageContainer>
    );
  }

  const payLabel =
    popup === "opening"
      ? "Opening secure payment…"
      : popup === "open"
        ? "Waiting for your approval…"
        : `Pay ${checkout ? formatGhs(checkout.totalGhs) : ""} with mobile money`;

  const showPayButton =
    checkout && !["verifying", "paid", "waiting"].includes(payment.status) && payment.status !== "failed";

  return (
    <PageContainer className="py-8 lg:py-12">
      {heading}

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14">
        <div className="space-y-10">
          {!checkout ? (
            <form onSubmit={createCheckout} noValidate className="space-y-10">
              {formError && (
                <FormAlert
                  action={
                    formError.toCart && (
                      <Link to="/cart" className={linkClass}>
                        Back to your cart
                      </Link>
                    )
                  }
                >
                  {formError.text}
                </FormAlert>
              )}

              <fieldset className="space-y-5">
                <legend ref={formHeading} tabIndex={-1} className="mb-5 focus:outline-none">
                  <SectionHeading>1. Your details</SectionHeading>
                </legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Full name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={update("name")}
                    error={fields.name}
                  />
                  <TextField
                    label="Phone number"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    placeholder="024 000 0000"
                    value={form.phone}
                    onChange={update("phone")}
                    error={fields.phone}
                  />
                </div>
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  hint="Your receipt and order updates go here."
                  value={form.email}
                  onChange={update("email")}
                  error={fields.email}
                />
              </fieldset>

              <fieldset>
                <legend className="mb-5">
                  <SectionHeading>2. Delivery address</SectionHeading>
                </legend>
                <TextField
                  label="Address"
                  multiline
                  rows={3}
                  autoComplete="street-address"
                  required
                  maxLength={500}
                  placeholder="House number, street, area, city"
                  value={form.address}
                  onChange={update("address")}
                  error={fields.address}
                  inputClassName="resize-y"
                />
              </fieldset>

              <section aria-labelledby="payment-heading">
                <h2 id="payment-heading" className="mb-5 text-xl font-semibold sm:text-2xl">
                  3. Payment
                </h2>
                <PaymentMethod />
              </section>

              <div>
                <Button type="submit" disabled={submitting} className="min-h-14 w-full text-lg sm:w-auto sm:px-10">
                  {submitting ? "Getting your total…" : "Continue to payment"}
                </Button>
                <p className="mt-3 text-sm text-text-muted">
                  You'll see the delivery fee and the exact total before you pay.
                </p>
              </div>
            </form>
          ) : (
            <>
              <section aria-labelledby="details-heading" className="space-y-5">
                <h2 id="details-heading" className="text-xl font-semibold sm:text-2xl">
                  Delivery details
                </h2>
                <DetailsRecap form={form} onEdit={editDetails} disabled={busy} />
              </section>
              <section aria-labelledby="payment-heading-2" className="space-y-5">
                <h2 id="payment-heading-2" className="text-xl font-semibold sm:text-2xl">
                  Payment
                </h2>
                <PaymentMethod />
              </section>
            </>
          )}
        </div>

        <OrderSummary cart={cart} checkout={checkout} headingRef={summaryHeading}>
          {checkout && (
            <div className="space-y-4">
              <PaymentStatus
                state={payment}
                retrying={submitting}
                onRetryCheckout={() => createCheckout()}
                onRetryVerify={() => verify(payment.reference)}
              />
              {showPayButton && (
                <Button
                  onClick={pay}
                  disabled={busy}
                  className="min-h-14 w-full text-base sm:text-lg disabled:border-transparent disabled:bg-text disabled:text-bg disabled:opacity-60"
                >
                  {payLabel}
                </Button>
              )}
              {popup === "open" && (
                <FormAlert tone="info">Check your phone to approve the payment.</FormAlert>
              )}
              {popupError && <FormAlert>{popupError}</FormAlert>}
              {cart.hasUnavailableItems && (
                <p className="flex items-start gap-2 text-sm font-medium text-status-alert-text">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Your cart changed. Edit your details and continue again to get a new total.
                </p>
              )}
              <p className="text-center text-sm text-text-muted">Payments are processed securely by Paystack.</p>
            </div>
          )}
        </OrderSummary>
      </div>
    </PageContainer>
  );
}
