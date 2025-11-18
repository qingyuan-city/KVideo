/**
 * TagManager - Tag management UI component
 * Handles custom tag creation, deletion, and filtering
 */

'use client';

import { Icons } from '@/components/ui/Icon';

interface Tag {
  id: string;
  label: string;
  value: string;
}

interface TagManagerProps {
  tags: Tag[];
  selectedTag: string;
  showTagManager: boolean;
  newTagInput: string;
  onTagSelect: (tagId: string) => void;
  onTagDelete: (tagId: string) => void;
  onToggleManager: () => void;
  onRestoreDefaults: () => void;
  onNewTagInputChange: (value: string) => void;
  onAddTag: () => void;
}

export function TagManager({
  tags,
  selectedTag,
  showTagManager,
  newTagInput,
  onTagSelect,
  onTagDelete,
  onToggleManager,
  onRestoreDefaults,
  onNewTagInputChange,
  onAddTag,
}: TagManagerProps) {
  const isCustomTag = (tagId: string) => tagId.startsWith('custom_');

  return (
    <>
      {/* Management Controls */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onToggleManager}
          className="text-sm text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-2"
        >
          <Icons.Tag size={16} />
          {showTagManager ? '完成' : '管理标签'}
        </button>
        {showTagManager && (
          <button
            onClick={onRestoreDefaults}
            className="text-sm text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-2"
          >
            <Icons.RefreshCw size={16} />
            恢复默认
          </button>
        )}
      </div>

      {/* Add Custom Tag */}
      {showTagManager && (
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => onNewTagInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddTag()}
            placeholder="添加自定义标签..."
            className="flex-1 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] text-[var(--text-color)] px-4 py-2 focus:outline-none focus:border-[var(--accent-color)] transition-colors rounded-[var(--radius-2xl)]"
          />
          <button
            onClick={onAddTag}
            className="px-6 py-2 bg-[var(--accent-color)] text-white font-semibold hover:opacity-90 transition-opacity rounded-[var(--radius-2xl)]"
          >
            添加
          </button>
        </div>
      )}

      {/* Tag Filter */}
      <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-3 pt-2 px-1 scrollbar-hide">
        {tags.map((tag) => (
          <div key={tag.id} className="relative flex-shrink-0">
            <button
              onClick={() => onTagSelect(tag.id)}
              className={`
                px-6 py-2.5 text-sm font-semibold transition-all whitespace-nowrap will-change-transform rounded-[var(--radius-full)]
                ${selectedTag === tag.id
                  ? 'bg-[var(--accent-color)] text-white shadow-md scale-105'
                  : 'bg-[var(--glass-bg)] backdrop-blur-xl text-[var(--text-color)] border border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:scale-105'
                }
              `}
            >
              {tag.label}
            </button>
            {showTagManager && isCustomTag(tag.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTagDelete(tag.id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors rounded-[var(--radius-full)]"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
