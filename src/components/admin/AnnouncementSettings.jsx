import { useEffect, useId, useState } from "react";
import { CircleCheck, EyeOff, Sparkles } from "lucide-react";
import Button from "../Button";
import Switch from "../ui/Switch";
import TextField, { FieldError, inputClasses } from "../form/TextField";
import FormAlert from "../form/FormAlert";
import ErrorMessage from "../ErrorMessage";
import { AnnouncementBarView } from "../AnnouncementBar";
import { api } from "../../lib/api";
import { useAnnounce } from "../../context/AnnouncerContext";
import { ANNOUNCEMENT_MAX, statusText, suggestedMessage } from "../../lib/discounts";

const card = "rounded-card border border-border bg-surface p-5 sm:p-7";

async function loadAllCodes(signal) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await api(`/api/admin/discount-codes?page=${page}`, { signal });
    all.push(...data.items);
    totalPages = data.totalPages;
    page += 1;
  } while (page <= totalPages && page <= 50);
  return all;
}

function ShowingState({ saved }) {
  if (!saved) return null;
  return saved.isShowing ? (
    <p role="status" className="flex items-center gap-2 font-semibold text-status-success-text">
      <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
      Showing on the shop now
    </p>
  ) : (
    <p role="status" className="flex items-start gap-2 font-semibold text-text-muted">
      <EyeOff className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      Not showing: {saved.reason ? saved.reason.charAt(0).toLowerCase() + saved.reason.slice(1) : "it can't be shown right now"}
    </p>
  );
}

export default function AnnouncementSettings() {
  const announce = useAnnounce();
  const [state, setState] = useState({ loading: true, error: null });
  const [saved, setSaved] = useState(null);
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState({ enabled: false, message: "", codeId: "", endsAt: "" });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const codeSelectId = useId();

  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: null });
    Promise.all([api("/api/admin/announcement", { signal: controller.signal }), loadAllCodes(controller.signal)])
      .then(([data, list]) => {
        const a = data.announcement;
        setSaved(a);
        setCodes(list);
        setForm({ enabled: a.enabled, message: a.message ?? "", codeId: a.codeId ? String(a.codeId) : "", endsAt: a.endsAt ?? "" });
        setState({ loading: false, error: null });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ loading: false, error });
      });
    return () => controller.abort();
  }, [attempt]);

  const selected = codes.find((c) => String(c.id) === form.codeId) ?? null;
  const linkedMissing = form.codeId && !selected && saved?.code && String(saved.code.id) === form.codeId ? saved.code : null;
  const message = form.message.trim();

  function update(changes) {
    setForm((f) => ({ ...f, ...changes }));
    setNotice(null);
  }

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setNotice(null);
    const found = {};
    if (form.enabled && (message.length < 5 || message.length > ANNOUNCEMENT_MAX)) {
      found.message = "Enter a message (5–120 characters) to switch the bar on.";
    } else if (message && (message.length < 5 || message.length > ANNOUNCEMENT_MAX)) {
      found.message = "The message must be 5–120 characters, on one line.";
    }
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const data = await api("/api/admin/announcement", {
        method: "PUT",
        body: {
          enabled: form.enabled,
          message,
          codeId: form.codeId ? Number(form.codeId) : null,
          endsAt: form.codeId ? null : form.endsAt || null,
        },
      });
      const a = data.announcement;
      setSaved(a);
      setForm({ enabled: a.enabled, message: a.message ?? "", codeId: a.codeId ? String(a.codeId) : "", endsAt: a.endsAt ?? "" });
      const text = a.isShowing ? "Saved. Showing on the shop now." : `Saved. Not showing: ${a.reason ?? ""}`;
      setNotice({ tone: "success", text: "Saved. Shoppers see changes within a minute." });
      announce(text);
    } catch (err) {
      setErrors(err.fields ?? {});
      setNotice({ tone: "error", text: err.fields?._ ?? err.message });
      announce(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="announcement-heading" className={card}>
      <h2 id="announcement-heading" className="text-xl font-semibold sm:text-2xl">
        Announcement bar
      </h2>
      <p className="mt-1 text-text-body">A short message above the header on every shop page.</p>

      {state.error ? (
        <div className="mt-5">
          <ErrorMessage error={state.error} onRetry={() => setAttempt((n) => n + 1)} />
        </div>
      ) : state.loading ? (
        <div className="mt-5 h-64 animate-pulse rounded-field bg-disabled" aria-hidden="true" />
      ) : (
        <form onSubmit={save} noValidate className="mt-5 space-y-5">
          <Switch
            checked={form.enabled}
            onChange={(enabled) => update({ enabled })}
            label="Show announcement bar"
          />

          <div>
            <TextField
              label="Message"
              value={form.message}
              maxLength={ANNOUNCEMENT_MAX}
              onChange={(e) => update({ message: e.target.value.replace(/[\r\n]+/g, " ") })}
              hint={`${form.message.length} / ${ANNOUNCEMENT_MAX} characters. Plain text, one line.`}
              error={errors.message}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={codeSelectId} className="mb-2 block text-sm font-semibold">
                Discount code (optional)
              </label>
              <select
                id={codeSelectId}
                value={form.codeId}
                onChange={(e) => update({ codeId: e.target.value, endsAt: e.target.value ? "" : form.endsAt })}
                aria-invalid={errors.codeId ? true : undefined}
                aria-describedby={errors.codeId ? `${codeSelectId}-error` : undefined}
                className={`${inputClasses} ${errors.codeId ? "border-status-alert-text" : "border-input-border"}`}
              >
                <option value="">No code</option>
                {linkedMissing && (
                  <option value={String(linkedMissing.id)}>
                    {linkedMissing.code} ({statusText[linkedMissing.status] ?? linkedMissing.status})
                  </option>
                )}
                {codes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} ({statusText[c.status] ?? c.status})
                  </option>
                ))}
              </select>
              <FieldError id={`${codeSelectId}-error`}>{errors.codeId}</FieldError>
              {selected && (
                <Button
                  variant="secondary"
                  onClick={() => update({ message: suggestedMessage(selected) })}
                  className="mt-3 min-h-11 px-4 text-sm"
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  Use suggested message
                </Button>
              )}
            </div>
            <div>
              {form.codeId ? (
                <div>
                  <p className="mb-2 text-sm font-semibold">End date</p>
                  <p className="text-text-muted">The code's own dates apply.</p>
                  <FieldError>{errors.endsAt}</FieldError>
                </div>
              ) : (
                <TextField
                  label="End date (optional)"
                  type="date"
                  hint="Ghana time, included. Leave empty to keep it running."
                  value={form.endsAt}
                  onChange={(e) => update({ endsAt: e.target.value })}
                  error={errors.endsAt}
                />
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Preview</p>
            {message ? (
              <div className="overflow-hidden rounded-field border border-border">
                <AnnouncementBarView message={message} code={selected?.code ?? linkedMissing?.code ?? null} preview />
              </div>
            ) : (
              <p className="text-text-muted">Write a message to see the bar.</p>
            )}
          </div>

          {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <ShowingState saved={saved} />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save announcement"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
