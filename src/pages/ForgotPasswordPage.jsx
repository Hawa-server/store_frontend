import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import TextField from "../components/form/TextField";
import FormAlert from "../components/form/FormAlert";
import { api } from "../lib/api";
import { useCountdown } from "../hooks/useCountdown";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAnnounce } from "../context/AnnouncerContext";

const linkClass = "font-semibold text-text underline underline-offset-4 hover:text-accent";

export default function ForgotPasswordPage() {
  useDocumentTitle("Reset your password");
  const location = useLocation();
  const announce = useAnnounce();
  const [email, setEmail] = useState(() => (typeof location.state?.email === "string" ? location.state.email : ""));
  const [fieldError, setFieldError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [sent, setSent] = useState(null);
  const [sending, setSending] = useState(false);
  const { secondsLeft, start } = useCountdown();

  async function submit(event) {
    event.preventDefault();
    setFieldError(null);
    setFormError(null);
    if (!email.trim()) {
      setFieldError("Enter your email address.");
      return;
    }
    setSending(true);
    try {
      const data = await api("/api/auth/forgot-password", { method: "POST", body: { email: email.trim() } });
      setSent(data.message);
      start(60);
      announce(data.message);
    } catch (error) {
      if (error.fields?.email) setFieldError(error.fields.email);
      else setFormError(error.message);
    } finally {
      setSending(false);
    }
  }

  const label = sending
    ? "Sending…"
    : sent
      ? secondsLeft > 0
        ? `Send again (${secondsLeft}s)`
        : "Send again"
      : "Send reset link";

  return (
    <AuthCard
      eyebrow="Forgot password"
      title="Reset your password"
      intro={<p>Enter the email address you use for Adorn and we'll send you a link to choose a new password.</p>}
      footer={
        <p>
          Remembered it?{" "}
          <Link to="/login" className={linkClass}>
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {sent && (
          <FormAlert tone="success">
            <p>{sent}</p>
            <p className="mt-1 font-normal">Check your inbox and spam folder. The link expires in 30 minutes.</p>
          </FormAlert>
        )}
        <FormAlert>{formError}</FormAlert>
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError}
        />
        <Button
          type="submit"
          variant={sent ? "secondary" : "primary"}
          disabled={sending || secondsLeft > 0}
          className="w-full"
        >
          {label}
        </Button>
      </form>
    </AuthCard>
  );
}
