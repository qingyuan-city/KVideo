import { Segment } from '@/lib/utils/hlsManifestParser';
import { downloadSegmentQueue } from '@/lib/utils/segmentDownloader';

interface PreloadParams {
    currentTime: number;
    segments: Segment[];
    videoRef: React.RefObject<HTMLVideoElement | null>;
    lastStartIndexRef: React.MutableRefObject<number>;
    isInitializedRef: React.MutableRefObject<boolean>;
    abortControllerRef: React.MutableRefObject<AbortController | null>;
    videoUrl: string;
}

export function preloadSegments({
    currentTime,
    segments,
    videoRef,
    lastStartIndexRef,
    isInitializedRef,
    abortControllerRef,
    videoUrl
}: PreloadParams) {
    // Find segment index for currentTime
    let startIndex = 0;
    for (let i = 0; i < segments.length; i++) {
        if (currentTime < segments[i].startTime + segments[i].duration) {
            startIndex = i;
            break;
        }
    }

    // Check browser buffer health
    if (videoRef.current) {
        const buffered = videoRef.current.buffered;
        let bufferEnd = 0;
        for (let i = 0; i < buffered.length; i++) {
            if (buffered.start(i) <= currentTime && buffered.end(i) >= currentTime) {
                bufferEnd = buffered.end(i);
                break;
            }
        }

        // If browser buffer is less than 30s ahead, let browser handle it
        if (bufferEnd - currentTime < 30) {
            return;
        }
    }

    // Offset start index by 3 segments to avoid competing with browser playback
    startIndex = Math.min(startIndex + 3, segments.length - 1);

    if (startIndex >= segments.length) return;

    // Check if this is sequential playback or a seek
    const diff = startIndex - lastStartIndexRef.current;
    const isSequential = diff >= 0 && diff < 3;

    // Skip if already downloading sequentially
    if (isSequential && isInitializedRef.current && abortControllerRef.current) {
        return;
    }

    // Mark as initialized or handle seek
    if (!isInitializedRef.current) {
        isInitializedRef.current = true;
    }

    lastStartIndexRef.current = startIndex;

    // Abort previous queue and start new one
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    downloadSegmentQueue({
        segments: segments,
        startIndex,
        signal: abortControllerRef.current.signal,
        videoUrl: videoUrl
    });
}
