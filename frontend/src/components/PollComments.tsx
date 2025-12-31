'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Comment {
    id: string;
    content: string;
    user_name: string;
    vote_option?: string;
    created_at: string;
}

interface PollCommentsProps {
    pollId: string;
    userVote?: string | null; // "opt_1" or "opt_2"
}

export default function PollComments({ pollId, userVote }: PollCommentsProps) {
    const { user, token } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch comments
    useEffect(() => {
        if (!pollId) return;
        fetchComments();
    }, [pollId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/v1/polls/${pollId}/comments`);
            if (!res.ok) throw new Error('Failed to load comments');
            const data = await res.json();
            setComments(data);
        } catch (e) {
            console.error(e);
            setError("Could not load the debate.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !token) return;

        try {
            setPosting(true);
            const res = await fetch(`${API_URL}/api/v1/polls/${pollId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Failed to post comment');
            }

            const savedComment = await res.json();

            // Add to list immediately (optimistic update-ish)
            setComments([savedComment, ...comments]);
            setNewComment('');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Debate Floor 🗣️
            </h3>

            {/* Input Area */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={userVote ? "Tell us why you voted that way..." : "Cast your vote to join the debate!"}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[80px]"
                                disabled={posting}
                            />
                            {userVote && (
                                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                    Posting as <span className="font-semibold">{(user as any).user_metadata?.full_name || 'Anonymous'}</span>
                                    (Voted: <span className="text-indigo-600 dark:text-indigo-400">{userVote}</span>)
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || posting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {posting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Login to join the conversation and share your opinion.
                    </p>
                    <Link href="/login" className="inline-block bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-semibold py-2 px-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Login / Sign Up
                    </Link>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 italic">
                    No comments yet. Be the first to start the debate!
                </p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {comment.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {comment.user_name}
                                    </span>
                                    {comment.vote_option && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                            Voted {comment.vote_option}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        • {formatDistanceToNow(new Date(comment.created_at))} ago
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
