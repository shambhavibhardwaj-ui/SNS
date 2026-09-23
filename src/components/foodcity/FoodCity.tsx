import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCityStats,
  getDistrictSummaries,
  getRestaurantsByDistrict,
} from '../../services/restaurantService';
import type { Restaurant } from '../../data/types';
import { FoodieAIBar } from '../ui/FoodieAIBar';
import { CityMap } from './CityMap';
import { DistrictPanel } from './DistrictPanel';
import { DistrictRail } from './DistrictRail';
import { bandCamera, cameraTransform, CITY_CAMERA, clusterBands } from './mapLayout';

/**
 * The Food City landing experience.
 *
 * Layout is a guidebook page beside a map: the left column names where you are
 * and where you can go, the right column is the city itself. Opening a district
 * moves the camera on the map and turns the page on the left, so both halves
 * always describe the same place.
 *
 * All data arrives through restaurantService — this component knows nothing
 * about where restaurants are stored.
 */
export function FoodCity() {
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

  const activeSummary = summaries.find((s) => s.district.id === activeId) ?? null;
  const hoveredSummary = summaries.find((s) => s.district.id === hoveredId) ?? null;

  const transform = useMemo(
    () =>
      activeId
        ? cameraTransform(bandCamera(clusterBands[activeId]))
        : cameraTransform(CITY_CAMERA, 1),
    [activeId],
  );

  const openDistrict = useCallback((districtId: string) => {
    setActiveId(districtId);
    setHoveredId(null);
  }, []);

  const leaveDistrict = useCallback(() => setActiveId(null), []);

  /* Escape always walks back out to the city. */
  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') leaveDistrict();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, leaveDistrict]);

  return (
    <main className="fc-stage" data-zoomed={activeId ? 'true' : undefined}>
      <aside className="fc-aside">
        {activeSummary ? (
          <DistrictPanel summary={activeSummary} onBack={leaveDistrict} />
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

      <div className="fc-map-wrap">
        <CityMap
          summaries={summaries}
          restaurantsByDistrict={restaurantsByDistrict}
          hoveredId={hoveredId}
          activeId={activeId}
          cameraTransform={transform}
          onHover={setHoveredId}
          onSelect={openDistrict}
        />
        <div className="fc-vignette" aria-hidden="true" />

        {activeSummary ? (
          <button type="button" className="fc-escape-hint" onClick={leaveDistrict}>
            Esc — back to the city
          </button>
        ) : (
          <p className="fc-map-hint">Hover a district to look closer · click to walk in</p>
        )}

        {/* Screen-reader narration of the camera state. */}
        <p className="fc-sr-only" role="status">
          {activeSummary
            ? `Exploring ${activeSummary.district.name}, ${activeSummary.restaurantCount} restaurants. Press Escape to return to the city.`
            : hoveredSummary
              ? `${hoveredSummary.district.name}, ${hoveredSummary.restaurantCount} restaurants.`
              : 'Viewing the whole city.'}
        </p>
      </div>
    </main>
  );
}
