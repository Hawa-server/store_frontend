import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import Button from "../Button";
import FormAlert from "../form/FormAlert";

export default function PaymentStatus({ state, onRetryCheckout, onRetryVerify, retrying = false }) {
  if (state.status === "verifying") {
    return (
      <div role="status" className="rounded-field bg-bg px-4 py-4">
        <p className="flex items-center gap-3 font-semibold">
          <LoaderCircle className="size-5 shrink-0 animate-spin" aria-hidden="true" />
          Confirming your payment…
        </p>
        <p className="mt-1 pl-8 text-sm text-text-muted">
          {state.pending
            ? "Still waiting for approval. Check your phone to approve the payment."
            : "This can take up to 20 seconds. Please keep this page open."}
        </p>
      </div>
    );
  }

  if (state.status === "paid") {
    return (
      <FormAlert tone="success">Payment confirmed. Opening your order…</FormAlert>
    );
  }

  if (state.status === "waiting") {
    return (
      <FormAlert
        tone="info"
        action={
          <Link to="/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
            Back to the shop
          </Link>
        }
      >
        {state.message}
      </FormAlert>
    );
  }

  if (state.status === "failed") {
    const retry =
      state.retry === "checkout" && onRetryCheckout ? (
        <Button onClick={onRetryCheckout} disabled={retrying} className="w-full sm:w-auto">
          {retrying ? "Starting a new payment…" : "Try again"}
        </Button>
      ) : state.retry === "verify" && onRetryVerify ? (
        <Button onClick={onRetryVerify} className="w-full sm:w-auto">
          Try again
        </Button>
      ) : (
        <Link to="/cart" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
          Back to your cart
        </Link>
      );

    return (
      <FormAlert action={retry}>{state.message}</FormAlert>
    );
  }

  return null;
}
