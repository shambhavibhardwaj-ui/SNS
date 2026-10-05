import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { RestaurantBuilding } from './buildings/RestaurantBuilding';
import { IsoLamp, IsoPerson, IsoShrub, IsoSteam } from './art/IsoScenery';
import {
  BLOCK,
  BUILDING_HEIGHTS,
  BUILDING_SLOTS,
  depthOf,
  iso,
  poly,
  shade,
  type Plot,
  type Rotation,
} from './iso';

interface IsoDistrictProps {
  summary: DistrictSummary;
  plot: Plot;
  restaurants: Restaurant[];
  hovered: boolean;
  dimmed: boolean;
  active: boolean;
  rotation: Rotation;
  onHover: (districtId: string | null) => void;
  onSelect: (districtId: string) => void;
  /** Opening one kitchen, rather than walking into its neighbourhood. */
  onSelectRestaurant: (restaurantId: string) => void;
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
  rotation,
  onHover,
  onSelect,
  onSelectRestaurant,
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
    .sort((a, b) => depthOf(a.gx, a.gy, rotation) - depthOf(b.gx, b.gy, rotation));

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

      <BlockDressing plot={plot} theme={theme} />

      {/*
        Buildings, back to front.

        Each one is its own control. The block underneath is still the way into
        the neighbourhood, but a building *is* a restaurant — one row, one
        shape — so clicking the thing that represents a kitchen should open
        that kitchen rather than the street it stands on. The click stops here
        so it does not also trigger the district behind it.
      */}
      {slots.map((slot) => (
        <g
          key={slot.restaurant.id}
          className="fc-shop"
          role="button"
          tabIndex={0}
          aria-label={`${slot.restaurant.name}. ${slot.restaurant.rating.toFixed(1)} stars. ${
            slot.restaurant.isOpen ? 'Open' : 'Closed'
          }. Opens the menu.`}
          onClick={(event) => {
            event.stopPropagation();
            onSelectRestaurant(slot.restaurant.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onSelectRestaurant(slot.restaurant.id);
            }
          }}
        >
          <title>{slot.restaurant.name}</title>
          <RestaurantBuilding
            restaurant={slot.restaurant}
            kind={district.buildingKind}
            gx={slot.gx}
            gy={slot.gy}
            h={slot.h}
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

/**
 * Generic street dressing: lighting, greenery and a couple of residents.
 *
 * Cuisine character lives in the architecture itself — banana plants, water
 * basins, produce crates, mooring bollards and so on are part of each building.
 * This only sets the block, so the two do not duplicate each other.
 */
function BlockDressing({
  plot,
  theme,
}: {
  plot: Plot;
  theme: { accent: string; awning: string; roof: string };
}) {
  const x = plot.gx;
  const y = plot.gy;
  return (
    <g>
      <IsoLamp gx={x + 2.5} gy={y + 0.15} accent={theme.accent} />
      <IsoLamp gx={x + 0.15} gy={y + 2.5} accent={theme.accent} />
      <IsoPerson gx={x + 4.65} gy={y + 2.3} shirt={theme.awning} delay={0.4} />
      <IsoPerson gx={x + 2.35} gy={y + 4.65} shirt={theme.roof} delay={1.5} />
      <IsoShrub gx={x + 4.7} gy={y + 4.7} scale={0.85} />
    </g>
  );
}
