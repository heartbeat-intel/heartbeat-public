import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { ContentItem } from '../../utils/constants';
interface TabbedContentProps {
  publisherId: string;
  publisherColor: string;
  lists: ContentItem[];
  articles: ContentItem[];
  theme?: 'light' | 'dark';
}

export default function TabbedContent({
  publisherId,
  publisherColor,
  lists,
  articles,
  theme = 'dark',
}: TabbedContentProps) {
  const [activeTab, setActiveTab] = useState<'lists' | 'articles'>('lists');
  const isDark = theme === 'dark';

  const handleListClick = (list: ContentItem) => {
    if (publisherId && list.listType) {
      window.open(`https://${publisherId}.heartbeatintel.com/lists/${list.listType}/${list.id}`, '_blank');
    }
  };

  const borderColor = isDark ? 'border-white/10' : 'border-hb-gray-6';
  const textPrimary = isDark ? 'text-white' : 'text-hb-black-1';
  const textSecondary = isDark ? 'text-white/40' : 'text-hb-gray-3';
  const countBg = isDark ? 'bg-white/5 text-white/40' : 'bg-hb-gray-7 text-hb-gray-2';

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Tabs */}
      <div className={`border-b ${borderColor} pb-0`}>
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('lists')}
            className={`pb-4 px-0 font-semibold text-[15px] flex items-center gap-2 transition-colors ${
              activeTab === 'lists'
                ? `${textPrimary} border-b-2`
                : `${textSecondary} hover:${textPrimary}`
            }`}
            style={{
              borderColor: activeTab === 'lists' ? publisherColor : 'transparent',
              marginBottom: activeTab === 'lists' ? '-1px' : 0,
            }}
          >
            <Icon icon="mdi:format-list-bulleted" width={18} />
            <span>Intel Lists</span>
            <span className={`${countBg} text-[11px] px-2 py-0.5 rounded-full`}>
              {lists.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`pb-4 px-0 font-semibold text-[15px] flex items-center gap-2 transition-colors ${
              activeTab === 'articles'
                ? `${textPrimary} border-b-2`
                : `${textSecondary} hover:${textPrimary}`
            }`}
            style={{
              borderColor: activeTab === 'articles' ? publisherColor : 'transparent',
              marginBottom: activeTab === 'articles' ? '-1px' : 0,
            }}
          >
            <Icon icon="mdi:file-document-outline" width={18} />
            <span>Articles</span>
            <span className={`${countBg} text-[11px] px-2 py-0.5 rounded-full`}>
              {articles.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-8">
        {activeTab === 'lists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {lists.map((list) => (
              <ContentCard
                key={list.id}
                type="list"
                item={list}
                color={publisherColor}
                theme={theme}
                onClick={() => handleListClick(list)}
              />
            ))}
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/exchange/publisher/${publisherId}/article/${article.id}`}
                className="block"
              >
                <ContentCard
                  type="article"
                  item={article}
                  color={publisherColor}
                  theme={theme}
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Internal ContentCard component
function ContentCard({
  type,
  item,
  color,
  theme = 'dark',
  onClick,
}: {
  type: 'list' | 'article';
  item: ContentItem;
  color: string;
  theme?: 'light' | 'dark';
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  const isDark = theme === 'dark';

  const cardClasses = isDark
    ? 'group bg-white/[0.03] rounded-xl p-5 w-full text-left border border-white/[0.06] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20'
    : 'group bg-white rounded-xl p-5 w-full text-left border border-hb-gray-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg';

  const titleColor = isDark ? 'text-white' : 'text-hb-black-1';
  const descColor = isDark ? 'text-white/40' : 'text-hb-gray-2';
  const metaColor = isDark ? 'text-white/30' : 'text-hb-gray-3';
  const typeColor = isDark ? 'text-white/30' : 'text-hb-gray-3';

  const hotBadge = isDark
    ? 'bg-red-500/15 text-red-400'
    : 'bg-red-100 text-red-600';
  const premiumBadge = isDark
    ? 'bg-hb-orange-main/15 text-hb-orange-3'
    : 'bg-hb-orange-4 text-hb-orange-main';

  return (
    <Tag
      onClick={onClick}
      className={cardClasses}
      style={{ '--accent-color': color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={type === 'list' ? 'mdi:format-list-bulleted' : 'mdi:file-document-outline'}
            width={18}
            color={color}
          />
          <span className={`text-[11px] ${typeColor} font-semibold uppercase tracking-wide`}>
            {type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {item.isHot && (
            <span className={`${hotBadge} text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
              HOT
            </span>
          )}
          {item.isPremium && (
            <span className={`${premiumBadge} text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1`}>
              <Icon icon="mdi:crown" width={10} />
              PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Title and description */}
      <h3 className={`text-[17px] font-semibold ${titleColor} mb-2 leading-snug`}>
        {item.title}
      </h3>
      <p className={`text-sm ${descColor} mb-4 leading-relaxed line-clamp-2`}>
        {item.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-4 text-[13px] ${metaColor}`}>
          <span>{item.date}</span>
          <span>&bull;</span>
          <span>{item.readTime}</span>
        </div>
      </div>
    </Tag>
  );
}
