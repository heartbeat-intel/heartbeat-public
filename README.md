# Heartbeat Public

## Purpose

`heartbeat-public` is the public Heartbeat website and Exchange-facing static experience. It is built with Astro, TypeScript, Tailwind, and small React islands for interactive flows.

This repo owns:

- Public homepage and marketing surface.
- Exchange public/account/publisher pages.
- Static and API-backed public content presentation.
- Public styling, layout, and static asset behavior.

## Runtime

- Astro
- TypeScript
- React islands
- Tailwind CSS
- Vercel adapter
- Wrangler Pages deploy command

## Local Development

```bash
npm install
npm run dev
```

Default local server:

```text
http://localhost:4321
```

## Build And Preview

```bash
npm run build
npm run preview
```

The build runs `astro check` before `astro build`, so type and Astro template issues should fail before deployment.

## Deployment

```bash
npm run deploy
```

The deploy script runs:

```bash
wrangler pages deploy dist
```

The repo also contains `vercel.json` and `astro.config.mjs`, so confirm the intended hosting target before changing routing or adapter configuration.

## Important Source Areas

| Area | Path |
| --- | --- |
| Pages | `src/pages/` |
| Exchange public pages | `src/pages/exchange/` |
| Astro components | `src/components/astro/` |
| React islands | `src/components/react/` |
| Data fetch helpers | `src/data/fetch.ts` |
| Layout | `src/layouts/BaseLayout.astro` |
| Global styles | `src/styles/global.css` |
| Edge routing | `worker/router.js` |

## Documentation

- `docs/REPO_GUIDE.md`: operator-facing repo guide with risks and checks.

## Operational Checks

Before merging public-site changes:

- Run `npm run build`.
- Smoke test `/`, `/exchange`, `/exchange/account`, and `/exchange/become-a-publisher` when touched.
- Confirm public API endpoints still match Aorta and Exchange response shapes.
- Confirm deployment target and routing behavior before changing `vercel.json`, `worker/router.js`, or `worker/wrangler.toml`.
