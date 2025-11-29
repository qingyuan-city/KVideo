/**
 * HLS Manifest Parser Utility
 * Parses m3u8 manifests and extracts segment information
 */

export interface Segment {
    url: string;
    duration: number;
    startTime: number;
}

export interface ManifestInfo {
    segments: Segment[];
    isEncrypted: boolean;
    keyUri?: string;
}

/**
 * Parse HLS manifest - routes through proxy to avoid CORS
 */
export async function parseHLSManifest(src: string): Promise<Segment[]> {
    // Route through proxy to ensure consistency and avoid CORS
    const proxyUrl = src.includes('/api/proxy')
        ? src
        : `${getOrigin()}/api/proxy?url=${encodeURIComponent(src)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
        const errorMsg = response.status === 503
            ? `Network unavailable (Service Worker offline): ${src}`
            : `Failed to fetch manifest (${response.status}): ${src}`;
        throw new Error(errorMsg);
    }
    const manifestText = await response.text();

    // Check if this is a master playlist
    if (manifestText.includes('#EXT-X-STREAM-INF')) {
        console.log('[HLS Parser] Master playlist detected, selecting variant...');
        return parseMasterPlaylist(manifestText, src);
    }

    // Parse as media playlist
    return parseMediaPlaylist(manifestText, src);
}

function getOrigin(): string {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return '';
}

async function parseMasterPlaylist(content: string, baseUrl: string): Promise<Segment[]> {
    const lines = content.split('\n');

    // Find first variant playlist URL
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('#EXT-X-STREAM-INF')) {
            // Next non-comment line is the variant URL
            for (let j = i + 1; j < lines.length; j++) {
                const line = lines[j].trim();
                if (line && !line.startsWith('#')) {
                    const variantUrl = new URL(line, baseUrl).toString();
                    console.log(`[HLS Parser] Selected variant: ${variantUrl.substring(0, 100)}...`);
                    // Recursively parse the variant playlist
                    return parseHLSManifest(variantUrl);
                }
            }
        }
    }

    console.warn('[HLS Parser] No valid variant found in master playlist');
    return [];
}

function parseMediaPlaylist(content: string, baseUrl: string): Segment[] {
    const lines = content.split('\n');
    const segments: Segment[] = [];
    let currentSegmentDuration = 0;
    let currentStartTime = 0;
    let isEncrypted = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Check for encryption
        if (trimmed.startsWith('#EXT-X-KEY:')) {
            isEncrypted = true;
            console.log('[HLS Parser] Encrypted stream detected');
        }

        if (trimmed.startsWith('#EXTINF:')) {
            const durationStr = trimmed.substring(8).split(',')[0];
            currentSegmentDuration = parseFloat(durationStr);
        } else if (trimmed && !trimmed.startsWith('#')) {
            // Segment URLs are already proxied by the backend proxy
            // Just use them as-is
            const segmentUrl = trimmed;
            segments.push({
                url: segmentUrl,
                duration: currentSegmentDuration,
                startTime: currentStartTime
            });
            currentStartTime += currentSegmentDuration;
        }
    }

    if (isEncrypted) {
        console.log(`[HLS Parser] Parsed ${segments.length} encrypted segments`);
    }

    return segments;
}
