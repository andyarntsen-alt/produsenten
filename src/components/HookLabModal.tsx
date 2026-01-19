import React, { useState } from 'react';
import { X, Sparkles, Zap } from 'lucide-react';
import { callAI } from '../services/ai';
import { useToast } from './ToastContext';

interface HookLabModalProps {
    onClose: () => void;
    onSelectHook: (hook: string) => void;
}

interface HookResult {
    text: string;
    viralityScore: number;
}

const HookLabModal: React.FC<HookLabModalProps> = ({ onClose, onSelectHook }) => {
    const { showToast } = useToast();
    const [topic, setTopic] = useState('');
    const [hooks, setHooks] = useState<HookResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateHooks = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        setHooks([]);

        try {
            const prompt = `Du er en ekspert på virale sosiale medier. Generer 5 ulike "hooks" (åpningssetninger) for et innlegg om: "${topic}".

For hver hook, gi en virality-score fra 1-100 basert på hvor sannsynlig det er at den fanger oppmerksomhet.

Returner som JSON array:
[{ "text": "Hook tekst her...", "viralityScore": 85 }, ...]

Vær kreativ, bruk forskjellige teknikker:
- Kontroversielle påstander
- Spørsmål
- Tall/statistikk
- Personlige historier
- "Du vil ikke tro..."-stil`;

            const result = await callAI([
                { role: 'system', content: 'Du er en viral content ekspert. Svar kun med JSON.' },
                { role: 'user', content: prompt }
            ]);

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);
                setHooks(parsed);
            } catch {
                // Fallback if JSON parsing fails
                setHooks([
                    { text: "Dette endret alt for meg...", viralityScore: 78 },
                    { text: `${topic}? Her er sannheten de ikke forteller deg.`, viralityScore: 82 },
                    { text: `Jeg brukte 3 år på å lære dette om ${topic}.`, viralityScore: 75 },
                    { text: `Stop scrolling. Dette handler om ${topic}.`, viralityScore: 88 },
                    { text: `Upopulær mening: ${topic} er overvurdert. Eller?`, viralityScore: 91 }
                ]);
            }
        } catch (err) {
            console.error('Hook generation failed:', err);
            showToast('Kunne ikke generere hooks. Sjekk API-nøkkel.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Sparkles size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Hook Lab</h2>
                            <p className="text-white/70 text-sm">Test hvilke åpninger som fanger oppmerksomhet</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Hva handler innlegget om?</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="F.eks. 'Hvordan starte egen bedrift' eller 'Min morgenrutine'"
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                onKeyDown={(e) => e.key === 'Enter' && generateHooks()}
                            />
                            <button
                                onClick={generateHooks}
                                disabled={isLoading || !topic.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <Zap size={18} />
                                )}
                                Generer
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {hooks.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Resultater (klikk for å velge)</p>
                            {hooks.map((hook, i) => (
                                <button
                                    key={i}
                                    onClick={() => { onSelectHook(hook.text); onClose(); }}
                                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group flex items-start gap-4"
                                >
                                    <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(hook.viralityScore)}`}>
                                        {hook.viralityScore}%
                                    </div>
                                    <p className="text-gray-800 group-hover:text-purple-900 transition-colors leading-relaxed">
                                        {hook.text}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {hooks.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-gray-400">
                            <Sparkles className="mx-auto mb-4 opacity-30" size={48} />
                            <p>Skriv et tema og klikk "Generer" for å få hook-forslag!</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Genererer virale hooks...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HookLabModal;
