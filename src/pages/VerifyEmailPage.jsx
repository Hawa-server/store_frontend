import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import FormAlert from "../components/form/FormAlert";
import ResendVerification from "../components/ResendVerification";
import { api } from "../lib/api";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function VerifyEmailPage() {
  useDocumentTitle("Verify your email");
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState(token ? { status: "verifying" } : { status: "missing" });
  const sent = useRef(null);

  useEffect(() => {
    if (!token || sent.current === token) return;
    sent.current = token;
    api("/api/auth/verify", { method: "POST", body: { token } })
      .then((data) => setState({ status: "verified", message: data.message }))
      .catch((error) => setState({ status: "failed", message: error.message }));
  }, [token]);

  if (state.status === "verifying") {
    return (
      <AuthCard title="Verifying your email…">
        <p role="status" className="flex items-center gap-3 text-text-body">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          This only takes a moment.
        </p>
      </AuthCard>
    );
  }

  if (state.status === "verified") {
    return (
      <AuthCard eyebrow="You're all set" title="Email verified">
        <FormAlert tone="success">{state.message}</FormAlert>
        <Button to="/login" state={{ message: state.message, tone: "success" }} className="mt-6 w-full">
          Log in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Verify your email"
      title={state.status === "missing" ? "This link is incomplete" : "We couldn't verify that link"}
      intro={<p>Enter your email address and we'll send you a fresh verification link.</p>}
    >
      <FormAlert className="mb-6">
        {state.status === "missing"
          ? "The verification link is missing its code. Open the link from your email again, or request a new one."
          : state.message}
      </FormAlert>
      <ResendVerification askForEmail variant="primary" />
    </AuthCard>
  );
}
