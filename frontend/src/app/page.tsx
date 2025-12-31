import Link from 'next/link';
import { fetchArticlesToday, fetchTrendingArticles, fetchArticlesByCategory } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import NewsletterForm from '@/components/NewsletterForm';
import DailyPoll from '@/components/DailyPoll';
import FeedTabs from '@/components/FeedTabs';
import TrendingSidebar from '@/components/TrendingSidebar';
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">{title}</h2>
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
      <div className="text-center py-8 md:py-12 space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors">
          Changing minds with latest news
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
          in the <span className="text-indigo-600 dark:text-indigo-400 font-semibold">AI</span> and <span className="text-purple-600 dark:text-purple-400 font-semibold">Software Engineering</span> field
        </p>
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
          <NewsletterForm />
          <div className="w-full">
            <DailyPoll />
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Main Feed Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-12">
            <FeedTabs articlesToday={articlesToday} articlesTrending={articlesTrending} />
          </div>

          {renderSection("Artificial Intelligence", articlesAI, "/news/ai")}
          {renderSection("Computer Science", articlesCS, "/news/cs")}
          {renderSection("Software Engineering", articlesSE, "/news/se")}
          {renderSection("Research Papers", articlesResearch, "/news/research")}
        </div>

        {/* Sidebar (Desktop Only) */}
        <TrendingSidebar />
      </div>
    </div>
  );
}
