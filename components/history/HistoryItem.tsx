/**
 * HistoryItem - Individual watch history item
 * Displays video thumbnail, title, episode, progress, and delete button
 */

import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';
import { formatTime, formatDate } from '@/lib/utils/format-utils';
import { PosterImage } from './PosterImage';

interface HistoryItemProps {
  videoId: string | number;
  source: string;
  title: string;
  poster?: string;
  episodeIndex: number;
  episodes?: Array<{ name: string }>;
  playbackPosition: number;
  duration: number;
  timestamp: number;
  onRemove: () => void;
}

export function HistoryItem({
  videoId,
  source,
  title,
  poster,
  episodeIndex,
  episodes,
  playbackPosition,
  duration,
  timestamp,
  onRemove,
}: HistoryItemProps) {
  const getVideoUrl = (): string => {
    const params = new URLSearchParams({
      id: videoId.toString(),
      source,
      title,
      episode: episodeIndex.toString(),
    });
    return `/player?${params.toString()}`;
  };

  const handleClick = (event: React.MouseEvent) => {
    // Middle mouse or Ctrl/Cmd+click opens in new tab
    if (event.button === 1 || event.ctrlKey || event.metaKey) {
      event.preventDefault();
      window.open(getVideoUrl(), '_blank');
      return;
    }
  };

  const progress = (playbackPosition / duration) * 100;
  const episodeText = episodes && episodes.length > 0
    ? episodes[episodeIndex]?.name || `第${episodeIndex + 1}集`
    : '';

  return (
    <div className="group bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] rounded-[var(--radius-2xl)] p-3 hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all border border-transparent hover:border-[var(--glass-border)]">
      <a
        href={getVideoUrl()}
        onClick={(e) => {
          e.preventDefault();
          handleClick(e as any);
          if (!e.ctrlKey && !e.metaKey) {
            window.location.href = getVideoUrl();
          }
        }}
        onAuxClick={(e) => handleClick(e as any)}
        className="block"
      >
        <div className="flex gap-3">
          {/* Poster */}
          <PosterImage poster={poster} title={title} progress={progress} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-[var(--text-color)] truncate group-hover:text-[var(--accent-color)] transition-colors mb-1">
              {title}
            </h3>
            {episodeText && (
              <p className="text-xs text-[var(--text-color-secondary)] mb-1">
                {episodeText}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-[var(--text-color-secondary)]">
              <span>{formatTime(playbackPosition)} / {formatTime(duration)}</span>
              <span>{formatDate(timestamp)}</span>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[var(--glass-bg)] rounded-full self-start cursor-pointer"
            aria-label="删除"
          >
            <Icons.Trash size={16} className="text-[var(--text-color-secondary)]" />
          </button>
        </div>
      </a>
    </div>
  );
}
