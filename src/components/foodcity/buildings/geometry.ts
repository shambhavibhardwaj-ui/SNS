/**
 * Shared solid geometry for restaurant buildings.
 *
 * Every building starts from the same isometric box so the whole city keeps one
 * light direction and one sense of scale. Cuisine-specific architecture is built
 * on top of these anchor points rather than re-deriving the projection.
 */
import { iso, local, type IsoPoint } from '../iso';

export interface Footprint {
  gx: number;
  gy: number;
  /** Footprint size in tiles. */
  w: number;
  d: number;
  /** Wall height in px. */
  h: number;
}

export interface BoxAnchors {
  /** Ground corners: A is furthest from camera, C is nearest. */
  A: IsoPoint;
  B: IsoPoint;
  C: IsoPoint;
  D: IsoPoint;
  /** The same corners at wall height. */
  A2: IsoPoint;
  B2: IsoPoint;
  C2: IsoPoint;
  D2: IsoPoint;
  /** Centre of the roof slab. */
  roofMid: IsoPoint;
  /** Centre of the ground footprint. */
  groundMid: IsoPoint;
}

/**
 * Screen position of a point on the building, given as an offset from its grid
 * origin.
 *
 * The origin is rotated with the city; the offset is not. That is what keeps a
 * building facing the camera as the city turns — rotating its geometry too
 * would swing the shopfront and the lit wall round to the back, and the face
 * tones would then be lighting the wrong sides.
 */
export function at(fp: Footprint, dx: number, dy: number, dz = 0): IsoPoint {
  const anchor = iso(fp.gx, fp.gy);
  const step = local(dx, dy, dz);
  return { x: anchor.x + step.x, y: anchor.y + step.y };
}

export function boxAnchors(fp: Footprint): BoxAnchors {
  const { w, d, h } = fp;
  return {
    A: at(fp, 0, 0),
    B: at(fp, w, 0),
    C: at(fp, w, d),
    D: at(fp, 0, d),
    A2: at(fp, 0, 0, h),
    B2: at(fp, w, 0, h),
    C2: at(fp, w, d, h),
    D2: at(fp, 0, d, h),
    roofMid: at(fp, w / 2, d / 2, h),
    groundMid: at(fp, w / 2, d / 2),
  };
}

/**
 * Walk along the lit right-hand face (the +gx wall), which is the shopfront.
 * `t` runs 0 at the far corner to 1 at the near corner; `lift` is height in px.
 */
export function alongFront(a: BoxAnchors, t: number, lift = 0): IsoPoint {
  return {
    x: a.B.x + (a.C.x - a.B.x) * t,
    y: a.B.y + (a.C.y - a.B.y) * t - lift,
  };
}

/** Walk along the shaded left-hand face (the +gy wall). */
export function alongSide(a: BoxAnchors, t: number, lift = 0): IsoPoint {
  return {
    x: a.D.x + (a.C.x - a.D.x) * t,
    y: a.D.y + (a.C.y - a.D.y) * t - lift,
  };
}

/** A rectangle laid flat on the shopfront wall, in face coordinates. */
export function frontPanel(
  a: BoxAnchors,
  t0: number,
  t1: number,
  bottom: number,
  top: number,
): IsoPoint[] {
  return [
    alongFront(a, t0, bottom),
    alongFront(a, t1, bottom),
    alongFront(a, t1, top),
    alongFront(a, t0, top),
  ];
}

/** A rectangle on the side wall. */
export function sidePanel(
  a: BoxAnchors,
  t0: number,
  t1: number,
  bottom: number,
  top: number,
): IsoPoint[] {
  return [
    alongSide(a, t0, bottom),
    alongSide(a, t1, bottom),
    alongSide(a, t1, top),
    alongSide(a, t0, top),
  ];
}

/**
 * An awning: a slab standing out from the shopfront wall, returned as its
 * underside-facing top surface and the fascia below it.
 */
export function awningSlab(
  a: BoxAnchors,
  t0: number,
  t1: number,
  lift: number,
  reach = 14,
  drop = 11,
) {
  const inner0 = alongFront(a, t0, lift);
  const inner1 = alongFront(a, t1, lift);
  const outer0 = { x: inner0.x + reach, y: inner0.y + drop };
  const outer1 = { x: inner1.x + reach, y: inner1.y + drop };
  return {
    top: [inner0, inner1, outer1, outer0],
    fascia: [
      outer0,
      outer1,
      { x: outer1.x, y: outer1.y + 6 },
      { x: outer0.x, y: outer0.y + 6 },
    ],
    outer0,
    outer1,
  };
}

/**
 * An arched opening drawn on the shopfront wall.
 *
 * The facade is a skewed plane, so the arch is sampled in face coordinates
 * (position along the wall, height up it) and projected point by point. That
 * keeps the curve sitting correctly on the wall instead of floating flat.
 */
export function frontArch(
  a: BoxAnchors,
  t0: number,
  t1: number,
  bottom: number,
  spring: number,
  peak: number,
  steps = 10,
): IsoPoint[] {
  const points: IsoPoint[] = [alongFront(a, t0, bottom), alongFront(a, t0, spring)];
  for (let i = 0; i <= steps; i += 1) {
    const k = i / steps;
    const t = t0 + (t1 - t0) * k;
    const lift = spring + (peak - spring) * Math.sin(Math.PI * k);
    points.push(alongFront(a, t, lift));
  }
  points.push(alongFront(a, t1, bottom));
  return points;
}

/** A round window on the shopfront, as a projected ellipse centre. */
export function frontCircle(a: BoxAnchors, t: number, lift: number) {
  return alongFront(a, t, lift);
}
