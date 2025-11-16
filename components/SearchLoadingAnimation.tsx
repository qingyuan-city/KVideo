'use client';

import { useEffect, useState } from 'react';

interface SearchLoadingAnimationProps {
  currentSource?: string;
  checkedSources?: number;
  totalSources?: number;
  checkedVideos?: number;
  totalVideos?: number;
  stage?: 'searching' | 'checking' | 'validating';
}

export function SearchLoadingAnimation({ 
  currentSource, 
  checkedSources = 0, 
  totalSources = 16,
  checkedVideos = 0,
  totalVideos = 0,
  stage = 'searching'
}: SearchLoadingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  // Calculate unified progress (0-100%)
  // Stage 1: Search sources (0-50%)
  // Stage 2: Check videos (50-80%)
  // Stage 3: Validate in browser (80-100%)
  let progress = 0;
  let statusText = '';
  
  if (stage === 'searching') {
    progress = totalSources > 0 ? (checkedSources / totalSources) * 50 : 0;
    statusText = `${checkedSources}/${totalSources} 个源`;
  } else if (stage === 'checking') {
    progress = 50 + (totalVideos > 0 ? (checkedVideos / totalVideos) * 30 : 0);
    statusText = `${checkedVideos}/${totalVideos} 个视频`;
  } else if (stage === 'validating') {
    progress = 80 + Math.min(20, Math.random() * 20); // Animated progress for validation
    statusText = '验证播放能力';
  }

  return (
    <div className="w-full space-y-3 animate-fade-in">
      {/* Loading Message with Icon */}
      <div className="flex items-center justify-center gap-3">
        {/* Spinning Icon */}
        <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth="3"
            strokeDasharray="60 40"
            strokeLinecap="round"
          />
        </svg>
        
        <span className="text-sm font-medium text-[var(--text-color-secondary)]">
          {stage === 'searching' ? '正在搜索视频源' : stage === 'validating' ? '正在验证视频播放能力' : '正在检测视频可用性'}{dots}
        </span>
      </div>

      {/* Progress Bar - Unified 0-100% */}
      <div className="w-full">
        <div 
          className="h-1 bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] overflow-hidden"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <div
            className="h-full bg-[var(--accent-color)] transition-all duration-500 ease-out relative"
            style={{ 
              width: `${progress}%`,
              borderRadius: 'var(--radius-full)'
            }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        {/* Progress Info - Real-time count */}
        <div className="flex items-center justify-between mt-2 text-xs text-[var(--text-color-secondary)]">
          <span>{statusText}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
