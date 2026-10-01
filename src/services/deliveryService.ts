/**
 * deliveryService — the only way the UI reads the delivery workforce.
 *
 * The page computes nothing. Every total, share, average, completion rate and
 * salary figure arrives from here finished, for the same reason the analytics
 * page works that way: a figure derived in a component is a figure that exists
 * in one place and can quietly disagree with the same figure two sections
 * down.
 *
 * The salary bill is the sharp end of that. It is headcount × a constant and
 * it is never typed in, so adding a partner to `data/deliveryData.ts` moves
 * the card, the analytics panel and the eight-month graph together.
 *
 * Replacing the mock source with Supabase changes the bodies here and nothing
 * else. Every function already returns what one query would.
 */
import {
  BASE_MONTHLY_SALARY, deliveryPartners, DELIVERY_TODAY, EXPIRING_SOON_DAYS,
  INSURANCE_STATUSES, PARTNER_STATUSES, partnerFlowEdges, partnerFlowNodes,
  SALARY_HISTORY_MONTHS, shiftCover,
  type DeliveryPartner, type InsuranceStatus, type PartnerStatus,
} from '../data/deliveryData';
import { dailySeries } from '../data/admin/analytics';
import { DELIVERY_MODEL_LABEL, type DeliveryModel } from '../data/admin/types';

export { BASE_MONTHLY_SALARY };
export type { DeliveryPartner, InsuranceStatus, PartnerStatus };

const day = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

/* --------------------------------------------------------- eligibility -- */

/**
 * Who the monthly salary bill is for.
 *
 * A rider on leave is still employed and still paid; an inactive one has
 * stopped riding. That is the line, and it is drawn here rather than stored on
 * the row, so "who do we pay" stays one decision in one place instead of
 * twenty-four booleans that can drift apart.
 */
export function isSalaryEligible(p: DeliveryPartner): boolean {
  return p.status !== 'Inactive';
}

/* ------------------------------------------------------------- partners -- */

export function getDeliveryPartners(): DeliveryPartner[] {
  return deliveryPartners;
}

export function getDeliveryPartner(id: string): DeliveryPartner | undefined {
  return deliveryPartners.find((p) => p.id === id);
}

/** A rider's own completion rate, for the detail view and the orders chart. */
export function getPartnerCompletionRate(p: DeliveryPartner): number {
  return p.ordersAssigned ? (p.ordersCompleted / p.ordersAssigned) * 100 : 0;
}

/* ------------------------------------------------------------- overview -- */

export interface DeliveryOverview {
  totalPartners: number;
  byStatus: { status: PartnerStatus; count: number; percent: number }[];
  available: number;
  onDelivery: number;
  onLeave: number;
  inactive: number;
  /** "Active" is everyone not inactive — the workforce actually on the books. */
  activePartners: number;
  salaryEligible: number;
  baseSalary: number;
  monthlySalaryCost: number;
  /** Equal to the base salary while everyone is on the same rate; computed anyway. */
  averageSalary: number;
  insured: number;
  insurancePending: number;
  insuranceExpired: number;
}

export function getDeliveryOverview(): DeliveryOverview {
  const partners = deliveryPartners;
  const count = (s: PartnerStatus) => partners.filter((p) => p.status === s).length;
  const insurance = (s: InsuranceStatus) =>
    partners.filter((p) => p.insurance.status === s).length;

  const salaryEligible = partners.filter(isSalaryEligible).length;
  const monthlySalaryCost = salaryEligible * BASE_MONTHLY_SALARY;

  return {
    totalPartners: partners.length,
    byStatus: PARTNER_STATUSES.map((status) => ({
      status,
      count: count(status),
      percent: partners.length ? (count(status) / partners.length) * 100 : 0,
    })),
    available: count('Available'),
    onDelivery: count('On Delivery'),
    onLeave: count('On Leave'),
    inactive: count('Inactive'),
    activePartners: partners.filter((p) => p.status !== 'Inactive').length,
    salaryEligible,
    baseSalary: BASE_MONTHLY_SALARY,
    monthlySalaryCost,
    /* Divided, not assumed. If a second pay band ever arrives this keeps
       telling the truth instead of repeating the constant. */
    averageSalary: salaryEligible ? monthlySalaryCost / salaryEligible : 0,
    insured: insurance('Covered'),
    insurancePending: insurance('Pending'),
    insuranceExpired: insurance('Expired'),
  };
}

/* --------------------------------------------------------------- salary -- */

export interface SalaryAnalytics {
  baseSalary: number;
  salaryEligible: number;
  monthlySalaryCost: number;
  averageSalary: number;
  /** Partners excluded from the bill, so the gap against the headcount is visible. */
  excluded: number;
  history: { date: string; value: number }[];
}

/**
 * The bill, and how it got here.
 *
 * The history counts, for each of the last months, the salary-eligible riders
 * who had already joined by the end of it — so the line is headcount growth
 * priced at the base salary, drawn from the joining dates rather than invented.
 *
 * One honest limitation: a rider inactive *today* is treated as having been
 * ineligible all along, because the mock rows carry no employment history.
 * Real data would carry a status log and this would read from it.
 */
export function getSalaryAnalytics(): SalaryAnalytics {
  const eligible = deliveryPartners.filter(isSalaryEligible);
  const history: { date: string; value: number }[] = [];

  for (let i = SALARY_HISTORY_MONTHS - 1; i >= 0; i -= 1) {
    const month = new Date(
      Date.UTC(DELIVERY_TODAY.getUTCFullYear(), DELIVERY_TODAY.getUTCMonth() - i, 1),
    );
    /* Last instant of that month, so someone who joined on the 28th counts. */
    const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
    const headcount = eligible.filter((p) => p.joinedAt <= iso(end)).length;
    history.push({ date: iso(month), value: headcount * BASE_MONTHLY_SALARY });
  }

  return {
    baseSalary: BASE_MONTHLY_SALARY,
    salaryEligible: eligible.length,
    monthlySalaryCost: eligible.length * BASE_MONTHLY_SALARY,
    averageSalary: eligible.length ? BASE_MONTHLY_SALARY : 0,
    excluded: deliveryPartners.length - eligible.length,
    history,
  };
}

/* ---------------------------------------------------------- performance -- */

export type PerformanceGrain = 'daily' | 'weekly' | 'monthly';

export const PERFORMANCE_GRAINS: { id: PerformanceGrain; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export interface DeliveryPerformance {
  totalDeliveries: number;
  completed: number;
  active: number;
  cancelled: number;
  completionRate: number;
  cancellationRate: number;
  averageMinutes: number;
  averageRating: number;
  trend: { date: string; value: number }[];
  trendLabel: string;
}

/**
 * Platform delivery performance, over the same day series the analytics page
 * reads.
 *
 * Deliberately not a second series of its own. Every order on this platform is
 * a delivery, so inventing separate delivery numbers would let two pages
 * report different totals for the same events — and whichever a person read
 * first would be the one they trusted.
 */
export function getDeliveryPerformance(grain: PerformanceGrain = 'daily'): DeliveryPerformance {
  const completed = dailySeries.reduce((s, d) => s + d.completed, 0);
  const cancelled = dailySeries.reduce((s, d) => s + d.cancelled, 0);
  const total = completed + cancelled;

  /* In flight right now — from the riders, who are the ones holding them. */
  const active = deliveryPartners.filter((p) => p.status === 'On Delivery').length;

  const rated = deliveryPartners.filter((p) => p.ordersCompleted > 0);
  const weightedMinutes = rated.reduce((s, p) => s + p.averageMinutes * p.ordersCompleted, 0);
  const weightedRating = rated.reduce((s, p) => s + p.rating * p.ordersCompleted, 0);
  const ratedOrders = rated.reduce((s, p) => s + p.ordersCompleted, 0);

  return {
    totalDeliveries: total,
    completed,
    active,
    cancelled,
    completionRate: total ? (completed / total) * 100 : 0,
    cancellationRate: total ? (cancelled / total) * 100 : 0,
    /* Weighted by volume: a rider with 600 deliveries should move the platform
       average more than one with 21. A flat mean of the averages would let the
       newest hire drag it as hard as the busiest. */
    averageMinutes: ratedOrders ? weightedMinutes / ratedOrders : 0,
    averageRating: ratedOrders ? weightedRating / ratedOrders : 0,
    trend: rollUp(grain),
    trendLabel: 'Completed deliveries',
  };
}

/** Buckets the day series by the chosen grain, summing completed deliveries. */
function rollUp(grain: PerformanceGrain): { date: string; value: number }[] {
  if (grain === 'daily') {
    return dailySeries.map((d) => ({ date: d.date, value: d.completed }));
  }

  const buckets = new Map<string, number>();
  for (const d of dailySeries) {
    const at = new Date(`${d.date}T00:00:00Z`);
    const key =
      grain === 'monthly'
        ? iso(new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1)))
        : /* Week starting Monday, so a bar is a working week. */
          iso(new Date(at.getTime() - ((at.getUTCDay() + 6) % 7) * day));
    buckets.set(key, (buckets.get(key) ?? 0) + d.completed);
  }
  return [...buckets.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* --------------------------------------------------------------- orders -- */

export interface PartnerOrderRow {
  id: string;
  name: string;
  assigned: number;
  completed: number;
  cancelled: number;
  completionRate: number;
}

/** Orders per rider, busiest first — the input to the distribution chart. */
export function getDeliveryOrders(): PartnerOrderRow[] {
  return deliveryPartners
    .map((p) => ({
      id: p.id,
      name: p.name,
      assigned: p.ordersAssigned,
      completed: p.ordersCompleted,
      cancelled: p.ordersCancelled,
      completionRate: getPartnerCompletionRate(p),
    }))
    .sort((a, b) => b.assigned - a.assigned);
}

export function getOrderTotals() {
  const assigned = deliveryPartners.reduce((s, p) => s + p.ordersAssigned, 0);
  const completed = deliveryPartners.reduce((s, p) => s + p.ordersCompleted, 0);
  const cancelled = deliveryPartners.reduce((s, p) => s + p.ordersCancelled, 0);
  return {
    assigned,
    completed,
    cancelled,
    completionRate: assigned ? (completed / assigned) * 100 : 0,
  };
}

/* ------------------------------------------------------------ insurance -- */

export interface InsuranceAnalytics {
  total: number;
  covered: number;
  pending: number;
  expired: number;
  coveragePercent: number;
  breakdown: { status: InsuranceStatus; count: number; percent: number }[];
  expiringSoon: {
    id: string;
    name: string;
    provider: string;
    policyId: string;
    expiresOn: string;
    daysLeft: number;
  }[];
}

/**
 * Cover, and what is about to lapse.
 *
 * "Expiring soon" is computed against `DELIVERY_TODAY` rather than stored as a
 * flag, so a policy moves into and out of the list by its own date. Already
 * expired policies are excluded — they belong under Expired, which is a
 * different problem from one you still have time to fix.
 */
export function getInsuranceAnalytics(): InsuranceAnalytics {
  const total = deliveryPartners.length;
  const count = (s: InsuranceStatus) =>
    deliveryPartners.filter((p) => p.insurance.status === s).length;

  const covered = count('Covered');
  const horizon = DELIVERY_TODAY.getTime() + EXPIRING_SOON_DAYS * day;

  const expiringSoon = deliveryPartners
    .filter((p) => p.insurance.status === 'Covered' && p.insurance.coverageEnd)
    .map((p) => {
      const end = new Date(`${p.insurance.coverageEnd}T00:00:00Z`).getTime();
      return {
        id: p.id,
        name: p.name,
        provider: p.insurance.provider ?? '—',
        policyId: p.insurance.policyId ?? '—',
        expiresOn: p.insurance.coverageEnd!,
        daysLeft: Math.round((end - DELIVERY_TODAY.getTime()) / day),
      };
    })
    .filter((r) => r.daysLeft >= 0 && new Date(`${r.expiresOn}T00:00:00Z`).getTime() <= horizon)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    total,
    covered,
    pending: count('Pending'),
    expired: count('Expired'),
    coveragePercent: total ? (covered / total) * 100 : 0,
    breakdown: INSURANCE_STATUSES.map((status) => ({
      status,
      count: count(status),
      percent: total ? (count(status) / total) * 100 : 0,
    })),
    expiringSoon,
  };
}

/* --------------------------------------------------------- availability -- */

export interface ShiftRow {
  id: string;
  label: string;
  window: string;
  available: number;
  onDelivery: number;
  onLeave: number;
  onShift: number;
}

export function getWorkforceAvailability(): ShiftRow[] {
  return shiftCover.map((s) => ({
    ...s,
    /* Everyone the shift can call on: on leave is not cover. */
    onShift: s.available + s.onDelivery,
  }));
}

/* ------------------------------------------------------- model + providers -- */

export interface ProviderRow {
  provider: string;
  model: DeliveryModel;
  modelLabel: string;
  riders: number;
  completed: number;
  cancelled: number;
  averageMinutes: number;
  completionRate: number;
}

/**
 * Who the riders ride for, grouped.
 *
 * Built from the rider rows rather than kept as a second list of companies,
 * so a provider cannot appear here with nobody working for it, and cannot be
 * missed when someone is.
 */
export function getDeliveryProviders(): ProviderRow[] {
  const byProvider = new Map<string, DeliveryPartner[]>();
  for (const p of deliveryPartners) {
    const list = byProvider.get(p.provider) ?? [];
    list.push(p);
    byProvider.set(p.provider, list);
  }

  return [...byProvider.entries()]
    .map(([provider, riders]) => {
      const assigned = riders.reduce((s, p) => s + p.ordersAssigned, 0);
      const completed = riders.reduce((s, p) => s + p.ordersCompleted, 0);
      const minutes = riders.reduce((s, p) => s + p.averageMinutes * p.ordersCompleted, 0);
      return {
        provider,
        model: riders[0].deliveryModel,
        modelLabel: DELIVERY_MODEL_LABEL[riders[0].deliveryModel],
        riders: riders.length,
        completed,
        cancelled: riders.reduce((s, p) => s + p.ordersCancelled, 0),
        averageMinutes: completed ? minutes / completed : 0,
        completionRate: assigned ? (completed / assigned) * 100 : 0,
      };
    })
    .sort((a, b) => b.completed - a.completed);
}

export interface ModelComparisonRow {
  model: DeliveryModel;
  label: string;
  riders: number;
  assigned: number;
  completed: number;
  cancelled: number;
  averageMinutes: number;
  cancellationRate: number;
}

/**
 * RULE-03 against RULE-04, side by side.
 *
 * Counted from the riders, because this page is about the workforce. It
 * deliberately carries no fee figures: the client has not given us the
 * aggregator rate or the own-delivery rate, and a comparison that invented
 * them would be the one number on the page nobody agreed to.
 */
export function getDeliveryModelComparison(): ModelComparisonRow[] {
  return (['aggregator', 'own_staff'] as DeliveryModel[]).map((model) => {
    const riders = deliveryPartners.filter((p) => p.deliveryModel === model);
    const assigned = riders.reduce((s, p) => s + p.ordersAssigned, 0);
    const completed = riders.reduce((s, p) => s + p.ordersCompleted, 0);
    const cancelled = riders.reduce((s, p) => s + p.ordersCancelled, 0);
    const minutes = riders.reduce((s, p) => s + p.averageMinutes * p.ordersCompleted, 0);
    return {
      model,
      label: DELIVERY_MODEL_LABEL[model],
      riders: riders.length,
      assigned,
      completed,
      cancelled,
      averageMinutes: completed ? minutes / completed : 0,
      cancellationRate: assigned ? (cancelled / assigned) * 100 : 0,
    };
  });
}

/* ----------------------------------------------------------------- flow -- */

/**
 * The delivery lifecycle with live counts on it.
 *
 * Numbers are riders sitting at each point now, and only at the points where
 * a rider can actually sit. Delivered and Cancelled carry none: the obvious
 * thing to put there is a lifetime order count, which would read "6,456"
 * beside "11" on one diagram and silently mean something else.
 */
export function getDeliveryStatusFlow() {
  const at = (s: PartnerStatus) => deliveryPartners.filter((p) => p.status === s).length;
  const riding = at('On Delivery');

  const counts: Record<string, number> = {
    available: at('Available'),
    assigned: riding,
    picked: Math.round(riding * 0.6),
    out: riding - Math.round(riding * 0.6),
  };

  return {
    nodes: partnerFlowNodes.map((n) => ({ ...n, count: counts[n.id] })),
    edges: partnerFlowEdges,
  };
}

/* -------------------------------------------------------------- filters -- */

export interface PartnerFilters {
  search: string;
  status: PartnerStatus | 'all';
  insurance: InsuranceStatus | 'all';
}

export const DEFAULT_PARTNER_FILTERS: PartnerFilters = {
  search: '',
  status: 'all',
  insurance: 'all',
};

/** One filter pass, so the table and its count can never disagree. */
export function filterPartners(f: PartnerFilters): DeliveryPartner[] {
  const q = f.search.trim().toLowerCase();
  return deliveryPartners.filter((p) => {
    if (f.status !== 'all' && p.status !== f.status) return false;
    if (f.insurance !== 'all' && p.insurance.status !== f.insurance) return false;
    if (!q) return true;
    return `${p.id} ${p.name} ${p.email} ${p.phone} ${p.provider}`.toLowerCase().includes(q);
  });
}
