/**
 * Mock rows for the admin and delivery dashboards.
 *
 * Shaped like the tables they will become (`orders`, `delivery_services`,
 * `ratings`, `improvement_plans`, `service_fees`) so swapping in Supabase
 * queries is a change of source, not of shape.
 *
 * Restaurant names are drawn from the real seed data in `src/data/restaurants`
 * so the dashboards and the city describe the same places.
 *
 * NOTE ON FEES: the client has not given us fee percentages or a concession
 * amount. Nothing here invents one — those fields read "Not set" on purpose.
 */

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface AdminOrderRow {
  id: string;
  customer: string;
  restaurant: string;
  items: number;
  amount: number;
  status: OrderStatus;
  deliveryService: string;
}

export const adminOrders: AdminOrderRow[] = [
  { id: '#1042', customer: 'Aarav Mehta', restaurant: 'Mumbai Spice', items: 3, amount: 640, status: 'Out for Delivery', deliveryService: 'QuickDrop' },
  { id: '#1041', customer: 'Sana Qureshi', restaurant: 'Forno Rosso', items: 2, amount: 890, status: 'Preparing', deliveryService: 'Aggregator' },
  { id: '#1040', customer: 'Dev Patel', restaurant: "Anna's Tiffin Room", items: 5, amount: 410, status: 'Delivered', deliveryService: 'Own fleet' },
  { id: '#1039', customer: 'Leah Fernandes', restaurant: 'Jade Lantern', items: 4, amount: 720, status: 'Confirmed', deliveryService: 'QuickDrop' },
  { id: '#1038', customer: 'Rohit Nair', restaurant: 'The Harbour Shack', items: 2, amount: 980, status: 'Pending', deliveryService: 'Aggregator' },
  { id: '#1037', customer: 'Ishita Rao', restaurant: 'Sweet Scoops', items: 6, amount: 340, status: 'Delivered', deliveryService: 'Own fleet' },
  { id: '#1036', customer: 'Kabir Shah', restaurant: 'Maíz y Humo', items: 3, amount: 760, status: 'Cancelled', deliveryService: 'Aggregator' },
];

export interface AdminRestaurantRow {
  name: string;
  cuisine: string;
  rating: number;
  deliveryOption: 'Aggregator' | 'Own fleet';
  status: 'Active' | 'Paused' | 'Onboarding';
  orders: number;
}

export const adminRestaurants: AdminRestaurantRow[] = [
  { name: 'Mumbai Spice', cuisine: 'North Indian • Mughlai • Chaat', rating: 4.6, deliveryOption: 'Aggregator', status: 'Active', orders: 1284 },
  { name: "Anna's Tiffin Room", cuisine: 'South Indian • Dosa', rating: 4.7, deliveryOption: 'Own fleet', status: 'Active', orders: 1512 },
  { name: 'Jade Lantern', cuisine: 'Cantonese • Dim Sum', rating: 4.5, deliveryOption: 'Aggregator', status: 'Active', orders: 1120 },
  { name: 'Forno Rosso', cuisine: 'Pizza', rating: 4.5, deliveryOption: 'Aggregator', status: 'Active', orders: 1687 },
  { name: 'The Harbour Shack', cuisine: 'Seafood • Grill', rating: 4.6, deliveryOption: 'Own fleet', status: 'Active', orders: 742 },
  { name: 'Maíz y Humo', cuisine: 'Tex-Mex • Grill', rating: 3.9, deliveryOption: 'Aggregator', status: 'Paused', orders: 377 },
  { name: 'Quiet Court Kitchen', cuisine: 'Jain • Thali', rating: 4.6, deliveryOption: 'Own fleet', status: 'Onboarding', orders: 0 },
];

export interface AdminCustomerRow {
  name: string;
  email: string;
  orders: number;
  status: 'Active' | 'Dormant';
  joined: string;
}

export const adminCustomers: AdminCustomerRow[] = [
  { name: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', orders: 12, status: 'Active', joined: '2026-02-14' },
  { name: 'Sana Qureshi', email: 'sana.q@gmail.com', orders: 31, status: 'Active', joined: '2025-11-03' },
  { name: 'Dev Patel', email: 'dev.patel@gmail.com', orders: 8, status: 'Active', joined: '2026-05-21' },
  { name: 'Leah Fernandes', email: 'leah.f@gmail.com', orders: 3, status: 'Dormant', joined: '2026-07-09' },
  { name: 'Rohit Nair', email: 'rohit.nair@gmail.com', orders: 19, status: 'Active', joined: '2025-09-30' },
];

export interface DeliveryServiceRow {
  partner: string;
  active: number;
  completed: number;
  status: 'Active' | 'Suspended';
  coverage: string;
}

export const deliveryServices: DeliveryServiceRow[] = [
  { partner: 'QuickDrop', active: 12, completed: 1452, status: 'Active', coverage: 'City wide' },
  { partner: 'PedalPost', active: 5, completed: 638, status: 'Active', coverage: 'Inner districts' },
  { partner: 'Own fleet — Anna’s Tiffin Room', active: 3, completed: 211, status: 'Active', coverage: 'Tiffin Lane' },
  { partner: 'NightOwl Couriers', active: 0, completed: 94, status: 'Suspended', coverage: 'Late night' },
];

export interface RatingRow {
  restaurant: string;
  customer: string;
  rating: number;
  review: string;
  date: string;
}

export const ratings: RatingRow[] = [
  { restaurant: 'Maíz y Humo', customer: 'Kabir Shah', rating: 2, review: 'Brisket was dry and it arrived cold.', date: '2026-09-21' },
  { restaurant: 'Mumbai Spice', customer: 'Aarav Mehta', rating: 5, review: 'Bread still warm. Faster than the estimate.', date: '2026-09-21' },
  { restaurant: 'Maíz y Humo', customer: 'Leah Fernandes', rating: 2, review: 'Order was missing the sides.', date: '2026-09-20' },
  { restaurant: "Anna's Tiffin Room", customer: 'Dev Patel', rating: 5, review: 'Dosa travels surprisingly well.', date: '2026-09-20' },
  { restaurant: 'Jade Lantern', customer: 'Sana Qureshi', rating: 4, review: 'Good, though the dumplings had steamed over.', date: '2026-09-19' },
];

/** RULE-01: below 3★ on more than 5 orders requires an improvement plan. */
export interface ImprovementPlanRow {
  restaurant: string;
  lowRatedOrders: number;
  status: 'Required' | 'Pending' | 'Submitted' | 'Accepted';
  raisedOn: string;
}

export const improvementPlans: ImprovementPlanRow[] = [
  { restaurant: 'Maíz y Humo', lowRatedOrders: 6, status: 'Pending', raisedOn: '2026-09-18' },
  { restaurant: 'NightOwl Kitchen', lowRatedOrders: 8, status: 'Submitted', raisedOn: '2026-09-04' },
  { restaurant: 'Corner Wok', lowRatedOrders: 7, status: 'Accepted', raisedOn: '2026-08-22' },
];

/**
 * RULE-03/04 set the fee by delivery option, RULE-02 grants a concession for
 * more than 4★ across 10 orders in a week.
 *
 * `feePercent` and `concession` are null because the client has not given us
 * those numbers. They render as "Not set" rather than as a made-up figure.
 */
export interface ServiceFeeRow {
  restaurant: string;
  deliveryOption: 'Aggregator' | 'Own fleet';
  feePercent: number | null;
  concession: string | null;
  concessionEarned: boolean;
  effectiveFrom: string;
}

export const serviceFees: ServiceFeeRow[] = [
  { restaurant: 'Mumbai Spice', deliveryOption: 'Aggregator', feePercent: null, concession: null, concessionEarned: false, effectiveFrom: '2026-04-01' },
  { restaurant: "Anna's Tiffin Room", deliveryOption: 'Own fleet', feePercent: null, concession: null, concessionEarned: true, effectiveFrom: '2026-04-01' },
  { restaurant: 'Forno Rosso', deliveryOption: 'Aggregator', feePercent: null, concession: null, concessionEarned: true, effectiveFrom: '2026-06-15' },
  { restaurant: 'The Harbour Shack', deliveryOption: 'Own fleet', feePercent: null, concession: null, concessionEarned: false, effectiveFrom: '2026-07-01' },
];

/* ------------------------------------------------------------- delivery -- */

export type DeliveryStage =
  | 'Assigned'
  | 'Accepted'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered';

export const DELIVERY_STAGES: DeliveryStage[] = [
  'Assigned',
  'Accepted',
  'Picked Up',
  'Out for Delivery',
  'Delivered',
];

export interface DeliveryJob {
  id: string;
  restaurant: string;
  customer: string;
  address: string;
  distanceKm: number;
  orderValue: number;
  stage: DeliveryStage;
}

export const deliveryJobs: DeliveryJob[] = [
  { id: '#1042', restaurant: 'Mumbai Spice', customer: 'Aarav Mehta', address: '14 Marigold Court, Tandoor Quarter', distanceKm: 2.4, orderValue: 640, stage: 'Out for Delivery' },
  { id: '#1045', restaurant: 'Forno Rosso', customer: 'Sana Qureshi', address: '3 Basil Walk, Italian Street', distanceKm: 1.1, orderValue: 890, stage: 'Picked Up' },
  { id: '#1047', restaurant: 'Jade Lantern', customer: 'Leah Fernandes', address: '88 Lantern Row, flat 4', distanceKm: 3.6, orderValue: 720, stage: 'Assigned' },
  { id: '#1048', restaurant: 'The Harbour Shack', customer: 'Rohit Nair', address: '2 Pier End, Harbour Point', distanceKm: 4.2, orderValue: 980, stage: 'Assigned' },
];

export interface CompletedDelivery {
  id: string;
  restaurant: string;
  customer: string;
  date: string;
  amount: number;
  completedAt: string;
}

export const completedDeliveries: CompletedDelivery[] = [
  { id: '#1039', restaurant: "Anna's Tiffin Room", customer: 'Dev Patel', date: '2026-09-22', amount: 410, completedAt: '13:12' },
  { id: '#1035', restaurant: 'Sweet Scoops', customer: 'Ishita Rao', date: '2026-09-22', amount: 340, completedAt: '12:04' },
  { id: '#1031', restaurant: 'Casa Verde', customer: 'Kabir Shah', date: '2026-09-21', amount: 750, completedAt: '20:47' },
  { id: '#1028', restaurant: 'Mumbai Spice', customer: 'Aarav Mehta', date: '2026-09-21', amount: 640, completedAt: '19:30' },
];

export interface EarningRow {
  date: string;
  deliveries: number;
  amount: number;
  note: string;
}

export const earnings = {
  today: 640,
  week: 4180,
  month: 16240,
  ledger: [
    { date: '2026-09-22', deliveries: 8, amount: 640, note: 'Includes 2 late-night runs' },
    { date: '2026-09-21', deliveries: 11, amount: 880, note: '' },
    { date: '2026-09-20', deliveries: 7, amount: 560, note: '' },
    { date: '2026-09-19', deliveries: 9, amount: 720, note: 'One order cancelled at door' },
  ] as EarningRow[],
};
