/**
 * Isometric projection for the SNS city diorama.
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

export const MAP_W = 1640;
export const MAP_H = 1060;

/** Screen position of grid origin (0,0). */
export const ORIGIN = { x: 712, y: 248 };

export interface IsoPoint {
  x: number;
  y: number;
}

/** Quarter turns of the city, anticlockwise. */
export type Rotation = 0 | 1 | 2 | 3;

/**
 * Turn the city a quarter at a time.
 *
 * The projection itself is fixed — what rotates is where each grid point sits.
 * The grid is not square, so the extents swap on odd quarters.
 */
export function rotateGrid(gx: number, gy: number, rot: Rotation): { gx: number; gy: number } {
  switch (rot) {
    case 1:
      return { gx: gy, gy: GRID_X - gx };
    case 2:
      return { gx: GRID_X - gx, gy: GRID_Y - gy };
    case 3:
      return { gx: GRID_Y - gy, gy: gx };
    default:
      return { gx, gy };
  }
}

/** Project a grid point at a given rotation. Pure. */
export function project(gx: number, gy: number, gz: number, rot: Rotation): IsoPoint {
  const r = rotateGrid(gx, gy, rot);
  return {
    x: ORIGIN.x + (r.gx - r.gy) * (TILE_W / 2),
    y: ORIGIN.y + (r.gx + r.gy) * (TILE_H / 2) - gz,
  };
}

/**
 * The rotation the city art is currently being drawn at.
 *
 * Held here rather than threaded through every component because the whole city
 * is one synchronously-rendered tree with a single owner: CityMap sets this at
 * the top of its render, before any child projects anything. Anything that needs
 * a rotation independent of that tree must call `project` directly.
 */
let activeRotation: Rotation = 0;

export function setProjectionRotation(rot: Rotation): void {
  activeRotation = rot;
}

/** Project a grid point (gx, gy) at height gz (in px), at the city's rotation. */
export function iso(gx: number, gy: number, gz = 0): IsoPoint {
  return project(gx, gy, gz, activeRotation);
}

/**
 * Screen offset for a local step, ignoring rotation.
 *
 * Buildings are positioned by a rotated anchor but built from unrotated offsets,
 * so they keep facing the camera as the city turns. Rotating their geometry too
 * would swing the shopfront and the lit wall around to the back.
 */
export function local(dx: number, dy: number, dz = 0): IsoPoint {
  return {
    x: (dx - dy) * (TILE_W / 2),
    y: (dx + dy) * (TILE_H / 2) - dz,
  };
}

/** Format points for an SVG polygon. */
export function poly(...points: IsoPoint[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

/**
 * Painter's-algorithm depth key. Larger draws later, i.e. nearer the viewer.
 * Two objects on the same diagonal never overlap, so ties are safe.
 */
export function depthOf(gx: number, gy: number, rot: Rotation = 0): number {
  const r = rotateGrid(gx, gy, rot);
  return r.gx + r.gy;
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

/** The city is four blocks across and three deep. */
export const COLS = 4;
export const ROWS = 3;

export const GRID_X = STEP * COLS - ROAD;
export const GRID_Y = STEP * ROWS - ROAD;

/** Street positions, as the grid coordinate each road band starts at. */
export const X_BANDS = Array.from({ length: COLS - 1 }, (_, i) => BLOCK + i * STEP);
export const Y_BANDS = Array.from({ length: ROWS - 1 }, (_, i) => BLOCK + i * STEP);

export interface Plot {
  gx: number;
  gy: number;
}

/**
 * Twelve blocks in a four-by-three arrangement, which in isometric reads as a
 * diamond. Ten are cuisine districts, one is the central plaza, and the far
 * corner is parkland so the silhouette is not perfectly regular.
 */
export const districtPlots: Record<string, Plot> = {
  'dis-chinese': { gx: 0, gy: 0 },
  'dis-north-indian': { gx: STEP, gy: 0 },
  'dis-south-indian': { gx: STEP * 2, gy: 0 },
  'dis-italian': { gx: STEP * 3, gy: 0 },
  'dis-seafood': { gx: 0, gy: STEP },
  'dis-mexican': { gx: STEP * 2, gy: STEP },
  'dis-dessert': { gx: STEP * 3, gy: STEP },
  'dis-pure-veg': { gx: 0, gy: STEP * 2 },
  'dis-jain': { gx: STEP, gy: STEP * 2 },
  'dis-healthy': { gx: STEP * 2, gy: STEP * 2 },
};

export const PLAZA_PLOT: Plot = { gx: STEP, gy: STEP };
export const PARK_PLOT: Plot = { gx: STEP * 3, gy: STEP * 2 };

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

/**
 * The camera as it is actually applied: a translation and a scale in viewBox
 * units. Free panning needs this form — a grid focus point cannot express
 * "dragged half a tile north-west".
 */
export interface Viewport {
  tx: number;
  ty: number;
  scale: number;
}

export const CITY_CAMERA: Camera = {
  gx: (GRID_X - 1) / 2,
  gy: (GRID_Y - 1) / 2,
  scale: 1,
};

export const ZOOM_MIN = 0.7;
export const ZOOM_MAX = 3.2;

/** Frame a district block. */
export function cameraForPlot(plot: Plot, scale = 1.95): Camera {
  return { gx: plot.gx + BLOCK / 2, gy: plot.gy + BLOCK / 2, scale };
}

/** Turn a grid-focused camera into the viewport that centres it. */
export function viewportFor(cam: Camera, rot: Rotation = 0): Viewport {
  const focus = project(cam.gx, cam.gy, 0, rot);
  return {
    tx: MAP_W / 2 - focus.x * cam.scale,
    ty: MAP_H / 2 - focus.y * cam.scale,
    scale: cam.scale,
  };
}

/**
 * CSS transform for a viewport.
 * CSS syntax (units, commas) — SVG's unitless transform form is rejected by the
 * CSS parser, and this has to be a CSS transform so it can be transitioned.
 */
export function toTransform(v: Viewport): string {
  return `translate(${v.tx.toFixed(2)}px, ${v.ty.toFixed(2)}px) scale(${v.scale.toFixed(4)})`;
}

/**
 * Extent of the city in world units, including the height buildings rise above
 * their ground point and the depth of the slab below it. Panning is clamped to
 * this so the city can never be dragged off into empty space.
 */
export function cityBounds(rot: Rotation = 0) {
  const lo = -1.4;
  const hiX = GRID_X + 1.4;
  const hiY = GRID_Y + 1.4;
  const corners = [
    project(lo, lo, 0, rot),
    project(hiX, lo, 0, rot),
    project(hiX, hiY, 0, rot),
    project(lo, hiY, 0, rot),
  ];
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  /** Tallest roof furniture, and the slab's soil sides. */
  const HEADROOM = 210;
  const UNDERSIDE = 60;
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys) - HEADROOM,
    maxY: Math.max(...ys) + UNDERSIDE,
  };
}

/**
 * Keep the city in view.
 *
 * When the city is larger than the frame it must cover the frame completely;
 * when it is smaller than the frame it must stay wholly inside it. Those are
 * opposite inequalities, which is why the two cases are handled separately
 * rather than with one clamp.
 */
export function clampViewport(v: Viewport, rot: Rotation = 0): Viewport {
  const bounds = cityBounds(rot);
  const scale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v.scale));
  const spanX = (bounds.maxX - bounds.minX) * scale;
  const spanY = (bounds.maxY - bounds.minY) * scale;

  const atLeft = -bounds.minX * scale;
  const atRight = MAP_W - bounds.maxX * scale;
  const atTop = -bounds.minY * scale;
  const atBottom = MAP_H - bounds.maxY * scale;

  const tx =
    spanX >= MAP_W
      ? Math.max(atRight, Math.min(atLeft, v.tx))
      : Math.min(atRight, Math.max(atLeft, v.tx));
  const ty =
    spanY >= MAP_H
      ? Math.max(atBottom, Math.min(atTop, v.ty))
      : Math.min(atBottom, Math.max(atTop, v.ty));

  return { tx, ty, scale };
}
