/**
 * Client-Side Video Validator
 * Tests actual video playback in the browser to catch MediaErrors
 * This runs on the client and detects issues that server-side checks miss
 */

const TEST_TIMEOUT = 8000; // 8 seconds for video element testing

export interface VideoTestResult {
  url: string;
  canPlay: boolean;
  error?: string;
  errorCode?: number;
}

/**
 * Test if a video URL can actually be played in the browser
 * This catches MediaErrors that server-side validation misses
 */
export async function testVideoPlayback(url: string): Promise<VideoTestResult> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    let resolved = false;
    
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        video.src = '';
        video.load();
        video.remove();
      }
    };
    
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        url,
        canPlay: false,
        error: 'Video loading timeout',
      });
    }, TEST_TIMEOUT);
    
    // Handle video errors (MediaError)
    video.addEventListener('error', () => {
      clearTimeout(timeoutId);
      
      let errorMessage = 'Unknown playback error';
      let errorCode = 0;
      
      if (video.error) {
        errorCode = video.error.code;
        
        switch (video.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Video loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error occurred while loading video';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Video format is not supported or corrupted';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video source not supported or unavailable';
            break;
          default:
            errorMessage = video.error.message || 'Unknown error';
        }
      }
      
      cleanup();
      resolve({
        url,
        canPlay: false,
        error: errorMessage,
        errorCode,
      });
    }, { once: true });
    
    // Handle successful loading
    video.addEventListener('loadedmetadata', () => {
      clearTimeout(timeoutId);
      cleanup();
      resolve({
        url,
        canPlay: true,
      });
    }, { once: true });
    
    // Also accept if video can play
    video.addEventListener('canplay', () => {
      if (!resolved) {
        clearTimeout(timeoutId);
        cleanup();
        resolve({
          url,
          canPlay: true,
        });
      }
    }, { once: true });
    
    // Configure video element
    video.muted = true;
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    video.src = url;
    video.load();
  });
}

/**
 * Test multiple video URLs in parallel (with concurrency limit)
 */
export async function testMultipleVideos(
  urls: string[],
  concurrency: number = 3
): Promise<VideoTestResult[]> {
  const results: VideoTestResult[] = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(url => testVideoPlayback(url))
    );
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Test and filter episodes to only include playable ones
 */
export async function filterPlayableEpisodes<T extends { url: string }>(
  episodes: T[],
  maxSamplesToTest: number = 5
): Promise<T[]> {
  if (episodes.length === 0) return [];
  
  // Test up to maxSamplesToTest episodes
  const samplesToTest = episodes.slice(0, Math.min(maxSamplesToTest, episodes.length));
  const testResults = await testMultipleVideos(samplesToTest.map(ep => ep.url), 3);
  
  // Count successful tests
  const successfulTests = testResults.filter(r => r.canPlay).length;
  
  // If less than 20% work, mark entire source as broken
  if (successfulTests === 0 || (successfulTests / samplesToTest.length) < 0.2) {
    console.warn(`Client-side validation: Only ${successfulTests}/${samplesToTest.length} episodes playable`);
    return []; // Return empty to indicate source is broken
  }
  
  // If enough samples work, return all episodes (assume they work)
  console.log(`✓ Client-side validation passed: ${successfulTests}/${samplesToTest.length} episodes playable`);
  return episodes;
}
