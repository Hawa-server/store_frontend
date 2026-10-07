import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, EyeOff } from "lucide-react";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import AccessDenied from "../../components/AccessDenied";
import FormAlert from "../../components/form/FormAlert";
import ProductForm from "../../components/admin/ProductForm";
import { ActiveBadge } from "./AdminProductsPage";
import NotFoundPage from "../NotFoundPage";
import { useApi } from "../../hooks/useApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useCategories } from "../../context/CategoriesContext";
import { useAnnounce } from "../../context/AnnouncerContext";
import { useAdminStats } from "../../context/AdminStatsContext";
import { formatDateTime } from "../../lib/format";

function BackLink() {
  return (
    <Link to="/admin/products" className="inline-flex min-h-11 items-center gap-2 font-semibold text-text-muted hover:text-text">
      <ArrowLeft className="size-4" aria-hidden="true" />
      All products
    </Link>
  );
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const announce = useAnnounce();
  const { refresh: refreshStats } = useAdminStats();
  const { categories, loading: categoriesLoading } = useCategories();
  const { data, error, loading, reload } = useApi(isEdit ? `/api/admin/products/${encodeURIComponent(id)}` : null);
  const [product, setProduct] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  useEffect(() => {
    setProduct(data?.product ?? null);
  }, [data]);

  useEffect(() => {
    if (location.state?.notice) announce(location.state.notice);
  }, [location.state, announce]);

  useDocumentTitle(isEdit ? (product ? `Edit ${product.name} · Admin` : "Edit product · Admin") : "Add product · Admin");

  if (error?.status === 403) return <AccessDenied />;
  if (isEdit && error && (error.status === 404 || error.status === 400)) {
    return (
      <NotFoundPage
        title="We couldn't find that product"
        message="It may have been typed wrongly in the address."
        actions={<Button to="/admin/products">Back to products</Button>}
      />
    );
  }

  function onSaved(saved) {
    refreshStats();
    if (!isEdit) {
      navigate(`/admin/products/${saved.id}`, { replace: true, state: { notice: "Product added." } });
      return;
    }
    setProduct(saved);
    setNotice("Changes saved");
    announce("Changes saved");
  }

  if (isEdit && (loading || !product) && !error) {
    return (
      <>
        <BackLink />
        <div className="mt-6 space-y-6" aria-hidden="true">
          <div className="h-12 w-1/2 animate-pulse rounded-full bg-disabled" />
          <div className="h-96 animate-pulse rounded-card bg-disabled" />
        </div>
      </>
    );
  }

  return (
    <>
      <BackLink />
      {isEdit && error ? (
        <div className="mt-6">
          <ErrorMessage error={error} onRetry={reload} />
        </div>
      ) : (
        <>
          <header className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-tight font-semibold text-balance sm:text-5xl">
                {isEdit ? (
                  <>
                    Edit product: <span className="wrap-break-word">{product.name}</span>
                  </>
                ) : (
                  "Add product"
                )}
              </h1>
              {isEdit && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
                  <ActiveBadge active={product.isActive} />
                  <span>Added {formatDateTime(product.createdAt)}</span>
                  <span>Updated {formatDateTime(product.updatedAt)}</span>
                </div>
              )}
            </div>
            {isEdit &&
              (product.isActive ? (
                <a
                  href={`/product/${product.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline underline-offset-4 hover:text-accent-dark"
                >
                  View in shop
                  <ExternalLink className="size-4" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <p className="inline-flex min-h-11 items-center gap-2 font-semibold text-text-muted">
                  <EyeOff className="size-4" aria-hidden="true" />
                  Hidden from the shop
                </p>
              ))}
          </header>

          {notice && (
            <FormAlert tone="success" className="mt-6 max-w-2xl">
              {notice}
            </FormAlert>
          )}

          {categoriesLoading && categories.length === 0 ? (
            <div className="mt-8 h-96 animate-pulse rounded-card bg-disabled" aria-hidden="true" />
          ) : (
            <ProductForm
              key={isEdit ? `${product.id}-${product.updatedAt}` : "new"}
              product={isEdit ? product : null}
              categories={categories}
              onSaved={onSaved}
              onSubmitStart={() => setNotice(null)}
            />
          )}
        </>
      )}
    </>
  );
}
