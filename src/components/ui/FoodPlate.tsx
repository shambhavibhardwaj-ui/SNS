import { useId } from 'react';

/**
 * Generated cover art for restaurant cards.
 *
 * Real photography is the intended end state — `Restaurant.image` is already a
 * string key, so swapping these for URLs is a one-line change in the card. Until
 * there are licensed photos, this draws a consistent overhead dish per cuisine
 * so the listing reads as a designed set rather than as grey placeholders.
 */

type Kind = 'bowl' | 'plate' | 'flat' | 'stack' | 'cup' | 'board';

interface Preset {
  kind: Kind;
  /** Backdrop gradient, light to dark. */
  bg: [string, string];
  /** Vessel colour. */
  vessel: string;
  /** Food tones, back to front. */
  food: [string, string, string];
  garnish: string;
}

const PRESETS: Record<string, Preset> = {
  curry:   { kind: 'bowl',  bg: ['#F6E0C0', '#E0B478'], vessel: '#FBF4E7', food: ['#C2591F', '#D97B2B', '#EFA94A'], garnish: '#6E8C5A' },
  biryani: { kind: 'plate', bg: ['#F7E3BE', '#DFAE6B'], vessel: '#F6EEDD', food: ['#B9762A', '#E0A844', '#F4D79A'], garnish: '#7FA672' },
  dosa:    { kind: 'plate', bg: ['#F8EBCF', '#E3C182'], vessel: '#F3ECDC', food: ['#C98F3E', '#E6BB6C', '#F6E2B4'], garnish: '#5E8C6A' },
  chaat:   { kind: 'bowl',  bg: ['#F5DEC8', '#DFA378'], vessel: '#FAF2E4', food: ['#9C3F2A', '#D96E3C', '#F2C46B'], garnish: '#6E8C5A' },
  noodles: { kind: 'bowl',  bg: ['#F3DFD2', '#D99C86'], vessel: '#F7EFE3', food: ['#B4512F', '#E0A552', '#F3DBA4'], garnish: '#5E8C6A' },
  ramen:   { kind: 'bowl',  bg: ['#F1DBCB', '#CE8E72'], vessel: '#F8F1E6', food: ['#A8442C', '#DE9348', '#F0D69C'], garnish: '#4F7A5C' },
  sushi:   { kind: 'board', bg: ['#EFE6D6', '#C8AE8C'], vessel: '#6E5335', food: ['#C4503F', '#F2ECDF', '#E28A63'], garnish: '#4F7A5C' },
  pasta:   { kind: 'plate', bg: ['#F5E6CB', '#D9B87F'], vessel: '#FAF5EA', food: ['#B33C2C', '#E0A33F', '#F0D79E'], garnish: '#5C7F4F' },
  pizza:   { kind: 'flat',  bg: ['#F4E2C4', '#D2A46B'], vessel: '#E9C98F', food: ['#C0402C', '#F2E2BC', '#D9713F'], garnish: '#5C7F4F' },
  taco:    { kind: 'stack', bg: ['#F6E2C0', '#D99A5E'], vessel: '#F0CE86', food: ['#B4512C', '#E0A63F', '#6E8C5A'], garnish: '#2E8B8B' },
  burger:  { kind: 'stack', bg: ['#F2E0BE', '#CF9A55'], vessel: '#D9A253', food: ['#7A4224', '#E8B449', '#6E8C5A'], garnish: '#C4543F' },
  bbq:     { kind: 'board', bg: ['#EEDCC2', '#C08E5E'], vessel: '#6E5335', food: ['#8C3A22', '#B9552C', '#E0913C'], garnish: '#5E8C6A' },
  pastry:  { kind: 'plate', bg: ['#F8E9D8', '#DFB98C'], vessel: '#FBF6EC', food: ['#C08A45', '#E6B972', '#F6E3BE'], garnish: '#C4788B' },
  gelato:  { kind: 'cup',   bg: ['#F8E7E6', '#D9A0A9'], vessel: '#FBF3EE', food: ['#D98B9B', '#F0C4A8', '#EFE0C2'], garnish: '#7E9BB5' },
  cake:    { kind: 'stack', bg: ['#F9E6E8', '#D69CA8'], vessel: '#FBF4EE', food: ['#8C4A3C', '#E8C9B0', '#D98B9B'], garnish: '#C4543F' },
  salad:   { kind: 'bowl',  bg: ['#EEF0D8', '#B9C28C'], vessel: '#FAF7EC', food: ['#4F7A5C', '#7FA672', '#C9D69B'], garnish: '#C4543F' },
  bowl:    { kind: 'bowl',  bg: ['#EDEFD9', '#AFBC8A'], vessel: '#F8F5E9', food: ['#5E8C6A', '#C9922F', '#A9C08A'], garnish: '#B3543F' },
  seafood: { kind: 'board', bg: ['#E6EFEA', '#A9C4C0'], vessel: '#F4F7F3', food: ['#E08A6B', '#F2D9C0', '#C2543F'], garnish: '#2F7A6B' },
  thali:   { kind: 'plate', bg: ['#F7E6C6', '#DDB478'], vessel: '#F8F2E4', food: ['#C08438', '#E0B25C', '#7FA672'], garnish: '#B33C2C' },
  juice:   { kind: 'cup',   bg: ['#F4EFD2', '#CBBE72'], vessel: '#FAF7E8', food: ['#D99A2B', '#E8BE4C', '#F2D98A'], garnish: '#5E8C6A' },
};

const FALLBACK = PRESETS.curry;

export function FoodPlate({ image, className }: { image: string; className?: string }) {
  const id = useId();
  const p = PRESETS[image] ?? FALLBACK;

  return (
    <svg
      className={className}
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={p.bg[0]} />
          <stop offset="100%" stopColor={p.bg[1]} />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="66%" cy="16%" r="74%">
          <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#FFFDF5" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <rect width="400" height="260" fill={`url(#${id}-bg)`} />
      <rect width="400" height="260" fill={`url(#${id}-light)`} />

      {/* table shadow under the dish */}
      <ellipse cx="196" cy="152" rx="104" ry="54" fill="#5A3E21" opacity="0.22" filter={`url(#${id}-blur)`} />

      <Dish preset={p} />

      {/* scattered garnish, for depth of field */}
      {[
        [66, 58, 5], [338, 74, 4], [58, 208, 6], [352, 200, 5], [300, 36, 3.4], [110, 32, 3],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={p.garnish} opacity={0.34} />
      ))}
    </svg>
  );
}

function Dish({ preset }: { preset: Preset }) {
  const { kind, vessel, food } = preset;
  const cx = 200;
  const cy = 132;

  switch (kind) {
    case 'flat':
      return (
        <g>
          <circle cx={cx} cy={cy} r="94" fill={vessel} />
          <circle cx={cx} cy={cy} r="80" fill={food[1]} />
          <circle cx={cx} cy={cy} r="72" fill={food[0]} opacity="0.92" />
          {[[-36, -22], [30, -30], [-10, 16], [42, 22], [-44, 26], [8, -6]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={cy + dy} r="11" fill={food[2]} />
          ))}
          {[[-20, -40], [50, -4], [-50, -2], [20, 40]].map(([dx, dy], i) => (
            <ellipse key={i} cx={cx + dx} cy={cy + dy} rx="8" ry="5" fill={preset.garnish} />
          ))}
        </g>
      );

    case 'stack':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 54} rx="88" ry="17" fill={vessel} />
          <path d={`M ${cx - 76} ${cy + 26} a 76 46 0 0 1 152 0 Z`} fill={food[1]} />
          <rect x={cx - 78} y={cy + 20} width="156" height="20" rx="10" fill={preset.garnish} />
          <rect x={cx - 74} y={cy + 36} width="148" height="22" rx="9" fill={food[0]} />
          <rect x={cx - 78} y={cy + 52} width="156" height="12" rx="6" fill={food[2]} />
          <path d={`M ${cx - 80} ${cy + 66} a 80 34 0 0 0 160 0 Z`} fill={food[1]} />
        </g>
      );

    case 'cup':
      return (
        <g>
          <path
            d={`M ${cx - 52} ${cy - 34} L ${cx + 52} ${cy - 34} L ${cx + 36} ${cy + 76} L ${cx - 36} ${cy + 76} Z`}
            fill={vessel}
          />
          <path
            d={`M ${cx - 48} ${cy - 26} L ${cx + 48} ${cy - 26} L ${cx + 37} ${cy + 48} L ${cx - 37} ${cy + 48} Z`}
            fill={food[0]}
          />
          <ellipse cx={cx} cy={cy - 34} rx="52" ry="15" fill={food[1]} />
          <ellipse cx={cx - 16} cy={cy - 44} rx="26" ry="20" fill={food[2]} />
          <ellipse cx={cx + 18} cy={cy - 50} rx="23" ry="19" fill={food[1]} />
          <ellipse cx={cx + 2} cy={cy - 62} rx="18" ry="15" fill={food[2]} />
          <circle cx={cx + 6} cy={cy - 78} r="7" fill={preset.garnish} />
        </g>
      );

    case 'board':
      return (
        <g>
          <rect x={cx - 108} y={cy - 46} width="216" height="96" rx="14" fill={vessel} />
          <rect x={cx - 100} y={cy - 38} width="200" height="80" rx="10" fill={vessel} opacity="0.6" />
          {[-72, -24, 24, 72].map((dx, i) => (
            <g key={i}>
              <rect x={cx + dx - 20} y={cy - 24} width="40" height="48" rx="12" fill={food[1]} />
              <rect x={cx + dx - 20} y={cy - 24} width="40" height="18" rx="9" fill={food[0]} />
              <rect x={cx + dx - 6} y={cy - 30} width="12" height="10" rx="4" fill={food[2]} />
            </g>
          ))}
          <ellipse cx={cx - 88} cy={cy + 34} rx="12" ry="7" fill={preset.garnish} />
        </g>
      );

    case 'plate':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 6} rx="106" ry="62" fill={vessel} />
          <ellipse cx={cx} cy={cy + 2} rx="86" ry="48" fill={vessel} opacity="0.55" />
          <ellipse cx={cx} cy={cy + 2} rx="74" ry="40" fill={food[2]} />
          <ellipse cx={cx - 14} cy={cy - 6} rx="54" ry="30" fill={food[1]} />
          <ellipse cx={cx + 16} cy={cy + 6} rx="38" ry="22" fill={food[0]} />
          {[[-40, 14], [34, -14], [4, 22], [-6, -18]].map(([dx, dy], i) => (
            <ellipse key={i} cx={cx + dx} cy={cy + dy} rx="10" ry="6" fill={preset.garnish} />
          ))}
        </g>
      );

    case 'bowl':
    default:
      return (
        <g>
          <ellipse cx={cx} cy={cy + 16} rx="98" ry="56" fill={vessel} />
          <path d={`M ${cx - 98} ${cy + 16} a 98 62 0 0 0 196 0 Z`} fill={vessel} />
          <ellipse cx={cx} cy={cy + 14} rx="84" ry="46" fill={food[0]} />
          <ellipse cx={cx - 12} cy={cy + 6} rx="60" ry="32" fill={food[1]} />
          <ellipse cx={cx + 20} cy={cy + 18} rx="34" ry="19" fill={food[2]} />
          <ellipse cx={cx - 34} cy={cy + 20} rx="22" ry="13" fill={food[2]} opacity="0.8" />
          {[[-52, -2], [40, -10], [10, 28], [-16, -14]].map(([dx, dy], i) => (
            <ellipse key={i} cx={cx + dx} cy={cy + dy} rx="11" ry="7" fill={preset.garnish} />
          ))}
        </g>
      );
  }
}
