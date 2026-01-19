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
}

export interface Tweet {
  text: string;
  hook: string;
  formatType: 'question' | 'contrarian' | 'miniStory' | 'tip' | 'list' | 'opinion' | 'case' | 'mythBuster' | 'long-form' | 'other';
  mediaIdea?: string;
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
    const res = await fetch(url);
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

// Helper to create persona-aware system message
function createPersonaSystemMessage(brandName: string, vibe: string, coreBelief?: string, voiceSignature?: string, format: 'kort' | 'lang' | 'mixed' = 'mixed'): ChatMessage {
  const persona = getDefaultPersona(brandName, vibe);
  if (coreBelief) persona.coreBelief = coreBelief;
  if (voiceSignature) persona.voiceSignature = voiceSignature;

  return {
    role: 'system',
    content: buildSystemPrompt({ persona, platform: 'twitter', format })
  };
}



// Type for API response tweets
interface AITweetResponse {
  text: string;
  hook?: string;
  formatType?: string;
  mediaIdea?: string;
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
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('brands');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentBrandId, setCurrentBrandId] = useState<string | null>(null);
  const [mode, setMode] = useState<'landing' | 'onboarding' | 'dashboard' | 'loading' | 'workspace' | 'about' | 'pricing' | 'contact' | 'settings' | 'login' | 'tools'>('landing');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('isAuthenticated'));
  const [genMessage, setGenMessage] = useState('');

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
    setGenMessage('Trinn 1/4: Forsker på merkevaren din...');
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

      const researchPrompt = `Analyzér følgende tekst fra ${name} (${url}) og lag en strukturert "Brand Brief". 
      Inkluder:
      - Kort produktoppsummering
      - Ideell kundeprofil (ICP)
      - 3-5 unike verdiforslag (USP)
      - Hva som skiller dem fra konkurrenter
      - Do's and Don'ts for tone-of-voice
      - 5 innholdsvinkler (content angles)
      - 5 effektive hooks som passer brandet
      - 5 call-to-action (CTA) fraser
      
      Returner KUN gyldig JSON formatert slik:
      {
        "productSummary": "...",
        "idealCustomer": "...",
        "valueProps": ["...", "..."],
        "differentiators": ["...", "..."],
        "toneRules": ["...", "..."],
        "contentAngles": ["...", "..."],
        "hooks": ["...", "..."],
        "ctaPhrases": ["...", "..."]
      }

      Tekst å analysere: """${siteText}"""`;

      const researchJsonStr = await callAI([createPersonaSystemMessage(name, vibe), { role: 'user', content: researchPrompt }]);
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

      setGenMessage('Trinn 2/4: Utvikler innholdsstrategi...');

      // 2. Strategy
      const vibeDesc = vibePresets.find(v => v.label === vibe)?.description || vibe;
      const strategyPrompt = `Som en ekspert strateg, basert på denne briefen: ${JSON.stringify(brandBrief)}
      
      Mål: ${goals || 'Vekst'}
      Frekvens: ${frequency} tweets/uke
      Tone: ${vibeDesc}
      Bransje: ${industry || 'Generell'}
      
      Lag en strategi.
      Returner KUN gyldig JSON:
      {
        "contentPillars": ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4"],
        "strategySummary": "Kort oppsummering av strategien..."
      }`;

      const strategyJsonStr = await callAI([createPersonaSystemMessage(name, vibe), { role: 'user', content: strategyPrompt }]);
      let contentPillars: string[] = [];
      let strategySummary = "";
      try {
        const match = strategyJsonStr.match(/\{[\s\S]*\}/);
        const strategyData = JSON.parse(match ? match[0] : strategyJsonStr);
        contentPillars = strategyData.contentPillars || [];
        strategySummary = strategyData.strategySummary || "";
      } catch {
        contentPillars = ["Product Info", "Industry News", "Tips & Tricks", "Community"];
      }

      setGenMessage('Trinn 3/4: Skriver tweets...');

      // 3. Content Generation
      const tweetsToGenerate = frequency * 4; // 1 month rough estimate needed, let's generate 4 weeks worth but limit to max 12 for MVP speed
      const tweetCount = Math.min(tweetsToGenerate, 12);

      const contentPrompt = `Du er en profesjonell tekstforfatter for X (Twitter) og LinkedIn.
      Lag ${tweetCount} innlegg for ${name}.
      
      Brand Brief: ${JSON.stringify(brandBrief)}
      Strategi Pillars: ${contentPillars.join(', ')}
      Tone: ${vibeDesc} (VIKTIG: Ikke bruk "AI-språk", vær menneskelig/agency-style).
      
      Krav til innholdet:
      - VIKTIG: Lag en miks av KORTE tweets (punchy), MEDIUM poster, og HELT LANGE ESSAYS (1000+ tegn).
      - Minst 2 poster MÅ være "Deep Dives" / Essays som går ordentlig i dybden.
      - Varierte formater: Question, Contrarian, Mini-story, List, Tip, Case study, Deep Dive.
      - Sterk "hook" (første setning) på ALLE poster.
      - Ingen hashtags med mindre det er VELDIG relevant.
      
      Returner KUN et JSON objekt med en array "tweets":
      {
        "tweets": [
          {
            "hook": "Første linje som fanger oppmerksomhet",
            "text": "Hele teksten (kan være lang)...",
            "formatType": "list", 
            "mediaIdea": "Bilde av dashboard..." (valgfritt)
          }
        ]
      }`;

      const contentJsonStr = await callAI([createPersonaSystemMessage(name, vibe), { role: 'user', content: contentPrompt }]);
      let newTweets: Tweet[] = [];
      try {
        const match = contentJsonStr.match(/\{[\s\S]*\}/);
        const contentData = JSON.parse(match ? match[0] : contentJsonStr) as { tweets: AITweetResponse[] };
        newTweets = contentData.tweets.map((t: AITweetResponse) => ({
          text: t.text,
          hook: t.hook || t.text.split('\n')[0],
          formatType: (t.formatType as Tweet['formatType']) || 'other',
          mediaIdea: t.mediaIdea,
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
      setGenMessage('Trinn 4/4: Kvalitetssjekk og planlegging...');

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

      const insightPrompt = topFormats.length > 0
        ? `Basert på data, fungerte disse formatene best: ${topFormats.join(', ')}. Lag mer av dette.`
        : 'Ingen data enda, fortsett med variert miks.';

      setGenMessage('Skriver nytt innhold for neste måned...');

      // 2. Generate new batch
      const vibeDesc = vibePresets.find(v => v.label === brand.vibe)?.description || brand.vibe;
      const tweetCount = Math.min((brand.postingFrequency || 5) * 4, 12);

      const contentPrompt = `Du er en profesjonell tekstforfatter. Det er ny måned for ${brand.name}.
        Brand Brief: ${JSON.stringify(brand.brandBrief)}
        ${insightPrompt}
        Tone: ${vibeDesc}
        Lag ${tweetCount} nye innlegg. 
        Miks korte tweets, medium poster, og minst 2 "Deep Dive" essays (1000+ tegn).
        Variasjon er nøkkelen.
        Returner JSON array "tweets": [{ "hook": "...", "text": "...", "formatType": "...", "mediaIdea": "..." }]`;

      const contentJsonStr = await callAI([createPersonaSystemMessage(brand.name, brand.vibe, brand.personaKernel?.coreBelief, brand.personaKernel?.voiceSignature), { role: 'user', content: contentPrompt }]);

      let nextTweets: Tweet[] = [];
      try {
        const match = contentJsonStr.match(/\{[\s\S]*\}/);
        const contentData = JSON.parse(match ? match[0] : contentJsonStr) as { tweets: AITweetResponse[] };
        nextTweets = contentData.tweets.map((t: AITweetResponse) => ({
          text: t.text,
          hook: t.hook || t.text.split('\n')[0],
          formatType: (t.formatType as Tweet['formatType']) || 'other',
          mediaIdea: t.mediaIdea,
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

  const currentBrand = currentBrandId ? brands.find(b => b.id === currentBrandId) || null : null;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {mode === 'loading' && (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-brand-bg">
          <div className="text-6xl animate-bounce mb-8">🤖</div>
          <h2 className="text-2xl font-serif italic text-brand-text mb-4 animate-pulse">Genererer din strategi...</h2>
          <p className="text-brand-text/60 font-sans font-light max-w-md mx-auto">
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
