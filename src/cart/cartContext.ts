import { createContext } from 'react';
import type { Cuisine, ID, MenuItem, Restaurant } from '../data/types';

/**
 * A cart line, as stored.
 *
 * Only an id and a quantity. Name, price and cuisine are looked up through the
 * service when the cart renders, so a price edited in the menu cannot leave a
 * stale copy sitting in someone's cart. The snapshot that *does* matter — what
 * the customer agreed to pay — is taken once, at checkout, into the order.
 */
export interface CartLine {
  menuItemId: ID;
  quantity: number;
}

/** A line resolved against the menu, grouped under the cuisine it came from. */
export interface ResolvedLine {
  item: MenuItem;
  cuisine: Cuisine;
  quantity: number;
  lineTotal: number;
}

/** Lines stay grouped by menu: the cart shows which cuisine each dish came from. */
export interface CartGroup {
  cuisine: Cuisine;
  lines: ResolvedLine[];
  subtotal: number;
}

export interface CartTotals {
  itemTotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export interface CartState {
  /** A cart belongs to exactly one restaurant — see CartProvider. */
  restaurantId: ID | null;
  lines: CartLine[];
}

export interface CartValue {
  state: CartState;
  restaurant: Restaurant | null;
  groups: CartGroup[];
  totals: CartTotals;
  isEmpty: boolean;
  /** Quantity of one item currently in the cart, 0 when absent. */
  quantityOf: (menuItemId: ID) => number;
  /**
   * Add an item. Returns 'added', or 'needs-confirm' when the item belongs to a
   * different restaurant than the cart already holds — the caller then asks the
   * customer before calling `replaceWith`.
   */
  add: (item: MenuItem, restaurantId: ID) => 'added' | 'needs-confirm';
  /** Empty the cart and start again from this item. */
  replaceWith: (item: MenuItem, restaurantId: ID) => void;
  setQuantity: (menuItemId: ID, quantity: number) => void;
  remove: (menuItemId: ID) => void;
  clear: () => void;
}

export const CartContext = createContext<CartValue | null>(null);
