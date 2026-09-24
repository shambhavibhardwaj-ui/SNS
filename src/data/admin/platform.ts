import type {
  AdminRestaurant,
  DeliveryPartner,
  ImprovementPlan,
  PlatformCustomer,
  PlatformOrder,
  RatedOrder,
} from './types';

/**
 * "Now" for the mock data.
 *
 * Fixed rather than `new Date()` so the rule derivations are stable: RULE-06
 * counts orders inside a seven-day window, and a moving today would silently
 * change which restaurants qualify between page loads.
 */
export const MOCK_TODAY = new Date('2026-09-25T12:00:00Z');

const daysAgo = (n: number) =>
  new Date(MOCK_TODAY.getTime() - n * 86_400_000).toISOString().slice(0, 10);

/** table: restaurants */
export const platformRestaurants: AdminRestaurant[] = [
  { id: 'r-abc', name: 'ABC Kitchen', cuisines: ['North Indian', 'Biryani'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 412, onboardedAt: '2026-03-11' },
  { id: 'r-spice-house', name: 'Spice House', cuisines: ['North Indian'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 388, onboardedAt: '2025-12-02' },
  { id: 'r-corner-wok', name: 'Corner Wok', cuisines: ['Cantonese', 'Sichuan'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 265, onboardedAt: '2026-01-19' },
  { id: 'r-indian-spice-house', name: 'Indian Spice House', cuisines: ['North Indian', 'Mughlai', 'Biryani'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 1284, onboardedAt: '2025-08-04' },
  { id: 'r-forno-rosso', name: 'Forno Rosso', cuisines: ['Pizza'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 1687, onboardedAt: '2025-06-22' },
  { id: 'r-annas-tiffin', name: "Anna's Tiffin Room", cuisines: ['South Indian', 'Dosa & Idli'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 1512, onboardedAt: '2025-07-15' },
  { id: 'r-harbour-shack', name: 'The Harbour Shack', cuisines: ['Seafood', 'Grill'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 742, onboardedAt: '2026-02-28' },
  { id: 'r-maiz', name: 'Maíz y Humo', cuisines: ['Tex-Mex', 'BBQ & Grill'], deliveryModel: 'aggregator', state: 'Needs Changes', totalOrders: 377, onboardedAt: '2026-04-09' },
  { id: 'r-lantern-wok', name: 'Lantern Wok', cuisines: ['Cantonese', 'Dim Sum'], deliveryModel: 'aggregator', state: 'Under Review', totalOrders: 0, onboardedAt: '2026-09-19' },
  { id: 'r-green-fork', name: 'Green Fork', cuisines: ['Pure Veg'], deliveryModel: 'own_staff', state: 'Pending', totalOrders: 0, onboardedAt: '2026-09-20' },
  { id: 'r-midnight-grill', name: 'Midnight Grill', cuisines: ['BBQ & Grill'], deliveryModel: 'aggregator', state: 'Offboarded', totalOrders: 96, onboardedAt: '2025-10-30' },
  { id: 'r-old-tandoor', name: 'Old Tandoor', cuisines: ['North Indian'], deliveryModel: 'own_staff', state: 'Offboarded', totalOrders: 210, onboardedAt: '2025-05-12' },
];

/**
 * Rating profiles, expanded into one row per rated order below.
 *
 * Deliberately includes cases that do NOT qualify — Maíz y Humo sits at four
 * low-rated orders and Anna's at eight high ones this week — so the thresholds
 * are shown to bite rather than merely asserted.
 */
const RATING_PROFILES: {
  id: string;
  name: string;
  lowRated: number;
  highRatedThisWeek: number;
  highRatedOlder: number;
}[] = [
  { id: 'r-abc', name: 'ABC Kitchen', lowRated: 6, highRatedThisWeek: 2, highRatedOlder: 18 },
  { id: 'r-spice-house', name: 'Spice House', lowRated: 8, highRatedThisWeek: 1, highRatedOlder: 12 },
  { id: 'r-corner-wok', name: 'Corner Wok', lowRated: 7, highRatedThisWeek: 3, highRatedOlder: 20 },
  { id: 'r-maiz', name: 'Maíz y Humo', lowRated: 4, highRatedThisWeek: 2, highRatedOlder: 9 },
  { id: 'r-indian-spice-house', name: 'Indian Spice House', lowRated: 1, highRatedThisWeek: 11, highRatedOlder: 140 },
  { id: 'r-forno-rosso', name: 'Forno Rosso', lowRated: 2, highRatedThisWeek: 10, highRatedOlder: 165 },
  { id: 'r-annas-tiffin', name: "Anna's Tiffin Room", lowRated: 0, highRatedThisWeek: 8, highRatedOlder: 150 },
  { id: 'r-harbour-shack', name: 'The Harbour Shack', lowRated: 1, highRatedThisWeek: 6, highRatedOlder: 70 },
];

/** table: ratings — one row per rated order. */
export const ratedOrders: RatedOrder[] = RATING_PROFILES.flatMap((p) => {
  const rows: RatedOrder[] = [];
  let n = 0;

  for (let i = 0; i < p.lowRated; i += 1) {
    rows.push({
      orderId: `${p.id}-low-${i}`,
      restaurantId: p.id,
      restaurant: p.name,
      rating: i % 2 === 0 ? 2 : 1,
      ratedAt: daysAgo(3 + (n += 1)),
    });
  }
  /* Inside the seven-day window RULE-06 looks at. */
  for (let i = 0; i < p.highRatedThisWeek; i += 1) {
    rows.push({
      orderId: `${p.id}-hi-${i}`,
      restaurantId: p.id,
      restaurant: p.name,
      rating: i % 3 === 0 ? 5 : 4.5,
      ratedAt: daysAgo(i % 7),
    });
  }
  /* Outside it, so they must not count toward the concession. */
  for (let i = 0; i < p.highRatedOlder; i += 1) {
    rows.push({
      orderId: `${p.id}-old-${i}`,
      restaurantId: p.id,
      restaurant: p.name,
      rating: 4.5,
      ratedAt: daysAgo(8 + (i % 60)),
    });
  }
  return rows;
});

/** table: orders */
export const platformOrders: PlatformOrder[] = [
  { id: '#1042', restaurantId: 'r-indian-spice-house', restaurant: 'Indian Spice House', customer: 'Aarav Mehta', amount: 640, deliveryModel: 'aggregator', status: 'Out for Delivery', placedAt: daysAgo(0) },
  { id: '#1041', restaurantId: 'r-forno-rosso', restaurant: 'Forno Rosso', customer: 'Sana Qureshi', amount: 890, deliveryModel: 'aggregator', status: 'Preparing', placedAt: daysAgo(0) },
  { id: '#1040', restaurantId: 'r-annas-tiffin', restaurant: "Anna's Tiffin Room", customer: 'Dev Patel', amount: 410, deliveryModel: 'own_staff', status: 'Delivered', placedAt: daysAgo(0) },
  { id: '#1039', restaurantId: 'r-corner-wok', restaurant: 'Corner Wok', customer: 'Leah Fernandes', amount: 720, deliveryModel: 'own_staff', status: 'Confirmed', placedAt: daysAgo(0) },
  { id: '#1038', restaurantId: 'r-harbour-shack', restaurant: 'The Harbour Shack', customer: 'Rohit Nair', amount: 980, deliveryModel: 'own_staff', status: 'Pending', placedAt: daysAgo(0) },
  { id: '#1037', restaurantId: 'r-abc', restaurant: 'ABC Kitchen', customer: 'Ishita Rao', amount: 340, deliveryModel: 'aggregator', status: 'Delivered', placedAt: daysAgo(1) },
  { id: '#1036', restaurantId: 'r-maiz', restaurant: 'Maíz y Humo', customer: 'Kabir Shah', amount: 760, deliveryModel: 'aggregator', status: 'Cancelled', placedAt: daysAgo(2) },
  { id: '#1035', restaurantId: 'r-spice-house', restaurant: 'Spice House', customer: 'Nisha Verma', amount: 520, deliveryModel: 'aggregator', status: 'Delivered', placedAt: daysAgo(3) },
];

/** Counts that would be a `count(*)` once orders are real. */
export const orderActivity = {
  today: platformOrders.filter((o) => o.placedAt === daysAgo(0)).length + 304,
  thisWeek: 1962,
  outForDelivery: 27,
};

/** table: customers */
export const platformCustomers: PlatformCustomer[] = [
  { id: 'c-1', name: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', orders: 12, joinedAt: '2026-02-14', status: 'Active' },
  { id: 'c-2', name: 'Sana Qureshi', email: 'sana.q@gmail.com', orders: 31, joinedAt: '2025-11-03', status: 'Active' },
  { id: 'c-3', name: 'Dev Patel', email: 'dev.patel@gmail.com', orders: 8, joinedAt: '2026-09-21', status: 'New' },
  { id: 'c-4', name: 'Leah Fernandes', email: 'leah.f@gmail.com', orders: 3, joinedAt: '2026-09-19', status: 'New' },
  { id: 'c-5', name: 'Rohit Nair', email: 'rohit.nair@gmail.com', orders: 19, joinedAt: '2025-09-30', status: 'Active' },
];

export const customerTotals = { total: 2418, newThisWeek: 64, active: 1877 };

/** table: delivery_partners */
export const deliveryPartners: DeliveryPartner[] = [
  { id: 'd-1', name: 'QuickDrop', activeDeliveries: 12, completedDeliveries: 1452, status: 'Active' },
  { id: 'd-2', name: 'PedalPost', activeDeliveries: 5, completedDeliveries: 638, status: 'Active' },
  { id: 'd-3', name: 'CityRunner', activeDeliveries: 10, completedDeliveries: 914, status: 'Active' },
  { id: 'd-4', name: 'NightOwl Couriers', activeDeliveries: 0, completedDeliveries: 94, status: 'Suspended' },
];

/** table: improvement_plans — one per restaurant that has tripped RULE-05. */
export const improvementPlans: ImprovementPlan[] = [
  { restaurantId: 'r-abc', restaurant: 'ABC Kitchen', status: 'Plan Required', raisedAt: daysAgo(4) },
  { restaurantId: 'r-spice-house', restaurant: 'Spice House', status: 'Plan Submitted', raisedAt: daysAgo(12) },
  { restaurantId: 'r-corner-wok', restaurant: 'Corner Wok', status: 'Under Review', raisedAt: daysAgo(26) },
];
