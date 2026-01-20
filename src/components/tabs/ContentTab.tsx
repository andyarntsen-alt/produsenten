import React, { useState } from 'react';
import type { Brand, Tweet } from '../../App';
import { callAIHumanized } from '../../services/humanizer';
import { useSettings } from '../../context/SettingsContext';
import { buildLanguagePromptSection } from '../../services/languagePrompts';
import TweetPreview from '../TweetPreview';
import HookLabModal from '../HookLabModal';
import VoiceRecorderModal from '../VoiceRecorderModal';
import RepurposeModal from '../RepurposeModal';
import BrainDumpModal from '../BrainDumpModal';
import PostImproverModal from '../PostImproverModal';
import InspirationVaultModal from '../InspirationVaultModal';
import PostScoreBadge from '../PostScoreBadge';
import PlatformPreview from '../PlatformPreview';
import TrendingInspirationPanel from '../TrendingInspirationPanel';
import { useToast } from '../ToastContext';

interface ContentTabProps {
    brand: Brand;
    vibePresets: { label: string; key: string; emoji: string; description: string; toneRules: string[]; }[];
    updateBrand: (brand: Brand) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({ brand, vibePresets, updateBrand }) => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const languageSection = buildLanguagePromptSection(settings.language);
    const isEnglish = settings.language === 'en';

    // Translations
    const t = {
        title: isEnglish ? 'AI-generated posts' : 'AI-genererte poster',
        brainDump: 'Brain Dump',
        inspiration: isEnglish ? 'Inspiration' : 'Inspirasjon',
        autoSchedule: isEnglish ? 'Auto-schedule' : 'Auto-planlegg',
        repurpose: 'Repurpose',
        rantMode: 'Rant Mode',
        hookLab: 'Hook Lab',
        all: isEnglish ? 'All' : 'Alle',
        draft: isEnglish ? 'Draft' : 'Utkast',
        edited: isEnglish ? 'Edited' : 'Redigert',
        approved: isEnglish ? 'Approved' : 'Godkjent',
        searchPlaceholder: isEnglish ? 'Search posts...' : 'Søk i poster...',
        selectAll: isEnglish ? 'Select all' : 'Velg alle',
        selectDrafts: isEnglish ? 'Select drafts' : 'Velg utkast',
        clearSelection: isEnglish ? 'Clear selection' : 'Fjern valg',
        selected: isEnglish ? 'selected' : 'valgt',
        approveSelected: isEnglish ? 'Approve selected' : 'Godkjenn valgte',
        deleteSelected: isEnglish ? 'Delete selected' : 'Slett valgte',
        noPosts: isEnglish ? 'No posts generated.' : 'Ingen poster generert.',
        noMatch: isEnglish ? 'No posts match the filter.' : 'Ingen poster matcher filteret.',
        hook: 'Hook',
        text: isEnglish ? 'Text' : 'Tekst',
        mediaIdea: isEnglish ? 'Media Idea' : 'Media Idé',
        save: isEnglish ? 'Save' : 'Lagre',
        cancel: isEnglish ? 'Cancel' : 'Avbryt',
        chars: isEnglish ? 'chars' : 'tegn',
        copyToClipboard: isEnglish ? 'Copy to clipboard' : 'Kopier til utklippstavle',
        duplicatePost: isEnglish ? 'Duplicate post' : 'Dupliser post',
        imagePrompt: isEnglish ? 'Image Prompt' : 'Bilde-prompt',
        copyPrompt: isEnglish ? 'Copy prompt' : 'Kopier prompt',
        approve: isEnglish ? 'Approve' : 'Godkjenn',
        edit: isEnglish ? 'Edit' : 'Rediger',
        improve: isEnglish ? 'Improve' : 'Forbedre',
        newVersion: isEnglish ? 'New version' : 'Ny versjon',
        createThread: isEnglish ? 'Create Thread' : 'Lag Tråd',
        createImagePrompt: isEnglish ? 'Create Image Prompt' : 'Lag Bilde-prompt',
        shorten: isEnglish ? 'Shorten' : 'Kort ned',
        linkedinRemix: 'LinkedIn Remix',
        preview: 'Preview',
        thread: isEnglish ? 'Thread' : 'Tråd',
        replies: isEnglish ? 'replies' : 'svar',
        reply: isEnglish ? 'Reply' : 'Svar',
        remove: isEnglish ? 'Remove' : 'Fjern',
        writeLongForm: isEnglish ? 'Write long-form content here...' : 'Skriv lang-form innhold her...',
        addMoreReplies: isEnglish ? '+ Add more replies' : '+ Legg til flere svar',
        updateMetrics: isEnglish ? 'Update metrics' : 'Oppdater tall',
        writeRestHere: isEnglish ? '[Write the rest of the post here...]' : '[Skriv resten av innlegget her...]',
        newPostFromIdea: isEnglish ? 'New post created from idea!' : 'Ny post opprettet fra idé!',
        selectNewTone: isEnglish ? 'Select new tone' : 'Velg ny tone',
        updateEngagement: isEnglish ? 'Update engagement' : 'Oppdater engasjement',
        post: 'Post',
        repliesLabel: isEnglish ? 'Replies' : 'Svar',
        views: isEnglish ? 'Views' : 'Visninger',
        saveChanges: isEnglish ? 'Save Changes' : 'Lagre Endringer',
        autoScheduleTitle: isEnglish ? 'Auto-schedule posts' : 'Auto-planlegg poster',
        distributeOverWeeks: isEnglish ? 'Distribute over weeks' : 'Fordel over antall uker',
        week: isEnglish ? 'week' : 'uke',
        weeks: isEnglish ? 'weeks' : 'uker',
        selectWeekdays: isEnglish ? 'Select weekdays' : 'Velg ukedager',
        mon: isEnglish ? 'Mon' : 'Man',
        tue: isEnglish ? 'Tue' : 'Tir',
        wed: isEnglish ? 'Wed' : 'Ons',
        thu: isEnglish ? 'Thu' : 'Tor',
        fri: isEnglish ? 'Fri' : 'Fre',
        sat: isEnglish ? 'Sat' : 'Lør',
        sun: isEnglish ? 'Sun' : 'Søn',
        selectedPostsWillBe: isEnglish ? 'selected posts will be scheduled.' : 'valgte poster vil bli planlagt.',
        allPostsWillBe: isEnglish ? 'posts will be scheduled.' : 'poster vil bli planlagt.',
        schedulePosts: isEnglish ? 'Schedule posts' : 'Planlegg poster',
        postsApproved: isEnglish ? 'posts approved!' : 'poster godkjent!',
        postsDeleted: isEnglish ? 'posts deleted!' : 'poster slettet!',
        copiedToClipboard: isEnglish ? 'Copied to clipboard!' : 'Kopiert til utklippstavle!',
        couldNotCopy: isEnglish ? 'Could not copy.' : 'Kunne ikke kopiere.',
        postDuplicated: isEnglish ? 'Post duplicated!' : 'Post duplisert!',
        postsScheduledOver: isEnglish ? 'Posts scheduled over' : 'Poster planlagt over',
        textCannotBeEmpty: isEnglish ? 'Text cannot be empty.' : 'Teksten kan ikke være tom.',
        postUpdated: isEnglish ? 'Post updated!' : 'Post oppdatert!',
    };

    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [vibeSelectIndex, setVibeSelectIndex] = useState<number | null>(null);
    const [metricsDraft, setMetricsDraft] = useState<{ likes: string; replies: string; impressions: string; }[]>([]);
    const [showMetrics, setShowMetrics] = useState(false);
    const [showHookLab, setShowHookLab] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [showRepurpose, setShowRepurpose] = useState(false);
    const [showBrainDump, setShowBrainDump] = useState(false);
    const [showInspirationVault, setShowInspirationVault] = useState(false);
    const [improverPostIndex, setImproverPostIndex] = useState<number | null>(null);
    const [previewPostIndex, setPreviewPostIndex] = useState<number | null>(null);

    // NEW: Bulk selection state
    const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());

    // NEW: Filter state
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'edited' | 'approved'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // NEW: Auto-schedule modal
    const [showAutoSchedule, setShowAutoSchedule] = useState(false);
    const [scheduleWeeks, setScheduleWeeks] = useState(4);
    const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri

    // Filter posts based on status and search
    const filteredPosts = brand.posts.filter((post, _idx) => {
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        const matchesSearch = !searchQuery ||
            post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.hook.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Get original indices for filtered posts
    const filteredIndices = brand.posts.map((post, idx) => {
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        const matchesSearch = !searchQuery ||
            post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.hook.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch ? idx : -1;
    }).filter(idx => idx !== -1);

    // Bulk selection helpers
    const togglePostSelection = (index: number) => {
        const newSelected = new Set(selectedPosts);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedPosts(newSelected);
    };

    const selectAll = () => {
        setSelectedPosts(new Set(filteredIndices));
    };

    const selectDrafts = () => {
        const draftIndices = brand.posts
            .map((p, i) => p.status === 'draft' ? i : -1)
            .filter(i => i !== -1 && filteredIndices.includes(i));
        setSelectedPosts(new Set(draftIndices));
    };

    const clearSelection = () => {
        setSelectedPosts(new Set());
    };

    const bulkApprove = () => {
        const updatedPosts = brand.posts.map((post, i) =>
            selectedPosts.has(i) ? { ...post, status: 'approved' as const } : post
        );
        updateBrand({ ...brand, posts: updatedPosts });
        showToast(`${selectedPosts.size} ${t.postsApproved}`, 'success');
        setSelectedPosts(new Set());
    };

    const bulkDelete = () => {
        const updatedPosts = brand.posts.filter((_, i) => !selectedPosts.has(i));
        updateBrand({ ...brand, posts: updatedPosts });
        showToast(`${selectedPosts.size} ${t.postsDeleted}`, 'success');
        setSelectedPosts(new Set());
    };

    // Copy to clipboard helper
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(t.copiedToClipboard, 'success');
        } catch {
            showToast(t.couldNotCopy, 'error');
        }
    };

    // Clone post helper
    const clonePost = (index: number) => {
        const original = brand.posts[index];
        const cloned: Tweet = {
            ...original,
            status: 'draft',
            date: undefined,
            metrics: undefined,
        };
        const updatedPosts = [...brand.posts];
        updatedPosts.splice(index + 1, 0, cloned);
        updateBrand({ ...brand, posts: updatedPosts });
        showToast(t.postDuplicated, 'success');
    };

    // Auto-schedule helper
    const autoSchedulePosts = () => {
        const today = new Date();
        let dayOffset = 1;
        let scheduledCount = 0;

        const updatedPosts = brand.posts.map((post) => {
            if (post.status === 'approved' || selectedPosts.size === 0 || selectedPosts.has(brand.posts.indexOf(post))) {
                // Find next valid day
                while (scheduledCount < brand.posts.length) {
                    const targetDate = new Date(today);
                    targetDate.setDate(today.getDate() + dayOffset);
                    const dayOfWeek = targetDate.getDay(); // 0 = Sunday

                    if (scheduleDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek)) {
                        dayOffset++;
                        scheduledCount++;

                        // Check if we've exceeded the week limit
                        if (dayOffset > scheduleWeeks * 7) {
                            return post;
                        }

                        return {
                            ...post,
                            date: targetDate.toISOString().split('T')[0]
                        };
                    }
                    dayOffset++;
                }
            }
            return post;
        });

        updateBrand({ ...brand, posts: updatedPosts });
        showToast(`${t.postsScheduledOver} ${scheduleWeeks} ${t.weeks}!`, 'success');
        setShowAutoSchedule(false);
    };

    // Status counts for filter badges
    const statusCounts = {
        all: brand.posts.length,
        draft: brand.posts.filter(p => p.status === 'draft').length,
        edited: brand.posts.filter(p => p.status === 'edited').length,
        approved: brand.posts.filter(p => p.status === 'approved').length,
    };

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
            showToast(t.textCannotBeEmpty, 'warning');
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
                `${languageSection}

Lag en ny Twitter-post i ${vibeDesc} tone for ${brand.name}.
Unngå å gjenta tidligere tweets.

KRITISKE REGLER:
- Start med en sterk hook (kontrast, spørsmål, eller påstand)
- ALDRI start med "Her er..." eller "I dag vil jeg..."
- Varier setningslengden (korte slag + lengre tanker)
- Bruk "jeg/du/vi", aldri "man"
- Maks 2-3 emojis
- Avslutt ALDRI med "Lykke til!" eller "Håper det hjelper!"

Gi kun teksten til den nye tweeten.`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du skriver sosiale medier-innhold.' },
                { role: 'user', content: prompt }
            ], { toolType: 'content', includeValidation: true });

            updateTweet(index, { text: result, status: 'edited' });

        } catch (err) {
            console.error('Regeneration failed:', err);
            showToast('Kunne ikke regenerere tweet. Sjekk API-nøkkel.', 'error');
            updateTweet(index, { text: originalText, status: originalStatus });
        }
    };

    // Shorten tweet function
    const shortenTweet = async (index: number) => {
        const tweet = brand.posts[index];
        const originalText = tweet.text;
        updateTweet(index, { text: 'Forkorter...', status: tweet.status });
        try {
            const prompt = `${languageSection}

Gjør følgende tweet kortere (maks 280 tegn), mer punchy, og fjern fyllord. Behold kjernebudskapet.

Original: "${originalText}"

REGLER:
- Kutt all "intro" og "outro"
- Behold hook og hovedpoeng
- Korte setninger > lange
- Fjern ord som "faktisk", "egentlig", "virkelig"
- Returner KUN den forkortede teksten`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du forkorter tekst uten å miste personlighet.' },
                { role: 'user', content: prompt }
            ], { toolType: 'shorten', includeValidation: true });
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
            const prompt = `${languageSection}

Skriv om denne tweeten til å ha ${vibeDesc} tone.

Original: "${text}"

REGLER:
- Behold kjernebudskapet
- Endre stemmen/tonen til ${newVibe}
- Behold lengden omtrent lik
- ALDRI legg til "Lykke til!" eller lignende avslutninger
- Returner KUN den nye teksten`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du endrer tone of voice på tekst.' },
                { role: 'user', content: prompt }
            ], { toolType: 'content', includeValidation: true });
            updateTweet(index, { text: result, status: 'edited' });
            setVibeSelectIndex(null);
        } catch {
            showToast('Kunne ikke endre tone.', 'error');
        }
    };

    // Generate LinkedIn Version
    const generateLinkedInVersion = async (index: number) => {
        const tweet = brand.posts[index];
        const originalText = tweet.text;

        try {
            const prompt = `${languageSection}

Skriv om følgende tweet til en engasjerende LinkedIn-post.

Tweet: "${originalText}"

KRAV:
- Luftig formatering (linjeskift mellom avsnitt)
- Dypere/mer forklarende enn tweeten, men behold "punch"
- Ingen hashtags (eller maks 1-2 helt på slutten)
- Profesjonell MEN personlig tone
- Start med hook, ikke "I dag vil jeg dele..."
- ALDRI avslutt med "Hva tenker du?" eller "Del gjerne dine tanker!"

LENGDE: 500-800 tegn

Returner KUN LinkedIn-posten.`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du skriver LinkedIn-innhold som føles ekte.' },
                { role: 'user', content: prompt }
            ], { toolType: 'linkedin', includeValidation: true });
            updateTweet(index, { linkedInPost: result });
        } catch (err) {
            console.error('LinkedIn generation failed:', err);
            showToast('Kunne ikke generere LinkedIn-versjon.', 'error');
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

    // Generate AI-powered long-form post (thread style) from the original tweet
    const generateThread = async (index: number) => {
        const tweet = brand.posts[index];
        const originalText = tweet.text;

        // Show loading state
        updateTweet(index, {
            thread: [{ text: 'Skriver long-form post...', hook: '', status: 'draft', formatType: 'other' }]
        });

        try {
            const vibeDesc = vibePresets.find(v => v.label === brand.vibe)?.description || brand.vibe;

            // Build rich brand context for better thread generation
            const brandContext = `
BRAND-KONTEKST:
- Merkevare: ${brand.name}
- Tone: ${vibeDesc}
${brand.targetAudience ? `- Målgruppe: ${brand.targetAudience}` : ''}
${brand.brandBrief?.audiencePainPoints?.length ? `- Smertepunkter å adressere: ${brand.brandBrief.audiencePainPoints.slice(0, 3).join(', ')}` : ''}
${brand.brandBrief?.uniqueStories?.length ? `- Unike historier/vinkler: ${brand.brandBrief.uniqueStories.slice(0, 2).join(', ')}` : ''}
${brand.brandBrief?.contentAngles?.length ? `- Innholdsvinkler: ${brand.brandBrief.contentAngles.slice(0, 3).join(', ')}` : ''}
${brand.personaKernel?.voiceSignature ? `- Stemmesignatur: ${brand.personaKernel.voiceSignature}` : ''}
`;

            const prompt = `${languageSection}
${brandContext}

Utvid denne tweeten til en lang, sammenhengende tekst (500-1000 tegn).

Start-tweet: "${originalText}"

KRAV:
- ÉN lang tekst, ikke flere tweets
- Bruk linjeskift for å skape luft
- Gå i dybden med konkrete eksempler som er relevante for målgruppen
- Adresser målgruppens smertepunkter hvis relevant
- Start RETT på sak - ingen "I dag vil jeg..."
- Varier setningslengden (korte + lange)
- Match merkevarens stemmesignatur
- ALDRI avslutt med "Lykke til!" eller CTA-spørsmål
- Føles som en ekte tankestrøm, ikke en artikkel

EKSEMPEL PÅ GOD STRUKTUR:
[Hook - 1 setning]

[Utdypning med eksempel]

[Personlig erfaring/innsikt]

[Konklusjon eller åpen refleksjon]

Returner KUN teksten.`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du skriver long-form innhold for X.' },
                { role: 'user', content: prompt }
            ], { toolType: 'thread', includeValidation: true });

            // Create just ONE thread item with the long text
            const newThread: Tweet[] = [{
                text: result.trim(),
                hook: '',
                status: 'draft' as const,
                formatType: 'other' as const
            }];

            updateTweet(index, { thread: newThread });
            showToast('Long-form post generert!', 'success');

        } catch (err) {
            console.error('Long-form generation failed:', err);
            showToast('Kunne ikke generere post. Prøv igjen.', 'error');
            updateTweet(index, { thread: undefined });
        }
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

    const generateImagePrompt = async (index: number) => {
        const tweet = brand.posts[index];
        const rawInput = tweet.mediaIdea || tweet.text;

        if (!rawInput) return;

        showToast(settings.language === 'en' ? 'Creating image prompt...' : 'Lager bilde-prompt...', 'info');

        try {
            const optimizationPrompt = `Create a detailed visual image prompt in ENGLISH based on this social media post: "${rawInput}"

RULES:
- Describe a visual motif that fits the text (metaphorical or literal)
- Style: ${brand.vibe || 'Modern, high quality photography'}
- NO text in the image
- Be specific about lighting, composition, colors
- Return ONLY the English prompt (no explanations)

GOOD EXAMPLE:
"Professional woman working at minimalist desk, soft natural lighting from large window, modern laptop, cup of coffee, plants in background, warm tones, shallow depth of field, editorial photography style"`;

            const result = await callAIHumanized([
                { role: 'system', content: 'You create image generation prompts. Return only the prompt, no explanations.' },
                { role: 'user', content: optimizationPrompt }
            ], { toolType: 'content', includeValidation: false });

            const optimizedPrompt = result.trim().replace(/^["']|["']$/g, ''); // Remove any wrapping quotes

            console.log('[Image Prompt Generated]:', optimizedPrompt);
            updateTweet(index, { imagePrompt: optimizedPrompt });
            showToast(settings.language === 'en' ? 'Image prompt created!' : 'Bilde-prompt laget!', 'success');

        } catch (err) {
            console.error('Image prompt generation failed:', err);
            showToast(settings.language === 'en' ? 'Could not create prompt.' : 'Kunne ikke lage prompt.', 'error');
        }
    };


    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif italic text-brand-text">{t.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowBrainDump(true)}
                        className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        🧠 {t.brainDump}
                    </button>
                    <button
                        onClick={() => setShowInspirationVault(true)}
                        className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        💡 {t.inspiration}
                    </button>
                    <button
                        onClick={() => setShowAutoSchedule(true)}
                        className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        📅 {t.autoSchedule}
                    </button>
                    <button
                        onClick={() => setShowRepurpose(true)}
                        className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        ♻️ {t.repurpose}
                    </button>
                    <button
                        onClick={() => setShowVoiceRecorder(true)}
                        className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        🎤 {t.rantMode}
                    </button>
                    <button
                        onClick={() => setShowHookLab(true)}
                        className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-bold transition-all"
                    >
                        🧪 {t.hookLab}
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                {/* Status Filters */}
                <div className="flex gap-1">
                    {(['all', 'draft', 'edited', 'approved'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                statusFilter === status
                                    ? 'bg-brand-text text-white'
                                    : 'bg-white text-brand-text/60 hover:bg-gray-100'
                            }`}
                        >
                            {status === 'all' ? t.all : status === 'draft' ? t.draft : status === 'edited' ? t.edited : t.approved}
                            <span className="ml-1 opacity-60">({statusCounts[status]})</span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder={`🔍 ${t.searchPlaceholder}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-full bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                    />
                </div>
            </div>

            {/* Bulk Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-brand-gold/5 rounded-xl border border-brand-gold/20">
                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                        {t.selectAll}
                    </button>
                    <button
                        onClick={selectDrafts}
                        className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                        {t.selectDrafts}
                    </button>
                    {selectedPosts.size > 0 && (
                        <button
                            onClick={clearSelection}
                            className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                            {t.clearSelection}
                        </button>
                    )}
                </div>

                {selectedPosts.size > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-brand-text/60 font-medium">
                            {selectedPosts.size} {t.selected}
                        </span>
                        <button
                            onClick={bulkApprove}
                            className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                        >
                            ✓ {t.approveSelected}
                        </button>
                        <button
                            onClick={bulkDelete}
                            className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                            🗑 {t.deleteSelected}
                        </button>
                    </div>
                )}
            </div>

            {showHookLab && (
                <HookLabModal
                    brand={brand}
                    onClose={() => setShowHookLab(false)}
                    onSelectHook={(hook) => {
                        // Create a new post with this hook
                        const newPost = {
                            text: hook + "\n\n" + t.writeRestHere,
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
                    brand={brand}
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
                    brand={brand}
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

            {showBrainDump && (
                <BrainDumpModal
                    brand={brand}
                    onClose={() => setShowBrainDump(false)}
                    onCreatePosts={(posts) => {
                        const newPosts: Tweet[] = posts.map(p => ({
                            text: p.text,
                            hook: p.hook,
                            formatType: (p.formatType as Tweet['formatType']) || 'other',
                            status: 'draft' as const
                        }));
                        updateBrand({ ...brand, posts: [...newPosts, ...brand.posts] });
                    }}
                />
            )}

            {showInspirationVault && (
                <InspirationVaultModal
                    onClose={() => setShowInspirationVault(false)}
                    brandName={brand.name}
                    onCreatePost={(post) => {
                        const newPost: Tweet = {
                            text: post.text,
                            hook: post.hook,
                            formatType: (post.formatType as Tweet['formatType']) || 'other',
                            status: 'draft' as const
                        };
                        updateBrand({ ...brand, posts: [newPost, ...brand.posts] });
                    }}
                />
            )}

            {improverPostIndex !== null && (
                <PostImproverModal
                    brand={brand}
                    onClose={() => setImproverPostIndex(null)}
                    originalPost={brand.posts[improverPostIndex]?.text || ''}
                    onSelectVersion={(text) => {
                        updateTweet(improverPostIndex, { text, status: 'edited' });
                        showToast(t.postUpdated, 'success');
                    }}
                />
            )}
            {/* Main content area with posts and inspiration sidebar */}
            <div className="flex gap-6">
                {/* Posts column */}
                <div className="flex-1 min-w-0">
            {filteredPosts.length === 0 ? (
                <p className="text-gray-400 font-sans">
                    {brand.posts.length === 0 ? t.noPosts : t.noMatch}
                </p>
            ) : (
                <div className="space-y-6">
                    {filteredPosts.map((tweet, filteredIdx) => {
                        const idx = filteredIndices[filteredIdx]; // Get original index
                        return (
                        <div key={idx} className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                            selectedPosts.has(idx) ? 'border-brand-gold ring-2 ring-brand-gold/30' : 'border-gray-100'
                        }`}>
                            {editIndex === idx ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t.hook}</label>
                                        <input
                                            value={tweet.hook}
                                            onChange={e => updateTweet(idx, { hook: e.target.value })}
                                            className="w-full p-2 rounded border border-gray-200 font-serif font-bold text-lg focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t.text}</label>
                                        <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 font-sans text-brand-text focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                                            rows={6}
                                        />
                                        {/* Character counter */}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${
                                                        editText.length > 280 ? 'bg-red-500' :
                                                        editText.length > 250 ? 'bg-amber-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min((editText.length / 280) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`ml-3 text-xs font-mono font-bold ${
                                                editText.length > 280 ? 'text-red-500' :
                                                editText.length > 250 ? 'text-amber-500' : 'text-green-600'
                                            }`}>
                                                {editText.length}/280
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t.mediaIdea}</label>
                                        <input
                                            value={tweet.mediaIdea || ''}
                                            onChange={e => updateTweet(idx, { mediaIdea: e.target.value })}
                                            className="w-full p-2 rounded border border-gray-200 font-sans text-sm text-gray-600 focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit(idx)} className="bg-brand-text text-white text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-brand-gold transition-colors">{t.save}</button>
                                        <button onClick={cancelEdit} className="text-xs uppercase tracking-wider text-brand-text/50 hover:text-brand-text px-4 py-2">{t.cancel}</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedPosts.has(idx)}
                                            onChange={() => togglePostSelection(idx)}
                                            className="w-5 h-5 rounded border-gray-300 text-brand-gold focus:ring-brand-gold cursor-pointer"
                                        />
                                        <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${tweet.status === 'approved' ? 'bg-green-100 text-green-700' : tweet.status === 'edited' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {tweet.status === 'draft' ? t.draft : tweet.status === 'edited' ? t.edited : t.approved}
                                        </span>
                                        <span className="px-2 py-1 bg-brand-gold/10 text-brand-gold text-[10px] uppercase font-bold tracking-wider rounded">
                                            {tweet.formatType || 'Post'}
                                        </span>
                                        {/* Character count badge */}
                                        <span className={`px-2 py-1 text-[10px] font-mono font-bold rounded ${
                                            tweet.text.length > 280 ? 'bg-red-100 text-red-700' :
                                            tweet.text.length > 250 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {tweet.text.length} {t.chars}
                                        </span>
                                        {/* Post Score Badge */}
                                        <PostScoreBadge postText={tweet.text} />
                                        {/* Copy button */}
                                        <button
                                            onClick={() => copyToClipboard(tweet.text)}
                                            className="ml-auto px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                                            title={t.copyToClipboard}
                                        >
                                            📋
                                        </button>
                                        {/* Clone button */}
                                        <button
                                            onClick={() => clonePost(idx)}
                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                                            title={t.duplicatePost}
                                        >
                                            📄
                                        </button>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Preview Column */}
                                        <div className="flex-1 space-y-4">
                                            <TweetPreview tweet={tweet} brand={brand} />

                                            {/* Image Prompt Display */}
                                            {tweet.imagePrompt && (
                                                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">{t.imagePrompt}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(tweet.imagePrompt!)}
                                                            className="text-xs bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-1 rounded-full transition-colors font-medium"
                                                        >
                                                            {t.copyPrompt}
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-700 font-mono bg-white/50 p-3 rounded-lg">
                                                        {tweet.imagePrompt}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Platform Preview */}
                                            {previewPostIndex === idx && (
                                                <div className="animate-fade-in">
                                                    <PlatformPreview
                                                        postText={tweet.text}
                                                        authorName={brand.name}
                                                        authorHandle={`@${brand.name.toLowerCase().replace(/\s+/g, '')}`}
                                                    />
                                                </div>
                                            )}

                                            {tweet.imageUrl && (
                                                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm relative min-h-[200px] bg-gray-50 flex items-center justify-center">
                                                    <img
                                                        src={tweet.imageUrl}
                                                        alt="AI Generated"
                                                        className="w-full h-auto"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = `https://placehold.co/1024x1024/EEE/31343C?text=Load+Failed`;
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Column */}
                                        <div className="md:w-48 flex flex-col gap-2 justify-center">
                                            {tweet.status !== 'approved' && (
                                                <button onClick={() => updateTweet(idx, { status: 'approved' })} className="w-full bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors mb-2">
                                                    {t.approve}
                                                </button>
                                            )}

                                            <button onClick={() => startEditing(idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">{t.edit}</button>
                                            <button onClick={() => setImproverPostIndex(idx)} className="w-full bg-violet-50 hover:bg-violet-100 text-violet-700 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors font-bold">✨ {t.improve}</button>
                                            <button onClick={() => regenerateTweet(idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">{t.newVersion}</button>
                                            <button onClick={() => generateThread(idx)} className="w-full bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors font-bold">{t.createThread} 🧵</button>
                                            <button onClick={() => generateImagePrompt(idx)} className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">
                                                {t.createImagePrompt}
                                            </button>
                                            <button onClick={() => shortenTweet(idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">{t.shorten}</button>
                                            <button onClick={() => generateLinkedInVersion(idx)} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">{t.linkedinRemix}</button>
                                            <button onClick={() => setPreviewPostIndex(previewPostIndex === idx ? null : idx)} className="w-full bg-gray-50 hover:bg-gray-100 text-brand-text py-2 rounded-lg text-xs uppercase tracking-wider transition-colors">📱 {t.preview}</button>

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
                                        <div className="mt-6 ml-4 pl-6 border-l-2 border-brand-gold/30 space-y-4">
                                            <div className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">
                                                🧵 {t.thread} ({tweet.thread.length} {t.replies})
                                            </div>
                                            {tweet.thread.map((reply, tIndex) => (
                                                <div key={tIndex} className="relative bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    {/* Connector dot */}
                                                    <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-brand-gold border-2 border-brand-bg"></div>

                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs text-gray-400">{t.reply} {tIndex + 1}</span>
                                                        <button
                                                            onClick={() => {
                                                                const newThread = tweet.thread?.filter((_, i) => i !== tIndex) || [];
                                                                updateTweet(idx, { thread: newThread.length > 0 ? newThread : undefined });
                                                            }}
                                                            className="text-red-400 hover:text-red-600 text-xs"
                                                        >
                                                            ✕ {t.remove}
                                                        </button>
                                                    </div>

                                                    <textarea
                                                        value={reply.text}
                                                        onChange={(e) => updateThreadItem(idx, tIndex, 'text', e.target.value)}
                                                        className="w-full bg-white p-4 rounded-xl border border-gray-200 text-base font-sans min-h-[500px] focus:ring-2 focus:ring-brand-gold/50 outline-none resize-y"
                                                        placeholder={t.writeLongForm}
                                                    />

                                                    {reply.text && (
                                                        <div className="mt-2 text-xs text-gray-400">
                                                            {reply.text.length} {t.chars}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => addThreadItem(idx)}
                                                className="w-full py-2 border-2 border-dashed border-brand-gold/30 text-brand-gold/60 hover:border-brand-gold hover:text-brand-gold rounded-lg text-sm transition-colors"
                                            >
                                                {t.addMoreReplies}
                                            </button>
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
                    );
                    })}
                </div>
            )}

            <div className="flex justify-center mt-8">
                <button onClick={openMetricsForm} className="text-brand-text/40 hover:text-brand-text text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                    <span>📊</span> {t.updateMetrics}
                </button>
            </div>
                </div>

                {/* Inspiration sidebar */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-4">
                        <TrendingInspirationPanel
                            brand={brand}
                            onUseIdea={(idea) => {
                                const newPost = {
                                    text: idea + "\n\n" + t.writeRestHere,
                                    hook: idea,
                                    formatType: 'other' as const,
                                    status: 'draft' as const
                                };
                                updateBrand({ ...brand, posts: [newPost, ...brand.posts] });
                                showToast(t.newPostFromIdea, 'success');
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal for choosing vibe */}
            {vibeSelectIndex !== null && (
                <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm border border-orange-100">
                        <h4 className="text-xl font-serif italic text-brand-text mb-4">{t.selectNewTone}</h4>
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
                        <button onClick={() => setVibeSelectIndex(null)} className="w-full mt-4 py-3 text-xs uppercase tracking-wider text-brand-text/40 hover:text-brand-text">{t.cancel}</button>
                    </div>
                </div>
            )}

            {/* Performance metrics input form */}
            {showMetrics && (
                <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 max-h-[80vh] overflow-y-auto">
                        <h4 className="text-2xl font-serif italic text-brand-text mb-6">{t.updateEngagement}</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full mb-6">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left p-4 font-serif italic font-normal text-brand-text/60">{t.post}</th>
                                        <th className="p-4 font-serif italic font-normal text-brand-text/60 w-24">Likes</th>
                                        <th className="p-4 font-serif italic font-normal text-brand-text/60 w-24">{t.repliesLabel}</th>
                                        <th className="p-4 font-serif italic font-normal text-brand-text/60 w-24">{t.views}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brand.posts.map((post, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-sm font-sans text-brand-text/80 max-w-md truncate">{post.text}</td>
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
                            <button onClick={() => setShowMetrics(false)} className="px-6 py-3 rounded-full border border-gray-200 text-brand-text/60 hover:text-brand-text font-sans text-xs uppercase tracking-widest">{t.cancel}</button>
                            <button onClick={saveMetrics} className="px-6 py-3 rounded-full bg-brand-text text-white hover:bg-brand-gold font-sans text-xs uppercase tracking-widest shadow-lg transition-all">{t.saveChanges}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto-schedule modal */}
            {showAutoSchedule && (
                <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                        <h4 className="text-2xl font-serif italic text-brand-text mb-6">📅 {t.autoScheduleTitle}</h4>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t.distributeOverWeeks}</label>
                                <select
                                    value={scheduleWeeks}
                                    onChange={(e) => setScheduleWeeks(Number(e.target.value))}
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                >
                                    <option value={1}>1 {t.week}</option>
                                    <option value={2}>2 {t.weeks}</option>
                                    <option value={3}>3 {t.weeks}</option>
                                    <option value={4}>4 {t.weeks}</option>
                                    <option value={6}>6 {t.weeks}</option>
                                    <option value={8}>8 {t.weeks}</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t.selectWeekdays}</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { day: 1, label: t.mon },
                                        { day: 2, label: t.tue },
                                        { day: 3, label: t.wed },
                                        { day: 4, label: t.thu },
                                        { day: 5, label: t.fri },
                                        { day: 6, label: t.sat },
                                        { day: 7, label: t.sun },
                                    ].map(({ day, label }) => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                if (scheduleDays.includes(day)) {
                                                    setScheduleDays(scheduleDays.filter(d => d !== day));
                                                } else {
                                                    setScheduleDays([...scheduleDays, day].sort());
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                scheduleDays.includes(day)
                                                    ? 'bg-brand-gold text-white'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    {selectedPosts.size > 0
                                        ? `${selectedPosts.size} ${t.selectedPostsWillBe}`
                                        : `${brand.posts.length} ${t.allPostsWillBe}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAutoSchedule(false)}
                                className="px-6 py-3 rounded-full border border-gray-200 text-brand-text/60 hover:text-brand-text font-sans text-xs uppercase tracking-widest"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={autoSchedulePosts}
                                className="px-6 py-3 rounded-full bg-green-500 text-white hover:bg-green-600 font-sans text-xs uppercase tracking-widest shadow-lg transition-all"
                            >
                                {t.schedulePosts}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentTab;
