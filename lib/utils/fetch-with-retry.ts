import { NextRequest } from 'next/server';

interface FetchWithRetryOptions {
    url: string;
    request: NextRequest;
    headers?: Record<string, string>;
}

export async function fetchWithRetry({ url, request, headers = {} }: FetchWithRetryOptions): Promise<Response> {
    // User-Agent rotation for better compatibility
    const userAgents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Smart Referer: use provided or default to origin
    const referer = request.nextUrl.searchParams.get('referer') || new URL(url).origin;

    // Optional IP forwarding (default: Beijing IP)
    const forwardedIP = request.nextUrl.searchParams.get('ip') || '202.108.22.5';

    const MAX_RETRIES = 5;
    const TIMEOUT_MS = 30000; // 30 seconds
    let lastError: unknown = null;
    let response: Response | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
            const backoffDelay = attempt > 1 ? Math.pow(2, attempt - 2) * 100 : 0;
            if (backoffDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

            response = await fetch(url, {
                headers: {
                    'User-Agent': randomUA,
                    'X-Forwarded-For': forwardedIP,
                    'Client-IP': forwardedIP,
                    'Referer': referer,
                    ...headers, // Merge custom headers (Cookie, Accept, etc.)
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                console.log(`✓ Proxy success on attempt ${attempt}: ${url.substring(0, 100)}...`);
                break;
            }

            if (response.status === 503 && attempt < MAX_RETRIES) {
                console.warn(`⚠ Got 503 on attempt ${attempt}, retrying with backoff ${backoffDelay}ms...`);
                lastError = `503 on attempt ${attempt}`;
                continue;
            }

            console.warn(`✗ Got ${response.status} on attempt ${attempt}`);
            break;
        } catch (fetchError) {
            lastError = fetchError;
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.warn(`⚠ Timeout on attempt ${attempt}, retrying...`);
            } else if (attempt < MAX_RETRIES) {
                console.warn(`⚠ Fetch error on attempt ${attempt}, retrying...`, fetchError);
            } else {
                throw fetchError;
            }
        }
    }

    if (!response || !response.ok) {
        throw new Error(`Failed after ${MAX_RETRIES} attempts: ${response?.status || lastError}`);
    }

    return response;
}
