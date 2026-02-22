const CF_PAGES_ORIGIN = 'https://heartbeat-public.pages.dev';

const STATIC_ROUTES = [
  '/',
  '/exchange',
];

const STATIC_PREFIXES = [
  '/exchange/',
  '/_astro/',
  '/images/',
  '/fonts/',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

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

    // Everything else passes through to the original origin (Vercel)
    return fetch(request);
  },
};

function shouldServeFromPages(path) {
  if (STATIC_ROUTES.includes(path) || STATIC_ROUTES.includes(path + '/')) {
    return true;
  }
  for (const prefix of STATIC_PREFIXES) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}
