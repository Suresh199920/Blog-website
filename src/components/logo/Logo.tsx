/**
 * Monogram logo: an "S" in a rounded indigo tile.
 *
 * Drawn as inline SVG rather than an image file so it stays sharp at any
 * size, inherits the theme colours, and can double as the favicon. The
 * letterform is a text node so it picks up the current font stack.
 */
export function Logo({
  letter,
  className,
  size = 32,
}: {
  letter: string;
  className?: string;
  size?: number;
}) {
  const initial = letter.trim().charAt(0).toUpperCase() || "B";

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label={`${initial} logo`}
      className={className}
    >
      <defs>
        <linearGradient id="logo-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="8" fill="url(#logo-fill)" />

      {/* Amber dot echoes the accent colour used across the site. */}
      <circle cx="25" cy="7" r="2" fill="#fbbf24" />

      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="inherit"
        fontSize="19"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="#ffffff"
      >
        {initial}
      </text>
    </svg>
  );
}