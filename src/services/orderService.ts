/**
 * orderService — placing and reading orders.
 *
 * Orders live in memory for this build, so a placed order survives navigation
 * to the confirmation screen but not a reload. That is deliberate: the
 * alternative is writing a fake order into localStorage and pretending it was
 * accepted by a kitchen. When Supabase arrives, `placeOrder` becomes an insert
 * into `orders` and `order_items` inside one transaction, and the signatures
 * below do not change.
 *
 * Payment is not implemented and is not simulated. The checkout records which
 * method the customer chose and nothing more — there is no gateway, no charge,
 * and no pretence of one.
 */
import type { ID, Order, OrderItem, Restaurant } from '../data/types';
import { getCuisineForMenuItem, getMenuItemById, getRestaurantById } from './restaurantService';

export type PaymentMethod = 'cash' | 'upi' | 'card';

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; note: string }[] = [
  { id: 'cash', label: 'Cash on delivery', note: 'Pay the rider when the food arrives' },
  { id: 'upi', label: 'UPI', note: 'Not connected in this build' },
  { id: 'card', label: 'Card', note: 'Not connected in this build' },
];

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  line1: string;
  landmark?: string;
  city: string;
  pincode: string;
}

/** An order plus everything the confirmation screen needs to render it. */
export interface PlacedOrder extends Order {
  restaurant: Restaurant;
  /** `cuisineName` is carried so the confirmation can group by menu, as the cart did. */
  items: (OrderItem & { name: string; cuisineId: ID; cuisineName: string })[];
  address: DeliveryAddress;
  paymentMethod: PaymentMethod;
  itemTotal: number;
  deliveryFee: number;
  /** Minutes, from the restaurant's own window. */
  etaMinutes: number;
  placedAt: string;
}

export interface PlaceOrderInput {
  restaurantId: ID;
  lines: { menuItemId: ID; quantity: number }[];
  address: DeliveryAddress;
  paymentMethod: PaymentMethod;
  /** Falls back to a guest id when nobody is signed in. */
  customerId?: ID;
}

const placed = new Map<ID, PlacedOrder>();

/** Sequential within a session, prefixed so it reads as an order number. */
let sequence = 10_500;

export class OrderError extends Error {}

export function placeOrder(input: PlaceOrderInput): PlacedOrder {
  const restaurant = getRestaurantById(input.restaurantId);
  if (!restaurant) throw new OrderError('That restaurant is no longer available.');
  if (!restaurant.isOpen) throw new OrderError(`${restaurant.name} is closed right now.`);
  if (!input.lines.length) throw new OrderError('There is nothing in your cart.');

  /* Price is snapshotted here, not read back later. What the customer agreed
     to pay must not move because a menu was edited afterwards. */
  const items = input.lines.map((line) => {
    const item = getMenuItemById(line.menuItemId);
    if (!item) throw new OrderError('An item in your cart is no longer on the menu.');
    const cuisine = getCuisineForMenuItem(line.menuItemId);
    return {
      orderId: '',
      menuItemId: item.id,
      quantity: line.quantity,
      price: item.price,
      name: item.name,
      /* Recorded per item so an order remembers which cuisine's menu it came
         from — the whole point of keeping the menus separate. */
      cuisineId: cuisine?.id ?? '',
      cuisineName: cuisine?.name ?? 'Menu',
    };
  });

  const itemTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const id = `#${(sequence += 1)}`;

  const order: PlacedOrder = {
    id,
    customerId: input.customerId ?? 'guest',
    restaurantId: restaurant.id,
    orderDate: new Date().toISOString(),
    total: itemTotal + restaurant.deliveryFee,
    deliveryType: restaurant.deliveryType,
    restaurant,
    items: items.map((i) => ({ ...i, orderId: id })),
    address: input.address,
    paymentMethod: input.paymentMethod,
    itemTotal,
    deliveryFee: restaurant.deliveryFee,
    etaMinutes: restaurant.etaMaxMinutes,
    placedAt: new Date().toISOString(),
  };

  placed.set(id, order);
  return order;
}

export function getPlacedOrder(orderId: ID): PlacedOrder | undefined {
  return placed.get(orderId);
}
