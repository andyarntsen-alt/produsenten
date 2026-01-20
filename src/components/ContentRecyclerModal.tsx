import React, { useState, useMemo } from 'react';
import { X, Recycle, Sparkles } from 'lucide-react';
import type { Brand, Tweet } from '../App';
import { callAIHumanized } from '../services/humanizer';
import { getDefaultPersona, buildSystemPrompt } from '../services/personaSystem';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection } from '../services/languagePrompts';

interface ContentRecyclerModalProps {
    brand: Brand;
    onClose: () => void;
    onRecycle: (post: Tweet) => void;
}

const ContentRecyclerModal: React.FC<ContentRecyclerModalProps> = ({ brand, onClose, onRecycle }) => {
    const { settings } = useSettings();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const languageSection = buildLanguagePromptSection(settings.language);

    // Generate stable random scores for posts without metrics (seeded by post index)
    const [randomScores] = useState(() =>
        brand.posts.map((_, index) => Math.floor(50 + ((index * 17 + 13) % 50)))
    );

    // Find posts that could be recycled (approved posts, simulating "old high performers")
    const recyclablePosts = useMemo(() => {
        return brand.posts
            .filter(p => p.status === 'approved')
            .map((post, index) => ({
                ...post,
                originalIndex: index,
                // Simulate performance score based on metrics or use stable random score
                performanceScore: post.metrics?.likes
                    ? Math.round((post.metrics.likes / (post.metrics.impressions || 1000)) * 100)
                    : randomScores[index] || 50
            }))
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .slice(0, 10);
    }, [brand.posts, randomScores]);

    const handleRecycle = async () => {
        if (selectedIndex === null) return;
        setIsLoading(true);
        const post = recyclablePosts[selectedIndex];

        try {
            // Get persona context
            const basePersona = getDefaultPersona(brand.name, brand.vibe);
            const persona = brand.personaKernel ? { ...basePersona, ...brand.personaKernel } : basePersona;

            // Build persona system prompt
            const systemContent = buildSystemPrompt({
                persona,
                platform: 'linkedin', // Defaulting to LinkedIn/Long-form style for recycling usually
                format: 'lang',
                goal: 'engasjering'
            });

            // Specific prompt for recycling with stronger humanizer instructions
            const userPrompt = `${languageSection}

Jeg vil at du skal omskrive denne gamle posten slik at den føles helt ny og frisk.
            
GAMMEL POST:
"${post.text}"

DINE INSTRUKSER:
1. Behold kjernebudskapet (hva handlet den om?)
2. Endre vinklingen (start med hook, spørsmål eller konklusjon)
3. Gjør språket mer muntlig og naturlig ("humanizer")
4. Fjern alle klisjeer
5. IKKE bruk merkelapper som [RESIRKULERT]. Det skal se ut som en helt ny tanke.

Returner KUN den nye teksten.`;

            const recycledText = await callAIHumanized([
                { role: 'system', content: systemContent },
                { role: 'user', content: userPrompt }
            ], { toolType: 'content', includeValidation: true });

            onRecycle({
                ...post,
                status: 'draft',
                text: recycledText.replace(/^["']|["']$/g, '').trim(),
            });

            onClose();

        } catch (error) {
            console.error('Recycle failed:', error);
            alert('Kunne ikke resirkulere innhold. Sjekk konsollen.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-lime-500 to-green-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Recycle size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Content Recycler</h2>
                            <p className="text-white/70 text-sm">Gjenbruk dine beste poster</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {recyclablePosts.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Recycle className="mx-auto mb-4 opacity-30" size={48} />
                            <p>Ingen godkjente poster å resirkulere ennå.</p>
                            <p className="text-sm mt-2">Godkjenn noen poster først, så dukker de opp her!</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500">
                                Velg en post å resirkulere. Den vil bli lagt til som et nytt utkast.
                            </p>

                            <div className="space-y-3">
                                {recyclablePosts.map((post, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedIndex(i)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedIndex === i
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${post.performanceScore >= 70 ? 'bg-green-100 text-green-700' :
                                                post.performanceScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {post.performanceScore}%
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {post.hook && (
                                                    <p className="font-bold text-gray-800 text-sm mb-1 truncate">{post.hook}</p>
                                                )}
                                                <p className="text-gray-600 text-sm line-clamp-2">{post.text}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleRecycle}
                                disabled={selectedIndex === null || isLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <Sparkles size={18} />
                                )}
                                {isLoading ? 'Resirkulerer...' : 'Resirkuler denne posten'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentRecyclerModal;
