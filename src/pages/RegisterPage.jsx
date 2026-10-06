import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import TextField from "../components/form/TextField";
import PasswordField from "../components/form/PasswordField";
import FormAlert from "../components/form/FormAlert";
import ResendVerification from "../components/ResendVerification";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const linkClass = "font-semibold text-accent underline underline-offset-4 hover:text-accent-dark";

export default function RegisterPage() {
  useDocumentTitle("Create an account");
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fields, setFields] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  if (user && !registeredEmail) return <Navigate to="/account" replace />;

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFields({});
    setFormError(null);
    try {
      await api("/api/auth/register", { method: "POST", body: form });
      setRegisteredEmail(form.email.trim());
    } catch (error) {
      setFields(error.fields ?? {});
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <AuthCard
        eyebrow="Almost there"
        title="Check your email to verify your account."
        intro={
          <p>
            We sent a link to <strong className="font-semibold break-all text-text">{registeredEmail}</strong>. Open
            it to finish creating your account, then log in.
          </p>
        }
        footer={
          <p>
            Already verified?{" "}
            <Link to="/login" className={linkClass}>
              Log in
            </Link>
          </p>
        }
      >
        <div className="mb-6 flex items-center gap-3 rounded-field bg-status-success-bg px-4 py-3.5 text-status-success-text">
          <MailCheck className="size-5 shrink-0" aria-hidden="true" />
          <p className="font-medium" role="status">
            Account created. Can't find the email? Check your spam folder.
          </p>
        </div>
        <ResendVerification email={registeredEmail} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Join Adorn"
      title="Create an account"
      intro={<p>Save your details, track your orders and review what you've bought.</p>}
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className={linkClass}>
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {formError && <FormAlert>{formError}</FormAlert>}
        <TextField
          label="Full name"
          autoComplete="name"
          required
          maxLength={100}
          value={form.name}
          onChange={update("name")}
          error={fields.name}
        />
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
          autoComplete="new-password"
          required
          maxLength={72}
          hint="8–72 characters."
          value={form.password}
          onChange={update("password")}
          error={fields.password}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Creating your account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
