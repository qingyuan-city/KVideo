'use client';

import { useRef, useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icon';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

export function CustomVideoPlayer({ 
  src, 
  poster,
  onError, 
  onTimeUpdate,
  initialTime = 0 
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speedMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingProgressRef = useRef(false);
  const isDraggingVolumeRef = useRef(false);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) return;
    
    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !showSpeedMenu) {
          setShowControls(false);
        }
      }, 3000);
    };

    hideControls();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showSpeedMenu]);

  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !showSpeedMenu) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  // Handle video events
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  
  const handleTimeUpdateEvent = () => {
    if (!videoRef.current || isDraggingProgressRef.current) return;
    
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    
    setCurrentTime(current);
    setDuration(total);
    
    if (onTimeUpdate) {
      onTimeUpdate(current, total);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    
    setDuration(videoRef.current.duration);
    setIsLoading(false);
    
    // Set initial time if provided
    if (initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  };

  const handleVideoError = () => {
    setIsLoading(false);
    if (onError) {
      onError('Video failed to load');
    }
  };

  // Progress bar seeking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingProgressRef.current = true;
    handleProgressClick(e);
  };

  useEffect(() => {
    const handleProgressMouseMove = (e: MouseEvent) => {
      if (!isDraggingProgressRef.current || !progressBarRef.current || !videoRef.current) return;
      
      e.preventDefault();
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      if (isDraggingProgressRef.current) {
        isDraggingProgressRef.current = false;
      }
    };

    document.addEventListener('mousemove', handleProgressMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [duration]);

  // Volume control
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !volumeBarRef.current) return;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    setVolume(pos);
    videoRef.current.volume = pos;
    setIsMuted(pos === 0);
  };

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingVolumeRef.current = true;
    handleVolumeChange(e);
  };

  useEffect(() => {
    const handleVolumeMouseMove = (e: MouseEvent) => {
      if (!isDraggingVolumeRef.current || !volumeBarRef.current || !videoRef.current) return;
      
      e.preventDefault();
      const rect = volumeBarRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      
      setVolume(pos);
      videoRef.current.volume = pos;
      setIsMuted(pos === 0);
    };

    const handleMouseUp = () => {
      if (isDraggingVolumeRef.current) {
        isDraggingVolumeRef.current = false;
      }
    };

    document.addEventListener('mousemove', handleVolumeMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleVolumeMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Playback speed
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  const changePlaybackSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    // Clear timeout when manually closing
    if (speedMenuTimeoutRef.current) {
      clearTimeout(speedMenuTimeoutRef.current);
    }
  };

  // Auto-hide speed menu after 1.5s of inactivity
  const startSpeedMenuTimeout = () => {
    if (speedMenuTimeoutRef.current) {
      clearTimeout(speedMenuTimeoutRef.current);
    }
    speedMenuTimeoutRef.current = setTimeout(() => {
      setShowSpeedMenu(false);
    }, 1500);
  };

  const clearSpeedMenuTimeout = () => {
    if (speedMenuTimeoutRef.current) {
      clearTimeout(speedMenuTimeoutRef.current);
    }
  };

  // Start timeout when menu opens
  useEffect(() => {
    if (showSpeedMenu) {
      startSpeedMenuTimeout();
    } else {
      clearSpeedMenuTimeout();
    }
    return () => clearSpeedMenuTimeout();
  }, [showSpeedMenu]);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-[var(--radius-2xl)] overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={src}
        poster={poster}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdateEvent}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleVideoError}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="spinner"></div>
        </div>
      )}

      {/* Center Play Button (when paused) */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={togglePlay}
            className="pointer-events-auto w-20 h-20 rounded-full bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] border border-[var(--glass-border)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[var(--accent-color)] shadow-[var(--shadow-md)]"
            aria-label="Play"
          >
            <Icons.Play size={32} className="text-white ml-1" />
          </button>
        </div>
      )}

      {/* Custom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ pointerEvents: showControls ? 'auto' : 'none' }}
      >
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <div 
            ref={progressBarRef}
            className="slider-track cursor-pointer"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            style={{ pointerEvents: 'auto' }}
          >
            <div 
              className="slider-range"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
            <div 
              className="slider-thumb"
              style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-4 pt-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="btn-icon"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Icons.Pause size={20} /> : <Icons.Play size={20} />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="btn-icon"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <Icons.VolumeX size={20} />
                  ) : volume < 0.5 ? (
                    <Icons.Volume1 size={20} />
                  ) : (
                    <Icons.Volume2 size={20} />
                  )}
                </button>

                {/* Volume Bar */}
                <div className="flex items-center gap-2 opacity-0 w-0 group-hover/volume:opacity-100 group-hover/volume:w-32 overflow-hidden transition-all duration-300">
                  <div 
                    ref={volumeBarRef}
                    className="slider-track h-1 cursor-pointer flex-1"
                    onClick={handleVolumeChange}
                    onMouseDown={handleVolumeMouseDown}
                  >
                    <div 
                      className="slider-range h-full"
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                    />
                    <div 
                      className="slider-thumb"
                      style={{ left: `${isMuted ? 0 : volume * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-medium tabular-nums min-w-[2rem]">
                    {Math.round((isMuted ? 0 : volume) * 100)}
                  </span>
                </div>
              </div>

              {/* Time */}
              <span className="text-white text-sm font-medium tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Playback Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  onMouseEnter={clearSpeedMenuTimeout}
                  onMouseLeave={startSpeedMenuTimeout}
                  className="btn-icon text-xs font-semibold min-w-[2.5rem]"
                  aria-label="Playback speed"
                >
                  {playbackRate}x
                </button>

                {/* Speed Menu */}
                {showSpeedMenu && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 bg-[var(--glass-bg)] backdrop-blur-[25px] saturate-[180%] rounded-[var(--radius-2xl)] border border-[var(--glass-border)] shadow-[var(--shadow-md)] p-2 min-w-[5rem]"
                    onMouseEnter={clearSpeedMenuTimeout}
                    onMouseLeave={() => setShowSpeedMenu(false)}
                  >
                    {speeds.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed)}
                        className={`w-full px-3 py-2 rounded-[var(--radius-2xl)] text-sm font-medium transition-colors ${
                          playbackRate === speed
                            ? 'bg-[var(--accent-color)] text-white'
                            : 'text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)]'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="btn-icon"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Icons.Minimize size={20} /> : <Icons.Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
