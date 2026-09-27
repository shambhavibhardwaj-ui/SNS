/**
 * Analytics seed data.
 *
 * Two rules govern this file.
 *
 * 1. Nothing here is a conclusion. There is no `needsImprovementPlan: true`
 *    and no `changePercent: 12.4`. Series and counts go in; every headline,
 *    percentage, share and rule verdict is computed from them in
 *    `analyticsService`. A stored conclusion is an assertion nobody can check.
 *
 * 2. The day series is generated once, deterministically, at module load.
 *    A `Math.random()` series would redraw on every render, so a tooltip would
 *    disagree with the line under the cursor. `MOCK_TODAY` is fixed for the
 *    same reason the rules use it.
 *
 * Shaped like the queries that replace it: a row per day, a row per cuisine, a
 * row per stage. `getOrderTrend()` becomes `select date, count(*) ... group by
 * date` without the page noticing.
 */
import { MOCK_TODAY, platformRestaurants } from './platform';
import type { DeliveryModel } from './types';

/* ------------------------------------------------------------- cuisines -- */

/**
 * The ten categories the customer city is built around, so analytics and Food
 * City are talking about the same thing. `districtId` is the join key.
 */
export interface AnalyticsCuisine {
  id: string;
  name: string;
  districtId: string;
  /** Relative share of order volume. Normalised at read time, never stored as a %. */
  weight: number;
  /** Average order value in rupees — drives revenue rather than a second series. */
  aov: number;
}

export const analyticsCuisines: AnalyticsCuisine[] = [
  { id: 'an-north-indian', name: 'North Indian', districtId: 'dis-north-indian', weight: 186, aov: 520 },
  { id: 'an-chinese', name: 'Chinese', districtId: 'dis-chinese', weight: 148, aov: 470 },
  { id: 'an-south-indian', name: 'South Indian', districtId: 'dis-south-indian', weight: 141, aov: 330 },
  { id: 'an-italian', name: 'Italian', districtId: 'dis-italian', weight: 132, aov: 690 },
  { id: 'an-dessert', name: 'Dessert', districtId: 'dis-dessert', weight: 118, aov: 280 },
  { id: 'an-pure-veg', name: 'Pure Veg', districtId: 'dis-pure-veg', weight: 96, aov: 390 },
  { id: 'an-mexican', name: 'Mexican', districtId: 'dis-mexican', weight: 84, aov: 610 },
  { id: 'an-healthy', name: 'Health Freak', districtId: 'dis-healthy', weight: 77, aov: 450 },
  { id: 'an-seafood', name: 'Seafood', districtId: 'dis-seafood', weight: 63, aov: 820 },
  { id: 'an-jain', name: 'Jain Food', districtId: 'dis-jain', weight: 41, aov: 360 },
];

/**
 * Which category a kitchen trades in.
 *
 * Explicit rather than matched on cuisine strings: "BBQ & Grill" belongs to no
 * category on its own, and a restaurant's headline category is a product
 * decision, not something derivable from a tag list. Becomes the
 * `restaurant_cuisine_category` join.
 */
export const restaurantCuisineCategory: Record<string, string> = {
  'r-abc': 'an-north-indian',
  'r-spice-house': 'an-north-indian',
  'r-indian-spice-house': 'an-north-indian',
  'r-old-tandoor': 'an-north-indian',
  'r-corner-wok': 'an-chinese',
  'r-lantern-wok': 'an-chinese',
  'r-bao-bar': 'an-chinese',
  'r-annas-tiffin': 'an-south-indian',
  'r-idli-express': 'an-south-indian',
  'r-tiffin-co': 'an-south-indian',
  'r-forno-rosso': 'an-italian',
  'r-pasta-fresca': 'an-italian',
  'r-macaron': 'an-dessert',
  'r-xyz-cafe': 'an-dessert',
  'r-scoop-street': 'an-dessert',
  'r-green-fork': 'an-pure-veg',
  'r-satvik': 'an-pure-veg',
  'r-maiz': 'an-mexican',
  'r-casa-verde': 'an-mexican',
  'r-midnight-grill': 'an-mexican',
  'r-leaf-bowl': 'an-healthy',
  'r-green-grain': 'an-healthy',
  'r-harbour-shack': 'an-seafood',
  'r-tide-table': 'an-seafood',
  'r-ahimsa': 'an-jain',
  'r-jain-thali': 'an-jain',
};

/* --------------------------------------------------------- the day series -- */

export interface DayPoint {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  orders: number;
  completed: number;
  cancelled: number;
  /** Order value in rupees. Not platform fee income — the fee rates are unset. */
  revenue: number;
  newCustomers: number;
  activeCustomers: number;
  /** Per delivery model, so RULE-03/04 can be compared over time. */
  aggregatorOrders: number;
  ownStaffOrders: number;
  aggregatorMinutes: number;
  ownStaffMinutes: number;
}

/** Deterministic noise. Same seed, same series, every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The longest range the page offers; shorter ones are slices of this. */
export const SERIES_DAYS = 92;

export const dailySeries: DayPoint[] = (() => {
  const rand = mulberry32(20260925);
  const out: DayPoint[] = [];

  for (let i = SERIES_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date(MOCK_TODAY.getTime() - i * 86_400_000);
    const date = day.toISOString().slice(0, 10);
    const dow = day.getUTCDay();

    /* Weekends carry the week; Monday is the trough. */
    const weekly = [0.9, 0.84, 0.9, 0.96, 1.08, 1.24, 1.18][dow];
    /* Gentle growth across the quarter, not a hockey stick. */
    const growth = 1 + ((SERIES_DAYS - 1 - i) / SERIES_DAYS) * 0.34;
    const noise = 0.93 + rand() * 0.14;

    const orders = Math.round(214 * weekly * growth * noise);
    const cancelled = Math.round(orders * (0.028 + rand() * 0.022));
    const completed = orders - cancelled;

    /* Value per order drifts with the day, so revenue is not a scaled copy. */
    const aov = 452 + rand() * 96;
    const revenue = Math.round(completed * aov);

    /* Roughly the platform's own aggregator / own-staff split, with drift. */
    const aggShare = 0.58 + (rand() - 0.5) * 0.06;
    const aggregatorOrders = Math.round(orders * aggShare);

    out.push({
      date,
      orders,
      completed,
      cancelled,
      revenue,
      newCustomers: Math.round(18 * weekly * growth * (0.8 + rand() * 0.5)),
      activeCustomers: Math.round(orders * (1.32 + rand() * 0.2)),
      aggregatorOrders,
      ownStaffOrders: orders - aggregatorOrders,
      /* Aggregators are faster on average; own staff are steadier. */
      aggregatorMinutes: Math.round((31 + rand() * 7) * 10) / 10,
      ownStaffMinutes: Math.round((36 + rand() * 4) * 10) / 10,
    });
  }

  return out;
})();

/* -------------------------------------------------------- order pipeline -- */

/**
 * How many orders sit at each stage right now.
 *
 * A live snapshot, not a time series — this is the `group by status` a
 * dispatcher watches. `Cancelled` is terminal and shown apart from the line.
 */
export interface OrderStageCount {
  id: string;
  label: string;
  count: number;
  /** Where the stage's detail lives, so a node can be clicked through. */
  href: string;
}

export const orderStageCounts: OrderStageCount[] = [
  { id: 'placed', label: 'Order placed', count: 63, href: '/admin/orders' },
  { id: 'received', label: 'Restaurant received', count: 48, href: '/admin/orders' },
  { id: 'confirmed', label: 'Restaurant confirmed', count: 41, href: '/admin/orders' },
  { id: 'preparing', label: 'Food preparing', count: 37, href: '/admin/orders' },
  { id: 'assigned', label: 'Delivery assigned', count: 29, href: '/admin/delivery-partners' },
  { id: 'picked', label: 'Picked up', count: 24, href: '/admin/delivery-partners' },
  { id: 'out', label: 'Out for delivery', count: 27, href: '/admin/delivery-partners' },
  { id: 'delivered', label: 'Delivered', count: 288, href: '/admin/orders' },
];

export const cancelledToday = 11;

/* ------------------------------------------------------ delivery models -- */

/**
 * Per-model operational counts. RULE-03 and RULE-04 hang off this choice, so
 * the two are always reported side by side rather than as one blended number.
 */
export interface DeliveryModelFacts {
  model: DeliveryModel;
  ordersHandled: number;
  completed: number;
  active: number;
  cancelled: number;
  /** Sum of delivery durations in minutes; the average is derived. */
  totalMinutes: number;
}

export const deliveryModelFacts: DeliveryModelFacts[] = [
  { model: 'aggregator', ordersHandled: 11_842, completed: 11_398, active: 41, cancelled: 403, totalMinutes: 386_449 },
  { model: 'own_staff', ordersHandled: 8_216, completed: 7_944, active: 27, cancelled: 245, totalMinutes: 295_500 },
];

/* ------------------------------------------------------- customer funnel -- */

/**
 * Raw stage counts. Conversion percentages are derived — storing "38%" next to
 * the two numbers it comes from is how the three drift apart.
 */
export interface FunnelStageSeed {
  id: string;
  label: string;
  count: number;
  hint: string;
  href?: string;
}

export const customerFunnelSeed: FunnelStageSeed[] = [
  { id: 'visitors', label: 'Visitors', count: 18_430, hint: 'opened Food City' },
  { id: 'registered', label: 'Registered', count: 4_912, hint: 'created an account', href: '/admin/customers' },
  { id: 'first-order', label: 'First order', count: 2_418, hint: 'ordered at least once', href: '/admin/customers' },
  { id: 'repeat', label: 'Repeat customer', count: 1_286, hint: 'ordered more than once', href: '/admin/customers' },
];

/* -------------------------------------------------- onboarding flow seed -- */

/**
 * The onboarding process as the platform actually runs it.
 *
 * Node counts are not written here: they are counted from the applications
 * table at read time, so the diagram cannot drift from the queue screen.
 */
export interface FlowNodeSeed {
  id: string;
  label: string;
  /** Column and row on the diagram's grid. */
  col: number;
  row: number;
  kind: 'start' | 'step' | 'decision' | 'terminal' | 'warn';
  href?: string;
  hint?: string;
}

export interface FlowEdgeSeed {
  from: string;
  to: string;
  label?: string;
}

export const onboardingFlowNodes: FlowNodeSeed[] = [
  { id: 'application', label: 'Restaurant application', col: 0, row: 1, kind: 'start', href: '/admin/restaurants/applications', hint: 'Owner submits details, cuisines and delivery choice' },
  { id: 'review', label: 'Application review', col: 1, row: 1, kind: 'step', href: '/admin/restaurants/applications', hint: 'Admin checks documents and address' },
  { id: 'decision', label: 'Admin decision', col: 2, row: 1, kind: 'decision', hint: 'Approve, request changes, or reject' },
  { id: 'approved', label: 'Approved', col: 3, row: 0, kind: 'terminal', href: '/admin/restaurants/active' },
  { id: 'changes', label: 'Needs changes', col: 3, row: 1, kind: 'warn', href: '/admin/restaurants/applications' },
  { id: 'rejected', label: 'Rejected', col: 3, row: 2, kind: 'terminal', href: '/admin/restaurants/applications' },
  { id: 'active', label: 'Active restaurant', col: 4, row: 0, kind: 'terminal', href: '/admin/restaurants/active', hint: 'Menus published, taking orders' },
  { id: 'resubmit', label: 'Resubmit', col: 4, row: 1, kind: 'step', href: '/admin/restaurants/applications' },
];

export const onboardingFlowEdges: FlowEdgeSeed[] = [
  { from: 'application', to: 'review' },
  { from: 'review', to: 'decision' },
  { from: 'decision', to: 'approved', label: 'approve' },
  { from: 'decision', to: 'changes', label: 'request changes' },
  { from: 'decision', to: 'rejected', label: 'reject' },
  { from: 'approved', to: 'active' },
  { from: 'changes', to: 'resubmit' },
  { from: 'resubmit', to: 'review', label: 'back to review' },
];

export const deliveryFlowNodes: FlowNodeSeed[] = [
  { id: 'order', label: 'Order', col: 0, row: 1, kind: 'start', href: '/admin/orders' },
  { id: 'choice', label: 'Delivery choice', col: 1, row: 1, kind: 'decision', hint: 'Set by the restaurant at onboarding — RULE-03 / RULE-04' },
  { id: 'agg-assigned', label: 'Assigned', col: 2, row: 0, kind: 'step' },
  { id: 'own-assigned', label: 'Assigned', col: 2, row: 2, kind: 'step' },
  { id: 'agg-picked', label: 'Picked up', col: 3, row: 0, kind: 'step' },
  { id: 'own-picked', label: 'Picked up', col: 3, row: 2, kind: 'step' },
  { id: 'agg-delivered', label: 'Delivered', col: 4, row: 0, kind: 'terminal' },
  { id: 'own-delivered', label: 'Delivered', col: 4, row: 2, kind: 'terminal' },
];

export const deliveryFlowEdges: FlowEdgeSeed[] = [
  { from: 'order', to: 'choice' },
  { from: 'choice', to: 'agg-assigned', label: 'aggregator' },
  { from: 'choice', to: 'own-assigned', label: 'own staff' },
  { from: 'agg-assigned', to: 'agg-picked' },
  { from: 'own-assigned', to: 'own-picked' },
  { from: 'agg-picked', to: 'agg-delivered' },
  { from: 'own-picked', to: 'own-delivered' },
];

/* ----------------------------------------------------------- activity -- */

export interface ActivityEntry {
  time: string;
  text: string;
  kind: 'application' | 'order' | 'rule' | 'delivery' | 'restaurant';
  href?: string;
}

export const recentActivity: ActivityEntry[] = [
  { time: '09:42', kind: 'application', text: 'ABC Kitchen application approved', href: '/admin/restaurants/applications' },
  { time: '09:31', kind: 'application', text: 'New restaurant application submitted — Lantern Wok', href: '/admin/restaurants/applications' },
  { time: '09:20', kind: 'order', text: 'Order #10482 delivered', href: '/admin/orders' },
  { time: '09:12', kind: 'rule', text: 'Spice House crossed the RULE-05 threshold', href: '/admin/improvement-plans' },
  { time: '08:56', kind: 'delivery', text: 'New delivery partner registered — PedalPost', href: '/admin/delivery-partners' },
  { time: '08:41', kind: 'rule', text: 'Forno Rosso reached 10 high-rated orders this week', href: '/admin/fees' },
  { time: '08:27', kind: 'restaurant', text: 'Maíz y Humo moved to Needs Changes', href: '/admin/restaurants/applications' },
  { time: '08:09', kind: 'order', text: 'Order #10471 cancelled by customer', href: '/admin/orders' },
  { time: '07:52', kind: 'delivery', text: 'NightOwl Couriers suspended', href: '/admin/delivery-partners' },
  { time: '07:35', kind: 'restaurant', text: 'Green Fork submitted revised documents', href: '/admin/restaurants/applications' },
];

/* --------------------------------------------------- restaurant extras -- */

/**
 * Per-restaurant delivery timing. Orders, revenue and rating all come from
 * existing seed data; only the clock is new.
 */
export const restaurantDeliveryMinutes: Record<string, number> = Object.fromEntries(
  platformRestaurants.map((r, i) => {
    const rand = mulberry32(r.id.length * 977 + i * 31);
    return [r.id, Math.round((27 + rand() * 18) * 10) / 10];
  }),
);
