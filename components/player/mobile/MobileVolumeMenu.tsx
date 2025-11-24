import React from 'react';
import { Icons } from '@/components/ui/Icon';

interface MobileVolumeMenuProps {
    showVolumeMenu: boolean;
    isCompactLayout: boolean;
    isMuted: boolean;
    volume: number;
    onToggleMute: () => void;
    onVolumeChange: (volume: number) => void;
    onClose: () => void;
}

export function MobileVolumeMenu({
    showVolumeMenu,
    isCompactLayout,
    isMuted,
    volume,
    onToggleMute,
    onVolumeChange,
    onClose
}: MobileVolumeMenuProps) {
    if (!showVolumeMenu) return null;

    if (isCompactLayout) {
        return (
            <div className="mt-3 pt-3 border-t border-white/20 menu-container">
                <div className="flex items-center gap-3">
                    <button onClick={onToggleMute} className="btn-icon p-2">
                        {isMuted || volume === 0 ? <Icons.VolumeX size={18} /> : <Icons.Volume2 size={18} />}
                    </button>
                    <div className="flex-1">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume * 100}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value) / 100)}
                            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                        />
                    </div>
                    <span className="text-white text-xs font-medium tabular-nums min-w-[2rem]">
                        {Math.round((isMuted ? 0 : volume) * 100)}
                    </span>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white text-xs cursor-pointer"
                    >
                        关闭
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute bottom-full left-0 mb-2 z-[100] menu-container">
            <div className="bg-[rgba(255,255,255,0.1)] backdrop-blur-[25px] rounded-[var(--radius-2xl)] border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-3 flex flex-col items-center gap-2 min-w-[48px]">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMute();
                    }}
                    className="btn-icon p-1.5"
                >
                    {isMuted || volume === 0 ? <Icons.VolumeX size={18} /> : <Icons.Volume2 size={18} />}
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                        e.stopPropagation();
                        onVolumeChange(parseFloat(e.target.value));
                    }}
                    className="h-24 w-1 bg-white/30 rounded-full appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    style={{ WebkitAppearance: 'slider-vertical' }}
                />

                <span className="text-white text-xs font-medium tabular-nums">
                    {Math.round((isMuted ? 0 : volume) * 100)}
                </span>
            </div>
        </div>
    );
}
