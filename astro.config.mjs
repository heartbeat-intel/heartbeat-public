// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'static', // Pre-render all pages at build time
  adapter: cloudflare(),
  site: 'https://www.heartbeatintel.com',
});