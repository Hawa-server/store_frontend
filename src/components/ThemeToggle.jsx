import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex size-11 items-center justify-center rounded-full text-text transition-colors hover:bg-text/8 ${className}`}
    >
      {isDark ? (
        <Sun className="size-5.5" strokeWidth={1.6} aria-hidden="true" />
      ) : (
        <Moon className="size-5.5" strokeWidth={1.6} aria-hidden="true" />
      )}
    </button>
  );
}
