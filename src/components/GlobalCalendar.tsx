import React, { useState } from 'react';
import type { Brand, Tweet } from '../App';

interface GlobalCalendarProps {
    brands: Brand[];
    onUpdateBrand: (updated: Brand) => void;
}

const GlobalCalendar: React.FC<GlobalCalendarProps> = ({ brands, onUpdateBrand }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "Januar", "Februar", "Mars", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Desember"
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Aggregate all posts
    const allPosts: { post: Tweet, brand: Brand }[] = [];
    brands.forEach(brand => {
        const posts = [...(brand.prevPosts || []), ...brand.posts];
        posts.forEach(post => {
            allPosts.push({ post, brand });
        });
    });

    // Group by Date
    const postsByDate: { [key: string]: { post: Tweet, brand: Brand }[] } = {};
    allPosts.forEach(item => {
        if (item.post.date) {
            if (!postsByDate[item.post.date]) postsByDate[item.post.date] = [];
            postsByDate[item.post.date].push(item);
        }
    });

    const unscheduledItems = allPosts.filter(item => !item.post.date);

    const handleDragStart = (e: React.DragEvent, item: { post: Tweet, brand: Brand }) => {
        // Store brand ID and post index or hook to identify
        e.dataTransfer.setData('application/json', JSON.stringify({
            brandId: item.brand.id,
            postHook: item.post.hook
        }));
    };

    const handleDrop = (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const brand = brands.find(b => b.id === data.brandId);
            if (brand) {
                const postIndex = brand.posts.findIndex(p => p.hook === data.postHook);
                if (postIndex !== -1) {
                    const updatedPosts = [...brand.posts];
                    updatedPosts[postIndex] = { ...updatedPosts[postIndex], date: dateStr };
                    onUpdateBrand({ ...brand, posts: updatedPosts });
                }
            }
        } catch (err) {
            console.error("Drop failed", err);
        }
    };

    const allowDrop = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/30 border border-gray-100/50"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const items = postsByDate[dateStr] || [];
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            days.push(
                <div
                    key={d}
                    onDragOver={allowDrop}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    className={`h-32 border border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors ${isToday ? 'bg-brand-gold/5' : 'bg-white'}`}
                >
                    <span className={`text-sm font-sans ${isToday ? 'font-bold text-brand-gold' : 'text-gray-400'}`}>{d}</span>
                    <div className="mt-2 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                        {items.map((item, idx) => (
                            <div key={idx} className="text-[10px] p-1.5 rounded bg-brand-bg border border-gray-200 shadow-sm hover:border-brand-gold transition-colors cursor-default" title={item.post.text}>
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 bg-gray-100 rounded text-brand-text/60">{item.brand.name.substring(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.post.status === 'approved' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                                    <span className="truncate font-medium text-brand-text">{item.post.formatType || 'Post'}</span>
                                </div>
                                <div className="truncate text-brand-text/70 mt-0.5">{item.post.hook}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    const totalScheduled = Object.values(postsByDate).reduce((acc, curr) => acc + curr.length, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-serif italic text-brand-text">Global Kalender</h3>
                    {unscheduledItems.length > 0 && (
                        <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {unscheduledItems.length} Uplanlagte
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <button onClick={prevMonth} className="text-brand-text/50 hover:text-brand-gold transition-colors">←</button>
                    <span className="font-sans font-medium w-32 text-center select-none">{monthNames[month]} {year}</span>
                    <button onClick={nextMonth} className="text-brand-text/50 hover:text-brand-gold transition-colors">→</button>
                </div>
            </div>

            {/* Status Summary Banner */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-6 items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-sans text-brand-text"><strong className="font-medium">{totalScheduled}</strong> Planlagt denne måneden</span>
                </div>
                <div className="flex items-center gap-2 text-brand-text/40">|</div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span className="text-sm font-sans text-brand-text"><strong className="font-medium">{unscheduledItems.length}</strong> Uplanlagte (må tildeles dato)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                        {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => (
                            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-widest text-brand-text/40">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {renderDays()}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                        <h4 className="text-lg font-serif italic text-brand-text mb-4 flex items-center gap-2">
                            <span>📋</span> Alle Uplanlagte ({unscheduledItems.length})
                        </h4>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {unscheduledItems.length === 0 ? (
                                <p className="text-sm text-brand-text/40 italic">Ingen uplanlagte poster.</p>
                            ) : (
                                unscheduledItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item)}
                                        className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-gold/50 transition-colors group cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-white border border-gray-200 rounded text-brand-text/60">{item.brand.name}</span>
                                            <div className="text-[10px] font-medium text-brand-text/60 uppercase tracking-wider">{item.post.formatType || 'Post'}</div>
                                        </div>

                                        <p className="text-sm text-brand-text line-clamp-3 mb-3">{item.post.hook || item.post.text}</p>

                                        <div className="text-[10px] text-brand-text/40 italic">Dra til kalenderen for å planlegge</div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="date"
                                                className="text-xs p-1 border border-gray-200 rounded bg-white focus:border-brand-gold outline-none w-full opacity-50 hover:opacity-100 transition-opacity"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const brandToUpdate = item.brand;
                                                        const postIndex = brandToUpdate.posts.findIndex(p => p === item.post);
                                                        if (postIndex !== -1) {
                                                            const updatedPosts = [...brandToUpdate.posts];
                                                            updatedPosts[postIndex] = { ...updatedPosts[postIndex], date: e.target.value };
                                                            onUpdateBrand({ ...brandToUpdate, posts: updatedPosts });
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalCalendar;
