
export async function processM3u8Content(
    content: string,
    baseUrl: string,
    origin: string
): Promise<string> {
    const lines = content.split('\n');
    const base = new URL(baseUrl);

    const processedLines = lines.map(line => {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.trim()) {
            return line;
        }

        // Resolve relative URLs
        try {
            const absoluteUrl = new URL(line.trim(), base).toString();
            // Wrap in proxy
            return `${origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        } catch {
            return line;
        }
    });

    return processedLines.join('\n');
}
