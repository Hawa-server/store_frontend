import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import Button from "../Button";
import Img from "../Img";
import ConfirmDialog from "../ConfirmDialog";
import FormAlert from "../form/FormAlert";
import TextField, { FieldError, inputClasses } from "../form/TextField";
import { api } from "../../lib/api";
import { ikUrl } from "../../lib/format";
import { parseGhsAmount } from "../../lib/orders";

const IMAGEKIT = "https://ik.imagekit.io/";
const MAX_PRICE = 100000000;
const card = "rounded-card border border-border bg-surface p-5 sm:p-7";

const MESSAGES = {
  name: "The name must be 2–150 characters.",
  categoryId: "Choose a category.",
  priceFormat: "Enter a price in GH₵ with at most 2 decimal places, for example 120 or 120.50.",
  priceZero: "Enter a price greater than 0.",
  priceMax: "Enter a price up to GH₵ 1,000,000.00.",
  stock: "Enter a whole number from 0 to 100,000.",
  description: "Add a description of up to 2,000 characters.",
  imageUrl: "Use an image address from the store's ImageKit.",
  imageAlt: "Describe the photo (up to 200 characters).",
};

const FIELD_MAP = {
  name: "name",
  description: "description",
  categoryId: "categoryId",
  priceGhs: "price",
  stock: "stock",
  expectedStock: "stock",
  isActive: "isActive",
  image: "imageUrl",
  "image.url": "imageUrl",
  "image.altText": "imageAlt",
};

function pesewasToText(pesewas) {
  return `${Math.floor(pesewas / 100)}.${String(pesewas % 100).padStart(2, "0")}`;
}

function valuesFrom(product) {
  if (!product) {
    return { name: "", categoryId: "", price: "", stock: "", description: "", imageUrl: "", imageAlt: "", isActive: true };
  }
  return {
    name: product.name,
    categoryId: String(product.category?.id ?? ""),
    price: pesewasToText(product.priceGhs),
    stock: String(product.stock),
    description: product.description ?? "",
    imageUrl: product.mainImage?.url ?? "",
    imageAlt: product.mainImage?.altText ?? "",
    isActive: product.isActive,
  };
}

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (name.length < 2 || name.length > 150) errors.name = MESSAGES.name;
  if (!values.categoryId) errors.categoryId = MESSAGES.categoryId;

  const price = parseGhsAmount(values.price, { max: MAX_PRICE, maxError: MESSAGES.priceMax });
  if (price.error) {
    errors.price = price.error === MESSAGES.priceMax ? MESSAGES.priceMax : /greater than/.test(price.error) ? MESSAGES.priceZero : MESSAGES.priceFormat;
  }

  const stockText = values.stock.trim();
  if (!/^\d+$/.test(stockText) || Number(stockText) > 100000) errors.stock = MESSAGES.stock;

  const description = values.description.trim();
  if (description.length < 1 || description.length > 2000) errors.description = MESSAGES.description;

  const url = values.imageUrl.trim();
  if (!url.startsWith(IMAGEKIT) || url.length > 500) errors.imageUrl = MESSAGES.imageUrl;

  const alt = values.imageAlt.trim();
  if (alt.length < 1 || alt.length > 200) errors.imageAlt = MESSAGES.imageAlt;

  return { errors, priceGhs: price.pesewas, stock: Number(stockText) };
}

function Counter({ value, max }) {
  return (
    <span className={value.length > max ? "font-semibold text-status-alert-text" : ""}>
      {value.length}/{max}
    </span>
  );
}

export default function ProductForm({ product, categories, onSaved, onSubmitStart }) {
  const isEdit = Boolean(product);
  const activeId = useId();
  const [values, setValues] = useState(() => valuesFrom(product));
  const [baseline] = useState(() => valuesFrom(product));
  const [expectedStock, setExpectedStock] = useState(product?.stock ?? null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const leaving = useRef(false);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (key) => (event) => {
    const value = event.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function toggleActive(next) {
    if (isEdit && !next && baseline.isActive) {
      setConfirmDeactivate(true);
      return;
    }
    setValues((v) => ({ ...v, isActive: next }));
  }

  function buildBody(checked) {
    const full = {
      name: values.name.trim(),
      description: values.description.trim(),
      categoryId: Number(values.categoryId),
      priceGhs: checked.priceGhs,
      stock: checked.stock,
      isActive: values.isActive,
      image: { url: values.imageUrl.trim(), altText: values.imageAlt.trim() },
    };
    if (!isEdit) return full;

    const body = {};
    if (full.name !== product.name) body.name = full.name;
    if (full.description !== (product.description ?? "")) body.description = full.description;
    if (full.categoryId !== product.category?.id) body.categoryId = full.categoryId;
    if (full.priceGhs !== product.priceGhs) body.priceGhs = full.priceGhs;
    if (full.stock !== expectedStock) {
      body.stock = full.stock;
      body.expectedStock = expectedStock;
    }
    if (full.isActive !== product.isActive) body.isActive = full.isActive;
    if (full.image.url !== (product.mainImage?.url ?? "") || full.image.altText !== (product.mainImage?.altText ?? "")) {
      body.image = full.image;
    }
    return body;
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setNotice(null);
    onSubmitStart?.();
    const checked = validate(values);
    const found = Object.fromEntries(Object.entries(checked.errors).filter(([, v]) => v));
    setErrors(found);
    if (Object.keys(found).length) {
      setNotice({ tone: "error", text: "Please check the highlighted fields." });
      return;
    }
    const body = buildBody(checked);
    if (isEdit && Object.keys(body).length === 0) {
      setNotice({ tone: "info", text: "Nothing to save yet." });
      return;
    }

    setSaving(true);
    try {
      const data = isEdit
        ? await api(`/api/admin/products/${product.id}`, { method: "PATCH", body })
        : await api("/api/admin/products", { method: "POST", body });
      leaving.current = true;
      onSaved(data.product);
    } catch (err) {
      if (err.status === 409 && Number.isInteger(err.currentStock)) {
        setExpectedStock(err.currentStock);
        setValues((v) => ({ ...v, stock: String(err.currentStock) }));
        setErrors({ stock: `Stock is now ${err.currentStock}. Enter the stock you want and save again.` });
        setNotice({
          tone: "error",
          text: `Stock changed since you opened this product. It's now ${err.currentStock}. Check the number and save again.`,
        });
      } else if (err.status === 409) {
        setErrors({ name: err.message });
        setNotice({ tone: "error", text: err.message });
      } else if (err.fields) {
        const mapped = {};
        for (const [key, message] of Object.entries(err.fields)) {
          if (key === "_") continue;
          mapped[FIELD_MAP[key] ?? key] = message;
        }
        setErrors(mapped);
        setNotice({ tone: "error", text: err.fields._ ?? err.message });
      } else {
        setNotice({ tone: "error", text: err.message });
      }
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = values.imageUrl.trim().startsWith(IMAGEKIT) ? ikUrl(values.imageUrl.trim(), "w-600") : null;

  return (
    <form onSubmit={submit} noValidate className="mt-8">
      {notice && (
        <FormAlert tone={notice.tone} className="mb-6">
          {notice.text}
        </FormAlert>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
        <section aria-labelledby="details-heading" className={`${card} space-y-5`}>
          <h2 id="details-heading" className="text-xl font-semibold">
            Details
          </h2>
          <TextField
            label="Name"
            required
            maxLength={150}
            hint={<Counter value={values.name} max={150} />}
            value={values.name}
            onChange={set("name")}
            error={errors.name}
          />
          <div>
            <label htmlFor="product-category-field" className="mb-2 block text-sm font-semibold">
              Category
            </label>
            <select
              id="product-category-field"
              required
              value={values.categoryId}
              onChange={set("categoryId")}
              aria-invalid={errors.categoryId ? true : undefined}
              aria-describedby={errors.categoryId ? "product-category-error" : undefined}
              className={`${inputClasses} ${errors.categoryId ? "border-status-alert-text" : "border-input-border"}`}
            >
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError id="product-category-error">{errors.categoryId}</FieldError>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Price (GH₵)"
              inputMode="decimal"
              autoComplete="off"
              required
              placeholder="120.00"
              value={values.price}
              onChange={set("price")}
              error={errors.price}
            />
            <TextField
              label="Stock"
              inputMode="numeric"
              autoComplete="off"
              required
              placeholder="0"
              hint={isEdit ? `Current stock: ${expectedStock}` : "Whole number, 0 to 100,000"}
              value={values.stock}
              onChange={set("stock")}
              error={errors.stock}
            />
          </div>
          <TextField
            label="Description"
            multiline
            rows={6}
            maxLength={2000}
            required
            hint={<Counter value={values.description} max={2000} />}
            value={values.description}
            onChange={set("description")}
            error={errors.description}
            inputClassName="resize-y"
          />
        </section>

        <div className="space-y-6">
          <section aria-labelledby="image-heading" className={`${card} space-y-5`}>
            <h2 id="image-heading" className="text-xl font-semibold">
              Photo
            </h2>
            <p className="text-sm text-text-muted">Upload the photo in ImageKit first, then paste its address here.</p>
            <TextField
              label="Image address"
              type="url"
              inputMode="url"
              autoComplete="off"
              required
              placeholder="https://ik.imagekit.io/…"
              value={values.imageUrl}
              onChange={set("imageUrl")}
              error={errors.imageUrl}
            />
            <div className="overflow-hidden rounded-field border border-border bg-tint-default">
              <Img
                key={previewUrl ?? "none"}
                src={previewUrl}
                alt={values.imageAlt.trim() ? `Preview: ${values.imageAlt.trim()}` : "Preview of the product photo"}
                className="aspect-square w-full object-cover"
              />
            </div>
            <TextField
              label="Image description (alt text)"
              multiline
              rows={2}
              maxLength={200}
              required
              hint={
                <>
                  Describe the photo for people using screen readers. <Counter value={values.imageAlt} max={200} />
                </>
              }
              value={values.imageAlt}
              onChange={set("imageAlt")}
              error={errors.imageAlt}
              inputClassName="resize-y"
            />
          </section>

          <section aria-labelledby="status-heading" className={card}>
            <h2 id="status-heading" className="text-xl font-semibold">
              Status
            </h2>
            <label htmlFor={activeId} className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-4">
              <span className="font-medium">Show this product in the shop</span>
              <span className="relative inline-flex shrink-0">
                <input
                  id={activeId}
                  type="checkbox"
                  role="switch"
                  checked={values.isActive}
                  onChange={(event) => toggleActive(event.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="h-7 w-12 rounded-full bg-input-border transition-colors peer-checked:bg-text peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-1 left-1 size-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5"
                />
              </span>
            </label>
            <p className="mt-2 text-sm text-text-muted">
              {values.isActive ? "Active: shoppers can find and buy it." : "Inactive: hidden from the shop."}
              {isEdit && values.isActive !== baseline.isActive && " Press Save changes to apply."}
            </p>
          </section>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {dirty && <p className="text-sm text-text-muted sm:mr-auto">You have unsaved changes.</p>}
        <Button type="submit" disabled={saving} className="min-h-12 w-full sm:w-auto sm:px-10">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDeactivate}
        title="Hide this product from the shop?"
        message="Shoppers won't be able to buy it until you make it active again. Past orders aren't affected."
        confirmLabel="Hide from shop"
        cancelLabel="Keep it active"
        onConfirm={() => {
          setValues((v) => ({ ...v, isActive: false }));
          setConfirmDeactivate(false);
        }}
        onCancel={() => setConfirmDeactivate(false)}
      />

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Leave without saving?"
        message="Your changes to this product haven't been saved."
        confirmLabel="Leave without saving"
        cancelLabel="Stay"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </form>
  );
}
