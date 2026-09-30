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
 * Rating profiles — **one row per (restaurant, cuisine)**, expanded into one
 * row per rated order below.
 *
 * Split by cuisine because that is the grain the menus are already at, and it
 * is the grain the interesting questions live at. The numbers are arranged so
 * the two readings of the same rules can be compared honestly:
 *
 *   - **Indian Spice House** is the case that makes the argument. Its Mughlai
 *     menu earns the fee concession while its Biryani menu needs an
 *     improvement plan, in the same kitchen, in the same week. Read per
 *     restaurant, it is simultaneously rewarded and penalised, which is not an
 *     instruction anyone can act on.
 *   - **Corner Wok** fails per restaurant — seven low-rated orders — but
 *     neither Cantonese (4) nor Sichuan (3) fails on its own. A plan aimed at
 *     the whole kitchen would have no target.
 *   - **Anna's Tiffin Room** earns the concession per restaurant on ten
 *     high-rated orders this week, but neither of its menus earned it alone
 *     (5 and 5).
 *   - **Spice House** cooks one cuisine, so both readings agree. The finer
 *     grain must not invent a difference where there is none.
 *
 * Because both rules count orders, a cuisine can only ever trip a threshold
 * its restaurant has already tripped — the restaurant's total is the sum. The
 * finer grain therefore never catches *more*; it says *where*, and it stops a
 * whole kitchen wearing the consequences of one menu.
 */
const RATING_PROFILES: {
  id: string;
  name: string;
  cuisine: string;
  /** Rated 3 or 3.5 — below neither rule's threshold, but real feedback. */
  midRated: number;
  lowRated: number;
  highRatedThisWeek: number;
  highRatedOlder: number;
}[] = [
  /* Concentrated fault: the North Indian menu carries all six. */
  { id: 'r-abc', name: 'ABC Kitchen', cuisine: 'North Indian', midRated: 9, lowRated: 6, highRatedThisWeek: 2, highRatedOlder: 12 },
  { id: 'r-abc', name: 'ABC Kitchen', cuisine: 'Biryani', midRated: 5, lowRated: 0, highRatedThisWeek: 0, highRatedOlder: 6 },

  /* One cuisine, so both readings agree. */
  { id: 'r-spice-house', name: 'Spice House', cuisine: 'North Indian', midRated: 19, lowRated: 8, highRatedThisWeek: 1, highRatedOlder: 12 },

  /* Diffuse fault: seven across the kitchen, neither menu above five. */
  { id: 'r-corner-wok', name: 'Corner Wok', cuisine: 'Cantonese', midRated: 9, lowRated: 4, highRatedThisWeek: 2, highRatedOlder: 12 },
  { id: 'r-corner-wok', name: 'Corner Wok', cuisine: 'Sichuan', midRated: 7, lowRated: 3, highRatedThisWeek: 1, highRatedOlder: 8 },

  { id: 'r-maiz', name: 'Maíz y Humo', cuisine: 'Tex-Mex', midRated: 12, lowRated: 3, highRatedThisWeek: 1, highRatedOlder: 5 },
  { id: 'r-maiz', name: 'Maíz y Humo', cuisine: 'BBQ & Grill', midRated: 9, lowRated: 1, highRatedThisWeek: 1, highRatedOlder: 4 },

  /* Rewarded and penalised at once, until you look per cuisine. */
  { id: 'r-indian-spice-house', name: 'Indian Spice House', cuisine: 'North Indian', midRated: 10, lowRated: 0, highRatedThisWeek: 0, highRatedOlder: 60 },
  { id: 'r-indian-spice-house', name: 'Indian Spice House', cuisine: 'Mughlai', midRated: 10, lowRated: 1, highRatedThisWeek: 11, highRatedOlder: 60 },
  { id: 'r-indian-spice-house', name: 'Indian Spice House', cuisine: 'Biryani', midRated: 6, lowRated: 6, highRatedThisWeek: 0, highRatedOlder: 20 },

  { id: 'r-forno-rosso', name: 'Forno Rosso', cuisine: 'Pizza', midRated: 31, lowRated: 2, highRatedThisWeek: 10, highRatedOlder: 165 },

  /* Earns the concession as a restaurant; neither menu earned it alone. */
  { id: 'r-annas-tiffin', name: "Anna's Tiffin Room", cuisine: 'South Indian', midRated: 12, lowRated: 0, highRatedThisWeek: 5, highRatedOlder: 75 },
  { id: 'r-annas-tiffin', name: "Anna's Tiffin Room", cuisine: 'Dosa & Idli', midRated: 12, lowRated: 0, highRatedThisWeek: 5, highRatedOlder: 75 },

  { id: 'r-harbour-shack', name: 'The Harbour Shack', cuisine: 'Seafood', midRated: 11, lowRated: 1, highRatedThisWeek: 4, highRatedOlder: 45 },
  { id: 'r-harbour-shack', name: 'The Harbour Shack', cuisine: 'Grill', midRated: 7, lowRated: 0, highRatedThisWeek: 2, highRatedOlder: 25 },

  { id: 'r-pasta-fresca', name: 'Pasta Fresca', cuisine: 'Italian', midRated: 15, lowRated: 3, highRatedThisWeek: 5, highRatedOlder: 47 },
  { id: 'r-casa-verde', name: 'Casa Verde', cuisine: 'Mexican', midRated: 13, lowRated: 3, highRatedThisWeek: 5, highRatedOlder: 38 },

  { id: 'r-bao-bar', name: 'Bao & Bun Bar', cuisine: 'Dim Sum', midRated: 10, lowRated: 1, highRatedThisWeek: 3, highRatedOlder: 30 },
  { id: 'r-bao-bar', name: 'Bao & Bun Bar', cuisine: 'Cantonese', midRated: 7, lowRated: 1, highRatedThisWeek: 2, highRatedOlder: 22 },

  { id: 'r-tide-table', name: 'Tide Table', cuisine: 'Coastal', midRated: 7, lowRated: 3, highRatedThisWeek: 2, highRatedOlder: 18 },
  { id: 'r-tide-table', name: 'Tide Table', cuisine: 'Seafood', midRated: 5, lowRated: 2, highRatedThisWeek: 2, highRatedOlder: 13 },

  { id: 'r-satvik', name: 'Satvik Rasoi', cuisine: 'Pure Veg', midRated: 12, lowRated: 1, highRatedThisWeek: 3, highRatedOlder: 36 },
  { id: 'r-satvik', name: 'Satvik Rasoi', cuisine: 'Thali', midRated: 8, lowRated: 0, highRatedThisWeek: 2, highRatedOlder: 25 },

  { id: 'r-ahimsa', name: 'Ahimsa Bhojanalay', cuisine: 'Jain', midRated: 5, lowRated: 0, highRatedThisWeek: 3, highRatedOlder: 17 },
  { id: 'r-ahimsa', name: 'Ahimsa Bhojanalay', cuisine: 'Gujarati', midRated: 4, lowRated: 0, highRatedThisWeek: 2, highRatedOlder: 12 },

  { id: 'r-jain-thali', name: 'Shravak Thali House', cuisine: 'Jain', midRated: 7, lowRated: 2, highRatedThisWeek: 3, highRatedOlder: 17 },

  { id: 'r-leaf-bowl', name: 'Leaf & Bowl', cuisine: 'Salads & Bowls', midRated: 13, lowRated: 2, highRatedThisWeek: 3, highRatedOlder: 44 },
  { id: 'r-leaf-bowl', name: 'Leaf & Bowl', cuisine: 'Plant-Based', midRated: 9, lowRated: 1, highRatedThisWeek: 2, highRatedOlder: 30 },

  { id: 'r-green-grain', name: 'Green Grain Kitchen', cuisine: 'Salads & Bowls', midRated: 11, lowRated: 5, highRatedThisWeek: 4, highRatedOlder: 33 },

  { id: 'r-macaron', name: 'Maison Macaron', cuisine: 'Desserts', midRated: 17, lowRated: 1, highRatedThisWeek: 3, highRatedOlder: 58 },
  { id: 'r-macaron', name: 'Maison Macaron', cuisine: 'Bakery', midRated: 11, lowRated: 0, highRatedThisWeek: 2, highRatedOlder: 38 },

  { id: 'r-scoop-street', name: 'Scoop Street', cuisine: 'Ice Cream', midRated: 23, lowRated: 2, highRatedThisWeek: 4, highRatedOlder: 83 },

  { id: 'r-idli-express', name: 'Idli Express', cuisine: 'Dosa & Idli', midRated: 11, lowRated: 3, highRatedThisWeek: 3, highRatedOlder: 35 },
  { id: 'r-idli-express', name: 'Idli Express', cuisine: 'South Indian', midRated: 7, lowRated: 1, highRatedThisWeek: 2, highRatedOlder: 23 },
];

/** table: ratings — one row per rated order, carrying the menu it came from. */
export const ratedOrders: RatedOrder[] = RATING_PROFILES.flatMap((p) => {
  const rows: RatedOrder[] = [];
  const slug = p.cuisine.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const base = { restaurantId: p.id, restaurant: p.name, cuisine: p.cuisine };
  let n = 0;

  for (let i = 0; i < p.lowRated; i += 1) {
    rows.push({
      ...base,
      orderId: `${p.id}-${slug}-low-${i}`,
      rating: i % 2 === 0 ? 2 : 1,
      ratedAt: daysAgo(3 + (n += 1)),
    });
  }

  /* Neither rule counts these: RULE-01 wants below 3, RULE-02 above 4. They
     exist so the ratings distribution has a middle, as real ones do. */
  for (let i = 0; i < p.midRated; i += 1) {
    rows.push({
      ...base,
      orderId: `${p.id}-${slug}-mid-${i}`,
      rating: i % 2 === 0 ? 3 : 3.5,
      ratedAt: daysAgo(2 + (i % 50)),
    });
  }

  /* Inside the seven-day window RULE-02 looks at. */
  for (let i = 0; i < p.highRatedThisWeek; i += 1) {
    rows.push({
      ...base,
      orderId: `${p.id}-${slug}-hi-${i}`,
      rating: i % 3 === 0 ? 5 : 4.5,
      ratedAt: daysAgo(i % 7),
    });
  }

  /* Outside it, so they must not count toward the concession. */
  for (let i = 0; i < p.highRatedOlder; i += 1) {
    rows.push({
      ...base,
      orderId: `${p.id}-${slug}-old-${i}`,
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
