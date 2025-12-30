from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.db.models import User, EmailSettings
from app.schemas.user import User as UserSchema, EmailSettings as EmailSettingsSchema, EmailSettingsBase

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get current user profile.
    """
    return current_user

@router.patch("/me/subscription", response_model=EmailSettingsSchema)
def update_subscription(
    settings_in: EmailSettingsBase,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Toggle email subscription.
    """
    # Check if settings exist
    email_settings = db.query(EmailSettings).filter(EmailSettings.user_id == current_user.id).first()
    
    if not email_settings:
        # Create if missing (should be created by trigger, but being safe)
        email_settings = EmailSettings(user_id=current_user.id, is_subscribed=settings_in.is_subscribed)
        db.add(email_settings)
    else:
        email_settings.is_subscribed = settings_in.is_subscribed
        
    db.commit()
    db.refresh(email_settings)
    return email_settings
