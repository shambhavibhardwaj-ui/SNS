import { brand } from '../theme/brand';
import type { District } from './types';

/**
 * table: districts
 *
 * Ten cuisine districts, one per architecture. Pure data — no map coordinates.
 * Where a district sits on the city grid is layout, and lives in
 * components/foodcity/iso.ts.
 */
export const districts: District[] = [
  {
    id: 'dis-north-indian',
    name: 'Tandoor Quarter',
    slug: 'tandoor-quarter',
    emoji: '🫓',
    tagline: 'Clay ovens along a sandstone arcade, open till the dough runs out.',
    description:
      'Sandstone arches and carved screens, with tandoors sunk behind every counter and bread coming off the wall still blistering.',
    foodLabel: 'North Indian food',
    cuisineIds: ['cui-north-indian', 'cui-mughlai', 'cui-street-chaat'],
    buildingKind: 'northIndian',
    theme: {
      wall: '#F2DFBC',
      roof: brand.terracotta,
      awning: brand.butter,
      accent: brand.magenta,
      ground: '#C8D5D0',
    },
  },
  {
    id: 'dis-south-indian',
    name: 'Tiffin Lane',
    slug: 'tiffin-lane',
    emoji: '🍛',
    tagline: 'Tiled eaves, banana leaves and a griddle running from six.',
    description:
      'Deep tiled eaves on timber brackets, banana plants at every step, and filter coffee pulled between two tumblers.',
    foodLabel: 'South Indian food',
    cuisineIds: ['cui-south-indian', 'cui-dosa', 'cui-filter-coffee'],
    buildingKind: 'southIndian',
    theme: {
      wall: '#F6E4C6',
      roof: brand.terracottaDeep,
      awning: brand.butter,
      accent: brand.teal600,
      ground: '#C8D5D0',
    },
  },
  {
    id: 'dis-chinese',
    name: 'Lantern Row',
    slug: 'lantern-row',
    emoji: '🥡',
    tagline: 'Tiered roofs, hanging lanterns and woks that never cool.',
    description:
      'Upswept tiled roofs stacked in tiers, a gilded gateway at the head of the street, and lanterns strung the whole length of it.',
    foodLabel: 'Chinese food',
    cuisineIds: ['cui-sichuan', 'cui-cantonese', 'cui-dim-sum'],
    buildingKind: 'chinese',
    theme: {
      wall: '#F7EDDC',
      roof: brand.teal900,
      awning: '#C2455E',
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
      'Sun-warmed terracotta, checked cloths on the kerb and the smell of a crust catching in the oven.',
    foodLabel: 'Italian food',
    cuisineIds: ['cui-italian', 'cui-pizza'],
    buildingKind: 'italian',
    theme: {
      wall: '#FAF0DC',
      roof: brand.terracotta,
      awning: brand.cream,
      accent: brand.teal700,
      ground: '#C9D6D1',
    },
  },
  {
    id: 'dis-seafood',
    name: 'Harbour Point',
    slug: 'harbour-point',
    emoji: '🦐',
    tagline: 'Clapboard shacks, rope rails and the day’s catch on ice.',
    description:
      'Weatherboard fronts in salt-faded teal, a stub of a lighthouse at the end of the pier, and crates coming straight off the boats.',
    foodLabel: 'Seafood',
    cuisineIds: ['cui-seafood', 'cui-coastal', 'cui-grill'],
    buildingKind: 'seafood',
    theme: {
      wall: '#F1F5F2',
      roof: brand.teal700,
      awning: brand.teal500,
      accent: brand.butter,
      ground: '#C4D4D2',
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
    foodLabel: 'Mexican food',
    cuisineIds: ['cui-mexican', 'cui-tex-mex'],
    buildingKind: 'mexican',
    theme: {
      wall: '#FBE7CC',
      roof: brand.terracotta,
      awning: brand.teal600,
      accent: brand.salmon,
      ground: '#C7D4CF',
    },
  },
  {
    id: 'dis-dessert',
    name: 'Dessert Lane',
    slug: 'dessert-lane',
    emoji: '🍦',
    tagline: 'A sugar-dusted alley of parlours, gelato carts and mithai counters.',
    description:
      'Powder-pink shopfronts under soft-serve sculptures, with trays of barfi cut to order at the counter.',
    foodLabel: 'Desserts & ice cream',
    cuisineIds: ['cui-ice-cream', 'cui-desserts', 'cui-bakery'],
    buildingKind: 'dessert',
    theme: {
      wall: '#FFF1F4',
      roof: brand.pink,
      awning: brand.pink,
      accent: brand.magenta,
      ground: '#CDD8D3',
    },
  },
  {
    id: 'dis-pure-veg',
    name: 'Green Table',
    slug: 'green-table',
    emoji: '🥗',
    tagline: 'Crates at the door, herb boxes on every sill.',
    description:
      'Timber-framed shopfronts with the produce stacked out front, and a leaf carved into every gable.',
    foodLabel: 'Pure veg food',
    cuisineIds: ['cui-pure-veg', 'cui-north-indian', 'cui-salads'],
    buildingKind: 'pureVeg',
    theme: {
      wall: '#F1F4E2',
      roof: brand.teal700,
      awning: brand.butter,
      accent: '#3E9385',
      ground: '#C6D4CD',
    },
  },
  {
    id: 'dis-jain',
    name: 'Quiet Court',
    slug: 'quiet-court',
    emoji: '🌿',
    tagline: 'Stone, water and shade. Nothing louder than it needs to be.',
    description:
      'Low stone-banded pavilions around a still basin, with a columned porch and very little else. Cooking without root vegetables, onion or garlic.',
    foodLabel: 'Jain food',
    cuisineIds: ['cui-jain', 'cui-gujarati', 'cui-thali'],
    buildingKind: 'jain',
    theme: {
      wall: '#F7F4EA',
      roof: brand.teal800,
      awning: brand.cream,
      accent: brand.teal300,
      ground: '#CBD6D0',
    },
  },
  {
    id: 'dis-healthy',
    name: 'Garden Terrace',
    slug: 'garden-terrace',
    emoji: '🥑',
    tagline: 'Glasshouses, raised beds and a juice bar you can see from the street.',
    description:
      'Timber-and-glass pavilions set among raised beds, where most of the menu is cut a few steps from the pass.',
    foodLabel: 'Healthy food',
    cuisineIds: ['cui-salads', 'cui-vegan', 'cui-juices'],
    buildingKind: 'healthy',
    theme: {
      wall: '#F2F3E2',
      roof: brand.teal800,
      awning: brand.butter,
      accent: brand.pink,
      ground: '#C6D4CD',
    },
  },
];
