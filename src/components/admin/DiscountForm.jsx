import { useState } from "react";
import { Lock } from "lucide-react";
import Button from "../Button";
import TextField from "../form/TextField";
import FormAlert from "../form/FormAlert";
import { api } from "../../lib/api";
import { pesewasToInput } from "../../lib/format";
import { parseGhsAmount } from "../../lib/orders";
import { previewText } from "../../lib/discounts";

const card = "rounded-card border border-border bg-surface p-5 sm:p-7";

function initialForm(code) {
  if (!code) {
    return {
      code: "",
      type: "percent",
      value: "",
      maxDiscount: "",
      minSubtotal: "",
      startsOn: "",
      endsOn: "",
      usageLimit: "",
      oncePerCustomer: true,
      isActive: true,
    };
  }
  return {
    code: code.code,
    type: code.type,
    value: code.type === "percent" ? String(code.value) : pesewasToInput(code.value),
    maxDiscount: code.maxDiscountPesewas ? pesewasToInput(code.maxDiscountPesewas) : "",
    minSubtotal: code.minSubtotalPesewas ? pesewasToInput(code.minSubtotalPesewas) : "",
    startsOn: code.startsOn ?? "",
    endsOn: code.endsOn ?? "",
    usageLimit: code.usageLimit ? String(code.usageLimit) : "",
    oncePerCustomer: code.oncePerCustomer,
    isActive: code.isActive,
  };
}

function optionalGhs(text, label) {
  if (!text.trim()) return { value: null };
  const parsed = parseGhsAmount(text, {
    max: 100000,
    maxError: `${label} can be at most GH₵ 1,000.00.`,
  });
  return parsed.error ? { error: parsed.error } : { value: parsed.pesewas };
}

function readForm(form) {
  const errors = {};
  const values = {};

  values.code = form.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,20}$/.test(values.code)) errors.code = "Use 3–20 letters and digits, with no spaces.";

  values.type = form.type;
  if (form.type === "percent") {
    const n = /^\d+$/.test(form.value.trim()) ? Number(form.value.trim()) : NaN;
    if (!(n >= 1 && n <= 90)) errors.value = "Enter a whole percent from 1 to 90.";
    else values.value = n;
  } else {
    const parsed = parseGhsAmount(form.value, { max: 100000, maxError: "Enter an amount from GH₵ 1.00 to GH₵ 1,000.00." });
    if (parsed.error) errors.value = parsed.error;
    else if (parsed.pesewas < 100) errors.value = "Enter an amount from GH₵ 1.00 to GH₵ 1,000.00.";
    else values.value = parsed.pesewas;
  }

  if (form.type === "percent") {
    const max = optionalGhs(form.maxDiscount, "The maximum discount");
    if (max.error) errors.maxDiscountPesewas = max.error;
    else values.maxDiscountPesewas = max.value;
  } else {
    values.maxDiscountPesewas = null;
  }

  if (form.minSubtotal.trim()) {
    const min = parseGhsAmount(form.minSubtotal);
    if (min.error) errors.minSubtotalPesewas = min.error;
    else values.minSubtotalPesewas = min.pesewas;
  } else {
    values.minSubtotalPesewas = null;
  }

  values.startsOn = form.startsOn || null;
  values.endsOn = form.endsOn || null;
  if (values.startsOn && values.endsOn && values.endsOn < values.startsOn) {
    errors.endsOn = "The end date must be on or after the start date.";
  }

  if (form.usageLimit.trim()) {
    const n = /^\d+$/.test(form.usageLimit.trim()) ? Number(form.usageLimit.trim()) : NaN;
    if (!(n >= 1 && n <= 1000000)) errors.usageLimit = "Enter a whole number from 1 to 1,000,000.";
    else values.usageLimit = n;
  } else {
    values.usageLimit = null;
  }

  values.oncePerCustomer = form.oncePerCustomer;
  values.isActive = form.isActive;
  return { values, errors };
}

const EDITABLE = ["code", "type", "value", "maxDiscountPesewas", "minSubtotalPesewas", "startsOn", "endsOn", "usageLimit", "oncePerCustomer"];
const LOCKED_WHEN_USED = ["code", "type", "value"];

export default function DiscountForm({ discountCode, onSaved, onSubmitStart }) {
  const isEdit = Boolean(discountCode);
  const used = isEdit && discountCode.timesUsed > 0;
  const [form, setForm] = useState(() => initialForm(discountCode));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((f) => ({ ...f, [key]: key === "code" ? value.toUpperCase() : value }));
  };

  const preview = (() => {
    const { values } = readForm(form);
    return values.value ? previewText(values) : "";
  })();

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    onSubmitStart?.();
    setFormError(null);
    const { values, errors: found } = readForm(form);
    if (used) LOCKED_WHEN_USED.forEach((key) => delete found[key]);
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError("Please check the highlighted fields.");
      return;
    }

    let body;
    if (isEdit) {
      body = {};
      for (const key of EDITABLE) {
        if (used && LOCKED_WHEN_USED.includes(key)) continue;
        const before = key === "value" || key === "code" || key === "type" ? discountCode[key] : (discountCode[key] ?? null);
        if (values[key] !== before) body[key] = values[key];
      }
      if (Object.keys(body).length === 0) {
        setFormError("Nothing to save yet.");
        return;
      }
    } else {
      body = { ...values };
    }

    setSaving(true);
    try {
      const data = await api(isEdit ? `/api/admin/discount-codes/${discountCode.id}` : "/api/admin/discount-codes", {
        method: isEdit ? "PATCH" : "POST",
        body,
      });
      onSaved(data.discountCode);
    } catch (err) {
      setErrors(err.fields ?? {});
      setFormError(err.fields?._ ?? err.message);
    } finally {
      setSaving(false);
    }
  }

  const percent = form.type === "percent";

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-6">
      {formError && <FormAlert>{formError}</FormAlert>}

      <section aria-labelledby="discount-what" className={`${card} space-y-5`}>
        <h2 id="discount-what" className="text-xl font-semibold sm:text-2xl">
          The discount
        </h2>
        {used && (
          <p className="flex items-start gap-2 rounded-field bg-status-pending-bg px-4 py-3 text-sm font-medium text-status-pending-text">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            This code has been used. Create a new code to change its discount.
          </p>
        )}
        <TextField
          label="Code"
          value={form.code}
          onChange={set("code")}
          readOnly={used}
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          hint={used ? undefined : "3–20 letters and digits, for example ADORN10."}
          error={errors.code}
          inputClassName={`tracking-wide uppercase ${used ? "bg-disabled" : ""}`}
        />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Type</legend>
          <div className="flex flex-wrap gap-3">
            {[
              ["percent", "Percent off"],
              ["fixed", "Fixed amount off"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`flex min-h-12 items-center gap-3 rounded-field border px-4 font-medium ${
                  form.type === value ? "border-text" : "border-input-border"
                } ${used ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <input
                  type="radio"
                  name="discount-type"
                  value={value}
                  checked={form.type === value}
                  disabled={used}
                  onChange={set("type")}
                  className="size-4.5 accent-text"
                />
                {label}
              </label>
            ))}
          </div>
          {errors.type && <p className="mt-2 text-sm font-medium text-status-alert-text">{errors.type}</p>}
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={percent ? "Percent (1–90)" : "Amount off (GH₵)"}
            inputMode={percent ? "numeric" : "decimal"}
            autoComplete="off"
            value={form.value}
            onChange={set("value")}
            readOnly={used}
            error={errors.value}
            inputClassName={used ? "bg-disabled" : ""}
          />
          {percent && (
            <TextField
              label="Maximum discount (GH₵, optional)"
              inputMode="decimal"
              autoComplete="off"
              hint="The most one order can save."
              value={form.maxDiscount}
              onChange={set("maxDiscount")}
              error={errors.maxDiscountPesewas}
            />
          )}
        </div>
      </section>

      <section aria-labelledby="discount-rules" className={`${card} space-y-5`}>
        <h2 id="discount-rules" className="text-xl font-semibold sm:text-2xl">
          Rules
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Minimum order (GH₵, optional)"
            inputMode="decimal"
            autoComplete="off"
            hint="Products only, before delivery."
            value={form.minSubtotal}
            onChange={set("minSubtotal")}
            error={errors.minSubtotalPesewas}
          />
          <TextField
            label="Usage limit (optional)"
            inputMode="numeric"
            autoComplete="off"
            hint="Total paid orders that can use it."
            value={form.usageLimit}
            onChange={set("usageLimit")}
            error={errors.usageLimit}
          />
          <TextField
            label="Start date (optional)"
            type="date"
            hint="Ghana time, included."
            value={form.startsOn}
            onChange={set("startsOn")}
            error={errors.startsOn}
          />
          <TextField
            label="End date (optional)"
            type="date"
            hint="Ghana time, included."
            value={form.endsOn}
            onChange={set("endsOn")}
            error={errors.endsOn}
          />
        </div>
        <div className="flex flex-wrap gap-x-8">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 font-medium">
            <input type="checkbox" checked={form.oncePerCustomer} onChange={set("oncePerCustomer")} className="size-5 accent-text" />
            Once per customer
          </label>
          {!isEdit && (
            <label className="flex min-h-11 cursor-pointer items-center gap-3 font-medium">
              <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="size-5 accent-text" />
              Active (shoppers can use it)
            </label>
          )}
        </div>
      </section>

      <div className="rounded-card border border-dashed border-input-border p-5" aria-live="polite">
        <p className="text-sm font-semibold text-text-muted">Preview</p>
        <p className="mt-1 text-lg font-medium">{preview || "Fill in the discount to see how it reads."}</p>
      </div>

      <Button type="submit" disabled={saving} className="min-h-14 w-full text-lg sm:w-auto sm:px-10">
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create code"}
      </Button>
    </form>
  );
}
