import os
import sys
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup Environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir) 

from app.core.config import settings
from app.db.models import Article

def slugify(text: str) -> str:
    """
    Simple slugify function:
    1. Lowercase
    2. Replace non-alphanumeric with hyphens
    3. Strip leading/trailing hyphens
    """
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def backfill_slugs():
    url = settings.DATABASE_URL
    if "postgresql://" in url:
        url = url.replace("postgresql://", "postgresql+psycopg://")
    
    print(f"Connecting to DB...")
    engine = create_engine(url)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    
    try:
        articles = session.query(Article).filter(Article.slug == None).all()
        print(f"Found {len(articles)} articles without slugs.")
        
        count = 0
        for article in articles:
            original_slug = slugify(article.title)
            slug = original_slug
            
            # Ensure uniqueness (simple retry logic)
            # In a real heavy production app, we'd check DB. 
            # Here uniqueness constraint might fail on commit if collision.
            # Let's check collision for safety.
            collision = session.query(Article).filter(Article.slug == slug).first()
            counter = 1
            while collision:
                slug = f"{original_slug}-{counter}"
                collision = session.query(Article).filter(Article.slug == slug).first()
                counter += 1
            
            article.slug = slug
            count += 1
            
        session.commit()
        print(f"Successfully backfilled {count} slugs.")
        
    except Exception as e:
        print(f"Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    backfill_slugs()
