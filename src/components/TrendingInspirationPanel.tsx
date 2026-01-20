import React, { useState, useMemo } from 'react';
import { TrendingUp, Lightbulb, Calendar, Sparkles, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import type { Brand } from '../App';
import {
    getTrendingTopicsForBrand,
    getViralExamplesForBrand,
    getTodayHookIdeasForBrand,
    getSeasonalContent,
    type TrendingTopic,
    type ViralPost
} from '../services/trendingService';
import { useToast } from './ToastContext';

interface TrendingInspirationPanelProps {
    brand: Brand;
    onUseIdea?: (idea: string) => void;
}

const TrendingInspirationPanel: React.FC<TrendingInspirationPanelProps> = ({ brand, onUseIdea }) => {
    const { showToast } = useToast();
    const [activeSection, setActiveSection] = useState<'trending' | 'viral' | 'daily' | 'seasonal' | null>('trending');

    // Brand-spesifikke data - oppdateres automatisk når brand endres
    const trendingTopics = useMemo(() => getTrendingTopicsForBrand(brand), [brand]);
    const viralExamples = useMemo(() => getViralExamplesForBrand(brand, 4), [brand]);
    const todayHooks = useMemo(() => getTodayHookIdeasForBrand(brand), [brand]);
    const seasonalContent = getSeasonalContent();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Kopiert!', 'success');
    };

    const Section = ({ id, title, icon, children }: { id: 'trending' | 'viral' | 'daily' | 'seasonal'; title: string; icon: React.ReactNode; children: React.ReactNode }) => (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setActiveSection(activeSection === id ? null : id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium text-sm">{title}</span>
                </div>
                {activeSection === id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {activeSection === id && (
                <div className="p-3 bg-white">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-blue-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-600">Inspirasjon</h3>
            </div>

            {/* Trending Topics - Tilpasset merkevaren */}
            <Section id="trending" title={`Trending for ${brand.name}`} icon={<TrendingUp size={16} className="text-green-500" />}>
                <p className="text-xs text-gray-500 mb-3">Relevante topics basert på din strategi og bransje.</p>
                <div className="space-y-2">
                    {trendingTopics.map((topic: TrendingTopic, i: number) => (
                        <button
                            key={i}
                            onClick={() => onUseIdea?.(topic.name)}
                            className="w-full text-left text-sm p-2 rounded-lg bg-white border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2">
                                <span>{topic.name}</span>
                                {topic.source === 'Din strategi' && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded">Din pillar</span>
                                )}
                                {topic.source === 'Din analyse' && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">Din vinkel</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                Bruk →
                            </span>
                        </button>
                    ))}
                </div>
            </Section>

            {/* Viral Examples */}
            <Section id="viral" title="Virale Eksempler" icon={<Lightbulb size={16} className="text-yellow-500" />}>
                <p className="text-xs text-gray-500 mb-3">Lær av poster som gikk viralt. Klikk for å kopiere strukturen.</p>
                <div className="space-y-3">
                    {viralExamples.map((post: ViralPost, i: number) => (
                        <div
                            key={i}
                            className="p-3 bg-white rounded-lg border border-gray-100 hover:border-yellow-300 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                        {post.hookType}
                                    </span>
                                    <span className="text-xs text-gray-400">{post.platform}</span>
                                </div>
                                <span className="text-xs text-green-600 font-medium">{post.engagement}</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {post.text.length > 150 ? post.text.slice(0, 150) + '...' : post.text}
                            </p>
                            <button
                                onClick={() => copyToClipboard(post.text)}
                                className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                            >
                                <Copy size={12} />
                                Kopier
                            </button>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Daily Hook Ideas - Tilpasset merkevaren */}
            <Section id="daily" title="Hook-ideer for deg" icon={<Calendar size={16} className="text-blue-500" />}>
                <p className="text-xs text-gray-500 mb-3">Tilpasset dine innholdsvinkler og dagens tema.</p>
                <div className="space-y-4">
                    {todayHooks.map((hookGroup, groupIndex) => (
                        <div key={groupIndex}>
                            <p className="text-xs font-bold text-blue-600 mb-2">{hookGroup.theme}</p>
                            <div className="space-y-2">
                                {hookGroup.hookIdeas.map((hook: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => onUseIdea?.(hook)}
                                        className="w-full text-left text-sm p-2 rounded-lg bg-blue-50 border border-blue-100 hover:border-blue-300 hover:bg-blue-100 transition-all"
                                    >
                                        {hook}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Seasonal Content */}
            {seasonalContent.length > 0 && (
                <Section id="seasonal" title="Sesongaktuelt" icon={<Sparkles size={16} className="text-purple-500" />}>
                    {seasonalContent.map((season, i) => (
                        <div key={i} className="mb-3 last:mb-0">
                            <p className="text-xs font-bold text-purple-600 mb-2">{season.event}</p>
                            <div className="space-y-2">
                                {season.ideas.map((idea: string, j: number) => (
                                    <button
                                        key={j}
                                        onClick={() => onUseIdea?.(idea)}
                                        className="w-full text-left text-sm p-2 rounded-lg bg-purple-50 border border-purple-100 hover:border-purple-300 hover:bg-purple-100 transition-all"
                                    >
                                        {idea}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </Section>
            )}
        </div>
    );
};

export default TrendingInspirationPanel;
