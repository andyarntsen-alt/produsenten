
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Rate limiting configuration per model
const MODEL_CONFIG = {
    'gemini-2.5-flash': { rpm: 5, rpd: 20 },
    'gemini-2.5-flash-lite': { rpm: 10, rpd: 20 },
    'gemini-3-flash': { rpm: 5, rpd: 250000 },
} as const;

// Fallback models in priority order (based on available quota)
const MODELS = Object.keys(MODEL_CONFIG) as (keyof typeof MODEL_CONFIG)[];

// In-memory request tracking
const requestLog: { model: string; timestamp: number }[] = [];

// Clean old requests from log (older than 1 minute)
function cleanRequestLog(): void {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    while (requestLog.length > 0 && requestLog[0].timestamp < oneMinuteAgo) {
        requestLog.shift();
    }
}

// Check if we can make a request to a model
function canMakeRequest(model: keyof typeof MODEL_CONFIG): boolean {
    cleanRequestLog();
    const config = MODEL_CONFIG[model];
    const recentRequests = requestLog.filter(r => r.model === model).length;
    return recentRequests < config.rpm;
}

// Log a request
function logRequest(model: string): void {
    requestLog.push({ model, timestamp: Date.now() });
}

// Wait with exponential backoff
async function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Make a single API call with retries for rate limiting
async function callModelWithRetry(
    model: string,
    contents: { role: string; parts: { text: string }[] }[],
    maxRetries: number = 3
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: { temperature: 0.7 }
                    })
                }
            );

            // Handle rate limiting with exponential backoff
            if (response.status === 429) {
                const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                console.warn(`[AI] Rate limited on ${model}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
                await wait(backoffMs);
                continue;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Feil fra Gemini API (${model})`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error(`Ingen svar mottatt fra AI (${model})`);
            }

            logRequest(model);
            console.log(`[AI] Success with ${model}`);
            return text.trim();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries - 1) {
                const backoffMs = Math.pow(2, attempt) * 1000;
                console.warn(`[AI] Error on ${model}, retrying in ${backoffMs}ms:`, error);
                await wait(backoffMs);
            }
        }
    }

    throw lastError || new Error(`Kunne ikke nå ${model} etter ${maxRetries} forsøk`);
}

export async function callAI(messages: ChatMessage[]): Promise<string> {
    if (!API_KEY) {
        throw new Error('VITE_GEMINI_API_KEY mangler i .env');
    }

    // Convert messages to Gemini format
    let systemContext = '';
    const contents: { role: string; parts: { text: string }[] }[] = [];

    for (const msg of messages) {
        if (msg.role === 'system') {
            systemContext += msg.content + '\n';
        } else {
            let text = msg.content;
            if (contents.length === 0 && systemContext) {
                text = systemContext + '\n' + text;
            }
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text }]
            });
        }
    }

    if (contents.length === 0 && systemContext) {
        contents.push({ role: 'user', parts: [{ text: systemContext }] });
    }

    // Try each model with rate limit awareness
    let lastError: Error | null = null;

    for (const model of MODELS) {
        // Check rate limit before trying
        if (!canMakeRequest(model)) {
            console.log(`[AI] Skipping ${model} - rate limit reached, trying next model`);
            continue;
        }

        try {
            return await callModelWithRetry(model, contents);
        } catch (error) {
            console.warn(`[AI] Model ${model} failed:`, error);
            lastError = error as Error;
            // Continue to next model
        }
    }

    // If all models are rate limited, wait and try the first available
    console.log('[AI] All models exhausted, waiting for rate limit reset...');
    await wait(5000);

    for (const model of MODELS) {
        try {
            return await callModelWithRetry(model, contents, 1);
        } catch (error) {
            lastError = error as Error;
        }
    }

    throw lastError || new Error('Kunne ikke generere innhold med noen modeller. Prøv igjen om litt.');
}
