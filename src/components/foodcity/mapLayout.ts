/**
 * Geometry for the Food City map.
 *
 * Everything here is in viewBox units. The map is a 2x3 grid of neighbourhoods
 * around a central crossroads, so each district reads as its own block of street.
 *
 * Buildings are NOT positioned by hand: `layoutStorefronts` places one building
 * per restaurant in the district, so the skyline is driven by the data. When a
 * restaurant is onboarded, a building appears.
 */
import type { ID, Rect } from '../../data/types';

export const MAP_WIDTH = 1440;
export const MAP_HEIGHT = 900;

/** Where the camera rests when the whole city is in view. */
export const CITY_CAMERA: Rect = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };

/** Main east–west boulevard. */
export const BOULEVARD_Y = 460;
/** The two north–south streets, placed between clusters so they never cut through one. */
export const STREET_X = [560, 1010] as const;
export const ROAD_WIDTH = 44;

/** Central plaza where the boulevard meets the middle street. */
export const PLAZA = { x: 785, y: BOULEVARD_Y, r: 66 };

/** Baseline each row of buildings stands on. */
export const ROW_BASELINE = { top: 400, bottom: 760 } as const;

/** The strip of ground each district's buildings are laid out along. */
export interface ClusterBand {
  /** Left edge of the band. */
  x: number;
  /** Usable width. */
  w: number;
  /** Ground line the buildings stand on. */
  baseline: number;
}

export const clusterBands: Record<ID, ClusterBand> = {
  'dis-asian-street': { x: 130, w: 400, baseline: ROW_BASELINE.top },
  'dis-burger-avenue': { x: 600, w: 380, baseline: ROW_BASELINE.top },
  'dis-little-italy': { x: 1045, w: 350, baseline: ROW_BASELINE.top },
  'dis-indian-market': { x: 130, w: 400, baseline: ROW_BASELINE.bottom },
  'dis-mexican-plaza': { x: 600, w: 380, baseline: ROW_BASELINE.bottom },
  'dis-dessert-lane': { x: 1045, w: 350, baseline: ROW_BASELINE.bottom },
};

export interface StorefrontSlot {
  x: number;
  w: number;
  h: number;
  baseline: number;
  /** Deterministic per-slot variation, so the row never looks stamped out. */
  variant: number;
}

const WIDTHS = [94, 78, 106, 84, 98, 88];
const HEIGHTS = [134, 106, 152, 118, 142, 124];
const GAP = 16;

/**
 * Places `count` buildings along a band, centred, with alternating widths and
 * heights so the silhouette has rhythm.
 */
export function layoutStorefronts(band: ClusterBand, count: number): StorefrontSlot[] {
  const widths = Array.from({ length: count }, (_, i) => WIDTHS[i % WIDTHS.length]);
  const total = widths.reduce((sum, w) => sum + w, 0) + GAP * (count - 1);
  let cursor = band.x + (band.w - total) / 2;

  return widths.map((w, i) => {
    const slot: StorefrontSlot = {
      x: cursor,
      w,
      h: HEIGHTS[i % HEIGHTS.length],
      baseline: band.baseline,
      variant: i,
    };
    cursor += w + GAP;
    return slot;
  });
}

/** Camera rect that frames a district, with a little breathing room. */
export function bandCamera(band: ClusterBand): Rect {
  const pad = 46;
  const tallest = Math.max(...HEIGHTS) + 70;
  return {
    x: band.x - pad,
    y: band.baseline - tallest - pad,
    w: band.w + pad * 2,
    h: tallest + pad * 2.2,
  };
}

/**
 * Turns a camera rect into a transform that fits it to the full viewBox.
 * Zoom is clamped so opening a district feels like leaning in, not teleporting.
 *
 * This is applied as a CSS `transform` (so the move can be transitioned), which
 * means CSS syntax — units on the translate, commas between arguments. SVG's own
 * unitless `translate(10 20)` form is silently rejected by the CSS parser.
 */
export function cameraTransform(rect: Rect, maxScale = 2.45): string {
  const scale = Math.min(MAP_WIDTH / rect.w, MAP_HEIGHT / rect.h, maxScale);
  const tx = MAP_WIDTH / 2 - (rect.x + rect.w / 2) * scale;
  const ty = MAP_HEIGHT / 2 - (rect.y + rect.h / 2) * scale;
  return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${scale.toFixed(4)})`;
}
