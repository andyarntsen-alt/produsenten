import React, { useState } from 'react';
import { X, User, Copy, Check, Sparkles } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection, getPromptTranslations } from '../services/languagePrompts';
import type { Brand } from '../App';

interface BioGeneratorModalProps {
    brand?: Brand;
    onClose: () => void;
}

const BioGeneratorModal: React.FC<BioGeneratorModalProps> = ({ brand, onClose }) => {
    const { settings } = useSettings();
    const [keywords, setKeywords] = useState('');
    const [platform, setPlatform] = useState('instagram');
    const [bios, setBios] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const languageSection = buildLanguagePromptSection(settings.language);
    const t = getPromptTranslations(settings.language);
    const isEnglish = settings.language === 'en';

    // Build brand context if brand is provided
    const brandContext = brand ? `
${t.content.brandContext}:
- ${t.brand}: ${brand.name}
- ${t.tone}: ${brand.vibe}
${brand.targetAudience ? `- ${t.targetAudience}: ${brand.targetAudience}` : ''}
${brand.industry ? `- ${t.industry}: ${brand.industry}` : ''}
${brand.brandBrief?.valueProps?.length ? `- ${t.content.valueProps}: ${brand.brandBrief.valueProps.slice(0, 2).join(', ')}` : ''}
${brand.brandBrief?.brandPersonality ? `- ${t.content.personality}: ${brand.brandBrief.brandPersonality}` : ''}
` : '';

    const generateBios = async () => {
        if (!keywords.trim()) return;
        setIsLoading(true);
        setBios([]);

        try {
            const platformLimits: Record<string, string> = isEnglish ? {
                instagram: '150 chars',
                twitter: '160 chars',
                linkedin: '300 chars',
                tiktok: '80 chars'
            } : {
                instagram: '150 tegn',
                twitter: '160 tegn',
                linkedin: '300 tegn',
                tiktok: '80 tegn'
            };

            const prompt = `${languageSection}
${brandContext}

${t.bioGenerator.createBios} ${platform}.

${t.bioGenerator.keywords}: "${keywords}"

${t.bioGenerator.requirements}:
- ${t.bioGenerator.maxChars.replace('{limit}', platformLimits[platform])}
- ${t.bioGenerator.useLineBreaks}
- Max 2-3 emojis per bio

${isEnglish ? `FORBIDDEN CLICHÉS (NEVER USE):` : `FORBUDTE KLISJEER (ALDRI BRUK):`}
- "Passionate about..."
- "On a mission to..."
- "Living my best life"
- "Dreamer | Creator | Thinker"
- "Making the world a better place"
- "Coffee addict ☕"

${isEnglish ? `GOOD EXAMPLES:` : `GODE EKSEMPLER:`}
${isEnglish ? `
- "Writing about money. Without being annoying.\\n📍NYC"
- "Helping businesses with [X]\\nFormer: [Y]\\n👇 Free guide"
- "Making [complex thing] simple.\\nDMs open."
` : `
- "Skriver om penger. Uten å være irriterende.\\n📍Oslo"
- "Hjelper bedrifter med [X]\\nTidligere: [Y]\\n👇 Gratis guide"
- "Gjør [komplisert ting] enkelt.\\nDMs åpne."
`}

${isEnglish ? `STRUCTURE VARIATION:` : `STRUKTUR-VARIASJON:`}
${isEnglish ? `
1. Authority: Title | Helping X with Y | CTA
2. Listicle: 📍 + 🚀 + 👇 format
3. Personal: Interest + job + fun fact
4. Minimalist: Short value prop. Done.
5. Controversial: Hot take on the niche
` : `
1. Authority: Tittel | Hjelper X med Y | CTA
2. Listicle: 📍 + 🚀 + 👇 format
3. Personal: Interesse + jobb + fun fact
4. Minimalist: Kort verdiforslag. Ferdig.
5. Kontroversiell: Hot take om nisjen
`}

${t.bioGenerator.returnAsJson}:
["Bio 1", "Bio 2", "Bio 3", "Bio 4", "Bio 5"]`;

            const result = await callAIHumanized([
                { role: 'system', content: isEnglish ? 'You create social media bios. Reply only with JSON array.' : 'Du lager sosiale medier bios. Svar kun med JSON array.' },
                { role: 'user', content: prompt }
            ], { toolType: 'bio', includeValidation: false });

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);
                setBios(parsed);
            } catch {
                setBios(isEnglish ? [
                    "Writing about [topic]. No BS.\n📍 NYC",
                    "Helping [audience] with [problem]\nFormer: [X]\n👇 Free resources",
                    "Making [complex thing] simple.\nDMs open.",
                    "[Title] | [Short value prop]\n[URL]",
                    "Unpopular opinions about [niche].\nSometimes I'm wrong."
                ] : [
                    "Skriver om [tema]. Uten bullshit.\n📍 Oslo",
                    "Hjelper [målgruppe] med [problem]\nTidligere: [X]\n👇 Gratis ressurser",
                    "Gjør [komplisert ting] enkelt.\nDMs åpne.",
                    "[Tittel] | [Kort verdiforslag]\n[URL]",
                    "Upopulære meninger om [nisje].\nNoen ganger tar jeg feil."
                ]);
            }
        } catch (err) {
            console.error('Bio generation failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyBio = (bio: string, index: number) => {
        navigator.clipboard.writeText(bio);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <User size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Bio Generator</h2>
                            <p className="text-white/70 text-sm">Lag den perfekte profil-bio</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Plattform</label>
                            <select
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            >
                                <option value="instagram">Instagram (150 tegn)</option>
                                <option value="twitter">Twitter/X (160 tegn)</option>
                                <option value="linkedin">LinkedIn (300 tegn)</option>
                                <option value="tiktok">TikTok (80 tegn)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Beskriv deg/brandet</label>
                            <textarea
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="F.eks: Matblogger, Oslo, vegansk mat, oppskrifter, mor til 2, elsker turer..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>
                    </div>

                    <button
                        onClick={generateBios}
                        disabled={isLoading || !keywords.trim()}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <Sparkles size={18} />
                        )}
                        {isLoading ? 'Genererer...' : 'Generer Bios'}
                    </button>

                    {/* Results */}
                    {bios.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Velg din favoritt</p>
                            {bios.map((bio, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-violet-300 transition-all group"
                                >
                                    <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{bio}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{bio.length} tegn</span>
                                        <button
                                            onClick={() => copyBio(bio, i)}
                                            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                                            {copiedIndex === i ? 'Kopiert!' : 'Kopier'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BioGeneratorModal;
