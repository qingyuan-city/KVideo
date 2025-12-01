import { useEffect, useRef, useState } from 'react';
import { parseHLSManifest, type Segment } from '@/lib/utils/hlsManifestParser';
import { preloadSegments } from '@/lib/utils/hls-downloader';

interface UseHLSPreloaderProps {
    src: string;
    currentTime: number;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isLoading: boolean;
}

export function useHLSPreloader({ src, currentTime, videoRef, isLoading }: UseHLSPreloaderProps) {
    const abortControllerRef = useRef<AbortController | null>(null);
    const segmentsRef = useRef<Segment[]>([]);
    const [isManifestLoaded, setIsManifestLoaded] = useState(false);
    const lastStartIndexRef = useRef<number>(-1);
    const isInitializedRef = useRef(false);
    const downloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastCurrentTimeRef = useRef<number>(0);

    // Fetch and parse manifest when src changes
    useEffect(() => {
        if (!src || !src.endsWith('.m3u8')) return;

        isInitializedRef.current = false;
        lastStartIndexRef.current = -1;

        const fetchManifest = async () => {
            try {
                // Fetch manifest
                const segments = await parseHLSManifest(src);
                segmentsRef.current = segments;
                setIsManifestLoaded(true);
                const totalDuration = segments[segments.length - 1]?.startTime + segments[segments.length - 1]?.duration || 0;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes('503') || errorMessage.includes('Network unavailable')) {
                    console.warn('[Preloader] Network unavailable, skipping preload:', errorMessage);
                } else {
                    console.error('[Preloader] Error fetching manifest:', error);
                }
            }
        };

        fetchManifest();
    }, [src]);

    // Manage downloads based on currentTime with debounce
    useEffect(() => {
        if (!isManifestLoaded || segmentsRef.current.length === 0) return;

        if (isLoading) {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            return;
        }

        if (downloadTimeoutRef.current) {
            clearTimeout(downloadTimeoutRef.current);
        }

        downloadTimeoutRef.current = setTimeout(() => {
            preloadSegments({
                currentTime,
                segments: segmentsRef.current,
                videoRef,
                lastStartIndexRef,
                isInitializedRef,
                abortControllerRef,
                videoUrl: src
            });
        }, !isInitializedRef.current ? 100 : (Math.abs(currentTime - lastCurrentTimeRef.current) > 2 ? 2000 : 500));

        lastCurrentTimeRef.current = currentTime;

    }, [isManifestLoaded, currentTime, isLoading, videoRef, src]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
}