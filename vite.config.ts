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
  },
});
