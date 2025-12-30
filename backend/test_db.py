import sys
import os
import logging
from sqlalchemy import text

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_connection():
    logger.info("--- Testing Database Connection ---")
    
    # Print masked URL to verify config loading
    url = str(engine.url)
    masked_url = url.replace(url.split(':')[2].split('@')[0], "******") if ':' in url and '@' in url else url
    logger.info(f"Connecting to: {masked_url}")

    try:
        db = SessionLocal()
        logger.info("Session created. Executing query...")
        
        # specific for postgres to check version
        result = db.execute(text("SELECT version();")).scalar()
        
        logger.info(f"Connection Successful! DB Version: {result}")
        db.close()
    except Exception as e:
        logger.error(f"Connection Failed: {e}")

if __name__ == "__main__":
    test_connection()
