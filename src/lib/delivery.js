const STORAGE_KEY = "deliveryArea";

export const OTHER_TOWN = "other";

export function deliveryText(regionName, townName) {
  if (!regionName) return "Delivery area: not recorded";
  return townName ? `Delivery to: ${townName}, ${regionName}` : `Delivery to: ${regionName} (other town)`;
}

export function findFee(regions, regionId, townKey) {
  const region = regions?.find((r) => String(r.id) === String(regionId));
  if (!region) return null;
  if (townKey === OTHER_TOWN) return { feeGhs: region.feeGhs, feeUsd: region.feeUsd };
  const town = region.towns.find((t) => String(t.id) === String(townKey));
  return town ? { feeGhs: town.feeGhs, feeUsd: town.feeUsd } : null;
}

export function readSavedArea() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return saved && saved.regionId ? saved : null;
  } catch {
    return null;
  }
}

export function saveArea(area) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(area));
  } catch {
    return false;
  }
  return true;
}
