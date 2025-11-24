import React from 'react';

interface MobileSpeedMenuProps {
    showSpeedMenu: boolean;
    isCompactLayout: boolean;
    playbackRate: number;
    speeds: number[];
    onSpeedChange: (speed: number) => void;
    onClose: () => void;
}

export function MobileSpeedMenu({
    showSpeedMenu,
    isCompactLayout,
    playbackRate,
    speeds,
    onSpeedChange,
    onClose
}: MobileSpeedMenuProps) {
    if (!showSpeedMenu) return null;

    if (isCompactLayout) {
        return (
            <div className="mt-3 pt-3 border-t border-white/20 menu-container">
                <div className="flex gap-2 flex-wrap">
                    {speeds.map((speed) => (
                        <button
                            key={speed}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSpeedChange(speed);
                            }}
                            className={`px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-medium transition-colors cursor-pointer ${playbackRate === speed
                                ? 'bg-[var(--accent-color)] text-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white text-xs mt-2 cursor-pointer"
                >
                    关闭
                </button>
            </div>
        );
    }

    return (
        <div className="absolute bottom-full right-0 mb-2 z-[100] menu-container">
            <div className="bg-[rgba(255,255,255,0.1)] backdrop-blur-[25px] rounded-[var(--radius-2xl)] border border-[rgba(255,255,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-2 flex gap-2">
                {speeds.map((speed) => (
                    <button
                        key={speed}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSpeedChange(speed);
                        }}
                        className={`px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${playbackRate === speed
                            ? 'bg-[var(--accent-color)] text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                    >
                        {speed}x
                    </button>
                ))}
            </div>
        </div>
    );
}
