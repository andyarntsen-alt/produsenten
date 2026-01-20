import React, { useState } from 'react';
import { Twitter, Linkedin, Heart, MessageCircle, Repeat2, Share, ThumbsUp, Send } from 'lucide-react';

interface PlatformPreviewProps {
    postText: string;
    authorName?: string;
    authorHandle?: string;
    authorAvatar?: string;
}

type Platform = 'twitter' | 'linkedin';

const PlatformPreview: React.FC<PlatformPreviewProps> = ({
    postText,
    authorName = 'Din Bedrift',
    authorHandle = '@dinbedrift',
    authorAvatar
}) => {
    const [platform, setPlatform] = useState<Platform>('twitter');

    // Generate initials for avatar fallback
    const initials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Format text with line breaks
    const formattedText = postText.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line}
            {i < postText.split('\n').length - 1 && <br />}
        </React.Fragment>
    ));

    return (
        <div className="space-y-3">
            {/* Platform Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setPlatform('twitter')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        platform === 'twitter'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Twitter size={14} />
                    X / Twitter
                </button>
                <button
                    onClick={() => setPlatform('linkedin')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        platform === 'linkedin'
                            ? 'bg-[#0A66C2] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Linkedin size={14} />
                    LinkedIn
                </button>
            </div>

            {/* Preview */}
            {platform === 'twitter' ? (
                <TwitterPreview
                    text={formattedText}
                    rawText={postText}
                    authorName={authorName}
                    authorHandle={authorHandle}
                    authorAvatar={authorAvatar}
                    initials={initials}
                />
            ) : (
                <LinkedInPreview
                    text={formattedText}
                    rawText={postText}
                    authorName={authorName}
                    authorAvatar={authorAvatar}
                    initials={initials}
                />
            )}
        </div>
    );
};

interface PreviewProps {
    text: React.ReactNode;
    rawText: string;
    authorName: string;
    authorHandle?: string;
    authorAvatar?: string;
    initials: string;
}

const TwitterPreview: React.FC<PreviewProps> = ({ text, rawText, authorName, authorHandle, authorAvatar, initials }) => {
    const isOverLimit = rawText.length > 280;

    return (
        <div className="bg-black text-white rounded-xl overflow-hidden">
            {/* Tweet */}
            <div className="p-4">
                <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="shrink-0">
                        {authorAvatar ? (
                            <img src={authorAvatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-1 text-sm">
                            <span className="font-bold truncate">{authorName}</span>
                            <span className="text-gray-500 truncate">{authorHandle}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">nå</span>
                        </div>

                        {/* Text */}
                        <p className="mt-1 text-[15px] leading-normal whitespace-pre-wrap">
                            {text}
                        </p>

                        {/* Character warning */}
                        {isOverLimit && (
                            <p className="mt-2 text-xs text-red-400">
                                {rawText.length}/280 tegn (over grensen!)
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3 max-w-[400px]">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                                <MessageCircle size={18} />
                                <span className="text-sm">12</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors">
                                <Repeat2 size={18} />
                                <span className="text-sm">5</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-pink-400 transition-colors">
                                <Heart size={18} />
                                <span className="text-sm">48</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors">
                                <Share size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LinkedInPreview: React.FC<Omit<PreviewProps, 'authorHandle'>> = ({ text, rawText, authorName, authorAvatar, initials }) => {
    const [expanded, setExpanded] = useState(rawText.length <= 300);
    const shouldTruncate = rawText.length > 300;

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Post */}
            <div className="p-4">
                {/* Header */}
                <div className="flex gap-3 mb-3">
                    {authorAvatar ? (
                        <img src={authorAvatar} alt="" className="w-12 h-12 rounded-full" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-sm font-bold">
                            {initials}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-900">{authorName}</p>
                        <p className="text-xs text-gray-500">CEO & Founder</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            nå · <span className="text-gray-400">🌐</span>
                        </p>
                    </div>
                </div>

                {/* Text */}
                <div className="text-[14px] leading-[1.4] text-gray-900">
                    {shouldTruncate && !expanded ? (
                        <>
                            <p className="whitespace-pre-wrap">
                                {rawText.slice(0, 300)}...
                            </p>
                            <button
                                onClick={() => setExpanded(true)}
                                className="text-gray-500 hover:text-[#0A66C2] font-medium mt-1"
                            >
                                ...se mer
                            </button>
                        </>
                    ) : (
                        <p className="whitespace-pre-wrap">{text}</p>
                    )}
                </div>

                {/* Engagement */}
                <div className="flex items-center gap-2 mt-4 pb-2 border-b border-gray-100">
                    <div className="flex -space-x-1">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px]">👍</span>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px]">❤️</span>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-[10px]">🎉</span>
                    </div>
                    <span className="text-xs text-gray-500">124</span>
                    <span className="text-xs text-gray-500 ml-auto">8 kommentarer · 3 delinger</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-around mt-2">
                    <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded transition-colors">
                        <ThumbsUp size={18} />
                        <span className="text-sm font-medium">Lik</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">Kommenter</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded transition-colors">
                        <Repeat2 size={18} />
                        <span className="text-sm font-medium">Del</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded transition-colors">
                        <Send size={18} />
                        <span className="text-sm font-medium">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlatformPreview;
