/**
 * Settings Store - Manages application settings and preferences
 */

import type { VideoSource } from '@/lib/types';

export type SortOption =
  | 'default'
  | 'relevance'
  | 'latency-asc'
  | 'date-desc'
  | 'date-asc'
  | 'rating-desc'
  | 'name-asc'
  | 'name-desc';

export interface AppSettings {
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

export const getDefaultSources = (): VideoSource[] => {
  // Import from video-sources to get all 38 default sources
  return [
    { id: 'feifan', name: '非凡资源', baseUrl: 'http://ffzy5.tv/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 1 },
    { id: 'wolong', name: '卧龙资源', baseUrl: 'https://wolongzyw.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 2 },
    { id: 'zuida', name: '最大资源', baseUrl: 'https://api.zuidapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 3 },
    { id: 'baiduyun', name: '百度云资源', baseUrl: 'https://api.apibdzy.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 4 },
    { id: 'baofeng', name: '暴风资源', baseUrl: 'https://bfzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 5 },
    { id: 'jisu', name: '极速资源', baseUrl: 'https://jszyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 6 },
    { id: 'tianya', name: '天涯资源', baseUrl: 'https://tyyszy.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 7 },
    { id: 'wujin', name: '无尽资源', baseUrl: 'https://api.wujinapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 8 },
    { id: 'modu', name: '魔都资源', baseUrl: 'https://www.mdzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 9 },
    { id: 'sanliuling', name: '360资源', baseUrl: 'https://360zy.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 10 },
    { id: 'dytt', name: '电影天堂', baseUrl: 'http://caiji.dyttzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 11 },
    { id: 'ruyi', name: '如意资源', baseUrl: 'https://cj.rycjapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 12 },
    { id: 'wangwang', name: '旺旺资源', baseUrl: 'https://wwzy.tv/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 13 },
    { id: 'hongniu', name: '红牛资源', baseUrl: 'https://www.hongniuzy2.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 14 },
    { id: 'guangsu', name: '光速资源', baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 15 },
    { id: 'ikun', name: 'iKun资源', baseUrl: 'https://ikunzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 16 },
    { id: 'youku', name: '优酷资源', baseUrl: 'https://api.ukuapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 17 },
    { id: 'huya', name: '虎牙资源', baseUrl: 'https://www.huyaapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 18 },
    { id: 'xinlang', name: '新浪资源', baseUrl: 'http://api.xinlangapi.com/xinlangapi.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 19 },
    { id: 'lezi', name: '乐子资源', baseUrl: 'https://cj.lziapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 20 },
    { id: 'haihua', name: '海豚资源', baseUrl: 'https://hhzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 21 },
    { id: 'jiangyu', name: '鲸鱼资源', baseUrl: 'https://jyzyapi.com/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 22 },
    { id: 'yilingba', name: '1080资源', baseUrl: 'https://api.1080zyku.com/inc/api_mac10.php', searchPath: '', detailPath: '', enabled: true, priority: 23 },
    { id: 'aidan', name: '爱蛋资源', baseUrl: 'https://lovedan.net/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 24 },
    { id: 'leba', name: '乐播资源', baseUrl: 'https://lbapi9.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 25 },
    { id: 'moduzy', name: '魔都影视', baseUrl: 'https://www.moduzy.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 26 },
    { id: 'feifanapi', name: '非凡API', baseUrl: 'https://api.ffzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 27 },
    { id: 'feifancj', name: '非凡采集', baseUrl: 'http://cj.ffzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 28 },
    { id: 'feifancj2', name: '非凡采集HTTPS', baseUrl: 'https://cj.ffzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 29 },
    { id: 'feifan1', name: '非凡线路1', baseUrl: 'http://ffzy1.tv/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 30 },
    { id: 'wolong2', name: '卧龙采集', baseUrl: 'https://collect.wolongzyw.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 31 },
    { id: 'baofeng2', name: '暴风APP', baseUrl: 'https://app.bfzyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 32 },
    { id: 'wujin2', name: '无尽ME', baseUrl: 'https://api.wujinapi.me/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 33 },
    { id: 'tianyazy', name: '天涯海角', baseUrl: 'https://tyyszyapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 34 },
    { id: 'guangsu2', name: '光速HTTP', baseUrl: 'http://api.guangsuapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 35 },
    { id: 'xinlang2', name: '新浪HTTPS', baseUrl: 'https://api.xinlangapi.com/xinlangapi.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 36 },
    { id: 'yilingba2', name: '1080JSON', baseUrl: 'https://api.1080zyku.com/inc/apijson.php', searchPath: '', detailPath: '', enabled: true, priority: 37 },
    { id: 'lezi2', name: '乐子HTTP', baseUrl: 'http://cj.lziapi.com/api.php/provide/vod', searchPath: '', detailPath: '', enabled: true, priority: 38 },
  ];
};

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
