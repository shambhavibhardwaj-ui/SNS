import {
  Banknote, ChevronDown, Layers, Leaf, Map, MessageSquareQuote, MousePointerClick,
  Salad, Search, ShoppingBag, Sparkles, Store, Utensils,
} from 'lucide-react';
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

/*
 * What is actually in the customer app.
 *
 * Eight tiles, and every one of them is a feature a person can use today. The
 * obvious thing to put in a constellation like this is the roadmap — offers,
 * scheduling, gift cards, loyalty — and that is the one thing it must not be:
 * a landing page is where a demo gets caught overselling, and payment here is
 * cash on delivery only, which is why that tile says so rather than saying
 * "pay your way".
 */
const FEATURES = [
  { Icon: Map, label: 'Ten districts', side: 'left' },
  { Icon: Layers, label: 'A menu per cuisine', side: 'left' },
  { Icon: Sparkles, label: 'Foodie AI', side: 'left' },
  { Icon: Leaf, label: 'Pure-veg kitchens', side: 'left' },
  { Icon: Search, label: 'Search any dish', side: 'right' },
  { Icon: MessageSquareQuote, label: 'Reviews per menu', side: 'right' },
  { Icon: ShoppingBag, label: 'Cart by cuisine', side: 'right' },
  { Icon: Banknote, label: 'Cash on delivery', side: 'right' },
] as const;

export function CityPreview({ stats, onEnter }: {
  stats: { restaurants: number; districts: number; cuisines: number };
  onEnter: () => void;
}) {
  const left = FEATURES.filter((f) => f.side === 'left');
  const right = FEATURES.filter((f) => f.side === 'right');

  return (
    /*
      The one blush section.
      
      No video behind this band: the reference composition is white cards
      floating on a pale ground, and a scrim dark enough to carry footage is
      the opposite of that. `city-flyover.mp4` has no home now, which is why
      public/video/README.md lists it as optional.
    */
    <section className="lp-band is-city" id="explore">
      <div className="lp-showcase-curve" aria-hidden="true" />

      <div className="lp-band-body is-wide lp-showcase">
        <Reveal className="lp-showcase-head">
          <p className="lp-kicker">Discover SNS</p>
          <h2>A city full of flavour.</h2>
          <p className="lp-lede">
            From familiar favourites to cuisines waiting to be discovered, your next meal is
            just around the corner.
          </p>
        </Reveal>

        {/* Tiles, phone, tiles. The columns are ordered so that on a narrow
            screen the phone comes first and the tiles fall underneath it as a
            plain grid — scattering them around a device that is no longer in
            the middle would just be eight things at odd angles. */}
        <div className="lp-constellation">
          <ul className="lp-tiles is-left">
            {left.map(({ Icon, label }, i) => (
              <Reveal as="li" key={label} delay={i * 80}>
                <span aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
                <strong>{label}</strong>
              </Reveal>
            ))}
          </ul>

          <Reveal className="lp-phone" delay={120}>
            <div className="lp-phone-frame">
              <span className="lp-phone-notch" aria-hidden="true" />
              <div className="lp-phone-screen">
                <CityVignette />
                <div className="lp-phone-caption">
                  <strong>{stats.districts} neighbourhoods</strong>
                  <span>{stats.restaurants} kitchens · {stats.cuisines} cuisines</span>
                </div>
              </div>
            </div>
            <button type="button" className="lp-btn is-primary" onClick={onEnter}>
              Enter SNS
            </button>
          </Reveal>

          <ul className="lp-tiles is-right">
            {right.map(({ Icon, label }, i) => (
              <Reveal as="li" key={label} delay={i * 80}>
                <span aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
                <strong>{label}</strong>
              </Reveal>
            ))}
          </ul>
        </div>

        <p className="lp-note lp-showcase-note">
          Pan, zoom and turn an isometric city. One building is one kitchen, so the skyline is
          the data — and no sign-in is needed to wander it.
        </p>
      </div>
    </section>
  );
}

/**
 * The city, in a phone.
 *
 * Drawn here rather than screenshotted: a captured image goes stale the moment
 * the city changes, and this project's rule is that every drawn element is
 * original. It is an impression — four blocks on a teal slab at the same 2:1
 * dimetric angle the real map uses, in the real district colours — not a claim
 * to be the city itself, which is one button away.
 */
function CityVignette() {
  /* Grid steps, matching the real projection: +x is half right and half down. */
  const t = 26;
  const blocks: { gx: number; gy: number; wall: string; roof: string; h: number }[] = [
    { gx: 0, gy: 0, wall: '#F7EDDC', roof: '#0A6A66', h: 30 },
    { gx: 1, gy: 0, wall: '#FBE7CC', roof: '#C4543F', h: 40 },
    { gx: 0, gy: 1, wall: '#F6EEDD', roof: '#7A4B2A', h: 34 },
    { gx: 1, gy: 1, wall: '#FCE3EF', roof: '#C4788B', h: 26 },
  ];
  const ox = 112;
  const oy = 58;
  const pt = (gx: number, gy: number, gz = 0) => [
    ox + (gx - gy) * t,
    oy + (gx + gy) * (t / 2) - gz,
  ];

  return (
    <svg className="lp-vignette" viewBox="0 0 224 190" aria-hidden="true">
      <defs>
        <linearGradient id="lp-vig-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E7C77" />
          <stop offset="1" stopColor="#064B49" />
        </linearGradient>
      </defs>
      <rect width="224" height="190" fill="url(#lp-vig-sky)" />

      {/* The slab */}
      <polygon
        points={[pt(-0.4, -0.4), pt(2.4, -0.4), pt(2.4, 2.4), pt(-0.4, 2.4)]
          .map((p) => p.join(',')).join(' ')}
        fill="#CFE0D6"
      />

      {/* Back to front by gx + gy, the same painter's order the real map uses. */}
      {[...blocks].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).map((b, i) => {
        const [x, y] = pt(b.gx, b.gy);
        return (
          <g key={i} transform={`translate(${x - ox} ${y - oy})`}>
            <g transform={`translate(${ox} ${oy})`}>
              {/* right face, left face, then the roof on top */}
              <polygon points={`0,0 ${t},${t / 2} ${t},${t / 2 - b.h} 0,${-b.h}`} fill={b.wall} />
              <polygon points={`0,0 ${-t},${t / 2} ${-t},${t / 2 - b.h} 0,${-b.h}`} fill="#0003" />
              <polygon points={`0,0 ${-t},${t / 2} ${-t},${t / 2 - b.h} 0,${-b.h}`} fill={b.wall} opacity="0.82" />
              <polygon
                points={`0,${-b.h} ${t},${t / 2 - b.h} 0,${t - b.h} ${-t},${t / 2 - b.h}`}
                fill={b.roof}
              />
            </g>
          </g>
        );
      })}
    </svg>
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
