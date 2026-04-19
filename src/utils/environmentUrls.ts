import { API_BASE_URL } from './constants';

const HEARTBEAT_PRODUCTION_DOMAIN = 'heartbeatintel.com';
const HEARTBEAT_STAGING_DOMAIN = 'heartbeat-staging.com';
const LOCALHOST_DOMAIN = 'localhost';

type QueryParams = URLSearchParams | Record<string, string | number | boolean | null | undefined>;

const normalizeHost = (host: string): string => (
  host.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
);

const isLocalHostname = (hostname: string): boolean => (
  hostname === LOCALHOST_DOMAIN ||
  hostname === '127.0.0.1' ||
  hostname.endsWith(`.${LOCALHOST_DOMAIN}`)
);

const getWindowLocation = (): Location | undefined => {
  return typeof window === 'undefined' ? undefined : window.location;
};

const getConfiguredBaseDomain = (): string => {
  const configured =
    import.meta.env.PUBLIC_TENANT_BASE_DOMAIN ||
    import.meta.env.PUBLIC_API_BASE_URL ||
    API_BASE_URL;

  return normalizeHost(configured || HEARTBEAT_PRODUCTION_DOMAIN);
};

export const getEnvironmentBaseDomain = (): string => {
  const configuredBaseDomain = getConfiguredBaseDomain();
  const location = getWindowLocation();

  if (configuredBaseDomain.includes(LOCALHOST_DOMAIN)) {
    return configuredBaseDomain;
  }

  if (location) {
    const hostname = location.hostname.replace(/^www\./, '');
    const port = location.port ? `:${location.port}` : '';

    if (isLocalHostname(hostname)) {
      return `${LOCALHOST_DOMAIN}${port}`;
    }

    if (hostname === HEARTBEAT_STAGING_DOMAIN || hostname.endsWith(`.${HEARTBEAT_STAGING_DOMAIN}`)) {
      return HEARTBEAT_STAGING_DOMAIN;
    }

    if (hostname === HEARTBEAT_PRODUCTION_DOMAIN || hostname.endsWith(`.${HEARTBEAT_PRODUCTION_DOMAIN}`)) {
      return HEARTBEAT_PRODUCTION_DOMAIN;
    }
  }

  return configuredBaseDomain;
};

export const getEnvironmentProtocol = (): 'http' | 'https' => {
  const configuredProtocol = import.meta.env.PUBLIC_TENANT_PROTOCOL;
  if (configuredProtocol === 'http' || configuredProtocol === 'https') {
    return configuredProtocol;
  }

  const baseDomain = getEnvironmentBaseDomain();
  if (baseDomain.includes(LOCALHOST_DOMAIN)) {
    return 'http';
  }

  return 'https';
};

const appendSearchParams = (url: URL, params?: QueryParams): void => {
  if (!params) {
    return;
  }

  const entries = params instanceof URLSearchParams
    ? Array.from(params.entries())
    : Object.entries(params);

  entries.forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
};

const normalizeTenant = (tenant: string): string => tenant.trim().toLowerCase().replace(/_/g, '-');

export const buildTenantUrl = (tenant: string, path = '/', params?: QueryParams): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(
    `${getEnvironmentProtocol()}://${normalizeTenant(tenant)}.${getEnvironmentBaseDomain()}${cleanPath}`,
  );
  appendSearchParams(url, params);
  return url.toString();
};

export const buildExchangeUrl = (path = '/exchange'): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const location = getWindowLocation();

  if (location && !location.hostname.endsWith(`.${LOCALHOST_DOMAIN}`)) {
    return `${location.origin}${cleanPath}`;
  }

  return `${getEnvironmentProtocol()}://${getEnvironmentBaseDomain()}${cleanPath}`;
};

const getTenantFromKnownHeartbeatHost = (hostname: string): string | null => {
  const cleanHostname = hostname.replace(/^www\./, '').toLowerCase();

  if (cleanHostname.endsWith(`.${LOCALHOST_DOMAIN}`)) {
    return cleanHostname.split('.')[0] || null;
  }

  for (const baseDomain of [HEARTBEAT_STAGING_DOMAIN, HEARTBEAT_PRODUCTION_DOMAIN]) {
    if (cleanHostname.endsWith(`.${baseDomain}`)) {
      const tenant = cleanHostname.slice(0, -(`.${baseDomain}`).length).split('.').pop();
      return tenant || null;
    }
  }

  return null;
};

export const normalizeTenantUrlForCurrentEnvironment = (rawUrl: string | null | undefined): string | null => {
  if (!rawUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(rawUrl, buildExchangeUrl('/'));
    const tenant = getTenantFromKnownHeartbeatHost(parsedUrl.hostname);

    if (!tenant) {
      return rawUrl;
    }

    return buildTenantUrl(tenant, `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`);
  } catch {
    return rawUrl;
  }
};

export const buildCurrentReturnPath = (): string | undefined => {
  const location = getWindowLocation();
  if (!location) {
    return undefined;
  }

  return `${location.pathname}${location.search}${location.hash}`;
};
