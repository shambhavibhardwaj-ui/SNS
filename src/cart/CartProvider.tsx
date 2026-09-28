import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getCuisineForMenuItem,
  getMenuItemById,
  getRestaurantById,
} from '../services/restaurantService';
import type { ID, MenuItem } from '../data/types';
import {
  CartContext,
  type CartGroup,
  type CartState,
  type CartTotals,
  type CartValue,
  type ResolvedLine,
} from './cartContext';

const STORAGE_KEY = 'foodcity.cart.v1';
const EMPTY: CartState = { restaurantId: null, lines: [] };

/**
 * Reading the cart back can throw — a private window, blocked site data — and
 * it can also hold something a previous version wrote. Anything that does not
 * look right is discarded rather than trusted; a lost cart is a small cost
 * against rendering a broken one.
 */
function readStored(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.lines)) return EMPTY;
    const lines = parsed.lines.filter(
      (l) => l && typeof l.menuItemId === 'string' && Number.isFinite(l.quantity) && l.quantity > 0,
    );
    /* Drop items that no longer exist on any menu. */
    const live = lines.filter((l) => getMenuItemById(l.menuItemId));
    if (!live.length) return EMPTY;
    return { restaurantId: parsed.restaurantId ?? null, lines: live };
  } catch {
    return EMPTY;
  }
}

/**
 * The cart.
 *
 * **One restaurant at a time.** A single delivery comes from a single kitchen,
 * so adding a dish from somewhere else is a decision, not an accident: `add`
 * refuses and reports `needs-confirm`, and the page asks before `replaceWith`
 * empties the cart.
 *
 * Lines are kept flat and grouped by cuisine only for display. A cart that
 * stored its own per-cuisine buckets would be a second place for the
 * item-to-menu relationship to live, and the two would eventually disagree.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(readStored);

  useEffect(() => {
    try {
      if (state.lines.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Storage unavailable. The cart still works for this page view. */
    }
  }, [state]);

  const restaurant = useMemo(
    () => (state.restaurantId ? getRestaurantById(state.restaurantId) ?? null : null),
    [state.restaurantId],
  );

  const groups = useMemo<CartGroup[]>(() => {
    const order: string[] = [];
    const byCuisine = new Map<string, CartGroup>();

    for (const line of state.lines) {
      const item = getMenuItemById(line.menuItemId);
      const cuisine = getCuisineForMenuItem(line.menuItemId);
      if (!item || !cuisine) continue;

      const resolved: ResolvedLine = {
        item,
        cuisine,
        quantity: line.quantity,
        lineTotal: item.price * line.quantity,
      };

      if (!byCuisine.has(cuisine.id)) {
        byCuisine.set(cuisine.id, { cuisine, lines: [], subtotal: 0 });
        order.push(cuisine.id);
      }
      const group = byCuisine.get(cuisine.id)!;
      group.lines.push(resolved);
      group.subtotal += resolved.lineTotal;
    }

    return order.map((id) => byCuisine.get(id)!);
  }, [state.lines]);

  const totals = useMemo<CartTotals>(() => {
    const itemTotal = groups.reduce((s, g) => s + g.subtotal, 0);
    /* The delivery fee is the restaurant's own, not a platform percentage —
       we have not been given one, and inventing it would show the customer a
       charge nobody agreed. */
    const deliveryFee = itemTotal && restaurant ? restaurant.deliveryFee : 0;
    return {
      itemTotal,
      deliveryFee,
      total: itemTotal + deliveryFee,
      itemCount: groups.reduce((s, g) => s + g.lines.reduce((n, l) => n + l.quantity, 0), 0),
    };
  }, [groups, restaurant]);

  const quantityOf = useCallback(
    (menuItemId: ID) => state.lines.find((l) => l.menuItemId === menuItemId)?.quantity ?? 0,
    [state.lines],
  );

  const add = useCallback<CartValue['add']>((item, restaurantId) => {
    let outcome: 'added' | 'needs-confirm' = 'added';
    setState((prev) => {
      if (prev.lines.length && prev.restaurantId && prev.restaurantId !== restaurantId) {
        outcome = 'needs-confirm';
        return prev;
      }
      const existing = prev.lines.find((l) => l.menuItemId === item.id);
      return {
        restaurantId,
        lines: existing
          ? prev.lines.map((l) =>
              l.menuItemId === item.id ? { ...l, quantity: l.quantity + 1 } : l,
            )
          : [...prev.lines, { menuItemId: item.id, quantity: 1 }],
      };
    });
    return outcome;
  }, []);

  const replaceWith = useCallback<CartValue['replaceWith']>((item, restaurantId) => {
    setState({ restaurantId, lines: [{ menuItemId: item.id, quantity: 1 }] });
  }, []);

  const setQuantity = useCallback((menuItemId: ID, quantity: number) => {
    setState((prev) => {
      const lines =
        quantity <= 0
          ? prev.lines.filter((l) => l.menuItemId !== menuItemId)
          : prev.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l));
      return lines.length ? { ...prev, lines } : EMPTY;
    });
  }, []);

  const remove = useCallback((menuItemId: ID) => setQuantity(menuItemId, 0), [setQuantity]);
  const clear = useCallback(() => setState(EMPTY), []);

  const value = useMemo<CartValue>(
    () => ({
      state,
      restaurant,
      groups,
      totals,
      isEmpty: state.lines.length === 0,
      quantityOf,
      add,
      replaceWith,
      setQuantity,
      remove,
      clear,
    }),
    [state, restaurant, groups, totals, quantityOf, add, replaceWith, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Re-exported for convenience at the import site. */
export type { MenuItem };
