'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

interface Quote {
    id: string;
    text: string;
    author: string;
    role: string;
    avatar_url: string;
}

export default function VoicesSidebar() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch(`${API_URL}/quotes/daily`)
            .then(res => res.json())
            .then(data => {
                setQuotes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch quotes", err);
                setLoading(false);
            });
    }, []);

    const handleImageError = (id: string) => {
        setFailedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    };

    if (loading) return null; // Or skeleton
    if (quotes.length === 0) return null;

    return (
        <div className="mt-8 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                        <span className="text-xl">🎙️</span> Voices of Tech
                    </h3>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {quotes.map((quote) => (
                        <div key={quote.id} className="p-5 hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-4 leading-relaxed font-serif">
                                "{quote.text}"
                            </p>
                            <div className="flex items-center gap-3">
                                {quote.avatar_url && !failedImages.has(quote.id) && (
                                    <img
                                        src={quote.avatar_url}
                                        alt={quote.author}
                                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                        onError={() => handleImageError(quote.id)}
                                    />
                                )}
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                        {quote.author}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {quote.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
