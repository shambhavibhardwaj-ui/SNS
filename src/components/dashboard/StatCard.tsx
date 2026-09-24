import type { LucideIcon } from 'lucide-react';

export interface Stat {
  label: string;
  value: string;
  hint?: string;
  Icon: LucideIcon;
}

/** Summary figures across the top of a dashboard home. */
export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <ul className="sc-grid">
      {stats.map(({ label, value, hint, Icon }) => (
        <li key={label} className="sc-card">
          <span className="sc-icon" aria-hidden="true">
            <Icon size={17} strokeWidth={2} />
          </span>
          <p className="sc-label">{label}</p>
          <p className="sc-value">{value}</p>
          {hint ? <p className="sc-hint">{hint}</p> : null}
        </li>
      ))}
    </ul>
  );
}
