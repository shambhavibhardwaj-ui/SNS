/**
 * Small reusable pieces of street furniture. Each one is a plain SVG group
 * positioned by its base point, so clusters can compose them freely.
 */

const LEAF = '#6E8C5A';
const LEAF_DARK = '#5A7549';
const TRUNK = '#8A6141';

export function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={17} ry={5} fill="#8A6A47" opacity={0.16} />
      <rect x={-3} y={-26} width={6} height={28} rx={3} fill={TRUNK} />
      <circle cx={-11} cy={-34} r={13} fill={LEAF_DARK} />
      <circle cx={11} cy={-32} r={12} fill={LEAF_DARK} />
      <circle cx={0} cy={-46} r={15} fill={LEAF} />
      <circle cx={-6} cy={-36} r={12} fill={LEAF} />
      <circle cx={8} cy={-40} r={11} fill={LEAF} />
      <circle cx={-4} cy={-50} r={5} fill="#86A46C" opacity={0.7} />
    </g>
  );
}

export function Shrub({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={1} rx={13} ry={4} fill="#8A6A47" opacity={0.14} />
      <circle cx={-7} cy={-7} r={8} fill={LEAF_DARK} />
      <circle cx={7} cy={-6} r={7} fill={LEAF_DARK} />
      <circle cx={0} cy={-12} r={9} fill={LEAF} />
    </g>
  );
}

export function StreetLamp({ x, y, accent = '#F2C368' }: { x: number; y: number; accent?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={2} rx={7} ry={3} fill="#8A6A47" opacity={0.18} />
      <rect x={-2} y={-54} width={4} height={56} rx={2} fill="#6B5545" />
      <path d="M -8 -54 Q 0 -66 8 -54 Z" fill="#6B5545" />
      <circle cx={0} cy={-56} r={5.5} fill={accent} className="fc-lamp-glow" />
      <circle cx={0} cy={-56} r={11} fill={accent} opacity={0.16} />
    </g>
  );
}

export function Bench({ x, y, color = '#8A6141' }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={1} rx={17} ry={3.5} fill="#8A6A47" opacity={0.14} />
      <rect x={-15} y={-9} width={30} height={4} rx={2} fill={color} />
      <rect x={-15} y={-17} width={30} height={3.5} rx={1.75} fill={color} opacity={0.85} />
      <rect x={-13} y={-6} width={3} height={6} rx={1.5} fill={color} />
      <rect x={10} y={-6} width={3} height={6} rx={1.5} fill={color} />
    </g>
  );
}

/** Café table with a parasol — the "outdoor seating" beat. */
export function PatioTable({ x, y, canopy }: { x: number; y: number; canopy: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={1} rx={15} ry={4} fill="#8A6A47" opacity={0.15} />
      <rect x={-1.6} y={-40} width={3.2} height={40} rx={1.6} fill="#7A6250" />
      <ellipse cx={0} cy={-14} rx={13} ry={4} fill="#EBD9C2" />
      <path d={`M -22 -40 Q 0 -54 22 -40 Z`} fill={canopy} />
      <path d={`M -22 -40 Q 0 -34 22 -40 Z`} fill="#000" opacity={0.08} />
      <circle cx={0} cy={-52} r={2.4} fill={canopy} />
      <circle cx={-15} cy={-6} r={4} fill="#C9B79A" />
      <circle cx={15} cy={-6} r={4} fill="#C9B79A" />
    </g>
  );
}

/** Market stall / food cart, used where a district has street food. */
export function FoodCart({ x, y, canopy, emblem }: { x: number; y: number; canopy: string; emblem?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={2} rx={22} ry={5} fill="#8A6A47" opacity={0.16} />
      <rect x={-20} y={-26} width={40} height={24} rx={3} fill="#E8D5B5" />
      <rect x={-20} y={-26} width={40} height={6} rx={3} fill="#000" opacity={0.07} />
      <path d={`M -26 -28 L 26 -28 L 20 -42 L -20 -42 Z`} fill={canopy} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-24 + i * 13} y={-42} width={6} height={14} fill="#FDF6E9" opacity={0.5} />
      ))}
      <rect x={-19} y={-44} width={2.6} height={18} fill="#7A6250" />
      <rect x={16.4} y={-44} width={2.6} height={18} fill="#7A6250" />
      <circle cx={-12} cy={-1} r={5} fill="#6B5545" />
      <circle cx={12} cy={-1} r={5} fill="#6B5545" />
      {emblem ? <text x={0} y={-11} textAnchor="middle" fontSize={11}>{emblem}</text> : null}
    </g>
  );
}

/** Paper lanterns strung between two points. */
export function LanternString({
  x1,
  x2,
  y,
  color,
  count = 5,
}: {
  x1: number;
  x2: number;
  y: number;
  color: string;
  count?: number;
}) {
  const span = x2 - x1;
  const sag = 16;
  return (
    <g>
      <path
        d={`M ${x1} ${y} Q ${x1 + span / 2} ${y + sag * 1.7} ${x2} ${y}`}
        fill="none"
        stroke="#7A6250"
        strokeWidth={1.4}
      />
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 1) / (count + 1);
        const lx = x1 + span * t;
        const ly = y + sag * 1.7 * 2 * t * (1 - t) + 4;
        return (
          <g key={i} className="fc-sway" style={{ animationDelay: `${i * 0.35}s` }}>
            <line x1={lx} y1={ly} x2={lx} y2={ly + 4} stroke="#7A6250" strokeWidth={1} />
            <ellipse cx={lx} cy={ly + 10} rx={5.5} ry={7} fill={color} />
            <ellipse cx={lx} cy={ly + 10} rx={2} ry={7} fill="#fff" opacity={0.22} />
          </g>
        );
      })}
    </g>
  );
}

/** Triangular bunting, used over the plaza. */
export function Bunting({
  x1,
  x2,
  y,
  colors,
  count = 9,
}: {
  x1: number;
  x2: number;
  y: number;
  colors: string[];
  count?: number;
}) {
  const span = x2 - x1;
  const sag = 14;
  return (
    <g>
      <path
        d={`M ${x1} ${y} Q ${x1 + span / 2} ${y + sag * 1.8} ${x2} ${y}`}
        fill="none"
        stroke="#7A6250"
        strokeWidth={1.3}
      />
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 1) / (count + 1);
        const fx = x1 + span * t;
        const fy = y + sag * 1.8 * 2 * t * (1 - t);
        return (
          <path
            key={i}
            d={`M ${fx - 5} ${fy} L ${fx + 5} ${fy} L ${fx} ${fy + 12} Z`}
            fill={colors[i % colors.length]}
            className="fc-sway"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        );
      })}
    </g>
  );
}

/** Steam curling off a kitchen. Purely ambient. */
export function Steam({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g className="fc-steam" style={{ animationDelay: `${delay}s` }} aria-hidden="true">
      <path
        d={`M ${x} ${y} C ${x - 7} ${y - 12} ${x + 7} ${y - 20} ${x} ${y - 32}`}
        fill="none"
        stroke="#FFFDF7"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.75}
      />
      <path
        d={`M ${x + 9} ${y - 3} C ${x + 3} ${y - 13} ${x + 15} ${y - 19} ${x + 9} ${y - 28}`}
        fill="none"
        stroke="#FFFDF7"
        strokeWidth={3.6}
        strokeLinecap="round"
        opacity={0.55}
      />
    </g>
  );
}

/** Delivery scooter. Driven along a road by CSS in CityMap. */
export function Scooter({ color = '#C4543F', flip = false }: { color?: string; flip?: boolean }) {
  return (
    <g transform={flip ? 'scale(-1 1)' : undefined}>
      <ellipse cx={0} cy={9} rx={19} ry={3.5} fill="#8A6A47" opacity={0.18} />
      <circle cx={-11} cy={5} r={6} fill="#4A4038" />
      <circle cx={-11} cy={5} r={2.4} fill="#C9B79A" />
      <circle cx={12} cy={5} r={6} fill="#4A4038" />
      <circle cx={12} cy={5} r={2.4} fill="#C9B79A" />
      <path d={`M -11 5 L -3 -4 L 9 -4 L 12 5 Z`} fill={color} />
      <rect x={-14} y={-18} width={11} height={12} rx={2.5} fill="#E0A93B" />
      <rect x={-13} y={-16} width={9} height={4} rx={1} fill="#fff" opacity={0.45} />
      <path d={`M 9 -4 L 15 -13`} stroke="#4A4038" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={2} cy={-14} r={5} fill="#7E9BB5" />
      <path d={`M 2 -9 L 2 -4`} stroke="#7E9BB5" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

/** Tiny resident, wandering the pavement. */
export function Person({
  x,
  y,
  shirt,
  delay = 0,
}: {
  x: number;
  y: number;
  shirt: string;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`} className="fc-stroll" style={{ animationDelay: `${delay}s` }}>
      <ellipse cx={0} cy={1} rx={6} ry={2} fill="#8A6A47" opacity={0.16} />
      <path d={`M -4 0 L -4 -9 L 4 -9 L 4 0`} fill="#5B4A3C" />
      <rect x={-4.5} y={-20} width={9} height={12} rx={3} fill={shirt} />
      <circle cx={0} cy={-24} r={4.6} fill="#D9A87E" />
      <path d="M -4.8 -25 Q 0 -31 4.8 -25 Z" fill="#4A3B2E" />
    </g>
  );
}
