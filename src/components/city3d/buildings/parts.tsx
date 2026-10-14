import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Shared building parts.
 *
 * Two rules run through this file, and they are the reason the rebuild was
 * worth doing.
 *
 * **Every opening is placed on all four walls.** The isometric drawings only
 * ever showed three faces, so a back wall did not exist to be drawn. Here it
 * does, and a blank one is immediately obvious the moment the camera swings
 * round. `Windows` and `Trim` therefore take a side count, not a front flag.
 *
 * **Geometry and materials are memoised per call site.** A city of thirty
 * restaurants builds hundreds of meshes; allocating a fresh BoxGeometry on
 * every React render is what turns a smooth orbit into a slideshow.
 */

/** Slightly proud of the wall, so a window never z-fights the facade. */
const SKIN = 0.012;

export function useStandard(color: string, opts: { rough?: number; metal?: number } = {}) {
  const { rough = 0.82, metal = 0 } = opts;
  return useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }),
    [color, rough, metal],
  );
}

/** Glass that reads as lit from inside, so night-side walls are not dead. */
export function useGlow(color: string) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.55,
        roughness: 0.3,
      }),
    [color],
  );
}

/**
 * Windows banded around all four walls.
 *
 * Laid out from the centre so a wall always reads as symmetrical, and inset by
 * `SKIN` rather than placed flush: a coplanar face and wall flicker against
 * each other as the camera moves, which is the most distracting artefact a
 * slow orbit can produce.
 */
export function Windows({
  w, d, y, count = 3, width = 0.3, height = 0.34, color,
}: {
  w: number; d: number; y: number; count?: number; width?: number; height?: number; color: string;
}) {
  const glass = useGlow(color);
  const geo = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);

  const faces = useMemo(() => {
    const out: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const spread = (span: number) =>
      Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * (span / (count + 0.6)));

    for (const x of spread(w)) {
      out.push({ pos: [x, y, d / 2 + SKIN], rot: [0, 0, 0] });
      out.push({ pos: [x, y, -d / 2 - SKIN], rot: [0, Math.PI, 0] });
    }
    for (const z of spread(d)) {
      out.push({ pos: [w / 2 + SKIN, y, z], rot: [0, Math.PI / 2, 0] });
      out.push({ pos: [-w / 2 - SKIN, y, z], rot: [0, -Math.PI / 2, 0] });
    }
    return out;
  }, [w, d, y, count]);

  return (
    <>
      {faces.map((f, i) => (
        <mesh key={i} geometry={geo} material={glass} position={f.pos} rotation={f.rot} />
      ))}
    </>
  );
}

/** A band running right around the building — plinth, string course, cornice. */
export function Band({
  w, d, y, h = 0.12, out = 0.04, color,
}: { w: number; d: number; y: number; h?: number; out?: number; color: string }) {
  const mat = useStandard(color, { rough: 0.9 });
  const geo = useMemo(() => new THREE.BoxGeometry(w + out * 2, h, d + out * 2), [w, d, h, out]);
  return <mesh geometry={geo} material={mat} position={[0, y, 0]} castShadow receiveShadow />;
}

/** The shopfront: door and awning, on the +z face, which is the street side. */
export function Shopfront({
  w, d, color, awning, stripe, glow,
}: { w: number; d: number; color: string; awning: string; stripe: string; glow: string }) {
  const frame = useStandard(color, { rough: 0.7 });
  const cloth = useStandard(awning, { rough: 0.95 });
  const band = useStandard(stripe, { rough: 0.95 });
  const pane = useGlow(glow);

  const doorGeo = useMemo(() => new THREE.BoxGeometry(0.42, 0.72, 0.06), []);
  const paneGeo = useMemo(() => new THREE.PlaneGeometry(0.34, 0.5), []);

  return (
    <group>
      <mesh geometry={doorGeo} material={frame} position={[0, 0.36, d / 2 + 0.03]} castShadow />
      <mesh geometry={paneGeo} material={pane} position={[0, 0.42, d / 2 + 0.07]} />

      {/* Awning: a tilted slab with a valance, so it has thickness from below
          as well as from the street. */}
      <group position={[0, 0.88, d / 2 + 0.02]} rotation={[-0.42, 0, 0]}>
        <mesh material={cloth} castShadow>
          <boxGeometry args={[w * 0.82, 0.045, 0.42]} />
        </mesh>
        <mesh material={band} position={[0, 0.001, 0.21]}>
          <boxGeometry args={[w * 0.82, 0.05, 0.08]} />
        </mesh>
      </group>
    </group>
  );
}

/** Hipped roof: a pyramid that overhangs, so eaves read from underneath. */
export function HipRoof({
  w, d, y, h, color, overhang = 0.18,
}: { w: number; d: number; y: number; h: number; color: string; overhang?: number }) {
  const mat = useStandard(color, { rough: 0.75 });
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(Math.max(w, d) / 2 + overhang, h, 4);
    g.rotateY(Math.PI / 4);
    g.scale(1, 1, d / w);
    return g;
  }, [w, d, h, overhang]);
  return <mesh geometry={geo} material={mat} position={[0, y + h / 2, 0]} castShadow receiveShadow />;
}

/** Gable roof: two slopes with real end walls, not a flat card. */
export function GableRoof({
  w, d, y, h, color,
}: { w: number; d: number; y: number; h: number; color: string }) {
  const mat = useStandard(color, { rough: 0.75 });
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(d / 2 + 0.12, d / 2 + 0.12, w + 0.24, 3, 1);
    g.rotateZ(Math.PI / 2);
    g.rotateY(Math.PI / 2);
    g.scale(1, h / (d / 2), 1);
    return g;
  }, [w, d, h]);
  return <mesh geometry={geo} material={mat} position={[0, y + h / 2, 0]} castShadow receiveShadow />;
}

export { SKIN };
