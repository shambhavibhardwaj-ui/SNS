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
import { restaurantApplications } from '../data/admin/applications';
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
    restaurantApplications.filter((a) => a.status === s).length;

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
  for (const a of restaurantApplications) {
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

export function listApplications({ status = 'All', search = '' }: ApplicationQuery = {}) {
  const q = search.trim().toLowerCase();
  return restaurantApplications
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
  return restaurantApplications.find((a) => a.id === id);
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
      const recent = [...rows].sort((a, b) => b.ratedAt.localeCompare(a.ratedAt))[0];
      return {
        restaurant: r.name,
        rating: Number(avg.toFixed(1)),
        totalOrders: r.totalOrders,
        recentRating: recent?.rating ?? null,
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
