const API_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor({ status, code, message, fields, reason, currentStock }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.reason = reason;
    this.currentStock = currentStock;
  }
}

let unauthenticatedHandler = null;

export function setUnauthenticatedHandler(handler) {
  unauthenticatedHandler = handler;
}

export async function api(path, { method = "GET", body, signal, authRedirect = true } = {}) {
  const headers = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "We couldn't reach the store. Check your connection and try again.",
    });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = data?.error ?? {};
    const apiError = new ApiError({
      status: res.status,
      code: error.code ?? "SERVER_ERROR",
      message: error.message ?? "Something went wrong. Please try again.",
      fields: error.fields,
      reason: error.reason,
      currentStock: error.currentStock,
    });
    if (res.status === 401 && authRedirect && unauthenticatedHandler) unauthenticatedHandler(apiError);
    throw apiError;
  }

  return data;
}
