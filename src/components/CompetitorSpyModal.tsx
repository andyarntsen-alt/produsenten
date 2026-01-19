import React, { useState } from 'react';
import { X, Search, Eye, Sparkles } from 'lucide-react';
import { callAI } from '../services/ai';
import { fetchWebsite } from '../services/scraper';

interface CompetitorSpyModalProps {
    onClose: () => void;
}

interface CompetitorAnalysis {
    username: string;
    followers: string;
    postingFrequency: string;
    topContentTypes: string[];
    recentPosts: string[];
    strategy: string;
    opportunities: string[];
    source?: string;
}

const CompetitorSpyModal: React.FC<CompetitorSpyModalProps> = ({ onClose }) => {
    const [username, setUsername] = useState('');
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const analyzeCompetitor = async () => {
        if (!username.trim()) return;
        setIsLoading(true);
        setAnalysis(null);

        try {
            // Attempt to fetch real context if possible (scraper might hit auth wall, but worth a try for public profiles)
            let realContext = "";
            let source = "Simulation";

            try {
                // Try to guess URL based on input (simple heuristic)
                const targetUrl = username.includes('.') ? username : `instagram.com/${username.replace('@', '')}`;
                console.log('Attempting to spy on:', targetUrl);

                // We use our scraper to get what we can (meta tags, bio, public info)
                const scrapedText = await fetchWebsite(targetUrl);
                if (scrapedText && scrapedText.length > 50) {
                    realContext = `\n\nFANTISK DATA FRA PROFILEN (Bruk dette hvis relevant):\n${scrapedText.substring(0, 2000)}`;
                    source = "Live Data";
                }
            } catch (ignored) {
                console.log('Scraping failed, falling back to pure AI knowledge');
            }

            const prompt = `Du er en ekspert sosiale medier-analytiker.
Oppgave: Analyser profilen "${username}".
${realContext}

Vis dataen finnes i "FAKTISK DATA", bruk den. Hvis ikke, bruk din generelle kunnskap om denne nichen/profilen eller simuler en realistisk profil basert på brukernavnet.

Lag en strategisk analyse med:
1. Estimerte følgere (hvis ukjent, gjett basert på "vibe" eller niche)
2. Posting-frekvens
3. Topp 3 innholdstyper
4. 3 konkrete eksempler på nylige post-ideer (realistiske)
5. Strategi-oppsummering
6. 3 muligheter for forbedring/angrep

Returner KUN JSON i dette formatet:
{
  "username": "@${username}",
  "followers": "Est. 15K",
  "postingFrequency": "Daglig",
  "topContentTypes": ["Sjanger 1", "Sjanger 2", "Sjanger 3"],
  "recentPosts": ["Tittel 1...", "Tittel 2...", "Tittel 3..."],
  "strategy": "Kort beskrivelse av strategien...",
  "opportunities": ["Mulighet 1", "Mulighet 2", "Mulighet 3"]
}`;

            const result = await callAI([
                { role: 'system', content: 'Du er en JSON-maskin. Svar kun gyldig JSON.' },
                { role: 'user', content: prompt }
            ]);

            try {
                // Clean markdown code blocks if present
                const cleanResult = result.replace(/```json/g, '').replace(/```/g, '');
                const match = cleanResult.match(/\{[\s\S]*\}/);
                const parsed = JSON.parse(match ? match[0] : cleanResult);
                setAnalysis({ ...parsed, source });
            } catch (parseErr) {
                console.error('JSON Parse failed:', parseErr);
                // Fallback hardcoded if AI creates garbage
                throw new Error('Kunne ikke tolke AI-responsen');
            }
        } catch (err) {
            console.error('Analysis failed:', err);
            // Show error to user via simple alert or specific UI state, 
            // for now lets set a dummy "Error" analysis so they see something happened
            alert('Kunne ikke analysere akkurat nå. Prøv igjen.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white relative overflow-hidden sticky top-0 z-10">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Eye size={28} />
                        <div>
                            <h2 className="text-2xl font-serif italic">Competitor Spy</h2>
                            <p className="text-white/70 text-sm">Analyser hva konkurrentene gjør</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                                placeholder="brukernavn"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                                onKeyDown={(e) => e.key === 'Enter' && analyzeCompetitor()}
                            />
                        </div>
                        <button
                            onClick={analyzeCompetitor}
                            disabled={isLoading || !username.trim()}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <Search size={18} />
                            )}
                            Analyser
                        </button>
                    </div>

                    {/* Results */}
                    {analysis && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Header Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-2xl font-bold text-slate-800">{analysis.followers}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Følgere</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                                    <p className="text-lg font-bold text-slate-800">{analysis.postingFrequency}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Posting-frekvens</p>
                                </div>
                            </div>

                            {/* Content Types */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Innholdstyper</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.topContentTypes.map((type, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{type}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Posts */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Nylige poster</h4>
                                <ul className="space-y-2">
                                    {analysis.recentPosts.map((post, i) => (
                                        <li key={i} className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 flex gap-2">
                                            <span className="text-slate-400">•</span>
                                            {post}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Strategy */}
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">Strategi</h4>
                                <p className="text-sm text-amber-800">{analysis.strategy}</p>
                            </div>

                            {/* Opportunities */}
                            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Sparkles size={16} /> Dine muligheter
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.opportunities.map((opp, i) => (
                                        <li key={i} className="text-sm text-green-800 flex gap-2">
                                            <span>✓</span>
                                            {opp}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-xs text-gray-400 text-center">
                                ⚠️ {analysis.source === 'Live Data' ? 'Basert på faktisk data hentet fra nettet' : 'Dette er en AI-generert simulering (kunne ikke hente live data)'}
                            </p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!analysis && !isLoading && (
                        <div className="text-center py-8 text-gray-400">
                            <Eye className="mx-auto mb-4 opacity-30" size={48} />
                            <p>Skriv inn et brukernavn for å analysere</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompetitorSpyModal;
