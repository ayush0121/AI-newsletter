from app.db.session import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        # 1. Add article_id column
        conn.execute(text("""
            ALTER TABLE poll_comments 
            ADD COLUMN IF NOT EXISTS article_id UUID REFERENCES articles(id);
        """))
        
        # 2. Make poll_id nullable (alter column)
        conn.execute(text("""
            ALTER TABLE poll_comments 
            ALTER COLUMN poll_id DROP NOT NULL;
        """))
        
        conn.commit()
        print("Migration: 'poll_comments' updated for Articles support.")

if __name__ == "__main__":
    run_migration()
