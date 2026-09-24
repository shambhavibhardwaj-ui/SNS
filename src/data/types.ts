/**
 * Data model for RestaurantOnboarding.
 *
 * These interfaces are deliberately shaped like relational tables (surrogate ids +
 * foreign keys, join tables instead of nested arrays) so the mock data in `src/data`
 * can be swapped for Supabase/PostgreSQL rows later without touching the UI.
 *
 * Nothing in `src/components` may import this file's seed data directly — all reads
 * go through `src/services`.
 */

export type ID = string;

/** RULE-03 (aggregator fee) vs RULE-04 (own-fleet fee). Set per restaurant at onboarding. */
export type DeliveryType = 'aggregator' | 'own_fleet';

/** table: cuisines */
export interface Cuisine {
  id: ID;
  name: string;
  /** One line of menu-board copy, shown on listing pages. */
  description: string;
  icon: string;
}

/**
 * table: districts
 *
 * A district is a neighbourhood of the Food City map. It groups the cuisines that
 * are sold there; a restaurant sits in exactly one district but may serve cuisines
 * beyond that district's headline list.
 */
export interface District {
  id: ID;
  name: string;
  slug: string;
  emoji: string;
  tagline: string;
  /** Longer copy for the listing page hero. */
  description: string;
  /**
   * Headline for the listing page, e.g. "South Indian food".
   * Explicit rather than derived from the district name: "Harbour Point" and
   * "Quiet Court" say where you are, not what is cooked there.
   */
  foodLabel: string;
  /** Cuisines this district is known for. FK -> cuisines.id */
  cuisineIds: ID[];
  theme: DistrictTheme;
  /**
   * Which architecture the district's restaurants are built from.
   * Maps to cuisineBuildingStyles in components/foodcity/buildings.
   */
  buildingKind: BuildingKind;
}

/** Keep in step with CuisineKind in components/foodcity/buildings/buildingStyles.ts. */
export type BuildingKind =
  | 'mexican'
  | 'chinese'
  | 'seafood'
  | 'pureVeg'
  | 'jain'
  | 'italian'
  | 'healthy'
  | 'southIndian'
  | 'northIndian'
  | 'dessert';

export interface DistrictTheme {
  /** Wall / facade colour. */
  wall: string;
  /** Roof + heavy accents. */
  roof: string;
  /** Awnings, canopies, signage. */
  awning: string;
  /** Small highlights: lanterns, bunting, trim. */
  accent: string;
  /** Ground tint under the block. */
  ground: string;
}

/** table: restaurants */
export interface Restaurant {
  id: ID;
  name: string;
  description: string;
  /** 0–5, denormalised from `ratings` for display. */
  rating: number;
  ratingCount: number;
  deliveryType: DeliveryType;
  /** FK -> districts.id */
  districtId: ID;
  priceForTwo: number;
  /** Delivery window shown on cards, in minutes. */
  etaMinutes: number;
  etaMaxMinutes: number;
  /** Rupee band, as displayed. */
  priceRange: '\u20b9' | '\u20b9\u20b9' | '\u20b9\u20b9\u20b9';
  /** Charged to the customer at checkout, in rupees. */
  deliveryFee: number;
  isOpen: boolean;
  /** Drives the Veg filter on listing pages. */
  isPureVeg: boolean;
  /** Short scannable labels on the card, e.g. "Biryani", "Late night". */
  tags: string[];
  /**
   * Cover art key. Real photography drops in here later as a URL; until then
   * this selects one of the generated cuisine plates in ui/FoodPlate.
   */
  image: string;
  /** Stand-in for an image URL: drives the illustrated storefront. */
  storefront: Storefront;
}

export interface Storefront {
  /** Facade override; falls back to the district theme when omitted. */
  wall?: string;
  awning?: string;
  /** Emblem shown on the shop sign. */
  emblem: string;
}

/** join table: restaurant_cuisines — a restaurant may offer many cuisines */
export interface RestaurantCuisine {
  restaurantId: ID;
  cuisineId: ID;
}

/** table: menus — one menu per (restaurant, cuisine) pair; never merged */
export interface Menu {
  id: ID;
  restaurantId: ID;
  cuisineId: ID;
}

/** table: menu_items */
export interface MenuItem {
  id: ID;
  menuId: ID;
  name: string;
  description: string;
  price: number;
  /** e.g. "Starters", "Main Course" — groups items inside one menu. */
  category: string;
  isVeg: boolean;
  isSpicy?: boolean;
  image?: string;
}

/** table: orders */
export interface Order {
  id: ID;
  customerId: ID;
  restaurantId: ID;
  orderDate: string;
  total: number;
  deliveryType: DeliveryType;
}

/** table: order_items */
export interface OrderItem {
  orderId: ID;
  menuItemId: ID;
  quantity: number;
  price: number;
}

/** table: ratings — feeds RULE-01 (improvement plan) and RULE-02 (fee concession) */
export interface Rating {
  id: ID;
  orderId: ID;
  restaurantId: ID;
  rating: number;
  comment?: string;
  createdAt: string;
}

/* ---- geometry helpers used by the map ---- */

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}
