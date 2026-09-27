/** Shared formatting, so a rupee total looks the same in a chart and a table. */

export function formatCount(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}

/** Rupees, abbreviated Indian-style — a crore axis label must still fit. */
export function formatMoney(n: number, compact = false): string {
  if (!compact) return `₹${Math.round(n).toLocaleString('en-IN')}`;
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (abs >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

export function formatCompactCount(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export function formatValue(n: number, unit: 'count' | 'money', compact = false): string {
  if (unit === 'money') return formatMoney(n, compact);
  return compact ? formatCompactCount(n) : formatCount(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

/** `2026-09-25` → `25 Sep`. Axis labels have no room for a year. */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })}`;
}

export function formatFullDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

/** A signed change, or an em dash when there was nothing to compare against. */
export function formatChange(percent: number | null): string {
  if (percent === null) return '—';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}
