from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    type: str # 'reply'
    resource_type: str
    resource_id: UUID
    content: Optional[str] = None

class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    actor_id: Optional[UUID] = None
    actor_name: Optional[str] = None # Enriched
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
