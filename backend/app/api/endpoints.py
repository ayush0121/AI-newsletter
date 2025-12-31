from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from uuid import UUID
from datetime import datetime, timedelta

from app.db.session import get_db
from app.db.models import Article, User, Poll, Comment
from app.schemas.article import Article as ArticleSchema
from app.api import deps

router = APIRouter()

@router.get("/articles/today", response_model=List[ArticleSchema])
def get_articles_today(
    db: Session = Depends(get_db),
    limit: int = 50
):
    """
    Get articles published in the last 24 hours.
    """
    # Strict "Today" filter: Last 24 hours only.
    twenty_four_hours_ago = datetime.now() - timedelta(hours=24)
    articles = db.query(Article).filter(
        Article.published_at >= twenty_four_hours_ago
    ).order_by(desc(Article.published_at)).limit(limit).all()
    return articles

@router.get("/articles/random", response_model=ArticleSchema)
def get_random_article(
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a random article.
    """
    article = db.query(Article).order_by(func.random()).first()
    if not article:
        raise HTTPException(status_code=404, detail="No articles found")
    return article

@router.get("/articles", response_model=List[ArticleSchema])
def get_articles(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Get all articles with pagination (Archive).
    """
    articles = db.query(Article).order_by(desc(Article.published_at)).offset(skip).limit(limit).all()
    return articles

@router.get("/articles/slug/{slug}", response_model=ArticleSchema)
def read_article_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Get article by slug (SEO friendly).
    """
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.get("/articles/sitemap-data")
def get_sitemap_data(
    db: Session = Depends(get_db),
):
    """
    Get all article slugs and modification times for sitemap.
    """
    articles = db.query(Article.slug, Article.created_at).all()
    # Return lightweight list
    return [
        {"slug": a.slug, "last_modified": a.created_at}
        for a in articles if a.slug
    ]

@router.get("/articles/trending", response_model=List[ArticleSchema])
def get_trending_articles(
    db: Session = Depends(get_db),
    limit: int = 6
):
    """
    Get trending articles based on comment count.
    """
    # Join with Comment and order by count of comments DESC
    articles = (
        db.query(Article)
        .outerjoin(Comment, Article.id == Comment.article_id)
        .group_by(Article.id)
        .order_by(desc(func.count(Comment.id)))
        .limit(limit)
        .all()
    )
    
    return articles

@router.get("/articles/category/{category_name}", response_model=List[ArticleSchema])
def get_articles_by_category(
    category_name: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """
    Get articles by category name (e.g., AI, SC, SE, Research).
    """
    # Simple normalization/validation matches DB
    # "AI", "Computer Science", "Software Engineering", "Research"
    
    cat_map = {
        "ai": "AI",
        "cs": "Computer Science",
        "computer-science": "Computer Science",
        "se": "Software Engineering",
        "software-engineering": "Software Engineering",
        "research": "Research"
    }
    
    db_category = cat_map.get(category_name.lower(), category_name)
    
    
    articles = db.query(Article).filter(
        Article.category == db_category
    ).order_by(desc(Article.published_at)).offset(skip).limit(limit).all()
    
    return articles

@router.get("/articles/for-you", response_model=List[ArticleSchema])
def get_personalized_feed(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user), # Requires Auth
    limit: int = 50
):
    """
    Get personalized articles based on user interests.
    """
    if not current_user.interests or len(current_user.interests) == 0:
        return []

    # Normalize interests
    normalized_interests = []
    cat_map = {
        "ai": "AI",
        "artificial intelligence": "AI",
        "cs": "Computer Science",
        "computer science": "Computer Science",
        "se": "Software Engineering",
        "software engineering": "Software Engineering",
        "research": "Research"
    }
    
    for interest in current_user.interests:
        clean = interest.lower().strip()
        if clean in cat_map:
            normalized_interests.append(cat_map[clean])
        else:
            normalized_interests.append(interest)
            
    if not normalized_interests:
        return []

    articles = db.query(Article).filter(
        Article.category.in_(normalized_interests)
    ).order_by(desc(Article.published_at)).limit(limit).all()
    
    return articles

@router.post("/articles/{article_id}/reaction")
def update_reaction(
    article_id: str,
    reaction_type: str = Query(..., regex="^(fire|mindblown|skeptical)$"),
    action: str = Query("increment", regex="^(increment|decrement)$"), # simple toggle logic support
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(deps.get_current_user)
):
    """
    Update reaction count for an article.
    """
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Map input string to column name
    col_map = {
        "fire": "reactions_fire",
        "mindblown": "reactions_mindblown",
        "skeptical": "reactions_skeptical"
    }
    col_name = col_map[reaction_type]
    
    current_val = getattr(article, col_name)
    
    if action == "increment":
        setattr(article, col_name, current_val + 1)
    elif action == "decrement" and current_val > 0:
        setattr(article, col_name, current_val - 1)
    
    db.commit()
    db.refresh(article)
    
    return {
        "fire": article.reactions_fire,
        "mindblown": article.reactions_mindblown,
        "skeptical": article.reactions_skeptical
    }

from app.db.models import Poll

@router.get("/polls/daily")
def get_daily_poll(db: Session = Depends(get_db)):
    """
    Get the most recent active poll.
    """
    poll = db.query(Poll).filter(Poll.is_active == True).order_by(desc(Poll.created_at)).first()
    if not poll:
        return None # Or 404, but frontend handles null better
    return poll

@router.post("/polls/{poll_id}/vote")
def vote_poll(
    poll_id: str,
    option_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(deps.get_current_user)
):
    """
    Vote for an option in a poll.
    """
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Update vote count in JSONB
    # We need to copy the list, modify it, and reassign to trigger SQLAlchemy detection or use specific JSON ops
    options = list(poll.options)
    updated = False
    for opt in options:
        if opt["id"] == option_id:
            opt["votes"] = opt.get("votes", 0) + 1
            updated = True
            break
            
    if not updated:
        raise HTTPException(status_code=400, detail="Option not found")
        
    poll.options = options
    # Force flag modified if needed, but reassigning usually works
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(poll, "options")
    

    
    db.commit()
    db.refresh(poll)
    return poll
