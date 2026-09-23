/**
 * Brand palette.
 *
 * Single source of truth for colour. The SVG art imports these directly; the
 * CSS mirrors them as custom properties in index.css. Change a value here and
 * in the matching `--brand-*` token together.
 *
 * Budget the product is built to (roughly):
 *   60%  deep teal + neutral surfaces
 *   25%  warm light surfaces
 *   10%  butter yellow
 *    5%  pink / magenta / salmon accents
 *
 * That budget is why buildings are warm and the world around them is teal:
 * a city built from teal surfaces reads as one flat mass, and the accents stop
 * carrying any meaning.
 */

export const brand = {
  /* deep botanical teal, the environmental colour */
  teal900: '#04302F',
  teal800: '#075250',
  teal700: '#0A6A66',
  teal600: '#0E8480',
  teal500: '#14A09A',
  teal300: '#7FC6C2',
  teal200: '#A9DBD7',

  /* butter yellow: signs, lighting, highlights */
  butter: '#FFF8B5',
  butterDeep: '#F0DE79',
  butterShade: '#C9B44E',

  /* accents, used sparingly */
  pink: '#FCA5D1',
  magenta: '#FF258E',
  salmon: '#FC7494',

  slate: '#374151',
  slateDeep: '#252F3D',

  /* warm light surfaces */
  cream: '#FFFDF4',
  creamWarm: '#FBF3DE',
  creamDeep: '#F1E6CC',
} as const;

/** Environmental tones for the city diorama. */
export const world = {
  /** Turf, tinted toward the environmental teal rather than a true green. */
  turf: '#9FBDB2',
  turfDark: '#87A89E',
  /** Street paving. */
  paving: '#C2D0CB',
  pavingEdge: '#A9BAB4',
  /** Lane markings — butter, at low opacity. */
  marking: brand.butter,
  /** The slab the city stands on. */
  soil: brand.teal800,
  soilDeep: brand.teal900,
  /** Water in the fountain and the park pond. */
  water: brand.teal500,
  waterLight: brand.teal300,
  /** Foliage, kept in the teal family so it never fights the accents. */
  leaf: '#2F7A6B',
  leafLight: '#3E9385',
} as const;
