import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Sparkles } from 'lucide-react';
import { callAI } from '../services/ai';

interface VoiceRecorderModalProps {
    onClose: () => void;
    onCreatePosts: (posts: { text: string; hook: string }[]) => void;
}

// Define SpeechRecognition type for TypeScript
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({ onClose, onCreatePosts }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<unknown>(null);

    useEffect(() => {
        // Check for browser support
        const SpeechRecognitionAPI = (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition ||
            (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const recognition = new SpeechRecognitionAPI() as any;
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

            recognition.onerror = (event: { error: string }) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).stop?.();
            }
        };
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert('Talegjenkjenning er ikke støttet i denne nettleseren. Prøv Chrome.');
            return;
        }

        if (isRecording) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (recognitionRef.current as any).stop();
            setIsRecording(false);
        } else {
            setTranscript('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (recognitionRef.current as any).start();
            setIsRecording(true);
        }
    };

    const processTranscript = async () => {
        if (!transcript.trim()) return;

        setIsProcessing(true);

        try {
            const prompt = `Du er en innholdsskaper-assistent. Brukeren har nettopp "rantet" (snakket fritt) om et tema. 
Din jobb er å ta den rå transkripsjonen og lage 3 godt formulerte sosiale medier-poster av det.

Transkripsjonen:
"${transcript}"

Regler:
1. Behold brukerens stemme og personlighet
2. Rydd opp i grammatikk og flyten
3. Lag 3 varianter: En kort (tweet-lengde), en medium (LinkedIn), og en lang (Blog-intro)
4. Hver post skal ha en fengende "hook" (åpningssetning)

Returner som JSON array:
[{ "text": "Full post tekst...", "hook": "Første linje som fanger oppmerksomhet" }, ...]`;

            const result = await callAI([
                { role: 'system', content: 'Du er en kreativ innholdsskaper. Svar kun med JSON.' },
                { role: 'user', content: prompt }
            ]);

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
            alert('Kunne ikke prosessere. Sjekk API-nøkkel.');
        } finally {
            setIsProcessing(false);
        }
    };

    const isSupported = typeof window !== 'undefined' &&
        ((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
            (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

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
