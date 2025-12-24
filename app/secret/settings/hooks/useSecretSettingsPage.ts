import { useState, useEffect } from 'react';
import { settingsStore, getDefaultAdultSources, type SortOption } from '@/lib/store/settings-store';
import type { VideoSource } from '@/lib/types';

export function useSecretSettingsPage() {
    const [adultSources, setAdultSources] = useState<VideoSource[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestoreDefaultsDialogOpen, setIsRestoreDefaultsDialogOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<VideoSource | null>(null);

    useEffect(() => {
        const settings = settingsStore.getSettings();
        setAdultSources(settings.adultSources || []);
        setSortBy(settings.sortBy);
    }, []);

    const handleSourcesChange = (newSources: VideoSource[]) => {
        setAdultSources(newSources);
        const currentSettings = settingsStore.getSettings();
        settingsStore.saveSettings({
            ...currentSettings,
            adultSources: newSources,
        });
    };

    const handleAddSource = (source: VideoSource) => {
        const exists = adultSources.some(s => s.id === source.id);
        const updated = exists
            ? adultSources.map(s => s.id === source.id ? source : s)
            : [...adultSources, source];
        handleSourcesChange(updated);
        setEditingSource(null);
    };

    const handleEditSource = (source: VideoSource) => {
        setEditingSource(source);
        setIsAddModalOpen(true);
    };

    const handleRestoreDefaults = () => {
        const defaults = getDefaultAdultSources();
        handleSourcesChange(defaults);
        setIsRestoreDefaultsDialogOpen(false);
    };

    return {
        adultSources,
        sortBy,
        isAddModalOpen,
        isRestoreDefaultsDialogOpen,
        setIsAddModalOpen,
        setIsRestoreDefaultsDialogOpen,
        setEditingSource,
        handleSourcesChange,
        handleAddSource,
        handleRestoreDefaults,
        editingSource,
        handleEditSource,
    };
}
