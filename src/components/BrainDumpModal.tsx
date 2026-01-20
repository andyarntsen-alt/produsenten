import React, { useState } from 'react';
import { X, Brain, Sparkles, Zap } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useToast } from './ToastContext';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection } from '../services/languagePrompts';
import type { Brand } from '../App';

interface BrainDumpModalProps {
    brand: Brand;
    onClose: () => void;
    onCreatePosts: (posts: { text: string; hook: string; formatType: string }[]) => void;
}

const BrainDumpModal: React.FC<BrainDumpModalProps> = ({ brand, onClose, onCreatePosts }) => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const [thoughts, setThoughts] = useState('');
    const [postCount, setPostCount] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPosts, setGeneratedPosts] = useState<{ text: string; hook: string; formatType: string }[]>([]);

    const languageSection = buildLanguagePromptSection(settings.language);

    // Build comprehensive brand context
    const brandContext = `
BRAND-KONTEKST:
- Merkevare: ${brand.name}
- Tone: ${brand.vibe}
${brand.targetAudience ? `- Målgruppe: ${brand.targetAudience}` : ''}
${brand.brandBrief?.audiencePainPoints?.length ? `- Målgruppens smertepunkter: ${brand.brandBrief.audiencePainPoints.slice(0, 3).join(', ')}` : ''}
${brand.brandBrief?.contentAngles?.length ? `- Innholdsvinkler: ${brand.brandBrief.contentAngles.slice(0, 3).join(', ')}` : ''}
${brand.personaKernel?.voiceSignature ? `- Stemmesignatur: ${brand.personaKernel.voiceSignature}` : ''}
${brand.personaKernel?.coreBelief ? `- Kjerneoverbevisning: ${brand.personaKernel.coreBelief}` : ''}
`;

    const generatePosts = async () => {
        if (!thoughts.trim()) {
            showToast('Skriv ned tankene dine først!', 'warning');
            return;
        }
        setIsLoading(true);
        setGeneratedPosts([]);

        try {
            const prompt = `${languageSection}
${brandContext}

Du er en kreativ innholdsstrateg. Brukeren har skrevet ned tanker og ideer fritt:

"""
${thoughts}
"""

Lag ${postCount} unike sosiale medier-poster basert på disse tankene.
Postene skal matche merkevarens tone og treffe målgruppens smertepunkter.

KRITISKE REGLER:
1. TREKK UT kjerneideene fra teksten - ikke bare omskriv
2. Hver post skal ha en unik vinkling/perspektiv
3. Varier lengden: 1 kort (under 200 tegn), 1 medium (300-500 tegn), resten varierer
4. Behold brukerens stemme og personlighet
5. Hooks skal stoppe scrollingen - kontroversiell, personlig, eller overraskende

HUMANISERING:
- Varier setningslengden (kort, lang, kort)
- Bruk "jeg/du", aldri "man"
- ALDRI start med "Her er..." eller "Visste du at..."
- ALDRI avslutt med "Hva tenker du?" eller "Lykke til!"
- Føles som ekte person, ikke AI

FORMAT-TYPER å bruke:
- "hot-take" - Kontroversiell mening
- "story" - Personlig historie
- "tip" - Praktisk tips
- "question" - Engasjerende spørsmål
- "list" - Nummerert liste
- "observation" - Innsikt/observasjon

Returner KUN JSON array:
[
  {
    "text": "Hele postteksten...",
    "hook": "Første linje/hook",
    "formatType": "hot-take"
  }
]`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du konverterer brukerens tanker til sosiale medier-poster. Behold deres stemme. Svar kun med JSON array.' },
                { role: 'user', content: prompt }
            ], { toolType: 'content', includeValidation: true });

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const posts = JSON.parse(match ? match[0] : result);
                setGeneratedPosts(posts);
            } catch {
                // Fallback
                showToast('Kunne ikke parse AI-svar. Prøver fallback...', 'warning');
                setGeneratedPosts([
                    { text: thoughts.slice(0, 280), hook: thoughts.split('.')[0], formatType: 'observation' }
                ]);
            }
        } catch (err) {
            console.error('Brain dump failed:', err);
            showToast('Kunne ikke generere poster. Sjekk API-nøkkel.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const selectPost = (post: { text: string; hook: string; formatType: string }) => {
        onCreatePosts([post]);
        showToast('Post lagt til!', 'success');
    };

    const selectAll = () => {
        onCreatePosts(generatedPosts);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Brain size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Brain Dump</h2>
                            <p className="text-white/70 text-sm">Skriv tanker fritt, AI lager poster</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Input */}
                    <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                            Dump tankene dine her (stikkord, setninger, ideer - alt fungerer)
                        </label>
                        <textarea
                            value={thoughts}
                            onChange={(e) => setThoughts(e.target.value)}
                            placeholder="Skriv fritt... F.eks:

- Vi lanserte akkurat ny feature
- Kunder spør alltid om X
- Min upopulære mening er at...
- Jeg lærte noe viktig i dag
- Frustrert over bransjens fokus på..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600">Antall poster:</label>
                                <select
                                    value={postCount}
                                    onChange={(e) => setPostCount(Number(e.target.value))}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                >
                                    <option value={1}>1 post</option>
                                    <option value={3}>3 poster</option>
                                    <option value={5}>5 poster</option>
                                    <option value={7}>7 poster</option>
                                </select>
                            </div>
                            <span className="text-xs text-gray-400">{thoughts.length} tegn</span>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generatePosts}
                        disabled={isLoading || !thoughts.trim()}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Konverterer tanker til poster...
                            </>
                        ) : (
                            <>
                                <Zap size={18} />
                                Generer {postCount} poster
                            </>
                        )}
                    </button>

                    {/* Results */}
                    {generatedPosts.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                                    Genererte poster ({generatedPosts.length})
                                </p>
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1"
                                >
                                    <Sparkles size={14} />
                                    Legg til alle
                                </button>
                            </div>

                            {generatedPosts.map((post, i) => (
                                <div
                                    key={i}
                                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-amber-300 transition-all group"
                                >
                                    <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                                                {post.formatType}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {post.text.length} tegn
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => selectPost(post)}
                                            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded-full font-bold transition-all"
                                        >
                                            Legg til
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                            {post.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tips */}
                    {generatedPosts.length === 0 && !isLoading && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                            <p className="text-sm text-amber-800 font-medium mb-2">Tips for bedre resultater:</p>
                            <ul className="text-xs text-amber-700 space-y-1">
                                <li>• Skriv konkrete erfaringer eller observasjoner</li>
                                <li>• Del meninger du brenner for</li>
                                <li>• Nevn spesifikke utfordringer eller seire</li>
                                <li>• Stikkord fungerer like bra som hele setninger</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrainDumpModal;
