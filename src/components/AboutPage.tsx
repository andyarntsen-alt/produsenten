import { ScrollReveal } from './LandingPage'; // Reusing the scroll animation
import heroBg from '../assets/brudeferden.jpg'; // Reusing hero image for continuity

const AboutPage = ({ onBack, onStart }: { onBack: () => void, onStart: () => void }) => {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
                <div onClick={onBack} className="text-2xl font-serif italic font-medium tracking-wide cursor-pointer">Produsenten</div>
                <button onClick={onBack} className="text-sm uppercase tracking-widest hover:text-brand-gold transition-colors">
                    Tilbake
                </button>
            </nav>

            {/* Header Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} alt="Background" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent"></div>
                </div>
                <div className="relative z-10 text-center space-y-6 max-w-3xl px-6">
                    <ScrollReveal>
                        <h1 className="text-5xl md:text-7xl font-serif italic">Vi bygger ikke <br />verktøy for roboter.</h1>
                    </ScrollReveal>
                    <ScrollReveal className="delay-200">
                        <p className="text-xl font-light text-brand-text/80">
                            Vi bygger superkrefter for mennesker som har noe å fortelle.
                        </p>
                    </ScrollReveal>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">

                {/* Vision */}
                <ScrollReveal>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Vår Misjon</h2>
                            <h3 className="text-3xl font-serif italic">Kreativitet uten utbrenthet.</h3>
                            <p className="font-light leading-relaxed text-brand-text/70">
                                Sosiale medier er en umettelig maskin. Den krever at du poster hver dag, engasjerer deg konstant, og aldri tar pause. For små bedrifter og kreatører betyr dette ofte at gleden ved å skape forsvinner i stresset med å "holde tritt".
                            </p>
                            <p className="font-light leading-relaxed text-brand-text/70">
                                Produsenten ble født ut av denne frustrasjonen. Vi ønsket å bruke AI ikke til å spy ut generisk støy, men til å gi deg roen tilbake. Ved å automatisere strategien og strukturen, kan du bruke energien din på det som faktisk betyr noe: Budskapet.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-gold/10 rotate-3">
                            <blockquote className="font-serif italic text-xl text-center leading-relaxed">
                                "Teknologi skal ikke erstatte kunstneren, men fjerne støyen så kunsten kan skinne."
                            </blockquote>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Team / Values */}
                <ScrollReveal>
                    <div className="text-center space-y-12">
                        <h2 className="text-3xl font-serif italic">Våre Verdier</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-50">
                                <div className="text-4xl mb-4">💎</div>
                                <h4 className="font-bold uppercase tracking-widest text-xs mb-2">Kvalitet over Kvantitet</h4>
                                <p className="text-sm font-light text-brand-text/60">Én god post er verdt mer enn ti dårlige. Vi optimaliserer for effekt, ikke støy.</p>
                            </div>
                            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-50">
                                <div className="text-4xl mb-4">🔍</div>
                                <h4 className="font-bold uppercase tracking-widest text-xs mb-2">Menneske + Maskin</h4>
                                <p className="text-sm font-light text-brand-text/60">AI er motoren, du er sjåføren. Du har alltid siste ordet.</p>
                            </div>
                            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-50">
                                <div className="text-4xl mb-4">🇳🇴</div>
                                <h4 className="font-bold uppercase tracking-widest text-xs mb-2">Norsk i hjertet</h4>
                                <p className="text-sm font-light text-brand-text/60">Laget i Norge, for norske forhold. Vi forstår kulturen og språket.</p>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* CTA */}
                <ScrollReveal>
                    <div className="text-center bg-brand-text text-white p-12 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-3xl font-serif italic">Klar for å finne din stemme?</h2>
                            <p className="text-white/60 font-light">Bli med på reisen og se hva Produsenten kan gjøre for deg.</p>
                            <button onClick={onStart} className="bg-brand-gold text-brand-text px-8 py-3 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors">
                                Prøv Gratis Nå
                            </button>
                        </div>
                    </div>
                </ScrollReveal>

            </div>
        </div>
    );
};

export default AboutPage;
