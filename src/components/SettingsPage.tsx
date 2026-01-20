import React from 'react';
import { ArrowLeft, Trash2, Download, Database, Globe } from 'lucide-react';
import { useToast } from './ToastContext';
import { useSettings, LANGUAGE_OPTIONS, type Language } from '../context/SettingsContext';

interface SettingsPageProps {
    onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    const { showToast, showConfirm } = useToast();
    const { settings, setLanguage } = useSettings();

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        showToast(lang === 'no' ? 'Språk endret til norsk' : 'Language changed to English', 'success');
    };

    const handleDeleteAllData = async () => {
        const confirmed = await showConfirm({
            title: 'Slett all data',
            message: 'Er du sikker? Dette vil slette ALLE dine merkevarer og lagret data. Dette kan ikke angres.',
            confirmText: 'Slett alt',
            cancelText: 'Avbryt',
            type: 'danger'
        });
        if (confirmed) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const data = localStorage.getItem('brands');
        if (!data) {
            showToast('Ingen data å eksportere.', 'warning');
            return;
        }
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `produsenten-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-brand-bg font-sans text-brand-text p-6 md:p-12 animate-fade-in">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-brand-text/60 hover:text-brand-text mb-8 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">Tilbake til Dashboard</span>
                </button>

                <h1 className="text-4xl font-serif italic text-brand-text mb-2">Innstillinger</h1>
                <p className="text-brand-text/60 mb-12">Administrer dine data og preferanser.</p>

                <div className="space-y-6">
                    {/* Language Section */}
                    <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="text-blue-500" size={24} />
                            <h2 className="text-xl font-serif italic text-brand-text">Språk / Language</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-brand-text/60 mb-4">
                                Velg språk for AI-generert innhold. Dette påvirker alle nye poster og tekster.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {LANGUAGE_OPTIONS.map(({ value, label, flag }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleLanguageChange(value)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                            settings.language === value
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-2xl">{flag}</span>
                                        <div className="text-left">
                                            <p className={`font-bold ${settings.language === value ? 'text-blue-700' : 'text-brand-text'}`}>
                                                {label}
                                            </p>
                                            <p className="text-xs text-brand-text/50">
                                                {value === 'no' ? 'Standard' : 'Default'}
                                            </p>
                                        </div>
                                        {settings.language === value && (
                                            <span className="ml-auto text-blue-500 text-lg">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-brand-text/40 mt-4 p-3 bg-gray-50 rounded-lg">
                                💡 {settings.language === 'no'
                                    ? 'Alle nye poster genereres på norsk med norske uttrykk og tone.'
                                    : 'All new posts will be generated in English with natural expressions.'}
                            </p>
                        </div>
                    </section>

                    {/* Data Section */}
                    <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="text-brand-gold" size={24} />
                            <h2 className="text-xl font-serif italic text-brand-text">Data & Lagring</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <h3 className="font-bold text-sm text-brand-text">Eksporter Data</h3>
                                    <p className="text-xs text-brand-text/60 mt-1">Last ned en kopi av alle dine merkevarer og poster.</p>
                                </div>
                                <button
                                    onClick={handleExportData}
                                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-gold text-brand-text px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all"
                                >
                                    <Download size={14} />
                                    Last ned JSON
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                <div>
                                    <h3 className="font-bold text-sm text-red-700">Slett All Data</h3>
                                    <p className="text-xs text-red-600/80 mt-1">Dette kan ikke angres. Alt slettes lokalt.</p>
                                </div>
                                <button
                                    onClick={handleDeleteAllData}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm"
                                >
                                    <Trash2 size={14} />
                                    Slett Alt
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* About Section */}
                    <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <p className="text-xs uppercase tracking-widest text-brand-text/40 mb-2">Versjon 1.0.0 (MVP)</p>
                        <p className="text-brand-text/60 font-serif italic">Utviklet med ❤️ av Produsenten AI</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
