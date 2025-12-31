from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Automated AI & Software News Aggregator API",
)

# Configure logging to file
import logging
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Set all CORS enabled origins
# In development, we want to start with a permissive policy to avoid "Failed to fetch" errors.
# If settings.BACKEND_CORS_ORIGINS is empty, default to ["*"] (allow all).
origins = []
if settings.BACKEND_CORS_ORIGINS:
    origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]

# Force allow localhost for dev if list implies restrictive modes, or just add * if safe
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Forcing wildcard for development to fix user issue immediately
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.user import router as user_router
from app.api.onboarding import router as onboarding_router
from app.api.admin import router as admin_router

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(onboarding_router, prefix=f"{settings.API_V1_STR}/users", tags=["onboarding"])
app.include_router(onboarding_router, prefix=f"{settings.API_V1_STR}/users", tags=["onboarding"])
app.include_router(admin_router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])

from app.api.newsletter import router as newsletter_router
app.include_router(newsletter_router, prefix=f"{settings.API_V1_STR}/newsletter", tags=["newsletter"])

from app.api.bookmarks import router as bookmarks_router
app.include_router(bookmarks_router, prefix=f"{settings.API_V1_STR}/bookmarks", tags=["bookmarks"])

from app.api.comments import router as comments_router
app.include_router(comments_router, prefix=f"{settings.API_V1_STR}/comments", tags=["comments"])

from app.api.notifications import router as notifications_router
app.include_router(notifications_router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])

from app.api.quotes import router as quotes_router
app.include_router(quotes_router, prefix=f"{settings.API_V1_STR}/quotes", tags=["quotes"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

# --- Scheduler for Background Ingestion ---
# Shim cgi for Python 3.13+ (required by feedparser)
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

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.ingestion import run_ingestion_job
import asyncio

scheduler = AsyncIOScheduler()

from app.db.session import Base, engine

@app.on_event("startup")
async def start_scheduler():
    # Run ingestion every 2 hours
    scheduler.add_job(
        run_ingestion_job,
        trigger=IntervalTrigger(hours=2),
        id="ingestion_job",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler started. Ingestion job scheduled every 2 hours.")
    
    # Run immediately on startup so user doesn't wait
    # asyncio.create_task(run_ingestion_job())
