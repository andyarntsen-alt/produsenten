import React from 'react';
import type { Brand } from '../../App';

interface StrategyTabProps {
    brand: Brand;
}

const StrategyTab: React.FC<StrategyTabProps> = ({ brand }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-serif italic text-brand-text mb-4">Innholdsstrategi</h3>
            {brand.strategyResult ? (
                <div className="bg-white border border-brand-gold/20 p-8 rounded-xl shadow-sm">
                    <div className="prose prose-lg prose-slate max-w-none text-brand-text font-sans font-light leading-relaxed whitespace-pre-wrap">
                        {brand.strategyResult}
                    </div>
                </div>
            ) : (
                <p className="text-brand-text/50 font-sans italic">Ingen strategi tilgjengelig.</p>
            )}
        </div>
    );
};

export default StrategyTab;
