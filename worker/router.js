const CF_PAGES_ORIGIN = 'https://heartbeat-public.pages.dev';
const VERCEL_ORIGIN = 'https://heartbeat-public.vercel.app';

// Exact static routes served from Cloudflare Pages
const STATIC_ROUTES = [
  '/',
  '/exchange',
];

// Prefixes for static assets served from Cloudflare Pages
const STATIC_PREFIXES = [
  '/images/',
  '/fonts/',
];

// Prefixes for routes served from Vercel (SSR pages + build assets)
const VERCEL_PREFIXES = [
  '/exchange/publisher/',
  '/_astro/',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // SSR routes go to Vercel (serverless functions)
    if (shouldServeFromVercel(path)) {
      const vercelUrl = new URL(path + url.search, VERCEL_ORIGIN);
      const vercelRequest = new Request(vercelUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      const response = await fetch(vercelRequest);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // Static routes go to Cloudflare Pages
    if (shouldServeFromPages(path)) {
      const pagesUrl = new URL(path + url.search, CF_PAGES_ORIGIN);
      const pagesRequest = new Request(pagesUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      const response = await fetch(pagesRequest);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // Everything else passes through to the original origin (Vercel/heartbeat-web)
    return fetch(request);
  },
};

function shouldServeFromVercel(path) {
  for (const prefix of VERCEL_PREFIXES) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

function shouldServeFromPages(path) {
  if (STATIC_ROUTES.includes(path) || STATIC_ROUTES.includes(path + '/')) {
    return true;
  }
  for (const prefix of STATIC_PREFIXES) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }
  // /exchange/checkout/success is still static
  if (path.startsWith('/exchange/checkout/')) {
    return true;
  }
  // /exchange and /exchange/ (exact) are static, but not /exchange/publisher/*
  if (path === '/exchange' || path === '/exchange/') {
    return true;
  }
  return false;
}
