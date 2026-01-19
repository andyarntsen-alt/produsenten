import React, { useState } from 'react';
import type { Brand, Tweet } from '../../App';
import { callAI } from '../../services/ai';
import TweetPreview from '../TweetPreview';
import HookLabModal from '../HookLabModal';
import VoiceRecorderModal from '../VoiceRecorderModal';
import RepurposeModal from '../RepurposeModal';

interface ContentTabProps {
    brand: Brand;
    vibePresets: { label: string; description: string; }[];
    updateBrand: (brand: Brand) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({ brand, vibePresets, updateBrand }) => {
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [vibeSelectIndex, setVibeSelectIndex] = useState<number | null>(null);
    const [metricsDraft, setMetricsDraft] = useState<{ likes: string; replies: string; impressions: string; }[]>([]);
    const [showMetrics, setShowMetrics] = useState(false);
    const [showHookLab, setShowHookLab] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showRepurpose, setShowRepurpose] = useState(false);

    // Helper to update a specific tweet in the brand
    const updateTweet = (index: number, changes: Partial<Tweet>) => {
        const updatedPosts = brand.posts.map((t, i) => i === index ? { ...t, ...changes } : t);
        updateBrand({ ...brand, posts: updatedPosts });
    };

    // Edit tweet actions
    const startEditing = (index: number) => {
        setEditIndex(index);
        setEditText(brand.posts[index].text);
    };
    const saveEdit = (index: number) => {
        if (editIndex === null) return;
        const newText = editText.trim();
        if (!newText) {
            alert('Teksten kan ikke være tom.');
            return;
        }
        const newStatus: Tweet['status'] = 'edited';
        updateTweet(index, { text: newText, status: newStatus });
        setEditIndex(null);
        setEditText('');
    };
    const cancelEdit = () => {
        setEditIndex(null);
        setEditText('');
    };

    // Regenerate tweet via AI (new idea)
    const regenerateTweet = async (index: number) => {
        const tweet = brand.posts[index];
        const originalText = tweet.text;
        const originalStatus = tweet.status;
        updateTweet(index, { text: 'Genererer ny versjon...', status: tweet.status });
        try {
            const vibeDesc = vibePresets.find(v => v.label === brand.vibe)?.description || brand.vibe;
            const analysisBrief = brand.analysisResult ? `Merkeinfo: ${brand.analysisResult}\n` : '';
            const prompt = analysisBrief +
                `Lag en ny Twitter-post i ${vibeDesc} tone for ${brand.name}. ` +
                `Unngå å gjenta tidligere tweets. Gi kun teksten til den nye tweeten.`;

            const systemMsg = { role: 'system' as const, content: 'Du er en kreativ tekstforfatter for sosiale medier.' };
            const result = await callAI([systemMsg, { role: 'user', content: prompt }]);

            updateTweet(index, { text: result, status: 'edited' });

        } catch (err) {
            console.error('Regeneration failed:', err);
            alert('Kunne ikke regenerere tweet. Sjekk API-nøkkel.');
            updateTweet(index, { text: originalText, status: originalStatus });
        }
    };

    // Shorten tweet function
    const shortenTweet = async (index: number) => {
        const tweet = brand.posts[index];
        const originalText = tweet.text;
        updateTweet(index, { text: 'Forkorter...', status: tweet.status });
        try {
            const systemMsg = { role: 'system' as const, content: 'Du er en ekspert redaktør. Din jobb er å gjøre tekst kortere og mer punchy.' };
            const prompt = `Gjør følgende tweet kortere (maks 280 tegn hvis den er lengre), mer konsis, og fjern fyllord. Behold budskapet: "${originalText}"`;
            const result = await callAI([systemMsg, { role: 'user', content: prompt }]);
            updateTweet(index, { text: result, status: 'edited' });
        } catch (err) {
            console.error('Shorten failed:', err);
            updateTweet(index, { text: originalText }); // revert
        }
    };

    // Switch vibe (rephrase tweet in another tone)
    const switchVibeForTweet = async (index: number, newVibe: string) => {
        const text = brand.posts[index].text;
        const vibeDesc = vibePresets.find(v => v.label === newVibe)?.description || newVibe;
        try {
            const systemMsg = { role: 'system' as const, content: 'Du er en ekspert på Tone of Voice.' };
            const result = await callAI([systemMsg, { role: 'user', content: `Skriv om denne tweeten til å være ${vibeDesc}: "${text}"` }]);
            updateTweet(index, { text: result, status: 'edited' });
            setVibeSelectIndex(null);
        } catch {
            alert('Kunne ikke endre tone.');
        }
    };

    // Generate LinkedIn Version
    const generateLinkedInVersion = async (index: number) => {
        const tweet = brand.posts[index];
        const originalText = tweet.text;

        // Optimistic UI update or loading state could be added here
        try {
            const systemMsg = { role: 'system' as const, content: 'Du er en ekspert på LinkedIn-innhold for B2B.' };
            const prompt = `Skriv om følgende tweet til en engasjerende LinkedIn-post.
            Tekst: "${originalText}"
            
            Krav:
            - Bruk luftig formatering (linjeskift).
            - Gjør den litt dypere/mer forklarende enn tweeten, men behold "punch".
            - Ingen hashtags (eller maks 1-2 helt på slutten).
            - Profesjonell men likevel personlig tone.`;

            const result = await callAI([systemMsg, { role: 'user', content: prompt }]);
            updateTweet(index, { linkedInPost: result });
        } catch (err) {
            console.error('LinkedIn generation failed:', err);
            alert('Kunne ikke generere LinkedIn-versjon.');
        }
    };

    const addThreadItem = (index: number) => {
        const currentPost = brand.posts[index];
        const newThread = [...(currentPost.thread || [])];
        newThread.push({
            text: '',
            hook: '',
            status: 'draft',
            formatType: 'other',
            mediaIdea: ''
        });
        updateTweet(index, { thread: newThread });
    };

    const updateThreadItem = (postIndex: number, threadIndex: number, field: string, value: string) => {
        const currentPost = brand.posts[postIndex];
        if (!currentPost.thread) return;

        const newThread = [...currentPost.thread];
        newThread[threadIndex] = { ...newThread[threadIndex], [field]: value };
        updateTweet(postIndex, { thread: newThread });
    };

    // Toggle performance input form
    const openMetricsForm = () => {
        const draft = brand.posts.map(t => ({
            likes: t.metrics ? String(t.metrics.likes) : '',
            replies: t.metrics ? String(t.metrics.replies) : '',
            impressions: t.metrics ? String(t.metrics.impressions) : ''
        }));
        setMetricsDraft(draft);
        setShowMetrics(true);
    };

    const saveMetrics = () => {
        const updatedPosts = brand.posts.map((t, i) => {
            if (!metricsDraft[i]) return t;
            const likesNum = metricsDraft[i].likes ? parseInt(metricsDraft[i].likes) : undefined;
            const repliesNum = metricsDraft[i].replies ? parseInt(metricsDraft[i].replies) : undefined;
            const imprNum = metricsDraft[i].impressions ? parseInt(metricsDraft[i].impressions) : undefined;
            let metrics;
            if (likesNum !== undefined || repliesNum !== undefined || imprNum !== undefined) {
                metrics = {
                    likes: likesNum || 0,
                    replies: repliesNum || 0,
                    impressions: imprNum || 0
                };
            }
            return { ...t, metrics: metrics };
        });
        updateBrand({ ...brand, posts: updatedPosts });
        setShowMetrics(false);
    };

    const generateImage = (index: number) => {
        const tweet = brand.posts[index];
        const prompt = tweet.mediaIdea || tweet.text.substring(0, 50);
        if (!prompt) return;

        // Use Pollinations.ai for instant, free image generation
        // Append random seed to avoid caching same image for same prompt if retried
        const seed = Math.floor(Math.random() * 1000);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&seed=${seed}&nologo=true`;

        updateTweet(index, { imageUrl: url });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif italic text-brand-text">AI-genererte poster</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowRepurpose(true)}
                        className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        ♻️ Repurpose
                    </button>
                    <button
                        onClick={() => setShowVoiceRecorder(true)}
                        className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        🎤 Rant Mode
                    </button>
                    <button
                        onClick={() => setShowHookLab(true)}
                        className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        🧪 Hook Lab
                    </button>
                </div>
            </div>

            {showHookLab && (
                <HookLabModal
                    onClose={() => setShowHookLab(false)}
                    onSelectHook={(hook) => {
                        // Create a new post with this hook
                        const newPost = {
                            text: hook + "\n\n[Skriv resten av innlegget her...]",
                            hook: hook,
                            formatType: 'other' as const,
                            status: 'draft' as const
                        };
                        updateBrand({ ...brand, posts: [newPost, ...brand.posts] });
                    }}
                />
            )}

            {showVoiceRecorder && (
                <VoiceRecorderModal
                    onClose={() => setShowVoiceRecorder(false)}
                    onCreatePosts={(posts) => {
                        const newPosts: Tweet[] = posts.map(p => ({
                            text: p.text,
                            hook: p.hook,
                            formatType: 'other' as const,
                            status: 'draft' as const
                        }));
                        updateBrand({ ...brand, posts: [...newPosts, ...brand.posts] });
                    }}
                />
            )}

            {showRepurpose && (
                <RepurposeModal
                    onClose={() => setShowRepurpose(false)}
                    onCreatePosts={(posts) => {
                        const newPosts: Tweet[] = posts.map(p => ({
                            text: p.text,
                            hook: p.hook,
                            formatType: 'other' as const,
                            status: 'draft' as const
                        }));
                        updateBrand({ ...brand, posts: [...newPosts, ...brand.posts] });
                    }}
                />
            )}
            {brand.posts.length === 0 ? (
                <p className="text-gray-400 font-sans">Ingen poster generert.</p>
            ) : (
                <div className="space-y-6">
                    {brand.posts.map((tweet, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                            {editIndex === idx ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Hook</label>
                                        <input
                                            value={tweet.hook}
                                            onChange={e => updateTweet(idx, { hook: e.target.value })}
                                            className="w-full p-2 rounded border border-gray-200 font-serif font-bold text-lg focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Tekst</label>
                                        <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 font-sans text-brand-text focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                                            rows={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Media Idé</label>
                                        <input
                                            value={tweet.mediaIdea || ''}
                                            onChange={e => updateTweet(idx, { mediaIdea: e.target.value })}
                                            className="w-full p-2 rounded border border-gray-200 font-sans text-sm text-gray-600 focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit(idx)} className="bg-brand-text text-white text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-brand-gold transition-colors">Lagre</button>
                                        <button onClick={cancelEdit} className="text-xs uppercase tracking-wider text-brand-text/50 hover:text-brand-text px-4 py-2">Avbryt</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${tweet.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {tweet.status === 'draft' ? 'Utkast' : tweet.status === 'edited' ? 'Redigert' : 'Godkjent'}
                                        </span>
                                        <span className="px-2 py-1 bg-brand-gold/10 text-brand-gold text-[10px] uppercase font-bold tracking-wider rounded">
                                            {tweet.formatType || 'Post'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Preview Column */}
                                        <div className="flex-1 space-y-4">
                                            <TweetPreview tweet={tweet} brand={brand} />
                                            {tweet.imageUrl && (
                                                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                    <img src={tweet.imageUrl} alt="AI Generated" className="w-full h-auto" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Column */}
                                        <div className="md:w-48 flex flex-col gap-2 justify-center">
                                            {tweet.status !== 'approved' && (
                                                <button onClick={() => updateTweet(idx, { status: 'approved' })} className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors mb-2">
                                                    Godkjenn
                                                </button>
                                            )}

                                            <button onClick={() => startEditing(idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">Rediger</button>
                                            <button onClick={() => regenerateTweet(idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">Ny versjon</button>
                                            <button onClick={() => addThreadItem(idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">Lag Tråd 🧵</button>
                                            <button onClick={() => generateImage(idx)} className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">Generer Bilde 🎨</button>
                                            <button onClick={() => shortenTweet(idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">Kort ned</button>
                                            <button onClick={() => generateLinkedInVersion(idx)} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">LinkedIn Remix</button>

                                            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors mt-2">
                                                <span className="text-lg">📅</span>
                                                <input
                                                    type="date"
                                                    value={tweet.date || ''}
                                                    onChange={e => updateTweet(idx, { date: e.target.value })}
                                                    className="bg-transparent text-xs w-full focus:outline-none"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Thread Rendering */}
                                    {tweet.thread && tweet.thread.length > 0 && (
                                        <div className="mt-6 ml-4 pl-6 border-l-2 border-brand-gold/20 space-y-6">
                                            {tweet.thread.map((reply, tIndex) => (
                                                <div key={tIndex} className="relative bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    {/* Connector dot */}
                                                    <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-brand-gold/20 border-2 border-brand-bg"></div>

                                                    {editIndex === idx ? (
                                                        <textarea
                                                            value={reply.text}
                                                            onChange={(e) => updateThreadItem(idx, tIndex, 'text', e.target.value)}
                                                            className="w-full bg-white p-3 rounded border border-gray-200 text-sm font-sans min-h-[80px] focus:ring-1 focus:ring-brand-gold/50 outline-none"
                                                            placeholder="Skriv trådsvar..."
                                                        />
                                                    ) : (
                                                        <div className="prose prose-sm max-w-none">
                                                            <TweetPreview tweet={reply} brand={brand} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Thread Rendering */}
                                    {tweet.thread && tweet.thread.length > 0 && (
                                        <div className="mt-6 ml-4 pl-6 border-l-2 border-brand-gold/20 space-y-6">
                                            {tweet.thread.map((reply, tIndex) => (
                                                <div key={tIndex} className="relative bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    {/* Connector dot */}
                                                    <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-brand-gold/20 border-2 border-brand-bg"></div>

                                                    {editIndex === idx ? (
                                                        <textarea
                                                            value={reply.text}
                                                            onChange={(e) => updateThreadItem(idx, tIndex, 'text', e.target.value)}
                                                            className="w-full bg-white p-3 rounded border border-gray-200 text-sm font-sans min-h-[80px] focus:ring-1 focus:ring-brand-gold/50 outline-none"
                                                            placeholder="Skriv trådsvar..."
                                                        />
                                                    ) : (
                                                        <div className="prose prose-sm max-w-none">
                                                            <TweetPreview tweet={reply} brand={brand} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* LinkedIn Preview if exists */}
                                    {tweet.linkedInPost && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">LinkedIn Preview</span>
                                            </div>
                                            <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm font-sans text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                                                {tweet.linkedInPost}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center mt-8">
                <button onClick={openMetricsForm} className="text-brand-text/40 hover:text-brand-text text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                    <span>📊</span> Oppdater tall
                </button>
            </div>

            {/* Modal for choosing vibe */}
            {vibeSelectIndex !== null && (
                <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm border border-orange-100">
                        <h4 className="text-xl font-serif italic text-brand-text mb-4">Velg ny tone</h4>
                        <div className="grid gap-2">
                            {vibePresets.filter(v => v.label !== brand.vibe).map(v => (
                                <button
                                    key={v.label}
                                    onClick={() => switchVibeForTweet(vibeSelectIndex, v.label)}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-brand-bg text-brand-text font-sans text-sm transition-colors border border-transparent hover:border-gray-100"
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setVibeSelectIndex(null)} className="w-full mt-4 py-3 text-xs uppercase tracking-wider text-brand-text/40 hover:text-brand-text">Avbryt</button>
                    </div>
                </div>
            )}

            {/* Performance metrics input form */}
            {showMetrics && (
                <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 max-h-[80vh] overflow-y-auto">
                        <h4 className="text-2xl font-serif italic text-brand-text mb-6">Oppdater engasjement</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full mb-6">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left p-4 font-serif italic font-normal text-brand-text/60">Tweet</th>
                                        <th className="p-4 font-serif italic font-normal text-brand-text/60 w-24">Likes</th>
                                        <th className="p-4 font-serif italic font-normal text-brand-text/60 w-24">Svar</th>
                                        <th className="p-4 font-serif italic font-normal text-brand-text/60 w-24">Visninger</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brand.posts.map((t, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-sm font-sans text-brand-text/80 max-w-md truncate">{t.text}</td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={metricsDraft[i]?.likes ?? ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setMetricsDraft(prev => {
                                                            const copy = [...prev];
                                                            if (copy[i]) copy[i].likes = val;
                                                            return copy;
                                                        });
                                                    }}
                                                    className="w-full p-2 rounded bg-gray-50 border border-gray-100 text-center"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={metricsDraft[i]?.replies ?? ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setMetricsDraft(prev => {
                                                            const copy = [...prev];
                                                            if (copy[i]) copy[i].replies = val;
                                                            return copy;
                                                        });
                                                    }}
                                                    className="w-full p-2 rounded bg-gray-50 border border-gray-100 text-center"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={metricsDraft[i]?.impressions ?? ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setMetricsDraft(prev => {
                                                            const copy = [...prev];
                                                            if (copy[i]) copy[i].impressions = val;
                                                            return copy;
                                                        });
                                                    }}
                                                    className="w-full p-2 rounded bg-gray-50 border border-gray-100 text-center"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowMetrics(false)} className="px-6 py-3 rounded-full border border-gray-200 text-brand-text/60 hover:text-brand-text font-sans text-xs uppercase tracking-widest">Avbryt</button>
                            <button onClick={saveMetrics} className="px-6 py-3 rounded-full bg-brand-text text-white hover:bg-brand-gold font-sans text-xs uppercase tracking-widest shadow-lg transition-all">Lagre Endringer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentTab;
