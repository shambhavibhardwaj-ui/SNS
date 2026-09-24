import { brand, world } from '../../../theme/brand';
import {
  BLOCK,
  GRID_X,
  GRID_Y,
  iso,
  PARK_PLOT,
  PLAZA_PLOT,
  poly,
  ROAD,
  shade,
  TILE_W,
  X_BANDS,
  Y_BANDS,
} from '../iso';
import { IsoTree, IsoShrub } from './IsoScenery';

const SLAB_DEPTH = 52;
const GRASS = world.turf;
const GRASS_DARK = world.turfDark;
const PAVING = world.paving;
const PAVING_EDGE = world.pavingEdge;
const SOIL = world.soil;

/** Grid bounds of the slab, a little larger than the city itself. */
const LO = -1.4;
const HI_X = GRID_X + 1.4;
const HI_Y = GRID_Y + 1.4;

/**
 * The ground the city stands on, built as a diorama slab: a solid block of land
 * with visible soil sides, floating on its own shadow. The thickness is what
 * sells the miniature-world reading — without it the map flattens out.
 */
export function IsoGround() {
  const topA = iso(LO, LO);
  const topB = iso(HI_X, LO);
  const topC = iso(HI_X, HI_Y);
  const topD = iso(LO, HI_Y);
  const botB = iso(HI_X, LO, -SLAB_DEPTH);
  const botC = iso(HI_X, HI_Y, -SLAB_DEPTH);
  const botD = iso(LO, HI_Y, -SLAB_DEPTH);

  return (
    <g aria-hidden="true">
      {/* shadow the whole island casts */}
      <ellipse
        cx={iso(GRID_X / 2, GRID_Y / 2).x}
        cy={iso(GRID_X / 2, GRID_Y / 2).y + SLAB_DEPTH + 26}
        rx={TILE_W * (GRID_X + GRID_Y) * 0.3}
        ry={TILE_W * (GRID_X + GRID_Y) * 0.1}
        fill={brand.teal900}
        opacity={0.3}
        filter="url(#fc-soft-shadow)"
      />

      {/* soil sides */}
      <polygon points={poly(topD, topC, botC, botD)} fill={shade(SOIL, -0.24)} />
      <polygon points={poly(topB, topC, botC, botB)} fill={shade(SOIL, -0.06)} />
      {/* a band of darker earth just under the turf */}
      <polygon
        points={poly(topD, topC, { x: topC.x, y: topC.y + 13 }, { x: topD.x, y: topD.y + 13 })}
        fill={shade(SOIL, -0.42)}
      />
      <polygon
        points={poly(topB, topC, { x: topC.x, y: topC.y + 13 }, { x: topB.x, y: topB.y + 13 })}
        fill={shade(SOIL, -0.3)}
      />

      {/* turf */}
      <polygon points={poly(topA, topB, topC, topD)} fill={GRASS} />
      <polygon points={poly(topA, topB, topC, topD)} fill="url(#fc-turf-light)" />
      {/* Distance haze — the far corner of the slab sits back behind more air. */}
      <polygon points={poly(topA, topB, topC, topD)} fill="url(#fc-haze)" />

      {/* roads */}
      {X_BANDS.map((b) => (
        <g key={`col-${b}`}>
          <polygon
            points={poly(iso(b, LO), iso(b + ROAD, LO), iso(b + ROAD, HI_Y), iso(b, HI_Y))}
            fill={PAVING}
          />
          <polygon
            points={poly(iso(b, LO), iso(b + 0.12, LO), iso(b + 0.12, HI_Y), iso(b, HI_Y))}
            fill={PAVING_EDGE}
          />
          <polygon
            points={poly(
              iso(b + ROAD / 2 - 0.05, LO),
              iso(b + ROAD / 2 + 0.05, LO),
              iso(b + ROAD / 2 + 0.05, HI_Y),
              iso(b + ROAD / 2 - 0.05, HI_Y),
            )}
            fill={world.marking}
            opacity={0.5}
          />
        </g>
      ))}
      {Y_BANDS.map((b) => (
        <g key={`row-${b}`}>
          <polygon
            points={poly(iso(LO, b), iso(HI_X, b), iso(HI_X, b + ROAD), iso(LO, b + ROAD))}
            fill={PAVING}
          />
          <polygon
            points={poly(iso(LO, b), iso(HI_X, b), iso(HI_X, b + 0.12), iso(LO, b + 0.12))}
            fill={PAVING_EDGE}
          />
          <polygon
            points={poly(
              iso(LO, b + ROAD / 2 - 0.05),
              iso(HI_X, b + ROAD / 2 - 0.05),
              iso(HI_X, b + ROAD / 2 + 0.05),
              iso(LO, b + ROAD / 2 + 0.05),
            )}
            fill={world.marking}
            opacity={0.5}
          />
        </g>
      ))}

      <Plaza />
      <Park />
    </g>
  );
}

/** The central square where the two main streets cross. */
function Plaza() {
  const { gx, gy } = PLAZA_PLOT;
  const mid = iso(gx + BLOCK / 2, gy + BLOCK / 2);

  return (
    <g>
      <polygon
        points={poly(
          iso(gx, gy),
          iso(gx + BLOCK, gy),
          iso(gx + BLOCK, gy + BLOCK),
          iso(gx, gy + BLOCK),
        )}
        fill={PAVING}
      />
      <ellipse cx={mid.x} cy={mid.y} rx={TILE_W * 1.5} ry={TILE_W * 0.75} fill={shade(PAVING, 0.06)} />
      <ellipse
        cx={mid.x}
        cy={mid.y}
        rx={TILE_W * 1.5}
        ry={TILE_W * 0.75}
        fill="none"
        stroke={PAVING_EDGE}
        strokeWidth={3}
      />

      {/* fountain: a stepped basin with a little height of its own */}
      <ellipse cx={mid.x} cy={mid.y + 4} rx={44} ry={22} fill={shade(PAVING, -0.1)} />
      <ellipse cx={mid.x} cy={mid.y - 2} rx={38} ry={19} fill={world.water} />
      <ellipse cx={mid.x} cy={mid.y - 4} rx={30} ry={15} fill={world.waterLight} />
      <ellipse cx={mid.x} cy={mid.y - 26} rx={13} ry={6.5} fill={shade(PAVING, 0.1)} />
      <rect x={mid.x - 4} y={mid.y - 26} width={8} height={24} fill={shade(PAVING, -0.04)} />
      <circle cx={mid.x} cy={mid.y - 34} r={5} fill={brand.butter} className="fc-lamp-glow" />

      {[
        [gx + 0.5, gy + 0.5],
        [gx + BLOCK - 0.5, gy + 0.5],
        [gx + 0.5, gy + BLOCK - 0.5],
        [gx + BLOCK - 0.5, gy + BLOCK - 0.5],
      ].map(([x, y], i) => (
        <IsoTree key={i} gx={x} gy={y} scale={0.78} />
      ))}
    </g>
  );
}

/** Parkland in the far corner, so the city block grid is not perfectly regular. */
function Park() {
  const { gx, gy } = PARK_PLOT;
  const mid = iso(gx + BLOCK / 2, gy + BLOCK / 2);

  return (
    <g>
      <polygon
        points={poly(
          iso(gx, gy),
          iso(gx + BLOCK, gy),
          iso(gx + BLOCK, gy + BLOCK),
          iso(gx, gy + BLOCK),
        )}
        fill={GRASS_DARK}
      />
      <ellipse cx={mid.x + 10} cy={mid.y + 6} rx={62} ry={31} fill={world.water} />
      <ellipse cx={mid.x + 10} cy={mid.y + 4} rx={54} ry={26} fill={world.waterLight} />
      <IsoTree gx={gx + 0.8} gy={gy + 0.8} scale={1.05} />
      <IsoTree gx={gx + 4.1} gy={gy + 1.1} scale={0.85} />
      <IsoTree gx={gx + 1.1} gy={gy + 4.1} scale={0.92} />
      <IsoShrub gx={gx + 2.4} gy={gy + 0.6} />
      <IsoShrub gx={gx + 4.4} gy={gy + 3.6} />
    </g>
  );
}
