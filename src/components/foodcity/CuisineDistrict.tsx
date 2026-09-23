import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { Building } from './art/Building';
import {
  Bench,
  Bunting,
  FoodCart,
  LanternString,
  PatioTable,
  Person,
  Shrub,
  Steam,
  StreetLamp,
  Tree,
} from './art/Scenery';
import { layoutStorefronts, type ClusterBand } from './mapLayout';

interface CuisineDistrictProps {
  summary: DistrictSummary;
  band: ClusterBand;
  restaurants: Restaurant[];
  hovered: boolean;
  /** True when another district is open, so this one recedes. */
  dimmed: boolean;
  /** True when this district is the one being explored. */
  active: boolean;
  onHover: (districtId: string | null) => void;
  onSelect: (districtId: string) => void;
}

/**
 * One neighbourhood of the city.
 *
 * The row of buildings comes straight from `restaurants` — one storefront per
 * restaurant — so the district's skyline and its restaurant count can never
 * drift apart.
 */
export function CuisineDistrict({
  summary,
  band,
  restaurants,
  hovered,
  dimmed,
  active,
  onHover,
  onSelect,
}: CuisineDistrictProps) {
  const { district, restaurantCount, topRating } = summary;
  const theme = district.theme;
  const slots = layoutStorefronts(band, restaurants.length);
  const centerX = band.x + band.w / 2;
  /* Rooftops top out around baseline-206, so labels live above that. */
  const plateY = band.baseline - 262;
  const cardY = band.baseline - 348;

  const label = `${district.name}. ${restaurantCount} restaurants. Top rated ${
    topRating?.toFixed(1) ?? 'n/a'
  } stars. ${district.tagline}`;

  return (
    <g
      role="button"
      tabIndex={active ? -1 : 0}
      aria-label={label}
      className={[
        'fc-district',
        hovered ? 'is-hovered' : '',
        dimmed ? 'is-dimmed' : '',
        active ? 'is-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => onHover(district.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(district.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(district.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(district.id);
        }
      }}
    >
      {/* Ground pad — a warm patch of paving under the block. */}
      <rect
        x={band.x - 34}
        y={band.baseline - 8}
        width={band.w + 68}
        height={30}
        rx={14}
        fill={theme.ground}
      />
      <rect
        x={band.x - 34}
        y={band.baseline - 8}
        width={band.w + 68}
        height={30}
        rx={14}
        fill={theme.awning}
        className="fc-district-pad"
      />

      {/* Back-of-block greenery */}
      <Tree x={band.x - 16} y={band.baseline - 4} scale={0.78} />
      <Tree x={band.x + band.w + 18} y={band.baseline - 2} scale={0.86} />

      {/* Storefronts — one per restaurant */}
      {slots.map((slot, i) => {
        const restaurant = restaurants[i];
        return (
          <g
            key={restaurant.id}
            className="fc-shop"
            style={{ transitionDelay: `${i * 55}ms` }}
          >
            <Building
              x={slot.x}
              baseline={slot.baseline}
              w={slot.w}
              h={slot.h}
              theme={theme}
              emblem={restaurant.storefront.emblem}
              wall={restaurant.storefront.wall}
              awning={restaurant.storefront.awning}
              variant={slot.variant}
            />
            {i === 1 ? <Steam x={slot.x + slot.w * 0.72} y={slot.baseline - slot.h - 6} delay={i * 0.6} /> : null}
          </g>
        );
      })}

      <DistrictDressing band={band} theme={theme} styleKey={district.slug} />

      {/* District name plate — always readable, hides when the hover card opens. */}
      <g className="fc-signpost" transform={`translate(${centerX} ${plateY})`}>
        <rect x={-72} y={-13} width={144} height={30} rx={9} fill="#4A3B2E" opacity={0.15} />
        <rect
          x={-74}
          y={-16}
          width={148}
          height={30}
          rx={9}
          fill="#FDF6E9"
          stroke={theme.roof}
          strokeWidth={2.2}
        />
        <text x={0} y={4} textAnchor="middle" className="fc-sign-text" fill={theme.roof}>
          {district.emoji} {district.name}
        </text>
      </g>

      {/* Hover card */}
      <g className="fc-card" transform={`translate(${centerX} ${cardY})`} aria-hidden="true">
        <rect x={-132} y={-4} width={264} height={86} rx={16} fill="#4A3B2E" opacity={0.18} />
        <rect x={-134} y={-8} width={268} height={86} rx={16} fill="#FFFBF2" />
        <rect x={-134} y={-8} width={268} height={86} rx={16} fill="none" stroke={theme.roof} strokeWidth={2} opacity={0.45} />
        <text x={-116} y={20} className="fc-card-title" fill="#33261B">
          {district.emoji} {district.name}
        </text>
        <text x={-116} y={43} className="fc-card-meta" fill={theme.roof}>
          {restaurantCount} restaurants
          {topRating !== null ? `  ·  ★ ${topRating.toFixed(1)} top rated` : ''}
        </text>
        <text x={-116} y={63} className="fc-card-sub" fill="#7A6250">
          {summary.cuisineNames.slice(0, 3).join(' · ')}
        </text>
        <path
          d={`M -9 78 L 9 78 L 0 90 Z`}
          fill="#FFFBF2"
        />
      </g>
    </g>
  );
}

/** Per-district street dressing, so each block has its own character. */
function DistrictDressing({
  band,
  theme,
  styleKey,
}: {
  band: ClusterBand;
  theme: { accent: string; awning: string; roof: string };
  styleKey: string;
}) {
  const left = band.x + 12;
  const right = band.x + band.w - 12;
  const y = band.baseline;

  switch (styleKey) {
    case 'asian-street':
      return (
        <g>
          <LanternString x1={left - 6} x2={right + 6} y={y - 212} color={theme.accent} count={6} />
          <StreetLamp x={left - 22} y={y} accent={theme.accent} />
          <Person x={left + 62} y={y + 12} shirt="#7E9BB5" delay={0.4} />
          <Person x={right - 74} y={y + 14} shirt="#C4534A" delay={1.6} />
          <Shrub x={right - 6} y={y + 12} scale={0.9} />
        </g>
      );
    case 'little-italy':
      return (
        <g>
          <PatioTable x={left + 40} y={y + 20} canopy={theme.awning} />
          <PatioTable x={right - 44} y={y + 18} canopy={theme.roof} />
          <StreetLamp x={band.x + band.w / 2 + 96} y={y + 6} />
          <Person x={left + 108} y={y + 22} shirt="#E0A93B" delay={0.9} />
        </g>
      );
    case 'indian-market':
      return (
        <g>
          <LanternString x1={left} x2={right} y={y - 212} color="#E0A93B" count={7} />
          <FoodCart x={left + 34} y={y + 22} canopy={theme.awning} emblem="🫖" />
          <FoodCart x={right - 36} y={y + 20} canopy={theme.accent} emblem="🥭" />
          <Person x={band.x + band.w / 2 - 20} y={y + 26} shirt="#5E8C6A" delay={0.2} />
          <Person x={band.x + band.w / 2 + 44} y={y + 24} shirt="#9C3F6A" delay={1.2} />
          <StreetLamp x={left - 26} y={y + 4} accent="#E0A93B" />
        </g>
      );
    case 'mexican-plaza':
      return (
        <g>
          <Bunting
            x1={left - 10}
            x2={right + 10}
            y={y - 212}
            colors={[theme.awning, theme.accent, theme.roof, '#5E8C6A']}
            count={10}
          />
          <PatioTable x={left + 46} y={y + 22} canopy={theme.awning} />
          <Bench x={right - 50} y={y + 20} />
          <Person x={band.x + band.w / 2 + 12} y={y + 24} shirt="#2E8B8B" delay={0.7} />
          <Shrub x={left - 12} y={y + 14} />
        </g>
      );
    case 'burger-avenue':
      return (
        <g>
          <StreetLamp x={left - 24} y={y + 2} />
          <StreetLamp x={right + 24} y={y + 2} />
          <Bench x={band.x + band.w / 2} y={y + 22} />
          <Person x={left + 78} y={y + 24} shirt="#C9922F" delay={1.1} />
          <Shrub x={right - 10} y={y + 16} scale={0.85} />
        </g>
      );
    case 'dessert-lane':
    default:
      return (
        <g>
          <PatioTable x={left + 34} y={y + 20} canopy={theme.awning} />
          <StreetLamp x={right + 16} y={y + 4} accent="#F2C368" />
          <Shrub x={left - 14} y={y + 14} scale={0.95} />
          <Person x={right - 68} y={y + 22} shirt="#D98B9B" delay={0.5} />
        </g>
      );
  }
}
