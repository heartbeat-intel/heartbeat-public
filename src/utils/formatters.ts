/**
 * Format a number to a human-readable view count (e.g., 1.2k, 2.5M)
 */
export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  return views.toString();
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Generate a color with alpha transparency
 */
export function colorWithAlpha(color: string, alpha: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Convert markdown to basic HTML
 */
export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\*\*(.*)\*\*$/gim, '<p><strong>$1</strong></p>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/^---$/gim, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^\s*\n/gm, '')
    .replace(/^(?!<[hupbl]|<\/|<li|<str|<hr)/gim, '<p>')
    .replace(/(?<!>)\n(?!<)/g, ' ');
}
