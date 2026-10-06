import { Link } from "react-router-dom";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled disabled:text-text-muted";

const variants = {
  primary: "bg-text text-bg hover:bg-text/85",
  secondary: "border border-text text-text hover:bg-text hover:text-bg",
  photo: "bg-hero-text text-scrim hover:bg-hero-text/85 focus-visible:outline-hero-text",
  photoOutline:
    "border border-hero-text text-hero-text hover:bg-hero-text/15 focus-visible:outline-hero-text",
};

export default function Button({ to, variant = "primary", className = "", type = "button", ...props }) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={classes} {...props} />;
  return <button type={type} className={classes} {...props} />;
}
