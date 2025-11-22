/**
 * Settings Store - Manages application settings and preferences
 */

import type { VideoSource } from '@/lib/types';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';

export type SortOption =
  | 'default'
  | 'relevance'
  | 'latency-asc'
  | 'date-desc'
  | 'date-asc'
  | 'rating-desc'
  | 'name-asc'
  | 'name-desc';

interface AppSettings {
  sources: VideoSource[];
  sortBy: SortOption;
  searchHistory: boolean;
  watchHistory: boolean;
}

const SETTINGS_KEY = 'kvideo-settings';
const SEARCH_HISTORY_KEY = 'kvideo-search-history';
const WATCH_HISTORY_KEY = 'kvideo-watch-history';

export const sortOptions: Record<SortOption, string> = {
  'default': '默认排序',
  'relevance': '按相关性',
  'latency-asc': '延迟低到高',
  'date-desc': '发布时间（新到旧）',
  'date-asc': '发布时间（旧到新）',
  'rating-desc': '按评分（高到低）',
  'name-asc': '按名称（A-Z）',
  'name-desc': '按名称（Z-A）',
};

export const getDefaultSources = (): VideoSource[] => DEFAULT_SOURCES;

export const settingsStore = {
  getSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return {
        sources: getDefaultSources(),
        sortBy: 'default',
        searchHistory: true,
        watchHistory: true,
      };
    }

    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return {
        sources: getDefaultSources(),
        sortBy: 'default',
        searchHistory: true,
        watchHistory: true,
      };
    }

    try {
      const parsed = JSON.parse(stored);
      // Validate that parsed data has all required properties
      return {
        sources: Array.isArray(parsed.sources) ? parsed.sources : getDefaultSources(),
        sortBy: parsed.sortBy || 'default',
        searchHistory: parsed.searchHistory !== undefined ? parsed.searchHistory : true,
        watchHistory: parsed.watchHistory !== undefined ? parsed.watchHistory : true,
      };
    } catch {
      return {
        sources: getDefaultSources(),
        sortBy: 'default',
        searchHistory: true,
        watchHistory: true,
      };
    }
  },

  saveSettings(settings: AppSettings): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  },

  exportSettings(includeHistory: boolean = true): string {
    const settings = this.getSettings();
    const exportData: Record<string, unknown> = {
      settings,
    };

    if (includeHistory && typeof window !== 'undefined') {
      const searchHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      const watchHistory = localStorage.getItem(WATCH_HISTORY_KEY);

      if (searchHistory) exportData.searchHistory = JSON.parse(searchHistory);
      if (watchHistory) exportData.watchHistory = JSON.parse(watchHistory);
    }

    return JSON.stringify(exportData, null, 2);
  },

  importSettings(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);

      if (data.settings) {
        this.saveSettings(data.settings);
      }

      if (data.searchHistory && typeof window !== 'undefined') {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(data.searchHistory));
      }

      if (data.watchHistory && typeof window !== 'undefined') {
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(data.watchHistory));
      }

      return true;
    } catch {
      return false;
    }
  },

  resetToDefaults(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      localStorage.removeItem(WATCH_HISTORY_KEY);

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear cache if available
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => caches.delete(name));
        });
      }
    }
  },
};
