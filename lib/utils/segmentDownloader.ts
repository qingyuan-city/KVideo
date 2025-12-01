/**
 * Segment Downloader Utility
 * Handles parallel segment downloading with concurrency control
 */

import type { Segment } from './hlsManifestParser';
import { cacheManager } from './cacheManager';

interface DownloadQueueOptions {
    segments: Segment[];
    startIndex: number;
    signal: AbortSignal;
    onProgress?: (current: number, total: number) => void;
    videoUrl?: string; // The m3u8 URL for metadata tracking
}

const CONCURRENCY = 2;
const TIMEOUT_MS = 15000;
const CACHE_NAME = 'video-cache-v1';

export async function downloadSegmentQueue(options: DownloadQueueOptions): Promise<void> {
    const { segments, startIndex, signal, onProgress, videoUrl } = options;

    if (!('caches' in window)) return;

    const cache = await caches.open(CACHE_NAME);
    let currentIndex = startIndex;

    const processNext = async () => {
        if (signal.aborted || currentIndex >= segments.length) return;

        const segment = segments[currentIndex];
        const url = segment.url;
        currentIndex++;

        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
        const fetchSignal = anySignal([signal, timeoutController.signal]);

        try {
            // Check if cache exists AND is valid (not expired)
            const match = await cache.match(url, { ignoreSearch: true });
            const isValid = match ? await cacheManager.isCacheValid(url) : false;

            if (match && isValid) {
                // Silently skip cached segments
            } else {
                // If cache exists but expired, delete it
                if (match && !isValid) {
                    await cache.delete(url);
                }

                const response = await fetch(url, { signal: fetchSignal });

                if (response.ok) {
                    try {
                        const clonedResponse = response.clone();
                        await cache.put(url, response.clone());

                        // Track metadata if videoUrl is provided
                        if (videoUrl) {
                            const blob = await clonedResponse.blob();
                            await cacheManager.addCacheEntry(url, videoUrl, blob.size);
                        }

                        onProgress?.(currentIndex, segments.length);
                    } catch (e) {
                        console.warn('[Preloader] Cache quota error:', e);
                    }
                }
            }
        } catch {
            // Ignore errors
        } finally {
            clearTimeout(timeoutId);
            if (!signal.aborted) processNext();
        }
    };

    // Start initial batch
    for (let i = 0; i < CONCURRENCY && currentIndex < segments.length; i++) {
        processNext();
    }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    for (const signal of signals) {
        if (signal.aborted) {
            controller.abort();
            return signal;
        }
        signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    return controller.signal;
}
