import { forwardRef } from 'react';
import type { BrandBrief } from '../App';

interface StrategyReportProps {
    brandName: string;
    brief: BrandBrief;
}

const StrategyReport = forwardRef<HTMLDivElement, StrategyReportProps>(({ brandName, brief }, ref) => {
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-12 mx-auto text-brand-text font-sans">
            {/* Header */}
            <div className="border-b-2 border-brand-gold mb-12 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-serif italic mb-2">{brandName}</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Innholdsstrategi & Merkevareprofil</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Generert av Produsenten.no</p>
                    <p className="text-xs text-gray-400">{new Date().toLocaleDateString('no-NO')}</p>
                </div>
            </div>

            {/* Executive Summary */}
            <section className="mb-12">
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Sammendrag</h2>
                <div className="text-xl font-serif italic leading-relaxed text-gray-800">
                    "{brief.productSummary}"
                </div>
            </section>

            {/* Grid Layout for Core Pillars */}
            <div className="grid grid-cols-2 gap-12 mb-12">

                {/* ICP */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Drømmekunde (ICP)</h2>
                    <p className="text-sm leading-relaxed text-gray-600 bg-gray-50 p-6 rounded-lg border border-gray-100">
                        {brief.idealCustomer}
                    </p>
                </section>

                {/* USPs */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Verdiforslag (USPs)</h2>
                    <ul className="space-y-3">
                        {brief.valueProps.map((usp, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700">
                                <span className="text-brand-gold font-bold">•</span>
                                {usp}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* Tone of Voice */}
            <section className="mb-12 bg-gray-900 text-white p-8 rounded-xl">
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-6">Tone of Voice Guidelines</h2>
                <div className="grid grid-cols-2 gap-8">
                    {brief.toneRules.map((rule, i) => (
                        <div key={i} className="border-l-2 border-brand-gold/30 pl-4">
                            <p className="text-sm font-light leading-relaxed opacity-90">{rule}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Content Pillars */}
            <section className="mb-12">
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Redaksjonelle Vinkler</h2>
                <div className="grid grid-cols-3 gap-4">
                    {brief.contentAngles.map((angle, i) => (
                        <div key={i} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                            <span className="text-4xl text-brand-gold/20 font-serif block mb-2">{i + 1}</span>
                            <p className="text-sm font-medium text-gray-800">{angle}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Hooks */}
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Anbefalte Hooks</h2>
                <div className="space-y-2">
                    {brief.hooks.slice(0, 5).map((hook, i) => (
                        <div key={i} className="text-sm font-serif italic text-gray-600 border-b border-gray-100 py-2">
                            "{hook}"
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
});

export default StrategyReport;
