import type { LucideIcon } from 'lucide-react';

export interface Stat {
  label: string;
  value: string;
  hint?: string;
  Icon: LucideIcon;
}

/**
 * Summary figures across the top of a dashboard home.
 *
 * Label and icon share the top line, then the figure, then its supporting
 * line. The icon used to sit on a row of its own above the label, which left a
 * band of empty card between the two and made a roomy card read as an
 * unbalanced one.
 */
export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <ul className="sc-grid">
      {stats.map(({ label, value, hint, Icon }) => (
        <li key={label} className="sc-card">
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
