import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
    onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            setIsLoading(false);
            onLogin();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col animate-fade-in">
            <div className="p-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-brand-text/60 hover:text-brand-text transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">Tilbake</span>
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-md p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand-gold"></div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-serif italic text-brand-text mb-2">Velkommen tilbake</h1>
                        <p className="text-brand-text/50 text-sm">Logg inn for å administrere dine merkevarer.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-brand-text/60 font-bold ml-1">E-post</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                    placeholder="navn@bedrift.no"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs uppercase tracking-widest text-brand-text/60 font-bold">Passord</label>
                                <button type="button" className="text-xs text-brand-gold hover:text-brand-text transition-colors" onClick={() => alert('Funksjonen kommer snart.')}>Glemt passord?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-text text-white py-4 rounded-xl font-sans uppercase tracking-widest text-sm hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Logger inn...
                                </span>
                            ) : (
                                <span className="group-hover:scale-105 transition-transform block">Logg Inn</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-brand-text/60">
                            Har du ikke konto? <button type="button" onClick={onBack} className="text-brand-gold font-bold hover:underline">Prøv gratis</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
