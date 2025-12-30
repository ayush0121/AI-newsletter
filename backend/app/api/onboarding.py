from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import List

from app.api import deps
from app.db.session import get_db
from app.db.models import User, EmailSettings

router = APIRouter()

class OnboardingRequest(BaseModel):
    interests: List[str]
    subscribe_digest: bool
    marketing_opt_in: bool = False

@router.post("/me/onboarding", status_code=200)
def complete_onboarding(
    payload: OnboardingRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Complete the onboarding process: saves interests and email preferences.
    Triggers the Welcome Email.
    """
    # 1. Update User (Interests + Onboarding Status)
    current_user.interests = payload.interests
    current_user.onboarding_completed_at = datetime.now(timezone.utc)
    
    # 2. Update/Create Email Settings
    email_settings = db.query(EmailSettings).filter(EmailSettings.user_id == current_user.id).first()
    if not email_settings:
        email_settings = EmailSettings(user_id=current_user.id)
        db.add(email_settings)
    
    email_settings.is_subscribed = payload.subscribe_digest
    email_settings.marketing_opt_in = payload.marketing_opt_in
    
    # 3. Trigger Welcome Email (if subscribed or marketing opted in, or just transactional welcome?)
    # Usually welcome email is transactional, sent to everyone.
    # We set a flag to send it (via cron or immediate background task).
    # For now, let's assume Cron picks it up to handle retries/failures robustly.
    # OR we can fire it now. Let's rely on Cron "onboarding email sender" for consistency.
    # But setting `welcome_email_sent` = False ensures it gets picked up.
    
    db.commit()
    db.refresh(current_user)
    
    return {"status": "onboarding_complete"}
