import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getDistrictSummaries,
  getRestaurantsByDistrict,
} from '../../services/restaurantService';
import type { Restaurant } from '../../data/types';
import { SideNav } from '../layout/SideNav';
import { FoodieAIBar } from '../ui/FoodieAIBar';
import { DistrictRail } from './DistrictRail';

/*
 * The 3D city is loaded on demand.
 *
 * three.js and its helpers are about 800KB of the bundle, and nothing outside
 * this one screen needs them — the login page, the admin dashboard and the
 * whole ordering flow were paying for a renderer they never instantiate. A
 * lazy boundary here keeps the first paint of every other route where it was.
 */
const City3D = lazy(() =>
  import('../city3d/City3D').then((m) => ({ default: m.City3D })),
);

/** How long the camera flies in before the listing page takes over. */
const ENTER_MS = 820;

interface FoodCityProps {
  /** Called once the camera has finished flying into a district. */
  onEnterDistrict: (districtId: string) => void;
  /** Straight to one kitchen's menu, skipping its neighbourhood. */
  onOpenRestaurant: (restaurantId: string) => void;
}

/**
 * The SNS city landing experience.
 *
 * The map is an interactive canvas — drag, wheel, pinch, zoom buttons and a
 * reset — and clicking a district is a two-beat move: the camera flies into the
 * block, then the city hands off to the restaurant listing. The 3D world is the
 * entry point only; it does not follow the customer into the ordering flow.
 */
export function FoodCity({ onEnterDistrict, onOpenRestaurant }: FoodCityProps) {
  const summaries = useMemo(() => getDistrictSummaries(), []);
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
  const [collapsed, setCollapsed] = useState(false);

  const enterTimer = useRef<number | null>(null);

  const activeSummary = summaries.find((s) => s.district.id === activeId) ?? null;
  const hoveredSummary = summaries.find((s) => s.district.id === hoveredId) ?? null;

  const openDistrict = useCallback(
    (districtId: string) => {
      if (activeId) return;
      setActiveId(districtId);
      setHoveredId(null);
      /* The pause stays: the sidebar says which district you are entering
         before the listing replaces the city, so the handover is not a jump
         cut. What it no longer does is fly a fake camera — the real one keeps
         whatever view you left it in. */
      enterTimer.current = window.setTimeout(() => onEnterDistrict(districtId), ENTER_MS);
    },
    [activeId, onEnterDistrict],
  );

  useEffect(
    () => () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
    },
    [],
  );

  return (
    <main className="fc-stage" data-zoomed={activeId ? 'true' : undefined}>
      <aside className="fc-aside" data-collapsed={collapsed || undefined}>
        <div className="fc-aside-scroll">
          <SideNav collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

          <div className="fc-aside-body">
          {activeSummary ? (
            <div className="fc-entering">
              <p className="fc-panel-eyebrow">Heading into</p>
              <h2 className="fc-panel-title">
                <span aria-hidden="true">{activeSummary.district.emoji}</span>{' '}
                {activeSummary.district.name}
              </h2>
              <p className="fc-panel-tagline">{activeSummary.district.description}</p>
              <div className="fc-entering-bar" aria-hidden="true">
                <span />
              </div>
            </div>
          ) : (
            /*
              The hero that stood here — "Pick a street, not a list", the SNS
              wordmark and the kitchen count — is gone. The brand is already in
              the top bar, and the city underneath makes the same argument
              better than a line of copy about it can. The panel is a list of
              districts; it opens with the districts.
            */
            <div className="fc-guide">
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
          </div>
        </div>

        <FoodieAIBar />
      </aside>

      {/*
        The 3D city.

        It replaced an isometric SVG drawing that could only be seen from four
        fixed corners. The sidebar, the district rail, the Foodie launcher and
        the whole customer journey are untouched — `onEnterDistrict` and
        `onOpenRestaurant` are the same two callbacks the flat city raised, so
        nothing downstream of the map knows the medium changed.

        The pan/zoom/rotation state that used to live in `useCityCamera` is
        gone from here: a real camera owns its own position, and keeping a
        second copy in React state would mean two things deciding where the
        view is.
      */}
      <div className="fc-map-wrap">
        <Suspense fallback={<CityLoading />}>
          <City3D
            summaries={summaries}
            restaurantsByDistrict={restaurantsByDistrict}
            onEnterDistrict={openDistrict}
            onOpenRestaurant={onOpenRestaurant}
          />
        </Suspense>

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

/** Shown while the renderer downloads. Deliberately quiet — it is a moment. */
function CityLoading() {
  return (
    <div className="c3-loading" role="status">
      <span className="c3-loading-dot" aria-hidden="true" />
      <p>Building the city…</p>
    </div>
  );
}
