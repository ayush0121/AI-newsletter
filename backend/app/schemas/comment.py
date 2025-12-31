from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class CommentBase(BaseModel):
    content: str

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[UUID] = None

class CommentResponse(BaseModel):
    id: UUID
    poll_id: Optional[UUID] = None
    article_id: Optional[UUID] = None
    user_id: UUID
    content: str
    vote_option: Optional[str] = None
    created_at: datetime
    user_name: str
    parent_id: Optional[UUID] = None

    class Config:
        from_attributes = True
