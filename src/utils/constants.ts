// Expert tenant mapping
export const EXPERT_TENANTS: Record<string, string> = {
  'diego-alcaino': 'pirque',
  'andres-bucchi': 'bucchi',
};

// Expert profile data
export interface ExpertData {
  id: string;
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

export const EXPERTS_DATA: Record<string, ExpertData> = {
  'diego-alcaino': {
    id: 'diego-alcaino',
    name: 'Diego Alcaino',
    role: 'Founder & CEO, PIRQUE',
    specialty: 'Venture Capital & Intelligence',
    description:
      'Founder of PIRQUE, a single-family office venture capital firm. Investing in seed-stage companies, equities, crypto, and R&D. Curating intelligence for strategic investment decisions.',
    longBio:
      'Diego Alcaino is the Founder and CEO of PIRQUE, a venture capital firm operating as the investment arm of a single-family office. Since founding PIRQUE in 2015, Diego has focused on identifying and investing in seed-stage companies with high growth potential. His investment thesis spans equities, crypto assets, and research-driven opportunities. Diego is passionate about leveraging intelligence and deep research to make informed investment decisions.',
    avatarUrl: '/images/experts/diego-pic.jpeg',
    color: '#2563EB',
    stats: {
      lists: 0,
      articles: 0,
      totalViews: 0,
    },
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/dalcaino/',
      twitter: '#',
    },
    expertise: ['Venture Capital', 'Seed Investing', 'Market Research', 'Due Diligence', 'Portfolio Strategy'],
  },
  'andres-bucchi': {
    id: 'andres-bucchi',
    name: 'Andres Bucchi',
    role: 'Chief Data Officer, LATAM Airlines',
    specialty: 'Data & AI',
    description:
      'Leading AI-driven transformation at LATAM Airlines. Ex-Uber, Ex-Sodimac VP of Data & Analytics. Advisor at Heartbeat Intel. Sharing enterprise AI strategies, data architecture insights, and analytics frameworks.',
    longBio:
      "Andres Bucchi is a data and AI leader with extensive experience transforming large enterprises through data-driven decision making. As Chief Data Officer at LATAM Airlines, he spearheads the organization's AI transformation initiatives, implementing machine learning solutions that impact millions of passengers annually. Previously, he led data & analytics at Sodimac and built predictive systems at Uber. Andres is passionate about democratizing data literacy and helping organizations build world-class analytics capabilities.",
    avatarUrl: '/images/experts/andres-pic.jpeg',
    color: '#7C3AED',
    stats: {
      lists: 18,
      articles: 22,
      totalViews: 0,
    },
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/bucchi/',
      twitter: '#',
    },
    expertise: ['Enterprise AI', 'Data Architecture', 'Machine Learning', 'Analytics Strategy', 'Team Leadership'],
  },
};

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
  expertId: string;
  contentId: string;
  contentType: 'article' | 'list';
}

export const STATIC_TRENDING_LISTS: TrendingItem[] = [
  {
    title: 'Enterprise AI Transformation Playbook',
    author: 'Andres Bucchi',
    hot: true,
    views: '1.8k',
    expertId: 'andres-bucchi',
    contentId: 'list-1',
    contentType: 'list',
  },
  {
    title: 'Data-Driven Decision Making at Scale',
    author: 'Andres Bucchi',
    hot: false,
    views: '1.2k',
    expertId: 'andres-bucchi',
    contentId: 'list-2',
    contentType: 'list',
  },
];

// Static content data for Andres Bucchi
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
}

export const CONTENT_DATA: Record<string, { lists: ContentItem[]; articles: ContentItem[] }> = {
  'diego-alcaino': {
    lists: [
      {
        id: 'paypal-mafia',
        title: 'PayPal Mafia',
        description: 'The legendary group of PayPal founders and early employees who went on to create some of the most influential companies in tech.',
        date: 'Mar 26, 2025',
        readTime: '8 min read',
        subscribers: 5,
        isHot: true,
        isPremium: false,
        listType: 'people',
      },
      {
        id: 'founders',
        title: 'Founders with an exit +$m',
        description: 'Founders who have built and exited a company for $1M+. Tracking successful entrepreneurs and their journeys.',
        date: 'Jan 15, 2025',
        readTime: '12 min read',
        subscribers: 4,
        isHot: false,
        isPremium: false,
        listType: 'people',
      },
      {
        id: 'georgetown',
        title: 'Georgetown Alumni',
        description: 'People who graduated from Georgetown University with undergraduate or graduate degrees. Network of Hoyas in business and tech.',
        date: 'Jan 10, 2025',
        readTime: '10 min read',
        subscribers: 7,
        isHot: false,
        isPremium: false,
        listType: 'people',
      },
      {
        id: 'nyc-pending-meetings',
        title: 'NYC Pending Meetings',
        description: 'Curated list of high-value contacts in New York City for upcoming meetings and networking.',
        date: 'Jan 5, 2025',
        readTime: '5 min read',
        subscribers: 0,
        isHot: false,
        isPremium: true,
        listType: 'people',
      },
      {
        id: 'ese-biz-school-alumni',
        title: 'ESE Business School Alumni',
        description: 'Alumni network from ESE Business School. Connecting graduates across industries and geographies.',
        date: 'Dec 20, 2024',
        readTime: '6 min read',
        subscribers: 0,
        isHot: false,
        isPremium: false,
        listType: 'people',
      },
    ],
    articles: [],
  },
  'andres-bucchi': {
    lists: [
      {
        id: 'list-1',
        title: 'Enterprise AI Transformation Playbook',
        description: 'Step-by-step framework for implementing AI at scale in large organizations',
        date: 'Nov 26, 2024',
        readTime: '20 min read',
        subscribers: 743,
        isHot: true,
        isPremium: true,
        listType: 'organizations',
      },
      {
        id: 'list-2',
        title: 'Data-Driven Decision Making at Scale',
        description: 'Building analytics infrastructure for companies with 10k+ employees',
        date: 'Nov 12, 2024',
        readTime: '14 min read',
        subscribers: 521,
        isHot: false,
        isPremium: true,
        listType: 'organizations',
      },
      {
        id: 'list-3',
        title: 'MLOps Tools Comparison 2024',
        description: 'Comprehensive review of ML infrastructure tools and platforms',
        date: 'Oct 30, 2024',
        readTime: '16 min read',
        subscribers: 389,
        isHot: false,
        isPremium: false,
        listType: 'library',
      },
      {
        id: 'list-4',
        title: 'Building High-Performance Data Teams',
        description: 'Hiring frameworks and org structures that work at scale',
        date: 'Oct 15, 2024',
        readTime: '11 min read',
        subscribers: 612,
        isHot: true,
        isPremium: true,
        listType: 'people',
      },
    ],
    articles: [
      {
        id: 'article-1',
        title: 'From Data Warehouse to AI Factory',
        description:
          'How LATAM Airlines transformed its data infrastructure to support real-time ML predictions.',
        date: 'Nov 22, 2024',
        readTime: '14 min read',
        views: 3421,
        isPremium: false,
      },
      {
        id: 'article-2',
        title: 'The CDO Playbook: First 90 Days',
        description:
          'What to prioritize when stepping into a Chief Data Officer role at a large enterprise.',
        date: 'Nov 14, 2024',
        readTime: '10 min read',
        views: 2156,
        isPremium: false,
      },
      {
        id: 'article-3',
        title: 'LLMs in Production: Lessons Learned',
        description:
          'Practical insights from deploying large language models in enterprise applications.',
        date: 'Nov 5, 2024',
        readTime: '18 min read',
        views: 4892,
        isPremium: true,
      },
      {
        id: 'article-4',
        title: 'Data Governance Without the Bureaucracy',
        description:
          'Building governance frameworks that enable rather than restrict data-driven innovation.',
        date: 'Oct 20, 2024',
        readTime: '12 min read',
        views: 1876,
        isPremium: false,
      },
    ],
  },
};

// API URLs
export const EXCHANGE_API_URL = import.meta.env.PUBLIC_EXCHANGE_API_URL || 'https://exchange.heartbeatintel.com';
export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'heartbeatintel.com';

// Get tenant subdomain for an expert
export function getExpertTenant(expertId: string): string | undefined {
  return EXPERT_TENANTS[expertId];
}

// Get tenant API URL for an expert
export function getExpertApiUrl(expertId: string): string {
  const tenant = EXPERT_TENANTS[expertId] || 'public';
  return `https://${tenant}.heartbeatintel.com`;
}
