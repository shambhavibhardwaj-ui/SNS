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
