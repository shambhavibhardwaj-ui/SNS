import { useMemo } from 'react';
import * as THREE from 'three';
import type { Restaurant } from '../../data/types';
import type { DistrictSummary } from '../../services/restaurantService';
import { styleFor } from '../foodcity/buildings/buildingStyles';
import { Restaurant3D } from './buildings/Restaurant3D';
import { Tree } from './CityGround';
import { BLOCK, blockCentre, buildingCentre, hashOf, slotFor, world, type Plot } from './cityLayout';

/**
 * One district: its ground tint, its restaurants, and its street furniture.
 *
 * A building is one restaurant row, exactly as before — the skyline is still
 * the data. What changed is that each one is now a solid you can walk around.
 *
 * Picking is per building and deliberately *not* on the block: clicking a
 * kitchen opens that kitchen, which is the behaviour the flat city settled on
 * and the one customers already know.
 */
export function DistrictBlock3D({
  summary, plot, restaurants, hoveredId, selectedId, onHoverBuilding, onPickBuilding, onPickDistrict,
}: {
  summary: DistrictSummary;
  plot: Plot;
  restaurants: Restaurant[];
  hoveredId: string | null;
  selectedId: string | null;
  onHoverBuilding: (id: string | null) => void;
  onPickBuilding: (restaurant: Restaurant) => void;
  onPickDistrict: (districtId: string) => void;
}) {
  const { district } = summary;
  const ground = useMemo(
    () => new THREE.MeshStandardMaterial({ color: district.theme.ground, roughness: 0.96 }),
    [district.theme.ground],
  );
  const [cx, , cz] = blockCentre(plot);

  return (
    <group>
      {/* The block's own tint, raised a hair above the lawn so it reads as a
          paved precinct rather than as z-fighting with the ground. */}
      <mesh
        position={[cx, 0.04, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={ground}
        onClick={(e) => {
          e.stopPropagation();
          onPickDistrict(district.id);
        }}
      >
        <planeGeometry args={[BLOCK - 0.25, BLOCK - 0.25]} />
      </mesh>

      {restaurants.map((r, i) => {
        const slot = slotFor(i);
        const [bx, , bz] = buildingCentre(plot, slot);
        const seed = hashOf(r.id);
        return (
          <group
            key={r.id}
            position={[bx, 0.05, bz]}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverBuilding(r.id);
            }}
            onPointerOut={() => onHoverBuilding(null)}
            onClick={(e) => {
              e.stopPropagation();
              onPickBuilding(r);
            }}
          >
            <Restaurant3D
              style={styleFor(district.buildingKind)}
              seed={seed}
              hovered={hoveredId === r.id}
              selected={selectedId === r.id}
            />
          </group>
        );
      })}

      {/* Corner planting, so a block is never a bare square from above. */}
      {[[0.5, 0.5], [BLOCK - 0.5, BLOCK - 0.5]].map(([ox, oz], i) => {
        const [tx, , tz] = world(plot.gx + ox, plot.gy + oz);
        return <Tree key={i} position={[tx, 0.05, tz]} seed={(i + 1) / 3} />;
      })}
    </group>
  );
}
