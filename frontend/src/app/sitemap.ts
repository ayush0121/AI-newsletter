import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    const BASE_URL = 'https://techpulse.dev' // Replace with actual domain

    // 1. Static Routes
    const routes = [
        '',
        '/news',
        '/news/ai',
        '/news/cs',
        '/news/se',
        '/news/research',
        '/signup',
        '/login',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Articles
    let articles = []
    try {
        const res = await fetch(`${API_URL}/articles/sitemap-data`, { next: { revalidate: 3600 } })
        if (res.ok) {
            const data = await res.json()
            articles = data.map((a: any) => ({
                url: `${BASE_URL}/articles/${a.slug}`,
                lastModified: a.last_modified,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }))
        }
    } catch (e) {
        console.error("Sitemap generation failed", e)
    }

    return [...routes, ...articles]
}
