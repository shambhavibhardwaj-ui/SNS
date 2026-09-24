/** "2026-09-24" -> "24 Sep", in UTC so the day never shifts by timezone. */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })}`;
}
