import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      /* "@/..." resolves to src/. Shadcn-shaped components are written
         against this, and it saves ../../.. chains elsewhere. */
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    /*
     * One React, one three.
     *
     * React Three Fiber is a React *renderer*: it calls React's own hooks
     * internally. Vite pre-bundled it into a dep chunk carrying a second copy
     * of React, and two copies means two hook dispatchers — the Canvas threw
     * "Invalid hook call" and "Cannot read properties of null (reading
     * 'useMemo')" before a single frame was drawn.
     *
     * three is deduped for the same class of reason: drei's helpers do
     * `instanceof` checks against three's classes, and two copies make a Mesh
     * from one fail the check in the other.
     */
    dedupe: ['react', 'react-dom', 'three'],
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});
