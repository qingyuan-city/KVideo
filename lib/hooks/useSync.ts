import { useEffect, useRef, useState } from 'react';
import { useGoogleDrive } from './useGoogleDrive';
import { settingsStore } from '@/lib/store/settings-store';
import { useHistoryStore } from '@/lib/store/history-store';
import { useSearchHistory } from './useSearchHistory';

export function useSync() {
    const { user, isInitialized, isLoading: isDriveLoading, error: driveError, signIn, signOut, uploadData, downloadData } = useGoogleDrive();
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [autoSync, setAutoSync] = useState(false);

    // Load auto-sync preference
    useEffect(() => {
        const stored = localStorage.getItem('kvideo-autosync');
        if (stored) {
            setAutoSync(JSON.parse(stored));
        }
    }, []);

    const toggleAutoSync = (enabled: boolean) => {
        setAutoSync(enabled);
        localStorage.setItem('kvideo-autosync', JSON.stringify(enabled));
    };

    const exportAllData = () => {
        const settings = settingsStore.getSettings();
        const searchHistory = localStorage.getItem('kvideo-search-history');
        const watchHistory = localStorage.getItem('kvideo-watch-history');

        return JSON.stringify({
            settings,
            searchHistory: searchHistory ? JSON.parse(searchHistory) : [],
            watchHistory: watchHistory ? JSON.parse(watchHistory) : [],
            timestamp: Date.now(),
        });
    };

    const importAllData = (jsonString: string) => {
        try {
            const data = JSON.parse(jsonString);

            if (data.settings) {
                settingsStore.saveSettings(data.settings);
            }
            if (data.searchHistory) {
                localStorage.setItem('kvideo-search-history', JSON.stringify(data.searchHistory));
                // Trigger reload or store update if necessary
            }
            if (data.watchHistory) {
                localStorage.setItem('kvideo-watch-history', JSON.stringify(data.watchHistory));
                // Trigger reload or store update if necessary
                useHistoryStore.getState().importHistory(data.watchHistory);
            }

            setLastSynced(new Date(data.timestamp || Date.now()));
            return true;
        } catch (e) {
            console.error('Failed to import data', e);
            return false;
        }
    };

    const handleSync = async () => {
        if (!user) return;
        setIsSyncing(true);
        setSyncError(null);
        try {
            const data = exportAllData();
            await uploadData(data);
            setLastSynced(new Date());
        } catch (e: any) {
            setSyncError(e.message || 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRestore = async () => {
        if (!user) return;
        setIsSyncing(true);
        setSyncError(null);
        try {
            const data = await downloadData();
            if (data) {
                // The data might be wrapped in a result object depending on how gapi returns it
                // If downloadData returns the raw string body:
                importAllData(typeof data === 'string' ? data : JSON.stringify(data));
            }
        } catch (e: any) {
            setSyncError(e.message || 'Restore failed');
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync logic (simple debounce)
    useEffect(() => {
        if (!autoSync || !user || !isInitialized) return;

        const timeout = setTimeout(() => {
            handleSync();
        }, 30000); // Sync every 30s if changes detected? 
        // Real implementation would subscribe to stores. 
        // For now, let's just sync on mount/login if auto-sync is on, and maybe periodically?
        // Better: subscribe to store changes.

        return () => clearTimeout(timeout);
    }, [autoSync, user, isInitialized]);

    // Subscribe to settings changes for auto-sync
    useEffect(() => {
        if (!autoSync || !user) return;

        const unsubscribe = settingsStore.subscribe(() => {
            // Debounce sync
            const timeout = setTimeout(handleSync, 5000);
            return () => clearTimeout(timeout);
        });

        return unsubscribe;
    }, [autoSync, user]);

    return {
        user,
        isInitialized,
        isLoading: isDriveLoading || isSyncing,
        error: driveError || syncError,
        lastSynced,
        autoSync,
        toggleAutoSync,
        signIn,
        signOut,
        syncNow: handleSync,
        restoreNow: handleRestore,
    };
}
