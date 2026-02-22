// Publisher profile data
export interface PublisherData {
  id: string;
  slug: string;
  name: string;
  role: string;
  specialty: string;
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
}

// Pricing tiers
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

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 29,
    period: '/month',
    pricePerMonth: 29,
    features: [
      'Full access to all intel lists',
      'New releases as they publish',
      'Cancel anytime',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 249,
    period: '/year',
    pricePerMonth: 20.75,
    popular: true,
    savings: 'Save $99',
    features: [
      'Full access to all intel lists',
      'New releases as they publish',
      'Priority support',
      '2 months free',
    ],
  },
];

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

// API URLs
export const EXCHANGE_API_URL = import.meta.env.PUBLIC_EXCHANGE_API_URL || 'https://heartbeat-exchange-598945484330.us-central1.run.app';
export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'heartbeatintel.com';
