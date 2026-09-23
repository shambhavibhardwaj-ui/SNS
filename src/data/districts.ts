import type { District } from './types';

/**
 * table: districts
 *
 * Pure data — no map coordinates. Where a district sits on the city map is
 * layout, and lives in components/foodcity/mapLayout.ts.
 */
export const districts: District[] = [
  {
    id: 'dis-asian-street',
    name: 'Asian Street',
    slug: 'asian-street',
    emoji: '🍜',
    tagline: 'Lantern-lit noodle bars and late-night dumpling counters.',
    cuisineIds: ['cui-chinese', 'cui-thai', 'cui-japanese', 'cui-korean'],
    theme: {
      wall: '#F6E7D8',
      roof: '#B23B33',
      awning: '#C4534A',
      accent: '#E8A33D',
      ground: '#EBD9C2',
      roofStyle: 'pagoda',
    },
  },
  {
    id: 'dis-burger-avenue',
    name: 'Burger Avenue',
    slug: 'burger-avenue',
    emoji: '🍔',
    tagline: 'Chrome-trimmed diners and a permanent smell of charcoal.',
    cuisineIds: ['cui-burgers', 'cui-bbq'],
    theme: {
      wall: '#F3E3C8',
      roof: '#7A4A2B',
      awning: '#C9922F',
      accent: '#5E8C6A',
      ground: '#EBD9C2',
      roofStyle: 'flat',
    },
  },
  {
    id: 'dis-little-italy',
    name: 'Little Italy',
    slug: 'little-italy',
    emoji: '🍕',
    tagline: 'Basil window boxes, wood ovens and pavement tables.',
    cuisineIds: ['cui-italian', 'cui-pizza'],
    theme: {
      wall: '#F7EAD3',
      roof: '#8C5A3C',
      awning: '#5C7F4F',
      accent: '#C4543F',
      ground: '#EBD9C2',
      roofStyle: 'gable',
    },
  },
  {
    id: 'dis-indian-market',
    name: 'Indian Market',
    slug: 'indian-market',
    emoji: '🍛',
    tagline: 'Marigold canopies, tandoor smoke and a chaat cart on every corner.',
    cuisineIds: ['cui-north-indian', 'cui-south-indian', 'cui-street-chaat'],
    theme: {
      wall: '#F8E6C9',
      roof: '#B4562C',
      awning: '#E08B2E',
      accent: '#9C3F6A',
      ground: '#EBD9C2',
      roofStyle: 'dome',
    },
  },
  {
    id: 'dis-mexican-plaza',
    name: 'Mexican Plaza',
    slug: 'mexican-plaza',
    emoji: '🌮',
    tagline: 'Bunting over a warm square, taquerías open till midnight.',
    cuisineIds: ['cui-mexican', 'cui-tex-mex'],
    theme: {
      wall: '#F7E2CB',
      roof: '#C05A33',
      awning: '#2E8B8B',
      accent: '#E0A93B',
      ground: '#EBD9C2',
      roofStyle: 'clay',
    },
  },
  {
    id: 'dis-dessert-lane',
    name: 'Dessert Lane',
    slug: 'dessert-lane',
    emoji: '🍰',
    tagline: 'A sugar-dusted alley of bakeries, gelato carts and mithai counters.',
    cuisineIds: ['cui-desserts', 'cui-bakery', 'cui-ice-cream'],
    theme: {
      wall: '#FBEDE6',
      roof: '#C4788B',
      awning: '#D98B9B',
      accent: '#7E9BB5',
      ground: '#EEDFCB',
      roofStyle: 'scallop',
    },
  },
];
