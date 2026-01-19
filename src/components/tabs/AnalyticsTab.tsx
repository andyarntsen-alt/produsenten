import React from 'react';
import type { Brand } from '../../App';

interface AnalyticsTabProps {
    brand: Brand;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ brand }) => {
    // Mock calculations or real data usage
    const posts = brand.posts;
    const totalLikes = posts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0);
    const totalImpressions = posts.reduce((acc, p) => acc + (p.metrics?.impressions || 0), 0);

    // Group by format type for "Top Formats"
    const formatCounts: { [key: string]: number } = {};
    const formatLikes: { [key: string]: number } = {};

    posts.forEach(p => {
        const type = p.formatType || 'other';
        formatCounts[type] = (formatCounts[type] || 0) + 1;
        formatLikes[type] = (formatLikes[type] || 0) + (p.metrics?.likes || 0);
    });

    const formatPerformance = Object.keys(formatCounts).map(type => ({
        type,
        count: formatCounts[type],
        avgLikes: formatCounts[type] ? Math.round(formatLikes[type] / formatCounts[type]) : 0
    })).sort((a, b) => b.avgLikes - a.avgLikes);

    const maxAvgLikes = Math.max(...formatPerformance.map(f => f.avgLikes), 1);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-serif italic text-brand-text mb-2">Visuell Analyse</h3>
                    <p className="text-brand-text/60 font-sans font-light">Innsikt som hjelper deg å vokse.</p>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-brand-text/40 mb-2">Totale Visninger</div>
                    <div className="text-4xl font-serif text-brand-text">{totalImpressions.toLocaleString()}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-brand-text/40 mb-2">Totale Likes</div>
                    <div className="text-4xl font-serif text-brand-text">{totalLikes.toLocaleString()}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-brand-text/40 mb-2">Snitt per post</div>
                    <div className="text-4xl font-serif text-brand-text">
                        {posts.length > 0 ? (totalLikes / posts.length).toFixed(1) : '0'}
                    </div>
                </div>
            </div>

            {/* Top Formats Bar Chart */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-lg font-serif italic text-brand-text mb-6">Beste Formater (Snitt Likes)</h4>

                {formatPerformance.length === 0 ? (
                    <p className="text-brand-text/40 italic">Ingen data tilgjengelig enda.</p>
                ) : (
                    <div className="space-y-4">
                        {formatPerformance.map((item) => (
                            <div key={item.type} className="flex items-center gap-4">
                                <div className="w-32 text-sm font-medium text-brand-text/60 capitalize text-right">{item.type}</div>
                                <div className="flex-1 h-8 bg-gray-50 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-brand-gold/80 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(item.avgLikes / maxAvgLikes) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="w-16 text-sm font-bold text-brand-text">{item.avgLikes}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-brand-bg p-6 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">AI Anbefaling</h4>
                <p className="text-brand-text italic">
                    {formatPerformance.length > 0
                        ? `Basert på dataene dine, bør du fokusere mer på "${formatPerformance[0].type}"-poster, som genererer ${(formatPerformance[0].avgLikes / (formatPerformance[formatPerformance.length - 1].avgLikes || 1)).toFixed(1)}x mer engasjement enn dine svakeste formater.`
                        : "Legg inn tall for dine poster for å få AI-anbefalinger her."}
                </p>
            </div>
        </div>
    );
};

export default AnalyticsTab;
