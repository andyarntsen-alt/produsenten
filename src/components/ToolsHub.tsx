import React, { useState } from 'react';
import { Hash, User, MessageCircle, Recycle, Eye, ArrowLeft, Bell } from 'lucide-react';
import type { Brand, Tweet } from '../App';
import HashtagGeneratorModal from './HashtagGeneratorModal';
import BioGeneratorModal from './BioGeneratorModal';
import CommentReplyModal from './CommentReplyModal';
import ContentRecyclerModal from './ContentRecyclerModal';
import CompetitorSpyModal from './CompetitorSpyModal';

interface ToolsHubProps {
    brand: Brand;
    updateBrand: (brand: Brand) => void;
    onBack: () => void;
}

const ToolsHub: React.FC<ToolsHubProps> = ({ brand, updateBrand, onBack }) => {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const tools = [
        {
            id: 'hashtag',
            icon: Hash,
            name: 'Hashtag Generator',
            description: 'Finn de beste hashtagsene for din post',
            color: 'from-pink-500 to-rose-500',
            bgColor: 'bg-pink-50',
            iconColor: 'text-pink-600'
        },
        {
            id: 'bio',
            icon: User,
            name: 'Bio Generator',
            description: 'Lag den perfekte profil-bio',
            color: 'from-violet-500 to-purple-500',
            bgColor: 'bg-violet-50',
            iconColor: 'text-violet-600'
        },
        {
            id: 'comment',
            icon: MessageCircle,
            name: 'Kommentar-svar AI',
            description: 'Svar på kommentarer som en proff',
            color: 'from-sky-500 to-cyan-500',
            bgColor: 'bg-sky-50',
            iconColor: 'text-sky-600'
        },
        {
            id: 'recycler',
            icon: Recycle,
            name: 'Content Recycler',
            description: 'Gjenbruk dine beste poster',
            color: 'from-lime-500 to-green-500',
            bgColor: 'bg-lime-50',
            iconColor: 'text-lime-600'
        },
        {
            id: 'competitor',
            icon: Eye,
            name: 'Competitor Spy',
            description: 'Analyser hva konkurrentene gjør',
            color: 'from-slate-600 to-slate-800',
            bgColor: 'bg-slate-50',
            iconColor: 'text-slate-600'
        },
        {
            id: 'reminders',
            icon: Bell,
            name: 'E-post Påminnelser',
            description: 'Få påminnelser om å poste',
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
            comingSoon: true
        }
    ];

    const handleRecycle = (post: Tweet) => {
        updateBrand({ ...brand, posts: [post, ...brand.posts] });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider">Tilbake til Dashboard</span>
                </button>

                <div className="text-center">
                    <h1 className="text-4xl font-serif italic text-brand-text mb-3">
                        🧰 Verktøykassen
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Alt du trenger for å lage, optimalisere og analysere innholdet ditt.
                    </p>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => !tool.comingSoon && setActiveModal(tool.id)}
                        disabled={tool.comingSoon}
                        className={`relative p-6 rounded-3xl text-left transition-all duration-300 group ${tool.comingSoon
                                ? 'opacity-60 cursor-not-allowed'
                                : 'hover:shadow-xl hover:scale-[1.02]'
                            } ${tool.bgColor} border border-gray-100`}
                    >
                        {tool.comingSoon && (
                            <span className="absolute top-4 right-4 px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase">
                                Kommer snart
                            </span>
                        )}

                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <tool.icon size={24} className="text-white" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-1">{tool.name}</h3>
                        <p className="text-sm text-gray-500">{tool.description}</p>

                        {!tool.comingSoon && (
                            <div className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                                Åpne →
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Modals */}
            {activeModal === 'hashtag' && (
                <HashtagGeneratorModal onClose={() => setActiveModal(null)} />
            )}
            {activeModal === 'bio' && (
                <BioGeneratorModal onClose={() => setActiveModal(null)} />
            )}
            {activeModal === 'comment' && (
                <CommentReplyModal onClose={() => setActiveModal(null)} />
            )}
            {activeModal === 'recycler' && (
                <ContentRecyclerModal
                    brand={brand}
                    onClose={() => setActiveModal(null)}
                    onRecycle={handleRecycle}
                />
            )}
            {activeModal === 'competitor' && (
                <CompetitorSpyModal onClose={() => setActiveModal(null)} />
            )}
        </div>
    );
};

export default ToolsHub;
