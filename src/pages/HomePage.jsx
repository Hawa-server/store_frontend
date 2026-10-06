import { useMemo } from "react";
import HeroSlider from "../components/HeroSlider";
import CategoryTile from "../components/CategoryTile";
import ProductGrid, { ProductGridSkeleton } from "../components/ProductGrid";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import { useCategories } from "../context/CategoriesContext";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { pluralise } from "../lib/format";

function firstImageByCategory(products) {
  const images = {};
  for (const product of products) {
    const slug = product.category?.slug;
    if (slug && !images[slug] && product.mainImage?.url) images[slug] = product.mainImage;
  }
  return images;
}

function SectionHeading({ id, title, aside }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 lg:mb-8">
      <h2 id={id} className="font-display text-[2rem] leading-tight font-medium sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {aside}
    </div>
  );
}

export default function HomePage() {
  useDocumentTitle(null);
  const { categories, loading: categoriesLoading, error: categoriesError, reload: reloadCategories } =
    useCategories();
  const { data, error, loading, reload } = useApi("/api/products");
  const products = data?.products ?? [];
  const tileImages = useMemo(() => firstImageByCategory(products), [products]);

  return (
    <>
      <h1 className="sr-only">ADORN: bags, beauty and jewellery delivered across Ghana</h1>
      <HeroSlider />

      <PageContainer as="section" aria-labelledby="categories-heading" className="pt-12 lg:pt-20">
        <SectionHeading id="categories-heading" title="Shop by category" />
        {categoriesError ? (
          <ErrorMessage error={categoriesError} onRetry={reloadCategories} />
        ) : categoriesLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-16/11 animate-pulse rounded-card bg-disabled md:aspect-square" />
            ))}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {categories.map((category) => (
              <li key={category.slug}>
                <CategoryTile category={category} image={loading ? null : tileImages[category.slug]} />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>

      <PageContainer as="section" aria-labelledby="products-heading" className="pt-16 lg:pt-24">
        <SectionHeading
          id="products-heading"
          title="All products"
          aside={
            !loading &&
            !error && (
              <p className="text-sm text-text-muted">{pluralise(products.length, "product")}, A to Z</p>
            )
          }
        />
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : loading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductGrid products={products} />
        )}
      </PageContainer>
    </>
  );
}
