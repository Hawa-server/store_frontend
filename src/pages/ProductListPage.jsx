import { Link, NavLink, useParams } from "react-router-dom";
import ProductGrid, { ProductGridSkeleton } from "../components/ProductGrid";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import Button from "../components/Button";
import NotFoundPage from "./NotFoundPage";
import { useCategories } from "../context/CategoriesContext";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { pluralise } from "../lib/format";

function CategoryChips({ categories }) {
  const chip = ({ isActive }) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium whitespace-nowrap transition-colors ${
      isActive
        ? "border-text bg-text text-bg"
        : "border-input-border bg-surface text-text hover:border-text"
    }`;

  return (
    <nav aria-label="Filter by category" className="-mx-4 mt-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <ul className="flex gap-2">
        <li>
          <NavLink to="/products" end className={chip}>
            All
          </NavLink>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <NavLink to={`/category/${category.slug}`} className={chip}>
              {category.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ProductListPage() {
  const { slug } = useParams();
  const { categories } = useCategories();
  const path = slug ? `/api/products?category=${encodeURIComponent(slug)}` : "/api/products";
  const { data, error, loading, reload } = useApi(path);
  const products = data?.products ?? [];

  const category = slug
    ? categories.find((c) => c.slug === slug) ?? (products[0] ? products[0].category : null)
    : null;
  const title = slug ? category?.name ?? "" : "All products";
  useDocumentTitle(title || null);

  if (error && (error.status === 404 || error.status === 400)) {
    return <NotFoundPage title="We couldn't find that category" />;
  }

  return (
    <PageContainer className="pt-8 lg:pt-12">
      <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-text">
            {slug ? title || "Category" : "All products"}
          </li>
        </ol>
      </nav>

      <header className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1 className="min-h-12 font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {!loading && !error && (
          <p className="text-text-muted">
            {pluralise(products.length, "product")}
            {products.length > 1 && ", A to Z"}
          </p>
        )}
      </header>

      <CategoryChips categories={categories} />

      <div className="mt-8 lg:mt-10">
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
            <p className="font-display text-3xl font-semibold">Nothing here just yet</p>
            <p className="mx-auto mt-3 max-w-md text-text-body">
              We're restocking this collection. In the meantime, take a look at everything else in the shop.
            </p>
            <Button to="/products" className="mt-6">
              See all products
            </Button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </PageContainer>
  );
}
