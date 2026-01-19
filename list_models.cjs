const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(__dirname, '.env');
let apiKey = null;

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;
} catch (e) {
    console.error("Could not read .env file");
}

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

// Function to fetch using native fetch (Node 18+)
async function listModels() {
    console.log("Fetching models...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log("Available Gemini Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini') && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found:", data);
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();
