import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  SLIDE_ITEM_ATTR,
  useSlideCursor,
  type SlidePosition,
} from '@/components/ui/use-slide-cursor';

/**
 * A pill that slides between items.
 *
 * Two things are exported: `SlideTabs`, the horizontal tab bar, and the
 * measuring parts behind it — `useSlideCursor` and `SlideCursor` — because the
 * sidebars need the same behaviour running vertically down a scrolling list.
 *
 */

/**
 * The pill itself. Its container must be positioned.
 *
 * A plain span with a CSS transition, not a `motion` component.
 * framer-motion was tried first and did not hold up here: it applied position
 * changes that came from an event handler, but silently ignored the ones that
 * came from an effect — which is every measurement the pill actually depends
 * on, including the first one and the one after a route change. The pill sat
 * at its initial zero size and only came to life when a pointer touched it.
 * Four transitioned properties do the same job with no library and no
 * behaviour that depends on where the state came from, and
 * `prefers-reduced-motion` is honoured by a media query rather than a hook.
 */
export function SlideCursor({
  position,
  className,
}: {
  position: SlidePosition;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('sl-cursor', className)}
      style={{
        transform: `translate3d(${position.left}px, ${position.top}px, 0)`,
        width: position.width,
        height: position.height,
        opacity: position.opacity,
      }}
    />
  );
}

/* ----------------------------------------------------------- slide tabs -- */

export interface SlideTabsProps {
  tabs: string[];
  /** Index of the initially selected tab. */
  defaultSelected?: number;
  onSelect?: (index: number, label: string) => void;
  className?: string;
}

/**
 * Horizontal tab bar with a sliding pill.
 *
 * Coloured from the brand tokens rather than the black-and-white original: a
 * teal pill on a cream track. The original leaned on `mix-blend-difference` to
 * keep the label readable as the pill passes under it, which only works for
 * pure black on pure white — with brand colours it produces muddy in-between
 * shades. The label colour is set explicitly on hover and selection instead.
 */
export function SlideTabs({
  tabs,
  defaultSelected = 0,
  onSelect,
  className,
}: SlideTabsProps) {
  const [selected, setSelected] = useState(defaultSelected);
  const { setContainer, position, moveTo, rest } = useSlideCursor(tabs[selected]);

  return (
    <ul ref={setContainer} onMouseLeave={rest} className={cn('sl-tabs', className)}>
      {tabs.map((tab, i) => (
        <li
          key={tab}
          className="sl-tab"
          data-on={i === selected || undefined}
          /* Names the tab for the pill to rest on. */
          {...{ [SLIDE_ITEM_ATTR]: tab }}
          /*
           * Measured from the event's own element. The original read
           * `ref.current` in this handler, but the parent passed a *callback*
           * ref, so `ref` was a function with no `.current` — the guard always
           * tripped and hover never moved the pill at all.
           */
          onMouseEnter={(e) => moveTo(e.currentTarget)}
          onClick={() => {
            setSelected(i);
            onSelect?.(i, tab);
          }}
        >
          <button type="button" tabIndex={-1} className="sl-tab-button">
            {tab}
          </button>
        </li>
      ))}

      <SlideCursor position={position} className="sl-tabs-cursor" />
    </ul>
  );
}
