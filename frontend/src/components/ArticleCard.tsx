import Link from 'next/link';
import { Article } from '@/types';
import { format } from 'date-fns';

interface ArticleCardProps {
    article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    // Use consistent formatting to avoid hydration mismatch
    const date = format(new Date(article.published_at), 'MMM d, yyyy');

    // Generate dynamic image URL based on title
    // Use a numeric hash of the ID for the seed to ensure uniqueness and consistency
    const seed = article.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prompt = encodeURIComponent(`${article.title} abstract technology styling minimal 4k`);
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=400&nologo=true&seed=${seed}&model=flux`;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-full group">
            <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                {/* Standard img tag used to avoid next.config.js domain whitelisting restart */}
                <img
                    src={imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{date}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">
                        {article.title}
                    </a>
                </h3>

                <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                    <span>{article.source}</span>
                    {article.viability_score > 80 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">🔥 Trending</span>
                    )}
                </div>

                <p className="text-gray-700 text-sm mb-4 flex-grow line-clamp-4">
                    {article.summary || "No summary available."}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center group/link"
                    >
                        Read Original
                        <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
