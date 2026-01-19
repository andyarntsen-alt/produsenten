const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(__dirname, '.env');
let apiKey = null;

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/VITE_AIML_API_KEY=(.*)/);
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
        const response = await fetch('https://api.aimlapi.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();

        if (data.data) {
            console.log("Available AIML API Models:");
            data.data.forEach(m => {
                console.log(`- ${m.id}`);
            });
        } else {
            console.log("No models found:", data);
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();
