import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { IsoBuilding } from './art/IsoBuilding';
import {
  IsoLamp,
  IsoParasol,
  IsoPerson,
  IsoShrub,
  IsoStall,
  IsoSteam,
  IsoTree,
} from './art/IsoScenery';
import { BLOCK, BUILDING_HEIGHTS, BUILDING_SLOTS, iso, poly, shade, type Plot } from './iso';

interface IsoDistrictProps {
  summary: DistrictSummary;
  plot: Plot;
  restaurants: Restaurant[];
  hovered: boolean;
  dimmed: boolean;
  active: boolean;
  onHover: (districtId: string | null) => void;
  onSelect: (districtId: string) => void;
}

/**
 * One city block.
 *
 * The buildings are generated from `restaurants` — one per row — so the block's
 * skyline and its restaurant count can never drift apart. Buildings are drawn
 * back-to-front by grid depth so they overlap correctly.
 */
export function IsoDistrict({
  summary,
  plot,
  restaurants,
  hovered,
  dimmed,
  active,
  onHover,
  onSelect,
}: IsoDistrictProps) {
  const { district, restaurantCount, topRating } = summary;
  const theme = district.theme;

  const slots = BUILDING_SLOTS.slice(0, restaurants.length)
    .map((slot, i) => ({
      gx: plot.gx + slot.gx,
      gy: plot.gy + slot.gy,
      h: BUILDING_HEIGHTS[i % BUILDING_HEIGHTS.length],
      restaurant: restaurants[i],
      variant: i,
    }))
    .sort((a, b) => a.gx + a.gy - (b.gx + b.gy));

  const label = `${district.name}. ${restaurantCount} restaurants. Top rated ${
    topRating?.toFixed(1) ?? 'not rated'
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
      {/* Block paving. */}
      <polygon
        points={poly(
          iso(plot.gx, plot.gy),
          iso(plot.gx + BLOCK, plot.gy),
          iso(plot.gx + BLOCK, plot.gy + BLOCK),
          iso(plot.gx, plot.gy + BLOCK),
        )}
        fill={theme.ground}
      />
      {/* Warm tint that only appears when the block is picked out. */}
      <polygon
        className="fc-district-pad"
        points={poly(
          iso(plot.gx, plot.gy),
          iso(plot.gx + BLOCK, plot.gy),
          iso(plot.gx + BLOCK, plot.gy + BLOCK),
          iso(plot.gx, plot.gy + BLOCK),
        )}
        fill={theme.awning}
      />
      {/* Kerb along the two street-facing edges. */}
      <polygon
        points={poly(
          iso(plot.gx, plot.gy + BLOCK),
          iso(plot.gx + BLOCK, plot.gy + BLOCK),
          iso(plot.gx + BLOCK, plot.gy + BLOCK - 0.16),
          iso(plot.gx, plot.gy + BLOCK - 0.16),
        )}
        fill={shade(theme.ground, -0.14)}
      />

      <BlockDressing plot={plot} theme={theme} styleKey={district.slug} />

      {/* Buildings, back to front. */}
      {slots.map((slot) => (
        <g key={slot.restaurant.id} className="fc-shop">
          <IsoBuilding
            gx={slot.gx}
            gy={slot.gy}
            h={slot.h}
            theme={theme}
            emblem={slot.restaurant.storefront.emblem}
            variant={slot.variant}
          />
          {slot.variant === 1 ? (
            <IsoSteam gx={slot.gx + 1.6} gy={slot.gy + 0.3} lift={slot.h + 24} delay={0.7} />
          ) : null}
        </g>
      ))}

    </g>
  );
}

/** Per-district street dressing, so each block has its own character. */
function BlockDressing({
  plot,
  theme,
  styleKey,
}: {
  plot: Plot;
  theme: { accent: string; awning: string; roof: string };
  styleKey: string;
}) {
  const x = plot.gx;
  const y = plot.gy;

  switch (styleKey) {
    case 'asian-street':
      return (
        <g>
          <IsoLamp gx={x + 2.5} gy={y + 0.2} accent={theme.accent} />
          <IsoStall gx={x + 2.3} gy={y + 2.3} canopy={theme.awning} emblem="🥟" />
          <IsoPerson gx={x + 4.6} gy={y + 2.2} shirt="#7E9BB5" delay={0.4} />
          <IsoPerson gx={x + 2.2} gy={y + 4.6} shirt="#C4534A" delay={1.6} />
        </g>
      );
    case 'italian-street':
      return (
        <g>
          <IsoParasol gx={x + 2.4} gy={y + 2.4} canopy={theme.awning} />
          <IsoTree gx={x + 4.7} gy={y + 0.3} scale={0.72} />
          <IsoPerson gx={x + 4.5} gy={y + 2.6} shirt="#E0A93B" delay={0.9} />
          <IsoShrub gx={x + 0.3} gy={y + 4.6} scale={0.9} />
        </g>
      );
    case 'indian-district':
      return (
        <g>
          <IsoStall gx={x + 2.3} gy={y + 2.3} canopy={theme.awning} emblem="🫖" />
          <IsoStall gx={x + 0.2} gy={y + 4.4} canopy={theme.accent} emblem="🥭" />
          <IsoLamp gx={x + 4.7} gy={y + 0.2} accent="#E0A93B" />
          <IsoPerson gx={x + 4.5} gy={y + 2.5} shirt="#5E8C6A" delay={0.2} />
          <IsoPerson gx={x + 2.6} gy={y + 4.7} shirt="#9C3F6A" delay={1.2} />
        </g>
      );
    case 'mexican-plaza':
      return (
        <g>
          <IsoParasol gx={x + 2.4} gy={y + 2.4} canopy={theme.awning} />
          <IsoShrub gx={x + 4.6} gy={y + 0.4} />
          <IsoPerson gx={x + 4.5} gy={y + 2.6} shirt="#2E8B8B" delay={0.7} />
          <IsoLamp gx={x + 0.3} gy={y + 4.6} />
        </g>
      );
    case 'burger-avenue':
      return (
        <g>
          <IsoLamp gx={x + 2.5} gy={y + 0.2} />
          <IsoLamp gx={x + 0.2} gy={y + 2.5} />
          <IsoParasol gx={x + 2.4} gy={y + 2.4} canopy={theme.accent} />
          <IsoPerson gx={x + 4.6} gy={y + 2.3} shirt="#C9922F" delay={1.1} />
        </g>
      );
    case 'healthy-garden':
      return (
        <g>
          <IsoTree gx={x + 2.4} gy={y + 2.4} scale={0.9} />
          <IsoShrub gx={x + 4.6} gy={y + 0.4} />
          <IsoShrub gx={x + 0.4} gy={y + 4.6} />
          <IsoShrub gx={x + 4.6} gy={y + 4.6} />
          <IsoPerson gx={x + 2.5} gy={y + 4.7} shirt="#5E8C6A" delay={0.5} />
        </g>
      );
    case 'dessert-lane':
    default:
      return (
        <g>
          <IsoParasol gx={x + 2.4} gy={y + 2.4} canopy={theme.awning} />
          <IsoLamp gx={x + 4.7} gy={y + 0.3} accent="#F5C86B" />
          <IsoShrub gx={x + 0.3} gy={y + 4.6} scale={0.95} />
          <IsoPerson gx={x + 4.5} gy={y + 2.6} shirt="#D98B9B" delay={0.5} />
        </g>
      );
  }
}
