import { Link } from "react-router-dom";
import Img from "./Img";
import StockBadge from "./StockBadge";
import { formatGhs, ikSrcSet, ikUrl, tintClass } from "../lib/format";

export default function ProductCard({ product }) {
  const image = product.mainImage;

  return (
    <article className="group relative flex w-full flex-col rounded-card outline-offset-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-accent">
      <div
        className={`relative aspect-square overflow-hidden rounded-card ${tintClass(product.category?.slug)}`}
      >
        <Img
          src={ikUrl(image?.url, "w-600")}
          srcSet={ikSrcSet(image?.url, [400, 600, 800])}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          alt={image?.altText ?? product.name}
          className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <StockBadge product={product} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
          {product.category?.name}
        </p>
        <h3 className="mt-1 text-base leading-snug font-semibold sm:text-lg">
          <Link
            to={`/product/${product.id}`}
            className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-auto pt-2 text-lg font-bold">{formatGhs(product.priceGhs)}</p>
      </div>
    </article>
  );
}
