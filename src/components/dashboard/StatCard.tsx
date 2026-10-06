import type { LucideIcon } from 'lucide-react';

export interface Stat {
  label: string;
  value: string;
  hint?: string;
  Icon: LucideIcon;
  /** Bento only: two columns instead of one. Ignored by the plain variant. */
  wide?: boolean;
}

/**
 * Summary figures across the top of a dashboard home.
 *
 * Label and icon share the top line, then the figure, then its supporting
 * line. The icon used to sit on a row of its own above the label, which left a
 * band of empty card between the two and made a roomy card read as an
 * unbalanced one.
 *
 * Two variants.
 *
 * `plain` is the original: eight equal white cards. Still what the delivery
 * dashboard and the inner panels use.
 *
 * `bento` tints each card and lets some of them span two columns. It is a
 * variant rather than a replacement because the same component carries the
 * three-card delivery row further down the page, where blocks of colour would
 * compete with the section they sit inside.
 *
 * The tone is the card's position, not its meaning — these eight figures are
 * not statuses and nothing here is good or bad news. A colour that *looked*
 * like a verdict on a number nobody has judged would be the worse mistake, so
 * the tints cycle and carry no information.
 */
export function StatCards({
  stats,
  variant = 'plain',
}: {
  stats: Stat[];
  variant?: 'plain' | 'bento';
}) {
  return (
    <ul className="sc-grid" data-variant={variant === 'bento' ? 'bento' : undefined}>
      {stats.map(({ label, value, hint, Icon, wide }, i) => (
        <li
          key={label}
          className="sc-card"
          data-tone={variant === 'bento' ? i % 4 : undefined}
          data-wide={variant === 'bento' && wide ? true : undefined}
        >
          <div className="sc-top">
            <p className="sc-label">{label}</p>
            <span className="sc-icon" aria-hidden="true">
              <Icon size={17} strokeWidth={2} />
            </span>
          </div>
          <p className="sc-value">{value}</p>
          {hint ? <p className="sc-hint">{hint}</p> : null}
        </li>
      ))}
    </ul>
  );
}
