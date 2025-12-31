import { Article } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchArticlesToday(): Promise<Article[]> {
    // force-cache by default or 'no-store' for real-time. Since content updates daily, 1 hour revalidate is good.
    const res = await fetch(`${API_URL}/articles/today`, { cache: 'no-store' });

    if (!res.ok) {
        // If backend is down, return empty or throw? 
        // Throwing allows Error Boundary to catch.
        console.error("Failed to fetch articles/today");
        throw new Error('Failed to fetch articles');
    }
    return res.json();
}

export async function fetchArticlesByCategory(category: string): Promise<Article[]> {
    const res = await fetch(`${API_URL}/articles/category/${category}`, { cache: 'no-store' });
    if (!res.ok) {
        console.error(`Failed to fetch category ${category}`);
        throw new Error('Failed to fetch articles');
    }
    return res.json();
}

export async function fetchTrendingArticles(): Promise<Article[]> {
    const res = await fetch(`${API_URL}/articles/trending`, { cache: 'no-store' });
    if (!res.ok) {
        console.error("Failed to fetch trending");
        throw new Error('Failed to fetch trending');
    }
    return res.json();
}

export async function fetchArticles(page: number = 1, limit: number = 20): Promise<Article[]> {
    const skip = (page - 1) * limit;
    // ensure no-store to pick up latest
    const res = await fetch(`${API_URL}/articles?skip=${skip}&limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('Failed to fetch articles');
    }
    return res.json();
}
