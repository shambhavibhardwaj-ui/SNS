import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { CityGround } from './art/CityGround';
import { Scooter } from './art/Scenery';
import { CuisineDistrict } from './CuisineDistrict';
import { BOULEVARD_Y, clusterBands, MAP_HEIGHT, MAP_WIDTH } from './mapLayout';

interface CityMapProps {
  summaries: DistrictSummary[];
  restaurantsByDistrict: Record<string, Restaurant[]>;
  hoveredId: string | null;
  activeId: string | null;
  /** SVG transform for the current camera position. */
  cameraTransform: string;
  onHover: (districtId: string | null) => void;
  onSelect: (districtId: string) => void;
}

/**
 * The illustrated city itself.
 *
 * The whole scene lives inside one transformed group, so opening a district is a
 * real camera move — pan and zoom over the same artwork — rather than a swap to
 * a different screen.
 */
export function CityMap({
  summaries,
  restaurantsByDistrict,
  hoveredId,
  activeId,
  cameraTransform,
  onHover,
  onSelect,
}: CityMapProps) {
  return (
    <svg
      className="fc-map"
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Map of Food City. Six cuisine districts."
    >
      <defs>
        <radialGradient id="fc-ground" cx="50%" cy="42%" r="78%">
          <stop offset="0%" stopColor="#FAEFD9" />
          <stop offset="62%" stopColor="#F2E3C8" />
          <stop offset="100%" stopColor="#E7D5B6" />
        </radialGradient>
      </defs>

      <g className="fc-camera" style={{ transform: cameraTransform }}>
        <CityGround />

        {/* Delivery scooters doing the rounds. */}
        <g className="fc-scooter-lane" aria-hidden="true">
          <g className="fc-scooter fc-scooter--east" style={{ transform: `translateY(${BOULEVARD_Y - 12}px)` }}>
            <Scooter color="#C4543F" />
          </g>
          <g className="fc-scooter fc-scooter--west" style={{ transform: `translateY(${BOULEVARD_Y + 16}px)` }}>
            <Scooter color="#2E8B8B" flip />
          </g>
        </g>

        {summaries.map((summary) => (
          <CuisineDistrict
            key={summary.district.id}
            summary={summary}
            band={clusterBands[summary.district.id]}
            restaurants={restaurantsByDistrict[summary.district.id] ?? []}
            hovered={hoveredId === summary.district.id && activeId === null}
            dimmed={activeId !== null && activeId !== summary.district.id}
            active={activeId === summary.district.id}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </g>
    </svg>
  );
}
