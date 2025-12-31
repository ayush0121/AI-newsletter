from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.db.models import Notification, User
from app.schemas.notification import NotificationResponse

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 20
) -> Any:
    """
    Get notifications for the current user.
    """
    notifs = (
        db.query(Notification, User.full_name)
        .outerjoin(User, Notification.actor_id == User.id)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    results = []
    for n, actor_name in notifs:
        # Pydantic from_attributes works on the object, but we need to inject actor_name
        n_dict = {
            "id": n.id,
            "user_id": n.user_id,
            "actor_id": n.actor_id,
            "actor_name": actor_name or "Someone", 
            "type": n.type,
            "resource_type": n.resource_type,
            "resource_id": n.resource_id,
            "content": n.content,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        results.append(n_dict)
        
    return results

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Mark a notification as read.
    """
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    
    return {"status": "success"}
