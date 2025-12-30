import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup Environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir) 

from app.core.config import settings
from app.db.models import User

def promote_by_email(email: str):
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    
    try:
        user = session.query(User).filter(User.email == email).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return

        user.role = "admin"
        session.commit()
        print(f"Success: User '{email}' promoted to ADMIN.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_user.py <email>")
    else:
        promote_by_email(sys.argv[1])
