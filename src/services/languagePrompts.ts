// Language-specific prompt instructions for AI content generation
// Used to ensure consistent language across all generated content

import type { Language } from '../context/SettingsContext';

// Language instructions that get injected into prompts
export const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
    no: `SPRÅK: Skriv på AUTENTISK, MUNTLIG norsk.

⛔ KRITISKE GRAMMATIKKFEIL - LES DETTE FØRST:
Du MÅ ALDRI skrive "er om å" - dette er FEIL norsk!
- ❌ FEIL: "trading er om å bygge" / "det er om å tjene penger"
- ✅ RIKTIG: "trading handler om å bygge" / "det handler om å tjene penger"
- ❌ FEIL: "en solid grunnlage" / "en solide grunnlag"
- ✅ RIKTIG: "et solid grunnlag" (grunnlag = intetkjønn)

SKRIV SOM EN EKTE NORDMANN:
- Korte, punchende setninger blandet med lengre (VIKTIG: varier!)
- Bruk "jeg/du/vi" - ALDRI "man"
- OK med engelske lånord (crush, vibe, chill, lowkey, ngl)
- Direkte og uformelt, som du snakker med en venn
- Linjeskift for "luft" og lesbarhet
- Muntlig flyt > perfekt grammatikk

KOPIER DENNE STILEN:
"Jeg droppet drømmejobben. Lyder crazy. Men hør."
"Alle sa det var dust. 6 mnd senere? Jeg beviste dem feil."
"Folk spør hvordan jeg fikk det til. Spoiler: ikke talent."
"Tre ting jeg lærte av å bomme spektakulært:"
"Upopulær mening: De fleste trenger ikke flere følgere."
"Her er greien ingen snakker om:"
"Slutt å gjøre dette. Seriøst."

ALDRI SKRIV SLIK:
"Det er viktig å merke seg at..."
"I dagens samfunn..."
"Man bør vurdere å..."
"Når alt kommer til alt..."
"La oss utforske..."
"Det skal sies at..."
"er om å" (FEIL - bruk "handler om å")
Lange, formelle setninger uten variasjon
Perfekt grammatikk hele veien (for AI-aktig)
"Lykke til!" eller "Håper det hjelper!" på slutten`,

    en: `LANGUAGE: Write in AUTHENTIC, CASUAL English.

WRITE LIKE A REAL PERSON:
- Mix short punchy sentences with longer ones (CRUCIAL: vary it!)
- Use "I/you/we" - never passive voice
- Contractions are good (don't, won't, can't)
- Direct and informal, like talking to a friend
- Line breaks for readability
- Natural flow > perfect grammar

COPY THIS STYLE:
"I quit my dream job. Sounds crazy. But hear me out."
"Everyone said it was stupid. 6 months later? I proved them wrong."
"People ask how I did it. Spoiler: it wasn't talent."
"Three things I learned from failing spectacularly:"
"Unpopular opinion: Most people don't need more followers."
"Here's what nobody talks about:"
"Stop doing this. Seriously."

NEVER WRITE LIKE THIS:
"It's important to note that..."
"In today's fast-paced world..."
"One should consider..."
"At the end of the day..."
"Let's dive into..."
"It goes without saying..."
Long, formal sentences without variation
Perfect grammar throughout (too AI-like)
"Good luck!" or "Hope this helps!" at the end`,
};

// Get language instruction for a specific language
export function getLanguageInstruction(lang: Language): string {
    return LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS.no;
}

// Humanizer rules adapted for language
export const HUMANIZER_LANGUAGE_RULES: Record<Language, {
    forbiddenOpenings: string[];
    forbiddenClosings: string[];
    forbiddenPhrases: string[];
}> = {
    no: {
        forbiddenOpenings: [
            'Selvfølgelig!',
            'Absolutt!',
            'Det er et flott spørsmål!',
            'La meg forklare',
            'Her er',
            'I en verden der',
            'Visste du at',
        ],
        forbiddenClosings: [
            'Lykke til!',
            'Håper det hjelper!',
            'Ikke nøl med å spørre',
            'Del gjerne dine tanker',
            'Hva tenker du?',
            'Følg for mer!',
        ],
        forbiddenPhrases: [
            'er avgjørende for',
            'ta det til neste nivå',
            'utnytte potensialet',
            'i bunn og grunn',
            'på slutten av dagen',
            'la oss utforske',
            'i dagens samfunn',
            'er om å',  // Feil oversettelse av "is about to"
        ],
    },
    en: {
        forbiddenOpenings: [
            'Absolutely!',
            'Of course!',
            'Great question!',
            'Let me explain',
            'Here are',
            'In a world where',
            'Did you know',
            'In today\'s',
        ],
        forbiddenClosings: [
            'Good luck!',
            'Hope this helps!',
            'Don\'t hesitate to ask',
            'Share your thoughts',
            'What do you think?',
            'Follow for more!',
            'Let me know!',
        ],
        forbiddenPhrases: [
            'is crucial for',
            'take it to the next level',
            'leverage the potential',
            'at the end of the day',
            'in this day and age',
            'let\'s dive into',
            'game-changer',
            'unlock your potential',
        ],
    },
};

// Get humanizer rules for a specific language
export function getHumanizerRules(lang: Language) {
    return HUMANIZER_LANGUAGE_RULES[lang] || HUMANIZER_LANGUAGE_RULES.no;
}

// Build a complete language-aware prompt addition
export function buildLanguagePromptSection(lang: Language): string {
    // The new LANGUAGE_INSTRUCTIONS already include examples and forbidden patterns
    // Just return the comprehensive instruction directly
    return getLanguageInstruction(lang);
}

// Prompt translations for different components
export const PROMPT_TRANSLATIONS: Record<Language, {
    // Common
    brand: string;
    targetAudience: string;
    industry: string;
    tone: string;

    // Bio Generator
    bioGenerator: {
        title: string;
        createBios: string;
        keywords: string;
        requirements: string;
        maxChars: string;
        useLineBreaks: string;
        punchyAndMemorable: string;
        noGenericPhrases: string;
        returnAsJson: string;
    };

    // Comment Reply
    commentReply: {
        title: string;
        createReplies: string;
        theComment: string;
        toneLabel: string;
        tones: Record<string, string>;
        witInstructions: string;
        requirements: string;
    };

    // Hashtag Generator
    hashtagGenerator: {
        title: string;
        generateHashtags: string;
        forThisPost: string;
        requirements: string;
        highCompetition: string;
        mediumCompetition: string;
        lowCompetition: string;
        posts: string;
    };

    // Sponsor Pitch
    sponsorPitch: {
        title: string;
        writeColdEmail: string;
        onBehalfOf: string;
        goal: string;
        requirements: string;
        professionalButPersonal: string;
        under200Words: string;
        showYouKnowThem: string;
        concreteIdeas: string;
        clearCta: string;
        forbidden: string;
    };

    // Competitor Spy
    competitorSpy: {
        title: string;
        analyzeProfile: string;
        giveInsights: string;
        createAnalysis: string;
        estimatedFollowers: string;
        postingFrequency: string;
        topContentTypes: string;
        recentPostIdeas: string;
        strategySummary: string;
        opportunities: string;
    };

    // Post Improver
    postImprover: {
        analyzePost: string;
        createVersions: string;
        original: string;
        strongerHook: string;
        shorterVersion: string;
        controversialTake: string;
        keepMessage: string;
        rewriteOpening: string;
        cutLength: string;
        addEdge: string;
    };

    // Content generation
    content: {
        brandContext: string;
        voiceSignature: string;
        personality: string;
        valueProps: string;
        differentiators: string;
        painPoints: string;
        controversialTakes: string;
        contentPillars: string;
        idealCustomer: string;
        yourStrengths: string;
    };
}> = {
    no: {
        brand: 'Merkevare',
        targetAudience: 'Målgruppe',
        industry: 'Bransje',
        tone: 'Tone',

        bioGenerator: {
            title: 'Bio Generator',
            createBios: 'Lag 5 bio-forslag for',
            keywords: 'Stikkord',
            requirements: 'KRAV',
            maxChars: 'Maks {limit} per bio',
            useLineBreaks: 'Bruk \\n for linjeskift der det passer',
            punchyAndMemorable: 'Punchy og minneverdig',
            noGenericPhrases: 'Ingen generiske fraser',
            returnAsJson: 'Returner som JSON-array med 5 strenger',
        },

        commentReply: {
            title: 'Kommentarsvar',
            createReplies: 'Lag 4 forskjellige svar på denne kommentaren fra en følger.',
            theComment: 'Kommentaren',
            toneLabel: 'Tone',
            tones: {
                friendly: 'varm og vennlig',
                professional: 'profesjonell og saklig',
                playful: 'leken og morsom',
                grateful: 'takknemlig og ydmyk',
                wit: 'vittig og skarp',
            },
            witInstructions: `VIKTIG FOR VITTIG TONE:
- Ikke vær "cringe" eller barnehage-morsom.
- Bruk ironi, overdrivelser eller understatements ("wit").
- Det er LOV å være litt frekk (med kjærlighet).
- Unngå standard setninger som "Hahaha så gøy".
- Tenk: Hva ville en standup-komiker svart?`,
            requirements: 'Krav: Korte, naturlige svar. Maks 2 setninger hver. Returner som JSON-array.',
        },

        hashtagGenerator: {
            title: 'Hashtag Generator',
            generateHashtags: 'Generer relevante hashtags for denne posten',
            forThisPost: 'for denne posten',
            requirements: 'KRAV',
            highCompetition: 'Høy konkurranse',
            mediumCompetition: 'Medium konkurranse',
            lowCompetition: 'Lav konkurranse/nisje',
            posts: 'innlegg',
        },

        sponsorPitch: {
            title: 'Sponsor Pitch',
            writeColdEmail: 'Skriv en cold-email til',
            onBehalfOf: 'på vegne av',
            goal: 'Mål',
            requirements: 'KRAV',
            professionalButPersonal: 'Profesjonell MEN personlig (ikke corporate-speak)',
            under200Words: 'Under 200 ord',
            showYouKnowThem: 'Vis at du faktisk kjenner til brandet',
            concreteIdeas: 'Konkrete samarbeidsideer (ikke generiske)',
            clearCta: 'Tydelig CTA på slutten',
            forbidden: 'FORBUDT',
        },

        competitorSpy: {
            title: 'Konkurrentanalyse',
            analyzeProfile: 'Analyser profilen',
            giveInsights: 'og gi innsikter relevante for mitt brand',
            createAnalysis: 'Lag en strategisk analyse med',
            estimatedFollowers: 'Estimerte følgere',
            postingFrequency: 'Posting-frekvens',
            topContentTypes: 'Topp 3 innholdstyper',
            recentPostIdeas: 'konkrete eksempler på nylige post-ideer',
            strategySummary: 'Strategi-oppsummering',
            opportunities: 'muligheter for forbedring',
        },

        postImprover: {
            analyzePost: 'Analyser denne posten og lag 3 forbedrede versjoner',
            createVersions: 'LAG DISSE 3 VERSJONENE',
            original: 'ORIGINAL',
            strongerHook: 'STERKERE HOOK',
            shorterVersion: 'KORTERE VERSJON',
            controversialTake: 'KONTROVERSIELL VINKEL',
            keepMessage: 'Behold samme budskap',
            rewriteOpening: 'men skriv om åpningen',
            cutLength: 'Kutt lengden med 40%',
            addEdge: 'Legg til en dristigere vinkel',
        },

        content: {
            brandContext: 'BRAND-KONTEKST',
            voiceSignature: 'Stemmesignatur',
            personality: 'Personlighet',
            valueProps: 'Verdiforslag',
            differentiators: 'Det som skiller oss ut',
            painPoints: 'Målgruppens smertepunkter',
            controversialTakes: 'Kontroversielle vinkler fra brand',
            contentPillars: 'Innholdssøyler',
            idealCustomer: 'Ideell kunde',
            yourStrengths: 'Dine styrker',
        },
    },

    en: {
        brand: 'Brand',
        targetAudience: 'Target audience',
        industry: 'Industry',
        tone: 'Tone',

        bioGenerator: {
            title: 'Bio Generator',
            createBios: 'Create 5 bio suggestions for',
            keywords: 'Keywords',
            requirements: 'REQUIREMENTS',
            maxChars: 'Max {limit} per bio',
            useLineBreaks: 'Use \\n for line breaks where appropriate',
            punchyAndMemorable: 'Punchy and memorable',
            noGenericPhrases: 'No generic phrases',
            returnAsJson: 'Return as JSON array with 5 strings',
        },

        commentReply: {
            title: 'Comment Reply',
            createReplies: 'Create 4 different replies to this comment from a follower.',
            theComment: 'The comment',
            toneLabel: 'Tone',
            tones: {
                friendly: 'warm and friendly',
                professional: 'professional and factual',
                playful: 'playful and fun',
                grateful: 'grateful and humble',
                wit: 'witty and sharp',
            },
            witInstructions: `IMPORTANT FOR WITTY TONE:
- Don't be cringe or childish.
- Use irony, exaggeration or understatements.
- It's OK to be a bit cheeky (with love).
- Avoid standard phrases like "Haha so fun".
- Think: What would a stand-up comedian reply?`,
            requirements: 'Requirements: Short, natural replies. Max 2 sentences each. Return as JSON array.',
        },

        hashtagGenerator: {
            title: 'Hashtag Generator',
            generateHashtags: 'Generate relevant hashtags for this post',
            forThisPost: 'for this post',
            requirements: 'REQUIREMENTS',
            highCompetition: 'High competition',
            mediumCompetition: 'Medium competition',
            lowCompetition: 'Low competition/niche',
            posts: 'posts',
        },

        sponsorPitch: {
            title: 'Sponsor Pitch',
            writeColdEmail: 'Write a cold email to',
            onBehalfOf: 'on behalf of',
            goal: 'Goal',
            requirements: 'REQUIREMENTS',
            professionalButPersonal: 'Professional BUT personal (no corporate-speak)',
            under200Words: 'Under 200 words',
            showYouKnowThem: 'Show that you actually know the brand',
            concreteIdeas: 'Concrete collaboration ideas (not generic)',
            clearCta: 'Clear CTA at the end',
            forbidden: 'FORBIDDEN',
        },

        competitorSpy: {
            title: 'Competitor Analysis',
            analyzeProfile: 'Analyze the profile',
            giveInsights: 'and provide insights relevant to my brand',
            createAnalysis: 'Create a strategic analysis with',
            estimatedFollowers: 'Estimated followers',
            postingFrequency: 'Posting frequency',
            topContentTypes: 'Top 3 content types',
            recentPostIdeas: 'concrete examples of recent post ideas',
            strategySummary: 'Strategy summary',
            opportunities: 'opportunities for improvement',
        },

        postImprover: {
            analyzePost: 'Analyze this post and create 3 improved versions',
            createVersions: 'CREATE THESE 3 VERSIONS',
            original: 'ORIGINAL',
            strongerHook: 'STRONGER HOOK',
            shorterVersion: 'SHORTER VERSION',
            controversialTake: 'CONTROVERSIAL ANGLE',
            keepMessage: 'Keep the same message',
            rewriteOpening: 'but rewrite the opening',
            cutLength: 'Cut the length by 40%',
            addEdge: 'Add a bolder angle',
        },

        content: {
            brandContext: 'BRAND CONTEXT',
            voiceSignature: 'Voice signature',
            personality: 'Personality',
            valueProps: 'Value propositions',
            differentiators: 'What sets us apart',
            painPoints: 'Audience pain points',
            controversialTakes: 'Controversial takes from brand',
            contentPillars: 'Content pillars',
            idealCustomer: 'Ideal customer',
            yourStrengths: 'Your strengths',
        },
    },
};

// Helper to get translations for current language
export function getPromptTranslations(lang: Language) {
    return PROMPT_TRANSLATIONS[lang] || PROMPT_TRANSLATIONS.no;
}
