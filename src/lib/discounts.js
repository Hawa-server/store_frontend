import { formatGhs } from "./format";

export const DISCOUNT_STATUSES = [
  ["active", "Active"],
  ["scheduled", "Scheduled"],
  ["expired", "Expired"],
  ["used_up", "Used up"],
  ["off", "Off"],
];

export const statusText = Object.fromEntries(DISCOUNT_STATUSES);

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dayMonthFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function parseDay(day) {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(`${day}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDay(day, { withYear = true } = {}) {
  const date = parseDay(day);
  if (!date) return "";
  return (withYear ? dayFormat : dayMonthFormat).format(date);
}

export function valueText({ type, value, maxDiscountPesewas }) {
  if (type === "percent") {
    return maxDiscountPesewas ? `${value}% off, up to ${formatGhs(maxDiscountPesewas)}` : `${value}% off`;
  }
  return `${formatGhs(value)} off`;
}

export function datesText({ startsOn, endsOn }) {
  if (startsOn && endsOn) return `${formatDay(startsOn)} – ${formatDay(endsOn)}`;
  if (startsOn) return `From ${formatDay(startsOn)}`;
  if (endsOn) return `Until ${formatDay(endsOn)}`;
  return "No end date";
}

export function usageText({ timesUsed, usageLimit }) {
  return usageLimit ? `Used ${timesUsed} / ${usageLimit}` : `Used ${timesUsed}`;
}

function describe(code, { once = true, minimum = true } = {}) {
  const { type, value, maxDiscountPesewas, minSubtotalPesewas, startsOn, endsOn, usageLimit, oncePerCustomer } = code;
  const parts = [];
  const what = type === "percent" ? `${value}% off` : `${formatGhs(value)} off`;
  parts.push(minimum && minSubtotalPesewas ? `${what} orders over ${formatGhs(minSubtotalPesewas)}` : what);
  if (type === "percent" && maxDiscountPesewas) parts.push(`up to ${formatGhs(maxDiscountPesewas)}`);
  if (once && oncePerCustomer) parts.push("once per customer");
  if (usageLimit) parts.push(`${usageLimit === 1 ? "1 use" : `${usageLimit} uses`} in total`);
  if (startsOn && endsOn) parts.push(`from ${formatDay(startsOn, { withYear: false })} until ${formatDay(endsOn)}`);
  else if (startsOn) parts.push(`from ${formatDay(startsOn)}`);
  else if (endsOn) parts.push(`until ${formatDay(endsOn)}`);
  return parts;
}

export function previewText(code) {
  if (!code.value) return "";
  const parts = describe(code);
  if (!code.minSubtotalPesewas) parts[0] = `${parts[0]} any order`;
  const sentence = parts.join(", ");
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

export const ANNOUNCEMENT_MAX = 120;

export function suggestedMessage(code) {
  const attempts = [{}, { once: false }, { once: false, minimum: false }];
  let text = "";
  for (const options of attempts) {
    text = `Use ${code.code}: ${describe(code, options).join(", ")}`;
    if (text.length <= ANNOUNCEMENT_MAX) return text;
  }
  return text.slice(0, ANNOUNCEMENT_MAX - 1).trimEnd() + "…";
}
