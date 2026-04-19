import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

const exchangeApiUrl = process.env.PUBLIC_EXCHANGE_API_URL || 'https://exchange-api-production-598945484330.us-central1.run.app';
const aortaApiUrl = process.env.PUBLIC_AORTA_API_URL || 'https://aorta-api-web-production-598945484330.us-central1.run.app';

export default defineConfig({
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
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
        '/api/v1/publishers': {
          target: exchangeApiUrl,
          changeOrigin: true,
        },
        '/api/v1/catalog': {
          target: exchangeApiUrl,
          changeOrigin: true,
        },
        '/api/v1/products': {
          target: exchangeApiUrl,
          changeOrigin: true,
        },
        '/api/v1/collections': {
          target: exchangeApiUrl,
          changeOrigin: true,
        },
        '/api/v1/payments': {
          target: exchangeApiUrl,
          changeOrigin: true,
        },
        '/api/v1/auth': {
          target: exchangeApiUrl,
          changeOrigin: true,
        },
        '/api/v1/me': {
          target: exchangeApiUrl,
          changeOrigin: true,
        },
        '/api/v1/workspace': {
          target: aortaApiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1\/workspace/, '/api/v1'),
        },
        '/api/v1': {
          target: aortaApiUrl,
          changeOrigin: true,
        },
      },
    },
  },
});
