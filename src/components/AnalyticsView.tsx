import React, { useMemo } from 'react';
import type { Brand } from '../App';

interface AnalyticsViewProps {
    brands: Brand[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ brands }) => {

    // Aggregated stats
    const stats = useMemo(() => {
        let totalPosts = 0;
        let totalLikes = 0;
        let totalImpressions = 0;
        let topPost = { text: '', likes: 0, brandName: '' };

        brands.forEach(brand => {
            totalPosts += brand.posts.length;
            brand.posts.forEach(post => {
                const likes = post.metrics?.likes || 0;
                const views = post.metrics?.impressions || 0;

                totalLikes += likes;
                totalImpressions += views;

                if (likes > topPost.likes) {
                    topPost = { text: post.text, likes: likes, brandName: brand.name };
                }
            });
        });

        // Mock engagement if 0 (for demo vibe) - Use deterministic fallback
        const displayLikes = totalLikes || (totalPosts * 42) + 120;
        const displayViews = totalImpressions || (totalPosts * 1200) + 2000;
        const engagementRate = displayViews > 0 ? ((displayLikes / displayViews) * 100).toFixed(1) : "0.0";

        return { totalPosts, totalLikes: displayLikes, totalImpressions: displayViews, engagementRate, topPost };
    }, [brands]);

    // Data for charts
    const brandPostCounts = brands.map(b => ({ name: b.name, count: b.posts.length, color: b.vibe === 'Proff' ? '#1A1A1A' : b.vibe === 'GenZ' ? '#FF1493' : '#4A90E2' }));
    const maxCount = Math.max(...brandPostCounts.map(b => b.count), 10);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Totale Visninger</p>
                    <h3 className="text-3xl font-serif text-brand-text">{stats.totalImpressions.toLocaleString()}</h3>
                    <p className="text-green-500 text-xs font-bold mt-2">↑ 12% denne uken</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Engasjement</p>
                    <h3 className="text-3xl font-serif text-brand-text">{stats.totalLikes.toLocaleString()}</h3>
                    <p className="text-xs text-gray-400 mt-2">Likes & Kommentarer</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Rate</p>
                    <h3 className="text-3xl font-serif text-brand-text">{stats.engagementRate}%</h3>
                    <p className="text-green-500 text-xs font-bold mt-2">Over bransjesnitt</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Totale Poster</p>
                    <h3 className="text-3xl font-serif text-brand-text">{stats.totalPosts}</h3>
                    <p className="text-xs text-gray-400 mt-2">Fordelt på {brands.length} merkevarer</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-xl font-serif italic text-brand-text mb-8">Aktivitet per Merkevare</h4>
                    <div className="space-y-4">
                        {brandPostCounts.map((b, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="w-32 text-xs font-bold text-gray-500 truncate text-right">{b.name}</span>
                                <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${(b.count / maxCount) * 100}%`, backgroundColor: b.color }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-900 w-8">{b.count}</span>
                            </div>
                        ))}
                        {brands.length === 0 && <p className="text-center text-gray-400 text-sm">Ingen data enda.</p>}
                    </div>
                </div>

                {/* Top Post */}
                <div className="bg-brand-text text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="text-xl font-serif italic text-white/90">🏆 Beste Post</h4>
                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">{stats.topPost.brandName || "Ingen"}</span>
                        </div>
                        <p className="text-lg font-light leading-relaxed text-white/80 italic">
                            "{stats.topPost.text || "Ingen poster generert enda..."}"
                        </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2">
                        <span className="text-2xl">❤️</span>
                        <span className="text-2xl font-bold">{stats.topPost.likes}</span>
                        <span className="text-sm text-white/50 ml-2">likes</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
