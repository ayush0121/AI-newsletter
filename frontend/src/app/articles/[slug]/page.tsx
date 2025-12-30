import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface Article {
    id: string
    title: string
    slug: string
    summary: string
    source: string
    published_at: string
    category: string
    url: string
}

async function getArticle(slug: string): Promise<Article | null> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    try {
        // We need an endpoint to fetch by slug. 
        // Currently we don't have one, so we need to add GET /articles/{slug} in backend.
        // For now, assuming it exists.
        const res = await fetch(`${API_URL}/articles/slug/${slug}`, { next: { revalidate: 3600 } })
        if (!res.ok) return null
        return res.json()
    } catch (e) {
        return null
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const article = await getArticle(params.slug)
    if (!article) return { title: 'Not Found' }

    return {
        title: `${article.title} - TechPulse`,
        description: article.summary.slice(0, 160),
        openGraph: {
            title: article.title,
            description: article.summary.slice(0, 160),
            type: 'article',
            publishedTime: article.published_at,
        }
    }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
    const article = await getArticle(params.slug)

    if (!article) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <nav className="text-sm text-gray-500 mb-8">
                <Link href="/" className="hover:underline">Home</Link> &gt; {' '}
                <Link href={`/news/${article.category.toLowerCase()}`} className="hover:underline">{article.category}</Link> &gt; {' '}
                <span className="text-gray-900 truncate">{article.title}</span>
            </nav>

            <article className="prose lg:prose-xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{article.title}</h1>

                <div className="flex items-center text-sm text-gray-500 mb-8">
                    <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium mr-4">
                        {article.category}
                    </span>
                    <time dateTime={article.published_at}>
                        {format(new Date(article.published_at), 'MMMM d, yyyy')}
                    </time>
                    <span className="mx-2">•</span>
                    <span>{article.source}</span>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {article.summary}
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Read Full Original Article &rarr;
                    </a>
                </div>
            </article>
        </div>
    )
}
