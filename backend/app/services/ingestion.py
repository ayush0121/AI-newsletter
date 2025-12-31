import logging
import asyncio
from datetime import datetime

# Shim cgi for Python 3.13+ (feedparser dependency)
import sys
try:
    import cgi
except ImportError:
    import types
    import email.message

    def parse_header(line):
        if not line: return "", {}
        m = email.message.Message()
        m['Content-Type'] = line
        return m.get_content_type(), dict(m.get_params() or [])

    cgi = types.ModuleType("cgi")
    cgi.parse_header = parse_header
    sys.modules["cgi"] = cgi

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Article, IngestionLog
from app.services.sources import fetcher
from app.services.ai import ai_service

logger = logging.getLogger(__name__)

class IngestionService:
    def __init__(self, db: Session):
        self.db = db

    async def run_pipeline(self):
        logger.info("Starting ingestion pipeline...")
        log_entry = IngestionLog(status="PARTIAL")
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)

        try:
            # 1. Fetch from sources
            arxiv_data = await fetcher.fetch_arxiv_papers(max_results=10)
            hn_data = await fetcher.fetch_hacker_news(limit=10)
            
            # Generic RSS Feeds (Tech, AI, Eng)
            rss_urls = [
                "https://techcrunch.com/category/artificial-intelligence/feed/",
                "https://www.theverge.com/rss/index.xml",
                "https://openai.com/blog/rss.xml"
            ]
            rss_data = await fetcher.fetch_rss_feeds(rss_urls)
            
            all_raw_articles = arxiv_data + hn_data + rss_data
            new_articles_count = 0
            
            for raw in all_raw_articles:
                # 2. Check deduplication
                exists = self.db.query(Article).filter(Article.url == raw['url']).first()
                if exists:
                    continue
                
                # 3. AI Processing
                logger.info(f"Processing new article: {raw['title']}")

                try:
                    ai_result = ai_service.process_article(raw['title'], raw['content'])
                    
                    # 4. Normalization
                    pub_date = raw.get('published_at')
                    if isinstance(pub_date, int):
                        published_at = datetime.fromtimestamp(pub_date)
                    else:
                        published_at = datetime.now() 
                    
                    # Slugify
                    import re
                    slug_base = raw['title'].lower()
                    slug_base = re.sub(r'[^a-z0-9]+', '-', slug_base).strip('-')
                    if len(slug_base) > 200:
                        slug_base = slug_base[:200]
                    
                    # Check for duplicate slug
                    existing_slug = self.db.query(Article).filter(Article.slug == slug_base).first()
                    if existing_slug:
                            # Append hash to make unique
                            slug_base = f"{slug_base}-{hash(raw['url']) % 10000}"
                    
                    # Simple Mode: Instant

                    article = Article(
                        title=raw['title'],
                        slug=slug_base,
                        url=raw['url'],
                        source=raw['source'],
                        summary=ai_result.get('summary'),
                        original_snippet=raw['content'][:500] if raw.get('content') else None,
                        category=ai_result.get('category'),
                        viability_score=ai_result.get('viability_score'),
                        published_at=published_at,
                        is_processed=True
                    )
                    
                    self.db.add(article)
                    self.db.commit() # Commit individually
                    new_articles_count += 1
                except Exception as loop_e:
                    logger.error(f"Failed to process article {raw['title']}: {loop_e}")
                    self.db.rollback()
                    continue
            
                    self.db.commit() # Commit individually
                    new_articles_count += 1
                except Exception as loop_e:
                    logger.error(f"Failed to process article {raw['title']}: {loop_e}")
                    self.db.rollback()
                    continue
            
            # 6. Extract Quotes from Interviews/Speeches (Updated Feature)
            # Scan the newly processed raw articles for quote-worthy content
            logger.info("Scanning for quotes...")
            keywords = ["interview", "speech", "talk", "says", "warns", "predicts", "statement", "keynote"]
            from app.db.models import Quote
            
            for raw in all_raw_articles:
                # Basic filter to save tokens
                text_to_scan = raw['title'].lower()
                if any(k in text_to_scan for k in keywords):
                    try:
                        # Use full content if available, else snippet
                        content_scan = raw.get('content') or raw.get('summary') or raw['title']
                        quote_data = ai_service.extract_quote(content_scan)
                        
                        if quote_data and quote_data.get('found'):
                            # Check duplicate text
                            exists = self.db.query(Quote).filter(Quote.text == quote_data['text']).first()
                            if not exists:
                                # Fallback avatar logic -> Wiki or None (frontend handles fallbacks)
                                q = Quote(
                                    text=quote_data['text'],
                                    author=quote_data['author'],
                                    role=quote_data.get('role'),
                                    source_url=raw['url']
                                )
                                self.db.add(q)
                                self.db.commit()
                                logger.info(f"Extracted Quote from {quote_data['author']}")
                    except Exception as e:
                        logger.error(f"Quote extraction failed for {raw['title']}: {e}")

            # 5. Generate Daily Poll if new articles were added (or even if not, to keep it fresh based on feed)
            if new_articles_count > 0 or len(all_raw_articles) > 0:
                logger.info("Generating Daily Poll...")
                try:
                    # Context from top 5 articles
                    context_articles = all_raw_articles[:5]
                    context_text = "\n".join([f"- {a['title']}: {a.get('content', '')[:100]}..." for a in context_articles])
                    
                    poll_data = ai_service.generate_poll(context_text)
                    
                    if poll_data:
                        from app.db.models import Poll
                        # Deactivate old polls
                        self.db.query(Poll).update({Poll.is_active: False})
                        
                        # Create new poll
                        new_poll = Poll(
                            question=poll_data.get("question", "What is the most exciting tech today?"),
                            options=poll_data.get("options", []),
                            is_active=True
                        )
                        self.db.add(new_poll)
                        self.db.commit()
                        logger.info(f"Created new Daily Poll: {new_poll.question}")
                except Exception as poll_e:
                    logger.error(f"Failed to generate daily poll: {poll_e}")
                    # Don't fail the whole job
            
            # Update Log
            log_entry.status = "SUCCESS"
            log_entry.articles_added = new_articles_count
            self.db.commit() # Commit log
            logger.info(f"Ingestion complete. Added {new_articles_count} articles.")

        except Exception as e:
            logger.error(f"Ingestion failed: {e}")
            self.db.rollback()
            log_entry.status = "FAILURE"
            log_entry.errors = str(e)
            self.db.commit()

async def run_ingestion_job():
    db = SessionLocal()
    try:
        service = IngestionService(db)
        await service.run_pipeline()
    finally:
        db.close()

if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_ingestion_job())
