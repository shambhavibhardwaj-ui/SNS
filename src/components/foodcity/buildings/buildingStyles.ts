import { brand } from '../../../theme/brand';

/**
 * Architectural identity per cuisine.
 *
 * Adding a cuisine to the city means adding an entry here and an architecture
 * case in architecture.tsx — no change to the city, the district or the data
 * layer. The `signature` field selects the roof structure that does the
 * recognising work: it is what makes a building read as an ice cream parlour or
 * a greenhouse before anyone reads the sign.
 */
export type CuisineKind =
  | 'dessert'
  | 'indian'
  | 'italian'
  | 'asian'
  | 'mexican'
  | 'burger'
  | 'healthy';

export interface BuildingStyle {
  /** Base facade colour. */
  wall: string;
  /** Second facade tone, alternated between neighbouring restaurants. */
  wallAlt: string;
  /** Roof / heavy structure. */
  roof: string;
  /** Awning body and its stripe. */
  awning: string;
  awningStripe: string;
  /** Trim: window frames, posts, kerb details. */
  trim: string;
  /** The district's own accent, used sparingly on signage and small objects. */
  accent: string;
  /** Interior light spilling through the glazing. */
  glow: string;
  signature:
    | 'cone'
    | 'dome'
    | 'pizzaOven'
    | 'tieredRoof'
    | 'stuccoArch'
    | 'dinerSign'
    | 'greenhouse';
}

export const cuisineBuildingStyles: Record<CuisineKind, BuildingStyle> = {
  dessert: {
    wall: '#FFF1F4',
    wallAlt: '#FCE2EC',
    roof: brand.pink,
    awning: brand.pink,
    awningStripe: brand.cream,
    trim: '#E58BB4',
    accent: brand.magenta,
    glow: brand.butter,
    signature: 'cone',
  },
  indian: {
    wall: '#F6E2C4',
    wallAlt: '#EDD2AC',
    roof: brand.salmon,
    awning: brand.butter,
    awningStripe: brand.salmon,
    trim: '#B9704A',
    accent: brand.magenta,
    glow: brand.butter,
    signature: 'dome',
  },
  italian: {
    wall: '#FAF0DC',
    wallAlt: '#F2E2C4',
    roof: '#C2643F',
    awning: brand.cream,
    awningStripe: '#C2643F',
    trim: '#8F5638',
    accent: brand.teal700,
    glow: brand.butter,
    signature: 'pizzaOven',
  },
  asian: {
    wall: '#F7EDDC',
    wallAlt: '#EFE0C6',
    roof: brand.teal900,
    awning: brand.teal800,
    awningStripe: brand.butter,
    trim: '#6B4A32',
    accent: brand.magenta,
    glow: brand.butter,
    signature: 'tieredRoof',
  },
  mexican: {
    wall: '#FBE7CC',
    wallAlt: '#F6D6B4',
    roof: '#C96A44',
    awning: brand.teal600,
    awningStripe: brand.butter,
    trim: '#A0522F',
    accent: brand.salmon,
    glow: brand.butter,
    signature: 'stuccoArch',
  },
  burger: {
    wall: '#F4F1E6',
    wallAlt: '#E6E2D2',
    roof: brand.slate,
    awning: brand.butter,
    awningStripe: brand.slate,
    trim: '#4A5568',
    accent: brand.magenta,
    glow: brand.butter,
    signature: 'dinerSign',
  },
  healthy: {
    wall: '#F2F3E2',
    wallAlt: '#E7EAD2',
    roof: brand.teal800,
    awning: brand.butter,
    awningStripe: brand.teal600,
    trim: '#6B5A3E',
    accent: brand.pink,
    glow: brand.butter,
    signature: 'greenhouse',
  },
};

/** Falls back to a plain shopfront if a district has no architecture yet. */
export function styleFor(kind: string | undefined): BuildingStyle {
  return cuisineBuildingStyles[kind as CuisineKind] ?? cuisineBuildingStyles.italian;
}
