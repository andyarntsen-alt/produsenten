import React, { useState } from 'react';
import { X, RefreshCw, Linkedin, Twitter } from 'lucide-react';
import { callAI } from '../services/ai';
import { useToast } from './ToastContext';

interface RepurposeModalProps {
    onClose: () => void;
    onCreatePosts: (posts: { text: string; hook: string; platform: string }[]) => void;
}

const RepurposeModal: React.FC<RepurposeModalProps> = ({ onClose, onCreatePosts }) => {
    const { showToast } = useToast();
    const [sourceText, setSourceText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{ platform: string; text: string; icon: React.ReactNode }[]>([]);

    const repurposeContent = async () => {
        if (!sourceText.trim()) return;
        setIsLoading(true);
        setResults([]);

        try {
            const prompt = `Du er en ekspert på sosiale medier. Ta følgende innhold og transformer det til 3 forskjellige plattformer:

Originalinnhold:
"${sourceText}"

Lag:
1. **Twitter/X**: Kort, punchy, max 280 tegn. Kan bruke emojis.
2. **LinkedIn**: Profesjonell tone, storytelling-format med mellomrom, 500-1000 tegn.
3. **Instagram Caption**: Engasjerende, personlig, med CTA. 300-600 tegn.

Returner som JSON array:
[
  { "platform": "Twitter", "text": "..." },
  { "platform": "LinkedIn", "text": "..." },
  { "platform": "Instagram", "text": "..." }
]`;

            const result = await callAI([
                { role: 'system', content: 'Du er en content repurposing ekspert. Svar kun med JSON.' },
                { role: 'user', content: prompt }
            ]);

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);

                const withIcons = parsed.map((p: { platform: string; text: string }) => ({
                    ...p,
                    icon: p.platform === 'Twitter' ? <Twitter size={20} /> :
                        p.platform === 'LinkedIn' ? <Linkedin size={20} /> :
                            <span className="text-lg">📸</span>
                }));

                setResults(withIcons);
            } catch {
                // Fallback
                setResults([
                    { platform: 'Twitter', text: sourceText.slice(0, 280), icon: <Twitter size={20} /> },
                    { platform: 'LinkedIn', text: sourceText, icon: <Linkedin size={20} /> },
                    { platform: 'Instagram', text: sourceText, icon: <span className="text-lg">📸</span> }
                ]);
            }
        } catch (err) {
            console.error('Repurpose failed:', err);
            showToast('Kunne ikke repurpose. Sjekk API-nøkkel.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const selectPost = (platform: string, text: string) => {
        onCreatePosts([{
            text,
            hook: text.split('\n')[0] || text.slice(0, 50),
            platform
        }]);
        onClose();
    };

    const selectAll = () => {
        onCreatePosts(results.map(r => ({
            text: r.text,
            hook: r.text.split('\n')[0] || r.text.slice(0, 50),
            platform: r.platform
        })));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <RefreshCw size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Repurpose</h2>
                            <p className="text-white/70 text-sm">Ett innhold → Alle plattformer</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                            Lim inn originalinnhold (TikTok-tekst, bloggpost, idé, osv.)
                        </label>
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Kopier inn teksten du vil omgjøre til andre plattformer..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <button
                            onClick={repurposeContent}
                            disabled={isLoading || !sourceText.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Omgjør til alle plattformer...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    Repurpose nå
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Resultater</p>
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-bold"
                                >
                                    Legg til alle →
                                </button>
                            </div>

                            {results.map((result, i) => (
                                <div
                                    key={i}
                                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all"
                                >
                                    <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            {result.icon}
                                            <span className="font-bold text-sm">{result.platform}</span>
                                        </div>
                                        <button
                                            onClick={() => selectPost(result.platform, result.text)}
                                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full font-bold transition-all"
                                        >
                                            Velg
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{result.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {results.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-400">
                            <RefreshCw className="mx-auto mb-4 opacity-30" size={48} />
                            <p>Lim inn innhold og klikk "Repurpose" for å generere versjoner.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RepurposeModal;
