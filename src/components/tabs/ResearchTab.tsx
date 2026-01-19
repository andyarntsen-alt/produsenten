import React, { useRef, useState } from 'react';
import type { Brand } from '../../App';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import StrategyReport from '../StrategyReport';

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

    // Use structured data if available, otherwise try to parse the legacy string
    const brief = brand.brandBrief || (brand.analysisResult ? JSON.parse(brand.analysisResult) : null);

    if (!brief) {
        return <p className="text-brand-text/50 font-sans italic">Ingen analyse tilgjengelig.</p>;
    }

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher resolution
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
        </div>
    );
};

export default ResearchTab;
