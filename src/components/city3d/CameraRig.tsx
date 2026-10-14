import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { GRID_X } from './cityLayout';

/** The five named viewpoints, as spherical offsets from the city centre. */
export type ViewName = 'default' | 'top' | 'front' | 'side' | 'explore';

const SPAN = GRID_X;

export const VIEWS: Record<ViewName, [number, number, number]> = {
  /* The angle the isometric city was drawn at, as a real camera position:
     equal parts across and back, raised to the same 2:1 pitch. */
  default: [SPAN * 0.78, SPAN * 0.62, SPAN * 0.78],
  top: [0.001, SPAN * 1.18, 0.001],
  front: [0, SPAN * 0.34, SPAN * 1.05],
  side: [SPAN * 1.05, SPAN * 0.34, 0],
  explore: [SPAN * 0.5, SPAN * 0.3, SPAN * 0.86],
};

export interface CameraRigHandle {
  moveTo: (view: ViewName) => void;
  focusOn: (point: [number, number, number]) => void;
  orbitBy: (radians: number) => void;
  zoomBy: (factor: number) => void;
  reset: () => void;
}

/**
 * Camera and controls.
 *
 * Orbit is clamped at both ends of the vertical sweep: just under straight
 * down, and just above the horizon. Letting the polar angle reach 0 makes the
 * orbit gimbal-flip as it crosses the pole, and letting it pass 90° puts the
 * camera under the slab, where the city is a silhouette floating on nothing.
 * Both ends are reachable — you can look straight down at the rooftops and you
 * can get low enough to see the shopfronts against the skyline — they just
 * stop before the view stops meaning anything.
 *
 * Preset moves are animated by lerping the camera and the target together each
 * frame rather than by assigning a position: a cut between two viewpoints
 * loses the sense that it is one city being looked at from somewhere new.
 */
export const CameraRig = forwardRef<CameraRigHandle, { onInteract?: () => void }>(
  function CameraRig({ onInteract }, ref) {
    const controls = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();

    /* Null when no flight is in progress, which is most of the time. */
    const flight = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);

    useImperativeHandle(ref, () => ({
      moveTo(view) {
        const [x, y, z] = VIEWS[view];
        flight.current = {
          pos: new THREE.Vector3(x, y, z),
          target: new THREE.Vector3(0, 0, 0),
        };
      },
      focusOn(point) {
        const target = new THREE.Vector3(...point);
        /* Approach from where the camera already is, so a double-click reads
           as moving closer rather than as teleporting to a fixed angle. */
        const dir = camera.position.clone().sub(controls.current?.target ?? new THREE.Vector3())
          .normalize()
          .multiplyScalar(SPAN * 0.22);
        flight.current = { pos: target.clone().add(dir), target };
      },
      orbitBy(radians) {
        const c = controls.current;
        if (!c) return;
        const offset = camera.position.clone().sub(c.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), radians);
        flight.current = { pos: c.target.clone().add(offset), target: c.target.clone() };
      },
      zoomBy(factor) {
        const c = controls.current;
        if (!c) return;
        const offset = camera.position.clone().sub(c.target).multiplyScalar(factor);
        const len = THREE.MathUtils.clamp(offset.length(), c.minDistance, c.maxDistance);
        flight.current = {
          pos: c.target.clone().add(offset.setLength(len)),
          target: c.target.clone(),
        };
      },
      reset() {
        const [x, y, z] = VIEWS.default;
        flight.current = {
          pos: new THREE.Vector3(x, y, z),
          target: new THREE.Vector3(0, 0, 0),
        };
      },
    }));

    useEffect(() => {
      const [x, y, z] = VIEWS.default;
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
    }, [camera]);

    useFrame(() => {
      const c = controls.current;
      if (!c) return;

      /*
       * Keep the city in frame. Panning is useful — you want to push the view
       * off-centre to look along a street — but unbounded panning lets someone
       * shove the city off screen entirely with no way back except Reset.
       * This version of OrbitControls has no `maxTargetRadius`, so the target
       * is clamped here instead, after the controls have moved it.
       */
      const limit = SPAN * 0.45;
      if (c.target.lengthSq() > limit * limit) {
        c.target.setLength(limit);
        c.update();
      }

      const f = flight.current;
      if (!f) return;
      camera.position.lerp(f.pos, 0.12);
      c.target.lerp(f.target, 0.12);
      c.update();
      /* Close enough that another frame would not be visible. Without this the
         lerp runs forever, pinning a frame loop at full rate on a still city. */
      if (camera.position.distanceTo(f.pos) < 0.05 && c.target.distanceTo(f.target) < 0.05) {
        camera.position.copy(f.pos);
        c.target.copy(f.target);
        c.update();
        flight.current = null;
      }
    });

    return (
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.8}
        panSpeed={0.7}
        minDistance={SPAN * 0.22}
        maxDistance={SPAN * 1.9}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI / 2 - 0.06}
        onStart={() => {
          flight.current = null;
          onInteract?.();
        }}
      />
    );
  },
);
