/**
 * Pulls React Three Fiber's JSX intrinsics into the build.
 *
 * R3F declares `<mesh>`, `<group>`, `<boxGeometry>` and the rest by augmenting
 * JSX.IntrinsicElements, but the root tsconfig compiles `src` with no explicit
 * `types` entry for it, so `npm run build` — which runs `tsc` first — did not
 * see the augmentation and rejected every element in the city.
 *
 * A reference rather than a `types` entry in tsconfig: this keeps the
 * dependency next to the code that needs it, and nothing outside `city3d/`
 * renders three.js elements.
 */
/// <reference types="@react-three/fiber" />
