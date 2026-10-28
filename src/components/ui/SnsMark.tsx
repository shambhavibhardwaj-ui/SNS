/**
 * The SNS mark.
 *
 * A dome over a plate. The dome is the city's own architecture — the
 * North Indian district is built from it — and the plate is what the whole
 * product is for, so the logo says "food" and "place" in one shape rather
 * than picking one of them.
 *
 * **Plum and butter, always.** A logo does not take the theme: this mark is
 * the same on the teal city, the plum admin, the blush landing band and the
 * blue sign-in screen. Butter on plum measures 9.37:1, so it survives being
 * shrunk and printed as well as being looked at.
 *
 * Four shapes, because it has to work at 20px in a browser tab. Anything
 * finer — a rim highlight, a steam curl — disappears at that size and only
 * adds noise to the places it does survive.
 *
 * Replaces an inline SVG that was copy-pasted into the top bar and the landing
 * nav and could drift between them.
 */
export function SnsMark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  /** Give this when the mark stands alone; omit beside the wordmark. */
  title?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* The tile. A rounded square rather than a circle: it holds its shape
          at favicon size, where a circle to the bleed loses its corners. */}
      <rect width="48" height="48" rx="12" fill="#7F1633" />

      {/* The dome. */}
      <path d="M13 31a11 11 0 0 1 22 0Z" fill="#FFF8B5" />

      {/* The finial, clear of the dome so the gap survives shrinking. */}
      <circle cx="24" cy="17" r="2.2" fill="#FFF8B5" />

      {/* The plate, wider than the dome so it reads as carrying it. */}
      <rect x="9" y="33" width="30" height="4.4" rx="2.2" fill="#FFF8B5" />
    </svg>
  );
}

/**
 * The mark with the name beside it.
 *
 * The sub-line is optional because the two places this appears want different
 * amounts: the landing nav wants the name alone, the app's top bar carries the
 * product description under it.
 */
export function SnsLogo({
  size = 32,
  sub,
  className,
}: {
  size?: number;
  sub?: string;
  className?: string;
}) {
  return (
    <span className={['sns-logo', className].filter(Boolean).join(' ')}>
      <SnsMark size={size} />
      <span className="sns-logo-text">
        <strong>SNS</strong>
        {sub ? <em>{sub}</em> : null}
      </span>
    </span>
  );
}
