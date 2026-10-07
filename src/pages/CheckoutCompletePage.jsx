import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import PaymentStatus from "../components/checkout/PaymentStatus";
import NotFoundPage from "./NotFoundPage";
import { useVerifyPayment } from "../hooks/useVerifyPayment";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function CheckoutCompletePage() {
  useDocumentTitle("Confirming your payment");
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");
  const { state, verify } = useVerifyPayment();
  const started = useRef(null);

  useEffect(() => {
    if (!reference || started.current === reference) return;
    started.current = reference;
    verify(reference);
  }, [reference, verify]);

  if (!reference) return <NotFoundPage />;

  const title =
    state.status === "failed"
      ? "We couldn't confirm your payment"
      : state.status === "waiting"
        ? "Still waiting for your payment"
        : "Confirming your payment…";

  return (
    <AuthCard eyebrow="Mobile money" title={title}>
      <PaymentStatus
        state={state.status === "idle" ? { status: "verifying" } : state}
        onRetryVerify={() => verify(reference)}
      />
    </AuthCard>
  );
}
