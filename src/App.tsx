import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import AboutPage from './components/AboutPage';
import PricingPage from './components/PricingPage';
import ContactPage from './components/ContactPage';
import CookieBanner from './components/CookieBanner';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import ToolsHub from './components/ToolsHub';
import { callAI } from './services/ai';
import { useToast } from './components/ToastContext';
import { ARCHETYPES, buildSystemPrompt, getDefaultPersona } from './services/personaSystem';
import { getAlgorithmPrompt } from './services/algorithmGuide';
import { useSettings } from './context/SettingsContext';
import { buildLanguagePromptSection } from './services/languagePrompts';
import type { PersonaKernel } from './services/personaSystem';

// Vibe presets based on ARCHETYPES from persona system
const vibePresets = Object.entries(ARCHETYPES).map(([key, config]) => ({
  label: config.label,
  key: key as PersonaKernel['archetype'],
  emoji: config.emoji,
  description: config.description,
  toneRules: config.toneRules
}));

// Data types
// Data types
export interface BrandBrief {
  productSummary: string;
  idealCustomer: string;
  valueProps: string[];
  differentiators: string[];
  toneRules: string[];
  contentAngles: string[];
  hooks: string[];
  ctaPhrases: string[];
  // Nye felter for dypere innsikt
  audiencePainPoints?: string[];
  audienceObjections?: string[];
  brandPersonality?: string;
  uniqueStories?: string[];
  controversialTakes?: string[];
}

export interface Tweet {
  text: string;
  hook: string;
  formatType: 'question' | 'contrarian' | 'miniStory' | 'tip' | 'list' | 'opinion' | 'case' | 'mythBuster' | 'long-form' | 'other';
  mediaIdea?: string;
  imagePrompt?: string; // AI-generated prompt for image generation
  status: 'draft' | 'edited' | 'approved' | 'scheduled';
  date?: string;
  metrics?: { likes: number; replies: number; impressions: number };
  linkedInPost?: string;
  thread?: Tweet[]; // Recursive structure for threads
  imageUrl?: string;
}

export interface Brand {
  id: string;
  name: string;
  url: string;
  vibe: string;
  industry?: string;
  offer?: string;
  targetAudience?: string;
  postingFrequency?: number; // tweets per week
  goals?: string;

  // Persona Kernel (for AI personality)
  personaKernel?: {
    coreBelief?: string;
    voiceSignature?: string;
  };

  // AI Generated Data
  brandBrief?: BrandBrief;
  analysisResult?: string; // keeping for backward compat or raw text
  strategyResult?: string; // keeping for backward compat
  contentPillars?: string[];
  ctaList?: string[];

  posts: Tweet[];
  prevPosts?: Tweet[];
}

// Helper: Remove HTML tags and scripts/styles, return plain text content
async function fetchWebsite(url: string): Promise<string> {
  // Ensure URL has protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  // Note: Fetching external websites from the browser often fails due to CORS.
  // In a production app, this should be done via a backend proxy.
  // For this demo, we'll try fetch, but if it fails (likely), we might mock it or assume the user inputs text.
  // Ideally, use a proxy or server function.
  try {
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      // Direct fetch failed (CORS), try proxy
      console.log('Direct fetch failed, trying proxy...');
      const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
      res = await fetch(proxyUrl);
    }

    if (!res.ok) throw new Error('Failed to fetch website content');
    const html = await res.text();
    // Strip script and style content
    const clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // Strip all HTML tags
    let text = clean.replace(/<[^>]+>/g, ' ');
    // Decode common HTML entities
    const entities: { [key: string]: string } = {
      'nbsp': ' ', 'amp': '&', 'quot': '"', 'lt': '<', 'gt': '>', 'apos': '\'',
      'aring': 'å', 'aelig': 'æ', 'oslash': 'ø',
      'Aring': 'Å', 'Aelig': 'Æ', 'Oslash': 'Ø'
    };
    text = text.replace(/&([^;\s]+);/g, (_, entity) => (entities[entity] || ' '));
    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Truncate to avoid extremely long texts
    if (text.length > 5000) {
      text = text.substring(0, 5000);
    }
    return text;
  } catch (e) {
    console.warn("CORS/Fetch error, returning summary based on url", e);
    return `Kunne ikke hente innhold direkte (CORS). Anta innhold basert på URL: ${url}`;
  }
}

// Chat message type for AI prompts
interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }

// Helper to create persona-aware system message with language support
function createPersonaSystemMessage(
  brandName: string,
  vibe: string,
  coreBelief?: string,
  voiceSignature?: string,
  format: 'kort' | 'lang' | 'mixed' = 'mixed',
  language: 'no' | 'en' = 'no'
): ChatMessage {
  const persona = getDefaultPersona(brandName, vibe);
  if (coreBelief) persona.coreBelief = coreBelief;
  if (voiceSignature) persona.voiceSignature = voiceSignature;

  return {
    role: 'system',
    content: buildSystemPrompt({ persona, platform: 'twitter', format, language })
  };
}



// Type for API response tweets
interface AITweetResponse {
  text: string;
  hook?: string;
  formatType?: string;
  mediaIdea?: string;
  imagePrompt?: string;
}

// Parse AI output of multiple tweets into an array of tweet texts
function parseTweets(text: string): string[] {
  // Split by blank lines or line breaks
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p);
  let tweets: string[] = [];
  if (paragraphs.length > 1) {
    tweets = paragraphs;
  } else {
    // If no double newlines, split by line
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    for (let l of lines) {
      // Remove any leading numbering or bullet
      l = l.replace(/^(\d+[.)]\s*|-|\*)\s*/, '').trim();
      // Remove wrapping quotes if any
      l = l.replace(/^["“]|["”]$/g, '');
      if (l) tweets.push(l);
    }
  }
  // Final cleanup of tweet texts
  tweets = tweets.map(t => t.trim()).filter(t => t);
  return tweets;
}

function App() {
  const { showToast, showConfirm } = useToast();
  const { settings } = useSettings();
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('brands');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null);
  const [mode, setMode] = useState<'landing' | 'onboarding' | 'dashboard' | 'loading' | 'workspace' | 'about' | 'pricing' | 'contact' | 'settings' | 'login' | 'tools'>('landing');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('isAuthenticated'));
  const [genMessage, setGenMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    { label: "Analyserer nettside", icon: "🔍", description: "Leser innhold fra nettsiden din..." },
    { label: "Bygger Brand Brief", icon: "📋", description: "Identifiserer USP, målgruppe og tone..." },
    { label: "Utvikler strategi", icon: "🧠", description: "Lager innholdspillars og plan..." },
    { label: "Skriver innhold", icon: "✍️", description: "Genererer unike poster med variasjon..." },
    { label: "Kvalitetssjekk", icon: "✅", description: "Sjekker og planlegger innhold..." }
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('brands');
      if (stored) {
        setBrands(JSON.parse(stored));
      }
    } catch { console.warn('Failed to load brands'); }
  }, []);

  useEffect(() => {
    if (brands.length > 0) localStorage.setItem('brands', JSON.stringify(brands));
  }, [brands]);

  const handleCreateBrand = async (
    name: string,
    url: string,
    vibe: string,
    industry?: string,
    offer?: string,
    target?: string,
    goals?: string,
    frequency: number = 5,
    coreBelief?: string,
    voiceSignature?: string
  ) => {
    setLoadingStep(0);
    setGenMessage('Trinn 1/5: Forsker på merkevaren din...');
    setMode('loading');

    try {
      // 1. Research & Analysis
      let siteText = '';
      try {
        siteText = await fetchWebsite(url);
        if (siteText.includes('Kunne ikke hente')) {
          const userContent = prompt('Vi klarte ikke lese nettsiden automatisk (pga sikkerhet). Lim inn litt tekst om bedriften her (eller trykk OK for å la AI gjette basert på URL):');
          if (userContent) siteText += `\n\nBrukerinfo: ${userContent}`;
        }
      } catch (e) {
        console.warn("Fetch fail", e);
      }

      setLoadingStep(1);
      setGenMessage('Trinn 2/5: Bygger Brand Brief...');

      const researchPrompt = `Analyzér følgende tekst fra ${name} (${url}) og lag en DYPTGÅENDE "Brand Brief".

      ANALYSER GRUNDIG og inkluder:

      GRUNNLEGGENDE:
      - Kort produktoppsummering (hva de selger/gjør)
      - Ideell kundeprofil (ICP) - hvem er drømmekunden?
      - 3-5 unike verdiforslag (USP)
      - Hva som skiller dem fra konkurrenter

      TONE & STIL:
      - Do's and Don'ts for tone-of-voice
      - 5 varierte innholdsvinkler (content angles)
      - 5 effektive hooks som passer brandet
      - 5 call-to-action (CTA) fraser

      DYPERE INNSIKT (VIKTIG for variert innhold):
      - 3-5 smertepunkter målgruppen har (audiencePainPoints)
      - 3-5 vanlige innvendinger/tvil kunder har (audienceObjections)
      - 3 adjektiver som beskriver brandets personlighet (brandPersonality)
      - 3-5 unike historier brandet kan fortelle (uniqueStories)
      - 2-3 kontroversielle/modige meninger brandet kan ha (controversialTakes)

      Returner KUN gyldig JSON:
      {
        "productSummary": "...",
        "idealCustomer": "...",
        "valueProps": ["..."],
        "differentiators": ["..."],
        "toneRules": ["..."],
        "contentAngles": ["..."],
        "hooks": ["..."],
        "ctaPhrases": ["..."],
        "audiencePainPoints": ["Smertepunkt 1", "Smertepunkt 2"],
        "audienceObjections": ["Innvending 1", "Innvending 2"],
        "brandPersonality": "adjektiv1, adjektiv2, adjektiv3",
        "uniqueStories": ["Historie 1", "Historie 2"],
        "controversialTakes": ["Modig mening 1", "Modig mening 2"]
      }

      Tekst å analysere: """${siteText}"""`;

      const researchJsonStr = await callAI([createPersonaSystemMessage(name, vibe, undefined, undefined, 'mixed', settings.language), { role: 'user', content: researchPrompt }]);
      let brandBrief: BrandBrief;
      try {
        // Attempt to find JSON if wrapped in markdown
        const match = researchJsonStr.match(/\{[\s\S]*\}/);
        brandBrief = JSON.parse(match ? match[0] : researchJsonStr);
      } catch (e) {
        console.error("JSON parse error (research):", e);
        // Fallback minimalist brief
        brandBrief = {
          productSummary: "Kunne ikke analysere automatisk.",
          idealCustomer: target || "Ukjent",
          valueProps: [],
          differentiators: [],
          toneRules: [],
          contentAngles: [],
          hooks: [],
          ctaPhrases: ["Bestill nå", "Les mer"]
        };
      }

      setLoadingStep(2);
      setGenMessage('Trinn 3/5: Utvikler innholdsstrategi...');

      // 2. Strategy
      const vibeDesc = vibePresets.find(v => v.label === vibe)?.description || vibe;
      const strategyPrompt = `Som en ekspert innholdsstrateg, lag en DETALJERT strategi basert på:

      Brand Brief: ${JSON.stringify(brandBrief)}
      Mål: ${goals || 'Vekst'}
      Frekvens: ${frequency} poster/uke
      Tone: ${vibeDesc}
      Bransje: ${industry || 'Generell'}

      Lag 4 unike CONTENT PILLARS (temaer) med spesifikke vinkler for hvert tema.
      Hver pillar skal ha:
      - Et tydelig navn
      - 3 konkrete vinkler/innfallsvinkler
      - 2 eksempel-hooks

      Returner KUN gyldig JSON:
      {
        "contentPillars": [
          {
            "name": "Pillar-navn",
            "angles": ["Vinkel 1", "Vinkel 2", "Vinkel 3"],
            "exampleHooks": ["Hook 1", "Hook 2"]
          }
        ],
        "contentMix": {
          "educational": 30,
          "storytelling": 30,
          "engagement": 25,
          "promotional": 15
        },
        "strategySummary": "Kort oppsummering..."
      }`;

      const strategyJsonStr = await callAI([createPersonaSystemMessage(name, vibe, undefined, undefined, 'mixed', settings.language), { role: 'user', content: strategyPrompt }]);
      let detailedPillars: Array<{name: string; angles: string[]; exampleHooks: string[]}> = [];
      let contentPillars: string[] = [];
      let strategySummary = "";
      try {
        const match = strategyJsonStr.match(/\{[\s\S]*\}/);
        const strategyData = JSON.parse(match ? match[0] : strategyJsonStr);
        // Handle both old format (string[]) and new format (object[])
        const rawPillars = strategyData.contentPillars || [];
        if (rawPillars.length > 0 && typeof rawPillars[0] === 'object') {
          detailedPillars = rawPillars;
          contentPillars = rawPillars.map((p: {name: string}) => p.name);
        } else {
          contentPillars = rawPillars;
        }
        strategySummary = strategyData.strategySummary || "";
      } catch {
        contentPillars = ["Product Info", "Industry News", "Tips & Tricks", "Community"];
      }

      setLoadingStep(3);
      setGenMessage('Trinn 4/5: Skriver innhold...');

      // 3. Content Generation
      const tweetsToGenerate = frequency * 4; // 1 month rough estimate needed, let's generate 4 weeks worth but limit to max 12 for MVP speed
      const tweetCount = Math.min(tweetsToGenerate, 12);

      // Build pillar info string for prompt
      const isEnglish = settings.language === 'en';
      const pillarInfo = detailedPillars.length > 0
        ? detailedPillars.map(p => `• ${p.name}: ${isEnglish ? 'Angles' : 'Vinkler'}: ${p.angles.join(', ')}. Hooks: ${p.exampleHooks.join(', ')}`).join('\n      ')
        : contentPillars.join(', ');

      // Get language instructions
      const languageSection = buildLanguagePromptSection(settings.language);

      const contentPrompt = isEnglish
        ? `You are a professional copywriter for X (Twitter) and LinkedIn.
      Create ${tweetCount} posts for ${name}.

      ${languageSection}

      Brand Brief: ${JSON.stringify(brandBrief)}

      CONTENT PILLARS (use these actively!):
      ${pillarInfo}

      Tone: ${vibeDesc} (IMPORTANT: Don't use "AI-speak", be human/agency-style).

      ${getAlgorithmPrompt(settings.language)}

      ⚠️ CRITICAL LENGTH REQUIREMENTS (MUST BE FOLLOWED EXACTLY):

      POST 1-3: LONG POSTS (MINIMUM 800 characters each, preferably 1000+)
      - Real essays/deep dives with multiple paragraphs
      - Tell a story, share an experience, go deep
      - Use pain points, stories or controversial takes from the brief

      POST 4-7: MEDIUM POSTS (300-500 characters)
      - Hook + main point + elaboration + CTA

      POST 8-${tweetCount}: SHORT POSTS (under 200 characters)
      - Punchy one-liners, questions, hot takes

      UNIQUENESS & VARIATION:
      • EACH post must have unique angle - no repetition!
      • Distribute posts evenly across pillars
      • Vary: questions, statements, stories, tips, lists, case studies
      • Use pain points and objections from brand brief

      🖼️ IMAGE PROMPT FOR EACH POST:
      For each post, include an "imagePrompt" - a short English prompt (max 100 chars) for AI image generation.
      Style: Clean, modern, minimalist. Good for social media.
      Examples: "Person working on laptop, soft lighting, modern office", "Abstract success graph, blue tones, professional"

      Return ONLY a JSON object:
      {
        "tweets": [
          {
            "hook": "First line",
            "text": "Full text (LONG for post 1-3!)...",
            "formatType": "deep-dive",
            "lengthCategory": "long",
            "pillar": "Pillar-name",
            "imagePrompt": "Short English prompt for image, max 100 chars"
          }
        ]
      }`
        : `Du er en profesjonell tekstforfatter for X (Twitter) og LinkedIn.
      Lag ${tweetCount} innlegg for ${name}.

      ${languageSection}

      Brand Brief: ${JSON.stringify(brandBrief)}

      CONTENT PILLARS (bruk disse aktivt!):
      ${pillarInfo}

      Tone: ${vibeDesc} (VIKTIG: Ikke bruk "AI-språk", vær menneskelig/agency-style).

      ${getAlgorithmPrompt(settings.language)}

      ⚠️ KRITISK LENGDE-KRAV (MÅ FØLGES NØYAKTIG):

      POST 1-3: LANGE POSTER (MINST 800 tegn hver, helst 1000+)
      - Ordentlige essays/deep dives med flere avsnitt
      - Fortell en historie, del en erfaring, gå i dybden
      - Bruk smertepunkter, historier eller kontroversielle takes fra briefen

      POST 4-7: MEDIUM POSTER (300-500 tegn)
      - Hook + hovedpoeng + utdypning + CTA

      POST 8-${tweetCount}: KORTE POSTER (under 200 tegn)
      - Punchy one-liners, spørsmål, hot takes

      UNIKHET & VARIASJON:
      • HVER post må ha unik vinkling - ingen repetisjon!
      • Fordel postene jevnt på tvers av pillars
      • Varier: spørsmål, påstand, story, tips, liste, case study
      • Bruk smertepunkter og innvendinger fra brand brief

      🖼️ BILDE-PROMPT FOR HVER POST:
      For hver post, inkluder en "imagePrompt" - en kort ENGELSK prompt (maks 100 tegn) for AI-bildegenerering.
      Stil: Rent, moderne, minimalistisk. Passer for sosiale medier.
      Eksempler: "Person working on laptop, soft lighting, modern office", "Abstract success graph, blue tones, professional"

      Returner KUN et JSON objekt:
      {
        "tweets": [
          {
            "hook": "Første linje",
            "text": "Hele teksten (LANG for post 1-3!)...",
            "formatType": "deep-dive",
            "lengthCategory": "lang",
            "pillar": "Pillar-navn",
            "imagePrompt": "Kort ENGELSK prompt for bilde, maks 100 tegn"
          }
        ]
      }`;

      const contentJsonStr = await callAI([createPersonaSystemMessage(name, vibe, undefined, undefined, 'mixed', settings.language), { role: 'user', content: contentPrompt }]);
      let newTweets: Tweet[] = [];
      try {
        // Clean up common AI response issues
        let cleanedJson = contentJsonStr
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();

        // Find the JSON object
        const match = cleanedJson.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON object found');

        // Fix common JSON issues: trailing commas, unescaped newlines in strings
        let jsonStr = match[0]
          .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
          .replace(/\n\s*\n/g, '\\n'); // Replace literal newlines in strings

        const contentData = JSON.parse(jsonStr) as { tweets: AITweetResponse[] };
        newTweets = contentData.tweets.map((t: AITweetResponse) => ({
          text: t.text,
          hook: t.hook || t.text.split('\n')[0],
          formatType: (t.formatType as Tweet['formatType']) || 'other',
          mediaIdea: t.mediaIdea,
          imagePrompt: t.imagePrompt,
          status: 'draft' as const
        }));
      } catch (e) {
        console.error("JSON parse error (content):", e);
        // Fallback parsing if JSON fails (rare with modern models but safe to have)
        const fallbackTexts = parseTweets(contentJsonStr);
        newTweets = fallbackTexts.map(txt => ({
          text: txt,
          hook: txt.split('\n')[0],
          formatType: 'other',
          status: 'draft'
        }));
      }

      // 4. Quality Pass & Auto-Scheduling
      setLoadingStep(4);
      setGenMessage('Trinn 5/5: Kvalitetssjekk og planlegging...');

      // Auto-schedule logic: Distribute tweets evenly starting from tomorrow
      const today = new Date();
      // Calculate interval in days based on frequency (tweets per week)
      // e.g. 7 tweets/week = 1 day interval, 3 tweets/week = ~2-3 days
      const daysInterval = frequency > 0 ? 7 / frequency : 7;

      const scheduledTweets = newTweets.map((t, index) => {
        // Simple distinct date scheduling
        const date = new Date(today);
        date.setDate(today.getDate() + 1 + Math.floor(index * daysInterval));
        const dateStr = date.toISOString().split('T')[0];

        return {
          ...t,
          date: dateStr, // Assign auto-calculated date
          // Simulating "Quality Pass" by setting status to 'draft' for review (already done)
          // Ideally we would do a 2nd AI pass here to refine text if needed.
        };
      });

      const brand: Brand = {
        id: Date.now().toString(),
        name,
        url,
        vibe,
        industry,
        offer,
        targetAudience: target,
        postingFrequency: frequency,
        goals,
        personaKernel: (coreBelief || voiceSignature) ? {
          coreBelief,
          voiceSignature
        } : undefined,
        brandBrief,
        contentPillars,
        ctaList: brandBrief.ctaPhrases || [],
        analysisResult: JSON.stringify(brandBrief, null, 2), // store raw for debug/view
        strategyResult: strategySummary,
        posts: scheduledTweets,
        prevPosts: []
      };

      setBrands(prev => [...prev, brand]);
      setCurrentBrandId(brand.id);
      setMode('workspace');

    } catch (err) {
      console.error('Error in creation pipeline:', err);
      showToast('Noe gikk galt under opprettelsen. Prøv igjen.', 'error');
      setMode('onboarding');
    } finally {
      setGenMessage('');
    }
  };

  const handleGenerateNextBatch = async (brandId: string) => {
    const brandIndex = brands.findIndex(b => b.id === brandId);
    if (brandIndex === -1) return;
    const brand = brands[brandIndex];

    const confirmed = await showConfirm({
      title: 'Generer nytt innhold',
      message: 'Vil du generere neste måneds innhold basert på innsikt fra forrige periode?',
      confirmText: 'Generer',
      cancelText: 'Avbryt',
      type: 'info'
    });
    if (!confirmed) return;

    setGenMessage('Analyserer forrige måneds resultater...');

    try {
      // 1. Analyze top performing formats from existing posts
      const postsWithMetrics = brand.posts.filter(p => p.metrics);
      let topFormats: string[] = [];
      if (postsWithMetrics.length > 0) {
        // Simple "best" logic: sort by likes + replies
        const sorted = [...postsWithMetrics].sort((a, b) => {
          const scoreA = (a.metrics?.likes || 0) * 2 + (a.metrics?.replies || 0) * 5;
          const scoreB = (b.metrics?.likes || 0) * 2 + (b.metrics?.replies || 0) * 5;
          return scoreB - scoreA;
        });
        topFormats = sorted.slice(0, 3).map(p => p.formatType);
      }

      const isEnglishLang = settings.language === 'en';
      const insightPrompt = topFormats.length > 0
        ? (isEnglishLang
            ? `Based on data, these formats worked best: ${topFormats.join(', ')}. Create more of this.`
            : `Basert på data, fungerte disse formatene best: ${topFormats.join(', ')}. Lag mer av dette.`)
        : (isEnglishLang ? 'No data yet, continue with varied mix.' : 'Ingen data enda, fortsett med variert miks.');

      setGenMessage(isEnglishLang ? 'Writing new content for next month...' : 'Skriver nytt innhold for neste måned...');

      // 2. Generate new batch
      const vibeDesc = vibePresets.find(v => v.label === brand.vibe)?.description || brand.vibe;
      const tweetCount = Math.min((brand.postingFrequency || 5) * 4, 12);

      // Collect previous hooks to avoid repetition
      const previousContent = [...(brand.prevPosts || []), ...brand.posts]
        .slice(-15) // Look at last 15 posts
        .map(p => `"${p.hook}"`)
        .join(', ');

      // Get language instructions
      const languageSection = buildLanguagePromptSection(settings.language);

      const isEnglish = settings.language === 'en';
      const contentPrompt = isEnglish
        ? `You are a professional copywriter. New month for ${brand.name}.

        ${languageSection}

        Brand Brief: ${JSON.stringify(brand.brandBrief)}
        ${insightPrompt}
        Tone: ${vibeDesc}

        NEGATIVE CONSTRAINT: Avoid repeating these: [${previousContent}]. Create something NEW.

        ${getAlgorithmPrompt(settings.language)}

        ⚠️ CRITICAL LENGTH REQUIREMENTS:

        POST 1-3: LONG POSTS (MINIMUM 800 chars, preferably 1000+)
        POST 4-7: MEDIUM POSTS (300-500 chars)
        POST 8-${tweetCount}: SHORT POSTS (under 200 chars)

        🖼️ IMAGE PROMPT: Include "imagePrompt" for each post (short English prompt, max 100 chars).

        Create ${tweetCount} new posts.
        Return JSON: { "tweets": [{ "hook": "...", "text": "...", "formatType": "...", "lengthCategory": "short" | "medium" | "long", "imagePrompt": "..." }] }`
        : `Du er en profesjonell tekstforfatter. Det er ny måned for ${brand.name}.

        ${languageSection}

        Brand Brief: ${JSON.stringify(brand.brandBrief)}
        ${insightPrompt}
        Tone: ${vibeDesc}

        NEGATIVE CONSTRAINT: Unngå å gjenta disse: [${previousContent}]. Lag noe NYTT.

        ${getAlgorithmPrompt(settings.language)}

        ⚠️ KRITISK LENGDE-KRAV (MÅ FØLGES NØYAKTIG):

        POST 1-3: LANGE POSTER (MINST 800 tegn hver, helst 1000+)
        POST 4-7: MEDIUM POSTER (300-500 tegn)
        POST 8-${tweetCount}: KORTE POSTER (under 200 tegn)

        🖼️ BILDE-PROMPT: Inkluder "imagePrompt" for hver post (kort engelsk prompt, maks 100 tegn).

        Lag ${tweetCount} nye innlegg.
        Returner JSON: { "tweets": [{ "hook": "...", "text": "...", "formatType": "...", "lengthCategory": "kort" | "medium" | "lang", "imagePrompt": "..." }] }`;

      const contentJsonStr = await callAI([createPersonaSystemMessage(brand.name, brand.vibe, brand.personaKernel?.coreBelief, brand.personaKernel?.voiceSignature, 'mixed', settings.language), { role: 'user', content: contentPrompt }]);

      let nextTweets: Tweet[] = [];
      try {
        const match = contentJsonStr.match(/\{[\s\S]*\}/);
        const contentData = JSON.parse(match ? match[0] : contentJsonStr) as { tweets: AITweetResponse[] };
        nextTweets = contentData.tweets.map((t: AITweetResponse) => ({
          text: t.text,
          hook: t.hook || t.text.split('\n')[0],
          formatType: (t.formatType as Tweet['formatType']) || 'other',
          mediaIdea: t.mediaIdea,
          imagePrompt: t.imagePrompt,
          status: 'draft' as const
        }));
      } catch (e) {
        console.warn("Fallback parse next batch", e);
        const fallbackTexts = parseTweets(contentJsonStr);
        nextTweets = fallbackTexts.map(txt => ({
          text: txt,
          hook: txt.split('\n')[0],
          formatType: 'other',
          status: 'draft'
        }));
      }

      // Auto-schedule next batch logic
      // Find last scheduled date or start from today
      const lastDateStr = brand.posts.reduce((latest, p) => (p.date && p.date > latest ? p.date : latest), new Date().toISOString().split('T')[0]);
      const startDate = new Date(lastDateStr);
      const daysInterval = brand.postingFrequency && brand.postingFrequency > 0 ? 7 / brand.postingFrequency : 2;

      const scheduledNextTweets = nextTweets.map((t, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + 1 + Math.floor((i + 1) * daysInterval));
        return { ...t, date: d.toISOString().split('T')[0] };
      });

      // Archive old posts to prevPosts and set new as posts
      const updatedBrand = {
        ...brand,
        prevPosts: [...(brand.prevPosts || []), ...brand.posts],
        posts: scheduledNextTweets
      };

      updateBrand(updatedBrand);
      showToast('Nytt innhold generert og lagt til kalenderen!', 'success');

    } catch (err) {
      console.error("Next batch error", err);
      showToast('Feil ved generering av neste måned.', 'error');
    } finally {
      setGenMessage('');
    }
  };

  const updateBrand = (updated: Brand) => {
    setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBrand = async (brandId: string) => {
    const brandToDelete = brands.find(b => b.id === brandId);
    if (!brandToDelete) return;

    const confirmed = await showConfirm({
      title: 'Slett merkevare?',
      message: `Er du sikker på at du vil slette "${brandToDelete.name}"? Alt innhold vil bli fjernet permanent.`,
      confirmText: 'Slett',
      cancelText: 'Avbryt',
      type: 'warning'
    });

    if (!confirmed) return;

    setBrands(prev => prev.filter(b => b.id !== brandId));
    if (currentBrandId === brandId) {
      setCurrentBrandId(null);
      setMode('dashboard');
    }
    showToast(`"${brandToDelete.name}" ble slettet`, 'success');
  };

  const currentBrand = currentBrandId ? brands.find(b => b.id === currentBrandId) || null : null;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {mode === 'loading' && (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-brand-bg">
          {/* Progress dots */}
          <div className="flex gap-3 mb-8">
            {loadingSteps.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < loadingStep ? 'bg-green-500' :
                  i === loadingStep ? 'bg-brand-gold animate-pulse scale-125' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Current step icon */}
          <div className="text-6xl mb-6 animate-bounce">
            {loadingSteps[loadingStep]?.icon || '🤖'}
          </div>

          {/* Step label */}
          <h2 className="text-2xl font-serif italic text-brand-text mb-2">
            {loadingSteps[loadingStep]?.label || 'Genererer...'}
          </h2>

          {/* Step description */}
          <p className="text-brand-text/60 font-sans font-light max-w-md mx-auto mb-4">
            {loadingSteps[loadingStep]?.description}
          </p>

          {/* Progress text */}
          <p className="text-sm text-brand-text/40 font-mono">
            {genMessage}
          </p>
        </div>
      )}

      {mode === 'landing' &&
        <LandingPage
          onStart={() => setMode('onboarding')}
          hasBrands={brands.length > 0}
          onGoToDashboard={() => setMode('dashboard')}
          onGoToAbout={() => setMode('about')}
          onGoToPricing={() => setMode('pricing')}
          onGoToContact={() => setMode('contact')}
        />
      }
      {mode === 'about' && (
        <AboutPage onBack={() => setMode('landing')} onStart={() => setMode('onboarding')} />
      )}
      {mode === 'pricing' && (
        <PricingPage onBack={() => setMode('landing')} onStart={() => setMode('onboarding')} />
      )}
      {mode === 'contact' && (
        <ContactPage onBack={() => setMode('landing')} onStart={() => setMode('onboarding')} />
      )}
      {mode === 'onboarding' &&
        <Onboarding
          vibeOptions={vibePresets}
          onSubmit={handleCreateBrand}
          onCancel={() => setMode(brands.length > 0 ? 'dashboard' : 'landing')}
        />
      }
      {mode === 'settings' && (
        <SettingsPage onBack={() => setMode('dashboard')} />
      )}
      {mode === 'dashboard' &&
        <Dashboard
          brands={brands}
          onSelect={(brandId: string) => { setCurrentBrandId(brandId); setMode('workspace'); }}
          onAddNew={() => setMode('onboarding')}
          onUpdateBrand={updateBrand}
          onDeleteBrand={deleteBrand}
          onGoToSettings={() => setMode('settings')}
          onGoToTools={() => setMode('tools')}
        />
      }
      {mode === 'tools' && brands.length > 0 && (
        <ToolsHub
          brand={brands[0]}
          updateBrand={updateBrand}
          onBack={() => setMode('dashboard')}
        />
      )}
      {mode === 'workspace' && currentBrand &&
        <Workspace
          brand={currentBrand}
          vibePresets={vibePresets}
          updateBrand={updateBrand}
          onBack={() => setMode('dashboard')}
          onGenerateNext={() => handleGenerateNextBatch(currentBrand.id)}
        />
      }
      {mode === 'login' && (
        <LoginPage
          onBack={() => setMode('landing')}
          onLogin={() => {
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            setMode('dashboard');
          }}
        />
      )}
      <CookieBanner />
    </div>
  );
}

export default App;
