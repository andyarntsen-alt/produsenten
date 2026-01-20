
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Groq API Configuration
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Rate limiting configuration per model (Groq has generous limits)
const MODEL_CONFIG = {
    'llama-3.3-70b-versatile': { rpm: 30, rpd: 14400 },
    'llama-3.1-8b-instant': { rpm: 30, rpd: 14400 },
    'mixtral-8x7b-32768': { rpm: 30, rpd: 14400 },
} as const;

// Fallback models in priority order (best first)
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
    messages: ChatMessage[],
    maxRetries: number = 3
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const requestBody = {
                model,
                messages,
                temperature: 0.7,
                max_tokens: 4096
            };
            console.log(`[AI] Request to Groq ${model}:`, { messages: messages.length });

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            // Handle rate limiting with exponential backoff
            if (response.status === 429) {
                const backoffMs = Math.pow(2, attempt) * 1000;
                console.warn(`[AI] Rate limited on ${model}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
                await wait(backoffMs);
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[AI] Error response (${response.status}):`, errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    throw new Error(`Feil fra Groq (${model}): ${response.status} - ${errorText.substring(0, 200)}`);
                }
                throw new Error(errorData.error?.message || `Feil fra Groq (${model}): ${response.status}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;

            if (!text) {
                console.error(`[AI] No text in response:`, data);
                throw new Error(`Ingen svar mottatt fra AI (${model})`);
            }

            logRequest(model);
            console.log(`[AI] Success with Groq ${model}`);
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
        throw new Error('VITE_GROQ_API_KEY mangler i .env');
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
            return await callModelWithRetry(model, messages);
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
            return await callModelWithRetry(model, messages, 1);
        } catch (error) {
            lastError = error as Error;
        }
    }

    throw lastError || new Error('Kunne ikke generere innhold med noen modeller. Prøv igjen om litt.');
}

// CometAPI for Image Generation
const IMAGE_API_KEY = import.meta.env.VITE_COMET_API_KEY;
const IMAGE_API_URL = 'https://api.cometapi.com/v1/images/generations';

export async function generateImage(prompt: string): Promise<string> {
    if (!IMAGE_API_KEY) {
        throw new Error('VITE_COMET_API_KEY mangler i .env');
    }

    try {
        const response = await fetch(IMAGE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${IMAGE_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt,
                model: 'flux-pro', // Using Flux Pro for high quality
                size: '1024x1024',
                n: 1
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI] Image generation error:', errorText);
            throw new Error(`Feil ved bildegenerering: ${response.status}`);
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;

        if (!imageUrl) {
            throw new Error('Ingen bilde-URL mottatt fra API');
        }

        return imageUrl;

    } catch (error) {
        console.error('[AI] Generate image failed:', error);
        // Fallback to Pollinations if API fails
        console.log('[AI] Falling back to Pollinations.ai');
        const seed = Math.floor(Math.random() * 1000);
        // Truncate prompt drastically to 100 chars to ensure URL safety and remove model param
        const safePrompt = prompt.substring(0, 100);
        return `https://pollinations.ai/p/${encodeURIComponent(safePrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
    }
}
