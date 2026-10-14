import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";

const variants = {
  overlay: "size-11 bg-surface/90 shadow-sm backdrop-blur-sm hover:bg-surface",
  inline: "size-14 border border-input-border bg-surface hover:border-text",
};

export default function WishlistButton({ product, variant = "overlay", onError, className = "" }) {
  const { isSaved, isPending, toggle } = useWishlist();
  const saved = isSaved(product.id);
  const busy = isPending(product.id);

  async function onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    onError?.(null);
    const result = await toggle(product);
    if (result.error) onError?.(result.error);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-busy={busy || undefined}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-text transition-colors aria-busy:cursor-wait ${variants[variant]} ${className}`}
    >
      <Heart
        className={`size-5.5 ${saved ? "fill-accent text-accent" : ""}`}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </button>
  );
}
