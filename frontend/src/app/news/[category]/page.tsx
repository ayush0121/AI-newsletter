import Link from 'next/link'
import { format } from 'date-fns'

interface Article {
    id: string
    title: string
    slug: string
    summary: string
    published_at: string
    source: string
}

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
        title: `Latest ${catName} News & Research - TechPulse`,
        description: `Stay updated with the top ${catName} news, papers, and trends. Curated daily for engineers and researchers.`
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params
    const articles = await getCategoryArticles(category)
    const catName = category.toUpperCase()

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {catName} News Hub
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                    The latest research papers, trends, and engineering blogs in {catName}.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {articles.map((article) => (
                    <div key={article.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-indigo-600">
                                    <Link href={`/news/${category}`} className="hover:underline">
                                        {catName}
                                    </Link>
                                </p>
                                <Link href={`/articles/${article.slug || '#'}`} className="block mt-2">
                                    <p className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                        {article.title}
                                    </p>
                                    <p className="mt-3 text-base text-gray-500 line-clamp-3">
                                        {article.summary}
                                    </p>
                                </Link>
                            </div>
                            <div className="mt-6 flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="sr-only">{article.source}</span>
                                </div>
                                <div className="">
                                    <p className="text-sm font-medium text-gray-900">
                                        {article.source}
                                    </p>
                                    <div className="flex space-x-1 text-sm text-gray-500">
                                        <time dateTime={article.published_at}>
                                            {format(new Date(article.published_at), 'MMM d, yyyy')}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
