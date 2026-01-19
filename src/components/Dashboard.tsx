import React, { useState } from 'react';
import type { Brand } from '../App';
import GlobalCalendar from './GlobalCalendar';
import AnalyticsView from './AnalyticsView';
import { Settings, BarChart2 } from 'lucide-react';

interface DashboardProps {
    brands: Brand[];
    onSelect: (brandId: string) => void;
    onAddNew: () => void;
    onUpdateBrand: (brand: Brand) => void;
    onGoToSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ brands, onSelect, onAddNew, onUpdateBrand, onGoToSettings }) => {
    const [view, setView] = useState<'grid' | 'calendar' | 'analytics'>('grid');

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif text-brand-text italic mb-3">Mine Prosjekter</h1>
                    <p className="text-brand-text/60 font-sans font-light text-lg">Administrer dine merkevarer og innholdsstrategier.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setView('grid')}
                            className={`px-6 py-2 rounded-full text-sm font-sans uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-brand-text text-white shadow-md' : 'text-brand-text/50 hover:text-brand-text'}`}
                        >
                            Oversikt
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-6 py-2 rounded-full text-sm font-sans uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-brand-text text-white shadow-md' : 'text-brand-text/50 hover:text-brand-text'}`}
                        >
                            Kalender
                        </button>
                        <button
                            onClick={() => setView('analytics')}
                            className={`px-4 py-2 rounded-full text-brand-text/50 hover:text-brand-text transition-all ${view === 'analytics' ? 'bg-brand-text text-white shadow-md' : ''}`}
                            title="Analyse"
                        >
                            <BarChart2 size={18} />
                        </button>
                    </div>

                    <button
                        onClick={onGoToSettings}
                        className="bg-white hover:bg-gray-50 text-brand-text/60 hover:text-brand-text p-3 rounded-full border border-gray-200 transition-all shadow-sm group"
                        title="Innstillinger"
                    >
                        <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                    </button>

                    <button
                        onClick={onAddNew}
                        className="hidden md:flex bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-white font-sans text-sm uppercase tracking-wide px-6 py-3 rounded-full transition-all duration-300 items-center gap-2 border border-brand-gold/20"
                    >
                        <span>+</span> Ny Merkevare
                    </button>
                </div>
            </div>

            {view === 'grid' ? (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {brands.map(brand => (
                        <div
                            key={brand.id}
                            onClick={() => onSelect(brand.id)}
                            className="group cursor-pointer bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden h-[280px] flex flex-col justify-between"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-3xl font-serif text-brand-text group-hover:text-brand-gold transition-colors duration-300 leading-none">{brand.name}</h3>
                                    <span className="text-[10px] font-sans uppercase tracking-widest text-brand-text/40 border border-gray-100 px-3 py-1 rounded-full">{brand.vibe}</span>
                                </div>

                                <p className="text-brand-text/50 text-sm mb-6 truncate font-sans font-light tracking-wide">
                                    {brand.url.replace(/^https?:\/\/(www\.)?/, '')}
                                </p>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-50 pt-6">
                                <div className="text-xs text-brand-text/40 font-sans tracking-wide">
                                    <strong className="text-brand-text/80 font-medium">{brand.posts.length}</strong> poster
                                </div>
                                <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-text group-hover:bg-brand-gold group-hover:text-white transition-all duration-500 transform group-hover:rotate-[-45deg]">
                                    →
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State Card */}
                    <div
                        onClick={onAddNew}
                        className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-gold hover:bg-white/50 transition-all duration-300 group h-[280px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center text-3xl mb-4 text-brand-text/20 group-hover:text-brand-gold group-hover:border-brand-gold transition-all duration-300 shadow-sm">+</div>
                        <p className="font-serif text-xl text-brand-text/60 italic group-hover:text-brand-text transition-colors">
                            {brands.length > 0 ? "Opprett nytt prosjekt" : "Opprett ditt første prosjekt"}
                        </p>
                    </div>
                </div>
            ) : view === 'calendar' ? (
                /* Global Calendar */
                <GlobalCalendar brands={brands} onUpdateBrand={onUpdateBrand} />
            ) : (
                /* Analytics */
                <AnalyticsView brands={brands} />
            )}
        </div>
    );
};

export default Dashboard;
