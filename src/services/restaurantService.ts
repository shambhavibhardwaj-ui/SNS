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
import { cuisines, districts, menuItems, menus, restaurantCuisines, restaurants } from '../data';
import { reviews } from '../data/reviews';
import type { Cuisine, District, ID, MenuItem, Restaurant } from '../data/types';

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


/* ------------------------------------------------------------------ menus -- */

/**
 * One cuisine's menu at one restaurant, grouped into the sections it prints in.
 *
 * The page receives an array of these — never a flattened list of every item
 * the restaurant sells. That is the brief's core rule ("do NOT combine all
 * cuisines into one menu") expressed in the return type, so a component cannot
 * merge them without deliberately going out of its way.
 */
export interface MenuSection {
  category: string;
  items: MenuItem[];
}

export interface CuisineMenu {
  menuId: ID;
  cuisine: Cuisine;
  sections: MenuSection[];
  itemCount: number;
  /** Cheapest item, for the "from ₹x" line on the tab. */
  fromPrice: number;
  /** True when nothing on this menu contains meat or fish. */
  isAllVeg: boolean;
}

export function getRestaurantById(restaurantId: ID): Restaurant | undefined {
  return restaurants.find((r) => r.id === restaurantId);
}

/**
 * Every menu a restaurant offers, one per cuisine, in the order the cuisines
 * are listed against it.
 *
 * Sections come out in first-appearance order rather than alphabetically:
 * a menu reads starters, mains, breads, not "Breads, Main Course, Starters".
 */
export function getMenusForRestaurant(restaurantId: ID): CuisineMenu[] {
  return menus
    .filter((m) => m.restaurantId === restaurantId)
    .map((menu) => {
      const cuisine = cuisines.find((c) => c.id === menu.cuisineId);
      if (!cuisine) return null;

      const items = menuItems.filter((i) => i.menuId === menu.id);
      const order: string[] = [];
      const grouped = new Map<string, MenuItem[]>();
      for (const item of items) {
        if (!grouped.has(item.category)) {
          grouped.set(item.category, []);
          order.push(item.category);
        }
        grouped.get(item.category)!.push(item);
      }

      return {
        menuId: menu.id,
        cuisine,
        sections: order.map((category) => ({ category, items: grouped.get(category)! })),
        itemCount: items.length,
        fromPrice: items.reduce((min, i) => Math.min(min, i.price), Infinity),
        isAllVeg: items.every((i) => i.isVeg),
      } satisfies CuisineMenu;
    })
    .filter((m): m is CuisineMenu => m !== null);
}

/** Single item lookup — the cart stores ids and rehydrates through this. */
export function getMenuItemById(menuItemId: ID): MenuItem | undefined {
  return menuItems.find((i) => i.id === menuItemId);
}

/** Which cuisine an item came from, for the cart's per-menu grouping. */
export function getCuisineForMenuItem(menuItemId: ID): Cuisine | undefined {
  const item = menuItems.find((i) => i.id === menuItemId);
  if (!item) return undefined;
  const menu = menus.find((m) => m.id === item.menuId);
  return menu ? cuisines.find((c) => c.id === menu.cuisineId) : undefined;
}

/* ------------------------------------------------------------- reviews -- */

export interface RestaurantReview {
  id: ID;
  author: string;
  rating: number;
  text: string;
  at: string;
  verifiedOrder: boolean;
  /** The menu the order came from — reviews belong to a menu, not a kitchen. */
  cuisineName: string;
}

export interface ReviewSummary {
  /** The restaurant's stored rating, over every order it has ever taken. */
  rating: number;
  ratingCount: number;
  /** How many of these recent ones are shown. Never presented as the total. */
  shown: number;
}

/**
 * Recent reviews for one restaurant, newest first.
 *
 * `{cuisine}` in the stored text is filled here rather than in the data,
 * because it is a display concern: the row knows which menu the order came
 * from, and the sentence is assembled where it is read.
 */
export function getReviewsForRestaurant(restaurantId: ID, limit = 4): RestaurantReview[] {
  return reviews
    .filter((r) => r.restaurantId === restaurantId)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit)
    .map((r) => {
      const cuisineName = cuisines.find((c) => c.id === r.cuisineId)?.name ?? 'order';
      return {
        id: r.id,
        author: r.author,
        rating: r.rating,
        text: r.text.replace('{cuisine}', cuisineName.toLowerCase()),
        at: r.at,
        verifiedOrder: r.verifiedOrder,
        cuisineName,
      };
    });
}

/**
 * The headline figures beside the reviews.
 *
 * Deliberately the restaurant's own stored rating and count, not an average of
 * the four rows below. Recomputing from a sample would put a number on screen
 * that contradicts the one in the header two hundred pixels above it.
 */
export function getReviewSummary(restaurantId: ID): ReviewSummary | null {
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  if (!restaurant) return null;
  return {
    rating: restaurant.rating,
    ratingCount: restaurant.ratingCount,
    shown: reviews.filter((r) => r.restaurantId === restaurantId).length,
  };
}
