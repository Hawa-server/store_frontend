import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";
import AccessDenied from "../../components/AccessDenied";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormAlert from "../../components/form/FormAlert";
import TextField from "../../components/form/TextField";
import StarRating from "../../components/reviews/StarRating";
import { api } from "../../lib/api";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useAnnounce } from "../../context/AnnouncerContext";
import { formatDate, formatDateTime, pluralise } from "../../lib/format";
import { pageFromParams } from "../../lib/orders";

const FILTERS = [
  ["", "All"],
  ["visible", "Visible"],
  ["hidden", "Hidden"],
];

const ACTIONS = {
  hide: {
    title: "Hide this review?",
    message: "It will disappear from the product page and stop counting in the rating. You can unhide it later.",
    confirm: "Hide review",
    reasonLabel: "Reason for hiding",
    reasonRequired: true,
  },
  unhide: {
    title: "Unhide this review?",
    message: "It will appear on the product page again and count in the rating.",
    confirm: "Unhide review",
    reasonLabel: "Note (optional)",
    reasonRequired: false,
  },
  delete: {
    title: "Delete this review permanently?",
    message: "This can't be undone, and the product's rating updates straight away. Hiding it instead can be reversed.",
    confirm: "Delete permanently",
    reasonLabel: "Reason for deleting",
    reasonRequired: true,
  },
};

function ReviewText({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-text-muted">Stars only</span>;
  const long = text.length > 140;

  return (
    <div>
      <p className={`whitespace-pre-line wrap-break-word ${long && !expanded ? "line-clamp-3" : ""}`}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function StatusCell({ review }) {
  if (review.status !== "hidden") {
    return (
      <span className="inline-flex rounded-full bg-status-success-bg px-2.5 py-0.5 text-sm font-semibold text-status-success-text">
        Visible
      </span>
    );
  }
  return (
    <div className="space-y-1">
      <span className="inline-flex rounded-full bg-status-alert-bg px-2.5 py-0.5 text-sm font-semibold text-status-alert-text">
        Hidden
      </span>
      <p className="text-sm wrap-break-word">{review.hiddenReason}</p>
      <p className="text-xs text-text-muted">
        {review.hiddenBy?.name ?? "Store"} · {review.hiddenAt && formatDateTime(review.hiddenAt)}
      </p>
    </div>
  );
}

export default function AdminReviewsPage() {
  useDocumentTitle("Reviews · Admin");
  const [params, setParams] = useSearchParams();
  const status = params.get("status") === "visible" || params.get("status") === "hidden" ? params.get("status") : "";
  const page = pageFromParams(params);
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const { data, error, loading, reload } = useApi(`/api/admin/reviews?${query}`);
  const announce = useAnnounce();

  const [rows, setRows] = useState([]);
  const [pending, setPending] = useState(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setRows(data?.items ?? []);
  }, [data]);

  if (error?.status === 403) return <AccessDenied />;

  function openAction(type, review) {
    setPending({ type, review });
    setReason("");
    setReasonError(null);
    setDialogError(null);
  }

  function closeAction() {
    if (busy) return;
    setPending(null);
  }

  async function confirmAction() {
    const config = ACTIONS[pending.type];
    const trimmed = reason.trim();
    if (config.reasonRequired && !trimmed) {
      setReasonError("A reason is required.");
      return;
    }
    setBusy(true);
    setReasonError(null);
    setDialogError(null);
    const { review, type } = pending;
    try {
      if (type === "delete") {
        await api(`/api/admin/reviews/${review.id}`, { method: "DELETE", body: { reason: trimmed } });
        setRows((current) => current.filter((row) => row.id !== review.id));
      } else {
        const body = type === "hide" || trimmed ? { reason: trimmed } : undefined;
        const result = await api(`/api/admin/reviews/${review.id}/${type}`, { method: "PATCH", body });
        setRows((current) =>
          current
            .map((row) => (row.id === review.id ? result.review : row))
            .filter((row) => !status || row.status === status),
        );
      }
      const message =
        type === "delete" ? "Review deleted." : type === "hide" ? "Review hidden." : "Review is visible again.";
      setNotice({ tone: "success", text: `${message} (${review.product.name}, ${review.reviewer.name})` });
      announce(message);
      setPending(null);
    } catch (err) {
      if (err.fields?.reason) {
        setReasonError(err.fields.reason);
      } else {
        setDialogError(err.message);
        if (err.status === 409 || err.status === 404) reload();
      }
    } finally {
      setBusy(false);
    }
  }

  function setFilter(value) {
    const next = new URLSearchParams();
    if (value) next.set("status", value);
    setNotice(null);
    setParams(next);
  }

  const config = pending ? ACTIONS[pending.type] : null;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Reviews</h1>
          {data && <p className="mt-2 text-text-muted">{pluralise(data.totalItems, "review")}, newest first</p>}
        </div>
        <div role="group" aria-label="Filter reviews" className="inline-flex rounded-full border border-border bg-surface p-1">
          {FILTERS.map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={status === value}
              className={`min-h-11 rounded-full px-5 text-[15px] font-medium transition-colors ${
                status === value ? "bg-text text-bg" : "text-text hover:bg-text/8"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <FormAlert tone={notice.tone} className="mt-6">
          {notice.text}
        </FormAlert>
      )}

      <div className="mt-8">
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : loading && !data ? (
          <div className="h-80 animate-pulse rounded-card bg-disabled" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-12 text-center">
            <p className="font-display text-3xl font-semibold">
              {status === "hidden" ? "No hidden reviews" : status === "visible" ? "No visible reviews" : "No reviews yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-card border border-border bg-surface" role="region" aria-label="Reviews table" tabIndex={0}>
              <table className="w-full min-w-[46rem] text-left align-top">
                <thead>
                  <tr className="border-b border-border text-sm text-text-muted">
                    <th scope="col" className="w-36 px-4 py-3 font-medium">Product</th>
                    <th scope="col" className="w-44 px-4 py-3 font-medium">Reviewer</th>
                    <th scope="col" className="w-32 px-4 py-3 font-medium">Stars · Date</th>
                    <th scope="col" className="px-4 py-3 font-medium">Text</th>
                    <th scope="col" className="w-40 px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((review) => (
                    <tr key={review.id} className="border-b border-border align-top last:border-b-0">
                      <td className="px-4 py-4">
                        <Link
                          to={`/product/${review.product.id}`}
                          className="-my-2.5 inline-block py-2.5 font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
                        >
                          {review.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{review.reviewer.name}</p>
                        <p className="text-sm wrap-anywhere text-text-muted">{review.reviewer.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StarRating rating={review.rating} size="sm" label="short" />
                        <p className="mt-1 text-sm whitespace-nowrap">{formatDate(review.createdAt)}</p>
                        {review.editedAt && <p className="text-sm text-text-muted">edited</p>}
                      </td>
                      <td className="px-4 py-4">
                        <ReviewText text={review.text} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusCell review={review} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.status === "hidden" ? (
                            <Button
                              variant="secondary"
                              onClick={() => openAction("unhide", review)}
                              aria-label={`Unhide review of ${review.product.name} by ${review.reviewer.name}`}
                              className="min-h-11 px-4 text-sm"
                            >
                              Unhide
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => openAction("hide", review)}
                              aria-label={`Hide review of ${review.product.name} by ${review.reviewer.name}`}
                              className="min-h-11 px-4 text-sm"
                            >
                              Hide
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => openAction("delete", review)}
                            aria-label={`Delete review of ${review.product.name} by ${review.reviewer.name}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-semibold text-status-alert-text hover:bg-status-alert-bg"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} label="Review pages" />
          </>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={config?.title ?? ""}
        message={config?.message ?? ""}
        confirmLabel={config?.confirm ?? ""}
        cancelLabel="Cancel"
        busy={busy}
        onConfirm={confirmAction}
        onCancel={closeAction}
      >
        {pending && (
          <div className="mt-5 space-y-4">
            <p className="rounded-field bg-admin-bg px-3 py-2 text-sm">
              <span className="font-semibold">{pending.review.product.name}</span> · {pending.review.reviewer.name}
            </p>
            <TextField
              label={config.reasonLabel}
              multiline
              rows={3}
              maxLength={200}
              required={config.reasonRequired}
              hint={`${reason.length}/200`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              error={reasonError}
              inputClassName="resize-y"
            />
            {dialogError && <FormAlert>{dialogError}</FormAlert>}
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
