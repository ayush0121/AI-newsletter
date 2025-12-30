from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID

from app.api import deps
from app.db.session import get_db
from app.db.models import User, Article, IngestionLog, AdminAuditLog, EmailSettings

router = APIRouter()

# --- Schemas for Admin API ---
class DashboardStats(BaseModel):
    total_users: int
    articles_today: int
    active_subscribers: int
    errors_today: int

class AdminAction(BaseModel):
    action: str
    details: dict

# --- Middleware: All routes require get_current_admin ---

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(deps.get_current_admin),
):
    """
    Returns high-level stats for the admin dashboard.
    """
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_users = db.query(User).count()
    articles_today = db.query(Article).filter(Article.created_at >= start_of_day).count()
    active_subscribers = db.query(EmailSettings).filter(EmailSettings.is_subscribed == True).count()
    
    # Simple error count from logs (if status is FAILURE or PARTIAL)
    errors_today = db.query(IngestionLog).filter(
        IngestionLog.run_at >= start_of_day,
        IngestionLog.status.in_(['FAILURE', 'PARTIAL'])
    ).count()
    
    return {
        "total_users": total_users,
        "articles_today": articles_today,
        "active_subscribers": active_subscribers,
        "errors_today": errors_today
    }

@router.get("/users", response_model=List[dict])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: User = Depends(deps.get_current_admin),
):
    """
    List all users with their roles and subscription status.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    # Map to custom dict response (or use Pydantic schema)
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "full_name": u.full_name,
            "created_at": u.created_at,
            "is_subscribed": u.email_settings.is_subscribed if u.email_settings else False
        }
        for u in users
    ]

@router.post("/users/{user_id}/promote")
def promote_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(deps.get_current_admin),
):
    """
    Promote a user to Admin.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = "admin"
    
    # Audit Log
    log = AdminAuditLog(
        admin_id=current_admin.id,
        action="PROMOTE_USER",
        resource="user",
        resource_id=user_id,
        details={"new_role": "admin"}
    )
    db.add(log)
    db.commit()
    return {"status": "User promoted"}

@router.get("/audit-logs", response_model=List[dict])
def get_audit_logs(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_admin: User = Depends(deps.get_current_admin),
):
    logs = db.query(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "resource": l.resource,
            "admin_id": l.admin_id,
            "created_at": l.created_at,
            "details": l.details
        }
        for l in logs
    ]

# --- Content Moderation ---

@router.get("/articles", response_model=List[dict])
def get_admin_articles(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: User = Depends(deps.get_current_admin),
):
    articles = db.query(Article).order_by(Article.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "source": a.source,
            "category": a.category,
            "created_at": a.created_at,
            "viability_score": a.viability_score
        }
        for a in articles
    ]

@router.delete("/articles/{article_id}")
def delete_article(
    article_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(deps.get_current_admin),
):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Soft delete or set score to -1 (hidden)
    article.viability_score = -100 
    
    # Audit Log
    log = AdminAuditLog(
        admin_id=current_admin.id,
        action="DELETE_ARTICLE",
        resource="article",
        resource_id=article_id,
        details={"title": article.title}
    )
    db.add(log)
    db.commit()
    return {"status": "Article removed"}

# --- Email Control ---

@router.post("/email/trigger")
def trigger_email_job(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(deps.get_current_admin),
):
    """
    Manually trigger the daily email dispatch.
    """
    from run_onboarding_emails import send_onboarding_emails
    # Note: Ideally we import the actual daily digest function too.
    # For now, let's run the onboarding script as a proxy for "email activity".
    
    background_tasks.add_task(send_onboarding_emails)
    
    return {"status": "Email job triggered in background"}

@router.get("/logs")
def get_system_logs(
    lines: int = 100,
    current_admin: User = Depends(deps.get_current_admin)
):
    """
    Retrieve the last N lines of the system log.
    """
    try:
        # Assuming app.log is in the root CWD
        with open("app.log", "r") as f:
            all_lines = f.readlines()
            return {"logs": all_lines[-lines:]}
    except FileNotFoundError:
        return {"logs": ["Log file not found."]}
