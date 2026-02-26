// Full article content with markdown
export interface ArticleData {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  views: number;
  isPremium: boolean;
  isHot?: boolean;
  content: string;
  relatedContent: Array<{ id: string; title: string; type: string }>;
}

export interface ListItem {
  rank: number;
  name: string;
  sector: string;
  raised: string;
  highlight: string;
}

export interface ListData {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  subscribers: number;
  isHot: boolean;
  isPremium: boolean;
  items: ListItem[];
  methodology: string;
}

import { EXCHANGE_API_URL } from '../utils/constants';

// Articles data — populated via API at build time
export const ARTICLES_DATA: Record<string, Record<string, ArticleData>> = {};

// Lists data — populated via API at build time
export const LISTS_DATA: Record<string, Record<string, ListData>> = {};

// Get article by publisher and id (static lookup)
export function getArticle(publisherId: string, articleId: string): ArticleData | null {
  return ARTICLES_DATA[publisherId]?.[articleId] || null;
}

// Get list by publisher and id (static lookup)
export function getList(publisherId: string, listId: string): ListData | null {
  return LISTS_DATA[publisherId]?.[listId] || null;
}

// Fetch article from Exchange API
export async function fetchArticle(publisherSlug: string, articleSlug: string): Promise<ArticleData | null> {
  try {
    const response = await fetch(
      `${EXCHANGE_API_URL}/api/v1/publishers/${publisherSlug}/articles/${articleSlug}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id || articleSlug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      readTime: data.read_time || '',
      views: data.views || 0,
      isPremium: data.is_premium || false,
      isHot: data.is_hot || false,
      content: data.content || data.teaser || data.abstract || '',
      relatedContent: [],
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// Fetch list from Exchange API
export async function fetchList(publisherSlug: string, listSlug: string): Promise<ListData | null> {
  try {
    const response = await fetch(
      `${EXCHANGE_API_URL}/api/v1/publishers/${publisherSlug}/lists`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const lists = data.items || [];
    const list = lists.find((l: { id: string }) => l.id === listSlug);
    if (!list) return null;

    return {
      id: list.id || listSlug,
      title: list.title || '',
      description: list.description || '',
      date: list.date || '',
      readTime: list.read_time || '',
      subscribers: list.subscribers || 0,
      isHot: list.is_hot || false,
      isPremium: list.is_premium || false,
      items: [],
      methodology: '',
    };
  } catch (error) {
    console.error('Error fetching list:', error);
    return null;
  }
}

// Get all content paths for static generation
export function getAllContentPaths(): { publisherId: string; contentType: string; contentId: string }[] {
  const paths: { publisherId: string; contentType: string; contentId: string }[] = [];

  for (const [publisherId, articles] of Object.entries(ARTICLES_DATA)) {
    for (const articleId of Object.keys(articles)) {
      paths.push({ publisherId, contentType: 'article', contentId: articleId });
    }
  }

  for (const [publisherId, lists] of Object.entries(LISTS_DATA)) {
    for (const listId of Object.keys(lists)) {
      paths.push({ publisherId, contentType: 'list', contentId: listId });
    }
  }

  return paths;
}

