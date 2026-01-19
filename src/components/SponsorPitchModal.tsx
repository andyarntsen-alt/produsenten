import React, { useState } from 'react';
import { X, Mail, Sparkles, Copy, Check } from 'lucide-react';
import { callAI } from '../services/ai';

interface SponsorPitchModalProps {
    brandName: string;
    onClose: () => void;
}

const SponsorPitchModal: React.FC<SponsorPitchModalProps> = ({ brandName, onClose }) => {
    const [targetBrand, setTargetBrand] = useState('');
    const [goal, setGoal] = useState('produktplassering');
    const [pitchEmail, setPitchEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generatePitch = async () => {
        if (!targetBrand.trim()) return;
        setIsLoading(true);
        setPitchEmail('');

        try {
            const prompt = `Du er en profesjonell influencer-manager. Skriv en overbevisende cold-email til ${targetBrand} på vegne av influenceren/merkevaren "${brandName}".

Mål med samarbeidet: ${goal}

Regler:
1. Vær profesjonell men personlig
2. Vis at du kjenner til ${targetBrand} og deres verdier
3. Forklar kort hva ${brandName} kan tilby
4. Inkluder konkrete samarbeidsideer
5. Ha en tydelig CTA
6. Hold det kort (under 200 ord)

Skriv e-posten på norsk. Start direkte med "Hei [Navn],".`;

            const result = await callAI([
                { role: 'system', content: 'Du er en ekspert på influencer-samarbeid og skriving av pitch-e-poster.' },
                { role: 'user', content: prompt }
            ]);

            setPitchEmail(result);
        } catch (err) {
            console.error('Pitch generation failed:', err);
            setPitchEmail(`Hei [Navn],

Jeg skriver til deg på vegne av ${brandName}. Vi er store fans av det ${targetBrand} gjør, og vi ser et spennende potensial for samarbeid.

Vi har en engasjert følgerskare som matcher deres målgruppe perfekt. Vi foreslår et ${goal}-samarbeid der vi kan:

• Skape autentisk innhold som viser produktene deres i aksjon
• Nå tusenvis av potensielle kunder i vår nisje
• Bygge langsiktig merkevareassosiajon

Kan vi ta en kort samtale neste uke for å diskutere mulighetene?

Vennlig hilsen,
${brandName}

PS: Sjekk gjerne vår profil for å se eksempler på tidligere samarbeid.`);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pitchEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Mail size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Sponsor Pitch</h2>
                            <p className="text-white/70 text-sm">Generer profesjonelle samarbeids-e-poster</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Hvilket merke vil du pitche?</label>
                            <input
                                type="text"
                                value={targetBrand}
                                onChange={(e) => setTargetBrand(e.target.value)}
                                placeholder="F.eks. Nike, Elkjøp, Tine..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Type samarbeid</label>
                            <select
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            >
                                <option value="produktplassering">Produktplassering</option>
                                <option value="ambassadørskap">Ambassadørskap</option>
                                <option value="UGC-produksjon">UGC-produksjon</option>
                                <option value="affiliate">Affiliate-samarbeid</option>
                                <option value="event">Event/lansering</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={generatePitch}
                        disabled={isLoading || !targetBrand.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Genererer pitch...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generer E-post
                            </>
                        )}
                    </button>

                    {/* Result */}
                    {pitchEmail && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Din pitch-e-post</p>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-bold transition-colors"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Kopiert!' : 'Kopier'}
                                </button>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">{pitchEmail}</pre>
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                💡 Tips: Tilpass e-posten med spesifikke detaljer om din profil og tidligere samarbeid.
                            </p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!pitchEmail && !isLoading && (
                        <div className="text-center py-8 text-gray-400">
                            <Mail className="mx-auto mb-4 opacity-30" size={48} />
                            <p>Fyll inn merkenavnet og klikk "Generer" for å lage en pitch.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SponsorPitchModal;
