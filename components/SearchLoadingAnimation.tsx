'use client';

import { useEffect, useState } from 'react';

interface SearchLoadingAnimationProps {
  currentSource?: string;
  checkedSources?: number;
  totalSources?: number;
}

export function SearchLoadingAnimation({ 
  currentSource, 
  checkedSources = 0, 
  totalSources = 16,
}: SearchLoadingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  // Calculate progress (0-100%)
  const progress = totalSources > 0 ? (checkedSources / totalSources) * 100 : 0;
  const statusText = `${checkedSources}/${totalSources} 个源`;

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
          正在搜索视频源{dots}
        </span>
      </div>

      {/* Progress Bar - Unified 0-100% */}
      <div className="w-full">
        <div 
          className="h-1 bg-[color-mix(in_srgb,var(--glass-bg)_50%,transparent)] overflow-hidden rounded-[var(--radius-full)]"
        >
          <div
            className="h-full bg-[var(--accent-color)] transition-all duration-500 ease-out relative will-change-[width] rounded-[var(--radius-full)]"
            style={{ 
              width: `${progress}%`,
              transform: 'translateZ(0)'
            }}
          >
            {/* Shimmer Effect - Optimized for GPU */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            ></div>
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
