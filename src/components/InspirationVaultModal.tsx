import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Save, Sparkles, Trash2, Copy } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useToast } from './ToastContext';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection } from '../services/languagePrompts';

interface InspirationItem {
    id: string;
    text: string;
    source?: string;
    analysis?: {
        hookType: string;
        format: string;
        tone: string;
    };
    savedAt: number;
}

interface InspirationVaultModalProps {
    onClose: () => void;
    onCreatePost: (post: { text: string; hook: string; formatType: string }) => void;
    brandName?: string;
}

const InspirationVaultModal: React.FC<InspirationVaultModalProps> = ({ onClose, onCreatePost, brandName }) => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
    const [newText, setNewText] = useState('');
    const [source, setSource] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const languageSection = buildLanguagePromptSection(settings.language);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('inspirationVault');
        if (saved) {
            try {
                setInspirations(JSON.parse(saved));
            } catch {
                console.warn('Failed to load inspiration vault');
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('inspirationVault', JSON.stringify(inspirations));
    }, [inspirations]);

    const analyzeAndSave = async () => {
        if (!newText.trim()) return;
        setIsAnalyzing(true);

        try {
            const prompt = `Analyser denne sosiale medier-posten og identifiser:

POST:
"${newText}"

Returner KUN JSON:
{
  "hookType": "spørsmål|påstand|historie|statistikk|kontroversiell|personlig",
  "format": "kort-take|thread|storytelling|listicle|how-to|opinion",
  "tone": "profesjonell|uformell|humoristisk|inspirerende|provoserende"
}`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du analyserer sosiale medier-poster. Svar kun med JSON.' },
                { role: 'user', content: prompt }
            ], { toolType: 'content', includeValidation: false });

            let analysis;
            try {
                const match = result.match(/\{[\s\S]*\}/);
                analysis = JSON.parse(match ? match[0] : result);
            } catch {
                analysis = { hookType: 'ukjent', format: 'ukjent', tone: 'ukjent' };
            }

            const newItem: InspirationItem = {
                id: Date.now().toString(),
                text: newText,
                source: source || undefined,
                analysis,
                savedAt: Date.now()
            };

            setInspirations(prev => [newItem, ...prev]);
            setNewText('');
            setSource('');
            showToast('Inspirasjon lagret!', 'success');
        } catch (err) {
            console.error('Analysis failed:', err);
            // Save without analysis
            const newItem: InspirationItem = {
                id: Date.now().toString(),
                text: newText,
                source: source || undefined,
                savedAt: Date.now()
            };
            setInspirations(prev => [newItem, ...prev]);
            setNewText('');
            setSource('');
            showToast('Lagret (uten analyse)', 'warning');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const deleteItem = (id: string) => {
        setInspirations(prev => prev.filter(i => i.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        showToast('Slettet', 'success');
    };

    const generateSimilar = async (item: InspirationItem) => {
        setIsGenerating(true);
        setSelectedItem(item);

        try {
            const prompt = `${languageSection}

Brukeren vil lage en lignende post basert på denne inspirasjonen:

INSPIRASJON:
"${item.text}"

${item.analysis ? `
Hook-type: ${item.analysis.hookType}
Format: ${item.analysis.format}
Tone: ${item.analysis.tone}
` : ''}

${brandName ? `Tilpass til brand: ${brandName}` : ''}

LAG EN NY POST som:
1. Har samme strukturelle grep (hook-type, format)
2. Men med HELT NYTT innhold/tema
3. Tilpasset brukerens brand/kontekst
4. IKKE kopier - inspirer

HUMANISERING:
- Varier setningslengden
- Bruk "jeg/du"
- ALDRI avslutt med "Hva tenker du?" eller "Lykke til!"
- Føles autentisk

Returner KUN JSON:
{
  "text": "Hele postteksten...",
  "hook": "Første linje",
  "formatType": "${item.analysis?.format || 'other'}"
}`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du lager originale poster inspirert av eksempler. Ikke kopier - inspirer. Svar kun med JSON.' },
                { role: 'user', content: prompt }
            ], { toolType: 'content', includeValidation: true });

            try {
                const match = result.match(/\{[\s\S]*\}/);
                const post = JSON.parse(match ? match[0] : result);
                onCreatePost(post);
                showToast('Post opprettet!', 'success');
                onClose();
            } catch {
                showToast('Kunne ikke parse AI-svar', 'error');
            }
        } catch (err) {
            console.error('Generate failed:', err);
            showToast('Kunne ikke generere post', 'error');
        } finally {
            setIsGenerating(false);
            setSelectedItem(null);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('nb-NO', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Lightbulb size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Inspiration Vault</h2>
                            <p className="text-white/70 text-sm">Lagre og lær av poster du liker</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Add new inspiration */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-2">
                            Lim inn en post du liker
                        </label>
                        <textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Kopier inn en post fra Twitter, LinkedIn, etc. som du synes er bra..."
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 resize-none text-sm"
                        />
                        <div className="flex gap-3 mt-3">
                            <input
                                type="text"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="Kilde (valgfritt, f.eks. @username)"
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                            />
                            <button
                                onClick={analyzeAndSave}
                                disabled={isAnalyzing || !newText.trim()}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center gap-2 transition-all"
                            >
                                {isAnalyzing ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <Save size={16} />
                                )}
                                Lagre
                            </button>
                        </div>
                    </div>

                    {/* Saved inspirations */}
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                            Lagret inspirasjon ({inspirations.length})
                        </p>

                        {inspirations.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Lightbulb className="mx-auto mb-4 opacity-30" size={48} />
                                <p>Ingen lagret inspirasjon enda.</p>
                                <p className="text-sm mt-1">Lim inn poster du liker for å bygge biblioteket ditt!</p>
                            </div>
                        ) : (
                            inspirations.map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-yellow-300 transition-all"
                                >
                                    <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            {item.analysis && (
                                                <>
                                                    <span className="text-xs font-mono bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                                        {item.analysis.hookType}
                                                    </span>
                                                    <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                        {item.analysis.format}
                                                    </span>
                                                </>
                                            )}
                                            {item.source && (
                                                <span className="text-xs text-gray-400">{item.source}</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">{formatDate(item.savedAt)}</span>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                                            {item.text.length > 300 ? item.text.slice(0, 300) + '...' : item.text}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-gray-100">
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            Slett
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.text);
                                                    showToast('Kopiert!', 'success');
                                                }}
                                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                                            >
                                                <Copy size={14} />
                                                Kopier
                                            </button>
                                            <button
                                                onClick={() => generateSimilar(item)}
                                                disabled={isGenerating && selectedItem?.id === item.id}
                                                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                                            >
                                                {isGenerating && selectedItem?.id === item.id ? (
                                                    <span className="w-3 h-3 border-2 border-yellow-300 border-t-yellow-600 rounded-full animate-spin"></span>
                                                ) : (
                                                    <Sparkles size={14} />
                                                )}
                                                Lag lignende
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspirationVaultModal;
