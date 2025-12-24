import { useState, useEffect } from 'react';
import { settingsStore, getDefaultSources, type SortOption } from '@/lib/store/settings-store';
import type { VideoSource } from '@/lib/types';

export function useSettingsPage() {
    const [sources, setSources] = useState<VideoSource[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isRestoreDefaultsDialogOpen, setIsRestoreDefaultsDialogOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<VideoSource | null>(null);

    const [passwordAccess, setPasswordAccess] = useState(false);
    const [accessPasswords, setAccessPasswords] = useState<string[]>([]);
    const [envPasswordSet, setEnvPasswordSet] = useState(false);

    useEffect(() => {
        const settings = settingsStore.getSettings();
        setSources(settings.sources || []);
        setSortBy(settings.sortBy);
        setPasswordAccess(settings.passwordAccess);
        setAccessPasswords(settings.accessPasswords);

        // Fetch env password status
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setEnvPasswordSet(data.hasEnvPassword))
            .catch(() => setEnvPasswordSet(false));
    }, []);

    const handleSourcesChange = (newSources: VideoSource[]) => {
        setSources(newSources);
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            sources: newSources,
            sortBy,
            searchHistory: true,
            watchHistory: true,
            passwordAccess,
            accessPasswords
        });
    };

    const handleAddSource = (source: VideoSource) => {
        const exists = sources.some(s => s.id === source.id);
        const updated = exists
            ? sources.map(s => s.id === source.id ? source : s)
            : [...sources, source];
        handleSourcesChange(updated);
        setEditingSource(null);
    };

    const handleEditSource = (source: VideoSource) => {
        setEditingSource(source);
        setIsAddModalOpen(true);
    };

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            sources,
            sortBy: newSort,
            searchHistory: true,
            watchHistory: true,
            passwordAccess,
            accessPasswords
        });
    };

    const handlePasswordToggle = (enabled: boolean) => {
        setPasswordAccess(enabled);
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            sources,
            sortBy,
            searchHistory: true,
            watchHistory: true,
            passwordAccess: enabled,
            accessPasswords
        });
    };

    const handleAddPassword = (password: string) => {
        const updated = [...accessPasswords, password];
        setAccessPasswords(updated);
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            sources,
            sortBy,
            searchHistory: true,
            watchHistory: true,
            passwordAccess,
            accessPasswords: updated
        });
    };

    const handleRemovePassword = (password: string) => {
        const updated = accessPasswords.filter(p => p !== password);
        setAccessPasswords(updated);
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            sources,
            sortBy,
            searchHistory: true,
            watchHistory: true,
            passwordAccess,
            accessPasswords: updated
        });
    };

    const handleExport = (includeSearchHistory: boolean, includeWatchHistory: boolean) => {
        const data = settingsStore.exportSettings(includeSearchHistory || includeWatchHistory);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kvideo-settings-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (jsonString: string): boolean => {
        const success = settingsStore.importSettings(jsonString);
        if (success) {
            const settings = settingsStore.getSettings();
            setSources(settings.sources);
            setSortBy(settings.sortBy);
            setPasswordAccess(settings.passwordAccess);
            setAccessPasswords(settings.accessPasswords);
        }
        return success;
    };

    const handleRestoreDefaults = () => {
        const defaults = getDefaultSources();
        handleSourcesChange(defaults);
        setIsRestoreDefaultsDialogOpen(false);
    };

    const handleResetAll = () => {
        settingsStore.resetToDefaults();
        setIsResetDialogOpen(false);
        window.location.reload();
    };

    return {
        sources,
        sortBy,
        passwordAccess,
        accessPasswords,
        envPasswordSet,
        isAddModalOpen,
        isExportModalOpen,
        isImportModalOpen,
        isResetDialogOpen,
        isRestoreDefaultsDialogOpen,
        setIsAddModalOpen,
        setIsExportModalOpen,
        setIsImportModalOpen,
        setIsResetDialogOpen,
        setIsRestoreDefaultsDialogOpen,
        setEditingSource,
        handleSourcesChange,
        handleAddSource,
        handleSortChange,
        handlePasswordToggle,
        handleAddPassword,
        handleRemovePassword,
        handleExport,
        handleImport,
        handleRestoreDefaults,
        handleResetAll,
        editingSource,
        handleEditSource,
    };
}
