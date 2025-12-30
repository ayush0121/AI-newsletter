from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class ArticleBase(BaseModel):
    title: str
    slug: Optional[str] = None
    url: str
    source: str
    summary: Optional[str] = None
    category: str
    tags: Optional[List[str]] = []
    published_at: datetime

class ArticleCreate(ArticleBase):
    original_snippet: Optional[str] = None
    viability_score: Optional[int] = 0

class Article(ArticleBase):
    id: UUID
    created_at: datetime
    viability_score: int

    class Config:
        from_attributes = True

class IngestionLogBase(BaseModel):
    status: str
    articles_added: int
    errors: Optional[str] = None

class IngestionLog(IngestionLogBase):
    id: UUID
    run_at: datetime
    
    class Config:
        from_attributes = True
