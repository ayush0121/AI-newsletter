import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load env from backend/.env
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")
if "postgresql://" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")
if "postgres://" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://")

def apply_schema():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found.")
        return

    print(f"Connecting to DB...")
    engine = create_engine(DATABASE_URL)
    
    schema_path = os.path.join(backend_dir, "database", "auth_schema.sql")
    print(f"Reading schema from {schema_path}...")
    
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            sql_script = f.read()
            
        with engine.connect() as connection:
            # Split by statement if needed, or execute block if supported
            # SQLAlchemy execute() can handle multiple statements usually if driver supports
            # But creating triggers often requires separate execution or block.
            # Let's try raw execution.
            print("Executing SQL script...")
            connection.execute(text(sql_script))
            connection.commit()
            print("Schema applied successfully!")
            
    except Exception as e:
        print(f"Failed to apply schema: {e}")

if __name__ == "__main__":
    apply_schema()
