import { useId } from 'react';
import type { DistrictTheme, RoofStyle } from '../../../data/types';

interface BuildingProps {
  /** Left edge. */
  x: number;
  /** Ground line the building stands on. */
  baseline: number;
  w: number;
  h: number;
  theme: DistrictTheme;
  /** Shown on the shop sign. */
  emblem?: string;
  /** Facade override, for a restaurant with its own colour. */
  wall?: string;
  awning?: string;
  /** Deterministic variation between neighbouring shops. */
  variant?: number;
}

/** Wavy bottom edge for a shop awning. */
function scallopPath(x1: number, x2: number, top: number, depth: number): string {
  const bottom = top + depth;
  const r = 7;
  let d = `M ${x1} ${top} L ${x2} ${top} L ${x2} ${bottom}`;
  for (let cx = x2; cx > x1 + 0.5; cx -= r * 2) {
    d += ` A ${r} ${r} 0 0 1 ${Math.max(x1, cx - r * 2)} ${bottom}`;
  }
  return `${d} L ${x1} ${top} Z`;
}

function Roof({
  style,
  x,
  y,
  w,
  theme,
}: {
  style: RoofStyle;
  x: number;
  /** Top of the building body. */
  y: number;
  w: number;
  theme: DistrictTheme;
}) {
  const o = 11; // eaves overhang

  switch (style) {
    case 'pagoda':
      return (
        <g>
          <path
            d={`M ${x - o} ${y} Q ${x + w / 2} ${y - 6} ${x + w + o} ${y}
                L ${x + w + o - 6} ${y - 9} Q ${x + w / 2} ${y - 36} ${x + o - 5} ${y - 9} Z`}
            fill={theme.roof}
          />
          <path
            d={`M ${x + w * 0.16} ${y - 30} Q ${x + w / 2} ${y - 54} ${x + w * 0.84} ${y - 30}
                L ${x + w * 0.78} ${y - 26} Q ${x + w / 2} ${y - 45} ${x + w * 0.22} ${y - 26} Z`}
            fill={theme.roof}
            opacity={0.85}
          />
          <circle cx={x + w / 2} cy={y - 52} r={3.4} fill={theme.accent} />
        </g>
      );

    case 'gable':
      return (
        <g>
          <path
            d={`M ${x - o} ${y + 2} L ${x + w / 2} ${y - 34} L ${x + w + o} ${y + 2} Z`}
            fill={theme.roof}
          />
          <path
            d={`M ${x - o} ${y + 2} L ${x + w / 2} ${y - 34} L ${x + w / 2} ${y - 26} L ${x - o + 8} ${y + 2} Z`}
            fill="#000"
            opacity={0.08}
          />
          <rect x={x + w * 0.62} y={y - 38} width={9} height={22} rx={2} fill={theme.roof} />
        </g>
      );

    case 'dome':
      return (
        <g>
          <rect x={x - o} y={y - 6} width={w + o * 2} height={9} rx={4} fill={theme.roof} />
          <path
            d={`M ${x + w * 0.2} ${y - 6} Q ${x + w / 2} ${y - 48} ${x + w * 0.8} ${y - 6} Z`}
            fill={theme.roof}
          />
          <path
            d={`M ${x + w * 0.2} ${y - 6} Q ${x + w * 0.36} ${y - 40} ${x + w * 0.5} ${y - 42} L ${x + w * 0.5} ${y - 6} Z`}
            fill="#fff"
            opacity={0.12}
          />
          <line
            x1={x + w / 2}
            y1={y - 42}
            x2={x + w / 2}
            y2={y - 54}
            stroke={theme.accent}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <circle cx={x + w / 2} cy={y - 56} r={3} fill={theme.accent} />
        </g>
      );

    case 'scallop': {
      const bumps = 4;
      const r = (w + o * 2) / (bumps * 2);
      let d = `M ${x - o} ${y + 2} L ${x - o} ${y - 8}`;
      for (let i = 0; i < bumps; i += 1) {
        d += ` A ${r} ${r} 0 0 1 ${x - o + (i + 1) * r * 2} ${y - 8}`;
      }
      d += ` L ${x + w + o} ${y + 2} Z`;
      return (
        <g>
          <path d={d} fill={theme.roof} />
          <circle cx={x + w / 2} cy={y - 26} r={4} fill={theme.accent} />
        </g>
      );
    }

    case 'clay':
      return (
        <g>
          <path
            d={`M ${x - o} ${y + 2} L ${x - o + 5} ${y - 14} L ${x + w + o - 5} ${y - 14} L ${x + w + o} ${y + 2} Z`}
            fill={theme.roof}
          />
          {Array.from({ length: Math.max(3, Math.round(w / 18)) }, (_, i) => {
            const step = (w + o * 2 - 10) / Math.max(3, Math.round(w / 18));
            return (
              <rect
                key={i}
                x={x - o + 5 + i * step}
                y={y - 16}
                width={step * 0.62}
                height={4}
                rx={2}
                fill="#000"
                opacity={0.1}
              />
            );
          })}
        </g>
      );

    case 'flat':
    default:
      return (
        <g>
          <rect x={x - o} y={y - 13} width={w + o * 2} height={15} rx={3} fill={theme.roof} />
          <rect x={x + w * 0.24} y={y - 24} width={w * 0.52} height={12} rx={3} fill={theme.roof} opacity={0.9} />
          <rect x={x + w * 0.44} y={y - 38} width={5} height={15} rx={2.5} fill={theme.accent} />
        </g>
      );
  }
}

/**
 * One illustrated storefront. Rendered once per restaurant, so the skyline of a
 * district is a picture of its data.
 */
export function Building({
  x,
  baseline,
  w,
  h,
  theme,
  emblem,
  wall,
  awning,
  variant = 0,
}: BuildingProps) {
  const clipId = useId();
  const top = baseline - h;
  const facade = wall ?? theme.wall;
  const canopy = awning ?? theme.awning;

  const awningTop = top + h * 0.46;
  const awningDepth = 15;
  const signY = awningTop - 26;

  const doorW = Math.min(24, w * 0.3);
  const doorX = x + w / 2 - doorW / 2;
  const doorH = 40;

  /* Upper-floor windows, lit on alternating buildings for an evening feel. */
  const windowCount = w > 90 ? 3 : 2;
  const windowW = 15;
  const windowGap = (w - 18 - windowCount * windowW) / Math.max(1, windowCount - 1);
  const lit = variant % 2 === 0;

  return (
    <g>
      {/* ground shadow */}
      <ellipse cx={x + w / 2} cy={baseline + 3} rx={w * 0.62} ry={7} fill="#8A6A47" opacity={0.16} />

      {/* body */}
      <rect x={x} y={top} width={w} height={h} rx={3} fill={facade} />
      <rect x={x} y={top} width={9} height={h} fill="#000" opacity={0.055} />
      <rect x={x + w - 7} y={top} width={7} height={h} fill="#fff" opacity={0.28} />

      <Roof style={theme.roofStyle} x={x} y={top} w={w} theme={theme} />

      {/* upper windows */}
      {Array.from({ length: windowCount }, (_, i) => (
        <g key={i}>
          <rect
            x={x + 9 + i * (windowW + windowGap)}
            y={top + h * 0.17}
            width={windowW}
            height={19}
            rx={2.5}
            fill={lit ? '#F2C368' : '#B9CBD4'}
            opacity={lit ? 0.95 : 0.75}
          />
          <rect
            x={x + 9 + i * (windowW + windowGap)}
            y={top + h * 0.17}
            width={windowW}
            height={19}
            rx={2.5}
            fill="none"
            stroke={theme.roof}
            strokeWidth={1.6}
            opacity={0.5}
          />
        </g>
      ))}

      {/* shop sign */}
      <rect x={x + w * 0.5 - 17} y={signY} width={34} height={19} rx={4} fill={theme.roof} />
      <rect x={x + w * 0.5 - 14} y={signY + 2.5} width={28} height={14} rx={3} fill="#FDF6E9" opacity={0.92} />
      {emblem ? (
        <text
          x={x + w * 0.5}
          y={signY + 13.5}
          textAnchor="middle"
          fontSize={11}
          style={{ pointerEvents: 'none' }}
        >
          {emblem}
        </text>
      ) : null}

      {/* awning */}
      <clipPath id={clipId}>
        <path d={scallopPath(x + 3, x + w - 3, awningTop, awningDepth)} />
      </clipPath>
      <path d={scallopPath(x + 3, x + w - 3, awningTop, awningDepth)} fill={canopy} />
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: Math.ceil(w / 13) }, (_, i) => (
          <rect
            key={i}
            x={x + 3 + i * 13}
            y={awningTop}
            width={6.5}
            height={awningDepth + 8}
            fill="#FDF6E9"
            opacity={0.55}
          />
        ))}
      </g>
      <path
        d={scallopPath(x + 3, x + w - 3, awningTop, awningDepth)}
        fill="#000"
        opacity={0.07}
      />

      {/* shopfront glazing + door */}
      <rect
        x={x + 7}
        y={awningTop + awningDepth + 6}
        width={w - 14}
        height={baseline - (awningTop + awningDepth + 6)}
        rx={3}
        fill="#F6DCA9"
        opacity={0.55}
      />
      <rect x={doorX} y={baseline - doorH} width={doorW} height={doorH} rx={3} fill={theme.roof} opacity={0.85} />
      <rect x={doorX + 3} y={baseline - doorH + 4} width={doorW - 6} height={doorH - 8} rx={2} fill="#F6DCA9" opacity={0.7} />
      <circle cx={doorX + doorW - 6} cy={baseline - doorH / 2} r={1.6} fill={theme.accent} />

      {/* kerb step */}
      <rect x={x - 4} y={baseline} width={w + 8} height={5} rx={2} fill="#000" opacity={0.1} />
    </g>
  );
}
