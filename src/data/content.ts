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

// Articles data — populated via API at build time
export const ARTICLES_DATA: Record<string, Record<string, ArticleData>> = {};

// Lists data — populated via API at build time
export const LISTS_DATA: Record<string, Record<string, ListData>> = {};

// Get article by publisher and id
export function getArticle(publisherId: string, articleId: string): ArticleData | null {
  return ARTICLES_DATA[publisherId]?.[articleId] || null;
}

// Get list by publisher and id
export function getList(publisherId: string, listId: string): ListData | null {
  return LISTS_DATA[publisherId]?.[listId] || null;
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
