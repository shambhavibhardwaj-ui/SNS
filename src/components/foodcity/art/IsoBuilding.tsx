import type { DistrictTheme, RoofStyle } from '../../../data/types';
import { FACE_LIGHT, iso, poly, shade, TILE_H, TILE_W } from '../iso';

interface IsoBuildingProps {
  /** Grid origin of the footprint. */
  gx: number;
  gy: number;
  /** Footprint size in tiles. */
  w?: number;
  d?: number;
  /** Wall height in px. */
  h: number;
  theme: DistrictTheme;
  emblem?: string;
  /** Deterministic variation between neighbouring shops. */
  variant?: number;
}

/**
 * One building, drawn as a real solid: a top face and the two faces that face
 * the camera, each toned from the same base colour so the whole city shares one
 * light direction. The roof shape is what distinguishes a district from across
 * the map.
 */
export function IsoBuilding({
  gx,
  gy,
  w = 2,
  d = 2,
  h,
  theme,
  emblem,
  variant = 0,
}: IsoBuildingProps) {
  /*
   * Alternate a touch of tone between neighbours so a row reads as separate
   * shops. Folded into the face amounts rather than pre-shading the wall —
   * shade() takes a base colour, and passing it its own output compounds.
   */
  const tint = variant % 2 === 0 ? 0.04 : -0.09;
  const topTone = shade(theme.wall, FACE_LIGHT.top + tint);
  const rightTone = shade(theme.wall, FACE_LIGHT.right + tint);
  const leftTone = shade(theme.wall, FACE_LIGHT.left + tint);

  /* Ground corners, clockwise from the far corner. */
  const A = iso(gx, gy);
  const B = iso(gx + w, gy);
  const C = iso(gx + w, gy + d);
  const D = iso(gx, gy + d);

  /* The same corners at wall height. */
  const A2 = iso(gx, gy, h);
  const B2 = iso(gx + w, gy, h);
  const C2 = iso(gx + w, gy + d, h);
  const D2 = iso(gx, gy + d, h);

  const midX = (B.x + D.x) / 2;

  return (
    <g>
      {/* Cast shadow, thrown down-left away from the sun. */}
      <polygon
        points={poly(
          { x: A.x - 16, y: A.y + 9 },
          { x: B.x - 16, y: B.y + 9 },
          { x: C.x - 16, y: C.y + 9 },
          { x: D.x - 16, y: D.y + 9 },
        )}
        fill="#4A3B2E"
        opacity={0.17}
        filter="url(#fc-soft-shadow)"
      />

      {/* Lower-left face (in shade). */}
      <polygon points={poly(D, C, C2, D2)} fill={leftTone} />
      {/* Lower-right face (lit). */}
      <polygon points={poly(B, C, C2, B2)} fill={rightTone} />
      {/* Contact shading where the walls meet the ground. */}
      <polygon points={poly(D, C, { x: C.x, y: C.y - 7 }, { x: D.x, y: D.y - 7 })} fill="#4A3B2E" opacity={0.1} />

      <Roof
        style={theme.roofStyle}
        gx={gx}
        gy={gy}
        w={w}
        d={d}
        h={h}
        theme={theme}
        topTone={topTone}
        rightTone={rightTone}
        leftTone={leftTone}
        corners={{ A2, B2, C2, D2 }}
      />

      {/* Shopfront: awning, glazing and door on the lit right face. */}
      <Shopfront
        B={B}
        C={C}
        h={h}
        theme={theme}
        emblem={emblem}
        lit={variant % 2 === 0}
      />

      {/* Upper window on the shaded face, so both sides read as inhabited. */}
      <polygon
        points={poly(
          { x: D.x + 14, y: D.y - h + 30 },
          { x: D.x + 14 + TILE_W * 0.34, y: D.y - h + 30 + TILE_H * 0.34 },
          { x: D.x + 14 + TILE_W * 0.34, y: D.y - h + 52 + TILE_H * 0.34 },
          { x: D.x + 14, y: D.y - h + 52 },
        )}
        fill={variant % 2 === 0 ? '#F2C368' : '#9FB6C0'}
        opacity={0.8}
      />

      {/* Sign board standing proud of the roofline. */}
      {emblem ? (
        <g>
          <line
            x1={midX}
            y1={C.y - h - 4}
            x2={midX}
            y2={C.y - h - 20}
            stroke={shade(theme.roof, -0.3)}
            strokeWidth={2.5}
          />
          <circle cx={midX} cy={C.y - h - 28} r={11} fill={theme.roof} />
          <circle cx={midX} cy={C.y - h - 28} r={8.5} fill="#FFFBF2" />
          <text x={midX} y={C.y - h - 24} textAnchor="middle" fontSize={10}>
            {emblem}
          </text>
        </g>
      ) : null}
    </g>
  );
}

/* ------------------------------------------------------------------ roof -- */

interface RoofProps {
  style: RoofStyle;
  gx: number;
  gy: number;
  w: number;
  d: number;
  h: number;
  theme: DistrictTheme;
  topTone: string;
  rightTone: string;
  leftTone: string;
  corners: { A2: ReturnType<typeof iso>; B2: ReturnType<typeof iso>; C2: ReturnType<typeof iso>; D2: ReturnType<typeof iso> };
}

function Roof({ style, gx, gy, w, d, h, theme, topTone, corners }: RoofProps) {
  const { A2, B2, C2, D2 } = corners;
  const roofLit = shade(theme.roof, 0.1);
  const roofMid = shade(theme.roof, -0.06);
  const roofDark = shade(theme.roof, -0.28);

  /* Ridge running along the gx axis, centred on the footprint. */
  const gable = (rise: number, overhang = 0.22) => {
    const o = overhang;
    const eA = iso(gx - o, gy - o, h);
    const eB = iso(gx + w + o, gy - o, h);
    const eC = iso(gx + w + o, gy + d + o, h);
    const eD = iso(gx - o, gy + d + o, h);
    const R1 = iso(gx - o, gy + d / 2, h + rise);
    const R2 = iso(gx + w + o, gy + d / 2, h + rise);
    return { eA, eB, eC, eD, R1, R2 };
  };

  switch (style) {
    case 'gable':
    case 'pagoda': {
      const rise = style === 'pagoda' ? 26 : 34;
      const { eA, eB, eC, eD, R1, R2 } = gable(rise, style === 'pagoda' ? 0.42 : 0.22);
      return (
        <g>
          {/* far slope, seen foreshortened from above */}
          <polygon points={poly(eA, eB, R2, R1)} fill={roofLit} />
          {/* near slope, facing the camera */}
          <polygon points={poly(eD, eC, R2, R1)} fill={roofMid} />
          {/* gable end on the lit right side */}
          <polygon points={poly(eB, eC, R2)} fill={roofDark} />
          {style === 'pagoda' ? (
            <>
              <polygon
                points={poly(
                  iso(gx + w * 0.2, gy + d * 0.2, h + rise),
                  iso(gx + w * 0.8, gy + d * 0.2, h + rise),
                  iso(gx + w * 0.8, gy + d / 2, h + rise + 18),
                  iso(gx + w * 0.2, gy + d / 2, h + rise + 18),
                )}
                fill={roofLit}
              />
              <polygon
                points={poly(
                  iso(gx + w * 0.2, gy + d * 0.8, h + rise),
                  iso(gx + w * 0.8, gy + d * 0.8, h + rise),
                  iso(gx + w * 0.8, gy + d / 2, h + rise + 18),
                  iso(gx + w * 0.2, gy + d / 2, h + rise + 18),
                )}
                fill={roofMid}
              />
            </>
          ) : null}
        </g>
      );
    }

    case 'dome': {
      const centre = iso(gx + w / 2, gy + d / 2, h);
      const rx = TILE_W * w * 0.34;
      return (
        <g>
          <polygon points={poly(A2, B2, C2, D2)} fill={topTone} />
          <path
            d={`M ${centre.x - rx} ${centre.y} A ${rx} ${rx * 1.15} 0 0 1 ${centre.x + rx} ${centre.y} Z`}
            fill={roofMid}
          />
          <path
            d={`M ${centre.x - rx} ${centre.y} A ${rx} ${rx * 1.15} 0 0 1 ${centre.x} ${centre.y - rx * 1.15} L ${centre.x} ${centre.y} Z`}
            fill={roofDark}
            opacity={0.55}
          />
          <ellipse cx={centre.x} cy={centre.y} rx={rx} ry={rx * 0.32} fill={roofLit} opacity={0.4} />
          <line
            x1={centre.x}
            y1={centre.y - rx * 1.15}
            x2={centre.x}
            y2={centre.y - rx * 1.15 - 14}
            stroke={theme.accent}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <circle cx={centre.x} cy={centre.y - rx * 1.15 - 17} r={3.4} fill={theme.accent} />
        </g>
      );
    }

    case 'scallop': {
      const centre = iso(gx + w / 2, gy + d / 2, h);
      const rx = TILE_W * w * 0.3;
      return (
        <g>
          <polygon points={poly(A2, B2, C2, D2)} fill={topTone} />
          <polygon
            points={poly(
              iso(gx - 0.14, gy - 0.14, h + 13),
              iso(gx + w + 0.14, gy - 0.14, h + 13),
              iso(gx + w + 0.14, gy + d + 0.14, h + 13),
              iso(gx - 0.14, gy + d + 0.14, h + 13),
            )}
            fill={roofLit}
          />
          {[-1, 0, 1].map((i) => (
            <circle key={i} cx={centre.x + i * rx * 0.62} cy={centre.y - 12} r={rx * 0.3} fill={roofMid} />
          ))}
        </g>
      );
    }

    case 'terrace': {
      const centre = iso(gx + w / 2, gy + d / 2, h);
      return (
        <g>
          <polygon points={poly(A2, B2, C2, D2)} fill={shade('#7FA672', 0.06)} />
          <polygon
            points={poly(
              iso(gx, gy, h + 9),
              iso(gx + w, gy, h + 9),
              iso(gx + w, gy + d, h + 9),
              iso(gx, gy + d, h + 9),
            )}
            fill="none"
            stroke={roofMid}
            strokeWidth={3}
          />
          {/* raised beds on the roof */}
          {[0.3, 0.7].map((t, i) => (
            <ellipse
              key={i}
              cx={centre.x + (i === 0 ? -20 : 18)}
              cy={centre.y - 8 + (i === 0 ? -5 : 6)}
              rx={13}
              ry={6.5}
              fill={shade('#5E8C6A', t * 0.2)}
            />
          ))}
          <ellipse cx={centre.x} cy={centre.y - 16} rx={9} ry={11} fill="#6E8C5A" />
        </g>
      );
    }

    case 'clay':
    case 'flat':
    default: {
      const parapet = style === 'clay' ? 8 : 14;
      return (
        <g>
          <polygon points={poly(A2, B2, C2, D2)} fill={topTone} />
          {/* parapet ring, drawn as a slightly raised slab */}
          <polygon
            points={poly(
              iso(gx - 0.12, gy - 0.12, h + parapet),
              iso(gx + w + 0.12, gy - 0.12, h + parapet),
              iso(gx + w + 0.12, gy + d + 0.12, h + parapet),
              iso(gx - 0.12, gy + d + 0.12, h + parapet),
            )}
            fill={roofLit}
          />
          <polygon
            points={poly(
              iso(gx - 0.12, gy + d + 0.12, h + parapet),
              iso(gx + w + 0.12, gy + d + 0.12, h + parapet),
              iso(gx + w + 0.12, gy + d + 0.12, h),
              iso(gx - 0.12, gy + d + 0.12, h),
            )}
            fill={roofDark}
          />
          {style === 'flat' ? (
            <polygon
              points={poly(
                iso(gx + w * 0.3, gy + d * 0.3, h + parapet + 20),
                iso(gx + w * 0.7, gy + d * 0.3, h + parapet + 20),
                iso(gx + w * 0.7, gy + d * 0.7, h + parapet + 20),
                iso(gx + w * 0.3, gy + d * 0.7, h + parapet + 20),
              )}
              fill={shade(theme.accent, 0)}
              opacity={0.9}
            />
          ) : null}
        </g>
      );
    }
  }
}

/* ------------------------------------------------------------- shopfront -- */

function Shopfront({
  B,
  C,
  h,
  theme,
  lit,
}: {
  B: IsoPointLike;
  C: IsoPointLike;
  h: number;
  theme: DistrictTheme;
  emblem?: string;
  lit: boolean;
}) {
  /* The right face runs from B (far) to C (near); walk along it in screen space. */
  const dx = C.x - B.x;
  const dy = C.y - B.y;
  const at = (t: number, lift: number) => ({ x: B.x + dx * t, y: B.y + dy * t - lift });

  const awningTop = h * 0.46;

  return (
    <g>
      {/* glazing */}
      <polygon
        points={poly(at(0.12, 6), at(0.88, 6), at(0.88, awningTop - 4), at(0.12, awningTop - 4))}
        fill="#F6DCA9"
        opacity={0.62}
      />
      {/* doorway */}
      <polygon
        points={poly(at(0.42, 2), at(0.62, 2), at(0.62, awningTop - 18), at(0.42, awningTop - 18))}
        fill={shade(theme.roof, -0.1)}
        opacity={0.9}
      />
      {/* awning: a thin wedge standing out from the wall */}
      <polygon
        points={poly(
          at(0.08, awningTop),
          at(0.92, awningTop),
          { x: at(0.92, awningTop).x + 13, y: at(0.92, awningTop).y + 11 },
          { x: at(0.08, awningTop).x + 13, y: at(0.08, awningTop).y + 11 },
        )}
        fill={theme.awning}
      />
      <polygon
        points={poly(
          { x: at(0.08, awningTop).x + 13, y: at(0.08, awningTop).y + 11 },
          { x: at(0.92, awningTop).x + 13, y: at(0.92, awningTop).y + 11 },
          { x: at(0.92, awningTop).x + 13, y: at(0.92, awningTop).y + 16 },
          { x: at(0.08, awningTop).x + 13, y: at(0.08, awningTop).y + 16 },
        )}
        fill={shade(theme.awning, -0.25)}
      />
      {/* warm light spilling out under the awning */}
      {lit ? (
        <polygon
          points={poly(at(0.12, 6), at(0.88, 6), at(0.88, awningTop - 4), at(0.12, awningTop - 4))}
          fill="#FFD98A"
          opacity={0.3}
        />
      ) : null}
    </g>
  );
}

interface IsoPointLike {
  x: number;
  y: number;
}
