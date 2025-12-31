from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import Quote
from pydantic import BaseModel
from uuid import UUID

router = APIRouter()

class QuoteSchema(BaseModel):
    id: UUID
    text: str
    author: str
    role: str | None
    avatar_url: str | None
    source_url: str | None

    class Config:
        from_attributes = True

class QuoteCreate(BaseModel):
    text: str
    author: str
    role: str | None = None
    avatar_url: str | None = None
    source_url: str | None = None

INITIAL_QUOTES = [
    {
        "text": "The greatest danger of AI is not that it will be evil, but that it will be competent and we won't notice when it's wrong.",
        "author": "Andrej Karpathy",
        "role": "Founding Scientist, OpenAI",
        "avatar_url": None # Fallback test
    },
    {
        "text": "Compute will become the currency of the future. We are manufacturing intelligence.",
        "author": "Sam Altman",
        "role": "CEO, OpenAI",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Sam_Altman_crop.jpg/800px-Sam_Altman_crop.jpg"
    },
    {
        "text": "AI will not replace you. A person using AI will replace you.",
        "author": "Jensen Huang",
        "role": "CEO, NVIDIA",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Jensen_Huang_%28cropped%29.jpg/800px-Jensen_Huang_%28cropped%29.jpg"
    },
    {
        "text": "The limits of my language mean the limits of my world, and LLMs are expanding that world.",
        "author": "Yann LeCun",
        "role": "Chief AI Scientist, Meta",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Yann_LeCun_-_IMG_8626_%28cropped%29.jpg/800px-Yann_LeCun_-_IMG_8626_%28cropped%29.jpg"
    },
    {
        "text": "Software engineering is about to change forever. We are moving from writing code to curating it.",
        "author": "Satya Nadella",
        "role": "CEO, Microsoft",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg/800px-MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg"
    },
    {
        "text": "We are just at the beginning of the curve. The next 10 years will be more transformative than the last 100.",
        "author": "Demis Hassabis",
        "role": "CEO, Google DeepMind",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Demis_Hassabis_Royal_Society.jpg/800px-Demis_Hassabis_Royal_Society.jpg"
    },
    {
        "text": "Open source AI models are essential for the security and prosperity of the free world.",
        "author": "Mark Zuckerberg",
        "role": "CEO, Meta",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/800px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg"
    },
    {
        "text": "AGI will be the most significant technology humanity has ever invented.",
        "author": "Sam Altman",
        "role": "CEO, OpenAI",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Sam_Altman_crop.jpg/800px-Sam_Altman_crop.jpg"
    },
    {
        "text": "The future of coding is natural language. Everyone is a programmer now.",
        "author": "Jensen Huang",
        "role": "CEO, NVIDIA",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Jensen_Huang_%28cropped%29.jpg/800px-Jensen_Huang_%28cropped%29.jpg"
    },
    {
        "text": "We need to ensure AI aligns with human values, not just capability.",
        "author": "Dario Amodei",
        "role": "CEO, Anthropic",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Dario_Amodei.jpg/800px-Dario_Amodei.jpg" 
        # Note: Wiki link might be 404 for Dario, fallback logic will handle it.
    },
    {
        "text": "Don't just learn AI tools; learn how to think with AI.",
        "author": "Fei-Fei Li",
        "role": "Professor, Stanford University",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Fei-Fei_Li_2011.jpg/800px-Fei-Fei_Li_2011.jpg"
    },
    {
        "text": "AI is not magic. It's linear algebra.",
        "author": "Yann LeCun",
        "role": "Chief AI Scientist, Meta",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Yann_LeCun_-_IMG_8626_%28cropped%29.jpg/800px-Yann_LeCun_-_IMG_8626_%28cropped%29.jpg"
    },
     {
        "text": "Generative AI is the single most significant platform shift since the internet.",
        "author": "Bill Gates",
        "role": "Co-Chair, Bill & Melinda Gates Foundation",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bill_Gates_2018.jpg/800px-Bill_Gates_2018.jpg"
    },
    {
        "text": "We are training models to reason, not just to predict the next token.",
        "author": "Noam Brown",
        "role": "Research Scientist, OpenAI",
        "avatar_url": None
    },
    {
        "text": "The pace of AI progress is surprising even to those of us in the field.",
        "author": "Geoffrey Hinton",
        "role": "Godfather of AI",
        "avatar_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Geoffrey_Hinton_at_UBC.jpg/800px-Geoffrey_Hinton_at_UBC.jpg"
    }
]

@router.get("/daily", response_model=List[QuoteSchema])
def get_daily_quotes(
    db: Session = Depends(get_db),
    limit: int = 3
) -> Any:
    """
    Get a set of quotes. Rotates randomly for now to simulate "daily" freshness.
    Auto-seeds if empty.
    """
    # Auto-seed if empty
    count = db.query(Quote).count()
    if count == 0:
        for q_data in INITIAL_QUOTES:
            quote = Quote(**q_data)
            db.add(quote)
        db.commit()
    
    # Return random 3
    quotes = db.query(Quote).order_by(func.random()).limit(limit).all()
    return quotes

@router.post("/", response_model=QuoteSchema)
def create_quote(
    quote_in: QuoteCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Add a new quote manually (for admin use).
    """
    quote = Quote(**quote_in.dict())
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote
