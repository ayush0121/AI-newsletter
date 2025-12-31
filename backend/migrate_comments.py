from app.db.session import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS poll_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                poll_id UUID NOT NULL REFERENCES polls(id),
                user_id UUID NOT NULL REFERENCES public.users(id),
                content TEXT NOT NULL,
                vote_option VARCHAR,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """))
        conn.commit()
        print("Migration: 'poll_comments' table created successfully.")

if __name__ == "__main__":
    run_migration()
