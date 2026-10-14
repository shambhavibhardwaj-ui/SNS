import { useMemo } from 'react';
import * as THREE from 'three';
import type { BuildingStyle, Signature } from '../../foodcity/buildings/buildingStyles';
import { Band, GableRoof, HipRoof, Shopfront, Windows, useGlow, useStandard } from './parts';

/**
 * One restaurant, as a solid.
 *
 * The ten signatures are the same ten the isometric city had — cone, dome,
 * pizza oven, tiered eaves, stucco arches, greenhouse, lighthouse, leaf gable,
 * stone parapet, tiled eaves — rebuilt as geometry rather than redrawn as
 * faces. Each keeps its district's palette from `buildingStyles.ts`, so the
 * city's colour identity survives the change of medium even though every
 * polygon is new.
 *
 * The body is always a box with windows on all four walls and a shopfront on
 * the street side; the signature is what sits on top of it and what is added
 * around it. That split is deliberate — it means a new cuisine needs a roof,
 * not a building, and it guarantees no silhouette can ship with a blank back.
 */

export interface Restaurant3DProps {
  style: BuildingStyle;
  /** Drives height and wall tone, so a building never changes as you orbit. */
  seed: number;
  /** Tiles. The footprint is square in the grid. */
  size?: number;
  hovered?: boolean;
  selected?: boolean;
}

export function Restaurant3D({ style, seed, size = 1.6, hovered, selected }: Restaurant3DProps) {
  const w = size;
  const d = size;
  /* Two to three storeys. Enough variation to give the skyline a rhythm,
     not so much that one building dwarfs its street. */
  const h = 1.15 + seed * 0.95;

  const wallColor = seed > 0.5 ? style.wall : style.wallAlt;
  const wall = useStandard(wallColor, { rough: 0.88 });
  const roof = useStandard(style.roof, { rough: 0.72 });
  const trim = useStandard(style.trim, { rough: 0.8 });
  const accent = useStandard(style.accent, { rough: 0.6 });
  const glow = useGlow(style.glow);

  const bodyGeo = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);

  /* Hover and selection are emissive on the trim rather than a colour swap:
     recolouring the facade loses the district, which is the one thing the
     palette is carrying. */
  const highlight = useMemo(() => {
    if (!hovered && !selected) return null;
    return new THREE.MeshStandardMaterial({
      color: style.accent,
      emissive: new THREE.Color(style.accent),
      emissiveIntensity: selected ? 0.9 : 0.45,
      transparent: true,
      opacity: selected ? 0.5 : 0.3,
    });
  }, [hovered, selected, style.accent]);

  return (
    <group>
      <mesh geometry={bodyGeo} material={wall} position={[0, h / 2, 0]} castShadow receiveShadow />

      {highlight ? (
        <mesh position={[0, h / 2, 0]} material={highlight}>
          <boxGeometry args={[w + 0.06, h + 0.06, d + 0.06]} />
        </mesh>
      ) : null}

      <Band w={w} d={d} y={0.07} h={0.14} color={style.trim} />
      <Windows w={w} d={d} y={h * 0.62} count={3} color={style.glow} />
      {h > 1.8 ? <Windows w={w} d={d} y={h * 0.86} count={3} height={0.26} color={style.glow} /> : null}
      <Shopfront w={w} d={d} color={style.trim} awning={style.awning} stripe={style.awningStripe} glow={style.glow} />

      <Signature kind={style.signature} w={w} d={d} h={h} style={style} seed={seed}
        roof={roof} trim={trim} accent={accent} glow={glow} />
    </group>
  );
}

/* ----------------------------------------------------------- signatures -- */

interface SigProps {
  kind: Signature;
  w: number; d: number; h: number;
  style: BuildingStyle;
  seed: number;
  roof: THREE.Material;
  trim: THREE.Material;
  accent: THREE.Material;
  glow: THREE.Material;
}

function Signature({ kind, w, d, h, style, seed, roof, trim, accent, glow }: SigProps) {
  switch (kind) {
    /* Dessert — a cone, with a scoop sitting under it. */
    case 'cone':
      return (
        <group position={[0, h, 0]}>
          <mesh material={roof} castShadow>
            <coneGeometry args={[w * 0.56, 0.78, 16]} />
          </mesh>
          <mesh material={accent} position={[0, 0.5, 0]} castShadow>
            <sphereGeometry args={[0.2, 14, 12]} />
          </mesh>
        </group>
      );

    /* North Indian — a dome on a drum, with corner finials. */
    case 'dome':
      return (
        <group position={[0, h, 0]}>
          <mesh material={trim} castShadow>
            <cylinderGeometry args={[w * 0.4, w * 0.44, 0.16, 16]} />
          </mesh>
          <mesh material={roof} position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[w * 0.38, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={accent} position={[0, w * 0.38 + 0.14, 0]} castShadow>
            <coneGeometry args={[0.05, 0.22, 8]} />
          </mesh>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} material={trim} position={[sx * w * 0.42, 0.12, sz * d * 0.42]} castShadow>
              <cylinderGeometry args={[0.05, 0.06, 0.3, 8]} />
            </mesh>
          ))}
        </group>
      );

    /* Chinese — tiered eaves, each tier a separate overhanging slab. */
    case 'tieredRoof':
      return (
        <group position={[0, h, 0]}>
          {[0, 1, 2].map((t) => (
            <mesh key={t} material={roof} position={[0, t * 0.3, 0]} castShadow receiveShadow>
              <coneGeometry args={[w * (0.72 - t * 0.14), 0.26, 4]} />
            </mesh>
          ))}
          <mesh material={accent} position={[0, 0.92, 0]} castShadow>
            <sphereGeometry args={[0.08, 10, 8]} />
          </mesh>
        </group>
      );

    /* South Indian — tiled eaves over a stepped gopuram block. */
    case 'tiledEaves':
      return (
        <group position={[0, h, 0]}>
          <mesh material={roof} castShadow>
            <coneGeometry args={[w * 0.68, 0.3, 4]} />
          </mesh>
          <mesh material={trim} position={[0, 0.34, 0]} castShadow>
            <boxGeometry args={[w * 0.5, 0.3, d * 0.5]} />
          </mesh>
          <mesh material={roof} position={[0, 0.58, 0]} castShadow>
            <coneGeometry args={[w * 0.36, 0.26, 4]} />
          </mesh>
        </group>
      );

    /* Italian — a pizza oven: barrel roof, chimney, and a real flue. */
    case 'pizzaOven':
      return (
        <group position={[0, h, 0]}>
          <GableRoof w={w} d={d} y={0} h={0.42} color={style.roof} />
          <mesh material={trim} position={[w * 0.26, 0.5, -d * 0.2]} castShadow>
            <boxGeometry args={[0.24, 0.5, 0.24]} />
          </mesh>
          <mesh material={accent} position={[w * 0.26, 0.77, -d * 0.2]} castShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.08, 10]} />
          </mesh>
        </group>
      );

    /* Mexican — stucco arches and a flat parapet roof terrace. */
    case 'stuccoArch':
      return (
        <group position={[0, h, 0]}>
          <mesh material={trim} castShadow receiveShadow>
            <boxGeometry args={[w + 0.14, 0.2, d + 0.14]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} material={accent} position={[s * w * 0.3, 0.2, 0]} castShadow>
              <torusGeometry args={[0.16, 0.045, 8, 14, Math.PI]} />
            </mesh>
          ))}
          <mesh material={roof} position={[0, 0.12, d * 0.3]} castShadow>
            <boxGeometry args={[w * 0.9, 0.06, 0.1]} />
          </mesh>
        </group>
      );

    /* Seafood — a harbour lighthouse with a lit lamp room. */
    case 'harbour':
      return (
        <group position={[0, h, 0]}>
          <HipRoof w={w} d={d} y={0} h={0.3} color={style.roof} />
          <mesh material={trim} position={[w * 0.3, 0.55, d * 0.28]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 0.8, 12]} />
          </mesh>
          <mesh material={glow} position={[w * 0.3, 1.02, d * 0.28]}>
            <cylinderGeometry args={[0.13, 0.13, 0.16, 12]} />
          </mesh>
          <mesh material={roof} position={[w * 0.3, 1.16, d * 0.28]} castShadow>
            <coneGeometry args={[0.18, 0.18, 12]} />
          </mesh>
        </group>
      );

    /* Pure veg — a leaf gable with a planted ridge. */
    case 'leafGable':
      return (
        <group position={[0, h, 0]}>
          <GableRoof w={w} d={d} y={0} h={0.46} color={style.roof} />
          {[-0.3, 0, 0.3].map((x, i) => (
            <mesh key={i} material={accent} position={[x * w, 0.5, 0]} castShadow>
              <sphereGeometry args={[0.1 + (i === 1 ? 0.03 : 0), 10, 8]} />
            </mesh>
          ))}
        </group>
      );

    /* Jain — a calm court: low parapet, a single finial, nothing loud. */
    case 'calmCourt':
      return (
        <group position={[0, h, 0]}>
          <mesh material={trim} castShadow receiveShadow>
            <boxGeometry args={[w + 0.1, 0.16, d + 0.1]} />
          </mesh>
          <mesh material={roof} position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[w * 0.62, 0.22, d * 0.62]} />
          </mesh>
          <mesh material={accent} position={[0, 0.42, 0]} castShadow>
            <octahedronGeometry args={[0.11]} />
          </mesh>
        </group>
      );

    /* Health freak — a greenhouse: glazed barrel vault, visibly hollow-lit. */
    case 'greenhouse':
    default:
      return (
        <group position={[0, h, 0]}>
          <mesh material={glow} castShadow>
            <cylinderGeometry args={[w * 0.46, w * 0.46, d * 0.92, 12, 1, false, 0, Math.PI]} />
          </mesh>
          <mesh material={trim} position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[w * 0.46, 0.022, 6, 14, Math.PI]} />
          </mesh>
          {[-0.3, 0.3].map((z, i) => (
            <mesh key={i} material={trim} position={[0, 0, z * d]}>
              <torusGeometry args={[w * 0.46, 0.02, 6, 14, Math.PI]} />
            </mesh>
          ))}
          <mesh material={accent} position={[0, 0.1, 0]} visible={seed > 0.6}>
            <sphereGeometry args={[0.09, 8, 6]} />
          </mesh>
        </group>
      );
  }
}
