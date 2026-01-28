import { EXPERTS_DATA, EXPERT_TENANTS, CONTENT_DATA, STATIC_TRENDING_LISTS } from '../utils/constants';
import type { ExpertData, ContentItem, TrendingItem } from '../utils/constants';

// API response types
export interface ApiExpertProfile {
  id: number;
  name: string;
  role: string;
  specialty: string;
  description: string;
  avatar_url: string | null;
  color: string;
  linkedin: string | null;
  lists_count: number;
  articles_count: number;
  content_count: number;
  total_views: number;
  subscribers: string;
  articles: ApiArticle[];
  lists: ApiList[];
}

export interface ApiArticle {
  id: string;
  title: string;
  description: string;
  date: string | null;
  read_time: string | null;
  views: number;
  is_premium: boolean;
  is_hot: boolean;
}

export interface ApiList {
  id: string;
  title: string;
  description: string;
  date: string | null;
  read_time: string | null;
  subscribers: number;
  is_hot: boolean;
  is_premium: boolean;
  list_type: string;
}

export interface ApiTrendingContent {
  title: string;
  author: string;
  hot: boolean;
  views: string;
  expert_id: number | null;
  content_id: string;
  content_type: 'article' | 'list';
}

/**
 * Fetch expert profile data from tenant API
 */
export async function fetchExpertProfile(expertId: string): Promise<ExpertData | null> {
  const tenant = EXPERT_TENANTS[expertId];
  const staticData = EXPERTS_DATA[expertId];

  if (!tenant) {
    return staticData || null;
  }

  try {
    const response = await fetch(
      `https://${tenant}.heartbeatintel.com/api/v1/public/experts/${expertId}/`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch expert ${expertId}: ${response.status}`);
      return staticData || null;
    }

    const apiData: ApiExpertProfile = await response.json();

    // Merge API data with static data (static takes priority for rich content)
    if (staticData) {
      return {
        ...staticData,
        stats: {
          lists: apiData.lists_count,
          articles: apiData.articles_count,
          totalViews: apiData.total_views,
        },
      };
    }

    // Convert API data to our format
    return {
      id: apiData.id.toString(),
      name: apiData.name,
      role: apiData.role || 'Expert',
      specialty: apiData.specialty || 'Intelligence',
      description: apiData.description || '',
      longBio: apiData.description || '',
      avatarUrl: apiData.avatar_url || '',
      color: apiData.color || '#2563EB',
      stats: {
        lists: apiData.lists_count,
        articles: apiData.articles_count,
        totalViews: apiData.total_views,
      },
      socialLinks: {
        linkedin: apiData.linkedin || '#',
        twitter: '#',
      },
      expertise: ['Intelligence', 'Analysis', 'Research'],
    };
  } catch (error) {
    console.error(`Error fetching expert ${expertId}:`, error);
    return staticData || null;
  }
}

/**
 * Fetch expert content (lists and articles) from tenant API
 */
export async function fetchExpertContent(expertId: string): Promise<{ lists: ContentItem[]; articles: ContentItem[] }> {
  const tenant = EXPERT_TENANTS[expertId];
  const staticContent = CONTENT_DATA[expertId];

  if (!tenant) {
    return staticContent || { lists: [], articles: [] };
  }

  try {
    const response = await fetch(
      `https://${tenant}.heartbeatintel.com/api/v1/public/experts/${expertId}/`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      return staticContent || { lists: [], articles: [] };
    }

    const apiData: ApiExpertProfile = await response.json();

    return {
      lists: apiData.lists.map((list) => ({
        id: list.id,
        title: list.title,
        description: list.description,
        date: list.date || '',
        readTime: list.read_time || '',
        subscribers: list.subscribers,
        isHot: list.is_hot,
        isPremium: list.is_premium,
        listType: list.list_type,
      })),
      articles: apiData.articles.map((article) => ({
        id: article.id,
        title: article.title,
        description: article.description,
        date: article.date || '',
        readTime: article.read_time || '',
        views: article.views,
        isPremium: article.is_premium,
        isHot: article.is_hot,
      })),
    };
  } catch (error) {
    console.error(`Error fetching content for ${expertId}:`, error);
    return staticContent || { lists: [], articles: [] };
  }
}

/**
 * Fetch trending content from API
 */
export async function fetchTrendingContent(limit: number = 5): Promise<TrendingItem[]> {
  try {
    // Try fetching from pirque as the primary source
    const response = await fetch(
      `https://pirque.heartbeatintel.com/api/v1/public/trending/?limit=${limit}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      return STATIC_TRENDING_LISTS;
    }

    const apiData: ApiTrendingContent[] = await response.json();

    return apiData.map((item) => ({
      title: item.title,
      author: item.author,
      hot: item.hot,
      views: item.views,
      expertId: item.expert_id?.toString() || 'andres-bucchi',
      contentId: item.content_id,
      contentType: item.content_type,
    }));
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return STATIC_TRENDING_LISTS;
  }
}

/**
 * Get all expert IDs for static path generation
 */
export function getAllExpertIds(): string[] {
  return Object.keys(EXPERTS_DATA);
}

/**
 * Get all content paths for static generation
 */
export function getAllContentPaths(): { expertId: string; contentType: string; contentId: string }[] {
  const paths: { expertId: string; contentType: string; contentId: string }[] = [];

  for (const [expertId, content] of Object.entries(CONTENT_DATA)) {
    for (const list of content.lists) {
      paths.push({ expertId, contentType: 'list', contentId: list.id });
    }
    for (const article of content.articles) {
      paths.push({ expertId, contentType: 'article', contentId: article.id });
    }
  }

  return paths;
}
