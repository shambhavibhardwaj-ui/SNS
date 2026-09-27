import { formatPercent, formatValue } from './format';

/**
 * Horizontal bars.
 *
 * Horizontal rather than vertical because the labels are cuisine names: ten of
 * them along an x-axis means rotated text, and rotated text is unreadable at a
 * glance. Bars are plain divs, not SVG — one rectangle and one label per row
 * needs no coordinate space.
 */
export interface BarDatum {
  id: string;
  label: string;
  value: number;
  /** Shown after the value when supplied. Derived upstream, never stored. */
  percent?: number;
  /** Overrides the formatted value — a rating needs its decimal and its star. */
  valueLabel?: string;
  hint?: string;
}

export function BarChart({
  data,
  unit = 'count',
  max: fixedMax,
  selectedId,
  onSelect,
  emptyLabel = 'Nothing to show.',
}: {
  data: BarDatum[];
  unit?: 'count' | 'money';
  /**
   * Scale ceiling. Without it bars are drawn relative to the largest value,
   * which is right for order counts and wrong for ratings: on a 0–5 scale,
   * 4.4 and 4.1 are genuinely close, and stretching them to full and
   * three-quarter width invents a difference that is not there.
   */
  max?: number;
  /** Dims the others, so a selection reads as a filter rather than a highlight. */
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  emptyLabel?: string;
}) {
  if (!data.length) return <p className="an-empty">{emptyLabel}</p>;

  const max = fixedMax ?? Math.max(...data.map((d) => d.value), 1);
  const interactive = Boolean(onSelect);

  return (
    <ul className="an-bars" data-dimmed={selectedId ? true : undefined}>
      {data.map((d) => {
        const row = (
          <>
            <span className="an-bar-label">{d.label}</span>
            <span className="an-bar-track">
              <span className="an-bar-fill" style={{ width: `${(d.value / max) * 100}%` }} />
            </span>
            <span className="an-bar-value">
              {d.valueLabel ?? formatValue(d.value, unit)}
              {d.percent === undefined ? null : (
                <span className="an-bar-share">{formatPercent(d.percent)}</span>
              )}
            </span>
          </>
        );

        return (
          <li key={d.id} className="an-bar-row" data-on={selectedId === d.id || undefined}>
            {interactive ? (
              <button
                type="button"
                className="an-bar-btn"
                onClick={() => onSelect?.(d.id)}
                aria-pressed={selectedId === d.id}
                title={d.hint ?? `Filter by ${d.label}`}
              >
                {row}
              </button>
            ) : (
              <span className="an-bar-btn is-static">{row}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
