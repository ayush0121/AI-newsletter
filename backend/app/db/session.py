from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# For async support we would use create_async_engine but keeping it simple/sync for MVP 
# unless we strictly need high concurrency. Given the requirements, sync is fine for most parts, 
# but FastAPI is async native. Let's use standard sync engine for simplicity with SQLModel or SQLAlchemy 
# generic setup, or upgrade to async if needed. Sticking to standard SQLAlchemy sync for simplicity in MVP scripts.

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Handle potential difference in postgres protocol string
# Handle potential difference in postgres protocol string
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
