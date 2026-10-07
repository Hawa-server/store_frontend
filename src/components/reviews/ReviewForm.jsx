import { useEffect, useRef, useState } from "react";
import Button from "../Button";
import TextField from "../form/TextField";
import FormAlert from "../form/FormAlert";
import StarRatingInput from "./StarRatingInput";
import { api } from "../../lib/api";

export default function ReviewForm({ productId, review, onSaved, onCancel }) {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [text, setText] = useState(review?.text ?? "");
  const [fields, setFields] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setFields({});
    setError(null);
    if (!rating) {
      setFields({ rating: "Choose a star rating." });
      return;
    }
    setSaving(true);
    try {
      const body = { rating, text };
      const data = review
        ? await api(`/api/reviews/${review.id}`, { method: "PATCH", body })
        : await api(`/api/products/${productId}/reviews`, { method: "POST", body });
      onSaved(data.review, review ? "updated" : "posted");
    } catch (err) {
      setFields(err.fields ?? {});
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-border bg-surface p-5 sm:p-7">
      <h3 ref={headingRef} tabIndex={-1} className="text-xl font-semibold focus:outline-none">
        {review ? "Edit your review" : "Write a review"}
      </h3>
      <div className="mt-5 space-y-5">
        {error && <FormAlert>{error}</FormAlert>}
        <StarRatingInput value={rating} onChange={setRating} error={fields.rating} />
        <TextField
          label="Your review (optional)"
          multiline
          rows={4}
          maxLength={1000}
          hint={`What did you like or not like? ${text.length}/1000`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          error={fields.text}
          inputClassName="resize-y"
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : review ? "Save changes" : "Post review"}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
