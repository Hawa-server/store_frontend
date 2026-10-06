import { Link } from "react-router-dom";
import LogoMark from "./LogoMark";

export default function Logo({ tone = "default", className = "" }) {
  return (
    <Link
      to="/"
      aria-label="Adorn home"
      className={`inline-flex min-h-11 items-center gap-2.5 lg:gap-3 ${
        tone === "footer" ? "focus-visible:outline-on-footer" : ""
      } ${className}`}
    >
      <LogoMark tone={tone} />
      <span
        aria-hidden="true"
        className="font-display text-[1.6rem] leading-none font-bold tracking-[0.2em] uppercase lg:text-[1.9rem]"
      >
        Adorn
      </span>
    </Link>
  );
}
