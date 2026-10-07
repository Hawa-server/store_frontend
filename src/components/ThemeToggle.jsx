import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const tones = {
  default: "text-text hover:bg-text/8",
  sidebar: "text-on-footer hover:bg-on-footer/10 focus-visible:outline-on-footer",
};

export default function ThemeToggle({ tone = "default", withLabel = false, className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={withLabel ? undefined : label}
      title={label}
      className={`inline-flex min-h-11 items-center justify-center gap-3 rounded-full transition-colors ${
        withLabel ? "px-3" : "size-11"
      } ${tones[tone]} ${className}`}
    >
      <Icon className="size-5.5" strokeWidth={1.6} aria-hidden="true" />
      {withLabel && <span>{label}</span>}
    </button>
  );
}
