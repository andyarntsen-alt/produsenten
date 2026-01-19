import React from 'react';
import type { Tweet, Brand } from '../App';

interface TweetPreviewProps {
    tweet: Tweet;
    brand: Brand;
}

const TweetPreview: React.FC<TweetPreviewProps> = ({ tweet, brand }) => {
    // Generate a consistent PFP color/initial based on brand name
    const initial = brand.name.charAt(0).toUpperCase();

    // Format content: handle line breaks
    const content = tweet.text || '';

    // Fake timestamp
    const time = "Nå";

    return (
        <div className="bg-white border border-gray-100 rounded-xl max-w-md mx-auto shadow-sm overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                    {initial}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900 truncate">{brand.name}</span>
                        <span className="text-blue-500 text-[10px]">VERIFIED</span>
                    </div>
                    <div className="text-slate-500 text-sm truncate">@{brand.name.toLowerCase().replace(/\s+/g, '')} · {time}</div>
                </div>
                <div className="text-slate-400">···</div>
            </div>

            {/* Body */}
            <div className="px-4 pb-2 text-slate-900 text-[15px] leading-normal whitespace-pre-wrap">
                {content}
            </div>

            {/* Media Placeholder */}
            {tweet.mediaIdea && (
                <div className="mt-2 mx-4 mb-2 rounded-xl bg-slate-100 border border-slate-200 h-48 flex items-center justify-center text-slate-400 text-sm p-4 text-center">
                    <span>📷 {tweet.mediaIdea}</span>
                </div>
            )}

            {/* Footer Metrics */}
            <div className="px-4 py-3 flex justify-between text-slate-500 text-sm border-t border-gray-50 mt-2">
                <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">💬 <span>{tweet.metrics?.replies || 0}</span></div>
                <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer">gl <span>{Math.floor((tweet.metrics?.likes || 0) * 0.3)}</span></div>
                <div className="flex items-center gap-1 hover:text-pink-500 cursor-pointer">♥ <span>{tweet.metrics?.likes || 0}</span></div>
                <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">il <span>{tweet.metrics?.impressions || 0}</span></div>
            </div>
        </div>
    );
};

export default TweetPreview;
