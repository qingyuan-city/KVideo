import React from 'react';
import { Icons } from '@/components/ui/Icon';

interface DesktopOverlayProps {
    isLoading: boolean;
    isPlaying: boolean;
    showSkipForwardIndicator: boolean;
    showSkipBackwardIndicator: boolean;
    skipForwardAmount: number;
    skipBackwardAmount: number;
    isSkipForwardAnimatingOut: boolean;
    isSkipBackwardAnimatingOut: boolean;
    showToast: boolean;
    toastMessage: string | null;
    onTogglePlay: () => void;
}

export function DesktopOverlay({
    isLoading,
    isPlaying,
    showSkipForwardIndicator,
    showSkipBackwardIndicator,
    skipForwardAmount,
    skipBackwardAmount,
    isSkipForwardAnimatingOut,
    isSkipBackwardAnimatingOut,
    showToast,
    toastMessage,
    onTogglePlay
}: DesktopOverlayProps) {
    return (
        <>
            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="spinner"></div>
                </div>
            )}

            {/* Skip Forward Indicator */}
            {showSkipForwardIndicator && (
                <div className="absolute top-1/2 right-12 -translate-y-1/2 pointer-events-none transition-all duration-300">
                    <div className={`text-white text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${isSkipForwardAnimatingOut ? 'animate-scale-out' : 'animate-scale-in'
                        }`}>
                        +{skipForwardAmount}
                    </div>
                </div>
            )}

            {/* Skip Backward Indicator */}
            {showSkipBackwardIndicator && (
                <div className="absolute top-1/2 left-12 -translate-y-1/2 pointer-events-none transition-all duration-300">
                    <div className={`text-white text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${isSkipBackwardAnimatingOut ? 'animate-scale-out' : 'animate-scale-in'
                        }`}>
                        -{skipBackwardAmount}
                    </div>
                </div>
            )}

            {/* Center Play Button (when paused) */}
            {!isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                        onClick={onTogglePlay}
                        className="pointer-events-auto w-20 h-20 rounded-full bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] border border-[var(--glass-border)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[var(--accent-color)] shadow-[var(--shadow-md)] will-change-transform cursor-pointer"
                        aria-label="Play"
                    >
                        <Icons.Play size={32} className="text-white ml-1" />
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && toastMessage && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
                    <div className="bg-[rgba(28,28,30,0.95)] backdrop-blur-[25px] rounded-[var(--radius-2xl)] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-6 py-3 flex items-center gap-3 min-w-[200px]">
                        <Icons.Check size={18} className="text-[#34c759] flex-shrink-0" />
                        <span className="text-white text-sm font-medium">{toastMessage}</span>
                    </div>
                </div>
            )}
        </>
    );
}
