import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import Button from "../Button";
import ConfirmDialog from "../ConfirmDialog";
import TextField from "../form/TextField";
import PasswordField from "../form/PasswordField";
import FormAlert from "../form/FormAlert";
import { api, handleUnauthenticated } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useAnnounce } from "../../context/AnnouncerContext";
import { clearSavedArea } from "../../lib/delivery";

const CONSEQUENCES = [
  "You'll be logged out on every phone and browser.",
  "Your reviews will be removed.",
  "Your cart will be emptied.",
  "Your past orders are kept for the store's records, but you won't be able to see them.",
];

export default function DeleteAccount() {
  const navigate = useNavigate();
  const announce = useAnnounce();
  const { endSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [fields, setFields] = useState({});
  const [failure, setFailure] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const ready = form.password.length > 0 && form.confirm === "DELETE";
  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  function openDialog() {
    setForm({ password: "", confirm: "" });
    setFields({});
    setFailure(null);
    setOpen(true);
  }

  async function deleteAccount() {
    if (!ready) return;
    setDeleting(true);
    setFields({});
    setFailure(null);
    try {
      const data = await api("/api/account", { method: "DELETE", body: form, authRedirect: false });
      setOpen(false);
      clearSavedArea();
      navigate("/", { replace: true, flushSync: true });
      await endSession(data.message);
      announce(data.message);
    } catch (error) {
      setDeleting(false);
      if (error.code === "WRONG_PASSWORD") {
        setFields({ password: error.message });
      } else if (error.status === 401) {
        setOpen(false);
        handleUnauthenticated(error);
      } else if (error.fields) {
        setFields(error.fields);
      } else {
        setFailure({ message: error.message, ordersInProgress: error.code === "ORDERS_IN_PROGRESS" });
      }
      announce(error.message);
    }
  }

  return (
    <section
      aria-labelledby="danger-heading"
      className="mt-10 rounded-card border border-status-alert-text/40 bg-surface px-5 py-6 sm:px-8"
    >
      <h2 id="danger-heading" className="flex items-center gap-2 font-display text-2xl font-semibold">
        <TriangleAlert className="size-5 text-status-alert-text" strokeWidth={1.8} aria-hidden="true" />
        Danger zone
      </h2>
      <p className="mt-2 text-text-body">
        Delete your Adorn account and everything linked to it. You'll need your password, and this can't be undone.
      </p>
      <Button variant="danger" onClick={openDialog} className="mt-5">
        Delete my account
      </Button>

      <ConfirmDialog
        open={open}
        title="Delete your Adorn account?"
        message="Here's what happens:"
        confirmLabel={failure && !failure.ordersInProgress ? "Try again" : "Delete account"}
        cancelLabel="Keep my account"
        confirmVariant="danger"
        confirmDisabled={!ready}
        busy={deleting}
        onConfirm={deleteAccount}
        onCancel={() => setOpen(false)}
      >
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-text-body">
          {CONSEQUENCES.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li className="font-semibold text-text">This can't be undone.</li>
        </ul>
        <div className="mt-6 space-y-5">
          <PasswordField
            label="Password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={update("password")}
            error={fields.password}
          />
          <TextField
            label="Type DELETE to confirm"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            value={form.confirm}
            onChange={update("confirm")}
            error={fields.confirm}
          />
        </div>
        {failure && (
          <FormAlert
            className="mt-5"
            action={
              failure.ordersInProgress && (
                <Link
                  to="/orders"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                >
                  My Orders
                </Link>
              )
            }
          >
            {failure.message}
          </FormAlert>
        )}
      </ConfirmDialog>
    </section>
  );
}
