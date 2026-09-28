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
 * Fixed rather than `new Date()` so the rule derivations are stable: RULE-02
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
  /*
   * Added so every one of the ten SNS cuisines has real kitchens behind
   * it. Analytics that show a cuisine with no restaurants is a chart of the
   * seed data's gaps, not of the business.
   */
  { id: 'r-pasta-fresca', name: 'Pasta Fresca', cuisines: ['Italian'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 597, onboardedAt: '2025-09-08' },
  { id: 'r-casa-verde', name: 'Casa Verde', cuisines: ['Mexican'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 534, onboardedAt: '2026-01-07' },
  { id: 'r-bao-bar', name: 'Bao & Bun Bar', cuisines: ['Dim Sum', 'Cantonese'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 618, onboardedAt: '2025-11-21' },
  { id: 'r-tide-table', name: 'Tide Table', cuisines: ['Coastal', 'Seafood'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 455, onboardedAt: '2026-02-03' },
  { id: 'r-satvik', name: 'Satvik Rasoi', cuisines: ['Pure Veg', 'Thali'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 690, onboardedAt: '2025-10-12' },
  { id: 'r-ahimsa', name: 'Ahimsa Bhojanalay', cuisines: ['Jain', 'Gujarati'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 372, onboardedAt: '2026-03-02' },
  { id: 'r-jain-thali', name: 'Shravak Thali House', cuisines: ['Jain'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 244, onboardedAt: '2026-04-26' },
  { id: 'r-leaf-bowl', name: 'Leaf & Bowl', cuisines: ['Salads & Bowls', 'Plant-Based'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 826, onboardedAt: '2025-07-30' },
  { id: 'r-green-grain', name: 'Green Grain Kitchen', cuisines: ['Salads & Bowls'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 431, onboardedAt: '2026-02-17' },
  { id: 'r-macaron', name: 'Maison Macaron', cuisines: ['Desserts', 'Bakery'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 1103, onboardedAt: '2025-06-05' },
  { id: 'r-scoop-street', name: 'Scoop Street', cuisines: ['Ice Cream'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 968, onboardedAt: '2025-08-19' },
  { id: 'r-idli-express', name: 'Idli Express', cuisines: ['Dosa & Idli', 'South Indian'], deliveryModel: 'aggregator', state: 'Active', totalOrders: 712, onboardedAt: '2025-12-14' },
  /*
   * The two applications sitting at Approved in `restaurantApplications`.
   * Without them "approved" leads nowhere and the onboarding funnel ends at
   * zero. No orders yet — they have only just gone live.
   */
  { id: 'r-xyz-cafe', name: 'XYZ Cafe', cuisines: ['Cafe', 'Bakery'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 0, onboardedAt: '2026-09-24' },
  { id: 'r-tiffin-co', name: 'Tiffin & Co.', cuisines: ['South Indian', 'Dosa & Idli', 'Filter Coffee'], deliveryModel: 'own_staff', state: 'Active', totalOrders: 0, onboardedAt: '2026-09-22' },
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
  /** Rated 3 or 3.5 — below neither rule's threshold, but real feedback. */
  midRated: number;
  lowRated: number;
  highRatedThisWeek: number;
  highRatedOlder: number;
}[] = [
  { id: 'r-abc', name: 'ABC Kitchen', midRated: 14, lowRated: 6, highRatedThisWeek: 2, highRatedOlder: 18 },
  { id: 'r-spice-house', name: 'Spice House', midRated: 19, lowRated: 8, highRatedThisWeek: 1, highRatedOlder: 12 },
  { id: 'r-corner-wok', name: 'Corner Wok', midRated: 16, lowRated: 7, highRatedThisWeek: 3, highRatedOlder: 20 },
  { id: 'r-maiz', name: 'Maíz y Humo', midRated: 21, lowRated: 4, highRatedThisWeek: 2, highRatedOlder: 9 },
  { id: 'r-indian-spice-house', name: 'Indian Spice House', midRated: 26, lowRated: 1, highRatedThisWeek: 11, highRatedOlder: 140 },
  { id: 'r-forno-rosso', name: 'Forno Rosso', midRated: 31, lowRated: 2, highRatedThisWeek: 10, highRatedOlder: 165 },
  { id: 'r-annas-tiffin', name: "Anna's Tiffin Room", midRated: 24, lowRated: 0, highRatedThisWeek: 8, highRatedOlder: 150 },
  { id: 'r-harbour-shack', name: 'The Harbour Shack', midRated: 18, lowRated: 1, highRatedThisWeek: 6, highRatedOlder: 70 },
  /*
   * Deliberately all below both thresholds: at most 5 low-rated orders
   * (RULE-01 needs more than 5) and at most 5 high-rated ones this week
   * (RULE-02 needs 10). Adding restaurants must not quietly change who the
   * rules catch.
   */
  { id: 'r-pasta-fresca', name: 'Pasta Fresca', midRated: 15, lowRated: 3, highRatedThisWeek: 5, highRatedOlder: 47 },
  { id: 'r-casa-verde', name: 'Casa Verde', midRated: 13, lowRated: 3, highRatedThisWeek: 5, highRatedOlder: 38 },
  { id: 'r-bao-bar', name: 'Bao & Bun Bar', midRated: 17, lowRated: 2, highRatedThisWeek: 5, highRatedOlder: 52 },
  { id: 'r-tide-table', name: 'Tide Table', midRated: 12, lowRated: 5, highRatedThisWeek: 4, highRatedOlder: 31 },
  { id: 'r-satvik', name: 'Satvik Rasoi', midRated: 20, lowRated: 1, highRatedThisWeek: 5, highRatedOlder: 61 },
  { id: 'r-ahimsa', name: 'Ahimsa Bhojanalay', midRated: 9, lowRated: 0, highRatedThisWeek: 5, highRatedOlder: 29 },
  { id: 'r-jain-thali', name: 'Shravak Thali House', midRated: 7, lowRated: 2, highRatedThisWeek: 3, highRatedOlder: 17 },
  { id: 'r-leaf-bowl', name: 'Leaf & Bowl', midRated: 22, lowRated: 3, highRatedThisWeek: 5, highRatedOlder: 74 },
  { id: 'r-green-grain', name: 'Green Grain Kitchen', midRated: 11, lowRated: 5, highRatedThisWeek: 4, highRatedOlder: 33 },
  { id: 'r-macaron', name: 'Maison Macaron', midRated: 28, lowRated: 1, highRatedThisWeek: 5, highRatedOlder: 96 },
  { id: 'r-scoop-street', name: 'Scoop Street', midRated: 23, lowRated: 2, highRatedThisWeek: 4, highRatedOlder: 83 },
  { id: 'r-idli-express', name: 'Idli Express', midRated: 18, lowRated: 4, highRatedThisWeek: 5, highRatedOlder: 58 },
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
  /* Neither rule counts these: RULE-01 wants below 3, RULE-02 above 4. They
     exist so the ratings distribution has a middle, as real ones do. */
  for (let i = 0; i < p.midRated; i += 1) {
    rows.push({
      orderId: `${p.id}-mid-${i}`,
      restaurantId: p.id,
      restaurant: p.name,
      rating: i % 2 === 0 ? 3 : 3.5,
      ratedAt: daysAgo(2 + (i % 50)),
    });
  }

  /* Inside the seven-day window RULE-02 looks at. */
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

/** table: improvement_plans — one per restaurant that has tripped RULE-01. */
export const improvementPlans: ImprovementPlan[] = [
  { restaurantId: 'r-abc', restaurant: 'ABC Kitchen', status: 'Plan Required', raisedAt: daysAgo(4) },
  { restaurantId: 'r-spice-house', restaurant: 'Spice House', status: 'Plan Submitted', raisedAt: daysAgo(12) },
  { restaurantId: 'r-corner-wok', restaurant: 'Corner Wok', status: 'Under Review', raisedAt: daysAgo(26) },
];
