import React, { useRef, useState } from 'react';
import type { Brand } from '../../App';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import StrategyReport from '../StrategyReport';
import { callAI } from '../../services/ai';
import SponsorPitchModal from '../SponsorPitchModal';

interface ResearchTabProps {
    brand: Brand;
}

const Section = ({ title, items, text }: { title: string, items?: string[], text?: string }) => (
    <div className="bg-white border border-brand-gold/10 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-lg font-serif italic text-brand-text mb-4 border-b border-gray-100 pb-2">{title}</h4>
        {text && <p className="text-brand-text/80 font-sans font-light leading-relaxed mb-4">{text}</p>}
        {items && items.length > 0 && (
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-brand-text/70 font-sans bg-gray-50/50 p-2 rounded-lg">
                        <span className="text-brand-gold min-w-[20px]">•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const ResearchTab: React.FC<ResearchTabProps> = ({ brand }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [trends, setTrends] = useState<string[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(false);
    const [showSponsorPitch, setShowSponsorPitch] = useState(false);

    // Use structured data if available, otherwise try to parse the legacy string
    const brief = brand.brandBrief || (brand.analysisResult ? JSON.parse(brand.analysisResult) : null);

    const fetchTrends = async () => {
        setIsLoadingTrends(true);
        try {
            const prompt = `Du er en norsk sosiale medier-ekspert. Generer 8 trender som er populære i Norge akkurat nå (januar 2026).

Inkluder en miks av:
- TikTok/Reels trender
- Samtale-emner på Twitter/X
- Livsstil-trender
- Nyheter og aktuelt

For hver trend, skriv en kort beskrivelse (1 setning).

Returner som JSON array av strenger:
["🔥 Trend 1 - Beskrivelse", "📈 Trend 2 - Beskrivelse", ...]`;

            const result = await callAI([
                { role: 'system', content: 'Du er en trendspotter. Svar kun med JSON array.' },
                { role: 'user', content: prompt }
            ]);

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);
                setTrends(parsed);
            } catch {
                setTrends([
                    "🔥 Airfryer-oppskrifter - Fortsetter å dominere matinnhold",
                    "🏔️ Topptur-sesongen - Alle poster fjellbilder",
                    "💼 Quiet quitting vs Loud quitting - Arbeidsliv-debatt",
                    "🎮 AI-verktøy for kreatører - Nytt tech-snakk",
                    "🌱 Veganuar - Januar-utfordringen fortsetter",
                    "📱 TikTok-forbud? - Usikkerhet driver engasjement",
                    "❄️ Ekstremvær - Klima-innhold får oppsving",
                    "🎬 Norsk film - Trolle-filmen skaper buzz"
                ]);
            }
        } catch (err) {
            console.error('Trend fetch failed:', err);
        } finally {
            setIsLoadingTrends(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${brand.name.replace(/\s+/g, '_')}_Strategi.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-8 relative">

            {/* Hidden Report Container for Capture */}
            <div className="absolute top-[200vh] left-0 pointer-events-none opacity-0">
                <StrategyReport ref={reportRef} brandName={brand.name} brief={brief} />
            </div>

            {/* Trend Spotter Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-serif italic text-brand-text flex items-center gap-2">
                            🔥 Trendvarsler
                        </h3>
                        <p className="text-sm text-gray-500">Hva som trender i Norge akkurat nå</p>
                    </div>
                    <button
                        onClick={fetchTrends}
                        disabled={isLoadingTrends}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoadingTrends ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            '🔄'
                        )}
                        {isLoadingTrends ? 'Henter...' : 'Oppdater trender'}
                    </button>
                </div>

                {trends.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {trends.map((trend, i) => (
                            <div key={i} className="bg-white/80 backdrop-blur-sm p-3 rounded-lg text-sm text-gray-700 hover:bg-white transition-all cursor-pointer border border-orange-100">
                                {trend}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-4">Klikk "Oppdater trender" for å se hva som er populært nå.</p>
                )}
            </div>

            {/* Sponsor Pitch Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-serif italic text-brand-text flex items-center gap-2">
                            📧 Sponsor Pitch
                        </h3>
                        <p className="text-sm text-gray-500">Generer profesjonelle samarbeids-e-poster</p>
                    </div>
                    <button
                        onClick={() => setShowSponsorPitch(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        ✉️ Lag pitch
                    </button>
                </div>
            </div>

            {showSponsorPitch && (
                <SponsorPitchModal
                    brandName={brand.name}
                    onClose={() => setShowSponsorPitch(false)}
                />
            )}

            {!brief ? (
                <p className="text-brand-text/50 font-sans italic">Ingen strategisk analyse tilgjengelig.</p>
            ) : (
                <>
                    <div className="flex justify-between items-baseline">
                        <div>
                            <h3 className="text-2xl font-serif italic text-brand-text">Strategisk Analyse</h3>
                            <span className="text-xs font-sans uppercase tracking-widest text-brand-text/40">AI-Generert</span>
                        </div>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center gap-2 bg-brand-text text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition-all disabled:opacity-50"
                        >
                            {isDownloading ? 'Genererer PDF...' : '📄 Last ned Rapport'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Sammendrag" text={brief.productSummary} />
                        <Section title="Drømmekunde (ICP)" text={brief.idealCustomer} />

                        <Section title="Verdiforslag (USPs)" items={brief.valueProps} />
                        <Section title="Konkurrentfordeler" items={brief.differentiators} />

                        <Section title="Tone of Voice (Do's & Don'ts)" items={brief.toneRules} />
                        <Section title="Innholdsvinkler" items={brief.contentAngles} />

                        <Section title="Hooks som fungerer" items={brief.hooks} />
                        <Section title="Call-to-Action Fraser" items={brief.ctaPhrases} />
                    </div>
                </>
            )}
        </div>
    );
};

export default ResearchTab;
