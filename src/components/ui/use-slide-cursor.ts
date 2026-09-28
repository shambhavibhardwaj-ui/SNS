import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Measuring for the sliding pill, split from the components so Fast Refresh
 * keeps working — a module that exports both components and helpers loses it.
 *
 * Positions come from `getBoundingClientRect` against the container rather
 * than `offsetLeft`/`offsetTop`. `offsetTop` is relative to the nearest
 * positioned ancestor, which is not necessarily the list, and it ignores the
 * container's own scroll — inside the dashboard rail, which scrolls, that puts
 * the pill in the wrong place as soon as the nav is long enough to move.
 */

export interface SlidePosition {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
}

const HIDDEN: SlidePosition = { left: 0, top: 0, width: 0, height: 0, opacity: 0 };

/** Marks an item the pill can rest on. Put it on every item in the list. */
export const SLIDE_ITEM_ATTR = 'data-slide-item';

/** Where `target` sits inside `container`, in the container's own coordinates. */
export function measureInto(container: HTMLElement, target: HTMLElement): SlidePosition {
  const c = container.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  return {
    left: t.left - c.left + container.scrollLeft,
    top: t.top - c.top + container.scrollTop,
    width: t.width,
    height: t.height,
    opacity: 1,
  };
}

/**
 * Tracks the pill for a list of items.
 *
 * `restKey` names the item the pill returns to — the selected tab, or the nav
 * link the current route matches. It is a **key, not a ref**: the element is
 * looked up inside the container at measure time via `data-slide-item`.
 *
 * That indirection is the whole design, and it was arrived at the hard way.
 * Holding the resting element in a ref meant every measurement depended on
 * React's ref attach and detach order across a list of twelve inline callbacks
 * — and on a route change the ref was still pointing at the link you had just
 * left, so the pill stayed behind. Measuring state that was set inside a ref
 * callback had a second problem: the update lands in the commit phase, where
 * framer-motion does not see it, so the pill kept the values it was born with
 * until a pointer event moved it from outside a commit. A key plus a query has
 * neither failure: there is nothing to attach, and the work happens in a
 * passive effect, which is a clean render boundary.
 */
export function useSlideCursor(restKey?: string | null) {
  const containerRef = useRef<HTMLElement | null>(null);
  /* True while the pointer is driving the pill, so the resting measurement
     does not yank it back mid-hover. */
  const hoveringRef = useRef(false);
  const [position, setPosition] = useState<SlidePosition>(HIDDEN);

  /* A callback ref rather than the raw ref object: the container is the hook's
     own state, and handing the ref out invites callers to reassign it. */
  const setContainer = useCallback((el: HTMLElement | null) => {
    containerRef.current = el;
  }, []);

  const apply = useCallback((container: HTMLElement, target: HTMLElement) => {
    const next = measureInto(container, target);
    setPosition((prev) => (same(prev, next) ? prev : next));
  }, []);

  /** Move the pill to an element the pointer is over. */
  const moveTo = useCallback(
    (target: HTMLElement | null) => {
      const container = containerRef.current;
      if (!container || !target) return;
      hoveringRef.current = true;
      apply(container, target);
    },
    [apply],
  );

  /** Send the pill back to the resting item. */
  const rest = useCallback(() => {
    hoveringRef.current = false;
    const container = containerRef.current;
    if (!container || restKey == null) return;
    const target = container.querySelector<HTMLElement>(
      `[${SLIDE_ITEM_ATTR}="${CSS.escape(restKey)}"]`,
    );
    if (target) apply(container, target);
  }, [apply, restKey]);

  /*
   * Re-assert the resting position after every render, so first paint, a route
   * change, a reflow and a list that grew all correct themselves without a
   * listener each. The `same` guard is what stops the update chain a
   * dependency-free effect would otherwise cause.
   */
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hoveringRef.current) return;
    rest();
  });

  useEffect(() => {
    const onResize = () => rest();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [rest]);

  return { setContainer, position, moveTo, rest };
}

function same(a: SlidePosition, b: SlidePosition): boolean {
  return (
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height &&
    a.opacity === b.opacity
  );
}
