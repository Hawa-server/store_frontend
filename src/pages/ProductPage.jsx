import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Img from "../components/Img";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import StockBadge from "../components/StockBadge";
import NotFoundPage from "./NotFoundPage";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatGhs, ikSrcSet, ikUrl, tintClass } from "../lib/format";

function Gallery({ product }) {
  const images = product.images?.length ? product.images : product.mainImage ? [product.mainImage] : [];
  const [selected, setSelected] = useState(0);
  const current = images[selected];
  const tint = tintClass(product.category?.slug);

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-5">
      <div className={`relative aspect-7/8 flex-1 overflow-hidden rounded-card ${tint}`}>
        <Img
          src={ikUrl(current?.url, "w-1200")}
          srcSet={ikSrcSet(current?.url, [800, 1200, 1600])}
          sizes="(min-width: 1024px) 50vw, 100vw"
          alt={current?.altText ?? product.name}
          loading="eager"
          fetchPriority="high"
          className="size-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible" aria-label="Product photos">
          {images.map((image, i) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                className={`block size-20 overflow-hidden rounded-xl border-2 lg:size-24 ${tint} ${
                  i === selected ? "border-text" : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                <Img src={ikUrl(image.url, "w-200")} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-2 lg:gap-16" aria-hidden="true">
      <div className="aspect-7/8 rounded-card bg-disabled" />
      <div className="space-y-5 pt-4">
        <div className="h-3 w-24 rounded-full bg-disabled" />
        <div className="h-12 w-4/5 rounded-full bg-disabled" />
        <div className="h-8 w-40 rounded-full bg-disabled" />
        <div className="h-24 w-full rounded-2xl bg-disabled" />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi(`/api/products/${encodeURIComponent(id)}`);
  const product = data?.product;
  useDocumentTitle(product?.name ?? null);

  if (error && (error.status === 404 || error.status === 400)) {
    return <NotFoundPage title="We couldn't find that product" message="It may have sold out for good or been removed from the shop." />;
  }

  return (
    <PageContainer className="pt-6 lg:pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link to="/products" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text">
              All products
            </Link>
          </li>
          {product?.category && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to={`/category/${product.category.slug}`}
                  className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          {product && (
            <>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-text">
                {product.name}
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="mt-3 lg:mt-5">
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : loading ? (
          <ProductSkeleton />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
            <Gallery key={product.id} product={product} />

            <div className="lg:pt-4">
              <Link
                to={`/category/${product.category.slug}`}
                className="inline-flex min-h-11 items-center text-sm font-semibold tracking-[0.18em] text-accent uppercase underline underline-offset-4 hover:text-accent-dark"
              >
                {product.category.name}
              </Link>
              <h1 className="mt-1 font-display text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mt-5 text-3xl font-bold lg:mt-7 lg:text-4xl">{formatGhs(product.priceGhs)}</p>
              <div className="mt-4">
                <StockBadge product={product} variant="pill" />
              </div>
              {product.description && (
                <p className="mt-6 max-w-prose text-lg leading-relaxed text-text-body">{product.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
