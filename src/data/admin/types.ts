/**
 * Admin-side data model.
 *
 * Shaped like the tables these will become, so swapping mock arrays for
 * Supabase queries is a change of source, not of shape. Nothing in
 * `src/components` or `src/pages` should hard-code a row.
 */

export type ApplicationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Changes';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'Needs Changes',
];

/** RULE-03/04: the choice drives which fee structure applies. */
export type DeliveryModel = 'aggregator' | 'own_staff';

export const DELIVERY_MODEL_LABEL: Record<DeliveryModel, string> = {
  aggregator: 'Aggregator Service Provider',
  own_staff: 'Own Delivery Staff',
};

/** table: restaurant_applications */
export interface RestaurantApplication {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  /** RULE-01 of the brief: a restaurant may register more than one cuisine. */
  cuisines: string[];
  description: string;
  operatingHours: string;
  deliveryModel: DeliveryModel;
  submittedAt: string;
  status: ApplicationStatus;
  /** Set when an admin rejects or asks for changes. */
  reviewNote?: string;
}

export type RestaurantState = 'Active' | 'Under Review' | 'Needs Changes' | 'Pending' | 'Offboarded';

/** table: restaurants */
export interface AdminRestaurant {
  id: string;
  name: string;
  cuisines: string[];
  deliveryModel: DeliveryModel;
  state: RestaurantState;
  totalOrders: number;
  onboardedAt: string;
}

/** table: orders */
export interface PlatformOrder {
  id: string;
  restaurantId: string;
  restaurant: string;
  customer: string;
  amount: number;
  deliveryModel: DeliveryModel;
  status:
    | 'Pending'
    | 'Confirmed'
    | 'Preparing'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled';
  placedAt: string;
}

/**
 * table: ratings — one row per rated order.
 *
 * Kept as individual rows rather than per-restaurant averages because both
 * business rules count *orders*, not averages: RULE-05 needs the number of
 * orders below 3★, and RULE-06 needs the number above 4★ inside one week.
 * An average cannot answer either.
 */
export interface RatedOrder {
  orderId: string;
  restaurantId: string;
  restaurant: string;
  rating: number;
  ratedAt: string;
}

/** table: customers */
export interface PlatformCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  joinedAt: string;
  status: 'Active' | 'New' | 'Dormant';
}

/** table: delivery_partners */
export interface DeliveryPartner {
  id: string;
  name: string;
  activeDeliveries: number;
  completedDeliveries: number;
  status: 'Active' | 'Suspended';
}

export type PlanStatus = 'Plan Required' | 'Plan Submitted' | 'Under Review' | 'Resolved';

/** table: improvement_plans */
export interface ImprovementPlan {
  restaurantId: string;
  restaurant: string;
  status: PlanStatus;
  raisedAt: string;
}
