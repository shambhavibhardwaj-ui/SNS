import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getCityStats,
  getDistrictSummaries,
  getRestaurantsByDistrict,
} from '../../services/restaurantService';
import type { Restaurant } from '../../data/types';
import { FoodieAIBar } from '../ui/FoodieAIBar';
import { CityMap } from './CityMap';
import { DistrictRail } from './DistrictRail';
import { cameraForPlot, cameraTransform, CITY_CAMERA, districtPlots } from './iso';

/** How long the camera flies in before the listing page takes over. */
const ENTER_MS = 820;

interface FoodCityProps {
  /** Called once the camera has finished flying into a district. */
  onEnterDistrict: (districtId: string) => void;
}

/**
 * The Food City landing experience.
 *
 * Clicking a district is a two-beat move: the camera flies into the block, and
 * then the city hands off to the restaurant listing. The 3D world is the entry
 * point only — it does not follow the customer into the ordering flow.
 */
export function FoodCity({ onEnterDistrict }: FoodCityProps) {
  const summaries = useMemo(() => getDistrictSummaries(), []);
  const stats = useMemo(() => getCityStats(), []);
  const restaurantsByDistrict = useMemo(
    () =>
      summaries.reduce<Record<string, Restaurant[]>>((acc, { district }) => {
        acc[district.id] = getRestaurantsByDistrict(district.id);
        return acc;
      }, {}),
    [summaries],
  );

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const parallaxRef = useRef<SVGGElement>(null);
  const enterTimer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  /** Read inside the pointer handler, which must not depend on render state. */
  const activeIdRef = useRef<string | null>(null);

  const activeSummary = summaries.find((s) => s.district.id === activeId) ?? null;
  const hoveredSummary = summaries.find((s) => s.district.id === hoveredId) ?? null;

  const transform = useMemo(
    () =>
      activeId
        ? cameraTransform(cameraForPlot(districtPlots[activeId]))
        : cameraTransform(CITY_CAMERA),
    [activeId],
  );

  const openDistrict = useCallback(
    (districtId: string) => {
      if (activeId) return;
      setActiveId(districtId);
      setHoveredId(null);
      enterTimer.current = window.setTimeout(() => onEnterDistrict(districtId), ENTER_MS);
    },
    [activeId, onEnterDistrict],
  );

  /* Mirrored into a ref so the pointer handler can read it without re-binding. */
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(
    () => () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
    },
    [],
  );

  /**
   * Pointer parallax. Written straight to the node inside a rAF rather than
   * through state — this fires on every mouse move and must not re-render the
   * whole city.
   */
  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const node = parallaxRef.current;
    if (!node || activeIdRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.transform = `translate(${(-nx * 26).toFixed(1)}px, ${(-ny * 18).toFixed(1)}px)`;
    });
  }, []);

  const resetParallax = useCallback(() => {
    const node = parallaxRef.current;
    if (node) node.style.transform = 'translate(0px, 0px)';
  }, []);

  return (
    <main className="fc-stage" data-zoomed={activeId ? 'true' : undefined}>
      <aside className="fc-aside">
        {activeSummary ? (
          <div className="fc-entering">
            <p className="fc-panel-eyebrow">Heading into</p>
            <h2 className="fc-panel-title" style={{ '--panel-accent': activeSummary.district.theme.roof } as React.CSSProperties}>
              <span aria-hidden="true">{activeSummary.district.emoji}</span> {activeSummary.district.name}
            </h2>
            <p className="fc-panel-tagline">{activeSummary.district.description}</p>
            <div className="fc-entering-bar" aria-hidden="true">
              <span />
            </div>
          </div>
        ) : (
          <div className="fc-guide">
            <p className="fc-hero-eyebrow">Pick a street, not a list</p>
            <h1 className="fc-hero-title">
              Food<span>City</span>
            </h1>
            <p className="fc-hero-sub">
              {stats.restaurants} kitchens across {stats.districts} neighbourhoods.
              Wander in and see who&rsquo;s cooking.
            </p>

            <h2 className="fc-rail-heading">Districts</h2>
            <DistrictRail
              summaries={summaries}
              hoveredId={hoveredId}
              activeId={activeId}
              onHover={setHoveredId}
              onSelect={openDistrict}
            />
          </div>
        )}

        <FoodieAIBar />
      </aside>

      <div
        className="fc-map-wrap"
        onPointerMove={onPointerMove}
        onPointerLeave={resetParallax}
      >
        <CityMap
          ref={parallaxRef}
          summaries={summaries}
          restaurantsByDistrict={restaurantsByDistrict}
          hoveredId={hoveredId}
          activeId={activeId}
          cameraTransform={transform}
          onHover={setHoveredId}
          onSelect={openDistrict}
        />
        <div className="fc-vignette" aria-hidden="true" />

        {!activeId ? (
          <p className="fc-map-hint">Hover a district to look closer · click to walk in</p>
        ) : null}

        <p className="fc-sr-only" role="status">
          {activeSummary
            ? `Entering ${activeSummary.district.name}.`
            : hoveredSummary
              ? `${hoveredSummary.district.name}, ${hoveredSummary.restaurantCount} restaurants.`
              : 'Viewing the whole city.'}
        </p>
      </div>
    </main>
  );
}
