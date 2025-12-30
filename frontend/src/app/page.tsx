import Link from 'next/link';
import { fetchArticlesToday, fetchTrendingArticles, fetchArticlesByCategory } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { Article } from '@/types';

// Revalidate every hour
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Parallel data fetching
  const todayPromise = fetchArticlesToday();
  const trendingPromise = fetchTrendingArticles();

  const aiPromise = fetchArticlesByCategory('ai');
  const csPromise = fetchArticlesByCategory('cs');
  const sePromise = fetchArticlesByCategory('se');
  const researchPromise = fetchArticlesByCategory('research');

  const [
    articlesToday,
    articlesTrending,
    articlesAI,
    articlesCS,
    articlesSE,
    articlesResearch
  ] = await Promise.all([
    todayPromise.catch(e => { console.error("Today Error:", e); return []; }),
    trendingPromise.catch(e => { console.error("Trending Error:", e); return []; }),
    aiPromise.catch(e => { console.error("AI Error:", e); return []; }),
    csPromise.catch(e => { console.error("CS Error:", e); return []; }),
    sePromise.catch(e => { console.error("SE Error:", e); return []; }),
    researchPromise.catch(e => { console.error("Research Error:", e); return []; }),
  ]);

  const renderSection = (title: string, articles: Article[], link?: string) => {
    if (articles.length === 0) return null;
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {link && (
            <Link href={link} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All &rarr;
            </Link>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-16">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Today's Highlights</h2>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
        </div>

        {articlesToday.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No new articles found today (yet).</p>
            <p className="text-sm text-gray-400 mt-1">Check back later after the daily ingestion runs.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articlesToday.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {articlesTrending.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending this Week</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articlesTrending.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {renderSection("Artificial Intelligence", articlesAI, "/news/ai")}
      {renderSection("Computer Science", articlesCS, "/news/cs")}
      {renderSection("Software Engineering", articlesSE, "/news/se")}
      {renderSection("Research Papers", articlesResearch, "/news/research")}
    </div>
  );
}
