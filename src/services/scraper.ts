
/**
 * Helper to fetch website content, handling CORS via proxy if needed.
 * Returns plain text content stripped of HTML, scripts, and styles.
 */
export async function fetchWebsite(url: string): Promise<string> {
    // Ensure URL has protocol
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try {
        let res;
        try {
            // Try direct fetch first
            res = await fetch(url);
        } catch (e) {
            console.log('Direct fetch failed, trying proxy...');
            // Fallback to CORS proxy
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
            res = await fetch(proxyUrl);
        }

        if (!res.ok) throw new Error(`Failed to fetch website content: ${res.status}`);

        const html = await res.text();

        // Strip script and style content
        const clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

        // Strip all HTML tags
        let text = clean.replace(/<[^>]+>/g, ' ');

        // Decode common HTML entities
        text = text.replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');

        // Collapse whitespace
        return text.replace(/\s+/g, ' ').trim().substring(0, 15000); // Limit length

    } catch (error) {
        console.error('Scraper error:', error);
        throw error;
    }
}
