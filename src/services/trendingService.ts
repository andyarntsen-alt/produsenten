// Trending Service - Henter trending topics og virale eksempler for inspirasjon
// Bruker gratis API-er og RSS-feeds

import type { Brand } from '../App';

export interface TrendingTopic {
    name: string;
    category: 'tech' | 'business' | 'marketing' | 'general' | 'norway';
    source: string;
    url?: string;
}

export interface ViralPost {
    text: string;
    platform: 'twitter' | 'linkedin';
    hookType: string;
    engagement: string;
}

// Kategorier med norske og internasjonale topics
const CURATED_TOPICS: Record<string, TrendingTopic[]> = {
    tech: [
        { name: 'AI og automatisering', category: 'tech', source: 'curated' },
        { name: 'ChatGPT og produktivitet', category: 'tech', source: 'curated' },
        { name: 'Remote work verktøy', category: 'tech', source: 'curated' },
        { name: 'No-code løsninger', category: 'tech', source: 'curated' },
        { name: 'Cybersikkerhet tips', category: 'tech', source: 'curated' },
    ],
    business: [
        { name: 'Gründerreiser', category: 'business', source: 'curated' },
        { name: 'Bootstrapping vs funding', category: 'business', source: 'curated' },
        { name: 'Skalering av startups', category: 'business', source: 'curated' },
        { name: 'Produktivitetshacks', category: 'business', source: 'curated' },
        { name: 'Lederskap og kultur', category: 'business', source: 'curated' },
    ],
    marketing: [
        { name: 'Content marketing 2025', category: 'marketing', source: 'curated' },
        { name: 'Personal branding', category: 'marketing', source: 'curated' },
        { name: 'LinkedIn algoritme', category: 'marketing', source: 'curated' },
        { name: 'X/Twitter vekst', category: 'marketing', source: 'curated' },
        { name: 'Storytelling i markedsføring', category: 'marketing', source: 'curated' },
    ],
    norway: [
        { name: 'Norsk startup-miljø', category: 'norway', source: 'curated' },
        { name: 'Arbeidslivet i Norge', category: 'norway', source: 'curated' },
        { name: 'Innovasjon Norge', category: 'norway', source: 'curated' },
        { name: 'Bærekraft og ESG', category: 'norway', source: 'curated' },
        { name: 'Digitalisering i Norge', category: 'norway', source: 'curated' },
    ]
};

// Virale post-eksempler for inspirasjon (anonymisert)
const VIRAL_TEMPLATES: ViralPost[] = [
    {
        text: 'Jeg sa opp jobben min uten plan B.\n\n6 måneder senere tjener jeg mer enn noen gang.\n\nHer er hva jeg lærte:',
        platform: 'twitter',
        hookType: 'personlig-historie',
        engagement: '50K+ likes'
    },
    {
        text: 'Upopulær mening:\n\nDe fleste møter burde vært en e-post.\n\nOg de fleste e-poster burde vært en Slack-melding.\n\nOg de fleste Slack-meldinger burde ikke vært sendt i det hele tatt.',
        platform: 'twitter',
        hookType: 'kontroversiell',
        engagement: '30K+ likes'
    },
    {
        text: 'Jeg spurte 100 gründere hva de angrer mest.\n\n93% sa det samme:\n\n"Jeg ventet for lenge med å starte."',
        platform: 'twitter',
        hookType: 'statistikk',
        engagement: '25K+ likes'
    },
    {
        text: 'Stopp.\n\nFør du fortsetter å scrolle, svar på dette:\n\nHva er den ENE tingen du har utsatt i uker som tar under 5 minutter å gjøre?\n\nGjør det NÅ.',
        platform: 'twitter',
        hookType: 'stoppscrolling',
        engagement: '20K+ likes'
    },
    {
        text: 'De beste karriererådene jeg fikk kom ikke fra mentorer.\n\nDe kom fra folk som hadde feilet på akkurat det jeg prøvde å gjøre.\n\nFinn folk som har mislyktes. De husker hva som gikk galt.',
        platform: 'linkedin',
        hookType: 'innsikt',
        engagement: '15K+ reactions'
    },
    {
        text: '10 år i tech.\n\n1 setning oppsummerer alt:\n\n"De som sender e-post først, vinner oftere enn de som venter på å bli kontaktet."',
        platform: 'twitter',
        hookType: 'erfaring',
        engagement: '18K+ likes'
    },
    {
        text: 'Alle snakker om work-life balance.\n\nMen ingen snakker om at noen av de mest tilfredsstillende årene mine var da jeg jobbet 60-timers uker på noe jeg brannte for.\n\nKanskje balanse ikke er svaret for alle.',
        platform: 'linkedin',
        hookType: 'upopulær-mening',
        engagement: '22K+ reactions'
    },
    {
        text: 'Jeg har ansatt over 200 mennesker.\n\nDen beste prediktoren for suksess?\n\nIkke CV. Ikke intervju.\n\nOm de sender oppfølgingsspørsmål etter intervjuet.',
        platform: 'twitter',
        hookType: 'ekspert-innsikt',
        engagement: '35K+ likes'
    }
];

// Ukedags-hooks (beste tider/temaer per dag)
export const DAY_HOOKS: Record<number, { theme: string; hookIdeas: string[] }> = {
    0: { // Søndag
        theme: 'Refleksjon',
        hookIdeas: [
            'Denne uken lærte jeg...',
            'Det jeg skulle ønske jeg visste for X år siden:',
            'Søndag = refleksjonsdag. Her er mitt take:',
        ]
    },
    1: { // Mandag
        theme: 'Motivasjon & Start',
        hookIdeas: [
            'Ny uke. Ett mål. Her er mitt:',
            'Mandag-motivasjon? Nei. Her er realiteten:',
            'Start uken med dette spørsmålet:',
        ]
    },
    2: { // Tirsdag
        theme: 'Tips & Taktikk',
        hookIdeas: [
            'Tirsdag-tips: [konkret råd]',
            'Quick win for dagen:',
            'En ting jeg alltid gjør på tirsdager:',
        ]
    },
    3: { // Onsdag
        theme: 'Midt i uken-push',
        hookIdeas: [
            'Halvveis i uken. Tid for statussjekk:',
            'Onsdag = tid for å justere kursen',
            'Det som skiller uke fra uke:',
        ]
    },
    4: { // Torsdag
        theme: 'Deling & Historier',
        hookIdeas: [
            'Historie fra denne uken:',
            'Noe rart skjedde i dag...',
            'Torsdag-tanker om [tema]:',
        ]
    },
    5: { // Fredag
        theme: 'Oppsummering & Feiring',
        hookIdeas: [
            'Fredag = tid for å feire små seire:',
            '5 ting jeg fikk gjort denne uken:',
            'Ukens største læring:',
        ]
    },
    6: { // Lørdag
        theme: 'Casual & Behind-the-scenes',
        hookIdeas: [
            'Lørdag behind-the-scenes:',
            'Når jeg ikke jobber, gjør jeg...',
            'Lørdags-read: [anbefaling]',
        ]
    }
};

/**
 * Hent trending topics for en kategori
 */
export function getTrendingTopics(category?: string): TrendingTopic[] {
    if (category && CURATED_TOPICS[category]) {
        return CURATED_TOPICS[category];
    }
    // Return mix of all categories
    return Object.values(CURATED_TOPICS).flat().slice(0, 10);
}

/**
 * Hent virale post-eksempler for inspirasjon
 */
export function getViralExamples(count: number = 5): ViralPost[] {
    // Shuffle and return random examples
    const shuffled = [...VIRAL_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * Hent dagens hook-ideer basert på ukedag
 */
export function getTodayHookIdeas(): { theme: string; hookIdeas: string[] } {
    const today = new Date().getDay();
    return DAY_HOOKS[today];
}

/**
 * Generer sesongbaserte innholdsideer
 */
export function getSeasonalContent(): { event: string; ideas: string[] }[] {
    const now = new Date();
    const month = now.getMonth();

    const seasonal: { event: string; ideas: string[] }[] = [];

    // Januar
    if (month === 0) {
        seasonal.push({
            event: 'Nyttår & nye mål',
            ideas: [
                'Mine mål for året - og hvorfor de fleste feiler',
                'Glem nyttårsforsetter. Prøv dette i stedet:',
                'Det jeg IKKE gjør i år (like viktig som det jeg gjør)'
            ]
        });
    }

    // Mars-April (vår)
    if (month >= 2 && month <= 3) {
        seasonal.push({
            event: 'Vårrengjøring (karriere/business)',
            ideas: [
                'Tid for opprydding: 5 ting å kutte fra rutinen',
                'Vårens store prosjekt starter NÅ',
                'Q1 review: Hva funket, hva funket ikke'
            ]
        });
    }

    // Mai-Juni (sommer-forberedelse)
    if (month >= 4 && month <= 5) {
        seasonal.push({
            event: 'Sommerforberedelser',
            ideas: [
                'Slik forbereder jeg business for sommerferien',
                'Automasjon som lar meg ta fri med god samvittighet',
                'Sommermodus: Full stopp eller smart pause?'
            ]
        });
    }

    // August-September (høst-start)
    if (month >= 7 && month <= 8) {
        seasonal.push({
            event: 'Høststart & nye begynnelser',
            ideas: [
                'Høsten er den NYE januar. Her er planen:',
                'Tilbake fra ferie med én prioritet:',
                'Q3/Q4 push starter NÅ'
            ]
        });
    }

    // November-Desember
    if (month >= 10) {
        seasonal.push({
            event: 'Årsavslutning',
            ideas: [
                'Mine største lærdommer fra året',
                'Hva jeg hadde gjort annerledes i år',
                'Desember = planleggingsmåned. Her er min prosess:'
            ]
        });
    }

    return seasonal;
}

/**
 * Hent innholdsmiks-anbefalinger for uken
 */
export function getWeeklyContentMix(postsPerWeek: number = 5): {
    educational: number;
    storytelling: number;
    engagement: number;
    promotional: number;
} {
    // Optimal miks basert på beste praksis
    if (postsPerWeek <= 3) {
        return {
            educational: 1,
            storytelling: 1,
            engagement: 1,
            promotional: 0
        };
    }
    if (postsPerWeek <= 5) {
        return {
            educational: 2,
            storytelling: 1,
            engagement: 1,
            promotional: 1
        };
    }
    return {
        educational: Math.ceil(postsPerWeek * 0.3),
        storytelling: Math.ceil(postsPerWeek * 0.3),
        engagement: Math.ceil(postsPerWeek * 0.25),
        promotional: Math.ceil(postsPerWeek * 0.15)
    };
}

// ═══════════════════════════════════════════════════════════════
// BRAND-SPESIFIKKE FUNKSJONER
// ═══════════════════════════════════════════════════════════════

/**
 * Map industry til passende kategori
 */
function mapIndustryToCategory(industry?: string): string {
    if (!industry) return 'business';
    const lower = industry.toLowerCase();

    if (lower.includes('tech') || lower.includes('it') || lower.includes('software') || lower.includes('saas') || lower.includes('app')) {
        return 'tech';
    }
    if (lower.includes('marketing') || lower.includes('reklame') || lower.includes('byrå') || lower.includes('content') || lower.includes('media')) {
        return 'marketing';
    }
    if (lower.includes('norge') || lower.includes('norsk') || lower.includes('lokal')) {
        return 'norway';
    }

    return 'business';
}

/**
 * Hent trending topics tilpasset en spesifikk merkevare
 */
export function getTrendingTopicsForBrand(brand: Brand): TrendingTopic[] {
    const category = mapIndustryToCategory(brand.industry);
    const categoryTopics = CURATED_TOPICS[category] || CURATED_TOPICS.business;

    // Start med brandets egne contentPillars (høyest relevans)
    const brandTopics: TrendingTopic[] = [];

    if (brand.contentPillars && brand.contentPillars.length > 0) {
        brand.contentPillars.forEach(pillar => {
            brandTopics.push({
                name: pillar,
                category: 'general' as const,
                source: 'Din strategi'
            });
        });
    }

    // Legg til contentAngles fra brandBrief
    if (brand.brandBrief?.contentAngles) {
        brand.brandBrief.contentAngles.slice(0, 3).forEach(angle => {
            // Unngå duplikater med pillars
            if (!brandTopics.some(t => t.name.toLowerCase() === angle.toLowerCase())) {
                brandTopics.push({
                    name: angle,
                    category: 'general' as const,
                    source: 'Din analyse'
                });
            }
        });
    }

    // Kombiner: brand-spesifikke først, deretter kategori-relevante
    const combined = [...brandTopics, ...categoryTopics];

    // Fjern eventuelle duplikater og begrens til 8
    const seen = new Set<string>();
    const unique = combined.filter(topic => {
        const key = topic.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return unique.slice(0, 8);
}

/**
 * Hent hook-ideer tilpasset merkevaren
 */
export function getTodayHookIdeasForBrand(brand: Brand): { theme: string; hookIdeas: string[] }[] {
    const today = new Date().getDay();
    const baseHook = DAY_HOOKS[today];

    const hooks: { theme: string; hookIdeas: string[] }[] = [];

    // Legg til brand-spesifikke hooks fra contentAngles
    if (brand.brandBrief?.contentAngles) {
        const angles = brand.brandBrief.contentAngles.slice(0, 2);
        angles.forEach(angle => {
            hooks.push({
                theme: angle,
                hookIdeas: [
                    `Hvorfor ${angle.toLowerCase()} er viktigere enn du tror`,
                    `3 ting om ${angle.toLowerCase()} ingen snakker om`,
                    `Min erfaring med ${angle.toLowerCase()}:`
                ]
            });
        });
    }

    // Legg til brand-spesifikke hooks
    if (brand.brandBrief?.hooks) {
        hooks.push({
            theme: `${brand.name} hooks`,
            hookIdeas: brand.brandBrief.hooks.slice(0, 3)
        });
    }

    // Legg til dagens standard hooks
    hooks.push(baseHook);

    return hooks.slice(0, 4);
}

/**
 * Hent virale eksempler som passer merkevaren
 */
export function getViralExamplesForBrand(_brand: Brand, count: number = 5): ViralPost[] {
    // For nå returnerer vi de generelle eksemplene shufflet
    // I fremtiden kan vi filtrere basert på brand.vibe, industry etc.
    const shuffled = [...VIRAL_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
