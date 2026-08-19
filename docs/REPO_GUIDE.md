# Heartbeat Public Repo Guide

## Purpose

`heartbeat-public` is the public-facing Heartbeat site and Exchange landing surface. It is smaller than the admin app, but it is high visibility because it serves public pages, Exchange routes, and marketing/publisher entry points.

The repo is the source of truth for:

- Public page layouts and content presentation.
- Exchange public routes.
- Astro component composition.
- React islands for interactive subscribe/sign-in/modal behavior.
- Static build and edge/static hosting behavior.

## Runtime

- Astro 5
- TypeScript
- React 18 islands
- Tailwind CSS
- `@astrojs/vercel`
- Wrangler for Cloudflare Pages deployment

## Local Development

```bash
npm install
npm run dev
```

Default local server:

```text
http://localhost:4321
```

## Tests And Build

There is no dedicated unit test command in `package.json` yet. Use the production build as the baseline check:

```bash
npm run build
npm run preview
```

`npm run build` runs:

```bash
astro check && astro build
```

## Deployment

Primary deploy command:

```bash
npm run deploy
```

This publishes `dist` through Wrangler Pages. The repo also includes `vercel.json`, so deployment ownership should be confirmed before changing platform-specific config.

Important files:

- `astro.config.mjs`
- `vercel.json`
- `worker/router.js`
- `worker/wrangler.toml`
- `public/_headers`

## High-Risk Areas

- Public API contract drift against Aorta public website endpoints.
- Exchange catalog/account route drift against `heartbeat-exchange`.
- Conflicting Vercel and Cloudflare/Wrangler deployment assumptions.
- SEO/static asset regressions from layout or metadata changes.
- Interactive React islands that depend on browser-only APIs.

## Important Source Areas

| Area | Path |
| --- | --- |
| Homepage | `src/pages/index.astro` |
| Exchange pages | `src/pages/exchange/` |
| Astro sections | `src/components/astro/` |
| React islands | `src/components/react/` |
| Data helpers | `src/data/` |
| Shared constants | `src/constants/`, `src/utils/` |
| Global styling | `src/styles/global.css` |
| Edge/static routing | `worker/` |

## Operational Checks

Before merging public-site changes:

- Run `npm run build`.
- Preview the built site with `npm run preview`.
- Smoke test public and Exchange routes that changed.
- Check browser console and Network tab for failed public API calls.
- Confirm target hosting platform before changing deployment files.
