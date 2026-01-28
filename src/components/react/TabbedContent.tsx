import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { ContentItem } from '../../utils/constants';
import { EXPERT_TENANTS } from '../../utils/constants';

interface TabbedContentProps {
  expertId: string;
  expertColor: string;
  lists: ContentItem[];
  articles: ContentItem[];
}

export default function TabbedContent({
  expertId,
  expertColor,
  lists,
  articles,
}: TabbedContentProps) {
  const [activeTab, setActiveTab] = useState<'lists' | 'articles'>('lists');

  const handleListClick = (list: ContentItem) => {
    const tenant = EXPERT_TENANTS[expertId];
    if (tenant && list.listType) {
      window.open(`https://${tenant}.heartbeatintel.com/lists/${list.listType}/${list.id}`, '_blank');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Tabs */}
      <div className="border-b border-hb-gray-6 pb-0">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('lists')}
            className={`pb-4 px-0 font-semibold text-[15px] flex items-center gap-2 transition-colors ${
              activeTab === 'lists'
                ? 'text-hb-black-1 border-b-2'
                : 'text-hb-gray-3 hover:text-hb-black-1'
            }`}
            style={{
              borderColor: activeTab === 'lists' ? expertColor : 'transparent',
              marginBottom: activeTab === 'lists' ? '-1px' : 0,
            }}
          >
            <Icon icon="mdi:format-list-bulleted" width={18} />
            <span>Intel Lists</span>
            <span className="bg-hb-gray-7 text-hb-gray-2 text-[11px] px-2 py-0.5 rounded-full">
              {lists.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`pb-4 px-0 font-semibold text-[15px] flex items-center gap-2 transition-colors ${
              activeTab === 'articles'
                ? 'text-hb-black-1 border-b-2'
                : 'text-hb-gray-3 hover:text-hb-black-1'
            }`}
            style={{
              borderColor: activeTab === 'articles' ? expertColor : 'transparent',
              marginBottom: activeTab === 'articles' ? '-1px' : 0,
            }}
          >
            <Icon icon="mdi:file-document-outline" width={18} />
            <span>Articles</span>
            <span className="bg-hb-gray-7 text-hb-gray-2 text-[11px] px-2 py-0.5 rounded-full">
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
                color={expertColor}
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
                href={`/exchange/expert/${expertId}/article/${article.id}`}
                className="block"
              >
                <ContentCard
                  type="article"
                  item={article}
                  color={expertColor}
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
  onClick,
}: {
  type: 'list' | 'article';
  item: ContentItem;
  color: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className="group bg-white rounded-xl p-5 w-full text-left border border-hb-gray-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
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
          <span className="text-[11px] text-hb-gray-3 font-semibold uppercase tracking-wide">
            {type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {item.isHot && (
            <span className="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              HOT
            </span>
          )}
          {item.isPremium && (
            <span className="bg-hb-orange-4 text-hb-orange-main text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Icon icon="mdi:crown" width={10} />
              PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Title and description */}
      <h3 className="text-[17px] font-semibold text-hb-black-1 mb-2 leading-snug">
        {item.title}
      </h3>
      <p className="text-sm text-hb-gray-2 mb-4 leading-relaxed line-clamp-2">
        {item.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[13px] text-hb-gray-3">
          <span>{item.date}</span>
          <span>&bull;</span>
          <span>{item.readTime}</span>
        </div>
      </div>
    </Tag>
  );
}
