import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { CircleCheck, X } from "lucide-react";
import PageContainer from "./PageContainer";
import { useAuth } from "../context/AuthContext";

export default function FlashBanner() {
  const { flash, dismissFlash } = useAuth();
  const { pathname } = useLocation();
  const shownOn = useRef(null);

  useEffect(() => {
    if (!flash) {
      shownOn.current = null;
      return;
    }
    if (shownOn.current === null) {
      shownOn.current = pathname;
      return;
    }
    if (shownOn.current !== pathname) {
      if (pathname === "/" && shownOn.current !== "/") shownOn.current = "/";
      else dismissFlash();
    }
  }, [flash, pathname, dismissFlash]);

  if (!flash) return null;
  return (
    <PageContainer className="pt-4">
      <div
        role="status"
        className="flex items-start gap-3 rounded-card border border-border bg-status-success-bg px-4 py-3.5 text-status-success-text sm:px-5"
      >
        <CircleCheck className="mt-0.5 size-5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <p className="min-w-0 flex-1 font-medium">{flash}</p>
        <button
          type="button"
          onClick={dismissFlash}
          aria-label="Dismiss this message"
          className="-mt-1.5 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-status-success-text/10"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </PageContainer>
  );
}
