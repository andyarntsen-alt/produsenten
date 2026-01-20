import React, { useState } from 'react';
import { X, Mail, Sparkles, Copy, Check } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection, getPromptTranslations } from '../services/languagePrompts';
import type { Brand } from '../App';

interface SponsorPitchModalProps {
    brand?: Brand;
    brandName: string;
    onClose: () => void;
}

const SponsorPitchModal: React.FC<SponsorPitchModalProps> = ({ brand, brandName, onClose }) => {
    const { settings } = useSettings();
    const [targetBrand, setTargetBrand] = useState('');
    const [goal, setGoal] = useState('produktplassering');
    const [pitchEmail, setPitchEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const languageSection = buildLanguagePromptSection(settings.language);
    const t = getPromptTranslations(settings.language);
    const isEnglish = settings.language === 'en';

    // Build brand context for more compelling pitches
    const brandContext = brand ? `
${t.content.brandContext}:
- ${t.brand}: ${brand.name}
${brand.targetAudience ? `- ${t.targetAudience}: ${brand.targetAudience}` : ''}
${brand.industry ? `- ${t.industry}: ${brand.industry}` : ''}
${brand.brandBrief?.valueProps?.length ? `- ${t.content.valueProps}: ${brand.brandBrief.valueProps.slice(0, 2).join(', ')}` : ''}
${brand.brandBrief?.differentiators?.length ? `- ${t.content.differentiators}: ${brand.brandBrief.differentiators.slice(0, 2).join(', ')}` : ''}
${brand.brandBrief?.idealCustomer ? `- ${t.content.idealCustomer}: ${brand.brandBrief.idealCustomer}` : ''}
` : '';

    const generatePitch = async () => {
        if (!targetBrand.trim()) return;
        setIsLoading(true);
        setPitchEmail('');

        try {
            const prompt = `${languageSection}
${brandContext}

${t.sponsorPitch.writeColdEmail} ${targetBrand} ${t.sponsorPitch.onBehalfOf} "${brandName}".

${t.sponsorPitch.goal}: ${goal}

${t.sponsorPitch.requirements}:
- ${t.sponsorPitch.professionalButPersonal}
- ${t.sponsorPitch.under200Words}
${isEnglish ? `- Start with "Hi [Name]," (not "Dear" or "To whom it may concern")` : `- Start med "Hei [Navn]," (ikke "Kjære" eller "Til rette vedkommende")`}
- ${t.sponsorPitch.showYouKnowThem}
- ${t.sponsorPitch.concreteIdeas}
- ${t.sponsorPitch.clearCta}

${t.sponsorPitch.forbidden}:
${isEnglish ? `- "I'm reaching out because..." (boring opening)
- "We are a leading..." (corporate-speak)
- "We would greatly appreciate..." (too formal)
- "Best regards" (use "Cheers" or "Talk soon")
- Long paragraphs` : `- "Jeg skriver til deg fordi..." (kjedelig åpning)
- "Vi er en ledende..." (corporate-speak)
- "Vi ville satt stor pris på..." (for formelt)
- "Med vennlig hilsen" (bruk "Hilsen" eller "Snakkes")
- Lange avsnitt`}

${isEnglish ? `EXAMPLE OF GOOD STRUCTURE:
Hi [Name],

[1 sentence showing you know the brand]

[1-2 sentences about what you do]

[Concrete collaboration idea - short and specific]

[CTA - e.g. "Can we do a 15 min call next week?"]

Cheers,
[Name]` : `EKSEMPEL PÅ GOD STRUKTUR:
Hei [Navn],

[1 setning som viser du kjenner brandet]

[1-2 setninger om hva du/dere gjør]

[Konkret samarbeidsidé - kort og spesifikk]

[CTA - f.eks. "Kan vi ta en 15 min prat neste uke?"]

Hilsen,
[Navn]`}`;

            const result = await callAIHumanized([
                { role: 'system', content: isEnglish ? 'You write pitch emails that feel authentic, not template-like.' : 'Du skriver pitch-e-poster som føles ekte, ikke templateaktige.' },
                { role: 'user', content: prompt }
            ], { toolType: 'pitch', includeValidation: true });

            setPitchEmail(result);
        } catch (err) {
            console.error('Pitch generation failed:', err);
            setPitchEmail(isEnglish ? `Hi [Name],

Saw ${targetBrand}'s latest campaign - really great stuff.

I run ${brandName}, and we have an audience that matches yours pretty perfectly. Thought it could be cool to do a ${goal} collaboration.

Concrete idea: [Customize this based on what you actually want to propose]

Can we do a 15 min call next week?

Cheers,
${brandName}` : `Hei [Navn],

Så ${targetBrand} sin siste kampanje - virkelig bra greier.

Jeg driver ${brandName}, og vi har en følgerskare som matcher dere ganske perfekt. Tenkte det kunne vært kult med et ${goal}-samarbeid.

Konkret idé: [Tilpass dette basert på hva du faktisk vil foreslå]

Kan vi ta en 15 min prat neste uke?

Hilsen,
${brandName}`);
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
