import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Sparkles } from 'lucide-react';
import { callAIHumanized } from '../services/humanizer';
import { useToast } from './ToastContext';
import { useSettings } from '../context/SettingsContext';
import { buildLanguagePromptSection } from '../services/languagePrompts';
import type { Brand } from '../App';

interface VoiceRecorderModalProps {
    brand: Brand;
    onClose: () => void;
    onCreatePosts: (posts: { text: string; hook: string }[]) => void;
}

// Web Speech API type definitions (not included in standard TS lib)
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
    readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    start(): void;
    stop(): void;
}

interface WindowWithSpeechRecognition {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
}

const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({ brand, onClose, onCreatePosts }) => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const languageSection = buildLanguagePromptSection(settings.language);

    // Build brand context for persona-aware processing
    const brandContext = `
BRAND-KONTEKST:
- Merkevare: ${brand.name}
- Tone: ${brand.vibe}
${brand.targetAudience ? `- Målgruppe: ${brand.targetAudience}` : ''}
${brand.personaKernel?.voiceSignature ? `- Stemmesignatur: ${brand.personaKernel.voiceSignature}` : ''}
${brand.brandBrief?.brandPersonality ? `- Personlighet: ${brand.brandBrief.brandPersonality}` : ''}
`;

    useEffect(() => {
        // Check for browser support
        const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
        const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'nb-NO'; // Norwegian

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript + ' ';
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            showToast('Talegjenkjenning er ikke støttet i denne nettleseren. Prøv Chrome.', 'warning');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            setTranscript('');
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const processTranscript = async () => {
        if (!transcript.trim()) return;

        setIsProcessing(true);

        try {
            const prompt = `${languageSection}
${brandContext}

Brukeren har rantet (snakket fritt) om et tema. Lag 3 sosiale medier-poster basert på det.

Transkripsjon:
"${transcript}"

KRITISKE REGLER:
1. BEHOLD brukerens stemme og personlighet - dette er DERES ord, bare polert
2. Rydd opp grammatikk, men behold muntlig flyt
3. Tilpass til merkevarens tone og målgruppe
4. Lag 3 varianter:
   - KORT (tweet, maks 280 tegn)
   - MEDIUM (LinkedIn, 400-600 tegn)
   - LANG (Blog-intro, 800+ tegn)

HUMANISERING:
- Føles som "polert versjon av meg", ikke AI-omskriving
- Behold eventuelle særegne uttrykk/ord brukeren brukte
- Match merkevarens stemmesignatur
- Varier setningslengden
- ALDRI legg til "Lykke til!" eller andre AI-avslutninger
- ALDRI start med "Her er mine tanker om..."
- Hooks skal være ekte tanker fra ranten, ikke clickbait

Returner som JSON array:
[
  { "text": "Kort versjon...", "hook": "Første linje" },
  { "text": "Medium versjon...", "hook": "Første linje" },
  { "text": "Lang versjon...", "hook": "Første linje" }
]`;

            const result = await callAIHumanized([
                { role: 'system', content: 'Du polerer brukerens egne ord til sosiale medier-poster. Svar kun med JSON.' },
                { role: 'user', content: prompt }
            ], { toolType: 'voice', includeValidation: true });

            try {
                const match = result.match(/\[[\s\S]*\]/);
                const posts = JSON.parse(match ? match[0] : result);
                onCreatePosts(posts);
                onClose();
            } catch {
                // Single post fallback
                onCreatePosts([{ text: transcript, hook: transcript.split('.')[0] }]);
                onClose();
            }
        } catch (err) {
            console.error('Processing failed:', err);
            showToast('Kunne ikke prosessere. Sjekk API-nøkkel.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const isSupported = typeof window !== 'undefined' &&
        ((window as unknown as WindowWithSpeechRecognition).SpeechRecognition ||
            (window as unknown as WindowWithSpeechRecognition).webkitSpeechRecognition);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Mic size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Rant Mode</h2>
                            <p className="text-white/70 text-sm">Snakk fritt, AI gjør resten</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {!isSupported ? (
                        <div className="text-center py-12 text-red-500">
                            <MicOff className="mx-auto mb-4" size={48} />
                            <p className="font-bold">Talegjenkjenning støttes ikke</p>
                            <p className="text-sm text-gray-500 mt-2">Prøv å bruke Chrome eller Edge.</p>
                        </div>
                    ) : (
                        <>
                            {/* Recording Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={toggleRecording}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording
                                            ? 'bg-red-500 animate-pulse scale-110'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {isRecording ? (
                                        <MicOff className="text-white" size={40} />
                                    ) : (
                                        <Mic className="text-gray-600" size={40} />
                                    )}
                                </button>
                            </div>

                            <p className="text-center text-sm text-gray-500">
                                {isRecording ? '🔴 Tar opp... Klikk for å stoppe' : 'Klikk for å starte opptak'}
                            </p>

                            {/* Transcript */}
                            <div className="bg-gray-50 rounded-xl p-4 min-h-[150px] border border-gray-200">
                                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-2">Transkripsjon</label>
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="Det du sier vil vises her..."
                                    className="w-full bg-transparent resize-none focus:outline-none text-gray-800 min-h-[100px]"
                                />
                            </div>

                            {/* Process Button */}
                            {transcript.trim() && !isRecording && (
                                <button
                                    onClick={processTranscript}
                                    disabled={isProcessing}
                                    className="w-full bg-brand-text text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Prosesserer...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            Lag poster fra dette
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceRecorderModal;
