import { ScrollReveal } from './LandingPage';

const PricingPage = ({ onBack, onStart }: { onBack: () => void, onStart: () => void }) => {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div onClick={onBack} className="text-2xl font-serif italic font-medium tracking-wide cursor-pointer">Produsenten</div>
                <button onClick={onBack} className="text-sm uppercase tracking-widest hover:text-brand-gold transition-colors">
                    Tilbake
                </button>
            </nav>

            <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
                <div className="text-center space-y-6 mb-20">
                    <ScrollReveal>
                        <h1 className="text-5xl font-serif italic">Invester i din vekst</h1>
                        <p className="text-xl font-light text-brand-text/60 max-w-2xl mx-auto">
                            Fleksible planer som vokser med deg. Ingen skjulte kostnader, bare ren verdi.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Tier */}
                    <ScrollReveal className="delay-0">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow h-full flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text/50 mb-2">Start</h3>
                                <div className="text-4xl font-serif">Gratis</div>
                                <p className="text-sm text-gray-400 mt-2">Test alle verktøy gratis.</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> 1 Merkevare-analyse</li>
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> 5 AI-genererte poster</li>
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> Hashtag & Bio Generator</li>
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> Alle verktøy i Verktøykassen</li>
                            </ul>
                            <button onClick={onStart} className="w-full border border-brand-text text-brand-text py-3 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-brand-text hover:text-white transition-colors">
                                Prøv Nå
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* Pro Tier (Highlighted) */}
                    <ScrollReveal className="delay-200">
                        <div className="bg-brand-text text-white p-8 rounded-2xl shadow-xl border border-brand-text transform md:-translate-y-4 h-full flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-brand-gold text-brand-text text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Mest Populær</div>
                            <div className="mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">Proff</h3>
                                <div className="text-4xl font-serif">290,- <span className="text-sm font-sans font-normal opacity-50">/mnd</span></div>
                                <p className="text-sm text-white/50 mt-2">For seriøse influencere.</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm"><span className="text-brand-gold">✓</span> Ubegrenset poster & verktøy</li>
                                <li className="flex gap-3 text-sm"><span className="text-brand-gold">✓</span> Hook Lab & A/B-testing</li>
                                <li className="flex gap-3 text-sm"><span className="text-brand-gold">✓</span> Sponsor Pitch Generator</li>
                                <li className="flex gap-3 text-sm"><span className="text-brand-gold">✓</span> Content Recycler</li>
                                <li className="flex gap-3 text-sm"><span className="text-brand-gold">✓</span> Competitor Spy</li>
                            </ul>
                            <button onClick={onStart} className="w-full bg-brand-gold text-brand-text py-3 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors">
                                Start Proff
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* Agency Tier */}
                    <ScrollReveal className="delay-400">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow h-full flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text/50 mb-2">Byrå</h3>
                                <div className="text-4xl font-serif">Kunde</div>
                                <p className="text-sm text-gray-400 mt-2">Skreddersydd for team.</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> Alt i Proff</li>
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> Egen Team Dashboard</li>
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> Whitelabel Rapporter</li>
                                <li className="flex gap-3 text-sm"><span className="text-green-500">✓</span> API Tilgang</li>
                            </ul>
                            <button className="w-full border border-gray-200 text-gray-400 py-3 rounded-lg uppercase tracking-widest text-xs font-bold hover:border-brand-text hover:text-brand-text transition-colors">
                                Kontakt Oss
                            </button>
                        </div>
                    </ScrollReveal>
                </div>

                {/* FAQ */}
                <div className="mt-32 max-w-3xl mx-auto space-y-12">
                    <ScrollReveal>
                        <h2 className="text-3xl font-serif italic text-center mb-8">Ofte stilte spørsmål</h2>
                        <div className="space-y-6">
                            <div className="border-b border-gray-100 pb-6">
                                <h4 className="font-bold text-sm mb-2">Kan jeg bytte plan når som helst?</h4>
                                <p className="text-sm text-brand-text/60">Ja, selvfølgelig. Du er ikke låst til noe som helst.</p>
                            </div>
                            <div className="border-b border-gray-100 pb-6">
                                <h4 className="font-bold text-sm mb-2">Er AI-innholdet unikt?</h4>
                                <p className="text-sm text-brand-text/60">Ja, vi genererer innholdet fra bunnen av basert på din unike merkevare-analyse. Ingen to poster er like.</p>
                            </div>
                            <div className="border-b border-gray-100 pb-6">
                                <h4 className="font-bold text-sm mb-2">Hvilke plattformer støttes?</h4>
                                <p className="text-sm text-brand-text/60">Vi lager innhold for alle plattformer: X, Instagram, LinkedIn, TikTok. Repurpose-verktøyet tilpasser automatisk.</p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
