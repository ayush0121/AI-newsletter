'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CommentSection from './CommentSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

interface PollOption {
    id: string;
    text: string;
    votes: number;
}

interface Poll {
    id: string;
    question: string;
    options: PollOption[];
}

export default function DailyPoll() {
    const [poll, setPoll] = useState<Poll | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [userVoteOption, setUserVoteOption] = useState<string | null>(null);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPoll();
    }, []);

    const fetchPoll = async () => {
        try {
            const res = await fetch(`${API_URL}/polls/daily`);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();

            if (data) {
                setPoll(data);
                const total = data.options.reduce((acc: number, opt: PollOption) => acc + (opt.votes || 0), 0);
                setTotalVotes(total);

                const votedId = localStorage.getItem('daily_poll_voted');
                if (votedId === data.id) {
                    setHasVoted(true);
                    // Try to recover which option they voted for
                    const savedOption = localStorage.getItem('daily_poll_vote_option');
                    if (savedOption) setUserVoteOption(savedOption);
                }
            }
        } catch (e: any) {
            console.error("Poll fetch failed:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (optionId: string) => {
        if (!poll || hasVoted) return;

        const selectedOption = poll.options.find(o => o.id === optionId);

        // Optimistic update
        setHasVoted(true);
        setUserVoteOption(selectedOption?.text || null);
        setTotalVotes(prev => prev + 1);
        setPoll(prev => {
            if (!prev) return null;
            return {
                ...prev,
                options: prev.options.map(opt =>
                    opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
                )
            };
        });

        // Persist local
        localStorage.setItem('daily_poll_voted', poll.id);
        if (selectedOption) {
            localStorage.setItem('daily_poll_vote_option', selectedOption.text);
        }

        try {
            await fetch(`${API_URL}/polls/${poll.id}/vote?option_id=${optionId}`, {
                method: 'POST'
            });
        } catch (e) {
            console.error("Vote failed", e);
        }
    };

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                Poll Error: {error}
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Loading daily poll...</div>;
    if (!poll) return <div className="p-8 text-center text-gray-400">No active poll today.</div>;

    return (
        <motion.div
            id="daily-poll"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-900/50 p-6 md:p-8 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
            </div>

            <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    Daily Poll
                </span>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {poll.question}
                </h3>

                <div className="space-y-3">
                    {poll.options.map((option) => {
                        const percent = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;

                        return (
                            <div key={option.id} className="relative">
                                {hasVoted ? (
                                    <div className="relative h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="absolute top-0 left-0 h-full bg-indigo-100 dark:bg-indigo-900/40 border-r-2 border-indigo-500/50"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-between px-4">
                                            <span className="font-medium text-gray-900 dark:text-gray-100 z-10">{option.text}</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 z-10">{percent}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleVote(option.id)}
                                        className="w-full text-left px-4 py-3 rounded-lg border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        {option.text}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {hasVoted && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 animate-fade-in">
                        Thanks for voting! {totalVotes.toLocaleString()} votes cast today.
                    </p>
                )}

                {/* Debate Section using generic component */}
                <CommentSection resourceId={poll.id} resourceType="poll" userVote={userVoteOption} />
            </div>
        </motion.div>
    );
}
