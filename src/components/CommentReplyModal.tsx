import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Sparkles } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection, getPromptTranslations } from '../services/languagePrompts';
import type { Brand } from '../App';

interface CommentReplyModalProps {
    brand?: Brand;
    onClose: () => void;
}

const CommentReplyModal: React.FC<CommentReplyModalProps> = ({ brand, onClose }) => {
    const { settings } = useSettings();
    const [comment, setComment] = useState('');
    const [tone, setTone] = useState('friendly');
    const [replies, setReplies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const languageSection = buildLanguagePromptSection(settings.language);
    const t = getPromptTranslations(settings.language);
    const isEnglish = settings.language === 'en';

    // Build brand context for persona-aware replies
    const brandContext = brand ? `
${t.content.brandContext}:
- ${t.brand}: ${brand.name}
- ${t.tone}: ${brand.vibe}
${brand.personaKernel?.voiceSignature ? `- ${t.content.voiceSignature}: ${brand.personaKernel.voiceSignature}` : ''}
${brand.brandBrief?.brandPersonality ? `- ${t.content.personality}: ${brand.brandBrief.brandPersonality}` : ''}
` : '';

    const generateReplies = async () => {
        if (!comment.trim()) return;
        setIsLoading(true);
        setReplies([]);

        try {
            const toneDescriptions: Record<string, string> = isEnglish ? {
                friendly: 'warm and friendly',
                professional: 'professional and polite',
                funny: 'funny, with a twinkle in the eye, dry humor or self-deprecation (wit)',
                grateful: 'grateful and humble'
            } : {
                friendly: 'varm og vennlig',
                professional: 'profesjonell og høflig',
                funny: 'morsom, med glimt i øyet, gjerne litt tørr humor eller selvironi (wit)',
                grateful: 'takknemlig og ydmyk'
            };

            let specialInstructions = '';
            if (tone === 'funny') {
                specialInstructions = isEnglish ? `
SPECIAL RULES FOR HUMOR:
- Don't be cringe or childish.
- Use irony, exaggeration or understatements (wit).
- It's OK to be a bit cheeky (with love).
- Avoid standard phrases like "Haha so fun".
- Think: What would a stand-up comedian reply?` : `
SPESIELE REGLER FOR HUMOR:
- Ikke vær "cringe" eller barnehage-morsom.
- Bruk ironi, overdrivelser eller understatements ("wit").
- Det er LOV å være litt frekk (med kjærlighet).
- Unngå standard setninger som "Hahaha så gøy".
- Tenk: Hva ville en standup-komiker svart?`;
            }

            const prompt = `${languageSection}
${brandContext}

${t.commentReply.createReplies}

${t.commentReply.theComment}:
"${comment}"

${t.commentReply.toneLabel}: ${toneDescriptions[tone]}
${specialInstructions}

${isEnglish ? `CRITICAL RULES:
- ULTRA-short: 1-2 sentences MAX
- NEVER start with "Thank you so much!" or "So nice!"
- NEVER end with "Have a great day!" or similar
- Sound like a friend, not a brand
- Max 1 emoji per reply (or none)
- Vary the replies (some with questions, some with humor)

GOOD EXAMPLES:
- "haha yeah, I feel that 😅"
- "Oh I see! What worked for you?"
- "That's exactly what I was thinking"
- "Agree. Totally agree."

BAD EXAMPLES (NEVER USE):
- "Thank you so much for sharing! It means a lot ❤️"
- "So nice to hear! Hope it helps!"
- "Thanks for the lovely comment! 🙏"` : `KRITISKE REGLER:
- ULTRA-kort: 1-2 setninger MAKS
- ALDRI start med "Tusen takk!" eller "Så hyggelig!"
- ALDRI avslutt med "Ha en fin dag!" eller lignende
- Føl deg som en venn, ikke et brand
- Maks 1 emoji per svar (eller ingen)
- Varier svarene (noen med spørsmål, noen med humor)

GODE EKSEMPLER:
- "haha ja, kjenner meg igjen der 😅"
- "Åå skjønner! Hva funka for deg?"
- "Det var faktisk akkurat det jeg tenkte"
- "Enig. Helt enig."

DÅRLIGE EKSEMPLER (ALDRI BRUK):
- "Tusen takk for at du deler! Det betyr mye ❤️"
- "Så hyggelig å høre! Håper det hjelper!"
- "Takk for den fine kommentaren! 🙏"`}

${isEnglish ? 'Return as JSON array:' : 'Returner som JSON array:'}
["Reply 1", "Reply 2", "Reply 3", "Reply 4"]`;

            const result = await callAIHumanized([
                { role: 'system', content: isEnglish ? 'You reply to comments like a real person. Reply only with JSON array.' : 'Du svarer på kommentarer som en ekte person. Svar kun med JSON array.' },
                { role: 'user', content: prompt }
            ], { toolType: 'comment', includeValidation: true });

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);
                setReplies(parsed);
            } catch {
                setReplies(isEnglish ? [
                    "haha yeah, I feel that 😅",
                    "Oh I see! What worked for you?",
                    "That's exactly what I was thinking",
                    "Agree. Totally agree."
                ] : [
                    "haha ja, kjenner meg igjen der 😅",
                    "Åå skjønner! Hva funka for deg?",
                    "Det var faktisk akkurat det jeg tenkte",
                    "Enig. Helt enig."
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
