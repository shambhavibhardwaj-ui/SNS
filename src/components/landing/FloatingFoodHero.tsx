import { cn } from '../../lib/utils';
import { FoodPlate } from '../ui/FoodPlate';
import { Reveal } from './Reveal';

/**
 * A heading with dishes drifting around it.
 *
 * Adapted from a shadcn-shaped component that floated six photographs pulled
 * from a third-party CDN. The photographs are the part that could not come
 * with it: their licence is unstated, `ATTRIBUTION.md` records that this
 * project carries no third-party art, and hotlinking someone else's asset host
 * makes a section of the page depend on a server nobody here controls. The
 * project's own `FoodPlate` drawings do the same job — they are overhead
 * dishes, which is exactly what was floating — and they are already keyed per
 * cuisine, so these are the real districts' food rather than generic stock.
 *
 * The component keeps the original's shape: decorative swirls behind, absolute
 * items around the edges, centred copy on top, and a per-item animation delay
 * so they do not bob in unison.
 */

interface FloatingDish {
  /** A `FoodPlate` preset key. */
  dish: string;
  label: string;
  /** Position and size. Kept as a class so the layout stays in the stylesheet. */
  where: string;
}

const DISHES: FloatingDish[] = [
  { dish: 'biryani', label: 'Biryani from Tandoor Quarter', where: 'is-tl' },
  { dish: 'dosa', label: 'A dosa from Tiffin Lane', where: 'is-tr' },
  { dish: 'pizza', label: 'Pizza from Italian Street', where: 'is-br' },
  { dish: 'gelato', label: 'Gelato from Dessert Lane', where: 'is-bl' },
  { dish: 'salad', label: 'A bowl from Green Table', where: 'is-mid-l' },
  { dish: 'seafood', label: 'Seafood from Harbour Point', where: 'is-mid-r' },
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

      <div className="lp-float-items" aria-hidden="true">
        {DISHES.map((d, i) => (
          <span
            key={d.dish}
            className={cn('lp-float-dish', d.where)}
            /* Staggered so six dishes do not rise and fall as one block. */
            style={{ animationDelay: `${i * 300}ms` }}
          >
            <FoodPlate image={d.dish} />
          </span>
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
 * Drawn here rather than copied: they are two strokes, and writing them means
 * they can take the project's own tints instead of arriving with Tailwind's
 * pink scale and a dark-mode variant this project does not use.
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
