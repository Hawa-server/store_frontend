import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import Button from "../../components/Button";
import Img from "../../components/Img";
import ErrorMessage from "../../components/ErrorMessage";
import Pagination from "../../components/Pagination";
import AccessDenied from "../../components/AccessDenied";
import { FieldError, inputClasses } from "../../components/form/TextField";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useCategories } from "../../context/CategoriesContext";
import { useAdminStats } from "../../context/AdminStatsContext";
import { formatDate, formatGhs, ikUrl, pluralise, tintClass } from "../../lib/format";
import { pageFromParams } from "../../lib/orders";

const STATUSES = [
  ["", "All"],
  ["active", "Active"],
  ["inactive", "Inactive"],
];

export function StockTag({ stock, threshold }) {
  if (stock === 0) {
    return (
      <span className="inline-flex rounded-full bg-status-alert-bg px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap text-status-alert-text">
        Out of stock
      </span>
    );
  }
  if (threshold !== null && stock <= threshold) {
    return (
      <span className="inline-flex rounded-full bg-status-pending-bg px-2.5 py-0.5 text-sm font-semibold text-status-pending-text">
        Low
      </span>
    );
  }
  return null;
}

export function ActiveBadge({ active }) {
  return active ? (
    <span className="inline-flex rounded-full bg-status-success-bg px-2.5 py-0.5 text-sm font-semibold text-status-success-text">
      Active
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-status-cancelled-bg px-2.5 py-0.5 text-sm font-semibold text-status-cancelled-text">
      Inactive
    </span>
  );
}

function Thumb({ product, size = "size-12" }) {
  return (
    <span className={`block shrink-0 overflow-hidden rounded-lg ${size} ${tintClass(product.category?.slug)}`}>
      <Img src={ikUrl(product.mainImage?.url, "w-120")} alt="" className="size-full object-cover" />
    </span>
  );
}

export default function AdminProductsPage() {
  useDocumentTitle("Products · Admin");
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const { lowStockThreshold } = useAdminStats();

  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const status = params.get("status") === "active" || params.get("status") === "inactive" ? params.get("status") : "";
  const page = pageFromParams(params);
  const [searchText, setSearchText] = useState(search);
  const debounce = useRef(null);

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (category) query.set("category", category);
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const { data, error, loading, reload } = useApi(`/api/admin/products?${query}`);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => () => clearTimeout(debounce.current), []);

  if (error?.status === 403) return <AccessDenied />;

  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    setParams(next);
  }

  function onSearchChange(value) {
    setSearchText(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => update({ search: value.trim() }), 400);
  }

  function clearAll() {
    clearTimeout(debounce.current);
    setSearchText("");
    setParams(new URLSearchParams());
  }

  const products = data?.items ?? [];
  const filtered = Boolean(search || category || status);
  const fields = error?.fields ?? {};

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">Products</h1>
          {data && (
            <p className="mt-2 text-text-muted">
              {pluralise(data.totalItems, "product")}
              {filtered ? " match these filters" : ", A to Z"}
            </p>
          )}
        </div>
        <Button to="/admin/products/new">
          <Plus className="size-5" aria-hidden="true" />
          Add product
        </Button>
      </div>

      <div
        role="search"
        aria-label="Filter products"
        className="mt-8 grid gap-4 rounded-card border border-border bg-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-end"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            clearTimeout(debounce.current);
            update({ search: searchText.trim() });
          }}
        >
          <label htmlFor="product-search" className="mb-2 block text-sm font-semibold">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              id="product-search"
              type="search"
              value={searchText}
              maxLength={100}
              placeholder="Product name"
              onChange={(event) => onSearchChange(event.target.value)}
              aria-invalid={fields.search ? true : undefined}
              aria-describedby={fields.search ? "product-search-error" : undefined}
              className={`${inputClasses} border-input-border pr-12 pl-10 [&::-webkit-search-cancel-button]:hidden`}
            />
            {searchText && (
              <button
                type="button"
                onClick={() => {
                  clearTimeout(debounce.current);
                  setSearchText("");
                  update({ search: "" });
                }}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-field text-text-muted hover:text-text"
              >
                <X className="size-4.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <FieldError id="product-search-error">{fields.search}</FieldError>
        </form>

        <div>
          <label htmlFor="product-category" className="mb-2 block text-sm font-semibold">
            Category
          </label>
          <select
            id="product-category"
            value={category}
            onChange={(event) => update({ category: event.target.value })}
            className={`${inputClasses} border-input-border`}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError>{fields.category}</FieldError>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p id="status-label" className="mb-2 text-sm font-semibold">
              Status
            </p>
            <div role="group" aria-labelledby="status-label" className="inline-flex rounded-full border border-border bg-bg p-1">
              {STATUSES.map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => update({ status: value })}
                  aria-pressed={status === value}
                  className={`min-h-11 rounded-full px-4 text-[15px] font-medium transition-colors ${
                    status === value ? "bg-text text-bg" : "text-text hover:bg-text/8"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="secondary" onClick={clearAll} disabled={!filtered && !searchText}>
            Clear filters
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {error && !error.fields ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : error ? (
          <p className="text-text-muted">Fix the filters above to see products.</p>
        ) : loading && !data ? (
          <div className="space-y-3" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-field bg-disabled" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-12 text-center">
            <p className="font-display text-3xl font-semibold">
              {filtered ? "No products match these filters." : "No products yet."}
            </p>
            {filtered ? (
              <Button variant="secondary" onClick={clearAll} className="mt-6">
                Clear filters
              </Button>
            ) : (
              <Button to="/admin/products/new" className="mt-6">
                Add product
              </Button>
            )}
          </div>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""} aria-busy={loading}>
            <ul className="space-y-3 md:hidden" aria-label="Products">
              {products.map((product) => (
                <li key={product.id} className="flex gap-4 rounded-card border border-border bg-surface p-4">
                  <Thumb product={product} size="size-16" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-text-muted">{product.category?.name}</p>
                    <p className="mt-1 font-semibold">{formatGhs(product.priceGhs)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span>Stock {product.stock}</span>
                      <StockTag stock={product.stock} threshold={lowStockThreshold} />
                      <ActiveBadge active={product.isActive} />
                    </div>
                  </div>
                  <Link
                    to={`/admin/products/${product.id}`}
                    className="inline-flex min-h-11 items-center self-start rounded-full border border-text px-4 text-sm font-semibold hover:bg-text hover:text-bg"
                  >
                    Edit<span className="sr-only"> {product.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-card border border-border bg-surface md:block" role="region" aria-label="Products table" tabIndex={0}>
              <table className="w-full min-w-[44rem] text-left">
                <thead>
                  <tr className="border-b border-border text-sm text-text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">Product</th>
                    <th scope="col" className="px-4 py-3 font-medium">Category</th>
                    <th scope="col" className="px-4 py-3 font-medium">Price</th>
                    <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <Thumb product={product} />
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="-my-2 inline-block py-2 font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-2">{product.category?.name}</td>
                      <td className="px-4 py-2 font-semibold whitespace-nowrap">{formatGhs(product.priceGhs)}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{product.stock}</span>
                          <StockTag stock={product.stock} threshold={lowStockThreshold} />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <ActiveBadge active={product.isActive} />
                      </td>
                      <td className="px-4 py-2 text-sm whitespace-nowrap">{formatDate(product.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} label="Product pages" />
          </div>
        )}
      </div>
    </>
  );
}
