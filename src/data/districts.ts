import { brand } from '../theme/brand';
import type { District } from './types';

/**
 * table: districts
 *
 * Pure data — no map coordinates. Where a district sits on the isometric city
 * grid is layout, and lives in components/foodcity/isoLayout.ts.
 */
export const districts: District[] = [
  {
    id: 'dis-indian',
    name: 'Indian District',
    slug: 'indian-district',
    emoji: '🍛',
    tagline: 'Marigold canopies, tandoor smoke and a chaat cart on every corner.',
    description:
      'Aromatic alleys of simmering copper degchis and clay tandoors, where the bread comes off the wall still blistering.',
    cuisineIds: ['cui-north-indian', 'cui-south-indian', 'cui-mughlai', 'cui-street-chaat'],
    buildingKind: 'indian',
    theme: {
      wall: '#FBF3DE',
      roof: brand.salmon,
      awning: brand.butter,
      accent: brand.magenta,
      ground: '#C8D5D0',
    },
  },
  {
    id: 'dis-asian',
    name: 'Asian Street',
    slug: 'asian-street',
    emoji: '🍜',
    tagline: 'Lantern-lit noodle bars and late-night dumpling counters.',
    description:
      'Paper lanterns strung low over clattering woks, tonkotsu cauldrons and stacked bamboo steamers.',
    cuisineIds: ['cui-chinese', 'cui-thai', 'cui-japanese', 'cui-korean'],
    buildingKind: 'asian',
    theme: {
      wall: '#FAF1E2',
      roof: brand.teal900,
      awning: brand.magenta,
      accent: brand.butter,
      ground: '#C8D5D0',
    },
  },
  {
    id: 'dis-italian',
    name: 'Italian Street',
    slug: 'italian-street',
    emoji: '🍕',
    tagline: 'Basil window boxes, wood ovens and pavement tables.',
    description:
      'Sun-warmed terracotta, checked tablecloths on the kerb and the smell of a crust catching in the oven.',
    cuisineIds: ['cui-italian', 'cui-pizza'],
    buildingKind: 'italian',
    theme: {
      wall: '#FCF5E4',
      roof: brand.teal700,
      awning: brand.butter,
      accent: brand.salmon,
      ground: '#C9D6D1',
    },
  },
  {
    id: 'dis-mexican',
    name: 'Mexican Plaza',
    slug: 'mexican-plaza',
    emoji: '🌮',
    tagline: 'Bunting over a warm square, taquerías open till midnight.',
    description:
      'Painted stucco fronts, papel picado swaying overhead and a comal that never quite cools down.',
    cuisineIds: ['cui-mexican', 'cui-tex-mex'],
    buildingKind: 'mexican',
    theme: {
      wall: '#FBF2DC',
      roof: brand.teal600,
      awning: brand.salmon,
      accent: brand.butter,
      ground: '#C7D4CF',
    },
  },
  {
    id: 'dis-burger',
    name: 'Burger Avenue',
    slug: 'burger-avenue',
    emoji: '🍔',
    tagline: 'Chrome-trimmed diners and a permanent smell of charcoal.',
    description:
      'Steel counters, a griddle running all day and booths that fill the moment the shift boards empty.',
    cuisineIds: ['cui-burgers', 'cui-bbq'],
    buildingKind: 'burger',
    theme: {
      wall: '#F7F0E0',
      roof: brand.slate,
      awning: brand.butter,
      accent: brand.magenta,
      ground: '#C5D1CC',
    },
  },
  {
    id: 'dis-dessert',
    name: 'Dessert Lane',
    slug: 'dessert-lane',
    emoji: '🍰',
    tagline: 'A sugar-dusted alley of bakeries, gelato carts and mithai counters.',
    description:
      'Powder-pink shopfronts, hand-whipped frosting and trays of barfi cut to order at the counter.',
    cuisineIds: ['cui-desserts', 'cui-bakery', 'cui-ice-cream'],
    buildingKind: 'dessert',
    theme: {
      wall: '#FFF7F3',
      roof: brand.pink,
      awning: brand.butter,
      accent: brand.magenta,
      ground: '#CDD8D3',
    },
  },
  {
    id: 'dis-garden',
    name: 'Healthy Garden',
    slug: 'healthy-garden',
    emoji: '🥗',
    tagline: 'Glasshouses, raised beds and kitchens that pick their own leaves.',
    description:
      'Timber-and-glass pavilions set among raised beds, where most of the menu is cut a few steps from the pass.',
    cuisineIds: ['cui-salads', 'cui-vegan', 'cui-juices'],
    buildingKind: 'healthy',
    theme: {
      wall: '#F6F5E4',
      roof: brand.teal800,
      awning: brand.butter,
      accent: brand.pink,
      ground: '#C6D4CD',
    },
  },
];
