import { useMemo } from 'react';
import * as THREE from 'three';
import { brand } from '../../theme/brand';
import { BLOCK, GRID_X, GRID_Y, HALF_X, HALF_Z, ROAD, STEP, world } from './cityLayout';

/**
 * The slab the city stands on: ground, streets, kerbs, plaza and park.
 *
 * Drawn from the same `BLOCK` / `ROAD` / `STEP` constants the isometric city
 * used, so the streets fall exactly where they always did. The diorama edge is
 * kept — the city sits on a raised slab rather than on an infinite plane,
 * because an endless ground plane gives the camera nothing to orbit *around*
 * and the city stops reading as an object you can pick up.
 */
export function CityGround() {
  const slab = useStandardMemo(brand.teal800, 0.95);
  const grass = useStandardMemo('#dCEADF', 0.98);
  const road = useStandardMemo('#E8E3D6', 0.96);
  const kerb = useStandardMemo('#CFC8B6', 0.9);
  const water = useMemo(
    () => new THREE.MeshStandardMaterial({ color: brand.teal500, roughness: 0.18, metalness: 0.35 }),
    [],
  );

  /* Street bands, as [centre, length] pairs along each axis. */
  const xRoads = useMemo(
    () => Array.from({ length: 3 }, (_, i) => BLOCK + i * STEP + ROAD / 2 - HALF_X),
    [],
  );
  const zRoads = useMemo(
    () => Array.from({ length: 2 }, (_, i) => BLOCK + i * STEP + ROAD / 2 - HALF_Z),
    [],
  );

  return (
    <group>
      {/* The slab: a little larger than the grid, with depth so the edge is
          visible from a low camera angle. */}
      <mesh position={[0, -0.36, 0]} receiveShadow material={slab}>
        <boxGeometry args={[GRID_X + 4.4, 0.7, GRID_Y + 4.4]} />
      </mesh>

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={grass}>
        <planeGeometry args={[GRID_X + 3, GRID_Y + 3]} />
      </mesh>

      {xRoads.map((x) => (
        <group key={`x${x}`}>
          <mesh position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={road}>
            <planeGeometry args={[ROAD, GRID_Y + 3]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[x + (s * ROAD) / 2, 0.045, 0]} material={kerb}>
              <boxGeometry args={[0.1, 0.06, GRID_Y + 3]} />
            </mesh>
          ))}
        </group>
      ))}

      {zRoads.map((z) => (
        <group key={`z${z}`}>
          <mesh position={[0, 0.025, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={road}>
            <planeGeometry args={[GRID_X + 3, ROAD]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0.045, z + (s * ROAD) / 2]} material={kerb}>
              <boxGeometry args={[GRID_X + 3, 0.06, 0.1]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* The plaza fountain and the park pond, both kept from the flat city. */}
      <Plaza water={water} />
      <Park />
    </group>
  );
}

function useStandardMemo(color: string, rough: number) {
  return useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: rough }), [color, rough]);
}

function Plaza({ water }: { water: THREE.Material }) {
  const stone = useStandardMemo('#E4DCCB', 0.92);
  const [x, , z] = world(STEP + BLOCK / 2, STEP + BLOCK / 2);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={stone}>
        <circleGeometry args={[BLOCK / 2 - 0.2, 28]} />
      </mesh>
      <mesh position={[0, 0.18, 0]} material={stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.3, 24]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} material={water}>
        <cylinderGeometry args={[0.72, 0.72, 0.06, 24]} />
      </mesh>
      <mesh position={[0, 0.6, 0]} material={stone} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 10]} />
      </mesh>
    </group>
  );
}

function Park() {
  const [x, , z] = world(STEP * 3 + BLOCK / 2, STEP * 2 + BLOCK / 2);
  const lawn = useStandardMemo('#CFE3CE', 0.98);
  const pond = useMemo(
    () => new THREE.MeshStandardMaterial({ color: brand.teal500, roughness: 0.2, metalness: 0.3 }),
    [],
  );
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={lawn}>
        <planeGeometry args={[BLOCK - 0.3, BLOCK - 0.3]} />
      </mesh>
      <mesh position={[0.4, 0.05, 0.3]} rotation={[-Math.PI / 2, 0, 0]} material={pond}>
        <circleGeometry args={[1.1, 20]} />
      </mesh>
      {[[-1.4, -1.2], [-1.6, 0.9], [1.3, -1.5], [0.2, -1.1]].map(([tx, tz], i) => (
        <Tree key={i} position={[tx, 0, tz]} seed={i / 4} />
      ))}
    </group>
  );
}

/** A tree: trunk plus two offset crowns, so it has volume from every side. */
export function Tree({ position, seed = 0.5 }: { position: [number, number, number]; seed?: number }) {
  const bark = useStandardMemo(brand.timber, 0.95);
  const leaf = useStandardMemo(seed > 0.5 ? '#6FAE7C' : '#5E9D6E', 0.92);
  const s = 0.8 + seed * 0.45;
  return (
    <group position={position} scale={[s, s, s]}>
      <mesh position={[0, 0.26, 0]} material={bark} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 0.52, 8]} />
      </mesh>
      <mesh position={[0, 0.66, 0]} material={leaf} castShadow>
        <sphereGeometry args={[0.32, 12, 10]} />
      </mesh>
      <mesh position={[0.14, 0.52, 0.06]} material={leaf} castShadow>
        <sphereGeometry args={[0.2, 10, 8]} />
      </mesh>
    </group>
  );
}
