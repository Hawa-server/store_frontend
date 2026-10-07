import Img from "../Img";
import { formatGhs, ikUrl, tintClass } from "../../lib/format";
import { formatUsd } from "../../lib/money";
import { useCurrency } from "../../context/CurrencyContext";

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-text-body">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export default function OrderSummary({ cart, checkout, headingRef, children }) {
  const { currency } = useCurrency();

  return (
    <section
      aria-labelledby="order-summary-heading"
      className="rounded-card border border-border bg-surface p-5 sm:p-8 lg:sticky lg:top-28"
    >
      <h2
        id="order-summary-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold focus:outline-none"
      >
        Order summary
      </h2>

      <ul className="mt-6 space-y-4">
        {cart.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            <div className={`size-16 shrink-0 overflow-hidden rounded-xl ${tintClass(item.category?.slug)}`}>
              <Img src={ikUrl(item.mainImage?.url, "w-200")} alt="" className="size-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="leading-snug font-semibold">{item.name}</p>
              <p className="text-sm text-text-muted">Qty {item.quantity}</p>
            </div>
            <p className="font-semibold whitespace-nowrap">
              {formatGhs(item.lineTotalGhs)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-3 border-t border-border pt-5">
        <Row label="Subtotal">
          {formatGhs(checkout ? checkout.subtotalGhs : cart.subtotalGhs)}
        </Row>
        <Row label="Delivery">
          {checkout ? (
            formatGhs(checkout.deliveryFeeGhs)
          ) : (
            <span className="text-sm font-normal text-text-muted">Shown when you continue</span>
          )}
        </Row>
      </dl>

      {checkout && (
        <div className="mt-5 border-t border-border pt-5">
          <dl className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <dt className="text-lg font-semibold">Total charged</dt>
            <dd className="text-3xl font-bold sm:text-4xl">{formatGhs(checkout.totalGhs)}</dd>
          </dl>
          {currency === "USD" && Number.isInteger(checkout.totalUsd) && (
            <p className="mt-3 text-sm font-medium text-text-body">
              About {formatUsd(checkout.totalUsd)}, shown as a guide. You're charged in GH₵.
            </p>
          )}
          <p className="mt-2 text-sm text-text-muted">{checkout.chargeNote}</p>
        </div>
      )}

      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
