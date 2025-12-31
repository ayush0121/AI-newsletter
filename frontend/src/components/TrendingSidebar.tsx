'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import VoicesSidebar from './VoicesSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Article {
    id: string;
    title: string;
    description: string;
    url: string;
    published_at: string;
    source: string;
    category: string;
    slug: string;
    // We might need comment_count from API if we want to display it, 
    // but the current ArticleSchema might not have it. 
    // For now we just show "Trending 🔥" label.
}

export default function TrendingSidebar() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/v1/articles/trending?limit=5`)
            .then(res => res.json())
            .then(data => {
                setArticles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch trending", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="w-80 hidden xl:block flex-shrink-0">
                <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // if (articles.length === 0) return null; // Removed to allow VoicesSidebar to show

    return (
        <div className="w-80 hidden xl:block flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
            <div className="sticky top-24">
                {articles.length > 0 && (
                    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden mb-8">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                                <span className="text-xl">📈</span> Trending Now
                            </h3>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {articles.map((article, index) => (
                                <Link
                                    key={article.id}
                                    href={`/article/${article.slug}`}
                                    className="block p-4 hover:bg-white dark:hover:bg-gray-800 transition-colors group relative"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-orange-500 transition-colors" />
                                    <div className="flex gap-3">
                                        <span className="text-2xl font-bold text-gray-300 dark:text-gray-700 group-hover:text-orange-500/50 transition-colors">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                {article.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{article.source}</span>
                                                <span>•</span>
                                                <span>{formatDistanceToNow(new Date(article.published_at))} ago</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {/* Mini Footer / Call to Action */}
                        <Link href="/#daily-poll">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Vote on Daily Polls →</p>
                            </div>
                        </Link>
                    </div>
                )}


                <VoicesSidebar />
            </div>
        </div>
    );
}
