export type DeliveryType = 'aggregator' | 'own_staff';

export interface Cuisine {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface District {
  id: string;
  name: string;
  cuisineId: string;
  headline: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeText: string;
  streetName: string;
  landmarkType: 'bazaar' | 'pagoda' | 'piazza' | 'cantina' | 'patisserie' | 'diner';
  popularSpecialties: string[];
  ambientVibe: string;
  // Visual placement in Food City
  gridArea: string;
}

export interface RestaurantFacade {
  roofColor: string;
  wallColor: string;
  awningColor: string;
  awningStripeColor?: string;
  trimColor: string;
  signboardText: string;
  chimneySteam: boolean;
  architecturalStyle: 'tandoor_arches' | 'tea_house' | 'trattoria' | 'hacienda' | 'bakehouse' | 'neon_diner';
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  districtId: string;
  cuisineIds: string[]; // Essential: A single restaurant can serve multiple cuisines!
  rating: number;
  reviewCount: number;
  deliveryType: DeliveryType;
  deliveryEstimateMinutes: number;
  deliveryFee: number;
  priceLevel: '₹' | '₹₹' | '₹₹₹';
  facade: RestaurantFacade;
  specialties: string[];
  isOpen: boolean;
  featuredDish: {
    name: string;
    cuisine: string;
    price: number;
  };
}

// Prepared for next phase (Menu & Items)
export interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  isBestseller?: boolean;
}

export interface Menu {
  id: string;
  restaurantId: string;
  cuisineId: string;
  cuisineName: string;
  items: MenuItem[];
}
