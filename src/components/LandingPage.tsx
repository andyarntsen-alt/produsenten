import React, { useState, useEffect, useRef } from 'react';
import heroBg from '../assets/brudeferden.jpg';
import feature1 from '../assets/feature_1.jpg';
import feature2 from '../assets/feature_2.jpg';
import feature3 from '../assets/feature_3.jpg';
import TweetPreview from './TweetPreview';
import { Menu, X } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
    hasBrands?: boolean;
    onGoToDashboard?: () => void;
    onGoToAbout: () => void;
    onGoToPricing: () => void;
    onGoToContact: () => void;
}

export const ScrollReveal = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
            {children}
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart, hasBrands, onGoToDashboard, onGoToAbout, onGoToPricing, onGoToContact }) => {
    const [demoVibe, setDemoVibe] = useState<'Proff' | 'GenZ' | 'Minimalist'>('Proff');

    // Typing effect state
    const [textIndex, setTextIndex] = useState(0);
    const [subText, setSubText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const phrases = ["fanger oppmerksomheten", "skaper vekst", "engasjerer", "bygger tillit"];
        const currentPhrase = phrases[textIndex % phrases.length];
        const typeSpeed = isDeleting ? 50 : 100;

        const timer = setTimeout(() => {
            if (!isDeleting && subText === currentPhrase) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && subText === '') {
                setIsDeleting(false);
                setTextIndex((prev) => prev + 1);
            } else {
                setSubText(
                    currentPhrase.substring(0, subText.length + (isDeleting ? -1 : 1))
                );
            }
        }, typeSpeed);

        return () => clearTimeout(timer);
    }, [subText, isDeleting, textIndex]);

    const demoContent = {
        Proff: "Vi er stolte av å presentere vår nye høstkolleksjon. Bærekraftig produsert, designet for varighet. Se utvalget i nettbutikken nå. #Bærekraft #Mote",
        GenZ: "Ikke for å være dramatisk, men denne høstkolleksjonen... 😭✨ Den gir ALT. Ikke sov på denne, besties. Link i bio! 💅",
        Minimalist: "Høst 2024.\nTilgjengelig nå."
    };

    const mockBrand = {
        name: "Nordic Style",
        vibe: demoVibe,
        url: "",
        posts: [],
        id: "demo",
        toneRules: [],
        postingFrequency: 3
    };

    return (
        <div className="flex flex-col min-h-screen bg-brand-bg font-sans text-brand-text overflow-hidden">

            {/* Navigation */}
            <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-6 md:px-10 py-6 md:py-8">
                <div className="text-2xl font-serif italic font-medium tracking-wide text-white drop-shadow-md z-50 relative">Produsenten</div>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-8 text-sm font-light tracking-widest text-white/90 items-center">
                    {hasBrands && (
                        <button
                            onClick={onGoToDashboard}
                            className="hover:text-brand-gold transition-colors uppercase border-b border-transparent hover:border-brand-gold pb-0.5"
                        >
                            Mine Prosjekter
                        </button>
                    )}
                    <button onClick={onGoToAbout} className="hover:text-white transition-colors uppercase">Om oss</button>
                    <button onClick={onGoToPricing} className="hover:text-white transition-colors uppercase">Priser</button>
                    <button onClick={onGoToContact} className="hover:text-white transition-colors uppercase">Kontakt</button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white z-50 p-2 relative"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-brand-bg/95 backdrop-blur-xl z-40 flex flex-col justify-center items-center space-y-8 animate-fade-in">
                        {hasBrands && (
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); onGoToDashboard?.(); }}
                                className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors"
                            >
                                Mine Prosjekter
                            </button>
                        )}
                        <button onClick={() => { setIsMobileMenuOpen(false); onGoToAbout(); }} className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors">Om oss</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); onGoToPricing(); }} className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors">Priser</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); onGoToContact(); }} className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors">Kontakt</button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); onStart(); }}
                            className="mt-8 bg-white text-brand-text px-8 py-3 rounded-full uppercase tracking-widest text-sm font-bold shadow-lg"
                        >
                            Start Nå
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <main className="relative flex-1 flex flex-col justify-center items-center text-center px-4 min-h-screen">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-black/20"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8 pt-20">
                    <ScrollReveal>
                        <h1 className="text-5xl md:text-7xl font-serif italic text-white drop-shadow-xl leading-tight min-h-[160px] md:min-h-[220px]">
                            Skap innhold som<br />
                            <span className="not-italic font-light text-brand-gold">{subText}</span>
                            <span className="animate-pulse font-light text-brand-gold">|</span>
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal className="delay-200">
                        <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                            16+ AI-verktøy for influencere. Fra hashtags til sponsorpitch — alt du trenger på ett sted.
                        </p>
                    </ScrollReveal>

                    <div className="pt-8">
                        <button
                            onClick={onStart}
                            className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-brand-text font-medium text-sm uppercase tracking-[0.2em] py-4 px-10 rounded-full transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:-translate-y-1"
                        >
                            Start Din Reise
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
                    ↓
                </div>
            </main>

            {/* Vibe Demo Section */}
            <section className="py-24 px-6 relative z-10 bg-white">
                <div className="max-w-4xl mx-auto space-y-12 text-center">
                    <ScrollReveal>
                        <div className="space-y-4">
                            <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">Prøv Magien Selv</span>
                            <h2 className="text-3xl md:text-4xl font-serif italic text-brand-text">Én idé, mange stemmer</h2>
                            <p className="text-brand-text/60 max-w-lg mx-auto">Se hvordan Produsenten kan tilpasse budskapet ditt til enhver stil med ett klikk.</p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal className="delay-200">
                        <div className="relative group">
                            {/* Decorative Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/20 via-white/50 to-brand-gold/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>

                            <div className="relative bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] max-w-lg mx-auto overflow-hidden">

                                {/* Segmented Control for Vibe Selection */}
                                <div className="flex justify-center mb-10">
                                    <div className="bg-gray-100/50 p-1.5 rounded-full inline-flex border border-gray-200/50 shadow-inner">
                                        {(['Proff', 'GenZ', 'Minimalist'] as const).map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setDemoVibe(v)}
                                                className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${demoVibe === v
                                                    ? 'bg-brand-text text-white shadow-lg transform scale-105 ring-1 ring-black/5'
                                                    : 'text-brand-text/50 hover:text-brand-text hover:bg-white/80'
                                                    }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="transform transition-all duration-500 ease-in-out">
                                    <TweetPreview
                                        tweet={{
                                            text: demoContent[demoVibe],
                                            status: 'approved',
                                            hook: '',
                                            formatType: 'other' // Using 'other' to satisfy type constraints if strict, or 'Post' if available
                                        }}
                                        brand={mockBrand}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-brand-bg py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-24">

                    {/* Intro Text */}
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto space-y-6">
                            <h2 className="text-4xl md:text-5xl font-serif italic text-brand-text">
                                Alt i <span className="text-brand-gold">én app</span>
                            </h2>
                            <p className="text-brand-text/70 font-light text-lg leading-relaxed">
                                Lag poster, generer hashtags, skriv sponsormail, analyser konkurrenter — uten å bytte verktøy.
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* 3 Images Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[feature1, feature2, feature3].map((img, idx) => (
                            <ScrollReveal key={idx} className={`delay-${idx * 200}`}>
                                <div className="group relative rounded-2xl overflow-hidden shadow-lg border border-gray-100/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                    <div className="absolute inset-0 bg-brand-gold/0 group-hover:bg-brand-gold/10 transition-colors duration-500 z-10"></div>
                                    <img
                                        src={img}
                                        alt={`Feature illustration ${idx + 1}`}
                                        className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Features List & details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <ScrollReveal className="delay-0">
                            <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-50 h-full">
                                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xl mb-4 mx-auto md:mx-0">✍️</div>
                                <h3 className="font-serif italic text-xl text-brand-text">Innhold</h3>
                                <p className="text-sm text-brand-text/60 font-sans">Poster, hooks, repurposing, voice-to-text. Alt du trenger for å produsere.</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal className="delay-200">
                            <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-50 h-full">
                                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xl mb-4 mx-auto md:mx-0">🛠️</div>
                                <h3 className="font-serif italic text-xl text-brand-text">Verktøy</h3>
                                <p className="text-sm text-brand-text/60 font-sans">Hashtags, bio, kommentarsvar, konkurrent­analyse. Spar timer hver uke.</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal className="delay-400">
                            <div className="space-y-3 p-6 bg-white rounded-xl shadow-sm border border-gray-50 h-full">
                                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold text-xl mb-4 mx-auto md:mx-0">📈</div>
                                <h3 className="font-serif italic text-xl text-brand-text">Strategi</h3>
                                <p className="text-sm text-brand-text/60 font-sans">Trender, gap-analyse, sponsorpitch. Voks smartere, ikke hardere.</p>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Video Section */}
                    <ScrollReveal>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-black">
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-auto max-h-[80vh] mx-auto"
                                poster={feature1} // Use first image as poster
                            >
                                <source src="/video/Video_uten_stemme_og_tekst.mp4" type="video/mp4" />
                                Din nettleser støtter ikke videoavspilling.
                            </video>
                        </div>
                    </ScrollReveal>

                    <div className="text-center pt-8">
                        <button
                            onClick={onStart}
                            className="text-brand-text border-b border-brand-text/30 pb-1 hover:border-brand-text transition-colors uppercase tracking-widest text-xs"
                        >
                            Start din reise nå →
                        </button>
                    </div>

                </div>
            </section>

            {/* Quote Section */}
            <section className="bg-brand-text text-white py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <ScrollReveal>
                        <span className="text-6xl text-brand-gold/30 font-serif block mb-8">"</span>
                        <h3 className="text-3xl md:text-4xl font-serif italic leading-relaxed mb-8">
                            Mindre tid på verktøy. Mer tid på kreativitet.
                        </h3>
                        <p className="text-white/50 text-sm uppercase tracking-widest font-sans">Produsenten</p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-brand-bg border-t border-brand-text/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-brand-text font-serif italic text-xl">Produsenten</div>
                    <div className="text-brand-text/40 text-xs font-sans">
                        © 2024 Produsenten AI. Alle rettigheter reservert.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
