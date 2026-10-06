const moneyFormat = new Intl.NumberFormat("en-GH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGhs(pesewas) {
  return `GH₵ ${moneyFormat.format(pesewas / 100)}`;
}

export function ikUrl(url, transform) {
  if (!url) return null;
  return `${url}${url.includes("?") ? "&" : "?"}tr=${transform}`;
}

export function ikSrcSet(url, widths) {
  if (!url) return undefined;
  return widths.map((w) => `${ikUrl(url, `w-${w}`)} ${w}w`).join(", ");
}

const tintClasses = {
  bags: "bg-tint-bags",
  makeup: "bg-tint-makeup",
  skincare: "bg-tint-skincare",
  jewellery: "bg-tint-jewellery",
  accessories: "bg-tint-accessories",
  perfumes: "bg-tint-perfumes",
};

export function tintClass(slug) {
  return tintClasses[slug] ?? "bg-tint-default";
}

export function pluralise(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
