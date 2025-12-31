from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    with engine.connect() as conn:
        print("Migrating: Adding parent_id to poll_comments...")
        try:
            conn.execute(text("ALTER TABLE poll_comments ADD COLUMN parent_id UUID REFERENCES poll_comments(id);"))
            print("Done.")
        except Exception as e:
            print(f"Skipping parent_id (likely exists): {e}")

        print("Migrating: Creating notifications table...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES public.users(id),
                    actor_id UUID REFERENCES public.users(id),
                    type VARCHAR NOT NULL,
                    resource_type VARCHAR NOT NULL,
                    resource_id UUID NOT NULL,
                    content VARCHAR,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            """))
            print("Done.")
        except Exception as e:
            print(f"Error checking notifications table: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate()
