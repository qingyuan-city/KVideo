import React from 'react';
import { Icons } from '@/components/ui/Icon';

interface MobileMoreMenuProps {
    showMoreMenu: boolean;
    isMuted: boolean;
    volume: number;
    playbackRate: number;
    isPiPSupported: boolean;
    onCopyLink: () => void;
    onToggleVolumeMenu: () => void;
    onToggleSpeedMenu: () => void;
    onTogglePiP: () => void;
}

export function MobileMoreMenu({
    showMoreMenu,
    isMuted,
    volume,
    playbackRate,
    isPiPSupported,
    onCopyLink,
    onToggleVolumeMenu,
    onToggleSpeedMenu,
    onTogglePiP
}: MobileMoreMenuProps) {
    if (!showMoreMenu) return null;

    return (
        <div className="absolute bottom-full right-0 mb-2 min-w-[160px] z-[100] menu-container">
            <div className="bg-[rgba(255,255,255,0.1)] backdrop-blur-[25px] rounded-[var(--radius-2xl)] border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                {/* Copy Link Option */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopyLink();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-all touch-manipulation cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <Icons.Link size={18} />
                    <span>复制链接</span>
                </button>

                <div className="h-px bg-white/10 my-1" />

                {/* Volume Option */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleVolumeMenu();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-all touch-manipulation cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {isMuted || volume === 0 ? <Icons.VolumeX size={18} /> : <Icons.Volume2 size={18} />}
                    <span>音量</span>
                </button>

                {/* Speed Option */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSpeedMenu();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-all touch-manipulation cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>速度 {playbackRate}x</span>
                </button>

                {/* PiP Option */}
                {isPiPSupported && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePiP();
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-all touch-manipulation cursor-pointer"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        <Icons.PictureInPicture size={18} />
                        <span>画中画</span>
                    </button>
                )}
            </div>
        </div>
    );
}
