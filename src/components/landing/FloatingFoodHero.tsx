import { cn } from '../../lib/utils';
import { Reveal } from './Reveal';

/**
 * A heading with food drifting around it.
 *
 * The six images are the reference component's own, **downloaded into
 * `public/food/` rather than hotlinked**. Same pictures either way, but a
 * `<img>` pointing at someone else's CDN makes a section of this page stop
 * working the day that host changes a path, and these are 12 KB to 444 KB of
 * PNG that belongs with the project it is part of.
 *
 * Their licence is recorded as outstanding in `src/assets/ATTRIBUTION.md`,
 * alongside the three video clips. That file used to say the project contained
 * no third-party art; it now says what it actually contains.
 *
 * Sizes and positions follow the original's Tailwind classes — three large
 * items at the corners, three small garnishes threaded between them and the
 * copy — expressed here as CSS because that is where this project keeps
 * layout.
 */

interface FloatingItem {
  src: string;
  alt: string;
  where: string;
}

const ITEMS: FloatingItem[] = [
  { src: '/food/burger.png', alt: 'A cheeseburger', where: 'is-burger' },
  { src: '/food/dumplings.png', alt: 'A bamboo steamer of dumplings', where: 'is-dumplings' },
  { src: '/food/pizza.png', alt: 'A slice of pizza', where: 'is-pizza' },
  { src: '/food/basil.png', alt: 'A basil leaf', where: 'is-basil' },
  { src: '/food/tomato.png', alt: 'A slice of tomato', where: 'is-tomato-a' },
  { src: '/food/tomato.png', alt: 'A slice of tomato', where: 'is-tomato-b' },
];

export function FloatingFoodHero({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <section className={cn('lp-float', className)}>
      <Swirls />

      {/* Decorative: the copy already says what the section is about, and six
          "a slice of tomato" announcements ahead of the heading would be noise
          rather than description. */}
      <div className="lp-float-items" aria-hidden="true">
        {ITEMS.map((item, i) => (
          <img
            key={item.where}
            className={cn('lp-float-img', item.where)}
            src={item.src}
            alt=""
            /* Below the fold, so the browser can defer them; dimensions are
               fixed in CSS, so there is no reflow when they arrive. */
            loading="lazy"
            decoding="async"
            /* Staggered, or six things rise and fall as one block. */
            style={{ animationDelay: `${i * 300}ms` }}
          />
        ))}
      </div>

      <Reveal className="lp-float-body">
        <h2>{title}</h2>
        <p>{description}</p>
      </Reveal>
    </section>
  );
}

/**
 * The two background curves.
 *
 * Written out rather than pasted, which is what lets them take this project's
 * tint instead of arriving with Tailwind's pink scale and a dark-mode variant
 * the project does not use.
 */
function Swirls() {
  return (
    <div className="lp-float-swirls" aria-hidden="true">
      <svg viewBox="0 0 600 600" fill="none">
        <path
          d="M515 181C378 52 129 136 51 294c-78 157 75 306 75 306"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <svg viewBox="0 0 700 700" fill="none">
        <path
          d="M27 528C194 690 480 637 594 452 709 267 544 2 544 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
