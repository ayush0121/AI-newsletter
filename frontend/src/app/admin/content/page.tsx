'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function AdminContentPage() {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    async function fetchArticles() {
        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token

        const res = await fetch(`${API_URL}/admin/articles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            setArticles(await res.json())
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchArticles()
    }, [])

    async function deleteArticle(id: string) {
        if (!confirm("Are you sure? This will hide the article.")) return

        const session = await supabase.auth.getSession()
        const token = session.data.session?.access_token

        const res = await fetch(`${API_URL}/admin/articles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (res.ok) {
            // Remove from local state
            setArticles(articles.filter(a => a.id !== id))
        } else {
            alert('Failed to delete')
        }
    }

    if (loading) return <div className="p-8">Loading content...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Content Moderation</h2>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {articles.map((a) => (
                            <tr key={a.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{a.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {a.source}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {a.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(a.created_at), 'MMM d, HH:mm')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => deleteArticle(a.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
