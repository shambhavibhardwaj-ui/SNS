import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { brand } from '../../theme/brand';
import { CameraRig, type CameraRigHandle, type ViewName } from './CameraRig';
import { CityGround } from './CityGround';
import { DistrictBlock3D } from './DistrictBlock3D';
import { CityControls } from './CityControls';
import { BuildingCard } from './BuildingCard';
import { blockCentre, districtPlots } from './cityLayout';

/**
 * The SNS city, in three dimensions.
 *
 * It replaces an isometric SVG drawing that could only ever be seen from four
 * fixed corners. The layout, the districts, the one-building-per-restaurant
 * rule and the whole customer journey are unchanged — what is new is that the
 * camera is real, so every roof, back and side wall exists and can be looked
 * at.
 *
 * **Drag is not a click.** OrbitControls and building picking share a pointer,
 * and without a threshold every rotation that happens to finish over a
 * building opens that building. The pointer's travel is measured between down
 * and up, and anything past a few pixels is treated as a camera move and
 * nothing else.
 */
export function City3D({
  summaries, restaurantsByDistrict, onEnterDistrict, onOpenRestaurant,
}: {
  summaries: DistrictSummary[];
  restaurantsByDistrict: Record<string, Restaurant[]>;
  onEnterDistrict: (districtId: string) => void;
  onOpenRestaurant: (restaurantId: string) => void;
}) {
  const rig = useRef<CameraRigHandle>(null);
  const shell = useRef<HTMLDivElement>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ restaurant: Restaurant; summary: DistrictSummary } | null>(null);

  /* Pointer travel since the last press, in CSS pixels. */
  const down = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = down.current;
    if (!d) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) dragged.current = true;
  }, []);

  const byId = useMemo(
    () => new Map(summaries.map((s) => [s.district.id, s])),
    [summaries],
  );

  const pickBuilding = useCallback(
    (restaurant: Restaurant) => {
      if (dragged.current) return;
      const summary = byId.get(restaurant.districtId);
      if (summary) setPicked({ restaurant, summary });
    },
    [byId],
  );

  const pickDistrict = useCallback(
    (districtId: string) => {
      if (dragged.current) return;
      const plot = districtPlots[districtId];
      if (plot) rig.current?.focusOn(blockCentre(plot));
    },
    [],
  );

  const toggleFullscreen = useCallback(() => {
    const node = shell.current;
    if (!node) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void node.requestFullscreen?.();
  }, []);

  return (
    <div className="c3-shell" ref={shell}>
      <Canvas
        className="c3-canvas"
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 42, near: 0.5, far: 400 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerMissed={() => setPicked(null)}
      >
        <color attach="background" args={[brand.teal800]} />
        {/* Fog keeps the slab edge from reading as a hard cut-off when the
            camera drops low, without hiding the city itself. */}
        <fog attach="fog" args={[brand.teal800, 48, 120]} />

        <hemisphereLight args={['#ffffff', brand.teal700, 1.15]} />
        <directionalLight
          position={[18, 26, 14]}
          intensity={1.25}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-26}
          shadow-camera-right={26}
          shadow-camera-top={26}
          shadow-camera-bottom={-26}
          shadow-bias={-0.0004}
        />
        {/* A dim fill from the opposite side, so the wall facing away from the
            sun is shaded rather than black — the back of a building has to be
            legible, which is the entire point of the rebuild. */}
        <directionalLight position={[-16, 12, -12]} intensity={0.35} />

        <Suspense fallback={null}>
          <CameraRig ref={rig} onInteract={() => setPicked(null)} />
          <CityGround />
          {summaries.map((summary) => {
            const plot = districtPlots[summary.district.id];
            if (!plot) return null;
            return (
              <DistrictBlock3D
                key={summary.district.id}
                summary={summary}
                plot={plot}
                restaurants={restaurantsByDistrict[summary.district.id] ?? []}
                hoveredId={hoveredId}
                selectedId={picked?.restaurant.id ?? null}
                onHoverBuilding={setHoveredId}
                onPickBuilding={pickBuilding}
                onPickDistrict={pickDistrict}
              />
            );
          })}
        </Suspense>
      </Canvas>

      <CityControls
        onView={(v: ViewName) => rig.current?.moveTo(v)}
        onOrbit={(dir) => rig.current?.orbitBy(dir * Math.PI / 6)}
        onZoom={(f) => rig.current?.zoomBy(f)}
        onReset={() => rig.current?.reset()}
        onFullscreen={toggleFullscreen}
      />

      {picked ? (
        <BuildingCard
          restaurant={picked.restaurant}
          summary={picked.summary}
          onClose={() => setPicked(null)}
          onEnterDistrict={() => onEnterDistrict(picked.summary.district.id)}
          onOpen={() => onOpenRestaurant(picked.restaurant.id)}
        />
      ) : null}

      <p className="c3-hint">Drag to rotate · scroll to zoom · right-drag to pan · click a kitchen</p>
    </div>
  );
}
