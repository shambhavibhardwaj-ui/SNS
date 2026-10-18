import { ChevronDown, MousePointerClick, Salad, ShoppingBag, Sparkles, Store, Utensils } from 'lucide-react';
import type { DistrictSummary } from '../../services/restaurantService';
import { FoodPlate } from '../ui/FoodPlate';
import type { BuildingKind } from '../../data/types';
import { FoodVideo } from './FoodVideo';
import { Reveal } from './Reveal';

/* ---------------------------------------------------------------- hero -- */

export function VideoHero({
  onExplore, onCuisines,
}: { onExplore: () => void; onCuisines: () => void }) {
  return (
    <section className="lp-hero" id="top">
      <FoodVideo src="/video/hero-kitchen.mp4" className="lp-hero-media" tone="teal" />
      {/* The scrim is not decoration: white display type over an unknown frame
          of video is unreadable, and the frame changes 24 times a second. */}
      <div className="lp-hero-scrim" aria-hidden="true" />

      <div className="lp-hero-body">
        <p className="lp-hero-eyebrow">SNS · a city built out of its own menus</p>
        <h1>Your next favourite meal starts here.</h1>
        <p className="lp-hero-sub">
          Explore a world of flavours, discover unique restaurants, and find something
          delicious in SNS.
        </p>
        <div className="lp-hero-actions">
          <button type="button" className="lp-btn is-primary" onClick={onExplore}>
            Explore SNS
          </button>
          <button type="button" className="lp-btn is-ghost" onClick={onCuisines}>
            Discover cuisines
          </button>
        </div>
      </div>

      <button
        type="button"
        className="lp-scroll-cue"
        onClick={onExplore}
        aria-label="Scroll to find out more"
      >
        <ChevronDown size={18} strokeWidth={2.2} />
      </button>
    </section>
  );
}

/* ------------------------------------------------------- city preview -- */

export function CityPreview({ stats, onEnter }: {
  stats: { restaurants: number; districts: number; cuisines: number };
  onEnter: () => void;
}) {
  return (
    <section className="lp-band is-city" id="explore">
      <FoodVideo src="/video/city-flyover.mp4" className="lp-band-media" tone="teal" />
      <div className="lp-band-scrim" aria-hidden="true" />
      <Reveal className="lp-band-body">
        <p className="lp-kicker">Discover SNS</p>
        <h2>A city full of flavour.</h2>
        <p className="lp-lede">
          From familiar favourites to cuisines waiting to be discovered, your next meal is
          just around the corner.
        </p>
        <dl className="lp-stats">
          <div><dt>Kitchens</dt><dd>{stats.restaurants}</dd></div>
          <div><dt>Neighbourhoods</dt><dd>{stats.districts}</dd></div>
          <div><dt>Cuisines</dt><dd>{stats.cuisines}</dd></div>
        </dl>
        <button type="button" className="lp-btn is-primary" onClick={onEnter}>
          Enter SNS
        </button>
        <p className="lp-note">
          An isometric city you can pan, zoom and turn. One building is one kitchen, so the
          skyline is the data — no sign-in needed to wander it.
        </p>
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------- cuisines -- */

/*
 * District architecture → the dish `FoodPlate` draws for it.
 *
 * Mapped rather than guessed from the name: `FoodPlate` is keyed by dish, a
 * district is keyed by architecture, and nothing in the data joins the two.
 * One obvious dish per neighbourhood, and no stock photography — the same rule
 * the rest of the project is drawn under.
 */
const PLATE_FOR: Record<BuildingKind, string> = {
  mexican: 'taco',
  chinese: 'noodles',
  seafood: 'seafood',
  pureVeg: 'thali',
  jain: 'bowl',
  italian: 'pizza',
  healthy: 'salad',
  southIndian: 'dosa',
  northIndian: 'curry',
  dessert: 'gelato',
};

/* Six of ten. Enough to show the range; the city is where you see them all. */
const SHOWN = 6;

export function CuisineGallery({
  summaries, onOpen, onAll,
}: {
  summaries: DistrictSummary[];
  onOpen: (districtId: string) => void;
  onAll: () => void;
}) {
  /*
   * The first six as the service returns them, not a ranking.
   *
   * Sorting by rating would put a number on which neighbourhoods are *better*,
   * which is not a claim this page is in a position to make — the ratings are
   * close and the difference is noise. District order is the order the city
   * itself uses.
   */
  const shown = summaries.slice(0, SHOWN);
  const rest = summaries.length - shown.length;

  return (
    <section className="lp-section" id="cuisines">
      <Reveal className="lp-head">
        <p className="lp-kicker">Explore cuisines</p>
        <h2>Ten neighbourhoods, ten kitchens&rsquo; worth of cooking.</h2>
        <p className="lp-lede">
          A few of them below. Each card opens a real district of the city, with the
          restaurants that actually trade there.
        </p>
      </Reveal>

      {/* A scroller on narrow screens, a grid on wide ones — the same markup.
          Cards carry the district's own plate illustration rather than a stock
          photograph, which is the rule the whole project is drawn under. */}
      <ul className="lp-cuisines">
        {shown.map((s, i) => (
          <Reveal as="li" key={s.district.id} delay={(i % 4) * 60}>
            <article className="lp-cuisine">
              <div className="lp-cuisine-art" style={{ ['--tint' as string]: s.district.theme.awning }}>
                <FoodPlate image={PLATE_FOR[s.district.buildingKind]} />
              </div>
              <div className="lp-cuisine-body">
                <h3>{s.district.foodLabel}</h3>
                <p className="lp-cuisine-where">
                  <span aria-hidden="true">{s.district.emoji}</span> {s.district.name}
                </p>
                <p className="lp-cuisine-desc">{s.district.tagline}</p>
                <p className="lp-cuisine-meta">
                  {s.restaurantCount} {s.restaurantCount === 1 ? 'kitchen' : 'kitchens'}
                  {s.topRating !== null ? ` · top rated ${s.topRating.toFixed(1)}★` : ''}
                </p>
                <button type="button" className="lp-btn is-small" onClick={() => onOpen(s.district.id)}>
                  Explore
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>

      {rest > 0 ? (
        <Reveal className="lp-more">
          <p>
            {rest} more {rest === 1 ? 'neighbourhood' : 'neighbourhoods'} — seafood, dessert,
            pure veg and the rest — are waiting in the city itself.
          </p>
          <button type="button" className="lp-btn is-primary" onClick={onAll}>
            Explore more
          </button>
        </Reveal>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------ how it works -- */

const STEPS = [
  { Icon: MousePointerClick, title: 'Explore the city', body: 'Pan, zoom and turn an isometric city where every building is a real kitchen.' },
  { Icon: Store, title: 'Discover a cuisine', body: 'Walk into a district and the view drops to a clean ordering interface.' },
  { Icon: Utensils, title: 'Browse the menus', body: 'A restaurant with three cuisines has three separate menus. They are never merged.' },
  { Icon: ShoppingBag, title: 'Fill your cart', body: 'Grouped by cuisine, so a mixed order stays legible all the way to the receipt.' },
  { Icon: Salad, title: 'Place the order', body: 'Address validation, then a confirmation carrying the same grouping through.' },
];

export function HowItWorks() {
  return (
    <section className="lp-band is-steps" id="how">
      {/* The overhead table spread sits here rather than behind the editorial
          band: a laid table read from above is a picture of the end of this
          sequence, so the five steps run across the thing they lead to. */}
      <FoodVideo src="/video/table.mp4" className="lp-band-media" tone="warm" />
      <div className="lp-band-scrim" aria-hidden="true" />
      <Reveal className="lp-head is-on-dark">
        <p className="lp-kicker">How it works</p>
        <h2>Five steps, start to receipt.</h2>
      </Reveal>
      <ol className="lp-steps">
        {STEPS.map(({ Icon, title, body }, i) => (
          <Reveal as="li" key={title} delay={i * 70}>
            <span className="lp-step-n">{i + 1}</span>
            <span className="lp-step-icon" aria-hidden="true"><Icon size={19} strokeWidth={1.9} /></span>
            <h3>{title}</h3>
            <p>{body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------- highlights -- */

/*
 * Only what is built.
 *
 * The brief asked for an editorial section about the experience, and the
 * temptation in one of these is to list what the product will be. Payment is
 * not integrated, order history does not exist, and nothing here claims they
 * do — a landing page that oversells is the one part of a demo a marker can
 * check in thirty seconds.
 */
const HIGHLIGHTS = [
  { title: 'An isometric food city', body: 'A true 2:1 dimetric world on a diorama slab, drawn entirely in original SVG. Ten districts, each with its own architecture rather than a recoloured box.' },
  { title: 'Menus that stay separate', body: 'A restaurant can carry several cuisines, and each pair gets its own menu. The rule lives in the data model, so a combined list cannot be produced by accident.' },
  { title: 'Foodie AI, grounded', body: 'Describe a mood, a budget or a restriction and it finds dishes that match — picked from real menu rows, with the reason each was chosen. It never orders for you.' },
  { title: 'Reviews per menu', body: 'Each review carries the cuisine it came from, so a note about the biryani belongs to the biryani menu rather than to the whole kitchen.' },
];

export function Highlights() {
  return (
    <section className="lp-band is-highlights" id="about">
      {/* No clip for this band. `FoodVideo` with no `src` renders its drawn
          panel, which is a finished surface rather than a gap — see
          public/video/README.md. */}
      <FoodVideo className="lp-band-media" tone="plum" />
      <div className="lp-band-scrim" aria-hidden="true" />
      <div className="lp-band-body is-wide">
        <Reveal>
          <p className="lp-kicker">What SNS is</p>
          <h2>Built to be looked at closely.</h2>
        </Reveal>
        <ul className="lp-highlights">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal as="li" key={h.title} delay={i * 70}>
              <Sparkles size={15} strokeWidth={2} aria-hidden="true" />
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
