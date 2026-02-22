const VERCEL_ORIGIN = 'https://heartbeat-public.vercel.app';

// All heartbeat-public routes (static + SSR) are served from Vercel
const HEARTBEAT_PUBLIC_ROUTES = [
  '/',
];

const HEARTBEAT_PUBLIC_PREFIXES = [
  '/exchange',
  '/_astro/',
  '/images/',
  '/fonts/',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

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

    // Everything else passes through to the original origin (heartbeat-web on Vercel)
    return fetch(request);
  },
};

function shouldServeFromVercel(path) {
  if (HEARTBEAT_PUBLIC_ROUTES.includes(path) || HEARTBEAT_PUBLIC_ROUTES.includes(path + '/')) {
    return true;
  }
  for (const prefix of HEARTBEAT_PUBLIC_PREFIXES) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }
  if (path === '/favicon.ico') {
    return true;
  }
  return false;
}
