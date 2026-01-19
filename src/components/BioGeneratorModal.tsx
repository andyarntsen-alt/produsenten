import React, { useState } from 'react';
import { X, User, Copy, Check, Sparkles } from 'lucide-react';
import { callAI } from '../services/ai';

interface BioGeneratorModalProps {
    onClose: () => void;
}

const BioGeneratorModal: React.FC<BioGeneratorModalProps> = ({ onClose }) => {
    const [keywords, setKeywords] = useState('');
    const [platform, setPlatform] = useState('instagram');
    const [bios, setBios] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generateBios = async () => {
        if (!keywords.trim()) return;
        setIsLoading(true);
        setBios([]);

        try {
            const platformLimits: Record<string, string> = {
                instagram: '150 tegn',
                twitter: '160 tegn',
                linkedin: '300 tegn',
                tiktok: '80 tegn'
            };

            const prompt = `Du er en ekspert på personlig merkevarebygging. Lag 5 PROFESJONELLE og ENGASJERENDE bio-forslag for ${platform}.

Stikkord om personen/brandet:
"${keywords}"

Målet er å konvertere besøkende til følgere/kunder.

Struktur-tips (bruk variasjon):
1. The Authority: [Tittel] | Hjelper X med Y | CTA
2. The Listicle: 
   📍 Sted
   🚀 Hva jeg gjør
   👉 CTA
3. The Personal: [Lidenskap] + [Jobb] + [Fun fact]
4. The Minimalist: Konsis verdiforslag. URL.

Regler:
- Maks ${platformLimits[platform]} (Viktig!)
- Bruk linjeskift der det passer (spesielt for Instagram/TikTok) (Bruk \\n for linjeskift)
- Bruk relevante emojis som kulepunkter
- Vær unik, unngå klisjeer
- Norsk språk

Returner som JSON array av strenger:
["Bio 1 tekst...", "Bio 2 tekst..."]`;

            const result = await callAI([
                { role: 'system', content: 'Du er en ekspert på sosiale medier bios. Svar kun med JSON array.' },
                { role: 'user', content: prompt }
            ]);

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);
                setBios(parsed);
            } catch {
                setBios([
                    "🚀 Skaper innhold som konverterer\n📍 Oslo\n👇 Last ned guiden min",
                    "Hjelper bedrifter å vokse på nett 📈\n—\nDaglig leder @dittfirma\nSend DM for samarbeid 💌",
                    "Din go-to for [nisje] 🌱\n✨ Tips & triks hver dag\n🔗 Link i bio",
                    "Kreativ sjel med sans for [tema] 🎨 | Deler reisen min 🌍 | Bli med backstage 👇",
                    "Offisiell konto for [navn] ✅\nBuilding the future of [bransje] 🚀"
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
