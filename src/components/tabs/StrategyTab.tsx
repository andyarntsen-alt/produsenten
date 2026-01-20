import React, { useState } from 'react';
import { Edit3, Save, Plus, Trash2 } from 'lucide-react';
import type { Brand } from '../../App';
import { useToast } from '../ToastContext';
import { useSettings } from '../../context/SettingsContext';

interface StrategyTabProps {
    brand: Brand;
    updateBrand: (brand: Brand) => void;
}

const StrategyTab: React.FC<StrategyTabProps> = ({ brand, updateBrand }) => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const isEnglish = settings.language === 'en';

    const [isEditing, setIsEditing] = useState(false);
    const [editStrategy, setEditStrategy] = useState(brand.strategyResult || '');
    const [editPillars, setEditPillars] = useState<string[]>(brand.contentPillars || []);
    const [newPillar, setNewPillar] = useState('');

    const t = {
        title: isEnglish ? 'Content Strategy' : 'Innholdsstrategi',
        noStrategy: isEnglish ? 'No strategy available yet.' : 'Ingen strategi tilgjengelig ennå.',
        edit: isEnglish ? 'Edit' : 'Rediger',
        save: isEnglish ? 'Save Changes' : 'Lagre Endringer',
        cancel: isEnglish ? 'Cancel' : 'Avbryt',
        contentPillars: isEnglish ? 'Content Pillars' : 'Innholdssøyler',
        pillarsDesc: isEnglish ? 'Themes you post about regularly' : 'Temaer du poster om regelmessig',
        addPillar: isEnglish ? 'Add pillar' : 'Legg til søyle',
        strategySummary: isEnglish ? 'Strategy Summary' : 'Strategi-oppsummering',
        strategyPlaceholder: isEnglish ? 'Describe your content strategy here...' : 'Beskriv din innholdsstrategi her...',
        saved: isEnglish ? 'Strategy updated!' : 'Strategi oppdatert!',
        tip: isEnglish ? 'Tip: Changes here will affect future content generation.' : 'Tips: Endringer her påvirker fremtidig innholdsgenerering.',
    };

    const handleSave = () => {
        const updated: Brand = {
            ...brand,
            strategyResult: editStrategy,
            contentPillars: editPillars.filter(p => p.trim() !== ''),
        };
        updateBrand(updated);
        setIsEditing(false);
        showToast(t.saved, 'success');
    };

    const handleCancel = () => {
        setEditStrategy(brand.strategyResult || '');
        setEditPillars(brand.contentPillars || []);
        setIsEditing(false);
    };

    const addPillar = () => {
        if (newPillar.trim()) {
            setEditPillars([...editPillars, newPillar.trim()]);
            setNewPillar('');
        }
    };

    const removePillar = (index: number) => {
        setEditPillars(editPillars.filter((_, i) => i !== index));
    };

    const updatePillar = (index: number, value: string) => {
        const updated = [...editPillars];
        updated[index] = value;
        setEditPillars(updated);
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif italic text-brand-text">{t.title}</h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm text-brand-text/60 hover:text-brand-gold transition-colors"
                    >
                        <Edit3 size={16} />
                        {t.edit}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-brand-text text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-gold transition-colors"
                        >
                            <Save size={16} />
                            {t.save}
                        </button>
                    </div>
                )}
            </div>

            {/* Info tip */}
            {isEditing && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    💡 {t.tip}
                </div>
            )}

            {/* Content Pillars Section */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-lg font-serif italic text-brand-text mb-2">{t.contentPillars}</h4>
                <p className="text-sm text-gray-500 mb-4">{t.pillarsDesc}</p>

                {isEditing ? (
                    <div className="space-y-3">
                        {editPillars.map((pillar, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={pillar}
                                    onChange={(e) => updatePillar(i, e.target.value)}
                                    className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 text-brand-text text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent"
                                />
                                <button
                                    onClick={() => removePillar(i)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        <div className="flex items-center gap-2 mt-4">
                            <input
                                type="text"
                                value={newPillar}
                                onChange={(e) => setNewPillar(e.target.value)}
                                placeholder={t.addPillar}
                                onKeyDown={(e) => e.key === 'Enter' && addPillar()}
                                className="flex-1 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-brand-text text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent placeholder:text-gray-400"
                            />
                            <button
                                onClick={addPillar}
                                disabled={!newPillar.trim()}
                                className="p-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {(brand.contentPillars && brand.contentPillars.length > 0) ? (
                            brand.contentPillars.map((pillar, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-full text-sm text-brand-text"
                                >
                                    {pillar}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-400 italic text-sm">{isEnglish ? 'No content pillars defined yet.' : 'Ingen innholdssøyler definert ennå.'}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Strategy Summary Section */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-lg font-serif italic text-brand-text mb-4">{t.strategySummary}</h4>

                {isEditing ? (
                    <textarea
                        value={editStrategy}
                        onChange={(e) => setEditStrategy(e.target.value)}
                        placeholder={t.strategyPlaceholder}
                        className="w-full min-h-[200px] p-4 bg-gray-50 rounded-xl border border-gray-200 text-brand-text font-sans text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent resize-y"
                    />
                ) : brand.strategyResult ? (
                    <div className="prose prose-lg prose-slate max-w-none text-brand-text/80 font-sans font-light leading-relaxed whitespace-pre-wrap">
                        {brand.strategyResult}
                    </div>
                ) : (
                    <p className="text-gray-400 italic text-sm">{t.noStrategy}</p>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-light text-blue-600">{brand.contentPillars?.length || 0}</div>
                    <div className="text-xs uppercase tracking-wider text-blue-600/70">{isEnglish ? 'Pillars' : 'Søyler'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-light text-green-600">{brand.posts.length}</div>
                    <div className="text-xs uppercase tracking-wider text-green-600/70">{isEnglish ? 'Posts' : 'Poster'}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-light text-amber-600">{brand.postingFrequency || 0}</div>
                    <div className="text-xs uppercase tracking-wider text-amber-600/70">{isEnglish ? 'Posts/week' : 'Poster/uke'}</div>
                </div>
            </div>
        </div>
    );
};

export default StrategyTab;
