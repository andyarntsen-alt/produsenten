import React, { useMemo, useState } from 'react';
import { X, Printer, Camera, Instagram, Linkedin, Twitter } from 'lucide-react';
import type { Brand } from '../App';

interface MediaKitModalProps {
    brands: Brand[];
    onClose: () => void;
}

const MediaKitModal: React.FC<MediaKitModalProps> = ({ brands, onClose }) => {
    const [name, setName] = useState('Ditt Navn / Brand');
    const [bio, setBio] = useState('Kreatør & Innholdsskaper basert i Oslo.');
    const [email, setEmail] = useState('kontakt@dittbrand.no');

    const stats = useMemo(() => {
        let totalPosts = 0;
        let totalLikes = 0;
        let totalViews = 0;
        brands.forEach(b => {
            totalPosts += b.posts.length;
            b.posts.forEach(p => {
                totalLikes += p.metrics?.likes || 0;
                totalViews += p.metrics?.impressions || 0;
            });
        });

        // Mock if zero, for the sake of the kit
        const displayLikes = totalLikes || 12500;
        const displayViews = totalViews || 450000;
        const engagement = ((displayLikes / displayViews) * 100).toFixed(1);

        return { totalPosts, displayLikes, displayViews, engagement };
    }, [brands]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:bg-white print:p-0">
            <div className="bg-white w-full max-w-4xl h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative print:h-auto print:shadow-none print:w-full print:max-w-none print:overflow-visible">
                {/* Close Button (Hide on print) */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 print:hidden z-10"
                >
                    <X size={24} />
                </button>

                {/* Print Button (Hide on print) */}
                <div className="absolute top-6 right-20 print:hidden z-10">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-brand-text text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-gray-800 transition-all"
                    >
                        <Printer size={16} />
                        Last ned PDF
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1 text-center">Velg "Lagre som PDF"</p>
                </div>

                {/* Media Kit Content */}
                <div className="p-12 md:p-16 space-y-12 max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center space-y-6">
                        <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center border-2 border-brand-gold overflow-hidden relative group cursor-pointer">
                            <Camera className="text-gray-300 group-hover:text-gray-500" size={40} />
                            {/* Placeholder for uploaded image logic */}
                        </div>

                        <div className="space-y-2">
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="text-4xl md:text-5xl font-serif text-center w-full focus:outline-none focus:bg-gray-50 rounded"
                            />
                            <input
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="text-xl text-brand-text/60 font-light text-center w-full focus:outline-none focus:bg-gray-50 rounded"
                            />
                        </div>

                        <div className="flex justify-center gap-6 pt-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                <Instagram size={18} /> @dittnavn
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                <Linkedin size={18} /> /in/dittnavn
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                <Twitter size={18} /> @dittnavn
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200"></div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div className="space-y-2">
                            <h3 className="text-5xl font-serif text-brand-text">{stats.displayViews.toLocaleString()}</h3>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Månedlig Rekkevidde</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-5xl font-serif text-brand-text">{stats.engagement}%</h3>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Engasjement</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-5xl font-serif text-brand-text">{stats.displayLikes.toLocaleString()}</h3>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Interaksjoner</p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-200"></div>

                    {/* Audience / Demographics (Mocked) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-xl font-serif italic mb-6">Målgruppe</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">Kvinner</span>
                                    <div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-[65%] h-full bg-brand-text"></div></div>
                                    <span className="text-xs text-gray-400">65%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">Menn</span>
                                    <div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-[35%] h-full bg-gray-400"></div></div>
                                    <span className="text-xs text-gray-400">35%</span>
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <span className="text-sm font-bold text-gray-600">18-24 år</span>
                                    <div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-[40%] h-full bg-brand-gold"></div></div>
                                    <span className="text-xs text-gray-400">40%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">25-34 år</span>
                                    <div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-[45%] h-full bg-brand-gold"></div></div>
                                    <span className="text-xs text-gray-400">45%</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xl font-serif italic mb-6">Samarbeid</h4>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Jeg skaper autentisk innhold som engasjerer. Spesialiserer meg på livsstil, teknologi og gründerskap.
                                Tilbyr produktplassering, ambassadørskap og innholdsproduksjon (UGC).
                            </p>
                            <div className="bg-brand-bg p-6 rounded-xl">
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Kontakt</p>
                                <input
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-transparent text-lg font-bold text-brand-text focus:outline-none w-full border-b border-transparent focus:border-gray-300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-8">
                        <p className="text-xs text-gray-300 uppercase tracking-widest">Powered by Produsenten.no</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaKitModal;
