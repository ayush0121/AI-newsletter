from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    with engine.connect() as conn:
        print("Migrating: Adding reputation to users...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reputation INTEGER DEFAULT 0;"))
            print("Done.")
        except Exception as e:
            print(f"Skipping reputation (likely exists): {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate()
