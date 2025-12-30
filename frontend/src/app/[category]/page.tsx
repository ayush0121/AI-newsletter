import { fetchArticlesByCategory } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';

interface PageProps {
    params: Promise<{
        category: string;
    }>;
}

// Generate metadata dynamically
export async function generateMetadata({ params }: PageProps) {
    const { category } = await params;
    const categoryName = decodeURIComponent(category).replace('-', ' ');
    return {
        title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} News - TechPulse`,
    };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;

    // Mapping URL slug to API category params might be needed here or in API lib
    // Let's pass slug directly to API lib and handle mapping there or in backend
    // For now, assuming backend handles 'ai', 'computer-science' etc.

    let articles: Article[] = [];
    try {
        articles = await fetchArticlesByCategory(category);
    } catch (e) {
        console.error(e);
        // If error (e.g. invalid category), maybe return empty or 404
    }

    const displayTitle = category.replace(/-/g, ' ');

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 capitalize">{displayTitle} Updates</h1>

            {articles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No articles found in this category.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}
        </div>
    );
}
