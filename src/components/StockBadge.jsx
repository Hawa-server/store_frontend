const overlayStyles = {
  low: "bg-accent text-on-accent",
  out: "bg-text text-bg",
};

const pillStyles = {
  low: "bg-status-alert-bg text-status-alert-text",
  out: "bg-status-alert-bg text-status-alert-text",
  in: "bg-status-success-bg text-status-success-text",
};

function stockKind(product) {
  if (product.stock <= 0) return "out";
  if (product.stockLabel === "In stock") return "in";
  return "low";
}

export default function StockBadge({ product, variant = "overlay" }) {
  const kind = stockKind(product);

  if (variant === "overlay") {
    if (kind === "in") return null;
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${overlayStyles[kind]}`}
      >
        {product.stockLabel}
      </span>
    );
  }

  return (
    <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${pillStyles[kind]}`}>
      {product.stockLabel}
    </span>
  );
}
