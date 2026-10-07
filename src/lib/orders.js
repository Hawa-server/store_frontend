export const STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

export const statusLabels = {
  Pending: "Pending: we're preparing your order",
  Shipped: "Shipped: your order is on its way",
  Delivered: "Delivered: your order has arrived",
  Cancelled: "Cancelled",
};

export function shopperRefundText(status) {
  return status === "failed" ? "We're sorting out your refund" : "Your refund is being processed";
}

export const AMOUNT_FORMAT_ERROR = "Enter an amount in GH₵ with at most 2 decimal places, for example 50 or 50.25.";

export function parseGhsAmount(text, { max, maxError } = {}) {
  const value = String(text).trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return { error: AMOUNT_FORMAT_ERROR };
  const pesewas = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(pesewas)) return { error: AMOUNT_FORMAT_ERROR };
  if (pesewas <= 0) return { error: "Enter an amount greater than GH₵ 0.00." };
  if (max !== undefined && pesewas > max) return { error: maxError ?? AMOUNT_FORMAT_ERROR };
  return { pesewas };
}

export function pageFromParams(params) {
  const raw = params.get("page");
  return raw && /^[1-9]\d*$/.test(raw) ? Number(raw) : 1;
}
