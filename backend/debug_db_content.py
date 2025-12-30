import sys
import os
from sqlalchemy import text
import logging

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def inspect_db():
    db = SessionLocal()
    try:
        logger.info("--- Inspecting Articles Table ---")
        result = db.execute(text("SELECT id, title, published_at, category FROM articles ORDER BY published_at DESC LIMIT 20;"))
        rows = result.fetchall()
        
        if not rows:
            logger.warning("TABLE IS EMPTY! No articles found.")
        else:
            print(f"{'Published At':<30} | {'Category':<15} | {'Title'}")
            print("-" * 80)
            for row in rows:
                print(f"{str(row.published_at):<30} | {row.category:<15} | {row.title[:50]}...")
                
    except Exception as e:
        logger.error(f"Error inspecting DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_db()
