const tones = {
  default: { circle: "fill-text", letter: "fill-bg" },
  footer: { circle: "fill-on-footer", letter: "fill-footer" },
};

export default function LogoMark({ tone = "default", className = "size-9 lg:size-10" }) {
  const colors = tones[tone];

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      <circle cx="32" cy="32" r="32" className={colors.circle} />
      <g className={colors.letter}>
        <polygon points="31.0,13.2 32.6,14.4 20.3,47.0 18.1,47.0" />
        <polygon points="31.0,13.2 33.6,13.2 46.9,47.0 43.1,47.0" />
        <rect x="15.5" y="46" width="7.5" height="2" rx="1" />
        <rect x="41" y="46" width="8.5" height="2" rx="1" />
      </g>
      <polygon points="26,35.5 32,30 38,35.5 32,41" className="fill-gold" />
    </svg>
  );
}
