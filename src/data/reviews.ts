/**
 * Customer reviews, one per rated order.
 *
 * table: reviews — the same grain as `data/admin/platform.ts`'s `ratedOrders`,
 * because both answer questions about *orders*: RULE-01 counts the ones below
 * three stars and RULE-02 the ones above four. A per-restaurant average cannot
 * answer either, and a review that is not attached to an order is a review
 * nobody can check.
 *
 * Reviews carry the cuisine they came from. A restaurant runs several menus
 * and they are never merged, so "the biryani was cold" belongs to the biryani
 * menu rather than to the kitchen in general — the same reading the admin's
 * per-menu rule view is built on.
 *
 * Generated deterministically from a seeded PRNG, like the analytics series,
 * for the same reason: `Math.random()` would hand a restaurant different
 * reviews on every render, so the page would disagree with itself between one
 * scroll and the next.
 *
 * What it does NOT do is move the restaurant's headline rating. Each kitchen
 * has a stored `rating` over hundreds of orders; these are the handful most
 * recently written. Recomputing an average from four rows would put a number
 * on screen that contradicts the one above it.
 */
import { restaurants, restaurantCuisines } from './restaurants';
import type { ID } from './types';

export interface Review {
  id: ID;
  restaurantId: ID;
  /** Which of the restaurant's menus this order came from. */
  cuisineId: ID;
  author: string;
  /** 1–5, as given. */
  rating: number;
  text: string;
  /** ISO date. */
  at: string;
  /** A review left by an account that actually placed the order. */
  verifiedOrder: boolean;
}

/* Deterministic noise. Same seed, same reviews, every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AUTHORS = [
  'Aarav Mehta', 'Sana Qureshi', 'Dev Patel', 'Leah Fernandes', 'Rohit Nair',
  'Ishita Rao', 'Kabir Shah', 'Meera Pillai', 'Tanvir Ahmed', 'Nikhil Varma',
  'Priya Menon', 'Zoya Khan', 'Arjun Kulkarni', 'Devika Nair', 'Harpreet Singh',
];

/**
 * What people actually write, by how many stars they gave.
 *
 * Banded rather than one pool, so a five-star review never reads like a
 * complaint. `{cuisine}` is filled with the menu the order came from, which is
 * what stops four reviews of one restaurant sounding like the same sentence.
 */
const LINES: Record<'high' | 'mid' | 'low', string[]> = {
  high: [
    'The {cuisine} was still hot when it got here. Packed properly, nothing leaked.',
    'Ordered the {cuisine} on a whim and it was the best thing I have eaten this month.',
    'Portions are honest and the {cuisine} tastes like someone cared. Ordering again.',
    'Arrived ten minutes before the estimate. The {cuisine} travelled really well.',
    'Been ordering the {cuisine} here for a year. It has never once been off.',
  ],
  mid: [
    'Good {cuisine}, though it had steamed over a little on the way.',
    'Tasty, slightly over-salted. The {cuisine} portion is generous for the price.',
    'Solid {cuisine}. Delivery was about fifteen minutes late on a Friday.',
    'The {cuisine} was fine. The sides were the better part of the order.',
    'No complaints about the {cuisine}, but the packaging could be sturdier.',
  ],
  /*
   * One and two stars. Reachable, but rare by construction: no restaurant in
   * `data/restaurants` is rated below 3.9, so a review this harsh needs a
   * drift near the bottom of its range and the band is mostly unused today.
   * Kept because it fires the moment a lower-rated kitchen is seeded, and
   * because a review set that *cannot* go below three is not feedback.
   *
   * Worth knowing: the admin side has Maíz y Humo tripping RULE-01 on six
   * orders below three stars, and that count lives in `data/admin/platform.ts`
   * rather than here. The two datasets describe the same kitchens and do not
   * yet share rows.
   */
  low: [
    'The {cuisine} arrived cold and the order was missing an item.',
    'Not what I remember. The {cuisine} was dry and under-seasoned.',
    'Forty minutes past the estimate and the {cuisine} had gone soft.',
    'Charged for a dish that never turned up. The {cuisine} itself was average.',
  ],
};

const DAY = 86_400_000;
/** Reviews are dated backwards from here, for the same reason MOCK_TODAY exists. */
const REVIEWS_FROM = new Date('2026-09-25T12:00:00Z');

/** Stable per-id seed, so one restaurant's reviews never shift. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const rows: Review[] = [];

for (const restaurant of restaurants) {
  const rand = mulberry32(hash(restaurant.id));
  const menus = restaurantCuisines
    .filter((rc) => rc.restaurantId === restaurant.id)
    .map((rc) => rc.cuisineId);
  if (!menus.length) continue;

  /* Three to five. Enough to read a room, few enough to actually read. */
  const count = 3 + Math.floor(rand() * 3);

  /*
   * Authors and sentences are drawn without replacement.
   *
   * Drawn independently, one restaurant showed the same name twice and the
   * same opening line twice in four cards — which is the tell that the whole
   * section is generated, and undoes the point of having it.
   */
  const namesLeft = [...AUTHORS];
  const linesLeft: Record<string, string[]> = {
    high: [...LINES.high],
    mid: [...LINES.mid],
    low: [...LINES.low],
  };
  const take = (pool: string[]): string => {
    if (!pool.length) return '';
    return pool.splice(Math.floor(rand() * pool.length), 1)[0];
  };

  for (let i = 0; i < count; i += 1) {
    /*
     * Ratings cluster around the restaurant's own standing rather than being
     * drawn flat: a 4.7 kitchen with a one-star review in every four would
     * make the headline figure look invented.
     *
     * The spread is ±1.6 and not ±0.8. At ±0.8 the whole platform produced one
     * three-star review in a hundred and thirty, no one- or two-stars at all,
     * and a 3.9 kitchen whose page was pure praise — which is both unreadable
     * as feedback and inconsistent with the admin, where that same kitchen is
     * the one tripping RULE-01. This file is meant to include the cases that
     * fail, like every other seed here.
     */
    const drift = (rand() - 0.5) * 3.2;
    const rating = Math.max(1, Math.min(5, Math.round(restaurant.rating + drift)));
    const band = rating >= 4 ? 'high' : rating === 3 ? 'mid' : 'low';

    const cuisineId = menus[Math.floor(rand() * menus.length)];
    const daysAgo = 1 + Math.floor(rand() * 45);
    const text = take(linesLeft[band]);
    /* A band can run dry before the count does; a repeated sentence is worse
       than one fewer review. */
    if (!text) continue;

    rows.push({
      id: `rev-${restaurant.id}-${i}`,
      restaurantId: restaurant.id,
      cuisineId,
      author: take(namesLeft),
      rating,
      text,
      at: new Date(REVIEWS_FROM.getTime() - daysAgo * DAY).toISOString().slice(0, 10),
      /* Most reviews follow a real order; a few do not, and the badge is only
         worth showing if it is sometimes absent. */
      verifiedOrder: rand() > 0.18,
    });
  }
}

export const reviews: Review[] = rows;
