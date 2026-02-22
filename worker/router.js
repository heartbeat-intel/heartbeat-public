const VERCEL_ORIGIN = 'https://heartbeat-public.vercel.app';

// Only these hostnames get routed to heartbeat-public (marketing site).
// All other subdomains (e.g. pirque.heartbeatintel.com) are tenant
// workspaces and must pass through to the origin (heartbeat-web).
const MARKETING_HOSTS = [
  'heartbeatintel.com',
  'www.heartbeatintel.com',
];

// Routes on the marketing site served from heartbeat-public on Vercel
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
    const hostname = url.hostname;
    const path = url.pathname;

    // Tenant subdomains pass through directly to origin (heartbeat-web)
    if (!MARKETING_HOSTS.includes(hostname)) {
      return fetch(request);
    }

    // Marketing site: route specific paths to heartbeat-public on Vercel
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

    // Everything else on marketing domain passes through to heartbeat-web
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
