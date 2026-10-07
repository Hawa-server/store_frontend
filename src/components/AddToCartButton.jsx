import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import Button from "./Button";
import { useCart } from "../context/CartContext";
import { useAnnounce } from "../context/AnnouncerContext";

const sizes = {
  sm: "min-h-11 px-4 text-sm",
  lg: "min-h-14 px-8 text-lg",
};

export default function AddToCartButton({ product, quantity = 1, size = "sm", onAdded, onError, className = "" }) {
  const { addItem } = useCart();
  const announce = useAnnounce();
  const [status, setStatus] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (product.stock <= 0) {
    return (
      <Button variant="secondary" disabled className={`${sizes[size]} ${className}`}>
        Out of stock
      </Button>
    );
  }

  async function add() {
    if (status === "adding") return;
    setStatus("adding");
    onError?.(null);
    try {
      const data = await addItem(product.id, quantity);
      setStatus("added");
      announce(`Added to cart: ${product.name}`);
      onAdded?.(data);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      setStatus("idle");
      announce(error.message);
      onError?.(error);
    }
  }

  return (
    <Button
      onClick={add}
      aria-disabled={status === "adding" ? true : undefined}
      aria-label={status === "idle" ? `Add ${product.name} to cart` : undefined}
      className={`${sizes[size]} aria-disabled:cursor-wait aria-disabled:opacity-70 ${className}`}
    >
      {status === "adding" && "Adding…"}
      {status === "added" && (
        <>
          <Check className="size-4.5" strokeWidth={2.2} aria-hidden="true" />
          Added to cart
        </>
      )}
      {status === "idle" && "Add to cart"}
    </Button>
  );
}
