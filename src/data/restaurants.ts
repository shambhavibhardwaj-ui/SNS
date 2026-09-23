import type { Restaurant, RestaurantCuisine } from './types';

/**
 * table: restaurants
 *
 * A restaurant belongs to exactly one district but may serve several cuisines —
 * see `restaurantCuisines` below. The district's headline cuisines are a
 * neighbourhood label, not a constraint on what a restaurant can sell.
 */
export const restaurants: Restaurant[] = [
  /* ---- Indian Market ---- */
  {
    id: 'res-mumbai-spice',
    name: 'Mumbai Spice',
    description: 'Tandoor at the front, wok at the back. Two kitchens, one doorway.',
    rating: 4.6,
    ratingCount: 1284,
    deliveryType: 'aggregator',
    districtId: 'dis-indian-market',
    priceForTwo: 650,
    etaMinutes: 32,
    storefront: { emblem: '🫓' },
  },
  {
    id: 'res-delhi-darbar',
    name: 'Delhi Darbar',
    description: 'Slow-cooked dal and kebabs from a forty-year-old family recipe book.',
    rating: 4.2,
    ratingCount: 903,
    deliveryType: 'own_fleet',
    districtId: 'dis-indian-market',
    priceForTwo: 800,
    etaMinutes: 38,
    storefront: { emblem: '🍢' },
  },
  {
    id: 'res-annas-tiffin',
    name: "Anna's Tiffin Room",
    description: 'Dosa griddle running from six in the morning. Filter coffee, always.',
    rating: 4.7,
    ratingCount: 1512,
    deliveryType: 'own_fleet',
    districtId: 'dis-indian-market',
    priceForTwo: 350,
    etaMinutes: 24,
    storefront: { emblem: '🥞' },
  },
  {
    id: 'res-chaat-corner',
    name: 'Chaat Corner',
    description: 'A cart that became a shop. Still assembles everything to order.',
    rating: 4.1,
    ratingCount: 640,
    deliveryType: 'aggregator',
    districtId: 'dis-indian-market',
    priceForTwo: 250,
    etaMinutes: 20,
    storefront: { emblem: '🥣' },
  },

  /* ---- Asian Street ---- */
  {
    id: 'res-jade-lantern',
    name: 'Jade Lantern',
    description: 'Hand-pulled noodles under a row of paper lanterns.',
    rating: 4.5,
    ratingCount: 1120,
    deliveryType: 'aggregator',
    districtId: 'dis-asian-street',
    priceForTwo: 700,
    etaMinutes: 30,
    storefront: { emblem: '🏮' },
  },
  {
    id: 'res-sakura-counter',
    name: 'Sakura Counter',
    description: 'Eight seats, one chef, a very short menu that changes weekly.',
    rating: 4.8,
    ratingCount: 486,
    deliveryType: 'own_fleet',
    districtId: 'dis-asian-street',
    priceForTwo: 1400,
    etaMinutes: 42,
    storefront: { emblem: '🍣' },
  },
  {
    id: 'res-bangkok-bowl',
    name: 'Bangkok Bowl',
    description: 'Green curry ground fresh each morning. Heat levels are honest.',
    rating: 4.3,
    ratingCount: 872,
    deliveryType: 'aggregator',
    districtId: 'dis-asian-street',
    priceForTwo: 600,
    etaMinutes: 28,
    storefront: { emblem: '🍲' },
  },
  {
    id: 'res-seoul-kitchen',
    name: 'Seoul Kitchen',
    description: 'Charcoal grills sunk into every table, plus a late-night noodle window.',
    rating: 4.4,
    ratingCount: 731,
    deliveryType: 'own_fleet',
    districtId: 'dis-asian-street',
    priceForTwo: 950,
    etaMinutes: 35,
    storefront: { emblem: '🥢' },
  },

  /* ---- Little Italy ---- */
  {
    id: 'res-nonnas-table',
    name: "Nonna's Table",
    description: 'Pasta rolled in the window every afternoon at four.',
    rating: 4.7,
    ratingCount: 1340,
    deliveryType: 'own_fleet',
    districtId: 'dis-little-italy',
    priceForTwo: 1100,
    etaMinutes: 36,
    storefront: { emblem: '🍝' },
  },
  {
    id: 'res-forno-rosso',
    name: 'Forno Rosso',
    description: 'Wood-fired oven that has not been allowed to go cold since 2009.',
    rating: 4.5,
    ratingCount: 1687,
    deliveryType: 'aggregator',
    districtId: 'dis-little-italy',
    priceForTwo: 850,
    etaMinutes: 29,
    storefront: { emblem: '🍕' },
  },
  {
    id: 'res-basilico',
    name: 'Basilico',
    description: 'Herb boxes on every sill. The tiramisu sells out by nine.',
    rating: 4.4,
    ratingCount: 598,
    deliveryType: 'aggregator',
    districtId: 'dis-little-italy',
    priceForTwo: 950,
    etaMinutes: 33,
    storefront: { emblem: '🌿' },
  },

  /* ---- Mexican Plaza ---- */
  {
    id: 'res-casa-verde',
    name: 'Casa Verde',
    description: 'Corn nixtamalised in-house. You can hear the press from the street.',
    rating: 4.6,
    ratingCount: 812,
    deliveryType: 'own_fleet',
    districtId: 'dis-mexican-plaza',
    priceForTwo: 750,
    etaMinutes: 31,
    storefront: { emblem: '🌽' },
  },
  {
    id: 'res-el-farolito',
    name: 'El Farolito',
    description: 'A bunting-strung corner shop that only really wakes up after dark.',
    rating: 4.2,
    ratingCount: 1045,
    deliveryType: 'aggregator',
    districtId: 'dis-mexican-plaza',
    priceForTwo: 600,
    etaMinutes: 26,
    storefront: { emblem: '🌮' },
  },
  {
    id: 'res-maiz-y-humo',
    name: 'Maíz y Humo',
    description: 'Half taquería, half smokehouse. The brisket goes on at midnight.',
    rating: 3.9,
    ratingCount: 377,
    deliveryType: 'aggregator',
    districtId: 'dis-mexican-plaza',
    priceForTwo: 900,
    etaMinutes: 40,
    storefront: { emblem: '🔥' },
  },

  /* ---- Burger Avenue ---- */
  {
    id: 'res-ironside-grill',
    name: 'Ironside Grill',
    description: 'Cast-iron smash patties and a grill that is never scraped fully clean.',
    rating: 4.5,
    ratingCount: 1593,
    deliveryType: 'aggregator',
    districtId: 'dis-burger-avenue',
    priceForTwo: 700,
    etaMinutes: 27,
    storefront: { emblem: '🍔' },
  },
  {
    id: 'res-patty-press',
    name: 'The Patty Press',
    description: 'Six burgers on the board, no substitutions, no apologies.',
    rating: 4.3,
    ratingCount: 921,
    deliveryType: 'own_fleet',
    districtId: 'dis-burger-avenue',
    priceForTwo: 550,
    etaMinutes: 22,
    storefront: { emblem: '🥓' },
  },
  {
    id: 'res-smoke-and-ember',
    name: 'Smoke & Ember',
    description: 'Low-and-slow pit out back; the queue starts before it opens.',
    rating: 4.6,
    ratingCount: 664,
    deliveryType: 'own_fleet',
    districtId: 'dis-burger-avenue',
    priceForTwo: 1200,
    etaMinutes: 45,
    storefront: { emblem: '🍖' },
  },

  /* ---- Dessert Lane ---- */
  {
    id: 'res-sugar-and-salt',
    name: 'Sugar & Salt',
    description: 'Laminated pastry, a marble counter, and flour on absolutely everything.',
    rating: 4.8,
    ratingCount: 1402,
    deliveryType: 'own_fleet',
    districtId: 'dis-dessert-lane',
    priceForTwo: 400,
    etaMinutes: 25,
    storefront: { emblem: '🥐' },
  },
  {
    id: 'res-gelato-piccolo',
    name: 'Gelato Piccolo',
    description: 'Twelve tubs, churned daily, half of them gone by lunch.',
    rating: 4.5,
    ratingCount: 733,
    deliveryType: 'aggregator',
    districtId: 'dis-dessert-lane',
    priceForTwo: 300,
    etaMinutes: 18,
    storefront: { emblem: '🍨' },
  },
  {
    id: 'res-mithai-room',
    name: 'The Mithai Room',
    description: 'Copper trays of barfi set each morning, cut to order at the counter.',
    rating: 4.4,
    ratingCount: 512,
    deliveryType: 'aggregator',
    districtId: 'dis-dessert-lane',
    priceForTwo: 450,
    etaMinutes: 21,
    storefront: { emblem: '🍮' },
  },
];

/**
 * join table: restaurant_cuisines
 *
 * This is the table that makes the "one restaurant, several separate menus"
 * requirement work. Mumbai Spice below is the canonical example:
 * North Indian and Chinese, each with its own menu — never merged.
 */
export const restaurantCuisines: RestaurantCuisine[] = [
  /* Indian Market */
  { restaurantId: 'res-mumbai-spice', cuisineId: 'cui-north-indian' },
  { restaurantId: 'res-mumbai-spice', cuisineId: 'cui-chinese' },
  { restaurantId: 'res-delhi-darbar', cuisineId: 'cui-north-indian' },
  { restaurantId: 'res-annas-tiffin', cuisineId: 'cui-south-indian' },
  { restaurantId: 'res-annas-tiffin', cuisineId: 'cui-street-chaat' },
  { restaurantId: 'res-chaat-corner', cuisineId: 'cui-street-chaat' },
  { restaurantId: 'res-chaat-corner', cuisineId: 'cui-north-indian' },

  /* Asian Street */
  { restaurantId: 'res-jade-lantern', cuisineId: 'cui-chinese' },
  { restaurantId: 'res-jade-lantern', cuisineId: 'cui-thai' },
  { restaurantId: 'res-sakura-counter', cuisineId: 'cui-japanese' },
  { restaurantId: 'res-bangkok-bowl', cuisineId: 'cui-thai' },
  { restaurantId: 'res-seoul-kitchen', cuisineId: 'cui-korean' },
  { restaurantId: 'res-seoul-kitchen', cuisineId: 'cui-chinese' },

  /* Little Italy */
  { restaurantId: 'res-nonnas-table', cuisineId: 'cui-italian' },
  { restaurantId: 'res-nonnas-table', cuisineId: 'cui-pizza' },
  { restaurantId: 'res-forno-rosso', cuisineId: 'cui-pizza' },
  { restaurantId: 'res-basilico', cuisineId: 'cui-italian' },
  { restaurantId: 'res-basilico', cuisineId: 'cui-desserts' },

  /* Mexican Plaza */
  { restaurantId: 'res-casa-verde', cuisineId: 'cui-mexican' },
  { restaurantId: 'res-el-farolito', cuisineId: 'cui-mexican' },
  { restaurantId: 'res-el-farolito', cuisineId: 'cui-tex-mex' },
  { restaurantId: 'res-maiz-y-humo', cuisineId: 'cui-tex-mex' },
  { restaurantId: 'res-maiz-y-humo', cuisineId: 'cui-bbq' },

  /* Burger Avenue */
  { restaurantId: 'res-ironside-grill', cuisineId: 'cui-burgers' },
  { restaurantId: 'res-ironside-grill', cuisineId: 'cui-bbq' },
  { restaurantId: 'res-patty-press', cuisineId: 'cui-burgers' },
  { restaurantId: 'res-smoke-and-ember', cuisineId: 'cui-bbq' },
  { restaurantId: 'res-smoke-and-ember', cuisineId: 'cui-burgers' },

  /* Dessert Lane */
  { restaurantId: 'res-sugar-and-salt', cuisineId: 'cui-bakery' },
  { restaurantId: 'res-sugar-and-salt', cuisineId: 'cui-desserts' },
  { restaurantId: 'res-gelato-piccolo', cuisineId: 'cui-ice-cream' },
  { restaurantId: 'res-gelato-piccolo', cuisineId: 'cui-desserts' },
  { restaurantId: 'res-mithai-room', cuisineId: 'cui-desserts' },
  { restaurantId: 'res-mithai-room', cuisineId: 'cui-bakery' },
];
