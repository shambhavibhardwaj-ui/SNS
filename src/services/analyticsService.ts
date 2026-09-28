/**
 * analyticsService — the only place the analytics page reads data.
 *
 * Every function takes the page's filters and returns finished shapes. The
 * page never reaches into `src/data`, never filters an array and never works
 * out a percentage, so replacing these bodies with Supabase queries is a
 * change of source, not of screen.
 *
 * Two things are derived here on purpose rather than stored:
 *
 *   - **Comparisons.** "+12.4% vs previous period" is the current window
 *     measured against the window immediately before it, from the same series.
 *     A stored change figure is a number nobody can reproduce.
 *   - **Rule verdicts.** RULE-01 and RULE-02 are not re-implemented here; they
 *     come from `adminService`, which counts qualifying orders. One definition,
 *     used by the overview, the applications queue and this page.
 */
import {
  analyticsCuisines,
  cancelledToday,
  customerFunnelSeed,
  dailySeries,
  deliveryFlowEdges,
  deliveryFlowNodes,
  deliveryModelFacts,
  onboardingFlowEdges,
  onboardingFlowNodes,
  orderStageCounts,
  recentActivity,
  restaurantCuisineCategory,
  restaurantDeliveryMinutes,
  type ActivityEntry,
  type DayPoint,
  type FlowEdgeSeed,
  type FlowNodeSeed,
} from '../data/admin/analytics';
import { MOCK_TODAY, platformRestaurants, ratedOrders } from '../data/admin/platform';
import { restaurantApplications } from '../data/admin/applications';
import {
  getConcessionCandidates,
  getRestaurantsRequiringAttention,
  HIGH_RATING_ABOVE,
  HIGH_RATING_MIN_ORDERS,
  HIGH_RATING_WINDOW_DAYS,
  LOW_RATING_BELOW,
  LOW_RATING_MIN_ORDERS,
  type ConcessionRow,
} from './adminService';
import {
  DELIVERY_MODEL_LABEL,
  type ApplicationStatus,
  type DeliveryModel,
} from '../data/admin/types';

/* ---------------------------------------------------------------- filters -- */

export type DateRange = 'today' | '7d' | '30d' | '3m';

export const DATE_RANGES: { id: DateRange; label: string; days: number }[] = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '3m', label: 'Last 3 Months', days: 92 },
];

export type OrderStatusFilter = 'all' | 'completed' | 'cancelled';

export interface AnalyticsFilters {
  range: DateRange;
  /** An `analyticsCuisines` id, or 'all'. */
  cuisineId: string;
  /** A `platformRestaurants` id, or 'all'. */
  restaurantId: string;
  deliveryModel: DeliveryModel | 'all';
  orderStatus: OrderStatusFilter;
}

export const DEFAULT_FILTERS: AnalyticsFilters = {
  range: '30d',
  cuisineId: 'all',
  restaurantId: 'all',
  deliveryModel: 'all',
  orderStatus: 'all',
};

function daysFor(range: DateRange): number {
  return DATE_RANGES.find((r) => r.id === range)?.days ?? 30;
}

/**
 * The share of platform volume a filter selects.
 *
 * Filtering a pre-aggregated day series cannot be exact — the real query would
 * have a `where` clause and count rows. Scaling by the selected slice's share
 * keeps every chart moving together and consistent with the cuisine and
 * restaurant tables, which are filtered for real.
 */
function selectionShare(f: AnalyticsFilters): number {
  let share = 1;

  if (f.cuisineId !== 'all') {
    const total = analyticsCuisines.reduce((s, c) => s + c.weight, 0);
    const picked = analyticsCuisines.find((c) => c.id === f.cuisineId)?.weight ?? 0;
    share *= picked / total;
  }

  if (f.restaurantId !== 'all') {
    const live = platformRestaurants.filter((r) => r.totalOrders > 0);
    const total = live.reduce((s, r) => s + r.totalOrders, 0);
    const picked = live.find((r) => r.id === f.restaurantId)?.totalOrders ?? 0;
    /* A restaurant already sits inside its cuisine, so do not narrow twice. */
    share = picked / total;
  }

  if (f.deliveryModel !== 'all') {
    const totals = deliveryModelFacts.reduce((s, d) => s + d.ordersHandled, 0);
    const picked = deliveryModelFacts.find((d) => d.model === f.deliveryModel)?.ordersHandled ?? 0;
    share *= picked / totals;
  }

  return share;
}

/** Last element, or undefined. `Array.prototype.at` is past this build's lib. */
function last<T>(rows: T[]): T | undefined {
  return rows.length ? rows[rows.length - 1] : undefined;
}

/** The window the filters select, and the window immediately before it. */
function windows(f: AnalyticsFilters): { current: DayPoint[]; previous: DayPoint[] } {
  const n = daysFor(f.range);
  const end = dailySeries.length;
  return {
    current: dailySeries.slice(Math.max(0, end - n), end),
    previous: dailySeries.slice(Math.max(0, end - n * 2), Math.max(0, end - n)),
  };
}

const sum = (rows: DayPoint[], pick: (d: DayPoint) => number) =>
  rows.reduce((s, d) => s + pick(d), 0);

/** Percentage change, or null when there is no earlier window to compare with. */
function change(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Options for the filter controls.
 *
 * Here rather than in the page so the page does not import `src/data` just to
 * populate two dropdowns — the lists are a query (`select id, name from ...`)
 * like everything else on the screen.
 */
export interface FilterOptions {
  cuisines: { id: string; name: string }[];
  restaurants: { id: string; name: string }[];
  deliveryModels: { id: DeliveryModel; label: string }[];
}

export function getFilterOptions(): FilterOptions {
  return {
    cuisines: analyticsCuisines.map((c) => ({ id: c.id, name: c.name })),
    restaurants: [...platformRestaurants]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({ id: r.id, name: r.name })),
    deliveryModels: (['aggregator', 'own_staff'] as DeliveryModel[]).map((m) => ({
      id: m,
      label: DELIVERY_MODEL_LABEL[m],
    })),
  };
}

/* --------------------------------------------------------------- metrics -- */

export interface OverviewMetric {
  id: string;
  label: string;
  value: number;
  /** Pre-formatted, because a rating and a rupee total format differently. */
  display: string;
  /** Percentage change against the previous window; null when not comparable. */
  changePercent: number | null;
  /** Whether a rise is good. Pending applications rising is not. */
  polarity: 'up-good' | 'up-bad' | 'neutral';
  hint: string;
  href?: string;
}

export function getOverviewMetrics(f: AnalyticsFilters): OverviewMetric[] {
  const { current, previous } = windows(f);
  const share = selectionShare(f);
  const scope = f.restaurantId !== 'all' || f.cuisineId !== 'all' || f.deliveryModel !== 'all';

  const restaurants = filteredRestaurants(f);
  const active = restaurants.filter((r) => r.state === 'Active');
  const pending = restaurantApplications.filter((a) => a.status === 'Pending').length;

  const ordersToday = Math.round((last(current)?.orders ?? 0) * share);
  const ordersYesterday = Math.round((dailySeries[dailySeries.length - 2]?.orders ?? 0) * share);

  const weekCurrent = Math.round(sum(dailySeries.slice(-7), (d) => d.orders) * share);
  const weekPrevious = Math.round(sum(dailySeries.slice(-14, -7), (d) => d.orders) * share);

  const newCustomers = sum(current, (d) => d.newCustomers);
  const newCustomersPrev = sum(previous, (d) => d.newCustomers);

  const rated = filteredRatings(f);
  const avgRating = rated.length
    ? rated.reduce((s, r) => s + r.rating, 0) / rated.length
    : 0;

  const partners = 4;

  return [
    {
      id: 'total-restaurants',
      label: 'Total restaurants',
      value: restaurants.length,
      display: String(restaurants.length),
      changePercent: null,
      polarity: 'neutral',
      hint: scope ? 'in the current selection' : 'every state, including offboarded',
      href: '/admin/restaurants/active',
    },
    {
      id: 'active-restaurants',
      label: 'Active restaurants',
      value: active.length,
      display: String(active.length),
      changePercent: null,
      polarity: 'up-good',
      hint: 'currently taking orders',
      href: '/admin/restaurants/active',
    },
    {
      id: 'pending-applications',
      label: 'Pending applications',
      value: pending,
      display: String(pending),
      changePercent: null,
      polarity: 'up-bad',
      hint: 'awaiting a first look',
      href: '/admin/restaurants/applications',
    },
    {
      id: 'orders-today',
      label: 'Orders today',
      value: ordersToday,
      display: ordersToday.toLocaleString('en-IN'),
      changePercent: change(ordersToday, ordersYesterday),
      polarity: 'up-good',
      hint: 'vs previous day',
      href: '/admin/orders',
    },
    {
      id: 'orders-week',
      label: 'Orders this week',
      value: weekCurrent,
      display: weekCurrent.toLocaleString('en-IN'),
      changePercent: change(weekCurrent, weekPrevious),
      polarity: 'up-good',
      hint: 'vs previous week',
      href: '/admin/orders',
    },
    {
      id: 'customers',
      label: 'New customers',
      value: newCustomers,
      display: newCustomers.toLocaleString('en-IN'),
      changePercent: change(newCustomers, newCustomersPrev),
      polarity: 'up-good',
      hint: 'vs previous period',
      href: '/admin/customers',
    },
    {
      id: 'partners',
      label: 'Delivery partners',
      value: partners,
      display: String(partners),
      changePercent: null,
      polarity: 'neutral',
      hint: '3 active, 1 suspended',
      href: '/admin/delivery-partners',
    },
    {
      id: 'rating',
      label: 'Average rating',
      value: avgRating,
      display: avgRating ? avgRating.toFixed(2) : '—',
      changePercent: null,
      polarity: 'up-good',
      hint: `across ${rated.length.toLocaleString('en-IN')} rated orders`,
      href: '/admin/ratings',
    },
  ];
}

/* ----------------------------------------------------------- order trend -- */

export type TrendMetric = 'orders' | 'revenue' | 'completed';

export const TREND_METRICS: { id: TrendMetric; label: string; unit: 'count' | 'money' }[] = [
  { id: 'orders', label: 'Orders', unit: 'count' },
  { id: 'revenue', label: 'Revenue', unit: 'money' },
  { id: 'completed', label: 'Completed orders', unit: 'count' },
];

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendSeries {
  id: string;
  label: string;
  points: TrendPoint[];
  unit: 'count' | 'money';
  total: number;
  changePercent: number | null;
}

export function getOrderTrend(f: AnalyticsFilters, metric: TrendMetric): TrendSeries {
  const { current, previous } = windows(f);
  const share = selectionShare(f);
  const spec = TREND_METRICS.find((m) => m.id === metric)!;

  const pick = (d: DayPoint) => {
    const base = metric === 'revenue' ? d.revenue : metric === 'completed' ? d.completed : d.orders;
    if (f.orderStatus === 'completed' && metric === 'orders') return d.completed;
    if (f.orderStatus === 'cancelled') return metric === 'revenue' ? 0 : d.cancelled;
    return base;
  };

  const points = current.map((d) => ({ date: d.date, value: Math.round(pick(d) * share) }));
  const total = points.reduce((s, p) => s + p.value, 0);
  const prevTotal = Math.round(sum(previous, pick) * share);

  return {
    id: metric,
    label: spec.label,
    points,
    unit: spec.unit,
    total,
    changePercent: change(total, prevTotal),
  };
}

/* ---------------------------------------------- onboarding funnel + flow -- */

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  /** Share of the first stage, derived. */
  percentOfTop: number;
  /** Share of the stage immediately above, derived. */
  conversionFromPrevious: number | null;
  hint?: string;
  href?: string;
}

function toFunnel(
  stages: { id: string; label: string; count: number; hint?: string; href?: string }[],
): FunnelStage[] {
  const top = stages[0]?.count ?? 0;
  return stages.map((s, i) => ({
    ...s,
    percentOfTop: top ? (s.count / top) * 100 : 0,
    conversionFromPrevious:
      i === 0 || !stages[i - 1].count ? null : (s.count / stages[i - 1].count) * 100,
  }));
}

export interface OnboardingFunnel {
  stages: FunnelStage[];
  /** Outcomes that leave the funnel rather than continuing down it. */
  exits: { id: string; label: string; count: number; href: string }[];
}

/**
 * One cohort, counted cumulatively.
 *
 * Every stage counts applications that reached *at least* that far, all from
 * the applications table. An earlier version ended with the platform's total
 * active restaurants, which is a different population — most of them were
 * onboarded long before this queue existed — so the last bar came out wider
 * than the first and the funnel pointed the wrong way. The final stage is now
 * the approved applications that actually went live.
 */
export function getRestaurantOnboardingFunnel(): OnboardingFunnel {
  const byStatus = (s: ApplicationStatus) =>
    restaurantApplications.filter((a) => a.status === s).length;

  const submitted = restaurantApplications.length;
  const underReview = byStatus('Under Review');
  const approved = byStatus('Approved');

  /* Matched by name: the applications table has no restaurant FK yet. That
     column is exactly what this becomes in Supabase. */
  const liveNames = new Set(
    platformRestaurants.filter((r) => r.state === 'Active').map((r) => r.name.toLowerCase()),
  );
  const active = restaurantApplications.filter(
    (a) => a.status === 'Approved' && liveNames.has(a.restaurantName.toLowerCase()),
  ).length;

  return {
    stages: toFunnel([
      { id: 'submitted', label: 'Application submitted', count: submitted, hint: 'all applications received', href: '/admin/restaurants/applications' },
      { id: 'pending', label: 'Pending', count: submitted, hint: 'every application enters the queue', href: '/admin/restaurants/applications' },
      { id: 'review', label: 'Under review', count: underReview + approved, hint: 'reached assessment', href: '/admin/restaurants/applications' },
      { id: 'approved', label: 'Approved', count: approved, hint: 'cleared review', href: '/admin/restaurants/applications' },
      { id: 'active', label: 'Active restaurant', count: active, hint: 'menus live on the platform', href: '/admin/restaurants/active' },
    ]),
    exits: [
      { id: 'rejected', label: 'Rejected', count: byStatus('Rejected'), href: '/admin/restaurants/applications' },
      { id: 'changes', label: 'Needs changes', count: byStatus('Needs Changes'), href: '/admin/restaurants/applications' },
    ],
  };
}

export interface FlowGraph {
  nodes: (FlowNodeSeed & { count?: number })[];
  edges: FlowEdgeSeed[];
}

/**
 * The same eight nodes the funnel measures, counted as current occupancy:
 * how many applications sit at each point right now. The first node is total
 * intake, since nothing waits at "submitted".
 *
 * `active` deliberately counts the approved applications that went live, not
 * every active restaurant on the platform — the diagram follows this cohort,
 * and borrowing the platform total would contradict the funnel beside it.
 */
export function getRestaurantOnboardingFlow(): FlowGraph {
  const byStatus = (s: ApplicationStatus) =>
    restaurantApplications.filter((a) => a.status === s).length;

  const counts: Record<string, number> = {
    application: restaurantApplications.length,
    review: byStatus('Under Review'),
    decision: byStatus('Pending') + byStatus('Under Review'),
    approved: byStatus('Approved'),
    changes: byStatus('Needs Changes'),
    rejected: byStatus('Rejected'),
    active: getRestaurantOnboardingFunnel().stages[4].count,
    resubmit: byStatus('Needs Changes'),
  };

  return {
    nodes: onboardingFlowNodes.map((n) => ({ ...n, count: counts[n.id] })),
    edges: onboardingFlowEdges,
  };
}

/* ------------------------------------------------------------ order flow -- */

export function getOrderFlow(): FlowGraph {
  const nodes: (FlowNodeSeed & { count?: number })[] = orderStageCounts.map((s, i) => ({
    id: s.id,
    label: s.label,
    col: i % 4,
    row: Math.floor(i / 4),
    kind: i === 0 ? 'start' : i === orderStageCounts.length - 1 ? 'terminal' : 'step',
    href: s.href,
    count: s.count,
  }));

  nodes.push({
    id: 'cancelled',
    label: 'Cancelled',
    col: 3,
    row: 2,
    kind: 'warn',
    href: '/admin/orders',
    count: cancelledToday,
    hint: 'can happen at any stage before pickup',
  });

  const edges: FlowEdgeSeed[] = orderStageCounts
    .slice(0, -1)
    .map((s, i) => ({ from: s.id, to: orderStageCounts[i + 1].id }));
  edges.push({ from: 'confirmed', to: 'cancelled', label: 'any stage' });

  return { nodes, edges };
}

/* --------------------------------------------------------------- cuisine -- */

export interface CuisineRow {
  id: string;
  name: string;
  districtId: string;
  orders: number;
  /** Share of total orders, derived. */
  percentOfOrders: number;
  revenue: number;
  averageRating: number | null;
  restaurants: number;
}

export function getCuisinePerformance(f: AnalyticsFilters): CuisineRow[] {
  const { current } = windows(f);
  const periodOrders = sum(current, (d) => (f.orderStatus === 'completed' ? d.completed : d.orders));
  const totalWeight = analyticsCuisines.reduce((s, c) => s + c.weight, 0);

  const pool = analyticsCuisines.filter((c) => f.cuisineId === 'all' || c.id === f.cuisineId);
  const poolWeight = pool.reduce((s, c) => s + c.weight, 0);

  const rows = pool.map((c) => {
    const restaurants = platformRestaurants.filter(
      (r) =>
        restaurantCuisineCategory[r.id] === c.id &&
        (f.restaurantId === 'all' || r.id === f.restaurantId) &&
        (f.deliveryModel === 'all' || r.deliveryModel === f.deliveryModel),
    );

    const orders = Math.round(periodOrders * (c.weight / totalWeight));
    const ratingRows = ratedOrders.filter((x) =>
      restaurants.some((r) => r.id === x.restaurantId),
    );

    return {
      id: c.id,
      name: c.name,
      districtId: c.districtId,
      orders,
      percentOfOrders: poolWeight ? (c.weight / poolWeight) * 100 : 0,
      revenue: orders * c.aov,
      averageRating: ratingRows.length
        ? Number((ratingRows.reduce((s, x) => s + x.rating, 0) / ratingRows.length).toFixed(2))
        : null,
      restaurants: restaurants.length,
    };
  });

  return rows.sort((a, b) => b.orders - a.orders);
}

/* ------------------------------------------------------------ restaurant -- */

export interface RestaurantAnalyticsRow {
  id: string;
  name: string;
  cuisine: string;
  orders: number;
  revenue: number;
  averageRating: number | null;
  deliveryMinutes: number;
  deliveryModel: DeliveryModel;
  deliveryModelLabel: string;
  state: string;
  href: string;
}

function filteredRestaurants(f: AnalyticsFilters) {
  return platformRestaurants.filter(
    (r) =>
      (f.cuisineId === 'all' || restaurantCuisineCategory[r.id] === f.cuisineId) &&
      (f.restaurantId === 'all' || r.id === f.restaurantId) &&
      (f.deliveryModel === 'all' || r.deliveryModel === f.deliveryModel),
  );
}

function filteredRatings(f: AnalyticsFilters) {
  const ids = new Set(filteredRestaurants(f).map((r) => r.id));
  return ratedOrders.filter((r) => ids.has(r.restaurantId));
}

export function getRestaurantPerformance(f: AnalyticsFilters): RestaurantAnalyticsRow[] {
  const cuisineName = new Map(analyticsCuisines.map((c) => [c.id, c.name]));

  return filteredRestaurants(f)
    .filter((r) => r.totalOrders > 0)
    .map((r) => {
      const rows = ratedOrders.filter((x) => x.restaurantId === r.id);
      const categoryId = restaurantCuisineCategory[r.id];
      const aov = analyticsCuisines.find((c) => c.id === categoryId)?.aov ?? 450;

      return {
        id: r.id,
        name: r.name,
        cuisine: cuisineName.get(categoryId) ?? r.cuisines[0] ?? '—',
        orders: r.totalOrders,
        revenue: r.totalOrders * aov,
        averageRating: rows.length
          ? Number((rows.reduce((s, x) => s + x.rating, 0) / rows.length).toFixed(2))
          : null,
        deliveryMinutes: restaurantDeliveryMinutes[r.id] ?? 0,
        deliveryModel: r.deliveryModel,
        deliveryModelLabel: DELIVERY_MODEL_LABEL[r.deliveryModel],
        state: r.state,
        href: '/admin/restaurants/active',
      };
    })
    .sort((a, b) => b.orders - a.orders);
}

/* -------------------------------------------------------------- delivery -- */

export interface DeliveryModelRow {
  model: DeliveryModel;
  label: string;
  ordersHandled: number;
  completed: number;
  active: number;
  cancelled: number;
  /** Derived from total minutes, not stored alongside them. */
  averageMinutes: number;
  /** Derived from completed / handled. */
  completionRate: number;
}

export interface DeliveryAnalytics {
  models: DeliveryModelRow[];
  flow: FlowGraph;
}

export function getDeliveryAnalytics(f: AnalyticsFilters): DeliveryAnalytics {
  const models = deliveryModelFacts
    .filter((d) => f.deliveryModel === 'all' || d.model === f.deliveryModel)
    .map((d) => ({
      model: d.model,
      label: DELIVERY_MODEL_LABEL[d.model],
      ordersHandled: d.ordersHandled,
      completed: d.completed,
      active: d.active,
      cancelled: d.cancelled,
      averageMinutes: Number((d.totalMinutes / d.completed).toFixed(1)),
      completionRate: (d.completed / d.ordersHandled) * 100,
    }));

  const counts: Record<string, number> = {
    order: models.reduce((s, m) => s + m.ordersHandled, 0),
    choice: models.reduce((s, m) => s + m.ordersHandled, 0),
    'agg-assigned': deliveryModelFacts[0].active,
    'own-assigned': deliveryModelFacts[1].active,
    'agg-picked': Math.round(deliveryModelFacts[0].active * 0.6),
    'own-picked': Math.round(deliveryModelFacts[1].active * 0.6),
    'agg-delivered': deliveryModelFacts[0].completed,
    'own-delivered': deliveryModelFacts[1].completed,
  };

  return {
    models,
    flow: {
      nodes: deliveryFlowNodes.map((n) => ({ ...n, count: counts[n.id] })),
      edges: deliveryFlowEdges,
    },
  };
}

export type DeliveryMetric = 'minutes' | 'completed' | 'cancelled';

export const DELIVERY_METRICS: { id: DeliveryMetric; label: string; unit: 'count' | 'minutes' }[] = [
  { id: 'minutes', label: 'Average delivery time', unit: 'minutes' },
  { id: 'completed', label: 'Completed deliveries', unit: 'count' },
  { id: 'cancelled', label: 'Cancelled deliveries', unit: 'count' },
];

/** Two series — one per delivery model — so RULE-03/04 stay comparable. */
export function getDeliveryTrend(f: AnalyticsFilters, metric: DeliveryMetric): TrendSeries[] {
  const { current } = windows(f);
  const share = selectionShare(f);
  const unit = DELIVERY_METRICS.find((m) => m.id === metric)!.unit;

  const build = (id: DeliveryModel, label: string, pick: (d: DayPoint) => number): TrendSeries => {
    const points = current.map((d) => ({
      date: d.date,
      /* Minutes are an average, so they must not be scaled by selection size. */
      value: unit === 'minutes' ? pick(d) : Math.round(pick(d) * share),
    }));
    return {
      id,
      label,
      points,
      unit: unit === 'minutes' ? 'count' : unit,
      total: points.reduce((s, p) => s + p.value, 0),
      changePercent: null,
    };
  };

  const pickFor = (model: 'agg' | 'own') => (d: DayPoint) => {
    const orders = model === 'agg' ? d.aggregatorOrders : d.ownStaffOrders;
    if (metric === 'minutes') return model === 'agg' ? d.aggregatorMinutes : d.ownStaffMinutes;
    const cancelShare = d.orders ? d.cancelled / d.orders : 0;
    if (metric === 'cancelled') return Math.round(orders * cancelShare);
    return orders - Math.round(orders * cancelShare);
  };

  const all: TrendSeries[] = [
    build('aggregator', DELIVERY_MODEL_LABEL.aggregator, pickFor('agg')),
    build('own_staff', DELIVERY_MODEL_LABEL.own_staff, pickFor('own')),
  ];

  return f.deliveryModel === 'all' ? all : all.filter((s) => s.id === f.deliveryModel);
}

/* -------------------------------------------------------------- customers -- */

export type CustomerMetric = 'new' | 'active' | 'total';

export const CUSTOMER_METRICS: { id: CustomerMetric; label: string }[] = [
  { id: 'new', label: 'New customers' },
  { id: 'active', label: 'Active customers' },
  { id: 'total', label: 'Total customers' },
];

export function getCustomerGrowth(f: AnalyticsFilters, metric: CustomerMetric): TrendSeries {
  const { current, previous } = windows(f);

  /* Total is a running count, so it accumulates from a base rather than
     re-reading a column that does not exist per day. */
  let running = 2418 - sum(current, (d) => d.newCustomers);

  const points = current.map((d) => {
    running += d.newCustomers;
    const value = metric === 'new' ? d.newCustomers : metric === 'active' ? d.activeCustomers : running;
    return { date: d.date, value };
  });

  const total = metric === 'total' ? (last(points)?.value ?? 0) : points.reduce((s, p) => s + p.value, 0);
  const prev =
    metric === 'total'
      ? running - sum(current, (d) => d.newCustomers)
      : sum(previous, (d) => (metric === 'new' ? d.newCustomers : d.activeCustomers));

  return {
    id: metric,
    label: CUSTOMER_METRICS.find((m) => m.id === metric)!.label,
    points,
    unit: 'count',
    total,
    changePercent: change(total, prev),
  };
}

export function getCustomerFunnel(): FunnelStage[] {
  return toFunnel(customerFunnelSeed);
}

/* ---------------------------------------------------------------- ratings -- */

export interface RatingAnalytics {
  distribution: { stars: number; count: number; percent: number }[];
  totalReviews: number;
  averageRating: number;
  fiveStarPercent: number;
  lowRatingPercent: number;
  byRestaurant: { id: string; name: string; rating: number; reviews: number }[];
}

export function getRatingAnalytics(f: AnalyticsFilters): RatingAnalytics {
  const rows = filteredRatings(f);
  const total = rows.length;

  /* Floor, not round: 4.5 belongs in the four-star band. Rounding it up would
     empty the 4★ bar and overstate the 5★ one, which is the single number
     people read off a ratings histogram. */
  const bucket = (r: number) => Math.min(5, Math.max(1, Math.floor(r)));

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = rows.filter((r) => bucket(r.rating) === stars).length;
    return { stars, count, percent: total ? (count / total) * 100 : 0 };
  });

  const byRestaurant = filteredRestaurants(f)
    .map((r) => {
      const mine = rows.filter((x) => x.restaurantId === r.id);
      return {
        id: r.id,
        name: r.name,
        rating: mine.length ? mine.reduce((s, x) => s + x.rating, 0) / mine.length : 0,
        reviews: mine.length,
      };
    })
    .filter((r) => r.reviews > 0)
    .sort((a, b) => b.rating - a.rating);

  return {
    distribution,
    totalReviews: total,
    averageRating: total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0,
    fiveStarPercent: total ? (rows.filter((r) => bucket(r.rating) === 5).length / total) * 100 : 0,
    lowRatingPercent: total
      ? (rows.filter((r) => r.rating < LOW_RATING_BELOW).length / total) * 100
      : 0,
    byRestaurant,
  };
}

/* ---------------------------------------------------------------- revenue -- */

export type RevenueView = 'daily' | 'weekly' | 'monthly';

export const REVENUE_VIEWS: { id: RevenueView; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export interface RevenueAnalytics {
  series: TrendSeries;
  totalRevenue: number;
  averageOrderValue: number;
  revenuePerRestaurant: number;
}

export function getRevenueAnalytics(f: AnalyticsFilters, view: RevenueView): RevenueAnalytics {
  const { current, previous } = windows(f);
  const share = selectionShare(f);

  /* Weekly and monthly are the daily rows bucketed, not a separate series —
     the totals have to agree however you slice them. */
  const size = view === 'daily' ? 1 : view === 'weekly' ? 7 : 30;
  const buckets: TrendPoint[] = [];
  for (let i = 0; i < current.length; i += size) {
    const slice = current.slice(i, i + size);
    if (!slice.length) continue;
    buckets.push({
      date: slice[0].date,
      value: Math.round(sum(slice, (d) => d.revenue) * share),
    });
  }

  const totalRevenue = Math.round(sum(current, (d) => d.revenue) * share);
  const prevRevenue = Math.round(sum(previous, (d) => d.revenue) * share);
  const completed = Math.round(sum(current, (d) => d.completed) * share);
  const restaurants = filteredRestaurants(f).filter((r) => r.state === 'Active').length;

  return {
    series: {
      id: view,
      label: `${REVENUE_VIEWS.find((v) => v.id === view)!.label} revenue`,
      points: buckets,
      unit: 'money',
      total: totalRevenue,
      changePercent: change(totalRevenue, prevRevenue),
    },
    totalRevenue,
    averageOrderValue: completed ? Math.round(totalRevenue / completed) : 0,
    revenuePerRestaurant: restaurants ? Math.round(totalRevenue / restaurants) : 0,
  };
}

/* --------------------------------------------------------- business rules -- */

export interface RuleMonitor {
  improvement: {
    threshold: { below: number; minOrders: number };
    rows: { restaurantId: string; restaurant: string; lowRatedOrders: number; averageRating: number; planStatus: string }[];
  };
  concession: {
    threshold: { above: number; minOrders: number; windowDays: number };
    rows: ConcessionRow[];
    eligible: ConcessionRow[];
  };
}

/**
 * Both rules, straight from `adminService`.
 *
 * Re-deriving them here would create a second definition that could drift from
 * the one the overview and the fee screen use. The averages are added for
 * display only.
 */
export function getBusinessRuleMonitor(): RuleMonitor {
  const attention = getRestaurantsRequiringAttention().map((a) => {
    const rows = ratedOrders.filter(
      (r) => r.restaurantId === a.restaurantId && r.rating < LOW_RATING_BELOW,
    );
    return {
      restaurantId: a.restaurantId,
      restaurant: a.restaurant,
      lowRatedOrders: a.lowRatedOrders,
      averageRating: Number((rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(2)),
      planStatus: a.plan?.status ?? 'Plan Required',
    };
  });

  const candidates = getConcessionCandidates();

  return {
    improvement: {
      threshold: { below: LOW_RATING_BELOW, minOrders: LOW_RATING_MIN_ORDERS },
      rows: attention,
    },
    concession: {
      threshold: {
        above: HIGH_RATING_ABOVE,
        minOrders: HIGH_RATING_MIN_ORDERS,
        windowDays: HIGH_RATING_WINDOW_DAYS,
      },
      rows: candidates,
      eligible: candidates.filter((c) => c.eligible),
    },
  };
}

export interface RuleAlert {
  id: string;
  label: string;
  count: number;
  hint: string;
  href: string;
  tone: 'urgent' | 'opportunity' | 'queue';
}

export function getBusinessRuleAlerts(): RuleAlert[] {
  const monitor = getBusinessRuleMonitor();
  const byStatus = (s: ApplicationStatus) =>
    restaurantApplications.filter((a) => a.status === s).length;

  const lowRated = new Set(
    ratedOrders.filter((r) => r.rating < LOW_RATING_BELOW).map((r) => r.restaurantId),
  ).size;

  return [
    {
      id: 'improvement',
      label: 'Improvement plans required',
      count: monitor.improvement.rows.length,
      hint: `below ${LOW_RATING_BELOW}★ on more than ${LOW_RATING_MIN_ORDERS} orders`,
      href: '/admin/improvement-plans',
      tone: 'urgent',
    },
    {
      id: 'concession',
      label: 'Service-fee concessions eligible',
      count: monitor.concession.eligible.length,
      hint: `above ${HIGH_RATING_ABOVE}★ on ${HIGH_RATING_MIN_ORDERS} orders in a week`,
      href: '/admin/fees',
      tone: 'opportunity',
    },
    {
      id: 'awaiting',
      label: 'Applications awaiting review',
      count: byStatus('Pending'),
      hint: 'not yet opened by an admin',
      href: '/admin/restaurants/applications',
      tone: 'queue',
    },
    {
      id: 'under-review',
      label: 'Restaurants under review',
      count: byStatus('Under Review'),
      hint: 'assessment in progress',
      href: '/admin/restaurants/applications',
      tone: 'queue',
    },
    {
      id: 'low-rated',
      label: 'Restaurants with low ratings',
      count: lowRated,
      hint: `at least one order below ${LOW_RATING_BELOW}★`,
      href: '/admin/ratings',
      tone: 'urgent',
    },
  ];
}

/* --------------------------------------------------------- platform health -- */

export interface HealthIndicator {
  id: string;
  label: string;
  percent: number;
  /** What the number is a ratio of — a bare percentage means nothing. */
  basis: string;
  tone: 'good' | 'fair' | 'poor';
}

function tone(p: number): HealthIndicator['tone'] {
  return p >= 80 ? 'good' : p >= 60 ? 'fair' : 'poor';
}

/**
 * Every figure is a stated ratio of two counts. No composite "score" with a
 * secret formula — an admin has to be able to ask what 82% means and get an
 * answer.
 */
export function getPlatformHealth(f: AnalyticsFilters): HealthIndicator[] {
  const { current } = windows(f);
  const restaurants = filteredRestaurants(f);
  const active = restaurants.filter((r) => r.state === 'Active').length;

  const orders = sum(current, (d) => d.orders);
  const completed = sum(current, (d) => d.completed);

  const ratings = filteredRatings(f);
  const goodRatings = ratings.filter((r) => r.rating >= 4).length;

  const reviewed = restaurantApplications.filter((a) => a.status !== 'Pending').length;

  const delivery = deliveryModelFacts.reduce(
    (acc, d) => ({ handled: acc.handled + d.ordersHandled, done: acc.done + d.completed }),
    { handled: 0, done: 0 },
  );

  const customersOrdering = customerFunnelSeed[2].count / customerFunnelSeed[1].count;

  const build = (id: string, label: string, percent: number, basis: string): HealthIndicator => ({
    id,
    label,
    percent: Number(percent.toFixed(1)),
    basis,
    tone: tone(percent),
  });

  return [
    build('restaurants', 'Restaurant health', restaurants.length ? (active / restaurants.length) * 100 : 0, `${active} of ${restaurants.length} restaurants active`),
    build('customers', 'Customer activity', customersOrdering * 100, `${customerFunnelSeed[2].count.toLocaleString('en-IN')} of ${customerFunnelSeed[1].count.toLocaleString('en-IN')} registered have ordered`),
    build('orders', 'Order activity', orders ? (completed / orders) * 100 : 0, `${completed.toLocaleString('en-IN')} of ${orders.toLocaleString('en-IN')} orders completed`),
    build('delivery', 'Delivery performance', delivery.handled ? (delivery.done / delivery.handled) * 100 : 0, `${delivery.done.toLocaleString('en-IN')} of ${delivery.handled.toLocaleString('en-IN')} deliveries completed`),
    build('ratings', 'Rating health', ratings.length ? (goodRatings / ratings.length) * 100 : 0, `${goodRatings.toLocaleString('en-IN')} of ${ratings.length.toLocaleString('en-IN')} orders rated 4★ or better`),
    build('onboarding', 'Onboarding health', restaurantApplications.length ? (reviewed / restaurantApplications.length) * 100 : 0, `${reviewed} of ${restaurantApplications.length} applications progressed past Pending`),
  ];
}

/* --------------------------------------------------------------- activity -- */

export function getRecentActivity(limit = 8): ActivityEntry[] {
  return recentActivity.slice(0, limit);
}

/** Freshness stamp for the header. Fixed, like `MOCK_TODAY`. */
export function getLastUpdated(): Date {
  return MOCK_TODAY;
}

/* ----------------------------------------------------------------- export -- */

/**
 * CSV for now. Structured as rows-plus-filename so a PDF writer can take the
 * same input later without the button changing.
 */
export interface ExportPayload {
  filename: string;
  rows: (string | number)[][];
}

export function buildAnalyticsExport(f: AnalyticsFilters): ExportPayload {
  const rows: (string | number)[][] = [['Section', 'Metric', 'Value', 'Detail']];

  for (const m of getOverviewMetrics(f)) {
    rows.push(['Overview', m.label, m.display, m.changePercent === null ? m.hint : `${m.changePercent.toFixed(1)}% ${m.hint}`]);
  }
  for (const p of getOrderTrend(f, 'orders').points) {
    rows.push(['Order trend', p.date, p.value, 'orders']);
  }
  for (const c of getCuisinePerformance(f)) {
    rows.push(['Cuisine', c.name, c.orders, `revenue ₹${c.revenue}; rating ${c.averageRating ?? 'n/a'}; ${c.restaurants} restaurants`]);
  }
  for (const r of getRestaurantPerformance(f)) {
    rows.push(['Restaurant', r.name, r.orders, `revenue ₹${r.revenue}; rating ${r.averageRating ?? 'n/a'}; ${r.deliveryMinutes} min; ${r.state}`]);
  }
  for (const d of getDeliveryAnalytics(f).models) {
    rows.push(['Delivery', d.label, d.ordersHandled, `${d.completionRate.toFixed(1)}% completed; ${d.averageMinutes} min average`]);
  }
  for (const h of getPlatformHealth(f)) {
    rows.push(['Platform health', h.label, `${h.percent}%`, h.basis]);
  }
  for (const a of getBusinessRuleAlerts()) {
    rows.push(['Business rules', a.label, a.count, a.hint]);
  }

  return { filename: `analytics-${f.range}-${MOCK_TODAY.toISOString().slice(0, 10)}.csv`, rows };
}

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : String(c))).join(','))
    .join('\n');
}
