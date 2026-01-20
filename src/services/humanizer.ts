// Humanizer Service - Sentralisert humaniseringslag for AI-generert innhold
// Sikrer at alt innhold høres menneskelig ut og unngår typiske AI-mønstre

import { callAI } from './ai';

// ═══════════════════════════════════════════════════════════════
// UTVIDET ALDRI-LISTE (FORBUDTE AI-MØNSTRE)
// ═══════════════════════════════════════════════════════════════

export const ALDRI_LISTE = {
    // Forbudte åpninger - disse skriker "AI"
    forbiddenOpenings: [
        'Selvfølgelig!',
        'Absolutt!',
        'Det er et flott spørsmål!',
        'Det er et godt spørsmål!',
        'Takk for at du spurte!',
        'La meg forklare',
        'La meg hjelpe deg',
        'Det er viktig å merke seg at',
        'Først og fremst',
        'For det første',
        'I en verden der',
        'Det finnes mange måter å',
        'Nå som aldri før',
        'I denne artikkelen',
        'Her er noen tips',
        'Her er 5 tips',
        'Her er mine beste tips',
        'Vel,',
        'Så,',
        'Interessant nok,',
    ],

    // Forbudte fraser - typiske AI-klisjeer
    forbiddenPhrases: [
        'er avgjørende for',
        'er essensielt for',
        'er viktig å huske',
        'det er verdt å nevne',
        'ta det til neste nivå',
        'utnytte potensialet',
        'maksimere potensialet',
        'i bunn og grunn',
        'på slutten av dagen',
        'når alt kommer til alt',
        'ikke bare... men også',
        'det er ingen hemmelighet at',
        'la oss utforske',
        'la oss dykke inn i',
        'det skal sies',
        'med andre ord',
        'i virkeligheten',
        'dette handler om å',
        'det handler om mer enn',
        'slik er det faktisk',
        'for å være ærlig',
        'uten tvil',
        'utvilsomt',
        'det kan ikke understrekes nok',
        'det er klart at',
        'som vi alle vet',
        'det er allment kjent',
        'i dagens samfunn',
        'i den moderne verden',
        'i en stadig mer',
        'tilpasse seg den nye virkeligheten',
        'navigere i',
        'dra nytte av',
        'ta i bruk',
        'implementere',
        'optimalisere',
        'strømlinjeforme',
        'synergier',
        'paradigmeskifte',
        // Grammatikkfeil (feiloversettelser fra engelsk)
        'er om å',      // Feil: "er om å bygge" → "handler om å bygge"
    ],

    // Forbudte avslutninger
    forbiddenClosings: [
        'Lykke til!',
        'Håper det hjelper!',
        'Håper dette var nyttig!',
        'Ikke nøl med å spørre',
        'Ta gjerne kontakt',
        'Del gjerne dine tanker',
        'Gi meg beskjed i kommentarene',
        'Hva tenker du?',  // Når det kommer helt på slutten som en CTA
        'Legg igjen en kommentar',
        'Følg for mer',
        'Like og del',
    ],

    // Strukturelle mønstre å unngå
    forbiddenStructures: [
        'For det første... For det andre... Til slutt',
        'Punkt 1... Punkt 2... Punkt 3',
        'Oppsummert sett',
        'Avslutningsvis',
        'Konklusjonen er',
        'Alt i alt',
    ],

    // Norske AI-tegn (mer subtile)
    norwegianAITells: [
        ' man ', // Bruk av "man" i stedet for jeg/du/vi
        'Man kan',
        'Man bør',
        'Man må',
        'Det anbefales',
        'Det foreslås',
        'Det kan konstateres',
    ],
};

// ═══════════════════════════════════════════════════════════════
// HUMANISERINGS-REGLER
// ═══════════════════════════════════════════════════════════════

export const HUMANIZER_RULES = `
═══════════════════════════════════════════════════════════════
🎭 HUMANIZER PROTOCOL - SKRIV SOM ET MENNESKE
═══════════════════════════════════════════════════════════════

DU ER EN EKTE NORDMANN SOM SKRIVER. Alt du produserer skal være UMULIG å skille fra tekst skrevet av en ekte person.

ALDRI START MED:
- "Selvfølgelig!" / "Absolutt!" / "Det er et flott spørsmål!"
- "La meg forklare..." / "Først og fremst..."
- "Her er X tips for..." / "I en verden der..."
- Noe som høres ut som en kundeservice-bot

ALDRI AVSLUTT MED:
- "Lykke til!" / "Håper det hjelper!"
- "Ikke nøl med å spørre!" / "Del gjerne dine tanker!"
- "Følg for mer!" / "Like og del!"

ALDRI BRUK DISSE FRASENE:
- "er avgjørende for" / "ta det til neste nivå"
- "utnytte potensialet" / "i bunn og grunn"
- "på slutten av dagen" / "når alt kommer til alt"
- "la oss utforske" / "det skal sies"
- "i dagens samfunn" / "i en stadig mer [adjektiv] verden"

ALDRI BRUK "MAN":
- ❌ "Man kan..." / "Man bør..."
- ✅ "Du kan..." / "Jeg..." / "Vi..."

KRAV TIL MENNESKELIGHET:

1. VARIASJON I SETNINGSLENGDE (KRITISK):
   - 40% korte: "Nei." "Sant." "Funker."
   - 40% medium: "Det er faktisk ganske kult."
   - 20% lange: "Det som folk ikke skjønner er at..."
   → ALDRI bare én type!

2. START STERKT:
   - Rett på sak, ingen intro
   - Hook i første setning
   - Kontrast, spørsmål eller påstand

3. KONKRETE DETALJER:
   - ✅ "Klokka 14:37 i går" (ikke "tidligere")
   - ✅ "68 kroner" (ikke "litt penger")
   - ✅ "Min kollega Trond" (ikke "en kollega")

4. UFULLKOMMENHETER:
   - Noen setninger kan være uavsluttede...
   - "lol" i stedet for "haha"
   - "btw", "ngl", "lowkey" er OK
   - Perfekt grammatikk HVER gang = AI

5. SPØRSMÅL:
   - Bryt opp tekst med spørsmål
   - Retoriske, ikke søk etter svar
   - IKKE på slutten som billig CTA

6. EMOJIS:
   - UNNGÅ emojis i de fleste poster
   - Maks 1 post kan ha 1 emoji, resten UTEN
   - Teksten skal fungere uten visuelle krykker

7. PERSONLIGHET:
   - Ha en mening
   - Tør å være litt frekk
   - Selvironi fungerer alltid
   - Unngå å være "safe"

NORSK AUTENTISITET:
- Casual tone (vi er ikke formelle)
- OK med engelske lånord
- Muntlig flyt > perfekt grammatikk
- Korte avsnitt, mye luft
- Nordmenn er direkte, ikke "fluffy"
`;

// ═══════════════════════════════════════════════════════════════
// VERKTØY-SPESIFIKKE REGLER
// ═══════════════════════════════════════════════════════════════

export type ToolType =
    | 'content'
    | 'bio'
    | 'comment'
    | 'hashtag'
    | 'hook'
    | 'repurpose'
    | 'voice'
    | 'pitch'
    | 'linkedin'
    | 'thread'
    | 'shorten';

const TOOL_SPECIFIC_RULES: Record<ToolType, string> = {
    content: `
INNHOLDSGENERERING:
- Varier formater: spørsmål, påstand, historie, liste
- Aldri samme struktur to ganger på rad
- Hook i første setning ALLTID
- Deep dives skal være 1000+ tegn med substans`,

    bio: `
BIO-GENERERING:
- Kort og punchy
- Personlighet > profesjonalitet
- Unngå klisjeer som "Passionate about..."
- Bruk linjeskift for lesbarhet
- Emojis som kulepunkter er OK`,

    comment: `
KOMMENTAR-SVAR:
- ULTRA-kort (1-2 setninger maks)
- Føl deg som en venn, ikke en brand
- Humor/selvironi fungerer
- Unngå "Tusen takk!" som åpning
- Spør tilbake når det passer`,

    hashtag: `
HASHTAG-GENERERING:
- Relevante, ikke generiske
- Mix av populære og nisje
- Norske hashtags der det passer
- Unngå #Inspirasjon #Motivasjon (overbrukt)`,

    hook: `
HOOK-GENERERING:
- Kontroversiell eller nysgjerrighetsvekkende
- Under 10 ord ideelt
- Skal stoppe scrollingen
- Unngå "Visste du at..."`,

    repurpose: `
REPURPOSING:
- Tilpass til plattform, behold stemmen
- Twitter: kort og punchy
- LinkedIn: litt mer substans, fortsatt personlig
- Instagram: storytelling, følelser`,

    voice: `
STEMME TIL TEKST:
- Behold brukerens naturlige måte å snakke på
- Rydd opp grammatikk, men ikke personlighet
- Føles som "polert versjon av meg"`,

    pitch: `
SPONSOR-PITCH:
- Profesjonell MEN personlig
- Ikke templateaktig
- Vis at du faktisk kjenner brandet
- Konkrete samarbeidsideer
- Under 200 ord`,

    linkedin: `
LINKEDIN-VERSJON:
- Luftig formatering med linjeskift
- Dypere enn tweet, men ikke essay
- Profesjonell personlighet
- Ingen hashtag-spam`,

    thread: `
LONG-FORM/THREAD:
- 500-1000 tegn
- Gå i dybden med eksempler
- Linjeskift for å skape luft
- Start rett på sak`,

    shorten: `
FORKORTELSE:
- Fjern fyllord
- Behold kjernebudskapet
- Gjør det punchier
- Maks 280 tegn for tweets`,
};

// ═══════════════════════════════════════════════════════════════
// GRAMMATIKK-FIKS (Post-processing)
// ═══════════════════════════════════════════════════════════════

/**
 * Retter vanlige grammatikkfeil som AI gjør på norsk
 * Kjøres automatisk på all output fra callAIHumanized
 */
export function fixNorwegianGrammar(text: string): string {
    let fixed = text;

    // "er om å" → "handler om å" (feil oversettelse av "is about")
    fixed = fixed.replace(/\ber om å\b/gi, 'handler om å');

    // "det er om" → "det handler om"
    fixed = fixed.replace(/\bdet er om\b/gi, 'det handler om');

    // "en solid grunnlage" → "et solid grunnlag" (grunnlag = intetkjønn)
    fixed = fixed.replace(/\ben solide? grunnlage?\b/gi, 'et solid grunnlag');

    // "en grunnlage" → "et grunnlag"
    fixed = fixed.replace(/\ben grunnlage\b/gi, 'et grunnlag');

    // "grunnlage" → "grunnlag" (feil bøying)
    fixed = fixed.replace(/\bgrunnlage\b/g, 'grunnlag');

    return fixed;
}

// ═══════════════════════════════════════════════════════════════
// VALIDERING AV MENNESKELIGHET
// ═══════════════════════════════════════════════════════════════

export interface HumannessValidation {
    score: number;
    issues: string[];
    passed: boolean;
}

export function validateHumanness(text: string): HumannessValidation {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();

    // Sjekk forbudte åpninger
    for (const opening of ALDRI_LISTE.forbiddenOpenings) {
        if (lowerText.startsWith(opening.toLowerCase())) {
            issues.push(`Starter med AI-mønster: "${opening}"`);
        }
    }

    // Sjekk forbudte fraser
    for (const phrase of ALDRI_LISTE.forbiddenPhrases) {
        if (lowerText.includes(phrase.toLowerCase())) {
            issues.push(`Inneholder AI-frase: "${phrase}"`);
        }
    }

    // Sjekk forbudte avslutninger
    for (const closing of ALDRI_LISTE.forbiddenClosings) {
        if (lowerText.endsWith(closing.toLowerCase()) ||
            lowerText.endsWith(closing.toLowerCase() + '!') ||
            lowerText.endsWith(closing.toLowerCase() + '.')) {
            issues.push(`Avslutter med AI-mønster: "${closing}"`);
        }
    }

    // Sjekk bruk av "man"
    for (const tell of ALDRI_LISTE.norwegianAITells) {
        if (lowerText.includes(tell.toLowerCase())) {
            issues.push(`Bruker "man" i stedet for jeg/du/vi`);
            break;
        }
    }

    // Sjekk setningslengde-variasjon
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLength, 2), 0) / lengths.length;

        if (variance < 5) {
            issues.push('For lite variasjon i setningslengde');
        }
    }

    // Sjekk for spørsmål i lengre tekster
    if (text.length > 300 && !text.includes('?')) {
        issues.push('Mangler spørsmål for å bryte opp teksten');
    }

    // Sjekk for overbruk av emojis (strengere nå - vi vil ha minimalt)
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu) || []).length;
    if (emojiCount > 1) {
        issues.push('For mange emojis (maks 1 per post, helst ingen)');
    }

    // Beregn score
    const score = Math.max(0, 100 - (issues.length * 20));

    return {
        score,
        issues,
        passed: score >= 60,
    };
}

// ═══════════════════════════════════════════════════════════════
// HUMANISERT AI-KALL
// ═══════════════════════════════════════════════════════════════

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface HumanizerOptions {
    toolType: ToolType;
    includeValidation?: boolean;
    maxRetries?: number;
}

/**
 * Bygger et humanisert system-prompt basert på verktøytype
 */
export function buildHumanizerSystemPrompt(toolType: ToolType, basePrompt: string = ''): string {
    const toolRules = TOOL_SPECIFIC_RULES[toolType] || '';

    return `${basePrompt}

${HUMANIZER_RULES}

${toolRules}

HUSK: Du er et MENNESKE. Skriv som deg selv, ikke som en AI.`.trim();
}

/**
 * Kaller AI med automatisk humanisering og valgfri validering/re-generering
 */
export async function callAIHumanized(
    messages: ChatMessage[],
    options: HumanizerOptions
): Promise<string> {
    const { toolType, includeValidation = true, maxRetries = 2 } = options;

    // Inject humaniserings-regler i system-meldingen
    const humanizedMessages = messages.map((msg, index) => {
        if (index === 0 && msg.role === 'system') {
            return {
                ...msg,
                content: buildHumanizerSystemPrompt(toolType, msg.content),
            };
        }
        return msg;
    });

    // Hvis første melding ikke er system, legg til en
    if (humanizedMessages[0]?.role !== 'system') {
        humanizedMessages.unshift({
            role: 'system',
            content: buildHumanizerSystemPrompt(toolType),
        });
    }

    let result = await callAI(humanizedMessages);

    // Post-processing: Fiks vanlige grammatikkfeil som AI-en gjør
    result = fixNorwegianGrammar(result);

    // Hvis validering er aktivert, sjekk og re-generer ved behov
    if (includeValidation) {
        let attempts = 0;
        const conversationHistory = [...humanizedMessages];

        while (attempts < maxRetries) {
            const validation = validateHumanness(result);

            if (validation.passed) {
                return result;
            }

            console.log(`[Humanizer] Validering feilet (score: ${validation.score}), forsøk ${attempts + 1}/${maxRetries}`);
            console.log(`[Humanizer] Problemer:`, validation.issues);

            // Legg til feedback og be om ny versjon
            conversationHistory.push({ role: 'assistant', content: result });
            conversationHistory.push({
                role: 'user',
                content: `Teksten høres for "AI-aktig" ut. Problemer: ${validation.issues.join(', ')}.

Skriv om HELT fra scratch. Vær mer naturlig, muntlig, og norsk. Start annerledes, bruk "jeg/du/vi", varier setningslengdene.`,
            });

            result = await callAI(conversationHistory);
            attempts++;
        }

        console.log(`[Humanizer] Maks forsøk nådd, returnerer siste versjon`);
    }

    return result;
}

/**
 * Enkel wrapper for å humanisere en eksisterende tekst
 */
export async function humanizeText(text: string, toolType: ToolType = 'content'): Promise<string> {
    return callAIHumanized([
        {
            role: 'system',
            content: 'Du skal skrive om teksten under slik at den høres mer menneskelig og naturlig ut.',
        },
        {
            role: 'user',
            content: `Skriv om denne teksten til å høres mer naturlig og menneskelig ut:\n\n"${text}"`,
        },
    ], { toolType, includeValidation: true });
}
