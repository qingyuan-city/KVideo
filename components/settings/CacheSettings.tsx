'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { cacheManager, type CacheStats } from '@/lib/utils/cacheManager';

export function CacheSettings() {
    const [stats, setStats] = useState<CacheStats | null>(null);
    const [loading, setLoading] = useState(false);

    const loadStats = async () => {
        const cacheStats = await cacheManager.getCacheStats();
        setStats(cacheStats);
    };

    useEffect(() => {
        loadStats();
        // Refresh stats every 10 seconds
        const interval = setInterval(loadStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleClearAll = async () => {
        if (!confirm('确定要清除所有缓存吗？这将删除所有已下载的视频片段。')) {
            return;
        }

        setLoading(true);
        try {
            await cacheManager.clearAllCache();
            await loadStats();
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        setLoading(true);
        try {
            await cacheManager.checkAndCleanup();
            await loadStats();
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        if (!timestamp) return '无';
        return new Date(timestamp).toLocaleString('zh-CN');
    };

    return (
        <Card className="glass-effect">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icons.Database className="h-5 w-5" />
                    缓存管理
                </CardTitle>
                <CardDescription>
                    视频片段缓存自动管理，7天后过期，最大1GB
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {stats && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-panel p-4 rounded-[var(--radius-lg)]">
                                <div className="text-sm text-muted-foreground mb-1">缓存条目</div>
                                <div className="text-2xl font-bold">{stats.totalEntries}</div>
                            </div>
                            <div className="glass-panel p-4 rounded-[var(--radius-lg)]">
                                <div className="text-sm text-muted-foreground mb-1">缓存大小</div>
                                <div className="text-2xl font-bold">{stats.totalSizeMB.toFixed(2)} MB</div>
                            </div>
                        </div>

                        <div className="glass-panel p-4 rounded-[var(--radius-lg)] space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">最早缓存</span>
                                <span>{formatDate(stats.oldestEntry)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">最新缓存</span>
                                <span>{formatDate(stats.newestEntry)}</span>
                            </div>
                        </div>

                        {stats.totalSizeMB > 800 && (
                            <div className="glass-panel p-3 rounded-[var(--radius-lg)] border-l-4 border-yellow-500">
                                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                                    <Icons.AlertTriangle className="h-4 w-4" />
                                    <span>缓存空间即将达到上限</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={handleCleanup}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                    >
                        <Icons.Trash2 className="h-4 w-4 mr-2" />
                        清理过期缓存
                    </Button>
                    <Button
                        onClick={handleClearAll}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                    >
                        <Icons.X className="h-4 w-4 mr-2" />
                        清除全部
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                    <p>• 缓存会在7天后自动过期</p>
                    <p>• 超过1GB时自动清理最旧的30%</p>
                    <p>• 系统每5分钟自动检查一次</p>
                </div>
            </CardContent>
        </Card>
    );
}
