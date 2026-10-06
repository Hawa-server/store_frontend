import ProductCard from "./ProductCard";

const gridClasses = "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-y-12";

export default function ProductGrid({ products }) {
  return (
    <ul className={gridClasses}>
      {products.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className={gridClasses} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-card bg-disabled" />
          <div className="mt-4 h-3 w-1/3 rounded-full bg-disabled" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-disabled" />
          <div className="mt-4 h-5 w-2/5 rounded-full bg-disabled" />
        </div>
      ))}
    </div>
  );
}
