import { Link } from "react-router-dom";
import Img from "./Img";
import { ikSrcSet, ikUrl, pluralise, tintClass } from "../lib/format";

export default function CategoryTile({ category, image }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative block rounded-card outline-offset-4"
    >
      <div
        className={`relative aspect-16/11 overflow-hidden rounded-card md:aspect-square ${tintClass(category.slug)}`}
      >
        {image && (
          <>
            <Img
              src={ikUrl(image.url, "w-600")}
              srcSet={ikSrcSet(image.url, [400, 600])}
              sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
              alt=""
              className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-scrim/80 via-scrim/25 to-transparent md:hidden" />
          </>
        )}
      </div>
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col p-3.5 md:static md:px-0 md:pt-3 md:pb-0 ${
          image ? "text-hero-text md:text-text" : "text-text"
        }`}
      >
        <span className="text-lg font-semibold md:text-xl">{category.name}</span>
        <span
          className={`hidden text-sm md:block ${image ? "md:text-text-muted" : "text-text-muted"}`}
        >
          {pluralise(category.productCount, "product")}
        </span>
      </div>
    </Link>
  );
}
