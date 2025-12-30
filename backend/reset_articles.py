import sys
import os
import logging
from sqlalchemy import text

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_articles():
    logger.info("--- Clearing Articles Table ---")
    db = SessionLocal()
    try:
        # Delete all articles
        db.execute(text("TRUNCATE TABLE articles CASCADE;"))
        db.commit()
        logger.info("Successfully deleted all articles.")
    except Exception as e:
        logger.error(f"Failed to clear articles: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_articles()
