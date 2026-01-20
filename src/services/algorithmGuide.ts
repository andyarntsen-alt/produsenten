// X/Twitter Algorithm Guide - Basert på faktisk algoritme-analyse
// Brukes til å score og forbedre poster for maksimal rekkevidde

export const ALGORITHM_INSIGHTS = {
    // Engasjement-vekting (høyest til lavest prioritet)
    engagementWeights: {
        likes: { weight: 'Highest', description: 'Strong takes, relatable content, useful insights' },
        replies: { weight: 'High', description: 'Ask questions, share controversial opinions, create discussion hooks' },
        retweets: { weight: 'High', description: 'Shareable wisdom, threads worth spreading' },
        quotes: { weight: 'High', description: 'Hot takes people want to add commentary to' },
        dwellTime: { weight: 'Medium', description: 'Long-form content, threads, engaging visuals that make people stop scrolling' },
        profileClicks: { weight: 'Medium', description: 'Tease expertise, make people curious about you' },
        shares: { weight: 'Medium', description: 'Highly relevant niche content people want to send privately' },
    },

    // Negative signaler å unngå
    negativeSignals: [
        'Not Interested clicks',
        'Blocks from your posts',
        'Mutes from your posts',
        'Reports',
    ],

    // Ting å unngå
    avoid: [
        'Spam hashtags or post too frequently (causes mutes)',
        'Rage-bait that leads to blocks',
        'Inflammatory content that gets reported',
        'Stay on-topic to avoid "not interested" clicks',
        'Stale content (recency filter)',
        'Videos that get abandoned halfway',
    ],

    // Author Diversity Decay - ikke spam!
    diversityDecay: {
        post1: '100% score',
        post2: '~60% score',
        post3: '~40% score',
        recommendation: '3-5 great posts per day beats 20 mediocre ones',
    },

    // Beste praksis
    bestPractices: [
        'Post original content (not just retweets)',
        'Create reply-worthy content (questions, hot takes)',
        'Build threads that increase dwell time',
        'Engage authentically to train your discovery profile',
        'Post videos people will watch to completion',
        'Grow real followers who actually engage',
        'Reply to big accounts - your reply can surface in feeds',
        'Quote-tweet for visibility over plain replies',
        'Post when your audience is actively engaging',
        'Ride momentum - if a post is doing well, engage in replies',
    ],

    // Video-spesifikk
    videoTips: [
        'Videos should be long enough to qualify (likely 10+ seconds)',
        'Hook viewers early - they need to watch for it to count',
        'Short clips that get watched fully > long videos abandoned',
    ],
};

// Scoring-kriterier basert på algoritme-innsikt
export interface AlgorithmScore {
    overall: number;
    factors: {
        likeability: number;      // Vil folk like dette?
        replyPotential: number;   // Trigger det diskusjon?
        shareability: number;     // Er det delbart?
        dwellTime: number;        // Stopper det scrolling?
        hookStrength: number;     // Er åpningen sterk?
    };
    tips: string[];
}

export function scorePostForAlgorithm(text: string): AlgorithmScore {
    const tips: string[] = [];
    const factors = {
        likeability: 50,
        replyPotential: 50,
        shareability: 50,
        dwellTime: 50,
        hookStrength: 50,
    };

    // Lengde-analyse
    const length = text.length;
    if (length < 100) {
        factors.dwellTime -= 10;
        tips.push('Kort post = lavere dwell time. Vurder å utdype.');
    } else if (length > 500) {
        factors.dwellTime += 20;
    } else if (length > 280) {
        factors.dwellTime += 10;
    }

    // Spørsmål = reply potential
    if (text.includes('?')) {
        factors.replyPotential += 20;
        if (text.split('?').length > 2) {
            factors.replyPotential += 10; // Flere spørsmål
        }
    } else {
        tips.push('Ingen spørsmål = lavere svar-potensial. Vurder å stille et spørsmål.');
    }

    // Hook-analyse (første linje)
    const firstLine = text.split('\n')[0];
    const hookPatterns = [
        /^(Unpopular|Hot take|Controversial|Upopulær)/i,
        /^(Stop|Wait|Hold up|Vent)/i,
        /^\d+ (ting|tips|grunner|år)/i,
        /^(Jeg |I )(brukte|lærte|fant|oppdaget)/i,
        /\?$/,
    ];

    let hasStrongHook = false;
    for (const pattern of hookPatterns) {
        if (pattern.test(firstLine)) {
            hasStrongHook = true;
            factors.hookStrength += 25;
            break;
        }
    }

    if (!hasStrongHook) {
        // Svake hooks
        const weakHooks = [
            /^(Her er|I dag|Jeg vil|La meg)/i,
            /^(Visste du|Did you know)/i,
        ];
        for (const pattern of weakHooks) {
            if (pattern.test(firstLine)) {
                factors.hookStrength -= 20;
                tips.push('Svak hook-åpning. Prøv kontrast, provokasjon, eller personlig historie.');
                break;
            }
        }
    }

    // Delbarhet - wisdom, tips, lister
    if (/\d+\.\s/.test(text) || text.includes('•') || text.includes('-')) {
        factors.shareability += 15;
    }
    if (/(tips|hack|trick|råd|lærdom)/i.test(text)) {
        factors.shareability += 10;
    }

    // Personlig = likeability
    if (/(jeg |min |mitt |mine )/i.test(text)) {
        factors.likeability += 15;
    }
    if (/(du |din |ditt |dine )/i.test(text)) {
        factors.likeability += 10;
        factors.replyPotential += 10;
    }

    // Kontroversiell = engagement
    if (/(feil|wrong|overrated|undervurdert|upopulær|controversial)/i.test(text)) {
        factors.replyPotential += 20;
        factors.shareability += 10;
    }

    // Emoji-bruk
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu) || []).length;
    if (emojiCount === 0) {
        tips.push('Ingen emojis kan gjøre posten mindre visuelt interessant.');
    } else if (emojiCount > 5) {
        factors.likeability -= 10;
        tips.push('For mange emojis kan virke spam-aktig.');
    }

    // Hashtag-sjekk
    const hashtagCount = (text.match(/#\w+/g) || []).length;
    if (hashtagCount > 3) {
        factors.likeability -= 15;
        tips.push('For mange hashtags kan trigge "not interested" clicks.');
    }

    // Beregn overall
    const overall = Math.round(
        (factors.likeability * 0.25 +
         factors.replyPotential * 0.25 +
         factors.shareability * 0.2 +
         factors.dwellTime * 0.15 +
         factors.hookStrength * 0.15)
    );

    // Legg til generelle tips basert på score
    if (overall < 60) {
        tips.push('Vurder å gjøre posten mer personlig eller kontroversiell.');
    }
    if (factors.hookStrength < 50) {
        tips.push('Sterkere åpning kan øke synligheten dramatisk.');
    }

    return {
        overall: Math.min(100, Math.max(0, overall)),
        factors: {
            likeability: Math.min(100, Math.max(0, factors.likeability)),
            replyPotential: Math.min(100, Math.max(0, factors.replyPotential)),
            shareability: Math.min(100, Math.max(0, factors.shareability)),
            dwellTime: Math.min(100, Math.max(0, factors.dwellTime)),
            hookStrength: Math.min(100, Math.max(0, factors.hookStrength)),
        },
        tips,
    };
}

// Prompt-tillegg for AI-generering basert på algoritme
export const ALGORITHM_AWARE_PROMPT = `
⚠️ KRITISK: ALGORITME-OPTIMALISERING FOR HØY SCORE

Hver post MÅ optimaliseres for å score høyt på disse kriteriene:

📊 SCORING-FAKTORER (alle MÅ være høye):
1. HOOK-STYRKE (25%): Åpningen må STOPPE scrolling
2. REPLY-POTENSIAL (25%): Må trigge diskusjon
3. LIKEABILITY (20%): Må være relatable og verdifull
4. SHAREABILITY (15%): Må være verdt å dele
5. DWELL TIME (15%): Må holde oppmerksomheten

🎯 FOR HØY SCORE, BRUK DISSE HOOK-FORMATENE:
✅ "Upopulær mening:" (triggers replies)
✅ "Hot take:" / "Kontroversielt:" (triggers engagement)
✅ "3 år med X lærte meg én ting:" (curiosity + personal)
✅ "Jeg gjorde [X]. Her er hva som skjedde." (story hook)
✅ "Stopp. Les dette før du..." (pattern interrupt)
✅ "Alle sier [X]. De tar feil." (contrast)
✅ "Hva om [provocative question]?" (triggers replies)
✅ Tall i hook: "5 ting ingen forteller deg om..."

❌ UNNGÅ DISSE (GARANTERT LAV SCORE):
- "Her er..." / "I dag..." / "La meg..." (svake åpninger)
- "Visste du at..." (overbrukt, AI-aktig)
- Ingen spørsmål i hele posten (= ingen replies)
- Kun generiske utsagn uten personlig vinkel
- For mange emojis (uprofesjonelt, spam-signal)
- For mange hashtags (spam-signal)

✨ KRAV FOR HVER POST:
1. MINST 1 spørsmål (øker reply-potensial med 20-30%)
2. MINIMAL emoji-bruk: Maks 1 post av alle kan ha 1 emoji. Resten skal være UTEN emojis.
3. Personlig pronomen "jeg/du" (øker likeability)
4. STERK første linje (hook må være fengslende)
5. Noe kontroversielt ELLER personlig ELLER overraskende

🔥 EKSEMPLER PÅ HØY-SCORING POSTER:

EKSEMPEL 1 (Score: 85+):
"Upopulær mening: De fleste trenger ikke flere følgere.

De trenger færre distraksjoner og dypere relasjoner.

10 ekte fans > 10,000 passive followers.

Hvem er enig?"

EKSEMPEL 2 (Score: 80+):
"Jeg brukte 3 år på å bygge en business.

Solgte for 0 kr.

Men lærte ting som har tjent meg 10x siden:
- Salg handler om å lytte
- Konsistens slår talent
- Dine 'feil' er din beste lærer

Hva er din største business-læring?"

EKSEMPEL 3 (Score: 75+):
"Stopp å jakte 'passion'.

Start å jakte kompetanse.

Passion kommer ETTER du blir god på noe.

Ikke før.

(Dette endret alt for meg)"

FØLG DISSE REGLENE NØYAKTIG FOR Å SIKRE HØY ALGORITME-SCORE.
`;

// English version of algorithm prompt
export const ALGORITHM_AWARE_PROMPT_EN = `
⚠️ CRITICAL: ALGORITHM OPTIMIZATION FOR HIGH SCORE

Every post MUST be optimized to score high on these criteria:

📊 SCORING FACTORS (all MUST be high):
1. HOOK STRENGTH (25%): Opening must STOP scrolling
2. REPLY POTENTIAL (25%): Must trigger discussion
3. LIKEABILITY (20%): Must be relatable and valuable
4. SHAREABILITY (15%): Must be worth sharing
5. DWELL TIME (15%): Must hold attention

🎯 FOR HIGH SCORE, USE THESE HOOK FORMATS:
✅ "Unpopular opinion:" (triggers replies)
✅ "Hot take:" / "Controversial:" (triggers engagement)
✅ "3 years of X taught me one thing:" (curiosity + personal)
✅ "I did [X]. Here's what happened." (story hook)
✅ "Stop. Read this before you..." (pattern interrupt)
✅ "Everyone says [X]. They're wrong." (contrast)
✅ "What if [provocative question]?" (triggers replies)
✅ Numbers in hook: "5 things nobody tells you about..."

❌ AVOID THESE (GUARANTEED LOW SCORE):
- "Here's..." / "Today..." / "Let me..." (weak openings)
- "Did you know..." (overused, AI-like)
- No questions in entire post (= no replies)
- Only generic statements without personal angle
- Too many emojis (unprofessional, spam signal)
- Too many hashtags (spam signal)

✨ REQUIREMENTS FOR EACH POST:
1. AT LEAST 1 question (increases reply potential by 20-30%)
2. MINIMAL emoji use: Maximum 1 post out of all can have 1 emoji. The rest should have NO emojis.
3. Personal pronouns "I/you" (increases likeability)
4. STRONG first line (hook must be captivating)
5. Something controversial OR personal OR surprising

🔥 EXAMPLES OF HIGH-SCORING POSTS:

EXAMPLE 1 (Score: 85+):
"Unpopular opinion: Most people don't need more followers.

They need fewer distractions and deeper relationships.

10 real fans > 10,000 passive followers.

Who agrees?"

EXAMPLE 2 (Score: 80+):
"I spent 3 years building a business.

Sold it for $0.

But learned things that have earned me 10x since:
- Sales is about listening
- Consistency beats talent
- Your 'failures' are your best teacher

What's your biggest business lesson?"

EXAMPLE 3 (Score: 75+):
"Stop chasing 'passion'.

Start chasing competence.

Passion comes AFTER you get good at something.

Not before.

(This changed everything for me)"

FOLLOW THESE RULES EXACTLY TO ENSURE HIGH ALGORITHM SCORE.
`;

// Helper to get the right prompt based on language
import type { Language } from '../context/SettingsContext';

export function getAlgorithmPrompt(lang: Language): string {
    return lang === 'en' ? ALGORITHM_AWARE_PROMPT_EN : ALGORITHM_AWARE_PROMPT;
}
