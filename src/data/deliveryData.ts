/**
 * Delivery workforce seed data.
 *
 * Note the entity. `data/admin/types.ts` already has a `DeliveryPartner`, and
 * it is a *company* — QuickDrop, PedalPost, the couriers the platform buys
 * capacity from. The rows here are **people**: the riders who carry the food,
 * each with a salary, an insurance policy and a shift. They are two different
 * tables that the brief happens to give the same English name, so this file
 * calls the company a `provider` throughout and keeps `partner` for the rider.
 *
 * The same two rules as everywhere else apply.
 *
 * 1. Nothing here is a conclusion. There is no `monthlySalaryCost: 43200` and
 *    no `coveragePercent: 79`. Counts and dates go in; every total, share and
 *    verdict is computed in `services/deliveryService.ts`. The salary bill in
 *    particular must move when a partner is added, which it cannot do if it
 *    is typed in.
 * 2. Rows that fail are included on purpose — expired insurance, a rider under
 *    3★, a month with no joiners — so the derivations are shown to bite rather
 *    than merely asserted.
 *
 * Shaped like the tables it becomes: `delivery_partners`, `partner_insurance`,
 * `shift_availability`. Swapping in Supabase changes `deliveryService`, not
 * this file's shape and not a single component.
 */
import type { FlowEdgeSeed, FlowNodeSeed } from './admin/analytics';
import { MOCK_TODAY } from './admin/platform';
import type { DeliveryModel } from './admin/types';

/** What a rider is doing right now. */
export type PartnerStatus = 'Available' | 'On Delivery' | 'On Leave' | 'Inactive';

export const PARTNER_STATUSES: PartnerStatus[] = [
  'Available',
  'On Delivery',
  'On Leave',
  'Inactive',
];

export type InsuranceStatus = 'Covered' | 'Pending' | 'Expired';

export const INSURANCE_STATUSES: InsuranceStatus[] = ['Covered', 'Pending', 'Expired'];

export type PaymentStatus = 'Paid' | 'Processing' | 'On Hold';

/**
 * Base monthly salary for one delivery partner, in rupees.
 *
 * ₹1,800 a month, and it is the same for everyone — which is why there is no
 * `salary` column on the row below. A per-row salary would be a number that
 * could silently disagree with this one; the bill is headcount × this.
 */
export const BASE_MONTHLY_SALARY = 1800;

/** table: partner_insurance */
export interface PartnerInsurance {
  status: InsuranceStatus;
  /** Null while an application is still pending — there is no insurer yet. */
  provider: string | null;
  policyId: string | null;
  coverageStart: string | null;
  coverageEnd: string | null;
}

/** table: delivery_partners — one row per rider. */
export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  status: PartnerStatus;
  /**
   * Which model this rider works under, and for whom.
   *
   * `provider` is the aggregator company, or the restaurant whose own staff
   * they are — RULE-03 and RULE-04 turn on exactly this distinction.
   */
  deliveryModel: DeliveryModel;
  provider: string;
  ordersAssigned: number;
  ordersCompleted: number;
  ordersCancelled: number;
  /** Average door-to-door minutes across their completed deliveries. */
  averageMinutes: number;
  /** Customer rating, averaged over their rated deliveries. */
  rating: number;
  paymentStatus: PaymentStatus;
  lastPaidOn: string;
  insurance: PartnerInsurance;
}

/**
 * The workforce.
 *
 * Twenty-four riders across four aggregators and three restaurants running
 * their own staff. Joining dates are spread across two years on purpose: the
 * salary-cost graph counts who had joined by each month, so a flat set of
 * dates would draw a flat line that proves nothing.
 */
export const deliveryPartners: DeliveryPartner[] = [
  {
    id: 'DP-001', name: 'Imran Shaikh', email: 'imran.shaikh@sns.in', phone: '+91 98201 44112',
    joinedAt: '2025-01-14', status: 'Available', deliveryModel: 'aggregator', provider: 'QuickDrop',
    ordersAssigned: 612, ordersCompleted: 598, ordersCancelled: 14, averageMinutes: 27.4, rating: 4.8,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'ICICI Lombard', policyId: 'IL-2291-4471', coverageStart: '2026-01-01', coverageEnd: '2026-12-31' },
  },
  {
    id: 'DP-002', name: 'Pooja Raut', email: 'pooja.raut@sns.in', phone: '+91 99304 20718',
    joinedAt: '2025-02-02', status: 'On Delivery', deliveryModel: 'aggregator', provider: 'QuickDrop',
    ordersAssigned: 584, ordersCompleted: 571, ordersCancelled: 13, averageMinutes: 25.9, rating: 4.7,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'ICICI Lombard', policyId: 'IL-2291-4472', coverageStart: '2026-01-01', coverageEnd: '2026-10-18' },
  },
  {
    id: 'DP-003', name: 'Sandeep Yadav', email: 'sandeep.yadav@sns.in', phone: '+91 98335 77201',
    joinedAt: '2025-03-19', status: 'Available', deliveryModel: 'aggregator', provider: 'PedalPost',
    ordersAssigned: 497, ordersCompleted: 482, ordersCancelled: 15, averageMinutes: 31.2, rating: 4.4,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Bharti AXA', policyId: 'BA-7730-1182', coverageStart: '2025-11-01', coverageEnd: '2026-10-31' },
  },
  {
    id: 'DP-004', name: 'Farhan Qureshi', email: 'farhan.qureshi@sns.in', phone: '+91 97021 55390',
    joinedAt: '2025-04-07', status: 'On Delivery', deliveryModel: 'aggregator', provider: 'CityRunner',
    ordersAssigned: 531, ordersCompleted: 509, ordersCancelled: 22, averageMinutes: 29.8, rating: 4.3,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Reliance General', policyId: 'RG-5518-0094', coverageStart: '2026-02-15', coverageEnd: '2027-02-14' },
  },
  {
    id: 'DP-005', name: 'Meera Pillai', email: 'meera.pillai@sns.in', phone: '+91 98451 30066',
    joinedAt: '2025-05-23', status: 'Available', deliveryModel: 'own_staff', provider: "Anna's Tiffin Room",
    ordersAssigned: 412, ordersCompleted: 406, ordersCancelled: 6, averageMinutes: 21.6, rating: 4.9,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'ICICI Lombard', policyId: 'IL-2291-4480', coverageStart: '2026-03-01', coverageEnd: '2027-02-28' },
  },
  {
    id: 'DP-006', name: 'Rahul Kadam', email: 'rahul.kadam@sns.in', phone: '+91 98923 11847',
    joinedAt: '2025-06-11', status: 'On Leave', deliveryModel: 'aggregator', provider: 'QuickDrop',
    ordersAssigned: 388, ordersCompleted: 371, ordersCancelled: 17, averageMinutes: 33.5, rating: 4.1,
    paymentStatus: 'Processing', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Bharti AXA', policyId: 'BA-7730-1190', coverageStart: '2025-12-01', coverageEnd: '2026-11-30' },
  },
  {
    id: 'DP-007', name: 'Anjali Deshmukh', email: 'anjali.deshmukh@sns.in', phone: '+91 99876 24510',
    joinedAt: '2025-07-04', status: 'Available', deliveryModel: 'own_staff', provider: 'Corner Wok',
    ordersAssigned: 347, ordersCompleted: 338, ordersCancelled: 9, averageMinutes: 23.1, rating: 4.6,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Pending', provider: null, policyId: null, coverageStart: null, coverageEnd: null },
  },
  {
    id: 'DP-008', name: 'Vikram Chauhan', email: 'vikram.chauhan@sns.in', phone: '+91 98201 90233',
    joinedAt: '2025-08-16', status: 'On Delivery', deliveryModel: 'aggregator', provider: 'CityRunner',
    ordersAssigned: 429, ordersCompleted: 401, ordersCancelled: 28, averageMinutes: 36.2, rating: 3.6,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Expired', provider: 'Reliance General', policyId: 'RG-5518-0101', coverageStart: '2025-08-20', coverageEnd: '2026-08-19' },
  },
  {
    id: 'DP-009', name: 'Nisha Bhatt', email: 'nisha.bhatt@sns.in', phone: '+91 97654 08821',
    joinedAt: '2025-09-28', status: 'Available', deliveryModel: 'aggregator', provider: 'PedalPost',
    ordersAssigned: 356, ordersCompleted: 349, ordersCancelled: 7, averageMinutes: 24.8, rating: 4.7,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Bharti AXA', policyId: 'BA-7730-1204', coverageStart: '2026-01-10', coverageEnd: '2026-10-09' },
  },
  {
    id: 'DP-010', name: 'Arjun Menon', email: 'arjun.menon@sns.in', phone: '+91 98455 71130',
    joinedAt: '2025-10-12', status: 'Inactive', deliveryModel: 'aggregator', provider: 'NightOwl Couriers',
    ordersAssigned: 198, ordersCompleted: 176, ordersCancelled: 22, averageMinutes: 38.9, rating: 3.2,
    paymentStatus: 'On Hold', lastPaidOn: '2026-07-01',
    insurance: { status: 'Expired', provider: 'ICICI Lombard', policyId: 'IL-2291-4511', coverageStart: '2025-10-15', coverageEnd: '2026-07-14' },
  },
  {
    id: 'DP-011', name: 'Shreya Joshi', email: 'shreya.joshi@sns.in', phone: '+91 99200 63417',
    joinedAt: '2025-11-05', status: 'Available', deliveryModel: 'own_staff', provider: 'The Harbour Shack',
    ordersAssigned: 288, ordersCompleted: 281, ordersCancelled: 7, averageMinutes: 22.4, rating: 4.8,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'ICICI Lombard', policyId: 'IL-2291-4520', coverageStart: '2026-04-01', coverageEnd: '2027-03-31' },
  },
  {
    id: 'DP-012', name: 'Tanvir Ahmed', email: 'tanvir.ahmed@sns.in', phone: '+91 98331 24409',
    joinedAt: '2025-12-01', status: 'On Delivery', deliveryModel: 'aggregator', provider: 'QuickDrop',
    ordersAssigned: 301, ordersCompleted: 292, ordersCancelled: 9, averageMinutes: 26.7, rating: 4.5,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Bharti AXA', policyId: 'BA-7730-1233', coverageStart: '2026-02-01', coverageEnd: '2026-11-15' },
  },
  {
    id: 'DP-013', name: 'Kavya Reddy', email: 'kavya.reddy@sns.in', phone: '+91 97411 55008',
    joinedAt: '2026-01-18', status: 'Available', deliveryModel: 'aggregator', provider: 'CityRunner',
    ordersAssigned: 264, ordersCompleted: 258, ordersCancelled: 6, averageMinutes: 25.3, rating: 4.6,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Reliance General', policyId: 'RG-5518-0140', coverageStart: '2026-02-01', coverageEnd: '2027-01-31' },
  },
  {
    id: 'DP-014', name: 'Zoya Khan', email: 'zoya.khan@sns.in', phone: '+91 98208 73361',
    joinedAt: '2026-02-09', status: 'On Leave', deliveryModel: 'aggregator', provider: 'PedalPost',
    ordersAssigned: 221, ordersCompleted: 214, ordersCancelled: 7, averageMinutes: 28.1, rating: 4.4,
    paymentStatus: 'Processing', lastPaidOn: '2026-09-01',
    insurance: { status: 'Pending', provider: null, policyId: null, coverageStart: null, coverageEnd: null },
  },
  {
    id: 'DP-015', name: 'Harpreet Singh', email: 'harpreet.singh@sns.in', phone: '+91 99308 11274',
    joinedAt: '2026-02-27', status: 'On Delivery', deliveryModel: 'own_staff', provider: 'Corner Wok',
    ordersAssigned: 236, ordersCompleted: 229, ordersCancelled: 7, averageMinutes: 23.8, rating: 4.5,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'ICICI Lombard', policyId: 'IL-2291-4555', coverageStart: '2026-03-15', coverageEnd: '2026-10-12' },
  },
  {
    id: 'DP-016', name: 'Devika Nair', email: 'devika.nair@sns.in', phone: '+91 98456 30092',
    joinedAt: '2026-03-14', status: 'Available', deliveryModel: 'own_staff', provider: "Anna's Tiffin Room",
    ordersAssigned: 194, ordersCompleted: 190, ordersCancelled: 4, averageMinutes: 20.9, rating: 4.9,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Bharti AXA', policyId: 'BA-7730-1288', coverageStart: '2026-04-01', coverageEnd: '2027-03-31' },
  },
  {
    id: 'DP-017', name: 'Rohan Gupta', email: 'rohan.gupta@sns.in', phone: '+91 98920 44718',
    joinedAt: '2026-04-02', status: 'On Delivery', deliveryModel: 'aggregator', provider: 'QuickDrop',
    ordersAssigned: 178, ordersCompleted: 171, ordersCancelled: 7, averageMinutes: 27.0, rating: 4.3,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Reliance General', policyId: 'RG-5518-0177', coverageStart: '2026-04-10', coverageEnd: '2027-04-09' },
  },
  {
    id: 'DP-018', name: 'Pallavi Shetty', email: 'pallavi.shetty@sns.in', phone: '+91 97400 68123',
    joinedAt: '2026-04-21', status: 'On Delivery', deliveryModel: 'aggregator', provider: 'CityRunner',
    ordersAssigned: 166, ordersCompleted: 160, ordersCancelled: 6, averageMinutes: 26.4, rating: 4.6,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'ICICI Lombard', policyId: 'IL-2291-4590', coverageStart: '2026-05-01', coverageEnd: '2026-10-25' },
  },
  {
    id: 'DP-019', name: 'Aditya Kulkarni', email: 'aditya.kulkarni@sns.in', phone: '+91 98331 90055',
    joinedAt: '2026-05-16', status: 'Available', deliveryModel: 'aggregator', provider: 'PedalPost',
    ordersAssigned: 142, ordersCompleted: 137, ordersCancelled: 5, averageMinutes: 29.3, rating: 4.2,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Pending', provider: null, policyId: null, coverageStart: null, coverageEnd: null },
  },
  {
    id: 'DP-020', name: 'Sanya Kapoor', email: 'sanya.kapoor@sns.in', phone: '+91 99301 27744',
    joinedAt: '2026-06-08', status: 'Inactive', deliveryModel: 'aggregator', provider: 'NightOwl Couriers',
    ordersAssigned: 88, ordersCompleted: 74, ordersCancelled: 14, averageMinutes: 41.7, rating: 2.9,
    paymentStatus: 'On Hold', lastPaidOn: '2026-08-01',
    insurance: { status: 'Expired', provider: 'Bharti AXA', policyId: 'BA-7730-1301', coverageStart: '2026-06-10', coverageEnd: '2026-09-09' },
  },
  {
    id: 'DP-021', name: 'Nikhil Varma', email: 'nikhil.varma@sns.in', phone: '+91 98201 60318',
    joinedAt: '2026-07-01', status: 'Available', deliveryModel: 'own_staff', provider: 'The Harbour Shack',
    ordersAssigned: 109, ordersCompleted: 106, ordersCancelled: 3, averageMinutes: 22.8, rating: 4.7,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Reliance General', policyId: 'RG-5518-0210', coverageStart: '2026-07-05', coverageEnd: '2027-07-04' },
  },
  {
    id: 'DP-022', name: 'Ritika Sen', email: 'ritika.sen@sns.in', phone: '+91 97654 31902',
    joinedAt: '2026-07-24', status: 'On Leave', deliveryModel: 'aggregator', provider: 'QuickDrop',
    ordersAssigned: 76, ordersCompleted: 73, ordersCancelled: 3, averageMinutes: 25.1, rating: 4.5,
    paymentStatus: 'Processing', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'ICICI Lombard', policyId: 'IL-2291-4622', coverageStart: '2026-08-01', coverageEnd: '2026-11-02' },
  },
  {
    id: 'DP-023', name: 'Yusuf Merchant', email: 'yusuf.merchant@sns.in', phone: '+91 98924 77510',
    joinedAt: '2026-08-11', status: 'Available', deliveryModel: 'aggregator', provider: 'CityRunner',
    ordersAssigned: 54, ordersCompleted: 52, ordersCancelled: 2, averageMinutes: 26.9, rating: 4.4,
    paymentStatus: 'Paid', lastPaidOn: '2026-09-01',
    insurance: { status: 'Covered', provider: 'Bharti AXA', policyId: 'BA-7730-1344', coverageStart: '2026-08-15', coverageEnd: '2027-08-14' },
  },
  {
    id: 'DP-024', name: 'Lata Prabhu', email: 'lata.prabhu@sns.in', phone: '+91 99204 15583',
    joinedAt: '2026-09-02', status: 'Inactive', deliveryModel: 'aggregator', provider: 'NightOwl Couriers',
    ordersAssigned: 21, ordersCompleted: 18, ordersCancelled: 3, averageMinutes: 34.6, rating: 3.4,
    paymentStatus: 'On Hold', lastPaidOn: '2026-09-01',
    insurance: { status: 'Pending', provider: null, policyId: null, coverageStart: null, coverageEnd: null },
  },
];

/* ---------------------------------------------------------- shift cover -- */

export type ShiftId = 'morning' | 'afternoon' | 'evening';

/**
 * table: shift_availability — headcount per shift, per state.
 *
 * A separate table rather than something derived from the rows above, because
 * `status` is a rider's state *now* and a shift roster is a plan for later.
 * The two cannot be the same column: a rider is "On Delivery" at this instant
 * and still rostered across all three shifts.
 *
 * Mock, as the brief allows. The totals per shift deliberately differ — a
 * platform with identical cover in every shift has not been staffed, it has
 * been averaged.
 */
export interface ShiftCover {
  id: ShiftId;
  label: string;
  window: string;
  available: number;
  onDelivery: number;
  onLeave: number;
}

export const shiftCover: ShiftCover[] = [
  { id: 'morning', label: 'Morning', window: '07:00 – 12:00', available: 9, onDelivery: 4, onLeave: 2 },
  { id: 'afternoon', label: 'Afternoon', window: '12:00 – 17:00', available: 7, onDelivery: 9, onLeave: 3 },
  { id: 'evening', label: 'Evening', window: '17:00 – 23:00', available: 5, onDelivery: 13, onLeave: 1 },
];

/* -------------------------------------------------------------- windows -- */

/** How soon a policy counts as expiring, in days. */
export const EXPIRING_SOON_DAYS = 45;

/** Months of salary history the cost graph draws. */
export const SALARY_HISTORY_MONTHS = 8;

export const DELIVERY_TODAY = MOCK_TODAY;

/* ----------------------------------------------------------- status flow -- */

/**
 * The lifecycle a delivery moves through, as diagram seeds.
 *
 * Seeds, not a drawing: `FlowDiagram` places nodes from the `col`/`row` grid,
 * and the counts are attached by the service from the partner rows. The
 * cancelled branch drops to its own row so the happy path stays a straight
 * read across.
 */
export const partnerFlowNodes: FlowNodeSeed[] = [
  { id: 'available', label: 'Available', col: 0, row: 0, kind: 'start', hint: 'Rider is on shift and unassigned' },
  { id: 'assigned', label: 'Order assigned', col: 1, row: 0, kind: 'step', hint: 'Platform matches an order to the rider' },
  { id: 'picked', label: 'Picked up', col: 2, row: 0, kind: 'step', hint: 'Collected from the restaurant' },
  { id: 'out', label: 'Out for delivery', col: 3, row: 0, kind: 'step', hint: 'On the way to the customer' },
  { id: 'delivered', label: 'Delivered', col: 4, row: 0, kind: 'terminal', hint: 'Handed over; the rider frees up again' },
  { id: 'cancelled', label: 'Cancelled', col: 3, row: 1, kind: 'warn', hint: 'Before hand-over, by the customer or the restaurant' },
];

export const partnerFlowEdges: FlowEdgeSeed[] = [
  { from: 'available', to: 'assigned' },
  { from: 'assigned', to: 'picked', label: 'accept' },
  { from: 'picked', to: 'out' },
  { from: 'out', to: 'delivered' },
  { from: 'assigned', to: 'cancelled', label: 'cancel' },
  { from: 'out', to: 'cancelled', label: 'cancel' },
  { from: 'delivered', to: 'available', label: 'back on shift' },
  { from: 'cancelled', to: 'available', label: 'back on shift' },
];
