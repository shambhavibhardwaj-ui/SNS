/**
 * Foodie AI — order suggestions for customers.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS DOES NOT CALL A MODEL FROM THE BROWSER
 *
 * It cannot. A model API needs a key, and anything the browser can read is in
 * the bundle — the same rule that keeps the Supabase service-role key out of
 * this codebase applies to every other provider. The real version is a
 * Supabase Edge Function: the browser posts the request and the context, the
 * function holds the key and talks to the model, and this file's body becomes
 * one `fetch`. Every signature here is already async and already shaped like
 * that call, so no component changes when it arrives.
 *
 * Until then the suggestions come from a grounded matcher over the real menu
 * rows, which is not a stand-in for the model so much as the half of the job
 * that must exist either way — see below.
 * ---------------------------------------------------------------------------
 *
 * Two rules from the brief run through all of it.
 *
 * 1. **It suggests from the restaurant's own menu.** Every suggestion carries a
 *    real `MenuItem` id. Nothing here can name a dish that is not on a menu,
 *    because nothing here writes a dish name — it picks rows. When the model
 *    arrives it gets the same treatment: it will be handed candidate rows and
 *    asked to choose and explain, never asked what the kitchen serves. A model
 *    inventing a plausible biryani nobody cooks is the failure this shape
 *    prevents.
 *
 * 2. **It never decides.** It returns ranked suggestions with the reason each
 *    was picked, and the person adds to the cart themselves. Nothing in this
 *    file touches the cart.
 *
 * It also says what it understood, so a person can see it has misread them
 * rather than wondering why the answers are odd.
 */
import { cuisines } from '../data/cuisines';
import { districts } from '../data/districts';
import { restaurantCuisines, restaurants } from '../data/restaurants';
import { menuItems, menus } from '../data/menus';
import type { Cuisine, District, ID, MenuItem, Restaurant } from '../data/types';

/* ------------------------------------------------------------ the ask -- */

export interface FoodieRequest {
  text: string;
  /** Narrows to one kitchen when asked from its page. */
  restaurantId?: ID;
  /** Narrows to one district when asked from a listing. */
  districtId?: ID;
}

/** What the request was taken to mean. Shown back, so it can be corrected. */
export interface ParsedRequest {
  diet: 'veg' | 'non-veg' | null;
  heat: 'spicy' | 'mild' | null;
  /** Rupees. A ceiling, not a target. */
  maxPrice: number | null;
  /** Matched against the real cuisine list, never free text. */
  cuisineIds: ID[];
  /** "Starters", "Desserts" — the menu's own categories. */
  categories: string[];
  /** Words left over, matched against item names and descriptions. */
  keywords: string[];
}

export interface FoodieSuggestion {
  item: MenuItem;
  restaurant: Restaurant;
  cuisine: Cuisine;
  district: District;
  /** Why this one — each line is a fact from the row that was matched. */
  reasons: string[];
  score: number;
}

export interface FoodieAnswer {
  understood: ParsedRequest;
  suggestions: FoodieSuggestion[];
  /** Parts of the request nothing could satisfy, said plainly. */
  unmet: string[];
  /** How many menu rows were considered, so the answer is not a black box. */
  considered: number;
}

/* ------------------------------------------------------------ parsing -- */

const VEG_WORDS = ['veg', 'vegetarian', 'veggie', 'no meat', 'meat free', 'meatless'];
const NON_VEG_WORDS = ['non veg', 'non-veg', 'nonveg', 'meat', 'chicken', 'mutton', 'lamb', 'fish', 'prawn', 'egg'];
const SPICY_WORDS = ['spicy', 'hot', 'fiery', 'chilli', 'chili', 'masaledar', 'tikha'];
const MILD_WORDS = ['mild', 'not spicy', 'no spice', 'less spicy', 'gentle', 'kid friendly', 'kids'];

/**
 * The categories that actually exist on the menus.
 *
 * Read from the rows, not written down. The first version of this file had a
 * hand-written list — "Starters", "Desserts", "Drinks" — and not one of those
 * is a real category: the menus say "Small Plates", "Sweet", "Coffee". Every
 * request naming a course returned nothing, which looked like the matcher
 * being strict and was the matcher filtering on names that do not occur.
 */
const REAL_CATEGORIES = [...new Set(menuItems.map((i) => i.category))];

/**
 * Words a person uses for a course, mapped to fragments of real category
 * names. Only the words that do *not* already appear in a category need an
 * entry — "biryani" and "rice" match by themselves.
 */
const CATEGORY_SYNONYM: Record<string, string[]> = {
  starter: ['small plates', 'antipasti', 'chaat', 'street plates', 'kebabs', 'soups', 'salads', 'farsan', 'steamed'],
  starters: ['small plates', 'antipasti', 'chaat', 'street plates', 'kebabs', 'soups', 'salads', 'farsan', 'steamed'],
  appetiser: ['small plates', 'antipasti', 'chaat', 'street plates'],
  appetizer: ['small plates', 'antipasti', 'chaat', 'street plates'],
  snack: ['chaat', 'street plates', 'farsan', 'small plates'],
  dessert: ['sweet', 'patisserie', 'gelato', 'dolci', 'ice'],
  desserts: ['sweet', 'patisserie', 'gelato', 'dolci', 'ice'],
  pudding: ['sweet', 'patisserie'],
  drink: ['coffee', 'tea', 'cold', 'juice', 'smoothie', 'tonic'],
  drinks: ['coffee', 'tea', 'cold', 'juice', 'smoothie', 'tonic'],
  beverage: ['coffee', 'tea', 'cold', 'juice', 'smoothie', 'tonic'],
  main: ['main course', 'house specials', 'plates', 'thali'],
  mains: ['main course', 'house specials', 'plates', 'thali'],
  course: ['main course'],
  curry: ['main course', 'house specials'],
  grill: ['from the pit', 'from the tandoor', 'roast meats'],
  tandoor: ['from the tandoor'],
  bread: ['breads'],
  naan: ['breads'],
  roti: ['breads'],
};

/**
 * Whole-word containment.
 *
 * Plain `includes` was catastrophic here and quietly so. "and" is inside
 * "Tandoor", so *every* request containing the word "and" was hard-filtered to
 * the tandoor menu — which killed "something spicy and vegetarian", the
 * example on the launcher. "ice" is inside "Rice" and "Juice"; "veg" is inside
 * "Vegetables"; the letter "a" is inside half the menu.
 */
function hasWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`).test(haystack);
}

/** Real categories matching a word, by synonym or by naming themselves. */
function categoriesFor(word: string): string[] {
  if (word.length < 3 || STOPWORDS.has(word)) return [];
  const fragments = CATEGORY_SYNONYM[word] ?? [word];
  return REAL_CATEGORIES.filter((cat) => {
    const c = cat.toLowerCase();
    return fragments.some((f) => hasWord(c, f) || hasWord(f, c));
  });
}

/** True when a word names a course and nothing else — "dessert", not "biryani". */
const isCourseWord = (word: string) => word in CATEGORY_SYNONYM;

/** "under 300", "below ₹250", "cheap", "less than 400". */
function readPrice(text: string): number | null {
  const m = text.match(/(?:under|below|less than|within|max|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d{2,5})/i)
    ?? text.match(/(?:₹|rs\.?|inr)\s*(\d{2,5})\s*(?:or less|max)?/i);
  if (m) return Number(m[1]);
  if (/\b(cheap|budget|affordable|inexpensive)\b/i.test(text)) return 250;
  return null;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'with', 'without', 'something', 'anything',
  'i', 'me', 'my', 'want', 'like', 'would', 'some', 'please', 'show', 'find', 'get',
  'food', 'dish', 'dishes', 'to', 'eat', 'is', 'are', 'in', 'of', 'on', 'under', 'below',
  'less', 'than', 'cheap', 'budget', 'good', 'nice', 'best', 'can', 'you', 'give',
]);

/**
 * Read the request.
 *
 * Deliberately explicit vocabularies rather than anything clever: this is the
 * part the model replaces, and until it does, a list of words a person can read
 * and extend beats a heuristic nobody can predict.
 */
export function parseRequest(text: string): ParsedRequest {
  const t = ` ${text.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ')} `;
  const has = (words: string[]) => words.some((w) => t.includes(` ${w} `) || t.includes(`${w} `));

  /* Checked before the veg words, because "non veg" contains "veg". */
  const nonVeg = has(NON_VEG_WORDS);
  const veg = !nonVeg && has(VEG_WORDS);

  const cuisineIds = cuisines
    .filter((c: Cuisine) => t.includes(` ${c.name.toLowerCase()} `))
    .map((c: Cuisine) => c.id);

  const words = t.trim().split(' ').filter(Boolean);
  const categories = [...new Set(words.flatMap(categoriesFor))];

  /*
   * Words consumed by the diet, heat and cuisine readings, so they do not also
   * become keywords. Category words are deliberately *not* consumed: "biryani"
   * is both a course and a dish name, and spending it on the category meant a
   * request for biryani was answered with curd rice — the right category, and
   * not what anyone asked for.
   */
  const used = new Set<string>();
  for (const list of [VEG_WORDS, NON_VEG_WORDS, SPICY_WORDS, MILD_WORDS]) {
    for (const w of list) for (const part of w.split(' ')) used.add(part);
  }
  for (const c of cuisines as Cuisine[]) {
    for (const part of c.name.toLowerCase().split(' ')) used.add(part);
  }

  const keywords = words.filter(
    (w) =>
      w.length > 2
      && !STOPWORDS.has(w)
      && !used.has(w)
      /* A word that only ever names a course is spent on the category. A word
         that also names a dish — "biryani", "pizza", "rice" — stays, and does
         both jobs. */
      && !isCourseWord(w)
      /* A price is read as a ceiling, not as a word to find in a dish name. */
      && !/\d/.test(w),
  );

  return {
    diet: veg ? 'veg' : nonVeg ? 'non-veg' : null,
    heat: has(SPICY_WORDS) ? 'spicy' : has(MILD_WORDS) ? 'mild' : null,
    maxPrice: readPrice(text),
    cuisineIds,
    categories,
    keywords: [...new Set(keywords)],
  };
}

/* ------------------------------------------------------------ scoring -- */

interface Candidate {
  item: MenuItem;
  restaurant: Restaurant;
  cuisine: Cuisine;
  district: District;
}

/** Every item the request is allowed to reach, joined to its context. */
function candidates(req: FoodieRequest): Candidate[] {
  const menuById = new Map(menus.map((m) => [m.id, m]));
  const restaurantById = new Map(restaurants.map((r) => [r.id, r]));
  const cuisineById = new Map(cuisines.map((c) => [c.id, c]));
  const districtById = new Map(districts.map((d) => [d.id, d]));

  const out: Candidate[] = [];
  for (const item of menuItems) {
    const menu = menuById.get(item.menuId);
    if (!menu) continue;
    const restaurant = restaurantById.get(menu.restaurantId);
    const cuisine = cuisineById.get(menu.cuisineId);
    if (!restaurant || !cuisine) continue;
    const district = districtById.get(restaurant.districtId);
    if (!district) continue;

    if (req.restaurantId && restaurant.id !== req.restaurantId) continue;
    if (req.districtId && district.id !== req.districtId) continue;
    /* A closed kitchen cannot take the order, so suggesting it wastes the
       person's time at exactly the moment they are deciding. */
    if (!restaurant.isOpen) continue;

    out.push({ item, restaurant, cuisine, district });
  }
  return out;
}

/**
 * Score one item, and say why.
 *
 * Hard requirements filter rather than score: asking for vegetarian and being
 * offered chicken with a high score is not a near miss, it is wrong. Soft
 * preferences add weight, and the reasons returned are the matches that
 * actually fired — never a generic "this looks good for you".
 */
function score(c: Candidate, p: ParsedRequest): { score: number; reasons: string[] } | null {
  const reasons: string[] = [];
  let s = 0;

  if (p.diet === 'veg') {
    if (!c.item.isVeg) return null;
    reasons.push('Vegetarian');
    s += 3;
  }
  if (p.diet === 'non-veg' && c.item.isVeg) return null;

  if (p.heat === 'spicy') {
    if (!c.item.isSpicy) return null;
    reasons.push('Spicy');
    s += 3;
  }
  if (p.heat === 'mild') {
    if (c.item.isSpicy) return null;
    reasons.push('Not spicy');
    s += 2;
  }

  if (p.maxPrice !== null) {
    if (c.item.price > p.maxPrice) return null;
    reasons.push(`₹${c.item.price}, within ₹${p.maxPrice}`);
    s += 2;
  }

  if (p.cuisineIds.length) {
    if (!p.cuisineIds.includes(c.cuisine.id)) return null;
    reasons.push(c.cuisine.name);
    s += 3;
  }

  if (p.categories.length) {
    if (!p.categories.includes(c.item.category)) return null;
    reasons.push(c.item.category);
    s += 2;
  }

  const haystack = `${c.item.name} ${c.item.description}`.toLowerCase();
  const hits = p.keywords.filter((k) => haystack.includes(k));
  if (p.keywords.length && !hits.length) {
    /* Keywords are soft: a request can mention something no dish names and
       still be answerable from its other parts. But it must not outrank the
       items that did match. */
    s -= 1;
  } else if (hits.length) {
    reasons.push(`Mentions ${hits.join(', ')}`);
    s += hits.length * 2;
  }

  /*
   * No reason, no suggestion.
   *
   * This is the rule that stops it bluffing. "unicorn steak" matched nothing
   * and still returned six dishes, ranked by restaurant rating, with an empty
   * reason list — which reads as an answer and is not one. If nothing about
   * the request fired, the honest reply is that nothing matched.
   */
  if (!reasons.length) return null;

  /* Tie-breaks, in the order a person would apply them. Deliberately small, so
     they order equally-good matches rather than overturning the request. */
  s += c.restaurant.rating / 2;
  if (c.restaurant.etaMinutes <= 25) s += 0.3;

  return { score: s, reasons };
}

/* ------------------------------------------------------------- asking -- */

const MAX_SUGGESTIONS = 6;

/**
 * Ask Foodie AI.
 *
 * Async because the real one will be: a component written against this does
 * not change when the body becomes a call to the Edge Function.
 */
export async function askFoodie(req: FoodieRequest): Promise<FoodieAnswer> {
  const understood = parseRequest(req.text);
  const pool = candidates(req);

  const scored = pool
    .map((c) => {
      const result = score(c, understood);
      return result ? { ...c, ...result } : null;
    })
    .filter((x): x is Candidate & { score: number; reasons: string[] } => x !== null)
    .sort((a, b) => b.score - a.score);

  /*
   * At most two dishes from one kitchen.
   *
   * Without this a single strong menu takes every slot, which is six ways of
   * saying the same answer. Variety is the point of asking.
   */
  const perRestaurant = new Map<ID, number>();
  const suggestions: FoodieSuggestion[] = [];
  for (const s of scored) {
    const n = perRestaurant.get(s.restaurant.id) ?? 0;
    if (n >= 2) continue;
    perRestaurant.set(s.restaurant.id, n + 1);
    suggestions.push(s);
    if (suggestions.length >= MAX_SUGGESTIONS) break;
  }

  return {
    understood,
    suggestions,
    unmet: unmetParts(understood, suggestions),
    considered: pool.length,
  };
}

/**
 * What the request asked for that nothing could satisfy.
 *
 * Said out loud rather than quietly dropped: "no results" leaves a person
 * guessing which part of what they asked was the problem, which is the same
 * complaint the onboarding documents screen answers.
 */
function unmetParts(p: ParsedRequest, found: FoodieSuggestion[]): string[] {
  if (found.length) {
    const missed = p.keywords.filter(
      (k) => !found.some((s) => `${s.item.name} ${s.item.description}`.toLowerCase().includes(k)),
    );
    return missed.length ? [`Nothing on these menus mentions “${missed.join('”, “')}”.`] : [];
  }

  const out: string[] = [];
  if (p.cuisineIds.length) {
    const names = p.cuisineIds
      .map((id) => (cuisines as Cuisine[]).find((c) => c.id === id)?.name)
      .filter(Boolean);
    out.push(`No open kitchen serves ${names.join(' or ')} to match the rest of that.`);
  }
  if (p.maxPrice !== null) out.push(`Nothing under ₹${p.maxPrice} fits the rest of the request.`);
  if (p.diet === 'veg') out.push('No vegetarian dish matches the other parts.');
  if (p.heat === 'spicy') out.push('Nothing marked spicy matches the other parts.');
  if (p.keywords.length) out.push(`No dish mentions “${p.keywords.join('”, “')}”.`);
  return out.length ? out : ['Nothing on the open menus matches that.'];
}

/* ------------------------------------------------------------ prompts -- */

/**
 * Examples, drawn from the real data so every one of them returns something.
 *
 * A suggestion chip that finds nothing teaches a person the feature is broken
 * on their first use of it, so these are asserted against the matcher in the
 * tests rather than written by hand and hoped for.
 */
export const FOODIE_EXAMPLES = [
  'something spicy and vegetarian',
  'light starters under ₹250',
  'a biryani for two',
  'mild south indian for kids',
  'dessert under ₹200',
];

/** The cuisines a person can be offered, for the panel's quick filters. */
export function getFoodieCuisines(): Cuisine[] {
  const live = new Set(
    restaurantCuisines
      .filter((rc) => restaurants.find((r) => r.id === rc.restaurantId)?.isOpen)
      .map((rc) => rc.cuisineId),
  );
  return (cuisines as Cuisine[]).filter((c) => live.has(c.id));
}
