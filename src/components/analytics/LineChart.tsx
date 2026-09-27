import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { formatDate, formatFullDate, formatValue } from './format';

/**
 * A line chart, drawn as SVG.
 *
 * No chart library: the project needs one chart shape done well, and a
 * dependency would bring its own colour system, fonts and DOM conventions to
 * argue with the rest of the dashboard.
 *
 * Drawn at the container's real pixel width, measured with a ResizeObserver.
 * The obvious alternative — a fixed viewBox stretched with
 * `preserveAspectRatio="none"` — needs no measuring, but it scales x and y by
 * different factors, and that squashes the axis text along with the geometry.
 * Measuring costs one observer and keeps the labels legible at every width.
 */

export interface Series {
  id: string;
  label: string;
  points: { date: string; value: number }[];
  /** Overrides the palette position. */
  color?: string;
  /** Drawn as a dashed line — for a comparison or a target. */
  dashed?: boolean;
}

const PAD = { top: 18, right: 18, bottom: 30, left: 56 };
/** Fallback until the observer reports, and the minimum the axis needs. */
const MIN_W = 320;
/** Roughly the width of a "24 Sept" label plus breathing room. */
const LABEL_SLOT = 74;

const PALETTE = ['var(--teal-700)', 'var(--magenta)', 'var(--butter-shade)', 'var(--teal-300)'];

/** Rounded "nice" ceiling, so gridlines land on numbers a person would pick. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(value));
  const scaled = value / mag;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return step * mag;
}

/**
 * Catmull-Rom through the points, converted to cubic béziers.
 *
 * A plain polyline reads as noise at 90 points; a spline through the actual
 * values smooths the look without inventing peaks, because every control point
 * is derived from real neighbours and the curve still passes through each one.
 */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function LineChart({
  series,
  unit = 'count',
  height = 300,
  area = true,
  caption,
}: {
  series: Series[];
  unit?: 'count' | 'money';
  height?: number;
  /** Fill under the first series. Switched off when comparing two. */
  area?: boolean;
  caption: string;
}) {
  const gradientId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [W, setW] = useState(MIN_W);

  /* Layout effect so the first paint is already at the right width rather
     than flashing the fallback. */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setW(Math.max(MIN_W, el.clientWidth));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      setW(Math.max(MIN_W, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = height;

  const length = series[0]?.points.length ?? 0;

  const max = useMemo(
    () => niceMax(Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value)))),
    [series],
  );

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const xAt = (i: number) => PAD.left + (length <= 1 ? plotW / 2 : (i / (length - 1)) * plotW);
  const yAt = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f);

  /* As many date labels as actually fit, so a phone gets three and a desktop
     eight instead of both getting eight and one of them overlapping. */
  const slots = Math.max(2, Math.floor(plotW / LABEL_SLOT));
  const labelEvery = Math.max(1, Math.ceil(length / slots));
  /* The final label is forced on so the range's end is always readable — but
     not when the previous tick is close enough to collide with it. */
  const lastLabelFits = (length - 1) % labelEvery > labelEvery / 2;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || length === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = (x - PAD.left) / plotW;
    const i = Math.round(ratio * (length - 1));
    setHover(Math.min(length - 1, Math.max(0, i)));
  };

  if (!length) return <p className="an-empty">No data in this range.</p>;

  const hoveredDate = hover === null ? null : series[0].points[hover].date;

  return (
    <div ref={wrapRef} className="an-chart" style={{ ['--an-chart-h' as string]: `${height}px` }}>
      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="an-chart-svg"
        role="img"
        aria-label={caption}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--teal-600)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--teal-600)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} x2={W - PAD.right}
              y1={yAt(v)} y2={yAt(v)}
              className="an-grid-line"
            />
            <text x={PAD.left - 10} y={yAt(v) + 4} className="an-axis-label" textAnchor="end">
              {formatValue(v, unit, true)}
            </text>
          </g>
        ))}

        {series[0].points.map((p, i) =>
          i % labelEvery === 0 || (i === length - 1 && lastLabelFits) ? (
            <text key={p.date} x={xAt(i)} y={H - 8} className="an-axis-label" textAnchor="middle">
              {formatDate(p.date)}
            </text>
          ) : null,
        )}

        {area && series.length === 1 ? (
          <path
            d={`${smoothPath(series[0].points.map((p, i) => ({ x: xAt(i), y: yAt(p.value) })))} L ${xAt(length - 1)} ${PAD.top + plotH} L ${xAt(0)} ${PAD.top + plotH} Z`}
            fill={`url(#${gradientId})`}
          />
        ) : null}

        {series.map((s, si) => (
          <path
            key={s.id}
            d={smoothPath(s.points.map((p, i) => ({ x: xAt(i), y: yAt(p.value) })))}
            className="an-line"
            stroke={s.color ?? PALETTE[si % PALETTE.length]}
            strokeDasharray={s.dashed ? '5 4' : undefined}
          />
        ))}

        {hover !== null ? (
          <>
            <line
              x1={xAt(hover)} x2={xAt(hover)}
              y1={PAD.top} y2={PAD.top + plotH}
              className="an-hover-line"
            />
            {series.map((s, si) => (
              <circle
                key={s.id}
                cx={xAt(hover)}
                cy={yAt(s.points[hover].value)}
                r={4}
                className="an-hover-dot"
                fill={s.color ?? PALETTE[si % PALETTE.length]}
              />
            ))}
          </>
        ) : null}
      </svg>

      {hover !== null && hoveredDate ? (
        <div
          className="an-tooltip"
          /* Flipped to the left half once the cursor passes the midpoint, so
             the panel never runs off the right edge. */
          data-side={hover / (length - 1) > 0.6 ? 'left' : 'right'}
          style={{ left: `${(xAt(hover) / W) * 100}%` }}
        >
          <p className="an-tooltip-date">{formatFullDate(hoveredDate)}</p>
          {series.map((s, si) => (
            <p key={s.id} className="an-tooltip-row">
              <span className="an-swatch" style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} />
              <span className="an-tooltip-label">{s.label}</span>
              <strong>{formatValue(s.points[hover].value, unit)}</strong>
            </p>
          ))}
        </div>
      ) : null}

      {series.length > 1 ? (
        <ul className="an-legend">
          {series.map((s, si) => (
            <li key={s.id}>
              <span className="an-swatch" style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
