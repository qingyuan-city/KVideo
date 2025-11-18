'use client';

import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';

export function EmptyState() {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="mb-8">
        <div 
          className="inline-flex items-center justify-center w-32 h-32 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] mb-6 rounded-[var(--radius-full)]" 
        >
          <Icons.Film size={64} className="text-[var(--text-color-secondary)]" />
        </div>
        <h3 className="text-3xl font-bold text-[var(--text-color)] mb-4">
          开始探索精彩内容
        </h3>
        <p className="text-lg text-[var(--text-color-secondary)] max-w-2xl mx-auto mb-8">
          在上方搜索框输入关键词，从 16 个视频源聚合搜索海量影视资源
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <Card hover={false} className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Icons.Zap size={48} className="text-[var(--accent-color)]" />
            </div>
            <h4 className="font-semibold text-[var(--text-color)] mb-2">极速搜索</h4>
            <p className="text-sm text-[var(--text-color-secondary)]">多源并行，秒级响应</p>
          </Card>
          <Card hover={false} className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Icons.Target size={48} className="text-[var(--accent-color)]" />
            </div>
            <h4 className="font-semibold text-[var(--text-color)] mb-2">精准匹配</h4>
            <p className="text-sm text-[var(--text-color-secondary)]">智能算法，结果精准</p>
          </Card>
          <Card hover={false} className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Icons.Sparkles size={48} className="text-[var(--accent-color)]" />
            </div>
            <h4 className="font-semibold text-[var(--text-color)] mb-2">极致体验</h4>
            <p className="text-sm text-[var(--text-color-secondary)]">流畅播放，完美适配</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
