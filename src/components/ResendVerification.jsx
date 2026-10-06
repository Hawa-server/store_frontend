import { useState } from "react";
import Button from "./Button";
import TextField from "./form/TextField";
import FormAlert from "./form/FormAlert";
import { api } from "../lib/api";
import { useCountdown } from "../hooks/useCountdown";

export default function ResendVerification({ email: fixedEmail, askForEmail = false, variant = "secondary" }) {
  const [email, setEmail] = useState(fixedEmail ?? "");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const { secondsLeft, start } = useCountdown();

  async function resend(event) {
    event?.preventDefault();
    setSending(true);
    setNotice(null);
    setFieldError(null);
    try {
      const data = await api("/api/auth/resend-verification", {
        method: "POST",
        body: { email: askForEmail ? email : fixedEmail },
      });
      setNotice({ tone: "success", text: data.message });
      start(60);
    } catch (error) {
      if (error.fields?.email && askForEmail) setFieldError(error.fields.email);
      else setNotice({ tone: "error", text: error.message });
    } finally {
      setSending(false);
    }
  }

  const label = sending
    ? "Sending…"
    : secondsLeft > 0
      ? `Resend verification email (${secondsLeft}s)`
      : "Resend verification email";

  const button = (
    <Button
      type={askForEmail ? "submit" : "button"}
      variant={variant}
      onClick={askForEmail ? undefined : resend}
      disabled={sending || secondsLeft > 0}
      className="w-full"
    >
      {label}
    </Button>
  );

  return (
    <div className="space-y-4">
      {askForEmail ? (
        <form onSubmit={resend} noValidate className="space-y-4">
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError}
          />
          {button}
        </form>
      ) : (
        button
      )}
      {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}
    </div>
  );
}
