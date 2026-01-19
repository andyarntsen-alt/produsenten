
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function callAI(messages: ChatMessage[]): Promise<string> {
    if (!API_KEY) {
        throw new Error('VITE_GEMINI_API_KEY mangler i .env');
    }

    // Convert OpenAI-style messages to Gemini format
    // System messages are not directly supported in the same way in the standard generateContent call 
    // without using the beta systemInstruction, or we can just prepend it to the first user message.
    // For simplicity and compatibility, we'll prepend system messages.

    let systemContext = '';
    const contents = [];

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

    // Fallback if no user message was found but system message exists (edge case)
    if (contents.length === 0 && systemContext) {
        contents.push({ role: 'user', parts: [{ text: systemContext }] });
    }

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: Error | null = null;

    for (const model of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Feil fra Gemini API (${model})`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error(`Ingen svar mottatt fra AI (${model})`);
            }

            return text.trim();
        } catch (error) {
            console.warn(`Model ${model} failed:`, error);
            lastError = error as Error;
            // Continue to next model
        }
    }

    throw lastError || new Error('Kunne ikke generere innhold med noen modeller.');
}
