import type { Restaurant } from '../../../data/types';
import { brand } from '../../../theme/brand';
import { FACE_LIGHT, poly, shade } from '../iso';
import {
  ChineseArchitecture,
  ConeArchitecture,
  GreenhouseArchitecture,
  JainArchitecture,
  NorthIndianArchitecture,
  PizzaOvenArchitecture,
  PureVegArchitecture,
  SeafoodArchitecture,
  SouthIndianArchitecture,
  StuccoArchArchitecture,
  type ArchitectureProps,
} from './architecture';
import { styleFor, type CuisineKind } from './buildingStyles';
import { boxAnchors, type Footprint } from './geometry';

interface RestaurantBuildingProps {
  restaurant: Restaurant;
  /** Which architecture to build from — comes from the district's data. */
  kind: CuisineKind | string;
  /** Grid origin of the footprint. */
  gx: number;
  gy: number;
  /** Footprint size in tiles. */
  w?: number;
  d?: number;
  /** Wall height in px. */
  h: number;
  /** Deterministic variation between neighbouring restaurants. */
  variant?: number;
}

const ARCHITECTURE: Record<CuisineKind, (p: ArchitectureProps) => React.JSX.Element> = {
  mexican: StuccoArchArchitecture,
  chinese: ChineseArchitecture,
  seafood: SeafoodArchitecture,
  pureVeg: PureVegArchitecture,
  jain: JainArchitecture,
  italian: PizzaOvenArchitecture,
  healthy: GreenhouseArchitecture,
  southIndian: SouthIndianArchitecture,
  northIndian: NorthIndianArchitecture,
  dessert: ConeArchitecture,
};

/**
 * One restaurant, built as a solid in the city.
 *
 * The base box, its lighting and its cast shadow are shared by every cuisine so
 * the city holds together as one world; everything above the walls comes from
 * the cuisine's architecture. Adding a cuisine means adding a style entry and an
 * architecture component — this file does not change.
 */
export function RestaurantBuilding({
  restaurant,
  kind,
  gx,
  gy,
  w = 2,
  d = 2,
  h,
  variant = 0,
}: RestaurantBuildingProps) {
  const style = styleFor(kind);
  const fp: Footprint = { gx, gy, w, d, h };
  const a = boxAnchors(fp);

  /* Neighbouring restaurants alternate facade tone so a row reads as separate shops. */
  const base = variant % 2 === 0 ? style.wall : style.wallAlt;
  const topTone = shade(base, FACE_LIGHT.top);
  const rightTone = shade(base, FACE_LIGHT.right);
  const leftTone = shade(base, FACE_LIGHT.left);

  const Architecture = ARCHITECTURE[kind as CuisineKind] ?? PizzaOvenArchitecture;

  return (
    <g>
      {/* Cast shadow, thrown down-left away from the sun. */}
      <polygon
        points={poly(
          { x: a.A.x - 16, y: a.A.y + 9 },
          { x: a.B.x - 16, y: a.B.y + 9 },
          { x: a.C.x - 16, y: a.C.y + 9 },
          { x: a.D.x - 16, y: a.D.y + 9 },
        )}
        fill={brand.teal900}
        opacity={0.26}
        filter="url(#fc-soft-shadow)"
      />

      {/* Walls: top face is covered by the architecture, so only the two
          camera-facing faces are drawn here. */}
      <polygon points={poly(a.D, a.C, a.C2, a.D2)} fill={leftTone} />
      <polygon points={poly(a.B, a.C, a.C2, a.B2)} fill={rightTone} />
      <polygon points={poly(a.A2, a.B2, a.C2, a.D2)} fill={topTone} />

      {/* Ambient occlusion where the walls meet the ground. */}
      <polygon
        points={poly(a.D, a.C, { x: a.C.x, y: a.C.y - 7 }, { x: a.D.x, y: a.D.y - 7 })}
        fill={brand.teal900}
        opacity={0.16}
      />

      <Architecture a={a} fp={fp} style={style} variant={variant} />

      {/* Restaurant emblem on a small sign, so each shop is identifiable. */}
      <g>
        <circle cx={a.C.x} cy={a.C.y - h - 6} r={10.5} fill={style.roof} />
        <circle cx={a.C.x} cy={a.C.y - h - 6} r={8} fill={brand.butter} />
        <text x={a.C.x} y={a.C.y - h - 2.5} textAnchor="middle" fontSize={9.5}>
          {restaurant.storefront.emblem}
        </text>
      </g>
    </g>
  );
}
