import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, TriangleAlert } from "lucide-react";
import Button from "../components/Button";
import Img from "../components/Img";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import QuantityStepper from "../components/QuantityStepper";
import FormAlert from "../components/form/FormAlert";
import { FieldError } from "../components/form/TextField";
import { useCart } from "../context/CartContext";
import { useAnnounce } from "../context/AnnouncerContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ikUrl, pluralise, tintClass } from "../lib/format";
import { useMoney } from "../lib/money";
import { formatGhs } from "../lib/format";
import { useCurrency } from "../context/CurrencyContext";

function CartLine({ item, busy, notice, onQuantity, onRemove, linkRef }) {
  const money = useMoney();

  return (
    <li className="flex gap-4 py-6 sm:gap-6">
      <Link
        to={`/product/${item.productId}`}
        tabIndex={-1}
        aria-hidden="true"
        className={`size-22 shrink-0 overflow-hidden rounded-2xl sm:size-28 ${tintClass(item.category?.slug)}`}
      >
        <Img
          src={ikUrl(item.mainImage?.url, "w-300")}
          alt=""
          className="size-full object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">{item.category?.name}</p>
            <h2 className="mt-1 text-base leading-snug font-semibold sm:text-lg">
              <Link
                ref={linkRef}
                to={`/product/${item.productId}`}
                className="-my-3 inline-block rounded-sm py-3 underline-offset-4 hover:underline"
              >
                {item.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {money({ ghs: item.unitPriceGhs, usd: item.unitPriceUsd })} each
            </p>
          </div>
          <p className="text-lg font-bold whitespace-nowrap sm:text-right">
            <span className="sr-only">Line total: </span>
            {money({ ghs: item.lineTotalGhs, usd: item.lineTotalUsd })}
          </p>
        </div>

        {!item.isAvailable && (
          <p className="mt-3 flex items-start gap-2 rounded-field bg-status-alert-bg px-3 py-2 text-sm font-medium text-status-alert-text">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            No longer available in this quantity. Update or remove it.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            onChange={onQuantity}
            min={0}
            productName={item.name}
            disabled={busy}
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Remove ${item.name} from cart`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-text-muted transition-colors hover:bg-text/8 hover:text-text disabled:opacity-50"
          >
            <Trash2 className="size-4.5" strokeWidth={1.7} aria-hidden="true" />
            Remove
          </button>
        </div>

        {notice?.tone === "info" && (
          <p role="status" className="mt-3 text-sm font-medium text-status-pending-text">
            {notice.text}
          </p>
        )}
        {notice?.tone === "error" && <FieldError>{notice.text}</FieldError>}
      </div>
    </li>
  );
}

function Summary({ cart }) {
  const money = useMoney();
  const { currency, settings } = useCurrency();
  const blocked = cart.hasUnavailableItems;

  return (
    <section
      aria-labelledby="summary-heading"
      className="rounded-card border border-border bg-surface p-5 sm:p-8 lg:sticky lg:top-28"
    >
      <h2 id="summary-heading" className="text-2xl font-semibold">
        Order summary
      </h2>
      <dl className="mt-6 flex items-baseline justify-between gap-4 border-t border-border pt-5">
        <dt className="font-semibold">Subtotal</dt>
        <dd className="text-3xl font-bold">{money({ ghs: cart.subtotalGhs, usd: cart.subtotalUsd })}</dd>
      </dl>
      {currency === "USD" && (
        <div className="mt-2 text-sm text-text-body">
          <p>
            Charged as <span className="font-semibold">{formatGhs(cart.subtotalGhs)}</span>
          </p>
          {settings?.note && <p className="mt-1 text-text-muted">{settings.note}</p>}
        </div>
      )}
      <p className="mt-2 text-sm text-text-muted">Delivery fee and total are calculated at checkout.</p>

      {blocked ? (
        <>
          <Button disabled className="mt-6 w-full min-h-14 text-lg">
            Go to checkout
          </Button>
          <p className="mt-3 flex items-start gap-2 text-sm font-medium text-status-alert-text">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Fix the highlighted items to continue.
          </p>
        </>
      ) : (
        <Button to="/checkout" className="mt-6 w-full min-h-14 text-lg">
          Go to checkout
        </Button>
      )}
      <p className="mt-4 text-center">
        <Link
          to="/products"
          className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
        >
          Continue shopping
        </Link>
      </p>
    </section>
  );
}

function CartSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-hidden="true">
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="size-22 rounded-2xl bg-disabled sm:size-28" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-3 w-1/4 rounded-full bg-disabled" />
              <div className="h-4 w-2/3 rounded-full bg-disabled" />
              <div className="h-10 w-36 rounded-full bg-disabled" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 rounded-card bg-disabled" />
    </div>
  );
}

export default function CartPage() {
  useDocumentTitle("Your cart");
  const { cart, error, loading, refreshCart, setQuantity, removeItem } = useCart();
  const announce = useAnnounce();
  const [busyLine, setBusyLine] = useState(null);
  const [notices, setNotices] = useState({});
  const [pageNotice, setPageNotice] = useState(null);
  const [focusIndex, setFocusIndex] = useState(null);
  const headingRef = useRef(null);
  const linkRefs = useRef(new Map());
  const items = cart?.items ?? [];

  useEffect(() => {
    if (focusIndex === null) return;
    const target = items[Math.min(focusIndex, items.length - 1)];
    const node = target ? linkRefs.current.get(target.id) : headingRef.current;
    node?.focus();
    setFocusIndex(null);
  }, [focusIndex, items]);

  async function run(item, action) {
    const index = items.findIndex((line) => line.id === item.id);
    setBusyLine(item.id);
    setNotices((n) => ({ ...n, [item.id]: null }));
    setPageNotice(null);
    try {
      const data = await action();
      const stillThere = data.cart.items.find((line) => line.id === item.id);
      if (!stillThere) {
        if (data.message) setPageNotice(data.message);
        announce(data.message ?? `Removed ${item.name} from cart`);
        setFocusIndex(index);
      } else if (data.message) {
        setNotices((n) => ({ ...n, [item.id]: { tone: "info", text: data.message } }));
        announce(data.message);
      } else {
        announce(`Quantity of ${item.name} updated to ${stillThere.quantity}`);
      }
    } catch (err) {
      setNotices((n) => ({ ...n, [item.id]: { tone: "error", text: err.message } }));
      announce(err.message);
      if (err.status === 404 || err.status === 409) {
        await refreshCart();
        if (err.status === 404) {
          setPageNotice(err.message);
          setFocusIndex(index);
        }
      }
    } finally {
      setBusyLine(null);
    }
  }

  const heading = (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-4xl leading-tight font-semibold focus:outline-none sm:text-5xl lg:text-6xl"
      >
        Your cart
      </h1>
      {cart && cart.itemCount > 0 && (
        <p className="text-text-muted">{pluralise(cart.itemCount, "item")}</p>
      )}
    </div>
  );

  return (
    <PageContainer className="py-8 lg:py-12">
      {heading}

      <div className="mt-8">
        {error && !cart ? (
          <ErrorMessage error={error} onRetry={refreshCart} />
        ) : loading && !cart ? (
          <CartSkeleton />
        ) : items.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
            {pageNotice && (
              <FormAlert tone="info" className="mx-auto mb-6 max-w-md text-left">
                {pageNotice}
              </FormAlert>
            )}
            <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-tint-default text-text-muted">
              <ShoppingBag className="size-7" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <p className="mt-5 font-display text-3xl font-semibold">Your cart is empty</p>
            <p className="mx-auto mt-3 max-w-md text-text-body">
              Bags, beauty, jewellery and more are waiting. Add something you love and it will be saved here.
            </p>
            <Button to="/products" className="mt-7">
              Keep shopping
            </Button>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
            <div>
              {pageNotice && <FormAlert tone="info" className="mb-4">{pageNotice}</FormAlert>}
              <ul className="divide-y divide-border border-y border-border">
                {items.map((item) => (
                  <CartLine
                    key={item.id}
                    item={item}
                    busy={busyLine === item.id}
                    notice={notices[item.id]}
                    linkRef={(node) => {
                      if (node) linkRefs.current.set(item.id, node);
                      else linkRefs.current.delete(item.id);
                    }}
                    onQuantity={(quantity) => run(item, () => setQuantity(item.id, quantity))}
                    onRemove={() => run(item, () => removeItem(item.id))}
                  />
                ))}
              </ul>
            </div>
            <Summary cart={cart} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
