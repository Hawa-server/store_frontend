import { useCallback, useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, EyeOff, LoaderCircle } from "lucide-react";
import Button from "../Button";
import ConfirmDialog from "../ConfirmDialog";
import FormAlert from "../form/FormAlert";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import { api } from "../../lib/api";
import { formatDate, pluralise } from "../../lib/format";
import { loginPath, useAuth } from "../../context/AuthContext";
import { useAnnounce } from "../../context/AnnouncerContext";

const SORTS = [
  ["recent", "Most recent"],
  ["highest", "Highest rated"],
  ["lowest", "Lowest rated"],
];

function Breakdown({ summary }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = summary.breakdown?.[star] ?? 0;
        const percent = summary.count ? (count / summary.count) * 100 : 0;
        return (
          <li key={star} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3 text-sm">
            <span aria-hidden="true">{star} {star === 1 ? "star" : "stars"}</span>
            <span className="h-2 overflow-hidden rounded-full bg-border" aria-hidden="true">
              <span className="block h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
            </span>
            <span className="text-right" aria-hidden="true">{count}</span>
            <span className="sr-only">
              {star} {star === 1 ? "star" : "stars"}: {pluralise(count, "review")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ReviewCard({ review }) {
  return (
    <li className="rounded-card border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <StarRating rating={review.rating} size="sm" />
        <p className="text-sm text-text-muted">
          <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
          {review.editedAt && " (edited)"}
        </p>
      </div>
      {review.text && <p className="mt-3 whitespace-pre-line text-text-body wrap-break-word">{review.text}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="font-semibold">{review.reviewerName}</p>
        {review.verifiedPurchase && (
          <span className="rounded-full bg-status-success-bg px-2.5 py-0.5 text-sm font-semibold text-status-success-text">
            Verified purchase
          </span>
        )}
      </div>
    </li>
  );
}

function MyReview({ review, onEdit, onDelete }) {
  return (
    <div className="rounded-card border-2 border-text bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Your review</h3>
        <p className="text-sm text-text-muted">
          {formatDate(review.createdAt)}
          {review.editedAt && " (edited)"}
        </p>
      </div>
      {review.isHidden && (
        <p className="mt-3 flex items-start gap-2 rounded-field bg-status-alert-bg px-3 py-2 text-sm font-medium text-status-alert-text">
          <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Hidden by the store. Other shoppers can't see it, and it isn't counted in the rating.
        </p>
      )}
      <StarRating rating={review.rating} size="sm" className="mt-3" />
      {review.text && <p className="mt-3 whitespace-pre-line text-text-body wrap-break-word">{review.text}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onEdit} className="min-h-11 px-5 text-sm">
          Edit your review
        </Button>
        <Button variant="secondary" onClick={onDelete} className="min-h-11 px-5 text-sm">
          Delete review
        </Button>
      </div>
    </div>
  );
}

export default function ProductReviews({ product, onChanged }) {
  const sortId = useId();
  const { user } = useAuth();
  const location = useLocation();
  const announce = useAnnounce();
  const [sort, setSort] = useState("recent");
  const [list, setList] = useState({ items: [], page: 0, totalPages: 0, summary: null });
  const [status, setStatus] = useState({ loading: true, error: null, more: false });
  const [version, setVersion] = useState(0);
  const [mode, setMode] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null);

  const viewer = product.viewer;
  const myReview = viewer?.myReview ?? null;

  const load = useCallback(
    async (page, replace) => {
      setStatus({ loading: replace, error: null, more: !replace });
      try {
        const data = await api(`/api/products/${product.id}/reviews?sort=${sort}&page=${page}`);
        setList((current) => ({
          items: replace ? data.items : [...current.items, ...data.items],
          page: data.page,
          totalPages: data.totalPages,
          summary: data.summary,
        }));
        setStatus({ loading: false, error: null, more: false });
      } catch (error) {
        setStatus({ loading: false, error, more: false });
      }
    },
    [product.id, sort],
  );

  useEffect(() => {
    load(1, true);
  }, [load, version]);

  function changed(message) {
    setMode(null);
    setNotice({ tone: "success", text: message });
    announce(message);
    setVersion((n) => n + 1);
    onChanged();
  }

  async function deleteReview() {
    setDeleting(true);
    try {
      await api(`/api/reviews/${myReview.id}`, { method: "DELETE" });
      setConfirmDelete(false);
      changed("Review deleted");
    } catch (error) {
      announce(error.message);
      setConfirmDelete(false);
      setNotice({ tone: "error", text: error.message });
    } finally {
      setDeleting(false);
    }
  }

  const summary = list.summary ?? { average: product.rating?.average ?? null, count: product.rating?.count ?? 0, breakdown: {} };
  const canWrite = viewer?.canReview && !myReview;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="mt-16 scroll-mt-28 border-t border-border pt-12 lg:mt-20 lg:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-heading" className="font-display text-4xl font-semibold sm:text-5xl">
          Reviews
        </h2>
        {summary.count > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor={sortId} className="text-sm text-text-muted">
              Sort by
            </label>
            <div className="relative">
              <select
                id={sortId}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="min-h-11 appearance-none rounded-field border border-input-border bg-surface py-2 pr-9 pl-3 font-medium text-text hover:border-text"
              >
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-14">
        <div>
          {summary.count > 0 ? (
            <>
              <p className="flex items-baseline gap-3">
                <span className="text-6xl font-bold">{summary.average}</span>
                <span className="text-lg text-text-muted">
                  out of 5 · {pluralise(summary.count, "review")}
                </span>
              </p>
              <Breakdown summary={summary} />
            </>
          ) : (
            <p className="text-lg text-text-body">No reviews yet.</p>
          )}

          {canWrite && mode === null && (
            <Button variant="secondary" onClick={() => setMode("write")} className="mt-7 w-full">
              Write a review
            </Button>
          )}
          {!user && (
            <p className="mt-6 text-text-body">
              Bought this?{" "}
              <Link
                to={loginPath(`${location.pathname}#reviews`)}
                className="font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
              >
                Log in to write a review
              </Link>
            </p>
          )}
        </div>

        <div className="space-y-5">
          {notice && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}

          {mode === "write" && (
            <ReviewForm
              productId={product.id}
              onSaved={() => changed("Review posted")}
              onCancel={() => setMode(null)}
            />
          )}
          {mode === "edit" && myReview && (
            <ReviewForm
              productId={product.id}
              review={myReview}
              onSaved={() => changed("Review updated")}
              onCancel={() => setMode(null)}
            />
          )}
          {myReview && mode !== "edit" && (
            <MyReview
              review={myReview}
              onEdit={() => {
                setNotice(null);
                setMode("edit");
              }}
              onDelete={() => setConfirmDelete(true)}
            />
          )}

          {status.error ? (
            <FormAlert action={<Button variant="secondary" onClick={() => load(1, true)}>Try again</Button>}>
              {status.error.message}
            </FormAlert>
          ) : status.loading ? (
            <div className="space-y-4" aria-hidden="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-card bg-disabled" />
              ))}
            </div>
          ) : (
            list.items.length > 0 && (
              <>
                <ul className="space-y-4" aria-label="Customer reviews">
                  {list.items.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </ul>
                {list.page < list.totalPages && (
                  <Button variant="secondary" onClick={() => load(list.page + 1, false)} disabled={status.more}>
                    {status.more ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                        Loading…
                      </>
                    ) : (
                      "Load more reviews"
                    )}
                  </Button>
                )}
              </>
            )
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your review?"
        message="Your review will be removed permanently. You can write a new one afterwards."
        confirmLabel="Delete review"
        cancelLabel="Keep it"
        busy={deleting}
        onConfirm={deleteReview}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  );
}
