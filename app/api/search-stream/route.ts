/**
 * Streaming Search API Route
 * Returns results progressively as they become available
 */

import { NextRequest } from 'next/server';
import { searchVideos } from '@/lib/api/client';
import { getSourceById } from '@/lib/api/video-sources';
import { checkVideoAvailability } from '@/lib/utils/source-checker';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { query, sources: sourceIds, page = 1 } = body;

        // Validate input
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Invalid query' })}\n\n`));
          controller.close();
          return;
        }

        // Get source configurations
        const sources = sourceIds
          .map((id: string) => getSourceById(id))
          .filter((source: any): source is NonNullable<typeof source> => source !== undefined);

        if (sources.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'No valid sources' })}\n\n`));
          controller.close();
          return;
        }

        // Send progress: searching sources
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress', 
          stage: 'searching',
          checkedSources: 0,
          totalSources: sourceIds.length
        })}\n\n`));

        // Perform search with progress tracking for each source
        let checkedSourcesCount = 0;
        const searchResults = await Promise.all(
          sources.map(async (source: any) => {
            try {
              const result = await searchVideos(query.trim(), [source], page);
              checkedSourcesCount++;
              
              // Send progress update after each source completes
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'progress', 
                stage: 'searching',
                checkedSources: checkedSourcesCount,
                totalSources: sourceIds.length
              })}\n\n`));
              
              return result[0];
            } catch (error) {
              checkedSourcesCount++;
              
              // Still send progress even on error
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'progress', 
                stage: 'searching',
                checkedSources: checkedSourcesCount,
                totalSources: sourceIds.length
              })}\n\n`));
              
              return {
                results: [],
                source: source.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );

        // Get all videos from all sources
        const allVideos = searchResults.flatMap(r => r.results);
        
        if (allVideos.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete',
            totalResults: 0
          })}\n\n`));
          controller.close();
          return;
        }

        // Send progress: start checking videos
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress', 
          stage: 'checking',
          checkedVideos: 0,
          totalVideos: allVideos.length
        })}\n\n`));

        const availableVideos: any[] = [];
        let checkedCount = 0;
        const concurrency = 10; // Check 10 videos at a time

        // Process videos in batches for immediate feedback
        for (let i = 0; i < allVideos.length; i += concurrency) {
          const batch = allVideos.slice(i, i + concurrency);
          
          const results = await Promise.all(
            batch.map(async (video) => {
              const isAvailable = await checkVideoAvailability(video);
              return isAvailable ? video : null;
            })
          );

          // Add available videos
          const newAvailableVideos = results.filter(v => v !== null);
          availableVideos.push(...newAvailableVideos);
          
          checkedCount += batch.length;

          // ALWAYS send update after each batch (even if no new videos)
          if (newAvailableVideos.length > 0) {
            // Send new videos immediately
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'videos',
              videos: newAvailableVideos,
              checkedVideos: checkedCount,
              totalVideos: allVideos.length,
              availableCount: availableVideos.length
            })}\n\n`));
          }
          
          // Always send progress update
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'progress',
            stage: 'checking',
            checkedVideos: checkedCount,
            totalVideos: allVideos.length,
            availableCount: availableVideos.length
          })}\n\n`));
        }

        // Send completion
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'complete',
          totalResults: availableVideos.length,
          checkedVideos: allVideos.length,
          totalVideos: allVideos.length
        })}\n\n`));

        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
