import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import Button from "../components/Button";
import PasswordField from "../components/form/PasswordField";
import FormAlert from "../components/form/FormAlert";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const LINK_INVALID = "This link has expired or has already been used.";
const linkClass = "font-semibold text-text underline underline-offset-4 hover:text-accent";

function validate(password, confirm) {
  const found = {};
  if (password.length < 8) found.password = "Password must be at least 8 characters.";
  else if (password.length > 72) found.password = "Password must be at most 72 characters.";
  if (!confirm) found.confirm = "Type your new password again.";
  else if (confirm !== password) found.confirm = "The passwords don't match.";
  return found;
}

export default function ResetPasswordPage() {
  useDocumentTitle("Choose a new password");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, endSession } = useAuth();
  const [token] = useState(() => params.get("token"));
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [fields, setFields] = useState({});
  const [formError, setFormError] = useState(null);
  const [invalid, setInvalid] = useState(!token);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.has("token")) navigate("/reset-password", { replace: true });
  }, [params, navigate]);

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setFormError(null);
    const found = validate(form.password, form.confirm);
    setFields(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const data = await api("/api/auth/reset-password", {
        method: "POST",
        body: { token, password: form.password },
        authRedirect: false,
      });
      if (user) await endSession();
      navigate("/login", { replace: true, state: { message: data.message, tone: "success" } });
    } catch (error) {
      if (error.code === "RESET_LINK_INVALID" || error.fields?.token) {
        setInvalid(true);
      } else if (error.fields?.password) {
        setFields({ password: error.fields.password });
      } else {
        setFormError(error.message);
      }
      setSubmitting(false);
    }
  }

  if (invalid) {
    return (
      <AuthCard eyebrow="Reset your password" title="This link can't be used">
        <FormAlert>{LINK_INVALID}</FormAlert>
        <p className="mt-4 text-text-body">Reset links work once and expire after 30 minutes. Ask for a new one below.</p>
        <Button to="/forgot-password" className="mt-6 w-full">
          Send a new link
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Reset your password"
      title="Choose a new password"
      intro={<p>Your new password works straight away. You'll log in with it on the next page.</p>}
      footer={
        <p>
          Changed your mind?{" "}
          <Link to="/login" className={linkClass}>
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <FormAlert>{formError}</FormAlert>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          required
          maxLength={72}
          hint="8–72 characters."
          value={form.password}
          onChange={update("password")}
          error={fields.password}
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          required
          maxLength={72}
          value={form.confirm}
          onChange={update("confirm")}
          error={fields.confirm}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Saving…" : "Change password"}
        </Button>
      </form>
    </AuthCard>
  );
}
