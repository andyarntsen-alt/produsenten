import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Small delay to show banner smoothly after load
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 p-4 md:p-6 animate-fade-in-up">
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h4 className="font-serif italic text-lg text-brand-text">Vi bruker cookies 🍪</h4>
                    <p className="text-sm text-brand-text/70 font-sans max-w-xl">
                        Vi bruker informasjonskapsler for å gi deg en bedre opplevelse og for å analysere trafikken vår.
                        Ved å fortsette å bruke nettstedet godtar du dette.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={acceptCookies}
                        className="flex-1 md:flex-none bg-brand-text text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors shadow-lg whitespace-nowrap"
                    >
                        OK, greit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
