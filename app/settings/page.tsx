'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { settingsStore, sortOptions, getDefaultSources, type SortOption } from '@/lib/store/settings-store';
import type { VideoSource } from '@/lib/types';
import { SourceManager } from '@/components/settings/SourceManager';
import { AddSourceModal } from '@/components/settings/AddSourceModal';
import { ExportModal } from '@/components/settings/ExportModal';
import { ImportModal } from '@/components/settings/ImportModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function SettingsPage() {
  const router = useRouter();
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isRestoreDefaultsDialogOpen, setIsRestoreDefaultsDialogOpen] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  useEffect(() => {
    const settings = settingsStore.getSettings();
    setSources(settings.sources || []);
    setSortBy(settings.sortBy);
  }, []);

  const handleSourcesChange = (newSources: VideoSource[]) => {
    setSources(newSources);
    settingsStore.saveSettings({ sources: newSources, sortBy, searchHistory: true, watchHistory: true });
  };

  const handleAddSource = (source: VideoSource) => {
    const updated = [...sources, source];
    handleSourcesChange(updated);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    settingsStore.saveSettings({ sources, sortBy: newSort, searchHistory: true, watchHistory: true });
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

  return (
    <div className="min-h-screen bg-[var(--bg-color)] bg-[image:var(--bg-image)] bg-fixed">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[var(--accent-color)] hover:underline mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            返回上一页
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <svg className="w-6 h-6 text-[var(--text-color)]" viewBox="0 -960 960 960" fill="currentColor">
                <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-color)]">设置</h1>
              <p className="text-[var(--text-color-secondary)]">管理应用程序配置</p>
            </div>
          </div>
        </div>

        {/* Source Management */}
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-color)]">视频源管理</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRestoreDefaultsDialogOpen(true)}
                className="px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-sm font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200"
              >
                恢复默认
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--accent-color)] text-white text-sm font-semibold hover:brightness-110 hover:-translate-y-0.5 shadow-[var(--shadow-sm)] transition-all duration-200"
              >
                + 添加源
              </button>
            </div>
          </div>
          <p className="text-sm text-[var(--text-color-secondary)] mb-6">
            管理视频来源，调整优先级和启用状态
          </p>
          <SourceManager
            sources={showAllSources ? sources : sources.slice(0, 10)}
            onSourcesChange={handleSourcesChange}
          />
          {sources.length > 10 && (
            <button
              onClick={() => setShowAllSources(!showAllSources)}
              className="w-full mt-4 px-4 py-3 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] text-sm font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200"
            >
              {showAllSources ? '收起' : `显示全部 (${sources.length})`}
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">搜索结果排序</h2>
          <p className="text-sm text-[var(--text-color-secondary)] mb-4">
            选择搜索结果的默认排序方式
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(sortOptions) as SortOption[]).map((option) => (
              <button
                key={option}
                onClick={() => handleSortChange(option)}
                className={`px-4 py-3 rounded-[var(--radius-2xl)] border text-left font-medium transition-all duration-200 ${sortBy === option
                  ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                  : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)]'
                  }`}
              >
                {sortOptions[option]}
              </button>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] p-6">
          <h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">数据管理</h2>
          <div className="space-y-3">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full px-6 py-4 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 flex items-center justify-between"
            >
              <span>导出设置</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full px-6 py-4 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 flex items-center justify-between"
            >
              <span>导入设置</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </button>

            <button
              onClick={() => setIsResetDialogOpen(true)}
              className="w-full px-6 py-4 rounded-[var(--radius-2xl)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center justify-between"
            >
              <span>清除所有数据</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSource}
        existingIds={sources.map(s => s.id)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      <ConfirmDialog
        isOpen={isRestoreDefaultsDialogOpen}
        title="恢复默认源"
        message="这将重置所有视频源为默认配置。自定义源将被删除。是否继续？"
        confirmText="恢复"
        cancelText="取消"
        onConfirm={handleRestoreDefaults}
        onCancel={() => setIsRestoreDefaultsDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={isResetDialogOpen}
        title="清除所有数据"
        message="这将删除所有设置、历史记录、Cookie 和缓存。此操作不可撤销。是否继续？"
        confirmText="清除"
        cancelText="取消"
        onConfirm={handleResetAll}
        onCancel={() => setIsResetDialogOpen(false)}
        dangerous
      />
    </div>
  );
}
