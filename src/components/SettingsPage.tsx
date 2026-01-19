import React from 'react';
import { ArrowLeft, Trash2, Download, Database } from 'lucide-react';

interface SettingsPageProps {
    onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {

    const handleDeleteAllData = () => {
        if (confirm('Er du sikker? Dette vil slette ALLE dine merkevarer og lagret data. Dette kan ikke angres.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const data = localStorage.getItem('brands');
        if (!data) {
            alert('Ingen data å eksportere.');
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
