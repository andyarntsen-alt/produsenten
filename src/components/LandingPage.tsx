import React, { useState, useEffect, useRef } from 'react';
import heroBg from '../assets/brudeferden.jpg';
import heroImage from '../assets/Whisk_4fa33a564160ed4bb9d4470db584a600dr.jpeg';
import { Menu, X, Sparkles, Zap, Target } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

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
    const { settings, setLanguage } = useSettings();
    const isEnglish = settings.language === 'en';

    // Translations
    const t = {
        nav: {
            myProjects: isEnglish ? 'My Projects' : 'Mine Prosjekter',
            about: isEnglish ? 'About' : 'Om oss',
            pricing: isEnglish ? 'Pricing' : 'Priser',
            contact: isEnglish ? 'Contact' : 'Kontakt',
            startNow: isEnglish ? 'Start Now' : 'Start Nå',
        },
        hero: {
            title: isEnglish ? 'Create content that' : 'Skap innhold som',
            subtitle: isEnglish ? 'AI that learns your voice. Write posts, threads and pitches in seconds.' : 'AI som lærer din stemme. Skriv poster, tråder og pitch på sekunder.',
            cta: isEnglish ? 'Start Your Journey' : 'Start Din Reise',
        },
        features: {
            title: isEnglish ? 'Your voice, ' : 'Din stemme, ',
            titleHighlight: isEnglish ? 'amplified' : 'forsterket',
            subtitle: isEnglish ? 'Produsenten learns how you write, and helps you create more. Faster.' : 'Produsenten lærer hvordan du skriver, og hjelper deg lage mer. Raskere.',
            imageAlt: isEnglish ? 'AI and human collaborating' : 'AI og menneske som samarbeider',
            imageCaption: isEnglish ? 'You + AI = Unlimited output' : 'Du + AI = Ubegrenset output',
            write: isEnglish ? 'Write' : 'Skriv',
            writeDesc: isEnglish ? 'Posts, threads, hooks. AI that sounds like you.' : 'Poster, tråder, hooks. AI som høres ut som deg.',
            optimize: isEnglish ? 'Optimize' : 'Optimaliser',
            optimizeDesc: isEnglish ? 'Hashtags, bio, timing. Get more from every post.' : 'Hashtags, bio, timing. Få mer ut av hver post.',
            grow: isEnglish ? 'Grow' : 'Voks',
            growDesc: isEnglish ? 'Sponsor pitch, analysis, strategy. Build a business.' : 'Sponsorpitch, analyse, strategi. Bygg en business.',
            videoFallback: isEnglish ? 'Your browser does not support video playback.' : 'Din nettleser støtter ikke videoavspilling.',
            startNow: isEnglish ? 'Start your journey now →' : 'Start din reise nå →',
        },
        quote: {
            text: isEnglish ? 'Write once. Publish everywhere.' : 'Skriv én gang. Publiser overalt.',
        },
        footer: {
            rights: isEnglish ? '© 2025 Produsenten. All rights reserved.' : '© 2025 Produsenten. Alle rettigheter reservert.',
        },
    };

    // Typing effect phrases
    const phrases = isEnglish
        ? ["converts", "engages", "grows", "sells"]
        : ["konverterer", "engasjerer", "vokser", "selger"];

    // Typing effect state
    const [textIndex, setTextIndex] = useState(0);
    const [subText, setSubText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(settings.language === 'no' ? 'en' : 'no');
    };

    // Reset typing effect when language changes
    useEffect(() => {
        setSubText('');
        setTextIndex(0);
        setIsDeleting(false);
    }, [settings.language]);

    useEffect(() => {
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

    return (
        <div className="flex flex-col min-h-screen bg-brand-bg font-sans text-brand-text overflow-hidden">

            {/* Navigation */}
            <nav className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-6 md:px-10 py-6 md:py-8">
                <div className="text-2xl font-serif italic font-medium tracking-wide text-white drop-shadow-md z-50 relative">Produsenten</div>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-8 text-sm font-light tracking-widest text-white/90 items-center">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-all text-xs"
                        title={settings.language === 'no' ? 'Switch to English' : 'Bytt til norsk'}
                    >
                        <span>{settings.language === 'no' ? '🇳🇴' : '🇬🇧'}</span>
                        <span className="uppercase tracking-wider">{settings.language === 'no' ? 'NO' : 'EN'}</span>
                    </button>
                    <button
                        onClick={onGoToDashboard}
                        className="bg-brand-gold/20 hover:bg-brand-gold text-white hover:text-brand-text px-4 py-2 rounded-full transition-all uppercase text-xs font-bold tracking-wider"
                    >
                        Test
                    </button>
                    {hasBrands && (
                        <button
                            onClick={onGoToDashboard}
                            className="hover:text-brand-gold transition-colors uppercase border-b border-transparent hover:border-brand-gold pb-0.5"
                        >
                            {t.nav.myProjects}
                        </button>
                    )}
                    <button onClick={onGoToAbout} className="hover:text-white transition-colors uppercase">{t.nav.about}</button>
                    <button onClick={onGoToPricing} className="hover:text-white transition-colors uppercase">{t.nav.pricing}</button>
                    <button onClick={onGoToContact} className="hover:text-white transition-colors uppercase">{t.nav.contact}</button>
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
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full transition-all"
                        >
                            <span>{settings.language === 'no' ? '🇳🇴' : '🇬🇧'}</span>
                            <span className="uppercase tracking-wider text-sm">{settings.language === 'no' ? 'Norsk' : 'English'}</span>
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); onGoToDashboard?.(); }}
                            className="bg-brand-gold text-brand-text px-6 py-3 rounded-full uppercase tracking-widest text-sm font-bold"
                        >
                            Test
                        </button>
                        {hasBrands && (
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); onGoToDashboard?.(); }}
                                className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors"
                            >
                                {t.nav.myProjects}
                            </button>
                        )}
                        <button onClick={() => { setIsMobileMenuOpen(false); onGoToAbout(); }} className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors">{t.nav.about}</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); onGoToPricing(); }} className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors">{t.nav.pricing}</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); onGoToContact(); }} className="text-2xl text-white font-serif italic hover:text-brand-gold transition-colors">{t.nav.contact}</button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); onStart(); }}
                            className="mt-8 bg-white text-brand-text px-8 py-3 rounded-full uppercase tracking-widest text-sm font-bold shadow-lg"
                        >
                            {t.nav.startNow}
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
                            {t.hero.title}<br />
                            <span className="not-italic font-light text-brand-gold">{subText}</span>
                            <span className="animate-pulse font-light text-brand-gold">|</span>
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal className="delay-200">
                        <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                            {t.hero.subtitle}
                        </p>
                    </ScrollReveal>

                    <div className="pt-8">
                        <button
                            onClick={onStart}
                            className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-brand-text font-medium text-sm uppercase tracking-[0.2em] py-4 px-10 rounded-full transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:-translate-y-1"
                        >
                            {t.hero.cta}
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
                    ↓
                </div>
            </main>

            {/* Features Section */}
            <section className="bg-brand-bg py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto space-y-24">

                    {/* Intro Text */}
                    <ScrollReveal>
                        <div className="text-center max-w-3xl mx-auto space-y-6">
                            <h2 className="text-4xl md:text-5xl font-serif italic text-brand-text">
                                {t.features.title}<span className="text-brand-gold">{t.features.titleHighlight}</span>
                            </h2>
                            <p className="text-brand-text/70 font-light text-lg leading-relaxed">
                                {t.features.subtitle}
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Hero Image - AI + Human Collaboration */}
                    <ScrollReveal>
                        <div className="relative max-w-4xl mx-auto">
                            <div className="group relative rounded-3xl overflow-hidden shadow-2xl border border-amber-100/50 bg-gradient-to-br from-amber-50 to-orange-50">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
                                <img
                                    src={heroImage}
                                    alt={t.features.imageAlt}
                                    className="w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-700"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white/90 font-serif italic text-xl md:text-2xl text-center">
                                        {t.features.imageCaption}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Features List & details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <ScrollReveal className="delay-0">
                            <div className="space-y-3 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-100/50 h-full">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 mx-auto md:mx-0">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="font-serif italic text-xl text-brand-text">{t.features.write}</h3>
                                <p className="text-sm text-brand-text/60 font-sans">{t.features.writeDesc}</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal className="delay-200">
                            <div className="space-y-3 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-100/50 h-full">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 mx-auto md:mx-0">
                                    <Zap size={24} />
                                </div>
                                <h3 className="font-serif italic text-xl text-brand-text">{t.features.optimize}</h3>
                                <p className="text-sm text-brand-text/60 font-sans">{t.features.optimizeDesc}</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal className="delay-400">
                            <div className="space-y-3 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-100/50 h-full">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 mx-auto md:mx-0">
                                    <Target size={24} />
                                </div>
                                <h3 className="font-serif italic text-xl text-brand-text">{t.features.grow}</h3>
                                <p className="text-sm text-brand-text/60 font-sans">{t.features.growDesc}</p>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Video Section */}
                    <ScrollReveal>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-auto max-h-[80vh] mx-auto"
                            >
                                <source src="/video/Whisk_qmmlbzyjrzy1gjy50sy3mwyty2myqtlmnjnk1ym.mp4" type="video/mp4" />
                                {t.features.videoFallback}
                            </video>
                        </div>
                    </ScrollReveal>

                    <div className="text-center pt-8">
                        <button
                            onClick={onStart}
                            className="text-brand-text border-b border-brand-text/30 pb-1 hover:border-brand-text transition-colors uppercase tracking-widest text-xs"
                        >
                            {t.features.startNow}
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
                            {t.quote.text}
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
                        {t.footer.rights}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
