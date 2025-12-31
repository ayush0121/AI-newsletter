from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models import User, Bookmark, Article
from pydantic import BaseModel
import uuid

router = APIRouter()

class BookmarkResponse(BaseModel):
    article_id: uuid.UUID
    title: str
    url: str
    summary: str | None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=list[BookmarkResponse])
def get_user_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all articles bookmarked by the current user.
    """
    bookmarks = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).all()
    article_ids = [b.article_id for b in bookmarks]
    
    if not article_ids:
        return []
    
    articles = db.query(Article).filter(Article.id.in_(article_ids)).all()
    return articles

@router.post("/{article_id}")
def add_bookmark(
    article_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Bookmark an article. Idempotent.
    """
    # Check if article exists
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    # Check if already bookmarked
    exists = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.article_id == article_id
    ).first()
    
    if exists:
        return {"message": "Already bookmarked"}
        
    new_bookmark = Bookmark(user_id=current_user.id, article_id=article_id)
    db.add(new_bookmark)
    db.commit()
    return {"message": "Bookmark added"}

@router.delete("/{article_id}")
def remove_bookmark(
    article_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a bookmark.
    """
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.article_id == article_id
    ).first()
    
    if not bookmark:
        return {"message": "Bookmark not found"}
        
    db.delete(bookmark)
    db.commit()
    return {"message": "Bookmark removed"}
