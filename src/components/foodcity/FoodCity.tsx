import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';
import {
  getCityStats,
  getDistrictSummaries,
  getRestaurantsByDistrict,
} from '../../services/restaurantService';
import type { Restaurant } from '../../data/types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../cart/useCart';
import { SideNav } from '../layout/SideNav';
import { FoodieAIBar } from '../ui/FoodieAIBar';
import { CityMap } from './CityMap';
import { DistrictRail } from './DistrictRail';
import { cameraForPlot, districtPlots } from './iso';
import { useCityCamera } from './useCityCamera';

/** How long the camera flies in before the listing page takes over. */
const ENTER_MS = 820;

interface FoodCityProps {
  /** Called once the camera has finished flying into a district. */
  onEnterDistrict: (districtId: string) => void;
}

/**
 * The SNS city landing experience.
 *
 * The map is an interactive canvas — drag, wheel, pinch, zoom buttons and a
 * reset — and clicking a district is a two-beat move: the camera flies into the
 * block, then the city hands off to the restaurant listing. The 3D world is the
 * entry point only; it does not follow the customer into the ordering flow.
 */
export function FoodCity({ onEnterDistrict }: FoodCityProps) {
  const navigate = useNavigate();
  const { totals } = useCart();
  const cartCount = totals.itemCount;
  /* Relative: works under "/" for a visitor and "/customer" when signed in. */
  const openCart = () => navigate('cart');

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
  const [collapsed, setCollapsed] = useState(false);

  const {
    transform: cameraTransform,
    animated: cameraAnimated,
    isPanning,
    canZoomIn,
    canZoomOut,
    flyTo,
    reset: resetCamera,
    zoomStep,
    rotation,
    rotate,
    bind: cameraBind,
    onWheel,
    setSvg,
  } = useCityCamera();
  const stageRef = useRef<HTMLDivElement>(null);
  const enterTimer = useRef<number | null>(null);

  const activeSummary = summaries.find((s) => s.district.id === activeId) ?? null;
  const hoveredSummary = summaries.find((s) => s.district.id === hoveredId) ?? null;

  const openDistrict = useCallback(
    (districtId: string) => {
      if (activeId) return;
      setActiveId(districtId);
      setHoveredId(null);
      flyTo(cameraForPlot(districtPlots[districtId]));
      enterTimer.current = window.setTimeout(() => onEnterDistrict(districtId), ENTER_MS);
    },
    [activeId, flyTo, onEnterDistrict],
  );

  useEffect(
    () => () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
    },
    [],
  );

  /*
   * Wheel zoom is bound by hand: React attaches onWheel passively, so it cannot
   * call preventDefault, and the page would scroll instead of the city zooming.
   */
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const handler = onWheel;
    node.addEventListener('wheel', handler, { passive: false });
    return () => node.removeEventListener('wheel', handler);
  }, [onWheel]);

  return (
    <main className="fc-stage" data-zoomed={activeId ? 'true' : undefined}>
      <aside className="fc-aside" data-collapsed={collapsed || undefined}>
        <div className="fc-aside-scroll">
          <SideNav
            onCart={openCart}
            cartCount={cartCount}
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            onHome={resetCamera}
          />

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
            <div className="fc-guide">
              <p className="fc-hero-eyebrow">Pick a street, not a list</p>
              <h1 className="fc-hero-title">SNS</h1>
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
          </div>
        </div>

        <FoodieAIBar />
      </aside>

      <div
        ref={stageRef}
        className="fc-map-wrap"
        data-panning={isPanning || undefined}
        {...cameraBind}
      >
        <CityMap
          ref={setSvg}
          summaries={summaries}
          restaurantsByDistrict={restaurantsByDistrict}
          hoveredId={hoveredId}
          activeId={activeId}
          cameraTransform={cameraTransform}
          cameraAnimated={cameraAnimated}
          rotation={rotation}
          onHover={setHoveredId}
          onSelect={openDistrict}
        />
        <div className="fc-vignette" aria-hidden="true" />

        <div className="fc-controls">
          <button
            type="button"
            onClick={() => zoomStep(1.3)}
            disabled={!canZoomIn}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Plus size={17} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => zoomStep(1 / 1.3)}
            disabled={!canZoomOut}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Minus size={17} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => rotate(-1)}
            aria-label="Turn the city left"
            title="Turn left"
          >
            <RotateCcw size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => rotate(1)}
            aria-label="Turn the city right"
            title="Turn right"
          >
            <RotateCw size={16} strokeWidth={2.2} />
          </button>
          <button type="button" onClick={resetCamera} aria-label="Reset view" title="Reset view">
            <Maximize2 size={15} strokeWidth={2.2} />
          </button>
        </div>

        {!activeId ? (
          <p className="fc-map-hint">Drag to explore · scroll to zoom · turn the city · click a district to walk in</p>
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
