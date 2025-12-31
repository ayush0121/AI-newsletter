from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.api.deps import get_db
from app.db.models import Subscriber
from sqlalchemy.exc import IntegrityError
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

class SubscriberCreate(BaseModel):
    email: EmailStr

from app.services.email import email_service

@router.post("/subscribe")
def subscribe_newsletter(sub: SubscriberCreate, db: Session = Depends(get_db)):
    """
    Subscribe a new email to the newsletter.
    Idempotent: If email exists, ensures it is active.
    """
    existing = db.query(Subscriber).filter(Subscriber.email == sub.email).first()
    
    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            # Send welcome back email?
            email_service.send_welcome_email(sub.email)
            return {"message": "Resubscribed successfully."}
        
        # Resend welcome email for existing active users who might have missed it
        email_service.send_welcome_email(sub.email)
        return {"message": "Already subscribed (Welcome email resent!)"}
    
    try:
        new_sub = Subscriber(email=sub.email)
        db.add(new_sub)
        db.commit()
        
        # Send Welcome Email
        email_service.send_welcome_email(sub.email)
        
        return {"message": "Subscribed successfully!"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already processed.")
    except Exception as e:
        logger.error(f"Subscription error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

from fastapi.responses import StreamingResponse
from app.services.pdf_generator import pdf_generator
from app.db.models import Article

@router.get("/download-pdf")
def download_digest_pdf(db: Session = Depends(get_db)):
    """
    Generates and downloads a PDF of the top 20 latest articles.
    """
    # Fetch top 20 articles
    articles = db.query(Article).order_by(Article.published_at.desc()).limit(20).all()
    
    pdf_buffer = pdf_generator.generate_daily_digest(articles)
    
    filename = f"SynapseDigest_{datetime.now().strftime('%Y-%m-%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
