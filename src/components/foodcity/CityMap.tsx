import { forwardRef } from 'react';
import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { IsoGround } from './art/IsoGround';
import { IsoScooter } from './art/IsoScenery';
import { DistrictLabels } from './DistrictLabels';
import { IsoDistrict } from './IsoDistrict';
import { depthOf, districtPlots, iso, MAP_H, MAP_W } from './iso';

interface CityMapProps {
  summaries: DistrictSummary[];
  restaurantsByDistrict: Record<string, Restaurant[]>;
  hoveredId: string | null;
  activeId: string | null;
  cameraTransform: string;
  onHover: (districtId: string | null) => void;
  onSelect: (districtId: string) => void;
}

/**
 * The isometric city.
 *
 * Two nested transform groups: `fc-camera` carries the pan/zoom move, and
 * `fc-parallax` inside it carries the small pointer-driven offset. Keeping them
 * separate means a parallax nudge never fights the camera transition.
 *
 * Blocks render back to front by grid depth (gx + gy), which is what lets
 * near buildings overlap far ones correctly.
 */
export const CityMap = forwardRef<SVGGElement, CityMapProps>(function CityMap(
  {
    summaries,
    restaurantsByDistrict,
    hoveredId,
    activeId,
    cameraTransform,
    onHover,
    onSelect,
  },
  parallaxRef,
) {
  const ordered = [...summaries].sort((a, b) => {
    const pa = districtPlots[a.district.id];
    const pb = districtPlots[b.district.id];
    return depthOf(pa.gx, pa.gy) - depthOf(pb.gx, pb.gy);
  });

  return (
    <svg
      className="fc-map"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Isometric map of Food City. Seven cuisine districts."
    >
      <defs>
        <filter id="fc-soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <radialGradient id="fc-turf-light" cx="62%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#FFFBEA" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#FFFBEA" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#7A6B45" stopOpacity="0.18" />
        </radialGradient>
        <radialGradient id="fc-sky" cx="50%" cy="18%" r="92%">
          <stop offset="0%" stopColor="#FDF6E6" />
          <stop offset="58%" stopColor="#F3E7D2" />
          <stop offset="100%" stopColor="#E3D2B8" />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="url(#fc-sky)" />

      <g className="fc-camera" style={{ transform: cameraTransform }}>
        <g className="fc-parallax" ref={parallaxRef}>
          <IsoGround />

          {/* Delivery scooters working the two main streets. */}
          <g className="fc-scooter-lane" aria-hidden="true">
            <g transform={`translate(${iso(6, -1).x} ${iso(6, -1).y})`}>
              <g className="fc-scooter fc-scooter--a">
                <IsoScooter color="#C4543F" />
              </g>
            </g>
            <g transform={`translate(${iso(-1, 6).x} ${iso(-1, 6).y})`}>
              <g className="fc-scooter fc-scooter--b">
                <IsoScooter color="#2E8B8B" />
              </g>
            </g>
          </g>

          {ordered.map((summary) => (
            <IsoDistrict
              key={summary.district.id}
              summary={summary}
              plot={districtPlots[summary.district.id]}
              restaurants={restaurantsByDistrict[summary.district.id] ?? []}
              hovered={hoveredId === summary.district.id && activeId === null}
              dimmed={activeId !== null && activeId !== summary.district.id}
              active={activeId === summary.district.id}
              onHover={onHover}
              onSelect={onSelect}
            />
          ))}

          <DistrictLabels summaries={summaries} hoveredId={hoveredId} activeId={activeId} />
        </g>
      </g>
    </svg>
  );
});
