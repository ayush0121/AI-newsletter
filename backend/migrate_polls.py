from app.db.session import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        try:
            # Create table manually to avoid alembic setup overhead for now
            # Using JSONB for options to store [{"id": "...", "text": "...", "votes": 0}]
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS polls (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    question VARCHAR NOT NULL,
                    options JSONB NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )
            """))
            
            # Insert a default poll if empty
            result = conn.execute(text("SELECT COUNT(*) FROM polls"))
            count = result.scalar()
            if count == 0:
                print("Seeding default poll...")
                conn.execute(text("""
                    INSERT INTO polls (question, options, is_active)
                    VALUES (
                        'Will AI replace software engineers completely by 2030?',
                        '[
                            {"id": "yes", "text": "Yes, completely", "votes": 12},
                            {"id": "partial", "text": "Partially (Copilots)", "votes": 45},
                            {"id": "no", "text": "No, demand will grow", "votes": 30}
                        ]',
                        TRUE
                    )
                """))
            
            conn.commit()
            print("Migration successful: Created polls table.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
