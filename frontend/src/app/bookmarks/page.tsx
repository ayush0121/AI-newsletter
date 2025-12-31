'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function BookmarksPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchBookmarks();
        }
    }, [user, loading, router]);

    const fetchBookmarks = async () => {
        try {
            // Quick hack: getting session token is tricky here without the supabase client instance from context
            // But actually useAuth might provide session? 
            // Let's rely on the browser cookie if setup? No, usually Bearer token.

            // Re-approach: We need the JWT. The `useAuth` user object is Supabase User.
            // We should get the session. 
            // For now, let's assume we can get it from localStorage or we need to expose helper.

            // Standard Supabase pattern:
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) return;

            const res = await fetch(`${API_URL}/bookmarks/`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setBookmarks(data);
            }
        } catch (error) {
            console.error("Failed to fetch bookmarks", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                    Saved Bookmarks
                </h1>
                <p className="mt-2 text-gray-600">
                    Your collection of saved articles.
                </p>
            </div>

            {bookmarks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start saving articles to read them later.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookmarks.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}
        </div>
    );
}
