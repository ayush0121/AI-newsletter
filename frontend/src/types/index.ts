export interface Article {
    id: string;
    title: string;
    url: string;
    source: string;
    summary: string; // The AI summary
    category: string;
    tags?: string[];
    viability_score: number;
    published_at: string;
    created_at: string;
}
