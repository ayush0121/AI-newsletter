'use client';

import Link from 'next/link';
import { Article } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import CommentSection from './CommentSection';

interface ArticleCardProps {
    article: Article;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export default function ArticleCard({ article }: ArticleCardProps) {
    const { user } = useAuth();
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Use consistent formatting
    const date = format(new Date(article.published_at), 'MMM d, yyyy');

    const seed = article.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prompt = encodeURIComponent(`${article.title} abstract technology styling minimal 4k`);
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=400&nologo=true&seed=${seed}&model=flux`;

    // Reaction state (Initialize from article props)
    const [reactions, setReactions] = useState({
        fire: article.reactions_fire || 0,
        mindblown: article.reactions_mindblown || 0,
        skeptical: article.reactions_skeptical || 0
    });
    // We don't have user-specific persistence yet (MVP), so simplified local state
    const [userReaction, setUserReaction] = useState<string | null>(null);

    const handleReaction = async (type: 'fire' | 'mindblown' | 'skeptical') => {
        // Optimistic UI update
        const isRemoving = userReaction === type;
        const action = isRemoving ? 'decrement' : 'increment';

        // Update local state immediately
        setReactions(prev => {
            const newState = { ...prev };
            // If switching reaction, decrement old one
            if (userReaction && !isRemoving) {
                const oldType = userReaction as 'fire' | 'mindblown' | 'skeptical';
                newState[oldType] = Math.max(0, newState[oldType] - 1);
            }
            // Apply new action
            newState[type] = isRemoving ? Math.max(0, newState[type] - 1) : newState[type] + 1;
            return newState;
        });

        setUserReaction(isRemoving ? null : type);

        try {
            // If switching, we need two calls (decrement old, increment new) - for MVP just doing the primary action
            // To be robust, we'd ideally have a swap endpoint or handle this better. 
            // For now, let's just fire the main action for the clicked button.
            // If user clicked a DIFFERENT button, we should strictly decrement the old one too on server.

            if (userReaction && !isRemoving) {
                await fetch(`${API_URL}/articles/${article.id}/reaction?reaction_type=${userReaction}&action=decrement`, { method: 'POST' });
            }

            await fetch(`${API_URL}/articles/${article.id}/reaction?reaction_type=${type}&action=${action}`, { method: 'POST' });

        } catch (err) {
            console.error("Failed to sync reaction", err);
            // Could revert state here if strict consistency needed
        }
    };

    const handleShare = (platform: 'twitter' | 'linkedin') => {
        const text = `Check out this article: "${article.title}" 🚀\n\n${article.summary?.slice(0, 100)}...\n\nvia SynapseDigest #AI #Tech`;
        const url = encodeURIComponent(article.url);
        const encodedText = encodeURIComponent(text);

        let shareUrl = '';
        if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
        } else if (platform === 'linkedin') {
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link click

        if (!user) {
            window.location.href = '/login';
            return;
        }

        setIsBookmarking(true);
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await fetch(`${API_URL}/bookmarks/${article.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            alert('Bookmarked!'); // Simple feedback for now
        } catch (err) {
            console.error(err);
        } finally {
            setIsBookmarking(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:-translate-y-1 transition-all duration-300 group relative h-full"
        >
            <button
                onClick={handleBookmark}
                className="absolute top-3 right-3 z-10 p-2.5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-lg rounded-full shadow-md hover:text-yellow-500 hover:shadow-lg transition-all text-gray-400 dark:text-gray-500 group-hover:scale-110"
                title="Bookmark this article"
            >
                <svg className="w-5 h-5" fill={isBookmarking ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </button>
            <div className="h-48 w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Standard img tag used to avoid next.config.js domain whitelisting restart */}
                <img
                    src={imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                />
            </div>

            <div className="p-6 flex flex-col flex-grow relative z-20">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 shrink-0">
                        {article.category}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">{date}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                        {article.title}
                    </a>
                </h3>

                <div className="flex items-center space-x-2 mb-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        {article.source}
                    </span>
                    {article.viability_score > 80 && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                            🔥 Trending
                        </span>
                    )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
                    {article.summary || "No summary available."}
                </p>

                {/* Reaction Bar */}
                <div className="flex items-center space-x-2 mb-4">
                    <button
                        onClick={() => handleReaction('fire')}
                        className={`group flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${userReaction === 'fire'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-500/20'
                            : 'bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-600 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="group-active:scale-125 transition-transform inline-block">🔥</span>
                        <span>{reactions.fire}</span>
                    </button>
                    <button
                        onClick={() => handleReaction('mindblown')}
                        className={`group flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${userReaction === 'mindblown'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 ring-1 ring-purple-500/20'
                            : 'bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-600 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="group-active:scale-125 transition-transform inline-block">🤯</span>
                        <span>{reactions.mindblown}</span>
                    </button>
                    <button
                        onClick={() => handleReaction('skeptical')}
                        className={`group flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${userReaction === 'skeptical'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-500/20'
                            : 'bg-gray-50 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                    >
                        <span className="group-active:scale-125 transition-transform inline-block">🤔</span>
                        <span>{reactions.skeptical}</span>
                    </button>
                </div>

                <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-bold flex items-center group/link transition-colors"
                        >
                            Read Article
                            <svg className="w-4 h-4 ml-1.5 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors text-sm font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <span>Discuss</span>
                            </button>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white transition-colors"
                                    title="Share on X (Twitter)"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                                    title="Share on LinkedIn"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Comment Section */}
                    {showComments && (
                        <div className="animate-fade-in">
                            <CommentSection resourceId={article.id} resourceType="article" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
