import React, { useRef, useState } from 'react';
import { Edit3, Save, Plus, Trash2 } from 'lucide-react';
import type { Brand } from '../../App';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import StrategyReport from '../StrategyReport';
import SponsorPitchModal from '../SponsorPitchModal';
import { useToast } from '../ToastContext';
import { useSettings } from '../../context/SettingsContext';

interface ResearchTabProps {
    brand: Brand;
    updateBrand: (brand: Brand) => void;
}

// Editable text section component
const EditableTextSection = ({
    title,
    text,
    isEditing,
    editValue,
    onEditChange,
    placeholder
}: {
    title: string;
    text?: string;
    isEditing: boolean;
    editValue: string;
    onEditChange: (value: string) => void;
    placeholder: string;
}) => (
    <div className="bg-white border border-brand-gold/10 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-lg font-serif italic text-brand-text mb-4 border-b border-gray-100 pb-2">{title}</h4>
        {isEditing ? (
            <textarea
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                placeholder={placeholder}
                className="w-full min-h-[100px] p-3 bg-gray-50 rounded-xl border border-gray-200 text-brand-text font-sans text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent resize-y"
            />
        ) : (
            <p className="text-brand-text/80 font-sans font-light leading-relaxed">{text || <span className="italic text-gray-400">Ikke definert</span>}</p>
        )}
    </div>
);

// Editable list section component
const EditableListSection = ({
    title,
    items,
    isEditing,
    editItems,
    onEditItems,
    placeholder,
    newItemValue,
    onNewItemChange,
    onAddItem
}: {
    title: string;
    items?: string[];
    isEditing: boolean;
    editItems: string[];
    onEditItems: (items: string[]) => void;
    placeholder: string;
    newItemValue: string;
    onNewItemChange: (value: string) => void;
    onAddItem: () => void;
}) => {
    const updateItem = (index: number, value: string) => {
        const updated = [...editItems];
        updated[index] = value;
        onEditItems(updated);
    };

    const removeItem = (index: number) => {
        onEditItems(editItems.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white border border-brand-gold/10 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-lg font-serif italic text-brand-text mb-4 border-b border-gray-100 pb-2">{title}</h4>
            {isEditing ? (
                <div className="space-y-2">
                    {editItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updateItem(i, e.target.value)}
                                className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-brand-text text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent"
                            />
                            <button
                                onClick={() => removeItem(i)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 mt-3">
                        <input
                            type="text"
                            value={newItemValue}
                            onChange={(e) => onNewItemChange(e.target.value)}
                            placeholder={placeholder}
                            onKeyDown={(e) => e.key === 'Enter' && onAddItem()}
                            className="flex-1 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-brand-text text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent placeholder:text-gray-400"
                        />
                        <button
                            onClick={onAddItem}
                            disabled={!newItemValue.trim()}
                            className="p-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                items && items.length > 0 ? (
                    <ul className="space-y-2">
                        {items.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-brand-text/70 font-sans bg-gray-50/50 p-2 rounded-lg">
                                <span className="text-brand-gold min-w-[20px]">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 italic text-sm">Ingen elementer definert</p>
                )
            )}
        </div>
    );
};

const ResearchTab: React.FC<ResearchTabProps> = ({ brand, updateBrand }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const { settings } = useSettings();
    const isEnglish = settings.language === 'en';

    const [isDownloading, setIsDownloading] = useState(false);
    const [showSponsorPitch, setShowSponsorPitch] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Use structured data if available, otherwise try to parse the legacy string
    const brief = brand.brandBrief || (brand.analysisResult ? JSON.parse(brand.analysisResult) : null);

    // Edit state for all brief fields
    const [editProductSummary, setEditProductSummary] = useState(brief?.productSummary || '');
    const [editIdealCustomer, setEditIdealCustomer] = useState(brief?.idealCustomer || '');
    const [editValueProps, setEditValueProps] = useState<string[]>(brief?.valueProps || []);
    const [editDifferentiators, setEditDifferentiators] = useState<string[]>(brief?.differentiators || []);
    const [editToneRules, setEditToneRules] = useState<string[]>(brief?.toneRules || []);
    const [editContentAngles, setEditContentAngles] = useState<string[]>(brief?.contentAngles || []);
    const [editHooks, setEditHooks] = useState<string[]>(brief?.hooks || []);
    const [editCtaPhrases, setEditCtaPhrases] = useState<string[]>(brief?.ctaPhrases || []);

    // New item input states
    const [newValueProp, setNewValueProp] = useState('');
    const [newDifferentiator, setNewDifferentiator] = useState('');
    const [newToneRule, setNewToneRule] = useState('');
    const [newContentAngle, setNewContentAngle] = useState('');
    const [newHook, setNewHook] = useState('');
    const [newCtaPhrase, setNewCtaPhrase] = useState('');

    const t = {
        title: isEnglish ? 'Strategic Analysis' : 'Strategisk Analyse',
        aiGenerated: isEnglish ? 'AI-Generated' : 'AI-Generert',
        noAnalysis: isEnglish ? 'No strategic analysis available.' : 'Ingen strategisk analyse tilgjengelig.',
        edit: isEnglish ? 'Edit' : 'Rediger',
        save: isEnglish ? 'Save Changes' : 'Lagre Endringer',
        cancel: isEnglish ? 'Cancel' : 'Avbryt',
        downloadPdf: isEnglish ? 'Download Report' : 'Last ned Rapport',
        generatingPdf: isEnglish ? 'Generating PDF...' : 'Genererer PDF...',
        saved: isEnglish ? 'Brand Brief updated!' : 'Brand Brief oppdatert!',
        tip: isEnglish ? 'Tip: Changes here affect all future content generation.' : 'Tips: Endringer her påvirker all fremtidig innholdsgenerering.',
        summary: isEnglish ? 'Summary' : 'Sammendrag',
        summaryPlaceholder: isEnglish ? 'Describe your product/service...' : 'Beskriv ditt produkt/tjeneste...',
        dreamCustomer: isEnglish ? 'Dream Customer (ICP)' : 'Drømmekunde (ICP)',
        dreamCustomerPlaceholder: isEnglish ? 'Describe your ideal customer...' : 'Beskriv din ideelle kunde...',
        valueProps: isEnglish ? 'Value Propositions (USPs)' : 'Verdiforslag (USPs)',
        addValueProp: isEnglish ? 'Add value proposition...' : 'Legg til verdiforslag...',
        differentiators: isEnglish ? 'Competitive Advantages' : 'Konkurrentfordeler',
        addDifferentiator: isEnglish ? 'Add advantage...' : 'Legg til fordel...',
        toneRules: isEnglish ? "Tone of Voice (Do's & Don'ts)" : "Tone of Voice (Do's & Don'ts)",
        addToneRule: isEnglish ? 'Add tone rule...' : 'Legg til tone-regel...',
        contentAngles: isEnglish ? 'Content Angles' : 'Innholdsvinkler',
        addContentAngle: isEnglish ? 'Add angle...' : 'Legg til vinkel...',
        hooks: isEnglish ? 'Hooks That Work' : 'Hooks som fungerer',
        addHook: isEnglish ? 'Add hook...' : 'Legg til hook...',
        ctaPhrases: isEnglish ? 'Call-to-Action Phrases' : 'Call-to-Action Fraser',
        addCta: isEnglish ? 'Add CTA...' : 'Legg til CTA...',
        sponsorPitch: isEnglish ? 'Sponsor Pitch' : 'Sponsor Pitch',
        sponsorPitchDesc: isEnglish ? 'Generate professional collaboration emails' : 'Generer profesjonelle samarbeids-e-poster',
        createPitch: isEnglish ? 'Create pitch' : 'Lag pitch',
    };

    const handleSave = () => {
        const updatedBrief = {
            productSummary: editProductSummary,
            idealCustomer: editIdealCustomer,
            valueProps: editValueProps.filter(v => v.trim() !== ''),
            differentiators: editDifferentiators.filter(d => d.trim() !== ''),
            toneRules: editToneRules.filter(t => t.trim() !== ''),
            contentAngles: editContentAngles.filter(a => a.trim() !== ''),
            hooks: editHooks.filter(h => h.trim() !== ''),
            ctaPhrases: editCtaPhrases.filter(c => c.trim() !== ''),
        };

        const updated: Brand = {
            ...brand,
            brandBrief: updatedBrief,
        };
        updateBrand(updated);
        setIsEditing(false);
        showToast(t.saved, 'success');
    };

    const handleCancel = () => {
        // Reset all edit states to original values
        setEditProductSummary(brief?.productSummary || '');
        setEditIdealCustomer(brief?.idealCustomer || '');
        setEditValueProps(brief?.valueProps || []);
        setEditDifferentiators(brief?.differentiators || []);
        setEditToneRules(brief?.toneRules || []);
        setEditContentAngles(brief?.contentAngles || []);
        setEditHooks(brief?.hooks || []);
        setEditCtaPhrases(brief?.ctaPhrases || []);
        setIsEditing(false);
    };

    // Add item helpers
    const addValueProp = () => {
        if (newValueProp.trim()) {
            setEditValueProps([...editValueProps, newValueProp.trim()]);
            setNewValueProp('');
        }
    };

    const addDifferentiator = () => {
        if (newDifferentiator.trim()) {
            setEditDifferentiators([...editDifferentiators, newDifferentiator.trim()]);
            setNewDifferentiator('');
        }
    };

    const addToneRule = () => {
        if (newToneRule.trim()) {
            setEditToneRules([...editToneRules, newToneRule.trim()]);
            setNewToneRule('');
        }
    };

    const addContentAngle = () => {
        if (newContentAngle.trim()) {
            setEditContentAngles([...editContentAngles, newContentAngle.trim()]);
            setNewContentAngle('');
        }
    };

    const addHook = () => {
        if (newHook.trim()) {
            setEditHooks([...editHooks, newHook.trim()]);
            setNewHook('');
        }
    };

    const addCtaPhrase = () => {
        if (newCtaPhrase.trim()) {
            setEditCtaPhrases([...editCtaPhrases, newCtaPhrase.trim()]);
            setNewCtaPhrase('');
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${brand.name.replace(/\s+/g, '_')}_Strategi.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-8 relative animate-fade-in-up">

            {/* Hidden Report Container for Capture */}
            <div className="absolute top-[200vh] left-0 pointer-events-none opacity-0">
                <StrategyReport ref={reportRef} brandName={brand.name} brief={brief} />
            </div>

            {/* Sponsor Pitch Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-serif italic text-brand-text flex items-center gap-2">
                            📧 {t.sponsorPitch}
                        </h3>
                        <p className="text-sm text-gray-500">{t.sponsorPitchDesc}</p>
                    </div>
                    <button
                        onClick={() => setShowSponsorPitch(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        ✉️ {t.createPitch}
                    </button>
                </div>
            </div>

            {showSponsorPitch && (
                <SponsorPitchModal
                    brandName={brand.name}
                    onClose={() => setShowSponsorPitch(false)}
                />
            )}

            {!brief ? (
                <p className="text-brand-text/50 font-sans italic">{t.noAnalysis}</p>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-serif italic text-brand-text">{t.title}</h3>
                            <span className="text-xs font-sans uppercase tracking-widest text-brand-text/40">{t.aiGenerated}</span>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-sm text-brand-text/60 hover:text-brand-gold transition-colors px-4 py-2"
                                    >
                                        <Edit3 size={16} />
                                        {t.edit}
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading}
                                        className="flex items-center gap-2 bg-brand-text text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        {isDownloading ? t.generatingPdf : `📄 ${t.downloadPdf}`}
                                    </button>
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info tip */}
                    {isEditing && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                            💡 {t.tip}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EditableTextSection
                            title={t.summary}
                            text={brief.productSummary}
                            isEditing={isEditing}
                            editValue={editProductSummary}
                            onEditChange={setEditProductSummary}
                            placeholder={t.summaryPlaceholder}
                        />
                        <EditableTextSection
                            title={t.dreamCustomer}
                            text={brief.idealCustomer}
                            isEditing={isEditing}
                            editValue={editIdealCustomer}
                            onEditChange={setEditIdealCustomer}
                            placeholder={t.dreamCustomerPlaceholder}
                        />

                        <EditableListSection
                            title={t.valueProps}
                            items={brief.valueProps}
                            isEditing={isEditing}
                            editItems={editValueProps}
                            onEditItems={setEditValueProps}
                            placeholder={t.addValueProp}
                            newItemValue={newValueProp}
                            onNewItemChange={setNewValueProp}
                            onAddItem={addValueProp}
                        />
                        <EditableListSection
                            title={t.differentiators}
                            items={brief.differentiators}
                            isEditing={isEditing}
                            editItems={editDifferentiators}
                            onEditItems={setEditDifferentiators}
                            placeholder={t.addDifferentiator}
                            newItemValue={newDifferentiator}
                            onNewItemChange={setNewDifferentiator}
                            onAddItem={addDifferentiator}
                        />

                        <EditableListSection
                            title={t.toneRules}
                            items={brief.toneRules}
                            isEditing={isEditing}
                            editItems={editToneRules}
                            onEditItems={setEditToneRules}
                            placeholder={t.addToneRule}
                            newItemValue={newToneRule}
                            onNewItemChange={setNewToneRule}
                            onAddItem={addToneRule}
                        />
                        <EditableListSection
                            title={t.contentAngles}
                            items={brief.contentAngles}
                            isEditing={isEditing}
                            editItems={editContentAngles}
                            onEditItems={setEditContentAngles}
                            placeholder={t.addContentAngle}
                            newItemValue={newContentAngle}
                            onNewItemChange={setNewContentAngle}
                            onAddItem={addContentAngle}
                        />

                        <EditableListSection
                            title={t.hooks}
                            items={brief.hooks}
                            isEditing={isEditing}
                            editItems={editHooks}
                            onEditItems={setEditHooks}
                            placeholder={t.addHook}
                            newItemValue={newHook}
                            onNewItemChange={setNewHook}
                            onAddItem={addHook}
                        />
                        <EditableListSection
                            title={t.ctaPhrases}
                            items={brief.ctaPhrases}
                            isEditing={isEditing}
                            editItems={editCtaPhrases}
                            onEditItems={setEditCtaPhrases}
                            placeholder={t.addCta}
                            newItemValue={newCtaPhrase}
                            onNewItemChange={setNewCtaPhrase}
                            onAddItem={addCtaPhrase}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ResearchTab;
