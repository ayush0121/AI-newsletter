from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta

from app.db.session import get_db
from app.db.models import Article
from app.schemas.article import Article as ArticleSchema

router = APIRouter()

@router.get("/articles/today", response_model=List[ArticleSchema])
def get_articles_today(
    db: Session = Depends(get_db),
    limit: int = 50
):
    """
    Get articles published in the last 24 hours.
    """
    twenty_four_hours_ago = datetime.now() - timedelta(hours=168)
    articles = db.query(Article).filter(
        Article.published_at >= twenty_four_hours_ago
    ).order_by(desc(Article.published_at)).limit(limit).all()
    return articles
    return articles

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

    return articles

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
    Get trending articles (currently just latest, or random for MVP).
    """
    # For MVP, just return latest articles that aren't "Today" to show variety, 
    # or just simple order by random or most clicked if we had analytics.
    # Let's just return latest for now.
    return db.query(Article).order_by(desc(Article.published_at)).limit(limit).all()

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

    return articles
