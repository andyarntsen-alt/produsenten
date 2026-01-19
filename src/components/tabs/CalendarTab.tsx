import React, { useState } from 'react';
import { X, Calendar as CalIcon } from 'lucide-react';
import type { Brand, Tweet } from '../../App';
import TweetPreview from '../TweetPreview';

interface CalendarTabProps {
    brand: Brand;
    updateBrand: (updated: Brand) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ brand }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPost, setSelectedPost] = useState<Tweet | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "Januar", "Februar", "Mars", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Desember"
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon
    // Adjust for Monday start (Mon=0, Sun=6)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Combine posts
    const allPosts = [...(brand.prevPosts || []), ...brand.posts];

    // Group by YYYY-MM-DD
    const postsByDate: { [key: string]: Tweet[] } = {};
    allPosts.forEach(post => {
        if (post.date) {
            if (!postsByDate[post.date]) postsByDate[post.date] = [];
            postsByDate[post.date].push(post);
        }
    });

    const renderDays = () => {
        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/30 border border-gray-100/50"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const posts = postsByDate[dateStr] || [];
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            days.push(
                <div key={d} className={`h-32 border border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors ${isToday ? 'bg-brand-gold/5' : 'bg-white'}`}>
                    <span className={`text-sm font-sans ${isToday ? 'font-bold text-brand-gold' : 'text-gray-400'}`}>{d}</span>

                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                        {posts.map((post, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedPost(post)}
                                className="w-full text-left text-[10px] p-1.5 rounded bg-brand-bg border border-gray-200 shadow-sm hover:border-brand-gold transition-colors hover:shadow-md"
                                title="Klikk for å se detaljer"
                            >
                                <div className="flex items-center gap-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${post.status === 'approved' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                                    <span className="truncate font-medium text-brand-text">{post.formatType || 'Post'}</span>
                                </div>
                                <div className="truncate text-brand-text/70 mt-0.5">{post.hook}</div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif italic text-brand-text">Kalender</h3>
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <button onClick={prevMonth} className="text-brand-text/50 hover:text-brand-gold transition-colors">←</button>
                    <span className="font-sans font-medium w-32 text-center select-none">{monthNames[month]} {year}</span>
                    <button onClick={nextMonth} className="text-brand-text/50 hover:text-brand-gold transition-colors">→</button>
                </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-widest text-brand-text/40">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {renderDays()}
                </div>
            </div>

            <div className="flex gap-4 text-xs text-brand-text/50 font-sans px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Godkjent
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div> Utkast
                </div>
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-text/20 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPost(null)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${selectedPost.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {selectedPost.status === 'approved' ? 'Publiseringsklar' : 'Utkast'}
                                </span>
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                    <CalIcon size={14} /> {selectedPost.date}
                                </span>
                            </div>
                            <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-brand-text transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <TweetPreview tweet={selectedPost} brand={brand} />
                            {selectedPost.imageUrl && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={selectedPost.imageUrl} alt="Post content" className="w-full h-auto" />
                                </div>
                            )}

                            {selectedPost.thread && selectedPost.thread.length > 0 && (
                                <div className="mt-6 pl-4 border-l-2 border-brand-gold/20 space-y-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Tråd ({selectedPost.thread.length} deler)</p>
                                    {selectedPost.thread.map((t, i) => (
                                        <div key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {t.text}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedPost.linkedInPost && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded mb-2 inline-block">LinkedIn Versjon</span>
                                    <div className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                                        {selectedPost.linkedInPost}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarTab;
