from app.db.session import SessionLocal
from app.db.models import Poll
from sqlalchemy import text

def seed_force():
    db = SessionLocal()
    try:
        print("Deactivating old polls...")
        db.query(Poll).update({Poll.is_active: False})
        
        print("Creating new poll...")
        new_poll = Poll(
            question="What is the most impactful AI release of 2025?",
            options=[
                {"id": "gpt5", "text": "GPT-5 (OpenAI)", "votes": 120},
                {"id": "claude4", "text": "Claude 4 (Anthropic)", "votes": 95},
                {"id": "gemini2", "text": "Gemini 2.0 (Google)", "votes": 110},
                {"id": "opensource", "text": "Llama 4 (Meta)", "votes": 85}
            ],
            is_active=True
        )
        db.add(new_poll)
        db.commit()
        print("Success! Active poll created.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_force()
