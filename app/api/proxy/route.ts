import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Beijing IP address to simulate request from China
        const chinaIP = '202.108.22.5';

        // Retry logic for unstable video sources
        const MAX_RETRIES = 5;
        let lastError = null;
        let response = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'X-Forwarded-For': chinaIP,
                        'Client-IP': chinaIP,
                        'Referer': new URL(url).origin,
                    },
                });

                // If successful (200-299), break out of retry loop
                if (response.ok) {
                    console.log(`✓ Proxy success on attempt ${attempt}: ${url}`);
                    break;
                }

                // If 503, retry after a short delay
                if (response.status === 503 && attempt < MAX_RETRIES) {
                    console.warn(`⚠ Got 503 on attempt ${attempt}, retrying... (${url})`);
                    lastError = `503 on attempt ${attempt}`;
                    // Wait 100ms before retry
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }

                // For other errors (403, 404, etc), don't retry
                console.warn(`✗ Got ${response.status} on attempt ${attempt}: ${url}`);
                break;

            } catch (fetchError) {
                lastError = fetchError;
                if (attempt < MAX_RETRIES) {
                    console.warn(`⚠ Fetch error on attempt ${attempt}, retrying...`, fetchError);
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    throw fetchError;
                }
            }
        }

        if (!response || !response.ok) {
            throw new Error(`Failed after ${MAX_RETRIES} attempts: ${response?.status || lastError}`);
        }

        const contentType = response.headers.get('Content-Type');

        // Handle m3u8 playlists: rewrite URLs to go through proxy
        if (contentType && (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegurl') || url.endsWith('.m3u8'))) {
            const text = await response.text();
            const baseUrl = new URL(url);

            const modifiedText = text.split('\n').map(line => {
                // Skip comments and empty lines
                if (line.trim().startsWith('#') || !line.trim()) {
                    return line;
                }

                // Resolve relative URLs
                try {
                    const absoluteUrl = new URL(line.trim(), baseUrl).toString();
                    // Wrap in proxy
                    return `${request.nextUrl.origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                } catch (e) {
                    return line;
                }
            }).join('\n');

            return new NextResponse(modifiedText, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        // For non-m3u8 content (segments, mp4, etc.), stream directly
        const headers = new Headers();
        
        // Copy headers but exclude problematic ones
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (
                lowerKey !== 'content-encoding' && 
                lowerKey !== 'content-length' && 
                lowerKey !== 'transfer-encoding'
            ) {
                headers.set(key, value);
            }
        });

        // Add CORS headers to allow playback
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Proxy request failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                url: url
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
