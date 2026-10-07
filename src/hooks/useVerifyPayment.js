import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

const RETRY_CHECKOUT_REASONS = ["declined", "not_completed", "reversed", "closed"];
const POLL_MS = 3000;
const GIVE_UP_MS = 120000;
const REQUEST_TIMEOUT_MS = 30000;

export const STILL_WAITING =
  "We're still waiting for your payment. We'll email you when it's confirmed.";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyOnce(reference) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await api("/api/checkout/verify", {
      method: "POST",
      body: { reference },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function outcomeFor(error) {
  if (error.name === "AbortError" || error.code === "NETWORK_ERROR") {
    return {
      status: "failed",
      message: "We couldn't confirm your payment right now. Please try again.",
      retry: "verify",
    };
  }
  if (error.status === 402 && RETRY_CHECKOUT_REASONS.includes(error.reason)) {
    return { status: "failed", message: error.message, retry: "checkout" };
  }
  if (error.status === 503) return { status: "failed", message: error.message, retry: "verify" };
  return { status: "failed", message: error.message, retry: null };
}

export function useVerifyPayment() {
  const [state, setState] = useState({ status: "idle" });
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const verify = useCallback(
    async (reference) => {
      const startedAt = Date.now();
      setState({ status: "verifying", reference });

      while (active.current) {
        let data;
        try {
          data = await verifyOnce(reference);
        } catch (error) {
          if (active.current) setState({ ...outcomeFor(error), reference });
          return;
        }

        if (data?.order) {
          await refreshCart();
          if (active.current) {
            setState({ status: "paid", order: data.order });
            navigate(`/order/confirmation/${data.order.confirmationToken}`, { replace: true });
          }
          return;
        }

        if (Date.now() - startedAt >= GIVE_UP_MS) {
          if (active.current) setState({ status: "waiting", message: STILL_WAITING, reference });
          return;
        }
        if (active.current) setState({ status: "verifying", pending: true, reference });
        await wait(POLL_MS);
      }
    },
    [navigate, refreshCart],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, verify, reset };
}
