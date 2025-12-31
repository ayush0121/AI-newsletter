'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import { useAuth } from '@/context/AuthProvider';
import { fetchPersonalizedArticles } from '@/lib/api';
import Link from 'next/link';

interface FeedTabsProps {
    articlesToday: Article[];
    articlesTrending: Article[];
}

export default function FeedTabs({ articlesToday, articlesTrending }: FeedTabsProps) {
    const [activeTab, setActiveTab] = useState<'today' | 'foryou' | 'trending'>('today');
    const { user, token } = useAuth();

    const [personalizedArticles, setPersonalizedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetchedForYou, setHasFetchedForYou] = useState(false);

    useEffect(() => {
        if (activeTab === 'foryou' && user && token && !hasFetchedForYou) {
            loadPersonalized();
        }
    }, [activeTab, user, token]);

    const loadPersonalized = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchPersonalizedArticles(token);
            setPersonalizedArticles(data);
            setHasFetchedForYou(true);
        } catch (e: any) {
            console.error("Failed to load personalized feed", e);
            setError(e.message || "Could not load feed.");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'today', label: "Today's Highlights", count: articlesToday.length },
        { id: 'foryou', label: "For You", count: user ? (hasFetchedForYou ? personalizedArticles.length : undefined) : undefined },
        { id: 'trending', label: "Trending", count: articlesTrending.length }
    ];

    return (
        <section className="space-y-8">
            {/* Tabs Header */}
            <div className="flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
                {activeTab === 'today' && (
                    articlesToday.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-300">No new articles found today (yet).</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                            {articlesToday.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'trending' && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                        {articlesTrending.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}

                {activeTab === 'foryou' && (
                    <div className="animate-fade-in">
                        {!user ? (
                            <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-dashed border-indigo-200 dark:border-gray-600">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Personalize your feed</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                                    Login to see stories curated just for your interests (AI, Engineering, etc).
                                </p>
                                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30">
                                    Login / Sign Up
                                </Link>
                            </div>
                        ) : loading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500">
                                {error}
                            </div>
                        ) : personalizedArticles.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No articles matched your interests ({((user as any)?.interests || (user as any)?.user_metadata?.interests || []).join(", ")}).
                                </p>
                                <Link
                                    href="/onboarding"
                                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline mt-2"
                                >
                                    Customize your interests &rarr;
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {personalizedArticles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
