import React, { useState, useEffect } from 'react';
import { Flame, Zap, Cloud } from 'lucide-react';
import { scorePostForAlgorithm, type AlgorithmScore } from '../services/algorithmGuide';

interface PostScoreBadgeProps {
    postText: string;
    onScoreCalculated?: (score: number) => void;
}

// Cache for scores to avoid re-calculating
const scoreCache = new Map<string, AlgorithmScore>();

const PostScoreBadge: React.FC<PostScoreBadgeProps> = ({ postText, onScoreCalculated }) => {
    const [score, setScore] = useState<AlgorithmScore | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Create a hash of the post text for caching
    const postHash = postText.slice(0, 100) + postText.length;

    useEffect(() => {
        // Check cache first
        if (scoreCache.has(postHash)) {
            const cached = scoreCache.get(postHash)!;
            setScore(cached);
            onScoreCalculated?.(cached.overall);
            return;
        }

        // Don't calculate for very short posts
        if (postText.length < 20) {
            const defaultScore: AlgorithmScore = {
                overall: 50,
                factors: { likeability: 50, replyPotential: 50, shareability: 50, dwellTime: 50, hookStrength: 50 },
                tips: ['Post er for kort til å score.']
            };
            setScore(defaultScore);
            return;
        }

        // Use local algorithm scoring (instant, no API call)
        const calculated = scorePostForAlgorithm(postText);
        scoreCache.set(postHash, calculated);
        setScore(calculated);
        onScoreCalculated?.(calculated.overall);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postText]);

    if (!score) return null;

    const getScoreConfig = (overall: number) => {
        if (overall >= 80) return {
            icon: Flame,
            color: 'text-green-600 bg-green-50 border-green-200',
            label: 'Sterk'
        };
        if (overall >= 60) return {
            icon: Zap,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            label: 'OK'
        };
        return {
            icon: Cloud,
            color: 'text-gray-500 bg-gray-50 border-gray-200',
            label: 'Svak'
        };
    };

    const config = getScoreConfig(score.overall);
    const Icon = config.icon;

    return (
        <div className="relative">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold transition-all hover:scale-105 ${config.color}`}
                title="Klikk for detaljer"
            >
                <Icon size={12} />
                <span>{score.overall}</span>
            </button>

            {/* Details popup */}
            {showDetails && (
                <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-64 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-gray-800">Algoritme-Score</span>
                        <span className={`text-lg font-bold ${score.overall >= 80 ? 'text-green-600' : score.overall >= 60 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {score.overall}/100
                        </span>
                    </div>
                    <div className="space-y-2">
                        <ScoreBar label="Likeability" value={score.factors.likeability} />
                        <ScoreBar label="Reply-potensial" value={score.factors.replyPotential} />
                        <ScoreBar label="Delbarhet" value={score.factors.shareability} />
                        <ScoreBar label="Dwell time" value={score.factors.dwellTime} />
                        <ScoreBar label="Hook" value={score.factors.hookStrength} />
                    </div>
                    {score.tips.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 mb-1">Tips:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                {score.tips.slice(0, 3).map((tip, i) => (
                                    <li key={i} className="flex gap-1">
                                        <span>•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Click outside to close */}
            {showDetails && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDetails(false)}
                />
            )}
        </div>
    );
};

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
    const getColor = (v: number) => {
        if (v >= 80) return 'bg-green-500';
        if (v >= 60) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-20">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${getColor(value)}`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="text-xs font-mono text-gray-600 w-8 text-right">{value}</span>
        </div>
    );
};

export default PostScoreBadge;
