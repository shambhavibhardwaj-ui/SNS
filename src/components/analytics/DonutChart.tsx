import { useId } from 'react';
import { formatCount, formatPercent } from './format';

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  /** Share of the whole, worked out upstream. Never recomputed here. */
  percent: number;
  /** Names a tone in the stylesheet rather than carrying a colour. */
  tone?: string;
}

const SIZE = 180;
const THICKNESS = 26;
const R = (SIZE - THICKNESS) / 2;
const C = 2 * Math.PI * R;
/** A hairline between neighbouring arcs, in degrees of the circle. */
const GAP = 1.4;

/**
 * A ring, for a distribution that adds up to a whole.
 *
 * Hand-drawn like the rest of `components/analytics` — a chart library would
 * bring its own palette, fonts and DOM conventions to argue with the
 * dashboard, for one shape that is four `stroke-dasharray` values.
 *
 * It is a ring rather than a pie because the centre is the most useful part:
 * the total goes there, so the figure a person actually wants is not something
 * they have to add up from the legend.
 *
 * The SVG is `aria-hidden` and the real content is the list beside it, which
 * carries every label, count and share as text. A screen reader gets the data,
 * not a description of a drawing.
 */
export function DonutChart({
  slices,
  total,
  centreLabel,
  emptyLabel = 'Nothing to show.',
}: {
  slices: DonutSlice[];
  total: number;
  centreLabel: string;
  emptyLabel?: string;
}) {
  const id = useId();
  if (!slices.some((s) => s.value > 0)) return <p className="an-empty">{emptyLabel}</p>;

  /* Each arc's start, accumulated up front rather than during the map: a
     variable mutated inside render is the kind of thing that works until a
     future render reorders or reruns part of it. */
  const starts: number[] = [];
  slices.reduce((run, s) => {
    starts.push(run);
    return run + (s.percent / 100) * C;
  }, 0);

  return (
    <div className="an-donut">
      <svg
        className="an-donut-ring"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        aria-hidden="true"
      >
        {/* The track, so a small slice still reads against something. */}
        <circle
          className="an-donut-track"
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" strokeWidth={THICKNESS}
        />
        {slices.map((s, i) => {
          /* Drawn from 12 o'clock clockwise: the rotation puts the start at
             the top, which is where a person expects a ring to begin. */
          const sweep = (s.percent / 100) * C;
          const gap = s.percent > GAP ? (GAP / 100) * C : 0;
          const dash = `${Math.max(0, sweep - gap)} ${C}`;
          return (
            <circle
              key={s.id}
              className="an-donut-arc"
              data-tone={s.tone ?? s.id}
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" strokeWidth={THICKNESS}
              strokeDasharray={dash}
              strokeDashoffset={-starts[i]}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            >
              <title>{`${s.label}: ${formatCount(s.value)}`}</title>
            </circle>
          );
        })}

        <text className="an-donut-total" x={SIZE / 2} y={SIZE / 2 - 2} textAnchor="middle">
          {formatCount(total)}
        </text>
        <text className="an-donut-caption" x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle">
          {centreLabel}
        </text>
      </svg>

      <ul className="an-donut-key" aria-describedby={id}>
        <li className="fc-sr-only" id={id}>
          {centreLabel}: {formatCount(total)} in total.
        </li>
        {slices.map((s) => (
          <li key={s.id}>
            <span className="an-donut-dot" data-tone={s.tone ?? s.id} aria-hidden="true" />
            <span className="an-donut-label">{s.label}</span>
            <strong>{formatCount(s.value)}</strong>
            <em>{formatPercent(s.percent, 0)}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
