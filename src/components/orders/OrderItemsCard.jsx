import Img from "../Img";
import { formatGhs, ikUrl } from "../../lib/format";

export default function OrderItemsCard({ order, title = "Items", totalLabel = "Total paid" }) {
  return (
    <section aria-labelledby="order-items-heading" className="rounded-card border border-border bg-surface p-5 sm:p-7">
      <h2 id="order-items-heading" className="text-xl font-semibold sm:text-2xl">
        {title}
      </h2>
      <ul className="mt-5 divide-y divide-border">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4 first:pt-0">
            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-tint-default">
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
      <dl className="mt-2 space-y-2 border-t border-border pt-4">
        <div className="flex justify-between gap-4">
          <dt className="text-text-body">Subtotal</dt>
          <dd className="font-medium">{formatGhs(order.subtotalGhs)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-body">Delivery</dt>
          <dd className="font-medium">{formatGhs(order.deliveryFeeGhs)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <dt className="text-lg font-semibold">{totalLabel}</dt>
          <dd className="text-2xl font-bold">{formatGhs(order.totalGhs)}</dd>
        </div>
      </dl>
    </section>
  );
}
