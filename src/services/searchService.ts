/**
 * Platform search — the top bar.
 *
 * It searches the rows, not an index of labels. Every result carries the id of
 * a real `Restaurant`, `MenuItem` or `District`, so the list cannot offer
 * something the city has no way to open — the same rule as Foodie AI, for the
 * same reason: a search result that goes nowhere is worse than no result.
 *
 * Three kinds, because those are the three things the city can actually show.
 *
 * A **cuisine** is not one of them, even though people type "pizza" and
 * "italian". A cuisine has no page: `restaurantCuisines` is many-to-many, so
 * "Italian" is not a place. A cuisine match therefore resolves to the
 * districts that sell it, through the `cuisineIds` FK already on the district
 * row, and the result says which cuisine matched. Inventing a cuisine route to
 * make the search tidy would add a screen nobody designed.
 *
 * Ranking is by how the match landed — whole label, then word start, then
 * anywhere inside — and then by rating for restaurants, which is the only
 * quality signal in the data. Nothing here scores on relevance it cannot
 * explain.
 */
import { cuisines } from '../data/cuisines';
import { districts } from '../data/districts';
import { menuItems, menus } from '../data/menus';
import { restaurants } from '../data/restaurants';
import type { ID } from '../data/types';

export type SearchResultKind = 'restaurant' | 'dish' | 'district';

export interface SearchResult {
  kind: SearchResultKind;
  /** Stable across keystrokes, so React keys do not churn the list. */
  key: string;
  /** What matched, as the person will read it. */
  label: string;
  /** Where it is, or what it belongs to. */
  sub: string;
  /** Right-aligned: a price, a rating. Absent when there is nothing honest. */
  meta?: string;
  /** Set for `restaurant` and `dish` — the menu page to open. */
  restaurantId?: ID;
  /** Set for `district` — the listing to enter. */
  districtId?: ID;
  /** Internal: higher wins. */
  rank: number;
}

/** Tightest match first: whole string, then a word start, then anywhere. */
function matchStrength(haystack: string, needle: string): number {
  const h = haystack.toLowerCase();
  if (h === needle) return 3;
  /* Word start rather than string start: "tiffin" should find
     "Anna's Tiffin Room", which no prefix test would. */
  if (new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(h)) return 2;
  if (h.includes(needle)) return 1;
  return 0;
}

const MENU_RESTAURANT = new Map<ID, ID>(menus.map((m) => [m.id, m.restaurantId]));
const MENU_CUISINE = new Map<ID, ID>(menus.map((m) => [m.id, m.cuisineId]));
const CUISINE_NAME = new Map<ID, string>(cuisines.map((c) => [c.id, c.name]));
const DISTRICT_NAME = new Map<ID, string>(districts.map((d) => [d.id, d.name]));

/**
 * Up to `limit` results for `query`.
 *
 * Returns nothing for a query under two characters: one letter matches most of
 * the menu and the list would be noise rather than an answer.
 */
export function search(query: string, limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const out: SearchResult[] = [];

  /* -- restaurants: name, tags and the description line -- */
  for (const r of restaurants) {
    const strength = Math.max(
      matchStrength(r.name, q) * 3,
      ...r.tags.map((t) => matchStrength(t, q) * 2),
      matchStrength(r.description, q),
    );
    if (!strength) continue;
    out.push({
      kind: 'restaurant',
      key: `r:${r.id}`,
      label: r.name,
      sub: `${DISTRICT_NAME.get(r.districtId) ?? 'The city'}${r.isOpen ? '' : ' · closed now'}`,
      meta: `${r.rating.toFixed(1)}★`,
      restaurantId: r.id,
      /* Rating breaks ties within a strength band and cannot cross one. */
      rank: strength * 10 + r.rating,
    });
  }

  /* -- dishes: one result per menu row, so it names the kitchen that cooks it -- */
  for (const item of menuItems) {
    const strength = Math.max(matchStrength(item.name, q) * 2, matchStrength(item.category, q));
    if (!strength) continue;
    const restaurantId = MENU_RESTAURANT.get(item.menuId);
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) continue;
    const cuisineId = MENU_CUISINE.get(item.menuId);
    out.push({
      kind: 'dish',
      key: `i:${item.id}`,
      label: item.name,
      sub: `${restaurant.name} · ${CUISINE_NAME.get(cuisineId ?? '') ?? 'Menu'}`,
      meta: `₹${item.price}`,
      restaurantId: restaurant.id,
      rank: strength * 10 + restaurant.rating,
    });
  }

  /* -- districts: their own name, and the cuisines they sell -- */
  for (const d of districts) {
    const byName = Math.max(matchStrength(d.name, q) * 2, matchStrength(d.foodLabel, q) * 2);
    const cuisineHit = d.cuisineIds
      .map((id) => ({ name: CUISINE_NAME.get(id) ?? '', s: matchStrength(CUISINE_NAME.get(id) ?? '', q) }))
      .filter((c) => c.s > 0)
      .sort((a, b) => b.s - a.s)[0];
    const strength = Math.max(byName, cuisineHit ? cuisineHit.s * 2 : 0);
    if (!strength) continue;
    out.push({
      kind: 'district',
      key: `d:${d.id}`,
      label: d.name,
      /* Says why it is here when the district name was not what matched. */
      sub: byName >= strength ? d.foodLabel : `${cuisineHit!.name} is sold here`,
      districtId: d.id,
      rank: strength * 10,
    });
  }

  return out.sort((a, b) => b.rank - a.rank || a.label.localeCompare(b.label)).slice(0, limit);
}

/** Shown before anyone types. Real rows, so none of them is a dead end. */
export const SEARCH_EXAMPLES = ['biryani', 'tandoor', 'pizza', 'dosa'];
