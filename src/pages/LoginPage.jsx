import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import TextField from "../components/form/TextField";
import PasswordField from "../components/form/PasswordField";
import FormAlert from "../components/form/FormAlert";
import ResendVerification from "../components/ResendVerification";
import { api } from "../lib/api";
import { safeNext, useAuth } from "../context/AuthContext";
import { useCountdown, waitSeconds } from "../hooks/useCountdown";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const linkClass = "font-semibold text-accent underline underline-offset-4 hover:text-accent-dark";
const NEEDS_NEW_CODE = /too many wrong attempts|expired|no longer valid/i;

function CodeStep({ email, intro, onBack, onLoggedIn }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [needsNewCode, setNeedsNewCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { secondsLeft, start } = useCountdown();
  const inputRef = useRef(null);

  useEffect(() => {
    start(60);
    inputRef.current?.focus();
  }, [start]);

  async function verify(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const data = await api("/api/auth/login/verify-code", {
        method: "POST",
        body: { code },
        authRedirect: false,
      });
      await onLoggedIn(data.user);
    } catch (err) {
      if (err.status === 401) return onBack(err.message);
      const message = err.fields?.code ?? err.message;
      setError(message);
      setNeedsNewCode(NEEDS_NEW_CODE.test(message));
      setSubmitting(false);
    }
  }

  async function resend() {
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      const data = await api("/api/auth/login/resend-code", { method: "POST", authRedirect: false });
      setNotice(data.message);
      setNeedsNewCode(false);
      setCode("");
      start(60);
      inputRef.current?.focus();
    } catch (err) {
      if (err.status === 401) return onBack(err.message);
      const wait = waitSeconds(err.message);
      if (wait) start(wait);
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  const resendLabel = resending
    ? "Sending a new code…"
    : secondsLeft > 0
      ? `Resend code in ${secondsLeft}s`
      : "Resend code";

  return (
    <AuthCard
      eyebrow="Two-step login"
      title="Enter the 6-digit code we emailed you"
      intro={
        <>
          <p>{intro}</p>
          {email && (
            <p className="mt-1 text-sm text-text-muted">
              Sent to <span className="font-semibold break-all text-text">{email}</span>
            </p>
          )}
        </>
      }
      footer={
        <button
          type="button"
          onClick={() => onBack(null)}
          className={`inline-flex min-h-11 items-center ${linkClass}`}
        >
          Use a different email
        </button>
      }
    >
      <form onSubmit={verify} noValidate className="space-y-5">
        <TextField
          ref={inputRef}
          label="Login code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          error={error}
          inputClassName="text-center font-mono text-2xl tracking-[0.5em]"
        />
        {notice && <FormAlert tone="success">{notice}</FormAlert>}
        <Button type="submit" disabled={submitting || code.length !== 6} className="w-full">
          {submitting ? "Checking…" : "Log in"}
        </Button>
        <Button
          variant={needsNewCode ? "primary" : "secondary"}
          onClick={resend}
          disabled={resending || secondsLeft > 0}
          className="w-full"
        >
          {resendLabel}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  useDocumentTitle("Log in");
  const { user, loading, login, notice, takeNotice } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));

  const [form, setForm] = useState({ email: "", password: "" });
  const [fields, setFields] = useState({});
  const [formError, setFormError] = useState(null);
  const [notVerified, setNotVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [codeStep, setCodeStep] = useState(null);
  const [banner, setBanner] = useState(() => {
    if (location.state?.message) return { text: location.state.message, tone: location.state.tone ?? "info" };
    return notice ? { text: notice, tone: "info" } : null;
  });

  useEffect(() => {
    takeNotice();
  }, [takeNotice]);

  if (!loading && user) return <Navigate to={next} replace />;

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFields({});
    setFormError(null);
    setNotVerified(false);
    setBanner(null);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: form, authRedirect: false });
      if (data.requiresCode) {
        setCodeStep({ message: data.message });
        setSubmitting(false);
      } else {
        await login(data.user);
      }
    } catch (error) {
      setFields(error.fields ?? {});
      setFormError(error.message);
      setNotVerified(error.code === "EMAIL_NOT_VERIFIED");
      setSubmitting(false);
    }
  }

  if (codeStep) {
    return (
      <CodeStep
        email={form.email.trim()}
        intro={codeStep.message}
        onLoggedIn={login}
        onBack={(message) => {
          setCodeStep(null);
          setForm((f) => ({ ...f, password: "" }));
          setBanner(message ? { text: message, tone: "info" } : null);
        }}
      />
    );
  }

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log in"
      intro={<p>Log in to check out faster and keep track of your orders.</p>}
      footer={
        <p>
          New to Adorn?{" "}
          <Link to="/register" className={linkClass}>
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {banner && <FormAlert tone={banner.tone}>{banner.text}</FormAlert>}
        {formError && (
          <FormAlert
            action={notVerified && <ResendVerification email={form.email.trim()} />}
          >
            {formError}
          </FormAlert>
        )}
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          error={fields.email}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={update("password")}
          error={fields.password}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
