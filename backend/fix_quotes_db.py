from app.db.session import engine, Base
from app.db.models import Quote
from sqlalchemy import text

def reset_quotes_table():
    with engine.connect() as conn:
        print("Dropping quotes table if exists...")
        conn.execute(text("DROP TABLE IF EXISTS quotes CASCADE"))
        conn.commit()
        print("Dropped.")
    
    print("Creating tables...")
    # This will create 'quotes' (and others if missing, but focusing on quotes)
    # We filter to just Create Quote if we want, but create_all is fine since others exist.
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

if __name__ == "__main__":
    reset_quotes_table()
