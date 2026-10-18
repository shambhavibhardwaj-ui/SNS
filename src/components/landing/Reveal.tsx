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
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    io.observe(node);
    return () => io.disconnect();
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
