import { CONTENT_DATA, STATIC_TRENDING_LISTS, EXCHANGE_API_URL } from '../utils/constants';
import type { PublisherData, ContentItem, TrendingItem } from '../utils/constants';

// API response types from Exchange catalog
export interface ApiPublisherProfile {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  specialty: string | null;
  description: string | null;
  logo_url: string | null;
  color: string | null;
  long_bio: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  expertise: string[];
  monthly_price_cents: number;
  yearly_price_cents: number;
  stats: {
    lists_count: number;
    articles_count: number;
    subscribers: number;
  };
  products: unknown[];
  collections: unknown[];
}

export interface ApiFeaturedPublisher {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  specialty: string | null;
  description: string | null;
  logo_url: string | null;
  color: string | null;
  expertise: string[];
  stats: {
    lists_count: number;
    articles_count: number;
    subscribers: number;
  };
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
  publisher_id: number | null;
  content_id: string;
  content_type: 'article' | 'list';
}

function toPublisherData(pub: ApiFeaturedPublisher): PublisherData {
  return {
    id: pub.id,
    slug: pub.slug,
    name: pub.name,
    role: pub.role || 'Publisher',
    specialty: pub.specialty || 'Intelligence',
    description: pub.description || '',
    longBio: pub.description || '',
    avatarUrl: pub.logo_url || '',
    color: pub.color || '#2563EB',
    stats: {
      lists: pub.stats.lists_count,
      articles: pub.stats.articles_count,
      totalViews: pub.stats.articles_count,
    },
    socialLinks: {
      linkedin: '#',
      twitter: '#',
    },
    expertise: pub.expertise || [],
  };
}

function detailToPublisherData(pub: ApiPublisherProfile): PublisherData {
  return {
    id: pub.id,
    slug: pub.slug,
    name: pub.name,
    role: pub.role || 'Publisher',
    specialty: pub.specialty || 'Intelligence',
    description: pub.description || '',
    longBio: pub.long_bio || pub.description || '',
    avatarUrl: pub.logo_url || '',
    color: pub.color || '#2563EB',
    stats: {
      lists: pub.stats.lists_count,
      articles: pub.stats.articles_count,
      totalViews: pub.stats.articles_count,
    },
    socialLinks: {
      linkedin: pub.linkedin_url || '#',
      twitter: pub.twitter_url || '#',
    },
    expertise: pub.expertise || [],
  };
}

/**
 * Fetch publisher profile data from Exchange catalog API
 */
export async function fetchPublisherProfile(publisherSlug: string): Promise<PublisherData | null> {
  try {
    const response = await fetch(
      `${EXCHANGE_API_URL}/api/v1/publishers/${publisherSlug}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch publisher ${publisherSlug}: ${response.status}`);
      return null;
    }

    const apiData: ApiPublisherProfile = await response.json();
    return detailToPublisherData(apiData);
  } catch (error) {
    console.error(`Error fetching publisher ${publisherSlug}:`, error);
    return null;
  }
}

/**
 * Fetch publisher content (lists and articles) from Exchange catalog API
 */
export async function fetchPublisherContent(publisherSlug: string): Promise<{ lists: ContentItem[]; articles: ContentItem[] }> {
  try {
    const [listsResponse, articlesResponse] = await Promise.all([
      fetch(`${EXCHANGE_API_URL}/api/v1/publishers/${publisherSlug}/lists`, { signal: AbortSignal.timeout(10000) }),
      fetch(`${EXCHANGE_API_URL}/api/v1/publishers/${publisherSlug}/articles`, { signal: AbortSignal.timeout(10000) }),
    ]);

    const lists: ContentItem[] = [];
    const articles: ContentItem[] = [];

    if (listsResponse.ok) {
      const listsData = await listsResponse.json();
      for (const list of listsData.items || []) {
        lists.push({
          id: list.id,
          title: list.title,
          description: list.description || '',
          date: list.date || '',
          readTime: list.read_time || '',
          subscribers: list.subscribers,
          isHot: list.is_hot,
          isPremium: list.is_premium,
          listType: list.list_type,
        });
      }
    }

    if (articlesResponse.ok) {
      const articlesData = await articlesResponse.json();
      for (const article of articlesData.items || []) {
        articles.push({
          id: article.id,
          title: article.title,
          description: article.description || '',
          date: article.date || '',
          readTime: article.read_time || '',
          views: article.views,
          isPremium: article.is_premium,
          isHot: article.is_hot,
        });
      }
    }

    return { lists, articles };
  } catch (error) {
    console.error(`Error fetching content for ${publisherSlug}:`, error);
    return { lists: [], articles: [] };
  }
}

/**
 * Fetch trending content from API
 */
export async function fetchTrendingContent(limit: number = 5): Promise<TrendingItem[]> {
  try {
    const response = await fetch(
      `${EXCHANGE_API_URL}/api/v1/catalog/trending?limit=${limit}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      return STATIC_TRENDING_LISTS;
    }

    const apiData = await response.json();

    return (apiData.items || []).map((item: { title: string; publisher_name: string; publisher_slug: string; slug: string; item_type: string }) => ({
      title: item.title,
      author: item.publisher_name,
      hot: true,
      views: '—',
      publisherId: item.publisher_slug,
      contentId: item.slug,
      contentType: item.item_type === 'article' ? 'article' : 'list',
    }));
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return STATIC_TRENDING_LISTS;
  }
}

/**
 * Fetch hot lists across all publishers
 */
export async function fetchHotLists(): Promise<ContentItem[]> {
  try {
    const response = await fetch(
      `${EXCHANGE_API_URL}/api/v1/catalog/trending?limit=4`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.items || []).map((item: { slug: string; title: string; description?: string; publisher_slug: string; publisher_name: string; item_type: string }) => ({
      id: item.slug,
      title: item.title,
      description: item.description || '',
      date: '',
      readTime: '',
      isHot: true,
      isPremium: false,
      publisherId: item.publisher_slug,
      author: item.publisher_name,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch all publisher profiles from Exchange API
 */
export async function fetchAllPublishers(): Promise<(PublisherData & { id: string })[]> {
  try {
    const response = await fetch(
      `${EXCHANGE_API_URL}/api/v1/publishers/featured?limit=10`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch featured publishers: ${response.status}`);
      return [];
    }

    const apiData: ApiFeaturedPublisher[] = await response.json();
    return apiData.map((pub) => ({ ...toPublisherData(pub), id: pub.slug }));
  } catch (error) {
    console.error('Error fetching all publishers:', error);
    return [];
  }
}

/**
 * Get all publisher slugs for static path generation
 */
export async function getAllPublisherSlugs(): Promise<string[]> {
  const publishers = await fetchAllPublishers();
  return publishers.map((p) => p.slug);
}

/**
 * Get all content paths for static generation
 */
export function getAllContentPaths(): { publisherId: string; contentType: string; contentId: string }[] {
  const paths: { publisherId: string; contentType: string; contentId: string }[] = [];

  for (const [publisherId, content] of Object.entries(CONTENT_DATA)) {
    for (const list of content.lists) {
      paths.push({ publisherId, contentType: 'list', contentId: list.id });
    }
    for (const article of content.articles) {
      paths.push({ publisherId, contentType: 'article', contentId: article.id });
    }
  }

  return paths;
}
