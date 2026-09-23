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
    theme: {
      wall: '#F3DFBE',
      roof: '#B4562C',
      awning: '#E08B2E',
      accent: '#9C3F6A',
      ground: '#E8D5B4',
      roofStyle: 'dome',
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
    theme: {
      wall: '#F2E0D2',
      roof: '#A8342C',
      awning: '#C4534A',
      accent: '#E8A33D',
      ground: '#E6D2BC',
      roofStyle: 'pagoda',
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
    theme: {
      wall: '#F4E4C9',
      roof: '#9A5334',
      awning: '#5C7F4F',
      accent: '#C4543F',
      ground: '#E8D5B4',
      roofStyle: 'gable',
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
    theme: {
      wall: '#F5DFC4',
      roof: '#C05A33',
      awning: '#2E8B8B',
      accent: '#E0A93B',
      ground: '#E9D4B2',
      roofStyle: 'clay',
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
    theme: {
      wall: '#EFE0C2',
      roof: '#7A4A2B',
      awning: '#C9922F',
      accent: '#5E8C6A',
      ground: '#E6D2B8',
      roofStyle: 'flat',
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
    theme: {
      wall: '#F8E6E0',
      roof: '#C4788B',
      awning: '#D98B9B',
      accent: '#7E9BB5',
      ground: '#EADCC6',
      roofStyle: 'scallop',
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
    theme: {
      wall: '#EEEAD8',
      roof: '#5E8C6A',
      awning: '#7FA672',
      accent: '#C9922F',
      ground: '#DFDCC0',
      roofStyle: 'terrace',
    },
  },
];
