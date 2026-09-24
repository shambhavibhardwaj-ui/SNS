import { useCallback, useRef, useState } from 'react';
import {
  CITY_CAMERA,
  clampViewport,
  MAP_H,
  MAP_W,
  toTransform,
  viewportFor,
  ZOOM_MAX,
  ZOOM_MIN,
  type Camera,
  type Rotation,
  type Viewport,
} from './iso';

/** Distance in screen px before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 5;

export interface CityCamera {
  transform: string;
  /** Quarter turns the city is currently shown at. */
  rotation: Rotation;
  /** Turn the city a quarter left (-1) or right (+1). */
  rotate: (direction: 1 | -1) => void;
  /** True while the move should be transitioned (buttons, fly-to) rather than tracked live. */
  animated: boolean;
  scale: number;
  isPanning: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  flyTo: (cam: Camera) => void;
  reset: () => void;
  zoomStep: (factor: number) => void;
  /** Handlers to spread onto the element that hosts the map. */
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onClickCapture: (e: React.MouseEvent) => void;
  };
  /** Wheel zoom, wired manually because React's onWheel is passive. */
  onWheel: (e: WheelEvent) => void;
  /** Screen px to world units, for converting drag deltas. */
  setSvg: (el: SVGSVGElement | null) => void;
}

/**
 * Pan and zoom for the city.
 *
 * The map behaves like a canvas: drag to pan, wheel or pinch to zoom toward the
 * pointer, buttons to step, and a reset. Movement is clamped so the city cannot
 * be thrown off into empty space.
 *
 * A live drag writes state with the transition switched off; buttons and fly-to
 * switch it back on. Mixing the two is what makes a dragged map feel laggy.
 */
export function useCityCamera(): CityCamera {
  const [view, setView] = useState<Viewport>(() => clampViewport(viewportFor(CITY_CAMERA)));
  const [animated, setAnimated] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [rotation, setRotation] = useState<Rotation>(0);

  /*
   * Mirrors `rotation` for the pointer handlers, which must not re-bind on
   * every turn. Kept in step by `rotate`, the only thing that changes it.
   */
  const rotRef = useRef<Rotation>(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  /** Active pointers, so one finger pans and two pinch. */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  /** Distance travelled in the current press; decides drag vs click. */
  const moved = useRef(0);

  /** How many screen px make one world unit at the current render size. */
  const pxPerUnit = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return 1;
    const rect = svg.getBoundingClientRect();
    /* preserveAspectRatio="meet": the smaller ratio wins. */
    return Math.min(rect.width / MAP_W, rect.height / MAP_H) || 1;
  }, []);

  /** Client coordinates to world (viewBox) coordinates. */
  const toWorld = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: MAP_W / 2, y: MAP_H / 2 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: MAP_W / 2, y: MAP_H / 2 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }, []);

  /** Zoom by `factor`, holding the given world point still under the cursor. */
  const zoomAt = useCallback((factor: number, world: { x: number; y: number }, smooth: boolean) => {
    setAnimated(smooth);
    setView((v) => {
      const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v.scale * factor));
      if (next === v.scale) return v;
      /* Keep `world` fixed: it sits at the same screen spot before and after. */
      const k = next / v.scale;
      return clampViewport(
        {
          tx: world.x - (world.x - v.tx) * k,
          ty: world.y - (world.y - v.ty) * k,
          scale: next,
        },
        rotRef.current,
      );
    });
  }, []);

  const flyTo = useCallback((cam: Camera) => {
    setAnimated(true);
    setView(clampViewport(viewportFor(cam, rotRef.current), rotRef.current));
  }, []);

  /**
   * Turn the city a quarter.
   *
   * A turn re-projects everything, so the old translation no longer points
   * anywhere meaningful: the camera keeps its zoom and re-centres. Done here
   * rather than in an effect on `rotation`, so the turn and the camera move are
   * one update instead of two renders.
   */
  const rotate = useCallback((direction: 1 | -1) => {
    const next = (((rotRef.current + direction + 4) % 4) as Rotation);
    rotRef.current = next;
    setAnimated(true);
    setRotation(next);
    setView((v) => clampViewport(viewportFor({ ...CITY_CAMERA, scale: v.scale }, next), next));
  }, []);

  const reset = useCallback(() => flyTo(CITY_CAMERA), [flyTo]);

  const zoomStep = useCallback(
    (factor: number) => zoomAt(factor, { x: MAP_W / 2, y: MAP_H / 2 }, true),
    [zoomAt],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = 0;
    if (pointers.current.size === 1) {
      setIsPanning(true);
      /* Throws if the pointer is not actually active on this element. */
      try {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {
        /* capture is an optimisation, not a requirement */
      }
    }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
    }
  }, [view.scale]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size >= 2 && pinchStart.current) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const mid = toWorld((a.x + b.x) / 2, (a.y + b.y) / 2);
        const target = pinchStart.current.scale * (dist / pinchStart.current.dist);
        setAnimated(false);
        setView((v) => {
          const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, target));
          const k = next / v.scale;
          return clampViewport(
            {
              tx: mid.x - (mid.x - v.tx) * k,
              ty: mid.y - (mid.y - v.ty) * k,
              scale: next,
            },
            rotRef.current,
          );
        });
        moved.current += 10;
        return;
      }

      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      moved.current += Math.hypot(dx, dy);
      const ratio = pxPerUnit();
      setAnimated(false);
      setView((v) =>
        clampViewport({ ...v, tx: v.tx + dx / ratio, ty: v.ty + dy / ratio }, rotRef.current),
      );
    },
    [pxPerUnit, toWorld],
  );

  const endPointer = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) setIsPanning(false);
  }, []);

  /**
   * A press that travelled is a drag, not a click on a district.
   *
   * The distance is read straight from the current gesture and consumed here,
   * rather than latched in a flag: a drag that ends without a click (pointer
   * cancelled, released off the element) would otherwise leave the flag set and
   * swallow the next legitimate click — including one on the zoom controls.
   */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    const wasDrag = moved.current > DRAG_THRESHOLD;
    moved.current = 0;
    if (!wasDrag) return;
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0016);
      zoomAt(factor, toWorld(e.clientX, e.clientY), false);
    },
    [toWorld, zoomAt],
  );

  return {
    transform: toTransform(view),
    rotation,
    rotate,
    animated,
    scale: view.scale,
    isPanning,
    canZoomIn: view.scale < ZOOM_MAX - 0.001,
    canZoomOut: view.scale > ZOOM_MIN + 0.001,
    flyTo,
    reset,
    zoomStep,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onClickCapture,
    },
    onWheel,
    setSvg: (el) => {
      svgRef.current = el;
    },
  };
}
