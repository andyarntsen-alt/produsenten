import React, { useState, useEffect } from 'react';
import { X, Wand2, Zap, TrendingUp, Scissors, Flame } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useToast } from './ToastContext';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection, getPromptTranslations } from '../services/languagePrompts';
import type { Brand } from '../App';

interface PostImproverModalProps {
    brand: Brand;
    onClose: () => void;
    originalPost: string;
    onSelectVersion: (text: string) => void;
}

interface ImprovedVersion {
    type: 'hook' | 'shorter' | 'controversial';
    label: string;
    icon: React.ReactNode;
    text: string;
    explanation: string;
}

const PostImproverModal: React.FC<PostImproverModalProps> = ({ brand, onClose, originalPost, onSelectVersion }) => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [versions, setVersions] = useState<ImprovedVersion[]>([]);

    const languageSection = buildLanguagePromptSection(settings.language);
    const t = getPromptTranslations(settings.language);
    const isEnglish = settings.language === 'en';

    // Build brand context for persona-aware improvements
    const brandContext = `
${t.content.brandContext}:
- ${t.brand}: ${brand.name}
- ${t.tone}: ${brand.vibe}
${brand.targetAudience ? `- ${t.targetAudience}: ${brand.targetAudience}` : ''}
${brand.brandBrief?.audiencePainPoints?.length ? `- ${t.content.painPoints}: ${brand.brandBrief.audiencePainPoints.slice(0, 3).join(', ')}` : ''}
${brand.personaKernel?.voiceSignature ? `- ${t.content.voiceSignature}: ${brand.personaKernel.voiceSignature}` : ''}
${brand.brandBrief?.controversialTakes?.length ? `- ${t.content.controversialTakes}: ${brand.brandBrief.controversialTakes.slice(0, 2).join(', ')}` : ''}
`;

    useEffect(() => {
        generateImprovedVersions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateImprovedVersions = async () => {
        setIsLoading(true);

        try {
            const prompt = `${languageSection}
${brandContext}

${isEnglish ? `Analyze this post and create 3 improved versions that match the brand voice and resonate with the target audience:

${t.postImprover.original}:
"${originalPost}"

${t.postImprover.createVersions}:

1. **${t.postImprover.strongerHook}** (type: "hook")
   - ${t.postImprover.keepMessage}, ${t.postImprover.rewriteOpening}
   - Hooks that stop scrolling: contrast, provocation, numbers, personal story
   - NEVER "Did you know..." or "Here's..."

2. **${t.postImprover.shorterVersion}** (type: "shorter")
   - ${t.postImprover.cutLength}
   - Keep the core message
   - Remove filler words and unnecessary context
   - Should be punchy and direct

3. **${t.postImprover.controversialTake}** (type: "controversial")
   - ${t.postImprover.addEdge}
   - Trigger debate and engagement
   - Challenge the status quo
   - Can be an unpopular opinion

HUMANIZATION (all versions):
- Vary sentence length
- Use "I/you", never "one"
- NEVER end with "Good luck!" or "What do you think?"
- Feel like a real person

Return ONLY JSON array:` : `Analyser denne posten og lag 3 forbedrede versjoner som matcher merkevarens stemme og treffer målgruppen:

${t.postImprover.original}:
"${originalPost}"

${t.postImprover.createVersions}:

1. **${t.postImprover.strongerHook}** (type: "hook")
   - ${t.postImprover.keepMessage}, ${t.postImprover.rewriteOpening}
   - Hooks som stopper scrolling: kontrast, provokasjon, tall, personlig historie
   - ALDRI "Visste du at..." eller "Her er..."

2. **${t.postImprover.shorterVersion}** (type: "shorter")
   - ${t.postImprover.cutLength}
   - Behold kjernebudskapet
   - Fjern fyllord og unødvendig kontekst
   - Skal være punchy og direkte

3. **${t.postImprover.controversialTake}** (type: "controversial")
   - ${t.postImprover.addEdge}
   - Trigger debatt og engasjement
   - Utfordre status quo
   - Kan være upopulær mening

HUMANISERING (alle versjoner):
- Varier setningslengden
- Bruk "jeg/du", aldri "man"
- ALDRI avslutt med "Lykke til!" eller "Hva tenker du?"
- Føles som ekte person

Returner KUN JSON array:`}
[
  {
    "type": "hook",
    "text": "${isEnglish ? 'Improved version...' : 'Forbedret versjon...'}",
    "explanation": "${isEnglish ? 'Short explanation of what was changed' : 'Kort forklaring på hva som ble endret'}"
  },
  {
    "type": "shorter",
    "text": "...",
    "explanation": "..."
  },
  {
    "type": "controversial",
    "text": "...",
    "explanation": "..."
  }
]`;

            const result = await callAIHumanized([
                { role: 'system', content: isEnglish ? 'You improve social media posts. Reply only with JSON array.' : 'Du forbedrer sosiale medier-poster. Svar kun med JSON array.' },
                { role: 'user', content: prompt }
            ], { toolType: 'content', includeValidation: true });

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);

                const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = isEnglish ? {
                    hook: { label: 'Stronger Hook', icon: <TrendingUp size={18} /> },
                    shorter: { label: 'Shorter', icon: <Scissors size={18} /> },
                    controversial: { label: 'Controversial', icon: <Flame size={18} /> }
                } : {
                    hook: { label: 'Sterkere Hook', icon: <TrendingUp size={18} /> },
                    shorter: { label: 'Kortere', icon: <Scissors size={18} /> },
                    controversial: { label: 'Kontroversielt', icon: <Flame size={18} /> }
                };

                const withLabels: ImprovedVersion[] = parsed.map((v: { type: string; text: string; explanation: string }) => ({
                    ...v,
                    label: typeConfig[v.type]?.label || v.type,
                    icon: typeConfig[v.type]?.icon || <Wand2 size={18} />
                }));

                setVersions(withLabels);
            } catch {
                showToast(isEnglish ? 'Could not parse AI response' : 'Kunne ikke parse AI-svar', 'error');
            }
        } catch (err) {
            console.error('Post improver failed:', err);
            showToast(isEnglish ? 'Could not improve post. Check API key.' : 'Kunne ikke forbedre post. Sjekk API-nøkkel.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const selectVersion = (text: string) => {
        onSelectVersion(text);
        onClose();
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'hook': return 'from-blue-500 to-indigo-500 bg-blue-50 border-blue-200';
            case 'shorter': return 'from-green-500 to-emerald-500 bg-green-50 border-green-200';
            case 'controversial': return 'from-red-500 to-orange-500 bg-red-50 border-red-200';
            default: return 'from-gray-500 to-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Wand2 size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Post Improver</h2>
                            <p className="text-white/70 text-sm">AI-forbedringer av posten din</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Original */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-2">
                            Original post
                        </label>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{originalPost}</p>
                        <span className="text-xs text-gray-400 mt-2 block">{originalPost.length} tegn</span>
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Analyserer og forbedrer...</p>
                        </div>
                    )}

                    {/* Versions */}
                    {versions.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                                Forbedrede versjoner (klikk for å velge)
                            </p>

                            {versions.map((version, i) => {
                                const colors = getTypeColor(version.type);
                                const [gradientColors, bgColor, borderColor] = colors.split(' ');

                                return (
                                    <button
                                        key={i}
                                        onClick={() => selectVersion(version.text)}
                                        className={`w-full text-left rounded-xl overflow-hidden border ${borderColor} ${bgColor} hover:shadow-lg transition-all group`}
                                    >
                                        <div className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${gradientColors} text-white`}>
                                            {version.icon}
                                            <span className="font-bold text-sm">{version.label}</span>
                                            <span className="ml-auto text-xs opacity-70">
                                                {version.text.length} tegn
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed mb-3">
                                                {version.text}
                                            </p>
                                            <p className="text-xs text-gray-500 italic">
                                                {version.explanation}
                                            </p>
                                        </div>
                                        <div className="px-4 pb-3">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                                                Velg denne versjonen →
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Regenerate */}
                    {versions.length > 0 && !isLoading && (
                        <button
                            onClick={generateImprovedVersions}
                            className="w-full text-gray-500 hover:text-gray-700 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Zap size={16} />
                            Generer nye forslag
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostImproverModal;
