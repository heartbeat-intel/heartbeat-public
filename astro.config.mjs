import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    ssr: {
      noExternal: ['@iconify/react'],
    },
    server: {
      proxy: {
        '/api/v1': {
          target: 'https://heartbeat-exchange-598945484330.us-central1.run.app',
          changeOrigin: true,
        },
      },
    },
  },
});
