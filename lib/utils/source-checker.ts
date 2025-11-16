/**
 * Source Availability Checker
 * Pre-validates video sources during search to filter out unavailable ones
 */

import { isValidUrlFormat } from './url-validator';

const CHECK_TIMEOUT = 5000; // 5 seconds per check (increased for more reliability)
const MAX_RETRIES = 1; // Reduced retries to speed up detection
const MIN_CONTENT_LENGTH = 1024; // Minimum content size to consider valid video

export interface SourceCheckResult {
  sourceId: string;
  sourceName: string;
  isAvailable: boolean;
  sampleUrl?: string;
  error?: string;
  checkedAt: number;
}

/**
 * Check if a single video URL is accessible and actually contains video content
 * More accurate detection with multiple validation steps and stricter checks
 */
async function checkVideoUrl(url: string, retries = MAX_RETRIES): Promise<boolean> {
  if (!isValidUrlFormat(url)) {
    return false;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

      // First, try HEAD request to check if resource exists without downloading
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': new URL(url).origin,
          },
        });

        // If HEAD request fails or returns bad status, try GET with Range
        if (!response.ok && response.status !== 206) {
          throw new Error('HEAD request failed');
        }
      } catch (headError) {
        // Fallback to GET with Range if HEAD fails
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': new URL(url).origin,
            'Range': 'bytes=0-2048', // Fetch first 2KB to verify
          },
        });
      }

      clearTimeout(timeoutId);

      // Check response status
      // 200 OK: Full content
      // 206 Partial Content: Range request successful
      // 403 Forbidden: Not accessible (should fail)
      // 404 Not Found: Video doesn't exist (should fail)
      if (!response.ok && response.status !== 206) {
        return false;
      }

      // Additional validation checks
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const acceptRanges = response.headers.get('accept-ranges');

      // Check 1: Content type validation
      const hasValidContentType = contentType && (
        contentType.includes('video') || 
        contentType.includes('mpegurl') || 
        contentType.includes('m3u8') ||
        contentType.includes('application/vnd.apple.mpegurl') ||
        contentType.includes('octet-stream')
      );

      // Check 2: Content length validation (should have some content)
      // For m3u8 files, length can be small, so we're more lenient
      const hasValidLength = !contentLength || 
        parseInt(contentLength) >= MIN_CONTENT_LENGTH ||
        (contentType && (contentType.includes('m3u8') || contentType.includes('mpegurl')));

      // Check 3: For video files, check if server supports range requests (good sign)
      const supportsRanges = acceptRanges === 'bytes' || response.status === 206;

      // Video must pass ALL checks to be considered valid:
      // 1. Must have valid video content type
      // 2. Must have reasonable content length OR support range requests
      // 3. For better reliability, prefer sources that support ranges (streaming capability)
      if (!hasValidContentType) {
        console.debug(`Invalid content type for ${url.substring(0, 50)}...`);
        return false;
      }
      
      if (!hasValidLength && !supportsRanges) {
        console.debug(`Invalid content length and no range support for ${url.substring(0, 50)}...`);
        return false;
      }

      // Additional strict check: Try to fetch a small byte range to verify actual content
      try {
        const verifyResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': new URL(url).origin,
            'Range': 'bytes=0-1024', // Fetch first 1KB
          },
        });
        
        // If we can't even fetch the first 1KB, it's not a valid source
        if (!verifyResponse.ok && verifyResponse.status !== 206) {
          console.debug(`Failed to verify content for ${url.substring(0, 50)}...`);
          return false;
        }
      } catch (verifyError) {
        console.debug(`Verification fetch failed for ${url.substring(0, 50)}...`);
        return false;
      }

      return true;
    } catch (error) {
      // If last attempt, return false
      if (attempt === retries) {
        return false;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return false;
}

/**
 * Extract first playable URL from video data
 * More robust parsing with better error handling
 */
function extractFirstVideoUrl(video: any): string | null {
  if (!video.vod_play_url) return null;

  try {
    // Format: "Episode1$url1#Episode2$url2#..." or sometimes "url1#url2#url3"
    const episodes = video.vod_play_url.split('#').filter((ep: string) => ep.trim());
    
    for (const episode of episodes) {
      // Try different formats
      const parts = episode.split('$');
      
      // Format 1: "Episode$url"
      if (parts.length >= 2) {
        const url = parts[1].trim();
        if (url && isValidUrlFormat(url)) {
          return url;
        }
      } 
      // Format 2: Just "url" without episode name
      else if (parts.length === 1) {
        const url = parts[0].trim();
        if (url && isValidUrlFormat(url)) {
          return url;
        }
      }
    }
  } catch (error) {
    console.error('Error extracting video URL:', error);
  }

  return null;
}

/**
 * Check if a single video is playable
 * Returns false if URL is invalid or video fails validation
 */
export async function checkVideoAvailability(video: any): Promise<boolean> {
  // First check if video has required data
  if (!video || !video.vod_play_url) {
    return false;
  }

  const videoUrl = extractFirstVideoUrl(video);
  
  if (!videoUrl) {
    return false;
  }

  // Perform thorough URL check
  const isAvailable = await checkVideoUrl(videoUrl);
  
  // Log failed checks for debugging
  if (!isAvailable) {
    console.debug(`Video unavailable: ${video.vod_name || 'Unknown'} (${videoUrl.substring(0, 50)}...)`);
  }
  
  return isAvailable;
}

/**
 * Check multiple videos in parallel with concurrency limit
 * Improved error handling and progress reporting
 */
export async function checkMultipleVideos(
  videos: any[],
  concurrency: number = 8, // Reduced default concurrency for better accuracy
  onProgress?: (checked: number, total: number) => void
): Promise<any[]> {
  if (!videos || videos.length === 0) {
    return [];
  }

  const availableVideos: any[] = [];
  let checkedCount = 0;
  
  // Process videos in batches to avoid overwhelming the system
  for (let i = 0; i < videos.length; i += concurrency) {
    const batch = videos.slice(i, i + concurrency);
    
    try {
      const results = await Promise.all(
        batch.map(async (video) => {
          try {
            const isAvailable = await checkVideoAvailability(video);
            checkedCount++;
            
            // Report progress
            if (onProgress) {
              onProgress(checkedCount, videos.length);
            }
            
            return isAvailable ? video : null;
          } catch (error) {
            // If individual check fails, mark as unavailable
            checkedCount++;
            if (onProgress) {
              onProgress(checkedCount, videos.length);
            }
            return null;
          }
        })
      );
      
      // Add available videos to result
      availableVideos.push(...results.filter(v => v !== null));
    } catch (error) {
      console.error('Batch check error:', error);
      // Continue with next batch even if this one fails
    }
  }
  
  console.log(`Checked ${videos.length} videos, ${availableVideos.length} available`);
  
  return availableVideos;
}

/**
 * Check if a source is available by testing a sample video
 * Now checks more videos for better accuracy
 */
export async function checkSourceAvailability(
  sourceId: string,
  sourceName: string,
  sampleVideos: any[]
): Promise<SourceCheckResult> {
  const startTime = Date.now();

  // If no videos from this source, mark as unavailable
  if (!sampleVideos || sampleVideos.length === 0) {
    return {
      sourceId,
      sourceName,
      isAvailable: false,
      error: 'No videos found',
      checkedAt: Date.now(),
    };
  }

  // Try to find at least one working video from up to 5 samples
  const samplesToCheck = Math.min(5, sampleVideos.length);
  let checkedCount = 0;
  
  for (const video of sampleVideos.slice(0, samplesToCheck)) {
    checkedCount++;
    const videoUrl = extractFirstVideoUrl(video);
    
    if (!videoUrl) {
      console.debug(`Source ${sourceName}: Video ${checkedCount} has no valid URL`);
      continue;
    }

    const isAvailable = await checkVideoUrl(videoUrl);

    if (isAvailable) {
      console.log(`✓ Source ${sourceName} is available (verified with ${videoUrl.substring(0, 50)}...)`);
      return {
        sourceId,
        sourceName,
        isAvailable: true,
        sampleUrl: videoUrl,
        checkedAt: Date.now(),
      };
    } else {
      console.debug(`Source ${sourceName}: Video ${checkedCount}/${samplesToCheck} unavailable`);
    }
  }

  console.warn(`✗ Source ${sourceName} is unavailable (checked ${checkedCount} videos)`);
  return {
    sourceId,
    sourceName,
    isAvailable: false,
    error: `All ${checkedCount} sample videos failed to load`,
    checkedAt: Date.now(),
  };
}

/**
 * Check multiple sources in parallel
 */
export async function checkMultipleSources(
  sourcesWithVideos: Array<{ sourceId: string; sourceName: string; videos: any[] }>
): Promise<SourceCheckResult[]> {
  const checkPromises = sourcesWithVideos.map(({ sourceId, sourceName, videos }) =>
    checkSourceAvailability(sourceId, sourceName, videos)
  );

  return Promise.all(checkPromises);
}

/**
 * Filter search results to only include videos from available sources
 */
export function filterByAvailableSources(
  videos: any[],
  availableSources: SourceCheckResult[]
): any[] {
  const availableSourceIds = new Set(
    availableSources
      .filter(s => s.isAvailable)
      .map(s => s.sourceId)
  );

  return videos.filter(video => availableSourceIds.has(video.source));
}
