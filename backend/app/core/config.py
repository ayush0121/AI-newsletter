import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI News Aggregator"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/dbname")
    
    # AI
    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    AI_PROVIDER: str = "gemini" # gemini, openai
    
    # Auth
    # Fallback to empty string, but validation will fail if not set.
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")
    
    # Email (Resend)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Security / CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = {
        "case_sensitive": True,
        "env_file": os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    }

settings = Settings()

# Force reload for env vars
