import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Sparkles } from 'lucide-react';
import { callAI } from '../services/ai';

interface CommentReplyModalProps {
    onClose: () => void;
}

const CommentReplyModal: React.FC<CommentReplyModalProps> = ({ onClose }) => {
    const [comment, setComment] = useState('');
    const [tone, setTone] = useState('friendly');
    const [replies, setReplies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generateReplies = async () => {
        if (!comment.trim()) return;
        setIsLoading(true);
        setReplies([]);

        try {
            const toneDescriptions: Record<string, string> = {
                friendly: 'varm og vennlig',
                professional: 'profesjonell og høflig',
                funny: 'morsom, med glimt i øyet, gjerne litt tørr humor eller selvironi (wit)',
                grateful: 'takknemlig og ydmyk'
            };

            let specialInstructions = '';
            if (tone === 'funny') {
                specialInstructions = `
SPESIELE REGLER FOR HUMOR:
- Ikke vær "cringe" eller barnehage-morsom.
- Bruk ironi, overdrivelser eller understatements ("wit").
- Det er LOV å være litt frekk (med kjærlighet).
- Unngå standard setninger som "Hahaha så gøy".
- Tenk: Hva ville en standup-komiker svart?`;
            }

            const prompt = `Du er en community manager. Lag 4 forskjellige svar på denne kommentaren fra en følger.

Kommentaren:
"${comment}"

Tone: ${toneDescriptions[tone]}
${specialInstructions}

Regler:
- Kort og konsist (1-2 setninger)
- Bruk emojis naturlig (men ikke overdriv)
- Vær autentisk, ikke robotaktig
- Varier svarene (spørsmål, takk, engasjement, humor)
- Norsk språk

Returner som JSON array:
["Svar 1", "Svar 2", "Svar 3", "Svar 4"]`;

            const result = await callAI([
                { role: 'system', content: 'Du er en community manager. Svar kun med JSON array.' },
                { role: 'user', content: prompt }
            ]);

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);
                setReplies(parsed);
            } catch {
                setReplies([
                    "Tusen takk for at du deler! 🙏 Det betyr mye ❤️",
                    "Så hyggelig å høre! Hva likte du best? 👀",
                    "Du er for snill! 😊 Takk for støtten!",
                    "Elsker tilbakemeldingen din! 💫 Blir glad av dette!"
                ]);
            }
        } catch (err) {
            console.error('Reply generation failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyReply = (reply: string, index: number) => {
        navigator.clipboard.writeText(reply);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <MessageCircle size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Kommentar-svar AI</h2>
                            <p className="text-white/70 text-sm">Svar på kommentarer som en proff</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Kommentaren du fikk</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Lim inn kommentaren fra følgeren din..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Tone</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'friendly', label: '😊 Vennlig' },
                                    { value: 'professional', label: '💼 Profesjonell' },
                                    { value: 'funny', label: '😄 Morsom' },
                                    { value: 'grateful', label: '🙏 Takknemlig' }
                                ].map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setTone(t.value)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tone === t.value
                                            ? 'bg-sky-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generateReplies}
                        disabled={isLoading || !comment.trim()}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <Sparkles size={18} />
                        )}
                        {isLoading ? 'Genererer...' : 'Generer Svar'}
                    </button>

                    {/* Results */}
                    {replies.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Velg og kopier</p>
                            {replies.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => copyReply(reply, i)}
                                    className="w-full text-left p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group flex items-center justify-between gap-4"
                                >
                                    <p className="text-gray-800 text-sm">{reply}</p>
                                    <span className="shrink-0 text-xs text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        {copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentReplyModal;
