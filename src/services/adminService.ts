/**
 * adminService — the only place the admin UI reads platform data.
 *
 * The two business rules are *derived here from rating rows*, not stored as
 * flags on a restaurant. That matters: a stored `eligible: true` is an
 * assertion nobody can check, whereas counting the qualifying orders is the
 * rule itself. When these move to Supabase they become SQL with the same
 * shape, and the thresholds stay in one place.
 */
import {
  customerTotals,
  deliveryPartners,
  improvementPlans,
  MOCK_TODAY,
  orderActivity,
  platformCustomers,
  platformOrders,
  platformRestaurants,
  ratedOrders,
} from '../data/admin/platform';
import { getQueueWithDecisions } from './applicationQueue';
import type {
  AdminRestaurant,
  ApplicationStatus,
  DeliveryModel,
  ImprovementPlan,
  RestaurantApplication,
  RestaurantState,
} from '../data/admin/types';

/* ------------------------------------------------------- rule thresholds -- */

/**
 * RULE-01: below 3★ on MORE THAN 5 orders requires an improvement plan.
 * Strictly more than five — five low-rated orders does not trip it.
 */
export const LOW_RATING_BELOW = 3;
export const LOW_RATING_MIN_ORDERS = 5;

/**
 * RULE-02: above 4★ across 10 orders in ONE WEEK earns a fee concession.
 * The window is what makes this hard to fake with an average.
 */
export const HIGH_RATING_ABOVE = 4;
export const HIGH_RATING_MIN_ORDERS = 10;
export const HIGH_RATING_WINDOW_DAYS = 7;

/* ------------------------------------------------------------ overview -- */

export interface PlatformOverview {
  totalRestaurants: number;
  activeRestaurants: number;
  pendingApplications: number;
  underReview: number;
  offboarded: number;
  totalCustomers: number;
  totalDeliveryPartners: number;
  ordersToday: number;
  ordersThisWeek: number;
}

export function getPlatformOverview(): PlatformOverview {
  const byState = (s: RestaurantState) => platformRestaurants.filter((r) => r.state === s).length;
  const byStatus = (s: ApplicationStatus) =>
    getQueueWithDecisions().filter((a) => a.status === s).length;

  return {
    totalRestaurants: platformRestaurants.length,
    activeRestaurants: byState('Active'),
    pendingApplications: byStatus('Pending'),
    underReview: byStatus('Under Review'),
    offboarded: byState('Offboarded'),
    totalCustomers: customerTotals.total,
    totalDeliveryPartners: deliveryPartners.length,
    ordersToday: orderActivity.today,
    ordersThisWeek: orderActivity.thisWeek,
  };
}

/** Counts for the onboarding status distribution. */
export function getApplicationStatusCounts(): { status: ApplicationStatus; count: number }[] {
  const counts = new Map<ApplicationStatus, number>();
  for (const a of getQueueWithDecisions()) {
    counts.set(a.status, (counts.get(a.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

/* ------------------------------------------------------- applications -- */

export interface ApplicationQuery {
  status?: ApplicationStatus | 'All';
  /** Matches restaurant name, owner, application id or phone. */
  search?: string;
}

/* Reads the shared queue, so an application submitted from the restaurant
   dashboard is in every admin view, not only the applications page. */
export function listApplications({ status = 'All', search = '' }: ApplicationQuery = {}) {
  const q = search.trim().toLowerCase();
  return getQueueWithDecisions()
    .filter((a) => status === 'All' || a.status === status)
    .filter((a) =>
      !q
        ? true
        : [a.restaurantName, a.ownerName, a.id, a.phone]
            .join(' ')
            .toLowerCase()
            .includes(q),
    )
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function getApplication(id: string): RestaurantApplication | undefined {
  return getQueueWithDecisions().find((a) => a.id === id);
}

/* ------------------------------------------------- RULE-01: low ratings -- */

export interface AttentionRow {
  restaurantId: string;
  restaurant: string;
  lowRatedOrders: number;
  plan: ImprovementPlan | null;
}

/**
 * Restaurants that have tripped RULE-01.
 *
 * Counts orders rated below 3★ and keeps those with more than five. A single
 * bad night does not qualify — that is the point of the order threshold.
 */
export function getRestaurantsRequiringAttention(): AttentionRow[] {
  const counts = new Map<string, { name: string; n: number }>();
  for (const r of ratedOrders) {
    if (r.rating >= LOW_RATING_BELOW) continue;
    const entry = counts.get(r.restaurantId) ?? { name: r.restaurant, n: 0 };
    entry.n += 1;
    counts.set(r.restaurantId, entry);
  }

  return [...counts.entries()]
    .filter(([, v]) => v.n > LOW_RATING_MIN_ORDERS)
    .map(([restaurantId, v]) => ({
      restaurantId,
      restaurant: v.name,
      lowRatedOrders: v.n,
      plan: improvementPlans.find((p) => p.restaurantId === restaurantId) ?? null,
    }))
    .sort((a, b) => b.lowRatedOrders - a.lowRatedOrders);
}

export function getImprovementPlans(): ImprovementPlan[] {
  return improvementPlans;
}

/* --------------------------------------------- RULE-02: fee concession -- */

export interface ConcessionRow {
  restaurantId: string;
  restaurant: string;
  qualifyingOrders: number;
  averageRating: number;
  eligible: boolean;
}

/**
 * Restaurants measured against RULE-02.
 *
 * Counts orders rated above 4★ inside a seven-day window; ten or more
 * qualifies. Returns the near-misses too, so the admin can see who is close
 * and so the threshold is visibly doing work.
 *
 * The concession *amount* is not here. The client has not specified it, and
 * inventing one would put a number in front of an admin that nobody agreed.
 */
export function getConcessionCandidates(): ConcessionRow[] {
  const cutoff = new Date(MOCK_TODAY.getTime() - HIGH_RATING_WINDOW_DAYS * 86_400_000);

  const byRestaurant = new Map<string, { name: string; ratings: number[] }>();
  for (const r of ratedOrders) {
    if (r.rating <= HIGH_RATING_ABOVE) continue;
    if (new Date(r.ratedAt) < cutoff) continue;
    const entry = byRestaurant.get(r.restaurantId) ?? { name: r.restaurant, ratings: [] };
    entry.ratings.push(r.rating);
    byRestaurant.set(r.restaurantId, entry);
  }

  return [...byRestaurant.entries()]
    .map(([restaurantId, v]) => ({
      restaurantId,
      restaurant: v.name,
      qualifyingOrders: v.ratings.length,
      averageRating: v.ratings.reduce((s, n) => s + n, 0) / v.ratings.length,
      eligible: v.ratings.length >= HIGH_RATING_MIN_ORDERS,
    }))
    .sort((a, b) => b.qualifyingOrders - a.qualifyingOrders);
}

/* ------------------------------------------- the same rules, per cuisine -- */

/**
 * RULE-01 and RULE-02 again, counted per (restaurant, cuisine) instead of per
 * restaurant.
 *
 * **This is an extension, not a replacement.** The client's rules are written
 * about a restaurant, and the functions above still answer them exactly as
 * written; these sit alongside so the two readings can be compared before
 * anyone proposes changing the rules.
 *
 * Why it is worth comparing: a restaurant runs a separate menu per cuisine, so
 * "this restaurant is rated below 3★ on more than 5 orders" can mean two quite
 * different things — one menu is bad, or every menu is mediocre. Only the
 * second deserves a plan aimed at the whole kitchen.
 *
 * Note the direction. Both rules count orders, and a restaurant's count is the
 * sum of its cuisines', so a cuisine can only trip a threshold its restaurant
 * has already tripped. The finer grain never catches more — it localises, and
 * it stops a kitchen being penalised for one menu.
 */

export interface CuisineAttentionRow extends AttentionRow {
  cuisine: string;
  averageRating: number;
}

/** Menus rated below 3★ on more than five orders. */
export function getCuisinesRequiringAttention(): CuisineAttentionRow[] {
  const counts = new Map<string, { id: string; name: string; cuisine: string; ratings: number[] }>();

  for (const r of ratedOrders) {
    if (r.rating >= LOW_RATING_BELOW) continue;
    const key = `${r.restaurantId}::${r.cuisine}`;
    const entry = counts.get(key) ?? {
      id: r.restaurantId,
      name: r.restaurant,
      cuisine: r.cuisine,
      ratings: [],
    };
    entry.ratings.push(r.rating);
    counts.set(key, entry);
  }

  return [...counts.values()]
    .filter((v) => v.ratings.length > LOW_RATING_MIN_ORDERS)
    .map((v) => ({
      restaurantId: v.id,
      restaurant: v.name,
      cuisine: v.cuisine,
      lowRatedOrders: v.ratings.length,
      averageRating: Number(
        (v.ratings.reduce((sum, n) => sum + n, 0) / v.ratings.length).toFixed(2),
      ),
      plan: improvementPlans.find((p) => p.restaurantId === v.id) ?? null,
    }))
    .sort((a, b) => b.lowRatedOrders - a.lowRatedOrders);
}

export interface CuisineConcessionRow extends ConcessionRow {
  cuisine: string;
}

/** Menus rated above 4★ on ten orders inside the seven-day window. */
export function getCuisineConcessionCandidates(): CuisineConcessionRow[] {
  const cutoff = new Date(MOCK_TODAY.getTime() - HIGH_RATING_WINDOW_DAYS * 86_400_000);
  const byMenu = new Map<string, { id: string; name: string; cuisine: string; ratings: number[] }>();

  for (const r of ratedOrders) {
    if (r.rating <= HIGH_RATING_ABOVE) continue;
    if (new Date(r.ratedAt) < cutoff) continue;
    const key = `${r.restaurantId}::${r.cuisine}`;
    const entry = byMenu.get(key) ?? {
      id: r.restaurantId,
      name: r.restaurant,
      cuisine: r.cuisine,
      ratings: [],
    };
    entry.ratings.push(r.rating);
    byMenu.set(key, entry);
  }

  return [...byMenu.values()]
    .map((v) => ({
      restaurantId: v.id,
      restaurant: v.name,
      cuisine: v.cuisine,
      qualifyingOrders: v.ratings.length,
      averageRating: v.ratings.reduce((sum, n) => sum + n, 0) / v.ratings.length,
      eligible: v.ratings.length >= HIGH_RATING_MIN_ORDERS,
    }))
    .sort((a, b) => b.qualifyingOrders - a.qualifyingOrders);
}

/**
 * Where the two readings disagree.
 *
 * The honest output of the comparison, and the thing worth taking to the
 * client: every restaurant a rule catches whose menus, read separately, say
 * something different.
 */
export interface GrainDifference {
  restaurantId: string;
  restaurant: string;
  rule: 'RULE-01' | 'RULE-02';
  /** What the restaurant-level count was. */
  restaurantCount: number;
  /** The same orders split across the restaurant's menus. */
  perCuisine: { cuisine: string; count: number }[];
  /** Cuisines that trip the rule on their own. None means the fault is spread. */
  cuisinesTripped: string[];
}

export function getGrainDifferences(): GrainDifference[] {
  const out: GrainDifference[] = [];

  const cuisineAttention = getCuisinesRequiringAttention();
  for (const row of getRestaurantsRequiringAttention()) {
    const perCuisine = countBy(
      ratedOrders.filter(
        (r) => r.restaurantId === row.restaurantId && r.rating < LOW_RATING_BELOW,
      ),
    );
    const tripped = cuisineAttention
      .filter((c) => c.restaurantId === row.restaurantId)
      .map((c) => c.cuisine);

    if (perCuisine.length > 1 || tripped.length !== 1) {
      out.push({
        restaurantId: row.restaurantId,
        restaurant: row.restaurant,
        rule: 'RULE-01',
        restaurantCount: row.lowRatedOrders,
        perCuisine,
        cuisinesTripped: tripped,
      });
    }
  }

  const cutoff = new Date(MOCK_TODAY.getTime() - HIGH_RATING_WINDOW_DAYS * 86_400_000);
  const cuisineConcessions = getCuisineConcessionCandidates().filter((c) => c.eligible);

  for (const row of getConcessionCandidates().filter((c) => c.eligible)) {
    const perCuisine = countBy(
      ratedOrders.filter(
        (r) =>
          r.restaurantId === row.restaurantId &&
          r.rating > HIGH_RATING_ABOVE &&
          new Date(r.ratedAt) >= cutoff,
      ),
    );
    const tripped = cuisineConcessions
      .filter((c) => c.restaurantId === row.restaurantId)
      .map((c) => c.cuisine);

    if (perCuisine.length > 1 || tripped.length !== 1) {
      out.push({
        restaurantId: row.restaurantId,
        restaurant: row.restaurant,
        rule: 'RULE-02',
        restaurantCount: row.qualifyingOrders,
        perCuisine,
        cuisinesTripped: tripped,
      });
    }
  }

  return out;
}

function countBy(rows: { cuisine: string }[]): { cuisine: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.cuisine, (counts.get(r.cuisine) ?? 0) + 1);
  return [...counts.entries()]
    .map(([cuisine, count]) => ({ cuisine, count }))
    .sort((a, b) => b.count - a.count);
}

/* -------------------------------------------------- performance, misc -- */

export interface PerformanceRow {
  restaurant: string;
  rating: number;
  totalOrders: number;
  recentRating: number | null;
  state: RestaurantState;
}

export function getRestaurantPerformance(): PerformanceRow[] {
  return platformRestaurants
    .filter((r) => r.totalOrders > 0)
    .map((r) => {
      const rows = ratedOrders.filter((x) => x.restaurantId === r.id);
      const avg = rows.length ? rows.reduce((s, x) => s + x.rating, 0) / rows.length : 0;
      /*
       * The latest *day*, averaged — not the latest row.
       *
       * `ratedAt` is a date with no time, so a restaurant's last day holds
       * several orders and `sort` leaves ties in seed order. Taking [0] handed
       * back whichever 5★ row the seed happened to list first, which is why
       * every restaurant on the page reported the same recent rating of 5.0.
       * One order could not honestly be called "the recent rating" in any
       * case; the day can.
       */
      const latestDay = rows.reduce((max, x) => (x.ratedAt > max ? x.ratedAt : max), '');
      const onLatest = rows.filter((x) => x.ratedAt === latestDay);
      const recent = onLatest.length
        ? onLatest.reduce((s, x) => s + x.rating, 0) / onLatest.length
        : null;
      return {
        restaurant: r.name,
        rating: Number(avg.toFixed(1)),
        totalOrders: r.totalOrders,
        recentRating: recent === null ? null : Number(recent.toFixed(1)),
        state: r.state,
      };
    })
    .sort((a, b) => b.totalOrders - a.totalOrders);
}

export function getRecentOrders(limit = 6) {
  return platformOrders.slice(0, limit);
}

export function getRecentCustomers(limit = 5) {
  return platformCustomers.slice(0, limit);
}

export function getCustomerTotals() {
  return customerTotals;
}

export function getDeliveryPartners() {
  return deliveryPartners;
}

/** How the platform's restaurants split between the two delivery models. */
export function getDeliveryModelSplit(): { model: DeliveryModel; count: number }[] {
  const live = platformRestaurants.filter((r) => r.state !== 'Offboarded');
  return (['aggregator', 'own_staff'] as DeliveryModel[]).map((model) => ({
    model,
    count: live.filter((r) => r.deliveryModel === model).length,
  }));
}

export function getDeliveryOverview() {
  return {
    total: deliveryPartners.length,
    active: deliveryPartners.filter((p) => p.status === 'Active').length,
    outForDelivery: orderActivity.outForDelivery,
  };
}

export function getRestaurants(): AdminRestaurant[] {
  return platformRestaurants;
}
