import { brand } from '../../../theme/brand';
import { iso, poly, shade, TILE_W } from '../iso';
import type { BuildingStyle } from './buildingStyles';
import {
  alongFront,
  alongSide,
  awningSlab,
  frontArch,
  frontPanel,
  sidePanel,
  type BoxAnchors,
  type Footprint,
} from './geometry';

export interface ArchitectureProps {
  a: BoxAnchors;
  fp: Footprint;
  style: BuildingStyle;
  /** Deterministic per-restaurant variation within one district's theme. */
  variant: number;
}

/* --------------------------------------------------------------- shared -- */

/** Glowing shopfront glazing plus the light it throws onto the pavement. */
function Shopfront({ a, style, t0 = 0.12, t1 = 0.88, top = 0.42 }: ArchitectureProps & { t0?: number; t1?: number; top?: number }) {
  const h = a.B.y - a.B2.y;
  return (
    <g>
      <polygon points={poly(...frontPanel(a, t0, t1, 6, h * top))} fill={style.glow} opacity={0.5} />
      <polygon points={poly(...frontPanel(a, t0, t1, 6, h * top))} fill="none" stroke={style.trim} strokeWidth={1.6} opacity={0.6} />
      {/* mullions */}
      {[0.35, 0.62].map((t) => (
        <polygon key={t} points={poly(...frontPanel(a, t0 + (t1 - t0) * t, t0 + (t1 - t0) * t + 0.02, 6, h * top))} fill={style.trim} opacity={0.55} />
      ))}
    </g>
  );
}

function StripedAwning({ a, style, t0 = 0.08, t1 = 0.92, lift }: ArchitectureProps & { t0?: number; t1?: number; lift: number }) {
  const slab = awningSlab(a, t0, t1, lift);
  const bands = 7;
  return (
    <g>
      <polygon points={poly(...slab.top)} fill={style.awning} />
      {Array.from({ length: bands }, (_, i) => {
        if (i % 2) return null;
        const k0 = t0 + ((t1 - t0) * i) / bands;
        const k1 = t0 + ((t1 - t0) * (i + 1)) / bands;
        const s = awningSlab(a, k0, k1, lift);
        return <polygon key={i} points={poly(...s.top)} fill={style.awningStripe} />;
      })}
      <polygon points={poly(...slab.fascia)} fill={shade(style.awning, -0.28)} />
    </g>
  );
}

/** Pavement table and chairs, so a building reads as somewhere you sit. */
function PatioSet({ a, colour }: { a: BoxAnchors; colour: string }) {
  const p = { x: a.C.x + 26, y: a.C.y + 12 };
  return (
    <g>
      <ellipse cx={p.x} cy={p.y + 3} rx={16} ry={7} fill={brand.teal900} opacity={0.2} />
      <ellipse cx={p.x} cy={p.y - 13} rx={12} ry={6} fill={brand.cream} />
      <rect x={p.x - 1.4} y={p.y - 13} width={2.8} height={13} fill={colour} />
      <ellipse cx={p.x - 17} cy={p.y - 5} rx={5} ry={3} fill={colour} />
      <ellipse cx={p.x + 17} cy={p.y - 5} rx={5} ry={3} fill={colour} />
    </g>
  );
}

function Planter({ x, y, pot, scale = 1 }: { x: number; y: number; pot: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={11} ry={5} fill={brand.teal900} opacity={0.2} />
      <path d="M -9 -10 L 9 -10 L 7 2 L -7 2 Z" fill={pot} />
      <ellipse cx={0} cy={-10} rx={9} ry={4} fill={shade(pot, 0.14)} />
      <ellipse cx={-4} cy={-16} rx={7} ry={7} fill="#2F7A6B" />
      <ellipse cx={4} cy={-19} rx={6} ry={6} fill="#3E9385" />
      <ellipse cx={0} cy={-24} rx={5} ry={5} fill="#4FA898" />
    </g>
  );
}

/* ------------------------------------------------------- 1. ice cream -- */

/** Dessert parlour: rounded parapet, striped awning and a soft-serve on the roof. */
export function ConeArchitecture(props: ArchitectureProps) {
  const { a, fp, style, variant } = props;
  const h = fp.h;
  const m = a.roofMid;
  const scoopR = 13;

  return (
    <g>
      {/* rounded parapet */}
      <polygon points={poly(a.A2, a.B2, a.C2, a.D2)} fill={shade(style.wall, 0.16)} />
      {[-1, 0, 1].map((i) => (
        <ellipse key={i} cx={m.x + i * 22} cy={m.y - 4} rx={13} ry={7} fill={style.roof} />
      ))}
      <polygon
        points={poly(
          iso(fp.gx - 0.1, fp.gy - 0.1, h + 8),
          iso(fp.gx + fp.w + 0.1, fp.gy - 0.1, h + 8),
          iso(fp.gx + fp.w + 0.1, fp.gy + fp.d + 0.1, h + 8),
          iso(fp.gx - 0.1, fp.gy + fp.d + 0.1, h + 8),
        )}
        fill={style.roof}
        opacity={0.55}
      />

      {/* soft-serve sculpture: cone, then three swirls */}
      <g>
        <ellipse cx={m.x} cy={m.y - 6} rx={20} ry={9} fill={brand.teal900} opacity={0.18} />
        <path
          d={`M ${m.x - 13} ${m.y - 22} L ${m.x + 13} ${m.y - 22} L ${m.x} ${m.y - 2} Z`}
          fill={brand.butterDeep}
        />
        <path
          d={`M ${m.x - 13} ${m.y - 22} L ${m.x} ${m.y - 2} L ${m.x} ${m.y - 22} Z`}
          fill={shade(brand.butterDeep, -0.16)}
        />
        <ellipse cx={m.x} cy={m.y - 30} rx={scoopR} ry={scoopR * 0.86} fill={brand.cream} />
        <ellipse cx={m.x + 3} cy={m.y - 42} rx={scoopR - 2} ry={(scoopR - 2) * 0.86} fill={style.roof} />
        <ellipse cx={m.x - 2} cy={m.y - 52} rx={scoopR - 5} ry={(scoopR - 5) * 0.86} fill={brand.cream} />
        <circle cx={m.x - 1} cy={m.y - 60} r={3.6} fill={style.accent} />
        {/* drip */}
        <path d={`M ${m.x - 11} ${m.y - 28} q 3 9 -1 13`} stroke={brand.cream} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      </g>

      <StripedAwning {...props} lift={h * 0.5} />
      <Shopfront {...props} top={0.44} />

      {/* round windows, the parlour tell */}
      {[0.24, 0.72].map((t) => {
        const c = alongFront(a, t, h * 0.68);
        return (
          <g key={t}>
            <ellipse cx={c.x} cy={c.y} rx={11} ry={11} fill={style.glow} opacity={0.9} />
            <ellipse cx={c.x} cy={c.y} rx={11} ry={11} fill="none" stroke={style.trim} strokeWidth={2.2} />
          </g>
        );
      })}

      {/* display window: a row of cakes behind the glass */}
      {[0.28, 0.45, 0.62].map((t, i) => {
        const c = alongFront(a, t, 16);
        return (
          <g key={t}>
            <ellipse cx={c.x} cy={c.y} rx={6} ry={4} fill={i === 1 ? style.accent : style.roof} />
            <ellipse cx={c.x} cy={c.y - 4} rx={5} ry={3} fill={brand.cream} />
          </g>
        );
      })}

      {variant % 2 === 0 ? <PatioSet a={a} colour={style.trim} /> : <Planter x={a.C.x + 24} y={a.C.y + 12} pot={style.roof} />}
    </g>
  );
}

/* ----------------------------------------------------------- 2. indian -- */

/** Indian restaurant: domed roofline, arched entrance, fabric canopy, lanterns. */
export function DomeArchitecture(props: ArchitectureProps) {
  const { a, fp, style, variant } = props;
  const h = fp.h;
  const m = a.roofMid;
  const domeR = TILE_W * fp.w * 0.26;

  return (
    <g>
      <polygon points={poly(a.A2, a.B2, a.C2, a.D2)} fill={shade(style.wall, 0.16)} />
      {/* parapet with a carved edge */}
      <polygon
        points={poly(
          iso(fp.gx - 0.12, fp.gy - 0.12, h + 11),
          iso(fp.gx + fp.w + 0.12, fp.gy - 0.12, h + 11),
          iso(fp.gx + fp.w + 0.12, fp.gy + fp.d + 0.12, h + 11),
          iso(fp.gx - 0.12, fp.gy + fp.d + 0.12, h + 11),
        )}
        fill={shade(style.roof, 0.06)}
      />
      {Array.from({ length: 7 }, (_, i) => {
        const p = alongFront(a, 0.06 + i * 0.14, h + 12);
        return <rect key={i} x={p.x - 2.6} y={p.y - 7} width={5.2} height={7} rx={2} fill={style.roof} />;
      })}

      {/* central dome with finial, flanked by two smaller ones */}
      <g>
        <path
          d={`M ${m.x - domeR} ${m.y - 10} A ${domeR} ${domeR * 1.1} 0 0 1 ${m.x + domeR} ${m.y - 10} Z`}
          fill={style.roof}
        />
        <path
          d={`M ${m.x - domeR} ${m.y - 10} A ${domeR} ${domeR * 1.1} 0 0 1 ${m.x} ${m.y - 10 - domeR * 1.1} L ${m.x} ${m.y - 10} Z`}
          fill={shade(style.roof, 0.14)}
        />
        <ellipse cx={m.x} cy={m.y - 10} rx={domeR} ry={domeR * 0.3} fill={shade(style.roof, -0.14)} />
        <line x1={m.x} y1={m.y - 10 - domeR * 1.1} x2={m.x} y2={m.y - 22 - domeR * 1.1} stroke={brand.butter} strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={m.x} cy={m.y - 25 - domeR * 1.1} r={3.4} fill={brand.butter} />
      </g>
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={`M ${m.x + s * 30 - 9} ${m.y + 2} A 9 10 0 0 1 ${m.x + s * 30 + 9} ${m.y + 2} Z`}
          fill={shade(style.roof, -0.08)}
        />
      ))}

      {/* fabric canopy */}
      <StripedAwning {...props} lift={h * 0.52} />

      {/* arched entrance, plus two arched windows */}
      <polygon points={poly(...frontArch(a, 0.38, 0.62, 4, h * 0.2, h * 0.38))} fill={shade(style.trim, -0.1)} />
      <polygon points={poly(...frontArch(a, 0.41, 0.59, 6, h * 0.18, h * 0.34))} fill={style.glow} opacity={0.85} />
      {[0.14, 0.78].map((t) => (
        <g key={t}>
          <polygon points={poly(...frontArch(a, t, t + 0.1, h * 0.58, h * 0.68, h * 0.8))} fill={style.trim} opacity={0.8} />
          <polygon points={poly(...frontArch(a, t + 0.012, t + 0.088, h * 0.6, h * 0.68, h * 0.77))} fill={style.glow} opacity={0.85} />
        </g>
      ))}

      {/* jali band */}
      {Array.from({ length: 9 }, (_, i) => {
        const p = alongFront(a, 0.1 + i * 0.095, h * 0.86);
        return <rect key={i} x={p.x - 3} y={p.y - 3} width={6} height={6} fill={style.accent} opacity={0.5} transform={`rotate(45 ${p.x} ${p.y})`} />;
      })}

      {/* hanging lanterns under the canopy */}
      {[0.22, 0.5, 0.78].map((t, i) => {
        const p = alongFront(a, t, h * 0.5);
        return (
          <g key={t} className="fc-sway" style={{ animationDelay: `${i * 0.4}s` }}>
            <line x1={p.x + 12} y1={p.y + 10} x2={p.x + 12} y2={p.y + 17} stroke={style.trim} strokeWidth={1.2} />
            <ellipse cx={p.x + 12} cy={p.y + 22} rx={5} ry={6.5} fill={i === 1 ? style.accent : brand.butter} />
          </g>
        );
      })}

      {variant % 2 === 0 ? <Planter x={a.C.x + 24} y={a.C.y + 12} pot={style.trim} /> : <PatioSet a={a} colour={style.trim} />}
    </g>
  );
}

/* ---------------------------------------------------------- 3. italian -- */

/** Trattoria: pitched tiled roof, wood-oven chimney, herb boxes, pavement tables. */
export function PizzaOvenArchitecture(props: ArchitectureProps) {
  const { a, fp, style, variant } = props;
  const h = fp.h;
  const rise = 34;
  const o = 0.24;

  const eA = iso(fp.gx - o, fp.gy - o, h);
  const eB = iso(fp.gx + fp.w + o, fp.gy - o, h);
  const eC = iso(fp.gx + fp.w + o, fp.gy + fp.d + o, h);
  const eD = iso(fp.gx - o, fp.gy + fp.d + o, h);
  const R1 = iso(fp.gx - o, fp.gy + fp.d / 2, h + rise);
  const R2 = iso(fp.gx + fp.w + o, fp.gy + fp.d / 2, h + rise);
  const chimney = iso(fp.gx + fp.w * 0.24, fp.gy + fp.d * 0.3, h + rise);

  return (
    <g>
      {/* pitched tiled roof */}
      <polygon points={poly(eA, eB, R2, R1)} fill={shade(style.roof, 0.12)} />
      <polygon points={poly(eD, eC, R2, R1)} fill={shade(style.roof, -0.06)} />
      <polygon points={poly(eB, eC, R2)} fill={shade(style.roof, -0.3)} />
      {/* tile courses on the near slope */}
      {[0.25, 0.5, 0.75].map((k) => {
        const p0 = { x: eD.x + (R1.x - eD.x) * k, y: eD.y + (R1.y - eD.y) * k };
        const p1 = { x: eC.x + (R2.x - eC.x) * k, y: eC.y + (R2.y - eC.y) * k };
        return <line key={k} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={shade(style.roof, -0.24)} strokeWidth={1.6} opacity={0.65} />;
      })}

      {/* wood-fired oven chimney */}
      <g>
        <rect x={chimney.x - 7} y={chimney.y - 34} width={14} height={34} fill={shade(style.wall, -0.1)} />
        <rect x={chimney.x + 2} y={chimney.y - 34} width={5} height={34} fill={shade(style.wall, -0.26)} />
        <rect x={chimney.x - 9} y={chimney.y - 39} width={18} height={6} rx={2} fill={style.roof} />
        <g className="fc-steam">
          <path d={`M ${chimney.x} ${chimney.y - 42} c -7 -10 7 -16 0 -26`} stroke={brand.cream} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      </g>

      <StripedAwning {...props} lift={h * 0.52} />

      {/* big arched trattoria window and doorway */}
      <polygon points={poly(...frontArch(a, 0.12, 0.44, 6, h * 0.22, h * 0.4))} fill={style.trim} opacity={0.75} />
      <polygon points={poly(...frontArch(a, 0.145, 0.415, 8, h * 0.2, h * 0.36))} fill={style.glow} opacity={0.88} />
      <polygon points={poly(...frontPanel(a, 0.56, 0.74, 4, h * 0.34))} fill={shade(style.trim, -0.12)} />
      <polygon points={poly(...frontPanel(a, 0.58, 0.72, 6, h * 0.31))} fill={style.glow} opacity={0.7} />

      {/* herb boxes on the sills */}
      {[0.2, 0.66].map((t) => {
        const p = alongFront(a, t, h * 0.42);
        return (
          <g key={t}>
            <rect x={p.x - 9} y={p.y} width={18} height={7} rx={2} fill={style.trim} />
            <ellipse cx={p.x - 4} cy={p.y - 2} rx={6} ry={5} fill="#3E9385" />
            <ellipse cx={p.x + 4} cy={p.y - 3} rx={5} ry={4.5} fill="#2F7A6B" />
          </g>
        );
      })}

      <PatioSet a={a} colour={style.trim} />
      {variant % 2 === 0 ? <Planter x={a.D.x - 20} y={a.D.y + 8} pot={style.roof} scale={0.85} /> : null}
    </g>
  );
}

/* ------------------------------------------------------------ 4. asian -- */

/** Asian restaurant: two tiers of upturned eaves, timber posts, lanterns, banner sign. */
export function TieredRoofArchitecture(props: ArchitectureProps) {
  const { a, fp, style, variant } = props;
  const h = fp.h;

  const tier = (lift: number, spread: number, depth: number) => {
    const o = spread;
    const eA = iso(fp.gx - o, fp.gy - o, lift);
    const eB = iso(fp.gx + fp.w + o, fp.gy - o, lift);
    const eC = iso(fp.gx + fp.w + o, fp.gy + fp.d + o, lift);
    const eD = iso(fp.gx - o, fp.gy + fp.d + o, lift);
    const R1 = iso(fp.gx - o * 0.3, fp.gy + fp.d / 2, lift + depth);
    const R2 = iso(fp.gx + fp.w + o * 0.3, fp.gy + fp.d / 2, lift + depth);
    return (
      <g>
        {/* upturned eaves: the corners lift above the ridge line */}
        <path
          d={`M ${eD.x} ${eD.y + 5} Q ${(eD.x + eC.x) / 2} ${eD.y - 4} ${eC.x} ${eC.y + 5}
              L ${R2.x} ${R2.y} L ${R1.x} ${R1.y} Z`}
          fill={shade(style.roof, 0.06)}
        />
        <path
          d={`M ${eA.x} ${eA.y + 5} Q ${(eA.x + eB.x) / 2} ${eA.y - 4} ${eB.x} ${eB.y + 5}
              L ${R2.x} ${R2.y} L ${R1.x} ${R1.y} Z`}
          fill={shade(style.roof, 0.2)}
        />
        <path d={`M ${eB.x} ${eB.y + 5} L ${eC.x} ${eC.y + 5} L ${R2.x} ${R2.y} Z`} fill={shade(style.roof, -0.2)} />
        {/* ridge trim in butter, the lit accent */}
        <line x1={R1.x} y1={R1.y} x2={R2.x} y2={R2.y} stroke={brand.butter} strokeWidth={2.4} opacity={0.85} />
      </g>
    );
  };

  return (
    <g>
      {/* Eaves overhang enough to read as tiers without crowding the neighbours. */}
      {tier(h, 0.26, 19)}
      {tier(h + 25, 0.07, 15)}

      {/* timber posts carrying the lower eaves */}
      {[0.06, 0.94].map((t) => {
        const p = alongFront(a, t, 0);
        return <rect key={t} x={p.x - 3} y={p.y - h * 0.54} width={6} height={h * 0.54} fill={style.trim} />;
      })}

      {/* banner sign hung between the posts */}
      <g>
        {(() => {
          const p = alongFront(a, 0.5, h * 0.74);
          return (
            <>
              <rect x={p.x - 26} y={p.y - 12} width={52} height={24} rx={4} fill={brand.butter} />
              <rect x={p.x - 26} y={p.y - 12} width={52} height={24} rx={4} fill="none" stroke={style.roof} strokeWidth={2} />
              <rect x={p.x - 19} y={p.y - 4} width={38} height={3} rx={1.5} fill={style.accent} opacity={0.8} />
              <rect x={p.x - 19} y={p.y + 2} width={26} height={3} rx={1.5} fill={style.roof} opacity={0.6} />
            </>
          );
        })()}
      </g>

      <StripedAwning {...props} t0={0.14} t1={0.86} lift={h * 0.46} />
      <Shopfront {...props} t0={0.16} t1={0.84} top={0.4} />

      {/* paper lanterns along the eaves */}
      {[0.16, 0.38, 0.62, 0.84].map((t, i) => {
        const p = alongFront(a, t, h * 0.44);
        return (
          <g key={t} className="fc-sway" style={{ animationDelay: `${i * 0.3}s` }}>
            <line x1={p.x + 12} y1={p.y + 10} x2={p.x + 12} y2={p.y + 15} stroke={style.trim} strokeWidth={1.2} />
            <ellipse cx={p.x + 12} cy={p.y + 21} rx={6} ry={7.5} fill={i % 2 ? style.accent : brand.butter} />
            <ellipse cx={p.x + 12} cy={p.y + 21} rx={2} ry={7.5} fill="#fff" opacity={0.25} />
          </g>
        );
      })}

      {variant % 2 === 0 ? <Planter x={a.C.x + 24} y={a.C.y + 12} pot={style.trim} /> : <PatioSet a={a} colour={style.trim} />}
    </g>
  );
}

/* ---------------------------------------------------------- 5. mexican -- */

/** Taquería: stucco walls, arcade of arches, stepped parapet, bunting, cactus. */
export function StuccoArchArchitecture(props: ArchitectureProps) {
  const { a, fp, style, variant } = props;
  const h = fp.h;

  return (
    <g>
      <polygon points={poly(a.A2, a.B2, a.C2, a.D2)} fill={shade(style.wall, 0.16)} />
      {/* stepped clay parapet */}
      <polygon
        points={poly(
          iso(fp.gx - 0.14, fp.gy - 0.14, h + 13),
          iso(fp.gx + fp.w + 0.14, fp.gy - 0.14, h + 13),
          iso(fp.gx + fp.w + 0.14, fp.gy + fp.d + 0.14, h + 13),
          iso(fp.gx - 0.14, fp.gy + fp.d + 0.14, h + 13),
        )}
        fill={shade(style.roof, 0.08)}
      />
      <polygon
        points={poly(
          iso(fp.gx - 0.14, fp.gy + fp.d + 0.14, h + 13),
          iso(fp.gx + fp.w + 0.14, fp.gy + fp.d + 0.14, h + 13),
          iso(fp.gx + fp.w + 0.14, fp.gy + fp.d + 0.14, h),
          iso(fp.gx - 0.14, fp.gy + fp.d + 0.14, h),
        )}
        fill={shade(style.roof, -0.24)}
      />
      {[0.2, 0.5, 0.8].map((t) => {
        const p = alongFront(a, t, h + 14);
        return <rect key={t} x={p.x - 7} y={p.y - 9} width={14} height={9} rx={2} fill={style.roof} />;
      })}
      {/* roof beams poking through the wall, as adobe buildings have */}
      {[0.18, 0.44, 0.7].map((t) => {
        const p = alongFront(a, t, h - 6);
        return <ellipse key={t} cx={p.x + 7} cy={p.y + 4} rx={5} ry={3.4} fill={style.trim} />;
      })}

      {/* arcade: three arches across the front */}
      {[0.1, 0.4, 0.7].map((t) => (
        <g key={t}>
          <polygon points={poly(...frontArch(a, t, t + 0.22, 4, h * 0.24, h * 0.42))} fill={shade(style.trim, -0.16)} />
          <polygon points={poly(...frontArch(a, t + 0.022, t + 0.198, 6, h * 0.22, h * 0.38))} fill={style.glow} opacity={0.82} />
        </g>
      ))}

      <StripedAwning {...props} lift={h * 0.56} />

      {/* papel picado strung along the front */}
      {(() => {
        const p0 = alongFront(a, 0.04, h * 0.78);
        const p1 = alongFront(a, 0.96, h * 0.72);
        const colours = [brand.magenta, brand.butter, style.awning, brand.salmon];
        return (
          <g>
            <path d={`M ${p0.x} ${p0.y} Q ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2 + 13} ${p1.x} ${p1.y}`} fill="none" stroke={style.trim} strokeWidth={1.2} />
            {Array.from({ length: 7 }, (_, i) => {
              const k = (i + 1) / 8;
              const fx = p0.x + (p1.x - p0.x) * k;
              const fy = p0.y + (p1.y - p0.y) * k + 13 * 2 * k * (1 - k);
              return (
                <path
                  key={i}
                  d={`M ${fx - 5} ${fy} L ${fx + 5} ${fy} L ${fx} ${fy + 11} Z`}
                  fill={colours[i % colours.length]}
                  className="fc-sway"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              );
            })}
          </g>
        );
      })()}

      {/* cactus in a clay pot */}
      {(() => {
        const p = { x: a.C.x + 24, y: a.C.y + 13 };
        return (
          <g>
            <ellipse cx={p.x} cy={p.y + 2} rx={11} ry={5} fill={brand.teal900} opacity={0.2} />
            <path d={`M ${p.x - 8} ${p.y - 9} L ${p.x + 8} ${p.y - 9} L ${p.x + 6} ${p.y + 1} L ${p.x - 6} ${p.y + 1} Z`} fill={style.roof} />
            <rect x={p.x - 4} y={p.y - 32} width={8} height={24} rx={4} fill="#3E9385" />
            <rect x={p.x - 11} y={p.y - 26} width={5} height={11} rx={2.5} fill="#2F7A6B" />
            <rect x={p.x + 6} y={p.y - 29} width={5} height={13} rx={2.5} fill="#2F7A6B" />
            <circle cx={p.x} cy={p.y - 34} r={2.4} fill={brand.magenta} />
          </g>
        );
      })()}

      {variant % 2 === 0 ? <PatioSet a={a} colour={style.trim} /> : null}
    </g>
  );
}

/* ----------------------------------------------------------- 6. burger -- */

/** Diner: low banded roof, wraparound glazing and a burger on the sign pylon. */
export function DinerSignArchitecture(props: ArchitectureProps) {
  const { a, fp, style, variant } = props;
  const h = fp.h;
  const m = a.roofMid;

  return (
    <g>
      <polygon points={poly(a.A2, a.B2, a.C2, a.D2)} fill={shade(style.wall, 0.16)} />
      {/* flat roof with a bright band, the diner tell */}
      <polygon
        points={poly(
          iso(fp.gx - 0.12, fp.gy - 0.12, h + 12),
          iso(fp.gx + fp.w + 0.12, fp.gy - 0.12, h + 12),
          iso(fp.gx + fp.w + 0.12, fp.gy + fp.d + 0.12, h + 12),
          iso(fp.gx - 0.12, fp.gy + fp.d + 0.12, h + 12),
        )}
        fill={shade(style.roof, 0.1)}
      />
      <polygon
        points={poly(
          iso(fp.gx - 0.12, fp.gy + fp.d + 0.12, h + 12),
          iso(fp.gx + fp.w + 0.12, fp.gy + fp.d + 0.12, h + 12),
          iso(fp.gx + fp.w + 0.12, fp.gy + fp.d + 0.12, h + 2),
          iso(fp.gx - 0.12, fp.gy + fp.d + 0.12, h + 2),
        )}
        fill={style.roof}
      />
      <polygon points={poly(...frontPanel(a, 0.02, 0.98, h + 4, h + 9))} fill={brand.butter} />

      {/* pylon carrying a burger sculpture */}
      <g>
        <rect x={m.x + 22} y={m.y - 44} width={6} height={46} fill={shade(style.roof, -0.1)} />
        <ellipse cx={m.x + 25} cy={m.y - 62} rx={22} ry={11} fill={brand.teal900} opacity={0.14} />
        {/* bun bottom, patty, cheese, bun top */}
        <path d={`M ${m.x + 4} ${m.y - 50} a 21 9 0 0 0 42 0 Z`} fill={brand.butterDeep} />
        <rect x={m.x + 4} y={m.y - 56} width={42} height={7} rx={3} fill="#7A4A2B" />
        <path d={`M ${m.x + 3} ${m.y - 58} l 9 6 l 10 -6 l 10 6 l 9 -6 Z`} fill={brand.butter} />
        <path d={`M ${m.x + 4} ${m.y - 60} a 21 15 0 0 1 42 0 Z`} fill={brand.butterDeep} />
        <path d={`M ${m.x + 4} ${m.y - 60} a 21 15 0 0 1 21 -15 l 0 15 Z`} fill={shade(brand.butterDeep, 0.16)} />
        {[10, 20, 30].map((dx) => (
          <circle key={dx} cx={m.x + 4 + dx} cy={m.y - 68} r={1.7} fill={brand.cream} />
        ))}
      </g>

      {/* wraparound glazing */}
      <polygon points={poly(...frontPanel(a, 0.08, 0.92, 8, h * 0.56))} fill={style.glow} opacity={0.52} />
      <polygon points={poly(...frontPanel(a, 0.08, 0.92, 8, h * 0.56))} fill="none" stroke={style.trim} strokeWidth={1.8} opacity={0.7} />
      {[0.28, 0.5, 0.72].map((t) => (
        <polygon key={t} points={poly(...frontPanel(a, t, t + 0.016, 8, h * 0.56))} fill={style.trim} opacity={0.6} />
      ))}
      <polygon points={poly(...sidePanel(a, 0.12, 0.88, 10, h * 0.5))} fill={style.glow} opacity={0.3} />

      {/* neon strip under the glazing */}
      <polygon points={poly(...frontPanel(a, 0.08, 0.92, h * 0.6, h * 0.66))} fill={style.accent} opacity={0.9} />

      {/* counter stools at the window */}
      {[0.3, 0.52, 0.74].map((t) => {
        const p = alongFront(a, t, 0);
        return (
          <g key={t}>
            <rect x={p.x + 9} y={p.y - 2} width={3} height={12} fill={style.trim} />
            <ellipse cx={p.x + 10.5} cy={p.y - 3} rx={6} ry={3.2} fill={style.accent} />
          </g>
        );
      })}

      {variant % 2 === 0 ? <PatioSet a={a} colour={style.trim} /> : null}
    </g>
  );
}

/* ---------------------------------------------------------- 7. healthy -- */

/** Greenhouse café: glazed pitched roof with glazing bars, timber frame, planting. */
export function GreenhouseArchitecture(props: ArchitectureProps) {
  const { a, fp, style } = props;
  const h = fp.h;
  const rise = 30;
  const o = 0.12;

  const eA = iso(fp.gx - o, fp.gy - o, h);
  const eB = iso(fp.gx + fp.w + o, fp.gy - o, h);
  const eC = iso(fp.gx + fp.w + o, fp.gy + fp.d + o, h);
  const eD = iso(fp.gx - o, fp.gy + fp.d + o, h);
  const R1 = iso(fp.gx - o, fp.gy + fp.d / 2, h + rise);
  const R2 = iso(fp.gx + fp.w + o, fp.gy + fp.d / 2, h + rise);

  return (
    <g>
      {/* glazed roof: translucent panels rather than a solid slab */}
      <polygon points={poly(eA, eB, R2, R1)} fill={brand.teal200} opacity={0.75} />
      <polygon points={poly(eD, eC, R2, R1)} fill={brand.teal300} opacity={0.62} />
      <polygon points={poly(eB, eC, R2)} fill={brand.teal300} opacity={0.5} />
      {/* glazing bars */}
      {[0.2, 0.4, 0.6, 0.8].map((k) => {
        const b0 = { x: eD.x + (eC.x - eD.x) * k, y: eD.y + (eC.y - eD.y) * k };
        const r = { x: R1.x + (R2.x - R1.x) * k, y: R1.y + (R2.y - R1.y) * k };
        const t0 = { x: eA.x + (eB.x - eA.x) * k, y: eA.y + (eB.y - eA.y) * k };
        return (
          <g key={k}>
            <line x1={b0.x} y1={b0.y} x2={r.x} y2={r.y} stroke={style.roof} strokeWidth={2} opacity={0.8} />
            <line x1={t0.x} y1={t0.y} x2={r.x} y2={r.y} stroke={style.roof} strokeWidth={1.6} opacity={0.6} />
          </g>
        );
      })}
      <line x1={R1.x} y1={R1.y} x2={R2.x} y2={R2.y} stroke={style.roof} strokeWidth={3} />
      {/* roof vent propped open */}
      <polygon
        points={poly(
          { x: R1.x + 24, y: R1.y + 4 },
          { x: R1.x + 54, y: R1.y + 10 },
          { x: R1.x + 54, y: R1.y - 2 },
          { x: R1.x + 24, y: R1.y - 8 },
        )}
        fill={brand.teal200}
        opacity={0.9}
        stroke={style.roof}
        strokeWidth={1.4}
      />

      {/* timber frame and full-height glazing */}
      <polygon points={poly(...frontPanel(a, 0.06, 0.94, 6, h * 0.82))} fill={brand.teal200} opacity={0.42} />
      <polygon points={poly(...frontPanel(a, 0.06, 0.94, 6, h * 0.82))} fill="none" stroke={style.trim} strokeWidth={2} />
      {[0.28, 0.5, 0.72].map((t) => (
        <polygon key={t} points={poly(...frontPanel(a, t, t + 0.018, 6, h * 0.82))} fill={style.trim} opacity={0.85} />
      ))}
      <polygon points={poly(...frontPanel(a, 0.06, 0.94, h * 0.4, h * 0.425))} fill={style.trim} opacity={0.8} />
      {/* warm interior visible through the glass */}
      <polygon points={poly(...frontPanel(a, 0.1, 0.9, 10, h * 0.36))} fill={style.glow} opacity={0.4} />

      {/* produce crates on the pavement */}
      {[0, 1].map((i) => {
        const p = { x: a.C.x + 16 + i * 22, y: a.C.y + 8 + i * 5 };
        return (
          <g key={i}>
            <ellipse cx={p.x} cy={p.y + 2} rx={12} ry={5} fill={brand.teal900} opacity={0.18} />
            <path d={`M ${p.x - 11} ${p.y - 9} L ${p.x + 11} ${p.y - 9} L ${p.x + 9} ${p.y + 1} L ${p.x - 9} ${p.y + 1} Z`} fill={style.trim} />
            <ellipse cx={p.x - 4} cy={p.y - 11} rx={5} ry={4} fill={i ? brand.salmon : '#3E9385'} />
            <ellipse cx={p.x + 4} cy={p.y - 12} rx={5} ry={4} fill={i ? brand.butterDeep : '#4FA898'} />
            <ellipse cx={p.x} cy={p.y - 15} rx={4.5} ry={3.6} fill={i ? '#4FA898' : brand.butterDeep} />
          </g>
        );
      })}

      {/* raised beds along the side wall */}
      {[0.25, 0.65].map((t) => {
        const p = alongSide(a, t, 0);
        return (
          <g key={t}>
            <rect x={p.x - 10} y={p.y - 8} width={20} height={9} rx={2} fill={style.trim} />
            <ellipse cx={p.x - 4} cy={p.y - 11} rx={6} ry={5} fill="#3E9385" />
            <ellipse cx={p.x + 5} cy={p.y - 12} rx={5.5} ry={4.5} fill="#2F7A6B" />
          </g>
        );
      })}

      <Planter x={a.D.x - 18} y={a.D.y + 6} pot={style.trim} scale={0.9} />
    </g>
  );
}
