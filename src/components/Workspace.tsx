import React, { useState } from 'react';
import type { Brand } from '../App';
import OverviewTab from './tabs/OverviewTab';
import ResearchTab from './tabs/ResearchTab';
import StrategyTab from './tabs/StrategyTab';
import ContentTab from './tabs/ContentTab';
import CalendarTab from './tabs/CalendarTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import ExportTab from './tabs/ExportTab';

interface WorkspaceProps {
    brand: Brand;
    vibePresets: { label: string; key: string; emoji: string; description: string; toneRules: string[]; }[];
    updateBrand: (brand: Brand) => void;
    onBack: () => void;
    onGenerateNext: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ brand, vibePresets, updateBrand, onBack, onGenerateNext }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'strategy' | 'content' | 'calendar' | 'analytics' | 'export'>('overview');

    const tabs: { id: typeof activeTab; label: string }[] = [
        { id: 'overview', label: 'Oversikt' },
        { id: 'research', label: 'Research' },
        { id: 'strategy', label: 'Strategi' },
        { id: 'content', label: 'Innhold' },
        { id: 'calendar', label: 'Kalender' },
        { id: 'analytics', label: 'Analyse' },
        { id: 'export', label: 'Eksport' }
    ];

    return (
        <div className="flex flex-col h-screen bg-brand-bg text-brand-text font-sans">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-brand-text transition-colors text-sm uppercase tracking-wider p-2">
                        ← Tilbake
                    </button>
                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
                    <h2 className="text-xl font-serif italic text-brand-text">{brand.name}</h2>
                </div>
                <div className="flex gap-2">
                    <button className="text-xs font-sans uppercase tracking-widest text-brand-text/50 hover:text-brand-gold transition-colors px-3 py-1 border border-transparent hover:border-brand-gold/20 rounded-full">
                        Lagre
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-brand-text/60">
                        JS
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation (Tabs) */}
                <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-xs font-sans uppercase tracking-widest text-brand-text/40 mb-4 pl-3">Meny</h3>
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 font-medium ${activeTab === tab.id ? 'bg-brand-bg text-brand-text shadow-sm border border-gray-100' : 'text-brand-text/50 hover:bg-gray-50 hover:text-brand-text'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto">
                        <div className="p-4 bg-brand-bg/50 rounded-xl border border-gray-100">
                            <p className="text-xs text-brand-text/60 italic font-serif mb-3">"Kreativitet er intelligens som har det gøy."</p>
                            <button onClick={onGenerateNext} className="w-full bg-brand-text text-white text-xs uppercase tracking-wide py-2 rounded-lg hover:bg-brand-gold transition-colors shadow-md">
                                Generer mer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-brand-bg">
                    <div className="max-w-5xl mx-auto p-12">
                        {/* Content Header */}
                        <div className="mb-10">
                            <h1 className="text-4xl font-serif italic text-brand-text mb-2">{tabs.find(t => t.id === activeTab)?.label}</h1>
                            <div className="w-12 h-1 bg-brand-gold/30 rounded-full"></div>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                            {activeTab === 'overview' && <OverviewTab brand={brand} updateBrand={updateBrand} onGenerateNext={onGenerateNext} />}
                            {activeTab === 'research' && <ResearchTab brand={brand} />}
                            {activeTab === 'strategy' && <StrategyTab brand={brand} />}
                            {activeTab === 'content' && <ContentTab brand={brand} vibePresets={vibePresets} updateBrand={updateBrand} />}
                            {activeTab === 'calendar' && <CalendarTab brand={brand} updateBrand={updateBrand} />}
                            {activeTab === 'analytics' && <AnalyticsTab brand={brand} />}
                            {activeTab === 'export' && <ExportTab brand={brand} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;
