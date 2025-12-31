from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.db.models import Comment, User, Poll, Article
from app.schemas.comment import CommentCreate, CommentResponse

router = APIRouter()

@router.get("/list", response_model=List[CommentResponse])
def get_comments(
    poll_id: Optional[UUID] = None,
    article_id: Optional[UUID] = None,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50
) -> Any:
    """
    Get comments for a specific poll OR article.
    """
    if not poll_id and not article_id:
        raise HTTPException(status_code=400, detail="Must provide either poll_id or article_id")

    query = (
        db.query(Comment, User.full_name)
        .join(User, Comment.user_id == User.id)
    )
    
    if poll_id:
        query = query.filter(Comment.poll_id == poll_id)
    if article_id:
        query = query.filter(Comment.article_id == article_id)
        
    results = (
        query
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    comments = []
    for comment, user_name in results:
        c_dict = {
            "id": comment.id,
            "poll_id": comment.poll_id,
            "article_id": comment.article_id,
            "user_id": comment.user_id,
            "content": comment.content,
            "vote_option": comment.vote_option,
            "created_at": comment.created_at,
            "user_name": user_name or "Anonymous",
            "parent_id": comment.parent_id
        }
        comments.append(c_dict)
        
    return comments

# Keep old endpoint for backward compat if needed, or forward to new logic
@router.get("/{poll_id}/comments", response_model=List[CommentResponse])
def get_poll_comments(
    poll_id: UUID,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50
):
    return get_comments(poll_id=poll_id, db=db, skip=skip, limit=limit)

@router.post("/", response_model=CommentResponse)
def create_comment(
    comment_in: CommentCreate,
    poll_id: Optional[UUID] = None,
    article_id: Optional[UUID] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Post a new comment. Expects poll_id OR article_id as query params.
    """
    if not poll_id and not article_id:
         raise HTTPException(status_code=400, detail="Must provide either poll_id or article_id")

    # 1. Verify Resource exists
    if poll_id:
        poll = db.query(Poll).filter(Poll.id == poll_id).first()
        if not poll: raise HTTPException(status_code=404, detail="Poll not found")
        
    if article_id:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article: raise HTTPException(status_code=404, detail="Article not found")

    # 2. Check for Profanity
    banned_words = ["badword", "spam", "hate"]
    if any(word in comment_in.content.lower() for word in banned_words):
        raise HTTPException(status_code=400, detail="Comment contains prohibited content.")
    
    comment = Comment(
        poll_id=poll_id,
        article_id=article_id,
        user_id=current_user.id,
        content=comment_in.content,
        vote_option=None,
        parent_id=comment_in.parent_id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # --- Notification Logic ---
    if comment.parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == comment.parent_id).first()
        if parent_comment and parent_comment.user_id != current_user.id:
            from app.db.models import Notification
            resource_type = "poll" if poll_id else "article"
            resource_id = poll_id if poll_id else article_id
            
            # Simple preview
            preview = f"replied: {comment.content[:30]}..."
            
            notif = Notification(
                user_id=parent_comment.user_id, # Recipient (Original Commenter)
                actor_id=current_user.id,       # Sender (Replier)
                type="reply",
                resource_type=resource_type,
                resource_id=resource_id,
                content=preview
            )
            db.add(notif)
            db.commit()
    # --------------------------
    

    
    user_name = current_user.full_name or "Anonymous"
    
    return {
        "id": comment.id,
        "poll_id": comment.poll_id,
        "article_id": comment.article_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "vote_option": comment.vote_option,
        "created_at": comment.created_at,
        "user_name": user_name,
        "parent_id": comment.parent_id
    }

# Backward compat for Polls
@router.post("/{poll_id}/comments", response_model=CommentResponse)
def create_poll_comment_old(
    poll_id: UUID,
    comment_in: CommentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return create_comment(comment_in, poll_id=poll_id, db=db, current_user=current_user)
