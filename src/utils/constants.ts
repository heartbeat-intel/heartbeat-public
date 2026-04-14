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
  pirque: 'pirque',
  bryan: 'bmoff',
  jpaldea: 'jpaldea',
  'andres-bucchi': 'bucchi',
};

export const getPublisherTenant = (publisherSlug: string): string => {
  return PUBLISHER_TENANTS[publisherSlug.toLowerCase()] || publisherSlug;
};

export { EXPERTISE_CATEGORIES, MAX_EXPERTISE_SELECTIONS } from '../constants/expertise';

// API URLs
export const EXCHANGE_API_URL = import.meta.env.PUBLIC_EXCHANGE_API_URL || 'https://exchange-api-production-598945484330.us-central1.run.app';
export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'heartbeatintel.com';
