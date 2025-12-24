/**
 * Settings Store - Manages application settings and preferences
 */

import type { VideoSource } from '@/lib/types';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { ADULT_SOURCES } from '@/lib/api/adult-sources';

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
  adultSources: VideoSource[];
  sortBy: SortOption;
  searchHistory: boolean;
  watchHistory: boolean;
  passwordAccess: boolean;
  accessPasswords: string[];
}

import { exportSettings, importSettings, SEARCH_HISTORY_KEY, WATCH_HISTORY_KEY } from './settings-helpers';

const SETTINGS_KEY = 'kvideo-settings';

export const getDefaultSources = (): VideoSource[] => DEFAULT_SOURCES;
export const getDefaultAdultSources = (): VideoSource[] => ADULT_SOURCES;

export const settingsStore = {
  getSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return {
        sources: getDefaultSources(),
        adultSources: getDefaultAdultSources(),
        sortBy: 'default',
        searchHistory: true,
        watchHistory: true,
        passwordAccess: false,
        accessPasswords: [],
      };
    }

    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return {
        sources: getDefaultSources(),
        adultSources: getDefaultAdultSources(),
        sortBy: 'default',
        searchHistory: true,
        watchHistory: true,
        passwordAccess: false,
        accessPasswords: [],
      };
    }

    try {
      const parsed = JSON.parse(stored);
      // Validate that parsed data has all required properties
      return {
        sources: Array.isArray(parsed.sources) ? parsed.sources : getDefaultSources(),
        adultSources: Array.isArray(parsed.adultSources) ? parsed.adultSources : getDefaultAdultSources(),
        sortBy: parsed.sortBy || 'default',
        searchHistory: parsed.searchHistory !== undefined ? parsed.searchHistory : true,
        watchHistory: parsed.watchHistory !== undefined ? parsed.watchHistory : true,
        passwordAccess: parsed.passwordAccess !== undefined ? parsed.passwordAccess : false,
        accessPasswords: Array.isArray(parsed.accessPasswords) ? parsed.accessPasswords : [],
      };
    } catch {
      return {
        sources: getDefaultSources(),
        adultSources: getDefaultAdultSources(),
        sortBy: 'default',
        searchHistory: true,
        watchHistory: true,
        passwordAccess: false,
        accessPasswords: [],
      };
    }
  },

  listeners: new Set<() => void>(),

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  },

  saveSettings(settings: AppSettings): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      this.notifyListeners();
    }
  },

  exportSettings(includeHistory: boolean = true): string {
    return exportSettings(this.getSettings(), includeHistory);
  },

  importSettings(jsonString: string): boolean {
    return importSettings(jsonString, (s) => this.saveSettings(s));
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
