import { brand, world } from '../../../theme/brand';
import { iso, shade, TILE_W } from '../iso';

/**
 * Street furniture and greenery, each positioned by a grid point and drawn with
 * enough side-shading to sit in the same light as the buildings.
 */

const LEAF = world.leaf;
const TRUNK = '#4A3F36';

export function IsoTree({ gx, gy, scale = 1 }: { gx: number; gy: number; scale?: number }) {
  const p = iso(gx, gy);
  const s = scale;
  return (
    <g className="fc-tree">
      <ellipse cx={p.x - 6} cy={p.y + 3} rx={17 * s} ry={7 * s} fill={brand.teal900} opacity={0.22} />
      <rect x={p.x - 3 * s} y={p.y - 26 * s} width={6 * s} height={27 * s} rx={3 * s} fill={TRUNK} />
      <rect x={p.x} y={p.y - 26 * s} width={3 * s} height={27 * s} fill="#000" opacity={0.12} />
      <ellipse cx={p.x} cy={p.y - 42 * s} rx={19 * s} ry={20 * s} fill={shade(LEAF, -0.12)} />
      <ellipse cx={p.x + 5 * s} cy={p.y - 47 * s} rx={14 * s} ry={14 * s} fill={LEAF} />
      <ellipse cx={p.x - 6 * s} cy={p.y - 38 * s} rx={11 * s} ry={11 * s} fill={shade(LEAF, 0.08)} />
      <ellipse cx={p.x + 7 * s} cy={p.y - 52 * s} rx={7 * s} ry={7 * s} fill={shade(LEAF, 0.18)} />
    </g>
  );
}

export function IsoShrub({ gx, gy, scale = 1 }: { gx: number; gy: number; scale?: number }) {
  const p = iso(gx, gy);
  const s = scale;
  return (
    <g>
      <ellipse cx={p.x - 3} cy={p.y + 2} rx={12 * s} ry={5 * s} fill={brand.teal900} opacity={0.2} />
      <ellipse cx={p.x - 5 * s} cy={p.y - 7 * s} rx={8 * s} ry={8 * s} fill={shade(LEAF, -0.16)} />
      <ellipse cx={p.x + 5 * s} cy={p.y - 6 * s} rx={7 * s} ry={7 * s} fill={shade(LEAF, -0.06)} />
      <ellipse cx={p.x} cy={p.y - 12 * s} rx={9 * s} ry={9 * s} fill={shade(LEAF, 0.08)} />
    </g>
  );
}

export function IsoLamp({ gx, gy, accent = brand.butter }: { gx: number; gy: number; accent?: string }) {
  const p = iso(gx, gy);
  return (
    <g>
      <ellipse cx={p.x - 3} cy={p.y + 2} rx={6} ry={3} fill={brand.teal900} opacity={0.24} />
      <rect x={p.x - 2} y={p.y - 52} width={4} height={53} fill={brand.teal900} />
      <rect x={p.x} y={p.y - 52} width={2} height={53} fill="#000" opacity={0.18} />
      <ellipse cx={p.x} cy={p.y - 55} rx={7} ry={5} fill={shade(brand.teal800, 0.1)} />
      <circle cx={p.x} cy={p.y - 57} r={5} fill={accent} className="fc-lamp-glow" />
      <circle cx={p.x} cy={p.y - 57} r={12} fill={accent} opacity={0.14} />
    </g>
  );
}

/** Market stall with a pitched canopy — used where a district sells street food. */
export function IsoStall({
  gx,
  gy,
  canopy,
  emblem,
}: {
  gx: number;
  gy: number;
  canopy: string;
  emblem?: string;
}) {
  const A = iso(gx, gy);
  const B = iso(gx + 1, gy);
  const C = iso(gx + 1, gy + 1);
  const D = iso(gx, gy + 1);
  const h = 26;
  const up = (p: { x: number; y: number }, n: number) => ({ x: p.x, y: p.y - n });

  return (
    <g>
      <ellipse cx={A.x - 8} cy={C.y + 3} rx={30} ry={13} fill={brand.teal900} opacity={0.2} />
      {/* counter */}
      <polygon
        points={`${D.x},${D.y} ${C.x},${C.y} ${up(C, h).x},${up(C, h).y} ${up(D, h).x},${up(D, h).y}`}
        fill={shade(brand.creamDeep, -0.22)}
      />
      <polygon
        points={`${B.x},${B.y} ${C.x},${C.y} ${up(C, h).x},${up(C, h).y} ${up(B, h).x},${up(B, h).y}`}
        fill={brand.creamDeep}
      />
      <polygon
        points={`${up(A, h).x},${up(A, h).y} ${up(B, h).x},${up(B, h).y} ${up(C, h).x},${up(C, h).y} ${up(D, h).x},${up(D, h).y}`}
        fill={shade(brand.creamDeep, 0.14)}
      />
      {/* canopy */}
      <polygon
        points={`${up(A, 54).x},${up(A, 54).y} ${up(B, 54).x},${up(B, 54).y} ${up(B, 44).x + 10},${up(B, 44).y + 6} ${up(A, 44).x + 10},${up(A, 44).y + 6}`}
        fill={shade(canopy, 0.08)}
      />
      <polygon
        points={`${up(D, 54).x},${up(D, 54).y} ${up(C, 54).x},${up(C, 54).y} ${up(C, 44).x + 10},${up(C, 44).y + 6} ${up(D, 44).x + 10},${up(D, 44).y + 6}`}
        fill={shade(canopy, -0.16)}
      />
      {emblem ? (
        <text x={(B.x + D.x) / 2} y={C.y - h - 6} textAnchor="middle" fontSize={11}>
          {emblem}
        </text>
      ) : null}
    </g>
  );
}

/** Café table with a parasol. */
export function IsoParasol({ gx, gy, canopy }: { gx: number; gy: number; canopy: string }) {
  const p = iso(gx, gy);
  return (
    <g>
      <ellipse cx={p.x - 5} cy={p.y + 2} rx={16} ry={7} fill={brand.teal900} opacity={0.2} />
      <ellipse cx={p.x} cy={p.y - 14} rx={14} ry={7} fill={shade(brand.creamWarm, -0.12)} />
      <ellipse cx={p.x} cy={p.y - 16} rx={14} ry={7} fill={brand.creamWarm} />
      <rect x={p.x - 1.6} y={p.y - 46} width={3.2} height={32} fill={brand.teal900} />
      <ellipse cx={p.x} cy={p.y - 46} rx={26} ry={12} fill={shade(canopy, 0.06)} />
      <path
        d={`M ${p.x - 26} ${p.y - 46} A 26 12 0 0 0 ${p.x + 26} ${p.y - 46} Z`}
        fill={shade(canopy, -0.2)}
      />
      <circle cx={p.x} cy={p.y - 52} r={2.6} fill={canopy} />
      <ellipse cx={p.x - 20} cy={p.y - 6} rx={6} ry={3.4} fill={shade(brand.creamDeep, -0.1)} />
      <ellipse cx={p.x + 20} cy={p.y - 6} rx={6} ry={3.4} fill={shade(brand.creamDeep, -0.1)} />
    </g>
  );
}

/** Delivery scooter, driven along a street by CSS. */
export function IsoScooter({ color = '#C4543F' }: { color?: string }) {
  return (
    <g>
      <ellipse cx={-4} cy={7} rx={20} ry={8} fill={brand.teal900} opacity={0.24} />
      <ellipse cx={-13} cy={4} rx={6} ry={4} fill={brand.teal900} />
      <ellipse cx={12} cy={4} rx={6} ry={4} fill={brand.teal900} />
      <polygon points="-13,2 -2,-6 10,-6 13,2 0,7" fill={shade(color, 0.05)} />
      <polygon points="-13,2 0,7 0,10 -13,5" fill={shade(color, -0.3)} />
      <polygon points="0,7 13,2 13,5 0,10" fill={shade(color, -0.16)} />
      {/* insulated box */}
      <polygon points="-17,-10 -7,-14 -7,-4 -17,0" fill={shade(brand.butterDeep, -0.16)} />
      <polygon points="-7,-14 1,-11 1,-1 -7,-4" fill={brand.butterDeep} />
      <polygon points="-17,-10 -7,-14 1,-11 -9,-7" fill={shade(brand.butter, 0.05)} />
      {/* rider */}
      <ellipse cx={2} cy={-13} rx={5} ry={6} fill={brand.teal600} />
      <circle cx={3} cy={-21} r={5} fill={brand.creamWarm} />
      <path d="M -2 -23 A 5 5 0 0 1 8 -23 Z" fill={brand.teal900} />
    </g>
  );
}

/** Tiny resident on the pavement. */
export function IsoPerson({
  gx,
  gy,
  shirt,
  delay = 0,
}: {
  gx: number;
  gy: number;
  shirt: string;
  delay?: number;
}) {
  const p = iso(gx, gy);
  return (
    <g className="fc-stroll" style={{ animationDelay: `${delay}s` }}>
      <ellipse cx={p.x - 2} cy={p.y + 1} rx={6} ry={3} fill={brand.teal900} opacity={0.24} />
      <rect x={p.x - 3.4} y={p.y - 10} width={6.8} height={10} rx={2} fill={brand.slateDeep} />
      <rect x={p.x - 4.4} y={p.y - 22} width={8.8} height={13} rx={3.4} fill={shirt} />
      <rect x={p.x + 1} y={p.y - 22} width={3.4} height={13} fill="#000" opacity={0.12} />
      <circle cx={p.x} cy={p.y - 26} r={4.6} fill={brand.creamWarm} />
      <path d={`M ${p.x - 4.8} ${p.y - 27} A 4.8 4.8 0 0 1 ${p.x + 4.8} ${p.y - 27} Z`} fill={brand.teal900} />
    </g>
  );
}

/** Steam curling off a kitchen. */
export function IsoSteam({ gx, gy, lift = 0, delay = 0 }: { gx: number; gy: number; lift?: number; delay?: number }) {
  const p = iso(gx, gy, lift);
  return (
    <g className="fc-steam" style={{ animationDelay: `${delay}s` }} aria-hidden="true">
      <path
        d={`M ${p.x} ${p.y} C ${p.x - 8} ${p.y - 13} ${p.x + 8} ${p.y - 22} ${p.x} ${p.y - 34}`}
        fill="none"
        stroke="#FFFDF7"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path
        d={`M ${p.x + 11} ${p.y - 4} C ${p.x + 4} ${p.y - 15} ${p.x + 17} ${p.y - 21} ${p.x + 11} ${p.y - 30}`}
        fill="none"
        stroke="#FFFDF7"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.5}
      />
    </g>
  );
}

export { TILE_W };
