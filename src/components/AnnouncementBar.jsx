import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { useAnnouncement } from "../context/AnnouncementContext";
import { useAnnounce } from "../context/AnnouncerContext";

const control =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent";

export function AnnouncementBarView({ message, code, onClose, preview = false }) {
  const announce = useAnnounce();
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function selectCode() {
    const node = codeRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(code);
      setCopied(true);
      announce(`Code ${code} copied`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      selectCode();
      announce(`Code ${code} selected. Press Ctrl+C to copy it.`);
    }
  }

  return (
    <section aria-label="Announcement" className="bg-accent text-on-accent">
      <div className="mx-auto flex max-w-7xl items-center gap-2 py-1 pr-2 pl-4 sm:pl-6 lg:pl-8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm font-medium">
          <p className="min-w-0 wrap-break-word">{message}</p>
          {code && (
            <span className="inline-flex items-center gap-1.5">
              <span
                ref={codeRef}
                className="rounded-full border border-on-accent/60 px-2.5 py-0.5 font-bold tracking-wide select-all"
              >
                {code}
              </span>
              <button
                type="button"
                onClick={copy}
                disabled={preview}
                className={`${control} gap-1.5 px-3 font-semibold underline underline-offset-4 hover:bg-on-accent/10 disabled:cursor-default`}
              >
                {copied ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy code"}
              </button>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={preview}
          aria-label="Close announcement"
          className={`${control} size-11 hover:bg-on-accent/10 disabled:cursor-default`}
        >
          <X className="size-4.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default function AnnouncementBar() {
  const { announcement, visible, close } = useAnnouncement();
  if (!visible) return null;
  function onClose() {
    close();
    requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }));
  }

  return <AnnouncementBarView message={announcement.message} code={announcement.code} onClose={onClose} />;
}
