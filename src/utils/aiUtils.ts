// AI Utilities - Helper functions for AI response parsing and handling

/**
 * Parse AI response as JSON object with fallback
 * Handles markdown code blocks and extracts JSON from mixed text
 */
export function parseAIJSON<T>(result: string, fallback: T): T {
    try {
        // Try to find JSON object in the response
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
        // If no match, try parsing the whole thing
        return JSON.parse(result);
    } catch {
        console.warn('Failed to parse AI JSON response, using fallback');
        return fallback;
    }
}

/**
 * Parse AI response as JSON array with fallback
 * Handles markdown code blocks and extracts array from mixed text
 */
export function parseAIArray<T>(result: string, fallback: T[]): T[] {
    try {
        // Try to find JSON array in the response
        const match = result.match(/\[[\s\S]*\]/);
        if (match) {
            return JSON.parse(match[0]);
        }
        // If no match, try parsing the whole thing
        return JSON.parse(result);
    } catch {
        console.warn('Failed to parse AI array response, using fallback');
        return fallback;
    }
}

/**
 * Clean AI response - remove common AI prefixes/suffixes
 */
export function cleanAIResponse(text: string): string {
    return text
        .replace(/^(Here's|Here is|Sure!|Absolutely!|Of course!)\s*/i, '')
        .replace(/\n+(Let me know|Hope this helps|Good luck).*$/i, '')
        .trim();
}

/**
 * Extract first line as hook from a post
 */
export function extractHook(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    return lines[0] || text.slice(0, 100);
}

/**
 * Determine post format type from content
 */
export function detectFormatType(text: string): string {
    const lower = text.toLowerCase();

    if (text.includes('?') && text.split('?').length > 2) return 'question';
    if (/^\d+[.)]\s/.test(text) || text.includes('\n1.')) return 'list';
    if (/^(unpopular|hot take|controversial|upopulær)/i.test(text)) return 'contrarian';
    if (/^(jeg |i )(lærte|fant|oppdaget|gjorde)/i.test(lower)) return 'miniStory';
    if (/(tips?|hack|trick|råd)/i.test(lower)) return 'tip';
    if (text.length > 500) return 'long-form';

    return 'other';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3).trim() + '...';
}
