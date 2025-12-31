from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import verify_token
from app.db.session import get_db
from app.db.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Validates JWT and fetches user from DB.
    """
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Sub matches the user ID in auth.users, which matches public.users.id
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    
    # Extract metadata from JWT
    user_metadata = payload.get("user_metadata", {})
    full_name = user_metadata.get("full_name") or user_metadata.get("name")
    
    if not user:
        # Lazy creation if user doesn't exist in our DB yet
        user = User(id=user_id, email=payload.get("email"), full_name=full_name)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Trigger Account Welcome Email
        try:
            from app.services.email import email_service
            email_service.send_account_welcome_email(user.email)
        except Exception as e:
            # Don't block auth if email fails
            print(f"Failed to send welcome email: {e}")

    else:
        # Sync profile if changed
        if full_name and user.full_name != full_name:
            user.full_name = full_name
            db.commit()
            db.refresh(user)
            
    return user

def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Validates that the current user is an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user
