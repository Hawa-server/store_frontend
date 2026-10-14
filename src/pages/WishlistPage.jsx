import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart } from "lucide-react";
import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import ErrorMessage from "../components/ErrorMessage";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/ProductGrid";
import Pagination from "../components/Pagination";
import FormAlert from "../components/form/FormAlert";
import { useApi } from "../hooks/useApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAnnounce } from "../context/AnnouncerContext";
import { pageFromParams } from "../lib/orders";

const gridClasses = "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-y-12";

function toProduct(item) {
  return { ...item, id: item.productId };
}

function WishlistActions({ product, onMove, onRemove, busy }) {
  const unavailable = !product.isActive;
  const outOfStock = product.stock <= 0;

  return (
    <div className="relative z-10 flex w-full flex-col gap-2 xl:w-auto">
      {!unavailable && (
        <Button
          onClick={() => onMove(product)}
          disabled={busy || outOfStock}
          aria-label={outOfStock ? undefined : `Move ${product.name} to cart`}
          className="min-h-11 px-4 text-sm"
        >
          {busy === "move" ? "Moving…" : outOfStock ? "Out of stock" : "Move to cart"}
        </Button>
      )}
      <Button
        variant="secondary"
        onClick={() => onRemove(product)}
        disabled={Boolean(busy)}
        aria-label={`Remove ${product.name} from wishlist`}
        className="min-h-11 px-4 text-sm"
      >
        {busy === "remove" ? "Removing…" : "Remove"}
      </Button>
    </div>
  );
}

export default function WishlistPage() {
  useDocumentTitle("Your wishlist");
  const [params] = useSearchParams();
  const page = pageFromParams(params);
  const { data, error, loading, reload } = useApi(`/api/wishlist?page=${page}`);
  const { addItem } = useCart();
  const { count, remove, refreshIds } = useWishlist();
  const announce = useAnnounce();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState({});
  const [messages, setMessages] = useState({});
  const [notice, setNotice] = useState(null);
  const [focusIndex, setFocusIndex] = useState(null);
  const listRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    if (data?.items) setItems(data.items.map(toProduct));
  }, [data]);

  useEffect(() => {
    if (focusIndex === null) return;
    const cards = listRef.current?.querySelectorAll(":scope > li");
    const target = cards?.[Math.min(focusIndex, cards.length - 1)]?.querySelector("button");
    (target ?? headingRef.current)?.focus();
    setFocusIndex(null);
  }, [focusIndex, items]);

  const setItemBusy = (id, value) => setBusy((b) => ({ ...b, [id]: value }));
  const setItemMessage = (id, text) => setMessages((m) => ({ ...m, [id]: text }));

  function dropItem(product) {
    const index = items.findIndex((p) => p.id === product.id);
    const next = items.filter((p) => p.id !== product.id);
    setItems(next);
    if (next.length === 0 && data?.totalPages > 1) reload();
    setFocusIndex(index);
  }

  async function removeProduct(product) {
    setNotice(null);
    setItemMessage(product.id, null);
    setItemBusy(product.id, "remove");
    try {
      await remove(product.id);
      announce(`Removed from wishlist: ${product.name}`);
      dropItem(product);
    } catch (err) {
      setItemMessage(product.id, err.message);
      announce(err.message);
    } finally {
      setItemBusy(product.id, null);
    }
  }

  async function moveToCart(product) {
    setNotice(null);
    setItemMessage(product.id, null);
    setItemBusy(product.id, "move");
    try {
      await addItem(product.id, 1);
    } catch (err) {
      setItemBusy(product.id, null);
      setItemMessage(product.id, err.message);
      announce(err.message);
      return;
    }
    try {
      await remove(product.id);
      announce(`Moved to cart: ${product.name}`);
      dropItem(product);
    } catch {
      const text = `${product.name} was added to your cart, but we couldn't remove it from your wishlist.`;
      setNotice(text);
      announce(text);
      reload();
      refreshIds();
    } finally {
      setItemBusy(product.id, null);
    }
  }

  return (
    <PageContainer className="py-10 lg:py-14">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Saved for later</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-4xl leading-tight font-semibold focus:outline-none sm:text-5xl lg:text-6xl"
        >
          Your wishlist
        </h1>
        {count > 0 && <p className="text-text-muted">{count === 1 ? "1 saved product" : `${count} saved products`}</p>}
      </div>

      {notice && (
        <FormAlert tone="info" className="mt-6 max-w-2xl">
          {notice}
        </FormAlert>
      )}

      <div className="mt-8">
        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : loading && !data ? (
          <ProductGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
            <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-tint-default text-text-muted">
              <Heart className="size-7" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <p className="mx-auto mt-5 max-w-md text-lg text-text-body">
              Your wishlist is empty. Tap ♡ on any product to save it.
            </p>
            <Button to="/products" className="mt-7">
              Browse products
            </Button>
          </div>
        ) : (
          <>
            <ul ref={listRef} className={gridClasses} aria-label="Saved products">
              {items.map((product) => (
                <li key={product.id} className="flex flex-col">
                  <ProductCard
                    product={product}
                    unavailable={!product.isActive}
                    showWishlist={false}
                    actions={
                      <WishlistActions
                        product={product}
                        busy={busy[product.id]}
                        onMove={moveToCart}
                        onRemove={removeProduct}
                      />
                    }
                  />
                  {messages[product.id] && (
                    <p role="alert" className="mt-2 text-sm font-medium text-status-alert-text">
                      {messages[product.id]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} label="Wishlist pages" />
          </>
        )}
      </div>
    </PageContainer>
  );
}
