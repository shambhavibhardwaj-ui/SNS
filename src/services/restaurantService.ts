/**
 * restaurantService — the only place the UI reads restaurant/district/cuisine data.
 *
 * Today it resolves the joins against the in-memory seed data in `src/data`.
 * When Supabase is connected, the bodies below become queries and these same
 * signatures stay put, so no component has to change. Keep every join in here:
 * components must never import `src/data` directly.
 *
 * NOTE: these are synchronous while the data is in-memory. Switching to Supabase
 * turns them into Promises — that is the one intentional seam in this layer.
 */
import { cuisines, districts, restaurantCuisines, restaurants } from '../data';
import type { Cuisine, District, ID, Restaurant } from '../data/types';

/** A district plus the aggregates the map needs. Never hard-code these in the UI. */
export interface DistrictSummary {
  district: District;
  restaurantCount: number;
  /** Rating of the best-rated restaurant in the district, or null when empty. */
  topRating: number | null;
  /** Headline cuisine names, resolved from cuisineIds. */
  cuisineNames: string[];
}

export function getDistricts(): District[] {
  return districts;
}

export function getDistrictBySlug(slug: string): District | undefined {
  return districts.find((d) => d.slug === slug);
}

export function getRestaurantsByDistrict(districtId: ID): Restaurant[] {
  return restaurants
    .filter((r) => r.districtId === districtId)
    .sort((a, b) => b.rating - a.rating);
}

export function getCuisinesForRestaurant(restaurantId: ID): Cuisine[] {
  const ids = restaurantCuisines
    .filter((rc) => rc.restaurantId === restaurantId)
    .map((rc) => rc.cuisineId);
  return cuisines.filter((c) => ids.includes(c.id));
}

export function getCuisineById(cuisineId: ID): Cuisine | undefined {
  return cuisines.find((c) => c.id === cuisineId);
}

export function getDistrictSummary(district: District): DistrictSummary {
  const inDistrict = getRestaurantsByDistrict(district.id);
  return {
    district,
    restaurantCount: inDistrict.length,
    topRating: inDistrict.length ? Math.max(...inDistrict.map((r) => r.rating)) : null,
    cuisineNames: district.cuisineIds
      .map((id) => getCuisineById(id)?.name)
      .filter((name): name is string => Boolean(name)),
  };
}

export function getDistrictSummaries(): DistrictSummary[] {
  return districts.map(getDistrictSummary);
}

/** Total across the city — shown on the landing page. */
export function getCityStats(): { restaurants: number; districts: number; cuisines: number } {
  return {
    restaurants: restaurants.length,
    districts: districts.length,
    cuisines: cuisines.length,
  };
}

/* ------------------------------------------------------- listing queries -- */

export type SortKey = 'recommended' | 'rating' | 'delivery' | 'price';

export interface ListingFilters {
  /** Free text over restaurant name, description, tags and cuisine names. */
  query?: string;
  /** Minimum star rating. */
  minRating?: number;
  /** Maximum delivery estimate, in minutes. */
  maxEta?: number;
  /** Restrict to these price bands. */
  priceRanges?: string[];
  /** Restrict to restaurants serving this cuisine. */
  cuisineId?: ID;
  /** Only pure-veg kitchens. */
  vegOnly?: boolean;
}

export function getDistrictById(districtId: ID): District | undefined {
  return districts.find((d) => d.id === districtId);
}

/** Every cuisine actually served by the restaurants of a district. */
export function getCuisinesInDistrict(districtId: ID): Cuisine[] {
  const ids = new Set(
    getRestaurantsByDistrict(districtId).flatMap((r) =>
      restaurantCuisines.filter((rc) => rc.restaurantId === r.id).map((rc) => rc.cuisineId),
    ),
  );
  return cuisines.filter((c) => ids.has(c.id));
}

function matchesQuery(restaurant: Restaurant, query: string): boolean {
  const haystack = [
    restaurant.name,
    restaurant.description,
    ...restaurant.tags,
    ...getCuisinesForRestaurant(restaurant.id).map((c) => c.name),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

/**
 * The listing page's single read. Filtering and sorting live here rather than in
 * the component so the same rules can move to a SQL WHERE/ORDER BY later.
 */
export function listRestaurants(
  districtId: ID,
  filters: ListingFilters = {},
  sort: SortKey = 'recommended',
): Restaurant[] {
  let rows = getRestaurantsByDistrict(districtId);

  if (filters.query) rows = rows.filter((r) => matchesQuery(r, filters.query as string));
  if (filters.minRating) rows = rows.filter((r) => r.rating >= (filters.minRating as number));
  if (filters.maxEta) rows = rows.filter((r) => r.etaMaxMinutes <= (filters.maxEta as number));
  if (filters.priceRanges?.length) {
    rows = rows.filter((r) => filters.priceRanges!.includes(r.priceRange));
  }
  if (filters.cuisineId) {
    const allowed = new Set(
      restaurantCuisines
        .filter((rc) => rc.cuisineId === filters.cuisineId)
        .map((rc) => rc.restaurantId),
    );
    rows = rows.filter((r) => allowed.has(r.id));
  }
  if (filters.vegOnly) rows = rows.filter((r) => r.isPureVeg);

  const sorted = [...rows];
  switch (sort) {
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'delivery':
      sorted.sort((a, b) => a.etaMinutes - b.etaMinutes);
      break;
    case 'price':
      sorted.sort((a, b) => a.priceForTwo - b.priceForTwo);
      break;
    case 'recommended':
    default:
      /* Open first, then rating weighted by how many people rated it. */
      sorted.sort((a, b) => {
        if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
        return b.rating * Math.log10(b.ratingCount) - a.rating * Math.log10(a.ratingCount);
      });
  }
  return sorted;
}
