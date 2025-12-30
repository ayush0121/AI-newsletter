import Link from 'next/link';
import { fetchArticles } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';

export const dynamic = 'force-dynamic';

export default async function ArchivePage({
    searchParams,
}: {
    searchParams: { page?: string };
}) {
    const currentPage = Number(searchParams.page) || 1;
    const articles = await fetchArticles(currentPage, 24);

    return (
        <div className="space-y-12">
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">News Archive</h1>
                        <p className="text-gray-500 mt-2">Browse past editions and older stories.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-12 flex justify-center items-center space-x-6">
                    {currentPage > 1 && (
                        <Link
                            href={`/archive?page=${currentPage - 1}`}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            &larr; Previous
                        </Link>
                    )}

                    <span className="text-sm text-gray-500 font-medium">Page {currentPage}</span>

                    {/* Naive "Next" check: if we got a full page, assume there's more. Ideally backend sends count. */}
                    {articles.length === 24 && (
                        <Link
                            href={`/archive?page=${currentPage + 1}`}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Next &rarr;
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
