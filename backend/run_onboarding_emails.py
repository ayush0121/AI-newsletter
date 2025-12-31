import os
import sys
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup Environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir) # Add backend to path

from app.core.config import settings
from app.db.models import User, EmailSettings
from app.services.email import email_service

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_session():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def send_onboarding_emails():
    db = get_session()
    now = datetime.now(timezone.utc)
    
    logger.info("--- Starting Onboarding Email Job ---")
    
    # join User and EmailSettings
    # We want users who are onboarded
    users_with_settings = db.query(User).join(EmailSettings).filter(
        User.onboarding_completed_at.isnot(None)
    ).all()
    
    for user in users_with_settings:
        settings = user.email_settings
        if not settings: continue
        
        # Calculate time since onboarding
        # Ensure timezone awareness. onboarding_completed_at should be TZ aware.
        if not user.onboarding_completed_at.tzinfo:
            # Fallback if DB returns naive (sqlite/etc issues, but we use PG)
            # Assuming it is UTC if naive
            onboarded_at = user.onboarding_completed_at.replace(tzinfo=timezone.utc)
        else:
            onboarded_at = user.onboarding_completed_at
            
        diff = now - onboarded_at
        hours_since = diff.total_seconds() / 3600
        days_since = diff.days
        
        # 1. Welcome Email (Immediate, < 1 hour delay acceptable)
        if not settings.welcome_email_sent:
            # Send Welcome
            logger.info(f"Sending Welcome Email to {user.email}")
            email_service.send_email(
                user.email,
                "Welcome to SynapseDigest! 🚀",
                f"<h1>Hi {user.full_name or 'there'},</h1><p>Welcome to SynapseDigest...</p>"
            )
            settings.welcome_email_sent = True
            settings.last_email_sent_at = now
            
        # 2. Day 1: Getting Started (Approx 24 hours: 23-26 hours)
        elif not settings.day_1_email_sent and 24 <= hours_since < 26:
            logger.info(f"Sending Day 1 Email to {user.email}")
            email_service.send_email(
                user.email,
                "How to use SynapseDigest like a pro",
                f"<h1>Getting Started...</h1>"
            )
            settings.day_1_email_sent = True
            settings.last_email_sent_at = now

        # 3. Day 2: First Digest (Approx 48 hours)
        elif not settings.day_2_email_sent and 48 <= hours_since < 50:
            logger.info(f"Sending Day 2 Digest to {user.email}")
            email_service.send_email(
                user.email,
                "Your Daily Briefing ☕",
                f"<h1>Your First Digest...</h1>"
            )
            settings.day_2_email_sent = True
            settings.last_email_sent_at = now
            
        # 4. Day 7: Check-in
        elif not settings.day_7_email_sent and days_since >= 7:
             logger.info(f"Sending Day 7 Check-in to {user.email}")
             email_service.send_email(
                user.email,
                "Loving SynapseDigest?",
                f"<h1>Checking in...</h1>"
            )
             settings.day_7_email_sent = True
             settings.last_email_sent_at = now
             
    db.commit()
    logger.info("--- Job Finished ---")

if __name__ == "__main__":
    send_onboarding_emails()
