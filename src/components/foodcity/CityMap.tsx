import { forwardRef } from 'react';
import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { IsoGround } from './art/IsoGround';
import { IsoScooter } from './art/IsoScenery';
import { DistrictLabels } from './DistrictLabels';
import { IsoDistrict } from './IsoDistrict';
import { brand } from '../../theme/brand';
import {
  depthOf,
  districtPlots,
  iso,
  MAP_H,
  MAP_W,
  setProjectionRotation,
  type Rotation,
} from './iso';

interface CityMapProps {
  summaries: DistrictSummary[];
  restaurantsByDistrict: Record<string, Restaurant[]>;
  hoveredId: string | null;
  activeId: string | null;
  cameraTransform: string;
  /** False while the camera is being dragged, so the move tracks the pointer. */
  cameraAnimated: boolean;
  /** Quarter turns the city is drawn at. */
  rotation: Rotation;
  onHover: (districtId: string | null) => void;
  onSelect: (districtId: string) => void;
}

/**
 * The isometric city.
 *
 * One transform group, `fc-camera`, carries the whole pan/zoom move. The
 * transition is switched off while dragging (`cameraAnimated`) so the city
 * tracks the pointer instead of easing behind it.
 *
 * Blocks render back to front by grid depth (gx + gy), which is what lets
 * near buildings overlap far ones correctly.
 */
export const CityMap = forwardRef<SVGSVGElement, CityMapProps>(function CityMap(
  {
    summaries,
    restaurantsByDistrict,
    hoveredId,
    activeId,
    cameraTransform,
    cameraAnimated,
    rotation,
    onHover,
    onSelect,
  },
  svgRef,
) {
  /*
   * Set before anything below projects a point. CityMap is the single owner of
   * the city tree, so this is the one place the art's rotation is decided.
   */
  setProjectionRotation(rotation);

  const ordered = [...summaries].sort((a, b) => {
    const pa = districtPlots[a.district.id];
    const pb = districtPlots[b.district.id];
    return depthOf(pa.gx, pa.gy, rotation) - depthOf(pb.gx, pb.gy, rotation);
  });

  return (
    <svg
      ref={svgRef}
      className="fc-map"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Isometric map of the SNS city. Ten cuisine districts."
    >
      <defs>
        <filter id="fc-soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        {/* Sunlight falling across the turf. */}
        <radialGradient id="fc-turf-light" cx="62%" cy="24%" r="78%">
          <stop offset="0%" stopColor={brand.butter} stopOpacity="0.4" />
          <stop offset="55%" stopColor={brand.butter} stopOpacity="0.07" />
          <stop offset="100%" stopColor={brand.teal900} stopOpacity="0.2" />
        </radialGradient>
        {/*
          Atmospheric perspective. In this projection the far corner of the
          slab is the top of the screen, so the haze is strongest there and
          clears toward the heavier foreground.
        */}
        <linearGradient id="fc-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={brand.teal200} stopOpacity="0.34" />
          <stop offset="45%" stopColor={brand.teal300} stopOpacity="0.08" />
          <stop offset="100%" stopColor={brand.teal900} stopOpacity="0.1" />
        </linearGradient>
        {/* Deep teal is the environmental colour; the city sits inside it. */}
        <radialGradient id="fc-sky" cx="50%" cy="14%" r="96%">
          <stop offset="0%" stopColor={brand.teal300} />
          <stop offset="46%" stopColor={brand.teal600} />
          <stop offset="100%" stopColor={brand.teal900} />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="url(#fc-sky)" />

      <g
        className="fc-camera"
        data-animated={cameraAnimated || undefined}
        style={{ transform: cameraTransform }}
      >
        <g>
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
              rotation={rotation}
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
