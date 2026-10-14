/**
 * Grid → world space for the 3D city.
 *
 * The layout is not reinvented here. `iso.ts` already owns where every block
 * and building sits — twelve plots in a 4×3 arrangement, ten of them cuisine
 * districts, a plaza and a park — and that arithmetic is the city's identity
 * as much as the drawings were. This module only moves those same grid
 * coordinates into three dimensions.
 *
 * One grid tile is one world unit. The city is centred on the origin so the
 * orbit controls can target (0, 0, 0) and the camera swings around the middle
 * of the city rather than around its corner.
 *
 * Axes follow three.js convention: x right, y up, z toward the viewer. The
 * isometric grid's `gy` therefore becomes `z`, not `y` — a grid step "down the
 * page" is a step away across the ground, not a step into the air.
 */
import {
  BLOCK, BUILDING_SLOTS, GRID_X, GRID_Y, PARK_PLOT, PLAZA_PLOT, ROAD, STEP,
  districtPlots, type Plot,
} from '../foodcity/iso';

export { BLOCK, ROAD, STEP, GRID_X, GRID_Y, districtPlots, PLAZA_PLOT, PARK_PLOT };
export type { Plot };

/** Half-extents, so the city straddles the origin. */
export const HALF_X = GRID_X / 2;
export const HALF_Z = GRID_Y / 2;

/** A grid point's world position on the ground plane. */
export function world(gx: number, gy: number): [number, number, number] {
  return [gx - HALF_X, 0, gy - HALF_Z];
}

/** Footprint of one restaurant inside its block, in tiles. */
export const FOOTPRINT = 2;

/**
 * Deterministic per-building variation.
 *
 * Height, roof pitch and which of the two wall tones a building takes are all
 * drawn from its id rather than from `Math.random()`. A random city would
 * reshuffle itself on every React render, and a building that changes height
 * while you orbit around it is the one thing that would break the illusion
 * this whole rebuild exists to create.
 */
export function hashOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** Where each restaurant sits inside its district block. */
export function slotFor(index: number): Plot {
  return BUILDING_SLOTS[index % BUILDING_SLOTS.length];
}

/**
 * The centre of a building's 2×2 footprint, in world space.
 *
 * Slots are given as the footprint's near corner, so the centre is half a
 * footprint further along both axes.
 */
export function buildingCentre(plot: Plot, slot: Plot): [number, number, number] {
  const [x, , z] = world(plot.gx + slot.gx + FOOTPRINT / 2, plot.gy + slot.gy + FOOTPRINT / 2);
  return [x, 0, z];
}

/** The centre of a whole district block. */
export function blockCentre(plot: Plot): [number, number, number] {
  return world(plot.gx + BLOCK / 2, plot.gy + BLOCK / 2);
}
