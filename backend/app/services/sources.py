import feedparser
import httpx
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class ContentFetcher:
    async def fetch_arxiv_papers(self, max_results: int = 10) -> List[Dict]:
        """
        Fetches recent papers from Arxiv for CS.AI and CS.SE.
        """
        # http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.SE&start=0&max_results=10&sortBy=submittedDate&sortOrder=desc
        base_url = "https://export.arxiv.org/api/query"
        params = {
            "search_query": "cat:cs.AI OR cat:cs.SE",
            "start": 0,
            "max_results": max_results,
            "sortBy": "submittedDate",
            "sortOrder": "desc"
        }
        
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(base_url, params=params, timeout=10.0)
                feed = feedparser.parse(response.content)
                
                papers = []
                for entry in feed.entries:
                    papers.append({
                        "title": entry.title,
                        "url": entry.id,
                        "source": "Arxiv",
                        "content": entry.summary, # Abstract
                        "published_at": entry.published
                    })
                return papers
        except Exception as e:
            logger.error(f"Error fetching Arxiv: {e}")
            return []

    async def fetch_hacker_news(self, limit: int = 10) -> List[Dict]:
        """
        Fetches top stories from Hacker News.
        """
        # HN API is firebase. items are IDs.
        # 1. Get topstories
        # 2. Get details for top N
        base_url = "https://hacker-news.firebaseio.com/v0"
        
        try:
            async with httpx.AsyncClient() as client:
                # Get Top IDs
                resp = await client.get(f"{base_url}/topstories.json", timeout=10.0)
                ids = resp.json()[:limit]
                
                stories = []
                for id in ids:
                    item_resp = await client.get(f"{base_url}/item/{id}.json", timeout=5.0)
                    item = item_resp.json()
                    
                    if item and "url" in item:
                        stories.append({
                            "title": item.get("title"),
                            "url": item.get("url"),
                            "source": "Hacker News",
                            "content": f"Hacker News discussion on: {item.get('title')}", # We don't have full text, assume title is enough for AI to guess category or need scraping.
                            # For MVP free tier without scraping, we rely on title + link. 
                            # If we want better summary, we'd need to scrape the 'url'.
                            # Let's assume title is what we have for now.
                            "published_at": item.get("time") # This is unix timestamp, needs conversion later
                        })
                return stories
                return stories
        except Exception as e:
            logger.error(f"Error fetching Hacker News: {e}")
            return []

    async def fetch_rss_feeds(self, feed_urls: List[str]) -> List[Dict]:
        """
        Fetches and parses multiple RSS feeds.
        """
        all_articles = []
        async with httpx.AsyncClient(follow_redirects=True) as client:
            for url in feed_urls:
                try:
                    # Some RSS feeds block simple requests, might need User-Agent
                    response = await client.get(url, timeout=10.0, headers={"User-Agent": "SynapseDigest/1.0"})
                    feed = feedparser.parse(response.content)
                    
                    for entry in feed.entries[:10]: # Limit to top 10 most recent per feed
                        # Normalize fields
                        # Published date parsing can be tricky; feedparser usually gives 'published_parsed' (struct_time)
                        # We will let the ingestion service handle normalization of 'published' string or fallback.
                        
                        all_articles.append({
                            "title": entry.title,
                            "url": entry.link,
                            "source": feed.feed.title if 'title' in feed.feed else "RSS Feed",
                            "content": entry.summary if 'summary' in entry else entry.description if 'description' in entry else "", 
                            "published_at": entry.published if 'published' in entry else None
                        })
                except Exception as e:
                    logger.error(f"Error fetching RSS {url}: {e}")
                    continue
        
        return all_articles

fetcher = ContentFetcher()
