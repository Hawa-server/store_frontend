import { Link } from "react-router-dom";
import { PackageCheck, X } from "lucide-react";
import PageContainer from "./PageContainer";
import { useAuth } from "../context/AuthContext";

export function hasLinked(linked) {
  return Boolean(linked && (linked.ordersLinked > 0 || linked.cartItemsAdded > 0 || linked.cartItemsReduced > 0));
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function LinkedMessage({ linked, onDismiss, className = "" }) {
  const { ordersLinked = 0, cartItemsAdded = 0, cartItemsReduced = 0 } = linked;
  const sentences = [];
  if (ordersLinked > 0) {
    sentences.push(`We found ${plural(ordersLinked, "earlier order")} placed with your email and added ${ordersLinked === 1 ? "it" : "them"} to My Orders.`);
  }
  if (cartItemsAdded > 0) {
    sentences.push(`We ${ordersLinked > 0 ? "also " : ""}added ${plural(cartItemsAdded, "item")} you left in your cart.`);
  }
  if (cartItemsReduced > 0) sentences.push("Some quantities were reduced because of stock.");

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-card border border-border bg-status-success-bg px-4 py-3.5 text-status-success-text sm:px-5 ${className}`}
    >
      <PackageCheck className="mt-0.5 size-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <div className="min-w-0 flex-1 font-medium">
        <p>{sentences.join(" ")}</p>
        <div className="mt-1 flex flex-wrap gap-x-5">
          {ordersLinked > 0 && (
            <Link to="/orders" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
              View my orders
            </Link>
          )}
          {cartItemsAdded > 0 && (
            <Link to="/cart" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
              View cart
            </Link>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss this message"
          className="-mt-1.5 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-status-success-text/10"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default function LinkedBanner() {
  const { linkedNotice, dismissLinked } = useAuth();
  if (!linkedNotice) return null;
  return (
    <PageContainer className="pt-4">
      <LinkedMessage linked={linkedNotice} onDismiss={dismissLinked} />
    </PageContainer>
  );
}
