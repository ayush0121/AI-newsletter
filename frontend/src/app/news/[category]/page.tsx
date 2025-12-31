import Link from 'next/link'
import { format } from 'date-fns'
import ArticleCard from '@/components/ArticleCard'; // Import Shared Component
import TrendingSidebar from '@/components/TrendingSidebar';
import { Article } from '@/types';

async function getCategoryArticles(category: string): Promise<Article[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    // Mapping URL param to API param (ai -> AI)
    const catMap: Record<string, string> = {
        'ai': 'AI',
        'cs': 'CS',
        'se': 'Software Engineering',
        'research': 'Research'
    }
    const apiCat = catMap[category.toLowerCase()] || 'AI'

    try {
        const res = await fetch(`${API_URL}/articles/category/${apiCat}`, { next: { revalidate: 3600 } })
        if (!res.ok) return []
        return res.json()
    } catch (e) {
        return []
    }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params
    const catName = category.toUpperCase()
    return {
        title: `Latest ${catName} News & Research - SynapseDigest`,
        description: `Stay updated with the top ${catName} news, papers, and trends. Curated daily for engineers and researchers.`
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params
    const articles = await getCategoryArticles(category)
    const catName = category.toUpperCase()

    // Add category field if missing from API response (since we know the category context)
    const articlesWithCategory = articles.map(a => ({
        ...a,
        category: a.category || catName // Fallback to current category name if API doesn't send it
    }))

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors">
                    {catName} News Hub
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 transition-colors">
                    The latest research papers, trends, and engineering blogs in {catName}.
                </p>
            </div>

            <div className="flex gap-8 items-start">
                <div className="flex-1 min-w-0">
                    <div className="grid gap-8 lg:grid-cols-2">
                        {articlesWithCategory.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>

                    {articles.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">No articles found in this category yet.</p>
                        </div>
                    )}
                </div>

                <TrendingSidebar />
            </div>
        </div>
    )
}
