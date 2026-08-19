// Publisher profile data
export interface PublisherData {
  id: string;
  slug: string;
  name: string;
  role: string;
  description: string;
  longBio: string;
  avatarUrl: string;
  color: string;
  stats: {
    lists: number;
    articles: number;
    totalViews: number;
  };
  socialLinks: {
    linkedin: string;
    twitter: string;
  };
  expertise: string[];
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  billingOptions: string;
}

// Pricing tier type (generated dynamically from publisher data)
export interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  pricePerMonth: number;
  features: string[];
  popular?: boolean;
  savings?: string;
}

// Static fallback trending content
export interface TrendingItem {
  title: string;
  author: string;
  hot: boolean;
  views: string;
  publisherId: string;
  contentId: string;
  contentType: 'article' | 'list';
}

export const STATIC_TRENDING_LISTS: TrendingItem[] = [];

// Static content data
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  isHot?: boolean;
  isPremium: boolean;
  subscribers?: number;
  views?: number;
  listType?: string;
  publisherId?: string;
  author?: string;
}

export const CONTENT_DATA: Record<string, { lists: ContentItem[]; articles: ContentItem[] }> = {};

// Mapping of publisher slugs to tenant subdomains for workspace list/article links.
export const PUBLISHER_TENANTS: Record<string, string> = {
  'diego-alcaino': 'pirque',
  pirque: 'pirque',
  atlasai: 'atlasai',
  fintechlab: 'fintechlab',
  climatecap: 'climatecap',
  healthsignal: 'healthsignal',
  defenseintel: 'defenseintel',
  famcap: 'famcap',
  bryan: 'bmoff',
  bmoff: 'bmoff',
  jpaldea: 'jpaldea',
  'andres-bucchi': 'bucchi',
};

export const getPublisherTenant = (publisherSlug: string): string => {
  const normalizedSlug = publisherSlug.trim().toLowerCase();
  return PUBLISHER_TENANTS[normalizedSlug] || normalizedSlug.replace(/_/g, '-');
};

export { EXPERTISE_CATEGORIES, MAX_EXPERTISE_SELECTIONS } from '../constants/expertise';

// API URLs
// Server-rendered pages use the Docker-internal URL in local development, while
// browser islands use PUBLIC_EXCHANGE_API_URL through the same-origin gateway.
export const EXCHANGE_API_URL =
  import.meta.env.EXCHANGE_API_URL ||
  import.meta.env.PUBLIC_EXCHANGE_API_URL ||
  'https://exchange-api-production-598945484330.us-central1.run.app';
export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'heartbeatintel.com';

const getPublicBaseUrl = (): URL => {
  const configuredBase = API_BASE_URL.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(configuredBase)) {
    return new URL(configuredBase);
  }

  const hostname = configuredBase.split('/')[0].split(':')[0].toLowerCase();
  const protocol = hostname === 'localhost' || hostname === '127.0.0.1' ? 'http' : 'https';
  return new URL(`${protocol}://${configuredBase}`);
};

export const buildTenantUrl = (
  tenant: string,
  path = '/',
  params?: Record<string, string | number | boolean | null | undefined>,
): string => {
  const base = getPublicBaseUrl();
  const normalizedTenant = tenant.trim().toLowerCase().replace(/_/g, '-');
  base.hostname = `${normalizedTenant}.${base.hostname}`;
  base.pathname = path.startsWith('/') ? path : `/${path}`;

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      base.searchParams.set(key, String(value));
    }
  });

  return base.toString();
};
