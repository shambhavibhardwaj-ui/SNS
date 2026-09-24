import { brand } from '../../../theme/brand';

/**
 * Architectural identity per cuisine.
 *
 * Adding a cuisine to the city means adding an entry here and an architecture
 * case in architecture.tsx — no change to the city, the district or the data
 * layer. The `signature` field selects the structure that does the recognising
 * work: it is what makes a building read as an ice cream parlour or a harbour
 * shack before anyone reads the sign.
 */
export type CuisineKind =
  | 'mexican'
  | 'chinese'
  | 'seafood'
  | 'pureVeg'
  | 'jain'
  | 'italian'
  | 'healthy'
  | 'southIndian'
  | 'northIndian'
  | 'dessert';

export type Signature =
  | 'stuccoArch'
  | 'tieredRoof'
  | 'harbour'
  | 'leafGable'
  | 'calmCourt'
  | 'pizzaOven'
  | 'greenhouse'
  | 'tiledEaves'
  | 'dome'
  | 'cone';

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
  signature: Signature;
}

export const cuisineBuildingStyles: Record<CuisineKind, BuildingStyle> = {
  mexican: {
    wall: '#FBE7CC',
    wallAlt: '#F6D6B4',
    roof: brand.terracotta,
    awning: brand.teal600,
    awningStripe: brand.butter,
    trim: brand.terracottaDeep,
    accent: brand.salmon,
    glow: brand.butter,
    signature: 'stuccoArch',
  },
  chinese: {
    wall: '#F7EDDC',
    wallAlt: '#EFE0C6',
    roof: brand.teal900,
    /* The palette has no true Chinese red; this is salmon taken deep enough to
       read as lacquer against the butter-gold trim. */
    awning: '#C2455E',
    awningStripe: brand.butter,
    trim: brand.timber,
    accent: '#C2455E',
    glow: brand.butter,
    signature: 'tieredRoof',
  },
  seafood: {
    wall: '#F1F5F2',
    wallAlt: '#DCE9E6',
    roof: brand.teal700,
    awning: brand.teal500,
    awningStripe: brand.cream,
    trim: brand.teal800,
    accent: brand.butter,
    glow: brand.butter,
    signature: 'harbour',
  },
  pureVeg: {
    wall: '#F1F4E2',
    wallAlt: '#E5EBCF',
    roof: brand.teal700,
    awning: brand.butter,
    awningStripe: '#3E9385',
    trim: brand.timber,
    accent: '#3E9385',
    glow: brand.butter,
    signature: 'leafGable',
  },
  jain: {
    wall: '#F9F6EE',
    wallAlt: '#F0EBDE',
    roof: brand.teal800,
    awning: brand.cream,
    awningStripe: brand.stone,
    trim: brand.stone,
    accent: brand.teal300,
    glow: brand.butter,
    signature: 'calmCourt',
  },
  italian: {
    wall: '#FAF0DC',
    wallAlt: '#F2E2C4',
    roof: brand.terracotta,
    awning: brand.cream,
    awningStripe: brand.terracotta,
    trim: brand.terracottaDeep,
    accent: brand.teal700,
    glow: brand.butter,
    signature: 'pizzaOven',
  },
  healthy: {
    wall: '#F2F3E2',
    wallAlt: '#E7EAD2',
    roof: brand.teal800,
    awning: brand.butter,
    awningStripe: brand.teal600,
    trim: brand.timber,
    accent: brand.pink,
    glow: brand.butter,
    signature: 'greenhouse',
  },
  southIndian: {
    wall: '#F6E4C6',
    wallAlt: '#EED6B0',
    roof: brand.terracottaDeep,
    awning: brand.butter,
    awningStripe: brand.teal600,
    trim: brand.timber,
    accent: brand.teal600,
    glow: brand.butter,
    signature: 'tiledEaves',
  },
  northIndian: {
    wall: '#F2DFBC',
    wallAlt: '#E9D0A6',
    roof: brand.terracotta,
    awning: brand.butter,
    awningStripe: brand.salmon,
    trim: brand.terracottaDeep,
    accent: brand.magenta,
    glow: brand.butter,
    signature: 'dome',
  },
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
};

/** Falls back to a plain shopfront if a district has no architecture yet. */
export function styleFor(kind: string | undefined): BuildingStyle {
  return cuisineBuildingStyles[kind as CuisineKind] ?? cuisineBuildingStyles.italian;
}
