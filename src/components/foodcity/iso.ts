/**
 * Isometric projection for the Food City diorama.
 *
 * A true 2:1 dimetric projection: one grid step along +gx moves half a tile
 * right and half a tile down; +gy moves half a tile left and half a tile down;
 * +gz moves straight up. That gives every solid three visible faces (top,
 * lower-right, lower-left), which is what makes the buildings read as objects
 * with volume rather than as flat shapes.
 *
 * Everything on the map is positioned in GRID units and projected here. Nothing
 * else in the codebase should do this arithmetic.
 */

export const TILE_W = 62;
export const TILE_H = 31;

export const MAP_W = 1300;
export const MAP_H = 880;

/** Screen position of grid origin (0,0). */
export const ORIGIN = { x: 650, y: 196 };

export interface IsoPoint {
  x: number;
  y: number;
}

/** Project a grid point (gx, gy) at height gz (in px) to screen space. */
export function iso(gx: number, gy: number, gz = 0): IsoPoint {
  return {
    x: ORIGIN.x + (gx - gy) * (TILE_W / 2),
    y: ORIGIN.y + (gx + gy) * (TILE_H / 2) - gz,
  };
}

/** Format points for an SVG polygon. */
export function poly(...points: IsoPoint[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

/**
 * Painter's-algorithm depth key. Larger draws later, i.e. nearer the viewer.
 * Two objects on the same gx+gy diagonal never overlap, so ties are safe.
 */
export function depthOf(gx: number, gy: number): number {
  return gx + gy;
}

/* ------------------------------------------------------------- lighting -- */

/**
 * Accepts `#rgb`, `#rrggbb` or the `rgb(r, g, b)` this module itself emits.
 * Handling its own output matters: feeding shade() a shaded colour is an easy
 * mistake, and silently producing NaN paints the whole city black.
 */
function toRgb(color: string): [number, number, number] {
  const rgbMatch = color.match(/rgb\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }
  const h = color.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const parts: [number, number, number] = [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
  return parts.some(Number.isNaN) ? [128, 128, 128] : parts;
}

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/**
 * Mix a colour toward white (amount > 0) or black (amount < 0).
 * Used to derive the three face tones of a solid from one base colour, so
 * lighting stays consistent across every building in the city.
 */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = toRgb(hex);
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const mix = (c: number) => clamp(c + (target - c) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** The sun sits up and to the right, so the right face catches more light. */
export const FACE_LIGHT = {
  top: 0.16,
  right: -0.02,
  left: -0.26,
} as const;

/* ----------------------------------------------------------- city plots -- */

/** Tiles along one side of a district block. */
export const BLOCK = 5;
/** Tiles of road between blocks. */
export const ROAD = 2;
/** Grid distance from one block origin to the next. */
export const STEP = BLOCK + ROAD;
/** Total grid extent: three blocks and two roads. */
export const GRID = STEP * 3 - ROAD;

export interface Plot {
  gx: number;
  gy: number;
}

/**
 * The city is a three-by-three arrangement of blocks, which in isometric reads
 * as a diamond of nine. Seven are districts, the middle is the plaza, and the
 * far corner is parkland so the silhouette is not perfectly regular.
 */
export const districtPlots: Record<string, Plot> = {
  'dis-asian': { gx: 0, gy: 0 },
  'dis-burger': { gx: STEP, gy: 0 },
  'dis-italian': { gx: STEP * 2, gy: 0 },
  'dis-indian': { gx: 0, gy: STEP },
  'dis-dessert': { gx: STEP * 2, gy: STEP },
  'dis-garden': { gx: 0, gy: STEP * 2 },
  'dis-mexican': { gx: STEP, gy: STEP * 2 },
};

export const PLAZA_PLOT: Plot = { gx: STEP, gy: STEP };
export const PARK_PLOT: Plot = { gx: STEP * 2, gy: STEP * 2 };

/** Where each building sits inside its 5x5 block, as a 2x2 footprint. */
export const BUILDING_SLOTS: Plot[] = [
  { gx: 0, gy: 0 },
  { gx: 3, gy: 0 },
  { gx: 0, gy: 3 },
  { gx: 3, gy: 3 },
];

export const BUILDING_HEIGHTS = [112, 84, 130, 98];

/* -------------------------------------------------------------- camera -- */

export interface Camera {
  /** Grid point the camera centres on. */
  gx: number;
  gy: number;
  scale: number;
}

export const CITY_CAMERA: Camera = {
  gx: (GRID - 1) / 2,
  gy: (GRID - 1) / 2,
  scale: 1,
};

/** Frame a district block. */
export function cameraForPlot(plot: Plot, scale = 1.95): Camera {
  return { gx: plot.gx + BLOCK / 2, gy: plot.gy + BLOCK / 2, scale };
}

/**
 * CSS transform that puts the camera's grid point at the centre of the map.
 * CSS syntax (units, commas) — SVG's unitless transform form is rejected by the
 * CSS parser, and this has to be a CSS transform so it can be transitioned.
 */
export function cameraTransform(cam: Camera): string {
  const focus = iso(cam.gx, cam.gy);
  const tx = MAP_W / 2 - focus.x * cam.scale;
  const ty = MAP_H / 2 - focus.y * cam.scale;
  return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${cam.scale.toFixed(4)})`;
}
