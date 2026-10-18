import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Reveal-on-scroll, with no animation library.
 *
 * An IntersectionObserver and a class is the whole mechanism. Pulling in a
 * scroll-animation dependency for this would add a second opinion about
 * easing, transforms and reduced motion to a project that already has one, and
 * `prefers-reduced-motion` is handled in CSS where the rest of the project
 * handles it.
 *
 * Unobserves after the first reveal: a section that re-hides when you scroll
 * back up reads as a glitch, not as a flourish.
 */
export function Reveal({
  children, delay = 0, as: Tag = 'div', className,
}: {
  children: ReactNode;
  /** Milliseconds, for staggering siblings. */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /*
     * A safety net, because invisible content is the worse failure.
     *
     * The reveal starts at `opacity: 0`, so anything that stops the observer
     * from ever reporting leaves a whole section permanently blank rather than
     * merely un-animated. That is not hypothetical: an embedding context that
     * reports itself hidden gets no intersection callbacks at all, which is how
     * the desktop app's browser pane behaves, and the "Discover SNS" section
     * rendered as an empty teal band because of it.
     *
     * So the timer reveals regardless after a beat. The observer still wins
     * when it works, which is almost always — this only decides what happens
     * when it does not.
     */
    const fallback = window.setTimeout(() => setShown(true), 1200);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
          window.clearTimeout(fallback);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={['lp-reveal', className].filter(Boolean).join(' ')}
      data-shown={shown || undefined}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
