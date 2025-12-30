from app.db.session import SessionLocal
from app.db.models import Article
from datetime import datetime, timedelta

from app.core.config import settings

print(f"DB URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'LOCAL'}")

db = SessionLocal()
count = db.query(Article).count()
print(f"Total Articles: {count}")

recent = db.query(Article).filter(Article.published_at >= datetime.now() - timedelta(hours=48)).count()
print(f"Articles in last 48h: {recent}")

# Print sample
latest = db.query(Article).order_by(Article.published_at.desc()).first()

# Manual Insert Test
try:
    test_article = Article(
        title="Test Article Manual",
        slug=f"test-manual-{datetime.now().timestamp()}",
        url="http://example.com/manual",
        source="Manual Test",
        summary="This is a test.",
        published_at=datetime.now(),
        is_processed=True
    )
    db.add(test_article)
    db.commit()
    print("Manual insert successful.")
except Exception as e:
    print(f"Manual insert failed: {e}")
    db.rollback()

count = db.query(Article).count()
print(f"Total Articles after insert: {count}")

db.close()
