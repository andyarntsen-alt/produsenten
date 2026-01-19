import React from 'react';
import { ScrollReveal } from './LandingPage';

interface ContactPageProps {
    onBack: () => void;
    onStart: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack, onStart }) => {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-gold/30">
            {/* Navigation */}
            <nav className="fixed w-full z-50 px-6 py-4 glass-nav">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div onClick={onBack} className="text-2xl font-serif italic font-bold cursor-pointer hover:opacity-80 transition-opacity">
                        Produsenten
                    </div>
                    <div className="flex gap-6 items-center">
                        <button onClick={onBack} className="text-sm font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">
                            Tilbake
                        </button>
                        <button onClick={onStart} className="bg-brand-text text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors">
                            Start Nå
                        </button>
                    </div>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <ScrollReveal>
                        <h1 className="text-5xl md:text-7xl font-serif italic mb-8">Kontakt Oss</h1>
                        <p className="text-xl md:text-2xl font-light leading-relaxed mb-16 max-w-2xl opacity-80">
                            Har du spørsmål om hvordan AI kan revolusjonere din merkevare? Vi er her for å hjelpe deg.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <ScrollReveal>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
                                <h3 className="text-2xl font-serif italic mb-6">Send oss en melding</h3>
                                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Melding sendt! (Dette er en demo)"); }}>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Navn</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-gold/50 transition-all" placeholder="Ditt navn" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">E-post</label>
                                        <input type="email" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-gold/50 transition-all" placeholder="din@epost.no" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Melding</label>
                                        <textarea rows={4} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-gold/50 transition-all" placeholder="Hva lurer du på?" required></textarea>
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-brand-text text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors">
                                        Send Melding
                                    </button>
                                </form>
                            </div>
                        </ScrollReveal>

                        <div className="space-y-8">
                            <ScrollReveal>
                                <div className="bg-brand-gold/10 p-8 rounded-3xl border border-brand-gold/20">
                                    <h3 className="text-xl font-bold uppercase tracking-widest mb-2">E-post</h3>
                                    <a href="mailto:hei@produsenten.no" className="text-2xl font-serif italic hover:text-brand-gold transition-colors">
                                        hei@produsenten.no
                                    </a>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal>
                                <div className="bg-white p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Besøk oss</h3>
                                    <address className="not-italic text-lg opacity-80 leading-relaxed">
                                        Menneske + Maskin AS<br />
                                        Teknologiveien 12<br />
                                        0123 Oslo<br />
                                        Norge
                                    </address>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal>
                                <div className="p-8">
                                    <p className="text-sm opacity-60 leading-relaxed">
                                        Vi svarer vanligvis innen 24 timer på hverdager. For hastesaker i forbindelse med pågående produksjoner, vennligst bruk support-chatten i dashbordet.
                                    </p>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
