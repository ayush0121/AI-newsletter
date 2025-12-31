from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class EmailSettingsBase(BaseModel):
    is_subscribed: bool
    marketing_opt_in: bool = False

class EmailSettings(EmailSettingsBase):
    user_id: UUID
    welcome_email_sent: bool
    day_1_email_sent: bool
    day_2_email_sent: bool
    day_7_email_sent: bool
    last_email_sent_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    interests: list[str] = []
    role: str = "user"

class UserCreate(UserBase):
    id: UUID

class User(UserBase):
    id: UUID
    onboarding_completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    email_settings: Optional[EmailSettings] = None


    class Config:
        from_attributes = True
