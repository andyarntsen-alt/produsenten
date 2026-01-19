import React, { useState } from 'react';
import heroBg from '../assets/hero-bg.png';

interface OnboardingProps {
    vibeOptions: string[];
    onSubmit: (name: string, url: string, vibe: string, industry?: string, offer?: string, target?: string, goals?: string, frequency?: number) => void;
    onCancel: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ vibeOptions, onSubmit, onCancel }) => {
    const [step, setStep] = useState(0); // 0: Guide, 1: Form
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [vibe, setVibe] = useState('');
    const [industry, setIndustry] = useState('');
    const [offer, setOffer] = useState('');
    const [target, setTarget] = useState('');
    const [goals, setGoals] = useState('');
    const [frequency, setFrequency] = useState<number>(5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !url.trim() || !vibe) {
            alert('Vennligst fyll ut navn, URL og tone.');
            return;
        }
        onSubmit(
            name.trim(),
            url.trim(),
            vibe,
            industry.trim() || undefined,
            offer.trim() || undefined,
            target.trim() || undefined,
            goals.trim() || undefined,
            frequency
        );
    };

    if (step === 0) {
        return (
            <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden font-sans">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }}>
                    <div className="absolute inset-0 bg-brand-bg/95 backdrop-blur-sm"></div>
                </div>

                <div className="relative z-10 max-w-4xl text-center space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-serif italic text-brand-text animate-fade-in-up">Velkommen til Produsenten</h1>
                        <p className="text-xl text-brand-text/60 animate-fade-in-up delay-100">Din nye AI-kollega setup tar under 1 minutt.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                        {[
                            { icon: "🧐", title: "1. Analyse", desc: "Vi leser nettsiden din for å forstå merkevaren." },
                            { icon: "🧠", title: "2. Strategi", desc: "Vi lager en skreddersydd tone-of-voice og plan." },
                            { icon: "✍️", title: "3. Innhold", desc: "Vi genererer innhold som faktisk engasjerer." },
                            { icon: "📅", title: "4. Kalender", desc: "Du får en ferdig utfylt innholdsplan." }
                        ].map((item, i) => (
                            <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up hover:shadow-md transition-shadow`} style={{ animationDelay: `${200 + i * 100}ms` }}>
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h3 className="font-bold text-brand-text text-lg mb-2">{item.title}</h3>
                                <p className="text-brand-text/60 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 justify-center animate-fade-in-up delay-700">
                        <button onClick={onCancel} className="px-8 py-3 rounded-full text-brand-text/40 hover:text-brand-text transition-colors text-sm font-bold uppercase tracking-widest">
                            Avbryt
                        </button>
                        <button onClick={() => setStep(1)} className="px-10 py-4 bg-brand-gold text-brand-text rounded-full shadow-lg hover:bg-brand-text hover:text-white transition-all transform hover:scale-105 font-bold uppercase tracking-widest">
                            Start Setup →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
            {/* Background Image Layer (consistent with landing) */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif italic text-brand-text mb-2">Opprett nytt prosjekt</h2>
                        <p className="text-brand-text/60 font-sans text-sm font-light">Fortell oss litt om merkevaren din så AI-en kan gjøre magien.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-1 font-serif text-brand-text/80 text-lg">Bedriftens navn</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-brand-text font-sans focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                                    placeholder="F.eks. Norrøna"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-serif text-brand-text/80 text-lg">Nettside URL</label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-brand-text font-sans focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                                    placeholder="https://dinbedrift.no"
                                    required
                                />
                            </div>
                        </div>

                        {/* Industry & USP */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-1 font-serif text-brand-text/80 text-lg">Bransje <span className="text-gray-400 text-xs font-sans">(valgfritt)</span></label>
                                <input
                                    type="text"
                                    value={industry}
                                    onChange={e => setIndustry(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-brand-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                                    placeholder="F.eks. Eiendom, SaaS..."
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-serif text-brand-text/80 text-lg">Hovedtilbud (USP) <span className="text-gray-400 text-xs font-sans">(valgfritt)</span></label>
                                <input
                                    type="text"
                                    value={offer}
                                    onChange={e => setOffer(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-brand-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                                    placeholder="Hva selger dere?"
                                />
                            </div>
                        </div>

                        {/* Tone Selection */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="block font-serif text-brand-text/80 text-lg">Tone/stemme</label>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {vibeOptions.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setVibe(opt)}
                                        className={`p-3 rounded-lg border text-sm font-sans transition-all duration-300 ${vibe === opt ? 'bg-brand-text text-white border-brand-text shadow-lg transform scale-105' : 'bg-white border-gray-200 text-brand-text/70 hover:border-brand-gold hover:text-brand-text'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Audience, Goal, Frequency */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block mb-1 font-serif text-brand-text/80 text-lg">Målgruppe</label>
                                <input
                                    type="text"
                                    value={target}
                                    onChange={e => setTarget(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-brand-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                                    placeholder="F.eks. Unge voksne"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-serif text-brand-text/80 text-lg">Forretningsmål</label>
                                <input
                                    type="text"
                                    value={goals}
                                    onChange={e => setGoals(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-brand-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                                    placeholder="F.eks. Leads"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-serif text-brand-text/80 text-lg">Frekvens</label>
                                <select
                                    value={frequency}
                                    onChange={e => setFrequency(Number(e.target.value))}
                                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-brand-text font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                                >
                                    <option value={3}>3 tweets / uke</option>
                                    <option value={5}>5 tweets / uke</option>
                                    <option value={7}>Daglig</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 py-4 rounded-full border border-gray-300 text-brand-text/60 hover:text-brand-text hover:border-gray-400 font-sans uppercase tracking-widest text-xs transition-colors"
                            >
                                Avbryt
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] bg-brand-text text-white font-sans uppercase tracking-widest text-xs py-4 rounded-full shadow-xl hover:bg-brand-gold transition-all duration-500 transform hover:-translate-y-1"
                            >
                                ✨ Opprett Prosjekt
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
