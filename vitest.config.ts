import { defineConfig } from 'vitest/config';

// Deliberately not astro's getViteConfig(): that boots the Vercel adapter into
// every test run, and nothing under test imports an astro:* module. No
// @vitejs/plugin-react either (it is not hoisted); esbuild's automatic JSX
// runtime is all the React islands need.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
