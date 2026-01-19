import React, { useState } from 'react';
import type { Brand } from '../../App';

interface OverviewTabProps {
    brand: Brand;
    updateBrand: (brand: Brand) => void;
    onGenerateNext: () => void;
}

const OverviewTabContent: React.FC<OverviewTabProps> = ({ brand, updateBrand, onGenerateNext }) => {
    // Initialized from props. Component is re-mounted when brand.id changes (via key in wrapper), 
    // so we don't need useEffect to sync state.
    const [editTarget, setEditTarget] = useState(brand.targetAudience || '');
    const [editGoals, setEditGoals] = useState(brand.goals || '');

    const saveInfo = () => {
        const updated: Brand = { ...brand, targetAudience: editTarget, goals: editGoals };
        updateBrand(updated);
        alert('Prosjektinfo oppdatert');
    };

    const totalPosts = brand.posts.length;
    const approvedCount = brand.posts.filter(p => p.status === 'approved').length;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h3 className="text-2xl font-serif italic text-brand-text">Prosjektinfo</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-4xl font-light text-brand-text mb-2">{totalPosts}</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-brand-text/60">Totalt antall tweets</div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-4xl font-light text-brand-text mb-2">{approvedCount}</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-brand-text/60">Godkjente</div>
                </div>
                <div
                    className="p-6 bg-white rounded-2xl border border-brand-gold/30 shadow-sm flex flex-col justify-center items-start cursor-pointer hover:shadow-md hover:border-brand-gold transition-all group"
                    onClick={onGenerateNext}
                >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✨</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-brand-text group-hover:text-brand-gold transition-colors">Generer Neste Måned</div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-text/60 mb-3">Målgruppe</label>
                        <textarea
                            className="w-full p-4 bg-gray-50 rounded-xl border-none text-brand-text font-sans focus:ring-2 focus:ring-brand-gold/50 min-h-[120px]"
                            value={editTarget}
                            onChange={e => setEditTarget(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-brand-text/60 mb-3">Mål</label>
                        <textarea
                            className="w-full p-4 bg-gray-50 rounded-xl border-none text-brand-text font-sans focus:ring-2 focus:ring-brand-gold/50 min-h-[120px]"
                            value={editGoals}
                            onChange={e => setEditGoals(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={saveInfo}
                        className="bg-brand-text text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors"
                    >
                        Lagre Endringer
                    </button>
                </div>
            </div>

            {/* Brand Brief Visualization */}
            {brand.brandBrief && (
                <div className="bg-brand-bg p-8 rounded-3xl border border-brand-text/5">
                    <h3 className="text-xl font-serif italic text-brand-text mb-6">Merkevare Analyse (Brand Brief)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3 opacity-60">Value Props</h4>
                            <ul className="list-disc list-inside space-y-2 text-brand-text/80 text-sm">
                                {brand.brandBrief.valueProps.map((vp, i) => <li key={i}>{vp}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-3 opacity-60">Tone of Voice Rules</h4>
                            <ul className="list-disc list-inside space-y-2 text-brand-text/80 text-sm">
                                {brand.brandBrief.toneRules.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-brand-text/5">
                        <h4 className="font-bold text-sm uppercase tracking-widest mb-3 opacity-60">Content Pillars</h4>
                        <div className="flex flex-wrap gap-2">
                            {brand.contentPillars?.map((cp, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-brand-text/10 rounded-full text-xs text-brand-text/70">{cp}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Wrapper ensures a fresh instance (and fresh state) whenever brand.id changes
const OverviewTab: React.FC<OverviewTabProps> = (props) => {
    return <OverviewTabContent key={props.brand.id} {...props} />;
};

export default OverviewTab;
