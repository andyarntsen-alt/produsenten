import React, { useState } from 'react';
import { X, Hash, Copy, Check } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection, getPromptTranslations } from '../services/languagePrompts';
import type { Brand } from '../App';

interface HashtagGeneratorModalProps {
    brand?: Brand;
    onClose: () => void;
}

interface HashtagGroup {
    category: string;
    tags: string[];
    color: string;
}

const HashtagGeneratorModal: React.FC<HashtagGeneratorModalProps> = ({ brand, onClose }) => {
    const { settings } = useSettings();
    const [postText, setPostText] = useState('');
    const [hashtags, setHashtags] = useState<HashtagGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const languageSection = buildLanguagePromptSection(settings.language);
    const t = getPromptTranslations(settings.language);
    const isEnglish = settings.language === 'en';

    // Build brand context for niche-specific hashtags
    const brandContext = brand ? `
${t.content.brandContext}:
- ${t.brand}: ${brand.name}
${brand.industry ? `- ${t.industry}: ${brand.industry}` : ''}
${brand.targetAudience ? `- ${t.targetAudience}: ${brand.targetAudience}` : ''}
${brand.contentPillars?.length ? `- ${t.content.contentPillars}: ${brand.contentPillars.slice(0, 3).join(', ')}` : ''}
` : '';

    const generateHashtags = async () => {
        if (!postText.trim()) return;
        setIsLoading(true);
        setHashtags([]);

        try {
            const prompt = `${languageSection}
${brandContext}

${t.hashtagGenerator.generateHashtags}:

"${postText}"

${t.hashtagGenerator.requirements}:
1. "${t.hashtagGenerator.highCompetition}" (>1M ${t.hashtagGenerator.posts}) - 5
2. "${t.hashtagGenerator.mediumCompetition}" (100K-1M) - 10
3. "${t.hashtagGenerator.lowCompetition}" (<100K) - 10

${isEnglish ? `RULES:
- Relevant to the post, not generic
- Use English hashtags
- AVOID overused/meaningless tags like #inspo #lifestyle #blessed
- Include niche-specific tags
- All must start with #` : `REGLER:
- Relevante til posten, ikke generiske
- Norsk ELLER engelsk avhengig av hva som passer
- UNNGÅ overbrukte/meningsløse tags som #inspo #lifestyle #blessed
- Inkluder nisje-spesifikke tags
- Alle må starte med #`}

${isEnglish ? 'Return as JSON:' : 'Returner som JSON:'}
[
  { "category": "${t.hashtagGenerator.highCompetition}", "tags": ["#tag1", "#tag2", ...] },
  { "category": "${t.hashtagGenerator.mediumCompetition}", "tags": [...] },
  { "category": "${t.hashtagGenerator.lowCompetition}", "tags": [...] }
]`;

            const result = await callAIHumanized([
                { role: 'system', content: isEnglish ? 'You generate relevant hashtags. Reply only with JSON.' : 'Du genererer relevante hashtags. Svar kun med JSON.' },
                { role: 'user', content: prompt }
            ], { toolType: 'hashtag', includeValidation: false });

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const parsed = JSON.parse(match ? match[0] : result);
                const withColors = parsed.map((g: HashtagGroup, i: number) => ({
                    ...g,
                    color: i === 0 ? 'red' : i === 1 ? 'yellow' : 'green'
                }));
                setHashtags(withColors);
            } catch {
                setHashtags(isEnglish ? [
                    { category: 'High competition', tags: ['#inspo', '#lifestyle', '#content', '#creator', '#entrepreneur'], color: 'red' },
                    { category: 'Medium competition', tags: ['#contentcreator', '#digitalmarketing', '#socialmediatips', '#marketingtips', '#personalbranding', '#onlinebusiness', '#growthmindset', '#brandbuilding', '#contentmarketing', '#smallbusiness'], color: 'yellow' },
                    { category: 'Low competition', tags: ['#contentstrategy', '#socialmediastrategy', '#microinfluencer', '#ugccreator', '#contentplanning', '#creativecontent', '#digitalcreator', '#brandingtips', '#contentideas', '#socialmediacreator'], color: 'green' }
                ] : [
                    { category: 'Høy konkurranse', tags: ['#inspo', '#lifestyle', '#content', '#creator', '#norway'], color: 'red' },
                    { category: 'Medium konkurranse', tags: ['#norskblogger', '#innholdsskaper', '#digitalmarketing', '#influencernorge', '#contentcreator', '#socialmediatips', '#norskinfluencer', '#merkevare', '#markedsføring', '#vekst'], color: 'yellow' },
                    { category: 'Lav konkurranse', tags: ['#produsenten', '#innholdsstrategi', '#norskinnhold', '#sosialemediertips', '#mikroinfluencer', '#ugcnorge', '#brandbuilding', '#innholdsplan', '#kreativtinnhold', '#digitalnorge'], color: 'green' }
                ]);
            }
        } catch (err) {
            console.error('Hashtag generation failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyAll = () => {
        const allTags = hashtags.flatMap(g => g.tags).join(' ');
        navigator.clipboard.writeText(allTags);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'red': return 'bg-red-50 text-red-700 border-red-200';
            case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'green': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Hash size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Hashtag Generator</h2>
                            <p className="text-white/70 text-sm">Finn de beste hashtagsene for din post</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Lim inn posten din</label>
                        <textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="Skriv eller lim inn teksten du vil ha hashtags for..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                        />
                        <button
                            onClick={generateHashtags}
                            disabled={isLoading || !postText.trim()}
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <Hash size={18} />
                            )}
                            {isLoading ? 'Genererer...' : 'Generer Hashtags'}
                        </button>
                    </div>

                    {/* Results */}
                    {hashtags.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Dine hashtags</p>
                                <button
                                    onClick={copyAll}
                                    className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-800 font-bold transition-colors"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Kopiert!' : 'Kopier alle'}
                                </button>
                            </div>

                            {hashtags.map((group, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${group.color === 'red' ? 'bg-red-500' : group.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                        <span className="text-sm font-bold text-gray-600">{group.category}</span>
                                        <span className="text-xs text-gray-400">({group.tags.length} stk)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.tags.map((tag, j) => (
                                            <span
                                                key={j}
                                                onClick={() => navigator.clipboard.writeText(tag)}
                                                className={`px-3 py-1 rounded-full text-sm cursor-pointer border transition-all hover:scale-105 ${getColorClasses(group.color)}`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <p className="text-xs text-gray-400 text-center pt-4">
                                💡 Bruk en miks av alle kategorier for best rekkevidde
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HashtagGeneratorModal;
